// wallet-ready-check.js
// This script checks for wallet manager readiness and sets up event listeners

// Set up listener for wallet manager ready event
window.addEventListener('x402WalletManagerReady', () => {
  console.log('💰 Wallet manager ready event received');
  if (window.x402WalletManager) {
    console.log('💰 Wallet manager is available');
    
    // Notify the content script
    window.postMessage({
      type: 'x402_wallet_ready',
      data: { success: true }
    }, '*');
    
    // Check connection status
    setTimeout(() => {
      try {
        window.x402WalletManager.checkConnection();
      } catch (error) {
        console.error('💰 Error checking connection:', error);
      }
    }, 500);
  } else {
    console.error('💰 Wallet manager not found on window object');
    
    // Notify the content script
    window.postMessage({
      type: 'x402_wallet_error',
      data: { error: 'Wallet manager not found' }
    }, '*');
  }
});

// Check if wallet manager already exists periodically
const checkInterval = setInterval(() => {
  if (window.x402WalletManager) {
    console.log('💰 Wallet manager found');
    clearInterval(checkInterval);
    
    // Notify the content script
    window.postMessage({
      type: 'x402_wallet_found',
      data: { success: true }
    }, '*');
  }
}, 2000);

// Stop checking after 10 seconds to avoid memory leaks
setTimeout(() => {
  clearInterval(checkInterval);
}, 10000);
