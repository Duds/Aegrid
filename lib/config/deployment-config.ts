/**
 * Deployment Configuration Management
 *
 * This module provides configuration management for different deployment tiers:
 * - SaaS Multi-Tenant
 * - Single-Tenant Cloud
 * - Hybrid Cloud
 * - On-Premise
 */

export type DeploymentTier = 'saas' | 'single-tenant' | 'hybrid' | 'on-premise';

export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'sqlite';
  url: string;
  poolSize?: number;
  ssl?: boolean;
  rls?: boolean; // Row-Level Security
}

export interface AuthConfig {
  type: 'nextauth' | 'saml' | 'ldap' | 'oauth';
  providers: string[];
  saml?: {
    entryPoint: string;
    issuer: string;
    cert: string;
  };
  ldap?: {
    url: string;
    bindDN: string;
    bindCredentials: string;
    searchBase: string;
  };
}

export interface StorageConfig {
  type: 'azure-blob' | 'azure-blob-isolated' | 'local-file' | 's3';
  connectionString?: string;
  basePath?: string;
  container?: string;
}

export interface AnalyticsConfig {
  type: 'shared' | 'isolated' | 'local' | 'disabled';
  endpoint?: string;
  apiKey?: string;
}

export interface IntegrationConfig {
  name: string;
  type: 'webhook' | 'api' | 'file' | 'database';
  enabled: boolean;
  config: Record<string, any>;
}

export interface FeatureFlags {
  multiTenancy: boolean;
  sharedAnalytics: boolean;
  cloudStorage: boolean;
  samlAuth: boolean;
  isolatedAnalytics: boolean;
  customBranding: boolean;
  ldapAuth: boolean;
  localStorage: boolean;
  customIntegrations: boolean;
  airGappedMode: boolean;
  offlineMode: boolean;
  apiVersioning: boolean;
}

export interface BrandingConfig {
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string;
  title?: string;
  footer?: string;
}

export interface DeploymentConfig {
  tier: DeploymentTier;
  customerId?: string;
  database: DatabaseConfig;
  auth: AuthConfig;
  storage: StorageConfig;
  analytics: AnalyticsConfig;
  integrations: IntegrationConfig[];
  features: FeatureFlags;
  branding: BrandingConfig;
  limits?: {
    maxUsers?: number;
    maxAssets?: number;
    maxStorage?: number;
    maxApiCalls?: number;
  };
}

/**
 * Configuration Factory for creating deployment-specific configurations
 */
export class ConfigFactory {
  /**
   * Create configuration for a specific deployment tier
   */
  static create(tier: DeploymentTier, overrides?: Partial<DeploymentConfig>): DeploymentConfig {
    const baseConfig = this.getBaseConfig(tier);
    return this.mergeConfigs(baseConfig, overrides);
  }

  /**
   * Create configuration from environment variables
   */
  static fromEnvironment(): DeploymentConfig {
    const tier = (process.env.DEPLOYMENT_TIER as DeploymentTier) || 'saas';
    const customerId = process.env.CUSTOMER_ID;

    const config = this.create(tier, { customerId });

    // Override with environment variables
    if (process.env.DATABASE_URL) {
      config.database.url = process.env.DATABASE_URL;
    }

    if (process.env.STORAGE_CONNECTION_STRING) {
      config.storage.connectionString = process.env.STORAGE_CONNECTION_STRING;
    }

    if (process.env.ANALYTICS_ENDPOINT) {
      config.analytics.endpoint = process.env.ANALYTICS_ENDPOINT;
    }

    return config;
  }

  /**
   * Get base configuration for a deployment tier
   */
  private static getBaseConfig(tier: DeploymentTier): DeploymentConfig {
    switch (tier) {
      case 'saas':
        return this.getSaaSConfig();
      case 'single-tenant':
        return this.getSingleTenantConfig();
      case 'hybrid':
        return this.getHybridConfig();
      case 'on-premise':
        return this.getOnPremiseConfig();
      default:
        throw new Error(`Unknown deployment tier: ${tier}`);
    }
  }

