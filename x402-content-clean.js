// x402-content-clean.js - Clean, minimal content script for X402 Payment Extension
// Based on working test script with X402 detection added incrementally

console.log('💰 X402 Content script loading...');

// Initialize state
let x402Data = null;
let detectedPayment = false;

// Notify background script that content script has loaded
try {
  chrome.runtime.sendMessage({ action: 'CONTENT_SCRIPT_LOADED' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('💰 Error notifying background script:', chrome.runtime.lastError.message);
    } else {
      console.log('💰 Successfully notified background script');
    }
  });
} catch (error) {
  console.error('💰 Failed to send CONTENT_SCRIPT_LOADED message:', error);
}

// Simple X402 detection function
function detectX402Payment() {
  console.log('💰 Detecting X402 payment...');
  
  try {
    // Look for X402 meta tags
    const x402Meta = document.querySelector('meta[name="x-402-payment-required"]');
    const amountMeta = document.querySelector('meta[name="x-402-amount"]');
    const currencyMeta = document.querySelector('meta[name="x-402-currency"]');
    const descriptionMeta = document.querySelector('meta[name="x-402-description"]');
    
    if (x402Meta && amountMeta) {
      x402Data = {
        amount: amountMeta.content || '1.00',
        currency: currencyMeta ? currencyMeta.content : 'USDC',
        description: descriptionMeta ? descriptionMeta.content : 'X402 Payment',
        detected: true
      };
      
      detectedPayment = true;
      console.log('💰 X402 payment detected:', x402Data);
      
      // Notify background script
      chrome.runtime.sendMessage({
        action: 'X402_DETECTED',
        data: x402Data
      });
      
      return true;
    }
  } catch (error) {
    console.error('💰 Error detecting X402:', error);
  }
  
  console.log('💰 No X402 payment detected');
  return false;
}

// Simple wallet status check
function checkWalletStatus() {
  console.log('💰 Checking wallet status...');
  
  // Check if Coinbase Wallet is available
  const hasWallet = window.ethereum && window.ethereum.isCoinbaseWallet;
  
  return {
    walletAvailable: hasWallet,
    walletConnected: false, // Will be updated by wallet connection
    x402Data: x402Data,
    hasPayment: detectedPayment
  };
}

// Message listener - Keep it simple and reliable
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('💰 Content script received message:', message);
  
  try {
    switch (message.action) {
      case 'PING':
        console.log('💰 PING received');
        sendResponse({ status: 'PONG', timestamp: Date.now() });
        break;
        
      case 'CHECK_STATUS':
        console.log('💰 Checking status...');
        const status = checkWalletStatus();
        sendResponse(status);
        break;
        
      case 'GET_WALLET_STATUS':
        console.log('💰 Getting wallet status...');
        const walletStatus = checkWalletStatus();
        sendResponse(walletStatus);
        break;
        
      case 'CONNECT_WALLET':
        console.log('💰 Connect wallet requested');
        // For now, just return success - wallet connection will be handled separately
        sendResponse({ success: true, message: 'Wallet connection initiated' });
        break;
        
      case 'MAKE_PAYMENT':
        console.log('💰 Make payment requested');
        // For now, just return success - payment will be handled separately
        sendResponse({ success: true, message: 'Payment initiated' });
        break;
        
      default:
        console.log('💰 Unknown action:', message.action);
        sendResponse({ error: 'Unknown action' });
        break;
    }
  } catch (error) {
    console.error('💰 Error handling message:', error);
    sendResponse({ error: error.message });
  }
  
  return false; // Don't keep the message channel open unless needed
});

// Initialize when DOM is ready
function initialize() {
  console.log('💰 Initializing X402 detection...');
  
  // Detect X402 payment
  detectX402Payment();
  
  // Set up observer for dynamic content
  const observer = new MutationObserver(() => {
    if (!detectedPayment) {
      detectX402Payment();
    }
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  console.log('💰 X402 content script initialization complete');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}

console.log('💰 X402 Content script setup complete');
