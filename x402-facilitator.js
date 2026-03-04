// x402-facilitator.js - X402 V2 Facilitator Integration Module
// Handles communication with X402 facilitators for payment verification and settlement

/**
 * X402 Facilitator Client
 * Communicates with facilitator servers for:
 * 1. Payment verification
 * 2. Payment settlement
 * 3. Discovery of supported networks/assets
 */
class X402Facilitator {
  constructor(config = {}) {
    this.facilitatorUrl = config.url || 'https://x402.org/facilitator';
    this.timeout = config.timeout || 30000;
    this.retries = config.retries || 3;
  }

  /**
   * Verify a payment payload before settlement
   * @param {object} paymentPayload - The signed payment payload
   * @param {object} paymentRequirements - The original payment requirements
   * @returns {Promise<object>} Verification result
   */
  async verify(paymentPayload, paymentRequirements) {
    const endpoint = `${this.facilitatorUrl}/verify`;
    
    try {
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentPayload,
          paymentRequirements
        })
      });

      return {
        valid: response.valid,
        message: response.message,
        details: response.details || {}
      };
    } catch (error) {
      console.error('💰 X402 Facilitator: Verification failed:', error);
      return {
        valid: false,
        message: error.message,
        error: true
      };
    }
  }

  /**
   * Settle a verified payment
   * @param {object} paymentPayload - The signed payment payload
   * @param {object} paymentRequirements - The original payment requirements
   * @returns {Promise<object>} Settlement result
   */
  async settle(paymentPayload, paymentRequirements) {
    const endpoint = `${this.facilitatorUrl}/settle`;
    
    try {
      const response = await this.makeRequest(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          paymentPayload,
          paymentRequirements
        })
      });

      return {
        success: response.success,
        transactionHash: response.transactionHash,
        network: response.network,
        blockNumber: response.blockNumber,
        timestamp: response.timestamp,
        receipt: response.receipt || null
      };
    } catch (error) {
      console.error('💰 X402 Facilitator: Settlement failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get facilitator capabilities and supported networks
   * @returns {Promise<object>} Facilitator info
   */
  async getInfo() {
    const endpoint = `${this.facilitatorUrl}/info`;
    
    try {
      const response = await this.makeRequest(endpoint, {
        method: 'GET'
      });

      return {
        name: response.name,
        version: response.version,
        supportedNetworks: response.supportedNetworks || [],
        supportedAssets: response.supportedAssets || [],
        supportedSchemes: response.supportedSchemes || ['exact'],
        features: response.features || []
      };
    } catch (error) {
      console.error('💰 X402 Facilitator: Failed to get info:', error);
      return null;
    }
  }

  /**
   * Make HTTP request with retry logic
   * @param {string} url - Request URL
   * @param {object} options - Fetch options
   * @returns {Promise<object>} Response data
   */
  async makeRequest(url, options) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        lastError = error;
        console.warn(`💰 X402 Facilitator: Attempt ${attempt}/${this.retries} failed:`, error.message);
        
        if (attempt < this.retries) {
          await this.delay(1000 * attempt); // Exponential backoff
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Delay helper
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Local verification for direct blockchain interaction
 * Used when facilitator is not available or for local testing
 */
class LocalVerifier {
  constructor(provider) {
    this.provider = provider;
  }

  /**
   * Verify payment signature locally
   * @param {object} paymentPayload - Payment payload with signature
   * @returns {Promise<object>} Verification result
   */
  async verify(paymentPayload) {
    try {
      const { signature, authorization } = paymentPayload.payload;
      
      // Verify signature matches authorization
      // This is a simplified version - real implementation would use EIP-712
      const isValid = signature && authorization && authorization.from;
      
      return {
        valid: isValid,
        message: isValid ? 'Signature valid' : 'Invalid signature',
        local: true
      };
    } catch (error) {
      return {
        valid: false,
        message: error.message,
        local: true,
        error: true
      };
    }
  }

  /**
   * Execute payment directly on blockchain
   * @param {object} paymentPayload - Payment payload
   * @param {object} requirement - Payment requirement
   * @returns {Promise<object>} Transaction result
   */
  async executePayment(paymentPayload, requirement) {
    // This would be implemented using the wallet bridge
    // For now, return a placeholder
    return {
      success: false,
      message: 'Direct blockchain execution not yet implemented',
      useWalletBridge: true
    };
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.X402Facilitator = X402Facilitator;
  window.LocalVerifier = LocalVerifier;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { X402Facilitator, LocalVerifier };
}
