// popup-connection-handler.js - Connection management for X402 popup
// Handles robust messaging with fallback mechanisms

class PopupConnectionHandler {
  constructor() {
    this.connected = false;
    this.activeTabId = null;
    this.connectionTimeout = 5000; // 5 seconds timeout
    this.listeners = {};
  }
  
  // Initialize connection to background script and content script
  async init() {
    try {
      // Ping background script to check connection
      const pingResponse = await this.sendMessageToBackground({ action: 'PING' });
      
      if (pingResponse && pingResponse.status === 'OK') {
        console.log('🔌 Connected to background script');
        this.connected = true;
        
        // Get active tab
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length > 0) {
          this.activeTabId = tabs[0].id;
          console.log('🔌 Active tab ID:', this.activeTabId);
        }
      } else {
        console.error('🔌 Failed to connect to background script');
      }
    } catch (error) {
      console.error('🔌 Error initializing connection:', error);
    }
    
    return this.connected;
  }
  
  // Send message to background script
  async sendMessageToBackground(message) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Ping timed out'));
      }, this.connectionTimeout);
      
      chrome.runtime.sendMessage(message, (response) => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
  
  // Send message to content script
  async sendMessageToContent(message) {
    if (!this.activeTabId) {
      throw new Error('No active tab');
    }
    
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Content script message timed out'));
      }, this.connectionTimeout);
      
      chrome.tabs.sendMessage(this.activeTabId, message, (response) => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
  
  // Get extension state from background
  async getState() {
    try {
      const response = await this.sendMessageToBackground({ action: 'GET_STATE' });
      return response.state;
    } catch (error) {
      console.error('🔌 Error getting state:', error);
      return null;
    }
  }
  
  // Check status of current page
  async checkStatus() {
    try {
      // Try to get status from content script
      const response = await this.sendMessageToContent({ action: 'CHECK_STATUS' });
      return response;
    } catch (error) {
      console.error('🔌 Error checking status:', error);
      
      // Fallback to background state
      try {
        const state = await this.getState();
        return {
          status: 'OK',
          x402Detected: state.x402Detected,
          x402Data: state.x402Data,
          walletConnected: state.walletConnected,
          walletAddress: state.walletAddress
        };
      } catch (fallbackError) {
        console.error('🔌 Fallback error:', fallbackError);
        return {
          status: 'ERROR',
          error: 'Could not connect to page'
        };
      }
    }
  }
  
  // Connect wallet
  async connectWallet() {
    try {
      const response = await this.sendMessageToContent({ action: 'CONNECT_WALLET' });
      return response;
    } catch (error) {
      console.error('🔌 Error connecting wallet:', error);
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  // Get wallet status
  async getWalletStatus() {
    try {
      const response = await this.sendMessageToContent({ action: 'GET_WALLET_STATUS' });
      return response;
    } catch (error) {
      console.error('🔌 Error getting wallet status:', error);
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  // Make payment
  async makePayment() {
    try {
      const response = await this.sendMessageToContent({ action: 'MAKE_PAYMENT' });
      return response;
    } catch (error) {
      console.error('🔌 Error making payment:', error);
      return {
        status: 'ERROR',
        error: error.message
      };
    }
  }
  
  // Get transaction history
  async getTransactions() {
    try {
      return new Promise((resolve, reject) => {
        chrome.storage.local.get('transactions', (result) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(result.transactions || []);
          }
        });
      });
    } catch (error) {
      console.error('🔌 Error getting transactions:', error);
      return [];
    }
  }
  
  // Add event listener
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  // Trigger event
  trigger(event, data) {
    if (this.listeners[event]) {
      for (const callback of this.listeners[event]) {
        callback(data);
      }
    }
  }
}

// Create global instance
window.connectionHandler = new PopupConnectionHandler();
