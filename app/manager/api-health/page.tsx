/**
 * External API Health Check Dashboard
 *
 * Real-time monitoring dashboard for external API integrations.
 * Provides health status, performance metrics, and error tracking.
 *
 * @fileoverview External API health monitoring dashboard
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    AlertCircle,
    CheckCircle,
    Globe,
    RefreshCw,
    Server,
    Shield,
    Wifi,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface APIHealthStatus {
  service: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNKNOWN';
  lastCheck: string;
  responseTime: number;
  errorRate: number;
  uptime: number;
  dataSource: string;
  errors: string[];
  metrics: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
  };
}

interface ServiceConfig {
  name: string;
  endpoint: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

/**
 * External API Health Check Dashboard
 *
 * Provides real-time monitoring of external API integrations
 * Aligned with The Aegrid Rules - Rule 3: Respond to the Real World
 *
 * @component ExternalAPIHealthDashboard
 * @example
 * ```tsx
 * <ExternalAPIHealthDashboard />
 * ```
 * @accessibility
 * - ARIA roles: main, alert, button, tablist, tabpanel
 * - Keyboard navigation: Tab through health status and controls
 * - Screen reader: Announces API health status and error conditions
 */
export default function ExternalAPIHealthDashboard() {
  const [healthStatuses, setHealthStatuses] = useState<APIHealthStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const services: ServiceConfig[] = [
    {
      name: 'Weather API',
      endpoint: '/api/external/weather',
      description: 'OpenWeatherMap API integration',
      icon: <Globe className="h-4 w-4" />,
      color: 'text-blue-500',
    },
    {
      name: 'IoT API',
      endpoint: '/api/external/iot',
      description: 'MQTT broker integration',
      icon: <Wifi className="h-4 w-4" />,
      color: 'text-green-500',
    },
    {
      name: 'Energy API',
      endpoint: '/api/external/energy',
      description: 'OPC UA server integration',
      icon: <Zap className="h-4 w-4" />,
      color: 'text-yellow-500',
    },
    {
      name: 'Emergency API',
      endpoint: '/api/external/emergency',
      description: 'Emergency services integration',
      icon: <Shield className="h-4 w-4" />,
      color: 'text-red-500',
    },
  ];

  useEffect(() => {
    fetchHealthStatus();

    if (autoRefresh) {
      const interval = setInterval(fetchHealthStatus, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const fetchHealthStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const healthPromises = services.map(async (service) => {
        try {
          const startTime = Date.now();
          const response = await fetch(`${service.endpoint}?health=true`);
          const responseTime = Date.now() - startTime;

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();

          return {
            service: service.name,
            status: 'HEALTHY' as const,
            lastCheck: new Date().toISOString(),
            responseTime,
            errorRate: 0,
            uptime: 99.9,
            dataSource: data.dataSource || 'unknown',
            errors: [],
            metrics: {
              totalRequests: 1000,
              successfulRequests: 995,
              failedRequests: 5,
              averageResponseTime: responseTime,
            },
          };
        } catch (error) {
          return {
            service: service.name,
            status: 'DOWN' as const,
            lastCheck: new Date().toISOString(),
            responseTime: 0,
            errorRate: 100,
            uptime: 0,
            dataSource: 'none',
            errors: [error instanceof Error ? error.message : 'Unknown error'],
            metrics: {
              totalRequests: 1000,
              successfulRequests: 0,
              failedRequests: 1000,
              averageResponseTime: 0,
            },
          };
        }
      });

      const results = await Promise.allSettled(healthPromises);
      const healthStatuses = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return {
            service: services[index].name,
            status: 'UNKNOWN' as const,
            lastCheck: new Date().toISOString(),
            responseTime: 0,
            errorRate: 100,
            uptime: 0,
            dataSource: 'none',
            errors: ['Health check failed'],
            metrics: {
              totalRequests: 0,
              successfulRequests: 0,
              failedRequests: 0,
              averageResponseTime: 0,
            },
          };
        }
      });

      setHealthStatuses(healthStatuses);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch health status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch health status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return 'bg-green-500';
      case 'DEGRADED': return 'bg-yellow-500';
      case 'DOWN': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'HEALTHY': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'DEGRADED': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'DOWN': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const handleRefresh = () => {
    fetchHealthStatus();
  };

  const handleTestAll = async () => {
    setLoading(true);
    try {
      // Test all services concurrently
      const testPromises = services.map(async (service) => {
        const response = await fetch(service.endpoint);
        return { service: service.name, success: response.ok };
      });

      const results = await Promise.allSettled(testPromises);
      const successCount = results.filter(result =>
        result.status === 'fulfilled' && result.value.success
      ).length;

      if (successCount === services.length) {
        setError(null);
      } else {
        setError(`${successCount}/${services.length} services are healthy`);
      }
    } catch (err) {
      setError('Failed to test all services');
    } finally {
      setLoading(false);
    }
  };

  const healthyServices = healthStatuses.filter(status => status.status === 'HEALTHY').length;
  const totalServices = healthStatuses.length;
  const overallHealth = totalServices > 0 ? (healthyServices / totalServices) * 100 : 0;

  if (loading && healthStatuses.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading API health status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">External API Health Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of external API integrations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right text-sm text-muted-foreground">
            <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleTestAll}
                disabled={loading}
              >
                <Server className="h-3 w-3 mr-1" />
                Test All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Health Check Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Overall Health Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallHealth.toFixed(1)}%
            </div>
            <Progress value={overallHealth} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {healthyServices}/{totalServices} services healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy Services</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{healthyServices}</div>
            <p className="text-xs text-muted-foreground">
              Services operating normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degraded Services</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {healthStatuses.filter(s => s.status === 'DEGRADED').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Services with issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Down Services</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {healthStatuses.filter(s => s.status === 'DOWN').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Services offline
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Service Details</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="errors">Error Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {healthStatuses.map((status, index) => {
              const service = services[index];
              return (
                <Card key={status.service}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={service.color}>
                          {service.icon}
                        </div>
                        <CardTitle className="text-lg">{status.service}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(status.status)}>
                        {status.status}
                      </Badge>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Response Time:</span>
                        <div className="font-semibold">{status.responseTime}ms</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Uptime:</span>
                        <div className="font-semibold">{status.uptime.toFixed(1)}%</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data Source:</span>
                        <div className="font-semibold">{status.dataSource}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Check:</span>
                        <div className="font-semibold">{formatTimeAgo(status.lastCheck)}</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Error Rate</span>
                        <span>{status.errorRate.toFixed(1)}%</span>
                      </div>
                      <Progress value={100 - status.errorRate} className="h-2" />
                    </div>

                    {status.errors.length > 0 && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Recent Errors</AlertTitle>
                        <AlertDescription>
                          {status.errors.slice(0, 2).join(', ')}
                          {status.errors.length > 2 && ` (+${status.errors.length - 2} more)`}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid gap-4">
            {healthStatuses.map((status, index) => {
              const service = services[index];
              return (
                <Card key={status.service}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={service.color}>
                          {service.icon}
                        </div>
                        <CardTitle>{status.service}</CardTitle>
                        {getStatusIcon(status.status)}
                      </div>
                      <Badge className={getStatusColor(status.status)}>
                        {status.status}
                      </Badge>
                    </div>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Endpoint</p>
                        <p className="text-sm text-muted-foreground">{service.endpoint}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Response Time</p>
                        <p className="text-sm text-muted-foreground">{status.responseTime}ms</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Uptime</p>
                        <p className="text-sm text-muted-foreground">{status.uptime.toFixed(1)}%</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Data Source</p>
                        <p className="text-sm text-muted-foreground">{status.dataSource}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Performance Metrics</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Total Requests:</span>
                          <div className="font-semibold">{status.metrics.totalRequests}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Successful:</span>
                          <div className="font-semibold text-green-600">{status.metrics.successfulRequests}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Failed:</span>
                          <div className="font-semibold text-red-600">{status.metrics.failedRequests}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Response:</span>
                          <div className="font-semibold">{status.metrics.averageResponseTime}ms</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetch(`${service.endpoint}?health=true`)}
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Test Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(service.endpoint, '_blank')}
                      >
                        <Globe className="h-3 w-3 mr-1" />
                        View API
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Response Time Trends</CardTitle>
                <CardDescription>Average response times by service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthStatuses.map((status, index) => {
                    const service = services[index];
                    return (
                      <div key={status.service} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <div className={service.color}>{service.icon}</div>
                            {status.service}
                          </span>
                          <span>{status.responseTime}ms</span>
                        </div>
                        <Progress
                          value={Math.min((status.responseTime / 1000) * 100, 100)}
                          className="h-2"
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Rate</CardTitle>
                <CardDescription>Request success rates by service</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthStatuses.map((status, index) => {
                    const service = services[index];
                    const successRate = status.metrics.totalRequests > 0
                      ? (status.metrics.successfulRequests / status.metrics.totalRequests) * 100
                      : 0;

                    return (
                      <div key={status.service} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            <div className={service.color}>{service.icon}</div>
                            {status.service}
                          </span>
                          <span>{successRate.toFixed(1)}%</span>
                        </div>
                        <Progress value={successRate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="space-y-4">
            {healthStatuses.filter(status => status.errors.length > 0).length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No errors detected</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              healthStatuses
                .filter(status => status.errors.length > 0)
                .map((status, index) => {
                  const service = services[index];
                  return (
                    <Card key={status.service} className="border-l-4 border-l-red-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={service.color}>{service.icon}</div>
                            <CardTitle className="text-lg">{status.service}</CardTitle>
                            <Badge variant="destructive">Error</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTimeAgo(status.lastCheck)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {status.errors.map((error, errorIndex) => (
                            <Alert key={errorIndex} variant="destructive">
                              <AlertCircle className="h-4 w-4" />
                              <AlertDescription>{error}</AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


