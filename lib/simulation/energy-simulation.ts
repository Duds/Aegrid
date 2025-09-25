/**
 * Energy Simulation Data Source
 *
 * Simulates energy systems using industry-standard protocols and data formats.
 * Supports solar, wind, battery, and grid systems with realistic behavior patterns.
 *
 * @fileoverview Energy system simulation with OPC UA and Modbus-like data structures
 */

import { SimulationAlert, SimulationConfig, SimulationDataPoint, SimulationDataSource } from './simulation-engine';

export interface EnergySystemData {
  systemId: string;
  systemType: 'SOLAR' | 'WIND' | 'BATTERY' | 'DIESEL' | 'GRID';
  capacity: number; // kW
  currentOutput: number; // kW
  efficiency: number; // percentage
  batteryLevel?: number; // percentage for battery systems
  gridConnection: boolean;
  status: 'OPERATIONAL' | 'MAINTENANCE' | 'OFFLINE' | 'FAULT';
  location: string;
  lastMaintenance: Date;
  nextMaintenance: Date;
}

export interface EnergyAlertData {
  systemId: string;
  alertType: 'EFFICIENCY_DROP' | 'GRID_INSTABILITY' | 'LOW_BATTERY' | 'MAINTENANCE_DUE' | 'SYSTEM_FAULT';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
}

export class EnergySimulationDataSource extends SimulationDataSource {
  private energySystems: Map<string, EnergySystemData> = new Map();
  private lastUpdateTime: Date = new Date();
  private alertHistory: Map<string, Date> = new Map();

  constructor(config: SimulationConfig) {
    super(config);
    this.initializeEnergySystems();
  }

  private initializeEnergySystems(): void {
    // Solar Array - North Facility
    this.energySystems.set('solar-array-01', {
      systemId: 'solar-array-01',
      systemType: 'SOLAR',
      capacity: 2500,
      currentOutput: 1875,
      efficiency: 94.2,
      gridConnection: true,
      status: 'OPERATIONAL',
      location: 'North District',
      lastMaintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75),
    });

