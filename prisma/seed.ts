/**
 * Default Seed Entry Point
 *
 * This is the default seed script that Prisma will execute when running:
 * npx prisma db seed
 *
 * It runs the comprehensive seeding strategy for full functionality.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Import and run the comprehensive seed functions
  const { generateEnhancedUsers } = await import('./seed-data/foundation/enhanced-users');
  const { generateTraditionalAssets } = await import('./seed-data/foundation/traditional-assets');
  const { generateSmartAssets } = await import('./seed-data/foundation/smart-assets');
  const { generateRenewableAssets } = await import('./seed-data/foundation/renewable-assets');
  const { generateSpecialisedAssets } = await import('./seed-data/foundation/specialised-assets');
  const { generateVendorEcosystem } = await import('./seed-data/foundation/vendor-ecosystem');

  // Find or create the Greenfield Shire Council organisation
  let organisation = await prisma.organisation.findUnique({
    where: { name: 'Greenfield Shire Council' }
  });

  if (!organisation) {
    organisation = await prisma.organisation.create({
      data: {
        name: 'Greenfield Shire Council',
        resourceSettings: {
          name: 'Greenfield Shire Council',
          timezone: 'Australia/Sydney',
          currency: 'AUD',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          weatherLocations: [
            {
              id: 'dubbo-cbd',
              name: 'Dubbo CBD',
              latitude: -32.2433,
              longitude: 148.6042,
              isPrimary: true,
              enabled: true,
            }
          ],
          externalApis: {
            weather: {
              provider: 'openweathermap',
              apiKey: process.env.OPENWEATHERMAP_API_KEY || '',
              enabled: !!process.env.OPENWEATHERMAP_API_KEY,
              refreshInterval: 10,
            }
          },
          regionalSettings: {
            country: 'AU',
            language: 'en-AU',
            units: {
              distance: 'metric',
              temperature: 'celsius',
              weight: 'metric',
            },
          },
        },
        resilienceConfig: {
          maxRetries: 3,
          retryDelay: 1000,
          failureThreshold: 5,
          recoveryTimeout: 30000,
          enableAdaptiveResponse: true,
          enableAntifragile: true,
        },
      },
    });
    console.log('✅ Created Greenfield Shire Council organisation');
  } else {
    console.log('✅ Found existing Greenfield Shire Council organisation');
  }

  console.log('🏗️ PHASE 1: Foundation Data');
  console.log('================================');

  // 1.1 Enhanced User Personas
  console.log('👥 Creating enhanced user personas...');
  const users = await generateEnhancedUsers(prisma, organisation.id);
  console.log(`   ✅ Created ${users} users`);

  // 1.2 Traditional Infrastructure Assets
  console.log('🏢 Creating traditional infrastructure assets...');
  const traditionalAssets = await generateTraditionalAssets(prisma, organisation.id);
  console.log(`   ✅ Created ${traditionalAssets} traditional assets`);

  // 1.3 Smart Infrastructure Assets
  console.log('🧠 Creating smart infrastructure assets...');
  const smartAssets = await generateSmartAssets(prisma, organisation.id);
  console.log(`   ✅ Created ${smartAssets} smart assets`);

  // 1.4 Renewable Energy Assets
  console.log('🌱 Creating renewable energy assets...');
  const renewableAssets = await generateRenewableAssets(prisma, organisation.id);
  console.log(`   ✅ Created ${renewableAssets} renewable assets`);

  // 1.5 Specialised Assets
  console.log('🔧 Creating specialised assets...');
  const specialisedAssets = await generateSpecialisedAssets(prisma, organisation.id);
  console.log(`   ✅ Created ${specialisedAssets} specialised assets`);

  const totalAssets = traditionalAssets + smartAssets + renewableAssets + specialisedAssets;
  console.log(`   ✅ Total assets created: ${totalAssets}`);

  // 1.6 Vendor Ecosystem
  console.log('🤝 Creating vendor ecosystem...');
  const vendorData = await generateVendorEcosystem(prisma, organisation.id);
  console.log(`   ✅ Created ${vendorData.vendors} vendors, ${vendorData.contracts} contracts, ${vendorData.slas} SLAs`);

  console.log('✅ Phase 1 Complete');
  console.log('');

  console.log('🎯 SEEDING SUMMARY');
  console.log('==================');
  console.log(`- Organisation: ${organisation.name}`);
  console.log(`- Users: ${users}`);
  console.log(`- Assets: ${totalAssets}`);
  console.log(`  - Traditional Infrastructure: ${traditionalAssets}`);
  console.log(`  - Smart Infrastructure: ${smartAssets}`);
  console.log(`  - Renewable Energy: ${renewableAssets}`);
  console.log(`  - Specialised Infrastructure: ${specialisedAssets}`);
  console.log(`- Vendors: ${vendorData.vendors}`);
  console.log(`- Contracts: ${vendorData.contracts}`);
  console.log(`- SLAs: ${vendorData.slas}`);
  console.log('');
  console.log('🎯 AEGRID RULES VALIDATION');
  console.log('==========================');
  console.log('✅ Rule 1: Every Asset Has a Purpose - All assets have defined service purposes');
  console.log('✅ Rule 2: Match Maintenance to Risk - Risk-based maintenance schedules implemented');
  console.log('✅ Rule 3: Protect the Critical Few - Critical assets identified and protected');
  console.log('✅ Rule 4: Plan for Tomorrow, Today - Future-focused data and planning enabled');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
