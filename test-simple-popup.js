// test-simple-popup.js - JavaScript for simple content script test popup

document.addEventListener('DOMContentLoaded', () => {
  console.log('🔥 SIMPLE POPUP: Loading...');
  
  const testContentBtn = document.getElementById('test-content');
  const testBackgroundBtn = document.getElementById('test-background');
  const result = document.getElementById('result');
  
  // Helper function to show result
  function showResult(success, message) {
    result.style.display = 'block';
    result.className = `result ${success ? 'success' : 'error'}`;
    result.textContent = message;
  }
  
  // Test content script
  testContentBtn.addEventListener('click', async () => {
    testContentBtn.disabled = true;
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          showResult(false, 'No active tab found');
          testContentBtn.disabled = false;
          return;
        }
        
        const timeoutId = setTimeout(() => {
          showResult(false, 'Content script test timeout');
          testContentBtn.disabled = false;
        }, 5000);
        
        chrome.tabs.sendMessage(tabs[0].id, { action: 'TEST_SIMPLE' }, (response) => {
          clearTimeout(timeoutId);
          testContentBtn.disabled = false;
          
          if (chrome.runtime.lastError) {
            showResult(false, `Content script failed: ${chrome.runtime.lastError.message}`);
          } else {
            showResult(true, `Content script works! Data: ${JSON.stringify(response)}`);
          }
        });
      });
    } catch (error) {
      testContentBtn.disabled = false;
      showResult(false, `Content script error: ${error.message}`);
    }
  });
  
  // Test background script
  testBackgroundBtn.addEventListener('click', async () => {
    testBackgroundBtn.disabled = true;
    try {
      const timeoutId = setTimeout(() => {
        showResult(false, 'Background script test timeout');
        testBackgroundBtn.disabled = false;
      }, 5000);
      
      chrome.runtime.sendMessage({ action: 'PING' }, (response) => {
        clearTimeout(timeoutId);
        testBackgroundBtn.disabled = false;
        
        if (chrome.runtime.lastError) {
          showResult(false, `Background script failed: ${chrome.runtime.lastError.message}`);
        } else {
          showResult(true, `Background script works! Data: ${JSON.stringify(response)}`);
        }
      });
    } catch (error) {
      testBackgroundBtn.disabled = false;
      showResult(false, `Background script error: ${error.message}`);
    }
  });
  
  console.log('🔥 SIMPLE POPUP: Setup complete');
});
