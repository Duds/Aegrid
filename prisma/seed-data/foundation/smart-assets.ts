/**
 * Smart Infrastructure Assets Generator
 *
 * Creates 150 smart infrastructure assets for Greenfield Shire Council
 * including IoT sensors, smart streetlights, traffic systems, and monitoring equipment.
 */

import { AssetCondition, AssetPriority, AssetStatus, AssetType, PrismaClient } from '@prisma/client';

export async function generateSmartAssets(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  🧠 Creating smart infrastructure assets...');

  let assetCount = 0;

  // Smart Streetlights (50 assets)
  for (let i = 1; i <= 50; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `SSL-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `SSL-${String(i).padStart(3, '0')}`,
        name: `Smart Streetlight ${i}`,
        description: `LED smart streetlight with IoT connectivity and adaptive lighting`,
        assetType: AssetType.SMART_STREETLIGHT,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.MEDIUM,
        purpose: 'Public Lighting',
        purposeDescription: 'Smart public lighting with energy efficiency and IoT monitoring',
        criticalityLevel: 'Medium',
        serviceImpact: 'Public safety and energy efficiency',
        functionBasedCategory: 'Smart Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Smart Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'SmartLight Technologies',
        model: 'SL-LED-200',
        serialNumber: `SL-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 15,
        purchasePrice: 2500 + Math.random() * 1500,
        currentValue: 2000 + Math.random() * 1200,
        replacementCost: 3000 + Math.random() * 1800,
        depreciationRate: 6.67,
        inspectionFrequency: 365,
        maintenanceCost: 200 + Math.random() * 300,
        tags: ['smart', 'streetlight', 'iot', 'energy-efficient'],
        notes: 'Smart LED streetlight with adaptive lighting and IoT connectivity',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Smart Traffic Lights (25 assets)
  for (let i = 1; i <= 25; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `STL-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `STL-${String(i).padStart(3, '0')}`,
        name: `Smart Traffic Light ${i}`,
        description: `Intelligent traffic management system with adaptive signal timing`,
        assetType: AssetType.SMART_TRAFFIC_LIGHT,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Traffic Management',
        purposeDescription: 'Intelligent traffic flow management and safety',
        criticalityLevel: 'High',
        serviceImpact: 'Traffic flow and road safety',
        functionBasedCategory: 'Smart Transportation',
        address: `Intersection ${i}`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'TrafficTech Systems',
        model: 'TT-SMART-100',
        serialNumber: `TT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 12,
        purchasePrice: 15000 + Math.random() * 10000,
        currentValue: 12000 + Math.random() * 8000,
        replacementCost: 18000 + Math.random() * 12000,
        depreciationRate: 8.33,
        inspectionFrequency: 180,
        maintenanceCost: 1000 + Math.random() * 2000,
        tags: ['smart', 'traffic', 'safety', 'adaptive'],
        notes: 'Smart traffic light with adaptive signal timing and IoT connectivity',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // IoT Sensors (30 assets)
  for (let i = 1; i <= 30; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `IOT-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `IOT-${String(i).padStart(3, '0')}`,
        name: `IoT Sensor Node ${i}`,
        description: `Environmental monitoring sensor with wireless connectivity`,
        assetType: AssetType.IOT_SENSOR,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.MEDIUM,
        purpose: 'Environmental Monitoring',
        purposeDescription: 'Real-time environmental data collection and monitoring',
        criticalityLevel: 'Medium',
        serviceImpact: 'Environmental monitoring and data collection',
        functionBasedCategory: 'Smart Infrastructure',
        address: `${Math.floor(Math.random() * 999) + 1} Sensor Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'SensorTech Solutions',
        model: 'ST-IOT-50',
        serialNumber: `ST-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 8,
        purchasePrice: 800 + Math.random() * 1200,
        currentValue: 600 + Math.random() * 900,
        replacementCost: 1000 + Math.random() * 1500,
        depreciationRate: 12.5,
        inspectionFrequency: 90,
        maintenanceCost: 100 + Math.random() * 200,
        tags: ['iot', 'sensor', 'environmental', 'wireless'],
        notes: 'IoT sensor node for environmental monitoring with wireless connectivity',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Traffic Sensors (25 assets)
  for (let i = 1; i <= 25; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `TS-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `TS-${String(i).padStart(3, '0')}`,
        name: `Traffic Sensor ${i}`,
        description: `Vehicle detection and traffic flow monitoring sensor`,
        assetType: AssetType.TRAFFIC_SENSOR,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.MEDIUM,
        purpose: 'Traffic Monitoring',
        purposeDescription: 'Vehicle detection and traffic flow analysis',
        criticalityLevel: 'Medium',
        serviceImpact: 'Traffic flow monitoring and optimization',
        functionBasedCategory: 'Smart Transportation',
        address: `Traffic Point ${i}`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'TrafficTech Systems',
        model: 'TT-SENSOR-75',
        serialNumber: `TT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 10,
        purchasePrice: 1200 + Math.random() * 1800,
        currentValue: 900 + Math.random() * 1350,
        replacementCost: 1500 + Math.random() * 2250,
        depreciationRate: 10,
        inspectionFrequency: 180,
        maintenanceCost: 150 + Math.random() * 300,
        tags: ['traffic', 'sensor', 'monitoring', 'detection'],
        notes: 'Traffic sensor for vehicle detection and flow monitoring',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 60 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Air Quality Monitors (10 assets)
  for (let i = 1; i <= 10; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `AQM-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `AQM-${String(i).padStart(3, '0')}`,
        name: `Air Quality Monitor ${i}`,
        description: `Real-time air quality monitoring station`,
        assetType: AssetType.AIR_QUALITY_MONITOR,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.HIGH,
        purpose: 'Air Quality Monitoring',
        purposeDescription: 'Environmental air quality monitoring and reporting',
        criticalityLevel: 'High',
        serviceImpact: 'Public health and environmental protection',
        functionBasedCategory: 'Environmental Monitoring',
        address: `${Math.floor(Math.random() * 999) + 1} Air Quality Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'AirTech Monitoring',
        model: 'ATM-QUALITY-100',
        serialNumber: `ATM-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 12,
        purchasePrice: 8000 + Math.random() * 12000,
        currentValue: 6000 + Math.random() * 9000,
        replacementCost: 10000 + Math.random() * 15000,
        depreciationRate: 8.33,
        inspectionFrequency: 90,
        maintenanceCost: 800 + Math.random() * 1200,
        tags: ['air-quality', 'environmental', 'monitoring', 'health'],
        notes: 'Air quality monitoring station for environmental protection',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  // Smart Water Meters (10 assets)
  for (let i = 1; i <= 10; i++) {
    await prisma.asset.upsert({
      where: { assetNumber: `SWM-${String(i).padStart(3, '0')}` },
      update: {},
      create: {
        assetNumber: `SWM-${String(i).padStart(3, '0')}`,
        name: `Smart Water Meter ${i}`,
        description: `Digital water usage monitoring and leak detection meter`,
        assetType: AssetType.SMART_WATER_METER,
        status: AssetStatus.ACTIVE,
        condition: [AssetCondition.EXCELLENT, AssetCondition.GOOD, AssetCondition.FAIR][Math.floor(Math.random() * 3)],
        priority: AssetPriority.MEDIUM,
        purpose: 'Water Monitoring',
        purposeDescription: 'Smart water usage monitoring and leak detection',
        criticalityLevel: 'Medium',
        serviceImpact: 'Water conservation and leak detection',
        functionBasedCategory: 'Smart Utilities',
        address: `${Math.floor(Math.random() * 999) + 1} Water Street`,
        suburb: ['Greenfield', 'Windy Ridge', 'Solar Valley', 'Bright Plains'][Math.floor(Math.random() * 4)],
        postcode: '2830',
        state: 'NSW',
        country: 'Australia',
        manufacturer: 'WaterTech Solutions',
        model: 'WT-SMART-200',
        serialNumber: `WT-GF-${String(i).padStart(3, '0')}-2023`,
        installationDate: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        expectedLifespan: 15,
        purchasePrice: 500 + Math.random() * 1000,
        currentValue: 400 + Math.random() * 800,
        replacementCost: 600 + Math.random() * 1200,
        depreciationRate: 6.67,
        inspectionFrequency: 365,
        maintenanceCost: 50 + Math.random() * 100,
        tags: ['water', 'smart-meter', 'monitoring', 'leak-detection'],
        notes: 'Smart water meter with usage monitoring and leak detection',
        organisationId,
        createdBy: null,
        updatedBy: null,
        lastInspection: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
        nextInspection: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      },
    });
    assetCount++;
  }

  console.log(`   ✅ Created ${assetCount} smart infrastructure assets`);
  console.log(`   📊 Asset breakdown:`);
  console.log(`      - Smart Streetlights: 50`);
  console.log(`      - Smart Traffic Lights: 25`);
  console.log(`      - IoT Sensors: 30`);
  console.log(`      - Traffic Sensors: 25`);
  console.log(`      - Air Quality Monitors: 10`);
  console.log(`      - Smart Water Meters: 10`);

  return assetCount;
}
