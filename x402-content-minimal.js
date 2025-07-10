// x402-content-minimal.js - Ultra-minimal content script to isolate the issue
// Almost identical to working test script with minimal additions

console.log('💰 MINIMAL: Content script loading...');

// Simple X402 detection
let x402Data = null;

function detectX402() {
  try {
    // Look for the correct X402 meta tags
    const paymentRequiredMeta = document.querySelector('meta[name="x-402-payment-required"]');
    const amountMeta = document.querySelector('meta[name="x-402-amount"]');
    const currencyMeta = document.querySelector('meta[name="x-402-currency"]');
    const descriptionMeta = document.querySelector('meta[name="x-402-description"]');
    
    console.log('💰 MINIMAL: Checking X402 meta tags...');
    console.log('  - payment-required:', paymentRequiredMeta?.content);
    console.log('  - amount:', amountMeta?.content);
    console.log('  - currency:', currencyMeta?.content);
    console.log('  - description:', descriptionMeta?.content);
    
    if (paymentRequiredMeta && paymentRequiredMeta.content === 'true' && amountMeta) {
      x402Data = {
        amount: amountMeta.content || '1.00',
        currency: currencyMeta?.content || 'USDC',
        description: descriptionMeta?.content || 'X402 Payment',
        detected: true
      };
      console.log('💰 MINIMAL: X402 detected:', x402Data);
      return true;
    } else {
      console.log('💰 MINIMAL: No X402 payment required on this page');
    }
  } catch (error) {
    console.error('💰 MINIMAL: X402 detection error:', error);
  }
  return false;
}

// Inject wallet bridge script into main page context
function injectWalletBridge() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('wallet-bridge.js');
  script.onload = function() {
    console.log('🌉 MINIMAL: Wallet bridge script injected');
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

// Communication with wallet bridge
let bridgeRequestId = 0;
const bridgeRequests = new Map();

function sendToBridge(action, data = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++bridgeRequestId;
    
    bridgeRequests.set(requestId, { resolve, reject });
    
    // Set timeout for request (increased for wallet interactions)
    setTimeout(() => {
      if (bridgeRequests.has(requestId)) {
        bridgeRequests.delete(requestId);
        reject(new Error('Bridge request timeout'));
      }
    }, 30000); // 30 seconds for wallet interactions
    
    window.postMessage({
      source: 'autospend-content-script',
      action: action,
      requestId: requestId,
      payload: data
    }, window.location.origin);
  });
}

// Listen for responses from wallet bridge
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  
  if (event.data.source !== 'autospend-wallet-bridge') {
    return;
  }
  
  if (event.data.action === 'BRIDGE_READY') {
    console.log('🌉 MINIMAL: Wallet bridge is ready');
    return;
  }
  
  if (event.data.requestId && bridgeRequests.has(event.data.requestId)) {
    const { resolve } = bridgeRequests.get(event.data.requestId);
    bridgeRequests.delete(event.data.requestId);
    resolve(event.data.response);
  }
});

// Wallet diagnostic function using bridge
async function runWalletDiagnostic() {
  try {
    const diagnostic = await sendToBridge('CHECK_WALLET_PROVIDERS');
    console.log('🔍 MINIMAL: Wallet diagnostic from bridge:', diagnostic);
    return diagnostic;
  } catch (error) {
    console.error('🔍 MINIMAL: Error getting wallet diagnostic:', error);
    return {
      timestamp: Date.now(),
      ethereum: { available: false },
      otherProviders: {},
      error: error.message
    };
  }
}

// Wallet connection functions using bridge
async function connectWallet() {
  try {
    // Run diagnostic first
    const diagnostic = await runWalletDiagnostic();
    
    if (!diagnostic.ethereum.available) {
      console.error(' MINIMAL: No wallet detected. Diagnostic:', diagnostic);
      throw new Error('No wallet detected. Please install Coinbase Wallet.');
    }
    
    console.log(' MINIMAL: Requesting wallet connection via bridge...');
    
    // Connect wallet through bridge
    const result = await sendToBridge('CONNECT_WALLET');
    
    if (!result.success) {
      throw new Error(result.error || 'Wallet connection failed');
    }
    
    console.log(' MINIMAL: Wallet connected via bridge:', result.address);
    
    return result;
  } catch (error) {
    console.error(' MINIMAL: Wallet connection error:', error);
    throw error;
  }
}

