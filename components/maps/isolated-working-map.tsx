'use client';

import { useEffect, useState } from 'react';
import { BASEMAP_OPTIONS } from './basemap-selector';
import dynamic from 'next/dynamic';

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
}

interface IsolatedWorkingMapProps {
  assets: Asset[];
  selectedBasemap: string;
  onAssetSelect?: (asset: Asset) => void;
  height?: string;
}

/**
 * Isolated Working Map Component
 * Completely isolates map rendering to prevent container conflicts
 */
export function IsolatedWorkingMap({
  assets,
  selectedBasemap,
  onAssetSelect,
  height = '500px',
}: IsolatedWorkingMapProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    // Force complete unmount/remount cycle
    setShouldRender(false);

    const timer = setTimeout(() => {
      setShouldRender(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      setShouldRender(false);
    };
  }, [selectedBasemap]);

  if (!shouldRender) {
    return (
      <div
        className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg"
        style={{ height }}
      >
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span>Loading map...</span>
        </div>
      </div>
    );
  }

  const basemapConfig =
    BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];
  const mapCenter: [number, number] = [-33.8688, 151.2093];
  const defaultZoom = 10;

  return (
    <div style={{ height }} key={`isolated-${selectedBasemap}-${Date.now()}`}>
      <MapContainer
        center={mapCenter}
        zoom={defaultZoom}
        className="h-full w-full rounded-lg"
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
                    <h4 className="font-semibold text-sm">{asset.name}</h4>
                    <p className="text-xs text-gray-600">{asset.assetNumber}</p>
                    <p className="text-xs text-gray-600">{asset.assetType}</p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
