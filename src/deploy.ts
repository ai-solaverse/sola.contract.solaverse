import {
    Connection,
    Keypair,
    SystemProgram,
    Transaction,
    sendAndConfirmTransaction,
    PublicKey,
} from '@solana/web3.js';
import {
    createInitializeMintInstruction,
    getMintLen,
    ExtensionType,
    createInitializeTransferFeeConfigInstruction,
    TOKEN_2022_PROGRAM_ID,
    createMintToCheckedInstruction,
    createAssociatedTokenAccountInstruction,
    getAssociatedTokenAddress,
    getAccount,
    getMint,
    createSetAuthorityInstruction,
    AuthorityType,
} from '@solana/spl-token';
import { TOKEN_CONFIG, NETWORK_CONFIG } from './config';
import {
    loadKeypairFromFile,
    getConnection,
    validateEnvironment,
    logTokenInfo
} from './utils';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

const DEPLOYMENT_FILE = path.join(__dirname, 'deployment.json');
const WALLETS_DIR = 'wallets';

interface DeploymentConfig {
    tokenMint: string;
    mintAuthority: string;
    network: string;
    deployedAt: string | null;
    isTestToken: boolean;
}

interface DistributionTarget {
    name: string;
    amount: number;
    walletKey: string;
}

const DISTRIBUTION_TARGETS: DistributionTarget[] = [
    { name: 'Development', amount: TOKEN_CONFIG.distribution.development, walletKey: 'DEVELOPMENT_WALLET' },
    { name: 'Marketing', amount: TOKEN_CONFIG.distribution.marketing, walletKey: 'MARKETING_WALLET' },
    { name: 'Staking', amount: TOKEN_CONFIG.distribution.staking, walletKey: 'STAKING_WALLET' },
    { name: 'Public Sale', amount: TOKEN_CONFIG.distribution.publicSale, walletKey: 'PUBLIC_SALE_WALLET' },
    { name: 'Community', amount: TOKEN_CONFIG.distribution.community, walletKey: 'COMMUNITY_WALLET' },
    { name: 'Liquidity', amount: TOKEN_CONFIG.distribution.liquidity, walletKey: 'LIQUIDITY_WALLET' },
    { name: 'Ecosystem', amount: TOKEN_CONFIG.distribution.ecosystem, walletKey: 'ECOSYSTEM_WALLET' },
    { name: 'Team', amount: TOKEN_CONFIG.distribution.team, walletKey: 'TEAM_WALLET' },
    { name: 'Partnerships', amount: TOKEN_CONFIG.distribution.partnerships, walletKey: 'PARTNERSHIPS_WALLET' }
];

async function saveDeploymentConfig(config: DeploymentConfig) {
    fs.writeFileSync(DEPLOYMENT_FILE, JSON.stringify(config, null, 4));
}

async function createDistributionWallets() {
    console.log('\nGenerating distribution wallets...\n');
    if (process.env.SOLANA_NETWORK !== 'devnet') {
        console.log('\nProduction environment detected. Skipping auto-generation of distribution wallets.');
        return;
    }
    // Create wallets directory if it doesn't exist
    if (!fs.existsSync(WALLETS_DIR)) {
        fs.mkdirSync(WALLETS_DIR);
    }

    // Read current .env file
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf-8');

    // Remove any existing wallet addresses from .env
    for (const target of DISTRIBUTION_TARGETS) {
        envContent = envContent.replace(new RegExp(`${target.walletKey}=.*\n`, 'g'), '');
    }

    const walletInfo = [];

    for (const target of DISTRIBUTION_TARGETS) {
        const keypair = Keypair.generate();
        const walletPath = path.join(WALLETS_DIR, `${target.name.toLowerCase().replace(/\s+/g, '_')}.json`);
        
        // Save keypair
        fs.writeFileSync(walletPath, JSON.stringify(Array.from(keypair.secretKey)));
        
        // Add wallet address to .env content
        const publicKey = keypair.publicKey.toString();
        envContent += `${target.walletKey}=${publicKey}\n`;

        walletInfo.push({
            name: target.name,
            publicKey,
            walletPath,
            allocation: target.amount
        });
    }

    // Save updated .env file
    fs.writeFileSync(envPath, envContent);

    // Reload environment variables
    dotenv.config();

    console.log('Distribution wallets created:');
    for (const info of walletInfo) {
        console.log(`\n${info.name}:`);
        console.log(`  Public Key: ${info.publicKey}`);
        console.log(`  Allocation: ${info.allocation.toLocaleString()} ${TOKEN_CONFIG.symbol}`);
        console.log(`  Keypair saved to: ${info.walletPath}`);
    }
}

