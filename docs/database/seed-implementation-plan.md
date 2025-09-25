# Seed Implementation Plan - Technical Specifications
## Greenfield Shire Council Comprehensive Data Seeding

### Implementation Overview

This document provides detailed technical specifications for implementing the comprehensive synthetic data seeding strategy for the Greenfield Shire Council test database.

### Current Database State

**Existing Data Analysis:**
- **Organisations:** 2 (Greenfield Shire Council, Sample Council)
- **Users:** 6 for Greenfield Shire Council
- **Assets:** 6 basic assets
- **Work Orders:** 0
- **Vendors:** 0
- **Critical Controls:** 6 basic controls

**Database Schema:** 48 models with full PostGIS support

### Phase 1: Foundation Data Implementation

#### 1.1 Enhanced User Personas (25 users)

**Target Users by Role:**
```typescript
const userDistribution = {
  EXEC: 2,           // Executive leadership
  MANAGER: 5,        // Department managers
  SUPERVISOR: 8,     // Team supervisors
  CREW: 8,           // Field workers
  CONTRACTOR: 2      // External contractors
};
```

**User Data Structure:**
```typescript
interface UserSeedData {
  email: string;           // @greenfieldshire.gov.au domain
  name: string;            // Realistic Australian names
  role: Role;              // From enum
  organisationId: string;  // Greenfield Shire Council
  phoneNumber: string;     // Australian format +61 4xx xxx xxx
  bio: string;             // Role-appropriate description
  timezone: string;        // Australia/Sydney
  language: string;        // en-AU
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    emergency_alerts: boolean;
    strategic_reports: boolean;
    margin_alerts: boolean;
  };
}
```

**Implementation File:** `prisma/seed-data/foundation/enhanced-users.ts`

#### 1.2 Comprehensive Asset Portfolio (500+ assets)

**Asset Distribution by Type:**
```typescript
const assetDistribution = {
  // Traditional Infrastructure (200 assets)
  BUILDING: 45,                    // Council buildings, facilities
  ROAD: 60,                        // Roads, streets, highways
  BRIDGE: 8,                       // Road bridges, footbridges
  FOOTPATH: 40,                    // Pedestrian walkways
  PARK: 25,                        // Public parks, reserves
  PLAYGROUND: 15,                  // Playground equipment
  SPORTS_FACILITY: 7,              // Sports grounds, courts

  // Utilities Infrastructure (80 assets)
  WATER_SUPPLY: 20,                // Water treatment, distribution
  SEWER: 15,                       // Wastewater systems
  DRAINAGE: 25,                    // Stormwater systems
  ELECTRICAL_INFRASTRUCTURE: 20,   // Substations, distribution

  // Smart Infrastructure (150 assets)
  SMART_STREETLIGHT: 50,           // LED smart streetlights
  SMART_TRAFFIC_LIGHT: 25,         // Intelligent traffic systems
  TRAFFIC_SENSOR: 30,              // Traffic monitoring
  IOT_SENSOR: 25,                  // Environmental sensors
  AIR_QUALITY_MONITOR: 10,         // Air quality monitoring
  SMART_WATER_METER: 10,           // Water usage monitoring

  // Renewable Energy (100 assets)
  SOLAR_ARRAY: 30,                 // Solar panel installations
  WIND_TURBINE: 15,                // Wind energy systems
  BATTERY_STORAGE: 20,             // Energy storage systems
  EV_CHARGING_STATION: 25,         // Electric vehicle charging
  GRID_SCALE_BATTERY: 5,           // Large-scale storage
  COMMUNITY_BATTERY: 5,            // Community energy storage

  // Emergency & Specialised (70 assets)
  TELECOMMUNICATIONS: 15,          // Communication towers
  WATER_TREATMENT_PLANT: 5,        // Treatment facilities
  WASTEWATER_TREATMENT_PLANT: 5,   // Treatment facilities
  WATER_STORAGE_TANK: 15,          // Water storage
  CAR_PARK: 10,                    // Public car parks
  STREET_FURNITURE: 20             // Benches, bins, signage
};
```

