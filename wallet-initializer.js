// wallet-initializer.js
// This script initializes the wallet manager in a CSP-compliant way

// Wait for document to be fully loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWalletManager);
} else {
  // Document already loaded, initialize immediately
  setTimeout(initWalletManager, 100);
}

// Maximum number of retries
const MAX_RETRIES = 20;
let retryCount = 0;

function initWalletManager() {
  console.log('💰 Checking if wallet manager needs initialization');
  
  // Wait for CoinbaseWalletManager class to be available
  if (typeof CoinbaseWalletManager === 'undefined') {
    retryCount++;
    if (retryCount > MAX_RETRIES) {
      console.error('💰 CoinbaseWalletManager not available after maximum retries');
      window.postMessage({
        type: 'x402_wallet_error',
        data: { error: 'CoinbaseWalletManager not available after maximum retries' }
      }, '*');
      return;
    }
    
    console.log('💰 Waiting for CoinbaseWalletManager to be defined (attempt ' + retryCount + ')');
    setTimeout(initWalletManager, 200);
    return;
  }
  
  try {
    // Only initialize if not already initialized
    if (!window.x402WalletManager) {
      console.log('💰 Creating wallet manager instance');
      
      // Create a safe version of the wallet manager that won't cause circular JSON errors
      window.x402WalletManager = new CoinbaseWalletManager();
      
      // Dispatch event to notify that wallet manager is ready
      window.dispatchEvent(new CustomEvent('x402WalletManagerReady'));
      
      // Notify the content script
      window.postMessage({
        type: 'x402_wallet_initialized',
        data: { success: true }
      }, '*');
      
      // Set up event listeners for wallet events
      if (window.ethereum) {
        try {
          // Use addEventListener for standard Ethereum providers
          if (typeof window.ethereum.addEventListener === 'function') {
            window.ethereum.addEventListener('accountsChanged', (accounts) => {
              console.log('💰 Accounts changed:', accounts);
              window.postMessage({
                type: 'x402_wallet_connect',
                data: accounts[0] || null
              }, '*');
            });
            
            window.ethereum.addEventListener('chainChanged', (chainId) => {
              console.log('💰 Chain changed:', chainId);
              window.postMessage({
                type: 'x402_wallet_network',
                data: chainId
              }, '*');
            });
            
            window.ethereum.addEventListener('disconnect', () => {
              console.log('💰 Wallet disconnected');
              window.postMessage({
                type: 'x402_wallet_disconnect',
                data: null
              }, '*');
            });
          }
          // Fallback for providers that use .on() method (like some older versions)
          else if (typeof window.ethereum.on === 'function') {
            window.ethereum.on('accountsChanged', (accounts) => {
              console.log('💰 Accounts changed:', accounts);
              window.postMessage({
                type: 'x402_wallet_connect',
                data: accounts[0] || null
              }, '*');
            });
            
            window.ethereum.on('chainChanged', (chainId) => {
              console.log('💰 Chain changed:', chainId);
              window.postMessage({
                type: 'x402_wallet_network',
                data: chainId
              }, '*');
            });
            
            window.ethereum.on('disconnect', () => {
              console.log('💰 Wallet disconnected');
              window.postMessage({
                type: 'x402_wallet_disconnect',
                data: null
              }, '*');
            });
          } else {
            console.log('💰 Wallet provider does not support event listeners');
          }
        } catch (error) {
          console.error('💰 Error setting up wallet event listeners:', error);
        }
      }
    } else {
      console.log('💰 Wallet manager already initialized');
      window.postMessage({
        type: 'x402_wallet_ready',
        data: { success: true }
      }, '*');
    }
  } catch (error) {
    console.error('💰 Error initializing wallet manager:', error);
    
    // Notify the content script
    window.postMessage({
      type: 'x402_wallet_error',
      data: { error: error.message || 'Unknown error' }
    }, '*');
  }
}

// Add message listener for status checks from content script
window.addEventListener('message', (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) return;
  
  const message = event.data;
  
  // Handle status check requests
  if (message && message.type === 'x402_check_status' && message.source === 'content_script') {
    console.log('💰 Received status check request');
    
    try {
      // Check if wallet manager is available
      if (window.x402WalletManager) {
        const status = {
          initialized: true,
          connected: window.x402WalletManager.isConnected || false,
          address: window.x402WalletManager.address || null,
          balance: window.x402WalletManager.balance || null,
          network: window.x402WalletManager.network || null
        };
        
        // Send status response
        window.postMessage({
          type: 'x402_status_response',
          data: status
        }, '*');
      } else {
        // Wallet manager not ready yet
        window.postMessage({
          type: 'x402_status_response',
          data: {
            initialized: false,
            connected: false,
            address: null,
            balance: null,
            network: null
          }
        }, '*');
      }
    } catch (error) {
      console.error('💰 Error checking wallet status:', error);
      window.postMessage({
        type: 'x402_status_response',
        data: {
          initialized: false,
          connected: false,
          address: null,
          balance: null,
          network: null,
          error: error.message
        }
      }, '*');
    }
  }
});