  /**
   * SaaS Multi-Tenant Configuration
   */
  private static getSaaSConfig(): DeploymentConfig {
    return {
      tier: 'saas',
      database: {
        type: 'postgresql',
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/councilworks',
        poolSize: 20,
        ssl: true,
        rls: true, // Row-Level Security enabled
      },
      auth: {
        type: 'nextauth',
        providers: ['credentials', 'google', 'azure-ad'],
      },
      storage: {
        type: 'azure-blob',
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
        container: 'councilworks',
      },
      analytics: {
        type: 'shared',
        endpoint: process.env.ANALYTICS_ENDPOINT,
      },
      integrations: [
        {
          name: 'email',
          type: 'api',
          enabled: true,
          config: {
            provider: 'sendgrid',
            apiKey: process.env.SENDGRID_API_KEY,
          },
        },
        {
          name: 'sms',
          type: 'api',
          enabled: true,
          config: {
            provider: 'twilio',
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
          },
        },
      ],
      features: {
        multiTenancy: true,
        sharedAnalytics: true,
        cloudStorage: true,
        samlAuth: false,
        isolatedAnalytics: false,
        customBranding: false,
        ldapAuth: false,
        localStorage: false,
        customIntegrations: false,
        airGappedMode: false,
        offlineMode: true,
        apiVersioning: true,
      },
      branding: {
        title: 'Aegrid',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
      },
      limits: {
        maxUsers: 1000,
        maxAssets: 10000,
        maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
        maxApiCalls: 1000000,
      },
    };
  }

  /**
   * Single-Tenant Cloud Configuration
   */
  private static getSingleTenantConfig(): DeploymentConfig {
    return {
      tier: 'single-tenant',
      database: {
        type: 'postgresql',
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/councilworks',
        poolSize: 10,
        ssl: true,
        rls: false, // No RLS needed for single tenant
      },
      auth: {
        type: 'saml',
        providers: ['credentials', 'saml'],
        saml: {
          entryPoint: process.env.SAML_ENTRY_POINT || '',
          issuer: process.env.SAML_ISSUER || '',
          cert: process.env.SAML_CERT || '',
        },
      },
      storage: {
        type: 'azure-blob-isolated',
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
        container: `council-${process.env.CUSTOMER_ID || 'customer'}`,
      },
      analytics: {
        type: 'isolated',
        endpoint: process.env.ANALYTICS_ENDPOINT,
      },
      integrations: [
        {
          name: 'email',
          type: 'api',
          enabled: true,
          config: {
            provider: 'sendgrid',
            apiKey: process.env.SENDGRID_API_KEY,
          },
        },
        {
          name: 'sms',
          type: 'api',
          enabled: true,
          config: {
            provider: 'twilio',
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken: process.env.TWILIO_AUTH_TOKEN,
          },
        },
      ],
      features: {
        multiTenancy: false,
        sharedAnalytics: false,
        cloudStorage: true,
        samlAuth: true,
        isolatedAnalytics: true,
        customBranding: true,
        ldapAuth: false,
        localStorage: false,
        customIntegrations: true,
        airGappedMode: false,
        offlineMode: true,
        apiVersioning: true,
      },
      branding: {
        title: 'Aegrid',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
      },
      limits: {
        maxUsers: 5000,
        maxAssets: 50000,
        maxStorage: 500 * 1024 * 1024 * 1024, // 500GB
        maxApiCalls: 5000000,
      },
    };
  }

  /**
   * Hybrid Cloud Configuration
   */
  private static getHybridConfig(): DeploymentConfig {
    return {
      tier: 'hybrid',
      database: {
        type: 'postgresql',
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/councilworks',
        poolSize: 15,
        ssl: true,
        rls: false,
      },
      auth: {
        type: 'nextauth',
        providers: ['credentials', 'saml', 'ldap'],
        saml: {
          entryPoint: process.env.SAML_ENTRY_POINT || '',
          issuer: process.env.SAML_ISSUER || '',
          cert: process.env.SAML_CERT || '',
        },
        ldap: {
          url: process.env.LDAP_URL || '',
          bindDN: process.env.LDAP_BIND_DN || '',
          bindCredentials: process.env.LDAP_BIND_CREDENTIALS || '',
          searchBase: process.env.LDAP_SEARCH_BASE || '',
        },
      },
      storage: {
        type: 'azure-blob-isolated',
        connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING,
        container: `council-${process.env.CUSTOMER_ID || 'customer'}`,
      },
      analytics: {
        type: 'isolated',
        endpoint: process.env.ANALYTICS_ENDPOINT,
      },
      integrations: [
        {
          name: 'email',
          type: 'api',
          enabled: true,
          config: {
            provider: 'sendgrid',
            apiKey: process.env.SENDGRID_API_KEY,
          },
        },
        {
          name: 'local-erp',
          type: 'api',
          enabled: true,
          config: {
            endpoint: process.env.LOCAL_ERP_ENDPOINT,
            apiKey: process.env.LOCAL_ERP_API_KEY,
          },
        },
      ],
      features: {
        multiTenancy: false,
        sharedAnalytics: false,
        cloudStorage: true,
        samlAuth: true,
        isolatedAnalytics: true,
        customBranding: true,
        ldapAuth: true,
        localStorage: false,
        customIntegrations: true,
        airGappedMode: false,
        offlineMode: true,
        apiVersioning: true,
      },
      branding: {
        title: 'Aegrid',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
      },
      limits: {
        maxUsers: 10000,
        maxAssets: 100000,
        maxStorage: 1000 * 1024 * 1024 * 1024, // 1TB
        maxApiCalls: 10000000,
      },
    };
  }

