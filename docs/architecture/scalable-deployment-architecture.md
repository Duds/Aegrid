# Scalable Deployment Architecture (Aegrid)

## 🎯 **Executive Summary**

This document outlines the scalable architecture design for Aegrid that supports multiple deployment tiers:
- **Tier 1**: Multi-tenant SaaS (Current)
- **Tier 2**: Single-tenant Cloud (Isolated)
- **Tier 3**: Hybrid Cloud (Hybrid)
- **Tier 4**: Fully On-Premise (Air-gapped)

## 🏗️ **Core Architecture Principles**

### **1. Separation of Concerns**
- **Data Layer**: Database-agnostic with configurable connection strategies
- **Authentication Layer**: Pluggable auth providers (local, OAuth, SAML, LDAP)
- **Business Logic**: Stateless services with dependency injection
- **Presentation Layer**: Configurable UI components and branding
- **Integration Layer**: Modular adapters for external systems

### **2. Configuration-Driven Deployment**
- Environment-specific configuration files
- Feature flags for tier-specific functionality
- Pluggable service providers
- Configurable data retention policies

### **3. Zero-Downtime Migration Path**
- Blue-green deployment support
- Database migration strategies
- Configuration migration tools
- Rollback capabilities

## 📊 **Deployment Tier Matrix**

| Feature | SaaS Multi-Tenant | Single-Tenant Cloud | Hybrid Cloud | On-Premise |
|---------|------------------|-------------------|--------------|------------|
| **Database** | Shared PostgreSQL + RLS | Isolated PostgreSQL | Customer DB + Sync | Customer DB |
| **Authentication** | NextAuth.js + OAuth | NextAuth.js + SAML | Hybrid (Cloud + Local) | LDAP/AD + Local |
| **File Storage** | Azure Blob + RLS | Azure Blob (Isolated) | Hybrid Storage | Local Storage |
| **Analytics** | Shared Analytics | Isolated Analytics | Customer Analytics | Local Analytics |
| **Backup** | Automated Cloud | Automated Cloud | Hybrid Backup | Customer Backup |
| **Monitoring** | Shared Monitoring | Isolated Monitoring | Customer Monitoring | Local Monitoring |
| **Updates** | Automatic | Scheduled | Customer Controlled | Customer Controlled |
| **Data Sovereignty** | Australia (Cloud) | Australia (Isolated) | Customer Choice | Customer Choice |
| **Integration** | Standard APIs | Custom APIs | Hybrid APIs | Local APIs |

## 🔧 **Architecture Components**

### **Core Services Layer**

```typescript
// Abstract service interfaces for pluggable implementations
interface DatabaseService {
  connect(config: DatabaseConfig): Promise<void>;
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  transaction<T>(operation: (tx: Transaction) => Promise<T>): Promise<T>;
}

interface AuthService {
  authenticate(credentials: AuthCredentials): Promise<AuthResult>;
  authorize(user: User, resource: Resource): Promise<boolean>;
  getProviders(): AuthProvider[];
}

interface StorageService {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  list(prefix: string): Promise<FileInfo[]>;
}

interface AnalyticsService {
  track(event: AnalyticsEvent): Promise<void>;
  query(metrics: MetricsQuery): Promise<AnalyticsResult>;
  export(data: ExportRequest): Promise<ExportResult>;
}
```

### **Configuration Management**

```typescript
// Environment-specific configuration
interface DeploymentConfig {
  tier: 'saas' | 'single-tenant' | 'hybrid' | 'on-premise';
  database: DatabaseConfig;
  auth: AuthConfig;
  storage: StorageConfig;
  analytics: AnalyticsConfig;
  integrations: IntegrationConfig[];
  features: FeatureFlags;
  branding: BrandingConfig;
}

// Configuration factory for different tiers
class ConfigFactory {
  static create(tier: DeploymentTier, overrides?: Partial<DeploymentConfig>): DeploymentConfig {
    const baseConfig = this.getBaseConfig(tier);
    return { ...baseConfig, ...overrides };
  }

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
    }
  }
}
```

## 🗄️ **Database Architecture**

