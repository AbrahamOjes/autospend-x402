// constants.js - Centralized constants for X402 Payment Extension
// Updated for X402 V2 Protocol (January 2026)

// X402 Protocol Version
export const X402_VERSION = '2.0.0';

// Network configurations (CAIP-2 compliant chain identifiers)
export const NETWORKS = {
  // EVM Networks
  BASE_SEPOLIA: {
    chainId: '0x14a34', // 84532 in decimal
    chainIdDecimal: 84532,
    caipId: 'eip155:84532', // CAIP-2 identifier
    name: 'Base Sepolia',
    scheme: 'evm',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://sepolia.base.org'],
    blockExplorerUrls: ['https://sepolia.basescan.org'],
    explorerUrl: 'https://sepolia.basescan.org'
  },
  BASE_MAINNET: {
    chainId: '0x2105',
    chainIdDecimal: 8453,
    caipId: 'eip155:8453',
    name: 'Base',
    scheme: 'evm',
    explorerUrl: 'https://basescan.org',
    rpcUrls: ['https://mainnet.base.org']
  },
  ETHEREUM_MAINNET: {
    chainId: '0x1',
    chainIdDecimal: 1,
    caipId: 'eip155:1',
    name: 'Ethereum Mainnet',
    scheme: 'evm',
    explorerUrl: 'https://etherscan.io'
  },
  SEPOLIA: {
    chainId: '0xaa36a7',
    chainIdDecimal: 11155111,
    caipId: 'eip155:11155111',
    name: 'Sepolia',
    scheme: 'evm',
    explorerUrl: 'https://sepolia.etherscan.io'
  },
  // Solana Networks (X402 V2 multi-chain support)
  SOLANA_MAINNET: {
    chainId: 'mainnet-beta',
    caipId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana Mainnet',
    scheme: 'svm',
    explorerUrl: 'https://explorer.solana.com'
  },
  SOLANA_DEVNET: {
    chainId: 'devnet',
    caipId: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    name: 'Solana Devnet',
    scheme: 'svm',
    explorerUrl: 'https://explorer.solana.com/?cluster=devnet'
  }
};

// Supported payment schemes (X402 V2)
export const PAYMENT_SCHEMES = {
  EXACT: 'exact',           // Exact amount payment
  PREPAID: 'prepaid',       // Prepaid balance
  SUBSCRIPTION: 'subscription' // Subscription-based access
};

// Smart contract addresses (multi-chain)
export const CONTRACTS = {
  // USDC contracts by network
  USDC: {
    'eip155:84532': '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
    'eip155:8453': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // Base Mainnet
    'eip155:1': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',     // Ethereum Mainnet
    'eip155:11155111': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // Solana Mainnet
  }
};

// X402 V2 Facilitators
export const FACILITATORS = {
  COINBASE: {
    name: 'Coinbase',
    url: 'https://x402.org/facilitator',
    verifyEndpoint: '/verify',
    settleEndpoint: '/settle',
    supportedNetworks: ['eip155:8453', 'eip155:84532', 'eip155:1'],
    supportedAssets: ['USDC']
  }
};

// Timeout configurations (in milliseconds)
export const TIMEOUTS = {
  CONNECTION: 5000,           // Popup connection timeout
  BRIDGE_REQUEST: 30000,      // Wallet bridge request timeout
  MUTATION_DEBOUNCE: 300,     // Mutation observer debounce
  RETRY_DELAY: 1000          // Retry delay for failed operations
};

// Transaction configurations
export const TRANSACTION = {
  GAS_LIMIT: '0x186A0',       // 100,000 gas limit
  MAX_RETRY_ATTEMPTS: 3,
  CONFIRMATION_BLOCKS: 1
};

// Storage keys
export const STORAGE_KEYS = {
  TRANSACTIONS: 'transactions',
  WALLET_STATUS: 'walletStatus',
  USER_PREFERENCES: 'userPreferences'
};

// Extension configuration
export const EXTENSION = {
  VERSION: '1.0.0',
  MAX_TRANSACTIONS_STORED: 20,
  BADGE_COLORS: {
    X402_DETECTED_CONNECTED: '#00C853',    // Green
    X402_DETECTED_NOT_CONNECTED: '#FFD600', // Yellow
    WALLET_CONNECTED: '#0052FF',            // Coinbase Blue
    DEFAULT: ''
  }
};

