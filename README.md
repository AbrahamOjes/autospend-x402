# Autospend - X402 Payment Chrome Extension

A Chrome extension that enables seamless cryptocurrency payments using the X402 protocol with Coinbase Wallet integration. It automatically detects X402-enabled websites and provides a simple interface for making USDC payments on the Base network.

## Features

### 🔍 Automatic X402 Detection
- Scans web pages for X402 meta tags in real-time
- Detects payment requirements including amount, currency, and description
- Updates extension badge to indicate X402-enabled pages
- Uses MutationObserver to detect dynamically added content

### 💰 Coinbase Wallet Integration
- Seamless connection to Coinbase Wallet browser extension
- Automatic provider detection and initialization
- Real-time wallet status monitoring (connected/disconnected)
- Balance checking and network verification (Sepolia testnet)
- Account change detection and UI updates

### ⚡ One-Click Payments
- Popup interface for quick payment processing
- USDC payment support on Base network
- Transaction confirmation and receipt storage
- Automatic page refresh after successful payment
- Payment history tracking

### 🎨 Modern UI/UX
- Clean, responsive popup interface (350px width)
- Real-time status indicators for wallet and X402 detection
- Connection health monitoring with visual feedback
- Transaction history display
- Coinbase blue color scheme (#0052FF)

## Installation

### Prerequisites
- Chrome browser (Manifest V3 support)
- Coinbase Wallet browser extension
- Sepolia testnet USDC (for testing)

### Installation Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/autospend-x402.git
cd autospend-x402
```

2. **Load in Chrome**
- Open Chrome → Extensions → Developer mode
- Click "Load unpacked"
- Select the `autospend-x402` folder

3. **Install Coinbase Wallet**
- Install from Chrome Web Store
- Create or import wallet
- Switch to Sepolia testnet

4. **Get Test USDC**
- Use Sepolia faucet
- Add USDC token to wallet

## Usage

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

#### Adding X402 to Your Website
```html
<!DOCTYPE html>
<html>
<head>
  <!-- X402 Payment Meta Tags -->
  <meta name="x-402-payment-required" content="true">
  <meta name="x-402-amount" content="0.50">
  <meta name="x-402-currency" content="USDC">
  <meta name="x-402-description" content="Premium article access">

  <!-- Optional: Custom payment endpoint -->
  <meta name="x-402-payment-url" content="/api/verify-payment">
</head>
<body>
  <!-- Your content here -->
  <div class="premium-content" style="display: none;">
    This content requires payment to view.
  </div>
</body>
</html>
```

#### Testing X402 Integration
The extension includes test pages:
- `test-pages/wallet-detection-test.html` - Test wallet connection
- `test-pages/x402-payment-test.html` - Test payment flow
- `test-pages/x402-test.html` - Test X402 detection

## Security Features

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

## Troubleshooting

### Common Issues

#### "Ping timed out" Error
- **Cause**: Background script not responding
- **Solution**: Reload extension in Chrome Extensions page

#### "No Ethereum provider found"
- **Cause**: Coinbase Wallet not installed or enabled
- **Solution**: Install Coinbase Wallet extension

#### "Wrong network" Error
- **Cause**: Wallet not on Sepolia testnet
- **Solution**: Switch network in Coinbase Wallet

#### X402 Not Detected
- **Cause**: Meta tags missing or incorrect format
- **Solution**: Check meta tag syntax and placement

#### Payment Fails
- **Cause**: Insufficient USDC balance or network issues
- **Solution**: Add USDC to wallet, check network connection

## License

MIT

## Author

Autospend AI Team
