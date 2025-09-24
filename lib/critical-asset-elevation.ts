/**
 * Critical Asset Elevation and Visibility System
 *
 * Implements Aegrid Rule 3: Respond to the Real World
 * This system ensures critical assets are prominently displayed and elevated
 * in all views, with dedicated dashboards and alerting capabilities.
 *
 * @fileoverview Critical asset management and visibility features
 */

import { PrismaClient } from '@prisma/client';
import { AssetGraphOperations, GraphVertex as _GraphVertex } from './cosmos-db';

export interface CriticalAsset {
  id: string;
  assetNumber: string;
  name: string;
  assetType: string;
  criticalityLevel: 'Critical' | 'High' | 'Medium' | 'Low';
  criticalityReason: string;
  serviceImpact: string;
  failureConsequences: string[];
  controls: CriticalControl[];
  lastAssessment: Date;
  nextAssessment: Date;
  status: 'Compliant' | 'Non-Compliant' | 'Overdue' | 'Unknown';
  organisationId: string;
  currentValue: number;
  replacementCost: number;
  riskScore: number;
}

export interface CriticalControl {
  id: string;
  name: string;
  type: 'Preventive' | 'Detective' | 'Corrective';
  frequency: string;
  lastPerformed: Date;
  nextDue: Date;
  status: 'Compliant' | 'Non-Compliant' | 'Overdue';
  responsible: string;
  description: string;
}

export interface CriticalAssetDashboard {
  totalCriticalAssets: number;
  compliantAssets: number;
  nonCompliantAssets: number;
  overdueAssets: number;
  totalValue: number;
  totalRiskExposure: number;
  criticalControls: {
    total: number;
    compliant: number;
    nonCompliant: number;
    overdue: number;
  };
  recentAlerts: CriticalAlert[];
  topRiskAssets: CriticalAsset[];
  upcomingAssessments: Array<{
    assetId: string;
    assetName: string;
    assessmentDate: Date;
    daysUntilDue: number;
  }>;
}

export interface CriticalAlert {
  id: string;
  assetId: string;
  assetName: string;
  alertType:
    | 'Assessment Overdue'
    | 'Control Failure'
    | 'Risk Increase'
    | 'Compliance Issue';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  message: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface CriticalAssetFilter {
  criticalityLevel?: string[];
  status?: string[];
  assetType?: string[];
  serviceFunction?: string[];
  location?: string[];
  riskScoreMin?: number;
  riskScoreMax?: number;
  lastAssessmentBefore?: Date;
  lastAssessmentAfter?: Date;
}

export class CriticalAssetElevation {
  private prisma: PrismaClient;
  private graphOps: AssetGraphOperations;

  constructor() {
    this.prisma = new PrismaClient();
    this.graphOps = new AssetGraphOperations();
  }

  /**
   * Get critical assets dashboard data
   */
  async getCriticalAssetDashboard(
    organisationId: string
  ): Promise<CriticalAssetDashboard> {
    const criticalAssets = await this.getCriticalAssets(organisationId);

    const totalCriticalAssets = criticalAssets.length;
    const compliantAssets = criticalAssets.filter(
      asset => asset.status === 'Compliant'
    ).length;
    const nonCompliantAssets = criticalAssets.filter(
      asset => asset.status === 'Non-Compliant'
    ).length;
    const overdueAssets = criticalAssets.filter(
      asset => asset.status === 'Overdue'
    ).length;

    const totalValue = criticalAssets.reduce(
      (sum, asset) => sum + asset.currentValue,
      0
    );
    const totalRiskExposure = criticalAssets.reduce(
      (sum, asset) => sum + asset.riskScore,
      0
    );

    const criticalControls =
      await this.getCriticalControlsSummary(organisationId);
    const recentAlerts = await this.getRecentAlerts(organisationId, 10);
    const topRiskAssets = criticalAssets
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);

    const upcomingAssessments = await this.getUpcomingAssessments(
      organisationId,
      30
    );

    return {
      totalCriticalAssets,
      compliantAssets,
      nonCompliantAssets,
      overdueAssets,
      totalValue,
      totalRiskExposure,
      criticalControls,
      recentAlerts,
      topRiskAssets,
      upcomingAssessments,
    };
  }

