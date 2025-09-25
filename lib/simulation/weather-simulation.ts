/**
 * Weather Simulation Data Source
 *
 * Simulates weather conditions using standard meteorological data formats
 * and protocols. Supports OpenWeatherMap API-compatible data structures.
 *
 * @fileoverview Weather simulation with METAR/ISD and OpenWeatherMap compatibility
 */

import { SimulationAlert, SimulationConfig, SimulationDataPoint, SimulationDataSource } from './simulation-engine';

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  temperature: number; // Celsius
  humidity: number; // percentage
  pressure: number; // hPa
  windSpeed: number; // m/s
  windDirection: number; // degrees
  visibility: number; // km
  cloudCover: number; // percentage
  precipitation: number; // mm/h
  uvIndex: number; // 0-11
  weatherCondition: string; // 'CLEAR', 'CLOUDY', 'RAIN', 'STORM', 'FOG'
}

export interface WeatherAlertData {
  location: string;
  alertType: 'SEVERE_WEATHER' | 'HIGH_WIND' | 'HEAVY_RAIN' | 'LOW_VISIBILITY' | 'EXTREME_TEMPERATURE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  timestamp: Date;
  expiresAt: Date;
}

export class WeatherSimulationDataSource extends SimulationDataSource {
  private weatherStations: Map<string, WeatherData> = new Map();
  private lastUpdateTime: Date = new Date();
  private alertHistory: Map<string, Date> = new Map();

  constructor(config: SimulationConfig) {
    super(config);
    this.initializeWeatherStations();
  }

  private initializeWeatherStations(): void {
    // North District Weather Station
    this.weatherStations.set('north-district', {
      location: 'North District',
      latitude: -33.8688,
      longitude: 151.2093,
      timestamp: new Date(),
      temperature: 22.5,
      humidity: 65,
      pressure: 1013.25,
      windSpeed: 3.2,
      windDirection: 180,
      visibility: 10,
      cloudCover: 30,
      precipitation: 0,
      uvIndex: 6,
      weatherCondition: 'CLEAR',
    });

    // West Ridge Weather Station
    this.weatherStations.set('west-ridge', {
      location: 'West Ridge',
      latitude: -33.8700,
      longitude: 151.2000,
      timestamp: new Date(),
      temperature: 21.8,
      humidity: 70,
      pressure: 1012.8,
      windSpeed: 4.5,
      windDirection: 220,
      visibility: 8,
      cloudCover: 45,
      precipitation: 0.5,
      uvIndex: 5,
      weatherCondition: 'CLOUDY',
    });

    // Central Business District Weather Station
    this.weatherStations.set('cbd', {
      location: 'Central Business District',
      latitude: -33.8675,
      longitude: 151.2070,
      timestamp: new Date(),
      temperature: 23.2,
      humidity: 60,
      pressure: 1013.5,
      windSpeed: 2.8,
      windDirection: 160,
      visibility: 12,
      cloudCover: 25,
      precipitation: 0,
      uvIndex: 7,
      weatherCondition: 'CLEAR',
    });

    // Emergency Facility Weather Station
    this.weatherStations.set('emergency-facility', {
      location: 'Emergency Facility',
      latitude: -33.8650,
      longitude: 151.2100,
      timestamp: new Date(),
      temperature: 22.0,
      humidity: 68,
      pressure: 1012.9,
      windSpeed: 3.8,
      windDirection: 200,
      visibility: 9,
      cloudCover: 35,
      precipitation: 0.2,
      uvIndex: 6,
      weatherCondition: 'CLOUDY',
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;

    // Update weather data every 5 minutes (standard meteorological update frequency)
    this.intervalId = setInterval(() => {
      this.updateWeatherData();
    }, 300000);

    console.log('Weather simulation data source started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('Weather simulation data source stopped');
  }

  private updateWeatherData(): void {
    const now = new Date();
    const timeOfDay = now.getHours();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));

    for (const [stationId, station] of this.weatherStations) {
      // Update temperature based on time of day and season
      const baseTemp = this.calculateBaseTemperature(timeOfDay, dayOfYear, station.latitude);
      station.temperature = this.generateRealisticValue(baseTemp, 0.05);

      // Update humidity (inverse relationship with temperature)
      const baseHumidity = Math.max(30, Math.min(90, 80 - (station.temperature - 20) * 2));
      station.humidity = this.generateRealisticValue(baseHumidity, 0.1);

      // Update pressure (slight variations)
      station.pressure = this.generateRealisticValue(1013.25, 0.02);

      // Update wind speed and direction
      station.windSpeed = this.generateRealisticValue(3.0, 0.3);
      station.windDirection = (station.windDirection + this.generateRealisticValue(0, 0.2)) % 360;

      // Update visibility based on weather conditions
      station.visibility = this.calculateVisibility(station);

      // Update cloud cover
      station.cloudCover = this.generateRealisticValue(40, 0.2);

      // Update precipitation
      station.precipitation = this.calculatePrecipitation(station);

      // Update UV index based on time of day and season
      station.uvIndex = this.calculateUVIndex(timeOfDay, dayOfYear);

      // Update weather condition
      station.weatherCondition = this.determineWeatherCondition(station);

      station.timestamp = now;
    }

    this.lastUpdateTime = now;
  }

  private calculateBaseTemperature(timeOfDay: number, dayOfYear: number, latitude: number): number {
    // Daily temperature cycle (cooler at night, warmer during day)
    const dailyCycle = 15 + 10 * Math.sin((timeOfDay - 6) / 12 * Math.PI);

    // Seasonal temperature variation
    const seasonalCycle = 5 * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI/2);

    // Latitude adjustment (simplified)
    const latitudeAdjustment = (latitude + 33.87) * 0.1;

    return dailyCycle + seasonalCycle + latitudeAdjustment;
  }

