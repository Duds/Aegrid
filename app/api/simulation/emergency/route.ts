/**
 * Emergency Simulation API Endpoint
 *
 * Provides emergency scenario data using standard protocols.
 * Supports CAP (Common Alerting Protocol), EAS, and custom JSON formats.
 *
 * @fileoverview Emergency simulation API with CAP compatibility
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
    const scenarioId = searchParams.get('scenarioId');
    const resourceId = searchParams.get('resourceId');

    const simulationEngine = getSimulationEngine();
    const emergencySource = simulationEngine['dataSources'].get('emergency');

    if (!emergencySource) {
      return NextResponse.json({ message: 'Emergency simulation not available' }, { status: 503 });
    }

    const data = await simulationEngine.getData('emergency');

    // Filter by scenario ID or resource ID if specified
    let filteredData = data;
    if (scenarioId) {
      filteredData = filteredData.filter(point => point.metadata?.scenarioId === scenarioId);
    }
    if (resourceId) {
      filteredData = filteredData.filter(point => point.metadata?.resourceId === resourceId);
    }

    switch (format) {
      case 'cap':
        const scenarios = emergencySource.getScenarios();
        const capAlerts = Array.from(scenarios.values())
          .filter(scenario => !scenarioId || scenario.scenarioId === scenarioId)
          .map(scenario => emergencySource.getCAPAlert(scenario.scenarioId))
          .filter(alert => alert !== null);

        return NextResponse.json({
          dataType: 'CAP (Common Alerting Protocol)',
          timestamp: new Date().toISOString(),
          data: capAlerts,
        });

      case 'eas':
        return NextResponse.json({
          dataType: 'EAS (Emergency Alert System)',
          timestamp: new Date().toISOString(),
          data: filteredData.map(point => ({
            header: 'ZCZC-EAS-EMR-001+00-0000000-',
            originator: 'Aegrid Emergency System',
            eventCode: 'EMR',
            eventType: 'Emergency',
            urgency: point.metadata?.severity === 'CRITICAL' ? 'Immediate' : 'Expected',
            severity: point.metadata?.severity === 'CRITICAL' ? 'Extreme' : 'Severe',
            certainty: 'Observed',
            area: point.metadata?.location,
            message: point.metadata?.description || 'Emergency situation detected',
            timestamp: point.timestamp.toISOString(),
            expires: new Date(point.timestamp.getTime() + 3600000).toISOString(), // 1 hour
          })),
        });

      case 'json':
      default:
        return NextResponse.json({
          dataType: 'JSON Emergency Data',
          timestamp: new Date().toISOString(),
          data: filteredData,
        });
    }

  } catch (error) {
    console.error('Emergency simulation API error:', error);
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
    const { action, scenarioId, resourceId, status, escalationLevel } = body;

    const simulationEngine = getSimulationEngine();
    const emergencySource = simulationEngine['dataSources'].get('emergency');

    if (!emergencySource) {
      return NextResponse.json({ message: 'Emergency simulation not available' }, { status: 503 });
    }

    switch (action) {
      case 'update_scenario_status':
        if (!scenarioId || !status) {
          return NextResponse.json({ message: 'scenarioId and status are required' }, { status: 400 });
        }

        const scenarios = emergencySource.getScenarios();
        const scenario = scenarios.get(scenarioId);

        if (!scenario) {
          return NextResponse.json({ message: 'Emergency scenario not found' }, { status: 404 });
        }

        // Update scenario status (simulated)
        scenario.status = status;

        if (status === 'RESOLVED') {
          scenario.resolutionTime = Math.floor((Date.now() - scenario.detectedAt.getTime()) / (1000 * 60));
        }

        return NextResponse.json({
          message: 'Emergency scenario status updated',
          scenarioId,
          status: scenario.status,
          resolutionTime: scenario.resolutionTime,
        });

      case 'escalate_scenario':
        if (!scenarioId) {
          return NextResponse.json({ message: 'scenarioId is required' }, { status: 400 });
        }

        const scenarios2 = emergencySource.getScenarios();
        const scenario2 = scenarios2.get(scenarioId);

        if (!scenario2) {
          return NextResponse.json({ message: 'Emergency scenario not found' }, { status: 404 });
        }

        scenario2.escalationLevel = escalationLevel || scenario2.escalationLevel + 1;

        return NextResponse.json({
          message: 'Emergency scenario escalated',
          scenarioId,
          escalationLevel: scenario2.escalationLevel,
        });

      case 'deploy_resource':
        if (!resourceId || !scenarioId) {
          return NextResponse.json({ message: 'resourceId and scenarioId are required' }, { status: 400 });
        }

        const resources = emergencySource.getResources();
        const resource = resources.get(resourceId);

        if (!resource) {
          return NextResponse.json({ message: 'Emergency resource not found' }, { status: 404 });
        }

        if (resource.status !== 'AVAILABLE') {
          return NextResponse.json({ message: 'Resource is not available for deployment' }, { status: 409 });
        }

        // Deploy resource (simulated)
        resource.status = 'DEPLOYED';
        resource.currentLoad = resource.capacity;

        return NextResponse.json({
          message: 'Emergency resource deployed',
          resourceId,
          scenarioId,
          resourceStatus: resource.status,
          currentLoad: resource.currentLoad,
        });

      case 'release_resource':
        if (!resourceId) {
          return NextResponse.json({ message: 'resourceId is required' }, { status: 400 });
        }

        const resources2 = emergencySource.getResources();
        const resource2 = resources2.get(resourceId);

        if (!resource2) {
          return NextResponse.json({ message: 'Emergency resource not found' }, { status: 404 });
        }

        // Release resource (simulated)
        resource2.status = 'AVAILABLE';
        resource2.currentLoad = 0;

        return NextResponse.json({
          message: 'Emergency resource released',
          resourceId,
          resourceStatus: resource2.status,
          currentLoad: resource2.currentLoad,
        });

      case 'generate_alert':
        const alert = await simulationEngine.generateAlert('emergency');
        return NextResponse.json({ alert });

      case 'get_scenario_details':
        if (!scenarioId) {
          return NextResponse.json({ message: 'scenarioId is required' }, { status: 400 });
        }

        const scenarios3 = emergencySource.getScenarios();
        const scenario3 = scenarios3.get(scenarioId);

        if (!scenario3) {
          return NextResponse.json({ message: 'Emergency scenario not found' }, { status: 404 });
        }

        return NextResponse.json({
          message: 'Emergency scenario details retrieved',
          scenario: {
            scenarioId: scenario3.scenarioId,
            scenarioType: scenario3.scenarioType,
            severity: scenario3.severity,
            location: scenario3.location,
            assetId: scenario3.assetId,
            description: scenario3.description,
            status: scenario3.status,
            detectedAt: scenario3.detectedAt,
            responseTime: scenario3.responseTime,
            resolutionTime: scenario3.resolutionTime,
            affectedSystems: scenario3.affectedSystems,
            requiredResources: scenario3.requiredResources,
            escalationLevel: scenario3.escalationLevel,
          },
        });

      case 'get_resource_status':
        if (!resourceId) {
          return NextResponse.json({ message: 'resourceId is required' }, { status: 400 });
        }

        const resources3 = emergencySource.getResources();
        const resource3 = resources3.get(resourceId);

        if (!resource3) {
          return NextResponse.json({ message: 'Emergency resource not found' }, { status: 404 });
        }

        return NextResponse.json({
          message: 'Emergency resource status retrieved',
          resource: {
            resourceId: resource3.resourceId,
            resourceType: resource3.resourceType,
            name: resource3.name,
            location: resource3.location,
            status: resource3.status,
            capacity: resource3.capacity,
            currentLoad: resource3.currentLoad,
            responseTime: resource3.responseTime,
            specialisation: resource3.specialisation,
            contactInfo: resource3.contactInfo,
          },
        });

      default:
        return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('Emergency simulation API error:', error);
    return NextResponse.json({
      message: 'Internal Server Error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
