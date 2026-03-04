// validation.js - Input validation utilities for X402 Payment Extension

/**
 * Validate Ethereum address format
 * @param {string} address - Ethereum address to validate
 * @returns {boolean}
 */
function isValidEthereumAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate transaction hash format
 * @param {string} hash - Transaction hash to validate
 * @returns {boolean}
 */
function isValidTransactionHash(hash) {
  if (!hash || typeof hash !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]{64}$/.test(hash);
}

/**
 * Validate payment amount
 * @param {string|number} amount - Amount to validate
 * @returns {object} { valid: boolean, error: string|null, value: number|null }
 */
function validatePaymentAmount(amount) {
  // Convert to string for validation
  const amountStr = String(amount).trim();
  
  // Check if empty
  if (!amountStr) {
    return {
      valid: false,
      error: 'Amount is required',
      value: null
    };
  }
  
  // Check format
  if (!/^\d+(\.\d+)?$/.test(amountStr)) {
    return {
      valid: false,
      error: 'Amount must be a valid number',
      value: null
    };
  }
  
  // Parse to number
  const value = parseFloat(amountStr);
  
  // Check if NaN
  if (isNaN(value)) {
    return {
      valid: false,
      error: 'Amount must be a valid number',
      value: null
    };
  }
  
  // Check if positive
  if (value <= 0) {
    return {
      valid: false,
      error: 'Amount must be greater than 0',
      value: null
    };
  }
  
  // Check if reasonable (not too large)
  if (value > 1000000) {
    return {
      valid: false,
      error: 'Amount is too large',
      value: null
    };
  }
  
  // Check decimal places (USDC has 6 decimals)
  const decimalPart = amountStr.split('.')[1];
  if (decimalPart && decimalPart.length > 6) {
    return {
      valid: false,
      error: 'Amount has too many decimal places (max 6)',
      value: null
    };
  }
  
  return {
    valid: true,
    error: null,
    value: value
  };
}

/**
 * Validate chain ID
 * @param {string} chainId - Chain ID to validate (hex format)
 * @returns {boolean}
 */
function isValidChainId(chainId) {
  if (!chainId || typeof chainId !== 'string') {
    return false;
  }
  return /^0x[a-fA-F0-9]+$/.test(chainId);
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - String to sanitize
 * @returns {string}
 */
function sanitizeString(input) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize X402 meta tag data
 * @param {object} x402Data - X402 data object
 * @returns {object} { valid: boolean, errors: string[], sanitized: object|null }
 */
function validateX402Data(x402Data) {
  const errors = [];
  const sanitized = {};
  
  if (!x402Data || typeof x402Data !== 'object') {
    return {
      valid: false,
      errors: ['Invalid X402 data format'],
      sanitized: null
    };
  }
  
  // Validate amount
  const amountValidation = validatePaymentAmount(x402Data.amount);
  if (!amountValidation.valid) {
    errors.push(`Amount: ${amountValidation.error}`);
  } else {
    sanitized.amount = amountValidation.value;
  }
  
  // Validate currency (should be USDC for now)
  if (!x402Data.currency || typeof x402Data.currency !== 'string') {
    errors.push('Currency is required');
  } else {
    sanitized.currency = sanitizeString(x402Data.currency).toUpperCase();
    if (sanitized.currency !== 'USDC') {
      errors.push('Only USDC is supported');
    }
  }
  
  // Validate description (optional)
  if (x402Data.description) {
    sanitized.description = sanitizeString(x402Data.description);
    if (sanitized.description.length > 200) {
      errors.push('Description is too long (max 200 characters)');
    }
  } else {
    sanitized.description = 'X402 Payment';
  }
  
  // Validate recipient address if provided
  if (x402Data.recipient) {
    if (!isValidEthereumAddress(x402Data.recipient)) {
      errors.push('Invalid recipient address');
    } else {
      sanitized.recipient = x402Data.recipient;
    }
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    sanitized: errors.length === 0 ? sanitized : null
  };
}

/**
 * Check if balance is sufficient for payment
 * @param {number} balance - Current balance
 * @param {number} amount - Payment amount
 * @param {number} estimatedGasFee - Estimated gas fee (optional)
 * @returns {object} { sufficient: boolean, shortfall: number }
 */
function checkSufficientBalance(balance, amount, estimatedGasFee = 0) {
  const required = amount + estimatedGasFee;
  const sufficient = balance >= required;
  
  return {
    sufficient: sufficient,
    shortfall: sufficient ? 0 : required - balance,
    required: required
  };
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    isValidEthereumAddress,
    isValidTransactionHash,
    validatePaymentAmount,
    isValidChainId,
    sanitizeString,
    validateX402Data,
    checkSufficientBalance
  };
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.ValidationUtils = {
    isValidEthereumAddress,
    isValidTransactionHash,
    validatePaymentAmount,
    isValidChainId,
    sanitizeString,
    validateX402Data,
    checkSufficientBalance
  };
}
