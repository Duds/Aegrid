/**
 * External Weather API Endpoint
 *
 * Provides real-time weather data from OpenWeatherMap API.
 * Includes caching, error handling, and fallback to simulation data.
 *
 * @fileoverview External weather API with OpenWeatherMap integration
 */

import { OpenWeatherMapClient, WeatherLocation } from '@/lib/external-apis/weather-client';
import { weatherRateLimiter } from '@/lib/external-apis/weather-rate-limiter';
import { EmergencySimulationDataSource } from '@/lib/simulation/emergency-simulation';
import { EnergySimulationDataSource } from '@/lib/simulation/energy-simulation';
import { IoTSimulationDataSource } from '@/lib/simulation/iot-simulation';
import { getSimulationEngine } from '@/lib/simulation/simulation-engine';
import { WeatherSimulationDataSource } from '@/lib/simulation/weather-simulation';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OpenWeatherMap client
const weatherClient = new OpenWeatherMapClient(
  process.env.OPENWEATHERMAP_API_KEY || ''
);

// Initialize simulation engine with data sources
const simulationEngine = getSimulationEngine();
simulationEngine.registerDataSource('energy', new EnergySimulationDataSource(simulationEngine.getConfig()));
simulationEngine.registerDataSource('weather', new WeatherSimulationDataSource(simulationEngine.getConfig()));
simulationEngine.registerDataSource('iot', new IoTSimulationDataSource(simulationEngine.getConfig()));
simulationEngine.registerDataSource('emergency', new EmergencySimulationDataSource(simulationEngine.getConfig()));

