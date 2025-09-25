'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Filter, Settings } from 'lucide-react';
import { useState } from 'react';
import { BasemapSelector, useBasemapSelection } from './basemap-selector';
import { IsolatedMap } from './isolated-map';

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

interface SimpleAssetMapProps {
  assets?: Asset[];
  onAssetSelect?: (asset: Asset) => void;
  selectedAsset?: Asset | null;
  height?: string;
  showBasemapSelector?: boolean;
}

// Helper functions moved to IsolatedMap component

/**
 * Simple Asset Map Component - Fixed Version
 * Displays assets on an interactive map with professional basemaps
 * Uses a simpler approach to avoid Leaflet container conflicts
 */
export function SimpleAssetMap({
  assets = [],
  onAssetSelect,
  selectedAsset: _selectedAsset,
  height = '500px',
  showBasemapSelector = true,
}: SimpleAssetMapProps) {
  const [filters, setFilters] = useState({
    assetType: '',
    status: '',
    condition: '',
    priority: '',
    hasLocation: true,
  });
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

  // Default map center (Sydney, Australia) - handled by IsolatedMap

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
          <IsolatedMap
            assets={filteredAssets}
            selectedBasemap={selectedBasemap}
            onAssetSelect={onAssetSelect}
            height={height}
          />
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