**Asset Data Structure:**
```typescript
interface AssetSeedData {
  assetNumber: string;             // Unique identifier
  name: string;                    // Descriptive name
  description: string;             // Detailed description
  assetType: AssetType;            // From enum
  status: AssetStatus;             // ACTIVE, INACTIVE, etc.
  condition: AssetCondition;       // EXCELLENT, GOOD, FAIR, POOR, CRITICAL
  priority: AssetPriority;         // LOW, MEDIUM, HIGH, CRITICAL
  purpose: string;                 // Service purpose
  purposeDescription: string;      // Detailed purpose
  criticalityLevel: string;        // Critical, High, Medium, Low
  serviceImpact: string;           // Impact description
  functionBasedCategory: string;   // Aegrid Rule 1 compliance

  // Location data
  address: string;                 // Australian address format
  suburb: string;                  // NSW suburbs
  postcode: string;                // NSW postcodes
  state: string;                   // NSW
  country: string;                 // Australia
  location: geometry;              // PostGIS coordinates

  // Asset details
  manufacturer: string;            // Realistic manufacturers
  model: string;                   // Model numbers
  serialNumber: string;            // Unique serial numbers
  installationDate: Date;          // Installation timeline
  warrantyExpiry: Date;            // Warranty periods
  expectedLifespan: number;        // Years

  // Financial data
  purchasePrice: Decimal;          // $1,000 - $10,000,000 AUD
  currentValue: Decimal;           // Depreciated value
  replacementCost: Decimal;        // Replacement cost
  depreciationRate: Decimal;       // Annual depreciation %

  // Maintenance data
  lastInspection: Date;            // Recent inspection
  nextInspection: Date;            // Scheduled inspection
  inspectionFrequency: number;     // Days between inspections
  maintenanceCost: Decimal;        // Annual maintenance cost

  // Metadata
  tags: string[];                  // Categorisation tags
  notes: string;                   // Additional notes
  isPublic: boolean;               // Public visibility
  createdBy: string;               // User ID
  updatedBy: string;               // User ID
}
```

**Implementation Files:**
- `prisma/seed-data/foundation/traditional-assets.ts`
- `prisma/seed-data/foundation/smart-assets.ts`
- `prisma/seed-data/foundation/renewable-assets.ts`
- `prisma/seed-data/foundation/specialised-assets.ts`

#### 1.3 Vendor Ecosystem (15 vendors)

**Vendor Categories:**
```typescript
const vendorCategories = {
  electrical: 4,        // Electrical contractors
  civil: 3,             // Civil construction
  maintenance: 3,       // General maintenance
  specialist: 3,        // Specialised services
  equipment: 2          // Equipment suppliers
};
```

**Vendor Data Structure:**
```typescript
interface VendorSeedData {
  name: string;                    // Company name
  abn: string;                     // Australian Business Number
  contactEmail: string;            // Contact email
  contactPhone: string;            // Australian phone format
  performanceRating: Decimal;      // 1.0 - 5.0 scale
  capacityMargin: number;          // 15-30% margin
  specialisations: string[];       // Service areas
  certifications: string[];        // Industry certifications
}
```

**Implementation File:** `prisma/seed-data/foundation/vendor-ecosystem.ts`

### Phase 2: Operational Data Implementation

#### 2.1 Historical Work Orders (2,000 records)

**Work Order Distribution:**
```typescript
const workOrderDistribution = {
  status: {
    COMPLETED: 1600,      // 80% completed
    IN_PROGRESS: 200,     // 10% in progress
    OPEN: 150,            // 7.5% open
    CANCELLED: 50         // 2.5% cancelled
  },
  priority: {
    LOW: 800,             // 40% low priority
    MEDIUM: 800,          // 40% medium priority
    HIGH: 300,            // 15% high priority
    CRITICAL: 100         // 5% critical priority
  },
  timeRange: {
    last24Months: 2000    // 2 years of history
  }
};
```

