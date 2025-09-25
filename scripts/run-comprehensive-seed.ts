#!/usr/bin/env tsx

/**
 * Comprehensive Database Seeding Execution Script
 *
 * This script executes the comprehensive synthetic data seeding strategy
 * for the Greenfield Shire Council test database.
 *
 * Features:
 * - Validates database connection
 * - Executes comprehensive seeding
 * - Provides detailed progress reporting
 * - Validates data integrity
 * - Generates seeding report
 *
 * Usage:
 * npx tsx scripts/run-comprehensive-seed.ts
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

interface SeedingConfig {
  databaseUrl: string;
  seedScript: string;
  backupBefore: boolean;
  validateAfter: boolean;
  generateReport: boolean;
}

interface SeedingReport {
  startTime: Date;
  endTime: Date;
  duration: number;
  success: boolean;
  recordsCreated: number;
  errors: string[];
  warnings: string[];
}

class ComprehensiveSeeder {
  private config: SeedingConfig;
  private report: SeedingReport;

  constructor() {
    this.config = {
      databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5433/aegrid',
      seedScript: 'prisma/seed-comprehensive.ts',
      backupBefore: true,
      validateAfter: true,
      generateReport: true,
    };

    this.report = {
      startTime: new Date(),
      endTime: new Date(),
      duration: 0,
      success: false,
      recordsCreated: 0,
      errors: [],
      warnings: [],
    };
  }

  async run(): Promise<void> {
    console.log('🌱 Comprehensive Database Seeding');
    console.log('==================================');
    console.log(`📅 Started: ${this.report.startTime.toISOString()}`);
    console.log(`🎯 Target: Greenfield Shire Council`);
    console.log(`📊 Goal: 500+ assets, 2,000+ work orders, 1,500+ inspections`);
    console.log('');

    try {
      // Pre-seeding validation
      await this.validatePrerequisites();

      // Database backup (if enabled)
      if (this.config.backupBefore) {
        await this.backupDatabase();
      }

      // Execute comprehensive seeding
      await this.executeSeeding();

      // Post-seeding validation
      if (this.config.validateAfter) {
        await this.validateResults();
      }

      // Generate report
      if (this.config.generateReport) {
        await this.generateReport();
      }

      this.report.success = true;
      console.log('🎉 Comprehensive seeding completed successfully!');

    } catch (error) {
      this.report.errors.push(error instanceof Error ? error.message : String(error));
      console.error('❌ Seeding failed:', error);
      throw error;
    } finally {
      this.report.endTime = new Date();
      this.report.duration = this.report.endTime.getTime() - this.report.startTime.getTime();
    }
  }

  private async validatePrerequisites(): Promise<void> {
    console.log('🔍 Validating prerequisites...');

    // Check database connection
    try {
      execSync('npx prisma db pull --force', { stdio: 'pipe' });
      console.log('   ✅ Database connection verified');
    } catch (error) {
      throw new Error('Database connection failed. Please ensure PostgreSQL is running.');
    }

    // Check seed script exists
    if (!existsSync(this.config.seedScript)) {
      throw new Error(`Seed script not found: ${this.config.seedScript}`);
    }
    console.log('   ✅ Seed script found');

    // Check Prisma client
    try {
      execSync('npx prisma generate', { stdio: 'pipe' });
      console.log('   ✅ Prisma client generated');
    } catch (error) {
      throw new Error('Failed to generate Prisma client');
    }

    console.log('✅ Prerequisites validated');
    console.log('');
  }

  private async backupDatabase(): Promise<void> {
    console.log('💾 Creating database backup...');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `backup-${timestamp}.sql`;

    try {
      const backupCommand = `pg_dump "${this.config.databaseUrl}" > ${backupFile}`;
      execSync(backupCommand, { stdio: 'pipe' });
      console.log(`   ✅ Database backed up to: ${backupFile}`);
    } catch (error) {
      this.report.warnings.push('Database backup failed - continuing without backup');
      console.log('   ⚠️  Database backup failed - continuing without backup');
    }

    console.log('');
  }

  private async executeSeeding(): Promise<void> {
    console.log('🌱 Executing comprehensive seeding...');
    console.log('');

    try {
      // Run the comprehensive seed script
      const seedCommand = `npx tsx ${this.config.seedScript}`;
      const output = execSync(seedCommand, {
        stdio: 'pipe',
        encoding: 'utf-8'
      });

      console.log(output);
      console.log('✅ Comprehensive seeding completed');

    } catch (error) {
      const errorOutput = error instanceof Error ? error.message : String(error);
      throw new Error(`Seeding execution failed: ${errorOutput}`);
    }
  }

  private async validateResults(): Promise<void> {
    console.log('🔍 Validating seeding results...');

    try {
      // Check database record counts
      const validationScript = `
        import { PrismaClient } from '@prisma/client';
        const prisma = new PrismaClient();

        async function validate() {
          const org = await prisma.organisation.findUnique({
            where: { name: 'Greenfield Shire Council' }
          });

          if (!org) {
            console.log('❌ Organisation not found');
            process.exit(1);
          }

          const counts = {
            users: await prisma.user.count({ where: { organisationId: org.id } }),
            assets: await prisma.asset.count({ where: { organisationId: org.id } }),
            vendors: await prisma.vendor.count({ where: { organisationId: org.id } }),
            workOrders: await prisma.workOrder.count({
              where: { asset: { organisationId: org.id } }
            }),
            inspections: await prisma.inspection.count({
              where: { asset: { organisationId: org.id } }
            }),
          };

          console.log('📊 Validation Results:');
          console.log(\`   Users: \${counts.users}\`);
          console.log(\`   Assets: \${counts.assets}\`);
          console.log(\`   Vendors: \${counts.vendors}\`);
          console.log(\`   Work Orders: \${counts.workOrders}\`);
          console.log(\`   Inspections: \${counts.inspections}\`);

          // Validate minimum thresholds
          if (counts.users < 20) {
            console.log('⚠️  Warning: User count below expected minimum');
          }
          if (counts.assets < 400) {
            console.log('⚠️  Warning: Asset count below expected minimum');
          }
          if (counts.workOrders < 1000) {
            console.log('⚠️  Warning: Work order count below expected minimum');
          }

          await prisma.\$disconnect();
        }

        validate().catch(console.error);
      `;

      // Write validation script to temp file
      const fs = require('fs');
      const tempScript = 'temp-validation.js';
      fs.writeFileSync(tempScript, validationScript);

      // Execute validation
      const output = execSync(`node ${tempScript}`, { encoding: 'utf-8' });
      console.log(output);

      // Clean up temp file
      fs.unlinkSync(tempScript);

      console.log('✅ Validation completed');

    } catch (error) {
      this.report.warnings.push('Validation failed - check results manually');
      console.log('⚠️  Validation failed - check results manually');
    }
  }

  private async generateReport(): Promise<void> {
    console.log('📊 Generating seeding report...');

    const report = {
      timestamp: new Date().toISOString(),
      duration: Math.round(this.report.duration / 1000),
      success: this.report.success,
      errors: this.report.errors,
      warnings: this.report.warnings,
      configuration: this.config,
    };

    const reportFile = `seeding-report-${new Date().toISOString().split('T')[0]}.json`;
    const fs = require('fs');
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    console.log(`   ✅ Report saved to: ${reportFile}`);
    console.log('');
  }
}

// Main execution
async function main() {
  const seeder = new ComprehensiveSeeder();

  try {
    await seeder.run();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
