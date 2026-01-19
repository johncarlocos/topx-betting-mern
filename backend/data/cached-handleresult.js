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
      // Return full cached result (including team logos and all data)
      const result = cached.cachedData.fullResult || {
        homeWinRate: cached.cachedData.homeWinRate,
        awayWinRate: cached.cachedData.awayWinRate
      };
      
      // If cached result is incomplete (no fullResult), treat as cache miss to fetch fresh data
      if (!cached.cachedData.fullResult) {
        await TelemetryService.log('warn', 'Cached data incomplete, fetching fresh data', { matchId: id });
        // Continue to fetch fresh data below
      } else {
        // Complete cache hit - return full result
        // Also cache in Redis for faster future access (55 minutes TTL)
        await RedisCache.set(redisKey, result, 3300);
        
        await TelemetryService.log('info', 'MongoDB cache hit (full result)', {
          matchId: id,
          ttl: cached.cachedData.expiresAt - Date.now()
        });
        return result;
      }
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

    // Validate result before caching
    if (!result) {
      await TelemetryService.log('error', 'handleResult returned null', { matchId: id });
      // Check if we have cached data we can use as fallback
      const cached = await Match.findOne({ id }).lean();
      if (cached?.cachedData?.fullResult) {
        await TelemetryService.log('info', 'Using cached data as fallback', { matchId: id });
        return cached.cachedData.fullResult;
      }
      throw new Error(`Failed to fetch match data for ${id}`);
    }
    
    // If win rates are null/undefined, we still have team names/logos which is useful
    // Allow partial results to be cached (team info without win rates)
    if (result.homeWinRate === null || result.awayWinRate === null) {
      await TelemetryService.log('warn', 'Match data incomplete (no odds available)', { 
        matchId: id,
        hasTeamNames: !!result.homeTeamName,
        hasLogos: !!(result.homeTeamLogo || result.awayTeamLogo)
      });
      // Don't cache incomplete results - return them but don't update cache
      return result;
    }

    // Only cache if we have complete data (win rates available)
    if (result.homeWinRate !== null && result.awayWinRate !== null) {
      // Update both Redis and MongoDB cache
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour
      
      // Update Redis cache (55 minutes TTL to be slightly less than MongoDB)
      await RedisCache.set(redisKey, result, 3300);
      
      // Update MongoDB cache with FULL result (including team logos)
      await Match.findOneAndUpdate(
        { id },
        {
          $set: {
            cachedData: {
              homeWinRate: result.homeWinRate,
              awayWinRate: result.awayWinRate,
              fullResult: result, // Store complete result for future cache hits
              expiresAt
            }
          }
        },
        { upsert: true, new: true }
      );

      await TelemetryService.log('info', 'Cache updated successfully', { matchId: id });
    } else {
      await TelemetryService.log('info', 'Skipping cache update for incomplete match data', { matchId: id });
    }
    
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
