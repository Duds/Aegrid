/**
 * Simulation Engine Infrastructure
 *
 * A modular, separable simulation engine that can drive realistic data
 * for Control Center operations. Uses industry-standard endpoints and
 * protocols where possible.
 *
 * @fileoverview Core simulation engine with pluggable data sources
 */

export interface SimulationConfig {
  enabled: boolean;
  realTimeMode: boolean;
  simulationSpeed: number; // multiplier for time acceleration
  dataSources: {
    energy: boolean;
    weather: boolean;
    iot: boolean;
    emergency: boolean;
  };
  endpoints: {
    energy: string;
    weather: string;
    iot: string;
    emergency: string;
  };
}

export interface SimulationDataPoint {
  timestamp: Date;
  value: number;
  unit: string;
  metadata?: Record<string, any>;
}

export interface SimulationAlert {
  id: string;
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export abstract class SimulationDataSource {
  protected config: SimulationConfig;
  protected isRunning: boolean = false;
  protected intervalId?: NodeJS.Timeout;

  constructor(config: SimulationConfig) {
    this.config = config;
  }

  abstract start(): Promise<void>;
  abstract stop(): Promise<void>;
  abstract getCurrentData(): Promise<SimulationDataPoint[]>;
  abstract generateAlert(): Promise<SimulationAlert | null>;

  protected generateRealisticValue(
    baseValue: number,
    variance: number = 0.1,
    trend: number = 0,
    seasonality: number = 0
  ): number {
    const now = new Date();
    const timeFactor = now.getHours() / 24; // 0-1 based on hour of day
    const seasonalFactor = Math.sin((now.getMonth() / 12) * 2 * Math.PI);

    const randomVariance = (Math.random() - 0.5) * 2 * variance;
    const trendFactor = trend * (now.getTime() - Date.now()) / (1000 * 60 * 60); // hourly trend
    const seasonalFactorValue = seasonality * seasonalFactor;

    return Math.max(0, baseValue * (1 + randomVariance + trendFactor + seasonalFactorValue));
  }

  protected generateAlertProbability(
    baseProbability: number,
    stressFactors: Record<string, number> = {}
  ): boolean {
    let adjustedProbability = baseProbability;

    // Adjust probability based on stress factors
    Object.values(stressFactors).forEach(factor => {
      adjustedProbability *= (1 + factor);
    });

    return Math.random() < Math.min(adjustedProbability, 0.95); // Cap at 95%
  }
}

export class SimulationEngine {
  private config: SimulationConfig;
  private dataSources: Map<string, SimulationDataSource> = new Map();
  private isRunning: boolean = false;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor(config: SimulationConfig) {
    this.config = config;
  }

  registerDataSource(name: string, dataSource: SimulationDataSource): void {
    this.dataSources.set(name, dataSource);
  }

  async start(): Promise<void> {
    if (this.isRunning) return;

    this.isRunning = true;

    for (const [name, dataSource] of this.dataSources) {
      if (this.config.dataSources[name as keyof typeof this.config.dataSources]) {
        await dataSource.start();
        console.log(`Started simulation data source: ${name}`);
      }
    }

    console.log('Simulation engine started');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.isRunning = false;

    for (const [name, dataSource] of this.dataSources) {
      await dataSource.stop();
      console.log(`Stopped simulation data source: ${name}`);
    }

    console.log('Simulation engine stopped');
  }

  async getData(sourceName: string): Promise<SimulationDataPoint[]> {
    const dataSource = this.dataSources.get(sourceName);
    if (!dataSource) {
      throw new Error(`Data source ${sourceName} not found`);
    }

    return await dataSource.getCurrentData();
  }

  async generateAlert(sourceName: string): Promise<SimulationAlert | null> {
    const dataSource = this.dataSources.get(sourceName);
    if (!dataSource) {
      throw new Error(`Data source ${sourceName} not found`);
    }

    return await dataSource.generateAlert();
  }

  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }

  emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => handler(data));
    }
  }

  getConfig(): SimulationConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<SimulationConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Default simulation configuration
export const defaultSimulationConfig: SimulationConfig = {
  enabled: process.env.NODE_ENV === 'development',
  realTimeMode: true,
  simulationSpeed: 1.0,
  dataSources: {
    energy: true,
    weather: true,
    iot: true,
    emergency: true,
  },
  endpoints: {
    energy: '/api/simulation/energy',
    weather: '/api/simulation/weather',
    iot: '/api/simulation/iot',
    emergency: '/api/simulation/emergency',
  },
};

// Global simulation engine instance
let globalSimulationEngine: SimulationEngine | null = null;

export function getSimulationEngine(): SimulationEngine {
  if (!globalSimulationEngine) {
    globalSimulationEngine = new SimulationEngine(defaultSimulationConfig);
    // Initialize data sources
    initializeDataSources(globalSimulationEngine);
  }
  return globalSimulationEngine;
}

function initializeDataSources(engine: SimulationEngine): void {
  // Import and register emergency data source synchronously
  try {
    const { EmergencySimulationDataSource } = require('./emergency-simulation');
    const emergencyDataSource = new EmergencySimulationDataSource(defaultSimulationConfig);
    engine.registerDataSource('emergency', emergencyDataSource);
  } catch (error) {
    console.warn('Failed to load emergency simulation data source:', error);
  }

  // Import and register other data sources
  try {
    const { EnergySimulationDataSource } = require('./energy-simulation');
    const energyDataSource = new EnergySimulationDataSource(defaultSimulationConfig);
    engine.registerDataSource('energy', energyDataSource);
  } catch (error) {
    console.warn('Failed to load energy simulation data source:', error);
  }

  try {
    const { WeatherSimulationDataSource } = require('./weather-simulation');
    const weatherDataSource = new WeatherSimulationDataSource(defaultSimulationConfig);
    engine.registerDataSource('weather', weatherDataSource);
  } catch (error) {
    console.warn('Failed to load weather simulation data source:', error);
  }

  try {
    const { IoTSimulationDataSource } = require('./iot-simulation');
    const iotDataSource = new IoTSimulationDataSource(defaultSimulationConfig);
    engine.registerDataSource('iot', iotDataSource);
  } catch (error) {
    console.warn('Failed to load IoT simulation data source:', error);
  }
}

export function initializeSimulationEngine(config?: Partial<SimulationConfig>): SimulationEngine {
  const finalConfig = { ...defaultSimulationConfig, ...config };
  globalSimulationEngine = new SimulationEngine(finalConfig);
  return globalSimulationEngine;
}
