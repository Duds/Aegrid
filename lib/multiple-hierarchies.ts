/**
 * Multiple Hierarchy Support System
 *
 * Implements Aegrid Rule 4: Operate with Margin
 * This system supports overlapping asset hierarchies with function-based anchoring,
 * enabling flexible asset organisation aligned with different business needs.
 *
 * @fileoverview Multiple hierarchy support for flexible asset organisation
 */

import { PrismaClient } from '@prisma/client';
import { AssetGraphOperations, GraphVertex as _GraphVertex } from './cosmos-db';

export interface HierarchyNode {
  id: string;
  name: string;
  type: string;
  level: number;
  parentId?: string;
  children: HierarchyNode[];
  assetCount: number;
  totalValue: number;
  criticalAssetCount: number;
  metadata: Record<string, any>;
}

export interface HierarchyView {
  id: string;
  name: string;
  type: 'Function' | 'Geographic' | 'Organisational' | 'Funding';
  description: string;
  organisationId: string;
  rootNodes: HierarchyNode[];
  totalAssets: number;
  totalValue: number;
  lastUpdated: Date;
}

export interface AssetHierarchyContext {
  assetId: string;
  hierarchies: {
    function: HierarchyNode[];
    geographic: HierarchyNode[];
    organisational: HierarchyNode[];
    funding: HierarchyNode[];
  };
  primaryHierarchy: string;
  crossHierarchyRelationships: Array<{
    fromHierarchy: string;
    toHierarchy: string;
    relationship: string;
  }>;
}

export class MultipleHierarchySupport {
  private prisma: PrismaClient;
  private graphOps: AssetGraphOperations;

  constructor() {
    this.prisma = new PrismaClient();
    this.graphOps = new AssetGraphOperations();
  }

