// popup-test.js - External JavaScript for test popup to comply with CSP

console.log('🧪 TEST POPUP: Loading...');

const statusDiv = document.getElementById('status');

function updateStatus(message, isError = false) {
  statusDiv.textContent = message;
  statusDiv.className = isError ? 'error' : 'success';
  console.log('🧪 TEST POPUP:', message);
}

// Test content script messaging
document.getElementById('testPing').addEventListener('click', async () => {
  updateStatus('Testing content script...');
  
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
      updateStatus('No active tab found', true);
      return;
    }
    
    chrome.tabs.sendMessage(tabs[0].id, { action: 'PING' }, (response) => {
      if (chrome.runtime.lastError) {
        updateStatus(`Content script error: ${chrome.runtime.lastError.message}`, true);
      } else if (response) {
        updateStatus(`Content script responded: ${response.status}`);
      } else {
        updateStatus('Content script: No response', true);
      }
    });
  } catch (error) {
    updateStatus(`Error: ${error.message}`, true);
  }
});

// Test background script messaging
document.getElementById('testBackground').addEventListener('click', () => {
  updateStatus('Testing background script...');
  
  chrome.runtime.sendMessage({ action: 'PING' }, (response) => {
    if (chrome.runtime.lastError) {
      updateStatus(`Background error: ${chrome.runtime.lastError.message}`, true);
    } else if (response) {
      updateStatus(`Background responded: ${response.status}`);
    } else {
      updateStatus('Background: No response', true);
    }
  });
});

console.log('🧪 TEST POPUP: Ready');