### **Multi-Tenant (SaaS)**
```sql
-- Current implementation with RLS
CREATE POLICY org_isolation ON assets
  FOR ALL USING (organisation_id = current_setting('app.organisation_id')::uuid);

-- Enhanced with tenant metadata
ALTER TABLE organisations ADD COLUMN tier VARCHAR(20) DEFAULT 'saas';
ALTER TABLE organisations ADD COLUMN features JSONB DEFAULT '{}';
ALTER TABLE organisations ADD COLUMN limits JSONB DEFAULT '{}';
```

### **Single-Tenant Cloud**
```sql
-- Separate database per customer
-- Connection string: postgresql://user:pass@host:5432/council_[customer_id]

-- Same schema, no RLS needed
-- All queries scoped by database connection
```

### **On-Premise**
```sql
-- Customer-managed database
-- Custom schema modifications possible
-- Local backup and recovery

-- Optional: Schema versioning table
CREATE TABLE schema_version (
  version VARCHAR(20) PRIMARY KEY,
  applied_at TIMESTAMP DEFAULT NOW(),
  description TEXT
);
```

## 🔐 **Authentication Architecture**

### **SaaS Multi-Tenant**
```typescript
// Current NextAuth.js implementation
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({ /* current implementation */ }),
    GoogleProvider({ /* current implementation */ }),
    AzureADProvider({ /* current implementation */ })
  ],
  // RLS context set per request
  callbacks: {
    async jwt({ token, user }) {
      // Set organisation context
      token.organisationId = user.organisationId;
      return token;
    }
  }
};
```

### **Single-Tenant Cloud**
```typescript
// Enhanced with SAML support
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({ /* current implementation */ }),
    SAMLProvider({
      id: "saml",
      name: "SAML",
      options: {
        // Customer-specific SAML configuration
        entryPoint: process.env.SAML_ENTRY_POINT,
        issuer: process.env.SAML_ISSUER,
        cert: process.env.SAML_CERT,
      }
    })
  ],
  // No organisation context needed (single tenant)
};
```

### **On-Premise**
```typescript
// LDAP/Active Directory integration
const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({ /* current implementation */ }),
    LDAPProvider({
      id: "ldap",
      name: "LDAP",
      options: {
        server: {
          url: process.env.LDAP_URL,
          bindDN: process.env.LDAP_BIND_DN,
          bindCredentials: process.env.LDAP_BIND_CREDENTIALS,
          searchBase: process.env.LDAP_SEARCH_BASE,
        }
      }
    })
  ],
  // Local user management
};
```

## 📁 **Storage Architecture**

### **Multi-Tenant SaaS**
```typescript
class AzureBlobStorageService implements StorageService {
  private container: ContainerClient;

  constructor(connectionString: string) {
    const blobServiceClient = new BlobServiceClient(connectionString);
    this.container = blobServiceClient.getContainerClient('councilworks');
  }

  async upload(file: File, path: string): Promise<string> {
    // Path includes organisation ID for isolation
    const blobPath = `${this.getOrganisationId()}/${path}`;
    const blockBlobClient = this.container.getBlockBlobClient(blobPath);
    await blockBlobClient.upload(file, file.size);
    return blobPath;
  }

  private getOrganisationId(): string {
    // Get from RLS context or session
    return getCurrentOrganisationId();
  }
}
```

### **Single-Tenant Cloud**
```typescript
class IsolatedBlobStorageService implements StorageService {
  private container: ContainerClient;

  constructor(customerId: string, connectionString: string) {
    const blobServiceClient = new BlobServiceClient(connectionString);
    this.container = blobServiceClient.getContainerClient(`council-${customerId}`);
  }

  async upload(file: File, path: string): Promise<string> {
    // No organisation prefix needed (single tenant)
    const blockBlobClient = this.container.getBlockBlobClient(path);
    await blockBlobClient.upload(file, file.size);
    return path;
  }
}
```

### **On-Premise**
```typescript
class LocalFileStorageService implements StorageService {
  private basePath: string;

  constructor(basePath: string) {
    this.basePath = basePath;
  }

  async upload(file: File, path: string): Promise<string> {
    const fullPath = join(this.basePath, path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, file);
    return path;
  }
}
```

## 🔄 **Migration Strategies**