// Get organization weather locations from database
async function getOrganizationWeatherLocations(organisationId?: string): Promise<WeatherLocation[]> {
  if (!organisationId) {
    // Default locations when no organization context
    return [
      { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'AU', state: 'NSW' },
      { name: 'Melbourne', latitude: -37.8136, longitude: 144.9631, country: 'AU', state: 'VIC' },
      { name: 'Brisbane', latitude: -27.4698, longitude: 153.0251, country: 'AU', state: 'QLD' },
    ];
  }

  try {
    const { prisma } = await import('@/lib/prisma');
    const organization = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { resourceSettings: true },
    });

    if (organization?.resourceSettings) {
      const settings = typeof organization.resourceSettings === 'string'
        ? JSON.parse(organization.resourceSettings)
        : organization.resourceSettings;

      if (settings.weatherLocations && Array.isArray(settings.weatherLocations)) {
        return settings.weatherLocations
          .filter((loc: any) => loc.enabled)
          .map((loc: any) => ({
            name: loc.name,
            latitude: loc.latitude,
            longitude: loc.longitude,
            country: 'AU', // Default country
            state: undefined,
          }));
      }
    }
  } catch (error) {
    console.warn('Failed to fetch organization weather locations:', error);
  }

  // Fallback to default locations
  return [
    { name: 'Sydney', latitude: -33.8688, longitude: 151.2093, country: 'AU', state: 'NSW' },
    { name: 'Melbourne', latitude: -37.8136, longitude: 144.9631, country: 'AU', state: 'VIC' },
    { name: 'Brisbane', latitude: -27.4698, longitude: 153.0251, country: 'AU', state: 'QLD' },
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get('location');
    const forecast = searchParams.get('forecast') === 'true';
    const useExternal = searchParams.get('external') !== 'false';
    const organisationId = searchParams.get('organisationId'); // Allow passing organization ID

    // Get organization-specific weather locations
    const organizationLocations = await getOrganizationWeatherLocations(organisationId || undefined);

    let weatherData: any = null;
    let dataSource = 'simulation';

    // Try external API first if enabled
    if (useExternal && process.env.OPENWEATHERMAP_API_KEY) {
      try {
        if (forecast) {
          // Get weather forecast
          const targetLocation = location
            ? organizationLocations.find(loc => loc.name.toLowerCase() === location.toLowerCase()) || organizationLocations[0]
            : organizationLocations[0];

          weatherData = await weatherClient.getWeatherForecast(targetLocation, 5);
          dataSource = 'openweathermap';
        } else {
          // Get current weather for all locations or specific location
          if (location) {
            const targetLocation = organizationLocations.find(loc => loc.name.toLowerCase() === location.toLowerCase());
            if (targetLocation) {
              weatherData = await weatherClient.getCurrentWeather(targetLocation);
            }
          } else {
            // Get weather for all organization locations
            const weatherPromises = organizationLocations.map(loc => weatherClient.getCurrentWeather(loc));
            weatherData = await Promise.all(weatherPromises);
          }
          dataSource = 'openweathermap';
        }
      } catch (error) {
        console.warn('External weather API failed, falling back to simulation:', error);
        // Fall through to simulation data
      }
    }

    // Fallback to simulation data if external API failed or disabled
    if (!weatherData) {
      const simulationEngine = getSimulationEngine();
      const simData = await simulationEngine.getData('weather');

      if (forecast) {
        // Generate forecast from simulation data
        weatherData = {
          location: location || 'Sydney',
          forecasts: Array.from({ length: 5 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() + i);
            return {
              date: date.toISOString().split('T')[0],
              temperature: { min: 15, max: 25, avg: 20 },
              humidity: 65,
              precipitation: Math.random() * 2,
              weatherCondition: 'Clear',
            };
          }),
        };
      } else {
        weatherData = simData;
      }
      dataSource = 'simulation';
    }

    // Get rate limit status for all locations
    const rateLimitStatus = organizationLocations.map(loc => ({
      location: loc.name,
      ...weatherRateLimiter.getRateLimitStatus(`${loc.latitude},${loc.longitude}`)
    }));

    return NextResponse.json({
      data: weatherData,
      dataSource,
      timestamp: new Date().toISOString(),
      locations: organizationLocations.map(loc => loc.name),
      organizationLocations: organizationLocations.length,
      rateLimitStatus,
      rateLimitInfo: {
        maxCallsPerInterval: 1,
        intervalMinutes: 15,
        description: 'Weather API calls are limited to once every 15 minutes per location'
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, location, days } = body;

    switch (action) {
      case 'search_location':
        if (!location) {
          return NextResponse.json({ message: 'Location parameter required' }, { status: 400 });
        }

        try {
          const locations = await weatherClient.searchLocation(location);
          return NextResponse.json({ locations }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Location search failed' }, { status: 500 });
        }

      case 'get_forecast':
        const organizationLocationsPost = await getOrganizationWeatherLocations();
        const targetLocation = location
          ? organizationLocationsPost.find(loc => loc.name.toLowerCase() === location.toLowerCase()) || organizationLocationsPost[0]
          : organizationLocationsPost[0];

        try {
          const forecast = await weatherClient.getWeatherForecast(targetLocation, days || 5);
          return NextResponse.json({ forecast }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Forecast retrieval failed' }, { status: 500 });
        }

      case 'get_uv_index':
        const organizationLocationsUV = await getOrganizationWeatherLocations();
        const uvLocation = location
          ? organizationLocationsUV.find(loc => loc.name.toLowerCase() === location.toLowerCase()) || organizationLocationsUV[0]
          : organizationLocationsUV[0];

        try {
          const uvIndex = await weatherClient.getUVIndex(uvLocation);
          return NextResponse.json({ uvIndex }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'UV index retrieval failed' }, { status: 500 });
        }

      case 'get_rate_limit_status':
        const organizationLocationsRateLimit = await getOrganizationWeatherLocations();
        const rateLimitStatus = organizationLocationsRateLimit.map(loc => ({
          location: loc.name,
          coordinates: `${loc.latitude},${loc.longitude}`,
          ...weatherRateLimiter.getRateLimitStatus(`${loc.latitude},${loc.longitude}`)
        }));

        return NextResponse.json({
          rateLimitStatus,
          rateLimitInfo: {
            maxCallsPerInterval: 1,
            intervalMinutes: 15,
            description: 'Weather API calls are limited to once every 15 minutes per location'
          }
        }, { status: 200 });

      case 'reset_rate_limit':
        if (!location) {
          return NextResponse.json({ message: 'Location parameter required for rate limit reset' }, { status: 400 });
        }

        const organizationLocationsReset = await getOrganizationWeatherLocations();
        const resetLocation = organizationLocationsReset.find(loc => loc.name.toLowerCase() === location.toLowerCase());
        
        if (!resetLocation) {
          return NextResponse.json({ message: 'Location not found' }, { status: 404 });
        }

        weatherRateLimiter.resetLocation(`${resetLocation.latitude},${resetLocation.longitude}`);
        return NextResponse.json({ message: `Rate limit reset for ${location}` }, { status: 200 });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Weather API POST error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
