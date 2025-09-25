# External API Integration Guide

## Overview

The Aegrid platform integrates with external APIs to provide real-time data from weather services, IoT platforms, energy systems, and emergency services. This integration layer provides seamless fallback to simulation data when external services are unavailable.

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   External API   │    │   External      │
│   Components    │◄──►│   Endpoints      │◄──►│   Services      │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   Simulation     │
                       │   Engine         │
                       │   (Fallback)     │
                       └──────────────────┘
```

## Supported External Services

### 1. Weather Services

#### OpenWeatherMap API
- **Endpoint**: `/api/external/weather`
- **Features**: Current weather, 5-day forecast, UV index, location search
- **Rate Limits**: **Heavy rate limiting - 1 call per 15 minutes per location**
- **Configuration**: `OPENWEATHERMAP_API_KEY`
- **Rate Limiting**: Persistent storage maintains rate limit state across restarts

**Example Usage**:
```typescript
// Get current weather for Sydney
const response = await fetch('/api/external/weather?location=Sydney');
const weatherData = await response.json();

// Get 5-day forecast
const forecast = await fetch('/api/external/weather?forecast=true&location=Melbourne');

// Get rate limit status
const rateLimitStatus = await fetch('/api/external/weather', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'get_rate_limit_status' })
});

// Reset rate limit for a location (admin only)
const resetResponse = await fetch('/api/external/weather', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ action: 'reset_rate_limit', location: 'Sydney' })
});
```

#### Supported Weather Data
- Temperature (°C)
- Humidity (%)
- Pressure (hPa)
- Wind Speed (m/s)
- Wind Direction (degrees)
- Visibility (km)
- Cloud Cover (%)
- Precipitation (mm/h)
- UV Index

#### Rate Limiting Implementation

The weather API implements heavy rate limiting to ensure minimal external API usage:

- **Interval**: 15 minutes per location
- **Limit**: 1 call per location per interval
- **Storage**: Persistent JSON file in `/data/weather-rate-limits.json`
- **Scope**: Per-location tracking using coordinates as keys
- **Fallback**: Automatic fallback to simulation data when rate limited

**Rate Limit Response Format**:
```json
{
  "rateLimitStatus": [
    {
      "location": "Sydney",
      "canCall": false,
      "timeUntilNextCall": 450000,
      "callsRemaining": 0,
      "resetTime": 1703123456789
    }
  ],
  "rateLimitInfo": {
    "maxCallsPerInterval": 1,
    "intervalMinutes": 15,
    "description": "Weather API calls are limited to once every 15 minutes per location"
  }
}
```

**Error Handling**:
- Rate limit exceeded errors include time until next call is allowed
- Automatic fallback to simulation data when external API is unavailable
- Clear error messages with human-readable time formatting
- Weather Conditions

### 2. IoT Services

#### MQTT Broker Integration
- **Endpoint**: `/api/external/iot`
- **Features**: Real-time sensor data, sensor management, command publishing
- **Protocols**: MQTT 3.1.1, MQTT 5.0
- **Configuration**: `MQTT_BROKER_URL`, `MQTT_USERNAME`, `MQTT_PASSWORD`

**Example Usage**:
```typescript
// Get all sensor data
const response = await fetch('/api/external/iot');
const sensorData = await response.json();

// Get specific sensor data
const sensor = await fetch('/api/external/iot?sensorId=temp-sensor-001');

// Send command to sensor
await fetch('/api/external/iot', {
  method: 'POST',
  body: JSON.stringify({
    action: 'send_command',
    sensorId: 'temp-sensor-001',
    command: 'calibrate',
    payload: { temperature: 25.0 }
  })
});
```

#### Supported Sensor Types
- Temperature (°C)
- Humidity (%)
- Pressure (hPa)
- Vibration (mm/s)
- Air Quality (AQI)
- Motion (binary)
- Light (lux)

### 3. Energy Services

#### OPC UA Server Integration
- **Endpoint**: `/api/external/energy`
- **Features**: Energy system monitoring, output control, maintenance triggers
- **Protocols**: OPC UA 1.04, OPC UA 1.05
- **Configuration**: `OPCUA_SERVER_URL`, `OPCUA_USERNAME`, `OPCUA_PASSWORD`

**Example Usage**:
```typescript
// Get all energy systems
const response = await fetch('/api/external/energy');
const energyData = await response.json();

