// wallet-connect.js - Helper script for connecting wallet from popup
// This script is injected by the content script when the popup// wallet-connect.js
// CSP-compliant wallet connection handler

(async function() {
  console.log('💰 Wallet connect script loaded');
  
  try {
    // Check if Ethereum provider is available
    if (!window.ethereum) {
      throw new Error('No Ethereum provider found. Please install Coinbase Wallet or another Web3 wallet.');
    }
    
    console.log('💰 Ethereum provider found, attempting to connect...');
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }
    
    const address = accounts[0];
    console.log('💰 Wallet connected:', address);
    
    // Post success message back to content script
    window.postMessage({
      type: 'x402_wallet_connect_result',
      address: address,
      success: true
    }, '*');
    
    // Also post the old format for compatibility
    window.postMessage({
      type: 'x402_wallet_connected',
      address: address,
      success: true
    }, '*');
    
  } catch (error) {
    console.error('💰 Error connecting wallet:', error);
    
    // Post error message back to content script
    window.postMessage({
      type: 'x402_wallet_connect_result',
      error: error.message,
      success: false
    }, '*');
    
    // Also post the old format for compatibility
    window.postMessage({
      type: 'x402_wallet_connect_error',
      error: error.message,
      success: false
    }, '*');
  }
})();
