'use client';

import AppLayout from '@/components/layout/app-layout';
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
  Calendar,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';

/**
 * Maintenance Scheduling Page
 *
 * Dynamic maintenance scheduling interface showcasing Rule 2: Risk Sets the Rhythm
 * Provides risk-based scheduling and priority management
 *
 * @component MaintenanceSchedulingPage
 * @example
 * ```tsx
 * <MaintenanceSchedulingPage />
 * ```
 * @accessibility
 * - ARIA roles: main, tablist, tabpanel
 * - Keyboard navigation: Tab through maintenance scheduling sections
 * - Screen reader: Announces risk levels and schedule priorities
 */
export default function MaintenanceSchedulingPage() {
  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Maintenance Scheduling"
      description="Dynamic risk-driven maintenance planning and scheduling"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Maintenance Scheduling
            </h1>
            <p className="text-muted-foreground">
              Dynamic scheduling based on risk assessment and consequence
              analysis
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Rule 2: Risk Sets the Rhythm
            </Badge>
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Emergency Schedule
            </Button>
          </div>
        </div>

        {/* Risk Rhythm Tabs */}
        <Tabs defaultValue="planning" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Risk Planning
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dynamic Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Risk Analytics
            </TabsTrigger>
          </TabsList>

          {/* Risk Planning Tab */}
          <TabsContent value="planning" className="space-y-4">
            <RiskDrivenPlanner />
          </TabsContent>

          {/* Dynamic Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Dynamic Maintenance Schedule
                </CardTitle>
                <CardDescription>
                  Risk-driven schedule with real-time adaptations based on asset
                  condition and environmental factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Critical Priority
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                          12
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Assets requiring immediate attention
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          High Priority
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-600">
                          28
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Assets scheduled this week
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Standard Priority
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                          156
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Assets on routine schedule
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Schedule Management
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Interactive schedule management and priority adjustment
                      tools
                    </p>
                    <Button variant="outline">Open Schedule Manager</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Risk Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Risk Analytics Dashboard
                </CardTitle>
                <CardDescription>
                  Risk trend analysis, pattern recognition, and predictive
                  maintenance insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Risk Trend
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium">
                            Decreasing
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Overall risk levels trending down
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Predictive Alerts
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="text-sm font-medium">3 Active</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Assets showing early warning signs
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">
                      Advanced Analytics
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Detailed risk analytics, trend analysis, and predictive
                      maintenance insights
                    </p>
                    <Button variant="outline">View Detailed Analytics</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
