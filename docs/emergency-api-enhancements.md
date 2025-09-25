# Emergency API Enhancements

## Overview

This document outlines the comprehensive enhancements made to the Emergency API system, including improved error handling, additional data formats, comprehensive monitoring, and robust testing capabilities.

## ✅ Completed Enhancements

### A) Test Scripts with Authentication

**Files Created:**
- `scripts/test-emergency-apis.ts` - TypeScript test suite with full authentication
- `scripts/test-emergency-apis.sh` - Shell script for quick testing
- `scripts/test-emergency-comprehensive.sh` - Comprehensive test suite

**Features:**
- Full authentication flow testing
- Multiple format validation
- Error scenario testing
- Performance monitoring
- Automated test reporting

**Usage:**
```bash
# Quick test
./scripts/test-emergency-apis.sh

# Comprehensive test
./scripts/test-emergency-comprehensive.sh

# TypeScript test suite
npm run test:emergency-apis
```

### B) Enhanced Error Handling

**Files Created:**
- `lib/emergency-error-handler.ts` - Comprehensive error handling system

**Features:**
- Custom `EmergencyError` class with structured error information
- 19 predefined error codes for different scenarios
- Rate limiting with configurable thresholds
- Input validation helpers
- Public vs. private error messages
- Comprehensive logging with context
- Integration with external monitoring services

**Error Types Covered:**
- Authentication & Authorization errors
- Data validation errors
- Resource management errors
- System errors
- Emergency-specific errors

**Example Usage:**
```typescript
throw new EmergencyError(
  'Invalid emergency severity level',
  EmergencyErrorCodes.INVALID_SEVERITY,
  400,
  { severity, validSeverities: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
  organisationId,
  userId
);
```

### C) Additional Data Formats

**Files Created:**
- `lib/emergency-formatters.ts` - Multi-format data formatter

**Supported Formats:**
1. **JSON** - Standard JSON format
2. **XML** - Industry-standard XML with proper escaping
3. **CSV** - Comma-separated values for data analysis
4. **YAML** - Human-readable YAML format
5. **GeoJSON** - Geographic data format for mapping
6. **CAP** - Common Alerting Protocol (emergency standard)
7. **EAS** - Emergency Alert System format

**Features:**
- Automatic content-type detection
- Format validation
- Proper XML escaping
- GeoJSON coordinate support
- CAP/EAS protocol compliance
- Australian English formatting

**Example Usage:**
```typescript
const formattedData = EmergencyDataFormatter.format(emergencyData, 'yaml');
const contentType = EmergencyDataFormatter.getContentType('yaml');
```

### D) Logging and Monitoring

**Files Created:**
- `lib/emergency-monitoring.ts` - Comprehensive monitoring system
- `app/api/emergency/health/route.ts` - Health check endpoint

**Monitoring Features:**
- Real-time performance metrics
- Response time tracking (P50, P95, P99)
- Error rate monitoring
- Usage statistics by endpoint
- Organisation and user analytics
- Format usage tracking
- Hourly distribution analysis
- Health status indicators

**Health Check Features:**
- Database connectivity testing
- Simulation engine status
- External API availability
- Detailed health reports
- YAML health output
- Metrics reset capability

**Example Health Check Response:**
```json
{
  "status": "healthy",
  "uptime": 3600000,
  "errorRate": 0.02,
  "responseTime": {
    "p50": 150,
    "p95": 300,
    "p99": 500
  },
  "checks": {
    "database": true,
    "simulation": true,
    "external": true
  }
}
```

## 🔧 Updated API Endpoints

### Control Center Emergency API (`/api/control-center/emergency`)
- ✅ Enhanced error handling with structured errors
- ✅ Rate limiting (200 requests/minute for GET, 10/minute for POST)
- ✅ Input validation for severity levels
- ✅ Comprehensive logging and monitoring
- ✅ Performance metrics tracking

### Simulation Emergency API (`/api/simulation/emergency`)
- ✅ Fixed 503 errors by registering emergency data source
- ✅ Support for JSON, CAP, and EAS formats
- ✅ Enhanced error handling
- ✅ Monitoring integration

### External Emergency API (`/api/external/emergency`)
- ✅ Created missing endpoint (was returning 404)
- ✅ Support for all 7 data formats
- ✅ Enhanced error handling with validation
- ✅ Rate limiting (100 GET/minute, 20 POST/minute)
- ✅ Comprehensive monitoring
- ✅ Proper content-type headers

### Health Check API (`/api/emergency/health`)
- ✅ New comprehensive health monitoring endpoint
- ✅ Support for JSON and YAML formats
- ✅ Detailed system status reporting
- ✅ Performance metrics
- ✅ Component health checks