// X402 Protocol V2
export const X402 = {
  // Legacy meta tags (V1 compatibility)
  META_TAGS: {
    PAYMENT_REQUIRED: 'x-402-payment-required',
    AMOUNT: 'x-402-amount',
    CURRENCY: 'x-402-currency',
    DESCRIPTION: 'x-402-description',
    PAYMENT_URL: 'x-402-payment-url',
    // V2 additions
    NETWORK: 'x-402-network',
    RECIPIENT: 'x-402-recipient',
    SCHEME: 'x-402-scheme'
  },
  // X402 V2 HTTP Headers (replaces deprecated X-* headers)
  HEADERS: {
    PAYMENT_REQUIRED: 'Payment-Required',   // Server -> Client: Payment requirements (base64 JSON)
    PAYMENT_SIGNATURE: 'Payment-Signature', // Client -> Server: Signed payment payload
    PAYMENT_RESPONSE: 'Payment-Response',   // Server -> Client: Settlement response
    SIGN_IN_WITH_X: 'Sign-In-With-X'        // Wallet-based identity (CAIP-122)
  },
  // Legacy headers (V1 - deprecated but still supported)
  LEGACY_HEADERS: {
    X_PAYMENT: 'X-Payment',
    X_PAYMENT_RESPONSE: 'X-Payment-Response'
  },
  DEFAULT_CURRENCY: 'USDC',
  DEFAULT_DESCRIPTION: 'X402 Payment',
  DEFAULT_SCHEME: 'exact',
  DEFAULT_NETWORK: 'eip155:84532' // Base Sepolia
};

// ERC-20 Token configurations
export const ERC20 = {
  USDC_DECIMALS: 6,
  TRANSFER_METHOD_ID: '0xa9059cbb', // transfer(address,uint256)
  BALANCE_OF_METHOD_ID: '0x70a08231' // balanceOf(address)
};

// Error messages
export const ERROR_MESSAGES = {
  NO_WALLET: 'No wallet detected. Please install Coinbase Wallet.',
  WALLET_NOT_CONNECTED: 'Wallet not connected. Please connect your wallet.',
  WRONG_NETWORK: 'Please switch to Base Sepolia network.',
  INSUFFICIENT_BALANCE: 'Insufficient USDC balance. Visit https://faucet.circle.com/ to get test USDC tokens.',
  INVALID_AMOUNT: 'Invalid payment amount.',
  USER_REJECTED: 'Payment cancelled by user.',
  NO_X402: 'No payment required on this page.',
  CONNECTION_TIMEOUT: 'Connection timed out. Please try again.',
  TRANSACTION_FAILED: 'Transaction failed. Please try again.'
};

// Logging levels
export const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

// Default log level (set to INFO for production, DEBUG for development)
export const DEFAULT_LOG_LEVEL = LOG_LEVELS.INFO;

// Message sources for postMessage communication
export const MESSAGE_SOURCES = {
  CONTENT_SCRIPT: 'autospend-content-script',
  WALLET_BRIDGE: 'autospend-wallet-bridge'
};

// X402 V2 PaymentRequirements structure
export const PAYMENT_REQUIREMENTS_SCHEMA = {
  required: ['scheme', 'network', 'maxAmountRequired', 'resource', 'payTo'],
  optional: ['description', 'mimeType', 'outputSchema', 'extra']
};

// Supported assets with metadata
export const SUPPORTED_ASSETS = {
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    decimals: 6,
    type: 'stablecoin'
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    decimals: 18,
    type: 'native'
  },
  SOL: {
    symbol: 'SOL',
    name: 'Solana',
    decimals: 9,
    type: 'native'
  }
};

// Validation patterns
export const VALIDATION = {
  ETHEREUM_ADDRESS: /^0x[a-fA-F0-9]{40}$/,
  TRANSACTION_HASH: /^0x[a-fA-F0-9]{64}$/,
  POSITIVE_NUMBER: /^\d+(\.\d+)?$/
};
