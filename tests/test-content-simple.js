// test-content-simple.js - Ultra-simple content script to test injection

console.log('🔥 SIMPLE TEST: Content script is loading...');

// Add a visible indicator to the page
const indicator = document.createElement('div');
indicator.id = 'content-script-indicator';
indicator.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: red;
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 10000;
  font-family: Arial, sans-serif;
  font-size: 12px;
`;
indicator.textContent = '🔥 CONTENT SCRIPT LOADED';

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.body.appendChild(indicator);
  });
} else {
  document.body.appendChild(indicator);
}

// Simple message listener
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('🔥 SIMPLE TEST: Message received:', message);
  
  if (message.action === 'TEST_SIMPLE') {
    console.log('🔥 SIMPLE TEST: Responding to TEST_SIMPLE');
    sendResponse({ status: 'OK', test: 'simple', timestamp: Date.now() });
  } else {
    console.log('🔥 SIMPLE TEST: Unknown action:', message.action);
    sendResponse({ error: 'Unknown action' });
  }
});

// Notify background script
try {
  chrome.runtime.sendMessage({ action: 'CONTENT_SCRIPT_LOADED' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('🔥 SIMPLE TEST: Error notifying background:', chrome.runtime.lastError.message);
    } else {
      console.log('🔥 SIMPLE TEST: Successfully notified background');
    }
  });
} catch (error) {
  console.error('🔥 SIMPLE TEST: Failed to send message:', error);
}

console.log('🔥 SIMPLE TEST: Content script setup complete');