**Work Order Data Structure:**
```typescript
interface WorkOrderSeedData {
  workOrderNumber: string;         // Unique WO number
  title: string;                   // Descriptive title
  description: string;             // Detailed description
  priority: AssetPriority;         // From enum
  status: string;                  // OPEN, IN_PROGRESS, COMPLETED, etc.

  // Assignment data
  assignedTo: string;              // User ID
  assignedBy: string;              // User ID
  vendorId?: string;               // Vendor ID if contracted

  // Scheduling data
  scheduledDate: Date;             // Scheduled start
  dueDate: Date;                   // Due date
  completedDate?: Date;            // Actual completion

  // SLA tracking
  slaResponseTime?: number;        // Response time in hours
  slaResolutionTime?: number;      // Resolution time in hours
  slaStatus?: string;              // SLA compliance status

  // Cost data
  estimatedCost?: Decimal;         // Estimated cost
  actualCost?: Decimal;            // Actual cost
  estimatedDuration?: number;      // Estimated hours
  actualDuration?: number;         // Actual hours

  // Work details
  workPerformed?: string;          // Work performed description
  notes?: string;                  // Additional notes
  evidenceCount: number;           // Number of evidence items
}
```

**Implementation File:** `prisma/seed-data/operational/work-orders.ts`

#### 2.2 Inspection Records (1,500 records)

**Inspection Distribution:**
```typescript
const inspectionDistribution = {
  condition: {
    EXCELLENT: 300,        // 20% excellent
    GOOD: 750,             // 50% good
    FAIR: 300,             // 20% fair
    POOR: 120,             // 8% poor
    CRITICAL: 30           // 2% critical
  },
  frequency: {
    daily: 100,            // Daily inspections
    weekly: 200,           // Weekly inspections
    monthly: 400,          // Monthly inspections
    quarterly: 500,        // Quarterly inspections
    annually: 300          // Annual inspections
  }
};
```

**Inspection Data Structure:**
```typescript
interface InspectionSeedData {
  inspectionDate: Date;            // Inspection date
  inspectorName: string;           // Inspector name
  inspectorId: string;             // User ID
  condition: AssetCondition;       // From enum
  conditionNotes?: string;         // Condition details
  riskScore?: number;              // 1-100 risk score
  issues: string[];                // Identified issues
  recommendations?: string;        // Recommendations
  nextInspectionDate?: Date;       // Next scheduled inspection
  priorityActions?: string;        // Priority actions required
}
```

**Implementation File:** `prisma/seed-data/operational/inspections.ts`

#### 2.3 Maintenance Records (1,800 records)

**Maintenance Distribution:**
```typescript
const maintenanceDistribution = {
  type: {
    INSPECTION: 600,       // 33% inspections
    CLEANING: 300,         // 17% cleaning
    LUBRICATION: 180,      // 10% lubrication
    ADJUSTMENT: 180,       // 10% adjustments
    REPLACEMENT: 270,      // 15% replacements
    REPAIR: 270           // 15% repairs
  },
  frequency: {
    daily: 180,            // 10% daily
    weekly: 360,           // 20% weekly
    monthly: 540,          // 30% monthly
    quarterly: 360,        // 20% quarterly
    annually: 180,         // 10% annual
    as_needed: 180         // 10% as needed
  }
};
```

**Maintenance Data Structure:**
```typescript
interface MaintenanceSeedData {
  maintenanceDate: Date;           // Maintenance date
  maintenanceType: string;         // Type of maintenance
  description: string;             // Detailed description
  performedBy: string;             // User ID
  cost?: Decimal;                  // Maintenance cost
  duration?: number;               // Duration in hours
  materials?: string;              // Materials used
  issuesFound?: string;            // Issues discovered
  workPerformed?: string;          // Work performed
  recommendations?: string;        // Recommendations
}
```

**Implementation File:** `prisma/seed-data/operational/maintenance.ts`

### Phase 3: Risk & Compliance Implementation

#### 3.1 Critical Controls (25 controls)

**Control Categories:**
```typescript
const controlCategories = {
  safety: 8,              // Safety controls
  environmental: 6,       // Environmental controls
  operational: 6,         // Operational controls
  financial: 3,           // Financial controls
  compliance: 2           // Compliance controls
};
```

**Control Data Structure:**
```typescript
interface CriticalControlSeedData {
  name: string;                    // Control name
  description?: string;            // Control description
  type: string;                    // Control type
  windowHours: number;             // Response window
  frequencyDays: number;           // Frequency in days
  escalationPolicy?: string;       // Escalation procedure
  status: string;                  // ACTIVE, INACTIVE
}
```

