/**
 * IoT Simulation Data Source
 *
 * Simulates IoT sensors and devices using standard protocols like MQTT,
 * CoAP, and OPC UA. Supports various sensor types with realistic data patterns.
 *
 * @fileoverview IoT sensor simulation with MQTT and OPC UA compatibility
 */

import { SimulationAlert, SimulationConfig, SimulationDataPoint, SimulationDataSource } from './simulation-engine';

export interface IoTSensorData {
  sensorId: string;
  sensorType: 'TEMPERATURE' | 'HUMIDITY' | 'PRESSURE' | 'VIBRATION' | 'SOUND' | 'LIGHT' | 'MOTION' | 'AIR_QUALITY';
  location: string;
  assetId?: string;
  timestamp: Date;
  value: number;
  unit: string;
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE' | 'FAULT';
  batteryLevel?: number; // percentage for battery-powered sensors
  signalStrength?: number; // dBm for wireless sensors
  calibrationDate: Date;
  nextCalibration: Date;
  metadata: Record<string, any>;
}

export interface IoTAlertData {
  sensorId: string;
  alertType: 'SENSOR_OFFLINE' | 'BATTERY_LOW' | 'CALIBRATION_DUE' | 'VALUE_OUT_OF_RANGE' | 'COMMUNICATION_LOST';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  sensorType: string;
  location: string;
}

export class IoTSimulationDataSource extends SimulationDataSource {
  private sensors: Map<string, IoTSensorData> = new Map();
  private lastUpdateTime: Date = new Date();
  private alertHistory: Map<string, Date> = new Map();

  constructor(config: SimulationConfig) {
    super(config);
    this.initializeSensors();
  }

  private initializeSensors(): void {
    // Temperature sensors
    this.sensors.set('temp-001', {
      sensorId: 'temp-001',
      sensorType: 'TEMPERATURE',
      location: 'Water Pump Station #3',
      assetId: 'asset-pump-003',
      timestamp: new Date(),
      value: 22.5,
      unit: '°C',
      status: 'ONLINE',
      batteryLevel: 85,
      signalStrength: -65,
      calibrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
      nextCalibration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 335),
      metadata: {
        manufacturer: 'Siemens',
        model: 'QFA3170',
        protocol: 'Modbus RTU',
        updateInterval: 30, // seconds
      },
    });

