// test-messaging-popup.js - JavaScript for messaging unit test popup

document.addEventListener('DOMContentLoaded', () => {
  console.log('🧪 TEST POPUP: Loading...');
  
  // Get elements
  const testBasicBtn = document.getElementById('test-basic');
  const testSyncBtn = document.getElementById('test-sync');
  const testAsyncBtn = document.getElementById('test-async');
  const testPromiseBtn = document.getElementById('test-promise');
  const testAsyncMixedBtn = document.getElementById('test-async-mixed');
  const testBackgroundBtn = document.getElementById('test-background');
  
  const basicResult = document.getElementById('basic-result');
  const asyncResult = document.getElementById('async-result');
  const backgroundResult = document.getElementById('background-result');
  const overallResult = document.getElementById('overall-result');
  
  let testResults = {};
  
  // Helper function to show result
  function showResult(element, success, message, data = null) {
    element.style.display = 'block';
    element.className = `result ${success ? 'success' : 'error'}`;
    element.textContent = message;
    if (data) {
      element.textContent += ` | Data: ${JSON.stringify(data)}`;
    }
    updateOverallResult();
  }
  
  // Helper function to update overall results
  function updateOverallResult() {
    const total = Object.keys(testResults).length;
    const passed = Object.values(testResults).filter(r => r).length;
    const failed = total - passed;
    
    if (total === 0) {
      overallResult.textContent = 'Click buttons above to test messaging functionality';
      overallResult.className = 'result info';
    } else {
      overallResult.textContent = `Tests: ${total} | Passed: ${passed} | Failed: ${failed}`;
      overallResult.className = `result ${failed === 0 ? 'success' : 'error'}`;
    }
  }
  
  // Helper function to send message to content script
  async function sendToContentScript(action) {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length === 0) {
          reject(new Error('No active tab'));
          return;
        }
        
        const timeoutId = setTimeout(() => {
          reject(new Error('Message timeout'));
        }, 5000);
        
        chrome.tabs.sendMessage(tabs[0].id, { action }, (response) => {
          clearTimeout(timeoutId);
          
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });
    });
  }
  
  // Helper function to send message to background script
  async function sendToBackground(action) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Background message timeout'));
      }, 5000);
      
      chrome.runtime.sendMessage({ action }, (response) => {
        clearTimeout(timeoutId);
        
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }
  
  // Test basic messaging
  testBasicBtn.addEventListener('click', async () => {
    testBasicBtn.disabled = true;
    try {
      const response = await sendToContentScript('TEST_BASIC');
      testResults['basic'] = true;
      showResult(basicResult, true, 'Basic messaging works!', response);
    } catch (error) {
      testResults['basic'] = false;
      showResult(basicResult, false, `Basic messaging failed: ${error.message}`);
    } finally {
      testBasicBtn.disabled = false;
    }
  });
  
  // Test sync messaging
  testSyncBtn.addEventListener('click', async () => {
    testSyncBtn.disabled = true;
    try {
      const response = await sendToContentScript('TEST_SYNC');
      testResults['sync'] = true;
      showResult(basicResult, true, 'Sync messaging works!', response);
    } catch (error) {
      testResults['sync'] = false;
      showResult(basicResult, false, `Sync messaging failed: ${error.message}`);
    } finally {
      testSyncBtn.disabled = false;
    }
  });
  
  // Test async messaging
  testAsyncBtn.addEventListener('click', async () => {
    testAsyncBtn.disabled = true;
    try {
      const response = await sendToContentScript('TEST_ASYNC');
      testResults['async'] = true;
      showResult(asyncResult, true, 'Async messaging works!', response);
    } catch (error) {
      testResults['async'] = false;
      showResult(asyncResult, false, `Async messaging failed: ${error.message}`);
    } finally {
      testAsyncBtn.disabled = false;
    }
  });
  
  // Test promise messaging
  testPromiseBtn.addEventListener('click', async () => {
    testPromiseBtn.disabled = true;
    try {
      const response = await sendToContentScript('TEST_PROMISE');
      testResults['promise'] = true;
      showResult(asyncResult, true, 'Promise messaging works!', response);
    } catch (error) {
      testResults['promise'] = false;
      showResult(asyncResult, false, `Promise messaging failed: ${error.message}`);
    } finally {
      testPromiseBtn.disabled = false;
    }
  });
  
  // Test async mixed messaging
  testAsyncMixedBtn.addEventListener('click', async () => {
    testAsyncMixedBtn.disabled = true;
    try {
      const response = await sendToContentScript('TEST_ASYNC_MIXED');
      testResults['async_mixed'] = true;
      showResult(asyncResult, true, 'Async mixed messaging works!', response);
    } catch (error) {
      testResults['async_mixed'] = false;
      showResult(asyncResult, false, `Async mixed messaging failed: ${error.message}`);
    } finally {
      testAsyncMixedBtn.disabled = false;
    }
  });
  
  // Test background messaging
  testBackgroundBtn.addEventListener('click', async () => {
    testBackgroundBtn.disabled = true;
    try {
      const response = await sendToBackground('PING');
      testResults['background'] = true;
      showResult(backgroundResult, true, 'Background messaging works!', response);
    } catch (error) {
      testResults['background'] = false;
      showResult(backgroundResult, false, `Background messaging failed: ${error.message}`);
    } finally {
      testBackgroundBtn.disabled = false;
    }
  });
  
  console.log('🧪 TEST POPUP: Setup complete');
});
