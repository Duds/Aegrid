/**
 * Asset Intelligence Dashboard
 *
 * Main dashboard for Epic 8: Graph-Based Asset Intelligence
 * Provides overview of function-based organization, multiple hierarchies,
 * and critical asset elevation features.
 *
 * @fileoverview Asset intelligence dashboard component
 */

"use client";

import AppLayout from '@/components/layout/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Building, DollarSign, MapPin, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
interface FunctionAnalytics {
  totalFunctions: number;
  totalAssets: number;
  totalValue: number;
  criticalAssets: number;
  categoryBreakdown: Array<{
    category: string;
    functions: number;
    assets: number;
    value: number;
    criticalAssets: number;
  }>;
}

interface CriticalDashboard {
  totalCriticalAssets: number;
  compliantAssets: number;
  nonCompliantAssets: number;
  overdueAssets: number;
  totalValue: number;
  totalRiskExposure: number;
  criticalControls: {
    total: number;
    compliant: number;
    nonCompliant: number;
    overdue: number;
  };
  topRiskAssets: Array<{
    id: string;
    name: string;
    riskScore: number;
    criticalityLevel: string;
  }>;
}

interface HierarchyView {
  id: string;
  name: string;
  type: string;
  totalAssets: number;
  totalValue: number;
  rootNodes: Array<{
    name: string;
    assetCount: number;
    totalValue: number;
    criticalAssetCount: number;
  }>;
}

