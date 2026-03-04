// logger.js - Centralized logging utility for X402 Payment Extension
// Provides configurable logging with levels and context

// Import constants (will work in module context)
// For non-module contexts, these will be defined inline
const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

class Logger {
  constructor(context = 'X402', level = LOG_LEVELS.INFO) {
    this.context = context;
    this.level = level;
    this.enabled = true;
  }

  /**
   * Set the logging level
   * @param {number} level - One of LOG_LEVELS
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Enable or disable logging
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
  }

  /**
   * Format log message with context and timestamp
   * @private
   */
  _format(level, emoji, ...args) {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    return [`${emoji} [${this.context}] ${timestamp}:`, ...args];
  }

  /**
   * Log debug message (lowest priority)
   */
  debug(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.DEBUG) {
      console.log(...this._format('DEBUG', '🔍', ...args));
    }
  }

  /**
   * Log info message
   */
  info(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.INFO) {
      console.log(...this._format('INFO', 'ℹ️', ...args));
    }
  }

  /**
   * Log warning message
   */
  warn(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.WARN) {
      console.warn(...this._format('WARN', '⚠️', ...args));
    }
  }

  /**
   * Log error message
   */
  error(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.ERROR) {
      console.error(...this._format('ERROR', '❌', ...args));
    }
  }

  /**
   * Log success message (uses info level)
   */
  success(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.INFO) {
      console.log(...this._format('SUCCESS', '✅', ...args));
    }
  }

  /**
   * Log payment-related message
   */
  payment(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.INFO) {
      console.log(...this._format('PAYMENT', '💰', ...args));
    }
  }

  /**
   * Log wallet-related message
   */
  wallet(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.INFO) {
      console.log(...this._format('WALLET', '👛', ...args));
    }
  }

  /**
   * Log bridge-related message
   */
  bridge(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.INFO) {
      console.log(...this._format('BRIDGE', '🌉', ...args));
    }
  }

  /**
   * Log connection-related message
   */
  connection(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.INFO) {
      console.log(...this._format('CONNECTION', '🔌', ...args));
    }
  }

  /**
   * Log transaction-related message
   */
  transaction(...args) {
    if (this.enabled && this.level <= LOG_LEVELS.INFO) {
      console.log(...this._format('TRANSACTION', '📝', ...args));
    }
  }

  /**
   * Create a child logger with a different context
   */
  child(context) {
    return new Logger(`${this.context}:${context}`, this.level);
  }
}

// Create default logger instances for different contexts
const createLogger = (context, level) => new Logger(context, level);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Logger, createLogger, LOG_LEVELS };
}

// Export for ES6 module usage
if (typeof window !== 'undefined') {
  window.Logger = Logger;
  window.createLogger = createLogger;
  window.LOG_LEVELS = LOG_LEVELS;
}
