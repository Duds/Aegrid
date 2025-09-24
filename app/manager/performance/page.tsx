'use client';

import AppLayout from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  LineChart,
  Download,
  RefreshCw,
  Zap,
  Shield,
} from 'lucide-react';

/**
 * Performance Monitoring Page - Phase 1 Daily Operations Implementation
 *
 * Dedicated performance monitoring dashboard for managers
 * Aligned with The Aegrid Rules - Rule 3: Respond to the Real World
 *
 * @component PerformanceMonitoringPage
 * @example
 * ```tsx
 * <PerformanceMonitoringPage />
 * ```
 * @accessibility
 * - ARIA roles: main, button, tablist, tabpanel
 * - Keyboard navigation: Tab through performance metrics and controls
 * - Screen reader: Announces performance trends and alert status
 */
export default function PerformanceMonitoringPage() {
  // Mock performance data - will be replaced with real API calls
  const kpis = [
    {
      name: 'Asset Availability',
      value: 96.8,
      target: 95.0,
      trend: 'up',
      change: 2.3,
      unit: '%',
      status: 'excellent',
    },
    {
      name: 'Emergency Response Time',
      value: 4.2,
      target: 5.0,
      trend: 'down',
      change: -0.8,
      unit: 'min',
      status: 'good',
    },
    {
      name: 'Work Order Completion Rate',
      value: 89.5,
      target: 90.0,
      trend: 'up',
      change: 3.1,
      unit: '%',
      status: 'warning',
    },
    {
      name: 'Preventive Maintenance Compliance',
      value: 92.1,
      target: 95.0,
      trend: 'down',
      change: -1.5,
      unit: '%',
      status: 'warning',
    },
    {
      name: 'Cost per Work Order',
      value: 1250,
      target: 1500,
      trend: 'down',
      change: -8.3,
      unit: '$',
      status: 'excellent',
    },
    {
      name: 'Safety Incidents',
      value: 0.2,
      target: 0.5,
      trend: 'down',
      change: -0.1,
      unit: '/month',
      status: 'excellent',
    },
  ];

  const assetPerformance = [
    {
      category: 'Water Infrastructure',
      availability: 98.2,
      reliability: 96.5,
      efficiency: 94.1,
      trend: 'stable',
      criticalAssets: 3,
      alerts: 1,
    },
    {
      category: 'Power Grid',
      availability: 99.1,
      reliability: 98.8,
      efficiency: 96.3,
      trend: 'improving',
      criticalAssets: 5,
      alerts: 0,
    },
    {
      category: 'Transportation',
      availability: 94.7,
      reliability: 92.3,
      efficiency: 88.9,
      trend: 'declining',
      criticalAssets: 8,
      alerts: 3,
    },
    {
      category: 'Communication Systems',
      availability: 99.5,
      reliability: 99.2,
      efficiency: 97.8,
      trend: 'stable',
      criticalAssets: 2,
      alerts: 0,
    },
  ];

  const recentAlerts = [
    {
      id: 'ALERT-001',
      type: 'Performance Degradation',
      asset: 'Main Street Bridge',
      metric: 'Structural Health',
      value: 78,
      threshold: 80,
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      severity: 'MEDIUM',
    },
    {
      id: 'ALERT-002',
      type: 'Efficiency Drop',
      asset: 'Water Treatment Plant',
      metric: 'Treatment Efficiency',
      value: 89,
      threshold: 92,
      timestamp: new Date(Date.now() - 1000 * 60 * 90),
      severity: 'LOW',
    },
    {
      id: 'ALERT-003',
      type: 'Response Time Exceeded',
      asset: 'Emergency Response Team',
      metric: 'Average Response Time',
      value: 6.2,
      threshold: 5.0,
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
      severity: 'HIGH',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600';
      case 'good':
        return 'text-blue-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'default';
      case 'good':
        return 'secondary';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor(
      (Date.now() - timestamp.getTime()) / (1000 * 60)
    );
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Performance Monitoring"
      description="Real-time performance metrics and trend analysis"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Performance Monitoring
            </h1>
            <p className="text-muted-foreground">
              Real-time KPIs, trends, and performance analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="24h">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {kpi.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-2xl font-bold ${getStatusColor(kpi.status)}`}
                      >
                        {kpi.value}
                        <span className="text-sm font-normal ml-1">
                          {kpi.unit}
                        </span>
                      </span>
                      {getTrendIcon(kpi.trend)}
                    </div>
                    <Badge
                      variant={
                        getStatusBadge(kpi.status) as
                          | 'default'
                          | 'secondary'
                          | 'destructive'
                          | 'outline'
                      }
                    >
                      {kpi.status}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>
                        Target: {kpi.target}
                        {kpi.unit}
                      </span>
                      <span
                        className={
                          kpi.change >= 0 ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {kpi.change >= 0 ? '+' : ''}
                        {kpi.change}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min((kpi.value / kpi.target) * 100, 100)}
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Performance Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Asset Performance
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <LineChart className="h-4 w-4" />
              Trends
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Overall System Health</span>
                      <div className="flex items-center gap-2">
                        <Progress value={94} className="w-20 h-2" />
                        <span className="text-sm font-semibold text-green-600">
                          94%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Critical Systems</span>
                      <div className="flex items-center gap-2">
                        <Progress value={98} className="w-20 h-2" />
                        <span className="text-sm font-semibold text-green-600">
                          98%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Operational Efficiency</span>
                      <div className="flex items-center gap-2">
                        <Progress value={89} className="w-20 h-2" />
                        <span className="text-sm font-semibold text-yellow-600">
                          89%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Maintenance Compliance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={92} className="w-20 h-2" />
                        <span className="text-sm font-semibold text-blue-600">
                          92%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Performance Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        15
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Tasks Completed
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">8</div>
                      <div className="text-sm text-muted-foreground">
                        In Progress
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        3
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">1</div>
                      <div className="text-sm text-muted-foreground">
                        Overdue
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Average Completion Time</span>
                      <span className="text-sm font-semibold">2.3 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">SLA Compliance</span>
                      <span className="text-sm font-semibold text-green-600">
                        96%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Asset Performance Tab */}
          <TabsContent value="assets" className="space-y-4">
            <div className="space-y-4">
              {assetPerformance.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {category.category}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(category.trend)}
                        <Badge
                          variant={
                            category.alerts > 0 ? 'destructive' : 'secondary'
                          }
                        >
                          {category.alerts} alerts
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Availability
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          {category.availability}%
                        </div>
                        <Progress
                          value={category.availability}
                          className="mt-1 h-2"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Reliability
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          {category.reliability}%
                        </div>
                        <Progress
                          value={category.reliability}
                          className="mt-1 h-2"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Efficiency
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          {category.efficiency}%
                        </div>
                        <Progress
                          value={category.efficiency}
                          className="mt-1 h-2"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">
                          Critical Assets
                        </div>
                        <div className="text-2xl font-bold">
                          {category.criticalAssets}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Monitored assets in category
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Performance Alerts
                  <Badge variant="secondary">{recentAlerts.length}</Badge>
                </CardTitle>
                <CardDescription>
                  Recent performance threshold violations and anomalies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentAlerts.map(alert => (
                    <div
                      key={alert.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold">{alert.type}</span>
                          <Badge
                            variant={
                              getSeverityColor(alert.severity) as
                                | 'default'
                                | 'secondary'
                                | 'destructive'
                                | 'outline'
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatTimeAgo(alert.timestamp)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{alert.asset}</div>
                        <div className="text-sm text-muted-foreground">
                          {alert.metric}: {alert.value} (threshold:{' '}
                          {alert.threshold})
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Zap className="h-3 w-3 mr-1" />
                          Investigate
                        </Button>
                        <Button size="sm" variant="outline">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledge
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Performance Trends
                </CardTitle>
                <CardDescription>
                  Historical performance data and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <LineChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Performance Charts Coming Soon</p>
                  <p className="text-sm">
                    Interactive charts will display historical trends, seasonal
                    patterns, and predictive analytics
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
