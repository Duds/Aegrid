'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for managing Leaflet map instances
 * Prevents "Map container is already initialized" errors
 */
export function useLeafletMap() {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    setIsMapReady(true);
  };

  const cleanupMap = () => {
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    setIsMapReady(false);
  };

  useEffect(() => {
    // Initialize map after component mounts
    const timer = setTimeout(initializeMap, 100);

    return () => {
      clearTimeout(timer);
      cleanupMap();
    };
  }, []);

  return {
    mapRef,
    containerRef,
    isMapReady,
    cleanupMap,
    initializeMap,
  };
}
