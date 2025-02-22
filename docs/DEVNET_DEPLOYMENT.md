# Devnet Deployment Guide

This guide outlines the steps for deploying the SOLA Token on Solana's devnet for testing purposes.

## Pre-Deployment Checklist

- Ensure all tests pass
- Verify devnet connection
- Check SOL balance for deployment

## Deployment Steps

1. Configure for devnet:
```bash
solana config set --url devnet
```

2. Airdrop SOL for deployment (if needed):
```bash
solana airdrop 2
```

3. Deploy to devnet:
```bash
npm run deploy:devnet
```

## Testing on Devnet

- Verify token creation
- Test token transfers
- Validate tokenomics implementation
- Test transfer hooks and fees 