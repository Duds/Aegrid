/**
 * Emergency Simulation Data Source
 *
 * Simulates emergency scenarios and response systems using standard
 * emergency management protocols and data formats.
 *
 * @fileoverview Emergency simulation with CAP (Common Alerting Protocol) compatibility
 */

import { SimulationAlert, SimulationConfig, SimulationDataPoint, SimulationDataSource } from './simulation-engine';

export interface EmergencyScenarioData {
  scenarioId: string;
  scenarioType: 'EQUIPMENT_FAILURE' | 'NATURAL_DISASTER' | 'SECURITY_BREACH' | 'ENVIRONMENTAL_HAZARD' | 'CYBER_ATTACK';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: string;
  assetId?: string;
  description: string;
  status: 'DETECTED' | 'RESPONDING' | 'INVESTIGATING' | 'RESOLVED' | 'ESCALATED';
  detectedAt: Date;
  responseTime?: number; // minutes
  resolutionTime?: number; // minutes
  affectedSystems: string[];
  requiredResources: string[];
  escalationLevel: number;
}

export interface EmergencyResourceData {
  resourceId: string;
  resourceType: 'EMERGENCY_CREW' | 'MOBILE_UNIT' | 'CONTRACTOR' | 'EQUIPMENT' | 'PARTS';
  name: string;
  location: string;
  status: 'AVAILABLE' | 'DEPLOYED' | 'MAINTENANCE' | 'UNAVAILABLE';
  capacity: number;
  currentLoad: number;
  responseTime: number; // minutes
  specialisation: string[];
  contactInfo: {
    person: string;
    phone: string;
    email: string;
  };
}

export class EmergencySimulationDataSource extends SimulationDataSource {
  private scenarios: Map<string, EmergencyScenarioData> = new Map();
  private resources: Map<string, EmergencyResourceData> = new Map();
  private lastUpdateTime: Date = new Date();
  private alertHistory: Map<string, Date> = new Map();

  constructor(config: SimulationConfig) {
    super(config);
    this.initializeEmergencyData();
  }

  private initializeEmergencyData(): void {
    // Initialize emergency resources
    this.resources.set('crew-alpha', {
      resourceId: 'crew-alpha',
      resourceType: 'EMERGENCY_CREW',
      name: 'Emergency Response Team Alpha',
      location: 'Main Depot',
      status: 'AVAILABLE',
      capacity: 6,
      currentLoad: 2,
      responseTime: 15,
      specialisation: ['Hydraulics', 'Electrical', 'Emergency Response'],
      contactInfo: {
        person: 'John Smith',
        phone: '+61 2 9876 5432',
        email: 'emergency.alpha@sample.council',
      },
    });

    this.resources.set('crew-beta', {
      resourceId: 'crew-beta',
      resourceType: 'EMERGENCY_CREW',
      name: 'Emergency Response Team Beta',
      location: 'North District',
      status: 'AVAILABLE',
      capacity: 4,
      currentLoad: 1,
      responseTime: 20,
      specialisation: ['Mechanical', 'Water Systems', 'Emergency Response'],
      contactInfo: {
        person: 'Sarah Johnson',
        phone: '+61 2 9876 5433',
        email: 'emergency.beta@sample.council',
      },
    });

    this.resources.set('mobile-unit-01', {
      resourceId: 'mobile-unit-01',
      resourceType: 'MOBILE_UNIT',
      name: 'Mobile Emergency Unit 01',
      location: 'Emergency Facility',
      status: 'AVAILABLE',
      capacity: 1,
      currentLoad: 0,
      responseTime: 10,
      specialisation: ['Mobile Command', 'Communication', 'First Aid'],
      contactInfo: {
        person: 'Mike Wilson',
        phone: '+61 2 9876 5434',
        email: 'mobile.unit01@sample.council',
      },
    });

    this.resources.set('contractor-hydraulics', {
      resourceId: 'contractor-hydraulics',
      resourceType: 'CONTRACTOR',
      name: 'Hydraulic Systems Contractor',
      location: 'External',
      status: 'AVAILABLE',
      capacity: 3,
      currentLoad: 0,
      responseTime: 45,
      specialisation: ['Hydraulics', 'Pump Systems', 'Emergency Repair'],
      contactInfo: {
        person: 'David Brown',
        phone: '+61 2 9876 5435',
        email: 'hydraulics@contractor.com',
      },
    });

    // Initialize some active emergency scenarios
    this.scenarios.set('emergency-001', {
      scenarioId: 'emergency-001',
      scenarioType: 'EQUIPMENT_FAILURE',
      severity: 'CRITICAL',
      location: 'Water Pump Station #3',
      assetId: 'asset-pump-003',
      description: 'Primary water pump failure detected - backup systems activated',
      status: 'RESPONDING',
      detectedAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      responseTime: 12,
      affectedSystems: ['Water Distribution', 'Pressure Systems'],
      requiredResources: ['crew-alpha', 'contractor-hydraulics'],
      escalationLevel: 2,
    });

    this.scenarios.set('emergency-002', {
      scenarioId: 'emergency-002',
      scenarioType: 'ENVIRONMENTAL_HAZARD',
      severity: 'HIGH',
      location: 'West Ridge',
      description: 'Chemical spill detected near wind turbine array',
      status: 'INVESTIGATING',
      detectedAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      responseTime: 8,
      affectedSystems: ['Wind Power Generation', 'Environmental Monitoring'],
      requiredResources: ['crew-beta', 'mobile-unit-01'],
      escalationLevel: 1,
    });
  }