    // Wind Turbine Array
    this.energySystems.set('wind-turbine-01', {
      systemId: 'wind-turbine-01',
      systemType: 'WIND',
      capacity: 1800,
      currentOutput: 1260,
      efficiency: 89.7,
      gridConnection: true,
      status: 'OPERATIONAL',
      location: 'West Ridge',
      lastMaintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
      nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 82),
    });

    // Backup Generator System
    this.energySystems.set('backup-generator-01', {
      systemId: 'backup-generator-01',
      systemType: 'DIESEL',
      capacity: 500,
      currentOutput: 0,
      efficiency: 95.0,
      gridConnection: false,
      status: 'OPERATIONAL',
      location: 'Emergency Facility',
      lastMaintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60),
    });

    // Battery Storage System
    this.energySystems.set('battery-storage-01', {
      systemId: 'battery-storage-01',
      systemType: 'BATTERY',
      capacity: 1000,
      currentOutput: 750,
      efficiency: 92.5,
      batteryLevel: 75.0,
      gridConnection: true,
      status: 'OPERATIONAL',
      location: 'Energy Hub',
      lastMaintenance: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      nextMaintenance: new Date(Date.now() + 1000 * 60 * 60 * 24 * 80),
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;

    // Update energy systems every 30 seconds
    this.intervalId = setInterval(() => {
      this.updateEnergySystems();
    }, 30000);

    console.log('Energy simulation data source started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('Energy simulation data source stopped');
  }

  private updateEnergySystems(): void {
    const now = new Date();
    const timeOfDay = now.getHours();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

    for (const [systemId, system] of this.energySystems) {
      let newOutput = system.currentOutput;
      let newEfficiency = system.efficiency;
      let newBatteryLevel = system.batteryLevel;

      switch (system.systemType) {
        case 'SOLAR':
          // Solar output based on time of day and season
          const solarFactor = this.calculateSolarFactor(timeOfDay, dayOfYear);
          newOutput = system.capacity * solarFactor * this.generateRealisticValue(1, 0.05);
          newEfficiency = this.generateRealisticValue(94.2, 0.02);
          break;

        case 'WIND':
          // Wind output based on time of day and season
          const windFactor = this.calculateWindFactor(timeOfDay, dayOfYear);
          newOutput = system.capacity * windFactor * this.generateRealisticValue(1, 0.1);
          newEfficiency = this.generateRealisticValue(89.7, 0.03);
          break;

        case 'BATTERY':
          // Battery behavior based on grid demand
          const batteryFactor = this.calculateBatteryFactor(timeOfDay);
          newOutput = system.capacity * batteryFactor * this.generateRealisticValue(1, 0.05);
          newBatteryLevel = Math.max(0, Math.min(100,
            (system.batteryLevel || 75) + this.generateRealisticValue(0, 2)));
          newEfficiency = this.generateRealisticValue(92.5, 0.02);
          break;

        case 'DIESEL':
          // Diesel generator only runs during emergencies or maintenance
          if (system.status === 'OPERATIONAL') {
            newOutput = 0; // Standby mode
          } else {
            newOutput = this.generateRealisticValue(system.capacity * 0.8, 0.1);
          }
          newEfficiency = this.generateRealisticValue(95.0, 0.01);
          break;
      }

      // Update system data
      system.currentOutput = Math.max(0, Math.min(system.capacity, newOutput));
      system.efficiency = Math.max(0, Math.min(100, newEfficiency));
      if (system.batteryLevel !== undefined) {
        system.batteryLevel = newBatteryLevel;
      }

      // Check for maintenance due
      if (now >= system.nextMaintenance) {
        system.status = 'MAINTENANCE';
      }
    }

    this.lastUpdateTime = now;
  }

  private calculateSolarFactor(timeOfDay: number, dayOfYear: number): number {
    // Solar factor based on sun position
    const sunAngle = Math.sin((timeOfDay - 6) / 12 * Math.PI); // 6 AM to 6 PM
    const seasonalFactor = 0.7 + 0.3 * Math.sin((dayOfYear / 365) * 2 * Math.PI); // Seasonal variation

    if (timeOfDay < 6 || timeOfDay > 18) return 0; // Night time
    return Math.max(0, sunAngle * seasonalFactor);
  }

  private calculateWindFactor(timeOfDay: number, dayOfYear: number): number {
    // Wind factor based on time and season
    const dailyFactor = 0.5 + 0.5 * Math.sin((timeOfDay / 24) * 2 * Math.PI + Math.PI); // Higher at night
    const seasonalFactor = 0.8 + 0.4 * Math.sin((dayOfYear / 365) * 2 * Math.PI + Math.PI/2); // Higher in winter

    return dailyFactor * seasonalFactor;
  }

  private calculateBatteryFactor(timeOfDay: number): number {
    // Battery discharge during peak hours (6-9 AM, 5-8 PM)
    if ((timeOfDay >= 6 && timeOfDay <= 9) || (timeOfDay >= 17 && timeOfDay <= 20)) {
      return 0.8; // High discharge
    } else if (timeOfDay >= 10 && timeOfDay <= 16) {
      return 0.3; // Low discharge (charging from solar)
    } else {
      return 0.1; // Minimal discharge
    }
  }

  async getCurrentData(): Promise<SimulationDataPoint[]> {
    const dataPoints: SimulationDataPoint[] = [];

    for (const system of this.energySystems.values()) {
      dataPoints.push({
        timestamp: this.lastUpdateTime,
        value: system.currentOutput,
        unit: 'kW',
        metadata: {
          systemId: system.systemId,
          systemType: system.systemType,
          capacity: system.capacity,
          efficiency: system.efficiency,
          status: system.status,
          location: system.location,
          batteryLevel: system.batteryLevel,
          gridConnection: system.gridConnection,
        },
      });
    }

    return dataPoints;
  }

  async generateAlert(): Promise<SimulationAlert | null> {
    const now = new Date();

    for (const system of this.energySystems.values()) {
      const alertKey = `${system.systemId}-${now.getHours()}`;
      const lastAlert = this.alertHistory.get(alertKey);

      // Don't generate duplicate alerts within the same hour
      if (lastAlert && (now.getTime() - lastAlert.getTime()) < 3600000) {
        continue;
      }

      let alert: SimulationAlert | null = null;

      // Check for efficiency drop
      if (system.efficiency < 85 && system.status === 'OPERATIONAL') {
        alert = {
          id: `eff-${system.systemId}-${now.getTime()}`,
          type: 'EFFICIENCY_DROP',
          severity: system.efficiency < 75 ? 'HIGH' : 'MEDIUM',
          message: `Efficiency dropped to ${system.efficiency.toFixed(1)}% for ${system.systemType} system`,
          timestamp: now,
          resolved: false,
          metadata: {
            systemId: system.systemId,
            systemType: system.systemType,
            efficiency: system.efficiency,
            location: system.location,
          },
        };
      }

      // Check for low battery
      if (system.systemType === 'BATTERY' && system.batteryLevel && system.batteryLevel < 20) {
        alert = {
          id: `batt-${system.systemId}-${now.getTime()}`,
          type: 'LOW_BATTERY',
          severity: system.batteryLevel < 10 ? 'CRITICAL' : 'HIGH',
          message: `Battery level critically low: ${system.batteryLevel.toFixed(1)}%`,
          timestamp: now,
          resolved: false,
          metadata: {
            systemId: system.systemId,
            systemType: system.systemType,
            batteryLevel: system.batteryLevel,
            location: system.location,
          },
        };
      }

      // Check for maintenance due
      if (now >= system.nextMaintenance && system.status === 'OPERATIONAL') {
        alert = {
          id: `maint-${system.systemId}-${now.getTime()}`,
          type: 'MAINTENANCE_DUE',
          severity: 'MEDIUM',
          message: `Maintenance overdue for ${system.systemType} system`,
          timestamp: now,
          resolved: false,
          metadata: {
            systemId: system.systemId,
            systemType: system.systemType,
            nextMaintenance: system.nextMaintenance,
            location: system.location,
          },
        };
      }

      if (alert) {
        this.alertHistory.set(alertKey, now);
        return alert;
      }
    }

    return null;
  }

  getEnergySystems(): Map<string, EnergySystemData> {
    return new Map(this.energySystems);
  }

  getEnergySystem(systemId: string): EnergySystemData | undefined {
    return this.energySystems.get(systemId);
  }
}
