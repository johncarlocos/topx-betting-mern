/**
 * Logger utility - replaces console.log for better production performance
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

class Logger {
  /**
   * Log info messages (only in development)
   */
  static info(...args) {
    if (!isProduction) {
      console.log('[INFO]', ...args);
    }
  }

  /**
   * Log debug messages (only in development)
   */
  static debug(...args) {
    if (isDevelopment) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Log warnings (always logged)
   */
  static warn(...args) {
    console.warn('[WARN]', ...args);
  }

  /**
   * Log errors (always logged)
   */
  static error(...args) {
    console.error('[ERROR]', ...args);
  }

  /**
   * Time operations (only in development)
   */
  static time(label) {
    if (!isProduction) {
      console.time(label);
    }
  }

  /**
   * End time operations (only in development)
   */
  static timeEnd(label) {
    if (!isProduction) {
      console.timeEnd(label);
    }
  }
}

module.exports = Logger;

