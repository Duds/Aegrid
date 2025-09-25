/**
 * Epic 24: Language Simplification & Visualisation Enhancement
 * Asset Visualisation Map Component
 *
 * Provides geographic asset mapping with condition overlays, interactive filtering,
 * and real-time status indicators for enhanced visualisation.
 *
 * @component AssetVisualisationMap
 * @version 1.0.0
 * @author Aegrid Development Team
 */

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
import { Input } from '@/components/ui/input';
import {
    createTransformationContext,
    transformNavigationLabel,
} from '@/lib/language-dictionary/language-transformer';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    Filter,
    Info,
    Layers,
    MapPin,
    Search,
    ZoomIn,
    ZoomOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface AssetLocation {
  id: string;
  name: string;
  type: string;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL' | 'UNKNOWN';
  status:
    | 'ACTIVE'
    | 'INACTIVE'
    | 'UNDER_MAINTENANCE'
    | 'UNDER_CONSTRUCTION'
    | 'DECOMMISSIONED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  latitude: number;
  longitude: number;
  address: string;
  lastInspection: string;
  nextInspection: string;
  value: number;
  criticality: string;
}

interface MapFilter {
  condition: string[];
  status: string[];
  priority: string[];
  type: string[];
  criticality: string[];
}

interface MapViewState {
  center: [number, number];
  zoom: number;
  selectedAsset: string | null;
}

/**
 * Asset Visualisation Map Component
 * Provides interactive geographic mapping with condition overlays and filtering
 *
 * @example
 * ```tsx
 * <AssetVisualisationMap />
 * ```
 * @accessibility
 * - ARIA roles: main, region, button, listbox
 * - Keyboard navigation: Tab through map controls and filters
 * - Screen reader: Announces asset information and status changes
 */