  private calculateVisibility(weather: WeatherData): number {
    let visibility = 15; // Base visibility in km

    // Reduce visibility based on precipitation
    if (weather.precipitation > 0) {
      visibility -= weather.precipitation * 2;
    }

    // Reduce visibility based on humidity
    if (weather.humidity > 80) {
      visibility -= (weather.humidity - 80) * 0.1;
    }

    // Reduce visibility based on cloud cover
    if (weather.cloudCover > 70) {
      visibility -= (weather.cloudCover - 70) * 0.05;
    }

    return Math.max(0.1, Math.min(20, visibility));
  }

  private calculatePrecipitation(weather: WeatherData): number {
    // Precipitation probability based on humidity and cloud cover
    const precipitationProbability = (weather.humidity / 100) * (weather.cloudCover / 100);

    if (Math.random() < precipitationProbability) {
      // Generate realistic precipitation amounts
      if (weather.cloudCover > 80 && weather.humidity > 75) {
        return this.generateRealisticValue(2.0, 0.5); // Heavy rain
      } else if (weather.cloudCover > 60) {
        return this.generateRealisticValue(0.5, 0.2); // Light rain
      } else {
        return this.generateRealisticValue(0.1, 0.1); // Drizzle
      }
    }

    return 0;
  }

  private calculateUVIndex(timeOfDay: number, dayOfYear: number): number {
    // UV index based on sun position
    const sunAngle = Math.sin((timeOfDay - 6) / 12 * Math.PI);
    const seasonalFactor = 0.5 + 0.5 * Math.sin((dayOfYear / 365) * 2 * Math.PI);

    if (timeOfDay < 6 || timeOfDay > 18) return 0; // Night time

    const baseUV = sunAngle * seasonalFactor * 11; // Max UV index is 11
    return Math.max(0, Math.min(11, baseUV));
  }

  private determineWeatherCondition(weather: WeatherData): string {
    if (weather.precipitation > 2) {
      return 'STORM';
    } else if (weather.precipitation > 0.5) {
      return 'RAIN';
    } else if (weather.visibility < 1) {
      return 'FOG';
    } else if (weather.cloudCover > 70) {
      return 'CLOUDY';
    } else {
      return 'CLEAR';
    }
  }

  async getCurrentData(): Promise<SimulationDataPoint[]> {
    const dataPoints: SimulationDataPoint[] = [];

    for (const station of this.weatherStations.values()) {
      // Temperature data point
      dataPoints.push({
        timestamp: station.timestamp,
        value: station.temperature,
        unit: '°C',
        metadata: {
          location: station.location,
          latitude: station.latitude,
          longitude: station.longitude,
          dataType: 'temperature',
          weatherCondition: station.weatherCondition,
        },
      });

      // Wind speed data point
      dataPoints.push({
        timestamp: station.timestamp,
        value: station.windSpeed,
        unit: 'm/s',
        metadata: {
          location: station.location,
          latitude: station.latitude,
          longitude: station.longitude,
          dataType: 'windSpeed',
          windDirection: station.windDirection,
        },
      });

      // Humidity data point
      dataPoints.push({
        timestamp: station.timestamp,
        value: station.humidity,
        unit: '%',
        metadata: {
          location: station.location,
          latitude: station.latitude,
          longitude: station.longitude,
          dataType: 'humidity',
        },
      });
    }

    return dataPoints;
  }

