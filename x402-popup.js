// x402-popup.js - Popup logic for X402 Payment Extension
// Handles wallet connection, payment, and status display

document.addEventListener('DOMContentLoaded', async () => {
  // Elements
  const connectionDot = document.getElementById('connection-dot');
  const connectionStatus = document.getElementById('connection-status');
  const refreshStatusButton = document.getElementById('refresh-status');
  
  const walletSection = document.getElementById('wallet-section');
  const walletNotConnected = document.getElementById('wallet-not-connected');
  const walletConnected = document.getElementById('wallet-connected');
  const walletAddress = document.getElementById('wallet-address');
  const walletBalance = document.getElementById('wallet-balance');
  const walletNetwork = document.getElementById('wallet-network');
  const walletError = document.getElementById('wallet-error');
  const connectWalletButton = document.getElementById('connect-wallet');
  
  const x402Section = document.getElementById('x402-section');
  const noX402Section = document.getElementById('no-x402-section');
  const paymentAmount = document.getElementById('payment-amount');
  const paymentDescription = document.getElementById('payment-description');
  const paymentCurrency = document.getElementById('payment-currency');
  const makePaymentButton = document.getElementById('make-payment');
  const paymentError = document.getElementById('payment-error');
  
  const transactionsList = document.getElementById('transactions-list');
  
  // Initialize connection handler
  try {
    await window.connectionHandler.init();
    updateConnectionStatus(true);
  } catch (error) {
    console.error('🔌 Connection initialization error:', error);
    updateConnectionStatus(false, error.message);
  }
  
  // Initial status check
  await checkStatus();
  
  // Load transaction history
  await loadTransactions();
  
  // Event listeners
  refreshStatusButton.addEventListener('click', async () => {
    await checkStatus();
  });
  
  connectWalletButton.addEventListener('click', async () => {
    try {
      updateConnectionStatus(true, 'Connecting wallet...');
      connectWalletButton.disabled = true;
      
      const response = await window.connectionHandler.connectWallet();
      
      if (response.status === 'OK') {
        await checkStatus();
      } else {
        showWalletError(response.error || 'Failed to connect wallet');
      }
    } catch (error) {
      showWalletError(error.message);
    } finally {
      connectWalletButton.disabled = false;
    }
  });
  
  makePaymentButton.addEventListener('click', async () => {
    try {
      updateConnectionStatus(true, 'Processing payment...');
      makePaymentButton.disabled = true;
      paymentError.classList.add('hidden');
      
      const response = await window.connectionHandler.makePayment();
      
      if (response.status === 'OK') {
        showPaymentSuccess();
      } else {
        showPaymentError(response.error || 'Payment failed');
      }
    } catch (error) {
      showPaymentError(error.message);
    } finally {
      makePaymentButton.disabled = false;
    }
  });
  
  // Functions
  async function checkStatus() {
    try {
      updateConnectionStatus(true, 'Checking status...');
      
      const response = await window.connectionHandler.checkStatus();
      
      if (response.status === 'OK') {
        // Update wallet status
        if (response.walletConnected) {
          showWalletConnected(response.walletAddress);
          
          // Get detailed wallet status
          const walletStatus = await window.connectionHandler.getWalletStatus();
          if (walletStatus.status === 'OK') {
            updateWalletInfo(walletStatus);
          }
        } else {
          showWalletNotConnected();
        }
        
        // Update X402 status
        if (response.x402Detected) {
          showX402Payment(response.x402Data);
        } else {
          showNoX402();
        }
        
        updateConnectionStatus(true);
      } else {
        updateConnectionStatus(false, response.error);
      }
    } catch (error) {
      console.error('Error checking status:', error);
      updateConnectionStatus(false, error.message);
    }
  }
  
  function updateConnectionStatus(connected, message = null) {
    if (connected) {
      connectionDot.className = 'status-dot connected';
      connectionStatus.textContent = message || 'Connected';
    } else {
      connectionDot.className = 'status-dot disconnected';
      connectionStatus.textContent = message || 'Disconnected';
    }
  }
  
  function showWalletConnected(address) {
    walletNotConnected.classList.add('hidden');
    walletConnected.classList.remove('hidden');
    walletError.classList.add('hidden');
    
    // Format address for display
    const formattedAddress = formatAddress(address);
    walletAddress.textContent = formattedAddress;
    walletAddress.title = address; // Full address on hover
  }
  
  function showWalletNotConnected() {
    walletNotConnected.classList.remove('hidden');
    walletConnected.classList.add('hidden');
    walletError.classList.add('hidden');
  }
  
  function updateWalletInfo(walletStatus) {
    if (walletStatus.balance !== null) {
      walletBalance.textContent = `${walletStatus.balance} USDC`;
    } else {
      walletBalance.textContent = 'Unknown';
    }
    
    if (walletStatus.network) {
      // Format network name
      let networkName = 'Unknown';
      
      if (walletStatus.network === '0x11a1c7') {
        networkName = 'Sepolia';
      } else if (walletStatus.network === '0x1') {
        networkName = 'Ethereum Mainnet';
      } else if (walletStatus.network === '0x2105') {
        networkName = 'Base';
      }
      
      walletNetwork.textContent = networkName;
    } else {
      walletNetwork.textContent = 'Unknown';
    }
  }
  
  function showWalletError(errorMessage) {
    walletError.textContent = errorMessage;
    walletError.classList.remove('hidden');
  }
  
  function showX402Payment(x402Data) {
    x402Section.classList.remove('hidden');
    noX402Section.classList.add('hidden');
    
    paymentAmount.textContent = `${x402Data.amount} ${x402Data.currency}`;
    paymentDescription.textContent = x402Data.description || 'Content access';
    paymentCurrency.textContent = x402Data.currency;
  }
  
  function showNoX402() {
    x402Section.classList.add('hidden');
    noX402Section.classList.remove('hidden');
  }
  
  function showPaymentError(errorMessage) {
    paymentError.textContent = errorMessage;
    paymentError.classList.remove('hidden');
  }
  
  function showPaymentSuccess() {
    paymentError.classList.add('hidden');
    
    // Show success message
    paymentError.textContent = 'Payment successful! Page will refresh shortly.';
    paymentError.style.color = 'var(--success-green)';
    paymentError.classList.remove('hidden');
    
    // Reload transactions
    loadTransactions();
  }
  
  async function loadTransactions() {
    try {
      const transactions = await window.connectionHandler.getTransactions();
      
      if (transactions.length === 0) {
        transactionsList.innerHTML = '<div class="no-transactions">No recent transactions</div>';
        return;
      }
      
      // Clear list
      transactionsList.innerHTML = '';
      
      // Sort transactions by timestamp (newest first)
      const sortedTransactions = transactions.sort((a, b) => b.timestamp - a.timestamp);
      
      // Add transactions
      for (const tx of sortedTransactions) {
        const txDate = new Date(tx.timestamp);
        const formattedDate = txDate.toLocaleDateString();
        const formattedTime = txDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const txElement = document.createElement('div');
        txElement.className = `transaction-item ${tx.status === 'failed' || tx.status === 'error' ? 'failed' : ''}`;
        
        // Determine status display
        let statusHtml = '';
        if (tx.status === 'success') {
          statusHtml = '<span class="transaction-status">Success</span>';
        } else if (tx.status === 'failed' || tx.status === 'error') {
          statusHtml = '<span class="transaction-status failed">Failed</span>';
        }
        
        // Build transaction hash link
        let hashHtml = '';
        if (tx.transactionHash || tx.txHash) {
          const hash = tx.transactionHash || tx.txHash;
          const explorerUrl = tx.network === 'Base Sepolia' 
            ? `https://sepolia.basescan.org/tx/${hash}`
            : `https://sepolia.etherscan.io/tx/${hash}`;
          hashHtml = `<a href="${explorerUrl}" target="_blank" class="transaction-hash" title="View on explorer">${formatAddress(hash)}</a>`;
        }
        
        // Build network badge
        const networkHtml = tx.network ? `<span class="transaction-network">${tx.network}</span>` : '';
        
        txElement.innerHTML = `
          <div class="transaction-header">
            <span class="transaction-amount">${tx.amount} ${tx.currency}</span>
            ${statusHtml}
          </div>
          <div class="transaction-description">${tx.description || 'Content access'}</div>
          <div class="transaction-date">${formattedDate} at ${formattedTime}</div>
          ${(hashHtml || networkHtml) ? `
            <div class="transaction-details">
              ${networkHtml}
              ${hashHtml}
            </div>
          ` : ''}
          ${tx.status === 'failed' || tx.status === 'error' ? `
            <div class="transaction-error" style="color: var(--error-red); font-size: 12px; margin-top: 4px;">
              ${tx.error || 'Transaction failed'}
            </div>
          ` : ''}
        `;
        
        transactionsList.appendChild(txElement);
      }
      
      // Add clear history button if there are transactions
      if (transactions.length > 0) {
        const clearButton = document.createElement('button');
        clearButton.className = 'clear-history-btn';
        clearButton.textContent = 'Clear History';
        clearButton.onclick = clearTransactionHistory;
        transactionsList.appendChild(clearButton);
      }
      
    } catch (error) {
      console.error('Error loading transactions:', error);
      transactionsList.innerHTML = '<div class="no-transactions">Error loading transactions</div>';
    }
  }
  
  // Helper function to format addresses
  function formatAddress(address) {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  }
  
  // Clear transaction history
  async function clearTransactionHistory() {
    if (confirm('Are you sure you want to clear all transaction history? This action cannot be undone.')) {
      try {
        await new Promise((resolve, reject) => {
          chrome.storage.local.remove('transactions', () => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve();
            }
          });
        });
        
        // Reload transactions display
        await loadTransactions();
        
        console.log('🗑️ Transaction history cleared');
      } catch (error) {
        console.error('Error clearing transaction history:', error);
        alert('Failed to clear transaction history. Please try again.');
      }
    }
  }
});
