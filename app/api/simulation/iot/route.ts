/**
 * IoT Simulation API Endpoint
 *
 * Provides IoT sensor data using standard protocols.
 * Supports MQTT, CoAP, OPC UA, and custom JSON formats.
 *
 * @fileoverview IoT simulation API with MQTT and OPC UA compatibility
 */

import { authOptions } from '@/lib/auth';
import { getSimulationEngine } from '@/lib/simulation/simulation-engine';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organisationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const sensorId = searchParams.get('sensorId');
    const sensorType = searchParams.get('sensorType');

    const simulationEngine = getSimulationEngine();
    const iotSource = simulationEngine['dataSources'].get('iot');

    if (!iotSource) {
      return NextResponse.json({ message: 'IoT simulation not available' }, { status: 503 });
    }

    const data = await simulationEngine.getData('iot');

    // Filter by sensor ID or type if specified
    let filteredData = data;
    if (sensorId) {
      filteredData = filteredData.filter(point => point.metadata?.sensorId === sensorId);
    }
    if (sensorType) {
      filteredData = filteredData.filter(point => point.metadata?.sensorType === sensorType);
    }

    switch (format) {
      case 'mqtt':
        return NextResponse.json({
          dataType: 'MQTT IoT Data',
          timestamp: new Date().toISOString(),
          data: filteredData.map(point => ({
            topic: `sensors/${point.metadata?.sensorId}/data`,
            payload: {
              sensorId: point.metadata?.sensorId,
              sensorType: point.metadata?.sensorType,
              location: point.metadata?.location,
              assetId: point.metadata?.assetId,
              timestamp: point.timestamp.toISOString(),
              value: point.value,
              unit: point.unit,
              status: point.metadata?.status,
              batteryLevel: point.metadata?.batteryLevel,
              signalStrength: point.metadata?.signalStrength,
              metadata: {
                protocol: point.metadata?.protocol,
                manufacturer: point.metadata?.manufacturer,
                model: point.metadata?.model,
              },
            },
            qos: 1,
            retain: false,
          })),
        });

      case 'opcua':
        return NextResponse.json({
          dataType: 'OPC UA IoT Data',
          timestamp: new Date().toISOString(),
          data: filteredData.map(point => ({
            nodeId: `ns=2;s=${point.metadata?.sensorId}`,
            browseName: point.metadata?.sensorId,
            displayName: `${point.metadata?.sensorType} Sensor`,
            dataType: point.metadata?.sensorType === 'MOTION' ? 'Boolean' : 'Double',
            value: point.value,
            timestamp: point.timestamp,
            status: point.metadata?.status,
            metadata: {
              location: point.metadata?.location,
              assetId: point.metadata?.assetId,
              unit: point.unit,
              batteryLevel: point.metadata?.batteryLevel,
              signalStrength: point.metadata?.signalStrength,
              protocol: point.metadata?.protocol,
              manufacturer: point.metadata?.manufacturer,
              model: point.metadata?.model,
            },
          })),
        });

      case 'coap':
        return NextResponse.json({
          dataType: 'CoAP IoT Data',
          timestamp: new Date().toISOString(),
          data: filteredData.map(point => ({
            uri: `coap://localhost/sensors/${point.metadata?.sensorId}`,
            method: 'GET',
            payload: {
              sensorId: point.metadata?.sensorId,
              sensorType: point.metadata?.sensorType,
              value: point.value,
              unit: point.unit,
              timestamp: point.timestamp.toISOString(),
              status: point.metadata?.status,
            },
            contentType: 'application/json',
            maxAge: 30, // seconds
          })),
        });

      case 'json':
      default:
        return NextResponse.json({
          dataType: 'JSON IoT Data',
          timestamp: new Date().toISOString(),
          data: filteredData,
        });
    }

  } catch (error) {
    console.error('IoT simulation API error:', error);
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
    const { action, sensorId, value, config } = body;

    const simulationEngine = getSimulationEngine();
    const iotSource = simulationEngine['dataSources'].get('iot');

    if (!iotSource) {
      return NextResponse.json({ message: 'IoT simulation not available' }, { status: 503 });
    }

    switch (action) {
      case 'set_value':
        if (!sensorId || value === undefined) {
          return NextResponse.json({ message: 'sensorId and value are required' }, { status: 400 });
        }

        // Simulate setting sensor value
        const sensors = iotSource.getSensors();
        const sensor = sensors.get(sensorId);

        if (!sensor) {
          return NextResponse.json({ message: 'Sensor not found' }, { status: 404 });
        }

        // Update sensor value (simulated)
        sensor.value = value;
        sensor.timestamp = new Date();

        return NextResponse.json({
          message: 'Sensor value updated',
          sensorId,
          newValue: sensor.value,
          unit: sensor.unit,
          timestamp: sensor.timestamp,
        });

      case 'calibrate':
        if (!sensorId) {
          return NextResponse.json({ message: 'sensorId is required' }, { status: 400 });
        }

        const sensors2 = iotSource.getSensors();
        const sensor2 = sensors2.get(sensorId);

        if (!sensor2) {
          return NextResponse.json({ message: 'Sensor not found' }, { status: 404 });
        }

        sensor2.status = 'MAINTENANCE';
        sensor2.calibrationDate = new Date();
        sensor2.nextCalibration = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365); // 1 year from now

        return NextResponse.json({
          message: 'Sensor calibration completed',
          sensorId,
          calibrationDate: sensor2.calibrationDate,
          nextCalibration: sensor2.nextCalibration,
        });

      case 'update_config':
        if (!sensorId || !config) {
          return NextResponse.json({ message: 'sensorId and config are required' }, { status: 400 });
        }

        const sensors3 = iotSource.getSensors();
        const sensor3 = sensors3.get(sensorId);

        if (!sensor3) {
          return NextResponse.json({ message: 'Sensor not found' }, { status: 404 });
        }

        // Update sensor configuration (simulated)
        Object.assign(sensor3.metadata, config);

        return NextResponse.json({
          message: 'Sensor configuration updated',
          sensorId,
          updatedConfig: sensor3.metadata,
        });

      case 'generate_alert':
        const alert = await simulationEngine.generateAlert('iot');
        return NextResponse.json({ alert });

      case 'get_sensor_status':
        if (!sensorId) {
          return NextResponse.json({ message: 'sensorId is required' }, { status: 400 });
        }

        const sensors4 = iotSource.getSensors();
        const sensor4 = sensors4.get(sensorId);

        if (!sensor4) {
          return NextResponse.json({ message: 'Sensor not found' }, { status: 404 });
        }

        return NextResponse.json({
          message: 'Sensor status retrieved',
          sensorId,
          status: {
            sensorId: sensor4.sensorId,
            sensorType: sensor4.sensorType,
            location: sensor4.location,
            assetId: sensor4.assetId,
            status: sensor4.status,
            value: sensor4.value,
            unit: sensor4.unit,
            batteryLevel: sensor4.batteryLevel,
            signalStrength: sensor4.signalStrength,
            calibrationDate: sensor4.calibrationDate,
            nextCalibration: sensor4.nextCalibration,
            metadata: sensor4.metadata,
          },
        });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('IoT simulation API error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
