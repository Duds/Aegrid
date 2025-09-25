# External API Testing Guide

## Overview

This guide provides comprehensive instructions for testing the Aegrid platform's external API integrations. The testing framework validates real-world API connections, data integrity, and system performance.

## Prerequisites

### 1. Environment Setup

Before running tests, ensure you have the following:

- **Node.js 18+**: Required for running the test suite
- **Next.js Development Server**: Must be running (`npm run dev`)
- **Environment Variables**: Configured in `.env.local`

### 2. Environment Configuration

Copy the example environment file and configure your API keys:

```bash
cp docs/configuration/external-apis.env.example .env.local
```

Edit `.env.local` with your actual API keys:

```bash
# Weather Services
OPENWEATHERMAP_API_KEY=your_actual_api_key_here

# IoT Services
MQTT_BROKER_URL=mqtt://your-broker:1883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password

# Energy Services
OPCUA_SERVER_URL=opc.tcp://your-server:4840
OPCUA_USERNAME=your_username
OPCUA_PASSWORD=your_password

# Emergency Services
EMERGENCY_API_KEY=your_api_key_here
EMERGENCY_API_URL=https://api.emergency.gov.au
```

### 3. Required Services

For full testing, you'll need access to:

- **OpenWeatherMap API**: Free tier provides 1,000 calls/day
- **MQTT Broker**: Local or cloud-based MQTT broker
- **OPC UA Server**: Industrial automation server
- **Emergency Services API**: CAP-compatible emergency services

## Running Tests

### 1. Automated Test Suite

Run the comprehensive test suite:

```bash
# Run all external API tests
npm run test:external-apis

# Or run directly
node scripts/test-external-apis-runner.js
```

### 2. Individual Test Categories

Test specific API integrations:

```bash
# Test only weather API
npm run test:external-apis -- --filter weather

# Test only IoT API
npm run test:external-apis -- --filter iot

# Test only energy API
npm run test:external-apis -- --filter energy
```

### 3. Verbose Testing

Enable detailed output:

```bash
# Verbose mode
VERBOSE=true npm run test:external-apis

# Debug mode
DEBUG=true npm run test:external-apis
```

## Test Categories

### 1. Environment Setup Tests

Validates the testing environment:

- ✅ Environment file exists (`.env.local`)
- ✅ Required environment variables are set
- ✅ Node.js version compatibility
- ✅ Package dependencies are installed

### 2. Weather API Tests

Tests OpenWeatherMap integration:

- ✅ API key validation
- ✅ Current weather data retrieval
- ✅ Weather forecast functionality
- ✅ UV index data
- ✅ Location search
- ✅ Error handling and fallbacks

**Example Test Output:**
```
✅ Weather API Key Validation: Success (45ms)
✅ Weather API Current Weather: Success (1200ms)
✅ Weather API Forecast: Success (980ms)
✅ Weather API POST Actions: Success (750ms)
```

### 3. IoT API Tests

Tests MQTT broker integration:

- ✅ MQTT connection establishment
- ✅ Sensor registration and management
- ✅ Real-time data collection
- ✅ Command publishing
- ✅ Connection failure handling

**Example Test Output:**
```
✅ IoT API Endpoint: Success (200ms)
✅ IoT API Specific Sensor: Success (180ms)
✅ IoT API POST Actions: Success (150ms)
```

### 4. Energy API Tests

Tests OPC UA server integration:

- ✅ OPC UA connection establishment
- ✅ Energy system registration
- ✅ System monitoring and control
- ✅ Maintenance triggering
- ✅ Performance metrics

**Example Test Output:**
```
✅ Energy API Endpoint: Success (300ms)
✅ Energy API Specific System: Success (250ms)
✅ Energy API POST Actions: Success (200ms)
```

### 5. Emergency API Tests

Tests emergency services integration:

- ✅ Emergency API endpoint
- ✅ Alert data retrieval
- ✅ Resource management
- ✅ CAP protocol compliance

### 6. Control Center Integration Tests

Tests Control Center dashboard integration:

- ✅ Emergency Dashboard API
- ✅ Energy Control Dashboard API
- ✅ Performance Monitoring API
- ✅ Work Orders Management API

### 7. Simulation Engine Tests

Tests simulation engine functionality:

- ✅ Simulation engine endpoint
- ✅ Weather simulation data
- ✅ IoT simulation data
- ✅ Energy simulation data
- ✅ Emergency simulation data

### 8. Frontend Page Tests

Tests frontend page accessibility:

- ✅ Emergency Dashboard page
- ✅ Energy Control page
- ✅ Performance Monitoring page
- ✅ Work Orders page
- ✅ API Health page

## Test Results Interpretation

### Success Indicators

- **✅ PASS**: Test completed successfully
- **❌ FAIL**: Test failed with error
- **⚠️ SKIP**: Test skipped due to missing configuration

### Performance Metrics

- **Response Time**: API response time in milliseconds
- **Success Rate**: Percentage of successful requests
- **Uptime**: Service availability percentage
- **Error Rate**: Percentage of failed requests

### Sample Test Output

