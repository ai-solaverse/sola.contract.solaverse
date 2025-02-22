# Installation Guide

This guide covers the initial setup and installation process for the SOLA Token development environment.

## Installing Dependencies

1. Install Solana CLI tools:
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
```

2. Install project dependencies:
```bash
npm install
```

3. Configure Solana for your desired network:
```bash
solana config set --url devnet  # for development
# or
solana config set --url mainnet-beta  # for production
```

## Environment Setup

1. Copy the environment configuration file:
```bash
cp .env.example .env
```

2. Edit the `.env` file with your specific configurations:
- `KEYPAIR_PATH`: Path to your keypair file
- `MINT_AUTHORITY_PATH`: Path to the mint authority keypair
- `SOLANA_NETWORK`: Network to use (devnet/mainnet-beta)

## Verification

Verify your installation by running:
```bash
npm run build
npm test
``` 