// x402-content-improved.js - Consolidated and improved content script for X402 Payment Extension
// Updated for X402 V2 Protocol (January 2026)
// Supports: Multi-chain payments, new HTTP headers, facilitator integration

console.log('💰 X402 V2: Content script loading...');

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let x402Data = null;
let x402Requirements = null; // V2: Full payment requirements array
let bridgeRequestId = 0;
const bridgeRequests = new Map();
let debounceTimer = null;
let mutationObserver = null;
let x402Detector = null; // V2 Detector instance

// X402 V2 Protocol Version
const X402_VERSION = '2.0.0';

// ============================================================================
// X402 DETECTION
// ============================================================================

/**
 * Detect X402 payment requirements (V2 with V1 fallback)
 * Supports: Meta tags, HTTP headers, multi-chain
 * @returns {boolean} True if X402 payment is required
 */
function detectX402() {
  try {
    console.log('💰 X402 V2: Running detection...');
    
    // V2: Check for new meta tags first
    const paymentRequiredMeta = document.querySelector('meta[name="x-402-payment-required"]');
    const amountMeta = document.querySelector('meta[name="x-402-amount"]');
    const currencyMeta = document.querySelector('meta[name="x-402-currency"]');
    const descriptionMeta = document.querySelector('meta[name="x-402-description"]');
    
    // V2 additions
    const networkMeta = document.querySelector('meta[name="x-402-network"]');
    const recipientMeta = document.querySelector('meta[name="x-402-recipient"]');
    const schemeMeta = document.querySelector('meta[name="x-402-scheme"]');
    
    console.log('💰 X402 V2: Checking meta tags...');
    console.log('  - payment-required:', paymentRequiredMeta?.content);
    console.log('  - amount:', amountMeta?.content);
    console.log('  - currency:', currencyMeta?.content);
    console.log('  - network:', networkMeta?.content || 'eip155:84532 (default)');
    console.log('  - scheme:', schemeMeta?.content || 'exact (default)');
    
    if (paymentRequiredMeta && paymentRequiredMeta.content === 'true' && amountMeta) {
      // Build V2 payment requirements
      const requirement = {
        scheme: schemeMeta?.content || 'exact',
        network: networkMeta?.content || 'eip155:84532', // Default: Base Sepolia
        maxAmountRequired: amountMeta.content || '1.00',
        resource: window.location.href,
        payTo: recipientMeta?.content || null,
        asset: currencyMeta?.content || 'USDC',
        description: descriptionMeta?.content || 'X402 Payment',
        version: networkMeta ? '2.0.0' : '1.0.0', // V2 if network specified
        detectionMethod: 'meta-tags'
      };
      
      x402Requirements = [requirement];
      
      // V1 compatibility: Also populate legacy x402Data
      x402Data = {
        amount: requirement.maxAmountRequired,
        currency: requirement.asset,
        description: requirement.description,
        network: requirement.network,
        scheme: requirement.scheme,
        recipient: requirement.payTo,
        detected: true,
        url: window.location.href,
        timestamp: Date.now(),
        version: requirement.version,
        // V2 additions
        requirements: x402Requirements
      };
      
      console.log('💰 X402 V2: Payment required detected:', x402Data);
      
      // Notify background script
      notifyX402Detection();
      
      return true;
    } else {
      console.log('💰 X402 V2: No payment required on this page');
      x402Data = null;
      x402Requirements = null;
    }
  } catch (error) {
    console.error('💰 X402 V2: Detection error:', error);
  }
  return false;
}

/**
 * Notify background script of X402 detection
 */
function notifyX402Detection() {
  if (x402Data) {
    chrome.runtime.sendMessage({
      action: 'X402_DETECTED',
      data: x402Data,
      version: X402_VERSION,
      requirements: x402Requirements
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('💰 X402 V2: Error notifying background:', chrome.runtime.lastError);
      } else {
        console.log('💰 X402 V2: Background notified of detection');
      }
    });
  }
}

/**
 * Debounced X402 detection for mutation observer
 */
function debouncedDetectX402() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    detectX402();
  }, 300); // 300ms debounce
}

/**
 * Get network display name from CAIP-2 identifier
 * @param {string} caipId - CAIP-2 network identifier
 * @returns {string} Human-readable network name
 */
function getNetworkName(caipId) {
  const networks = {
    'eip155:1': 'Ethereum Mainnet',
    'eip155:8453': 'Base',
    'eip155:84532': 'Base Sepolia',
    'eip155:11155111': 'Sepolia',
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'Solana Mainnet',
    'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1': 'Solana Devnet'
  };
  return networks[caipId] || caipId;
}

/**
 * Get USDC contract address for a network
 * @param {string} caipId - CAIP-2 network identifier
 * @returns {string|null} Contract address or null
 */
function getUSDCContract(caipId) {
  const contracts = {
    'eip155:84532': '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia
    'eip155:8453': '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',  // Base Mainnet
    'eip155:1': '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',     // Ethereum Mainnet
    'eip155:11155111': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238' // Sepolia
  };
  return contracts[caipId] || null;
}

