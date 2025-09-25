/**
 * Weather Simulation API Endpoint
 *
 * Provides weather data using standard meteorological protocols.
 * Supports OpenWeatherMap API, METAR/ISD, and custom JSON formats.
 *
 * @fileoverview Weather simulation API with OpenWeatherMap compatibility
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
    const location = searchParams.get('location');

    const simulationEngine = getSimulationEngine();
    const weatherSource = simulationEngine['dataSources'].get('weather');

    if (!weatherSource) {
      return NextResponse.json({ message: 'Weather simulation not available' }, { status: 503 });
    }

    const data = await simulationEngine.getData('weather');

    // Filter by location if specified
    const filteredData = location ?
      data.filter(point => point.metadata?.location === location) :
      data;

    switch (format) {
      case 'openweathermap':
        const weatherStations = weatherSource.getWeatherStations();
        const weatherData = Array.from(weatherStations.values())
          .filter(station => !location || station.location === location)
          .map(station => weatherSource.getOpenWeatherMapData(station.location))
          .filter(data => data !== null);

        return NextResponse.json({
          dataType: 'OpenWeatherMap API',
          timestamp: new Date().toISOString(),
          data: weatherData,
        });

      case 'metar':
        return NextResponse.json({
          dataType: 'METAR Weather Data',
          timestamp: new Date().toISOString(),
          data: filteredData.map(point => {
            const temp = point.metadata?.dataType === 'temperature' ? point.value : null;
            const wind = point.metadata?.dataType === 'windSpeed' ? point.value : null;
            const humidity = point.metadata?.dataType === 'humidity' ? point.value : null;

            if (temp !== null) {
              return {
                station: point.metadata?.location?.replace(/\s+/g, '').substring(0, 4).toUpperCase(),
                time: point.timestamp.toISOString().substring(11, 19) + 'Z',
                wind: wind ? `${Math.round(wind * 1.944)}KT` : '00000KT', // Convert m/s to knots
                visibility: '10SM',
                weather: 'CLR',
                temperature: `${Math.round(temp)}/${Math.round(temp - 5)}`, // Temp/Dewpoint
                pressure: 'Q1013',
                humidity: humidity ? `${Math.round(humidity)}%` : '50%',
                remarks: 'RMK',
              };
            }
            return null;
          }).filter(item => item !== null),
        });

      case 'json':
      default:
        return NextResponse.json({
          dataType: 'JSON Weather Data',
          timestamp: new Date().toISOString(),
          data: filteredData,
        });
    }

  } catch (error) {
    console.error('Weather simulation API error:', error);
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
    const { action, location, weatherData } = body;

    const simulationEngine = getSimulationEngine();
    const weatherSource = simulationEngine['dataSources'].get('weather');

    if (!weatherSource) {
      return NextResponse.json({ message: 'Weather simulation not available' }, { status: 503 });
    }

    switch (action) {
      case 'update_weather':
        if (!location || !weatherData) {
          return NextResponse.json({ message: 'location and weatherData are required' }, { status: 400 });
        }

        // Simulate updating weather conditions
        const weatherStations = weatherSource.getWeatherStations();
        const station = Array.from(weatherStations.values()).find(s => s.location === location);

        if (!station) {
          return NextResponse.json({ message: 'Weather station not found' }, { status: 404 });
        }

        // Update station data (simulated)
        if (weatherData.temperature !== undefined) station.temperature = weatherData.temperature;
        if (weatherData.humidity !== undefined) station.humidity = weatherData.humidity;
        if (weatherData.windSpeed !== undefined) station.windSpeed = weatherData.windSpeed;
        if (weatherData.pressure !== undefined) station.pressure = weatherData.pressure;
        if (weatherData.visibility !== undefined) station.visibility = weatherData.visibility;
        if (weatherData.cloudCover !== undefined) station.cloudCover = weatherData.cloudCover;
        if (weatherData.precipitation !== undefined) station.precipitation = weatherData.precipitation;
        if (weatherData.weatherCondition !== undefined) station.weatherCondition = weatherData.weatherCondition;

        station.timestamp = new Date();

        return NextResponse.json({
          message: 'Weather data updated',
          location,
          updatedData: {
            temperature: station.temperature,
            humidity: station.humidity,
            windSpeed: station.windSpeed,
            pressure: station.pressure,
            visibility: station.visibility,
            cloudCover: station.cloudCover,
            precipitation: station.precipitation,
            weatherCondition: station.weatherCondition,
          },
        });

      case 'generate_alert':
        const alert = await simulationEngine.generateAlert('weather');
        return NextResponse.json({ alert });

      case 'get_forecast':
        if (!location) {
          return NextResponse.json({ message: 'location is required' }, { status: 400 });
        }

        // Generate 5-day forecast (simulated)
        const forecast = [];
        for (let i = 0; i < 5; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);

          forecast.push({
            date: date.toISOString().split('T')[0],
            temperature: {
              min: 15 + Math.random() * 10,
              max: 25 + Math.random() * 10,
            },
            humidity: 50 + Math.random() * 30,
            windSpeed: 2 + Math.random() * 8,
            precipitation: Math.random() * 5,
            weatherCondition: ['CLEAR', 'CLOUDY', 'RAIN'][Math.floor(Math.random() * 3)],
            uvIndex: Math.floor(Math.random() * 11),
          });
        }

        return NextResponse.json({
          message: 'Weather forecast generated',
          location,
          forecast,
        });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Weather simulation API error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
