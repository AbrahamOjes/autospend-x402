// wallet-diagnostic.js - Diagnostic script to check wallet availability

console.log('🔍 WALLET DIAGNOSTIC: Starting wallet detection...');

// Check for various wallet providers
function checkWalletProviders() {
  const results = {
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    providers: {}
  };
  
  // Check window.ethereum
  if (typeof window.ethereum !== 'undefined') {
    results.providers.ethereum = {
      available: true,
      isCoinbaseWallet: window.ethereum.isCoinbaseWallet || false,
      isMetaMask: window.ethereum.isMetaMask || false,
      chainId: window.ethereum.chainId || null,
      selectedAddress: window.ethereum.selectedAddress || null,
      methods: Object.getOwnPropertyNames(window.ethereum).filter(prop => typeof window.ethereum[prop] === 'function')
    };
  } else {
    results.providers.ethereum = { available: false };
  }
  
  // Check for Coinbase Wallet specifically
  if (typeof window.coinbaseWalletExtension !== 'undefined') {
    results.providers.coinbaseWalletExtension = { available: true };
  } else {
    results.providers.coinbaseWalletExtension = { available: false };
  }
  
  // Check for other common wallet providers
  const walletProviders = [
    'ethereum',
    'web3',
    'coinbaseWalletExtension',
    'phantom',
    'solana',
    'tronWeb'
  ];
  
  walletProviders.forEach(provider => {
    if (typeof window[provider] !== 'undefined' && !results.providers[provider]) {
      results.providers[provider] = {
        available: true,
        type: typeof window[provider],
        constructor: window[provider].constructor?.name || 'Unknown'
      };
    }
  });
  
  return results;
}

// Run diagnostic
const diagnostic = checkWalletProviders();
console.log('🔍 WALLET DIAGNOSTIC: Results:', diagnostic);

// Display results on page
function displayDiagnostic() {
  const diagnosticDiv = document.createElement('div');
  diagnosticDiv.id = 'wallet-diagnostic';
  diagnosticDiv.style.cssText = `
    position: fixed;
    top: 50px;
    right: 10px;
    background: #f0f0f0;
    border: 2px solid #333;
    padding: 15px;
    border-radius: 8px;
    z-index: 10001;
    font-family: monospace;
    font-size: 11px;
    max-width: 300px;
    max-height: 400px;
    overflow-y: auto;
  `;
  
  let html = '<h3 style="margin: 0 0 10px 0;">🔍 Wallet Diagnostic</h3>';
  
  if (diagnostic.providers.ethereum.available) {
    html += '<div style="color: green;">✅ window.ethereum detected</div>';
    html += `<div>Coinbase Wallet: ${diagnostic.providers.ethereum.isCoinbaseWallet ? '✅' : '❌'}</div>`;
    html += `<div>MetaMask: ${diagnostic.providers.ethereum.isMetaMask ? '✅' : '❌'}</div>`;
    html += `<div>Chain ID: ${diagnostic.providers.ethereum.chainId || 'Not connected'}</div>`;
    html += `<div>Address: ${diagnostic.providers.ethereum.selectedAddress || 'Not connected'}</div>`;
  } else {
    html += '<div style="color: red;">❌ window.ethereum NOT detected</div>';
  }
  
  html += '<hr style="margin: 10px 0;">';
  html += '<div><strong>All Providers:</strong></div>';
  
  Object.entries(diagnostic.providers).forEach(([name, info]) => {
    const status = info.available ? '✅' : '❌';
    html += `<div>${status} ${name}</div>`;
  });
  
  html += '<hr style="margin: 10px 0;">';
  html += '<div style="font-size: 10px; color: #666;">Check console for full details</div>';
  
  diagnosticDiv.innerHTML = html;
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      document.body.appendChild(diagnosticDiv);
    });
  } else {
    document.body.appendChild(diagnosticDiv);
  }
}

// Display diagnostic on page
displayDiagnostic();

// Export for console access
window.walletDiagnostic = diagnostic;

console.log('🔍 WALLET DIAGNOSTIC: Complete. Check window.walletDiagnostic for full results.');