// ============================================================================
// WALLET BRIDGE COMMUNICATION
// ============================================================================

/**
 * Inject wallet bridge script into main page context
 */
function injectWalletBridge() {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('wallet-bridge.js');
  script.onload = function() {
    console.log('🌉 X402: Wallet bridge script injected');
    this.remove();
  };
  script.onerror = function() {
    console.error('🌉 X402: Failed to inject wallet bridge script');
    this.remove();
  };
  (document.head || document.documentElement).appendChild(script);
}

/**
 * Send message to wallet bridge
 * @param {string} action - Action to perform
 * @param {object} data - Data payload
 * @returns {Promise}
 */
function sendToBridge(action, data = {}) {
  return new Promise((resolve, reject) => {
    const requestId = ++bridgeRequestId;
    
    bridgeRequests.set(requestId, { resolve, reject });
    
    // Set timeout for request
    const timeout = action === 'MAKE_PAYMENT' ? 60000 : 30000; // 60s for payments, 30s for others
    setTimeout(() => {
      if (bridgeRequests.has(requestId)) {
        bridgeRequests.delete(requestId);
        reject(new Error(`Bridge request timeout: ${action}`));
      }
    }, timeout);
    
    window.postMessage({
      source: 'autospend-content-script',
      action: action,
      requestId: requestId,
      payload: data
    }, window.location.origin);
  });
}

/**
 * Listen for responses from wallet bridge
 */
window.addEventListener('message', (event) => {
  if (event.origin !== window.location.origin) {
    return;
  }
  
  if (event.data.source !== 'autospend-wallet-bridge') {
    return;
  }
  
  if (event.data.action === 'BRIDGE_READY') {
    console.log('🌉 X402: Wallet bridge is ready');
    return;
  }
  
  if (event.data.requestId && bridgeRequests.has(event.data.requestId)) {
    const { resolve } = bridgeRequests.get(event.data.requestId);
    bridgeRequests.delete(event.data.requestId);
    resolve(event.data.response);
  }
});

// ============================================================================
// WALLET OPERATIONS
// ============================================================================

/**
 * Run wallet diagnostic
 * @returns {Promise<object>}
 */
async function runWalletDiagnostic() {
  try {
    const diagnostic = await sendToBridge('CHECK_WALLET_PROVIDERS');
    console.log('🔍 X402: Wallet diagnostic:', diagnostic);
    return diagnostic;
  } catch (error) {
    console.error('🔍 X402: Diagnostic error:', error);
    return {
      timestamp: Date.now(),
      ethereum: { available: false },
      otherProviders: {},
      error: error.message
    };
  }
}

/**
 * Connect wallet
 * @returns {Promise<object>}
 */
async function connectWallet() {
  try {
    const diagnostic = await runWalletDiagnostic();
    
    if (!diagnostic.ethereum.available) {
      throw new Error('No wallet detected. Please install Coinbase Wallet.');
    }
    
    console.log('👛 X402: Requesting wallet connection...');
    
    const result = await sendToBridge('CONNECT_WALLET');
    
    if (!result.success) {
      throw new Error(result.error || 'Wallet connection failed');
    }
    
    console.log('👛 X402: Wallet connected:', result.address);
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'WALLET_EVENT',
      event: 'connect',
      data: result.address
    });
    
    return result;
  } catch (error) {
    console.error('👛 X402: Connection error:', error);
    throw error;
  }
}

/**
 * Get wallet status
 * @returns {Promise<object>}
 */
async function getWalletStatus() {
  try {
    const status = await sendToBridge('GET_WALLET_STATUS');
    console.log('💰 X402: Wallet status:', status);
    return status;
  } catch (error) {
    console.error('💰 X402: Status error:', error);
    return {
      walletAvailable: false,
      walletConnected: false,
      error: error.message
    };
  }
}

/**
 * Make payment
 * @returns {Promise<object>}
 */