    this.sensors.set('temp-002', {
      sensorId: 'temp-002',
      sensorType: 'TEMPERATURE',
      location: 'Energy Hub',
      assetId: 'asset-battery-001',
      timestamp: new Date(),
      value: 24.2,
      unit: '°C',
      status: 'ONLINE',
      batteryLevel: 92,
      signalStrength: -58,
      calibrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      nextCalibration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 350),
      metadata: {
        manufacturer: 'Honeywell',
        model: 'T775',
        protocol: 'BACnet',
        updateInterval: 60, // seconds
      },
    });

    // Vibration sensors
    this.sensors.set('vib-001', {
      sensorId: 'vib-001',
      sensorType: 'VIBRATION',
      location: 'Wind Turbine Array',
      assetId: 'asset-wind-001',
      timestamp: new Date(),
      value: 0.8,
      unit: 'mm/s',
      status: 'ONLINE',
      batteryLevel: 78,
      signalStrength: -72,
      calibrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45),
      nextCalibration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 320),
      metadata: {
        manufacturer: 'SKF',
        model: 'CMSS 2000',
        protocol: 'OPC UA',
        updateInterval: 10, // seconds
        frequencyRange: '10-1000 Hz',
      },
    });

    // Air quality sensors
    this.sensors.set('air-001', {
      sensorId: 'air-001',
      sensorType: 'AIR_QUALITY',
      location: 'Emergency Facility',
      timestamp: new Date(),
      value: 45,
      unit: 'AQI',
      status: 'ONLINE',
      batteryLevel: 88,
      signalStrength: -62,
      calibrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
      nextCalibration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 345),
      metadata: {
        manufacturer: 'Sensirion',
        model: 'SGP30',
        protocol: 'MQTT',
        updateInterval: 120, // seconds
        pollutants: ['PM2.5', 'PM10', 'NO2', 'O3'],
      },
    });

    // Pressure sensors
    this.sensors.set('press-001', {
      sensorId: 'press-001',
      sensorType: 'PRESSURE',
      location: 'Water Pump Station #3',
      assetId: 'asset-pump-003',
      timestamp: new Date(),
      value: 2.5,
      unit: 'bar',
      status: 'ONLINE',
      batteryLevel: 91,
      signalStrength: -59,
      calibrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
      nextCalibration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 340),
      metadata: {
        manufacturer: 'Endress+Hauser',
        model: 'Cerabar S',
        protocol: 'HART',
        updateInterval: 15, // seconds
        pressureRange: '0-10 bar',
      },
    });

    // Motion sensors
    this.sensors.set('motion-001', {
      sensorId: 'motion-001',
      sensorType: 'MOTION',
      location: 'Main Depot',
      timestamp: new Date(),
      value: 0,
      unit: 'detection',
      status: 'ONLINE',
      batteryLevel: 95,
      signalStrength: -55,
      calibrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      nextCalibration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 355),
      metadata: {
        manufacturer: 'Bosch',
        model: 'PIR-360',
        protocol: 'Zigbee',
        updateInterval: 5, // seconds
        detectionRange: '10m',
      },
    });

    // Light sensors
    this.sensors.set('light-001', {
      sensorId: 'light-001',
      sensorType: 'LIGHT',
      location: 'Solar Array - North Facility',
      assetId: 'asset-solar-001',
      timestamp: new Date(),
      value: 850,
      unit: 'lux',
      status: 'ONLINE',
      batteryLevel: 89,
      signalStrength: -61,
      calibrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35),
      nextCalibration: new Date(Date.now() + 1000 * 60 * 60 * 24 * 330),
      metadata: {
        manufacturer: 'Vishay',
        model: 'TEMT6000',
        protocol: 'LoRaWAN',
        updateInterval: 60, // seconds
        spectralRange: '400-700 nm',
      },
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;

    // Update sensor data every 30 seconds
    this.intervalId = setInterval(() => {
      this.updateSensorData();
    }, 30000);

    console.log('IoT simulation data source started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('IoT simulation data source stopped');
  }

  private updateSensorData(): void {
    const now = new Date();
    const timeOfDay = now.getHours();

    for (const [sensorId, sensor] of this.sensors) {
      // Skip offline sensors
      if (sensor.status === 'OFFLINE') {
        continue;
      }

      let newValue = sensor.value;

      switch (sensor.sensorType) {
        case 'TEMPERATURE':
          // Temperature varies with time of day and season
          const baseTemp = 20 + 5 * Math.sin((timeOfDay - 6) / 12 * Math.PI);
          newValue = this.generateRealisticValue(baseTemp, 0.05);
          break;

        case 'HUMIDITY':
          // Humidity varies inversely with temperature
          newValue = this.generateRealisticValue(60, 0.1);
          break;

        case 'PRESSURE':
          // Pressure has small variations
          newValue = this.generateRealisticValue(2.5, 0.02);
          break;

        case 'VIBRATION':
          // Vibration depends on equipment operation
          const isOperating = timeOfDay >= 6 && timeOfDay <= 18;
          const baseVibration = isOperating ? 1.2 : 0.3;
          newValue = this.generateRealisticValue(baseVibration, 0.2);
          break;

        case 'AIR_QUALITY':
          // Air quality varies with time and weather
          const baseAQI = 40 + 20 * Math.sin((timeOfDay / 24) * 2 * Math.PI);
          newValue = this.generateRealisticValue(baseAQI, 0.1);
          break;

        case 'MOTION':
          // Motion detection is binary
          newValue = Math.random() < 0.1 ? 1 : 0;
          break;

        case 'LIGHT':
          // Light varies with time of day
          const lightLevel = timeOfDay >= 6 && timeOfDay <= 18 ?
            1000 * Math.sin((timeOfDay - 6) / 12 * Math.PI) : 0;
          newValue = this.generateRealisticValue(lightLevel, 0.05);
          break;
      }

      // Update sensor data
      sensor.value = Math.max(0, newValue);
      sensor.timestamp = now;

      // Simulate battery drain
      if (sensor.batteryLevel !== undefined) {
        sensor.batteryLevel = Math.max(0, sensor.batteryLevel - 0.01);
      }

      // Simulate signal strength variations
      if (sensor.signalStrength !== undefined) {
        sensor.signalStrength = this.generateRealisticValue(sensor.signalStrength, 0.05);
      }

      // Check for calibration due
      if (now >= sensor.nextCalibration) {
        sensor.status = 'MAINTENANCE';
      }
    }

    this.lastUpdateTime = now;
  }

  async getCurrentData(): Promise<SimulationDataPoint[]> {
    const dataPoints: SimulationDataPoint[] = [];

    for (const sensor of this.sensors.values()) {
      if (sensor.status === 'ONLINE') {
        dataPoints.push({
          timestamp: sensor.timestamp,
          value: sensor.value,
          unit: sensor.unit,
          metadata: {
            sensorId: sensor.sensorId,
            sensorType: sensor.sensorType,
            location: sensor.location,
            assetId: sensor.assetId,
            status: sensor.status,
            batteryLevel: sensor.batteryLevel,
            signalStrength: sensor.signalStrength,
            protocol: sensor.metadata.protocol,
            manufacturer: sensor.metadata.manufacturer,
            model: sensor.metadata.model,
          },
        });
      }
    }

    return dataPoints;
  }

  async generateAlert(): Promise<SimulationAlert | null> {
    const now = new Date();

    for (const [sensorId, sensor] of this.sensors) {
      const alertKey = `${sensorId}-${now.getHours()}`;
      const lastAlert = this.alertHistory.get(alertKey);

      // Don't generate duplicate alerts within the same hour
      if (lastAlert && (now.getTime() - lastAlert.getTime()) < 3600000) {
        continue;
      }

      let alert: SimulationAlert | null = null;

      // Check for sensor offline
      if (sensor.status === 'OFFLINE') {
        alert = {
          id: `offline-${sensorId}-${now.getTime()}`,
          type: 'SENSOR_OFFLINE',
          severity: 'HIGH',
          message: `Sensor ${sensorId} is offline`,
          timestamp: now,
          resolved: false,
          metadata: {
            sensorId: sensor.sensorId,
            sensorType: sensor.sensorType,
            location: sensor.location,
            assetId: sensor.assetId,
            lastSeen: sensor.timestamp,
          },
        };
      }

      // Check for low battery
      if (sensor.batteryLevel !== undefined && sensor.batteryLevel < 20) {
        alert = {
          id: `battery-${sensorId}-${now.getTime()}`,
          type: 'BATTERY_LOW',
          severity: sensor.batteryLevel < 10 ? 'CRITICAL' : 'HIGH',
          message: `Battery level critically low: ${sensor.batteryLevel.toFixed(1)}%`,
          timestamp: now,
          resolved: false,
          metadata: {
            sensorId: sensor.sensorId,
            sensorType: sensor.sensorType,
            location: sensor.location,
            batteryLevel: sensor.batteryLevel,
          },
        };
      }

      // Check for calibration due
      if (now >= sensor.nextCalibration && sensor.status === 'ONLINE') {
        alert = {
          id: `calibration-${sensorId}-${now.getTime()}`,
          type: 'CALIBRATION_DUE',
          severity: 'MEDIUM',
          message: `Calibration overdue for sensor ${sensorId}`,
          timestamp: now,
          resolved: false,
          metadata: {
            sensorId: sensor.sensorId,
            sensorType: sensor.sensorType,
            location: sensor.location,
            nextCalibration: sensor.nextCalibration,
          },
        };
      }

      // Check for value out of range
      if (this.isValueOutOfRange(sensor)) {
        alert = {
          id: `range-${sensorId}-${now.getTime()}`,
          type: 'VALUE_OUT_OF_RANGE',
          severity: 'HIGH',
          message: `Sensor ${sensorId} reading out of normal range: ${sensor.value} ${sensor.unit}`,
          timestamp: now,
          resolved: false,
          metadata: {
            sensorId: sensor.sensorId,
            sensorType: sensor.sensorType,
            location: sensor.location,
            value: sensor.value,
            unit: sensor.unit,
          },
        };
      }

      // Check for communication issues
      if (sensor.signalStrength !== undefined && sensor.signalStrength < -80) {
        alert = {
          id: `comm-${sensorId}-${now.getTime()}`,
          type: 'COMMUNICATION_LOST',
          severity: 'HIGH',
          message: `Poor communication signal: ${sensor.signalStrength.toFixed(1)} dBm`,
          timestamp: now,
          resolved: false,
          metadata: {
            sensorId: sensor.sensorId,
            sensorType: sensor.sensorType,
            location: sensor.location,
            signalStrength: sensor.signalStrength,
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

  private isValueOutOfRange(sensor: IoTSensorData): boolean {
    const ranges: Record<string, [number, number]> = {
      'TEMPERATURE': [-10, 50],
      'HUMIDITY': [0, 100],
      'PRESSURE': [0, 10],
      'VIBRATION': [0, 5],
      'AIR_QUALITY': [0, 500],
      'LIGHT': [0, 10000],
    };

    const range = ranges[sensor.sensorType];
    if (!range) return false;

    return sensor.value < range[0] || sensor.value > range[1];
  }

  getSensors(): Map<string, IoTSensorData> {
    return new Map(this.sensors);
  }

  getSensor(sensorId: string): IoTSensorData | undefined {
    return this.sensors.get(sensorId);
  }

  // MQTT-compatible data format
  getMQTTData(sensorId: string): any {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return null;

    return {
      topic: `sensors/${sensorId}/data`,
      payload: {
        sensorId: sensor.sensorId,
        sensorType: sensor.sensorType,
        location: sensor.location,
        assetId: sensor.assetId,
        timestamp: sensor.timestamp.toISOString(),
        value: sensor.value,
        unit: sensor.unit,
        status: sensor.status,
        batteryLevel: sensor.batteryLevel,
        signalStrength: sensor.signalStrength,
        metadata: sensor.metadata,
      },
      qos: 1,
      retain: false,
    };
  }

  // OPC UA-compatible data format
  getOPCUAData(sensorId: string): any {
    const sensor = this.sensors.get(sensorId);
    if (!sensor) return null;

    return {
      nodeId: `ns=2;s=${sensorId}`,
      browseName: sensor.sensorId,
      displayName: `${sensor.sensorType} Sensor`,
      dataType: this.getOPCUADataType(sensor.sensorType),
      value: sensor.value,
      timestamp: sensor.timestamp,
      status: sensor.status,
      metadata: {
        location: sensor.location,
        assetId: sensor.assetId,
        unit: sensor.unit,
        batteryLevel: sensor.batteryLevel,
        signalStrength: sensor.signalStrength,
      },
    };
  }

  private getOPCUADataType(sensorType: string): string {
    const typeMap: Record<string, string> = {
      'TEMPERATURE': 'Double',
      'HUMIDITY': 'Double',
      'PRESSURE': 'Double',
      'VIBRATION': 'Double',
      'AIR_QUALITY': 'Double',
      'MOTION': 'Boolean',
      'LIGHT': 'Double',
    };
    return typeMap[sensorType] || 'Double';
  }
}
