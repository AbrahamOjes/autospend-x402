// content-script-test.js - Minimal test content script to debug messaging issues

console.log('🧪 TEST: Content script loading...');

// Simple message listener for testing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🧪 TEST: Received message:', message);
  
  if (message.action === 'PING') {
    console.log('🧪 TEST: Responding to PING');
    sendResponse({ status: 'PONG', timestamp: Date.now() });
    return true;
  }
  
  sendResponse({ status: 'ERROR', error: 'Unknown action' });
  return true;
});

// Notify background that content script loaded
try {
  chrome.runtime.sendMessage({ action: 'CONTENT_SCRIPT_TEST_LOADED' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('🧪 TEST: Error notifying background:', chrome.runtime.lastError.message);
    } else {
      console.log('🧪 TEST: Successfully notified background script');
    }
  });
} catch (error) {
  console.error('🧪 TEST: Failed to send message to background:', error);
}

console.log('🧪 TEST: Content script setup complete');