### **SaaS to Single-Tenant**
```typescript
class MigrationService {
  async migrateToSingleTenant(organisationId: string): Promise<MigrationResult> {
    // 1. Export all data for the organisation
    const data = await this.exportOrganisationData(organisationId);

    // 2. Create isolated database
    const newDatabase = await this.createIsolatedDatabase(organisationId);

    // 3. Import data to new database
    await this.importData(newDatabase, data);

    // 4. Update DNS and configuration
    await this.updateDNS(organisationId);

    // 5. Verify migration
    await this.verifyMigration(organisationId);

    return { success: true, newUrl: this.getNewUrl(organisationId) };
  }
}
```

### **Single-Tenant to On-Premise**
```typescript
class OnPremiseMigrationService {
  async migrateToOnPremise(customerId: string, targetConfig: OnPremiseConfig): Promise<MigrationResult> {
    // 1. Export all data
    const data = await this.exportCustomerData(customerId);

    // 2. Prepare on-premise environment
    await this.prepareOnPremiseEnvironment(targetConfig);

    // 3. Import data to on-premise
    await this.importToOnPremise(targetConfig, data);

    // 4. Configure local integrations
    await this.configureLocalIntegrations(targetConfig);

    // 5. Handover to customer
    await this.handoverToCustomer(customerId, targetConfig);

    return { success: true, handoverComplete: true };
  }
}
```

## 🚀 **Deployment Automation**

### **Infrastructure as Code**
```yaml
# docker-compose.saas.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - DEPLOYMENT_TIER=saas
      - DATABASE_URL=${DATABASE_URL}
      - STORAGE_TYPE=azure-blob
    depends_on:
      - db

  db:
    image: postgres:15-postgis
    environment:
      - POSTGRES_DB=councilworks
    volumes:
      - postgres_data:/var/lib/postgresql/data

# docker-compose.single-tenant.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - DEPLOYMENT_TIER=single-tenant
      - CUSTOMER_ID=${CUSTOMER_ID}
      - DATABASE_URL=${CUSTOMER_DATABASE_URL}
      - STORAGE_TYPE=azure-blob-isolated
    depends_on:
      - db

  db:
    image: postgres:15-postgis
    environment:
      - POSTGRES_DB=council_${CUSTOMER_ID}
    volumes:
      - customer_data:/var/lib/postgresql/data

# docker-compose.on-premise.yml
version: '3.8'
services:
  app:
    build: .
    environment:
      - DEPLOYMENT_TIER=on-premise
      - DATABASE_URL=${LOCAL_DATABASE_URL}
      - STORAGE_TYPE=local-file
      - AUTH_TYPE=ldap
    depends_on:
      - db
      - ldap

  db:
    image: postgres:15-postgis
    environment:
      - POSTGRES_DB=councilworks
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ldap:
    image: osixia/openldap
    environment:
      - LDAP_ORGANISATION=${LDAP_ORGANISATION}
      - LDAP_DOMAIN=${LDAP_DOMAIN}
    volumes:
      - ldap_data:/var/lib/ldap
```

### **Deployment Scripts**
```bash
#!/bin/bash
# deploy.sh - Universal deployment script

DEPLOYMENT_TIER=${1:-saas}
CUSTOMER_ID=${2:-}

case $DEPLOYMENT_TIER in
  "saas")
    docker-compose -f docker-compose.saas.yml up -d
    ;;
  "single-tenant")
    if [ -z "$CUSTOMER_ID" ]; then
      echo "Error: CUSTOMER_ID required for single-tenant deployment"
      exit 1
    fi
    export CUSTOMER_ID
    docker-compose -f docker-compose.single-tenant.yml up -d
    ;;
  "on-premise")
    docker-compose -f docker-compose.on-premise.yml up -d
    ;;
  *)
    echo "Error: Unknown deployment tier: $DEPLOYMENT_TIER"
    exit 1
    ;;
esac
```

## 🔍 **Monitoring & Observability**

### **Multi-Tenant SaaS**
```typescript
class SharedMonitoringService {
  track(organisationId: string, event: MonitoringEvent): void {
    // Tag all metrics with organisation ID
    this.metrics.counter('user_action', {
      organisation: organisationId,
      action: event.action,
      user_role: event.userRole
    }).inc();
  }
}
```

### **Single-Tenant Cloud**
```typescript
class IsolatedMonitoringService {
  track(customerId: string, event: MonitoringEvent): void {
    // Customer-specific monitoring
    this.metrics.counter('user_action', {
      customer: customerId,
      action: event.action
    }).inc();
  }
}
```

