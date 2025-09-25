'use client';

import AppLayout from '@/components/layout/app-layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertTriangle,
    Building2,
    Plus,
    Search,
    Shield,
    Target,
    Zap
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

interface ServicePurpose {
  id: string;
  name: string;
  description: string;
  criticalControlId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'INACTIVE';
  isCoreFunction: boolean;
  assetCount: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastAssessment?: string;
}

interface AssetPurposeMapping {
  id: string;
  assetId: string;
  assetName: string;
  assetType: string;
  contribution: string;
  criticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL';
  lastInspection?: string;
}

interface CriticalControlStatus {
  id: string;
  name: string;
  type: string;
  status: 'GREEN' | 'AMBER' | 'RED';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assetCount: number;
  lastInspection?: string;
  nextDue?: string;
}

/**
 * Contextual Dashboard Component - Role-based dashboard interface
 * Implements Aegrid Rule 1: Every Asset Has a Purpose
 * Provides purpose-driven asset organization and critical control oversight
 * Content adapts based on user role (ADMIN, MANAGER, EXEC, SUPERVISOR)
 * @component ContextualDashboard
 * @example
 * ```tsx
 * <ContextualDashboard />
 * ```
 * @accessibility
 * - ARIA roles: main, region, tablist, tabpanel
 * - Keyboard navigation: Tab through workflow sections
 * - Screen reader: Announces purpose groups and control status
 */
export default function ContextualDashboard() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || 'SUPERVISOR';

  const [servicePurposes, setServicePurposes] = useState<ServicePurpose[]>([]);
  const [assetMappings, setAssetMappings] = useState<AssetPurposeMapping[]>([]);
  const [criticalControls, setCriticalControls] = useState<CriticalControlStatus[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  // Load real data from API endpoints
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);

        // Load service purposes from API
        const purposesResponse = await fetch('/api/dashboard/service-purposes');
        if (!purposesResponse.ok) throw new Error('Failed to fetch service purposes');
        const purposesData = await purposesResponse.json();
        setServicePurposes(purposesData.servicePurposes);

        // Load asset mappings from API
        const mappingsResponse = await fetch('/api/dashboard/asset-mappings');
        if (!mappingsResponse.ok) throw new Error('Failed to fetch asset mappings');
        const mappingsData = await mappingsResponse.json();
        setAssetMappings(mappingsData.assetMappings);

        // Load critical controls from API
        const controlsResponse = await fetch('/api/dashboard/critical-controls');
        if (!controlsResponse.ok) throw new Error('Failed to fetch critical controls');
        const controlsData = await controlsResponse.json();
        setCriticalControls(controlsData.criticalControls);

        setError(null);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'secondary';
      case 'LOW':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GREEN':
        return 'bg-green-500';
      case 'AMBER':
        return 'bg-yellow-500';
      case 'RED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return 'text-green-600';
      case 'GOOD':
        return 'text-blue-600';
      case 'FAIR':
        return 'text-yellow-600';
      case 'POOR':
        return 'text-orange-600';
      case 'CRITICAL':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const filteredPurposes = servicePurposes.filter(purpose => {
    const matchesSearch = purpose.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         purpose.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'ALL' || purpose.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const totalAssets = servicePurposes.reduce((sum, purpose) => sum + purpose.assetCount, 0);
  const criticalAssets = servicePurposes.filter(p => p.priority === 'CRITICAL').length;
  const coreFunctions = servicePurposes.filter(p => p.isCoreFunction).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" text="Loading Control Dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'EXEC', 'SUPERVISOR']}
      title="Dashboard"
      description=""
    >
      <div className="space-y-6">
      {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
        </div>
        <div className="flex gap-2">
          {['ADMIN', 'MANAGER', 'EXEC'].includes(userRole) && (
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Purpose
            </Button>
          )}
          {['ADMIN', 'MANAGER', 'EXEC'].includes(userRole) && (
            <Button size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Emergency Override
            </Button>
          )}
            </div>
          </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssets.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {servicePurposes.length} service purposes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Controls</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalControls.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalControls.filter(c => c.status === 'GREEN').length} in good standing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Core Functions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coreFunctions}</div>
            <p className="text-xs text-muted-foreground">
              Essential service purposes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Assets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalAssets}</div>
            <p className="text-xs text-muted-foreground">
              Requiring immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="purposes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="purposes">Service Purposes</TabsTrigger>
          <TabsTrigger value="controls">Critical Controls</TabsTrigger>
          <TabsTrigger value="assets">Asset Lookup</TabsTrigger>
        </TabsList>

        {/* Service Purposes Tab */}
        <TabsContent value="purposes" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search service purposes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 border rounded-md"
              aria-label="Filter by priority"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
        </div>

          {/* Purpose Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPurposes.map((purpose) => (
              <Card key={purpose.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{purpose.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {purpose.description}
                      </CardDescription>
                    </div>
                    <Badge variant={getPriorityColor(purpose.priority)}>
                      {purpose.priority}
                    </Badge>
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Assets:</span>
                      <span className="font-medium">{purpose.assetCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Risk Level:</span>
                      <Badge variant={getPriorityColor(purpose.riskLevel)} className="text-xs">
                        {purpose.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Assessment:</span>
                      <span className="font-medium">
                        {purpose.lastAssessment ? new Date(purpose.lastAssessment).toLocaleDateString('en-AU') : 'Never'}
                      </span>
                    </div>
                    {purpose.isCoreFunction && (
                      <div className="flex items-center gap-1 text-xs text-blue-600">
                        <Shield className="h-3 w-3" />
                        Core Function
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
                </div>
        </TabsContent>

        {/* Critical Controls Tab */}
        <TabsContent value="controls" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalControls.map((control) => (
              <Card key={control.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{control.name}</CardTitle>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(control.status)}`} />
                  </div>
                  <CardDescription>{control.type} Control</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={control.status === 'GREEN' ? 'default' : control.status === 'AMBER' ? 'secondary' : 'destructive'}>
                        {control.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Assets:</span>
                      <span className="font-medium">{control.assetCount}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Next Due:</span>
                      <span className="font-medium">
                        {control.nextDue ? new Date(control.nextDue).toLocaleDateString('en-AU') : 'Not scheduled'}
                      </span>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>
        </TabsContent>

        {/* Asset Lookup Tab */}
        <TabsContent value="assets" className="space-y-4">
          <div className="text-center py-8">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Purpose-Driven Asset Lookup</h3>
            <p className="text-muted-foreground mb-4">
              Search for assets by service purpose, not just asset type
            </p>
            <div className="max-w-md mx-auto">
              <Input
                placeholder="Search by purpose (e.g., 'water', 'safety', 'recreation')..."
                className="mb-4"
              />
              <Button className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Find Assets by Purpose
              </Button>
            </div>
        </div>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  );
}
