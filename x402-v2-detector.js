// x402-v2-detector.js - X402 V2 Protocol Detection Module
// Implements X402 V2 specification with multi-chain support and new HTTP headers

/**
 * X402 V2 Detector Class
 * Handles detection of X402 payment requirements from:
 * 1. HTTP Headers (PAYMENT-REQUIRED) - Primary V2 method
 * 2. Meta tags - Legacy V1 compatibility
 * 3. Link headers - Discovery extension
 */
class X402V2Detector {
  constructor() {
    this.version = '2.0.0';
    this.paymentRequirements = null;
    this.detectionMethod = null;
    this.initialized = false;
  }

  /**
   * Parse base64-encoded PaymentRequired header
   * @param {string} base64Data - Base64 encoded JSON
   * @returns {object|null} Parsed payment requirements
   */
  parsePaymentRequiredHeader(base64Data) {
    try {
      const jsonString = atob(base64Data);
      const requirements = JSON.parse(jsonString);
      return this.normalizePaymentRequirements(requirements);
    } catch (error) {
      console.error('💰 X402 V2: Failed to parse Payment-Required header:', error);
      return null;
    }
  }

  /**
   * Normalize payment requirements to V2 format
   * @param {object} requirements - Raw payment requirements
   * @returns {object} Normalized requirements
   */
  normalizePaymentRequirements(requirements) {
    // Handle array of requirements (multi-option payments)
    if (Array.isArray(requirements)) {
      return requirements.map(req => this.normalizeSingleRequirement(req));
    }
    return [this.normalizeSingleRequirement(requirements)];
  }

  /**
   * Normalize a single payment requirement
   * @param {object} req - Single requirement object
   * @returns {object} Normalized requirement
   */
  normalizeSingleRequirement(req) {
    return {
      // V2 required fields
      scheme: req.scheme || 'exact',
      network: req.network || 'eip155:84532',
      maxAmountRequired: req.maxAmountRequired || req.amount || '0',
      resource: req.resource || window.location.href,
      payTo: req.payTo || req.recipient || null,
      
      // V2 optional fields
      asset: req.asset || 'USDC',
      description: req.description || 'X402 Payment',
      mimeType: req.mimeType || null,
      outputSchema: req.outputSchema || null,
      extra: req.extra || {},
      
      // Metadata
      version: req.version || '2.0.0',
      facilitator: req.facilitator || null
    };
  }

  /**
   * Detect X402 from meta tags (V1 compatibility)
   * @returns {object|null} Payment requirements or null
   */
  detectFromMetaTags() {
    const paymentRequired = document.querySelector('meta[name="x-402-payment-required"]');
    
    if (!paymentRequired || paymentRequired.content !== 'true') {
      return null;
    }

    const amount = document.querySelector('meta[name="x-402-amount"]')?.content;
    const currency = document.querySelector('meta[name="x-402-currency"]')?.content || 'USDC';
    const description = document.querySelector('meta[name="x-402-description"]')?.content;
    const network = document.querySelector('meta[name="x-402-network"]')?.content || 'eip155:84532';
    const recipient = document.querySelector('meta[name="x-402-recipient"]')?.content;
    const scheme = document.querySelector('meta[name="x-402-scheme"]')?.content || 'exact';
    const paymentUrl = document.querySelector('meta[name="x-402-payment-url"]')?.content;

    if (!amount) {
      console.warn('💰 X402 V2: Payment required but no amount specified');
      return null;
    }

    return [{
      scheme: scheme,
      network: network,
      maxAmountRequired: amount,
      resource: window.location.href,
      payTo: recipient,
      asset: currency,
      description: description || 'X402 Payment',
      paymentUrl: paymentUrl,
      version: '1.0.0', // Detected via V1 meta tags
      detectionMethod: 'meta-tags'
    }];
  }

