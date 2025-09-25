/**
 * Organization Settings API Endpoint
 *
 * Manages organizational settings including weather locations,
 * external API configurations, and regional preferences.
 *
 * @fileoverview Admin API for organizational configuration
 */

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const weatherLocationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isPrimary: z.boolean(),
  enabled: z.boolean(),
});

const organizationSettingsSchema = z.object({
  name: z.string().min(1),
  timezone: z.string(),
  currency: z.string(),
  dateFormat: z.string(),
  timeFormat: z.string(),
  weatherLocations: z.array(weatherLocationSchema),
  externalApis: z.object({
    weather: z.object({
      provider: z.string(),
      apiKey: z.string(),
      enabled: z.boolean(),
      refreshInterval: z.number().min(5).max(60),
    }),
    iot: z.object({
      brokerUrl: z.string(),
      username: z.string(),
      password: z.string(),
      enabled: z.boolean(),
    }),
    energy: z.object({
      serverUrl: z.string(),
      username: z.string(),
      password: z.string(),
      enabled: z.boolean(),
    }),
    emergency: z.object({
      apiKey: z.string(),
      apiUrl: z.string(),
      enabled: z.boolean(),
    }),
  }),
  regionalSettings: z.object({
    country: z.string(),
    language: z.string(),
    units: z.object({
      distance: z.string(),
      temperature: z.string(),
      weight: z.string(),
    }),
  }),
});

