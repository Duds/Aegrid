# Database Technology Choice: Neo4j/Cosmos DB vs GraphQL

## The Confusion: GraphQL is NOT a Database

First, let me clarify a common misconception: **GraphQL is not a database technology**. GraphQL is a query language and runtime for APIs, while Neo4j and Azure Cosmos DB are actual database systems.

### What Each Technology Actually Is:

#### GraphQL

- **Type**: API query language and runtime
- **Purpose**: Defines how clients can request data from APIs
- **Database**: Works with any database (PostgreSQL, MongoDB, Neo4j, etc.)
- **Use Case**: API layer between frontend and backend

#### Neo4j

- **Type**: Native graph database
- **Purpose**: Stores and queries graph data structures
- **Strengths**: Graph algorithms, complex relationship queries, ACID transactions
- **Use Case**: When you need true graph database capabilities

#### Azure Cosmos DB (Gremlin API)

- **Type**: Multi-model database with graph capabilities
- **Purpose**: Globally distributed database with graph support
- **Strengths**: Global distribution, multi-model support, managed service
- **Use Case**: When you need global scale with graph capabilities

## Why We Chose Neo4j/Cosmos DB Over Other Options

### 1. **Function-Based Asset Modeling Requirements**

Our asset management system needs to model assets around their service purpose, not just their location:

```cypher
// Function-based asset relationships (Aegrid Rule 1)
(asset:Asset)-[:PERFORMS_FUNCTION]->(function:ServiceFunction)
(function:ServiceFunction)-[:DELIVERS_VALUE]->(value:BusinessValue)
(asset:Asset)-[:TAGGED_WITH]->(tag:FunctionTag {type: "service_purpose"})

// Avoid generic categories that obscure purpose
// BAD: (asset:Asset)-[:CATEGORISED_AS]->(category:Category {name: "Other"})
// GOOD: (asset:Asset)-[:PERFORMS_FUNCTION]->(function:ServiceFunction {name: "Mowing"})
```

**Why Neo4j/Cosmos DB**:

- Native support for function-based relationships
- Efficient traversal of service purpose hierarchies
- Easy to avoid "miscellaneous" buckets through proper modeling

**Why NOT Relational Database**:

- Difficult to model function-based hierarchies
- Tends to create generic category tables
- Complex queries to understand service purpose

### 2. **Criticality-Driven Grouping Requirements**

Aegrid needs to support risk-based maintenance grouping (Aegrid Rule 2):

```cypher
// Risk-based asset grouping for RCM-lite approaches
(asset:Asset)-[:HAS_RISK]->(risk:RiskAssessment)
(risk:RiskAssessment)-[:DETERMINES]->(strategy:MaintenanceStrategy)
(asset:Asset)-[:TAGGED_WITH]->(tag:RiskTag {type: "criticality", value: "High"})
(asset:Asset)-[:TAGGED_WITH]->(tag:ConditionTag {type: "condition", value: "Poor"})

// RCM-lite grouping examples
// Quarterly inspection group
MATCH (asset:Asset)-[:TAGGED_WITH]->(tag:RiskTag {value: "Medium"})
WHERE asset.maintenanceStrategy = "Inspect Quarterly"
RETURN asset

// Run-to-fail group
MATCH (asset:Asset)-[:TAGGED_WITH]->(tag:RiskTag {value: "Low"})
WHERE asset.maintenanceStrategy = "Run to Fail"
RETURN asset
```

**Why Neo4j/Cosmos DB**:

- Efficient grouping by condition, risk, and performance
- Easy filtering for RCM-lite strategies
- Dynamic maintenance strategy assignment

**Why NOT Relational Database**:

- Complex queries for risk-based grouping
- Difficult to implement RCM-lite filtering
- Performance issues with dynamic grouping

### 3. **Critical Asset Visibility Requirements**

The Aegrid Rules require critical asset elevation and visibility (Aegrid Rule 3):

