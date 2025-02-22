import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import {
    getMint,
    getAccount,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { TOKEN_CONFIG } from '../config';
import { getConnection, loadKeypairFromFile } from '../utils';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const DEPLOYMENT_FILE = path.join(__dirname, '../deployment.json');

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

describe('SOLA Token Deployment Tests', () => {
    let connection: Connection;
    let mintPubkey: PublicKey;
    let mintAuthority: Keypair;

    beforeAll(async () => {
        // Initialize connection and load keypair
        connection = getConnection();
        mintAuthority = loadKeypairFromFile(process.env.MINT_AUTHORITY_PATH!);
        
        // Load deployment config
        const deploymentConfig: DeploymentConfig = JSON.parse(
            fs.readFileSync(DEPLOYMENT_FILE, 'utf-8')
        );
        
        if (!deploymentConfig.tokenMint) {
            throw new Error('Token mint address not found. Please deploy the token first.');
        }
        mintPubkey = new PublicKey(deploymentConfig.tokenMint);
        
        // Verify connection
        try {
            await connection.getAccountInfo(mintPubkey);
        } catch (error) {
            throw new Error('Failed to connect to Solana network or find mint account');
        }
    });

    describe('Token Configuration', () => {
        it('should have correct total supply', () => {
            const totalSupply = Object.values(TOKEN_CONFIG.distribution).reduce((a, b) => a + b, 0);
            expect(totalSupply).toBe(TOKEN_CONFIG.totalSupply);
        });

        it('should have correct distribution percentages', () => {
            const percentages = {
                development: 18,
                marketing: 15,
                staking: 15,
                publicSale: 15,
                community: 10,
                liquidity: 10,
                ecosystem: 10,
                team: 5,
                partnerships: 2,
            };

            for (const [key, percentage] of Object.entries(percentages)) {
                const amount = TOKEN_CONFIG.distribution[key as keyof typeof TOKEN_CONFIG.distribution];
                const calculatedPercentage = (amount / TOKEN_CONFIG.totalSupply) * 100;
                expect(calculatedPercentage).toBe(percentage);
            }
        });
    });

    describe('Token Mint', () => {
        it('should have correct decimals', async () => {
            const mint = await getMint(
                connection,
                mintPubkey,
                'confirmed',
                TOKEN_2022_PROGRAM_ID
            );
            expect(mint.decimals).toBe(TOKEN_CONFIG.decimals);
        });

        it('should have correct mint authority', async () => {
            const mint = await getMint(
                connection,
                mintPubkey,
                'confirmed',
                TOKEN_2022_PROGRAM_ID
            );
            expect(mint.mintAuthority).toBeNull(); // Since we've revoked it
        });
    });

    describe('Distribution', () => {
        it('should distribute correct amounts to all wallets', async () => {
            for (const target of DISTRIBUTION_TARGETS) {
                const tokenAccountKey = `${target.name.toUpperCase().replace(/\s+/g, '_')}_TOKEN_ACCOUNT`;
                const tokenAccountAddress = process.env[tokenAccountKey];
                
                if (!tokenAccountAddress) {
                    throw new Error(`Token account address not found for ${tokenAccountKey}`);
                }

                const tokenAccountPubkey = new PublicKey(tokenAccountAddress);
                const account = await getAccount(
                    connection,
                    tokenAccountPubkey,
                    'confirmed',
                    TOKEN_2022_PROGRAM_ID
                );
                
                if (!account.mint.equals(mintPubkey)) {
                    throw new Error(`Token account ${tokenAccountAddress} has incorrect mint`);
                }

                const expectedAmount = BigInt(target.amount * Math.pow(10, TOKEN_CONFIG.decimals));
                expect(account.amount).toBe(expectedAmount);
            }
        });

        it('should have correct total supply minted', async () => {
            const mint = await getMint(
                connection,
                mintPubkey,
                'confirmed',
                TOKEN_2022_PROGRAM_ID
            );
            const expectedSupply = BigInt(TOKEN_CONFIG.totalSupply * Math.pow(10, TOKEN_CONFIG.decimals));
            expect(mint.supply).toBe(expectedSupply);
        });
    });
}); 