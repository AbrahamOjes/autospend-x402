// x402-content.js - Content script for X402 Payment Extension
// Handles X402 detection, script injection, and message bridging

console.log('💰 Content script starting to load...');

// Notify background script that content script has loaded
try {
  chrome.runtime.sendMessage({ action: 'CONTENT_SCRIPT_LOADED' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('💰 Error notifying background script:', chrome.runtime.lastError.message);
    } else {
      console.log('💰 Successfully notified background script of content script load');
    }
  });
} catch (error) {
  console.error('💰 Failed to send CONTENT_SCRIPT_LOADED message:', error);
}

// Initialize state
let x402Data = null;
let walletManager = null;
let walletConnected = false;
let walletAddress = null;

// Class for detecting X402 meta tags
class X402Detector {
  constructor() {
    this.x402Data = null;
    this.observer = null;
    this.initialized = false;
  }

  // Initialize detector
  init() {
    if (this.initialized) return;
    
    console.log('💰 Initializing X402 detector');
    this.scanForX402();
    this.setupMutationObserver();
    this.initialized = true;
    
    // Make detector available globally
    window.x402Detector = this;
  }

  // Scan for X402 meta tags
  scanForX402() {
    // Check for payment required tag
    const paymentRequiredTag = document.querySelector('meta[name="x-402-payment-required"], meta[property="x402:payment-required"]');
    
    if (!paymentRequiredTag || paymentRequiredTag.content.toLowerCase() !== 'true') {
      return false;
    }
    
    // Extract payment details
    const amount = this.getMetaContent('x-402-amount', 'x402:amount');
    const currency = this.getMetaContent('x-402-currency', 'x402:currency');
    const description = this.getMetaContent('x-402-description', 'x402:description');
    const paymentUrl = this.getMetaContent('x-402-payment-url', 'x402:payment-url');
    
    if (!amount || !currency) {
      console.log('💰 X402 meta tags found but missing required fields');
      return false;
    }
    
    // Store X402 data
    this.x402Data = {
      amount,
      currency,
      description: description || 'Content access',
      paymentUrl: paymentUrl || null
    };
    
    console.log('💰 X402 detected:', this.x402Data);
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'X402_DETECTED',
      data: this.x402Data
    });
    
    return true;
  }
  
  // Helper to get meta content from either name or property attribute
  getMetaContent(name, property) {
    const nameTag = document.querySelector(`meta[name="${name}"]`);
    const propertyTag = document.querySelector(`meta[property="${property}"]`);
    
    return (nameTag && nameTag.content) || (propertyTag && propertyTag.content) || null;
  }
  
  // Set up mutation observer to detect dynamically added X402 meta tags
  setupMutationObserver() {
    if (this.observer) return;
    
    this.observer = new MutationObserver((mutations) => {
      let shouldScan = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          for (const node of mutation.addedNodes) {
            if (node.nodeName === 'META' || 
                (node.querySelector && node.querySelector('meta'))) {
              shouldScan = true;
              break;
            }
          }
        }
      }
      
      if (shouldScan) {
        this.scanForX402();
      }
    });
    
    // Observe head for meta tag changes
    this.observer.observe(document.head, {
      childList: true,
      subtree: true
    });
  }
}

// Inject wallet manager script into page
function injectWalletScript() {
  console.log('💰 Injecting wallet scripts');
  
  // Create a wallet-ready-check.js script and add it to web_accessible_resources in manifest.json
  const walletReadyCheckScript = document.createElement('script');
  walletReadyCheckScript.src = chrome.runtime.getURL('wallet-ready-check.js');
  document.head.appendChild(walletReadyCheckScript);
  
  // Inject wallet-content-standalone.js
  const walletScript = document.createElement('script');
  walletScript.src = chrome.runtime.getURL('wallet-content-standalone.js');
  document.head.appendChild(walletScript);
  
  // Inject provider bridge
  const providerScript = document.createElement('script');
  providerScript.src = chrome.runtime.getURL('provider-bridge.js');
  document.head.appendChild(providerScript);
  
  // Inject wallet initializer
  const initScript = document.createElement('script');
  initScript.src = chrome.runtime.getURL('wallet-initializer.js');
  document.head.appendChild(initScript);
  
  // Set up message listener for wallet events
  window.addEventListener('message', (event) => {
    // Only accept messages from the same frame
    if (event.source !== window) return;
    
    // Check if it's a wallet event
    if (event.data.type && event.data.type.startsWith('x402_wallet_')) {
      console.log('💰 Received wallet event:', event.data.type);
      
      // Forward wallet events to background script
      chrome.runtime.sendMessage({
        action: 'WALLET_EVENT',
        event: event.data.type.replace('x402_wallet_', ''),
        data: event.data.data
      }, response => {
        if (chrome.runtime.lastError) {
          console.error('💰 Error sending message to background:', chrome.runtime.lastError);
        } else {
          console.log('💰 Background response:', response);
        }
      });
    }
  });
}

// Check wallet manager status and respond
function checkWalletManagerStatus(responseCallback) {
  console.log('💰 Checking wallet manager status...');
  
  try {
    // Check if wallet manager is initialized
    if (window.x402WalletManager) {
      console.log('💰 Wallet manager found, getting status...');
      // Get wallet status
      const status = {
        initialized: true,
        connected: window.x402WalletManager.isConnected || false,
        address: window.x402WalletManager.address || null,
        balance: window.x402WalletManager.balance || null,
        network: window.x402WalletManager.network || null,
        x402Detected: !!x402Data,
        x402Data: x402Data
      };
      
      responseCallback({ status: 'OK', data: status });
    } else {
      console.log('💰 Wallet manager not found, trying postMessage...');
      // Wallet manager not initialized yet, try to access it via postMessage
      window.postMessage({
        type: 'x402_check_status',
        source: 'content_script'
      }, '*');
      
      // Set up a temporary listener for the response
      const statusListener = (event) => {
        if (event.source === window && event.data.type === 'x402_status_response') {
          console.log('💰 Received status response from wallet manager:', event.data.data);
          window.removeEventListener('message', statusListener);
          responseCallback({ status: 'OK', data: event.data.data });
        }
      };
      
      window.addEventListener('message', statusListener);
      
      // Fallback timeout
      setTimeout(() => {
        console.log('💰 Status check timeout, wallet manager not responding');
        window.removeEventListener('message', statusListener);
        responseCallback({ 
          status: 'ERROR', 
          error: 'Wallet manager not initialized',
          data: {
            initialized: false,
            connected: false,
            address: null,
            balance: null,
            network: null,
            x402Detected: !!x402Data,
            x402Data: x402Data
          }
        });
      }, 2000); // Increased timeout to 2 seconds
    }
  } catch (error) {
    console.error('💰 Error checking wallet manager status:', error);
    responseCallback({ 
      status: 'ERROR', 
      error: error.message,
      data: {
        initialized: false,
        connected: false,
        address: null,
        balance: null,
        network: null,
        x402Detected: !!x402Data,
        x402Data: x402Data
      }
    });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('💰 Content script received message:', message);
  
  try {
    // Ensure we always send a response
    let responseHandled = false;
    
    const safeResponse = (response) => {
      if (!responseHandled) {
        responseHandled = true;
        console.log('💰 Sending response:', response);
        sendResponse(response);
      }
    };
    
    // Handle messages from popup
    switch (message.action) {
      case 'CONTENT_SCRIPT_LOADED':
        safeResponse({ status: 'OK' });
        break;
        
      case 'CHECK_STATUS':
        checkWalletManagerStatus(safeResponse);
        return true; // Keep the message channel open for async response
        
      case 'CONNECT_WALLET':
        // Connect wallet using CSP-compliant approach
        try {
          // Inject wallet connection script
          const connectScript = document.createElement('script');
          connectScript.src = chrome.runtime.getURL('wallet-connect.js');
          connectScript.onload = () => {
            console.log('💰 Wallet connect script loaded');
          };
          connectScript.onerror = (error) => {
            console.error('💰 Error loading wallet connect script:', error);
            safeResponse({ status: 'ERROR', error: 'Failed to load wallet connection script' });
          };
          document.head.appendChild(connectScript);
          
          // Set up listener for connection result
          const connectionListener = (event) => {
            if (event.source === window && event.data.type === 'x402_wallet_connect_result') {
              window.removeEventListener('message', connectionListener);
              
              if (event.data.success) {
                safeResponse({ status: 'OK', address: event.data.address });
              } else {
                safeResponse({ status: 'ERROR', error: event.data.error });
              }
            }
          };
          
          window.addEventListener('message', connectionListener);
          
          // Timeout fallback
          setTimeout(() => {
            window.removeEventListener('message', connectionListener);
            safeResponse({ status: 'ERROR', error: 'Connection timeout' });
          }, 10000);
          
          return true;
        } catch (error) {
          console.error('💰 Error connecting wallet:', error);
          safeResponse({ status: 'ERROR', error: error.message });
          return true;
        }
        
      case 'GET_WALLET_STATUS':
        // Return wallet status
        if (window.x402WalletManager) {
          safeResponse({
            status: 'OK',
            connected: window.x402WalletManager.isConnected,
            address: window.x402WalletManager.address,
            balance: window.x402WalletManager.balance,
            network: window.x402WalletManager.network
          });
        } else {
          safeResponse({ status: 'ERROR', error: 'Wallet manager not initialized' });
        }
        return true;
        
      case 'MAKE_PAYMENT':
        // Process payment if wallet manager and X402 data available
        if (window.x402WalletManager && x402Data) {
          window.x402WalletManager.makePayment(x402Data)
            .then(result => {
              safeResponse({ status: 'OK', result });
            })
            .catch(error => {
              safeResponse({ status: 'ERROR', error: error.message });
            });
          return true;
        } else {
          safeResponse({ 
            status: 'ERROR', 
            error: !window.x402WalletManager ? 'Wallet manager not initialized' : 'No X402 data available' 
          });
          return true;
        }
        
      default:
        console.log('💰 Unknown message action:', message.action);
        safeResponse({ status: 'ERROR', error: 'Unknown action' });
        break;
    }
  } catch (error) {
    console.error('💰 Error handling message:', error);
    if (!responseHandled) {
      sendResponse({ status: 'ERROR', error: error.message });
    }
  }
  
  return true; // Keep message channel open for async responses
});