// Control energy system output
await fetch('/api/external/energy', {
  method: 'POST',
  body: JSON.stringify({
    action: 'set_output',
    systemId: 'solar-array-east',
    output: 4500
  })
});

// Trigger maintenance
await fetch('/api/external/energy', {
  method: 'POST',
  body: JSON.stringify({
    action: 'trigger_maintenance',
    systemId: 'wind-turbine-north'
  })
});
```

#### Supported Energy Systems
- Solar Arrays
- Wind Turbines
- Battery Storage
- Diesel Generators
- Grid Connections

### 4. Emergency Services

#### CAP (Common Alerting Protocol) Integration
- **Endpoint**: `/api/external/emergency`
- **Features**: Emergency alerts, resource management, incident tracking
- **Standards**: CAP 1.2, EAS, ICS
- **Configuration**: `EMERGENCY_API_KEY`, `EMERGENCY_API_URL`

## Configuration

### Environment Variables

Copy `docs/configuration/external-apis.env.example` to `.env.local` and configure:

```bash
# Weather Services
OPENWEATHERMAP_API_KEY=your_api_key_here

# IoT Services
MQTT_BROKER_URL=mqtt://localhost:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password

# Energy Services
OPCUA_SERVER_URL=opc.tcp://localhost:4840
OPCUA_USERNAME=your_username
OPCUA_PASSWORD=your_password

# Emergency Services
EMERGENCY_API_KEY=your_api_key_here
EMERGENCY_API_URL=https://api.emergency.gov.au
```

### API Client Configuration

```typescript
// Weather Client
const weatherClient = new OpenWeatherMapClient(process.env.OPENWEATHERMAP_API_KEY);

