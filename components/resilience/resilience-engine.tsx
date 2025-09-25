/**
 * Resilience Engine UI Component
 *
 * React component for resilience engine management and monitoring
 * Aligned with The Aegrid Rules for resilient asset management
 *
 * @file components/resilience/resilience-engine.tsx
 * @version 1.0.0
 * @since PI3 - Resilience Implementation
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    MarginType,
    ResilienceMode
} from '@/types/resilience';
import {
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock,
    DollarSign,
    HardDrive,
    Settings,
    Shield,
    TrendingUp,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface ResilienceEngineProps {
  /** Organisation ID for resilience operations */
  organisationId: string;

  /** User role for permission checking */
  userRole: string;

  /** Refresh interval in milliseconds */
  refreshInterval?: number;
}

/**
 * Resilience Engine Component
 *
 * Provides a comprehensive interface for monitoring and managing
 * the resilience engine aligned with The Aegrid Rules
 */
export function ResilienceEngine({
  organisationId,
  userRole,
  refreshInterval = 30000
}: ResilienceEngineProps) {
  const [status, setStatus] = useState<ResilienceMode | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch resilience status
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/resilience');
      const data = await response.json();

      if (data.success) {
        setStatus(data.data);
        setError(null);
        setLastUpdated(new Date());
      } else {
        setError(data.error || 'Failed to fetch resilience status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and periodic refresh
  useEffect(() => {
    fetchStatus();

    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Handle margin allocation
  const handleAllocateMargin = async (marginType: MarginType, amount: number) => {
    try {
      const response = await fetch('/api/resilience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'allocate_margin',
          marginType,
          amount,
          reason: 'Manual allocation via UI'
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchStatus(); // Refresh status
      } else {
        setError(data.error || 'Failed to allocate margin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Handle emergency margin deployment
  const handleDeployMargin = async (marginType: MarginType, amount: number) => {
    try {
      const response = await fetch('/api/resilience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'deploy_margin',
          marginType,
          amount,
          reason: 'Emergency deployment via UI'
        })
      });

      const data = await response.json();
      if (data.success) {
        await fetchStatus(); // Refresh status
      } else {
        setError(data.error || 'Failed to deploy margin');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  // Get mode badge variant
  const getModeBadgeVariant = (mode: ResilienceMode) => {
    switch (mode) {
      case ResilienceMode.NORMAL:
        return 'default';
      case ResilienceMode.ELEVATED:
        return 'secondary';
      case ResilienceMode.HIGH_STRESS:
        return 'destructive';
      case ResilienceMode.EMERGENCY:
        return 'destructive';
      case ResilienceMode.RECOVERY:
        return 'outline';
      case ResilienceMode.MAINTENANCE:
        return 'secondary';
      default:
        return 'default';
    }
  };

  // Get mode icon
  const getModeIcon = (mode: ResilienceMode) => {
    switch (mode) {
      case ResilienceMode.NORMAL:
        return <CheckCircle className="h-4 w-4" />;
      case ResilienceMode.ELEVATED:
        return <AlertTriangle className="h-4 w-4" />;
      case ResilienceMode.HIGH_STRESS:
        return <AlertTriangle className="h-4 w-4" />;
      case ResilienceMode.EMERGENCY:
        return <Zap className="h-4 w-4" />;
      case ResilienceMode.RECOVERY:
        return <TrendingUp className="h-4 w-4" />;
      case ResilienceMode.MAINTENANCE:
        return <Settings className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <LoadingSpinner size="default" className="mr-2" />
            <span>Loading resilience status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load resilience status: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!status) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No resilience status available
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resilience Engine</h2>

        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getModeBadgeVariant(status.mode)} className="flex items-center space-x-1">
            {getModeIcon(status.mode)}
            <span>{status.mode}</span>
          </Badge>
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Main Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Health Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.healthScore}%</div>
            <Progress value={status.healthScore} className="mt-2" />

          </CardContent>
        </Card>

        {/* Antifragile Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Antifragile Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.antifragileScore}%</div>
            <Progress value={status.antifragileScore} className="mt-2" />

          </CardContent>
        </Card>

        {/* Active Signals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.activeSignalsCount}</div>

          </CardContent>
        </Card>

        {/* Margin Utilization */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Utilization</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.marginUtilization}%</div>
            <Progress value={status.marginUtilization} className="mt-2" />

          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="signals">Signal Processing</TabsTrigger>
          <TabsTrigger value="margin">Margin Management</TabsTrigger>
          <TabsTrigger value="antifragile">Antifragile System</TabsTrigger>
          {userRole === 'ADMIN' && (
            <TabsTrigger value="settings">Settings</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Operational Status */}
            <Card>
              <CardHeader>
                <CardTitle>Operational Status</CardTitle>
                <CardDescription>
                  Current resilience engine operational state
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <Badge variant={status.operational ? 'default' : 'destructive'}>
                    {status.operational ? 'Operational' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Mode</span>
                  <Badge variant={getModeBadgeVariant(status.mode)}>
                    {status.mode}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Health Check</span>
                  <span className="text-sm text-muted-foreground">
                    {status.lastHealthCheck.toLocaleTimeString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common resilience operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAllocateMargin(MarginType.CAPACITY, 25)}
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Allocate Capacity Margin
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleAllocateMargin(MarginType.TIME, 10)}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Allocate Time Margin
                </Button>
                <Button
                  variant="destructive"
                  className="w-full justify-start"
                  onClick={() => handleDeployMargin(MarginType.CAPACITY, 50)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Emergency Deploy Margin
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Signal Processing Tab */}
        <TabsContent value="signals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Signal Processing</CardTitle>
              <CardDescription>
                Real-time signal detection and processing status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Signals</span>
                  <Badge variant="secondary">{status.activeSignalsCount}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  Signal processing is active and monitoring for:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Asset condition changes</li>
                    <li>Performance degradation</li>
                    <li>Risk escalation events</li>
                    <li>Emergency situations</li>
                    <li>Environmental changes</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Margin Management Tab */}
        <TabsContent value="margin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Margin Management</CardTitle>
              <CardDescription>
                Current margin allocation and utilization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Utilization</span>
                  <span className="text-sm font-bold">{status.marginUtilization}%</span>
                </div>
                <Progress value={status.marginUtilization} className="mt-2" />
                <div className="text-sm text-muted-foreground">
                  Margin management ensures adequate slack for:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Time buffers for maintenance</li>
                    <li>Capacity reserves for peak loads</li>
                    <li>Material spares for critical components</li>
                    <li>Financial contingency funds</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Antifragile System Tab */}
        <TabsContent value="antifragile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Antifragile System</CardTitle>
              <CardDescription>
                System improvement under stress and learning capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Antifragile Score</span>
                  <span className="text-sm font-bold">{status.antifragileScore}%</span>
                </div>
                <Progress value={status.antifragileScore} className="mt-2" />
                <div className="text-sm text-muted-foreground">
                  The system improves under stress through:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Learning from stress events</li>
                    <li>Building capabilities over time</li>
                    <li>Adapting response strategies</li>
                    <li>Enhancing resilience mechanisms</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab (Admin Only) */}
        {userRole === 'ADMIN' && (
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resilience Configuration</CardTitle>
                <CardDescription>
                  Configure resilience engine parameters and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  Configuration management interface will be implemented in
                  F14.2: Antifragile System Framework
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

export default ResilienceEngine;
