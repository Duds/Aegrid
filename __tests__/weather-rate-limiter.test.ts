/**
 * Weather Rate Limiter Tests
 *
 * Tests the weather API rate limiting functionality to ensure
 * no more than one call every 15 minutes per location.
 *
 * @fileoverview Weather rate limiter test suite
 */

import { WeatherRateLimiter } from '@/lib/external-apis/weather-rate-limiter';

describe('Weather Rate Limiter', () => {
  let rateLimiter: WeatherRateLimiter;

  beforeEach(() => {
    // Create a new rate limiter instance for each test
    rateLimiter = new WeatherRateLimiter({
      maxCallsPerInterval: 1,
      intervalMs: 15 * 60 * 1000, // 15 minutes
      storagePath: '/tmp/test-data',
    });
  });

  afterEach(() => {
    // Clean up test data
    rateLimiter.resetAll();
  });

  describe('Basic Rate Limiting', () => {
    it('should allow first call for a location', () => {
      const location = 'Sydney';
      expect(rateLimiter.canMakeCall(location)).toBe(true);
    });

    it('should block subsequent calls within the interval', () => {
      const location = 'Sydney';
      
      // First call should be allowed
      expect(rateLimiter.canMakeCall(location)).toBe(true);
      rateLimiter.recordCall(location);
      
      // Second call should be blocked
      expect(rateLimiter.canMakeCall(location)).toBe(false);
    });

    it('should allow calls after the interval expires', () => {
      const location = 'Sydney';
      
      // First call
      expect(rateLimiter.canMakeCall(location)).toBe(true);
      rateLimiter.recordCall(location);
      
      // Mock time passing by creating a new rate limiter with shorter interval
      const shortIntervalLimiter = new WeatherRateLimiter({
        maxCallsPerInterval: 1,
        intervalMs: 100, // 100ms for testing
        storagePath: '/tmp/test-data',
      });
      
      // Should be blocked initially
      expect(shortIntervalLimiter.canMakeCall(location)).toBe(false);
      
      // Wait for interval to expire
      setTimeout(() => {
        expect(shortIntervalLimiter.canMakeCall(location)).toBe(true);
      }, 150);
    });
  });

  describe('Rate Limit Status', () => {
    it('should return correct status for new location', () => {
      const location = 'Melbourne';
      const status = rateLimiter.getRateLimitStatus(location);
      
      expect(status.canCall).toBe(true);
      expect(status.timeUntilNextCall).toBe(0);
      expect(status.callsRemaining).toBe(1);
      expect(status.resetTime).toBe(0);
    });

    it('should return correct status after recording a call', () => {
      const location = 'Melbourne';
      
      // Record a call
      rateLimiter.recordCall(location);
      
      const status = rateLimiter.getRateLimitStatus(location);
      
      expect(status.canCall).toBe(false);
      expect(status.timeUntilNextCall).toBeGreaterThan(0);
      expect(status.callsRemaining).toBe(0);
      expect(status.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe('Multiple Locations', () => {
    it('should track rate limits independently for different locations', () => {
      const location1 = 'Sydney';
      const location2 = 'Melbourne';
      
      // Record call for location1
      rateLimiter.recordCall(location1);
      
      // location1 should be blocked
      expect(rateLimiter.canMakeCall(location1)).toBe(false);
      
      // location2 should still be allowed
      expect(rateLimiter.canMakeCall(location2)).toBe(true);
    });

    it('should allow calls for different locations simultaneously', () => {
      const locations = ['Sydney', 'Melbourne', 'Brisbane'];
      
      // All locations should be allowed initially
      locations.forEach(location => {
        expect(rateLimiter.canMakeCall(location)).toBe(true);
      });
      
      // Record calls for all locations
      locations.forEach(location => {
        rateLimiter.recordCall(location);
      });
      
      // All locations should now be blocked
      locations.forEach(location => {
        expect(rateLimiter.canMakeCall(location)).toBe(false);
      });
    });
  });

  describe('Reset Functionality', () => {
    it('should reset rate limit for specific location', () => {
      const location = 'Sydney';
      
      // Record a call
      rateLimiter.recordCall(location);
      expect(rateLimiter.canMakeCall(location)).toBe(false);
      
      // Reset the location
      rateLimiter.resetLocation(location);
      
      // Should be allowed again
      expect(rateLimiter.canMakeCall(location)).toBe(true);
    });

    it('should reset all rate limits', () => {
      const locations = ['Sydney', 'Melbourne', 'Brisbane'];
      
      // Record calls for all locations
      locations.forEach(location => {
        rateLimiter.recordCall(location);
      });
      
      // All should be blocked
      locations.forEach(location => {
        expect(rateLimiter.canMakeCall(location)).toBe(false);
      });
      
      // Reset all
      rateLimiter.resetAll();
      
      // All should be allowed again
      locations.forEach(location => {
        expect(rateLimiter.canMakeCall(location)).toBe(true);
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format duration correctly', () => {
      expect(WeatherRateLimiter.formatDuration(0)).toBe('0s');
      expect(WeatherRateLimiter.formatDuration(5000)).toBe('5s');
      expect(WeatherRateLimiter.formatDuration(60000)).toBe('1m 0s');
      expect(WeatherRateLimiter.formatDuration(90000)).toBe('1m 30s');
      expect(WeatherRateLimiter.formatDuration(900000)).toBe('15m 0s');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty location names', () => {
      const location = '';
      expect(rateLimiter.canMakeCall(location)).toBe(true);
      rateLimiter.recordCall(location);
      expect(rateLimiter.canMakeCall(location)).toBe(false);
    });

    it('should handle special characters in location names', () => {
      const location = 'Sydney, NSW';
      expect(rateLimiter.canMakeCall(location)).toBe(true);
      rateLimiter.recordCall(location);
      expect(rateLimiter.canMakeCall(location)).toBe(false);
    });

    it('should handle very long location names', () => {
      const location = 'A'.repeat(1000);
      expect(rateLimiter.canMakeCall(location)).toBe(true);
      rateLimiter.recordCall(location);
      expect(rateLimiter.canMakeCall(location)).toBe(false);
    });
  });

  describe('Integration with Weather Client', () => {
    it('should work with coordinate-based location keys', () => {
      const locationKey = '-33.8688,151.2093'; // Sydney coordinates
      
      expect(rateLimiter.canMakeCall(locationKey)).toBe(true);
      rateLimiter.recordCall(locationKey);
      expect(rateLimiter.canMakeCall(locationKey)).toBe(false);
      
      const status = rateLimiter.getRateLimitStatus(locationKey);
      expect(status.canCall).toBe(false);
      expect(status.timeUntilNextCall).toBeGreaterThan(0);
    });
  });
});
