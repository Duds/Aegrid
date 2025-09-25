'use client';

import AppLayout from '@/components/layout/app-layout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Shield
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CriticalControl {
  id: string;
  name: string;
  assetId: string;
  assetName: string;
  controlType: string;
  status: 'COMPLIANT' | 'OVERDUE' | 'DUE_SOON' | 'NON_COMPLIANT';
  lastInspection: Date | string;
  nextDue: Date | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  responsible: string;
  escalationLevel: number;
}

export default function CriticalControlsPage() {
  const [controls, setControls] = useState<CriticalControl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    fetchCriticalControls();
    const interval = setInterval(fetchCriticalControls, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchCriticalControls = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/manager/critical-controls');
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required. Please log in.');
        } else if (response.status === 403) {
          throw new Error('Access denied. You do not have permission to view critical controls.');
        } else {
          throw new Error(`Failed to fetch critical controls (${response.status})`);
        }
      }

      const data = await response.json();
      setControls(data.controls || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch critical controls:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch critical controls');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLIANT': return 'text-green-600';
      case 'OVERDUE': return 'text-red-600';
      case 'DUE_SOON': return 'text-yellow-600';
      case 'NON_COMPLIANT': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: Date | string) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const overdueControls = controls.filter(c => c.status === 'OVERDUE').length;
  const dueSoonControls = controls.filter(c => c.status === 'DUE_SOON').length;
  const compliantControls = controls.filter(c => c.status === 'COMPLIANT').length;
  const nonCompliantControls = controls.filter(c => c.status === 'NON_COMPLIANT').length;

  if (loading && controls.length === 0) {
    return (
      <AppLayout
        requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
        title="Critical Controls"
        description="Monitor critical asset controls and compliance status"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading critical controls...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Critical Controls"
      description="Monitor critical asset controls and compliance status"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Critical Controls</h1>
            <p className="text-muted-foreground">
              Monitor critical asset controls and compliance status
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Last updated: {lastUpdated.toLocaleTimeString()}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchCriticalControls}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue Controls</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{overdueControls}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{dueSoonControls}</div>
              <p className="text-xs text-muted-foreground">
                Due within 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliant</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{compliantControls}</div>
              <p className="text-xs text-muted-foreground">
                Up to date
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
              <Shield className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{nonCompliantControls}</div>
              <p className="text-xs text-muted-foreground">
                Failed compliance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Controls List */}
        <Tabs defaultValue="overdue" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overdue">Overdue ({overdueControls})</TabsTrigger>
            <TabsTrigger value="due-soon">Due Soon ({dueSoonControls})</TabsTrigger>
            <TabsTrigger value="all">All Controls ({controls.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overdue" className="space-y-4">
            <div className="grid gap-4">
              {controls.filter(c => c.status === 'OVERDUE').length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">No overdue controls</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                controls.filter(c => c.status === 'OVERDUE').map((control) => (
                  <Card key={control.id} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{control.name}</h3>
                            <Badge className={getPriorityColor(control.priority)}>
                              {control.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {control.assetName} • {control.controlType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            {control.status.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(control.nextDue)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Responsible: {control.responsible}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Escalate
                          </Button>
                          <Button size="sm">
                            Schedule Inspection
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="due-soon" className="space-y-4">
            <div className="grid gap-4">
              {controls.filter(c => c.status === 'DUE_SOON').length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center h-32">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-muted-foreground">No controls due soon</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                controls.filter(c => c.status === 'DUE_SOON').map((control) => (
                  <Card key={control.id} className="border-l-4 border-l-yellow-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{control.name}</h3>
                            <Badge className={getPriorityColor(control.priority)}>
                              {control.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {control.assetName} • {control.controlType}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-yellow-600">
                            Due Soon
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Due: {formatDate(control.nextDue)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Responsible: {control.responsible}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm">
                            Schedule Inspection
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4">
              {controls.map((control) => (
                <Card key={control.id} className={`border-l-4 ${
                  control.status === 'OVERDUE' ? 'border-l-red-500' :
                  control.status === 'DUE_SOON' ? 'border-l-yellow-500' :
                  control.status === 'COMPLIANT' ? 'border-l-green-500' :
                  'border-l-gray-500'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{control.name}</h3>
                          <Badge className={getPriorityColor(control.priority)}>
                            {control.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {control.assetName} • {control.controlType}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getStatusColor(control.status)}`}>
                          {control.status.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Due: {formatDate(control.nextDue)}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Responsible: {control.responsible}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {control.status === 'OVERDUE' && (
                          <Button variant="destructive" size="sm">
                            Escalate
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
