// wallet-content-standalone.js - Wallet functionality for X402 Payment Extension
// This script is injected into the page context

// CoinbaseWalletManager class for wallet detection, connection, and payment
class CoinbaseWalletManager {
  constructor() {
    // Initialize properties
    this.provider = null;
    this.isConnected = false;
    this.address = null;
    this.balance = null;
    this.network = null;
    this.usdcContract = null;
    
    // Constants
    this.USDC_ADDRESS = '0x1c7d4b196cb0c7b01d743fbc6116a902379c7238'; // USDC contract address
    this.BASE_SEPOLIA_CHAIN_ID = '0x11a1c7'; // Chain ID 1155111 in hex
    
    // Initialize
    this.init();
  }
  
  // Initialize wallet manager
  async init() {
    console.log('💰 Initializing CoinbaseWalletManager');
    
    // Wait for Ethereum provider to be available
    await this.waitForProvider();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Check initial connection status
    this.checkConnection();
  }
  
  // Wait for Ethereum provider to be available
  async waitForProvider() {
    return new Promise((resolve) => {
      const checkProvider = () => {
        if (window.ethereum) {
          console.log('💰 Ethereum provider found');
          this.provider = window.ethereum;
          resolve();
        } else {
          console.log('💰 Waiting for Ethereum provider...');
          setTimeout(checkProvider, 500);
        }
      };
      
      checkProvider();
    });
  }
  
  // Set up event listeners for wallet events
  setupEventListeners() {
    if (!this.provider) return;
    
    try {
      // Use addEventListener for standard Ethereum providers
      if (typeof this.provider.addEventListener === 'function') {
        // Handle account changes
        this.provider.addEventListener('accountsChanged', (accounts) => {
          console.log('💰 Accounts changed:', accounts);
          
          if (accounts.length > 0) {
            this.isConnected = true;
            this.address = accounts[0];
            this.sendEvent('walletConnected', this.address);
            this.checkBalance();
          } else {
            this.isConnected = false;
            this.address = null;
            this.balance = null;
            this.sendEvent('walletDisconnected');
          }
        });
        
        // Handle chain changes
        this.provider.addEventListener('chainChanged', (chainId) => {
          console.log('💰 Chain changed:', chainId);
          this.network = chainId;
          this.sendEvent('networkUpdated', chainId);
          this.checkBalance();
        });
        
        // Handle disconnect
        this.provider.addEventListener('disconnect', () => {
          console.log('💰 Wallet disconnected');
          this.isConnected = false;
          this.address = null;
          this.balance = null;
          this.sendEvent('walletDisconnected');
        });
      }
      // Fallback for providers that use .on() method
      else if (typeof this.provider.on === 'function') {
        // Handle account changes
        this.provider.on('accountsChanged', (accounts) => {
          console.log('💰 Accounts changed:', accounts);
          
          if (accounts.length > 0) {
            this.isConnected = true;
            this.address = accounts[0];
            this.sendEvent('walletConnected', this.address);
            this.checkBalance();
          } else {
            this.isConnected = false;
            this.address = null;
            this.balance = null;
            this.sendEvent('walletDisconnected');
          }
        });
        
        // Handle chain changes
        this.provider.on('chainChanged', (chainId) => {
          console.log('💰 Chain changed:', chainId);
          this.network = chainId;
          this.sendEvent('networkUpdated', chainId);
          this.checkBalance();
        });
        
        // Handle disconnect
        this.provider.on('disconnect', () => {
          console.log('💰 Wallet disconnected');
          this.isConnected = false;
          this.address = null;
          this.balance = null;
          this.sendEvent('walletDisconnected');
        });
      } else {
        console.log('💰 Provider does not support event listeners');
      }
    } catch (error) {
      console.error('💰 Error setting up event listeners:', error);
    }
  }
  
  // Check if wallet is connected
  async checkConnection() {
    if (!this.provider) return false;
    
    try {
      // Request accounts
      const accounts = await this.provider.request({ method: 'eth_accounts' });
      
      if (accounts.length > 0) {
        this.isConnected = true;
        this.address = accounts[0];
        this.sendEvent('walletConnected', this.address);
        
        // Check network and balance
        await this.checkNetwork();
        await this.checkBalance();
        
        return true;
      } else {
        this.isConnected = false;
        this.address = null;
        return false;
      }
    } catch (error) {
      console.error('💰 Error checking connection:', error);
      return false;
    }
  }
  