## 📊 Monitoring and Analytics

### Real-time Metrics
- Request/response times
- Error rates by endpoint
- Usage patterns by organisation
- Format preferences
- Peak usage hours

### Health Monitoring
- System uptime tracking
- Component availability
- Performance degradation alerts
- Error trend analysis

### Usage Analytics
- Unique organisations and users
- Most popular endpoints
- Format usage distribution
- Geographic usage patterns (when coordinates available)

## 🧪 Testing Coverage

### Test Scenarios
1. **Authentication Testing**
   - Valid credentials
   - Invalid credentials
   - Session management

2. **Format Testing**
   - All 7 supported formats
   - Invalid format handling
   - Content-type validation

3. **Error Testing**
   - Missing parameters
   - Invalid data
   - Rate limiting
   - Authentication failures

4. **Performance Testing**
   - Response time measurement
   - Concurrent request handling
   - Memory usage monitoring

5. **Integration Testing**
   - Database connectivity
   - Simulation engine integration
   - External API availability

## 🚀 Performance Improvements

### Response Time Optimizations
- Efficient data formatting
- Optimized database queries
- Reduced memory allocations
- Cached validation rules

### Rate Limiting
- Per-organisation limits
- Per-user limits for sensitive operations
- Configurable thresholds
- Graceful degradation

### Error Handling
- Fast-fail validation
- Structured error responses
- Minimal overhead logging
- Efficient error context capture

## 🔒 Security Enhancements

### Authentication
- Proper session validation
- Role-based access control
- Organisation-scoped data access

### Input Validation
- Comprehensive field validation
- SQL injection prevention
- XSS protection
- CSRF protection

### Rate Limiting
- Prevents abuse
- Protects against DoS attacks
- Configurable per endpoint

## 📈 Scalability Features

### Monitoring Integration
- External monitoring service support
- Configurable endpoints
- Batch metric sending
- Error aggregation

### Performance Tracking
- Response time percentiles
- Error rate trends
- Usage pattern analysis
- Capacity planning data

## 🛠️ Configuration

### Environment Variables
```bash
# Monitoring
EMERGENCY_MONITORING_ENDPOINT=https://monitoring.service.com/metrics
EMERGENCY_LOG_ENDPOINT=https://logging.service.com/logs
EMERGENCY_DEBUG_MODE=true

# Rate Limiting
EMERGENCY_RATE_LIMIT_DEFAULT=100
EMERGENCY_RATE_LIMIT_WINDOW=60000

# Testing
TEST_BASE_URL=http://localhost:3000
TEST_USER_EMAIL=test@greenfieldshire.council
TEST_USER_PASSWORD=testpassword123
```

## 📚 Usage Examples

### Testing the APIs
```bash
# Quick health check
curl http://localhost:3000/api/emergency/health

# Get emergency data in YAML format
curl "http://localhost:3000/api/external/emergency?external=true&format=yaml"

# Get emergency data in GeoJSON format
curl "http://localhost:3000/api/external/emergency?external=true&format=geojson"

# Create emergency alert
curl -X POST http://localhost:3000/api/control-center/emergency \
  -H "Content-Type: application/json" \
  -d '{"alertType":"EQUIPMENT_FAILURE","severity":"HIGH","title":"Test","description":"Test alert"}'
```

### Monitoring Integration
```typescript
// Get health status
const health = await fetch('/api/emergency/health?detailed=true');
const status = await health.json();

// Monitor performance
const monitor = EmergencyAPIMonitor.getInstance();
const metrics = monitor.getRecentMetrics(100);
```

## 🎯 Benefits

1. **Reliability**: Comprehensive error handling prevents system failures
2. **Flexibility**: Multiple data formats support various integration needs
3. **Observability**: Detailed monitoring enables proactive issue detection
4. **Performance**: Optimized response times and efficient resource usage
5. **Security**: Enhanced authentication and rate limiting protect against abuse
6. **Maintainability**: Structured code and comprehensive testing enable easy updates
7. **Compliance**: Industry-standard formats (CAP, EAS) ensure interoperability

## 🔄 Future Enhancements

1. **Real-time Notifications**: WebSocket support for live emergency updates
2. **Advanced Analytics**: Machine learning for predictive emergency detection
3. **Multi-language Support**: Internationalisation for global deployments
4. **Caching Layer**: Redis integration for improved performance
5. **GraphQL API**: Alternative query interface for complex data needs
6. **Mobile SDK**: Native mobile app integration support

---

*This document reflects the current state of Emergency API enhancements as of the latest update. For the most current information, refer to the source code and test scripts.*
