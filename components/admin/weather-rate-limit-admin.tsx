/**
 * Weather Rate Limit Admin Component
 *
 * Provides administrative interface for monitoring and managing
 * weather API rate limits across all locations.
 *
 * @component WeatherRateLimitAdmin
 * @example
 * ```tsx
 * <WeatherRateLimitAdmin />
 * ```
 * @accessibility
 * - ARIA roles: [main, table, button]
 * - Keyboard navigation: Full keyboard support
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, AlertCircle, CheckCircle } from 'lucide-react';

interface RateLimitStatus {
  location: string;
  coordinates: string;
  canCall: boolean;
  timeUntilNextCall: number;
  callsRemaining: number;
  resetTime: number;
}

interface RateLimitInfo {
  maxCallsPerInterval: number;
  intervalMinutes: number;
  description: string;
}

export default function WeatherRateLimitAdmin() {
  const [rateLimitStatus, setRateLimitStatus] = useState<RateLimitStatus[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRateLimitStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/external/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_rate_limit_status' }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rate limit status');
      }

      const data = await response.json();
      setRateLimitStatus(data.rateLimitStatus);
      setRateLimitInfo(data.rateLimitInfo);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const resetRateLimit = async (location: string) => {
    try {
      const response = await fetch('/api/external/weather', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_rate_limit', location }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset rate limit');
      }

      // Refresh the status after reset
      await fetchRateLimitStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchRateLimitStatus();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchRateLimitStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatTimeUntilNextCall = (ms: number): string => {
    if (ms <= 0) return 'Available now';
    
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatResetTime = (timestamp: number): string => {
    if (timestamp === 0) return 'Not set';
    
    const date = new Date(timestamp);
    return date.toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      hour12: false,
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weather Rate Limit Status
          </CardTitle>
          <CardDescription>
            Loading rate limit information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weather Rate Limit Status
          </CardTitle>
          <CardDescription>
            Monitor and manage weather API rate limits across all locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              {rateLimitInfo && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {rateLimitInfo.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max calls per interval: {rateLimitInfo.maxCallsPerInterval} | 
                    Interval: {rateLimitInfo.intervalMinutes} minutes
                  </p>
                </>
              )}
            </div>
            <Button
              onClick={fetchRateLimitStatus}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Error</span>
              </div>
              <p className="text-sm text-destructive mt-1">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            {rateLimitStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No rate limit data available
              </p>
            ) : (
              rateLimitStatus.map((status) => (
                <div
                  key={status.location}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{status.location}</h3>
                      <Badge
                        variant={status.canCall ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {status.canCall ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Available
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3 mr-1" />
                            Rate Limited
                          </>
                        )}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Coordinates: {status.coordinates}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Calls remaining: {status.callsRemaining} | 
                      Next call in: {formatTimeUntilNextCall(status.timeUntilNextCall)}
                    </p>
                    {status.resetTime > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Reset time: {formatResetTime(status.resetTime)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!status.canCall && (
                      <Button
                        onClick={() => resetRateLimit(status.location)}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Reset Limit
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
