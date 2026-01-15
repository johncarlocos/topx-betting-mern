const { handleResult } = require('../handleResult');
const { Match } = require('../models/match.model');
const { MongoRateLimiter } = require('../utils/rateLimiter');
const TelemetryService = require('../services/telemetry.service');
const { RedisCache } = require('../utils/redis');

// Initialize rate limiter: 10/minute with fixed clientId
const resultLimiter = new MongoRateLimiter({
  limit: 10,
  windowMs: 60 * 1000,
  clientId: "global" // This should match the default value in schema
});

async function cachedHandleResult(id) {
  try {
    await TelemetryService.log('debug', 'Starting cache check', { matchId: id });
    
    // Try Redis cache first (much faster)
    const redisKey = `match:result:${id}`;
    const redisCached = await RedisCache.get(redisKey);
    
    if (redisCached) {
      await TelemetryService.log('info', 'Redis cache hit', { matchId: id });
      return redisCached;
    }
    
    // Fallback to MongoDB cache
    const cached = await Match.findOne({
      id,
      'cachedData.expiresAt': { $gt: new Date() }
    }).lean();

    if (cached?.cachedData) {
      const result = {
        homeWinRate: cached.cachedData.homeWinRate,
        awayWinRate: cached.cachedData.awayWinRate
      };
      
      // Also cache in Redis for faster future access (55 minutes TTL)
      await RedisCache.set(redisKey, result, 3300);
      
      await TelemetryService.log('info', 'MongoDB cache hit', {
        matchId: id,
        ttl: cached.cachedData.expiresAt - Date.now()
      });
      return result;
    }

    await TelemetryService.log('debug', 'Cache miss', { matchId: id });

    // Apply rate limiting
    const limitCheck = await resultLimiter.checkRateLimit();
    if (!limitCheck.allowed) {
      await TelemetryService.log('warn', 'Rate limit exceeded', {
        matchId: id,
        retryAfter: limitCheck.retryAfter,
        limit: resultLimiter.limit,
        window: resultLimiter.windowMs
      });
      throw new Error(`Rate limit exceeded. Try again in ${limitCheck.retryAfter} seconds`);
    }

    await TelemetryService.log('debug', 'Rate limit check passed', {
      matchId: id,
      remaining: resultLimiter.limit - limitCheck.count
    });

    // Fetch fresh data
    await TelemetryService.log('info', 'Fetching fresh data', { matchId: id });
    const result = await handleResult(id);

    // Update both Redis and MongoDB cache
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour
    
    // Update Redis cache (55 minutes TTL to be slightly less than MongoDB)
    await RedisCache.set(redisKey, result, 3300);
    
    // Update MongoDB cache
    await Match.findOneAndUpdate(
      { id },
      {
        $set: {
          cachedData: {
            homeWinRate: result.homeWinRate,
            awayWinRate: result.awayWinRate,
            expiresAt
          }
        }
      },
      { upsert: true, new: true }
    );

    await TelemetryService.log('info', 'Cache updated successfully', { matchId: id });
    return result;

  } catch (error) {
    await TelemetryService.log('error', 'CachedHandleResult error', {
      matchId: id,
      error: error.message,
      stack: error.stack?.split('\n')[0] // First line of stack trace only
    });
    throw error;
  }
}

module.exports = { cachedHandleResult };
