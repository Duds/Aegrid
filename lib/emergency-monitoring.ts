/**
 * Emergency API Monitoring and Logging
 *
 * Comprehensive monitoring, logging, and analytics for emergency APIs
 * Includes performance metrics, usage analytics, and health monitoring
 */

import { NextRequest, NextResponse } from 'next/server';

export interface EmergencyAPIMetrics {
  timestamp: Date;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  organisationId?: string;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  requestSize?: number;
  responseSize?: number;
  errorCode?: string;
  format?: string;
}

export interface EmergencyAPIUsage {
  endpoint: string;
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  errorRate: number;
  uniqueOrganisations: Set<string>;
  uniqueUsers: Set<string>;
  formatUsage: Record<string, number>;
  hourlyDistribution: Record<number, number>;
  lastUpdated: Date;
}

export interface EmergencyAPIHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  lastError?: {
    timestamp: Date;
    endpoint: string;
    error: string;
  };
  checks: {
    database: boolean;
    simulation: boolean;
    external: boolean;
  };
}

class EmergencyAPIMonitor {
  private static instance: EmergencyAPIMonitor;
  private metrics: EmergencyAPIMetrics[] = [];
  private usageStats: Map<string, EmergencyAPIUsage> = new Map();
  private healthChecks: EmergencyAPIHealth = {
    status: 'healthy',
    uptime: 0,
    responseTime: { p50: 0, p95: 0, p99: 0 },
    errorRate: 0,
    checks: {
      database: true,
      simulation: true,
      external: true,
    }
  };
  private startTime: Date = new Date();

  static getInstance(): EmergencyAPIMonitor {
    if (!EmergencyAPIMonitor.instance) {
      EmergencyAPIMonitor.instance = new EmergencyAPIMonitor();
    }
    return EmergencyAPIMonitor.instance;
  }

  // Record API metrics
  recordMetrics(metrics: EmergencyAPIMetrics): void {
    this.metrics.push(metrics);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Update usage statistics
    this.updateUsageStats(metrics);

    // Update health status
    this.updateHealthStatus(metrics);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logMetrics(metrics);
    }

    // Send to external monitoring service
    this.sendToMonitoringService(metrics);
  }

  private updateUsageStats(metrics: EmergencyAPIMetrics): void {
    const key = `${metrics.method}:${metrics.endpoint}`;
    const existing = this.usageStats.get(key) || {
      endpoint: metrics.endpoint,
      totalRequests: 0,
      successRate: 0,
      averageResponseTime: 0,
      errorRate: 0,
      uniqueOrganisations: new Set(),
      uniqueUsers: new Set(),
      formatUsage: {},
      hourlyDistribution: {},
      lastUpdated: new Date(),
    };

    existing.totalRequests++;
    existing.successRate = (existing.successRate * (existing.totalRequests - 1) +
      (metrics.statusCode >= 200 && metrics.statusCode < 300 ? 1 : 0)) / existing.totalRequests;
    existing.averageResponseTime = (existing.averageResponseTime * (existing.totalRequests - 1) +
      metrics.responseTime) / existing.totalRequests;
    existing.errorRate = (existing.errorRate * (existing.totalRequests - 1) +
      (metrics.statusCode >= 400 ? 1 : 0)) / existing.totalRequests;

    if (metrics.organisationId) {
      existing.uniqueOrganisations.add(metrics.organisationId);
    }
    if (metrics.userId) {
      existing.uniqueUsers.add(metrics.userId);
    }
    if (metrics.format) {
      existing.formatUsage[metrics.format] = (existing.formatUsage[metrics.format] || 0) + 1;
    }

    const hour = new Date().getHours();
    existing.hourlyDistribution[hour] = (existing.hourlyDistribution[hour] || 0) + 1;
    existing.lastUpdated = new Date();

    this.usageStats.set(key, existing);
  }

  private updateHealthStatus(metrics: EmergencyAPIMetrics): void {
    // Update response time percentiles
    const recentMetrics = this.metrics.slice(-100); // Last 100 requests
    if (recentMetrics.length > 0) {
      const responseTimes = recentMetrics.map(m => m.responseTime).sort((a, b) => a - b);
      this.healthChecks.responseTime.p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
      this.healthChecks.responseTime.p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
      this.healthChecks.responseTime.p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];

      // Update error rate
      const errorCount = recentMetrics.filter(m => m.statusCode >= 400).length;
      this.healthChecks.errorRate = errorCount / recentMetrics.length;

      // Update status
      if (this.healthChecks.errorRate > 0.1 || this.healthChecks.responseTime.p95 > 5000) {
        this.healthChecks.status = 'unhealthy';
      } else if (this.healthChecks.errorRate > 0.05 || this.healthChecks.responseTime.p95 > 2000) {
        this.healthChecks.status = 'degraded';
      } else {
        this.healthChecks.status = 'healthy';
      }

      // Update last error
      if (metrics.statusCode >= 400) {
        this.healthChecks.lastError = {
          timestamp: metrics.timestamp,
          endpoint: metrics.endpoint,
          error: `${metrics.statusCode}: ${metrics.errorCode || 'Unknown error'}`
        };
      }
    }

    // Update uptime
    this.healthChecks.uptime = Date.now() - this.startTime.getTime();
  }

  private logMetrics(metrics: EmergencyAPIMetrics): void {
    const status = metrics.statusCode >= 200 && metrics.statusCode < 300 ? '✅' : '❌';
    const format = metrics.format ? ` (${metrics.format})` : '';
    console.log(`📊 ${status} ${metrics.method} ${metrics.endpoint}${format} - ${metrics.statusCode} (${metrics.responseTime}ms)`);

    if (metrics.errorCode) {
      console.log(`   Error: ${metrics.errorCode}`);
    }
  }

  private sendToMonitoringService(metrics: EmergencyAPIMetrics): void {
    // In production, send to your monitoring service (e.g., Application Insights, DataDog, etc.)
    if (process.env.EMERGENCY_MONITORING_ENDPOINT) {
      fetch(process.env.EMERGENCY_MONITORING_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...metrics,
          service: 'emergency-api',
          environment: process.env.NODE_ENV,
        }),
      }).catch(err => {
        console.error('Failed to send metrics to monitoring service:', err);
      });
    }
  }

  // Get usage statistics
  getUsageStats(): Map<string, EmergencyAPIUsage> {
    return new Map(this.usageStats);
  }

  // Get health status
  getHealthStatus(): EmergencyAPIHealth {
    return { ...this.healthChecks };
  }

  // Get recent metrics
  getRecentMetrics(limit: number = 100): EmergencyAPIMetrics[] {
    return this.metrics.slice(-limit);
  }

  // Reset metrics (for testing)
  resetMetrics(): void {
    this.metrics = [];
    this.usageStats.clear();
    this.healthChecks = {
      status: 'healthy',
      uptime: 0,
      responseTime: { p50: 0, p95: 0, p99: 0 },
      errorRate: 0,
      checks: {
        database: true,
        simulation: true,
        external: true,
      }
    };
    this.startTime = new Date();
  }
}