async function createTokenAccount(
    connection: Connection,
    payer: Keypair,
    mintPubkey: PublicKey,
    owner: PublicKey
): Promise<PublicKey> {
    const associatedTokenAccount = await getAssociatedTokenAddress(
        mintPubkey,
        owner,
        false,
        TOKEN_2022_PROGRAM_ID
    );

    try {
        await getAccount(connection, associatedTokenAccount, 'confirmed', TOKEN_2022_PROGRAM_ID);
        console.log('Token account already exists');
        return associatedTokenAccount;
    } catch (error) {
        console.log('Creating new token account...');
        const transaction = new Transaction().add(
            createAssociatedTokenAccountInstruction(
                payer.publicKey,
                associatedTokenAccount,
                owner,
                mintPubkey,
                TOKEN_2022_PROGRAM_ID
            )
        );

        await sendAndConfirmTransaction(connection, transaction, [payer], { commitment: 'confirmed' });
        return associatedTokenAccount;
    }
}

async function deployAndDistribute() {
    try {
        validateEnvironment();
        
        const connection = getConnection();
        const payer = loadKeypairFromFile(process.env.KEYPAIR_PATH!);
        const mintAuthority = loadKeypairFromFile(process.env.MINT_AUTHORITY_PATH!);
        
        console.log('\n=== Step 1: Creating Distribution Wallets ===\n');
        await createDistributionWallets();

        console.log('\n=== Step 2: Deploying Token ===\n');
        const networkType = process.env.SOLANA_NETWORK === 'devnet' ? '[DEVNET TEST TOKEN]' : '';
        console.log(`Deploying ${networkType} ${TOKEN_CONFIG.name} (${TOKEN_CONFIG.symbol})...`);
        
        // Generate the mint account
        const mintKeypair = Keypair.generate();
        
        // Calculate space and rent
        const extensions = [ExtensionType.TransferFeeConfig];
        const mintLen = getMintLen(extensions);
        const lamports = await connection.getMinimumBalanceForRentExemption(mintLen);

        console.log(`Creating mint account: ${mintKeypair.publicKey.toString()}`);
        
        // Create transaction for mint account
        const transaction = new Transaction().add(
            SystemProgram.createAccount({
                fromPubkey: payer.publicKey,
                newAccountPubkey: mintKeypair.publicKey,
                space: mintLen,
                lamports,
                programId: TOKEN_2022_PROGRAM_ID,
            })
        );

        // Add transfer fee config instruction
        transaction.add(
            createInitializeTransferFeeConfigInstruction(
                mintKeypair.publicKey,
                mintAuthority.publicKey,
                mintAuthority.publicKey,
                100, // 1% fee in basis points
                BigInt(1_000_000_000), // 1 token max fee
                TOKEN_2022_PROGRAM_ID
            )
        );

        // Add mint initialization instruction
        transaction.add(
            createInitializeMintInstruction(
                mintKeypair.publicKey,
                TOKEN_CONFIG.decimals,
                mintAuthority.publicKey,
                mintAuthority.publicKey, // Freeze authority
                TOKEN_2022_PROGRAM_ID
            )
        );

        await sendAndConfirmTransaction(connection, transaction, [payer, mintKeypair], { commitment: 'confirmed' });
        console.log('Token deployed successfully');

        // Save deployment configuration
        const deploymentConfig = {
            tokenMint: mintKeypair.publicKey.toString(),
            mintAuthority: mintAuthority.publicKey.toString(),
            network: process.env.SOLANA_NETWORK || 'devnet',
            deployedAt: new Date().toISOString(),
            isTestToken: process.env.SOLANA_NETWORK === 'devnet'
        };
        await saveDeploymentConfig(deploymentConfig);

        // Update .env with mint address
        let envContent = fs.readFileSync('.env', 'utf-8');
        if (envContent.includes('TOKEN_MINT=')) {
            envContent = envContent.replace(/TOKEN_MINT=.*/, `TOKEN_MINT=${mintKeypair.publicKey.toString()}`);
        } else {
            envContent += `\nTOKEN_MINT=${mintKeypair.publicKey.toString()}`;
        }
        fs.writeFileSync('.env', envContent);

        console.log('\n=== Step 3: Distributing Tokens ===\n');
        
        for (const target of DISTRIBUTION_TARGETS) {
            console.log(`\nProcessing distribution for ${target.name}...`);
            const recipientPubkey = new PublicKey(process.env[target.walletKey]!);
            
            const tokenAccount = await createTokenAccount(
                connection,
                payer,
                mintKeypair.publicKey,
                recipientPubkey
            );
            
            const amount = BigInt(target.amount * Math.pow(10, TOKEN_CONFIG.decimals));
            console.log(`Minting ${target.amount.toLocaleString()} ${TOKEN_CONFIG.symbol}...`);
            
            const mintTx = new Transaction().add(
                createMintToCheckedInstruction(
                    mintKeypair.publicKey,
                    tokenAccount,
                    mintAuthority.publicKey,
                    amount,
                    TOKEN_CONFIG.decimals,
                    [],
                    TOKEN_2022_PROGRAM_ID
                )
            );
            
            await sendAndConfirmTransaction(
                connection,
                mintTx,
                [payer, mintAuthority],
                { commitment: 'confirmed' }
            );
            
            console.log(`✓ Distributed ${target.amount.toLocaleString()} ${TOKEN_CONFIG.symbol} to ${target.name}`);
            console.log(`  Recipient: ${recipientPubkey.toString()}`);
            console.log(`  Token Account: ${tokenAccount.toString()}`);

            // Update .env with token account address
            const tokenAccountKey = `${target.name.toUpperCase().replace(/\s+/g, '_')}_TOKEN_ACCOUNT`;
            if (envContent.includes(`${tokenAccountKey}=`)) {
                envContent = envContent.replace(
                    new RegExp(`${tokenAccountKey}=.*`),
                    `${tokenAccountKey}=${tokenAccount.toString()}`
                );
            } else {
                envContent += `\n${tokenAccountKey}=${tokenAccount.toString()}`;
            }
            fs.writeFileSync('.env', envContent);
        }

        console.log('\n=== Step 4: Enforcing Hard Cap ===\n');
        
        // Create transaction to revoke mint authority
        console.log('Revoking mint authority to enforce hard cap...');
        const revokeTx = new Transaction().add(
            createSetAuthorityInstruction(
                mintKeypair.publicKey,
                mintAuthority.publicKey,
                AuthorityType.MintTokens,
                null,
                [],
                TOKEN_2022_PROGRAM_ID
            )
        );

        await sendAndConfirmTransaction(
            connection,
            revokeTx,
            [mintAuthority],
            { commitment: 'confirmed' }
        );

        // Verify mint authority is revoked
        const updatedMint = await getMint(
            connection,
            mintKeypair.publicKey,
            'confirmed',
            TOKEN_2022_PROGRAM_ID
        );

        if (updatedMint.mintAuthority === null) {
            console.log('\n✓ Hard cap enforced successfully!');
            console.log('- Mint authority has been revoked');
            console.log(`- Total supply locked at ${TOKEN_CONFIG.totalSupply.toLocaleString()} ${TOKEN_CONFIG.symbol}`);
            console.log('- No more tokens can be minted');
        } else {
            throw new Error('Failed to revoke mint authority');
        }

        // Log final status
        console.log('\n=== Deployment Summary ===\n');
        await logTokenInfo(connection, mintKeypair.publicKey, TOKEN_CONFIG.name, TOKEN_CONFIG.symbol);

        if (process.env.SOLANA_NETWORK === 'devnet') {
            console.log('\n⚠️  DEVNET TEST TOKEN NOTICE');
            console.log('----------------------------');
            console.log('This token is deployed on devnet for testing purposes.');
            console.log('It is not the real token and has no real value.');
            console.log(`Description: ${TOKEN_CONFIG.metadata.description}`);
        }

        console.log('\nDeployment completed successfully! 🎉');
        
    } catch (error) {
        console.error('Error in deployment:', error);
        process.exit(1);
    }
}

// Run deployment
deployAndDistribute(); 