/**
 * GET /api/admin/organization/settings
 * Retrieve organization settings
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organisationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const organization = await prisma.organisation.findUnique({
      where: { id: session.user.organisationId },
    });

    if (!organization) {
      return NextResponse.json({ message: 'Organization not found' }, { status: 404 });
    }

    // Default settings structure
    const defaultSettings = {
      id: organization.id,
      name: organization.name,
      timezone: 'Australia/Sydney',
      currency: 'AUD',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      weatherLocations: [
        {
          id: 'default-sydney',
          name: 'Sydney',
          latitude: -33.8688,
          longitude: 151.2093,
          isPrimary: true,
          enabled: true,
        },
      ],
      externalApis: {
        weather: {
          provider: 'openweathermap',
          apiKey: process.env.OPENWEATHERMAP_API_KEY || '',
          enabled: !!process.env.OPENWEATHERMAP_API_KEY,
          refreshInterval: 10,
        },
        iot: {
          brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883',
          username: process.env.MQTT_USERNAME || '',
          password: process.env.MQTT_PASSWORD || '',
          enabled: !!process.env.MQTT_BROKER_URL,
        },
        energy: {
          serverUrl: process.env.OPCUA_SERVER_URL || 'opc.tcp://localhost:4840',
          username: process.env.OPCUA_USERNAME || '',
          password: process.env.OPCUA_PASSWORD || '',
          enabled: !!process.env.OPCUA_SERVER_URL,
        },
        emergency: {
          apiKey: process.env.EMERGENCY_API_KEY || '',
          apiUrl: process.env.EMERGENCY_API_URL || 'https://api.emergency.gov.au',
          enabled: !!process.env.EMERGENCY_API_KEY,
        },
      },
      regionalSettings: {
        country: 'AU',
        language: 'en-AU',
        units: {
          distance: 'metric',
          temperature: 'celsius',
          weight: 'metric',
        },
      },
    };

    // Merge with stored settings if they exist
    let settings = defaultSettings;

    if (organization.resourceSettings) {
      try {
        const storedSettings = typeof organization.resourceSettings === 'string'
          ? JSON.parse(organization.resourceSettings)
          : organization.resourceSettings;

        settings = { ...defaultSettings, ...storedSettings };
      } catch (error) {
        console.warn('Failed to parse stored settings, using defaults:', error);
      }
    }

    return NextResponse.json(settings, { status: 200 });

  } catch (error) {
    console.error('Organization settings GET error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * PUT /api/admin/organization/settings
 * Update organization settings
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organisationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = organizationSettingsSchema.parse(body);

    // Ensure only one primary location
    const primaryLocations = validatedData.weatherLocations.filter(loc => loc.isPrimary);
    if (primaryLocations.length !== 1) {
      return NextResponse.json({
        message: 'Exactly one weather location must be set as primary'
      }, { status: 400 });
    }

    // Update organization with new settings
    const updatedOrganization = await prisma.organisation.update({
      where: { id: session.user.organisationId },
      data: {
        name: validatedData.name,
        resourceSettings: {
          ...validatedData,
          updatedAt: new Date().toISOString(),
          updatedBy: session.user.id,
        },
      },
    });

    // Also update environment variables for external APIs (in production, this would be done differently)
    if (validatedData.externalApis.weather.enabled && validatedData.externalApis.weather.apiKey) {
      process.env.OPENWEATHERMAP_API_KEY = validatedData.externalApis.weather.apiKey;
    }

    if (validatedData.externalApis.iot.enabled && validatedData.externalApis.iot.brokerUrl) {
      process.env.MQTT_BROKER_URL = validatedData.externalApis.iot.brokerUrl;
      process.env.MQTT_USERNAME = validatedData.externalApis.iot.username;
      process.env.MQTT_PASSWORD = validatedData.externalApis.iot.password;
    }

    if (validatedData.externalApis.energy.enabled && validatedData.externalApis.energy.serverUrl) {
      process.env.OPCUA_SERVER_URL = validatedData.externalApis.energy.serverUrl;
      process.env.OPCUA_USERNAME = validatedData.externalApis.energy.username;
      process.env.OPCUA_PASSWORD = validatedData.externalApis.energy.password;
    }

    return NextResponse.json({
      message: 'Organization settings updated successfully',
      organization: {
        id: updatedOrganization.id,
        name: updatedOrganization.name,
        updatedAt: updatedOrganization.updatedAt,
      },
    }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        message: 'Validation error',
        errors: error.errors,
      }, { status: 400 });
    }

    console.error('Organization settings PUT error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/organization/settings
 * Test external API connections
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.organisationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, apiType, config } = body;

    if (action !== 'test_connection') {
      return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

    const testResults: any = {
      apiType,
      timestamp: new Date().toISOString(),
      success: false,
      message: '',
      responseTime: 0,
    };

    const startTime = Date.now();

    try {
      switch (apiType) {
        case 'weather':
          // Test OpenWeatherMap API
          if (!config.apiKey) {
            throw new Error('API key required');
          }

          const weatherResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=-33.8688&lon=151.2093&appid=${config.apiKey}&units=metric`,
            { signal: AbortSignal.timeout(10000) }
          );

          if (!weatherResponse.ok) {
            throw new Error(`HTTP ${weatherResponse.status}: ${weatherResponse.statusText}`);
          }

          const weatherData = await weatherResponse.json();
          testResults.success = true;
          testResults.message = `Connected successfully. Current temperature: ${weatherData.main.temp}°C`;
          break;

        case 'iot':
          // Test MQTT connection (simplified test)
          if (!config.brokerUrl) {
            throw new Error('Broker URL required');
          }

          // For MQTT, we'll just validate the URL format
          try {
            new URL(config.brokerUrl);
            testResults.success = true;
            testResults.message = 'MQTT broker URL format is valid. Connection test would require MQTT client.';
          } catch (error) {
            throw new Error('Invalid broker URL format');
          }
          break;

        case 'energy':
          // Test OPC UA connection (simplified test)
          if (!config.serverUrl) {
            throw new Error('Server URL required');
          }

          // For OPC UA, we'll just validate the URL format
          if (config.serverUrl.startsWith('opc.tcp://')) {
            testResults.success = true;
            testResults.message = 'OPC UA server URL format is valid. Connection test would require OPC UA client.';
          } else {
            throw new Error('Invalid OPC UA server URL format. Must start with opc.tcp://');
          }
          break;

        case 'emergency':
          // Test Emergency API (if available)
          if (!config.apiUrl) {
            throw new Error('API URL required');
          }

          try {
            new URL(config.apiUrl);
            testResults.success = true;
            testResults.message = 'Emergency API URL format is valid.';
          } catch (error) {
            throw new Error('Invalid API URL format');
          }
          break;

        default:
          throw new Error('Unknown API type');
      }
    } catch (error) {
      testResults.success = false;
      testResults.message = error instanceof Error ? error.message : 'Unknown error';
    }

    testResults.responseTime = Date.now() - startTime;

    return NextResponse.json(testResults, { status: 200 });

  } catch (error) {
    console.error('Organization settings test error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