// Middleware function to wrap emergency API endpoints
export function withEmergencyMonitoring(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const monitor = EmergencyAPIMonitor.getInstance();
    const startTime = Date.now();

    let response: NextResponse;
    let errorCode: string | undefined;

    try {
      response = await handler(request);
    } catch (error) {
      errorCode = error instanceof Error ? error.name : 'UnknownError';
      throw error; // Re-throw to be handled by error middleware
    } finally {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Extract metrics from request and response
      const url = new URL(request.url);
      const metrics: EmergencyAPIMetrics = {
        timestamp: new Date(),
        endpoint: url.pathname,
        method: request.method,
        statusCode: response?.status || 500,
        responseTime,
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.headers.get('x-forwarded-for') ||
                  request.headers.get('x-real-ip') ||
                  'unknown',
        requestSize: parseInt(request.headers.get('content-length') || '0'),
        responseSize: parseInt(response?.headers.get('content-length') || '0'),
        errorCode,
        format: url.searchParams.get('format') || undefined,
      };

      monitor.recordMetrics(metrics);
    }

    return response;
  };
}

// Health check endpoint data
export function getEmergencyAPIHealthData(): {
  health: EmergencyAPIHealth;
  usage: Record<string, any>;
  metrics: EmergencyAPIMetrics[];
} {
  const monitor = EmergencyAPIMonitor.getInstance();

  return {
    health: monitor.getHealthStatus(),
    usage: Object.fromEntries(
      Array.from(monitor.getUsageStats().entries()).map(([key, value]) => [
        key,
        {
          ...value,
          uniqueOrganisations: value.uniqueOrganisations.size,
          uniqueUsers: value.uniqueUsers.size,
        }
      ])
    ),
    metrics: monitor.getRecentMetrics(50),
  };
}

// Performance monitoring decorator
export function measurePerformance<T extends any[], R>(
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor
): PropertyDescriptor {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: T): Promise<R> {
    const startTime = Date.now();
    const monitor = EmergencyAPIMonitor.getInstance();

    try {
      const result = await originalMethod.apply(this, args);
      const endTime = Date.now();

      monitor.recordMetrics({
        timestamp: new Date(),
        endpoint: `${target.constructor.name}.${propertyKey}`,
        method: 'FUNCTION',
        statusCode: 200,
        responseTime: endTime - startTime,
      });

      return result;
    } catch (error) {
      const endTime = Date.now();

      monitor.recordMetrics({
        timestamp: new Date(),
        endpoint: `${target.constructor.name}.${propertyKey}`,
        method: 'FUNCTION',
        statusCode: 500,
        responseTime: endTime - startTime,
        errorCode: error instanceof Error ? error.name : 'UnknownError',
      });

      throw error;
    }
  };

  return descriptor;
}

export default EmergencyAPIMonitor;
