/**
 * Enhanced User Personas - Comprehensive User Generation
 *
 * Creates 25 realistic user personas for Greenfield Shire Council
 * demonstrating complete role-based access control and workflows.
 *
 * User Distribution:
 * - Executive Leadership (2): CEO, CFO
 * - Management Team (5): Department managers
 * - Supervisors (8): Team supervisors across departments
 * - Crew Members (8): Field workers and technicians
 * - Contractors (2): External service providers
 */

import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

export async function generateEnhancedUsers(prisma: PrismaClient, organisationId: string): Promise<number> {
  console.log('  👥 Creating enhanced user personas...');

  const passwordHash = await bcrypt.hash('Demo123!', 12);
  const users = [];

  // Executive Leadership
  const sarahChen = await prisma.user.upsert({
    where: { email: 'sarah.chen@greenfieldshire.gov.au' },
    update: {},
    create: {
      email: 'sarah.chen@greenfieldshire.gov.au',
      name: 'Sarah Chen',
      role: Role.EXEC,
      organisationId,
      passwordHash,
      emailVerified: new Date(),
      phoneNumber: '+61 400 123 456',
      bio: 'Chief Executive Officer with 20+ years in public sector leadership and strategic asset management.',
      timezone: 'Australia/Sydney',
      language: 'en-AU',
      notificationPreferences: {
        email: true,
        sms: true,
        push: true,
        emergency_alerts: true,
        strategic_reports: true,
        margin_alerts: true,
      },
    },
  });
  users.push(sarahChen);

  const davidThompson = await prisma.user.upsert({
    where: { email: 'david.thompson@greenfieldshire.gov.au' },
    update: {},
    create: {
      email: 'david.thompson@greenfieldshire.gov.au',
      name: 'David Thompson',
      role: Role.EXEC,
      organisationId,
      passwordHash,
      emailVerified: new Date(),
      phoneNumber: '+61 400 123 457',
      bio: 'Chief Financial Officer with expertise in asset lifecycle costing and financial risk management.',
      timezone: 'Australia/Sydney',
      language: 'en-AU',
      notificationPreferences: {
        email: true,
        sms: false,
        push: true,
        emergency_alerts: true,
        strategic_reports: true,
        margin_alerts: true,
      },
    },
  });
  users.push(davidThompson);

  // Management Team
  const managementUsers = [
    {
      email: 'michael.rodriguez@greenfieldshire.gov.au',
      name: 'Michael Rodriguez',
      role: Role.MANAGER,
      phoneNumber: '+61 400 123 458',
      bio: 'Infrastructure Manager overseeing roads, bridges, and transportation assets.',
    },
    {
      email: 'lisa.wang@greenfieldshire.gov.au',
      name: 'Lisa Wang',
      role: Role.MANAGER,
      phoneNumber: '+61 400 123 459',
      bio: 'Utilities Manager responsible for water, wastewater, and electrical infrastructure.',
    },
    {
      email: 'james.murphy@greenfieldshire.gov.au',
      name: 'James Murphy',
      role: Role.MANAGER,
      phoneNumber: '+61 400 123 460',
      bio: 'Community Services Manager overseeing parks, recreation, and public facilities.',
    },
    {
      email: 'emma.davis@greenfieldshire.gov.au',
      name: 'Emma Davis',
      role: Role.MANAGER,
      phoneNumber: '+61 400 123 461',
      bio: 'Smart Infrastructure Manager leading digital transformation and IoT initiatives.',
    },
    {
      email: 'robert.kim@greenfieldshire.gov.au',
      name: 'Robert Kim',
      role: Role.MANAGER,
      phoneNumber: '+61 400 123 462',
      bio: 'Emergency Services Manager coordinating emergency response and critical infrastructure protection.',
    },
  ];

  for (const userData of managementUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organisationId,
        passwordHash,
        emailVerified: new Date(),
        phoneNumber: userData.phoneNumber,
        bio: userData.bio,
        timezone: 'Australia/Sydney',
        language: 'en-AU',
        notificationPreferences: {
          email: true,
          sms: true,
          push: true,
          emergency_alerts: true,
          strategic_reports: true,
          margin_alerts: true,
        },
      },
    });
    users.push(user);
  }

  // Supervisors
  const supervisorUsers = [
    {
      email: 'alex.taylor@greenfieldshire.gov.au',
      name: 'Alex Taylor',
      role: Role.SUPERVISOR,
      phoneNumber: '+61 400 123 463',
      bio: 'Road Maintenance Supervisor with 15 years experience in infrastructure management.',
    },
    {
      email: 'sophie.martinez@greenfieldshire.gov.au',
      name: 'Sophie Martinez',
      role: Role.SUPERVISOR,
      phoneNumber: '+61 400 123 464',
      bio: 'Water Treatment Supervisor ensuring compliance with environmental standards.',
    },
    {
      email: 'marcus.johnson@greenfieldshire.gov.au',
      name: 'Marcus Johnson',
      role: Role.SUPERVISOR,
      phoneNumber: '+61 400 123 465',
      bio: 'Electrical Infrastructure Supervisor managing power distribution and renewable energy systems.',
    },
    {
      email: 'olivia.brown@greenfieldshire.gov.au',
      name: 'Olivia Brown',
      role: Role.SUPERVISOR,
      phoneNumber: '+61 400 123 466',
      bio: 'Parks and Recreation Supervisor maintaining public spaces and recreational facilities.',
    },
    {
      email: 'daniel.wilson@greenfieldshire.gov.au',
      name: 'Daniel Wilson',
      role: Role.SUPERVISOR,
      phoneNumber: '+61 400 123 467',
      bio: 'Smart Infrastructure Supervisor overseeing IoT sensors and intelligent systems.',
    },
    {
      email: 'charlotte.garcia@greenfieldshire.gov.au',
      name: 'Charlotte Garcia',
      role: Role.SUPERVISOR,
      phoneNumber: '+61 400 123 468',
      bio: 'Emergency Response Supervisor coordinating emergency maintenance and critical repairs.',
    },
    {
      email: 'william.anderson@greenfieldshire.gov.au',
      name: 'William Anderson',
      role: Role.SUPERVISOR,
      phoneNumber: '+61 400 123 469',
      bio: 'Wastewater Treatment Supervisor managing sewage treatment and environmental compliance.',
    },
    {
      email: 'ava.thomas@greenfieldshire.gov.au',
      name: 'Ava Thomas',
      role: Role.SUPERVISOR,
      phoneNumber: '+61 400 123 470',
      bio: 'Building Maintenance Supervisor overseeing council buildings and public facilities.',
    },
  ];

  for (const userData of supervisorUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organisationId,
        passwordHash,
        emailVerified: new Date(),
        phoneNumber: userData.phoneNumber,
        bio: userData.bio,
        timezone: 'Australia/Sydney',
        language: 'en-AU',
        notificationPreferences: {
          email: true,
          sms: true,
          push: true,
          emergency_alerts: true,
          strategic_reports: false,
          margin_alerts: true,
        },
      },
    });
    users.push(user);
  }

  // Crew Members
  const crewUsers = [
    {
      email: 'liam.jones@greenfieldshire.gov.au',
      name: 'Liam Jones',
      role: Role.CREW,
      phoneNumber: '+61 400 123 471',
      bio: 'Road Maintenance Technician with expertise in asphalt repair and traffic management.',
    },
    {
      email: 'mia.white@greenfieldshire.gov.au',
      name: 'Mia White',
      role: Role.CREW,
      phoneNumber: '+61 400 123 472',
      bio: 'Water Treatment Operator ensuring water quality and treatment process efficiency.',
    },
    {
      email: 'noah.harris@greenfieldshire.gov.au',
      name: 'Noah Harris',
      role: Role.CREW,
      phoneNumber: '+61 400 123 473',
      bio: 'Electrical Technician maintaining power distribution and renewable energy systems.',
    },
    {
      email: 'isabella.martin@greenfieldshire.gov.au',
      name: 'Isabella Martin',
      role: Role.CREW,
      phoneNumber: '+61 400 123 474',
      bio: 'Parks Maintenance Worker maintaining public spaces, gardens, and recreational facilities.',
    },
    {
      email: 'lucas.thompson@greenfieldshire.gov.au',
      name: 'Lucas Thompson',
      role: Role.CREW,
      phoneNumber: '+61 400 123 475',
      bio: 'IoT Technician installing and maintaining smart sensors and monitoring systems.',
    },
    {
      email: 'amelia.garcia@greenfieldshire.gov.au',
      name: 'Amelia Garcia',
      role: Role.CREW,
      phoneNumber: '+61 400 123 476',
      bio: 'Emergency Response Technician responding to urgent maintenance and repair requests.',
    },
    {
      email: 'benjamin.martinez@greenfieldshire.gov.au',
      name: 'Benjamin Martinez',
      role: Role.CREW,
      phoneNumber: '+61 400 123 477',
      bio: 'Wastewater Treatment Operator managing sewage treatment processes and equipment.',
    },
    {
      email: 'charlotte.robinson@greenfieldshire.gov.au',
      name: 'Charlotte Robinson',
      role: Role.CREW,
      phoneNumber: '+61 400 123 478',
      bio: 'Building Maintenance Worker performing routine maintenance on council buildings.',
    },
  ];

  for (const userData of crewUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organisationId,
        passwordHash,
        emailVerified: new Date(),
        phoneNumber: userData.phoneNumber,
        bio: userData.bio,
        timezone: 'Australia/Sydney',
        language: 'en-AU',
        notificationPreferences: {
          email: true,
          sms: true,
          push: false,
          emergency_alerts: true,
          strategic_reports: false,
          margin_alerts: false,
        },
      },
    });
    users.push(user);
  }

  // Contractors
  const contractorUsers = [
    {
      email: 'contractor1@greenfieldelectrical.com.au',
      name: 'Tom Wilson',
      role: Role.CONTRACTOR,
      phoneNumber: '+61 400 123 479',
      bio: 'Senior Electrical Contractor specialising in renewable energy installations.',
    },
    {
      email: 'contractor2@civilworks.com.au',
      name: 'Sarah Mitchell',
      role: Role.CONTRACTOR,
      phoneNumber: '+61 400 123 480',
      bio: 'Civil Works Contractor with expertise in road construction and infrastructure projects.',
    },
  ];

  for (const userData of contractorUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        name: userData.name,
        role: userData.role,
        organisationId,
        passwordHash,
        emailVerified: new Date(),
        phoneNumber: userData.phoneNumber,
        bio: userData.bio,
        timezone: 'Australia/Sydney',
        language: 'en-AU',
        notificationPreferences: {
          email: true,
          sms: true,
          push: false,
          emergency_alerts: false,
          strategic_reports: false,
          margin_alerts: false,
        },
      },
    });
    users.push(user);
  }

  console.log(`   ✅ Created ${users.length} enhanced user personas`);
  console.log(`   📊 Role distribution:`);
  console.log(`      - Executive: 2`);
  console.log(`      - Management: 5`);
  console.log(`      - Supervisors: 8`);
  console.log(`      - Crew: 8`);
  console.log(`      - Contractors: 2`);

  return users.length;
}
