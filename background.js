// background.js - Service Worker for X402 Payment Extension
// Handles extension lifecycle, state management, and messaging

// Extension state
const state = {
  walletConnected: false,
  walletAddress: null,
  x402Detected: false,
  x402Data: null,
  activeTabId: null,
  paymentStatus: null
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('🎯 X402 Payment Extension installed');
  
  // Initialize storage
  chrome.storage.local.set({
    transactions: [],
    walletStatus: {
      connected: false,
      address: null,
      balance: null,
      network: null
    }
  });
  
  // Set default badge
  updateBadge();
});

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🎯 Background received message:', message);
  
  switch (message.action) {
    case 'PING':
      // Health check from popup
      sendResponse({ status: 'OK', timestamp: Date.now() });
      return true;
      
    case 'WALLET_EVENT':
      // Wallet connection events
      handleWalletEvent(message, sender.tab?.id);
      sendResponse({ status: 'OK' });
      return true;
      
    case 'X402_DETECTED':
      // X402 protocol detection
      handleX402Detection(message.data, sender.tab?.id);
      sendResponse({ status: 'OK' });
      return true;
      
    case 'PAYMENT_STATUS':
      // Payment progress tracking
      handlePaymentStatus(message.status, message.data, sender.tab?.id);
      sendResponse({ status: 'OK' });
      return true;
      
    case 'CONTENT_SCRIPT_LOADED':
      // Content script initialization
      console.log('🎯 Content script loaded in tab:', sender.tab?.id);
      state.activeTabId = sender.tab?.id;
      sendResponse({ status: 'OK' });
      return true;
      
    case 'GET_STATE':
      // Return current state to popup
      sendResponse({ 
        status: 'OK', 
        state: {
          walletConnected: state.walletConnected,
          walletAddress: state.walletAddress,
          x402Detected: state.x402Detected,
          x402Data: state.x402Data,
          paymentStatus: state.paymentStatus
        }
      });
      return true;
  }
});

// Handle wallet connection events
function handleWalletEvent(message, tabId) {
  console.log('🎯 Wallet event:', message.event, message.data);
  
  switch (message.event) {
    case 'connect':
      state.walletConnected = true;
      state.walletAddress = message.data;
      
      // Update storage
      chrome.storage.local.get('walletStatus', (result) => {
        const walletStatus = result.walletStatus || {};
        chrome.storage.local.set({
          walletStatus: {
            ...walletStatus,
            connected: true,
            address: message.data
          }
        });
      });
      break;
      
    case 'disconnect':
      state.walletConnected = false;
      state.walletAddress = null;
      
      // Update storage
      chrome.storage.local.get('walletStatus', (result) => {
        const walletStatus = result.walletStatus || {};
        chrome.storage.local.set({
          walletStatus: {
            ...walletStatus,
            connected: false,
            address: null
          }
        });
      });
      break;
      
    case 'balance':
      // Update balance in storage
      chrome.storage.local.get('walletStatus', (result) => {
        const walletStatus = result.walletStatus || {};
        chrome.storage.local.set({
          walletStatus: {
            ...walletStatus,
            balance: message.data
          }
        });
      });
      break;
      
    case 'network':
      // Update network in storage
      chrome.storage.local.get('walletStatus', (result) => {
        const walletStatus = result.walletStatus || {};
        chrome.storage.local.set({
          walletStatus: {
            ...walletStatus,
            network: message.data
          }
        });
      });
      break;
  }
  
  // Update badge based on new state
  updateBadge(tabId);
}

// Handle X402 protocol detection
function handleX402Detection(x402Data, tabId) {
  console.log('🎯 X402 detected:', x402Data);
  
  state.x402Detected = true;
  state.x402Data = x402Data;
  
  // Update badge
  updateBadge(tabId);
}

// Handle payment status updates
function handlePaymentStatus(status, data, tabId) {
  console.log('🎯 Payment status:', status, data);
  
  state.paymentStatus = {
    status,
    data,
    timestamp: Date.now()
  };
  
  if (status === 'success') {
    // Store transaction in history
    chrome.storage.local.get('transactions', (result) => {
      const transactions = result.transactions || [];
      transactions.unshift({
        ...data,
        timestamp: Date.now()
      });
      
      // Keep only last 10 transactions
      const limitedTransactions = transactions.slice(0, 10);
      
      chrome.storage.local.set({ transactions: limitedTransactions });
    });
    
    // Show notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Payment Successful',
      message: `Paid ${data.amount} ${data.currency} for ${data.description || 'content'}`
    });
  }
  
  // Update badge
  updateBadge(tabId);
}

// Update extension badge based on current state
function updateBadge(tabId = null) {
  const targetTabId = tabId || state.activeTabId;
  if (!targetTabId) return;
  
  if (state.x402Detected) {
    // X402 detected
    if (state.walletConnected) {
      // Wallet connected - green
      chrome.action.setBadgeBackgroundColor({ color: '#00C853', tabId: targetTabId });
    } else {
      // Wallet not connected - yellow
      chrome.action.setBadgeBackgroundColor({ color: '#FFD600', tabId: targetTabId });
    }
    chrome.action.setBadgeText({ text: 'X402', tabId: targetTabId });
  } else if (state.walletConnected) {
    // Wallet connected but no X402 - blue
    chrome.action.setBadgeBackgroundColor({ color: '#0052FF', tabId: targetTabId });
    chrome.action.setBadgeText({ text: '', tabId: targetTabId });
  } else {
    // Nothing detected - clear badge
    chrome.action.setBadgeText({ text: '', tabId: targetTabId });
  }
}

// Listen for tab changes to update active tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  state.activeTabId = activeInfo.tabId;
  
  // Reset X402 detection state for new tab
  state.x402Detected = false;
  state.x402Data = null;
  
  // Update badge for new tab
  updateBadge(activeInfo.tabId);
});

console.log('🎯 X402 Payment Extension background service worker initialized');