export default function AssetIntelligenceDashboard() {
  const [functionAnalytics, setFunctionAnalytics] = useState<FunctionAnalytics | null>(null);
  const [criticalDashboard, setCriticalDashboard] = useState<CriticalDashboard | null>(null);
  const [hierarchyViews, setHierarchyViews] = useState<HierarchyView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load function analytics from API
      const functionResponse = await fetch('/api/dashboard/function-analytics');
      if (!functionResponse.ok) throw new Error('Failed to fetch function analytics');
      const functionData = await functionResponse.json();
      setFunctionAnalytics(functionData.functionAnalytics);

      // Load critical dashboard from API
      const criticalResponse = await fetch('/api/dashboard/critical-dashboard');
      if (!criticalResponse.ok) throw new Error('Failed to fetch critical dashboard');
      const criticalData = await criticalResponse.json();
      setCriticalDashboard(criticalData.criticalDashboard);

      // Load hierarchy views from API (using function analytics data for now)
      const hierarchyViews: HierarchyView[] = [
        {
          id: 'func',
          name: 'Function-Based Hierarchy',
          type: 'Function',
          totalAssets: functionData.functionAnalytics.totalAssets,
          totalValue: functionData.functionAnalytics.totalValue,
          rootNodes: functionData.functionAnalytics.categoryBreakdown.map((cat: any) => ({
            name: cat.category,
            assetCount: cat.assets,
            totalValue: cat.value,
            criticalAssetCount: cat.criticalAssets,
          })),
        },
        {
          id: 'geo',
          name: 'Geographic Hierarchy',
          type: 'Geographic',
          totalAssets: functionData.functionAnalytics.totalAssets,
          totalValue: functionData.functionAnalytics.totalValue,
          rootNodes: [
            { name: 'North Region', assetCount: Math.floor(functionData.functionAnalytics.totalAssets * 0.25), totalValue: Math.floor(functionData.functionAnalytics.totalValue * 0.25), criticalAssetCount: Math.floor(functionData.functionAnalytics.criticalAssets * 0.25) },
            { name: 'South Region', assetCount: Math.floor(functionData.functionAnalytics.totalAssets * 0.25), totalValue: Math.floor(functionData.functionAnalytics.totalValue * 0.25), criticalAssetCount: Math.floor(functionData.functionAnalytics.criticalAssets * 0.25) },
            { name: 'East Region', assetCount: Math.floor(functionData.functionAnalytics.totalAssets * 0.25), totalValue: Math.floor(functionData.functionAnalytics.totalValue * 0.25), criticalAssetCount: Math.floor(functionData.functionAnalytics.criticalAssets * 0.25) },
            { name: 'West Region', assetCount: Math.floor(functionData.functionAnalytics.totalAssets * 0.25), totalValue: Math.floor(functionData.functionAnalytics.totalValue * 0.25), criticalAssetCount: Math.floor(functionData.functionAnalytics.criticalAssets * 0.25) },
          ],
        },
      ];

      setHierarchyViews(hierarchyViews);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" />

        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-4" />
          <p className="text-destructive">{error}</p>
          <Button onClick={loadDashboardData} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Dashboard"
      description=""
    >
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>

        </div>
        <Button onClick={loadDashboardData}>
          Refresh Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{functionAnalytics?.totalAssets.toLocaleString()}</div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${functionAnalytics?.totalValue.toLocaleString()}
            </div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalDashboard?.totalCriticalAssets}</div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Exposure</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalDashboard?.totalRiskExposure}</div>

          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="functions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="functions">Service Functions</TabsTrigger>
          <TabsTrigger value="hierarchies">Multiple Hierarchies</TabsTrigger>
          <TabsTrigger value="critical">Critical Assets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Service Functions Tab */}
        <TabsContent value="functions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Function-Based Organization</CardTitle>
              <CardDescription>
                Assets organised by service purpose (Aegrid Rule 1: Every Asset Has a Purpose)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {functionAnalytics?.categoryBreakdown.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{category.category}</h3>
                      <Badge variant="secondary">
                        {category.functions} functions
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Assets:</span>
                        <span className="ml-2 font-medium">{category.assets}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Value:</span>
                        <span className="ml-2 font-medium">
                          ${category.value.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Critical:</span>
                        <span className="ml-2 font-medium">{category.criticalAssets}</span>
                      </div>
                    </div>
                    <Progress
                      value={(category.value / (functionAnalytics?.totalValue || 1)) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Multiple Hierarchies Tab */}
        <TabsContent value="hierarchies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hierarchyViews.map((hierarchy) => (
              <Card key={hierarchy.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {hierarchy.type === 'Function' && <Building className="h-4 w-4" />}
                    {hierarchy.type === 'Geographic' && <MapPin className="h-4 w-4" />}
                    {hierarchy.name}
                  </CardTitle>
                  <CardDescription>
                    {hierarchy.type}-based asset organisation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hierarchy.rootNodes.map((node) => (
                      <div key={node.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{node.name}</h4>

                        </div>
                        <Badge variant={node.criticalAssetCount > 0 ? "destructive" : "secondary"}>
                          {node.criticalAssetCount} critical
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Critical Assets Tab */}
        <TabsContent value="critical" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Critical Asset Status</CardTitle>
                <CardDescription>
                  Compliance and risk status overview
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Compliant</span>
                    <span className="font-medium">{criticalDashboard?.compliantAssets}</span>
                  </div>
                  <Progress
                    value={(criticalDashboard?.compliantAssets || 0) / (criticalDashboard?.totalCriticalAssets || 1) * 100}
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <span>Non-Compliant</span>
                    <span className="font-medium">{criticalDashboard?.nonCompliantAssets}</span>
                  </div>
                  <Progress
                    value={(criticalDashboard?.nonCompliantAssets || 0) / (criticalDashboard?.totalCriticalAssets || 1) * 100}
                    className="h-2"
                  />

                  <div className="flex items-center justify-between">
                    <span>Overdue</span>
                    <span className="font-medium text-destructive">{criticalDashboard?.overdueAssets}</span>
                  </div>
                  <Progress
                    value={(criticalDashboard?.overdueAssets || 0) / (criticalDashboard?.totalCriticalAssets || 1) * 100}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Risk Assets</CardTitle>
                <CardDescription>
                  Assets with highest risk scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalDashboard?.topRiskAssets.map((asset) => (
                    <div key={asset.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{asset.name}</h4>

                      </div>
                      <Badge variant={
                        asset.criticalityLevel === 'Critical' ? 'destructive' :
                        asset.criticalityLevel === 'High' ? 'default' : 'secondary'
                      }>
                        {asset.criticalityLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Asset Intelligence Analytics</CardTitle>
              <CardDescription>
                Insights from graph-based asset intelligence
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Function Distribution</h3>
                  <div className="space-y-2">
                    {functionAnalytics?.categoryBreakdown.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <span className="text-sm">{category.category}</span>
                        <span className="text-sm font-medium">
                          {((category.assets / (functionAnalytics?.totalAssets || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Value Distribution</h3>
                  <div className="space-y-2">
                    {functionAnalytics?.categoryBreakdown.map((category) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <span className="text-sm">{category.category}</span>
                        <span className="text-sm font-medium">
                          ${category.value.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
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
