// provider-bridge.js - Ethereum provider bridge for X402 Payment Extension
// This script bridges between the page and wallet provider

(function() {
  console.log('⚡ Provider bridge initialized');
  
  // Check if provider is already injected
  if (window.ethereum) {
    console.log('⚡ Ethereum provider already exists, enhancing with X402 capabilities');
    
    // Store original provider
    const originalProvider = window.ethereum;
    
    // Create enhanced provider
    const enhancedProvider = {
      ...originalProvider,
      
      // Add X402 specific methods
      x402: {
        getPaymentInfo: () => {
          if (window.x402Detector && window.x402Detector.x402Data) {
            return window.x402Detector.x402Data;
          }
          return null;
        },
        
        isX402Page: () => {
          return !!(window.x402Detector && window.x402Detector.x402Data);
        },
        
        makePayment: async () => {
          if (window.x402WalletManager && window.x402Detector && window.x402Detector.x402Data) {
            return await window.x402WalletManager.makePayment(window.x402Detector.x402Data);
          }
          throw new Error('Cannot make payment: X402 data or wallet manager not available');
        }
      }
    };
    
    // Replace provider
    window.ethereum = enhancedProvider;
  }
})();
