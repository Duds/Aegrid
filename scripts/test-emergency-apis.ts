#!/usr/bin/env ts-node

/**
 * Emergency API Test Suite
 *
 * Comprehensive test suite for emergency APIs with authentication
 * Tests all emergency endpoints with various scenarios and data formats
 */

import fetch from 'node-fetch';

interface TestConfig {
  baseUrl: string;
  testUser: {
    email: string;
    password: string;
  };
}

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  responseTime: number;
  error?: string;
  data?: any;
}

class EmergencyAPITester {
  private config: TestConfig;
  private sessionCookie?: string;

  constructor(config: TestConfig) {
    this.config = config;
  }

  async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Authenticating test user...');

      const response = await fetch(`${this.config.baseUrl}/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.config.testUser.email,
          password: this.config.testUser.password,
        }),
      });

      if (response.ok) {
        const setCookieHeader = response.headers.get('set-cookie');
        if (setCookieHeader) {
          this.sessionCookie = setCookieHeader;
          console.log('✅ Authentication successful');
          return true;
        }
      }

      console.log('❌ Authentication failed');
      return false;
    } catch (error) {
      console.error('❌ Authentication error:', error);
      return false;
    }
  }

  private async makeRequest(endpoint: string, options: any = {}): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          'Cookie': this.sessionCookie || '',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      const responseTime = Date.now() - startTime;
      const data = await response.text();

      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch {
        parsedData = data;
      }

      return {
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        success: response.ok,
        responseTime,
        data: parsedData,
      };
    } catch (error) {
      return {
        endpoint,
        method: options.method || 'GET',
        status: 0,
        success: false,
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async testControlCenterAPI(): Promise<TestResult[]> {
    console.log('\n🏢 Testing Control Center Emergency API...');
    const results: TestResult[] = [];

    // Test GET endpoint
    const getResult = await this.makeRequest('/api/control-center/emergency');
    results.push(getResult);
    console.log(`  GET /api/control-center/emergency: ${getResult.success ? '✅' : '❌'} (${getResult.status}) - ${getResult.responseTime}ms`);

    // Test POST endpoint (create emergency alert)
    const postResult = await this.makeRequest('/api/control-center/emergency', {
      method: 'POST',
      body: JSON.stringify({
        alertType: 'EQUIPMENT_FAILURE',
        severity: 'HIGH',
        title: 'Test Emergency Alert',
        description: 'This is a test emergency alert created by the API test suite',
        location: 'Test Location',
      }),
    });
    results.push(postResult);
    console.log(`  POST /api/control-center/emergency: ${postResult.success ? '✅' : '❌'} (${postResult.status}) - ${postResult.responseTime}ms`);

    return results;
  }

  async testSimulationAPI(): Promise<TestResult[]> {
    console.log('\n🎯 Testing Simulation Emergency API...');
    const results: TestResult[] = [];

    const formats = ['json', 'cap', 'eas'];

    for (const format of formats) {
      const result = await this.makeRequest(`/api/simulation/emergency?format=${format}`);
      results.push(result);
      console.log(`  GET /api/simulation/emergency?format=${format}: ${result.success ? '✅' : '❌'} (${result.status}) - ${result.responseTime}ms`);
    }

    // Test POST endpoint (update scenario status)
    const postResult = await this.makeRequest('/api/simulation/emergency', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_scenario_status',
        scenarioId: 'emergency-001',
        status: 'RESPONDING',
      }),
    });
    results.push(postResult);
    console.log(`  POST /api/simulation/emergency: ${postResult.success ? '✅' : '❌'} (${postResult.status}) - ${postResult.responseTime}ms`);

    return results;
  }

  async testExternalAPI(): Promise<TestResult[]> {
    console.log('\n🌐 Testing External Emergency API...');
    const results: TestResult[] = [];

    const formats = ['json', 'xml', 'csv'];

    for (const format of formats) {
      const result = await this.makeRequest(`/api/external/emergency?external=true&format=${format}`);
      results.push(result);
      console.log(`  GET /api/external/emergency?external=true&format=${format}: ${result.success ? '✅' : '❌'} (${result.status}) - ${result.responseTime}ms`);
    }

    // Test POST endpoint (report emergency)
    const postResult = await this.makeRequest('/api/external/emergency?external=true', {
      method: 'POST',
      body: JSON.stringify({
        action: 'report_emergency',
        data: {
          type: 'EQUIPMENT_FAILURE',
          severity: 'HIGH',
          location: 'Test External Location',
          description: 'Test emergency reported via external API',
        },
      }),
    });
    results.push(postResult);
    console.log(`  POST /api/external/emergency: ${postResult.success ? '✅' : '❌'} (${postResult.status}) - ${postResult.responseTime}ms`);

    return results;
  }

  async runAllTests(): Promise<void> {
    console.log('🚨 Emergency API Test Suite Starting...\n');

    if (!await this.authenticate()) {
      console.log('❌ Cannot proceed without authentication');
      return;
    }

    const allResults: TestResult[] = [];

    // Run all test suites
    allResults.push(...await this.testControlCenterAPI());
    allResults.push(...await this.testSimulationAPI());
    allResults.push(...await this.testExternalAPI());

    // Generate summary
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${allResults.length}`);
    console.log(`Passed: ${allResults.filter(r => r.success).length}`);
    console.log(`Failed: ${allResults.filter(r => !r.success).length}`);
    console.log(`Average Response Time: ${Math.round(allResults.reduce((sum, r) => sum + r.responseTime, 0) / allResults.length)}ms`);

    // Show failed tests
    const failedTests = allResults.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`  ${test.method} ${test.endpoint}: ${test.status} - ${test.error || 'Unknown error'}`);
      });
    }

    console.log('\n✅ Test suite completed!');
  }
}

// Test configuration
const testConfig: TestConfig = {
  baseUrl: process.env.TEST_BASE_URL || 'http://localhost:3000',
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@greenfieldshire.council',
    password: process.env.TEST_USER_PASSWORD || 'testpassword123',
  },
};

// Run tests if this script is executed directly
if (require.main === module) {
  const tester = new EmergencyAPITester(testConfig);
  tester.runAllTests().catch(console.error);
}

export { EmergencyAPITester, TestConfig, TestResult };