// Listen for messages from page context
window.addEventListener('message', (event) => {
  // Only accept messages from the same frame
  if (event.source !== window) return;
  
  const message = event.data;
  
  // Check if message is from our wallet manager
  if (message && message.source === 'x402WalletManager') {
    console.log('💰 Received message from wallet manager:', message);
    
    switch (message.event) {
      case 'walletConnected':
        walletConnected = true;
        walletAddress = message.data;
        
        // Forward to background script
        chrome.runtime.sendMessage({
          action: 'WALLET_EVENT',
          event: 'connect',
          data: message.data
        });
        break;
        
      case 'walletDisconnected':
        walletConnected = false;
        walletAddress = null;
        
        // Forward to background script
        chrome.runtime.sendMessage({
          action: 'WALLET_EVENT',
          event: 'disconnect'
        });
        break;
        
      case 'balanceUpdated':
        // Forward to background script
        chrome.runtime.sendMessage({
          action: 'WALLET_EVENT',
          event: 'balance',
          data: message.data
        });
        break;
        
      case 'networkUpdated':
        // Forward to background script
        chrome.runtime.sendMessage({
          action: 'WALLET_EVENT',
          event: 'network',
          data: message.data
        });
        break;
        
      case 'paymentStarted':
        // Forward to background script
        chrome.runtime.sendMessage({
          action: 'PAYMENT_STATUS',
          status: 'started',
          data: message.data
        });
        break;
        
      case 'paymentSuccess':
        // Forward to background script
        chrome.runtime.sendMessage({
          action: 'PAYMENT_STATUS',
          status: 'success',
          data: message.data
        });
        
        // Refresh page after successful payment
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        break;
        
      case 'paymentFailed':
        // Forward to background script
        chrome.runtime.sendMessage({
          action: 'PAYMENT_STATUS',
          status: 'failed',
          data: message.data
        });
        break;
    }
  }
});

// Initialize
(function init() {
  console.log('💰 X402 content script initialized');
  
  // Inject wallet scripts
  injectWalletScript();
  
  // Initialize X402 detector
  const detector = new X402Detector();
  detector.init();
  
  // Store X402 data if detected
  x402Data = detector.x402Data;
  
  // Initialize wallet manager after page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      console.log('💰 DOM loaded, wallet manager initialization handled by injected scripts');
    });
  } else {
    console.log('💰 DOM already loaded, wallet manager initialization handled by injected scripts');
  }
  
  // Mark content script as ready
  setTimeout(() => {
    console.log('💰 Content script fully initialized and ready for messages');
  }, 500); // Increased timeout to ensure everything is loaded
})();