```cypher
// Critical asset visibility and elevation
(asset:Asset)-[:HAS_CONSEQUENCE]->(consequence:FailureConsequence)
(consequence:FailureConsequence)-[:IMPACTS]->(impact:ImpactArea {type: "Safety"})
(asset:Asset)-[:TAGGED_WITH]->(tag:CriticalityTag {type: "crown_jewel", value: "Critical"})

// Surface critical assets in all views
// Finance view
MATCH (asset:Asset)-[:TAGGED_WITH]->(tag:CriticalityTag {value: "Critical"})
RETURN asset.name, asset.value, asset.criticalityReason

// Location view
MATCH (asset:Asset)-[:TAGGED_WITH]->(tag:CriticalityTag {value: "Critical"})
MATCH (asset)-[:LOCATED_AT]->(location:Location)
RETURN asset.name, location.name, asset.criticalityReason

// Engineering view
MATCH (asset:Asset)-[:TAGGED_WITH]->(tag:CriticalityTag {value: "Critical"})
MATCH (asset)-[:HAS_CONSEQUENCE]->(consequence:FailureConsequence)
RETURN asset.name, consequence.description, consequence.impactLevel
```

**Why Neo4j/Cosmos DB**:

- Easy to flag and elevate critical assets in any view
- Efficient queries across multiple view types
- Built-in algorithms for critical asset identification

**Why NOT Relational Database**:

- Complex queries to surface critical assets across views
- Difficult to maintain critical asset visibility
- Performance issues with cross-view queries

### 4. **Future-Proof, Flexible Modeling Requirements**

The Aegrid Rules require flexible, adaptable hierarchies (Aegrid Rule 4):

```cypher
// Flexible, future-proof asset modeling
(asset:Asset)-[:TAGGED_WITH]->(tag:ViewTag {type: "ops_view", value: "Operations"})
(asset:Asset)-[:TAGGED_WITH]->(tag:ViewTag {type: "finance_view", value: "Finance"})
(asset:Asset)-[:TAGGED_WITH]->(tag:ViewTag {type: "compliance_view", value: "Compliance"})
(asset:Asset)-[:TAGGED_WITH]->(tag:ViewTag {type: "digital_twin_view", value: "Digital Twin"})

// Multiple overlapping hierarchies
(asset:Asset)-[:BELONGS_TO]->(orgUnit:OrganisationalUnit)
(asset:Asset)-[:LOCATED_IN]->(depot:Depot)
(asset:Asset)-[:FUNDED_BY]->(fundingModel:FundingModel)

// Future scenario modeling
(asset:Asset)-[:PLANNED_FOR]->(scenario:FutureScenario)
(scenario:FutureScenario)-[:CONSIDERS]->(factor:SustainabilityFactor)
(scenario:FutureScenario)-[:CONSIDERS]->(factor:ResilienceFactor)

// Avoid hardcoded structures
// BAD: (asset:Asset)-[:BELONGS_TO_DEPARTMENT]->(dept:Department {name: "Current Dept"})
// GOOD: (asset:Asset)-[:TAGGED_WITH]->(tag:OrgTag {type: "department", value: "Current Dept", validFrom: "2025-01-01", validTo: "2025-12-31"})
```

**Why Neo4j/Cosmos DB**:

- Graph-based hierarchies that can adapt to organisational changes
- Multiple views without restructuring
- Time-based validity for organisational changes
- Assets outlive reporting lines

**Why NOT Relational Database**:

- Difficult to adapt hierarchies to organisational changes
- Complex restructuring when organisations change
- Hardcoded structures that become obsolete

## Specific Technology Choice: Neo4j vs Cosmos DB

### Neo4j (Recommended for Advanced Features)

**Pros**:

- Mature graph database with 15+ years of development
- Rich query language (Cypher) that's intuitive
- Extensive graph algorithms library
- Strong community and documentation
- Excellent performance for complex graph queries
- ACID transactions
- Built-in visualization tools

**Cons**:

- Additional infrastructure complexity
- Licensing costs for enterprise features
- Learning curve for development team
- Requires separate deployment and management

