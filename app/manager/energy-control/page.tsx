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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Battery,
  Zap,
  Sun,
  Wind,
  Fuel,
  TrendingUp,
  Activity,
  AlertTriangle,
  CheckCircle,
  Power,
  Settings,
  BarChart3,
  Clock,
  MapPin,
  ThermometerSun,
  Gauge,
} from 'lucide-react';

/**
 * Energy Control Page - Phase 1 Control Center Implementation
 *
 * Integrated energy asset monitoring and control for managers
 * Aligned with The Aegrid Rules - Rule 4: Operate with Margin
 *
 * @component EnergyControlPage
 * @example
 * ```tsx
 * <EnergyControlPage />
 * ```
 * @accessibility
 * - ARIA roles: main, button, tablist, tabpanel
 * - Keyboard navigation: Tab through energy controls and metrics
 * - Screen reader: Announces energy status and critical alerts
 */
export default function EnergyControlPage() {
  // Mock energy data - will be replaced with real API calls
  const energySystems = [
    {
      id: 'solar-array-01',
      name: 'Solar Array - North Facility',
      type: 'SOLAR',
      status: 'OPERATIONAL',
      capacity: 2500, // kW
      currentOutput: 1875, // kW
      efficiency: 94.2,
      location: 'North District',
      batteryLevel: 85,
      gridConnection: true,
      lastMaintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15), // 15 days ago
      nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75), // 75 days from now
      alerts: [],
    },
    {
      id: 'wind-turbine-01',
      name: 'Wind Turbine Array',
      type: 'WIND',
      status: 'OPERATIONAL',
      capacity: 1800, // kW
      currentOutput: 1260, // kW
      efficiency: 89.7,
      location: 'West Ridge',
      batteryLevel: 72,
      gridConnection: true,
      lastMaintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8), // 8 days ago
      nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 82), // 82 days from now
      alerts: [
        {
          id: 'wind-alert-01',
          type: 'EFFICIENCY_DROP',
          severity: 'MEDIUM',
          message: 'Wind speed below optimal range',
          timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        },
      ],
    },
    {
      id: 'backup-generator-01',
      name: 'Emergency Backup Generator',
      type: 'DIESEL',
      status: 'STANDBY',
      capacity: 3000, // kW
      currentOutput: 0, // kW
      efficiency: 0,
      location: 'Central Facility',
      batteryLevel: 0, // N/A for generator
      gridConnection: false,
      lastMaintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
      nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60), // 60 days from now
      alerts: [],
    },
    {
      id: 'battery-storage-01',
      name: 'Grid Storage Battery Bank',
      type: 'BATTERY',
      status: 'CHARGING',
      capacity: 5000, // kWh
      currentOutput: -800, // kW (negative = charging)
      efficiency: 96.8,
      location: 'Central Storage',
      batteryLevel: 78,
      gridConnection: true,
      lastMaintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 85), // 85 days from now
      alerts: [],
    },
  ];

  const gridMetrics = {
    totalCapacity: 12300, // kW
    currentDemand: 8450, // kW
    currentSupply: 8920, // kW
    gridStability: 98.5, // %
    powerFactor: 0.95,
    frequency: 50.02, // Hz
    voltage: 240.8, // V
    carbonOffset: 2450, // kg CO2 saved today
    energyTraded: 470, // kWh sold to grid today
    costSavings: 1250, // $ saved today
  };

  const getSystemTypeIcon = (type: string) => {
    switch (type) {
      case 'SOLAR':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'WIND':
        return <Wind className="h-5 w-5 text-blue-500" />;
      case 'DIESEL':
        return <Fuel className="h-5 w-5 text-gray-600" />;
      case 'BATTERY':
        return <Battery className="h-5 w-5 text-green-500" />;
      default:
        return <Power className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'text-green-600';
      case 'CHARGING':
        return 'text-blue-600';
      case 'STANDBY':
        return 'text-yellow-600';
      case 'MAINTENANCE':
        return 'text-orange-600';
      case 'OFFLINE':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPERATIONAL':
        return 'default';
      case 'CHARGING':
        return 'secondary';
      case 'STANDBY':
        return 'outline';
      case 'MAINTENANCE':
        return 'warning';
      case 'OFFLINE':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const formatPower = (power: number) => {
    if (Math.abs(power) >= 1000) {
      return `${(power / 1000).toFixed(1)} MW`;
    }
    return `${power.toFixed(0)} kW`;
  };

  const formatTimeAgo = (timestamp: Date) => {
    const days = Math.floor(
      (Date.now() - timestamp.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days === 0) {
      const hours = Math.floor(
        (Date.now() - timestamp.getTime()) / (1000 * 60 * 60)
      );
      return `${hours}h ago`;
    }
    return `${days}d ago`;
  };

  const formatTimeUntil = (timestamp: Date) => {
    const days = Math.floor(
      (timestamp.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return `${days} days`;
  };

  const calculateUtilization = (current: number, capacity: number) => {
    if (capacity === 0) return 0;
    return Math.abs(current / capacity) * 100;
  };

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Energy Control"
      description="Integrated energy asset monitoring and grid management"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Energy Control Center
            </h1>
            <p className="text-muted-foreground">
              Real-time energy generation, storage, and grid management
            </p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="realtime">
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time</SelectItem>
                <SelectItem value="5min">5 minutes</SelectItem>
                <SelectItem value="1hour">1 hour</SelectItem>
                <SelectItem value="1day">1 day</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Grid Settings
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
          </div>
        </div>

        {/* Grid Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Total Supply
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPower(gridMetrics.currentSupply)}
              </div>
              <p className="text-xs text-muted-foreground">
                Capacity: {formatPower(gridMetrics.totalCapacity)}
              </p>
              <Progress
                value={
                  (gridMetrics.currentSupply / gridMetrics.totalCapacity) * 100
                }
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Current Demand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatPower(gridMetrics.currentDemand)}
              </div>
              <p className="text-xs text-muted-foreground">
                Balance:{' '}
                {formatPower(
                  gridMetrics.currentSupply - gridMetrics.currentDemand
                )}
              </p>
              <Progress
                value={
                  (gridMetrics.currentDemand / gridMetrics.totalCapacity) * 100
                }
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Gauge className="h-4 w-4" />
                Grid Stability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {gridMetrics.gridStability}%
              </div>
              <p className="text-xs text-muted-foreground">
                Frequency: {gridMetrics.frequency} Hz
              </p>
              <Progress
                value={gridMetrics.gridStability}
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ThermometerSun className="h-4 w-4" />
                Carbon Savings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {gridMetrics.carbonOffset}
              </div>
              <p className="text-xs text-muted-foreground">
                kg CO2 saved today
              </p>
              <div className="text-sm font-medium text-green-600 mt-1">
                ${gridMetrics.costSavings} saved
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Energy Systems Tabs */}
        <Tabs defaultValue="systems" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="systems" className="flex items-center gap-2">
              <Power className="h-4 w-4" />
              Energy Systems
            </TabsTrigger>
            <TabsTrigger value="storage" className="flex items-center gap-2">
              <Battery className="h-4 w-4" />
              Energy Storage
            </TabsTrigger>
            <TabsTrigger value="grid" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Grid Management
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Energy Systems Tab */}
          <TabsContent value="systems" className="space-y-4">
            <div className="grid gap-4">
              {energySystems.map(system => (
                <Card
                  key={system.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getSystemTypeIcon(system.type)}
                        <div>
                          <CardTitle className="text-lg">
                            {system.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {system.location}
                            </span>
                            <span>Type: {system.type}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            getStatusBadge(system.status) as
                              | 'default'
                              | 'secondary'
                              | 'destructive'
                              | 'outline'
                          }
                          className={getStatusColor(system.status)}
                        >
                          {system.status}
                        </Badge>
                        {system.alerts.length > 0 && (
                          <Badge variant="destructive">
                            {system.alerts.length} alerts
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Power Output
                        </h4>
                        <div className="space-y-1">
                          <div className="text-xl font-bold">
                            {formatPower(system.currentOutput)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Capacity: {formatPower(system.capacity)}
                          </div>
                          <Progress
                            value={calculateUtilization(
                              system.currentOutput,
                              system.capacity
                            )}
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Efficiency
                        </h4>
                        <div className="space-y-1">
                          <div className="text-xl font-bold text-green-600">
                            {system.efficiency}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {system.efficiency >= 90
                              ? 'Excellent'
                              : system.efficiency >= 80
                                ? 'Good'
                                : system.efficiency >= 70
                                  ? 'Fair'
                                  : 'Poor'}
                          </div>
                          <Progress value={system.efficiency} className="h-2" />
                        </div>
                      </div>

                      {system.type !== 'DIESEL' && (
                        <div>
                          <h4 className="font-semibold text-sm mb-2">
                            Battery Level
                          </h4>
                          <div className="space-y-1">
                            <div className="text-xl font-bold text-blue-600">
                              {system.batteryLevel}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {system.batteryLevel >= 80
                                ? 'Full'
                                : system.batteryLevel >= 50
                                  ? 'Good'
                                  : system.batteryLevel >= 20
                                    ? 'Low'
                                    : 'Critical'}
                            </div>
                            <Progress
                              value={system.batteryLevel}
                              className="h-2"
                            />
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Maintenance
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            Last: {formatTimeAgo(system.lastMaintenance)}
                          </div>
                          <div>
                            Next: {formatTimeUntil(system.nextMaintenance)}
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">Up to date</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* System Alerts */}
                    {system.alerts.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <h4 className="font-semibold text-sm">Active Alerts</h4>
                        {system.alerts.map(alert => (
                          <Alert
                            key={alert.id}
                            className="border-l-4 border-l-yellow-500"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>
                              {alert.type.replace('_', ' ')}
                            </AlertTitle>
                            <AlertDescription>
                              {alert.message} • {formatTimeAgo(alert.timestamp)}
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline">
                        <Activity className="h-3 w-3 mr-1" />
                        Monitor
                      </Button>
                      <Button size="sm" variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                      {system.status === 'STANDBY' && (
                        <Button size="sm" variant="default">
                          <Power className="h-3 w-3 mr-1" />
                          Start System
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Energy Storage Tab */}
          <TabsContent value="storage" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Battery className="h-5 w-5" />
                  Energy Storage Overview
                </CardTitle>
                <CardDescription>
                  Battery systems and storage capacity management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Battery className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>
                    Energy storage management interface will be implemented here
                  </p>
                  <p className="text-sm">
                    Including battery health, charge cycles, and optimization
                    controls
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Grid Management Tab */}
          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Grid Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Frequency
                      </div>
                      <div className="text-lg font-semibold">
                        {gridMetrics.frequency} Hz
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Voltage
                      </div>
                      <div className="text-lg font-semibold">
                        {gridMetrics.voltage} V
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Power Factor
                      </div>
                      <div className="text-lg font-semibold">
                        {gridMetrics.powerFactor}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Energy Traded
                      </div>
                      <div className="text-lg font-semibold">
                        {gridMetrics.energyTraded} kWh
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Grid Stability</span>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={gridMetrics.gridStability}
                          className="w-20 h-2"
                        />
                        <span className="text-sm font-semibold text-green-600">
                          {gridMetrics.gridStability}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Supply/Demand Balance</span>
                      <div className="flex items-center gap-2">
                        <Progress value={95} className="w-20 h-2" />
                        <span className="text-sm font-semibold text-green-600">
                          95%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Renewable Mix</span>
                      <div className="flex items-center gap-2">
                        <Progress value={68} className="w-20 h-2" />
                        <span className="text-sm font-semibold text-blue-600">
                          68%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Energy Analytics
                </CardTitle>
                <CardDescription>
                  Performance trends and efficiency analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Energy Analytics Coming Soon</p>
                  <p className="text-sm">
                    Interactive charts will display energy generation trends,
                    consumption patterns, and efficiency metrics
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
