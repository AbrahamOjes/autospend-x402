# Changelog

All notable changes to the Autospend X402 Payment Extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-03-04

### Added - X402 V2 Protocol Support
- **Multi-chain payments**: Support for Base, Ethereum, and Solana networks
- **CAIP-2 network identifiers**: Standard chain identification (e.g., `eip155:8453` for Base)
- **New HTTP headers**: `Payment-Required`, `Payment-Signature`, `Payment-Response` (replacing deprecated `X-*` headers)
- **V2 meta tags**: `x-402-network`, `x-402-recipient`, `x-402-scheme`
- **Facilitator integration**: Support for Coinbase X402 facilitator for payment verification and settlement
- **Payment schemes**: Support for `exact`, `prepaid`, and `subscription` payment models
- **X402V2Detector class**: Modular detection with multi-strategy support
- **X402Facilitator class**: Client for facilitator communication
- **Multi-chain USDC contracts**: Automatic contract address resolution per network

### Changed
- Updated content script to X402 V2 protocol
- Enhanced payment payload structure with V2 fields
- Improved network name resolution from CAIP-2 identifiers
- Updated constants with V2 protocol definitions

### Compatibility
- Full backward compatibility with X402 V1 meta tags
- Legacy `X-Payment` header support maintained
- Existing V1 integrations continue to work

---

## [1.0.0] - 2025-10-06

### Added
- Initial release of Autospend X402 Payment Extension
- X402 protocol detection from meta tags
- Coinbase Wallet integration for USDC payments
- Base Sepolia testnet support
- Transaction history tracking
- Real-time wallet status monitoring
- Automatic network switching to Base Sepolia
- Payment confirmation and receipt storage
- Modern popup UI with Coinbase blue theme
- Badge indicators for X402 detection and wallet status
- Mutation observer for dynamic content detection
- Input validation for payment amounts
- Balance checking before payment attempts
- User-friendly error messages with actionable guidance
- Centralized constants management
- Logging utility with configurable levels
- Comprehensive error handling system
- Test pages for wallet detection and X402 payments

### Security
- Content Security Policy (CSP) compliance
- No inline scripts
- Manifest V3 security model
- Wallet provider isolation
- No private key access
- User confirmation required for all transactions

### Documentation
- Comprehensive README with setup instructions
- API documentation for X402 meta tags
- Troubleshooting guide
- MIT License

## [Unreleased]

### Planned
- Sign-In-With-X (SIWx) wallet-based identity (CAIP-122)
- Reusable payment sessions
- Automatic API discovery extension
- MetaMask wallet integration
- Phantom wallet integration (Solana)
- Payment analytics dashboard
- Subscription management UI
- Dark mode UI
