'use client';

import { StableMap } from '@/components/maps/stable-map';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Layers, MapPin, Satellite } from 'lucide-react';

interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  assetType: string;
  status: string;
  condition: string;
  priority: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  suburb?: string;
  postcode?: string;
  state?: string;
  country?: string;
}

// Sample asset data for demonstration
const sampleAssets = [
  {
    id: '1',
    assetNumber: 'BLD-001',
    name: 'Main Administration Building',
    assetType: 'building',
    status: 'active',
    condition: 'good',
    priority: 'high',
    latitude: -33.8688,
    longitude: 151.2093,
    address: '123 George Street',
    suburb: 'Sydney',
    postcode: '2000',
    state: 'NSW',
    country: 'Australia',
  },
  {
    id: '2',
    assetNumber: 'RD-001',
    name: 'Main Street Road',
    assetType: 'road',
    status: 'active',
    condition: 'fair',
    priority: 'medium',
    latitude: -33.8708,
    longitude: 151.2103,
    address: 'Main Street',
    suburb: 'Sydney',
    postcode: '2000',
    state: 'NSW',
    country: 'Australia',
  },
  {
    id: '3',
    assetNumber: 'TR-001',
    name: 'City Park Trees',
    assetType: 'tree',
    status: 'active',
    condition: 'excellent',
    priority: 'low',
    latitude: -33.8668,
    longitude: 151.2083,
    address: 'Hyde Park',
    suburb: 'Sydney',
    postcode: '2000',
    state: 'NSW',
    country: 'Australia',
  },
  {
    id: '4',
    assetNumber: 'LIB-001',
    name: 'Central Library',
    assetType: 'book',
    status: 'active',
    condition: 'good',
    priority: 'high',
    latitude: -33.8728,
    longitude: 151.2073,
    address: '456 Macquarie Street',
    suburb: 'Sydney',
    postcode: '2000',
    state: 'NSW',
    country: 'Australia',
  },
  {
    id: '5',
    assetNumber: 'WTR-001',
    name: 'Water Treatment Plant',
    assetType: 'water',
    status: 'active',
    condition: 'critical',
    priority: 'critical',
    latitude: -33.8648,
    longitude: 151.2113,
    address: '789 Harbour Street',
    suburb: 'Sydney',
    postcode: '2000',
    state: 'NSW',
    country: 'Australia',
  },
];

/**
 * Enhanced Maps Demo Page
 * Demonstrates ArcGIS integration with professional basemaps
 */
export default function EnhancedMapsDemoPage() {
  const handleAssetSelect = (asset: Asset) => {
    console.log('Selected asset:', asset);
    // In a real implementation, this would navigate to asset details
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Enhanced Maps Demo</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience Aegrid&apos;s enhanced mapping capabilities with
          professional ArcGIS basemaps, improved Australian coverage, and
          advanced asset visualization.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-blue-600" />
              Professional Basemaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Choose from ArcGIS Streets, Satellite, Topographic, and
              OpenStreetMap options.
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                ArcGIS Streets
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Satellite
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Topographic
              </Badge>
              <Badge variant="secondary" className="text-xs">
                OpenStreetMap
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5 text-green-600" />
              Enhanced Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Optimized for mobile PWA with persistent user preferences and fast
              loading.
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                Mobile Optimized
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Persistent Settings
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Fast Loading
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Satellite className="h-5 w-5 text-purple-600" />
              Australian Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Better geographic data coverage for Australian councils and
              assets.
            </p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="secondary" className="text-xs">
                Local Data
              </Badge>
              <Badge variant="secondary" className="text-xs">
                High Resolution
              </Badge>
              <Badge variant="secondary" className="text-xs">
                Accurate
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Asset Map */}
      <Card>
        <CardHeader>
          <CardTitle>Interactive Asset Map with ArcGIS Integration</CardTitle>
          <CardDescription>
            Use the map style selector in the top-right to switch between
            different basemaps. Click on assets to view details, and use the
            filters to focus on specific asset types.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StableMap
            assets={sampleAssets}
            onAssetSelect={handleAssetSelect}
            height="600px"
            showBasemapSelector={true}
          />
        </CardContent>
      </Card>

      {/* Implementation Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Highlights</CardTitle>
          <CardDescription>
            Key features and benefits of the ArcGIS integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Technical Benefits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Hybrid Leaflet + ArcGIS architecture</li>
                <li>• Cost-effective service integration</li>
                <li>• Persistent user preferences</li>
                <li>• Mobile PWA compatibility</li>
                <li>• Professional map styling</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Business Value</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Enhanced executive dashboards</li>
                <li>• Better spatial decision-making</li>
                <li>• Improved user experience</li>
                <li>• Foundation for advanced GIS features</li>
                <li>• Compliance with attribution requirements</li>
              </ul>
            </div>
          </div>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Aegrid Rules Alignment
            </h4>
            <p className="text-sm text-blue-800">
              This implementation supports{' '}
              <strong>Rule 1: Every Asset Has a Purpose</strong> by providing
              enhanced spatial visualization that helps identify asset purpose
              and relationships through geographic context. The professional
              basemaps improve decision-making and support function-based asset
              organization.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
