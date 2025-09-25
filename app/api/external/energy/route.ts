/**
 * External Energy API Endpoint
 *
 * Provides real-time energy system data from OPC UA servers.
 * Includes energy monitoring, control, and fallback to simulation data.
 *
 * @fileoverview External Energy API with OPC UA integration
 */

import { authOptions } from '@/lib/auth';
import { EnergySystem, OPCUAEnergyClient } from '@/lib/external-apis/energy-client';
import { getSimulationEngine } from '@/lib/simulation/simulation-engine';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

// Initialize OPC UA Energy client
const opcuaClient = new OPCUAEnergyClient({
  serverUrl: process.env.OPCUA_SERVER_URL || 'opc.tcp://localhost:4840',
  username: process.env.OPCUA_USERNAME,
  password: process.env.OPCUA_PASSWORD,
});

// Default energy systems for monitoring
const defaultEnergySystems: EnergySystem[] = [
  {
    id: 'solar-array-east',
    name: 'Solar Array - East Facility',
    type: 'SOLAR',
    location: 'East Facility',
    capacity: 5000,
    currentOutput: 0,
    efficiency: 95,
    status: 'OPERATIONAL',
    metadata: {
      manufacturer: 'SolarTech',
      model: 'ST-5000',
      installationDate: new Date('2023-01-15'),
      lastMaintenance: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
    },
  },
  {
    id: 'wind-turbine-north',
    name: 'Wind Turbine - North Wind Farm',
    type: 'WIND',
    location: 'North Wind Farm',
    capacity: 3000,
    currentOutput: 0,
    efficiency: 90,
    status: 'OPERATIONAL',
    metadata: {
      manufacturer: 'WindPower',
      model: 'WP-3000',
      installationDate: new Date('2023-03-20'),
      lastMaintenance: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
      nextMaintenance: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
    },
  },
  {
    id: 'battery-storage-central',
    name: 'Battery Storage - Central Hub',
    type: 'BATTERY',
    location: 'Central Hub',
    capacity: 2000,
    currentOutput: 0,
    efficiency: 98,
    status: 'OPERATIONAL',
    metadata: {
      manufacturer: 'BatteryCorp',
      model: 'BC-2000',
      installationDate: new Date('2023-02-10'),
      lastMaintenance: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      nextMaintenance: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // 150 days from now
    },
  },
  {
    id: 'diesel-generator-backup',
    name: 'Diesel Generator - Backup',
    type: 'DIESEL',
    location: 'South Backup Site',
    capacity: 1000,
    currentOutput: 0,
    efficiency: 80,
    status: 'OFFLINE',
    metadata: {
      manufacturer: 'DieselGen',
      model: 'DG-1000',
      installationDate: new Date('2022-11-05'),
      lastMaintenance: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
      nextMaintenance: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 120 days from now
    },
  },
];

// Initialize energy systems
defaultEnergySystems.forEach(system => opcuaClient.registerEnergySystem(system));

