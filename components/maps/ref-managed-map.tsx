'use client';

import { useEffect, useRef, useState } from 'react';
import { BASEMAP_OPTIONS } from './basemap-selector';

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

interface RefManagedMapProps {
  assets: Asset[];
  selectedBasemap: string;
  onAssetSelect?: (asset: Asset) => void;
  height?: string;
}

/**
 * Ref-Managed Map Component
 * Uses direct Leaflet API with proper dynamic loading
 */
export function RefManagedMap({
  assets,
  selectedBasemap,
  onAssetSelect,
  height = '500px',
}: RefManagedMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAndInitializeMap = async () => {
      try {
        setIsLoading(true);

        // Clean up existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Clear container
        if (mapContainerRef.current) {
          mapContainerRef.current.innerHTML = '';
        }

        // Dynamically import Leaflet
        const leafletModule = await import('leaflet');
        const L = leafletModule.default;

        // Import Leaflet CSS
        await import('leaflet/dist/leaflet.css');

        // Wait a bit for DOM cleanup
        await new Promise(resolve => setTimeout(resolve, 100));

        if (!isMounted || !mapContainerRef.current) return;

        const basemapConfig =
          BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) ||
          BASEMAP_OPTIONS[0];

        // Create new map instance
        const map = L.map(mapContainerRef.current, {
          center: [-33.8688, 151.2093],
          zoom: 10,
        });

        // Add tile layer
        L.tileLayer(basemapConfig.url, {
          attribution: basemapConfig.attribution,
          maxZoom: 18,
          minZoom: 1,
        }).addTo(map);

        // Add markers
        const markerGroup = L.layerGroup();

        assets.forEach(asset => {
          if (!asset.latitude || !asset.longitude) return;

          const marker = L.marker([asset.latitude, asset.longitude]);

          const popupContent = `
            <div style="padding: 8px; min-width: 200px;">
              <h4 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${asset.name}</h4>
              <p style="font-size: 12px; color: #666; margin-bottom: 2px;">${asset.assetNumber}</p>
              <p style="font-size: 12px; color: #666;">${asset.assetType}</p>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on('click', () => onAssetSelect?.(asset));
          markerGroup.addLayer(marker);
        });

        markerGroup.addTo(map);

        if (isMounted) {
          mapInstanceRef.current = map;
          setIsMapReady(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Failed to load or initialize map:', error);
        if (isMounted) {
          setIsMapReady(false);
          setIsLoading(false);
        }
      }
    };

    loadAndInitializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      setIsMapReady(false);
      setIsLoading(true);
    };
  }, [selectedBasemap, assets, onAssetSelect]);

  if (isLoading || !isMapReady) {
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

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full rounded-lg"
      style={{ height }}
    />
  );
}
