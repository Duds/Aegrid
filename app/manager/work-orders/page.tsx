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
    CheckCircle,
    Clock,
    MapPin,
    Settings,
    User,
    Users,
    Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  type: string;
  assetName?: string;
  assetLocation?: string;
  assignedToUserName?: string;
  createdDate: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  completedPercentage?: number;
  workOrderTypes: string[];
  skillsRequired: string[];
  parts: Array<{
    name: string;
    quantityRequired: number;
    quantityUsed: number;
  }>;
  safetyRequirements: string[];
}

interface WorkOrderType {
  id: string;
  name: string;
  description?: string;
  category: string;
  defaultPriority: string;
  estimatedDuration?: number;
  requiresApproval: boolean;
}

interface WorkOrderSkill {
  id: string;
  name: string;
  description?: string;
  category: string;
  skillLevel?: string;
  certificationRequired: boolean;
}

/**
 * Work Orders Management Dashboard Page - Phase 1 Control Center Implementation
 *
 * Provides comprehensive work order management and tracking for managers
 * Aligned with The Aegrid Rules - Rule 2: Risk Sets the Rhythm
 *
 * @component WorkOrdersManagementDashboardPage
 * @example
 * ```tsx
 * <WorkOrdersManagementDashboardPage />
 * ```
 * @accessibility
 * - ARIA roles: main, alert, button, tablist, tabpanel
 * - Keyboard navigation: Tab through work orders and management controls
 * - Screen reader: Announces work order status and priority changes
 */
export default function WorkOrdersManagementDashboardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [workOrderTypes, setWorkOrderTypes] = useState<WorkOrderType[]>([]);
  const [workOrderSkills, setWorkOrderSkills] = useState<WorkOrderSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchWorkOrderData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchWorkOrderData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchWorkOrderData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch from both database and simulation APIs
      const [dbResponse, simResponse] = await Promise.all([
        fetch('/api/control-center/work-orders'),
        fetch('/api/simulation?source=work-orders&format=json')
      ]);

      if (!dbResponse.ok && !simResponse.ok) {
        throw new Error('Failed to fetch work order data');
      }

      let dbData = { workOrders: [] };
      let simData = { data: [] };

      if (dbResponse.ok) {
        dbData = await dbResponse.json();
      }

      if (simResponse.ok) {
        simData = await simResponse.json();
      }

      // Merge database and simulation data
      let mergedWorkOrders = [...dbData.workOrders];

      // Add simulation work orders if available
      if (simData.data && simData.data.length > 0) {
        const simulationWorkOrders = simData.data.map((point: any) => ({
          id: point.metadata?.workOrderId || `sim-${Date.now()}`,
          title: point.metadata?.title || 'Simulated Work Order',
          description: point.metadata?.description || 'Simulated work order description',
          priority: point.metadata?.priority || 'MEDIUM',
          status: point.metadata?.status || 'PENDING',
          type: point.metadata?.type || 'MAINTENANCE',
          assetName: point.metadata?.assetName,
          assetLocation: point.metadata?.assetLocation,
          assignedToUserName: point.metadata?.assignedToUserName,
          createdDate: point.timestamp,
          dueDate: point.metadata?.dueDate,
          estimatedHours: point.metadata?.estimatedHours || 4,
          actualHours: point.metadata?.actualHours || 0,
          completedPercentage: point.metadata?.completedPercentage || 0,
          workOrderTypes: point.metadata?.workOrderTypes || ['MAINTENANCE'],
          skillsRequired: point.metadata?.skillsRequired || ['General'],
          parts: point.metadata?.parts || [],
          safetyRequirements: point.metadata?.safetyRequirements || ['Basic Safety'],
        }));

        // Merge simulation work orders with database work orders
        simulationWorkOrders.forEach(simWO => {
          const existingIndex = mergedWorkOrders.findIndex(wo => wo.id === simWO.id);
          if (existingIndex >= 0) {
            mergedWorkOrders[existingIndex] = { ...mergedWorkOrders[existingIndex], ...simWO };
          } else {
            mergedWorkOrders.push(simWO);
          }
        });
      }

      setWorkOrders(mergedWorkOrders);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch work order data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch work order data');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'IN_PROGRESS': return 'default';
      case 'COMPLETED': return 'outline';
      case 'CANCELLED': return 'destructive';
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

  const handleWorkOrderUpdate = async (workOrderId: string, status: string) => {
    try {
      const response = await fetch('/api/control-center/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workOrderId, status }),
      });

      if (response.ok) {
        await fetchWorkOrderData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to update work order:', err);
    }
  };

  const handleCreateWorkOrder = async () => {
    try {
      const response = await fetch('/api/simulation/work-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_work_order' }),
      });

      if (response.ok) {
        await fetchWorkOrderData(); // Refresh data
      }
    } catch (err) {
      console.error('Failed to create work order:', err);
    }
  };

  const totalWorkOrders = workOrders.length;
  const pendingWorkOrders = workOrders.filter(wo => wo.status === 'PENDING').length;
  const inProgressWorkOrders = workOrders.filter(wo => wo.status === 'IN_PROGRESS').length;
  const completedWorkOrders = workOrders.filter(wo => wo.status === 'COMPLETED').length;
  const criticalWorkOrders = workOrders.filter(wo => wo.priority === 'CRITICAL').length;

  if (loading && workOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading work order data...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Work Orders Management"
      description="Comprehensive work order tracking and management"
    >
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Work Orders Management</h1>
          <p className="text-muted-foreground">
            Comprehensive work order tracking and management
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchWorkOrderData}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleCreateWorkOrder}
            >
              <Wrench className="h-3 w-3 mr-1" />
              New Work Order
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Work Order Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              Active work orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalWorkOrders}</div>
            <p className="text-xs text-muted-foreground">
              High priority work orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="work-orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="types">Work Order Types</TabsTrigger>
          <TabsTrigger value="skills">Required Skills</TabsTrigger>
        </TabsList>

        <TabsContent value="work-orders" className="space-y-4">
          <div className="grid gap-4">
            {workOrders.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-muted-foreground">No active work orders</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              workOrders.map((workOrder) => (
                <Card key={workOrder.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{workOrder.title}</CardTitle>
                          <Badge variant={getPriorityColor(workOrder.priority)}>
                            {workOrder.priority}
                          </Badge>
                          <Badge variant={getStatusColor(workOrder.status)}>
                            {workOrder.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-base">
                          {workOrder.description}
                        </CardDescription>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <p>Created {formatTimeAgo(workOrder.createdDate)}</p>
                        {workOrder.dueDate && (
                          <p>Due {formatTimeAgo(workOrder.dueDate)}</p>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        {workOrder.assetName && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" />
                            <span>{workOrder.assetName}</span>
                            {workOrder.assetLocation && (
                              <span className="text-muted-foreground">- {workOrder.assetLocation}</span>
                            )}
                          </div>
                        )}
                        {workOrder.assignedToUserName && (
                          <div className="flex items-center gap-1 text-sm">
                            <User className="h-3 w-3" />
                            <span>{workOrder.assignedToUserName}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        {workOrder.estimatedHours && (
                          <div className="flex items-center gap-1 text-sm">
                            <Clock className="h-3 w-3" />
                            <span>Est: {workOrder.estimatedHours}h</span>
                            {workOrder.actualHours && (
                              <span>| Actual: {workOrder.actualHours}h</span>
                            )}
                          </div>
                        )}
                        {workOrder.completedPercentage !== undefined && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{workOrder.completedPercentage}%</span>
                            </div>
                            <Progress value={workOrder.completedPercentage} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {workOrder.skillsRequired.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Skills Required:</p>
                          <div className="flex flex-wrap gap-1">
                            {workOrder.skillsRequired.map((skill, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {workOrder.parts.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Parts Required:</p>
                          <div className="space-y-1">
                            {workOrder.parts.map((part, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span>{part.name}</span>
                                <span>{part.quantityUsed}/{part.quantityRequired}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {workOrder.safetyRequirements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Safety Requirements:</p>
                          <div className="flex flex-wrap gap-1">
                            {workOrder.safetyRequirements.map((requirement, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {requirement}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {workOrder.status === 'PENDING' && (
                        <Button
                          size="sm"
                          onClick={() => handleWorkOrderUpdate(workOrder.id, 'IN_PROGRESS')}
                        >
                          <Activity className="h-3 w-3 mr-1" />
                          Start Work
                        </Button>
                      )}
                      {workOrder.status === 'IN_PROGRESS' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleWorkOrderUpdate(workOrder.id, 'COMPLETED')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleWorkOrderUpdate(workOrder.id, 'CANCELLED')}
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workOrderTypes.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Wrench className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No work order types configured</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              workOrderTypes.map((type) => (
                <Card key={type.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{type.name}</CardTitle>
                        <CardDescription>{type.category}</CardDescription>
                      </div>
                      <Badge variant={getPriorityColor(type.defaultPriority)}>
                        {type.defaultPriority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {type.description && (
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      {type.estimatedDuration && (
                        <div className="flex justify-between">
                          <span>Estimated Duration:</span>
                          <span>{type.estimatedDuration} hours</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Requires Approval:</span>
                        <span>{type.requiresApproval ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workOrderSkills.length === 0 ? (
              <Card>
                <CardContent className="flex items-center justify-center h-32">
                  <div className="text-center">
                    <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No skills configured</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              workOrderSkills.map((skill) => (
                <Card key={skill.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{skill.name}</CardTitle>
                        <CardDescription>{skill.category}</CardDescription>
                      </div>
                      {skill.certificationRequired && (
                        <Badge variant="outline">Certified</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {skill.description && (
                      <p className="text-sm text-muted-foreground">{skill.description}</p>
                    )}

                    <div className="space-y-2 text-sm">
                      {skill.skillLevel && (
                        <div className="flex justify-between">
                          <span>Skill Level:</span>
                          <span>{skill.skillLevel}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Certification Required:</span>
                        <span>{skill.certificationRequired ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </AppLayout>
  );
}