// Connect to OPC UA server
opcuaClient.connect().catch(console.error);

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.organisationId) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const systemId = searchParams.get('systemId');
    const systemType = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '100');
    const useExternal = searchParams.get('external') !== 'false';

    let energyData: any = null;
    let dataSource = 'simulation';

    // Try external OPC UA data first if enabled
    if (useExternal && process.env.OPCUA_SERVER_URL) {
      try {
        const connectionStatus = opcuaClient.getConnectionStatus();

        if (connectionStatus.connected) {
          if (systemId) {
            // Get specific energy system data
            const system = opcuaClient.getEnergySystem(systemId);
            const latestReading = opcuaClient.getLatestReading(systemId);
            const readings = opcuaClient.getReadings(systemId, limit);

            if (system && latestReading) {
              energyData = {
                system,
                latestReading,
                readings,
                connectionStatus,
              };
              dataSource = 'opcua';
            }
          } else {
            // Get all energy systems data
            const systems = opcuaClient.getAllEnergySystems();
            const systemDataArray = systems.map(system => {
              const latestReading = opcuaClient.getLatestReading(system.id);
              const readings = opcuaClient.getReadings(system.id, limit);

              return {
                system,
                latestReading,
                readings: readings.slice(-10), // Last 10 readings for overview
              };
            });

            // Filter by type if specified
            const filteredData = systemType
              ? systemDataArray.filter(item => item.system.type === systemType.toUpperCase())
              : systemDataArray;

            energyData = {
              systems: filteredData,
              totalSystems: systems.length,
              operationalSystems: filteredData.filter(item => item.system.status === 'OPERATIONAL').length,
              totalCapacity: filteredData.reduce((sum, item) => sum + item.system.capacity, 0),
              currentOutput: filteredData.reduce((sum, item) => sum + (item.latestReading?.output || 0), 0),
            };
            dataSource = 'opcua';
          }
        }
      } catch (error) {
        console.warn('External OPC UA API failed, falling back to simulation:', error);
        // Fall through to simulation data
      }
    }

    // Fallback to simulation data if external API failed or disabled
    if (!energyData) {
      const simulationEngine = getSimulationEngine();
      const simData = await simulationEngine.getData('energy');

      if (systemId) {
        // Find specific system in simulation data
        const system = simData.data?.energySystems?.find((s: any) => s.id === systemId);
        if (system) {
          energyData = {
            system: {
              id: system.id,
              name: system.name,
              type: system.systemType,
              location: system.location,
              capacity: system.capacity,
              currentOutput: system.currentOutput,
              efficiency: system.efficiency,
              status: system.status,
            },
            latestReading: {
              systemId: system.id,
              output: system.currentOutput,
              efficiency: system.efficiency,
              timestamp: new Date(),
              quality: system.status === 'OPERATIONAL' ? 'GOOD' : 'BAD',
            },
            readings: [{
              systemId: system.id,
              output: system.currentOutput,
              efficiency: system.efficiency,
              timestamp: new Date(),
              quality: system.status === 'OPERATIONAL' ? 'GOOD' : 'BAD',
            }],
            connectionStatus: { connected: true, reconnectAttempts: 0 },
          };
        }
      } else {
        energyData = simData;
      }
      dataSource = 'simulation';
    }

    return NextResponse.json({
      data: energyData,
      dataSource,
      timestamp: new Date().toISOString(),
      availableTypes: ['SOLAR', 'WIND', 'BATTERY', 'DIESEL', 'GRID'],
    }, { status: 200 });

  } catch (error) {
    console.error('Energy API error:', error);
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
    const { action, systemId, output, system } = body;

    switch (action) {
      case 'register_system':
        if (!system) {
          return NextResponse.json({ message: 'System data required' }, { status: 400 });
        }

        try {
          opcuaClient.registerEnergySystem(system as EnergySystem);
          return NextResponse.json({ message: 'Energy system registered successfully' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'System registration failed' }, { status: 500 });
        }

      case 'unregister_system':
        if (!systemId) {
          return NextResponse.json({ message: 'System ID required' }, { status: 400 });
        }

        try {
          opcuaClient.unregisterEnergySystem(systemId);
          return NextResponse.json({ message: 'Energy system unregistered successfully' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'System unregistration failed' }, { status: 500 });
        }

      case 'set_output':
        if (!systemId || output === undefined) {
          return NextResponse.json({ message: 'System ID and output value required' }, { status: 400 });
        }

        try {
          await opcuaClient.setSystemOutput(systemId, output);
          return NextResponse.json({ message: 'System output updated successfully' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Output update failed' }, { status: 500 });
        }

      case 'trigger_maintenance':
        if (!systemId) {
          return NextResponse.json({ message: 'System ID required' }, { status: 400 });
        }

        try {
          await opcuaClient.triggerMaintenance(systemId);
          return NextResponse.json({ message: 'Maintenance triggered successfully' }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Maintenance trigger failed' }, { status: 500 });
        }

      case 'get_system_status':
        if (!systemId) {
          return NextResponse.json({ message: 'System ID required' }, { status: 400 });
        }

        try {
          const status = await opcuaClient.getSystemStatus(systemId);
          return NextResponse.json({ status }, { status: 200 });
        } catch (error) {
          return NextResponse.json({ message: 'Status retrieval failed' }, { status: 500 });
        }

      case 'get_connection_status':
        const connectionStatus = opcuaClient.getConnectionStatus();
        return NextResponse.json({ connectionStatus }, { status: 200 });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Energy API POST error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
