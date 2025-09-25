/**
 * Setup Greenfield Shire Council with mid-west NSW location
 *
 * This script creates or updates the Greenfield Shire Council organization
 * with weather monitoring locations in mid-west NSW.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupGreenfieldCouncil() {
  try {
    console.log('Setting up Greenfield Shire Council...');

    // Check if organization already exists
    let organization = await prisma.organisation.findFirst({
      where: {
        name: {
          contains: 'Greenfield',
          mode: 'insensitive'
        }
      }
    });

    if (!organization) {
      console.log('Creating Greenfield Shire Council organization...');
      organization = await prisma.organisation.create({
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
              },
              {
                id: 'dubbo-airport',
                name: 'Dubbo Airport',
                latitude: -32.2206,
                longitude: 148.5747,
                isPrimary: false,
                enabled: true,
              },
              {
                id: 'narromine',
                name: 'Narromine',
                latitude: -32.2333,
                longitude: 148.2333,
                isPrimary: false,
                enabled: true,
              },
              {
                id: 'wellington',
                name: 'Wellington',
                latitude: -32.5556,
                longitude: 148.9444,
                isPrimary: false,
                enabled: true,
              }
            ],
            externalApis: {
              weather: {
                provider: 'openweathermap',
                apiKey: process.env.OPENWEATHERMAP_API_KEY || '',
                enabled: !!process.env.OPENWEATHERMAP_API_KEY,
                refreshInterval: 10,
              },
              iot: {
                brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883',
                username: process.env.MQTT_USERNAME || '',
                password: process.env.MQTT_PASSWORD || '',
                enabled: !!process.env.MQTT_BROKER_URL,
              },
              energy: {
                serverUrl: process.env.OPCUA_SERVER_URL || 'opc.tcp://localhost:4840',
                username: process.env.OPCUA_USERNAME || '',
                password: process.env.OPCUA_PASSWORD || '',
                enabled: !!process.env.OPCUA_SERVER_URL,
              },
              emergency: {
                apiKey: process.env.EMERGENCY_API_KEY || '',
                apiUrl: process.env.EMERGENCY_API_URL || 'https://api.emergency.gov.au',
                enabled: !!process.env.EMERGENCY_API_KEY,
              },
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
        },
      });
      console.log('✅ Greenfield Shire Council created successfully!');
    } else {
      console.log('Updating existing Greenfield Shire Council...');

      // Update with new weather locations
      const updatedSettings = {
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
          },
          {
            id: 'dubbo-airport',
            name: 'Dubbo Airport',
            latitude: -32.2206,
            longitude: 148.5747,
            isPrimary: false,
            enabled: true,
          },
          {
            id: 'narromine',
            name: 'Narromine',
            latitude: -32.2333,
            longitude: 148.2333,
            isPrimary: false,
            enabled: true,
          },
          {
            id: 'wellington',
            name: 'Wellington',
            latitude: -32.5556,
            longitude: 148.9444,
            isPrimary: false,
            enabled: true,
          }
        ],
        externalApis: {
          weather: {
            provider: 'openweathermap',
            apiKey: process.env.OPENWEATHERMAP_API_KEY || '',
            enabled: !!process.env.OPENWEATHERMAP_API_KEY,
            refreshInterval: 10,
          },
          iot: {
            brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://broker.hivemq.com:1883',
            username: process.env.MQTT_USERNAME || '',
            password: process.env.MQTT_PASSWORD || '',
            enabled: !!process.env.MQTT_BROKER_URL,
          },
          energy: {
            serverUrl: process.env.OPCUA_SERVER_URL || 'opc.tcp://localhost:4840',
            username: process.env.OPCUA_USERNAME || '',
            password: process.env.OPCUA_PASSWORD || '',
            enabled: !!process.env.OPCUA_SERVER_URL,
          },
          emergency: {
            apiKey: process.env.EMERGENCY_API_KEY || '',
            apiUrl: process.env.EMERGENCY_API_URL || 'https://api.emergency.gov.au',
            enabled: !!process.env.EMERGENCY_API_KEY,
          },
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
      };

      organization = await prisma.organisation.update({
        where: { id: organization.id },
        data: {
          name: 'Greenfield Shire Council',
          resourceSettings: updatedSettings,
        },
      });
      console.log('✅ Greenfield Shire Council updated successfully!');
    }

    console.log('\n📍 Weather Monitoring Locations Configured:');
    console.log('1. Dubbo CBD (Primary) - -32.2433, 148.6042');
    console.log('2. Dubbo Airport - -32.2206, 148.5747');
    console.log('3. Narromine - -32.2333, 148.2333');
    console.log('4. Wellington - -32.5556, 148.9444');

    console.log('\n🌤️ Testing weather API with Dubbo location...');

    // Test the weather API with the new location
    const testResponse = await fetch('http://localhost:3000/api/external/weather?location=Dubbo&organisationId=' + organization.id);
    if (testResponse.ok) {
      const weatherData = await testResponse.json();
      console.log('✅ Weather API test successful!');
      console.log(`   Data source: ${weatherData.dataSource}`);
      console.log(`   Locations configured: ${weatherData.organizationLocations}`);
    } else {
      console.log('⚠️ Weather API test failed - server may not be running');
    }

    console.log('\n🎯 Next Steps:');
    console.log('1. Visit http://localhost:3000/admin/organization to manage settings');
    console.log('2. Test weather data: http://localhost:3000/api/external/weather?location=Dubbo');
    console.log('3. View organization ID:', organization.id);

  } catch (error) {
    console.error('❌ Error setting up Greenfield Shire Council:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupGreenfieldCouncil();
