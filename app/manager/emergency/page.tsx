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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertTriangle,
  Clock,
  MapPin,
  Phone,
  Radio,
  Shield,
  Siren,
  Users,
  Zap,
  Activity,
  Settings,
  FileText,
} from 'lucide-react';

/**
 * Emergency Dashboard Page - Phase 1 Control Center Implementation
 *
 * Provides immediate access to emergency response functions for managers
 * Aligned with The Aegrid Rules - Rule 3: Protect the Critical Few
 *
 * @component EmergencyDashboardPage
 * @example
 * ```tsx
 * <EmergencyDashboardPage />
 * ```
 * @accessibility
 * - ARIA roles: main, alert, button, tablist, tabpanel
 * - Keyboard navigation: Tab through emergency actions and alerts
 * - Screen reader: Announces critical alerts and emergency status
 */
export default function EmergencyDashboardPage() {
  // Mock emergency data - will be replaced with real API calls
  const criticalAlerts = [
    {
      id: 'alert-001',
      type: 'EQUIPMENT_FAILURE',
      severity: 'CRITICAL',
      asset: 'Water Pump Station #3',
      location: 'North District',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      description: 'Primary pump failure detected - backup systems activated',
      status: 'ACTIVE',
    },
    {
      id: 'alert-002',
      type: 'POWER_OUTAGE',
      severity: 'HIGH',
      asset: 'Electrical Grid Section B',
      location: 'Central Business District',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      description: 'Power outage affecting 2,400 customers',
      status: 'RESPONDING',
    },
    {
      id: 'alert-003',
      type: 'SAFETY_INCIDENT',
      severity: 'MEDIUM',
      asset: 'Bridge Inspection Site',
      location: 'River Crossing',
      timestamp: new Date(Date.now() - 1000 * 60 * 90), // 90 minutes ago
      description: 'Safety protocol deviation reported by inspection team',
      status: 'INVESTIGATING',
    },
  ];

  const emergencyResources = [
    { type: 'Emergency Crews', available: 4, total: 6, status: 'GOOD' },
    { type: 'Mobile Units', available: 8, total: 12, status: 'GOOD' },
    {
      type: 'Contractors On-Call',
      available: 15,
      total: 20,
      status: 'EXCELLENT',
    },
    {
      type: 'Critical Parts Inventory',
      available: 85,
      total: 100,
      status: 'GOOD',
    },
  ];

  const formatTimeAgo = (timestamp: Date) => {
    const minutes = Math.floor(
      (Date.now() - timestamp.getTime()) / (1000 * 60)
    );
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m ago`;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'destructive';
      case 'RESPONDING':
        return 'warning';
      case 'INVESTIGATING':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Emergency Dashboard"
      description="Real-time emergency response and critical control monitoring"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-red-700">
              Emergency Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time monitoring and rapid response coordination
            </p>
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1 text-green-700 border-green-700"
            >
              <Shield className="h-3 w-3" />
              Systems Operational
            </Badge>
            <Button variant="destructive" size="sm" className="animate-pulse">
              <Siren className="h-4 w-4 mr-2" />
              Declare Emergency
            </Button>
          </div>
        </div>

        {/* Critical Alerts Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Critical Alerts
            <Badge variant="destructive">{criticalAlerts.length}</Badge>
          </h2>

          <div className="grid gap-4">
            {criticalAlerts.map(alert => (
              <Alert key={alert.id} className="border-l-4 border-l-red-500">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.asset}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(alert.severity) as any}>
                      {alert.severity}
                    </Badge>
                    <Badge variant={getStatusColor(alert.status) as any}>
                      {alert.status}
                    </Badge>
                  </div>
                </AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-2">
                    <p>{alert.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {alert.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(alert.timestamp)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="destructive">
                        <Zap className="h-3 w-3 mr-1" />
                        Create Emergency Work Order
                      </Button>
                      <Button size="sm" variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        Deploy Resources
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="h-3 w-3 mr-1" />
                        Contact Team
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </div>

        {/* Emergency Response Tabs */}
        <Tabs defaultValue="response" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="response" className="flex items-center gap-2">
              <Siren className="h-4 w-4" />
              Response
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger
              value="communication"
              className="flex items-center gap-2"
            >
              <Radio className="h-4 w-4" />
              Communication
            </TabsTrigger>
            <TabsTrigger value="protocols" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Protocols
            </TabsTrigger>
          </TabsList>

          {/* Response Tab */}
          <TabsContent value="response" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-red-500" />
                    Emergency Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full" variant="destructive">
                    <Siren className="h-4 w-4 mr-2" />
                    Activate Emergency Response
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Mobilize Emergency Crews
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Emergency Services
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Override System Controls
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    System Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Critical Systems</span>
                    <Badge
                      variant="outline"
                      className="text-green-700 border-green-700"
                    >
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Backup Power</span>
                    <Badge
                      variant="outline"
                      className="text-green-700 border-green-700"
                    >
                      Ready
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Communication Links</span>
                    <Badge
                      variant="outline"
                      className="text-green-700 border-green-700"
                    >
                      Active
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emergency Protocols</span>
                    <Badge
                      variant="outline"
                      className="text-green-700 border-green-700"
                    >
                      Loaded
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-orange-500" />
                    Response Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Average Response</span>
                    <span className="font-semibold text-green-700">
                      &lt; 5 min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Critical Response</span>
                    <span className="font-semibold text-green-700">
                      &lt; 2 min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Resource Deployment</span>
                    <span className="font-semibold text-green-700">
                      &lt; 15 min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Escalation Time</span>
                    <span className="font-semibold text-green-700">
                      &lt; 1 min
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            <div className="grid gap-4">
              {emergencyResources.map((resource, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{resource.type}</span>
                      <Badge
                        variant={
                          resource.status === 'EXCELLENT'
                            ? 'default'
                            : 'secondary'
                        }
                        className={
                          resource.status === 'EXCELLENT'
                            ? 'text-green-700 border-green-700'
                            : ''
                        }
                      >
                        {resource.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {resource.available}/{resource.total}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(
                          (resource.available / resource.total) * 100
                        )}
                        % Available
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(resource.available / resource.total) * 100}%`,
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Communication Center</CardTitle>
                <CardDescription>
                  Coordinate emergency response communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="h-16" variant="destructive">
                    <Radio className="h-6 w-6 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Emergency Broadcast</div>
                      <div className="text-sm opacity-90">
                        All teams & stakeholders
                      </div>
                    </div>
                  </Button>
                  <Button className="h-16" variant="outline">
                    <Phone className="h-6 w-6 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Emergency Services</div>
                      <div className="text-sm opacity-70">
                        Fire, Police, Ambulance
                      </div>
                    </div>
                  </Button>
                  <Button className="h-16" variant="outline">
                    <Users className="h-6 w-6 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Field Teams</div>
                      <div className="text-sm opacity-70">
                        Operations & maintenance
                      </div>
                    </div>
                  </Button>
                  <Button className="h-16" variant="outline">
                    <Shield className="h-6 w-6 mr-3" />
                    <div className="text-left">
                      <div className="font-semibold">Management</div>
                      <div className="text-sm opacity-70">
                        Executive leadership
                      </div>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Protocols Tab */}
          <TabsContent value="protocols" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Response Protocols</CardTitle>
                <CardDescription>
                  Quick access to emergency procedures and protocols
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-3" />
                  Critical Infrastructure Failure Protocol
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-3" />
                  Power Outage Emergency Response
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-3" />
                  Safety Incident Management
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-3" />
                  Natural Disaster Response Plan
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-3" />
                  Equipment Failure Escalation
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-3" />
                  Communication Emergency Procedures
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
