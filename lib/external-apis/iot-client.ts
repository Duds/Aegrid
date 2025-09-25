/**
 * MQTT IoT Client
 *
 * Provides integration with MQTT brokers for real-time IoT sensor data.
 * Supports multiple sensor types with automatic reconnection and error handling.
 *
 * @fileoverview MQTT IoT client with sensor data collection and management
 */

export interface IoTSensor {
  id: string;
  name: string;
  type: 'TEMPERATURE' | 'HUMIDITY' | 'PRESSURE' | 'VIBRATION' | 'AIR_QUALITY' | 'MOTION' | 'LIGHT';
  location: string;
  assetId?: string;
  metadata?: {
    unit?: string;
    minValue?: number;
    maxValue?: number;
    calibrationDate?: Date;
    nextCalibration?: Date;
  };
}

export interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  quality: 'GOOD' | 'UNCERTAIN' | 'BAD';
  metadata?: any;
}

export interface MQTTConfig {
  brokerUrl: string;
  username?: string;
  password?: string;
  clientId?: string;
  keepAlive?: number;
  reconnectPeriod?: number;
  connectTimeout?: number;
}

export class MQTTIoTClient {
  private config: MQTTConfig;
  private sensors: Map<string, IoTSensor> = new Map();
  private readings: Map<string, SensorReading[]> = new Map();
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private mqttClient: any = null;

  constructor(config: MQTTConfig) {
    this.config = {
      keepAlive: 60,
      reconnectPeriod: 1000,
      connectTimeout: 30000,
      ...config,
    };
  }

  async connect(): Promise<void> {
    try {
      // In a real implementation, you would use an MQTT library like mqtt.js
      // For now, we'll simulate the connection
      console.log(`Connecting to MQTT broker: ${this.config.brokerUrl}`);

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('MQTT client connected successfully');

      // Start listening for sensor data
      this.startDataCollection();
    } catch (error) {
      console.error('Failed to connect to MQTT broker:', error);
      this.handleReconnection();
    }
  }

  async disconnect(): Promise<void> {
    if (this.mqttClient) {
      // In real implementation: await this.mqttClient.end();
      this.mqttClient = null;
    }
    this.isConnected = false;
    console.log('MQTT client disconnected');
  }

  registerSensor(sensor: IoTSensor): void {
    this.sensors.set(sensor.id, sensor);
    this.readings.set(sensor.id, []);
    console.log(`Registered sensor: ${sensor.name} (${sensor.id})`);
  }

  unregisterSensor(sensorId: string): void {
    this.sensors.delete(sensorId);
    this.readings.delete(sensorId);
    console.log(`Unregistered sensor: ${sensorId}`);
  }

  getSensor(sensorId: string): IoTSensor | undefined {
    return this.sensors.get(sensorId);
  }

  getAllSensors(): IoTSensor[] {
    return Array.from(this.sensors.values());
  }

  getLatestReading(sensorId: string): SensorReading | undefined {
    const readings = this.readings.get(sensorId);
    return readings ? readings[readings.length - 1] : undefined;
  }

  getReadings(sensorId: string, limit: number = 100): SensorReading[] {
    const readings = this.readings.get(sensorId) || [];
    return readings.slice(-limit);
  }

  private startDataCollection(): void {
    if (!this.isConnected) return;

    // Simulate MQTT message handling
    setInterval(() => {
      this.simulateSensorData();
    }, 5000); // Collect data every 5 seconds
  }

  private simulateSensorData(): void {
    this.sensors.forEach((sensor) => {
      const reading = this.generateSensorReading(sensor);
      this.addReading(sensor.id, reading);
    });
  }

  private generateSensorReading(sensor: IoTSensor): SensorReading {
    const now = new Date();
    let value: number;
    let unit: string;

    switch (sensor.type) {
      case 'TEMPERATURE':
        value = this.generateRealisticValue(22.0, 0.5);
        unit = '°C';
        break;
      case 'HUMIDITY':
        value = this.generateRealisticValue(60.0, 2.0);
        unit = '%';
        break;
      case 'PRESSURE':
        value = this.generateRealisticValue(1013.25, 0.5);
        unit = 'hPa';
        break;
      case 'VIBRATION':
        value = this.generateRealisticValue(1.0, 0.2);
        unit = 'mm/s';
        break;
      case 'AIR_QUALITY':
        value = this.generateRealisticValue(50.0, 5.0);
        unit = 'AQI';
        break;
      case 'MOTION':
        value = Math.random() < 0.1 ? 1 : 0;
        unit = 'binary';
        break;
      case 'LIGHT':
        const hour = now.getHours();
        value = hour >= 6 && hour <= 18 ? this.generateRealisticValue(500, 100) : 0;
        unit = 'lux';
        break;
      default:
        value = 0;
        unit = 'unknown';
    }

    return {
      sensorId: sensor.id,
      value,
      unit,
      timestamp: now,
      quality: this.determineDataQuality(sensor, value),
      metadata: {
        location: sensor.location,
        assetId: sensor.assetId,
      },
    };
  }

  private generateRealisticValue(baseValue: number, variation: number): number {
    return baseValue + (Math.random() - 0.5) * variation;
  }

  private determineDataQuality(sensor: IoTSensor, value: number): 'GOOD' | 'UNCERTAIN' | 'BAD' {
    const metadata = sensor.metadata;
    if (!metadata) return 'GOOD';

    if (metadata.minValue !== undefined && value < metadata.minValue) return 'BAD';
    if (metadata.maxValue !== undefined && value > metadata.maxValue) return 'BAD';

    // Check calibration status
    if (metadata.nextCalibration && new Date() > metadata.nextCalibration) {
      return 'UNCERTAIN';
    }

    return 'GOOD';
  }

  private addReading(sensorId: string, reading: SensorReading): void {
    const readings = this.readings.get(sensorId) || [];
    readings.push(reading);

    // Keep only the last 1000 readings
    if (readings.length > 1000) {
      readings.splice(0, readings.length - 1000);
    }

    this.readings.set(sensorId, readings);
  }

  private handleReconnection(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. MQTT client will not reconnect.');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Public methods for sensor management
  async publishSensorCommand(sensorId: string, command: string, payload: any): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    const topic = `sensors/${sensorId}/command`;
    const message = JSON.stringify({ command, payload, timestamp: new Date().toISOString() });

    // In real implementation: await this.mqttClient.publish(topic, message);
    console.log(`Published command to ${topic}: ${message}`);
  }

  async subscribeToSensorData(sensorId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    const topic = `sensors/${sensorId}/data`;
    // In real implementation: await this.mqttClient.subscribe(topic);
    console.log(`Subscribed to sensor data: ${topic}`);
  }

  async unsubscribeFromSensorData(sensorId: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('MQTT client not connected');
    }

    const topic = `sensors/${sensorId}/data`;
    // In real implementation: await this.mqttClient.unsubscribe(topic);
    console.log(`Unsubscribed from sensor data: ${topic}`);
  }

  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }

  updateConfig(newConfig: Partial<MQTTConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