  async generateAlert(): Promise<SimulationAlert | null> {
    const now = new Date();

    for (const [stationId, station] of this.weatherStations) {
      const alertKey = `${stationId}-${now.getHours()}`;
      const lastAlert = this.alertHistory.get(alertKey);

      // Don't generate duplicate alerts within the same hour
      if (lastAlert && (now.getTime() - lastAlert.getTime()) < 3600000) {
        continue;
      }

      let alert: SimulationAlert | null = null;

      // Check for severe weather
      if (station.precipitation > 5) {
        alert = {
          id: `weather-${stationId}-${now.getTime()}`,
          type: 'SEVERE_WEATHER',
          severity: 'HIGH',
          message: `Severe weather conditions: ${station.precipitation.toFixed(1)}mm/h precipitation`,
          timestamp: now,
          resolved: false,
          metadata: {
            location: station.location,
            precipitation: station.precipitation,
            weatherCondition: station.weatherCondition,
            visibility: station.visibility,
          },
        };
      }

      // Check for high wind
      if (station.windSpeed > 15) {
        alert = {
          id: `wind-${stationId}-${now.getTime()}`,
          type: 'HIGH_WIND',
          severity: station.windSpeed > 25 ? 'CRITICAL' : 'HIGH',
          message: `High wind conditions: ${station.windSpeed.toFixed(1)} m/s`,
          timestamp: now,
          resolved: false,
          metadata: {
            location: station.location,
            windSpeed: station.windSpeed,
            windDirection: station.windDirection,
          },
        };
      }

      // Check for low visibility
      if (station.visibility < 1) {
        alert = {
          id: `visibility-${stationId}-${now.getTime()}`,
          type: 'LOW_VISIBILITY',
          severity: station.visibility < 0.5 ? 'CRITICAL' : 'HIGH',
          message: `Low visibility: ${station.visibility.toFixed(1)} km`,
          timestamp: now,
          resolved: false,
          metadata: {
            location: station.location,
            visibility: station.visibility,
            weatherCondition: station.weatherCondition,
          },
        };
      }

      // Check for extreme temperature
      if (station.temperature > 35 || station.temperature < 5) {
        alert = {
          id: `temp-${stationId}-${now.getTime()}`,
          type: 'EXTREME_TEMPERATURE',
          severity: station.temperature > 40 || station.temperature < 0 ? 'CRITICAL' : 'HIGH',
          message: `Extreme temperature: ${station.temperature.toFixed(1)}°C`,
          timestamp: now,
          resolved: false,
          metadata: {
            location: station.location,
            temperature: station.temperature,
            humidity: station.humidity,
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

  getWeatherStations(): Map<string, WeatherData> {
    return new Map(this.weatherStations);
  }

  getWeatherStation(stationId: string): WeatherData | undefined {
    return this.weatherStations.get(stationId);
  }

  // OpenWeatherMap API compatible method
  getOpenWeatherMapData(location: string): any {
    const station = Array.from(this.weatherStations.values()).find(s => s.location === location);
    if (!station) return null;

    return {
      coord: {
        lat: station.latitude,
        lon: station.longitude,
      },
      weather: [{
        id: this.getWeatherConditionId(station.weatherCondition),
        main: station.weatherCondition,
        description: this.getWeatherDescription(station.weatherCondition),
        icon: this.getWeatherIcon(station.weatherCondition),
      }],
      main: {
        temp: station.temperature,
        feels_like: station.temperature + (station.humidity - 50) * 0.1,
        temp_min: station.temperature - 2,
        temp_max: station.temperature + 2,
        pressure: station.pressure,
        humidity: station.humidity,
      },
      visibility: station.visibility * 1000, // Convert to meters
      wind: {
        speed: station.windSpeed,
        deg: station.windDirection,
      },
      clouds: {
        all: station.cloudCover,
      },
      dt: Math.floor(station.timestamp.getTime() / 1000),
      sys: {
        country: 'AU',
        sunrise: Math.floor((new Date().setHours(6, 0, 0, 0)) / 1000),
        sunset: Math.floor((new Date().setHours(18, 0, 0, 0)) / 1000),
      },
      timezone: 36000, // UTC+10 for Sydney
      name: station.location,
    };
  }

  private getWeatherConditionId(condition: string): number {
    const conditionMap: Record<string, number> = {
      'CLEAR': 800,
      'CLOUDY': 801,
      'RAIN': 500,
      'STORM': 200,
      'FOG': 741,
    };
    return conditionMap[condition] || 800;
  }

  private getWeatherDescription(condition: string): string {
    const descriptionMap: Record<string, string> = {
      'CLEAR': 'clear sky',
      'CLOUDY': 'few clouds',
      'RAIN': 'light rain',
      'STORM': 'thunderstorm',
      'FOG': 'fog',
    };
    return descriptionMap[condition] || 'clear sky';
  }

  private getWeatherIcon(condition: string): string {
    const iconMap: Record<string, string> = {
      'CLEAR': '01d',
      'CLOUDY': '02d',
      'RAIN': '10d',
      'STORM': '11d',
      'FOG': '50d',
    };
    return iconMap[condition] || '01d';
  }
}