async function getWalletStatus() {
  try {
    const status = await sendToBridge('GET_WALLET_STATUS');
    console.log('💰 MINIMAL: Wallet status from bridge:', status);
    return status;
  } catch (error) {
    console.error('💰 MINIMAL: Error getting wallet status:', error);
    return {
      walletAvailable: false,
      walletConnected: false,
      error: error.message
    };
  }
}

// Initialize content script
console.log('💰 MINIMAL: Content script loading...');

// Inject wallet bridge script
injectWalletBridge();

// Detect X402 payment requirements on page load
detectX402();

// Notify background script that content script is loaded
chrome.runtime.sendMessage({ action: 'CONTENT_SCRIPT_LOADED' }, (response) => {
  if (chrome.runtime.lastError) {
    console.error('💰 MINIMAL: Error notifying background script:', chrome.runtime.lastError);
  } else {
    console.log('💰 MINIMAL: Successfully notified background script');
  }
});

console.log('💰 MINIMAL: Content script setup complete');

// Message listener - Identical to working test script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('💰 MINIMAL: Content script received message:', message);
  
  switch (message.action) {
    case 'PING':
      console.log('💰 MINIMAL: PING received');
      sendResponse({ status: 'PONG', timestamp: Date.now() });
      break;
      
    case 'CHECK_STATUS':
      console.log('💰 MINIMAL: CHECK_STATUS received');
      const hasX402 = detectX402();
      // Simplified response without async wallet check to avoid connection issues
      sendResponse({ 
        status: 'OK', 
        message: 'Minimal script working',
        x402Detected: hasX402,
        x402Data: x402Data,
        walletConnected: false, // Will be checked separately
        walletAddress: null
      });
      break;
      
    case 'GET_WALLET_STATUS':
      console.log('💰 MINIMAL: GET_WALLET_STATUS received');
      // Simplified sync response to avoid connection issues
      sendResponse({
        status: 'OK',
        walletAvailable: false,
        walletConnected: false,
        walletAddress: null,
        network: null,
        x402Data: x402Data,
        hasPayment: !!x402Data
      });
      break;
      
    case 'CONNECT_WALLET':
      console.log('💰 MINIMAL: CONNECT_WALLET received');
      // Simplified response - actual connection will be handled by wallet bridge
      sendResponse({
        status: 'OK',
        walletConnected: false,
        walletAddress: null,
        message: 'Connection initiated'
      });
      break;
      
    case 'MAKE_PAYMENT':
      console.log('💰 MINIMAL: MAKE_PAYMENT received');
      if (!x402Data || !x402Data.detected) {
        sendResponse({ 
          status: 'ERROR', 
          error: 'No payment required on this page' 
        });
        break;
      }
      
      // Process payment via wallet bridge
      const paymentPayload = {
        amount: x402Data.amount,
        currency: x402Data.currency,
        description: x402Data.description,
        contractAddress: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238' // Base Sepolia USDC contract
      };
      
      console.log('💰 MINIMAL: Sending payment payload to bridge:', JSON.stringify(paymentPayload, null, 2));
      console.log('💰 MINIMAL: X402 data used:', JSON.stringify(x402Data, null, 2));
      console.log('💰 MINIMAL: Page URL:', window.location.href);
      
      // Initiate payment via bridge (async, no response needed to prevent connection issues)
      sendToBridge('MAKE_PAYMENT', paymentPayload)
      .then(result => {
        console.log('💰 MINIMAL: Payment result:', result);
        // Store transaction data in background script
        chrome.runtime.sendMessage({
          action: 'PAYMENT_STATUS',
          status: result.success ? 'success' : 'failed',
          data: {
            transactionHash: result.txHash || null,
            amount: x402Data.amount,
            currency: x402Data.currency,
            description: x402Data.description,
            recipient: '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238',
            network: 'Base Sepolia',
            url: window.location.href,
            timestamp: Date.now(),
            error: result.error || null
          }
        });
      }).catch(error => {
        console.log('💰 MINIMAL: Payment error:', error);
        // Send error status to background script
        chrome.runtime.sendMessage({
          action: 'PAYMENT_STATUS',
          status: 'error',
          data: {
            error: error.message,
            amount: x402Data.amount,
            currency: x402Data.currency,
            description: x402Data.description,
            url: window.location.href,
            timestamp: Date.now()
          }
        });
      });
      
      // Provide immediate sync response to prevent connection issues
      sendResponse({ 
        status: 'OK', 
        message: 'Payment initiated - check wallet for confirmation' 
      });
      break;
      
    default:
      console.log('💰 MINIMAL: Unknown action:', message.action);
      sendResponse({ error: 'Unknown action' });
      break;
  }
});

console.log('💰 MINIMAL: Content script setup complete');
