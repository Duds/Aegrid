/**
 * Specialised Infrastructure Assets Generator
 *
 * Creates 100 specialised infrastructure assets for Greenfield Shire Council
 * including telecommunications, water infrastructure, waste management, and emergency services.
 */

import { AssetCondition, AssetPriority, AssetStatus, AssetType, PrismaClient } from '@prisma/client';

export async function generateSpecialisedAssets(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  🔧 Creating specialised infrastructure assets...');

  let assetCount = 0;

  // Telecommunications Infrastructure (25 assets)
  for (let i = 1; i <= 25; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `TEL-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `TEL-${String(i).padStart(3, '0')}`,
        name: `Telecommunications Tower ${i}`,
        description: `Communication tower for cellular and emergency services`,
        assetType: AssetType.TELECOMMUNICATIONS,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Communication Services',
        purposeDescription: 'Telecommunications infrastructure for community connectivity',
        criticalityLevel: 'High',
        serviceImpact: 'Community communication and emergency services',
        functionBasedCategory: 'Telecommunications Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Communication Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'CommTech Systems',
        model: 'CT-TOWER-150',
        serialNumber: `CT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 20,
        purchasePrice: 150000 + Math.random() * 250000,
        currentValue: 120000 + Math.random() * 200000,
        replacementCost: 180000 + Math.random() * 300000,
        depreciationRate: 5,
        inspectionFrequency: 180,
        maintenanceCost: 5000 + Math.random() * 10000,
        tags: ['telecommunications', 'tower', 'communication', 'emergency'],
        notes: 'Telecommunications tower for cellular and emergency services',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Water Infrastructure (30 assets)
  for (let i = 1; i <= 30; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `WAT-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `WAT-${String(i).padStart(3, '0')}`,
        name: `Water Infrastructure ${i}`,
        description: `Water treatment, storage, or distribution infrastructure`,
        assetType: AssetType.WATER_SUPPLY,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.CRITICAL,
        purpose: 'Water Supply',
        purposeDescription: 'Water treatment, storage, and distribution infrastructure',
        criticalityLevel: 'Critical',
        serviceImpact: 'Community water supply and public health',
        functionBasedCategory: 'Water Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Water Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'WaterTech Solutions',
        model: 'WT-INFRA-300',
        serialNumber: `WT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 25,
        purchasePrice: 100000 + Math.random() * 400000,
        currentValue: 80000 + Math.random() * 320000,
        replacementCost: 120000 + Math.random() * 480000,
        depreciationRate: 4,
        inspectionFrequency: 90,
        maintenanceCost: 3000 + Math.random() * 8000,
        tags: ['water', 'infrastructure', 'treatment', 'distribution'],
        notes: 'Water treatment, storage, or distribution infrastructure',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Waste Management (20 assets)
  for (let i = 1; i <= 20; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `WAS-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `WAS-${String(i).padStart(3, '0')}`,
        name: `Waste Management Facility ${i}`,
        description: `Waste collection, treatment, or recycling facility`,
        assetType: AssetType.OTHER,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Waste Management',
        purposeDescription: 'Waste collection, treatment, and recycling infrastructure',
        criticalityLevel: 'High',
        serviceImpact: 'Waste management and environmental protection',
        functionBasedCategory: 'Waste Management Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Waste Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'WasteTech Solutions',
        model: 'WT-MANAGE-200',
        serialNumber: `WT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 20,
        purchasePrice: 75000 + Math.random() * 175000,
        currentValue: 60000 + Math.random() * 140000,
        replacementCost: 90000 + Math.random() * 210000,
        depreciationRate: 5,
        inspectionFrequency: 180,
        maintenanceCost: 2000 + Math.random() * 5000,
        tags: ['waste', 'management', 'recycling', 'environmental'],
        notes: 'Waste collection, treatment, or recycling facility',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Emergency Services (15 assets)
  for (let i = 1; i <= 15; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `EMS-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `EMS-${String(i).padStart(3, '0')}`,
        name: `Emergency Services Equipment ${i}`,
        description: `Emergency response equipment and vehicles`,
        assetType: AssetType.OTHER,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.CRITICAL,
        purpose: 'Emergency Response',
        purposeDescription: 'Emergency response equipment and vehicles for public safety',
        criticalityLevel: 'Critical',
        serviceImpact: 'Emergency response and public safety',
        functionBasedCategory: 'Emergency Services Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Emergency Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'EmergencyTech Systems',
        model: 'ET-EQUIP-100',
        serialNumber: `ET-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 15,
        purchasePrice: 50000 + Math.random() * 150000,
        currentValue: 40000 + Math.random() * 120000,
        replacementCost: 60000 + Math.random() * 180000,
        depreciationRate: 6.67,
        inspectionFrequency: 30,
        maintenanceCost: 1500 + Math.random() * 4000,
        tags: ['emergency', 'services', 'response', 'safety'],
        notes: 'Emergency response equipment and vehicles',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 15 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Sewer Infrastructure (10 assets)
  for (let i = 1; i <= 10; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `SEW-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `SEW-${String(i).padStart(3, '0')}`,
        name: `Sewer Infrastructure ${i}`,
        description: `Sewer treatment and distribution infrastructure`,
        assetType: AssetType.SEWER,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Sewer Treatment',
        purposeDescription: 'Sewer treatment and distribution infrastructure',
        criticalityLevel: 'High',
        serviceImpact: 'Sewer treatment and environmental protection',
        functionBasedCategory: 'Sewer Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Sewer Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'SewerTech Solutions',
        model: 'ST-TREAT-250',
        serialNumber: `ST-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 25,
        purchasePrice: 200000 + Math.random() * 300000,
        currentValue: 160000 + Math.random() * 240000,
        replacementCost: 240000 + Math.random() * 360000,
        depreciationRate: 4,
        inspectionFrequency: 90,
        maintenanceCost: 5000 + Math.random() * 10000,
        tags: ['sewer', 'treatment', 'wastewater', 'environmental'],
        notes: 'Sewer treatment and distribution infrastructure',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  console.log(`   ✅ Created ${assetCount} specialised infrastructure assets`);
  console.log(`   📊 Asset breakdown:`);
  console.log(`      - Telecommunications: 25`);
  console.log(`      - Water Infrastructure: 30`);
  console.log(`      - Waste Management: 20`);
  console.log(`      - Emergency Services: 15`);
  console.log(`      - Sewer Infrastructure: 10`);

  return assetCount;
}
