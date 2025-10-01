'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Filter, Settings } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  BASEMAP_OPTIONS,
  BasemapSelector,
  useBasemapSelection,
} from './basemap-selector';

// Dynamically import Leaflet components
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

interface StableMapProps {
  assets?: Asset[];
  onAssetSelect?: (asset: Asset) => void;
  selectedAsset?: Asset | null;
  height?: string;
  showBasemapSelector?: boolean;
}

// Helper functions
const getAssetIcon = (asset: Asset) => {
  const iconMap: Record<
    string,
    { component: React.ComponentType<{ className?: string }>; color: string }
  > = {
    building: { component: () => <div>🏢</div>, color: '#3B82F6' },
    road: { component: () => <div>🛣️</div>, color: '#6B7280' },
    tree: { component: () => <div>🌳</div>, color: '#10B981' },
    book: { component: () => <div>📚</div>, color: '#8B5CF6' },
    activity: { component: () => <div>🏃</div>, color: '#F59E0B' },
    traffic: { component: () => <div>🚧</div>, color: '#EF4444' },
    water: { component: () => <div>💧</div>, color: '#06B6D4' },
    electrical: { component: () => <div>⚡</div>, color: '#F59E0B' },
  };

  const icon = iconMap[asset.assetType.toLowerCase()] || {
    component: () => <div>📍</div>,
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

/**
 * Stable Map Component
 * Uses a single map instance and only changes tile layers
 */
export function StableMap({
  assets = [],
  onAssetSelect,
  selectedAsset: _selectedAsset,
  height = '500px',
  showBasemapSelector = true,
}: StableMapProps) {
  const [filters, setFilters] = useState({
    assetType: '',
    status: '',
    condition: '',
    priority: '',
    hasLocation: true,
  });
  const [isClient, setIsClient] = useState(false);
  const [_mapInstance, setMapInstance] = useState<unknown>(null);

  // Use basemap selection hook
  const { selectedBasemap, setBasemap } = useBasemapSelection();

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

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

  // Get selected basemap configuration
  const basemapConfig =
    BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];

  // Don't render map until client-side
  if (!isClient) {
    return (
      <div
        className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Initializing map...</span>
        </div>
      </div>
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
          <div className="relative" style={{ height }}>
            <MapContainer
              center={mapCenter}
              zoom={defaultZoom}
              className="h-full w-full rounded-lg"
              whenCreated={setMapInstance}
            >
              <TileLayer
                url={basemapConfig.url}
                attribution={basemapConfig.attribution}
                maxZoom={18}
                minZoom={1}
              />

              <MarkerClusterGroup>
                {filteredAssets.map(asset => {
                  if (!asset.latitude || !asset.longitude) return null;

                  const { IconComponent } = getAssetIcon(asset);
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
                            <IconComponent />
                            <div>
                              <h4 className="font-semibold text-sm">
                                {asset.name}
                              </h4>
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
                              variant={getConditionBadgeVariant(
                                asset.condition
                              )}
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
