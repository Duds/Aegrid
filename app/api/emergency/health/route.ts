/**
 * Emergency API Health Check Endpoint
 *
 * Provides comprehensive health monitoring for emergency APIs
 * including system status, performance metrics, and usage statistics
 */

import EmergencyAPIMonitor, {
  getEmergencyAPIHealthData,
} from '@/lib/emergency-monitoring';
import { prisma } from '@/lib/prisma';
import { getSimulationEngine } from '@/lib/simulation/simulation-engine';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const detailed = searchParams.get('detailed') === 'true';
    const format = searchParams.get('format') || 'json';

    // Get basic health data
    const healthData = getEmergencyAPIHealthData();

    // Perform additional health checks
    const additionalChecks = await performHealthChecks();

    const healthStatus = {
      ...healthData,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      additionalChecks,
    };

    // Return detailed or summary response based on parameter
    const response = detailed
      ? healthStatus
      : {
          status: healthStatus.health.status,
          uptime: healthStatus.health.uptime,
          errorRate: healthStatus.health.errorRate,
          responseTime: healthStatus.health.responseTime.p95,
          timestamp: healthStatus.timestamp,
        };

    if (format === 'yaml') {
      const yamlContent = `---
status: ${detailed ? healthStatus.health.status : (response as any).status}
uptime: ${detailed ? healthStatus.health.uptime : (response as any).uptime}
errorRate: ${detailed ? healthStatus.health.errorRate : (response as any).errorRate}
responseTime: ${detailed ? healthStatus.health.responseTime.p95 : (response as any).responseTime}
timestamp: ${response.timestamp}
version: ${healthStatus.version}
environment: ${healthStatus.environment}
checks:
  database: ${additionalChecks.database}
  simulation: ${additionalChecks.simulation}
  external: ${additionalChecks.external}
`;

      return new NextResponse(yamlContent, {
        headers: {
          'Content-Type': 'text/yaml',
          'Cache-Control': 'no-cache',
        },
      });
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-cache',
        'X-Emergency-Health-Check': 'true',
        'X-System-Status': healthStatus.health.status,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache',
          'X-Emergency-Health-Check': 'failed',
        },
      }
    );
  }
}

async function performHealthChecks(): Promise<{
  database: boolean;
  simulation: boolean;
  external: boolean;
}> {
  const checks = {
    database: false,
    simulation: false,
    external: false,
  };

  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    // Simulation engine health check
    const simulationEngine = getSimulationEngine();
    const emergencySource = simulationEngine['dataSources'].get('emergency');
    checks.simulation = !!emergencySource;
  } catch (error) {
    console.error('Simulation engine health check failed:', error);
  }

  try {
    // External API health check (check if external endpoints are accessible)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      'http://localhost:3000/api/external/emergency?external=true',
      {
        method: 'HEAD',
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);
    checks.external = response.status !== 404;
  } catch (error) {
    console.error('External API health check failed:', error);
  }

  return checks;
}

// Reset metrics endpoint (for testing/admin use)
export async function DELETE(_request: NextRequest) {
  try {
    // In production, add proper authentication/authorization here
    const monitor = EmergencyAPIMonitor.getInstance();
    monitor.resetMetrics();

    return NextResponse.json({
      message: 'Emergency API metrics reset successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Reset metrics error:', error);

    return NextResponse.json(
      {
        error: 'Failed to reset metrics',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
