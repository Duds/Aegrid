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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Activity,
    AlertTriangle,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    MapPin,
    RefreshCw,
    Search,
    Shield,
    Target,
    TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface Asset {
  id: string;
  name: string;
  assetNumber: string;
  assetType: string;
  purpose: string | null;
  condition: string;
  criticalityLevel: string | null;
  address: string | null;
  suburb: string | null;
  postcode: string | null;
  state: string | null;
  lastInspection: Date | null;
  nextInspection: Date | null;
  // Lifecycle Management Data
  installationDate: Date | null;
  expectedLifespan: number | null;
  currentValue: number | null;
  replacementCost: number | null;
  depreciationRate: number | null;
  purchasePrice: number | null;
  warrantyExpiry: Date | null;
  maintenanceCost: number | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  status: string;
  priority: string;
  // Calculated fields
  currentAge: number;
  lifecycleStage: string;
  replacementDate: Date | null;
  yearsToReplacement: number | null;
  lifecycleProgress: number;
  totalLifecycleCost: number;
  annualMaintenanceCost: number;
  residualValue: number;
}

/**
 * Asset Register Page
 *
 * Purpose-driven asset search and discovery interface showcasing Rule 1: Every Asset Has a Purpose
 * Provides asset lookup by service purpose, not just asset type
 * Enhanced with lifecycle management capabilities
 */
export default function AssetRegisterPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real asset data from API
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/planning/asset-register?search=${encodeURIComponent(searchTerm)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch assets');
      }
      const data = await response.json();
      setAssets(data.assets);
      setError(null);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [searchTerm]);

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'GOOD':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAIR':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'POOR':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCriticalityBadge = (criticality: string) => {
    switch (criticality) {
      case 'Critical':
        return 'destructive';
      case 'High':
        return 'outline';
      case 'Medium':
        return 'secondary';
      case 'Low':
        return 'default';
      default:
        return 'default';
    }
  };

  const getLifecycleStageBadge = (stage: string) => {
    switch (stage) {
      case 'NEW':
        return 'default';
      case 'OPERATIONAL':
        return 'secondary';
      case 'MATURE':
        return 'outline';
      case 'AGING':
        return 'destructive';
      case 'REPLACEMENT_DUE':
        return 'destructive';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <AppLayout
        requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
        title="Asset Register"
        description="Purpose-driven asset search and management"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading assets...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout
        requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
        title="Asset Register"
        description="Purpose-driven asset search and management"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={fetchAssets} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN', 'MANAGER', 'SUPERVISOR']}
      title="Asset Register"
      description="Purpose-driven asset search and management"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Asset Register
            </h1>
            <p className="text-muted-foreground">
              Comprehensive asset register with purpose-driven organization and lifecycle management
            </p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Rule 1: Every Asset Has a Purpose
            </Badge>
            <Button variant="outline" size="sm">
              <Building2 className="h-4 w-4 mr-2" />
              Add Asset
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Asset Search & Discovery
            </CardTitle>
            <CardDescription>
              Search assets by purpose, type, or name to find what you need
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by asset name, purpose, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button onClick={fetchAssets} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Asset Management Tabs */}
        <Tabs defaultValue="register" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="register" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Asset Register
            </TabsTrigger>
            <TabsTrigger value="lifecycle" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Lifecycle Management
            </TabsTrigger>
          </TabsList>

          {/* Asset Register Tab */}
          <TabsContent value="register" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getConditionIcon(asset.condition)}
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                      </div>
                      <Badge variant={getCriticalityBadge(asset.criticalityLevel || '')}>
                        {asset.criticalityLevel || 'Unknown'}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {asset.purpose || 'No purpose defined'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Asset Number:</span>
                        <span>{asset.assetNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Type:</span>
                        <span>{asset.assetType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Location:</span>
                        <span>{asset.suburb || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Last Inspection:</span>
                        <span>
                          {asset.lastInspection
                            ? new Date(asset.lastInspection).toLocaleDateString()
                            : 'Never'
                          }
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Next Inspection:</span>
                        <span>
                          {asset.nextInspection
                            ? new Date(asset.nextInspection).toLocaleDateString()
                            : 'Not scheduled'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Lifecycle Management Tab */}
          <TabsContent value="lifecycle" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <Card key={asset.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <CardTitle className="text-lg">{asset.name}</CardTitle>
                      </div>
                      <Badge variant={getLifecycleStageBadge(asset.lifecycleStage)}>
                        {asset.lifecycleStage}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {asset.purpose || 'No purpose defined'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Age:</span>
                        <span>{asset.currentAge} years</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Expected Lifespan:</span>
                        <span>{asset.expectedLifespan || 'Unknown'} years</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Years to Replacement:</span>
                        <span>{asset.yearsToReplacement || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Current Value:</span>
                        <span>${asset.currentValue?.toLocaleString() || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Replacement Cost:</span>
                        <span>${asset.replacementCost?.toLocaleString() || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Lifecycle Progress:</span>
                        <span>{asset.lifecycleProgress}%</span>
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