  /**
   * Get all critical assets for an organisation
   */
  async getCriticalAssets(
    organisationId: string,
    filter?: CriticalAssetFilter
  ): Promise<CriticalAsset[]> {
    let whereClause: any = {
      organisationId,
      OR: [
        { priority: 'CRITICAL' },
        { priority: 'HIGH' },
        { tags: { has: 'critical-asset' } },
        { tags: { has: 'high-consequence' } },
      ],
    };

    // Apply filters
    if (filter?.criticalityLevel) {
      whereClause.priority = {
        in: filter.criticalityLevel.map(level => level.toUpperCase()),
      };
    }

    if (filter?.assetType) {
      whereClause.assetType = { in: filter.assetType };
    }

    if (filter?.riskScoreMin || filter?.riskScoreMax) {
      whereClause.riskScore = {};
      if (filter.riskScoreMin) whereClause.riskScore.gte = filter.riskScoreMin;
      if (filter.riskScoreMax) whereClause.riskScore.lte = filter.riskScoreMax;
    }

    const assets = await this.prisma.asset.findMany({
      where: whereClause,
      include: {
        organisation: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
          take: 1,
        },
        maintenance: {
          orderBy: { maintenanceDate: 'desc' },
          take: 5,
        },
        workOrders: {
          where: { status: 'OPEN' },
          orderBy: { priority: 'desc' },
        },
      },
    });

    const criticalAssets: CriticalAsset[] = [];

    for (const asset of assets) {
      const criticalityLevel = this.mapPriorityToCriticality(asset.priority);
      const controls = await this.getAssetCriticalControls(asset.id);
      const riskScore = await this.calculateRiskScore(asset, controls);
      const status = this.determineComplianceStatus(asset, controls);

      criticalAssets.push({
        id: asset.id,
        assetNumber: asset.assetNumber,
        name: asset.name,
        assetType: asset.assetType,
        criticalityLevel,
        criticalityReason: this.getCriticalityReason(asset),
        serviceImpact: this.getServiceImpact(asset),
        failureConsequences: this.getFailureConsequences(asset),
        controls,
        lastAssessment: asset.inspections[0]?.inspectionDate || asset.createdAt,
        nextAssessment: this.calculateNextAssessment(asset),
        status,
        organisationId: asset.organisationId,
        currentValue: asset.currentValue ? Number(asset.currentValue) : 0,
        replacementCost: asset.replacementCost
          ? Number(asset.replacementCost)
          : 0,
        riskScore,
      });
    }