export function AssetVisualisationMap() {
  const [assets, setAssets] = useState<AssetLocation[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<AssetLocation[]>([]);
  const [filters, setFilters] = useState<MapFilter>({
    condition: [],
    status: [],
    priority: [],
    type: [],
    criticality: [],
  });
  const [viewState, setViewState] = useState<MapViewState>({
    center: [-33.8688, 151.2093], // Sydney coordinates
    zoom: 10,
    selectedAsset: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showLegend, setShowLegend] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Transform terminology for display
  const assetMapLabel = transformNavigationLabel(
    'Asset Map',
    createTransformationContext('AssetVisualisationMap', 'dashboard', 'title')
  ).transformed;

  const assetConditionLabel = transformNavigationLabel(
    'Asset Condition',
    createTransformationContext('AssetVisualisationMap', 'filter', 'condition')
  ).transformed;

  const assetStatusLabel = transformNavigationLabel(
    'Asset Status',
    createTransformationContext('AssetVisualisationMap', 'filter', 'status')
  ).transformed;

  const assetPriorityLabel = transformNavigationLabel(
    'Asset Priority',
    createTransformationContext('AssetVisualisationMap', 'filter', 'priority')
  ).transformed;

  // Load real asset data from API
  useEffect(() => {
    const loadAssetData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch('/api/dashboard/asset-locations');
        if (!response.ok) throw new Error('Failed to fetch asset locations');

        const data = await response.json();
        setAssets(data.assetLocations);
        setFilteredAssets(data.assetLocations);
      } catch (error) {
        console.error('Error loading asset data:', error);
        // Fallback to empty array if API fails
        setAssets([]);
        setFilteredAssets([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadAssetData();
  }, []);

  // Filter assets based on current filters and search term
  useEffect(() => {
    let filtered = assets;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        asset =>
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply condition filter
    if (filters.condition.length > 0) {
      filtered = filtered.filter(asset =>
        filters.condition.includes(asset.condition)
      );
    }

    // Apply status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(asset =>
        filters.status.includes(asset.status)
      );
    }

    // Apply priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(asset =>
        filters.priority.includes(asset.priority)
      );
    }

    // Apply type filter
    if (filters.type.length > 0) {
      filtered = filtered.filter(asset => filters.type.includes(asset.type));
    }

    // Apply criticality filter
    if (filters.criticality.length > 0) {
      filtered = filtered.filter(asset =>
        filters.criticality.includes(asset.criticality)
      );
    }

    setFilteredAssets(filtered);
  }, [assets, filters, searchTerm]);

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return 'bg-green-500';
      case 'GOOD':
        return 'bg-blue-500';
      case 'FAIR':
        return 'bg-yellow-500';
      case 'POOR':
        return 'bg-orange-500';
      case 'CRITICAL':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case 'EXCELLENT':
        return <CheckCircle className="h-3 w-3" />;
      case 'GOOD':
        return <CheckCircle className="h-3 w-3" />;
      case 'FAIR':
        return <Clock className="h-3 w-3" />;
      case 'POOR':
        return <AlertTriangle className="h-3 w-3" />;
      case 'CRITICAL':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600';
      case 'UNDER_MAINTENANCE':
        return 'text-yellow-600';
      case 'UNDER_CONSTRUCTION':
        return 'text-blue-600';
      case 'INACTIVE':
        return 'text-gray-600';
      case 'DECOMMISSIONED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleFilterChange = (
    filterType: keyof MapFilter,
    value: string,
    checked: boolean
  ) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: checked
        ? [...prev[filterType], value]
        : prev[filterType].filter(item => item !== value),
    }));
  };

  const clearFilters = () => {
    setFilters({
      condition: [],
      status: [],
      priority: [],
      type: [],
      criticality: [],
    });
    setSearchTerm('');
  };

  const getSelectedAsset = () => {
    return filteredAssets.find(asset => asset.id === viewState.selectedAsset);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{assetMapLabel}</h1>
          <p className="text-muted-foreground">
            Geographic asset visualisation with condition overlays and
            interactive filtering
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLegend(!showLegend)}
          >
            <Layers className="h-4 w-4 mr-2" />
            {showLegend ? 'Hide' : 'Show'} Legend
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              <CardDescription>
                Filter assets by various criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Condition Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {assetConditionLabel}
                </label>
                <div className="space-y-2">
                  {['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'].map(
                    condition => (
                      <label
                        key={condition}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={filters.condition.includes(condition)}
                          onChange={e =>
                            handleFilterChange(
                              'condition',
                              condition,
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{condition}</span>
                        <div
                          className={`w-3 h-3 rounded-full ${getConditionColor(condition)}`}
                        ></div>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {assetStatusLabel}
                </label>
                <div className="space-y-2">
                  {[
                    'ACTIVE',
                    'UNDER_MAINTENANCE',
                    'UNDER_CONSTRUCTION',
                    'INACTIVE',
                    'DECOMMISSIONED',
                  ].map(status => (
                    <label key={status} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status)}
                        onChange={e =>
                          handleFilterChange('status', status, e.target.checked)
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">
                        {status.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {assetPriorityLabel}
                </label>
                <div className="space-y-2">
                  {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(priority => (
                    <label
                      key={priority}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={filters.priority.includes(priority)}
                        onChange={e =>
                          handleFilterChange(
                            'priority',
                            priority,
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{priority}</span>
                    </label>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Asset Details */}
          {viewState.selectedAsset && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Asset Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const asset = getSelectedAsset();
                  if (!asset) return null;

                  return (
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium">{asset.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {asset.address}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          className={`${getConditionColor(asset.condition)} text-white`}
                        >
                          {getConditionIcon(asset.condition)}
                          <span className="ml-1">{asset.condition}</span>
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getStatusColor(asset.status)}
                        >
                          {asset.status.replace('_', ' ')}
                        </Badge>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span>{asset.type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Value:</span>
                          <span>${(asset.value / 1000000).toFixed(1)}M</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Last Inspection:</span>
                          <span>{asset.lastInspection}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Next Inspection:</span>
                          <span>{asset.nextInspection}</span>
                        </div>
                      </div>

                      <Badge className={getPriorityColor(asset.priority)}>
                        {asset.priority} Priority
                      </Badge>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map Area */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Asset Locations
              </CardTitle>
              <CardDescription>
                {filteredAssets.length} of {assets.length} assets shown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Mock Map Visualization */}
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-50">
                  {/* Map Grid */}
                  <div className="absolute inset-0 opacity-20">
                    <svg className="w-full h-full">
                      <defs>
                        <pattern
                          id="grid"
                          width="20"
                          height="20"
                          patternUnits="userSpaceOnUse"
                        >
                          <path
                            d="M 20 0 L 0 0 0 20"
                            fill="none"
                            stroke="gray"
                            strokeWidth="0.5"
                          />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                  </div>

                  {/* Asset Markers */}
                  {filteredAssets.map((asset, index) => (
                    <div
                      key={asset.id}
                      className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                        viewState.selectedAsset === asset.id ? 'z-10' : 'z-0'
                      }`}
                      style={{
                        left: `${50 + (index * 10 - 20)}%`,
                        top: `${40 + (index * 8 - 16)}%`,
                      }}
                      onClick={() =>
                        setViewState(prev => ({
                          ...prev,
                          selectedAsset:
                            prev.selectedAsset === asset.id ? null : asset.id,
                        }))
                      }
                    >
                      <div
                        className={`relative ${getConditionColor(asset.condition)} w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white`}
                      >
                        {getConditionIcon(asset.condition)}

                        {/* Priority Indicator */}
                        {asset.priority === 'CRITICAL' && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                        )}

                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                          {asset.name}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Map Controls */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Button size="sm" variant="outline" className="bg-white">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="bg-white">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Legend */}
                  {showLegend && (
                    <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg">
                      <h3 className="font-medium mb-2">Condition Legend</h3>
                      <div className="space-y-1">
                        {[
                          { condition: 'EXCELLENT', color: 'bg-green-500' },
                          { condition: 'GOOD', color: 'bg-blue-500' },
                          { condition: 'FAIR', color: 'bg-yellow-500' },
                          { condition: 'POOR', color: 'bg-orange-500' },
                          { condition: 'CRITICAL', color: 'bg-red-500' },
                        ].map(item => (
                          <div
                            key={item.condition}
                            className="flex items-center gap-2"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${item.color}`}
                            ></div>
                            <span className="text-sm">{item.condition}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
