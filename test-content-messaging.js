// test-content-messaging.js - Unit test for content script messaging
// Tests message handling with and without async functions

console.log('🧪 TEST: Content script messaging unit test loading...');

// Test 1: Basic message listener (should work)
function testBasicMessaging() {
  console.log('🧪 TEST: Setting up basic message listener...');
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('🧪 TEST: Basic listener received message:', message);
    
    switch (message.action) {
      case 'TEST_BASIC':
        console.log('🧪 TEST: TEST_BASIC received');
        sendResponse({ status: 'OK', test: 'basic', timestamp: Date.now() });
        break;
        
      default:
        console.log('🧪 TEST: Unknown action in basic test:', message.action);
        sendResponse({ error: 'Unknown action' });
        break;
    }
  });
  
  console.log('🧪 TEST: Basic message listener setup complete');
}

// Test 2: Async message listener (might break)
function testAsyncMessaging() {
  console.log('🧪 TEST: Setting up async message listener...');
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('🧪 TEST: Async listener received message:', message);
    
    switch (message.action) {
      case 'TEST_ASYNC':
        console.log('🧪 TEST: TEST_ASYNC received');
        // Simulate async operation
        setTimeout(() => {
          sendResponse({ status: 'OK', test: 'async', timestamp: Date.now() });
        }, 100);
        return true; // Keep message channel open
        
      case 'TEST_PROMISE':
        console.log('🧪 TEST: TEST_PROMISE received');
        // Test promise-based async
        Promise.resolve().then(() => {
          sendResponse({ status: 'OK', test: 'promise', timestamp: Date.now() });
        });
        return true; // Keep message channel open
        
      default:
        console.log('🧪 TEST: Unknown action in async test:', message.action);
        sendResponse({ error: 'Unknown action' });
        break;
    }
  });
  
  console.log('🧪 TEST: Async message listener setup complete');
}

// Test 3: Mixed sync/async message listener (current approach)
function testMixedMessaging() {
  console.log('🧪 TEST: Setting up mixed message listener...');
  
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('🧪 TEST: Mixed listener received message:', message);
    
    try {
      switch (message.action) {
        case 'TEST_BASIC':
          console.log('🧪 TEST: TEST_BASIC received');
          sendResponse({ status: 'OK', test: 'basic', timestamp: Date.now() });
          break;
          
        case 'TEST_SYNC':
          console.log('🧪 TEST: TEST_SYNC received');
          sendResponse({ status: 'OK', test: 'sync', timestamp: Date.now() });
          break;
          
        case 'TEST_ASYNC':
          console.log('🧪 TEST: TEST_ASYNC received');
          // Simulate async operation with setTimeout
          setTimeout(() => {
            sendResponse({ status: 'OK', test: 'async', timestamp: Date.now() });
          }, 100);
          return true; // Keep message channel open
          
        case 'TEST_PROMISE':
          console.log('🧪 TEST: TEST_PROMISE received');
          // Test promise-based async
          Promise.resolve().then(() => {
            sendResponse({ status: 'OK', test: 'promise', timestamp: Date.now() });
          });
          return true; // Keep message channel open
          
        case 'TEST_ASYNC_MIXED':
          console.log('🧪 TEST: TEST_ASYNC_MIXED received');
          testAsyncFunction().then(result => {
            sendResponse(result);
          }).catch(error => {
            sendResponse({ error: error.message });
          });
          return true; // Keep message channel open
          
        default:
          console.log('🧪 TEST: Unknown action in mixed test:', message.action);
          sendResponse({ error: 'Unknown action' });
          break;
      }
    } catch (error) {
      console.error('🧪 TEST: Error in mixed message handler:', error);
      sendResponse({ error: error.message });
    }
  });
  
  console.log('🧪 TEST: Mixed message listener setup complete');
}

// Mock async function for testing
async function testAsyncFunction() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 'OK', test: 'async_function', timestamp: Date.now() });
    }, 50);
  });
}

// Initialize test with comprehensive mixed messaging (handles all cases)
function initializeTest() {
  console.log('🧪 TEST: Initializing comprehensive mixed messaging test');
  testMixedMessaging();
}

// Notify background script that test content script has loaded
try {
  chrome.runtime.sendMessage({ action: 'CONTENT_SCRIPT_LOADED' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error('🧪 TEST: Error notifying background script:', chrome.runtime.lastError.message);
    } else {
      console.log('🧪 TEST: Successfully notified background script');
    }
  });
} catch (error) {
  console.error('🧪 TEST: Failed to send CONTENT_SCRIPT_LOADED message:', error);
}

// Initialize the test
initializeTest();

console.log('🧪 TEST: Content script messaging unit test setup complete');
