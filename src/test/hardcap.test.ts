import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import {
    createMintToCheckedInstruction,
    getAccount,
    getMint,
    TOKEN_2022_PROGRAM_ID,
} from '@solana/spl-token';
import { TOKEN_CONFIG } from '../config';
import { getConnection, loadKeypairFromFile } from '../utils';
import * as fs from 'fs';
import * as path from 'path';

const DEPLOYMENT_FILE = path.join(__dirname, '../deployment.json');

interface DeploymentConfig {
    tokenMint: string;
    mintAuthority: string;
    network: string;
    deployedAt: string | null;
    isTestToken: boolean;
}

describe('Hard Cap Enforcement Tests', () => {
    let connection: Connection;
    let mintPubkey: PublicKey;
    let mintAuthority: Keypair;
    let testAccount: PublicKey;

    beforeAll(async () => {
        // Load deployment config
        const deploymentConfig: DeploymentConfig = JSON.parse(
            fs.readFileSync(DEPLOYMENT_FILE, 'utf-8')
        );
        
        connection = getConnection();
        mintPubkey = new PublicKey(deploymentConfig.tokenMint);
        mintAuthority = loadKeypairFromFile(process.env.MINT_AUTHORITY_PATH!);
        
        // Create a test account
        const testKeypair = Keypair.generate();
        testAccount = testKeypair.publicKey;
    });

    it('should have correct total supply', async () => {
        const mint = await getMint(connection, mintPubkey, 'confirmed', TOKEN_2022_PROGRAM_ID);
        const totalSupply = Number(mint.supply) / Math.pow(10, TOKEN_CONFIG.decimals);
        expect(totalSupply).toBe(TOKEN_CONFIG.totalSupply);
    });

    it('should fail to mint after hard cap is enforced', async () => {
        // Try to mint 1 token
        const amount = BigInt(1 * Math.pow(10, TOKEN_CONFIG.decimals));
        
        const mintTx = new Transaction().add(
            createMintToCheckedInstruction(
                mintPubkey,
                testAccount,
                mintAuthority.publicKey,
                amount,
                TOKEN_CONFIG.decimals,
                [],
                TOKEN_2022_PROGRAM_ID
            )
        );

        try {
            await connection.sendTransaction(mintTx, [mintAuthority]);
            // If we reach here, the test should fail
            expect(true).toBe(false);
        } catch (error: any) {
            // Expect an error about invalid account data
            expect(error.message).toContain('invalid account data for instruction');
        }
    });

    it('should maintain the correct total supply after failed mint attempt', async () => {
        const mint = await getMint(connection, mintPubkey, 'confirmed', TOKEN_2022_PROGRAM_ID);
        const totalSupply = Number(mint.supply) / Math.pow(10, TOKEN_CONFIG.decimals);
        expect(totalSupply).toBe(TOKEN_CONFIG.totalSupply);
    });
}); 