**Implementation File:** `prisma/seed-data/compliance/critical-controls.ts`

#### 3.2 Risk Signals (300 records)

**Signal Distribution:**
```typescript
const signalDistribution = {
  type: {
    environmental: 120,    // 40% environmental
    performance: 90,       // 30% performance
    equipment: 60,         // 20% equipment
    service: 30           // 10% service
  },
  severity: {
    LOW: 120,             // 40% low severity
    MEDIUM: 120,          // 40% medium severity
    HIGH: 45,             // 15% high severity
    CRITICAL: 15          // 5% critical severity
  }
};
```

**Signal Data Structure:**
```typescript
interface RiskSignalSeedData {
  signalType: string;             // Signal type
  severity: string;               // Severity level
  description: string;            // Signal description
  source: string;                 // Signal source
  detectedAt: Date;               // Detection time
  resolvedAt?: Date;              // Resolution time
  status: string;                 // OPEN, RESOLVED, ESCALATED
  detectedBy: string;             // User ID
}
```

**Implementation File:** `prisma/seed-data/compliance/risk-signals.ts`

### Phase 4: Advanced Features Implementation

#### 4.1 Energy Systems (50 systems)

**Energy System Distribution:**
```typescript
const energySystemDistribution = {
  type: {
    SOLAR_ARRAY: 20,              // 40% solar
    WIND_TURBINE: 10,             // 20% wind
    BATTERY_STORAGE: 15,          // 30% storage
    GRID_CONNECTION: 5            // 10% grid
  },
  capacity: {
    small: 20,                    // < 100kW
    medium: 20,                   // 100kW - 1MW
    large: 10                     // > 1MW
  }
};
```

**Energy System Data Structure:**
```typescript
interface EnergySystemSeedData {
  name: string;                   // System name
  systemType: string;             // System type
  status: string;                 // ACTIVE, INACTIVE, MAINTENANCE
  capacity: Decimal;              // Capacity in kW
  currentOutput: Decimal;         // Current output
  efficiency: Decimal;            // Efficiency percentage
  location?: string;              // Location description
  gridConnection: boolean;        // Grid connected
  batteryLevel?: Decimal;         // Battery charge level
  lastMaintenance?: Date;         // Last maintenance
  nextMaintenance?: Date;         // Next maintenance
}
```

**Implementation File:** `prisma/seed-data/advanced/energy-systems.ts`

#### 4.2 Performance KPIs (100 KPIs)

**KPI Categories:**
```typescript
const kpiCategories = {
  asset_performance: 30,          // Asset-specific KPIs
  service_delivery: 25,           // Service delivery KPIs
  cost_efficiency: 20,            // Cost efficiency KPIs
  environmental: 15,              // Environmental KPIs
  safety: 10                      // Safety KPIs
};
```

**KPI Data Structure:**
```typescript
interface PerformanceKPISeedData {
  name: string;                   // KPI name
  description?: string;           // KPI description
  category: string;               // KPI category
  currentValue: Decimal;          // Current value
  targetValue: Decimal;           // Target value
  unit: string;                   // Unit of measurement
  trend: string;                  // UP, DOWN, STABLE
  changePercent: Decimal;         // Change percentage
  status: string;                 // ON_TRACK, AT_RISK, OFF_TRACK
  period: string;                 // DAILY, WEEKLY, MONTHLY, QUARTERLY
  measuredAt: Date;               // Measurement date
}
```

**Implementation File:** `prisma/seed-data/advanced/performance-kpis.ts`

### Data Generation Utilities

#### Geographic Data Generation
```typescript
interface GeographicData {
  coordinates: {
    latitude: number;             // -32.2433 to -32.5556 (Dubbo area)
    longitude: number;            // 148.2333 to 148.9444 (Dubbo area)
  };
  address: {
    street: string;               // Australian street names
    suburb: string;               // NSW suburbs
    postcode: string;             // NSW postcodes
    state: string;                // NSW
    country: string;              // Australia
  };
}
```

