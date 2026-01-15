const Redis = require('ioredis');

// Create Redis client with connection options
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Redis connected successfully');
  }
});

redis.on('error', (err) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Redis connection error:', err);
  }
});

// Ensure connection is established
redis.connect().catch(() => {
  // Will retry automatically
});

/**
 * Redis Cache Service
 */
class RedisCache {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>}
   */
  static async get(key) {
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      // Fallback gracefully if Redis fails
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   * @param {string} key - Cache key
   * @param {any} value - Value to cache
   * @param {number} ttlSeconds - Time to live in seconds
   * @returns {Promise<boolean>}
   */
  static async set(key, value, ttlSeconds = 3600) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      // Fallback gracefully if Redis fails
      return false;
    }
  }

  /**
   * Delete key from cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  static async delete(key) {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Delete multiple keys matching pattern
   * @param {string} pattern - Pattern to match (e.g., 'match:*')
   * @returns {Promise<number>}
   */
  static async deletePattern(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return keys.length;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if key exists
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  static async exists(key) {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get TTL for a key
   * @param {string} key - Cache key
   * @returns {Promise<number>} - TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  static async getTTL(key) {
    try {
      return await redis.ttl(key);
    } catch (error) {
      return -2;
    }
  }
}

module.exports = { redis, RedisCache };

