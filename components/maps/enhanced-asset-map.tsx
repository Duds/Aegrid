'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Activity,
  AlertCircle,
  BookOpen,
  Building2,
  Droplets,
  Filter,
  MapPin,
  Route,
  TrafficCone,
  TreePine,
  Zap,
  Settings,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  BasemapSelector,
  useBasemapSelection,
  BASEMAP_OPTIONS,
} from './basemap-selector';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then(mod => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then(mod => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false,
});
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false,
});
const MarkerClusterGroup = dynamic(
  () => import('react-leaflet').then(mod => mod.MarkerClusterGroup),
  { ssr: false }
);

/**
 * Enhanced Map component with ArcGIS basemap integration
 * Supports multiple professional basemaps and improved performance
 */
function EnhancedLeafletMapComponent({
  center,
  zoom,
  assets,
  onAssetSelect,
  selectedBasemap,
}: {
  center: [number, number];
  zoom: number;
  assets: Asset[];
  onAssetSelect?: (asset: Asset) => void;
  selectedBasemap: string;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    // Set map as ready after component mounts
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      setIsMapReady(false);
      // Clean up map instance if it exists
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Don't render map until it's ready
  if (!isMapReady) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoadingSpinner size="sm" />
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  // Get selected basemap configuration
  const basemapConfig =
    BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];

  return (
    <MapContainer
      ref={mapRef}
      center={center}
      zoom={zoom}
      className="h-full w-full rounded-lg"
      whenCreated={mapInstance => {
        // Only set the map instance if we don't already have one
        if (!mapRef.current) {
          mapRef.current = mapInstance;
        }
      }}
    >
      <TileLayer
        url={basemapConfig.url}
        attribution={basemapConfig.attribution}
        maxZoom={18}
        minZoom={1}
      />

      <MarkerClusterGroup>
        {assets.map(asset => {
          if (!asset.latitude || !asset.longitude) return null;

          const { IconComponent, color } = getAssetIcon(asset);
          return (
            <Marker
              key={asset.id}
              position={[asset.latitude, asset.longitude]}
              eventHandlers={{
                click: () => onAssetSelect?.(asset),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2">
                    <IconComponent
                      className="h-5 w-5"
                      style={{ '--icon-color': color } as React.CSSProperties}
                    />
                    <div>
                      <h4 className="font-semibold text-sm">{asset.name}</h4>
                      <p className="text-xs text-gray-600">
                        {asset.assetNumber}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    <Badge
                      variant={getStatusBadgeVariant(asset.status)}
                      className="text-xs"
                    >
                      {asset.status.replace('_', ' ')}
                    </Badge>
                    <Badge
                      variant={getConditionBadgeVariant(asset.condition)}
                      className="text-xs ml-1"
                    >
                      {asset.condition}
                    </Badge>
                    <Badge variant="outline" className="text-xs ml-1">
                      {asset.priority}
                    </Badge>
                  </div>

                  {asset.address && (
                    <p className="text-xs text-gray-600 mb-2">
                      📍 {asset.address}
                      {asset.suburb && `, ${asset.suburb}`}
                      {asset.postcode && ` ${asset.postcode}`}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-6 px-2"
                      onClick={() => onAssetSelect?.(asset)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

// Dynamically import the map component with proper loading state
const EnhancedLeafletMap = dynamic(
  () => Promise.resolve(EnhancedLeafletMapComponent),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="flex items-center gap-2 text-muted-foreground">
          <LoadingSpinner size="sm" />
          <span>Loading map...</span>
        </div>
      </div>
    ),
  }
);

// Helper functions moved outside component
const getAssetIcon = (asset: Asset) => {
  const iconMap: Record<
    string,
    { component: React.ComponentType<{ className?: string }>; color: string }
  > = {
    building: { component: Building2, color: '#3B82F6' },
    road: { component: Route, color: '#6B7280' },
    tree: { component: TreePine, color: '#10B981' },
    book: { component: BookOpen, color: '#8B5CF6' },
    activity: { component: Activity, color: '#F59E0B' },
    traffic: { component: TrafficCone, color: '#EF4444' },
    water: { component: Droplets, color: '#06B6D4' },
    electrical: { component: Zap, color: '#F59E0B' },
  };

  const icon = iconMap[asset.assetType.toLowerCase()] || {
    component: MapPin,
    color: '#6B7280',
  };
  return {
    IconComponent: icon.component,
    color: icon.color,
  };
};

const getStatusBadgeVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'default';
    case 'inactive':
      return 'secondary';
    case 'maintenance':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getConditionBadgeVariant = (condition: string) => {
  switch (condition.toLowerCase()) {
    case 'excellent':
      return 'default';
    case 'good':
      return 'default';
    case 'fair':
      return 'secondary';
    case 'poor':
      return 'destructive';
    case 'critical':
      return 'destructive';
    default:
      return 'outline';
  }
};

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
  isPublic?: boolean;
}

interface EnhancedAssetMapProps {
  assets?: Asset[];
  onAssetSelect?: (asset: Asset) => void;
  selectedAsset?: Asset | null;
  height?: string;
  showBasemapSelector?: boolean;
}

/**
 * Enhanced Asset Map Component with ArcGIS Integration
 * Displays assets on an interactive map with professional basemaps
 * Supports multiple map styles and improved performance
 */
export function EnhancedAssetMap({
  assets = [],
  onAssetSelect,
  selectedAsset: _selectedAsset,
  height = '500px',
  showBasemapSelector = true,
}: EnhancedAssetMapProps) {
  const [_mapAssets, _setMapAssets] = useState<Asset[]>([]);
  const [_loading, _setLoading] = useState(false);
  const [_error, _setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    assetType: '',
    status: '',
    condition: '',
    priority: '',
    hasLocation: true,
  });
  const [mapKey] = useState(
    () => `map-${Math.random().toString(36).substr(2, 9)}`
  );

  // Use basemap selection hook
  const { selectedBasemap, setBasemap } = useBasemapSelection();

  // Filter assets that have location data
  const assetsWithLocation = assets.filter(
    asset =>
      asset.latitude &&
      asset.longitude &&
      asset.latitude >= -90 &&
      asset.latitude <= 90 &&
      asset.longitude >= -180 &&
      asset.longitude <= 180
  );

  // Apply filters
  const filteredAssets = assetsWithLocation.filter(asset => {
    if (filters.assetType && asset.assetType !== filters.assetType)
      return false;
    if (filters.status && asset.status !== filters.status) return false;
    if (filters.condition && asset.condition !== filters.condition)
      return false;
    if (filters.priority && asset.priority !== filters.priority) return false;
    return true;
  });

  // Get unique values for filter dropdowns
  const assetTypes = [...new Set(assetsWithLocation.map(a => a.assetType))];
  const statuses = [...new Set(assetsWithLocation.map(a => a.status))];
  const conditions = [...new Set(assetsWithLocation.map(a => a.condition))];
  const priorities = [...new Set(assetsWithLocation.map(a => a.priority))];

  // Default map center (Sydney, Australia)
  const mapCenter: [number, number] = [-33.8688, 151.2093];
  const defaultZoom = 10;

  if (_loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoadingSpinner size="lg" mx-auto mb-2 />
        </div>
      </div>
    );
  }

  if (_error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{_error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Map Controls Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Asset Map</h3>
          <p className="text-sm text-muted-foreground">
            View and manage assets across your organisation
          </p>
        </div>

        {showBasemapSelector && (
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-muted-foreground" />
            <BasemapSelector
              selectedBasemap={selectedBasemap}
              onBasemapChange={setBasemap}
            />
          </div>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Map Filters
          </CardTitle>
          <CardDescription>Filter assets displayed on the map</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Asset Type
              </label>
              <select
                value={filters.assetType}
                onChange={e =>
                  setFilters(prev => ({ ...prev, assetType: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
                aria-label="Filter by asset type"
              >
                <option value="">All Types</option>
                {assetTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={e =>
                  setFilters(prev => ({ ...prev, status: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
                aria-label="Filter by status"
              >
                <option value="">All Statuses</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Condition
              </label>
              <select
                value={filters.condition}
                onChange={e =>
                  setFilters(prev => ({ ...prev, condition: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
                aria-label="Filter by condition"
              >
                <option value="">All Conditions</option>
                {conditions.map(condition => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Priority</label>
              <select
                value={filters.priority}
                onChange={e =>
                  setFilters(prev => ({ ...prev, priority: e.target.value }))
                }
                className="w-full p-2 border rounded-md"
                aria-label="Filter by priority"
              >
                <option value="">All Priorities</option>
                {priorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  assetType: '',
                  status: '',
                  condition: '',
                  priority: '',
                  hasLocation: true,
                })
              }
              className="w-full"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Map Legend */}
      <div className="flex flex-wrap gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm">Good/Excellent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm">Fair</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span className="text-sm">Poor</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm">Unknown</span>
        </div>
      </div>

      {/* Map Container */}
      <Card>
        <CardContent className="p-0">
          <div className="relative map-container" style={{ height }}>
            <EnhancedLeafletMap
              key={`${mapKey}-${selectedBasemap}`}
              center={mapCenter}
              zoom={defaultZoom}
              assets={filteredAssets}
              onAssetSelect={onAssetSelect}
              selectedBasemap={selectedBasemap}
            />
          </div>
        </CardContent>
      </Card>

      {/* Asset Summary */}
      {filteredAssets.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {filteredAssets.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Assets
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {
                    filteredAssets.filter(
                      a => a.condition === 'excellent' || a.condition === 'good'
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Good Condition
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {filteredAssets.filter(a => a.condition === 'fair').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Fair Condition
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {
                    filteredAssets.filter(
                      a => a.condition === 'poor' || a.condition === 'critical'
                    ).length
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Poor Condition
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