#### Temporal Data Generation
```typescript
interface TemporalData {
  historical: {
    startDate: Date;              // 2 years ago
    endDate: Date;                // Current date
    distribution: 'uniform' | 'weighted'; // Distribution type
  };
  scheduling: {
    businessHours: boolean;       // Business hours only
    seasonalPatterns: boolean;    // Seasonal variations
    emergencyOverrides: boolean;  // Emergency scheduling
  };
}
```

#### Financial Data Generation
```typescript
interface FinancialData {
  assetValues: {
    min: number;                  // $1,000 AUD
    max: number;                  // $10,000,000 AUD
    distribution: 'log-normal';   // Realistic distribution
  };
  maintenanceCosts: {
    min: number;                  // $100 AUD
    max: number;                  // $50,000 AUD
    percentageOfValue: number;    // 1-5% of asset value
  };
  depreciation: {
    rates: number[];              // 1-10% annual rates
    methods: string[];            // Straight-line, declining balance
  };
}
```

### Implementation Schedule

#### Week 1: Foundation Data
- **Day 1-2:** Enhanced user personas (25 users)
- **Day 3-4:** Traditional infrastructure assets (200 assets)
- **Day 5:** Smart infrastructure assets (150 assets)

#### Week 2: Asset Portfolio Completion
- **Day 1:** Renewable energy assets (100 assets)
- **Day 2:** Specialised assets (50 assets)
- **Day 3-4:** Vendor ecosystem (15 vendors)
- **Day 5:** Asset-vendor relationships

#### Week 3: Operational Data
- **Day 1-2:** Historical work orders (2,000 records)
- **Day 3:** Inspection records (1,500 records)
- **Day 4:** Maintenance records (1,800 records)
- **Day 5:** Operational data relationships

#### Week 4: Advanced Features
- **Day 1:** Critical controls and risk signals
- **Day 2:** Energy systems (50 systems)
- **Day 3:** Performance KPIs (100 KPIs)
- **Day 4:** RCM templates and compliance
- **Day 5:** Final validation and testing

### Quality Assurance

#### Data Validation
```typescript
interface ValidationRules {
  requiredFields: string[];       // All required fields present
  dataTypes: Record<string, string>; // Correct data types
  ranges: Record<string, [number, number]>; // Value ranges
  relationships: string[];        // Foreign key integrity
  uniqueness: string[];          // Unique constraints
}
```

#### Performance Testing
```typescript
interface PerformanceTargets {
  seedingTime: number;           // < 30 minutes total
  memoryUsage: number;           // < 2GB peak usage
  databaseSize: number;          // < 1GB final size
  queryPerformance: number;      // < 100ms average queries
}
```

#### Rollback Strategy
```typescript
interface RollbackPlan {
  backupBefore: boolean;         // Full database backup
  incrementalBackups: boolean;   // Phase-based backups
  cleanReset: boolean;           // Clean slate capability
  selectiveRollback: boolean;    // Partial rollback support
}
```

### Success Criteria

#### Quantitative Metrics
- **Data Volume:** 500+ assets, 2,000+ work orders, 1,500+ inspections
- **Performance:** Seeding completes within 30 minutes
- **Reliability:** 100% successful seeding rate
- **Coverage:** All 48 database models populated

#### Qualitative Metrics
- **Realism:** Data reflects real council operations
- **Completeness:** All platform features supported
- **Consistency:** Proper data relationships maintained
- **Usability:** Supports comprehensive testing scenarios

### Risk Mitigation

#### Technical Risks
- **Database Performance:** Batch processing, connection pooling
- **Memory Usage:** Streaming operations, garbage collection
- **Data Corruption:** Validation checks, transaction rollback
- **Rollback Issues:** Incremental backups, clean reset

#### Business Risks
- **Data Sensitivity:** Synthetic data only, no real information
- **Compliance Issues:** Australian standards compliance
- **User Experience:** Realistic scenarios, proper workflows
- **Testing Coverage:** All features validated

### Conclusion

This implementation plan provides a comprehensive roadmap for creating a rich, realistic test database that fully demonstrates the Aegrid platform's capabilities while supporting all development and testing requirements.

The phased approach ensures systematic implementation while maintaining data quality and performance throughout the process.
