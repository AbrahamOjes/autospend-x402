// error-handler.js - Centralized error handling and user-friendly messages

/**
 * Error types for categorization
 */
const ErrorTypes = {
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WRONG_NETWORK: 'WRONG_NETWORK',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  USER_REJECTED: 'USER_REJECTED',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  NO_X402: 'NO_X402',
  UNKNOWN: 'UNKNOWN'
};

/**
 * User-friendly error messages with actionable guidance
 */
const ErrorMessages = {
  [ErrorTypes.WALLET_NOT_FOUND]: {
    title: 'Wallet Not Found',
    message: 'No cryptocurrency wallet detected in your browser.',
    action: 'Please install Coinbase Wallet extension to continue.',
    actionUrl: 'https://www.coinbase.com/wallet',
    severity: 'error'
  },
  [ErrorTypes.WALLET_NOT_CONNECTED]: {
    title: 'Wallet Not Connected',
    message: 'Your wallet is not connected to this site.',
    action: 'Click "Connect Wallet" to authorize access.',
    severity: 'warning'
  },
  [ErrorTypes.WRONG_NETWORK]: {
    title: 'Wrong Network',
    message: 'Your wallet is connected to the wrong blockchain network.',
    action: 'Please switch to Base Sepolia network in your wallet settings.',
    severity: 'warning'
  },
  [ErrorTypes.INSUFFICIENT_BALANCE]: {
    title: 'Insufficient Balance',
    message: 'You don\'t have enough USDC to complete this payment.',
    action: 'Add USDC to your wallet or get test tokens from the faucet.',
    actionUrl: 'https://faucet.circle.com/',
    severity: 'error'
  },
  [ErrorTypes.INVALID_AMOUNT]: {
    title: 'Invalid Amount',
    message: 'The payment amount is not valid.',
    action: 'Please check the payment details and try again.',
    severity: 'error'
  },
  [ErrorTypes.USER_REJECTED]: {
    title: 'Transaction Cancelled',
    message: 'You cancelled the transaction in your wallet.',
    action: 'Click "Make Payment" again when you\'re ready to proceed.',
    severity: 'info'
  },
  [ErrorTypes.TRANSACTION_FAILED]: {
    title: 'Transaction Failed',
    message: 'The blockchain transaction could not be completed.',
    action: 'Please check your wallet and try again. If the problem persists, contact support.',
    severity: 'error'
  },
  [ErrorTypes.CONNECTION_TIMEOUT]: {
    title: 'Connection Timeout',
    message: 'The connection to your wallet timed out.',
    action: 'Please refresh the page and try again.',
    severity: 'warning'
  },
  [ErrorTypes.NO_X402]: {
    title: 'No Payment Required',
    message: 'This page does not require a payment.',
    action: 'Navigate to a page with X402 payment requirements.',
    severity: 'info'
  },
  [ErrorTypes.UNKNOWN]: {
    title: 'Unexpected Error',
    message: 'An unexpected error occurred.',
    action: 'Please try again. If the problem persists, contact support.',
    severity: 'error'
  }
};

/**
 * Classify error based on error message or code
 * @param {Error|string} error - Error object or message
 * @returns {string} Error type
 */