### **On-Premise**
```typescript
class LocalMonitoringService {
  track(event: MonitoringEvent): void {
    // Local monitoring only
    this.localMetrics.counter('user_action', {
      action: event.action
    }).inc();
  }
}
```

## 🎛️ **Feature Flags & Configuration**

```typescript
interface FeatureFlags {
  // SaaS features
  multiTenancy: boolean;
  sharedAnalytics: boolean;
  cloudStorage: boolean;

  // Single-tenant features
  samlAuth: boolean;
  isolatedAnalytics: boolean;
  customBranding: boolean;

  // On-premise features
  ldapAuth: boolean;
  localStorage: boolean;
  customIntegrations: boolean;
  airGappedMode: boolean;
}

class FeatureFlagService {
  static getFlags(tier: DeploymentTier): FeatureFlags {
    switch (tier) {
      case 'saas':
        return {
          multiTenancy: true,
          sharedAnalytics: true,
          cloudStorage: true,
          samlAuth: false,
          isolatedAnalytics: false,
          customBranding: false,
          ldapAuth: false,
          localStorage: false,
          customIntegrations: false,
          airGappedMode: false
        };
      case 'single-tenant':
        return {
          multiTenancy: false,
          sharedAnalytics: false,
          cloudStorage: true,
          samlAuth: true,
          isolatedAnalytics: true,
          customBranding: true,
          ldapAuth: false,
          localStorage: false,
          customIntegrations: true,
          airGappedMode: false
        };
      case 'on-premise':
        return {
          multiTenancy: false,
          sharedAnalytics: false,
          cloudStorage: false,
          samlAuth: false,
          isolatedAnalytics: false,
          customBranding: true,
          ldapAuth: true,
          localStorage: true,
          customIntegrations: true,
          airGappedMode: true
        };
    }
  }
}
```

## 📋 **Implementation Roadmap**

### **Phase 1: Foundation (Weeks 1-4)**
- [ ] Abstract service interfaces
- [ ] Configuration management system
- [ ] Feature flag implementation
- [ ] Basic deployment scripts

### **Phase 2: Single-Tenant Support (Weeks 5-8)**
- [ ] Isolated database support
- [ ] SAML authentication
- [ ] Isolated storage service
- [ ] Migration tools

### **Phase 3: On-Premise Support (Weeks 9-12)**
- [ ] LDAP authentication
- [ ] Local storage service
- [ ] Air-gapped mode
- [ ] Local monitoring

### **Phase 4: Advanced Features (Weeks 13-16)**
- [ ] Hybrid deployment support
- [ ] Advanced migration tools
- [ ] Custom integration framework
- [ ] Performance optimization

## 🔒 **Security Considerations**

### **Data Isolation**
- **SaaS**: Row-Level Security (RLS) with organisation scoping
- **Single-Tenant**: Database-level isolation
- **On-Premise**: Physical isolation with customer control

### **Authentication Security**
- **SaaS**: NextAuth.js with OAuth providers
- **Single-Tenant**: SAML with customer IdP
- **On-Premise**: LDAP/AD with local user management

### **Network Security**
- **SaaS**: Azure VNet with private endpoints
- **Single-Tenant**: Customer VNet with private endpoints
- **On-Premise**: Customer network with firewall rules

## 💰 **Cost Implications**

### **SaaS Multi-Tenant**
- **Infrastructure**: Shared costs across all customers
- **Scaling**: Automatic scaling based on usage
- **Maintenance**: Centralized updates and patches

### **Single-Tenant Cloud**
- **Infrastructure**: Dedicated resources per customer
- **Scaling**: Customer-specific scaling requirements
- **Maintenance**: Isolated updates and patches

### **On-Premise**
- **Infrastructure**: Customer-owned hardware
- **Scaling**: Customer-managed scaling
- **Maintenance**: Customer-managed updates and patches

## 🎯 **Next Steps**

1. **Implement service abstractions** in the current codebase
2. **Create configuration management system** for different deployment tiers
3. **Develop migration tools** for tier transitions
4. **Build deployment automation** for different environments
5. **Test deployment scenarios** in development environment

This architecture provides a clear path for scaling Aegrid from SaaS to on-premise deployments while maintaining code reusability and operational efficiency.
