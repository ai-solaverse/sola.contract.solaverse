# Solaverse (SOLA) Token

A next-generation Solana token built using the Token-2022 program, featuring advanced tokenomics and innovative features.

## Features

- Built on Solana's Token-2022 program
- Total Supply: 2.9 billion SOLA
- Advanced tokenomics with multiple distribution channels
- Transfer fee mechanism
- Custom transfer hooks for advanced functionality
- Metadata integration
- Future staking capabilities

## Prerequisites

- Node.js v20 or later
- Solana CLI tools
- Rust (for program deployment)

## Installation

1. Install Solana CLI tools:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
```

2. Install project dependencies:
```bash
npm install
```

3. Configure Solana for devnet:
```bash
solana config set --url devnet
```

## Development Setup

1. Generate a new keypair:
```bash
solana-keygen grind --starts-with sola:1
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your keypair path and other configurations
```

3. Build the project:
```bash
npm run build
```

## Testing

Run the test suite:
```bash
npm test
```

## Deployment

Deploy to devnet (for testing):
```bash
npm run deploy:devnet
```

Deploy to production (mainnet):
```bash
npm run deploy:mainnet
```

Note: In production, distribution wallets are not auto-generated. Make sure to manually configure the distribution wallet addresses in your .env file before deployment.

## Token Distribution

- Future-focused Coding & Design: 18% (522M)
- E-Marketing: 15% (435M)
- Staking Pools: 15% (435M)
- Presale: 15% (435M)
- Active Sovereigns Rewards: 10% (290M)
- Liquidity Pool & Listing Exchanges: 10% (290M)
- Future Initiatives Funds: 10% (290M)
- Genesis Team (Locked Until 2028): 5% (145M)
- Strategic Partnerships: 2% (58M)

## Production Deployment Guide

This guide outlines the steps for deploying the SOLA Token on production (mainnet).

### Step 1: Pre-Deployment Checklist

- Ensure your project is built and all tests pass.
- Verify that your project dependencies are up-to-date (run `npm update`).
- Confirm you are using Node.js v20 or later.

### Step 2: Environment Configuration

- Copy the `.env.example` file to `.env`:
  ```bash
  cp .env.example .env
  ```
- Update the `.env` file with the following required fields:
  - `KEYPAIR_PATH`: Path to the deployer's keypair file.
  - `MINT_AUTHORITY_PATH`: Path to the mint authority keypair.
  - `SOLANA_NETWORK`: Set this to `mainnet`.
  - **Distribution Wallets:** Manually insert the public keys for the following wallets:
    - DEVELOPMENT_WALLET
    - MARKETING_WALLET
    - STAKING_WALLET
    - PUBLIC_SALE_WALLET
    - COMMUNITY_WALLET
    - LIQUIDITY_WALLET
    - ECOSYSTEM_WALLET
    - TEAM_WALLET
    - PARTNERSHIPS_WALLET

**Note:** In production, distribution wallets are not auto-generated. You must create these manually.

### Step 3: Manually Create Distribution Wallets

For each distribution category, follow these steps:

1. Generate a wallet using Solana CLI:
   ```bash
   solana-keygen new --outfile wallets/<wallet_name>.json
   ```
   Replace `<wallet_name>` with an appropriate name (e.g., marketing, staking, etc.).

2. Securely store the generated keypair files in a protected location.

3. Extract the public key from each file using:
   ```bash
   solana-keygen pubkey wallets/<wallet_name>.json
   ```

4. Update your `.env` file with the corresponding wallet key name and public key.

### Step 4: Secure Your Wallets

- Store your wallet key files in a secure, access-controlled directory.
- **Do not** commit the key files to version control.
- Consider using encryption or a secure vault service for additional protection.
- If needed, use multisig wallets for enhanced security, especially for mint authority.

### Step 5: Deploy the Token

Once your environment is configured:

1. Run the production deployment script:
   ```bash
   npm run deploy:mainnet
   ```
2. The deployment script will:
   - Validate your environment and configurations.
   - Deploy the token on the mainnet.
   - Distribute tokens to the wallet addresses provided in your `.env` file.
   - Revoke the mint authority after deployment to enforce the hard cap.

### Step 6: Post-Deployment Verification

- Review the deployment summary output in the terminal to ensure success.
- Confirm that the mint authority has been revoked.
- Verify token distribution on the Solana blockchain using available tools or custom verification scripts.

### Step 7: Maintenance and Security

- Regularly review and update your deployment configurations as needed.
- Monitor the deployed token for any unexpected activity.
- Prepare for audits and security reviews to ensure ongoing token integrity.

Follow these steps carefully to ensure a secure and smooth production deployment of the SOLA Token.

## License

MIT 