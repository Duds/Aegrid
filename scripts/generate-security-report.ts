#!/usr/bin/env node

/**
 * Comprehensive Security Report Generator
 * Analyzes the Aegrid codebase for security posture
 */

import { execSync } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';

interface SecurityFinding {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  file?: string;
  line?: number;
  recommendation: string;
  status: 'open' | 'resolved' | 'mitigated';
}

interface SecurityReport {
  generatedAt: string;
  projectName: string;
  version: string;
  overallScore: number;
  findings: SecurityFinding[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  recommendations: string[];
}

interface AuditVulnerability {
  title?: string;
  severity: string;
  fixAvailable?: string;
}

interface AuditResult {
  vulnerabilities?: Record<string, AuditVulnerability>;
}

async function generateSecurityReport(): Promise<SecurityReport> {
  const findings: SecurityFinding[] = [];

  // Check for known vulnerabilities
  try {
    const auditOutput = execSync('npm audit --json', { encoding: 'utf-8' });
    const audit = JSON.parse(auditOutput) as AuditResult;

    if (audit.vulnerabilities) {
      Object.entries(audit.vulnerabilities).forEach(
        ([packageName, vuln]: [string, AuditVulnerability]) => {
          findings.push({
            category: 'Dependencies',
            severity:
              vuln.severity === 'critical'
                ? 'critical'
                : vuln.severity === 'high'
                  ? 'high'
                  : vuln.severity === 'moderate'
                    ? 'medium'
                    : 'low',
            title: `Vulnerability in ${packageName}`,
            description: vuln.title || 'Unknown vulnerability',
            recommendation: `Update ${packageName} to version ${vuln.fixAvailable || 'latest'}`,
            status: 'open',
          });
        }
      );
    }
  } catch {
    console.log('npm audit not available or failed');
  }

  // Check for hardcoded secrets
  const secretPatterns = [
    /password\s*=\s*['"][^'"]+['"]/gi,
    /api[_-]?key\s*=\s*['"][^'"]+['"]/gi,
    /secret\s*=\s*['"][^'"]+['"]/gi,
    /token\s*=\s*['"][^'"]+['"]/gi,
  ];

  // Scan source files for potential issues
  const sourceFiles = await findSourceFiles();

  for (const file of sourceFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8');

      // Check for hardcoded secrets
      secretPatterns.forEach((pattern, _index) => {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(match => {
            const lineNumber = content
              .substring(0, content.indexOf(match))
              .split('\n').length;
            findings.push({
              category: 'Secrets',
              severity: 'high',
              title: 'Potential hardcoded secret',
              description: `Found potential hardcoded secret: ${match.substring(0, 50)}...`,
              file: file,
              line: lineNumber,
              recommendation:
                'Use environment variables or secure configuration management',
              status: 'open',
            });
          });
        }
      });

      // Check for SQL injection risks
      if (
        content.includes('prisma.$queryRaw') ||
        content.includes('prisma.$executeRaw')
      ) {
        findings.push({
          category: 'SQL Injection',
          severity: 'high',
          title: 'Raw SQL query detected',
          description:
            'Raw SQL queries detected - ensure proper parameterization',
          file: file,
          recommendation:
            'Use Prisma ORM methods or ensure proper parameterization of raw queries',
          status: 'open',
        });
      }

      // Check for XSS risks
      if (content.includes('dangerouslySetInnerHTML')) {
        findings.push({
          category: 'XSS',
          severity: 'medium',
          title: 'Dangerous HTML rendering',
          description:
            'dangerouslySetInnerHTML detected - ensure content is sanitized',
          file: file,
          recommendation: 'Sanitize HTML content or use safer alternatives',
          status: 'open',
        });
      }

      // Check for authentication bypass
      if (content.includes('bypass') && content.includes('auth')) {
        findings.push({
          category: 'Authentication',
          severity: 'high',
          title: 'Potential authentication bypass',
          description: 'Code contains authentication bypass logic',
          file: file,
          recommendation:
            'Review authentication logic for security implications',
          status: 'open',
        });
      }
    } catch (error) {
      console.log(`Error reading file ${file}:`, error);
    }
  }

  // Check security configurations
  await checkSecurityConfigurations(findings);

  // Calculate overall score
  const summary = {
    total: findings.length,
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  const overallScore = Math.max(
    0,
    100 -
      (summary.critical * 25 +
        summary.high * 15 +
        summary.medium * 10 +
        summary.low * 5)
  );

  const recommendations = [
    'Implement automated security scanning in CI/CD pipeline',
    'Regular dependency updates and vulnerability scanning',
    'Code review process for security-sensitive changes',
    'Security training for development team',
    'Regular penetration testing',
    'Implement security monitoring and alerting',
    'Maintain security documentation and incident response procedures',
  ];

  return {
    generatedAt: new Date().toISOString(),
    projectName: 'Aegrid - Asset Lifecycle Intelligence Platform',
    version: '0.2.0',
    overallScore,
    findings,
    summary,
    recommendations,
  };
}

