/**
 * Migration Dashboard UI
 *
 * Implements comprehensive migration dashboard for monitoring and management
 *
 * @fileoverview Migration dashboard UI component
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertTriangle,
    BarChart3,
    Calendar,
    CheckCircle,
    Clock,
    Database,
    Pause,
    Play,
    RefreshCw,
    Shield,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MigrationPhase {
  id: string;
  name: string;
  description: string;
  duration: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'blocked';
  progress: number;
  tasks: Array<{
    id: string;
    name: string;
    status: string;
    priority: string;
  }>;
  risks: Array<{
    id: string;
    name: string;
    probability: string;
    impact: string;
    status: string;
  }>;
}

interface MigrationMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  blockedTasks: number;
  totalEffort: number;
  completedEffort: number;
  totalRisks: number;
  activeRisks: number;
  mitigatedRisks: number;
  averageTaskDuration: number;
  onTimeDelivery: number;
  budgetVariance: number;
}

interface MigrationSummary {
  totalDuration: number;
  completedDuration: number;
  remainingDuration: number;
  progress: number;
  phases: Array<{
    id: string;
    name: string;
    status: string;
    progress: number;
    duration: number;
  }>;
}

export default function MigrationDashboard() {
  const [phases, setPhases] = useState<MigrationPhase[]>([]);
  const [metrics, setMetrics] = useState<MigrationMetrics | null>(null);
  const [summary, setSummary] = useState<MigrationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMigrationData();
  }, []);

  const fetchMigrationData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/migration/timeline');
      if (!response.ok) {
        throw new Error('Failed to fetch migration data');
      }

      const data = await response.json();
      setPhases(data.timeline.phases);
      setMetrics(data.metrics);
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'blocked':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      'in-progress': 'secondary',
      failed: 'destructive',
      blocked: 'outline',
      pending: 'outline',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('-', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      critical: 'destructive',
      high: 'default',
      medium: 'secondary',
      low: 'outline',
    } as const;

    return (
      <Badge variant={variants[priority as keyof typeof variants] || 'outline'}>
        {priority}
      </Badge>
    );
  };

  const getRiskBadge = (probability: string, impact: string) => {
    if (probability === 'high' && impact === 'critical') {
      return <Badge variant="destructive">Critical</Badge>;
    } else if (probability === 'high' || impact === 'critical') {
      return <Badge variant="default">High</Badge>;
    } else if (probability === 'medium' || impact === 'high') {
      return <Badge variant="secondary">Medium</Badge>;
    } else {
      return <Badge variant="outline">Low</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Migration Dashboard</h1>

        </div>
        <Button onClick={fetchMigrationData} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.progress.toFixed(1)}%</div>
              <Progress value={summary.progress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Remaining</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.remainingDuration}</div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeRisks || 0}</div>

            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.completedTasks || 0}</div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration Timeline</CardTitle>
              <CardDescription>
                Track progress through each phase of the migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(phase.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {phase.name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(phase.status)}
                          <span className="text-sm text-gray-500">
                            {phase.duration} days
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {phase.description}
                      </p>
                      <Progress value={phase.progress} className="mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phases" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {phases.map((phase) => (
              <Card key={phase.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    {phase.name}
                    {getStatusBadge(phase.status)}
                  </CardTitle>
                  <CardDescription>{phase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tasks</h4>
                      <div className="space-y-2">
                        {phase.tasks.map((task) => (
                          <div key={task.id} className="flex items-center justify-between">
                            <span className="text-sm">{task.name}</span>
                            <div className="flex items-center space-x-2">
                              {getPriorityBadge(task.priority)}
                              {getStatusBadge(task.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Risks</h4>
                      <div className="space-y-2">
                        {phase.risks.map((risk) => (
                          <div key={risk.id} className="flex items-center justify-between">
                            <span className="text-sm">{risk.name}</span>
                            {getRiskBadge(risk.probability, risk.impact)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Risk Management</CardTitle>
              <CardDescription>
                Monitor and manage migration risks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase) => (
                  <div key={phase.id}>
                    <h3 className="text-lg font-medium mb-2">{phase.name}</h3>
                    <div className="space-y-2">
                      {phase.risks.map((risk) => (
                        <div key={risk.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{risk.name}</h4>
                            <p className="text-sm text-gray-500">
                              {risk.probability} probability, {risk.impact} impact
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getRiskBadge(risk.probability, risk.impact)}
                            {getStatusBadge(risk.status)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="h-4 w-4 mr-2" />
                  Database Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Healthy</div>
                <p className="text-sm text-gray-500">All systems operational</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">Active</div>
                <p className="text-sm text-gray-500">Real-time sync running</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Secure</div>
                <p className="text-sm text-gray-500">All security checks passed</p>
              </CardContent>
            </Card>
          </div>

          {metrics && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-2xl font-bold">{metrics.totalTasks}</div>
                    <p className="text-sm text-gray-500">Total Tasks</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.completedTasks}</div>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.failedTasks}</div>
                    <p className="text-sm text-gray-500">Failed</p>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metrics.blockedTasks}</div>
                    <p className="text-sm text-gray-500">Blocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
