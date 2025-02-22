import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

export function loadKeypairFromFile(path: string): Keypair {
    const loaded = JSON.parse(fs.readFileSync(path, 'utf-8'));
    return Keypair.fromSecretKey(new Uint8Array(loaded));
}

export function getConnection(): Connection {
    return new Connection(process.env.RPC_URL || 'https://api.devnet.solana.com', 'confirmed');
}

export function validateEnvironment(): void {
    const requiredEnvVars = [
        'SOLANA_NETWORK',
        'RPC_URL',
        'KEYPAIR_PATH',
        'MINT_AUTHORITY_PATH',
        'TOKEN_NAME',
        'TOKEN_SYMBOL',
        'TOKEN_DECIMALS'
    ];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            throw new Error(`Missing required environment variable: ${envVar}`);
        }
    }
}

export async function logTokenInfo(
    connection: Connection,
    mint: PublicKey,
    name: string,
    symbol: string
): Promise<void> {
    console.log('\nToken Information:');
    console.log('----------------');
    console.log(`Name: ${name}`);
    console.log(`Symbol: ${symbol}`);
    console.log(`Mint Address: ${mint.toString()}`);
    console.log(`Network: ${process.env.SOLANA_NETWORK}`);
    
    const balance = await connection.getBalance(mint);
    console.log(`Mint Account Balance: ${balance} lamports`);
} 