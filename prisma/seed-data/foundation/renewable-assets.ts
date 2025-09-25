/**
 * Renewable Energy Assets Generator
 *
 * Creates 100 renewable energy assets for Greenfield Shire Council
 * including solar arrays, wind turbines, battery storage, and EV charging stations.
 */

import { AssetCondition, AssetPriority, AssetStatus, AssetType, PrismaClient } from '@prisma/client';

export async function generateRenewableAssets(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  🌱 Creating renewable energy assets...');

  let assetCount = 0;

  // Solar Arrays (30 assets)
  for (let i = 1; i <= 30; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `SOL-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `SOL-${String(i).padStart(3, '0')}`,
        name: `Solar Array ${i}`,
        description: `Photovoltaic solar panel array for renewable energy generation`,
        assetType: AssetType.SOLAR_ARRAY,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Renewable Energy Generation',
        purposeDescription: 'Solar photovoltaic energy generation for grid and community use',
        criticalityLevel: 'High',
        serviceImpact: 'Renewable energy generation and carbon reduction',
        functionBasedCategory: 'Renewable Energy Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Solar Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'SolarTech Industries',
        model: 'ST-ARRAY-500',
        serialNumber: `ST-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 25,
        purchasePrice: 50000 + Math.random() * 150000,
        currentValue: 40000 + Math.random() * 120000,
        replacementCost: 60000 + Math.random() * 180000,
        depreciationRate: 4,
        inspectionFrequency: 180,
        maintenanceCost: 2000 + Math.random() * 5000,
        tags: ['solar', 'renewable', 'energy', 'photovoltaic'],
        notes: 'Solar photovoltaic array for renewable energy generation',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Wind Turbines (15 assets)
  for (let i = 1; i <= 15; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `WIND-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `WIND-${String(i).padStart(3, '0')}`,
        name: `Wind Turbine ${i}`,
        description: `Wind energy turbine for renewable electricity generation`,
        assetType: AssetType.WIND_TURBINE,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Wind Energy Generation',
        purposeDescription: 'Wind-powered electricity generation for renewable energy',
        criticalityLevel: 'High',
        serviceImpact: 'Renewable energy generation and grid stability',
        functionBasedCategory: 'Renewable Energy Infrastructure',
        address: `Wind Farm Site ${i}`,
        suburb: ['Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 3)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'WindTech Solutions',
        model: 'WT-TURBINE-1000',
        serialNumber: `WT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 20,
        purchasePrice: 200000 + Math.random() * 300000,
        currentValue: 160000 + Math.random() * 240000,
        replacementCost: 240000 + Math.random() * 360000,
        depreciationRate: 5,
        inspectionFrequency: 90,
        maintenanceCost: 5000 + Math.random() * 10000,
        tags: ['wind', 'turbine', 'renewable', 'energy'],
        notes: 'Wind turbine for renewable energy generation',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Battery Storage Systems (20 assets)
  for (let i = 1; i <= 20; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `BAT-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `BAT-${String(i).padStart(3, '0')}`,
        name: `Battery Storage System ${i}`,
        description: `Energy storage battery system for renewable energy storage`,
        assetType: AssetType.BATTERY_STORAGE,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Energy Storage',
        purposeDescription: 'Battery energy storage for grid stability and renewable energy integration',
        criticalityLevel: 'High',
        serviceImpact: 'Energy storage and grid stability',
        functionBasedCategory: 'Energy Storage Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Storage Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'BatteryTech Systems',
        model: 'BT-STORAGE-500',
        serialNumber: `BT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 15,
        purchasePrice: 75000 + Math.random() * 125000,
        currentValue: 60000 + Math.random() * 100000,
        replacementCost: 90000 + Math.random() * 150000,
        depreciationRate: 6.67,
        inspectionFrequency: 90,
        maintenanceCost: 3000 + Math.random() * 7000,
        tags: ['battery', 'storage', 'energy', 'grid-stability'],
        notes: 'Battery storage system for renewable energy storage',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // EV Charging Stations (25 assets)
  for (let i = 1; i <= 25; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `EV-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `EV-${String(i).padStart(3, '0')}`,
        name: `EV Charging Station ${i}`,
        description: `Electric vehicle charging station for public use`,
        assetType: AssetType.EV_CHARGING_STATION,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.MEDIUM,
        purpose: 'Electric Vehicle Charging',
        purposeDescription: 'Public electric vehicle charging infrastructure',
        criticalityLevel: 'Medium',
        serviceImpact: 'Electric vehicle charging and sustainable transport',
        functionBasedCategory: 'Electric Vehicle Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} EV Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'EVTech Solutions',
        model: 'EV-CHARGER-150',
        serialNumber: `EV-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 12,
        purchasePrice: 15000 + Math.random() * 25000,
        currentValue: 12000 + Math.random() * 20000,
        replacementCost: 18000 + Math.random() * 30000,
        depreciationRate: 8.33,
        inspectionFrequency: 180,
        maintenanceCost: 800 + Math.random() * 1500,
        tags: ['ev', 'charging', 'electric-vehicle', 'sustainable'],
        notes: 'Electric vehicle charging station for public use',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Grid Scale Batteries (5 assets)
  for (let i = 1; i <= 5; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `GSB-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `GSB-${String(i).padStart(3, '0')}`,
        name: `Grid Scale Battery ${i}`,
        description: `Large-scale battery storage system for grid stability`,
        assetType: AssetType.GRID_SCALE_BATTERY,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.CRITICAL,
        purpose: 'Grid Scale Energy Storage',
        purposeDescription: 'Large-scale battery storage for grid stability and renewable integration',
        criticalityLevel: 'Critical',
        serviceImpact: 'Grid stability and renewable energy integration',
        functionBasedCategory: 'Grid Infrastructure',
        address: `Grid Battery Site ${i}`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'GridTech Systems',
        model: 'GT-BATTERY-2000',
        serialNumber: `GT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 15,
        purchasePrice: 500000 + Math.random() * 1000000,
        currentValue: 400000 + Math.random() * 800000,
        replacementCost: 600000 + Math.random() * 1200000,
        depreciationRate: 6.67,
        inspectionFrequency: 30,
        maintenanceCost: 15000 + Math.random() * 25000,
        tags: ['grid-scale', 'battery', 'storage', 'grid-stability'],
        notes: 'Grid-scale battery storage system for renewable energy integration',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 15 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Community Batteries (5 assets)
  for (let i = 1; i <= 5; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `CB-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `CB-${String(i).padStart(3, '0')}`,
        name: `Community Battery ${i}`,
        description: `Community-scale battery storage for local energy sharing`,
        assetType: AssetType.COMMUNITY_BATTERY,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Community Energy Storage',
        purposeDescription: 'Community-scale battery for local energy sharing and storage',
        criticalityLevel: 'High',
        serviceImpact: 'Community energy resilience and renewable integration',
        functionBasedCategory: 'Community Energy Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Community Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'CommunityTech Solutions',
        model: 'CT-BATTERY-1000',
        serialNumber: `CT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 15,
        purchasePrice: 200000 + Math.random() * 300000,
        currentValue: 160000 + Math.random() * 240000,
        replacementCost: 240000 + Math.random() * 360000,
        depreciationRate: 6.67,
        inspectionFrequency: 90,
        maintenanceCost: 8000 + Math.random() * 12000,
        tags: ['community', 'battery', 'energy-sharing', 'resilience'],
        notes: 'Community battery storage for local energy sharing',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 45 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 45 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  console.log(`   ✅ Created ${assetCount} renewable energy assets`);
  console.log(`   📊 Asset breakdown:`);
  console.log(`      - Solar Arrays: 30`);
  console.log(`      - Wind Turbines: 15`);
  console.log(`      - Battery Storage: 20`);
  console.log(`      - EV Charging Stations: 25`);
  console.log(`      - Grid Scale Batteries: 5`);
  console.log(`      - Community Batteries: 5`);

  return assetCount;
}
