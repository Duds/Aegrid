/**
 * Traditional Infrastructure Assets Generator
 *
 * Creates 200 traditional infrastructure assets for Greenfield Shire Council
 * including buildings, roads, bridges, parks, and utilities infrastructure.
 *
 * Asset Distribution:
 * - Buildings (45): Council chambers, libraries, community centers, fire stations
 * - Roads (60): Main roads, residential streets, highways
 * - Bridges (8): Road bridges, footbridges, pedestrian crossings
 * - Footpaths (40): Pedestrian walkways, shared paths
 * - Parks (25): Public parks, reserves, open spaces
 * - Playgrounds (15): Playground equipment and facilities
 * - Sports Facilities (7): Sports grounds, courts, facilities
 */

import { AssetCondition, AssetPriority, AssetStatus, AssetType, PrismaClient } from '@prisma/client';

export async function generateTraditionalAssets(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  🏢 Creating traditional infrastructure assets...');

  let assetCount = 0;

  // Buildings (45 assets)
  const buildings = [
    // Council Buildings
    {
      assetNumber: 'BLD-001',
      name: 'Greenfield Council Chambers',
      description: 'Main administrative building housing council offices and meeting rooms',
      assetType: AssetType.BUILDING,
      status: AssetStatus.ACTIVE,
      condition: AssetCondition.GOOD,
      priority: AssetPriority.HIGH,
      purpose: 'Administration',
      purposeDescription: 'Primary administrative facility for council operations',
      criticalityLevel: 'High',
      serviceImpact: 'Council administration and public services',
      functionBasedCategory: 'Administrative Infrastructure',
      address: '123 Main Street',
      suburb: 'Greenfield',
      postcode: '2830',
      state: 'NSW',
      country: 'Australia',
      manufacturer: 'Local Builder',
      model: 'Custom Design',
      installationDate: new Date('1985-06-15'),
      expectedLifespan: 50,
      purchasePrice: 2500000.00,
      currentValue: 1800000.00,
      replacementCost: 3500000.00,
      depreciationRate: 2.0,
      inspectionFrequency: 365,
      maintenanceCost: 50000.00,
      tags: ['building', 'administration', 'council', 'public'],
      notes: 'Heritage-listed building requiring special maintenance'
    },
    {
      assetNumber: 'BLD-002',
      name: 'Greenfield Public Library',
      description: 'Community library with digital services and meeting rooms',
      assetType: AssetType.LIBRARY,
      status: AssetStatus.ACTIVE,
      condition: AssetCondition.EXCELLENT,
      priority: AssetPriority.MEDIUM,
      purpose: 'Education',
      purposeDescription: 'Community education and information services',
      criticalityLevel: 'Medium',
      serviceImpact: 'Community education and digital access',
      functionBasedCategory: 'Educational Infrastructure',
      address: '456 Library Lane',
      suburb: 'Greenfield',
      postcode: '2830',
      state: 'NSW',
      country: 'Australia',
      manufacturer: 'Modern Construction',
      model: 'Library Design',
      installationDate: new Date('2010-03-20'),
      expectedLifespan: 40,
      purchasePrice: 1800000.00,
      currentValue: 1500000.00,
      replacementCost: 2200000.00,
      depreciationRate: 2.5,
      inspectionFrequency: 180,
      maintenanceCost: 25000.00,
      tags: ['library', 'community', 'education', 'digital'],
      notes: 'Modern facility with energy-efficient design'
    },
    {
      assetNumber: 'BLD-003',
      name: 'Greenfield Community Centre',
      description: 'Multi-purpose community facility for events and programs',
      assetType: AssetType.COMMUNITY_CENTRE,
      status: AssetStatus.ACTIVE,
      condition: AssetCondition.GOOD,
      priority: AssetPriority.MEDIUM,
      purpose: 'Community Services',
      purposeDescription: 'Community events, programs, and social services',
      criticalityLevel: 'Medium',
      serviceImpact: 'Community engagement and social services',
      functionBasedCategory: 'Community Infrastructure',
      address: '789 Community Drive',
      suburb: 'Greenfield',
      postcode: '2830',
      state: 'NSW',
      country: 'Australia',
      manufacturer: 'Community Builders',
      model: 'Multi-Purpose Design',
      installationDate: new Date('2015-08-10'),
      expectedLifespan: 35,
      purchasePrice: 1200000.00,
      currentValue: 900000.00,
      replacementCost: 1400000.00,
      depreciationRate: 2.86,
      inspectionFrequency: 180,
      maintenanceCost: 20000.00,
      tags: ['community', 'events', 'programs', 'social'],
      notes: 'Flexible space design for multiple community uses'
    },
    {
      assetNumber: 'BLD-004',
      name: 'Greenfield Fire Station',
      description: 'Emergency services facility housing fire fighting equipment and vehicles',
      assetType: AssetType.BUILDING,
      status: AssetStatus.ACTIVE,
      condition: AssetCondition.GOOD,
      priority: AssetPriority.CRITICAL,
      purpose: 'Emergency Services',
      purposeDescription: 'Emergency response and fire protection services',
      criticalityLevel: 'Critical',
      serviceImpact: 'Emergency response and community safety',
      functionBasedCategory: 'Emergency Infrastructure',
      address: '555 Fire Station Road',
      suburb: 'Greenfield',
      postcode: '2830',
      state: 'NSW',
      country: 'Australia',
      manufacturer: 'Emergency Builders',
      model: 'Fire Station Design',
      installationDate: new Date('2020-01-15'),
      expectedLifespan: 40,
      purchasePrice: 2800000.00,
      currentValue: 2400000.00,
      replacementCost: 3200000.00,
      depreciationRate: 2.5,
      inspectionFrequency: 90,
      maintenanceCost: 75000.00,
      tags: ['emergency', 'fire', 'safety', 'critical'],
      notes: 'Modern fire station with advanced equipment and training facilities'
    }
  ];

  // Roads (60 assets) - Sample of main roads
  const roads = [
    {
      assetNumber: 'RD-001',
      name: 'Main Street - Highway 1',
      description: 'Primary arterial road connecting Greenfield to regional highway network',
      assetType: AssetType.ROAD,
      status: AssetStatus.ACTIVE,
      condition: AssetCondition.GOOD,
      priority: AssetPriority.HIGH,
      purpose: 'Transportation',
      purposeDescription: 'Primary transport corridor for regional connectivity',
      criticalityLevel: 'High',
      serviceImpact: 'Regional transport connectivity and economic activity',
      functionBasedCategory: 'Transportation Infrastructure',
      address: 'Highway 1',
      suburb: 'Greenfield',
      postcode: '2830',
      state: 'NSW',
      country: 'Australia',
      manufacturer: 'Road Construction Co',
      model: 'Arterial Road Design',
      installationDate: new Date('2018-03-01'),
      expectedLifespan: 25,
      purchasePrice: 5000000.00,
      currentValue: 4000000.00,
      replacementCost: 6000000.00,
      depreciationRate: 4.0,
      inspectionFrequency: 90,
      maintenanceCost: 150000.00,
      tags: ['highway', 'arterial', 'transport', 'regional'],
      notes: 'Major transport corridor requiring regular maintenance and monitoring'
    },
    {
      assetNumber: 'RD-002',
      name: 'Greenfield Main Street',
      description: 'Primary commercial street in Greenfield CBD',
      assetType: AssetType.ROAD,
      status: AssetStatus.ACTIVE,
      condition: AssetCondition.FAIR,
      priority: AssetPriority.MEDIUM,
      purpose: 'Transportation',
      purposeDescription: 'Local commercial and pedestrian traffic',
      criticalityLevel: 'Medium',
      serviceImpact: 'Local commerce and pedestrian access',
      functionBasedCategory: 'Transportation Infrastructure',
      address: 'Main Street',
      suburb: 'Greenfield',
      postcode: '2830',
      state: 'NSW',
      country: 'Australia',
      manufacturer: 'Local Roadworks',
      model: 'Commercial Street Design',
      installationDate: new Date('2015-06-15'),
      expectedLifespan: 20,
      purchasePrice: 800000.00,
      currentValue: 600000.00,
      replacementCost: 1000000.00,
      depreciationRate: 5.0,
      inspectionFrequency: 180,
      maintenanceCost: 30000.00,
      tags: ['commercial', 'cbd', 'pedestrian', 'local'],
      notes: 'Commercial street with high pedestrian traffic requiring regular maintenance'
    }
  ];

  // Parks (25 assets) - Sample of major parks
  const parks = [
    {
      assetNumber: 'PRK-001',
      name: 'Greenfield Central Park',
      description: 'Main public park with gardens, walking paths, and recreational facilities',
      assetType: AssetType.PARK,
      status: AssetStatus.ACTIVE,
      condition: AssetCondition.EXCELLENT,
      priority: AssetPriority.MEDIUM,
      purpose: 'Recreation',
      purposeDescription: 'Public recreation and community gathering space',
      criticalityLevel: 'Medium',
      serviceImpact: 'Community recreation and social wellbeing',
      functionBasedCategory: 'Recreational Infrastructure',
      address: 'Central Park Drive',
      suburb: 'Greenfield',
      postcode: '2830',
      state: 'NSW',
      country: 'Australia',
      manufacturer: 'Landscape Design Co',
      model: 'Urban Park Design',
      installationDate: new Date('2012-09-01'),
      expectedLifespan: 50,
      purchasePrice: 600000.00,
      currentValue: 500000.00,
      replacementCost: 800000.00,
      depreciationRate: 2.0,
      inspectionFrequency: 90,
      maintenanceCost: 40000.00,
      tags: ['park', 'recreation', 'community', 'gardens'],
      notes: 'Well-maintained central park with diverse recreational facilities'
    }
  ];

  // Combine all asset arrays
  const allAssets = [...buildings, ...roads, ...parks];

  // Create assets in database
  for (const assetData of allAssets) {
    await prisma.asset.upsert({
      where: { assetNumber: assetData.assetNumber },
      update: {},
      create: {
        ...assetData,
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Generate additional assets programmatically for full count
  const additionalAssetTypes = [
    { type: AssetType.BUILDING, count: 41, prefix: 'BLD' },
    { type: AssetType.ROAD, count: 58, prefix: 'RD' },
    { type: AssetType.BRIDGE, count: 8, prefix: 'BRG' },
    { type: AssetType.FOOTPATH, count: 40, prefix: 'FP' },
    { type: AssetType.PARK, count: 24, prefix: 'PRK' },
    { type: AssetType.PLAYGROUND, count: 15, prefix: 'PLG' },
    { type: AssetType.SPORTS_FACILITY, count: 7, prefix: 'SPT' },
  ];

  for (const assetType of additionalAssetTypes) {
    for (let i = 0; i < assetType.count; i++) {
      const assetNumber = `${assetType.prefix}-${String(i + 1).padStart(3, '0')}`;
      const condition = [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)];
      const priority = [AssetPriority.LOW, AssetPriority.MEDIUM, AssetPriority.HIGH][Math.floor(Math.random() * 3)];

      await prisma.asset.upsert({
        where: { assetNumber },
        update: {},
        create: {
          assetNumber,
          name: `${assetType.type} Asset ${i + 1}`,
          description: `Traditional infrastructure asset of type ${assetType.type}`,
          assetType: assetType.type,
          status: AssetStatus.ACTIVE,
          condition,
          priority,
          purpose: 'Infrastructure',
          purposeDescription: `Traditional infrastructure serving community needs`,
          criticalityLevel: priority === AssetPriority.HIGH ? 'High' : 'Medium',
          serviceImpact: 'Community infrastructure services',
          functionBasedCategory: 'Traditional Infrastructure',
          address: `${Math.floor(Math.random() * 999) + 1} Sample Street`,
          suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
          postcode: '2830',
          state: 'NSW',
          country: 'Australia',
          manufacturer: 'Local Manufacturer',
          model: 'Standard Model',
          installationDate: new Date(2015 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
          expectedLifespan: 20 + Math.floor(Math.random() * 30),
          purchasePrice: 10000 + Math.random() * 990000,
          currentValue: 8000 + Math.random() * 792000,
          replacementCost: 12000 + Math.random() * 1188000,
          depreciationRate: 2 + Math.random() * 8,
          inspectionFrequency: 30 + Math.floor(Math.random() * 335),
          maintenanceCost: 1000 + Math.random() * 49000,
          tags: ['traditional', 'infrastructure', assetType.type.toLowerCase()],
          notes: `Traditional ${assetType.type} asset requiring regular maintenance`,
          organisationId,
          createdBy: null,
          updatedBy: null,
          lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
          nextInspection: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
        },
      });
      assetCount++;
    }
  }

  console.log(`   ✅ Created ${assetCount} traditional infrastructure assets`);
  console.log(`   📊 Asset breakdown:`);
  console.log(`      - Buildings: 45`);
  console.log(`      - Roads: 60`);
  console.log(`      - Bridges: 8`);
  console.log(`      - Footpaths: 40`);
  console.log(`      - Parks: 25`);
  console.log(`      - Playgrounds: 15`);
  console.log(`      - Sports Facilities: 7`);

  return assetCount;
}
