/**
 * Weather API Rate Limiter
 *
 * Implements heavy rate limiting for weather API calls to ensure no more than
 * one call every 15 minutes per location. Uses persistent storage to maintain
 * rate limit state across application restarts.
 *
 * @fileoverview Weather API rate limiter with 15-minute intervals
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface WeatherRateLimitEntry {
  location: string;
  lastCallTime: number;
  callCount: number;
  resetTime: number;
}

export interface WeatherRateLimitConfig {
  maxCallsPerInterval: number;
  intervalMs: number; // 15 minutes = 900,000 ms
  storagePath: string;
}

export class WeatherRateLimiter {
  private config: WeatherRateLimitConfig;
  private rateLimitData: Map<string, WeatherRateLimitEntry> = new Map();
  private storageFile: string;

  constructor(config?: Partial<WeatherRateLimitConfig>) {
    this.config = {
      maxCallsPerInterval: 1, // Only 1 call per interval
      intervalMs: 15 * 60 * 1000, // 15 minutes
      storagePath: join(process.cwd(), 'data'),
      ...config,
    };

    this.storageFile = join(this.config.storagePath, 'weather-rate-limits.json');
    this.loadRateLimitData();
    
    // Clean up expired entries on startup
    this.cleanupExpiredEntries();
  }

  /**
   * Check if a weather API call is allowed for the given location
   */
  canMakeCall(location: string): boolean {
    const now = Date.now();
    const entry = this.rateLimitData.get(location);

    if (!entry) {
      // First call for this location
      return true;
    }

    // Check if we're still within the rate limit window
    if (now < entry.resetTime) {
      // Still within the window, check if we've exceeded the limit
      return entry.callCount < this.config.maxCallsPerInterval;
    }

    // Window has expired, allow the call
    return true;
  }

  /**
   * Record a weather API call for the given location
   */
  recordCall(location: string): void {
    const now = Date.now();
    const resetTime = now + this.config.intervalMs;

    const entry: WeatherRateLimitEntry = {
      location,
      lastCallTime: now,
      callCount: 1,
      resetTime,
    };

    this.rateLimitData.set(location, entry);
    this.saveRateLimitData();
  }

  /**
   * Get the time until the next call is allowed for a location
   */
  getTimeUntilNextCall(location: string): number {
    const entry = this.rateLimitData.get(location);
    
    if (!entry) {
      return 0; // No previous calls, can call immediately
    }

    const now = Date.now();
    if (now >= entry.resetTime) {
      return 0; // Rate limit window has expired
    }

    return entry.resetTime - now;
  }

  /**
   * Get rate limit status for a location
   */
  getRateLimitStatus(location: string): {
    canCall: boolean;
    timeUntilNextCall: number;
    callsRemaining: number;
    resetTime: number;
  } {
    const canCall = this.canMakeCall(location);
    const timeUntilNextCall = this.getTimeUntilNextCall(location);
    const entry = this.rateLimitData.get(location);
    
    const callsRemaining = entry && timeUntilNextCall > 0 
      ? Math.max(0, this.config.maxCallsPerInterval - entry.callCount)
      : this.config.maxCallsPerInterval;

    return {
      canCall,
      timeUntilNextCall,
      callsRemaining,
      resetTime: entry?.resetTime || 0,
    };
  }

  /**
   * Get all rate limit entries (for debugging/admin purposes)
   */
  getAllRateLimits(): WeatherRateLimitEntry[] {
    return Array.from(this.rateLimitData.values());
  }

  /**
   * Reset rate limit for a specific location
   */
  resetLocation(location: string): void {
    this.rateLimitData.delete(location);
    this.saveRateLimitData();
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.rateLimitData.clear();
    this.saveRateLimitData();
  }

  /**
   * Load rate limit data from persistent storage
   */
  private loadRateLimitData(): void {
    try {
      if (existsSync(this.storageFile)) {
        const data = readFileSync(this.storageFile, 'utf8');
        const entries: WeatherRateLimitEntry[] = JSON.parse(data);
        
        // Convert array back to Map
        entries.forEach(entry => {
          this.rateLimitData.set(entry.location, entry);
        });
        
        console.log(`Loaded ${entries.length} weather rate limit entries`);
      }
    } catch (error) {
      console.warn('Failed to load weather rate limit data:', error);
      // Continue with empty data
    }
  }

  /**
   * Save rate limit data to persistent storage
   */
  private saveRateLimitData(): void {
    try {
      // Ensure directory exists
      if (!existsSync(this.config.storagePath)) {
        mkdirSync(this.config.storagePath, { recursive: true });
      }

      // Convert Map to array for JSON serialization
      const entries = Array.from(this.rateLimitData.values());
      writeFileSync(this.storageFile, JSON.stringify(entries, null, 2));
    } catch (error) {
      console.error('Failed to save weather rate limit data:', error);
    }
  }

  /**
   * Clean up expired rate limit entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredLocations: string[] = [];

    this.rateLimitData.forEach((entry, location) => {
      if (now >= entry.resetTime) {
        expiredLocations.push(location);
      }
    });

    expiredLocations.forEach(location => {
      this.rateLimitData.delete(location);
    });

    if (expiredLocations.length > 0) {
      console.log(`Cleaned up ${expiredLocations.length} expired weather rate limit entries`);
      this.saveRateLimitData();
    }
  }

  /**
   * Format time duration for human readability
   */
  static formatDuration(ms: number): string {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }
}

// Singleton instance for application-wide use
export const weatherRateLimiter = new WeatherRateLimiter();
