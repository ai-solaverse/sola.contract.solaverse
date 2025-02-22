import { PublicKey } from '@solana/web3.js';

// Different configurations based on network
const isDevnet = process.env.SOLANA_NETWORK === 'devnet';

export const TOKEN_CONFIG = {
  name: isDevnet ? 'Mock' : 'Solaverse',
  symbol: isDevnet ? 'tMock' : 'SOLA',
  decimals: 9,
  totalSupply: 2_900_000_000, // 2.9 billion tokens
  distribution: {
    development: 522_000_000,    // 18%
    marketing: 435_000_000,      // 15%
    staking: 435_000_000,        // 15%
    publicSale: 435_000_000,     // 15%
    community: 290_000_000,      // 10%
    liquidity: 290_000_000,      // 10%
    ecosystem: 290_000_000,      // 10%
    team: 145_000_000,           // 5%
    partnerships: 58_000_000,     // 2%
  },
  metadata: {
    description: isDevnet 
      ? 'Test token for community development and testing purposes only'
      : 'Pioneer The Metaverse Revolution On Solana',
    image: isDevnet
      ? 'https://test-assets.community.xyz/test-logo.png'
      : 'https://solaverse.ai/logo.png',
    externalUrl: isDevnet
      ? 'https://test.community.xyz'
      : 'https://solaverse.ai',
  }
};

export const NETWORK_CONFIG = {
  // Token-2022 Program ID
  TOKEN_2022_PROGRAM_ID: new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'),
  // We'll update these with actual values during deployment
  MINT_AUTHORITY: null as PublicKey | null,
  TOKEN_MINT: null as PublicKey | null,
};

// Extension features we'll be using from Token-2022
export const TOKEN_EXTENSIONS = {
  transferFee: true,
  nonTransferable: false,
  interestBearing: false,
  metadataPointer: true,
  customTransferHook: true,
}; 