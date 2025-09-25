'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Globe, Layers, Map, Satellite } from 'lucide-react';
import { useState } from 'react';

export interface BasemapConfig {
  id: string;
  name: string;
  url: string;
  attribution: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  category: 'streets' | 'satellite' | 'topographic' | 'open-source';
}

export const BASEMAP_OPTIONS: BasemapConfig[] = [
  {
    id: 'arcgis-streets',
    name: 'ArcGIS Streets',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
    icon: Map,
    description: 'Professional street map with clear road networks',
    category: 'streets',
  },
  {
    id: 'arcgis-satellite',
    name: 'ArcGIS Satellite',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community',
    icon: Satellite,
    description: 'High-resolution satellite imagery',
    category: 'satellite',
  },
  {
    id: 'arcgis-topographic',
    name: 'ArcGIS Topographic',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution:
      '&copy; <a href="https://www.esri.com/">Esri</a>, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
    icon: Layers,
    description: 'Topographic map with terrain and elevation',
    category: 'topographic',
  },
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    icon: Globe,
    description: 'Community-driven open source map',
    category: 'open-source',
  },
];

interface BasemapSelectorProps {
  selectedBasemap: string;
  onBasemapChange: (basemapId: string) => void;
  className?: string;
}

/**
 * Basemap Selector Component
 * Allows users to switch between different map basemaps
 * Includes ArcGIS professional maps and OpenStreetMap
 */
export function BasemapSelector({
  selectedBasemap,
  onBasemapChange,
  className = '',
}: BasemapSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedBasemapConfig =
    BASEMAP_OPTIONS.find(b => b.id === selectedBasemap) || BASEMAP_OPTIONS[0];
  const SelectedIcon = selectedBasemapConfig.icon;

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2"
        aria-label="Select basemap"
      >
        <SelectedIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{selectedBasemapConfig.name}</span>
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Map Style</CardTitle>
            <CardDescription className="text-xs">
              Choose your preferred map appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {BASEMAP_OPTIONS.map(basemap => {
              const IconComponent = basemap.icon;
              const isSelected = basemap.id === selectedBasemap;

              return (
                <button
                  key={basemap.id}
                  onClick={() => {
                    onBasemapChange(basemap.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  aria-label={`Select ${basemap.name} basemap`}
                >
                  <IconComponent
                    className={`h-5 w-5 mt-0.5 ${
                      isSelected ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  />
                  <div className="flex-1 text-left">
                    <div
                      className={`font-medium text-sm ${
                        isSelected ? 'text-blue-900' : 'text-gray-900'
                      }`}
                    >
                      {basemap.name}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        isSelected ? 'text-blue-700' : 'text-gray-600'
                      }`}
                    >
                      {basemap.description}
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2" />
                  )}
                </button>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/**
 * Hook for managing basemap selection with localStorage persistence
 */
export function useBasemapSelection() {
  const [selectedBasemap, setSelectedBasemap] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('aegrid-selected-basemap') || 'arcgis-streets'
      );
    }
    return 'arcgis-streets';
  });

  const handleBasemapChange = (basemapId: string) => {
    setSelectedBasemap(basemapId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aegrid-selected-basemap', basemapId);
    }
  };

  return {
    selectedBasemap,
    setBasemap: handleBasemapChange,
  };
}