    return criticalAssets.sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Get critical asset by ID with full context
   */
  async getCriticalAssetById(assetId: string): Promise<CriticalAsset | null> {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        organisation: true,
        inspections: {
          orderBy: { inspectionDate: 'desc' },
        },
        maintenance: {
          orderBy: { maintenanceDate: 'desc' },
        },
        workOrders: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          where: {
            documentType: {
              in: ['RISK_ASSESSMENT', 'CRITICAL_CONTROL', 'COMPLIANCE'],
            },
          },
        },
      },
    });

    if (!asset) {
      return null;
    }

    const controls = await this.getAssetCriticalControls(asset.id);
    const riskScore = await this.calculateRiskScore(asset, controls);
    const status = this.determineComplianceStatus(asset, controls);

    return {
      id: asset.id,
      assetNumber: asset.assetNumber,
      name: asset.name,
      assetType: asset.assetType,
      criticalityLevel: this.mapPriorityToCriticality(asset.priority),
      criticalityReason: this.getCriticalityReason(asset),
      serviceImpact: this.getServiceImpact(asset),
      failureConsequences: this.getFailureConsequences(asset),
      controls,
      lastAssessment: asset.inspections[0]?.inspectionDate || asset.createdAt,
      nextAssessment: this.calculateNextAssessment(asset),
      status,
      organisationId: asset.organisationId,
      currentValue: asset.currentValue ? Number(asset.currentValue) : 0,
      replacementCost: asset.replacementCost
        ? Number(asset.replacementCost)
        : 0,
      riskScore,
    };
  }

  /**
   * Get critical controls summary
   */
  async getCriticalControlsSummary(organisationId: string): Promise<{
    total: number;
    compliant: number;
    nonCompliant: number;
    overdue: number;
  }> {
    const criticalAssets = await this.getCriticalAssets(organisationId);

    let total = 0;
    let compliant = 0;
    let nonCompliant = 0;
    let overdue = 0;

    for (const asset of criticalAssets) {
      for (const control of asset.controls) {
        total++;
        if (control.status === 'Compliant') compliant++;
        else if (control.status === 'Non-Compliant') nonCompliant++;
        else if (control.status === 'Overdue') overdue++;
      }
    }

    return { total, compliant, nonCompliant, overdue };
  }

  /**
   * Get recent critical alerts
   */
  async getRecentAlerts(
    organisationId: string,
    limit: number = 10
  ): Promise<CriticalAlert[]> {
    const criticalAssets = await this.getCriticalAssets(organisationId);
    const alerts: CriticalAlert[] = [];

    for (const asset of criticalAssets) {
      // Check for overdue assessments
      if (asset.nextAssessment < new Date()) {
        alerts.push({
          id: `alert_${asset.id}_assessment`,
          assetId: asset.id,
          assetName: asset.name,
          alertType: 'Assessment Overdue',
          severity: 'High',
          message: `Critical asset assessment overdue by ${Math.ceil((new Date().getTime() - asset.nextAssessment.getTime()) / (1000 * 60 * 60 * 24))} days`,
          createdAt: new Date(),
          acknowledged: false,
        });
      }

      // Check for overdue controls
      for (const control of asset.controls) {
        if (control.status === 'Overdue') {
          alerts.push({
            id: `alert_${asset.id}_control_${control.id}`,
            assetId: asset.id,
            assetName: asset.name,
            alertType: 'Control Failure',
            severity: control.type === 'Preventive' ? 'Critical' : 'High',
            message: `Critical control "${control.name}" is overdue`,
            createdAt: new Date(),
            acknowledged: false,
          });
        }
      }

      // Check for high risk score
      if (asset.riskScore > 80) {
        alerts.push({
          id: `alert_${asset.id}_risk`,
          assetId: asset.id,
          assetName: asset.name,
          alertType: 'Risk Increase',
          severity: 'High',
          message: `Asset risk score is ${asset.riskScore} (High Risk)`,
          createdAt: new Date(),
          acknowledged: false,
        });
      }
    }

    return alerts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  /**
   * Get upcoming assessments
   */
  async getUpcomingAssessments(
    organisationId: string,
    daysAhead: number = 30
  ): Promise<
    Array<{
      assetId: string;
      assetName: string;
      assessmentDate: Date;
      daysUntilDue: number;
    }>
  > {
    const criticalAssets = await this.getCriticalAssets(organisationId);
    const upcomingAssessments = [];

    for (const asset of criticalAssets) {
      const daysUntilDue = Math.ceil(
        (asset.nextAssessment.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysUntilDue <= daysAhead && daysUntilDue >= 0) {
        upcomingAssessments.push({
          assetId: asset.id,
          assetName: asset.name,
          assessmentDate: asset.nextAssessment,
          daysUntilDue,
        });
      }
    }

    return upcomingAssessments.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }

  /**
   * Get asset critical controls
   */
  private async getAssetCriticalControls(
    assetId: string
  ): Promise<CriticalControl[]> {
    // This would typically come from a dedicated critical controls table
    // For now, we'll create mock controls based on asset type and priority
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      select: { assetType: true, priority: true, lastInspection: true },
    });

    if (!asset) {
      return [];
    }

    const controls: CriticalControl[] = [];

    // Add inspection control
    if (asset.lastInspection) {
      const nextInspection = new Date(asset.lastInspection);
      nextInspection.setDate(nextInspection.getDate() + 90); // 90 days frequency

      controls.push({
        id: `control_${assetId}_inspection`,
        name: 'Regular Inspection',
        type: 'Preventive',
        frequency: 'Quarterly',
        lastPerformed: asset.lastInspection,
        nextDue: nextInspection,
        status: nextInspection < new Date() ? 'Overdue' : 'Compliant',
        responsible: 'Maintenance Team',
        description: 'Regular inspection to identify potential issues',
      });
    }

    // Add maintenance control
    controls.push({
      id: `control_${assetId}_maintenance`,
      name: 'Preventive Maintenance',
      type: 'Preventive',
      frequency: 'Monthly',
      lastPerformed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      nextDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'Compliant',
      responsible: 'Maintenance Team',
      description: 'Preventive maintenance to ensure optimal performance',
    });

    // Add monitoring control for critical assets
    if (asset.priority === 'CRITICAL') {
      controls.push({
        id: `control_${assetId}_monitoring`,
        name: 'Continuous Monitoring',
        type: 'Detective',
        frequency: 'Daily',
        lastPerformed: new Date(),
        nextDue: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        status: 'Compliant',
        responsible: 'Operations Team',
        description: 'Continuous monitoring of critical asset performance',
      });
    }

    return controls;
  }

  /**
   * Calculate risk score for an asset
   */
  private async calculateRiskScore(
    asset: any,
    controls: CriticalControl[]
  ): Promise<number> {
    let riskScore = 0;

    // Base risk from priority
    const priorityRisk = {
      CRITICAL: 40,
      HIGH: 30,
      MEDIUM: 20,
      LOW: 10,
    };
    riskScore +=
      priorityRisk[asset.priority as keyof typeof priorityRisk] || 20;

    // Risk from condition
    const conditionRisk = {
      CRITICAL: 30,
      POOR: 20,
      FAIR: 10,
      GOOD: 5,
      EXCELLENT: 0,
    };
    riskScore +=
      conditionRisk[asset.condition as keyof typeof conditionRisk] || 10;

    // Risk from overdue controls
    const overdueControls = controls.filter(
      control => control.status === 'Overdue'
    ).length;
    riskScore += overdueControls * 10;

    // Risk from open work orders
    const openWorkOrders = asset.workOrders?.length || 0;
    riskScore += openWorkOrders * 5;

    // Risk from age (if installation date available)
    if (asset.installationDate) {
      const ageInYears =
        (new Date().getTime() - new Date(asset.installationDate).getTime()) /
        (1000 * 60 * 60 * 24 * 365);
      if (ageInYears > 20) riskScore += 15;
      else if (ageInYears > 10) riskScore += 10;
      else if (ageInYears > 5) riskScore += 5;
    }

    return Math.min(riskScore, 100); // Cap at 100
  }

  /**
   * Determine compliance status
   */
  private determineComplianceStatus(
    asset: any,
    controls: CriticalControl[]
  ): 'Compliant' | 'Non-Compliant' | 'Overdue' | 'Unknown' {
    if (controls.length === 0) {
      return 'Unknown';
    }

    const overdueControls = controls.filter(
      control => control.status === 'Overdue'
    ).length;
    const nonCompliantControls = controls.filter(
      control => control.status === 'Non-Compliant'
    ).length;

    if (overdueControls > 0) {
      return 'Overdue';
    } else if (nonCompliantControls > 0) {
      return 'Non-Compliant';
    } else {
      return 'Compliant';
    }
  }

  /**
   * Calculate next assessment date
   */
  private calculateNextAssessment(asset: any): Date {
    if (asset.lastInspection) {
      const nextAssessment = new Date(asset.lastInspection);
      nextAssessment.setDate(
        nextAssessment.getDate() + (asset.inspectionFrequency || 90)
      );
      return nextAssessment;
    } else {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    }
  }

  /**
   * Helper methods
   */

  private mapPriorityToCriticality(
    priority: string
  ): 'Critical' | 'High' | 'Medium' | 'Low' {
    const criticalityMap: Record<
      string,
      'Critical' | 'High' | 'Medium' | 'Low'
    > = {
      CRITICAL: 'Critical',
      HIGH: 'High',
      MEDIUM: 'Medium',
      LOW: 'Low',
    };
    return criticalityMap[priority] || 'Medium';
  }

  private getCriticalityReason(asset: any): string {
    const reasons = [];

    if (asset.priority === 'CRITICAL') {
      reasons.push('High priority designation');
    }

    if (asset.tags?.includes('critical-asset')) {
      reasons.push('Critical asset tag');
    }

    if (asset.tags?.includes('high-consequence')) {
      reasons.push('High consequence failure');
    }

    if (asset.currentValue && Number(asset.currentValue) > 1000000) {
      reasons.push('High asset value');
    }

    return reasons.join(', ') || 'Standard criticality assessment';
  }

  private getServiceImpact(asset: any): string {
    const impactMap: Record<string, string> = {
      BUILDING: 'Facility operations and occupant safety',
      ROAD: 'Transportation network and public safety',
      BRIDGE: 'Transportation connectivity and structural integrity',
      WATER_SUPPLY: 'Water service delivery and public health',
      SEWER: 'Wastewater management and environmental protection',
      ELECTRICAL_INFRASTRUCTURE: 'Power distribution and electrical safety',
    };

    return impactMap[asset.assetType] || 'General service impact';
  }

  private getFailureConsequences(asset: any): string[] {
    const consequences = [];

    if (asset.priority === 'CRITICAL') {
      consequences.push('Service disruption');
      consequences.push('Safety risk');
      consequences.push('Financial impact');
    }

    if (asset.assetType === 'ROAD' || asset.assetType === 'BRIDGE') {
      consequences.push('Traffic disruption');
      consequences.push('Emergency response delays');
    }

    if (asset.assetType === 'WATER_SUPPLY' || asset.assetType === 'SEWER') {
      consequences.push('Public health risk');
      consequences.push('Environmental impact');
    }

    return consequences.length > 0 ? consequences : ['Service disruption'];
  }
}

export const criticalAssetElevation = new CriticalAssetElevation();
