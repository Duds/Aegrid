/**
 * External IoT API Endpoint
 *
 * Provides real-time IoT sensor data from MQTT brokers.
 * Includes sensor management, data collection, and fallback to simulation data.
 *
 * @fileoverview External IoT API with MQTT integration
 */

import { authOptions } from '@/lib/auth';
import { IoTSensor, MQTTIoTClient } from '@/lib/external-apis/iot-client';
import { getSimulationEngine } from '@/lib/simulation/simulation-engine';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize MQTT IoT client
const mqttClient = new MQTTIoTClient({
  brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  clientId: `aegrid-iot-${Date.now()}`,
});

// Default sensors for monitoring
const defaultSensors: IoTSensor[] = [
  {
    id: 'temp-sensor-001',
    name: 'Temperature Sensor - Building A',
    type: 'TEMPERATURE',
    location: 'Building A - Floor 1',
    assetId: 'asset-building-a',
    metadata: {
      unit: '°C',
      minValue: -10,
      maxValue: 50,
      calibrationDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      nextCalibration: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  },
  {
    id: 'humidity-sensor-002',
    name: 'Humidity Sensor - Building A',
    type: 'HUMIDITY',
    location: 'Building A - Floor 1',
    assetId: 'asset-building-a',
    metadata: {
      unit: '%',
      minValue: 0,
      maxValue: 100,
      calibrationDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      nextCalibration: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
    },
  },
  {
    id: 'pressure-sensor-003',
    name: 'Pressure Sensor - Building A',
    type: 'PRESSURE',
    location: 'Building A - Floor 2',
    assetId: 'asset-building-a',
    metadata: {
      unit: 'hPa',
      minValue: 950,
      maxValue: 1050,
      calibrationDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      nextCalibration: new Date(Date.now() + 53 * 24 * 60 * 60 * 1000), // 53 days from now
    },
  },
];

// Initialize sensors
defaultSensors.forEach(sensor => mqttClient.registerSensor(sensor));

// Connect to MQTT broker
mqttClient.connect().catch(console.error);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organisationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sensorId = searchParams.get('sensorId');
    const sensorType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const useExternal = searchParams.get('external') !== 'false';

    let sensorData: any = null;
    let dataSource = 'simulation';

    // Try external MQTT data first if enabled
    if (useExternal && process.env.MQTT_BROKER_URL) {
      try {
        const connectionStatus = mqttClient.getConnectionStatus();

        if (connectionStatus.connected) {
          if (sensorId) {
            // Get specific sensor data
            const sensor = mqttClient.getSensor(sensorId);
            const latestReading = mqttClient.getLatestReading(sensorId);
            const readings = mqttClient.getReadings(sensorId, limit);

            if (sensor && latestReading) {
              sensorData = {
                sensor,
                latestReading,
                readings,
                connectionStatus,
              };
              dataSource = 'mqtt';
            }
          } else {
            // Get all sensors data
            const sensors = mqttClient.getAllSensors();
            const sensorDataArray = sensors.map(sensor => {
              const latestReading = mqttClient.getLatestReading(sensor.id);
              const readings = mqttClient.getReadings(sensor.id, limit);

              return {
                sensor,
                latestReading,
                readings: readings.slice(-10), // Last 10 readings for overview
              };
            });

            // Filter by type if specified
            const filteredData = sensorType
              ? sensorDataArray.filter(item => item.sensor.type === sensorType.toUpperCase())
              : sensorDataArray;

            sensorData = {
              sensors: filteredData,
              totalSensors: sensors.length,
              connectedSensors: filteredData.filter(item => item.latestReading).length,
            };
            dataSource = 'mqtt';
          }
        }
      } catch (error) {
        console.warn('External MQTT API failed, falling back to simulation:', error);
        // Fall through to simulation data
      }
    }

    // Fallback to simulation data if external API failed or disabled
    if (!sensorData) {
      const simulationEngine = getSimulationEngine();
      const simData = await simulationEngine.getData('iot');

      if (sensorId) {
        // Find specific sensor in simulation data
        const sensor = simData.data?.sensors?.find((s: any) => s.id === sensorId);
        if (sensor) {
          sensorData = {
            sensor: {
              id: sensor.id,
              name: sensor.name,
              type: sensor.sensorType,
              location: sensor.location,
            },
            latestReading: {
              sensorId: sensor.id,
              value: sensor.value,
              unit: sensor.unit,
              timestamp: sensor.timestamp,
              quality: sensor.status === 'ONLINE' ? 'GOOD' : 'BAD',
            },
            readings: [{
              sensorId: sensor.id,
              value: sensor.value,
              unit: sensor.unit,
              timestamp: sensor.timestamp,
              quality: sensor.status === 'ONLINE' ? 'GOOD' : 'BAD',
            }],
            connectionStatus: { connected: true, reconnectAttempts: 0 },
          };
        }
      } else {
        sensorData = simData;
      }
      dataSource = 'simulation';
    }

    return NextResponse.json({
      data: sensorData,
      dataSource,
      timestamp: new Date().toISOString(),
      availableTypes: ['TEMPERATURE', 'HUMIDITY', 'PRESSURE', 'VIBRATION', 'AIR_QUALITY', 'MOTION', 'LIGHT'],
    }, { status: 200 });

  } catch (error) {
    console.error('IoT API error:', error);
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
    const { action, sensorId, command, payload, sensor } = body;

    switch (action) {
      case 'register_sensor':
        if (!sensor) {
          return NextResponse.json({ message: 'Sensor data required' }, { status: 400 });
        }

        try {
          mqttClient.registerSensor(sensor as IoTSensor);
          return NextResponse.json({ message: 'Sensor registered successfully' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Sensor registration failed' }, { status: 500 });
        }

      case 'unregister_sensor':
        if (!sensorId) {
          return NextResponse.json({ message: 'Sensor ID required' }, { status: 400 });
        }

        try {
          mqttClient.unregisterSensor(sensorId);
          return NextResponse.json({ message: 'Sensor unregistered successfully' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Sensor unregistration failed' }, { status: 500 });
        }

      case 'send_command':
        if (!sensorId || !command) {
          return NextResponse.json({ message: 'Sensor ID and command required' }, { status: 400 });
        }

        try {
          await mqttClient.publishSensorCommand(sensorId, command, payload);
          return NextResponse.json({ message: 'Command sent successfully' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Command sending failed' }, { status: 500 });
        }

      case 'subscribe_sensor':
        if (!sensorId) {
          return NextResponse.json({ message: 'Sensor ID required' }, { status: 400 });
        }

        try {
          await mqttClient.subscribeToSensorData(sensorId);
          return NextResponse.json({ message: 'Subscribed to sensor data' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Subscription failed' }, { status: 500 });
        }

      case 'unsubscribe_sensor':
        if (!sensorId) {
          return NextResponse.json({ message: 'Sensor ID required' }, { status: 400 });
        }

        try {
          await mqttClient.unsubscribeFromSensorData(sensorId);
          return NextResponse.json({ message: 'Unsubscribed from sensor data' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Unsubscription failed' }, { status: 500 });
        }

      case 'get_connection_status':
        const connectionStatus = mqttClient.getConnectionStatus();
        return NextResponse.json({ connectionStatus }, { status: 200 });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('IoT API POST error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