  // Connect wallet
  async connect() {
    if (!this.provider) {
      throw new Error('No Ethereum provider found. Please install Coinbase Wallet extension.');
    }
    
    try {
      // Request accounts
      const accounts = await this.provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        this.isConnected = true;
        this.address = accounts[0];
        this.sendEvent('walletConnected', this.address);
        
        // Check network and balance
        await this.checkNetwork();
        await this.checkBalance();
        
        return this.address;
      } else {
        throw new Error('No accounts returned from wallet');
      }
    } catch (error) {
      console.error('💰 Error connecting wallet:', error);
      throw error;
    }
  }
  
  // Check current network
  async checkNetwork() {
    if (!this.provider) return null;
    
    try {
      const chainId = await this.provider.request({ method: 'eth_chainId' });
      this.network = chainId;
      this.sendEvent('networkUpdated', chainId);
      
      return chainId;
    } catch (error) {
      console.error('💰 Error checking network:', error);
      return null;
    }
  }
  
  // Switch to Sepolia testnet
  async switchToSepolia() {
    if (!this.provider) {
      console.error('No provider available for network switching');
      return false;
    }
    
    console.log(`Attempting to switch to Sepolia (Chain ID: ${this.BASE_SEPOLIA_CHAIN_ID})`);
    
    try {
      // Try to switch to the network
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: this.BASE_SEPOLIA_CHAIN_ID }],
      });
      
      // Successfully switched
      console.log('Successfully switched to Sepolia');
      return true;
    } catch (error) {
      console.log('Error during network switch:', error.code, error.message);
      
      // If the network is not added yet, add it
      if (error.code === 4902) {
        try {
          console.log('Adding Sepolia network to wallet');
          await this.provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: this.BASE_SEPOLIA_CHAIN_ID,
              chainName: 'Sepolia',
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18
              },
              rpcUrls: ['https://sepolia.infura.io/v3/'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
          console.log('Successfully added Sepolia network');
          return true;
        } catch (addError) {
          console.error('Error adding Sepolia network:', addError);
          return false;
        }
      }
      console.error('Error switching to Sepolia network:', error);
      return false;
    }
  }
  
  // Check USDC balance
  async checkBalance() {
    if (!this.provider || !this.isConnected) return null;
    
    try {
      // Check if on correct network
      const chainId = await this.checkNetwork();
      if (chainId !== this.BASE_SEPOLIA_CHAIN_ID) {
        this.balance = null;
        return null;
      }
      
      // USDC ABI for balanceOf function
      const usdcAbi = [
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
          "type": "function"
        }
      ];
      
      // Create contract instance
      const usdcContract = {
        address: this.USDC_ADDRESS,
        abi: usdcAbi
      };
      
      // Call balanceOf function
      const data = this.encodeBalanceOfData(this.address);
      
      const result = await this.provider.request({
        method: 'eth_call',
        params: [
          {
            to: this.USDC_ADDRESS,
            data
          },
          'latest'
        ]
      });
      
      // Convert hex result to decimal and divide by 10^6 (USDC has 6 decimals)
      const balanceHex = result || '0x0';
      const balanceWei = parseInt(balanceHex, 16);
      const balanceUsdc = balanceWei / 1000000;
      
      this.balance = balanceUsdc;
      this.sendEvent('balanceUpdated', balanceUsdc);
      
      return balanceUsdc;
    } catch (error) {
      console.error('💰 Error checking balance:', error);
      this.balance = null;
      return null;
    }
  }
  
  // Encode balanceOf function call data
  encodeBalanceOfData(address) {
    // Function signature for balanceOf(address)
    const functionSignature = '0x70a08231';
    
    // Pad address to 32 bytes (remove 0x prefix, pad with zeros)
    const paddedAddress = address.slice(2).padStart(64, '0');
    
    return `${functionSignature}${paddedAddress}`;
  }
  
  // Make payment
  async makePayment(x402Data) {
    if (!this.provider || !this.isConnected) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Check if on correct network
      const chainId = await this.checkNetwork();
      if (chainId !== this.BASE_SEPOLIA_CHAIN_ID) {
        // Try to switch to Sepolia
        const switched = await this.switchToSepolia();
        if (!switched) {
          throw new Error('Please switch to Sepolia network in your wallet');
        }
      }
      
      // Check balance
      const balance = await this.checkBalance();
      if (balance === null || balance < parseFloat(x402Data.amount)) {
        throw new Error(`Insufficient USDC balance. You have ${balance || 0} USDC but need ${x402Data.amount} USDC`);
      }
      
      // USDC transfer ABI
      const transferAbi = [
        {
          "constant": false,
          "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"}
          ],
          "name": "transfer",
          "outputs": [{"name": "", "type": "bool"}],
          "type": "function"
        }
      ];
      
      // Get recipient address from payment URL or use default
      let recipientAddress = '0x0000000000000000000000000000000000000402'; // Default X402 address
      
      if (x402Data.paymentUrl) {
        try {
          // Try to extract address from URL
          const url = new URL(x402Data.paymentUrl);
          const addressParam = url.searchParams.get('address');
          if (addressParam && addressParam.startsWith('0x') && addressParam.length === 42) {
            recipientAddress = addressParam;
          }
        } catch (error) {
          console.error('💰 Error parsing payment URL:', error);
        }
      }
      
      // Convert amount to USDC units (6 decimals)
      const amountInUsdcUnits = Math.floor(parseFloat(x402Data.amount) * 1000000).toString();
      
      // Encode transfer function data
      const data = this.encodeTransferData(recipientAddress, amountInUsdcUnits);
      
      // Notify payment started
      this.sendEvent('paymentStarted', {
        amount: x402Data.amount,
        currency: x402Data.currency,
        description: x402Data.description,
        recipient: recipientAddress
      });
      
      // Send transaction
      const txHash = await this.provider.request({
        method: 'eth_sendTransaction',
        params: [{
          from: this.address,
          to: this.USDC_ADDRESS,
          data,
          value: '0x0'
        }]
      });
      
      console.log('💰 Payment transaction sent:', txHash);
      
      // Wait for transaction confirmation
      const receipt = await this.waitForTransaction(txHash);
      
      // Check if transaction was successful
      if (receipt && receipt.status === '0x1') {
        // Notify payment success
        this.sendEvent('paymentSuccess', {
          amount: x402Data.amount,
          currency: x402Data.currency,
          description: x402Data.description,
          recipient: recipientAddress,
          txHash
        });
        
        return {
          success: true,
          txHash,
          receipt
        };
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('💰 Error making payment:', error);
      
      // Notify payment failed
      this.sendEvent('paymentFailed', {
        error: error.message,
        amount: x402Data.amount,
        currency: x402Data.currency,
        description: x402Data.description
      });
      
      throw error;
    }
  }
  
  // Encode transfer function call data
  encodeTransferData(to, amount) {
    // Function signature for transfer(address,uint256)
    const functionSignature = '0xa9059cbb';
    
    // Pad address to 32 bytes (remove 0x prefix, pad with zeros)
    const paddedAddress = to.slice(2).padStart(64, '0');
    
    // Convert amount to hex and pad to 32 bytes
    const amountHex = parseInt(amount).toString(16).padStart(64, '0');
    
    return `${functionSignature}${paddedAddress}${amountHex}`;
  }
  
  // Wait for transaction confirmation
  async waitForTransaction(txHash) {
    return new Promise((resolve, reject) => {
      const checkReceipt = async () => {
        try {
          const receipt = await this.provider.request({
            method: 'eth_getTransactionReceipt',
            params: [txHash]
          });
          
          if (receipt) {
            resolve(receipt);
          } else {
            setTimeout(checkReceipt, 2000);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkReceipt();
    });
  }
  
  // Send event to content script
  sendEvent(event, data = null) {
    window.postMessage({
      source: 'x402WalletManager',
      event,
      data
    }, '*');
  }
}

// The wallet manager will be initialized by wallet-initializer.js
// This script only defines the CoinbaseWalletManager class
console.log('💰 Wallet content script loaded');

// The actual initialization is done in wallet-initializer.js to avoid CSP issues
