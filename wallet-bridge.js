// wallet-bridge.js - Bridge script that runs in main page context to access wallet providers

(function() {
  'use strict';
  
  console.log('🌉 WALLET BRIDGE: Loading in main page context...');
  
  // Function to check wallet availability
  function checkWalletProviders() {
    const result = {
      timestamp: Date.now(),
      ethereum: {
        available: typeof window.ethereum !== 'undefined',
        isCoinbaseWallet: window.ethereum?.isCoinbaseWallet || false,
        isMetaMask: window.ethereum?.isMetaMask || false,
        chainId: window.ethereum?.chainId || null,
        selectedAddress: window.ethereum?.selectedAddress || null
      },
      otherProviders: {
        web3: typeof window.web3 !== 'undefined',
        coinbaseWalletExtension: typeof window.coinbaseWalletExtension !== 'undefined'
      }
    };
    
    console.log('🌉 WALLET BRIDGE: Wallet diagnostic from main context:', result);
    return result;
  }
  
  // Function to connect wallet
  async function connectWallet() {
    try {
      console.log('🌉 WALLET BRIDGE: Attempting wallet connection...');
      
      if (!window.ethereum) {
        throw new Error('No wallet detected. Please install Coinbase Wallet.');
      }
      
      if (!window.ethereum.isCoinbaseWallet) {
        console.warn('🌉 WALLET BRIDGE: Non-Coinbase wallet detected, proceeding anyway...');
      }
      
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock your wallet.');
      }
      
      const address = accounts[0];
      console.log('🌉 WALLET BRIDGE: Wallet connected:', address);
      
      // Switch to Sepolia network (Base Sepolia - Chain ID 84532)
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x14a34' }], // Base Sepolia chain ID (84532)
        });
        console.log('🌉 WALLET BRIDGE: Switched to Base Sepolia network');
      } catch (switchError) {
        console.log('🌉 WALLET BRIDGE: Network switch error:', switchError);
        // Network might not be added, try to add it
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x14a34',
              chainName: 'Base Sepolia',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://sepolia.base.org'],
              blockExplorerUrls: ['https://sepolia.basescan.org'],
            }],
          });
          console.log('🌉 WALLET BRIDGE: Added Base Sepolia network');
        }
      }
      
      return {
        success: true,
        address: address,
        message: 'Wallet connected successfully'
      };
    } catch (error) {
      console.error('🌉 WALLET BRIDGE: Wallet connection error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Function to get wallet status
  async function getWalletStatus() {
    try {
      if (!window.ethereum) {
        return {
          walletAvailable: false,
          walletConnected: false,
          error: 'No wallet detected'
        };
      }
      
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      const isConnected = accounts.length > 0;
      
      let networkId = null;
      if (isConnected) {
        try {
          networkId = await window.ethereum.request({ method: 'eth_chainId' });
        } catch (error) {
          console.error('🌉 WALLET BRIDGE: Error getting network:', error);
        }
      }
      
      return {
        walletAvailable: window.ethereum.isCoinbaseWallet || false,
        walletConnected: isConnected,
        walletAddress: isConnected ? accounts[0] : null,
        network: networkId,
        status: 'OK'
      };
    } catch (error) {
      console.error('🌉 WALLET BRIDGE: Error getting wallet status:', error);
      return {
        walletAvailable: false,
        walletConnected: false,
        error: error.message
      };
    }
  }
  
  // Validate payment amount
  function validateAmount(amount) {
    const amountStr = String(amount).trim();
    
    if (!amountStr || !/^\d+(\.\d+)?$/.test(amountStr)) {
      return { valid: false, error: 'Invalid amount format' };
    }
    
    const value = parseFloat(amountStr);
    
    if (isNaN(value) || value <= 0) {
      return { valid: false, error: 'Amount must be greater than 0' };
    }
    
    if (value > 1000000) {
      return { valid: false, error: 'Amount is too large' };
    }
    
    const decimalPart = amountStr.split('.')[1];
    if (decimalPart && decimalPart.length > 6) {
      return { valid: false, error: 'Amount has too many decimal places (max 6 for USDC)' };
    }
    
    return { valid: true, value: value };
  }
  
  // Check USDC balance
  async function checkUSDCBalance(walletAddress, usdcContractAddress) {
    try {
      // ERC-20 balanceOf function signature
      const balanceOfMethodId = '0x70a08231';
      const paddedAddress = walletAddress.slice(2).padStart(64, '0');
      const data = balanceOfMethodId + paddedAddress;
      
      const result = await window.ethereum.request({
        method: 'eth_call',
        params: [{
          to: usdcContractAddress,
          data: data
        }, 'latest']
      });
      
      // Convert hex result to decimal (USDC has 6 decimals)
      const balanceInWei = parseInt(result, 16);
      const balance = balanceInWei / 1000000;
      
      return { success: true, balance: balance };
    } catch (error) {
      console.error('🌉 WALLET BRIDGE: Error checking balance:', error);
      return { success: false, balance: 0, error: error.message };
    }
  }
  
  // Make USDC payment
  async function makePayment(paymentData) {
    try {
      console.log('🌉 WALLET BRIDGE: Making payment with data:', JSON.stringify(paymentData, null, 2));
      console.log('🌉 WALLET BRIDGE: Payment amount type:', typeof paymentData.amount, 'value:', paymentData.amount);
      console.log('🌉 WALLET BRIDGE: Contract address:', paymentData.contractAddress);
      
      if (!window.ethereum) {
        return {
          success: false,
          error: 'No wallet detected. Please install Coinbase Wallet.'
        };
      }
      
      // Ensure wallet is connected
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length === 0) {
        return {
          success: false,
          error: 'Wallet not connected. Please connect your wallet first.'
        };
      }
      
      // Ensure we're on Base Sepolia network
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId !== '0x14a34') { // Base Sepolia chain ID
        return {
          success: false,
          error: 'Please switch to Base Sepolia network in your wallet.'
        };
      }
      
      // Validate payment amount
      const amountValidation = validateAmount(paymentData.amount);
      if (!amountValidation.valid) {
        return {
          success: false,
          error: amountValidation.error
        };
      }
      
      const amount = amountValidation.value;
      
      // USDC contract address on Base Sepolia (for ERC-20 transfer)
      const usdcContractAddress = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'; // Base Sepolia USDC contract
      // Recipient address (where the USDC payment goes)
      const recipientAddress = paymentData.contractAddress || '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238';
      
      // Validate recipient address
      if (!/^0x[a-fA-F0-9]{40}$/.test(recipientAddress)) {
        return {
          success: false,
          error: 'Invalid recipient address'
        };
      }
      
      // Check USDC balance before attempting payment
      console.log('🌉 WALLET BRIDGE: Checking USDC balance...');
      const balanceCheck = await checkUSDCBalance(accounts[0], usdcContractAddress);
      
      if (balanceCheck.success) {
        console.log('🌉 WALLET BRIDGE: Current USDC balance:', balanceCheck.balance);
        
        if (balanceCheck.balance < amount) {
          return {
            success: false,
            error: `Insufficient USDC balance. You have ${balanceCheck.balance.toFixed(2)} USDC but need ${amount} USDC. Visit https://faucet.circle.com/ to get test USDC tokens.`
          };
        }
      } else {
        console.warn('🌉 WALLET BRIDGE: Could not check balance, proceeding with payment attempt');
      }
      
      // Convert amount to wei (USDC has 6 decimals)
      const amountInWei = Math.floor(amount * 1000000);
      console.log('🌉 WALLET BRIDGE: Amount conversion:', amount, 'USDC =', amountInWei, 'wei');
      
      // ERC-20 transfer function signature: transfer(address,uint256)
      const transferMethodId = '0xa9059cbb';
      
      // Ensure recipient address is properly formatted
      const cleanRecipient = recipientAddress.startsWith('0x') ? recipientAddress.slice(2) : recipientAddress;
      const paddedRecipient = cleanRecipient.padStart(64, '0');
      const paddedAmount = amountInWei.toString(16).padStart(64, '0');
      const data = transferMethodId + paddedRecipient + paddedAmount;
      
      console.log('🌉 WALLET BRIDGE: Transaction data construction:');
      console.log('  - Transfer method ID:', transferMethodId);
      console.log('  - Clean recipient:', cleanRecipient);
      console.log('  - Padded recipient:', paddedRecipient);
      console.log('  - Amount in wei:', amountInWei);
      console.log('  - Padded amount:', paddedAmount);
      console.log('  - Final data:', data);
      console.log('  - Data length:', data.length);
      
      console.log('🌉 WALLET BRIDGE: Sending USDC transfer transaction...');
      console.log('  - From:', accounts[0]);
      console.log('  - To contract:', usdcContractAddress);
      console.log('  - Recipient:', recipientAddress);
      console.log('  - Amount:', amount, 'USDC');
      
      // Send transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: accounts[0],
          to: usdcContractAddress,
          data: data,
          gas: '0x186A0', // 100,000 gas limit
        }]
      });
      
      console.log('🌉 WALLET BRIDGE: Payment transaction sent:', txHash);
      
      return {
        success: true,
        txHash: txHash,
        message: `Payment of ${amount} USDC completed successfully`
      };
      
    } catch (error) {
      console.error('🌉 WALLET BRIDGE: Payment error:', error);
      
      // Handle specific error types with helpful messages
      let errorMessage = error.message || 'Payment failed';
      
      if (errorMessage.includes('transfer amount exceeds balance') || 
          errorMessage.includes('insufficient funds') ||
          errorMessage.includes('exceeds balance')) {
        errorMessage = `Insufficient USDC balance. You need ${paymentData.amount} USDC on Base Sepolia. Visit https://faucet.circle.com/ to get test USDC tokens.`;
      } else if (errorMessage.includes('user rejected') || errorMessage.includes('denied')) {
        errorMessage = 'Payment cancelled by user';
      } else if (errorMessage.includes('network')) {
        errorMessage = 'Please switch to Base Sepolia network';
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }
  
  // Listen for messages from content script
  window.addEventListener('message', async (event) => {
    // Only accept messages from same origin
    if (event.origin !== window.location.origin) {
      return;
    }
    
    if (event.data.source !== 'autospend-content-script') {
      return;
    }
    
    console.log('🌉 WALLET BRIDGE: Received message:', event.data);
    
    let response;
    
    try {
      switch (event.data.action) {
        case 'CHECK_WALLET_PROVIDERS':
          response = checkWalletProviders();
          break;
          
        case 'CONNECT_WALLET':
          response = await connectWallet();
          break;
          
        case 'GET_WALLET_STATUS':
          response = await getWalletStatus();
          break;
          
        case 'MAKE_PAYMENT':
          console.log('🌉 WALLET BRIDGE: Processing MAKE_PAYMENT...');
          response = await makePayment(event.data.payload);
          console.log('🌉 WALLET BRIDGE: MAKE_PAYMENT response:', response);
          break;
          
        default:
          response = { error: 'Unknown action' };
          break;
      }
    } catch (error) {
      console.error('🌉 WALLET BRIDGE: Error processing message:', error);
      response = { 
        success: false, 
        error: error.message || 'Unknown error occurred' 
      };
    }
    
    // Always send response back to content script
    console.log('🌉 WALLET BRIDGE: Sending response:', response);
    window.postMessage({
      source: 'autospend-wallet-bridge',
      requestId: event.data.requestId,
      response: response
    }, window.location.origin);
  });
  
  // Notify content script that bridge is ready
  window.postMessage({
    source: 'autospend-wallet-bridge',
    action: 'BRIDGE_READY'
  }, window.location.origin);
  
  console.log('🌉 WALLET BRIDGE: Setup complete, listening for messages...');
})();
