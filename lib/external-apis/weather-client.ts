/**
 * OpenWeatherMap API Client
 *
 * Provides integration with OpenWeatherMap API for real-time weather data.
 * Supports current weather, forecasts, and historical data with proper error handling.
 * Implements heavy rate limiting to ensure no more than one call every 15 minutes per location.
 *
 * @fileoverview OpenWeatherMap API client with caching and heavy rate limiting
 */

import { weatherRateLimiter, WeatherRateLimiter } from './weather-rate-limiter';

export interface WeatherLocation {
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  state?: string;
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  cloudCover: number;
  precipitation: number;
  uvIndex: number;
  weatherCondition: string;
  timestamp: Date;
  coordinates: {
    lat: number;
    lon: number;
  };
}

export interface WeatherForecast {
  location: string;
  forecasts: Array<{
    date: string;
    temperature: {
      min: number;
      max: number;
      avg: number;
    };
    humidity: number;
    precipitation: number;
    weatherCondition: string;
  }>;
}

export class OpenWeatherMapClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.openweathermap.org/data/2.5';
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout: number = 15 * 60 * 1000; // 15 minutes to match rate limit
  private rateLimiter: WeatherRateLimiter;

  constructor(apiKey: string, rateLimiter?: WeatherRateLimiter) {
    this.apiKey = apiKey;
    this.rateLimiter = rateLimiter || weatherRateLimiter;
  }

  async getCurrentWeather(location: WeatherLocation): Promise<WeatherData> {
    const cacheKey = `current-${location.latitude}-${location.longitude}`;
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    // Check rate limit before making API call
    const locationKey = `${location.latitude},${location.longitude}`;
    if (!this.rateLimiter.canMakeCall(locationKey)) {
      const status = this.rateLimiter.getRateLimitStatus(locationKey);
      throw new Error(
        `Weather API rate limit exceeded for ${location.name}. ` +
        `Next call allowed in ${WeatherRateLimiter.formatDuration(status.timeUntilNextCall)}`
      );
    }

    try {
      const url = `${this.baseUrl}/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${this.apiKey}&units=metric`;
      const response = await this.makeRequest(url);

      const weatherData: WeatherData = {
        location: location.name,
        temperature: response.main.temp,
        humidity: response.main.humidity,
        pressure: response.main.pressure,
        windSpeed: response.wind?.speed || 0,
        windDirection: response.wind?.deg || 0,
        visibility: response.visibility ? response.visibility / 1000 : 10, // Convert to km
        cloudCover: response.clouds?.all || 0,
        precipitation: response.rain?.['1h'] || response.snow?.['1h'] || 0,
        uvIndex: 0, // UV index requires separate API call
        weatherCondition: response.weather[0]?.main || 'Unknown',
        timestamp: new Date(),
        coordinates: {
          lat: response.coord.lat,
          lon: response.coord.lon,
        },
      };

      // Record the API call in rate limiter
      this.rateLimiter.recordCall(locationKey);
      
      this.setCachedData(cacheKey, weatherData);
      return weatherData;
    } catch (error) {
      console.error('Failed to fetch current weather:', error);
      throw new Error(`Weather data unavailable for ${location.name}`);
    }
  }

  async getWeatherForecast(location: WeatherLocation, days: number = 5): Promise<WeatherForecast> {
    const cacheKey = `forecast-${location.latitude}-${location.longitude}-${days}`;
    const cached = this.getCachedData(cacheKey);

    if (cached) {
      return cached;
    }

    // Check rate limit before making API call
    const locationKey = `${location.latitude},${location.longitude}`;
    if (!this.rateLimiter.canMakeCall(locationKey)) {
      const status = this.rateLimiter.getRateLimitStatus(locationKey);
      throw new Error(
        `Weather API rate limit exceeded for ${location.name}. ` +
        `Next call allowed in ${WeatherRateLimiter.formatDuration(status.timeUntilNextCall)}`
      );
    }

    try {
      const url = `${this.baseUrl}/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${this.apiKey}&units=metric`;
      const response = await this.makeRequest(url);

      // Group forecast data by date
      const forecastsByDate = new Map<string, any[]>();

      response.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[0];
        if (!forecastsByDate.has(date)) {
          forecastsByDate.set(date, []);
        }
        forecastsByDate.get(date)!.push(item);
      });

      const forecasts = Array.from(forecastsByDate.entries())
        .slice(0, days)
        .map(([date, items]) => {
          const temperatures = items.map(item => item.main.temp);
          const humidities = items.map(item => item.main.humidity);
          const precipitations = items.map(item => item.rain?.['3h'] || item.snow?.['3h'] || 0);

          return {
            date,
            temperature: {
              min: Math.min(...temperatures),
              max: Math.max(...temperatures),
              avg: temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length,
            },
            humidity: humidities.reduce((sum, hum) => sum + hum, 0) / humidities.length,
            precipitation: precipitations.reduce((sum, prec) => sum + prec, 0),
            weatherCondition: items[Math.floor(items.length / 2)].weather[0]?.main || 'Unknown',
          };
        });

      const forecast: WeatherForecast = {
        location: location.name,
        forecasts,
      };

      // Record the API call in rate limiter
      this.rateLimiter.recordCall(locationKey);
      
      this.setCachedData(cacheKey, forecast);
      return forecast;
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      throw new Error(`Weather forecast unavailable for ${location.name}`);
    }
  }

  async getUVIndex(location: WeatherLocation): Promise<number> {
    try {
      const url = `${this.baseUrl}/uvi?lat=${location.latitude}&lon=${location.longitude}&appid=${this.apiKey}`;
      const response = await this.makeRequest(url);
      return response.value || 0;
    } catch (error) {
      console.error('Failed to fetch UV index:', error);
      return 0;
    }
  }

  async searchLocation(query: string): Promise<WeatherLocation[]> {
    try {
      const url = `${this.baseUrl}/find?q=${encodeURIComponent(query)}&appid=${this.apiKey}&units=metric`;
      const response = await this.makeRequest(url);

      return response.list.map((item: any) => ({
        name: item.name,
        latitude: item.coord.lat,
        longitude: item.coord.lon,
        country: item.sys.country,
        state: item.state,
      }));
    } catch (error) {
      console.error('Failed to search locations:', error);
      return [];
    }
  }

  private async makeRequest(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Aegrid-WeatherClient/1.0',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Invalid API key');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (response.status === 404) {
        throw new Error('Location not found');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }

    return await response.json();
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  setCacheTimeout(timeout: number): void {
    this.cacheTimeout = timeout;
  }

  /**
   * Get rate limit status for a location
   */
  getRateLimitStatus(location: WeatherLocation): {
    canCall: boolean;
    timeUntilNextCall: number;
    callsRemaining: number;
    resetTime: number;
  } {
    const locationKey = `${location.latitude},${location.longitude}`;
    return this.rateLimiter.getRateLimitStatus(locationKey);
  }

  /**
   * Reset rate limit for a specific location
   */
  resetRateLimit(location: WeatherLocation): void {
    const locationKey = `${location.latitude},${location.longitude}`;
    this.rateLimiter.resetLocation(locationKey);
  }
}