async function findSourceFiles(): Promise<string[]> {
  const files: string[] = [];
  const extensions = ['.ts', '.tsx', '.js', '.jsx'];

  async function scanDirectory(dir: string) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
          // Skip node_modules, .git, .next, etc.
          if (
            !['node_modules', '.git', '.next', 'dist', 'build'].includes(
              entry.name
            )
          ) {
            await scanDirectory(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = entry.name.substring(entry.name.lastIndexOf('.'));
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch {
      // Skip directories we can't read
    }
  }

  await scanDirectory('.');
  return files;
}

async function checkSecurityConfigurations(findings: SecurityFinding[]) {
  // Check for security headers
  try {
    const nextConfig = await fs.readFile('next.config.ts', 'utf-8');
    if (!nextConfig.includes('securityHeaders')) {
      findings.push({
        category: 'Configuration',
        severity: 'medium',
        title: 'Security headers not configured',
        description: 'Next.js security headers not explicitly configured',
        file: 'next.config.ts',
        recommendation: 'Configure security headers in Next.js configuration',
        status: 'open',
      });
    }
  } catch {
    // next.config.ts might not exist
  }

  // Check for CORS configuration
  try {
    const middleware = await fs.readFile('middleware.ts', 'utf-8');
    if (!middleware.includes('cors') && !middleware.includes('CORS')) {
      findings.push({
        category: 'Configuration',
        severity: 'medium',
        title: 'CORS not explicitly configured',
        description: 'CORS policy not explicitly configured in middleware',
        file: 'middleware.ts',
        recommendation: 'Configure CORS policy for API endpoints',
        status: 'open',
      });
    }
  } catch {
    // middleware.ts might not exist
  }
}

async function main() {
  console.log('🔐 Generating comprehensive security report...');

  const report = await generateSecurityReport();

  // Generate markdown report
  const markdownReport = generateMarkdownReport(report);

  // Save report
  await fs.writeFile('SECURITY-REPORT.md', markdownReport);
  await fs.writeFile('security-report.json', JSON.stringify(report, null, 2));

  console.log('✅ Security report generated successfully!');
  console.log(`📊 Overall Security Score: ${report.overallScore}/100`);
  console.log(`📋 Total Findings: ${report.summary.total}`);
  console.log(
    `🚨 Critical: ${report.summary.critical}, High: ${report.summary.high}, Medium: ${report.summary.medium}, Low: ${report.summary.low}`
  );
  console.log(
    '📄 Reports saved to SECURITY-REPORT.md and security-report.json'
  );
}

function generateMarkdownReport(report: SecurityReport): string {
  return `# Security Report - ${report.projectName}

**Generated:** ${new Date(report.generatedAt).toLocaleString('en-AU')}
**Version:** ${report.version}
**Overall Security Score:** ${report.overallScore}/100

## Executive Summary

This comprehensive security report analyzes the Aegrid codebase for security vulnerabilities, misconfigurations, and best practices compliance.

### Security Score Breakdown
- **Critical Issues:** ${report.summary.critical}
- **High Issues:** ${report.summary.high}
- **Medium Issues:** ${report.summary.medium}
- **Low Issues:** ${report.summary.low}
- **Total Issues:** ${report.summary.total}

## Detailed Findings

${
  report.findings.length === 0
    ? '✅ No security issues detected!'
    : report.findings
        .map(
          finding => `
### ${finding.title}
- **Category:** ${finding.category}
- **Severity:** ${finding.severity.toUpperCase()}
- **Status:** ${finding.status}
- **Description:** ${finding.description}
${finding.file ? `- **File:** ${finding.file}` : ''}
${finding.line ? `- **Line:** ${finding.line}` : ''}
- **Recommendation:** ${finding.recommendation}
`
        )
        .join('\n')
}

## Security Recommendations

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps

1. **Immediate Actions:**
   - Address all critical and high severity findings
   - Implement security monitoring
   - Review and update security policies

2. **Short-term Actions:**
   - Address medium severity findings
   - Implement automated security scanning
   - Conduct security training

3. **Long-term Actions:**
   - Regular security assessments
   - Penetration testing
   - Security architecture review

## Compliance Status

- **ISO 27001:** ${report.overallScore >= 80 ? '✅ Compliant' : '⚠️ Needs attention'}
- **ISO 27002:** ${report.overallScore >= 80 ? '✅ Compliant' : '⚠️ Needs attention'}
- **OWASP Top 10:** ${report.summary.critical === 0 && report.summary.high <= 2 ? '✅ Compliant' : '⚠️ Needs attention'}

---
*This report was generated automatically. Please review all findings and implement appropriate security measures.*
`;
}

// Run if this is the main module
main().catch(console.error);

export { generateSecurityReport };
