'use client';

import AppLayout from '@/components/layout/app-layout';
import { MarginManagementDashboard } from '@/components/manager/margin-management-dashboard';
import { ResilienceEngine } from '@/components/resilience/resilience-engine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    Clock,
    DollarSign,
    Package,
    Shield,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useSession } from 'next-auth/react';

/**
 * Margin Management Page
 *
 * Comprehensive margin management interface showcasing Rule 4: Operate with Margin
 * Provides operational slack management and antifragile system oversight
 *
 * @component MarginManagementPage
 * @example
 * ```tsx
 * <MarginManagementPage />
 * ```
 * @accessibility
 * - ARIA roles: main, tablist, tabpanel
 * - Keyboard navigation: Tab through margin management sections
 * - Screen reader: Announces margin types and utilization status
 */
export default function MarginManagementPage() {
  const { data: session } = useSession();

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'EXEC']}
      title="Dashboard"
      description=""
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Emergency Deploy
            </Button>
          </div>
        </div>

        {/* Margin Management Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Margin Overview
            </TabsTrigger>
            <TabsTrigger value="operations" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="resilience" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Resilience Engine
            </TabsTrigger>
          </TabsList>

          {/* Margin Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <MarginManagementDashboard />
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Time Margin */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Time Margin</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">75%</div>
                  <p className="text-xs text-muted-foreground">
                    Available time buffers
                  </p>
                </CardContent>
              </Card>

              {/* Capacity Margin */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Capacity Margin</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">60%</div>
                  <p className="text-xs text-muted-foreground">
                    Available capacity reserves
                  </p>
                </CardContent>
              </Card>

              {/* Material Margin */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Material Margin</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <p className="text-xs text-muted-foreground">
                    Available material spares
                  </p>
                </CardContent>
              </Card>

              {/* Financial Margin */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Financial Margin</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">70%</div>
                  <p className="text-xs text-muted-foreground">
                    Available contingency funds
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Margin Utilization Trends
                </CardTitle>
                <CardDescription>
                  Historical margin utilization and optimization opportunities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Margin Analytics</h3>
                  <p className="text-muted-foreground mb-4">
                    Detailed margin utilization analytics and optimization recommendations
                  </p>
                  <Button variant="outline">
                    View Detailed Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resilience Engine Tab */}
          <TabsContent value="resilience" className="space-y-4">
            <ResilienceEngine
              organisationId={session?.user?.organisationId || 'default'}
              userRole={session?.user?.role || 'MANAGER'}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