  async start(): Promise<void> {
    this.isRunning = true;

    // Update emergency data every 60 seconds
    this.intervalId = setInterval(() => {
      this.updateEmergencyData();
    }, 60000);

    console.log('Emergency simulation data source started');
  }

  async stop(): Promise<void> {
    this.isRunning = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    console.log('Emergency simulation data source stopped');
  }

  private updateEmergencyData(): void {
    const now = new Date();

    // Update scenario statuses
    for (const [scenarioId, scenario] of this.scenarios) {
      const timeSinceDetection = (now.getTime() - scenario.detectedAt.getTime()) / (1000 * 60); // minutes

      // Simulate scenario progression
      if (scenario.status === 'DETECTED' && timeSinceDetection > 5) {
        scenario.status = 'RESPONDING';
        scenario.responseTime = Math.floor(timeSinceDetection);
      } else if (scenario.status === 'RESPONDING' && timeSinceDetection > 30) {
        scenario.status = 'INVESTIGATING';
      } else if (scenario.status === 'INVESTIGATING' && timeSinceDetection > 60) {
        scenario.status = 'RESOLVED';
        scenario.resolutionTime = Math.floor(timeSinceDetection);
      }

      // Simulate escalation
      if (timeSinceDetection > 45 && scenario.escalationLevel < 3) {
        scenario.escalationLevel++;
      }
    }

    // Update resource availability
    for (const [resourceId, resource] of this.resources) {
      // Simulate resource load changes
      if (resource.status === 'DEPLOYED') {
        resource.currentLoad = Math.max(0, resource.currentLoad - 0.1);
        if (resource.currentLoad === 0) {
          resource.status = 'AVAILABLE';
        }
      }

      // Simulate maintenance cycles
      if (Math.random() < 0.01 && resource.status === 'AVAILABLE') { // 1% chance per update
        resource.status = 'MAINTENANCE';
        resource.currentLoad = 0;
      } else if (resource.status === 'MAINTENANCE' && Math.random() < 0.1) { // 10% chance to complete maintenance
        resource.status = 'AVAILABLE';
      }
    }

    this.lastUpdateTime = now;
  }

  async getCurrentData(): Promise<SimulationDataPoint[]> {
    const dataPoints: SimulationDataPoint[] = [];

    // Add scenario data points
    for (const scenario of this.scenarios.values()) {
      dataPoints.push({
        timestamp: scenario.detectedAt,
        value: this.getSeverityValue(scenario.severity),
        unit: 'severity',
        metadata: {
          scenarioId: scenario.scenarioId,
          scenarioType: scenario.scenarioType,
          severity: scenario.severity,
          location: scenario.location,
          assetId: scenario.assetId,
          status: scenario.status,
          escalationLevel: scenario.escalationLevel,
          affectedSystems: scenario.affectedSystems,
          requiredResources: scenario.requiredResources,
        },
      });
    }

    // Add resource availability data points
    for (const resource of this.resources.values()) {
      dataPoints.push({
        timestamp: this.lastUpdateTime,
        value: resource.capacity - resource.currentLoad,
        unit: 'available',
        metadata: {
          resourceId: resource.resourceId,
          resourceType: resource.resourceType,
          name: resource.name,
          location: resource.location,
          status: resource.status,
          capacity: resource.capacity,
          currentLoad: resource.currentLoad,
          responseTime: resource.responseTime,
          specialisation: resource.specialisation,
        },
      });
    }

    return dataPoints;
  }