// IoT Client
const mqttClient = new MQTTIoTClient({
  brokerUrl: process.env.MQTT_BROKER_URL,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

// Energy Client
const opcuaClient = new OPCUAEnergyClient({
  serverUrl: process.env.OPCUA_SERVER_URL,
  username: process.env.OPCUA_USERNAME,
  password: process.env.OPCUA_PASSWORD,
});
```

## Error Handling & Fallbacks

### Automatic Fallback Strategy

1. **Primary**: External API service
2. **Secondary**: Simulation engine
3. **Tertiary**: Cached data
4. **Final**: Error response with helpful message

### Error Types

- **Connection Errors**: Network timeouts, connection refused
- **Authentication Errors**: Invalid API keys, expired tokens
- **Rate Limit Errors**: Too many requests, quota exceeded
- **Data Errors**: Invalid response format, missing data
- **Service Errors**: External service unavailable

### Retry Logic

```typescript
// Automatic retry with exponential backoff
const retryConfig = {
  attempts: 3,
  delay: 1000,
  backoff: 2,
  maxDelay: 10000
};
```

## Monitoring & Health Checks

### Health Check Endpoints

```typescript
// Check external API status
GET /api/external/weather?health=true
GET /api/external/iot?health=true
GET /api/external/energy?health=true
GET /api/external/emergency?health=true
```

### Connection Status

```typescript
// Get connection status for all services
const status = await fetch('/api/external/status');
const connectionStatus = await status.json();

// Response format
{
  "weather": { "connected": true, "lastUpdate": "2024-01-15T10:30:00Z" },
  "iot": { "connected": true, "sensors": 15, "lastUpdate": "2024-01-15T10:29:45Z" },
  "energy": { "connected": false, "reconnectAttempts": 3 },
  "emergency": { "connected": true, "alerts": 0 }
}
```

## Security Considerations

### API Key Management
- Store API keys in environment variables
- Use different keys for development/production
- Rotate keys regularly
- Monitor key usage

### Data Privacy
- Filter personally identifiable information
- Encrypt sensitive data in transit
- Log access for auditing
- Comply with data retention policies

### Rate Limiting
- Implement client-side rate limiting
- Monitor API usage quotas
- Implement circuit breakers
- Use caching to reduce API calls

## Performance Optimization

### Caching Strategy
- Cache frequently accessed data
- Implement TTL-based expiration
- Use Redis for distributed caching
- Cache at multiple levels (API, database, frontend)

### Connection Pooling
- Reuse HTTP connections
- Implement connection pooling
- Monitor connection health
- Handle connection failures gracefully

### Data Compression
- Use gzip compression for API responses
- Minimize payload sizes
- Implement data pagination
- Use efficient data formats (JSON, MessagePack)

## Troubleshooting

### Common Issues

#### 1. API Key Invalid
```bash
Error: Invalid API key
Solution: Verify API key in environment variables
```

#### 2. Rate Limit Exceeded
```bash
Error: Rate limit exceeded
Solution: Implement exponential backoff, increase cache TTL
```

#### 3. Connection Timeout
```bash
Error: Connection timeout
Solution: Check network connectivity, increase timeout values
```

#### 4. Data Format Mismatch
```bash
Error: Invalid response format
Solution: Update data parsing logic, check API version
```

### Debug Mode

Enable debug logging:
```bash
EXTERNAL_API_LOG_LEVEL=debug
EXTERNAL_API_DEV_MODE=true
```

### Monitoring Tools

- **API Health Dashboard**: Real-time status monitoring
- **Error Tracking**: Centralized error logging
- **Performance Metrics**: Response times, success rates
- **Usage Analytics**: API call patterns, data volumes

## Best Practices

### 1. Error Handling
- Always implement fallback mechanisms
- Log errors for debugging
- Provide user-friendly error messages
- Implement circuit breakers

### 2. Data Validation
- Validate all incoming data
- Sanitize user inputs
- Check data types and ranges
- Handle missing fields gracefully

### 3. Performance
- Implement caching strategies
- Use connection pooling
- Monitor API quotas
- Optimize data transfer

### 4. Security
- Secure API key storage
- Implement proper authentication
- Monitor for suspicious activity
- Regular security audits

### 5. Monitoring
- Track API health continuously
- Monitor error rates
- Set up alerts for failures
- Regular performance reviews

## Integration Examples

### Frontend Integration

```typescript
// Weather data in React component
const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch('/api/external/weather?location=Sydney');
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        console.error('Failed to fetch weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading weather data...</div>;
  if (!weatherData) return <div>Weather data unavailable</div>;

  return (
    <div>
      <h2>Weather: {weatherData.data.location}</h2>
      <p>Temperature: {weatherData.data.temperature}°C</p>
      <p>Humidity: {weatherData.data.humidity}%</p>
      <p>Source: {weatherData.dataSource}</p>
    </div>
  );
};
```

### Backend Integration

```typescript
// Custom API endpoint using external services
export async function GET(request: NextRequest) {
  try {
    // Get weather data
    const weatherResponse = await fetch('/api/external/weather');
    const weatherData = await weatherResponse.json();

    // Get IoT sensor data
    const iotResponse = await fetch('/api/external/iot');
    const iotData = await iotResponse.json();

    // Combine data
    const combinedData = {
      weather: weatherData.data,
      sensors: iotData.data,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(combinedData);
  } catch (error) {
    console.error('Failed to fetch external data:', error);
    return NextResponse.json({ error: 'External data unavailable' }, { status: 503 });
  }
}
```

## Support & Resources

### Documentation Links
- [OpenWeatherMap API](https://openweathermap.org/api)
- [MQTT Protocol](https://mqtt.org/)
- [OPC UA Specification](https://opcfoundation.org/about/opc-technologies/opc-ua/)
- [CAP Standard](https://www.oasis-open.org/committees/tc_home.php?wg_abbrev=emergency)

### Community Support
- GitHub Issues: Report bugs and feature requests
- Discord Community: Real-time support and discussions
- Documentation Wiki: Community-maintained guides
- Stack Overflow: Tag questions with `aegrid`

### Professional Support
- Enterprise Support: Priority support for enterprise customers
- Custom Integrations: Tailored solutions for specific needs
- Training & Consulting: Implementation guidance and best practices
- SLA Guarantees: Service level agreements for critical systems
