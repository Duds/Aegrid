#!/usr/bin/env node

/**
 * External API Test Runner
 *
 * Comprehensive test runner for external API integrations.
 * Tests real-world API connections and validates data integrity.
 *
 * Usage:
 *   npm run test:external-apis
 *   node scripts/test-external-apis-runner.js
 *
 * @fileoverview External API test runner with comprehensive validation
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds
  retries: 3,
  parallel: true,
  verbose: process.env.VERBOSE === 'true',
  debug: process.env.DEBUG === 'true',
};

// Test results tracking
class TestRunner {
  constructor() {
    this.results = [];
    this.startTime = Date.now();
    this.totalTests = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.skippedTests = 0;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      debug: '🔍',
    }[type];

    if (TEST_CONFIG.verbose || type === 'error' || type === 'success') {
      console.log(`${prefix} [${timestamp}] ${message}`);
    }
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    const startTime = Date.now();

    try {
      this.log(`Running test: ${testName}`, 'info');
      const result = await testFunction();
      const duration = Date.now() - startTime;

      this.results.push({
        name: testName,
        status: 'PASS',
        duration,
        result,
      });

      this.passedTests++;
      this.log(`Test passed: ${testName} (${duration}ms)`, 'success');
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      this.results.push({
        name: testName,
        status: 'FAIL',
        duration,
        error: errorMessage,
      });

      this.failedTests++;
      this.log(`Test failed: ${testName} - ${errorMessage}`, 'error');
      return null;
    }
  }

  async skipTest(testName, reason) {
    this.totalTests++;
    this.skippedTests++;

    this.results.push({
      name: testName,
      status: 'SKIP',
      duration: 0,
      reason,
    });

    this.log(`Test skipped: ${testName} - ${reason}`, 'warning');
  }

  async testEnvironmentSetup() {
    this.log('🔧 Testing Environment Setup', 'info');

    // Check if .env.local exists
    await this.runTest('Environment File Check', async () => {
      const envPath = path.join(process.cwd(), '.env.local');
      if (!fs.existsSync(envPath)) {
        throw new Error('.env.local file not found. Please copy docs/configuration/external-apis.env.example to .env.local');
      }
      return { envFile: 'exists' };
    });

    // Check if required environment variables are set
    await this.runTest('Environment Variables Check', async () => {
      const requiredVars = [
        'OPENWEATHERMAP_API_KEY',
        'MQTT_BROKER_URL',
        'OPCUA_SERVER_URL',
        'EMERGENCY_API_KEY',
      ];

      const missingVars = requiredVars.filter(varName => !process.env[varName]);

      if (missingVars.length > 0) {
        throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
      }

      return {
        requiredVars: requiredVars.length,
        missingVars: missingVars.length,
      };
    });

    // Check if Node.js version is compatible
    await this.runTest('Node.js Version Check', async () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

      if (majorVersion < 18) {
        throw new Error(`Node.js version ${nodeVersion} is not supported. Please use Node.js 18 or higher.`);
      }

      return { nodeVersion, majorVersion };
    });

    // Check if required packages are installed
    await this.runTest('Package Dependencies Check', async () => {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (!fs.existsSync(packageJsonPath)) {
        throw new Error('package.json not found');
      }

      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const requiredDeps = ['next', 'react', 'typescript'];

      const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);

      if (missingDeps.length > 0) {
        throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
      }

      return {
        dependencies: Object.keys(packageJson.dependencies).length,
        missingDeps: missingDeps.length,
      };
    });
  }

  async testWeatherAPI() {
    this.log('🌤️ Testing Weather API Integration', 'info');

    if (!process.env.OPENWEATHERMAP_API_KEY) {
      await this.skipTest('Weather API Key Validation', 'No API key provided');
      return;
    }

    // Test API key validation
    await this.runTest('Weather API Key Validation', async () => {
      if (!process.env.OPENWEATHERMAP_API_KEY) {
        throw new Error('No API key provided');
      }
      return { apiKey: process.env.OPENWEATHERMAP_API_KEY.substring(0, 8) + '...' };
    });

    // Test current weather endpoint
    await this.runTest('Weather API Current Weather', async () => {
      const response = await fetch('http://localhost:3000/api/external/weather?location=Sydney');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.dataSource || !data.timestamp) {
        throw new Error('Invalid API response structure');
      }

      return {
        status: response.status,
        dataSource: data.dataSource,
        timestamp: data.timestamp,
      };
    });

    // Test weather forecast endpoint
    await this.runTest('Weather API Forecast', async () => {
      const response = await fetch('http://localhost:3000/api/external/weather?forecast=true&location=Melbourne');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.dataSource) {
        throw new Error('Invalid forecast response structure');
      }

      return {
        status: response.status,
        dataSource: data.dataSource,
        hasForecast: !!data.data.forecasts,
      };
    });

    // Test weather API POST endpoint
    await this.runTest('Weather API POST Actions', async () => {
      const response = await fetch('http://localhost:3000/api/external/weather', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'search_location',
          location: 'Brisbane',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.locations) {
        throw new Error('Invalid location search response');
      }

      return {
        status: response.status,
        locationsFound: data.locations.length,
      };
    });
  }

  async testIoTAPI() {
    this.log('📡 Testing IoT API Integration', 'info');

    // Test IoT API endpoint
    await this.runTest('IoT API Endpoint', async () => {
      const response = await fetch('http://localhost:3000/api/external/iot');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.dataSource || !data.timestamp) {
        throw new Error('Invalid IoT API response structure');
      }

      return {
        status: response.status,
        dataSource: data.dataSource,
        timestamp: data.timestamp,
      };
    });

    // Test IoT API with specific sensor
    await this.runTest('IoT API Specific Sensor', async () => {
      const response = await fetch('http://localhost:3000/api/external/iot?sensorId=temp-sensor-001');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.dataSource) {
        throw new Error('Invalid sensor-specific response structure');
      }

      return {
        status: response.status,
        dataSource: data.dataSource,
        hasSensorData: !!data.data.sensor,
      };
    });

    // Test IoT API POST actions
    await this.runTest('IoT API POST Actions', async () => {
      const response = await fetch('http://localhost:3000/api/external/iot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_connection_status',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.connectionStatus) {
        throw new Error('Invalid connection status response');
      }

      return {
        status: response.status,
        connected: data.connectionStatus.connected,
        reconnectAttempts: data.connectionStatus.reconnectAttempts,
      };
    });
  }

  async testEnergyAPI() {
    this.log('⚡ Testing Energy API Integration', 'info');

    // Test Energy API endpoint
    await this.runTest('Energy API Endpoint', async () => {
      const response = await fetch('http://localhost:3000/api/external/energy');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.dataSource || !data.timestamp) {
        throw new Error('Invalid Energy API response structure');
      }

      return {
        status: response.status,
        dataSource: data.dataSource,
        timestamp: data.timestamp,
      };
    });

    // Test Energy API with specific system
    await this.runTest('Energy API Specific System', async () => {
      const response = await fetch('http://localhost:3000/api/external/energy?systemId=solar-array-east');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.dataSource) {
        throw new Error('Invalid system-specific response structure');
      }

      return {
        status: response.status,
        dataSource: data.dataSource,
        hasSystemData: !!data.data.system,
      };
    });

    // Test Energy API POST actions
    await this.runTest('Energy API POST Actions', async () => {
      const response = await fetch('http://localhost:3000/api/external/energy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_connection_status',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.connectionStatus) {
        throw new Error('Invalid connection status response');
      }

      return {
        status: response.status,
        connected: data.connectionStatus.connected,
        reconnectAttempts: data.connectionStatus.reconnectAttempts,
      };
    });
  }

  async testEmergencyAPI() {
    this.log('🚨 Testing Emergency API Integration', 'info');

    // Test Emergency API endpoint
    await this.runTest('Emergency API Endpoint', async () => {
      const response = await fetch('http://localhost:3000/api/external/emergency');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.dataSource || !data.timestamp) {
        throw new Error('Invalid Emergency API response structure');
      }

      return {
        status: response.status,
        dataSource: data.dataSource,
        timestamp: data.timestamp,
      };
    });
  }

  async testControlCenterIntegration() {
    this.log('🎛️ Testing Control Center Integration', 'info');

    // Test Emergency Dashboard
    await this.runTest('Emergency Dashboard Integration', async () => {
      const response = await fetch('http://localhost:3000/api/control-center/emergency');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.criticalAlerts || !data.emergencyResources) {
        throw new Error('Invalid emergency dashboard response structure');
      }

      return {
        status: response.status,
        alertsCount: data.criticalAlerts.length,
        resourcesCount: data.emergencyResources.length,
      };
    });

    // Test Energy Control Dashboard
    await this.runTest('Energy Control Dashboard Integration', async () => {
      const response = await fetch('http://localhost:3000/api/control-center/energy');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.energySystems) {
        throw new Error('Invalid energy control dashboard response structure');
      }

      return {
        status: response.status,
        systemsCount: data.energySystems.length,
      };
    });

    // Test Performance Monitoring
    await this.runTest('Performance Monitoring Integration', async () => {
      const response = await fetch('http://localhost:3000/api/control-center/performance');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.performanceMetrics || !data.alerts) {
        throw new Error('Invalid performance monitoring response structure');
      }

      return {
        status: response.status,
        metricsCount: data.performanceMetrics.length,
        alertsCount: data.alerts.length,
      };
    });

    // Test Work Orders Management
    await this.runTest('Work Orders Management Integration', async () => {
      const response = await fetch('http://localhost:3000/api/control-center/work-orders');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.workOrders) {
        throw new Error('Invalid work orders management response structure');
      }

      return {
        status: response.status,
        workOrdersCount: data.workOrders.length,
      };
    });
  }

  async testSimulationEngine() {
    this.log('🎮 Testing Simulation Engine', 'info');

    // Test Simulation Engine endpoint
    await this.runTest('Simulation Engine Endpoint', async () => {
      const response = await fetch('http://localhost:3000/api/simulation');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.data || !data.timestamp) {
        throw new Error('Invalid simulation engine response structure');
      }

      return {
        status: response.status,
        timestamp: data.timestamp,
        dataSources: Object.keys(data.data).length,
      };
    });

    // Test individual simulation endpoints
    const simulationEndpoints = ['weather', 'iot', 'energy', 'emergency'];

    for (const endpoint of simulationEndpoints) {
      await this.runTest(`Simulation Engine - ${endpoint}`, async () => {
        const response = await fetch(`http://localhost:3000/api/simulation/${endpoint}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.data || !data.timestamp) {
          throw new Error(`Invalid ${endpoint} simulation response structure`);
        }

        return {
          status: response.status,
          endpoint,
          timestamp: data.timestamp,
          dataAvailable: !!data.data,
        };
      });
    }
  }

  async testFrontendPages() {
    this.log('🖥️ Testing Frontend Pages', 'info');

    const pages = [
      { name: 'Emergency Dashboard', path: '/manager/emergency' },
      { name: 'Energy Control', path: '/manager/energy-control' },
      { name: 'Performance Monitoring', path: '/manager/performance' },
      { name: 'Work Orders', path: '/manager/work-orders' },
      { name: 'API Health', path: '/manager/api-health' },
    ];

    for (const page of pages) {
      await this.runTest(`Frontend Page - ${page.name}`, async () => {
        const response = await fetch(`http://localhost:3000${page.path}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();

        if (!html.includes('<!DOCTYPE html>')) {
          throw new Error('Invalid HTML response');
        }

        return {
          status: response.status,
          path: page.path,
          htmlLength: html.length,
        };
      });
    }
  }

  async runAllTests() {
    this.log('🚀 Starting External API Test Suite', 'info');
    this.log(`Test started at: ${new Date().toISOString()}`, 'info');

    try {
      await this.testEnvironmentSetup();
      await this.testWeatherAPI();
      await this.testIoTAPI();
      await this.testEnergyAPI();
      await this.testEmergencyAPI();
      await this.testControlCenterIntegration();
      await this.testSimulationEngine();
      await this.testFrontendPages();
    } catch (error) {
      this.log(`Test suite failed: ${error}`, 'error');
    }

    this.printSummary();
  }

  printSummary() {
    const totalDuration = Date.now() - this.startTime;

    this.log('\n📊 Test Summary', 'info');
    this.log('='.repeat(60), 'info');
    this.log(`Total Tests: ${this.totalTests}`, 'info');
    this.log(`✅ Passed: ${this.passedTests}`, 'success');
    this.log(`❌ Failed: ${this.failedTests}`, 'error');
    this.log(`⚠️ Skipped: ${this.skippedTests}`, 'warning');
    this.log(`⏱️ Total Duration: ${totalDuration}ms`, 'info');
    this.log('='.repeat(60), 'info');

    // Group results by category
    const categories = {
      'Environment Setup': this.results.filter(r => r.name.includes('Environment') || r.name.includes('Package') || r.name.includes('Node.js')),
      'Weather API': this.results.filter(r => r.name.includes('Weather')),
      'IoT API': this.results.filter(r => r.name.includes('IoT')),
      'Energy API': this.results.filter(r => r.name.includes('Energy')),
      'Emergency API': this.results.filter(r => r.name.includes('Emergency')),
      'Control Center': this.results.filter(r => r.name.includes('Dashboard') || r.name.includes('Monitoring') || r.name.includes('Work Orders')),
      'Simulation Engine': this.results.filter(r => r.name.includes('Simulation')),
      'Frontend Pages': this.results.filter(r => r.name.includes('Frontend')),
    };

    // Print detailed results by category
    for (const [category, results] of Object.entries(categories)) {
      if (results.length > 0) {
        this.log(`\n🔍 ${category} Results:`, 'info');
        for (const result of results) {
          const statusIcon = {
            PASS: '✅',
            FAIL: '❌',
            SKIP: '⚠️',
          }[result.status];

          this.log(`  ${statusIcon} ${result.name}: ${result.status === 'PASS' ? 'Success' : result.error || result.reason} (${result.duration}ms)`, 'info');
        }
      }
    }

    // Print recommendations
    this.log('\n💡 Recommendations:', 'info');

    if (this.failedTests > 0) {
      this.log('• Check API keys and credentials in .env.local', 'warning');
      this.log('• Verify external services are running and accessible', 'warning');
      this.log('• Review network connectivity and firewall settings', 'warning');
      this.log('• Ensure Next.js development server is running (npm run dev)', 'warning');
    }

    if (this.skippedTests > 0) {
      this.log('• Configure missing API keys to enable skipped tests', 'info');
      this.log('• Set up external services for full integration testing', 'info');
    }

    if (this.passedTests === this.totalTests) {
      this.log('• All tests passed! External API integration is working correctly', 'success');
    }

    this.log('\n🏁 Test completed', 'info');
  }
}

// Main execution
async function main() {
  const tester = new TestRunner();
  await tester.runAllTests();
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestRunner };


