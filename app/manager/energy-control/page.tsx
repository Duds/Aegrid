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
    Battery,
    CheckCircle,
    Clock,
    Fuel,
    MapPin,
    Settings,
    Sun,
    TrendingDown,
    TrendingUp,
    Wind,
    Zap
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EnergySystem {
  id: string;
  name: string;
  systemType: string;
  status: string;
  capacity: number;
  currentOutput: number;
  efficiency: number;
  location?: string;
  gridConnection: boolean;
  batteryLevel?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  alerts: any[];
}

interface EnergyAlert {
  id: string;
  alertType: string;
  severity: string;
  message: string;
  description?: string;
  status: string;
  detectedAt: string;
  resolvedAt?: string;
}

/**
 * Energy Control Dashboard Page - Phase 1 Control Center Implementation
 *
 * Provides real-time energy system monitoring and control for managers
 * Aligned with The Aegrid Rules - Rule 2: Risk Sets the Rhythm
 *
 * @component EnergyControlDashboardPage
 * @example
 * ```tsx
 * <EnergyControlDashboardPage />
 * ```
 * @accessibility
 * - ARIA roles: main, alert, button, tablist, tabpanel
 * - Keyboard navigation: Tab through energy systems and controls
 * - Screen reader: Announces energy alerts and system status
 */