**Best For**: When you need advanced graph capabilities, complex algorithms, and maximum performance.

### Azure Cosmos DB Gremlin API (Recommended for Simplicity)

**Pros**:

- Fully managed service (no infrastructure management)
- Integrated with existing Azure infrastructure
- Global distribution capabilities
- Pay-per-use pricing model
- Multi-model support (can add other data types later)
- Automatic scaling

**Cons**:

- Less mature than Neo4j
- Limited graph algorithms compared to Neo4j
- Gremlin query language is more complex than Cypher
- Less community support

**Best For**: When you want simplicity, managed service, and integration with existing Azure infrastructure.

## Our Recommendation: Start with Cosmos DB, Evolve to Neo4j

### Phase 1: Azure Cosmos DB Gremlin API

- **Rationale**: Simpler implementation, managed service, Azure integration
- **Timeline**: PI2 Phase 1-2 (Weeks 1-8)
- **Features**: Basic graph relationships, simple queries, hierarchy support

### Phase 2: Evaluate Neo4j Migration

- **Rationale**: If advanced features are needed
- **Timeline**: PI2 Phase 3-4 (Weeks 9-16)
- **Features**: Advanced algorithms, complex analytics, performance optimization

### Migration Strategy

```typescript
// Abstract graph operations to enable easy migration
interface GraphService {
  createNode(label: string, properties: object): Promise<string>;
  createRelationship(fromId: string, toId: string, type: string): Promise<void>;
  query(cypher: string): Promise<any[]>;
  findShortestPath(fromId: string, toId: string): Promise<string[]>;
}

// Implementation can switch between Cosmos DB and Neo4j
class CosmosGraphService implements GraphService {
  /* ... */
}
class Neo4jGraphService implements GraphService {
  /* ... */
}
```

## How This Supports the Aegrid Rules

### Rule 1: Every Asset Has a Purpose

```cypher
// Graph model makes it easy to link assets to their service purpose
(asset:Asset)-[:DELIVERS_SERVICE]->(service:Service)
(service:Service)-[:SUPPORTS_BUSINESS_GOAL]->(goal:BusinessGoal)
```

### Rule 2: Risk Sets the Rhythm

```cypher
// Graph model enables complex risk-maintenance relationships
(asset:Asset)-[:HAS_RISK]->(risk:Risk)
(asset:Asset)-[:REQUIRES_MAINTENANCE]->(maintenance:MaintenanceTask)
(risk:Risk)-[:INFLUENCES]->(maintenance:MaintenanceTask)
```

### Rule 3: Respond to the Real World

```cypher
// Graph model makes critical asset identification and monitoring efficient
(asset:Asset {criticality: 'Critical'})-[:AFFECTS]->(consequence:Consequence)
(consequence:Consequence)-[:IMPACTS]->(stakeholder:Stakeholder)
```

### Rule 4: Operate with Margin

```cypher
// Graph model supports long-term planning and scenario modeling
(asset:Asset)-[:PLANNED_FOR]->(future:FutureScenario)
(future:FutureScenario)-[:CONSIDERS]->(factor:SustainabilityFactor)
```

## Conclusion

We chose Neo4j/Cosmos DB over other database technologies because:

1. **GraphQL is not a database** - it's an API layer that can work with any database
2. **True graph requirements** - Our asset model needs complex relationships
3. **Multiple hierarchies** - Assets exist in multiple overlapping hierarchies
4. **Advanced analytics** - Graph algorithms support the Aegrid Rules
5. **Real-time updates** - Relationships change frequently and need efficient updates

The choice between Neo4j and Cosmos DB depends on your priorities:

- **Cosmos DB**: Simpler implementation, managed service, Azure integration
- **Neo4j**: Advanced features, better performance, richer ecosystem

Our recommendation is to start with Cosmos DB for simplicity and migrate to Neo4j if advanced features are needed. This approach minimizes risk while providing a path to advanced capabilities.
