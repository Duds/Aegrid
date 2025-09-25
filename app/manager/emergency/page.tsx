'use client';

import AppLayout from '@/components/layout/app-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    CheckCircle,
    Clock,
    Mail,
    MapPin,
    Phone,
    Shield,
    Users
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface EmergencyAlert {
  id: string;
  alertType: string;
  severity: string;
  title: string;
  description: string;
  location?: string;
  status: string;
  responseTime?: number;
  resolutionTime?: number;
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

interface EmergencyResource {
  id: string;
  resourceType: string;
  name: string;
  description?: string;
  totalCapacity: number;
  availableCount: number;
  utilisedCount: number;
  status: string;
  location?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

/**
 * Emergency Dashboard Page - Phase 1 Control Center Implementation
 *
 * Provides immediate access to emergency response functions for managers
 * Aligned with The Aegrid Rules - Rule 3: Respond to the Real World
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
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
  const [resources, setResources] = useState<EmergencyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isWorkOrderModalOpen, setIsWorkOrderModalOpen] = useState(false);
  const [workOrderForm, setWorkOrderForm] = useState({
    assetId: '',
    title: '',
    description: '',
    priority: 'CRITICAL',
    assignedTo: '',
    dueDate: ''
  });
  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchEmergencyData();
    fetchAssetsAndUsers();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchEmergencyData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchEmergencyData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from database, external APIs, and simulation APIs
      const [dbResponse, externalResponse, simResponse] = await Promise.all([
        fetch('/api/control-center/emergency'),
        fetch('/api/external/emergency?external=true').catch(() => null), // Graceful fallback
        fetch('/api/simulation/emergency?format=json')
      ]);

      if (!dbResponse.ok && !simResponse.ok) {
        throw new Error('Failed to fetch emergency data');
      }

      let dbData = { alerts: [], resources: [] };
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
      const mergedAlerts = [...(dbData.alerts || [])];
      const mergedResources = [...(dbData.resources || [])];

      // Add external API alerts if available
      if (externalData.data && externalData.data.length > 0) {
        externalData.data.forEach((point: any) => {
          if (point.metadata?.scenarioId) {
            mergedAlerts.push({
              id: point.metadata.scenarioId,
              alertType: point.metadata.scenarioType || 'UNKNOWN',
              severity: point.metadata.severity || 'MEDIUM',
              title: `${point.metadata.scenarioType} Alert`,
              description: point.metadata.description || 'Emergency situation detected',
              location: point.metadata.location,
              status: point.metadata.status || 'ACTIVE',
              detectedAt: point.timestamp,
            });
          }
        });
      }

      // Add simulation alerts if available
      if (simData.data && simData.data.length > 0) {
        simData.data.forEach((point: any) => {
          if (point.metadata?.scenarioId) {
            mergedAlerts.push({
              id: point.metadata.scenarioId,
              alertType: point.metadata.scenarioType || 'UNKNOWN',
              severity: point.metadata.severity || 'MEDIUM',
              title: `${point.metadata.scenarioType} Alert`,
              description: point.metadata.description || 'Emergency situation detected',
              location: point.metadata.location,
              status: point.metadata.status || 'ACTIVE',
              detectedAt: point.timestamp,
            });
          }
        });
      }

      setAlerts(mergedAlerts);
      setResources(mergedResources);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch emergency data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch emergency data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetsAndUsers = async () => {
    try {
      // Fetch assets
      const assetsResponse = await fetch('/api/assets');
      if (assetsResponse.ok) {
        const assetsData = await assetsResponse.json();
        setAssets(assetsData.assets || []);
      }

      // Fetch users
      const usersResponse = await fetch('/api/admin/users');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch assets and users:', err);
    }
  };

  const createEmergencyWorkOrder = async () => {
    try {
      const response = await fetch('/api/control-center/work-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...workOrderForm,
          dueDate: workOrderForm.dueDate ? new Date(workOrderForm.dueDate).toISOString() : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create work order');
      }

      const result = await response.json();
      console.log('Work order created:', result);

      // Reset form and close modal
      setWorkOrderForm({
        assetId: '',
        title: '',
        description: '',
        priority: 'CRITICAL',
        assignedTo: '',
        dueDate: ''
      });
      setIsWorkOrderModalOpen(false);

      // Show success message
      alert('Emergency work order created successfully!');

    } catch (err) {
      console.error('Failed to create work order:', err);
      alert('Failed to create work order. Please try again.');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'destructive';
      case 'RESPONDING': return 'default';
      case 'INVESTIGATING': return 'secondary';
      case 'RESOLVED': return 'outline';
      default: return 'default';
    }
  };

  const getResourceStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'outline';
      case 'DEPLOYED': return 'default';
      case 'MAINTENANCE': return 'secondary';
      case 'UNAVAILABLE': return 'destructive';
      default: return 'default';
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

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/control-center/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'RESPONDING' }),
      });

      if (response.ok) {
        await fetchEmergencyData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      const response = await fetch('/api/control-center/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, status: 'RESOLVED' }),
      });

      if (response.ok) {
        await fetchEmergencyData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  if (loading && alerts.length === 0) {
    return (
      <AppLayout
        requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
        title="Emergency Dashboard"
        description="Real-time emergency monitoring and response coordination"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading emergency data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Emergency Dashboard"
      description="Real-time emergency monitoring and response coordination"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Emergency Dashboard</h1>
            <p className="text-muted-foreground">
              Real-time emergency monitoring and response coordination
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-muted-foreground">
              <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchEmergencyData}
                disabled={loading}
              >
                Refresh
              </Button>
            </div>
            <Dialog open={isWorkOrderModalOpen} onOpenChange={setIsWorkOrderModalOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="lg">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Create Emergency Work Order
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create Emergency Work Order</DialogTitle>
                  <DialogDescription>
                    Create a high-priority work order for emergency response
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="asset">Asset</Label>
                    <Select
                      value={workOrderForm.assetId}
                      onValueChange={(value) => setWorkOrderForm(prev => ({ ...prev, assetId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name} ({asset.assetNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={workOrderForm.title}
                      onChange={(e) => setWorkOrderForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Emergency work order title"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={workOrderForm.description}
                      onChange={(e) => setWorkOrderForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Detailed description of the emergency work required"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={workOrderForm.priority}
                      onValueChange={(value) => setWorkOrderForm(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select
                      value={workOrderForm.assignedTo}
                      onValueChange={(value) => setWorkOrderForm(prev => ({ ...prev, assignedTo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={workOrderForm.dueDate}
                      onChange={(e) => setWorkOrderForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsWorkOrderModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createEmergencyWorkOrder}>
                    Create Work Order
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Critical Alerts</TabsTrigger>
          <TabsTrigger value="resources">Emergency Resources</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="grid gap-4">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No active emergency alerts</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <CardTitle className="text-lg">{alert.title}</CardTitle>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant={getStatusColor(alert.status)}>
                            {alert.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {alert.description}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>{formatTimeAgo(alert.detectedAt)}</p>
                        {alert.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            <span>{alert.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {alert.responseTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Response: {alert.responseTime}m</span>
                          </div>
                        )}
                        {alert.resolutionTime && (
                          <div className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>Resolved: {alert.resolutionTime}m</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {alert.status === 'ACTIVE' && (
                          <Button
                            size="sm"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </Button>
                        )}
                        {alert.status === 'RESPONDING' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {resources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{resource.name}</CardTitle>
                      <CardDescription>{resource.resourceType}</CardDescription>
                    </div>
                    <Badge variant={getResourceStatusColor(resource.status)}>
                      {resource.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Availability</span>
                      <span>{resource.availableCount}/{resource.totalCapacity}</span>
                    </div>
                    <Progress
                      value={(resource.availableCount / resource.totalCapacity) * 100}
                      className="h-2"
                    />
                  </div>

                  {resource.description && (
                    <p className="text-sm text-muted-foreground">{resource.description}</p>
                  )}

                  {resource.location && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span>{resource.location}</span>
                    </div>
                  )}

                  {resource.contactPerson && (
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{resource.contactPerson}</span>
                      </div>
                      {resource.contactPhone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{resource.contactPhone}</span>
                        </div>
                      )}
                      {resource.contactEmail && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{resource.contactEmail}</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alerts.filter(alert => alert.status === 'ACTIVE').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {alerts.filter(alert => alert.severity === 'CRITICAL').length} critical
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Resources</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {resources.reduce((sum, resource) => sum + resource.availableCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {resources.filter(resource => resource.status === 'AVAILABLE').length} teams
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alerts.length > 0
                    ? Math.round(alerts.reduce((sum, alert) => sum + (alert.responseTime || 0), 0) / alerts.length)
                    : 0}m
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Status</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {alerts.filter(alert => alert.status === 'ACTIVE').length === 0 ? 'SECURE' : 'ALERT'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Emergency systems operational
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