  /**
   * Detect X402 from HTTP response headers
   * This requires intercepting fetch/XHR responses
   * @param {Headers} headers - Response headers
   * @returns {object|null} Payment requirements or null
   */
  detectFromHeaders(headers) {
    // Check V2 header first
    const paymentRequired = headers.get('Payment-Required');
    if (paymentRequired) {
      const requirements = this.parsePaymentRequiredHeader(paymentRequired);
      if (requirements) {
        requirements.forEach(req => req.detectionMethod = 'http-header-v2');
        return requirements;
      }
    }

    // Check legacy X-Payment header (V1)
    const legacyPayment = headers.get('X-Payment');
    if (legacyPayment) {
      try {
        const requirements = this.parsePaymentRequiredHeader(legacyPayment);
        if (requirements) {
          requirements.forEach(req => {
            req.detectionMethod = 'http-header-v1';
            req.version = '1.0.0';
          });
          return requirements;
        }
      } catch (e) {
        console.warn('💰 X402 V2: Failed to parse legacy X-Payment header');
      }
    }

    return null;
  }

  /**
   * Main detection method - tries all detection strategies
   * @returns {object} Detection result
   */
  detect() {
    console.log('💰 X402 V2: Running detection...');

    // Strategy 1: Check meta tags (most common for static pages)
    const metaRequirements = this.detectFromMetaTags();
    if (metaRequirements) {
      this.paymentRequirements = metaRequirements;
      this.detectionMethod = 'meta-tags';
      console.log('💰 X402 V2: Detected via meta tags:', metaRequirements);
      return {
        detected: true,
        requirements: metaRequirements,
        method: 'meta-tags',
        version: metaRequirements[0]?.version || '1.0.0'
      };
    }

    // No detection
    this.paymentRequirements = null;
    this.detectionMethod = null;
    return {
      detected: false,
      requirements: null,
      method: null,
      version: null
    };
  }

  /**
   * Get the best payment option based on user preferences
   * @param {object} preferences - User preferences (preferred network, asset, etc.)
   * @returns {object|null} Best matching payment requirement
   */
  getBestPaymentOption(preferences = {}) {
    if (!this.paymentRequirements || this.paymentRequirements.length === 0) {
      return null;
    }

    const { preferredNetwork, preferredAsset } = preferences;

    // Score each option
    const scored = this.paymentRequirements.map(req => {
      let score = 0;
      if (preferredNetwork && req.network === preferredNetwork) score += 10;
      if (preferredAsset && req.asset === preferredAsset) score += 5;
      // Prefer V2 over V1
      if (req.version === '2.0.0') score += 2;
      return { requirement: req, score };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.requirement || this.paymentRequirements[0];
  }

  /**
   * Create a PaymentPayload for signing
   * @param {object} requirement - Selected payment requirement
   * @param {string} payerAddress - Payer's wallet address
   * @returns {object} Payment payload ready for signing
   */
  createPaymentPayload(requirement, payerAddress) {
    return {
      // X402 V2 PaymentPayload structure
      scheme: requirement.scheme,
      network: requirement.network,
      payload: {
        signature: null, // To be filled after signing
        authorization: {
          from: payerAddress,
          to: requirement.payTo,
          value: requirement.maxAmountRequired,
          asset: requirement.asset,
          validAfter: Math.floor(Date.now() / 1000),
          validBefore: Math.floor(Date.now() / 1000) + 3600, // 1 hour validity
          nonce: this.generateNonce()
        }
      }
    };
  }

  /**
   * Generate a random nonce for payment authorization
   * @returns {string} Hex nonce
   */
  generateNonce() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return '0x' + Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Encode payment payload for HTTP header
   * @param {object} payload - Payment payload
   * @returns {string} Base64 encoded payload
   */
  encodePaymentSignature(payload) {
    return btoa(JSON.stringify(payload));
  }
}

// Export for use in content script
if (typeof window !== 'undefined') {
  window.X402V2Detector = X402V2Detector;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { X402V2Detector };
}
