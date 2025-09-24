'use client';

import AppLayout from '@/components/layout/app-layout';
import { CriticalControlMonitor } from '@/components/manager/critical-control-monitor';
import { ManagerDashboard } from '@/components/manager/manager-dashboard';
import { MarginManagementDashboard } from '@/components/manager/margin-management-dashboard';
import { RiskDrivenPlanner } from '@/components/manager/risk-driven-planner';
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
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  Shield,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';

/**
 * Manager Dashboard Page
 *
 * Comprehensive manager interface showcasing The Aegrid Rules in action
 * Provides access to all manager-level functionality through organized tabs
 *
 * @component ManagerDashboardPage
 * @example
 * ```tsx
 * <ManagerDashboardPage />
 * ```
 * @accessibility
 * - ARIA roles: main, tablist, tabpanel
 * - Keyboard navigation: Tab through workflow sections
 * - Screen reader: Announces tab sections and current selection
 */
export default function ManagerDashboardPage() {
  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'EXEC']}
      title="Manager Dashboard"
      description="Comprehensive asset management dashboard aligned with The Aegrid Rules"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Manager Dashboard
            </h1>
            <p className="text-muted-foreground">
              Strategic asset oversight and operational control
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Aegrid Rules Active
            </Badge>
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Emergency Override
            </Button>
          </div>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="controls" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Critical Controls
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Risk Planning
            </TabsTrigger>
            <TabsTrigger value="margin" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Margin Management
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <ManagerDashboard />
          </TabsContent>

          {/* Critical Controls Tab */}
          <TabsContent value="controls" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Control Monitoring
                </CardTitle>
                <CardDescription>
                  High-consequence assets requiring immediate attention (Rule 1:
                  Every Asset Has a Purpose)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CriticalControlMonitor />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Planning Tab */}
          <TabsContent value="planning" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk-Driven Planning
                </CardTitle>
                <CardDescription>
                  Dynamic scheduling based on risk assessment (Rule 2: Risk Sets
                  the Rhythm)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskDrivenPlanner />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Margin Management Tab */}
          <TabsContent value="margin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Margin Operations
                </CardTitle>
                <CardDescription>
                  Operational slack and antifragile system management (Rules 3 &
                  4: Respond to Real World + Operate with Margin)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MarginManagementDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