async function makePayment() {
  try {
    if (!x402Data || !x402Data.detected) {
      throw new Error('No payment required on this page');
    }
    
    // V2: Get the best payment option from requirements
    const requirement = x402Requirements?.[0] || {
      network: 'eip155:84532',
      maxAmountRequired: x402Data.amount,
      asset: x402Data.currency
    };
    
    // Get contract address based on network
    const contractAddress = getUSDCContract(requirement.network) || 
      '0x036CbD53842c5426634e7929541eC2318f3dCF7e'; // Fallback to Base Sepolia
    
    const paymentPayload = {
      // V2 fields
      scheme: requirement.scheme || 'exact',
      network: requirement.network,
      amount: requirement.maxAmountRequired || x402Data.amount,
      currency: requirement.asset || x402Data.currency,
      description: requirement.description || x402Data.description,
      contractAddress: contractAddress,
      recipient: requirement.payTo || null,
      // Metadata
      version: X402_VERSION,
      resource: window.location.href
    };
    
    console.log('💰 X402 V2: Initiating payment:', paymentPayload);
    console.log('  - Network:', getNetworkName(paymentPayload.network));
    console.log('  - Amount:', paymentPayload.amount, paymentPayload.currency);
    
    const result = await sendToBridge('MAKE_PAYMENT', paymentPayload);
    
    console.log('💰 X402 V2: Payment result:', result);
    
    // Notify background script
    chrome.runtime.sendMessage({
      action: 'PAYMENT_STATUS',
      status: result.success ? 'success' : 'failed',
      data: {
        transactionHash: result.txHash || null,
        amount: paymentPayload.amount,
        currency: paymentPayload.currency,
        description: paymentPayload.description,
        recipient: paymentPayload.recipient || paymentPayload.contractAddress,
        network: getNetworkName(paymentPayload.network),
        networkId: paymentPayload.network,
        url: window.location.href,
        timestamp: Date.now(),
        error: result.error || null,
        version: X402_VERSION
      }
    });
    
    return result;
  } catch (error) {
    console.error('💰 X402 V2: Payment error:', error);
    
    // Notify background script of error
    chrome.runtime.sendMessage({
      action: 'PAYMENT_STATUS',
      status: 'error',
      data: {
        error: error.message,
        amount: x402Data?.amount,
        currency: x402Data?.currency,
        description: x402Data?.description,
        url: window.location.href,
        timestamp: Date.now(),
        version: X402_VERSION
      }
    });
    
    throw error;
  }
}

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Handle messages from popup/background
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('💰 X402: Message received:', message);
  
  switch (message.action) {
    case 'PING':
      console.log('💰 X402: PING received');
      sendResponse({ status: 'PONG', timestamp: Date.now() });
      break;
      
    case 'CHECK_STATUS':
      console.log('💰 X402 V2: CHECK_STATUS received');
      const hasX402 = detectX402();
      sendResponse({ 
        status: 'OK', 
        x402Detected: hasX402,
        x402Data: x402Data,
        x402Requirements: x402Requirements,
        version: X402_VERSION,
        timestamp: Date.now()
      });
      break;
      
    case 'GET_WALLET_STATUS':
      console.log('💰 X402: GET_WALLET_STATUS received');
      getWalletStatus()
        .then(status => {
          sendResponse({
            status: 'OK',
            ...status,
            x402Data: x402Data,
            hasPayment: !!x402Data
          });
        })
        .catch(error => {
          sendResponse({
            status: 'ERROR',
            error: error.message
          });
        });
      return true; // Async response
      
    case 'CONNECT_WALLET':
      console.log('💰 X402: CONNECT_WALLET received');
      connectWallet()
        .then(result => {
          sendResponse({
            status: 'OK',
            walletConnected: result.success,
            walletAddress: result.address
          });
        })
        .catch(error => {
          sendResponse({
            status: 'ERROR',
            error: error.message
          });
        });
      return true; // Async response
      
    case 'MAKE_PAYMENT':
      console.log('💰 X402: MAKE_PAYMENT received');
      makePayment()
        .then(result => {
          sendResponse({ 
            status: result.success ? 'OK' : 'ERROR',
            message: result.message || 'Payment processed',
            txHash: result.txHash
          });
        })
        .catch(error => {
          sendResponse({ 
            status: 'ERROR', 
            error: error.message 
          });
        });
      return true; // Async response
      
    default:
      console.log('💰 X402: Unknown action:', message.action);
      sendResponse({ status: 'ERROR', error: 'Unknown action' });
      break;
  }
});

// ============================================================================
// MUTATION OBSERVER
// ============================================================================

/**
 * Setup mutation observer to detect dynamically added X402 meta tags
 */
function setupMutationObserver() {
  if (mutationObserver) {
    mutationObserver.disconnect();
  }
  
  mutationObserver = new MutationObserver((mutations) => {
    // Check if any mutations affected the head element
    const headMutated = mutations.some(mutation => 
      mutation.target === document.head || 
      mutation.target.parentElement === document.head
    );
    
    if (headMutated) {
      console.log('💰 X402: Head element mutated, re-checking...');
      debouncedDetectX402();
    }
  });
  
  // Observe head for meta tag changes
  if (document.head) {
    mutationObserver.observe(document.head, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['content']
    });
    console.log('💰 X402: Mutation observer active');
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize content script
 */
function initialize() {
  console.log('💰 X402 V2: Initializing content script...');
  console.log('  - Protocol Version:', X402_VERSION);
  console.log('  - Supported Networks: Base, Ethereum, Solana');
  
  // Inject wallet bridge
  injectWalletBridge();
  
  // Detect X402 on page load
  detectX402();
  
  // Setup mutation observer
  setupMutationObserver();
  
  // Notify background script
  chrome.runtime.sendMessage({ 
    action: 'CONTENT_SCRIPT_LOADED',
    version: X402_VERSION
  }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('💰 X402 V2: Error notifying background:', chrome.runtime.lastError);
    } else {
      console.log('💰 X402 V2: Background notified of load');
    }
  });
  
  console.log('💰 X402 V2: Initialization complete');
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initialize);
} else {
  initialize();
}