  private getSeverityValue(severity: string): number {
    const severityMap: Record<string, number> = {
      'LOW': 1,
      'MEDIUM': 2,
      'HIGH': 3,
      'CRITICAL': 4,
    };
    return severityMap[severity] || 1;
  }

  async generateAlert(): Promise<SimulationAlert | null> {
    const now = new Date();

    // Check for new emergency scenarios
    if (Math.random() < 0.05) { // 5% chance per update
      const newScenario = this.generateNewEmergencyScenario();
      if (newScenario) {
        this.scenarios.set(newScenario.scenarioId, newScenario);

        return {
          id: `emergency-${newScenario.scenarioId}`,
          type: 'EMERGENCY_DETECTED',
          severity: newScenario.severity,
          message: `${newScenario.scenarioType} detected: ${newScenario.description}`,
          timestamp: now,
          resolved: false,
          metadata: {
            scenarioId: newScenario.scenarioId,
            scenarioType: newScenario.scenarioType,
            severity: newScenario.severity,
            location: newScenario.location,
            assetId: newScenario.assetId,
            affectedSystems: newScenario.affectedSystems,
            requiredResources: newScenario.requiredResources,
          },
        };
      }
    }

    // Check for resource availability issues
    for (const [resourceId, resource] of this.resources) {
      const alertKey = `resource-${resourceId}-${now.getHours()}`;
      const lastAlert = this.alertHistory.get(alertKey);

      if (lastAlert && (now.getTime() - lastAlert.getTime()) < 3600000) {
        continue;
      }

      if (resource.status === 'UNAVAILABLE' || resource.currentLoad >= resource.capacity) {
        this.alertHistory.set(alertKey, now);

        return {
          id: `resource-${resourceId}-${now.getTime()}`,
          type: 'RESOURCE_UNAVAILABLE',
          severity: 'HIGH',
          message: `Emergency resource ${resource.name} is unavailable`,
          timestamp: now,
          resolved: false,
          metadata: {
            resourceId: resource.resourceId,
            resourceType: resource.resourceType,
            name: resource.name,
            location: resource.location,
            status: resource.status,
            capacity: resource.capacity,
            currentLoad: resource.currentLoad,
          },
        };
      }
    }

    return null;
  }

