import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getGreenfieldOrg() {
  try {
    const org = await prisma.organisation.findFirst({
      where: {
        name: {
          contains: 'Greenfield',
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        resourceSettings: true
      }
    });

    if (org) {
      console.log('Organization ID:', org.id);
      console.log('Organization Name:', org.name);

      const settings = typeof org.resourceSettings === 'string'
        ? JSON.parse(org.resourceSettings)
        : org.resourceSettings;

      console.log('Weather Locations:', settings.weatherLocations?.length || 0);
      if (settings.weatherLocations) {
        settings.weatherLocations.forEach((loc, index) => {
          console.log(`${index + 1}. ${loc.name} (${loc.isPrimary ? 'Primary' : 'Secondary'}) - ${loc.latitude}, ${loc.longitude}`);
        });
      }
    } else {
      console.log('No Greenfield organization found');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getGreenfieldOrg();