export default function EnergyControlDashboardPage() {
  const [systems, setSystems] = useState<EnergySystem[]>([]);
  const [alerts, setAlerts] = useState<EnergyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchEnergyData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchEnergyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEnergyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from database, external APIs, and simulation APIs
      const [dbResponse, externalResponse, simResponse] = await Promise.all([
        fetch('/api/control-center/energy'),
        fetch('/api/external/energy?external=true').catch(() => null), // Graceful fallback
        fetch('/api/simulation/energy?format=json')
      ]);

      if (!dbResponse.ok && !simResponse.ok) {
        throw new Error('Failed to fetch energy data');
      }

      let dbData = { systems: [] };
      let externalData = { data: [] };
      let simData = { data: [] };

      if (dbResponse.ok) {
        dbData = await dbResponse.json();
      }

      if (externalResponse && externalResponse.ok) {
        externalData = await externalResponse.json();
      }

      if (simResponse.ok) {
        simData = await simResponse.json();
      }

      // Merge database, external, and simulation data
      let mergedSystems = [...(dbData.systems || [])];

      // Add external API systems if available
      if (externalData.data && externalData.data.length > 0) {
        const externalSystems = externalData.data.map((point: any) => ({
          id: point.metadata?.systemId || `ext-${Date.now()}`,
          name: point.metadata?.name || 'External System',
          systemType: point.metadata?.systemType || 'UNKNOWN',
          status: point.metadata?.status || 'OPERATIONAL',
          capacity: point.metadata?.capacity || 1000,
          currentOutput: point.value || 0,
          efficiency: point.metadata?.efficiency || 90,
          location: point.metadata?.location || 'Unknown',
          gridConnection: point.metadata?.gridConnection || false,
          batteryLevel: point.metadata?.batteryLevel,
          lastMaintenance: point.metadata?.lastMaintenance,
          nextMaintenance: point.metadata?.nextMaintenance,
          alerts: [],
        }));

        // Merge external systems with database systems
        externalSystems.forEach(extSystem => {
          const existingIndex = mergedSystems.findIndex(sys => sys.id === extSystem.id);
          if (existingIndex >= 0) {
            mergedSystems[existingIndex] = { ...mergedSystems[existingIndex], ...extSystem };
          } else {
            mergedSystems.push(extSystem);
          }
        });
      }

      // Add simulation systems if available
      if (simData.data && simData.data.length > 0) {
        const simulationSystems = simData.data.map((point: any) => ({
          id: point.metadata?.systemId || `sim-${Date.now()}`,
          name: point.metadata?.systemId || 'Simulated System',
          systemType: point.metadata?.systemType || 'UNKNOWN',
          status: point.metadata?.status || 'OPERATIONAL',
          capacity: point.metadata?.capacity || 1000,
          currentOutput: point.value || 0,
          efficiency: point.metadata?.efficiency || 90,
          location: point.metadata?.location || 'Unknown',
          gridConnection: point.metadata?.gridConnection || false,
          batteryLevel: point.metadata?.batteryLevel,
          lastMaintenance: point.metadata?.lastMaintenance,
          nextMaintenance: point.metadata?.nextMaintenance,
          alerts: [],
        }));

        // Merge simulation systems with database systems
        simulationSystems.forEach(simSystem => {
          const existingIndex = mergedSystems.findIndex(sys => sys.id === simSystem.id);
          if (existingIndex >= 0) {
            mergedSystems[existingIndex] = { ...mergedSystems[existingIndex], ...simSystem };
          } else {
            mergedSystems.push(simSystem);
          }
        });
      }

      setSystems(mergedSystems);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch energy data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch energy data');
    } finally {
      setLoading(false);
    }
  };

  const getSystemTypeIcon = (systemType: string) => {
    switch (systemType) {
      case 'SOLAR': return <Sun className="h-4 w-4" />;
      case 'WIND': return <Wind className="h-4 w-4" />;
      case 'BATTERY': return <Battery className="h-4 w-4" />;
      case 'DIESEL': return <Fuel className="h-4 w-4" />;
      case 'GRID': return <Zap className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL': return 'outline';
      case 'MAINTENANCE': return 'secondary';
      case 'OFFLINE': return 'destructive';
      case 'FAULT': return 'destructive';
      default: return 'default';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600';
    if (efficiency >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getEfficiencyTrend = (efficiency: number) => {
    if (efficiency >= 90) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (efficiency >= 75) return <TrendingUp className="h-3 w-3 text-yellow-600" />;
    return <TrendingDown className="h-3 w-3 text-red-600" />;
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

  const handleSystemControl = async (systemId: string, action: string, value?: number) => {
    try {
      const response = await fetch('/api/simulation/energy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, systemId, value }),
      });

      if (response.ok) {
        await fetchEnergyData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to control energy system:', err);
    }
  };

  const totalCapacity = systems.reduce((sum, system) => sum + system.capacity, 0);
  const totalOutput = systems.reduce((sum, system) => sum + system.currentOutput, 0);
  const averageEfficiency = systems.length > 0
    ? systems.reduce((sum, system) => sum + system.efficiency, 0) / systems.length
    : 0;

  if (loading && systems.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading energy data...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Energy Control"
      description="Real-time energy system monitoring and control"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Energy Control</h1>
            <p className="text-muted-foreground">
              Real-time energy system monitoring and control
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchEnergyData}
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

      {/* Energy Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity.toFixed(0)} kW</div>
            <p className="text-xs text-muted-foreground">
              {systems.length} systems
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Output</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOutput.toFixed(0)} kW</div>
            <p className="text-xs text-muted-foreground">
              {((totalOutput / totalCapacity) * 100).toFixed(1)}% utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEfficiencyColor(averageEfficiency)}`}>
              {averageEfficiency.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              System performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grid Connection</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {systems.filter(system => system.gridConnection).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Connected systems
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="systems" className="space-y-4">
        <TabsList>
          <TabsTrigger value="systems">Energy Systems</TabsTrigger>
          <TabsTrigger value="alerts">Energy Alerts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="systems" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {systems.map((system) => (
              <Card key={system.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getSystemTypeIcon(system.systemType)}
                      <div>
                        <CardTitle className="text-lg">{system.name}</CardTitle>
                        <CardDescription>{system.systemType}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(system.status)}>
                      {system.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Output</span>
                      <span>{system.currentOutput.toFixed(0)}/{system.capacity} kW</span>
                    </div>
                    <Progress
                      value={(system.currentOutput / system.capacity) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span>Efficiency</span>
                    <div className="flex items-center gap-1">
                      {getEfficiencyTrend(system.efficiency)}
                      <span className={getEfficiencyColor(system.efficiency)}>
                        {system.efficiency.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {system.batteryLevel !== undefined && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Battery Level</span>
                        <span>{system.batteryLevel.toFixed(1)}%</span>
                      </div>
                      <Progress value={system.batteryLevel} className="h-2" />
                    </div>
                  )}

                  {system.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{system.location}</span>
                    </div>
                  )}

                  {system.nextMaintenance && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Next maintenance: {formatTimeAgo(system.nextMaintenance)}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSystemControl(system.id, 'trigger_maintenance')}
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Maintenance
                    </Button>
                    {system.systemType === 'BATTERY' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSystemControl(system.id, 'set_output', system.capacity * 0.8)}
                      >
                        <Battery className="h-3 w-3 mr-1" />
                        Charge
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No active energy alerts</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          <CardTitle className="text-lg">{alert.message}</CardTitle>
                          <Badge variant={alert.severity === 'HIGH' ? 'destructive' : 'default'}>
                            {alert.severity}
                          </Badge>
                        </div>
                        {alert.description && (
                          <CardDescription className="text-base">
                            {alert.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{formatTimeAgo(alert.detectedAt)}</p>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>Efficiency trends by system type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['SOLAR', 'WIND', 'BATTERY', 'DIESEL'].map(type => {
                    const systemsOfType = systems.filter(sys => sys.systemType === type);
                    const avgEfficiency = systemsOfType.length > 0
                      ? systemsOfType.reduce((sum, sys) => sum + sys.efficiency, 0) / systemsOfType.length
                      : 0;

                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-1">
                            {getSystemTypeIcon(type)}
                            {type}
                          </span>
                          <span className={getEfficiencyColor(avgEfficiency)}>
                            {avgEfficiency.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={avgEfficiency} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Capacity Utilization</CardTitle>
                <CardDescription>Output vs capacity by system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systems.map(system => (
                    <div key={system.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{system.name}</span>
                        <span>{((system.currentOutput / system.capacity) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress
                        value={(system.currentOutput / system.capacity) * 100}
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
