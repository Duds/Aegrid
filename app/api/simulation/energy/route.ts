/**
 * Energy Simulation API Endpoint
 *
 * Provides energy system data using industry-standard protocols.
 * Supports OPC UA, Modbus, and custom JSON formats.
 *
 * @fileoverview Energy simulation API with OPC UA compatibility
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
    const systemId = searchParams.get('systemId');

    const simulationEngine = getSimulationEngine();
    const energySource = simulationEngine['dataSources'].get('energy');

    if (!energySource) {
      return NextResponse.json({ message: 'Energy simulation not available' }, { status: 503 });
    }

    const data = await simulationEngine.getData('energy');

    // Filter by system ID if specified
    const filteredData = systemId ?
      data.filter(point => point.metadata?.systemId === systemId) :
      data;

    switch (format) {
      case 'opcua':
        return NextResponse.json({
          dataType: 'OPC UA Energy Data',
          timestamp: new Date().toISOString(),
          data: filteredData.map(point => ({
            nodeId: `ns=2;s=Energy.${point.metadata?.systemId}`,
            browseName: point.metadata?.systemId,
            displayName: `${point.metadata?.systemType} System`,
            dataType: 'Double',
            value: point.value,
            unit: point.unit,
            timestamp: point.timestamp,
            metadata: {
              systemType: point.metadata?.systemType,
              capacity: point.metadata?.capacity,
              efficiency: point.metadata?.efficiency,
              status: point.metadata?.status,
              location: point.metadata?.location,
              batteryLevel: point.metadata?.batteryLevel,
              gridConnection: point.metadata?.gridConnection,
            },
          })),
        });

      case 'modbus':
        return NextResponse.json({
          dataType: 'Modbus RTU Energy Data',
          timestamp: new Date().toISOString(),
          data: filteredData.map((point, index) => ({
            slaveId: 1,
            functionCode: 3, // Read Holding Registers
            address: 40000 + index * 10,
            registers: [
              Math.floor(point.value * 100), // Current output (scaled by 100)
              Math.floor(point.metadata?.capacity * 100), // Capacity (scaled by 100)
              Math.floor(point.metadata?.efficiency * 100), // Efficiency (scaled by 100)
              point.metadata?.batteryLevel ? Math.floor(point.metadata.batteryLevel * 100) : 0, // Battery level
            ],
            timestamp: point.timestamp,
            metadata: {
              systemId: point.metadata?.systemId,
              systemType: point.metadata?.systemType,
              status: point.metadata?.status,
              location: point.metadata?.location,
            },
          })),
        });

      case 'json':
      default:
        return NextResponse.json({
          dataType: 'JSON Energy Data',
          timestamp: new Date().toISOString(),
          data: filteredData,
        });
    }

  } catch (error) {
    console.error('Energy simulation API error:', error);
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
    const { action, systemId, value } = body;

    const simulationEngine = getSimulationEngine();
    const energySource = simulationEngine['dataSources'].get('energy');

    if (!energySource) {
      return NextResponse.json({ message: 'Energy simulation not available' }, { status: 503 });
    }

    switch (action) {
      case 'set_output':
        if (!systemId || value === undefined) {
          return NextResponse.json({ message: 'systemId and value are required' }, { status: 400 });
        }

        // Simulate setting energy system output
        const energySystems = energySource.getEnergySystems();
        const system = energySystems.get(systemId);

        if (!system) {
          return NextResponse.json({ message: 'Energy system not found' }, { status: 404 });
        }

        // Update system output (simulated)
        system.currentOutput = Math.max(0, Math.min(system.capacity, value));

        return NextResponse.json({
          message: 'Energy system output updated',
          systemId,
          newOutput: system.currentOutput,
          capacity: system.capacity,
        });

      case 'trigger_maintenance':
        if (!systemId) {
          return NextResponse.json({ message: 'systemId is required' }, { status: 400 });
        }

        const energySystems2 = energySource.getEnergySystems();
        const system2 = energySystems2.get(systemId);

        if (!system2) {
          return NextResponse.json({ message: 'Energy system not found' }, { status: 404 });
        }

        system2.status = 'MAINTENANCE';
        system2.nextMaintenance = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days from now

        return NextResponse.json({
          message: 'Maintenance triggered for energy system',
          systemId,
          status: system2.status,
          nextMaintenance: system2.nextMaintenance,
        });

      case 'generate_alert':
        const alert = await simulationEngine.generateAlert('energy');
        return NextResponse.json({ alert });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Energy simulation API error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
