/**
 * Simulation API Routes
 *
 * Provides RESTful API endpoints for simulation data sources.
 * Uses industry-standard protocols and data formats.
 *
 * @fileoverview Simulation API with OpenAPI/Swagger compatibility
 */

import { authOptions } from '@/lib/auth';
import { EmergencySimulationDataSource } from '@/lib/simulation/emergency-simulation';
import { EnergySimulationDataSource } from '@/lib/simulation/energy-simulation';
import { IoTSimulationDataSource } from '@/lib/simulation/iot-simulation';
import { getSimulationEngine } from '@/lib/simulation/simulation-engine';
import { WeatherSimulationDataSource } from '@/lib/simulation/weather-simulation';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize simulation engine with data sources
const simulationEngine = getSimulationEngine();
simulationEngine.registerDataSource('energy', new EnergySimulationDataSource(simulationEngine.getConfig()));
simulationEngine.registerDataSource('weather', new WeatherSimulationDataSource(simulationEngine.getConfig()));
simulationEngine.registerDataSource('iot', new IoTSimulationDataSource(simulationEngine.getConfig()));
simulationEngine.registerDataSource('emergency', new EmergencySimulationDataSource(simulationEngine.getConfig()));

// Start simulation engine if in development mode
if (process.env.NODE_ENV === 'development') {
  simulationEngine.start().catch(console.error);
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organisationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const source = searchParams.get('source');
    const format = searchParams.get('format') || 'json';

    if (!source) {
      return NextResponse.json({
        message: 'Source parameter is required',
        availableSources: ['energy', 'weather', 'iot', 'emergency'],
        formats: ['json', 'opcua', 'mqtt', 'cap', 'openweathermap']
      }, { status: 400 });
    }

    const data = await simulationEngine.getData(source);

    // Format response based on requested format
    switch (format) {
      case 'opcua':
        return NextResponse.json({
          dataType: 'OPC UA',
          data: data.map(point => ({
            nodeId: `ns=2;s=${point.metadata?.sensorId || 'unknown'}`,
            value: point.value,
            timestamp: point.timestamp,
            metadata: point.metadata,
          })),
        });

      case 'mqtt':
        return NextResponse.json({
          dataType: 'MQTT',
          data: data.map(point => ({
            topic: `sensors/${point.metadata?.sensorId || 'unknown'}/data`,
            payload: {
              value: point.value,
              unit: point.unit,
              timestamp: point.timestamp.toISOString(),
              metadata: point.metadata,
            },
            qos: 1,
            retain: false,
          })),
        });

      case 'cap':
        if (source === 'emergency') {
          const emergencySource = simulationEngine['dataSources'].get('emergency') as EmergencySimulationDataSource;
          const scenarios = emergencySource.getScenarios();
          const capAlerts = Array.from(scenarios.values()).map(scenario =>
            emergencySource.getCAPAlert(scenario.scenarioId)
          ).filter(alert => alert !== null);

          return NextResponse.json({
            dataType: 'CAP (Common Alerting Protocol)',
            data: capAlerts,
          });
        }
        break;

      case 'openweathermap':
        if (source === 'weather') {
          const weatherSource = simulationEngine['dataSources'].get('weather') as WeatherSimulationDataSource;
          const stations = weatherSource.getWeatherStations();
          const weatherData = Array.from(stations.values()).map(station =>
            weatherSource.getOpenWeatherMapData(station.location)
          ).filter(data => data !== null);

          return NextResponse.json({
            dataType: 'OpenWeatherMap API',
            data: weatherData,
          });
        }
        break;

      default:
        return NextResponse.json({
          dataType: 'JSON',
          source,
          timestamp: new Date().toISOString(),
          data,
        });
    }

    return NextResponse.json({
      dataType: 'JSON',
      source,
      timestamp: new Date().toISOString(),
      data,
    });

  } catch (error) {
    console.error('Simulation API error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organisationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, source, config } = body;

    switch (action) {
      case 'start':
        await simulationEngine.start();
        return NextResponse.json({ message: 'Simulation engine started' });

      case 'stop':
        await simulationEngine.stop();
        return NextResponse.json({ message: 'Simulation engine stopped' });

      case 'generate_alert':
        if (!source) {
          return NextResponse.json({ message: 'Source is required for alert generation' }, { status: 400 });
        }
        const alert = await simulationEngine.generateAlert(source);
        return NextResponse.json({ alert });

      case 'update_config':
        if (!config) {
          return NextResponse.json({ message: 'Config is required for update' }, { status: 400 });
        }
        simulationEngine.updateConfig(config);
        return NextResponse.json({ message: 'Configuration updated', config: simulationEngine.getConfig() });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Simulation API error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
