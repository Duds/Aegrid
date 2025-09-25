"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    AlertTriangle,
    BarChart3,
    Car,
    CheckCircle,
    Factory,
    Globe,
    Leaf,
    Target,
    TreePine,
    TrendingDown,
    TrendingUp,
    Zap
} from "lucide-react";
import { useEffect, useState } from "react";

interface CarbonTrackingPanelProps {
  data: any;
  period: string;
}

/**
 * Carbon Tracking Panel Component - E21
 *
 * Carbon emissions tracking and sustainability reporting
 *
 * @component CarbonTrackingPanel
 * @example
 * ```tsx
 * <CarbonTrackingPanel
 *   data={carbonData}
 *   period="MONTHLY"
 * />
 * ```
 * @accessibility
 * - ARIA roles: main, progressbar, status
 * - Keyboard navigation: Tab through carbon metrics
 * - Screen reader: Announces carbon emissions and targets
 */
export function CarbonTrackingPanel({ data, period }: CarbonTrackingPanelProps) {
  const [emissionsData, setEmissionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  useEffect(() => {
    fetchEmissionsData();
  }, [selectedPeriod]);

  const fetchEmissionsData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/energy?action=carbon-summary&period=${selectedPeriod}`);
      const result = await response.json();

      if (result.success) {
        setEmissionsData(result.emissions || []);
      }
    } catch (error) {
      console.error('Failed to fetch emissions data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmissionsStatus = (totalEmissions: number) => {
    // Define thresholds based on organisation size and type
    const threshold = 1000; // kg CO2e per month threshold

    if (totalEmissions < threshold * 0.5) return { status: 'Excellent', color: 'bg-green-500', badge: 'default' };
    if (totalEmissions < threshold) return { status: 'Good', color: 'bg-blue-500', badge: 'default' };
    if (totalEmissions < threshold * 1.5) return { status: 'Fair', color: 'bg-yellow-500', badge: 'warning' };
    return { status: 'Poor', color: 'bg-red-500', badge: 'destructive' };
  };

  const calculateEmissionsTrend = () => {
    if (emissionsData.length < 2) return 0;

    const recent = emissionsData.slice(0, 3);
    const older = emissionsData.slice(3, 6);

    if (recent.length === 0 || older.length === 0) return 0;

    const recentTotal = recent.reduce((sum, item) => sum + Number(item.totalEmissions || 0), 0);
    const olderTotal = older.reduce((sum, item) => sum + Number(item.totalEmissions || 0), 0);

    return olderTotal > 0 ? ((recentTotal - olderTotal) / olderTotal) * 100 : 0;
  };

  const getTotalEmissions = () => {
    return data?.totalEmissions || 0;
  };

  const getScopeBreakdown = () => {
    return {
      scope1: data?.totalScope1 || 0,
      scope2: data?.totalScope2 || 0,
      scope3: data?.totalScope3 || 0,
    };
  };

  const getCarbonIntensity = () => {
    const totalEnergy = emissionsData.reduce((sum, item) => sum + Number(item.energyConsumed || 0), 0);
    return totalEnergy > 0 ? getTotalEmissions() / totalEnergy : 0;
  };

  const getRenewablePercentage = () => {
    const totalEnergy = emissionsData.reduce((sum, item) => sum + Number(item.energyConsumed || 0), 0);
    const renewableEnergy = data?.totalRenewable || 0;
    return totalEnergy > 0 ? (renewableEnergy / totalEnergy) * 100 : 0;
  };

  const getCarbonOffset = () => {
    return data?.totalOffset || 0;
  };

  const totalEmissions = getTotalEmissions();
  const scopeBreakdown = getScopeBreakdown();
  const carbonIntensity = getCarbonIntensity();
  const renewablePercentage = getRenewablePercentage();
  const carbonOffset = getCarbonOffset();
  const emissionsTrend = calculateEmissionsTrend();
  const emissionsStatus = getEmissionsStatus(totalEmissions);

  const equivalentTrees = Math.round(totalEmissions / 22); // 1 tree absorbs ~22 kg CO2 per year
  const equivalentCars = Math.round(totalEmissions / 4040); // Average car emits ~4.04 tonnes CO2 per year

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center space-x-2">
            <Leaf className="h-5 w-5" />
            <span>Carbon Tracking & Sustainability</span>
          </h2>
          <p className="text-muted-foreground">
            Monitor carbon emissions and environmental impact
          </p>
        </div>

        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DAILY">Daily</SelectItem>
            <SelectItem value="WEEKLY">Weekly</SelectItem>
            <SelectItem value="MONTHLY">Monthly</SelectItem>
            <SelectItem value="YEARLY">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Carbon Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmissions.toFixed(1)} kg CO₂e</div>
            <p className="text-xs text-muted-foreground">
              This {selectedPeriod.toLowerCase()}
            </p>
            <div className="mt-2">
              <Progress value={Math.min((totalEmissions / 2000) * 100, 100)} className="h-2" />
            </div>
            <Badge variant={emissionsStatus.badge} className="mt-2">
              {emissionsStatus.status}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emissions Trend</CardTitle>
            {emissionsTrend >= 0 ? (
              <TrendingUp className="h-4 w-4 text-red-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.abs(emissionsTrend).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {emissionsTrend >= 0 ? 'Increase' : 'Decrease'} vs previous period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Carbon Intensity</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{carbonIntensity.toFixed(3)} kg CO₂e/kWh</div>
            <p className="text-xs text-muted-foreground">
              Emissions per unit energy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Renewable Energy</CardTitle>
            <TreePine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{renewablePercentage.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of total energy consumption
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Scope Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Scope Breakdown</span>
          </CardTitle>
          <CardDescription>
            Greenhouse gas emissions by scope (GHG Protocol)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Factory className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">Scope 1</h3>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {scopeBreakdown.scope1.toFixed(1)} kg CO₂e
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Direct emissions
              </p>
              <div className="mt-2">
                <Progress
                  value={(scopeBreakdown.scope1 / totalEmissions) * 100}
                  className="h-2"
                />
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Zap className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">Scope 2</h3>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {scopeBreakdown.scope2.toFixed(1)} kg CO₂e
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Indirect energy emissions
              </p>
              <div className="mt-2">
                <Progress
                  value={(scopeBreakdown.scope2 / totalEmissions) * 100}
                  className="h-2"
                />
              </div>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <Car className="h-5 w-5 text-orange-500" />
                <h3 className="font-semibold">Scope 3</h3>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {scopeBreakdown.scope3.toFixed(1)} kg CO₂e
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Other indirect emissions
              </p>
              <div className="mt-2">
                <Progress
                  value={(scopeBreakdown.scope3 / totalEmissions) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Environmental Impact Equivalents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Environmental Impact</span>
          </CardTitle>
          <CardDescription>
            Carbon emissions equivalent to common activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <TreePine className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {equivalentTrees}
              </div>
              <p className="text-sm text-muted-foreground">
                Trees needed to absorb this amount of CO₂
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Based on 22 kg CO₂ per tree per year)
              </p>
            </div>

            <div className="text-center p-4 border rounded-lg">
              <Car className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {equivalentCars}
              </div>
              <p className="text-sm text-muted-foreground">
                Car emissions equivalent
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                (Based on 4.04 tonnes CO₂ per car per year)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Carbon Offset and Renewable Energy */}
      {(carbonOffset > 0 || renewablePercentage > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Sustainability Initiatives</span>
            </CardTitle>
            <CardDescription>
              Renewable energy and carbon offset programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {carbonOffset > 0 && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Leaf className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Carbon Offset</h3>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {carbonOffset.toFixed(1)} kg CO₂e
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Offset through verified programs
                  </p>
                </div>
              )}

              {renewablePercentage > 0 && (
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TreePine className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Renewable Energy</h3>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {renewablePercentage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Of total energy consumption
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Emissions Data */}
      {emissionsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Emissions Data</CardTitle>
            <CardDescription>
              Breakdown of emissions by asset and time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Asset</th>
                    <th className="text-right p-2">Total Emissions</th>
                    <th className="text-right p-2">Scope 1</th>
                    <th className="text-right p-2">Scope 2</th>
                    <th className="text-right p-2">Scope 3</th>
                    <th className="text-right p-2">Energy Used</th>
                    <th className="text-right p-2">Intensity</th>
                    <th className="text-left p-2">Period</th>
                  </tr>
                </thead>
                <tbody>
                  {emissionsData.slice(0, 20).map((item, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div>
                          <div className="font-medium">
                            {item.asset?.name || 'Unknown Asset'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {item.asset?.assetNumber || 'No asset number'}
                          </div>
                        </div>
                      </td>
                      <td className="text-right p-2 font-medium">
                        {Number(item.totalEmissions || 0).toFixed(1)} kg CO₂e
                      </td>
                      <td className="text-right p-2">
                        {Number(item.scope1Emissions || 0).toFixed(1)}
                      </td>
                      <td className="text-right p-2">
                        {Number(item.scope2Emissions || 0).toFixed(1)}
                      </td>
                      <td className="text-right p-2">
                        {Number(item.scope3Emissions || 0).toFixed(1)}
                      </td>
                      <td className="text-right p-2">
                        {Number(item.energyConsumed || 0).toFixed(1)} kWh
                      </td>
                      <td className="text-right p-2">
                        {Number(item.emissionFactor || 0).toFixed(3)} kg CO₂e/kWh
                      </td>
                      <td className="p-2 text-xs text-muted-foreground">
                        {new Date(item.measurementPeriod).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sustainability Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span>Sustainability Recommendations</span>
          </CardTitle>
          <CardDescription>
            Actions to reduce carbon footprint and improve sustainability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {totalEmissions > 1000 && (
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">High Emissions Alert</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider implementing energy efficiency measures and renewable energy sources
                  </p>
                </div>
              </div>
            )}

            {renewablePercentage < 20 && (
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <TreePine className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Increase Renewable Energy</h4>
                  <p className="text-sm text-muted-foreground">
                    Current renewable energy usage is {renewablePercentage.toFixed(1)}%. Consider solar panels or green energy contracts.
                  </p>
                </div>
              </div>
            )}

            {emissionsTrend > 5 && (
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <TrendingUp className="h-5 w-5 text-red-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Rising Emissions Trend</h4>
                  <p className="text-sm text-muted-foreground">
                    Emissions are increasing by {emissionsTrend.toFixed(1)}%. Review energy consumption patterns.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium">Carbon Offset Program</h4>
                <p className="text-sm text-muted-foreground">
                  Consider participating in verified carbon offset programs to neutralise remaining emissions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
