'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Droplets,
  Recycle,
  TreePine,
  CheckCircle,
  Clock,
} from 'lucide-react';

/**
 * Sustainability Module implementing The Aegrid Rules
 * Rule 4: Operate with Margin - Future-proof sustainability planning
 * Monitors environmental impact and long-term asset viability
 * @component SustainabilityModule
 * @example
 * ```tsx
 * <SustainabilityModule />
 * ```
 * @accessibility
 * - ARIA roles: main, table, progressbar
 * - Keyboard navigation: Tab through sustainability metrics interface
 * - Screen reader: Announces environmental metrics and sustainability goals
 */
export default function SustainabilityModule() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [_selectedCategory, _setSelectedCategory] = useState('all');

  // Mock sustainability data - in real implementation, this would come from API
  const sustainabilityMetrics = {
    carbonFootprint: {
      current: 1250, // tonnes CO2
      target: 1000,
      trend: -5.2, // percentage change
      status: 'improving',
    },
    energyEfficiency: {
      current: 78.5, // percentage
      target: 85,
      trend: 2.1,
      status: 'improving',
    },
    waterConservation: {
      current: 92.3, // percentage
      target: 95,
      trend: 1.8,
      status: 'improving',
    },
    wasteReduction: {
      current: 65.2, // percentage
      target: 80,
      trend: 3.5,
      status: 'improving',
    },
  };

  const sustainabilityGoals = [
    {
      id: 1,
      name: 'Carbon Neutrality',
      description: 'Achieve net-zero carbon emissions',
      target: '2030',
      progress: 65,
      status: 'On Track',
      category: 'Climate Action',
    },
    {
      id: 2,
      name: 'Energy Efficiency',
      description: 'Improve energy efficiency by 25%',
      target: '2025',
      progress: 78,
      status: 'On Track',
      category: 'Energy',
    },
    {
      id: 3,
      name: 'Water Conservation',
      description: 'Reduce water consumption by 30%',
      target: '2026',
      progress: 45,
      status: 'Behind Schedule',
      category: 'Water',
    },
    {
      id: 4,
      name: 'Waste Reduction',
      description: 'Achieve 80% waste diversion',
      target: '2024',
      progress: 82,
      status: 'Achieved',
      category: 'Waste',
    },
    {
      id: 5,
      name: 'Renewable Energy',
      description: '50% renewable energy by 2027',
      target: '2027',
      progress: 35,
      status: 'On Track',
      category: 'Energy',
    },
  ];

  const environmentalAssets = [
    {
      id: 1,
      name: 'Solar Panel Array',
      category: 'Renewable Energy',
      impact: 'Positive',
      co2Reduction: 45.2, // tonnes/year
      energyGenerated: 125000, // kWh/year
      efficiency: 92.5,
      lastMaintenance: '2024-01-05',
      nextMaintenance: '2024-04-05',
    },
    {
      id: 2,
      name: 'Water Treatment Plant',
      category: 'Water Management',
      impact: 'Positive',
      waterSaved: 2500000, // litres/year
      energyEfficiency: 88.3,
      efficiency: 94.2,
      lastMaintenance: '2024-01-10',
      nextMaintenance: '2024-02-10',
    },
    {
      id: 3,
      name: 'Waste Management System',
      category: 'Waste Processing',
      impact: 'Positive',
      wasteDiverted: 85.6, // percentage
      recyclingRate: 78.9,
      efficiency: 89.1,
      lastMaintenance: '2024-01-08',
      nextMaintenance: '2024-03-08',
    },
    {
      id: 4,
      name: 'HVAC System',
      category: 'Energy Management',
      impact: 'Neutral',
      energyConsumption: 45000, // kWh/year
      efficiency: 76.8,
      lastMaintenance: '2024-01-12',
      nextMaintenance: '2024-04-12',
    },
  ];

  const sustainabilityInitiatives = [
    {
      id: 1,
      name: 'Green Building Certification',
      description: 'Achieve LEED Gold certification for new facilities',
      status: 'In Progress',
      completion: 75,
      impact: 'High',
      category: 'Certification',
    },
    {
      id: 2,
      name: 'Electric Vehicle Fleet',
      description: 'Transition 50% of fleet to electric vehicles',
      status: 'Planning',
      completion: 25,
      impact: 'Medium',
      category: 'Transportation',
    },
    {
      id: 3,
      name: 'Smart Energy Management',
      description: 'Implement IoT-based energy monitoring',
      status: 'In Progress',
      completion: 60,
      impact: 'High',
      category: 'Technology',
    },
    {
      id: 4,
      name: 'Community Solar Program',
      description: 'Partner with community for shared solar benefits',
      status: 'Planning',
      completion: 15,
      impact: 'High',
      category: 'Community',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Track':
        return 'bg-green-100 text-green-800';
      case 'Behind Schedule':
        return 'bg-yellow-100 text-yellow-800';
      case 'Achieved':
        return 'bg-blue-100 text-blue-800';
      case 'At Risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Positive':
        return 'bg-green-100 text-green-800';
      case 'Neutral':
        return 'bg-yellow-100 text-yellow-800';
      case 'Negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: number) => {
    return trend > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTrendColor = (trend: number) => {
    return trend > 0 ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sustainability Module
          </h1>
          <p className="text-muted-foreground">
            Monitor environmental impact and long-term asset viability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Carbon Footprint
            </CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sustainabilityMetrics.carbonFootprint.current}
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(sustainabilityMetrics.carbonFootprint.trend)}
              <span
                className={getTrendColor(
                  sustainabilityMetrics.carbonFootprint.trend
                )}
              >
                {Math.abs(sustainabilityMetrics.carbonFootprint.trend)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {sustainabilityMetrics.carbonFootprint.target} tonnes CO2
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Energy Efficiency
            </CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sustainabilityMetrics.energyEfficiency.current}%
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(sustainabilityMetrics.energyEfficiency.trend)}
              <span
                className={getTrendColor(
                  sustainabilityMetrics.energyEfficiency.trend
                )}
              >
                {Math.abs(sustainabilityMetrics.energyEfficiency.trend)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {sustainabilityMetrics.energyEfficiency.target}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Water Conservation
            </CardTitle>
            <Droplets className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sustainabilityMetrics.waterConservation.current}%
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(sustainabilityMetrics.waterConservation.trend)}
              <span
                className={getTrendColor(
                  sustainabilityMetrics.waterConservation.trend
                )}
              >
                {Math.abs(sustainabilityMetrics.waterConservation.trend)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {sustainabilityMetrics.waterConservation.target}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Waste Reduction
            </CardTitle>
            <Recycle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sustainabilityMetrics.wasteReduction.current}%
            </div>
            <div className="flex items-center gap-1 text-xs">
              {getTrendIcon(sustainabilityMetrics.wasteReduction.trend)}
              <span
                className={getTrendColor(
                  sustainabilityMetrics.wasteReduction.trend
                )}
              >
                {Math.abs(sustainabilityMetrics.wasteReduction.trend)}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Target: {sustainabilityMetrics.wasteReduction.target}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="goals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="goals">Sustainability Goals</TabsTrigger>
          <TabsTrigger value="assets">Environmental Assets</TabsTrigger>
          <TabsTrigger value="initiatives">Initiatives</TabsTrigger>
          <TabsTrigger value="reporting">Reporting</TabsTrigger>
        </TabsList>

        {/* Sustainability Goals Tab */}
        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sustainability Goals</CardTitle>
              <CardDescription>
                Long-term environmental objectives aligned with asset management
                strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Goal</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Target Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sustainabilityGoals.map(goal => (
                    <TableRow key={goal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{goal.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {goal.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{goal.category}</Badge>
                      </TableCell>
                      <TableCell>{goal.target}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{goal.progress}%</span>
                          </div>
                          <Progress value={goal.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Environmental Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environmental Assets</CardTitle>
              <CardDescription>
                Assets contributing to environmental sustainability and impact
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Impact</TableHead>
                    <TableHead>Efficiency</TableHead>
                    <TableHead>Environmental Benefit</TableHead>
                    <TableHead>Next Maintenance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {environmentalAssets.map(asset => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        {asset.name}
                      </TableCell>
                      <TableCell>{asset.category}</TableCell>
                      <TableCell>
                        <Badge className={getImpactColor(asset.impact)}>
                          {asset.impact}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.efficiency}%</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {asset.category === 'Renewable Energy' && (
                            <div>
                              CO2 Reduction: {asset.co2Reduction} tonnes/year
                            </div>
                          )}
                          {asset.category === 'Water Management' && (
                            <div>
                              Water Saved:{' '}
                              {(asset.waterSaved / 1000000).toFixed(1)}M
                              litres/year
                            </div>
                          )}
                          {asset.category === 'Waste Processing' && (
                            <div>Waste Diverted: {asset.wasteDiverted}%</div>
                          )}
                          {asset.category === 'Energy Management' && (
                            <div>
                              Energy:{' '}
                              {(asset.energyConsumption / 1000).toFixed(0)}k
                              kWh/year
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{asset.nextMaintenance}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Initiatives Tab */}
        <TabsContent value="initiatives" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {sustainabilityInitiatives.map(initiative => (
              <Card key={initiative.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{initiative.name}</CardTitle>
                    <Badge className={getImpactColor(initiative.impact)}>
                      {initiative.impact} Impact
                    </Badge>
                  </div>
                  <CardDescription>{initiative.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm">{initiative.completion}%</span>
                    </div>
                    <Progress value={initiative.completion} className="h-2" />
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(initiative.status)}>
                        {initiative.status}
                      </Badge>
                      <Badge variant="outline">{initiative.category}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reporting Tab */}
        <TabsContent value="reporting" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Environmental Impact Summary</CardTitle>
                <CardDescription>
                  Overall environmental performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Carbon Footprint Reduction</span>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">5.2%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">
                      Energy Efficiency Improvement
                    </span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">2.1%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Water Conservation</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">1.8%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Waste Reduction</span>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">3.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sustainability Achievements</CardTitle>
                <CardDescription>
                  Key milestones and certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="text-sm">
                    <div className="font-medium">ISO 14001 Certification</div>
                    <div className="text-muted-foreground">
                      Environmental Management System
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="text-sm">
                    <div className="font-medium">LEED Gold Certification</div>
                    <div className="text-muted-foreground">
                      Green Building Standard
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="text-sm">
                    <div className="font-medium">Carbon Trust Standard</div>
                    <div className="text-muted-foreground">
                      Carbon Management
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <div className="text-sm">
                    <div className="font-medium">BREEAM Excellent</div>
                    <div className="text-muted-foreground">In Progress</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
