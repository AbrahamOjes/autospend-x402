<div align="center">

# 💸 Autospend - X402 Payment Extension

### Seamless Web3 Micropayments for the Modern Web

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](CHANGELOG.md)
[![X402 V2](https://img.shields.io/badge/X402-V2_Protocol-purple.svg)](https://www.x402.org/)
[![Manifest V3](https://img.shields.io/badge/Manifest-V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![Base Network](https://img.shields.io/badge/Network-Base-0052FF.svg)](https://base.org)
[![USDC](https://img.shields.io/badge/Currency-USDC-2775CA.svg)](https://www.circle.com/en/usdc)

[**🚀 Quick Start**](#installation) · [**📖 Documentation**](#usage) · [**🤝 Contributing**](CONTRIBUTING.md) · [**📝 Changelog**](CHANGELOG.md)

---

</div>

## 🎯 What is Autospend?

**Autospend** is a Chrome extension that implements the [X402 protocol](https://www.x402.org/) — an open standard for HTTP-native micropayments. It enables:

- **Content creators** to monetize articles, videos, and APIs with pay-per-use pricing
- **Users** to access premium content with one-click USDC payments
- **Developers** to add payment requirements to any website with simple meta tags

> 💡 **X402** is inspired by HTTP status code 402 "Payment Required" — finally giving it a purpose after decades of being "reserved for future use"!

### 🆕 Now with X402 V2 Protocol Support!

- **Multi-chain payments** — Base, Ethereum, Solana support
- **New HTTP headers** — `Payment-Required`, `Payment-Signature`, `Payment-Response`
- **Facilitator integration** — Coinbase X402 facilitator for verification & settlement
- **CAIP-2 network identifiers** — Standard chain identification across ecosystems

## ✨ Features

<table>
<tr>
<td width="50%">

### 🔍 X402 V2 Detection
- Multi-chain payment detection
- HTTP header & meta tag support
- CAIP-2 network identification
- Dynamic content via MutationObserver

</td>
<td width="50%">

### 💰 Coinbase Wallet Integration
- One-click wallet connection
- Real-time balance monitoring
- Automatic network verification
- Account change detection

</td>
</tr>
<tr>
<td width="50%">

### ⚡ Multi-Chain Payments
- Base, Ethereum, Solana support
- USDC stablecoin payments
- Facilitator-verified transactions
- Payment history tracking

</td>
<td width="50%">

### 🔒 Security First
- Manifest V3 compliance
- No private key access
- CSP-compliant architecture
- User confirmation required

</td>
</tr>
</table>

## 🚀 Installation

### Prerequisites
- Chrome browser (Manifest V3 support)
- Coinbase Wallet browser extension
- Sepolia testnet USDC (for testing)

### Quick Install

```bash
# 1. Clone the repository
git clone https://github.com/AbrahamOjes/autospend-x402.git
cd autospend-x402

# 2. Install dependencies (optional, for development)
npm install
```

### Load in Chrome

1. Navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `autospend-x402` folder

### Setup Wallet

1. Install [Coinbase Wallet](https://www.coinbase.com/wallet) from Chrome Web Store
2. Create or import a wallet
3. Switch to **Base Sepolia** testnet
4. Get test USDC from [Circle Faucet](https://faucet.circle.com/)

## 📖 Usage

### For Users

#### Detecting X402 Content
- Extension badge shows "X402" when payment required
- Badge colors indicate status:
  - 🟡 Yellow: X402 detected, wallet not connected
  - 🟢 Green: X402 detected, wallet connected
  - 🔵 Blue: Wallet connected, no X402

#### Making Payments
- Click extension icon to open popup
- View payment requirements (amount, description)
- Click "Connect Coinbase Wallet" if needed
- Confirm payment in wallet
- Wait for transaction confirmation
- Page automatically refreshes with unlocked content

#### Managing Wallet
- Popup shows connection status and balance
- Click "Refresh Status" to update information
- Recent transactions displayed in popup
- Automatic reconnection on page reload

### For Developers

Adding X402 payments to your website is simple — just add meta tags:
```html
<head>
  <!-- Required: Enable X402 payment -->
  <meta name="x-402-payment-required" content="true">
  <meta name="x-402-amount" content="0.50">
  
  <!-- Optional: Customize payment -->
  <meta name="x-402-currency" content="USDC">
  <meta name="x-402-description" content="Premium article access">
  <meta name="x-402-payment-url" content="/api/verify-payment">
</head>
```

| Meta Tag | Required | Description |
|----------|----------|-------------|
| `x-402-payment-required` | ✅ | Set to `"true"` to enable payments |
| `x-402-amount` | ✅ | Payment amount (e.g., `"0.50"`) |
| `x-402-currency` | ❌ | Currency code (default: `USDC`) |
| `x-402-description` | ❌ | Human-readable description |
| `x-402-payment-url` | ❌ | Custom verification endpoint |

#### Testing Your Integration

```bash
# Start the test server
npm run dev

# Open test pages in browser
# http://localhost:9000/test-pages/x402-test.html
```

| Test Page | Purpose |
|-----------|--------|
| `x402-test.html` | X402 detection testing |
| `x402-payment-test.html` | Full payment flow |
| `wallet-detection-test.html` | Wallet connection |

## 🔐 Security

### Content Security Policy (CSP) Compliance
- No inline scripts: All JavaScript in external files
- Manifest V3: Latest Chrome extension security model
- Secure messaging: Isolated content script communication
- Permission minimization: Only required permissions granted

### Wallet Security
- Provider isolation: Wallet runs in separate context
- No private key access: Extension never handles private keys
- User confirmation: All transactions require user approval
- Network verification: Ensures correct network before payments

### Data Protection
- Local storage only: No external data transmission
- Minimal data collection: Only transaction hashes stored
- User control: Users can clear transaction history
- No tracking: No analytics or user tracking

## 🏗️ Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Chrome Extension                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐      ┌──────────────┐      ┌───────────┐ │
│  │   Popup UI   │◄────►│  Background  │◄────►│  Content  │ │
│  │  (x402-popup)│      │   Service    │      │   Script  │ │
│  └──────────────┘      │   Worker     │      └─────┬─────┘ │
│                        └──────────────┘            │         │
│                                                     │         │
│                        ┌──────────────┐            │         │
│                        │    Wallet    │◄───────────┘         │
│                        │    Bridge    │                      │
│                        └──────┬───────┘                      │
└───────────────────────────────┼──────────────────────────────┘
                                │
                        ┌───────▼────────┐
                        │ Coinbase Wallet│
                        │   (window.     │
                        │   ethereum)    │
                        └────────────────┘
```

### Key Components

- **Content Script** (`x402-content-improved.js`): Detects X402 meta tags, manages wallet bridge
- **Background Service Worker** (`background.js`): Manages extension state, handles messaging
- **Popup UI** (`x402-popup.html/js`): User interface for wallet connection and payments
- **Wallet Bridge** (`wallet-bridge.js`): Injected script to access wallet provider
- **Utilities**: Constants, logging, validation, error handling

## 📁 Project Structure

```
autospend-x402/
├── manifest.json                 # Extension manifest (Manifest V3)
├── background.js                 # Service worker
├── x402-content-improved.js      # Main content script (consolidated)
├── wallet-bridge.js              # Wallet provider bridge
├── x402-popup.html               # Popup UI
├── x402-popup.js                 # Popup logic
├── popup-connection-handler.js   # Connection management
├── constants.js                  # Centralized constants
├── logger.js                     # Logging utility
├── validation.js                 # Input validation
├── error-handler.js              # Error handling
├── test-pages/                   # Test HTML pages
├── tests/                        # Test scripts
├── icons/                        # Extension icons
├── package.json                  # Dependencies and scripts
├── README.md                     # This file
├── LICENSE                       # MIT License
├── CHANGELOG.md                  # Version history
└── CONTRIBUTING.md               # Contribution guidelines
```

## 📚 API Reference

### X402 Meta Tags

```html
<!-- Required: Indicates payment is required -->
<meta name="x-402-payment-required" content="true">

<!-- Required: Payment amount -->
<meta name="x-402-amount" content="0.50">

<!-- Optional: Currency (defaults to USDC) -->
<meta name="x-402-currency" content="USDC">

<!-- Optional: Payment description -->
<meta name="x-402-description" content="Premium article access">

<!-- Optional: Custom payment endpoint -->
<meta name="x-402-payment-url" content="/api/verify-payment">
```

### Content Script API

The content script exposes the following message handlers:

- `PING`: Health check
- `CHECK_STATUS`: Get X402 detection status
- `GET_WALLET_STATUS`: Get wallet connection status
- `CONNECT_WALLET`: Initiate wallet connection
- `MAKE_PAYMENT`: Process payment

## 🛠️ Development

### Setup Development Environment

```bash
# Install dependencies
npm install

# Start test server
npm run dev

# Run linting
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
# Build extension
npm run build

# Package for distribution
npm run package
```

### Testing

1. **Load extension in Chrome**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select project directory

2. **Test X402 detection**
   - Start test server: `npm run dev`
   - Navigate to `http://localhost:9000/test-pages/x402-test.html`
   - Check extension badge and console logs

3. **Test payment flow**
   - Navigate to `http://localhost:9000/test-pages/x402-payment-test.html`
   - Connect Coinbase Wallet
   - Make test payment

## ❓ Troubleshooting

<details>
<summary><strong>"Ping timed out" Error</strong></summary>

- **Cause**: Background script not responding
- **Solution**: Reload extension in Chrome Extensions page
- **Prevention**: Check for console errors in background service worker
</details>

<details>
<summary><strong>"No Ethereum provider found"</strong></summary>

- **Cause**: Coinbase Wallet not installed or enabled
- **Solution**: Install [Coinbase Wallet extension](https://www.coinbase.com/wallet)
- **Verification**: Check `window.ethereum` is available
</details>

<details>
<summary><strong>"Wrong network" Error</strong></summary>

- **Cause**: Wallet not on Base Sepolia testnet
- **Solution**: Switch network in Coinbase Wallet settings
- **Network Details**: Chain ID `0x14a34` (84532)
</details>

<details>
<summary><strong>X402 Not Detected</strong></summary>

- **Cause**: Meta tags missing or incorrect format
- **Solution**: Verify meta tags are in `<head>` section
- **Debug**: Check console for detection logs
</details>

<details>
<summary><strong>"Insufficient USDC balance"</strong></summary>

- **Cause**: Not enough USDC tokens in wallet
- **Solution**: Visit [Circle Faucet](https://faucet.circle.com/) for test tokens
- **Note**: Requires Base Sepolia testnet
</details>

### Debug Mode

Enable debug logging:

```javascript
// In browser console
localStorage.setItem('x402-debug', 'true');
```

### Reporting Security Issues

⚠️ **Do not create public issues for security vulnerabilities.**

Please report security issues to **security@autospend.ai** with:
- Description of the vulnerability
- Steps to reproduce
- Potential impact

## 🗺️ Roadmap

### Version 1.1.0 (Planned)
- [ ] Support for Ethereum Mainnet
- [ ] Support for Base Mainnet
- [ ] Multi-currency support
- [ ] Enhanced transaction history
- [ ] Payment scheduling

### Version 1.2.0 (Planned)
- [ ] Integration with MetaMask
- [ ] Recurring payments
- [ ] Payment analytics
- [ ] Export transaction history
- [ ] Dark mode UI

### Version 2.0.0 (Future)
- [ ] Multi-chain support
- [ ] DeFi integrations
- [ ] NFT payments
- [ ] Mobile companion app

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

```bash
# Quick start for contributors
git clone https://github.com/AbrahamOjes/autospend-x402.git
cd autospend-x402
npm install
npm run dev
```

## 💬 Support

| Channel | Link |
|---------|------|
| 📧 Email | support@autospend.ai |
| 🐛 Issues | [GitHub Issues](https://github.com/AbrahamOjes/autospend-x402/issues) |
| � Discussions | [GitHub Discussions](https://github.com/AbrahamOjes/autospend-x402/discussions) |

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Coinbase Wallet](https://www.coinbase.com/wallet) — Excellent wallet integration
- [Base Network](https://base.org) — Fast and affordable L2 transactions
- [Circle USDC](https://www.circle.com/en/usdc) — Stable digital currency
- [X402 Protocol](https://www.x402.org/) — HTTP-native payment standard

---

<div align="center">

**Built with ❤️ for the Web3 community**

[⬆ Back to Top](#-autospend---x402-payment-extension)

</div>