  /**
   * Get function-based hierarchy
   */
  async getFunctionHierarchy(organisationId: string): Promise<HierarchyView> {
    const serviceFunctions = await this.graphOps.client.getVerticesByLabel(
      'ServiceFunction',
      {
        organisationId,
      }
    );

    const rootNodes: HierarchyNode[] = [];
    const categoryMap = new Map<string, HierarchyNode>();

    // Group functions by category
    for (const func of serviceFunctions) {
      const category = func.properties.category || 'General';

      if (!categoryMap.has(category)) {
        const categoryNode: HierarchyNode = {
          id: `cat_${category}`,
          name: category,
          type: 'Category',
          level: 0,
          children: [],
          assetCount: 0,
          totalValue: 0,
          criticalAssetCount: 0,
          metadata: { category },
        };
        categoryMap.set(category, categoryNode);
        rootNodes.push(categoryNode);
      }

      const categoryNode = categoryMap.get(category)!;
      const assets = await this.graphOps.getAssetsByServiceFunction(func.id);

      const assetData = await Promise.all(
        assets.map(async asset => {
          const assetRecord = await this.prisma.asset.findUnique({
            where: { id: asset.id },
            select: {
              currentValue: true,
              priority: true,
            },
          });
          return assetRecord;
        })
      );

      const totalValue = assetData.reduce(
        (sum, asset) =>
          sum + (asset?.currentValue ? Number(asset.currentValue) : 0),
        0
      );

      const criticalAssetCount = assetData.filter(
        asset => asset?.priority === 'CRITICAL'
      ).length;

      const functionNode: HierarchyNode = {
        id: func.id,
        name: func.properties.name,
        type: 'ServiceFunction',
        level: 1,
        parentId: categoryNode.id,
        children: [],
        assetCount: assets.length,
        totalValue,
        criticalAssetCount,
        metadata: {
          description: func.properties.description,
          category: func.properties.category,
        },
      };

      categoryNode.children.push(functionNode);
      categoryNode.assetCount += assets.length;
      categoryNode.totalValue += totalValue;
      categoryNode.criticalAssetCount += criticalAssetCount;
    }

    const totalAssets = rootNodes.reduce(
      (sum, node) => sum + node.assetCount,
      0
    );
    const totalValue = rootNodes.reduce(
      (sum, node) => sum + node.totalValue,
      0
    );

    return {
      id: `func_hierarchy_${organisationId}`,
      name: 'Function-Based Hierarchy',
      type: 'Function',
      description: 'Assets organised by service purpose and function',
      organisationId,
      rootNodes: rootNodes.sort((a, b) => b.totalValue - a.totalValue),
      totalAssets,
      totalValue,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get geographic hierarchy
   */
  async getGeographicHierarchy(organisationId: string): Promise<HierarchyView> {
    const locations = await this.graphOps.client.getVerticesByLabel(
      'Location',
      {
        organisationId,
      }
    );

    const rootNodes: HierarchyNode[] = [];
    const nodeMap = new Map<string, HierarchyNode>();

    // Build hierarchy tree
    for (const location of locations) {
      const node: HierarchyNode = {
        id: location.id,
        name: location.properties.name,
        type: location.properties.type,
        level: this.getLocationLevel(location.properties.type),
        parentId: location.properties.parentId || undefined,
        children: [],
        assetCount: 0,
        totalValue: 0,
        criticalAssetCount: 0,
        metadata: {
          coordinates:
            location.properties.latitude && location.properties.longitude
              ? {
                  lat: location.properties.latitude,
                  lng: location.properties.longitude,
                }
              : undefined,
        },
      };

      nodeMap.set(node.id, node);
    }

    // Build parent-child relationships
    for (const node of nodeMap.values()) {
      if (node.parentId && nodeMap.has(node.parentId)) {
        const parent = nodeMap.get(node.parentId)!;
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }

    // Calculate asset counts and values for each node
    for (const node of nodeMap.values()) {
      const assets = await this.graphOps.getAssetsByLocation(node.id);

      const assetData = await Promise.all(
        assets.map(async asset => {
          const assetRecord = await this.prisma.asset.findUnique({
            where: { id: asset.id },
            select: {
              currentValue: true,
              priority: true,
            },
          });
          return assetRecord;
        })
      );

      node.assetCount = assets.length;
      node.totalValue = assetData.reduce(
        (sum, asset) =>
          sum + (asset?.currentValue ? Number(asset.currentValue) : 0),
        0
      );
      node.criticalAssetCount = assetData.filter(
        asset => asset?.priority === 'CRITICAL'
      ).length;
    }

    // Propagate counts up the hierarchy
    this.propagateCountsUp(rootNodes);

    const totalAssets = rootNodes.reduce(
      (sum, node) => sum + node.assetCount,
      0
    );
    const totalValue = rootNodes.reduce(
      (sum, node) => sum + node.totalValue,
      0
    );

    return {
      id: `geo_hierarchy_${organisationId}`,
      name: 'Geographic Hierarchy',
      type: 'Geographic',
      description: 'Assets organised by geographic location and regions',
      organisationId,
      rootNodes: rootNodes.sort((a, b) => b.assetCount - a.assetCount),
      totalAssets,
      totalValue,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get organisational hierarchy
   */
  async getOrganisationalHierarchy(
    organisationId: string
  ): Promise<HierarchyView> {
    // For now, create a simple organisational structure
    // In a real implementation, this would come from organisational data
    const rootNodes: HierarchyNode[] = [
      {
        id: `org_${organisationId}_operations`,
        name: 'Operations',
        type: 'Division',
        level: 0,
        children: [
          {
            id: `org_${organisationId}_maintenance`,
            name: 'Maintenance',
            type: 'Department',
            level: 1,
            parentId: `org_${organisationId}_operations`,
            children: [],
            assetCount: 0,
            totalValue: 0,
            criticalAssetCount: 0,
            metadata: { department: 'Maintenance' },
          },
          {
            id: `org_${organisationId}_planning`,
            name: 'Planning',
            type: 'Department',
            level: 1,
            parentId: `org_${organisationId}_operations`,
            children: [],
            assetCount: 0,
            totalValue: 0,
            criticalAssetCount: 0,
            metadata: { department: 'Planning' },
          },
        ],
        assetCount: 0,
        totalValue: 0,
        criticalAssetCount: 0,
        metadata: { division: 'Operations' },
      },
      {
        id: `org_${organisationId}_finance`,
        name: 'Finance',
        type: 'Division',
        level: 0,
        children: [
          {
            id: `org_${organisationId}_budget`,
            name: 'Budget Management',
            type: 'Department',
            level: 1,
            parentId: `org_${organisationId}_finance`,
            children: [],
            assetCount: 0,
            totalValue: 0,
            criticalAssetCount: 0,
            metadata: { department: 'Budget' },
          },
        ],
        assetCount: 0,
        totalValue: 0,
        criticalAssetCount: 0,
        metadata: { division: 'Finance' },
      },
    ];

    // Calculate asset counts based on asset tags or other organisational indicators
    for (const node of this.getAllNodes(rootNodes)) {
      const assets = await this.prisma.asset.findMany({
        where: {
          organisationId,
          tags: {
            has: `org:${node.metadata.department || node.metadata.division}`,
          },
        },
        select: {
          currentValue: true,
          priority: true,
        },
      });

      node.assetCount = assets.length;
      node.totalValue = assets.reduce(
        (sum, asset) =>
          sum + (asset.currentValue ? Number(asset.currentValue) : 0),
        0
      );
      node.criticalAssetCount = assets.filter(
        asset => asset.priority === 'CRITICAL'
      ).length;
    }

    // Propagate counts up the hierarchy
    this.propagateCountsUp(rootNodes);

    const totalAssets = rootNodes.reduce(
      (sum, node) => sum + node.assetCount,
      0
    );
    const totalValue = rootNodes.reduce(
      (sum, node) => sum + node.totalValue,
      0
    );

    return {
      id: `org_hierarchy_${organisationId}`,
      name: 'Organisational Hierarchy',
      type: 'Organisational',
      description:
        'Assets organised by organisational structure and departments',
      organisationId,
      rootNodes: rootNodes.sort((a, b) => b.assetCount - a.assetCount),
      totalAssets,
      totalValue,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get funding hierarchy
   */
  async getFundingHierarchy(organisationId: string): Promise<HierarchyView> {
    // Create funding categories based on asset types and purposes
    const fundingCategories = [
      { name: 'Infrastructure', description: 'Core infrastructure assets' },
      { name: 'Community Services', description: 'Community-focused assets' },
      { name: 'Transportation', description: 'Transportation infrastructure' },
      { name: 'Utilities', description: 'Utility infrastructure' },
      { name: 'General', description: 'General purpose assets' },
    ];

    const rootNodes: HierarchyNode[] = [];

    for (const category of fundingCategories) {
      const assets = await this.prisma.asset.findMany({
        where: {
          organisationId,
          OR: [
            { assetType: this.getAssetTypesForCategory(category.name) },
            { tags: { has: `funding:${category.name.toLowerCase()}` } },
          ],
        },
        select: {
          currentValue: true,
          priority: true,
          purchasePrice: true,
        },
      });

      const totalValue = assets.reduce(
        (sum, asset) =>
          sum + (asset.currentValue ? Number(asset.currentValue) : 0),
        0
      );

      const criticalAssetCount = assets.filter(
        asset => asset.priority === 'CRITICAL'
      ).length;

      rootNodes.push({
        id: `funding_${category.name.toLowerCase()}`,
        name: category.name,
        type: 'FundingCategory',
        level: 0,
        children: [],
        assetCount: assets.length,
        totalValue,
        criticalAssetCount,
        metadata: {
          description: category.description,
          category: category.name,
        },
      });
    }

    const totalAssets = rootNodes.reduce(
      (sum, node) => sum + node.assetCount,
      0
    );
    const totalValue = rootNodes.reduce(
      (sum, node) => sum + node.totalValue,
      0
    );

    return {
      id: `funding_hierarchy_${organisationId}`,
      name: 'Funding Hierarchy',
      type: 'Funding',
      description:
        'Assets organised by funding categories and budget allocation',
      organisationId,
      rootNodes: rootNodes.sort((a, b) => b.totalValue - a.totalValue),
      totalAssets,
      totalValue,
      lastUpdated: new Date(),
    };
  }

  /**
   * Get asset hierarchy context for a specific asset
   */
  async getAssetHierarchyContext(
    assetId: string
  ): Promise<AssetHierarchyContext> {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      select: { organisationId: true },
    });

    if (!asset) {
      throw new Error(`Asset ${assetId} not found`);
    }

    const organisationId = asset.organisationId;

    // Get all hierarchy views
    const [
      functionHierarchy,
      geographicHierarchy,
      organisationalHierarchy,
      fundingHierarchy,
    ] = await Promise.all([
      this.getFunctionHierarchy(organisationId),
      this.getGeographicHierarchy(organisationId),
      this.getOrganisationalHierarchy(organisationId),
      this.getFundingHierarchy(organisationId),
    ]);

    // Find asset in each hierarchy
    const functionNodes = this.findAssetInHierarchy(
      assetId,
      functionHierarchy.rootNodes
    );
    const geographicNodes = this.findAssetInHierarchy(
      assetId,
      geographicHierarchy.rootNodes
    );
    const organisationalNodes = this.findAssetInHierarchy(
      assetId,
      organisationalHierarchy.rootNodes
    );
    const fundingNodes = this.findAssetInHierarchy(
      assetId,
      fundingHierarchy.rootNodes
    );

    // Determine primary hierarchy (function-based by default per Aegrid Rule 1)
    const primaryHierarchy = 'function';

    // Identify cross-hierarchy relationships
    const crossHierarchyRelationships =
      this.identifyCrossHierarchyRelationships(
        functionNodes,
        geographicNodes,
        organisationalNodes,
        fundingNodes
      );

    return {
      assetId,
      hierarchies: {
        function: functionNodes,
        geographic: geographicNodes,
        organisational: organisationalNodes,
        funding: fundingNodes,
      },
      primaryHierarchy,
      crossHierarchyRelationships,
    };
  }

  /**
   * Get all hierarchy views for an organisation
   */
  async getAllHierarchyViews(organisationId: string): Promise<HierarchyView[]> {
    const [
      functionHierarchy,
      geographicHierarchy,
      organisationalHierarchy,
      fundingHierarchy,
    ] = await Promise.all([
      this.getFunctionHierarchy(organisationId),
      this.getGeographicHierarchy(organisationId),
      this.getOrganisationalHierarchy(organisationId),
      this.getFundingHierarchy(organisationId),
    ]);

    return [
      functionHierarchy,
      geographicHierarchy,
      organisationalHierarchy,
      fundingHierarchy,
    ];
  }

  /**
   * Helper methods
   */

  private getLocationLevel(type: string): number {
    const levelMap: Record<string, number> = {
      Region: 0,
      Area: 1,
      Site: 2,
      Zone: 3,
    };
    return levelMap[type] || 0;
  }

  private propagateCountsUp(nodes: HierarchyNode[]): void {
    for (const node of nodes) {
      if (node.children.length > 0) {
        this.propagateCountsUp(node.children);

        node.assetCount = node.children.reduce(
          (sum, child) => sum + child.assetCount,
          0
        );
        node.totalValue = node.children.reduce(
          (sum, child) => sum + child.totalValue,
          0
        );
        node.criticalAssetCount = node.children.reduce(
          (sum, child) => sum + child.criticalAssetCount,
          0
        );
      }
    }
  }

  private getAllNodes(nodes: HierarchyNode[]): HierarchyNode[] {
    const allNodes: HierarchyNode[] = [];

    for (const node of nodes) {
      allNodes.push(node);
      allNodes.push(...this.getAllNodes(node.children));
    }

    return allNodes;
  }

  private findAssetInHierarchy(
    assetId: string,
    nodes: HierarchyNode[]
  ): HierarchyNode[] {
    const foundNodes: HierarchyNode[] = [];

    for (const node of nodes) {
      // This would need to be implemented based on how assets are linked to hierarchy nodes
      // For now, return empty array
      foundNodes.push(...this.findAssetInHierarchy(assetId, node.children));
    }

    return foundNodes;
  }

  private identifyCrossHierarchyRelationships(
    functionNodes: HierarchyNode[],
    geographicNodes: HierarchyNode[],
    organisationalNodes: HierarchyNode[],
    fundingNodes: HierarchyNode[]
  ): Array<{
    fromHierarchy: string;
    toHierarchy: string;
    relationship: string;
  }> {
    const relationships = [];

    // Identify relationships between hierarchies
    if (functionNodes.length > 0 && geographicNodes.length > 0) {
      relationships.push({
        fromHierarchy: 'function',
        toHierarchy: 'geographic',
        relationship: 'spatial_distribution',
      });
    }

    if (functionNodes.length > 0 && organisationalNodes.length > 0) {
      relationships.push({
        fromHierarchy: 'function',
        toHierarchy: 'organisational',
        relationship: 'responsibility_mapping',
      });
    }

    if (functionNodes.length > 0 && fundingNodes.length > 0) {
      relationships.push({
        fromHierarchy: 'function',
        toHierarchy: 'funding',
        relationship: 'value_allocation',
      });
    }

    return relationships;
  }

  private getAssetTypesForCategory(category: string): any {
    const categoryMap: Record<string, any> = {
      Infrastructure: [
        'BUILDING',
        'DRAINAGE',
        'WATER_SUPPLY',
        'SEWER',
        'ELECTRICAL_INFRASTRUCTURE',
      ],
      'Community Services': [
        'PARK',
        'PLAYGROUND',
        'SPORTS_FACILITY',
        'LIBRARY',
        'COMMUNITY_CENTRE',
      ],
      Transportation: [
        'ROAD',
        'BRIDGE',
        'FOOTPATH',
        'CAR_PARK',
        'TRAFFIC_LIGHT',
      ],
      Utilities: [
        'WATER_SUPPLY',
        'SEWER',
        'ELECTRICAL_INFRASTRUCTURE',
        'TELECOMMUNICATIONS',
      ],
      General: ['STREET_FURNITURE', 'STREET_LIGHT', 'OTHER'],
    };

    return categoryMap[category] || [];
  }
}

export const multipleHierarchySupport = new MultipleHierarchySupport();
