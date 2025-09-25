'use client';

import AppLayout from '@/components/layout/app-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    AlertCircle,
    BarChart3,
    CheckCircle,
    Clock,
    TrendingDown,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PerformanceKPI {
  id: string;
  name: string;
  description?: string;
  category: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  trend: string;
  changePercent: number;
  status: string;
  period: string;
  measuredAt: string;
}

interface PerformanceAlert {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  description: string;
  thresholdValue?: number;
  actualValue: number;
  status: string;
  detectedAt: string;
  resolvedAt?: string;
}

/**
 * Performance Monitoring Dashboard Page - Phase 1 Control Center Implementation
 *
 * Provides real-time performance monitoring and KPI tracking for managers
 * Aligned with The Aegrid Rules - Rule 2: Risk Sets the Rhythm
 *
 * @component PerformanceMonitoringDashboardPage
 * @example
 * ```tsx
 * <PerformanceMonitoringDashboardPage />
 * ```
 * @accessibility
 * - ARIA roles: main, alert, button, tablist, tabpanel
 * - Keyboard navigation: Tab through performance metrics and controls
 * - Screen reader: Announces performance alerts and KPI status
 */
export default function PerformanceMonitoringDashboardPage() {
  const [kpis, setKpis] = useState<PerformanceKPI[]>([]);
  const [performanceAlerts, setPerformanceAlerts] = useState<PerformanceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchPerformanceData();
    // Set up real-time updates every 60 seconds
    const interval = setInterval(fetchPerformanceData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from both database and simulation APIs
      const [dbResponse, simResponse] = await Promise.all([
        fetch('/api/control-center/performance'),
        fetch('/api/simulation?source=performance&format=json')
      ]);

      if (!dbResponse.ok && !simResponse.ok) {
        throw new Error('Failed to fetch performance data');
      }

      let dbData = { kpis: [] };
      let simData = { data: [] };

      if (dbResponse.ok) {
        dbData = await dbResponse.json();
      }

      if (simResponse.ok) {
        simData = await simResponse.json();
      }

      // Merge database and simulation data
      let mergedKpis = [...dbData.kpis];

      // Add simulation KPIs if available
      if (simData.data && simData.data.length > 0) {
        const simulationKpis = simData.data.map((point: any) => ({
          id: point.metadata?.kpiId || `sim-${Date.now()}`,
          name: point.metadata?.name || 'Simulated KPI',
          description: point.metadata?.description,
          category: point.metadata?.category || 'OPERATIONAL',
          currentValue: point.value || 0,
          targetValue: point.metadata?.targetValue || 100,
          unit: point.unit || '%',
          trend: point.metadata?.trend || 'stable',
          changePercent: point.metadata?.changePercent || 0,
          status: point.metadata?.status || 'GOOD',
          period: point.metadata?.period || 'REALTIME',
          measuredAt: point.timestamp,
        }));

        // Merge simulation KPIs with database KPIs
        simulationKpis.forEach(simKpi => {
          const existingIndex = mergedKpis.findIndex(kpi => kpi.id === simKpi.id);
          if (existingIndex >= 0) {
            mergedKpis[existingIndex] = { ...mergedKpis[existingIndex], ...simKpi };
          } else {
            mergedKpis.push(simKpi);
          }
        });
      }

      setKpis(mergedKpis);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch performance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EXCELLENT': return 'outline';
      case 'GOOD': return 'outline';
      case 'WARNING': return 'secondary';
      case 'CRITICAL': return 'destructive';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend: string, changePercent: number) => {
    if (trend === 'up' || changePercent > 0) {
      return <TrendingUp className="h-3 w-3 text-green-600" />;
    } else if (trend === 'down' || changePercent < 0) {
      return <TrendingDown className="h-3 w-3 text-red-600" />;
    }
    return <Activity className="h-3 w-3 text-gray-600" />;
  };

  const getPerformanceColor = (currentValue: number, targetValue: number) => {
    const percentage = (currentValue / targetValue) * 100;
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
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

  const handleKPIUpdate = async (kpiId: string, newValue: number) => {
    try {
      const response = await fetch('/api/simulation/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update_kpi', kpiId, value: newValue }),
      });

      if (response.ok) {
        await fetchPerformanceData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to update KPI:', err);
    }
  };

  const handleGenerateAlert = async () => {
    try {
      const response = await fetch('/api/simulation/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_alert' }),
      });

      if (response.ok) {
        await fetchPerformanceData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to generate alert:', err);
    }
  };

  const totalKPIs = kpis.length;
  const excellentKPIs = kpis.filter(kpi => kpi.status === 'EXCELLENT').length;
  const warningKPIs = kpis.filter(kpi => kpi.status === 'WARNING').length;
  const criticalKPIs = kpis.filter(kpi => kpi.status === 'CRITICAL').length;

  if (loading && kpis.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading performance data...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Performance Monitoring"
      description="Real-time performance metrics and KPI tracking"
    >
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time performance metrics and KPI tracking
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPerformanceData}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Performance Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalKPIs}</div>
            <p className="text-xs text-muted-foreground">
              Active performance metrics
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excellent</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{excellentKPIs}</div>
            <p className="text-xs text-muted-foreground">
              {totalKPIs > 0 ? ((excellentKPIs / totalKPIs) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warnings</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningKPIs}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalKPIs}</div>
            <p className="text-xs text-muted-foreground">
              Immediate action required
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="kpis" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kpis">Key Performance Indicators</TabsTrigger>
          <TabsTrigger value="alerts">Performance Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi) => (
              <Card key={kpi.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{kpi.name}</CardTitle>
                      <CardDescription>{kpi.category}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(kpi.status)}>
                      {kpi.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Current Value</span>
                      <span className={getPerformanceColor(kpi.currentValue, kpi.targetValue)}>
                        {kpi.currentValue.toFixed(1)} {kpi.unit}
                      </span>
                    </div>
                    <Progress
                      value={(kpi.currentValue / kpi.targetValue) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {kpi.targetValue} {kpi.unit}</span>
                      <span>{((kpi.currentValue / kpi.targetValue) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Trend</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(kpi.trend, kpi.changePercent)}
                      <span className={kpi.changePercent > 0 ? 'text-green-600' : kpi.changePercent < 0 ? 'text-red-600' : 'text-gray-600'}>
                        {kpi.changePercent > 0 ? '+' : ''}{kpi.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {kpi.description && (
                    <p className="text-sm text-muted-foreground">{kpi.description}</p>
                  )}

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Updated {formatTimeAgo(kpi.measuredAt)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleKPIUpdate(kpi.id, kpi.targetValue * 1.1)}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Boost
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleKPIUpdate(kpi.id, kpi.targetValue * 0.9)}
                    >
                      <TrendingDown className="h-3 w-3 mr-1" />
                      Adjust
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Performance Alerts</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateAlert}
            >
              <AlertCircle className="h-3 w-3 mr-1" />
              Generate Test Alert
            </Button>
          </div>
          <div className="grid gap-4">
            {performanceAlerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No active performance alerts</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              performanceAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <Badge variant={alert.severity === 'HIGH' ? 'destructive' : 'default'}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {alert.description}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{formatTimeAgo(alert.detectedAt)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {alert.thresholdValue && (
                          <span>Threshold: {alert.thresholdValue} | Actual: {alert.actualValue}</span>
                        )}
                      </div>
                      <Badge variant={alert.status === 'ACTIVE' ? 'destructive' : 'outline'}>
                        {alert.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>KPI performance by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['OPERATIONAL', 'FINANCIAL', 'ENVIRONMENTAL', 'SAFETY'].map(category => {
                    const kpisOfCategory = kpis.filter(kpi => kpi.category === category);
                    const avgPerformance = kpisOfCategory.length > 0
                      ? kpisOfCategory.reduce((sum, kpi) => sum + (kpi.currentValue / kpi.targetValue), 0) / kpisOfCategory.length
                      : 0;

                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{category}</span>
                          <span className={getPerformanceColor(avgPerformance * 100, 100)}>
                            {(avgPerformance * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={avgPerformance * 100} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
                <CardDescription>KPI status breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { status: 'EXCELLENT', count: excellentKPIs, color: 'text-green-600' },
                    { status: 'GOOD', count: kpis.filter(kpi => kpi.status === 'GOOD').length, color: 'text-blue-600' },
                    { status: 'WARNING', count: warningKPIs, color: 'text-yellow-600' },
                    { status: 'CRITICAL', count: criticalKPIs, color: 'text-red-600' },
                  ].map(item => (
                    <div key={item.status} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.status}</span>
                        <span className={item.color}>{item.count}</span>
                      </div>
                      <Progress
                        value={totalKPIs > 0 ? (item.count / totalKPIs) * 100 : 0}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
}