```
📊 Test Summary
============================================================
Total Tests: 25
✅ Passed: 22
❌ Failed: 2
⚠️ Skipped: 1
⏱️ Total Duration: 15420ms
============================================================

🔍 Weather API Results:
  ✅ Weather API Key Validation: Success (45ms)
  ✅ Weather API Current Weather: Success (1200ms)
  ✅ Weather API Forecast: Success (980ms)
  ❌ Weather API POST Actions: HTTP 429: Too Many Requests (750ms)

🔍 IoT API Results:
  ✅ IoT API Endpoint: Success (200ms)
  ✅ IoT API Specific Sensor: Success (180ms)
  ✅ IoT API POST Actions: Success (150ms)

🔍 Energy API Results:
  ✅ Energy API Endpoint: Success (300ms)
  ✅ Energy API Specific System: Success (250ms)
  ✅ Energy API POST Actions: Success (200ms)
```

## Troubleshooting

### Common Issues

#### 1. API Key Errors

**Problem**: `Invalid API key` errors

**Solution**:
```bash
# Check API key in .env.local
cat .env.local | grep OPENWEATHERMAP_API_KEY

# Verify API key is valid
curl "https://api.openweathermap.org/data/2.5/weather?lat=-33.8688&lon=151.2093&appid=YOUR_API_KEY"
```

#### 2. Connection Timeouts

**Problem**: `Connection timeout` errors

**Solution**:
```bash
# Check network connectivity
ping api.openweathermap.org

# Test MQTT broker connectivity
telnet your-mqtt-broker 1883

# Test OPC UA server connectivity
telnet your-opcua-server 4840
```

#### 3. Rate Limit Exceeded

**Problem**: `Rate limit exceeded` errors

**Solution**:
- Wait for rate limit reset (usually 1 minute)
- Implement exponential backoff
- Use caching to reduce API calls
- Upgrade to higher API tier if needed

#### 4. Service Unavailable

**Problem**: `Service unavailable` errors

**Solution**:
- Check service status pages
- Verify service endpoints are correct
- Test with fallback simulation data
- Contact service providers for support

### Debug Mode

Enable debug mode for detailed troubleshooting:

```bash
DEBUG=true npm run test:external-apis
```

This will show:
- Detailed API request/response data
- Connection status information
- Error stack traces
- Performance metrics

## Manual Testing

### 1. API Endpoint Testing

Test individual API endpoints manually:

```bash
# Test weather API
curl "http://localhost:3000/api/external/weather?location=Sydney"

# Test IoT API
curl "http://localhost:3000/api/external/iot"

# Test energy API
curl "http://localhost:3000/api/external/energy"

# Test emergency API
curl "http://localhost:3000/api/external/emergency"
```

### 2. Frontend Testing

Test frontend pages manually:

```bash
# Open browser and navigate to:
http://localhost:3000/manager/emergency
http://localhost:3000/manager/energy-control
http://localhost:3000/manager/performance
http://localhost:3000/manager/work-orders
http://localhost:3000/manager/api-health
```

### 3. Health Check Testing

Test API health endpoints:

```bash
# Test health check endpoints
curl "http://localhost:3000/api/external/weather?health=true"
curl "http://localhost:3000/api/external/iot?health=true"
curl "http://localhost:3000/api/external/energy?health=true"
curl "http://localhost:3000/api/external/emergency?health=true"
```

## Performance Testing

### 1. Load Testing

Test API performance under load:

```bash
# Install artillery for load testing
npm install -g artillery

# Run load test
artillery run scripts/load-test-config.yml
```

### 2. Stress Testing

Test API resilience under stress:

```bash
# Run stress test
node scripts/stress-test.js
```

### 3. Monitoring

Monitor API performance in real-time:

```bash
# Start monitoring
node scripts/api-monitor.js
```

## Continuous Integration

### 1. GitHub Actions

Add external API testing to CI/CD pipeline:

```yaml
name: External API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:external-apis
        env:
          OPENWEATHERMAP_API_KEY: ${{ secrets.OPENWEATHERMAP_API_KEY }}
          MQTT_BROKER_URL: ${{ secrets.MQTT_BROKER_URL }}
          OPCUA_SERVER_URL: ${{ secrets.OPCUA_SERVER_URL }}
          EMERGENCY_API_KEY: ${{ secrets.EMERGENCY_API_KEY }}
```

### 2. Scheduled Testing

Run tests on a schedule:

```yaml
name: Scheduled API Tests
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
```

## Best Practices

### 1. Test Data Management

- Use realistic test data
- Avoid hardcoded values
- Implement data cleanup
- Use environment-specific test data

### 2. Error Handling

- Test error scenarios
- Validate error messages
- Test fallback mechanisms
- Implement retry logic

### 3. Security Testing

- Test API key validation
- Validate input sanitization
- Test rate limiting
- Check for data leaks

### 4. Performance Testing

- Monitor response times
- Test under load
- Validate caching
- Check memory usage

## Support

### 1. Documentation

- [External API Integration Guide](docs/integration/external-apis-guide.md)
- [API Reference Documentation](docs/api-reference/)
- [Troubleshooting Guide](docs/troubleshooting/)

### 2. Community

- GitHub Issues: Report bugs and feature requests
- Discord Community: Real-time support
- Stack Overflow: Tag questions with `aegrid`

### 3. Professional Support

- Enterprise Support: Priority support for enterprise customers
- Custom Integrations: Tailored solutions
- Training & Consulting: Implementation guidance
- SLA Guarantees: Service level agreements

## Conclusion

The external API testing framework provides comprehensive validation of the Aegrid platform's integrations with real-world services. By following this guide, you can ensure that your external API integrations are working correctly and performing optimally.

For additional support or questions, please refer to the documentation or contact the development team.