  /**
   * On-Premise Configuration
   */
  private static getOnPremiseConfig(): DeploymentConfig {
    return {
      tier: 'on-premise',
      database: {
        type: 'postgresql',
        url: process.env.DATABASE_URL || 'postgresql://localhost:5432/councilworks',
        poolSize: 10,
        ssl: false,
        rls: false,
      },
      auth: {
        type: 'ldap',
        providers: ['credentials', 'ldap'],
        ldap: {
          url: process.env.LDAP_URL || 'ldap://localhost:389',
          bindDN: process.env.LDAP_BIND_DN || '',
          bindCredentials: process.env.LDAP_BIND_CREDENTIALS || '',
          searchBase: process.env.LDAP_SEARCH_BASE || '',
        },
      },
      storage: {
        type: 'local-file',
        basePath: process.env.LOCAL_STORAGE_PATH || '/app/storage',
      },
      analytics: {
        type: 'local',
      },
      integrations: [
        {
          name: 'email',
          type: 'api',
          enabled: true,
          config: {
            provider: 'smtp',
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            username: process.env.SMTP_USERNAME,
            password: process.env.SMTP_PASSWORD,
          },
        },
        {
          name: 'local-erp',
          type: 'api',
          enabled: true,
          config: {
            endpoint: process.env.LOCAL_ERP_ENDPOINT,
            apiKey: process.env.LOCAL_ERP_API_KEY,
          },
        },
      ],
      features: {
        multiTenancy: false,
        sharedAnalytics: false,
        cloudStorage: false,
        samlAuth: false,
        isolatedAnalytics: false,
        customBranding: true,
        ldapAuth: true,
        localStorage: true,
        customIntegrations: true,
        airGappedMode: true,
        offlineMode: true,
        apiVersioning: true,
      },
      branding: {
        title: 'Aegrid',
        primaryColor: '#2563eb',
        secondaryColor: '#1e40af',
      },
      limits: {
        maxUsers: 50000,
        maxAssets: 500000,
        maxStorage: 10 * 1024 * 1024 * 1024 * 1024, // 10TB
        maxApiCalls: 100000000,
      },
    };
  }

  /**
   * Merge configuration objects
   */
  private static mergeConfigs(base: DeploymentConfig, overrides?: Partial<DeploymentConfig>): DeploymentConfig {
    if (!overrides) return base;

    return {
      ...base,
      ...overrides,
      database: { ...base.database, ...overrides.database },
      auth: { ...base.auth, ...overrides.auth },
      storage: { ...base.storage, ...overrides.storage },
      analytics: { ...base.analytics, ...overrides.analytics },
      integrations: overrides.integrations || base.integrations,
      features: { ...base.features, ...overrides.features },
      branding: { ...base.branding, ...overrides.branding },
      limits: { ...base.limits, ...overrides.limits },
    };
  }
}

/**
 * Global configuration instance
 */
let globalConfig: DeploymentConfig | null = null;

/**
 * Get the current deployment configuration
 */
export function getConfig(): DeploymentConfig {
  if (!globalConfig) {
    globalConfig = ConfigFactory.fromEnvironment();
  }
  return globalConfig;
}

/**
 * Set the deployment configuration (for testing)
 */
export function setConfig(config: DeploymentConfig): void {
  globalConfig = config;
}

/**
 * Reset the configuration (for testing)
 */
export function resetConfig(): void {
  globalConfig = null;
}
