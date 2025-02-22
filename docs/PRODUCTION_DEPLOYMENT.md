# Production Deployment Guide

This guide outlines the steps for deploying the SOLA Token on Solana's mainnet.

## Step 1: Pre-Deployment Checklist

- Ensure your project is built and all tests pass
- Verify that project dependencies are up-to-date (run `npm update`)
- Confirm Node.js v20 or later is installed

## Step 2: Environment Configuration

- Copy the `.env.example` file to `.env`:
  ```bash
  cp .env.example .env
  ```
- Update the `.env` file with the following required fields:
  - `KEYPAIR_PATH`: Path to the deployer's keypair file
  - `MINT_AUTHORITY_PATH`: Path to the mint authority keypair
  - `SOLANA_NETWORK`: Set this to `mainnet`
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

## Step 3: Manually Create Distribution Wallets

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

## Step 4: Secure Your Wallets

- Store your wallet key files in a secure, access-controlled directory
- **Do not** commit the key files to version control
- Consider using encryption or a secure vault service for additional protection
- If needed, use multisig wallets for enhanced security, especially for mint authority

## Step 5: Deploy the Token

Once your environment is configured:

1. Run the production deployment script:
   ```bash
   npm run deploy:mainnet
   ```
2. The deployment script will:
   - Validate your environment and configurations
   - Deploy the token on the mainnet
   - Distribute tokens to the wallet addresses provided in your `.env` file
   - Revoke the mint authority after deployment to enforce the hard cap

## Step 6: Post-Deployment Verification

- Review the deployment summary output in the terminal to ensure success
- Confirm that the mint authority has been revoked
- Verify token distribution on the Solana blockchain using available tools or custom verification scripts
- Validate each distribution wallet has received the correct token amount according to tokenomics:
  - Future-focused Coding & Design: 18% (522M)
  - E-Marketing: 15% (435M)
  - Staking Pools: 15% (435M)
  - Presale: 15% (435M)
  - Active Sovereigns Rewards: 10% (290M)
  - Liquidity Pool & Listing Exchanges: 10% (290M)
  - Future Initiatives Funds: 10% (290M)
  - Genesis Team (Locked Until 2028): 5% (145M)
  - Strategic Partnerships: 2% (58M)

## Step 7: Maintenance and Security

- Regularly review and update your deployment configurations as needed
- Monitor the deployed token for any unexpected activity
- Prepare for audits and security reviews to ensure ongoing token integrity
- Keep detailed records of all deployment steps and configurations
- Maintain secure backups of all critical wallet information
- Document any issues or challenges encountered during deployment

## Security Best Practices

1. Access Control
   - Implement strict access controls for all deployment-related files
   - Use hardware security modules (HSMs) for critical keys
   - Maintain an access log for all administrative actions

Follow these steps carefully to ensure a secure and smooth production deployment of the SOLA Token. 