function classifyError(error) {
  const errorMessage = typeof error === 'string' ? error : error.message || '';
  const lowerMessage = errorMessage.toLowerCase();
  
  // Check for specific error patterns
  if (lowerMessage.includes('no wallet') || lowerMessage.includes('no ethereum provider')) {
    return ErrorTypes.WALLET_NOT_FOUND;
  }
  
  if (lowerMessage.includes('not connected') || lowerMessage.includes('no accounts')) {
    return ErrorTypes.WALLET_NOT_CONNECTED;
  }
  
  if (lowerMessage.includes('wrong network') || lowerMessage.includes('switch to') || lowerMessage.includes('chain')) {
    return ErrorTypes.WRONG_NETWORK;
  }
  
  if (lowerMessage.includes('insufficient') || lowerMessage.includes('balance') || lowerMessage.includes('exceeds balance')) {
    return ErrorTypes.INSUFFICIENT_BALANCE;
  }
  
  if (lowerMessage.includes('invalid amount') || lowerMessage.includes('amount must be')) {
    return ErrorTypes.INVALID_AMOUNT;
  }
  
  if (lowerMessage.includes('user rejected') || lowerMessage.includes('user denied') || lowerMessage.includes('cancelled')) {
    return ErrorTypes.USER_REJECTED;
  }
  
  if (lowerMessage.includes('transaction failed') || lowerMessage.includes('reverted')) {
    return ErrorTypes.TRANSACTION_FAILED;
  }
  
  if (lowerMessage.includes('timeout') || lowerMessage.includes('timed out')) {
    return ErrorTypes.CONNECTION_TIMEOUT;
  }
  
  if (lowerMessage.includes('no payment') || lowerMessage.includes('no x402')) {
    return ErrorTypes.NO_X402;
  }
  
  return ErrorTypes.UNKNOWN;
}

/**
 * Get user-friendly error information
 * @param {Error|string} error - Error object or message
 * @param {object} context - Additional context (balance, amount, etc.)
 * @returns {object} Error information with user-friendly message
 */
function getUserFriendlyError(error, context = {}) {
  const errorType = classifyError(error);
  const errorInfo = ErrorMessages[errorType];
  
  let message = errorInfo.message;
  let action = errorInfo.action;
  
  // Customize message based on context
  if (errorType === ErrorTypes.INSUFFICIENT_BALANCE && context.balance !== undefined && context.amount !== undefined) {
    message = `You have ${context.balance.toFixed(2)} USDC but need ${context.amount} USDC to complete this payment.`;
  }
  
  return {
    type: errorType,
    title: errorInfo.title,
    message: message,
    action: action,
    actionUrl: errorInfo.actionUrl || null,
    severity: errorInfo.severity,
    originalError: typeof error === 'string' ? error : error.message,
    timestamp: Date.now()
  };
}

/**
 * Format error for display in UI
 * @param {object} errorInfo - Error information from getUserFriendlyError
 * @returns {string} Formatted HTML string
 */
function formatErrorForDisplay(errorInfo) {
  const severityEmoji = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  const emoji = severityEmoji[errorInfo.severity] || '❌';
  
  let html = `<div class="error-display error-${errorInfo.severity}">`;
  html += `<div class="error-title">${emoji} ${errorInfo.title}</div>`;
  html += `<div class="error-message">${errorInfo.message}</div>`;
  
  if (errorInfo.action) {
    if (errorInfo.actionUrl) {
      html += `<div class="error-action"><a href="${errorInfo.actionUrl}" target="_blank">${errorInfo.action}</a></div>`;
    } else {
      html += `<div class="error-action">${errorInfo.action}</div>`;
    }
  }
  
  html += `</div>`;
  
  return html;
}

/**
 * Log error with appropriate level
 * @param {object} errorInfo - Error information from getUserFriendlyError
 */
function logError(errorInfo) {
  const logMethod = errorInfo.severity === 'error' ? console.error : 
                    errorInfo.severity === 'warning' ? console.warn : 
                    console.log;
  
  logMethod(`[${errorInfo.type}] ${errorInfo.title}: ${errorInfo.message}`);
  if (errorInfo.originalError) {
    console.debug('Original error:', errorInfo.originalError);
  }
}

/**
 * Handle error with logging and user notification
 * @param {Error|string} error - Error to handle
 * @param {object} context - Additional context
 * @returns {object} Error information
 */
function handleError(error, context = {}) {
  const errorInfo = getUserFriendlyError(error, context);
  logError(errorInfo);
  return errorInfo;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ErrorTypes,
    ErrorMessages,
    classifyError,
    getUserFriendlyError,
    formatErrorForDisplay,
    logError,
    handleError
  };
}

// Export for browser usage
if (typeof window !== 'undefined') {
  window.ErrorHandler = {
    ErrorTypes,
    ErrorMessages,
    classifyError,
    getUserFriendlyError,
    formatErrorForDisplay,
    logError,
    handleError
  };
}
