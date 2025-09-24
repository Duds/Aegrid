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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  Clock,
  User,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Circle,
  PlayCircle,
  Settings,
  Calendar,
  BarChart3,
  FileText,
} from 'lucide-react';

/**
 * Work Orders Management Page - Phase 1 Daily Operations Implementation
 *
 * Comprehensive work order management interface for managers
 * Aligned with The Aegrid Rules - Rule 2: Match Maintenance to Risk
 *
 * @component WorkOrdersPage
 * @example
 * ```tsx
 * <WorkOrdersPage />
 * ```
 * @accessibility
 * - ARIA roles: main, button, tablist, tabpanel, searchbox
 * - Keyboard navigation: Tab through work orders and actions
 * - Screen reader: Announces work order status and priority
 */
export default function WorkOrdersPage() {
  // Mock work order data - will be replaced with real API calls
  const workOrders = [
    {
      id: 'WO-2024-001',
      title: 'Emergency Pump Repair - Station #3',
      description: 'Primary water pump failure requires immediate replacement',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      type: 'EMERGENCY',
      asset: 'Water Pump Station #3',
      location: 'North District',
      assignedTo: 'John Smith',
      assignedTeam: 'Emergency Response Team Alpha',
      createdDate: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours from now
      estimatedHours: 6,
      actualHours: 2.5,
      completedPercentage: 45,
      skillsRequired: ['Hydraulics', 'Electrical', 'Emergency Response'],
      parts: ['Pump Assembly', 'Pressure Sensors', 'Control Unit'],
      safetyRequirements: [
        'Confined Space',
        'Electrical Safety',
        'Water System',
      ],
    },
    {
      id: 'WO-2024-002',
      title: 'Preventive Maintenance - Bridge Inspection',
      description: 'Quarterly structural inspection and safety assessment',
      priority: 'HIGH',
      status: 'SCHEDULED',
      type: 'PREVENTIVE',
      asset: 'Main Street Bridge',
      location: 'Central District',
      assignedTo: 'Sarah Johnson',
      assignedTeam: 'Infrastructure Team Beta',
      createdDate: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
      estimatedHours: 8,
      actualHours: 0,
      completedPercentage: 0,
      skillsRequired: [
        'Structural Engineering',
        'Safety Inspection',
        'NDT Testing',
      ],
      parts: ['Inspection Equipment', 'Safety Gear'],
      safetyRequirements: [
        'Fall Protection',
        'Traffic Control',
        'Weather Dependent',
      ],
    },
    {
      id: 'WO-2024-003',
      title: 'Asset Condition Assessment - HVAC System',
      description:
        'Condition-based maintenance assessment for community center HVAC',
      priority: 'MEDIUM',
      status: 'PENDING_APPROVAL',
      type: 'CONDITION_BASED',
      asset: 'Community Center HVAC',
      location: 'South District',
      assignedTo: null,
      assignedTeam: null,
      createdDate: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 1 week from now
      estimatedHours: 4,
      actualHours: 0,
      completedPercentage: 0,
      skillsRequired: ['HVAC Maintenance', 'Condition Assessment'],
      parts: ['Filters', 'Belts', 'Lubricants'],
      safetyRequirements: ['Electrical Safety', 'Respiratory Protection'],
    },
  ];

  const workOrderStats = {
    total: 45,
    critical: 3,
    overdue: 2,
    inProgress: 12,
    completed: 28,
    scheduled: 8,
    pendingApproval: 5,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'warning';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return 'default';
      case 'SCHEDULED':
        return 'secondary';
      case 'PENDING_APPROVAL':
        return 'warning';
      case 'COMPLETED':
        return 'outline';
      case 'OVERDUE':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS':
        return <PlayCircle className="h-4 w-4" />;
      case 'SCHEDULED':
        return <Calendar className="h-4 w-4" />;
      case 'PENDING_APPROVAL':
        return <Clock className="h-4 w-4" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4" />;
      case 'OVERDUE':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: Date) => {
    const hours = Math.floor(
      (Date.now() - timestamp.getTime()) / (1000 * 60 * 60)
    );
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatTimeRemaining = (dueDate: Date) => {
    const hours = Math.floor(
      (dueDate.getTime() - Date.now()) / (1000 * 60 * 60)
    );
    if (hours < 0) return 'Overdue';
    if (hours < 24) return `${hours}h remaining`;
    const days = Math.floor(hours / 24);
    return `${days}d remaining`;
  };

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Work Order Management"
      description="Comprehensive work order creation, assignment, and tracking"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Work Order Management
            </h1>
            <p className="text-muted-foreground">
              Create, assign, and track work orders with risk-driven
              prioritization
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button variant="destructive" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Emergency Work Order
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Work Order
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{workOrderStats.total}</div>
              <p className="text-xs text-muted-foreground">Total Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {workOrderStats.critical}
              </div>
              <p className="text-xs text-muted-foreground">Critical</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">
                {workOrderStats.overdue}
              </div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {workOrderStats.inProgress}
              </div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {workOrderStats.completed}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-600">
                {workOrderStats.scheduled}
              </div>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {workOrderStats.pendingApproval}
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search work orders..." className="pl-9" />
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="emergency">Emergency</SelectItem>
              <SelectItem value="preventive">Preventive</SelectItem>
              <SelectItem value="condition-based">Condition Based</SelectItem>
              <SelectItem value="corrective">Corrective</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>

        {/* Work Orders Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Active Work Orders</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Active Work Orders */}
          <TabsContent value="active" className="space-y-4">
            <div className="space-y-4">
              {workOrders.map(workOrder => (
                <Card
                  key={workOrder.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <span>{workOrder.title}</span>
                          <Badge
                            variant={
                              getPriorityColor(workOrder.priority) as
                                | 'default'
                                | 'secondary'
                                | 'destructive'
                                | 'outline'
                            }
                          >
                            {workOrder.priority}
                          </Badge>
                        </CardTitle>
                        <CardDescription>
                          {workOrder.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {workOrder.id}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {workOrder.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Created {formatTimeAgo(workOrder.createdDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            getStatusColor(workOrder.status) as
                              | 'default'
                              | 'secondary'
                              | 'destructive'
                              | 'outline'
                          }
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(workOrder.status)}
                          {workOrder.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Assignment
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {workOrder.assignedTo || 'Unassigned'}
                          </div>
                          {workOrder.assignedTeam && (
                            <div className="text-muted-foreground">
                              Team: {workOrder.assignedTeam}
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Timeline</h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            Due: {formatTimeRemaining(workOrder.dueDate)}
                          </div>
                          <div className="text-muted-foreground">
                            Est: {workOrder.estimatedHours}h | Actual:{' '}
                            {workOrder.actualHours}h
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">Progress</h4>
                        <div className="space-y-2">
                          <div className="text-sm">
                            {workOrder.completedPercentage}% Complete
                          </div>
                          <Progress
                            value={workOrder.completedPercentage}
                            className="h-2"
                          />
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Requirements
                        </h4>
                        <div className="space-y-1 text-xs">
                          <div>
                            <span className="font-medium">Skills:</span>{' '}
                            {workOrder.skillsRequired.slice(0, 2).join(', ')}
                            {workOrder.skillsRequired.length > 2 &&
                              ` +${workOrder.skillsRequired.length - 2} more`}
                          </div>
                          <div>
                            <span className="font-medium">Parts:</span>{' '}
                            {workOrder.parts.slice(0, 2).join(', ')}
                            {workOrder.parts.length > 2 &&
                              ` +${workOrder.parts.length - 2} more`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Manage
                      </Button>
                      <Button size="sm" variant="outline">
                        <User className="h-3 w-3 mr-1" />
                        Assign
                      </Button>
                      <Button size="sm" variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                      {workOrder.priority === 'CRITICAL' && (
                        <Button size="sm" variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Escalate
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Scheduled Work Orders */}
          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Maintenance</CardTitle>
                <CardDescription>
                  Upcoming preventive and condition-based maintenance activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Scheduled work orders view will be implemented here</p>
                  <p className="text-sm">
                    Integration with maintenance scheduling system
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Completed Work Orders */}
          <TabsContent value="completed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Completed Work Orders</CardTitle>
                <CardDescription>
                  Historical work order data and completion metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Completed work orders history will be displayed here</p>
                  <p className="text-sm">
                    Including performance metrics and compliance tracking
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Work Order Analytics</CardTitle>
                <CardDescription>
                  Performance metrics and trend analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Work order analytics and KPIs will be displayed here</p>
                  <p className="text-sm">
                    Including efficiency metrics, cost analysis, and trend data
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