  private generateNewEmergencyScenario(): EmergencyScenarioData | null {
    const scenarioTypes: Array<EmergencyScenarioData['scenarioType']> = [
      'EQUIPMENT_FAILURE',
      'NATURAL_DISASTER',
      'SECURITY_BREACH',
      'ENVIRONMENTAL_HAZARD',
      'CYBER_ATTACK',
    ];

    const locations = [
      'Water Pump Station #3',
      'Wind Turbine Array',
      'Solar Array - North Facility',
      'Emergency Facility',
      'Main Depot',
      'Energy Hub',
    ];

    const scenarioType = scenarioTypes[Math.floor(Math.random() * scenarioTypes.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const severity = Math.random() < 0.1 ? 'CRITICAL' : Math.random() < 0.3 ? 'HIGH' : 'MEDIUM';

    const scenarioId = `emergency-${Date.now()}`;

    return {
      scenarioId,
      scenarioType,
      severity,
      location,
      description: this.generateScenarioDescription(scenarioType, location),
      status: 'DETECTED',
      detectedAt: new Date(),
      affectedSystems: this.getAffectedSystems(scenarioType),
      requiredResources: this.getRequiredResources(scenarioType),
      escalationLevel: 1,
    };
  }

  private generateScenarioDescription(type: string, location: string): string {
    const descriptions: Record<string, string[]> = {
      'EQUIPMENT_FAILURE': [
        'Critical equipment failure detected',
        'Primary system malfunction',
        'Equipment shutdown required',
        'Mechanical failure in progress',
      ],
      'NATURAL_DISASTER': [
        'Severe weather conditions detected',
        'Natural disaster impact',
        'Environmental damage reported',
        'Weather-related system failure',
      ],
      'SECURITY_BREACH': [
        'Unauthorized access detected',
        'Security perimeter breached',
        'Suspicious activity reported',
        'Security system compromised',
      ],
      'ENVIRONMENTAL_HAZARD': [
        'Environmental contamination detected',
        'Hazardous material release',
        'Environmental safety breach',
        'Contamination risk identified',
      ],
      'CYBER_ATTACK': [
        'Cybersecurity incident detected',
        'Network intrusion attempt',
        'System compromise detected',
        'Cyber threat identified',
      ],
    };

    const typeDescriptions = descriptions[type] || ['Emergency situation detected'];
    const description = typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];

    return `${description} at ${location}`;
  }

  private getAffectedSystems(type: string): string[] {
    const systemMap: Record<string, string[]> = {
      'EQUIPMENT_FAILURE': ['Water Distribution', 'Power Generation', 'Control Systems'],
      'NATURAL_DISASTER': ['Power Generation', 'Communication Systems', 'Infrastructure'],
      'SECURITY_BREACH': ['Access Control', 'Monitoring Systems', 'Communication Systems'],
      'ENVIRONMENTAL_HAZARD': ['Environmental Monitoring', 'Safety Systems', 'Water Systems'],
      'CYBER_ATTACK': ['Control Systems', 'Communication Systems', 'Monitoring Systems'],
    };

    return systemMap[type] || ['General Systems'];
  }

  private getRequiredResources(type: string): string[] {
    const resourceMap: Record<string, string[]> = {
      'EQUIPMENT_FAILURE': ['crew-alpha', 'contractor-hydraulics'],
      'NATURAL_DISASTER': ['crew-beta', 'mobile-unit-01'],
      'SECURITY_BREACH': ['crew-alpha', 'mobile-unit-01'],
      'ENVIRONMENTAL_HAZARD': ['crew-beta', 'contractor-hydraulics'],
      'CYBER_ATTACK': ['mobile-unit-01'],
    };

    return resourceMap[type] || ['crew-alpha'];
  }

  getScenarios(): Map<string, EmergencyScenarioData> {
    return new Map(this.scenarios);
  }

  getResources(): Map<string, EmergencyResourceData> {
    return new Map(this.resources);
  }

  getScenario(scenarioId: string): EmergencyScenarioData | undefined {
    return this.scenarios.get(scenarioId);
  }

  getResource(resourceId: string): EmergencyResourceData | undefined {
    return this.resources.get(resourceId);
  }

  // CAP (Common Alerting Protocol) compatible format
  getCAPAlert(scenarioId: string): any {
    const scenario = this.scenarios.get(scenarioId);
    if (!scenario) return null;

    return {
      identifier: scenario.scenarioId,
      sender: 'Aegrid Emergency System',
      sent: scenario.detectedAt.toISOString(),
      status: 'Actual',
      msgType: 'Alert',
      scope: 'Public',
      info: [{
        language: 'en-AU',
        category: ['Infrastructure'],
        event: scenario.scenarioType,
        urgency: this.getCAPUrgency(scenario.severity),
        severity: this.getCAPSeverity(scenario.severity),
        certainty: 'Observed',
        headline: `Emergency Alert: ${scenario.scenarioType}`,
        description: scenario.description,
        area: [{
          areaDesc: scenario.location,
        }],
        parameter: [{
          valueName: 'escalationLevel',
          value: scenario.escalationLevel.toString(),
        }],
      }],
    };
  }

  private getCAPUrgency(severity: string): string {
    const urgencyMap: Record<string, string> = {
      'LOW': 'Future',
      'MEDIUM': 'Expected',
      'HIGH': 'Immediate',
      'CRITICAL': 'Immediate',
    };
    return urgencyMap[severity] || 'Expected';
  }

  private getCAPSeverity(severity: string): string {
    const severityMap: Record<string, string> = {
      'LOW': 'Minor',
      'MEDIUM': 'Moderate',
      'HIGH': 'Severe',
      'CRITICAL': 'Extreme',
    };
    return severityMap[severity] || 'Moderate';
  }
}
