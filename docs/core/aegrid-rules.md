# The Aegrid Rules - Core North Star

**Version**: 2.0
**Date**: January 15, 2025
**Status**: Core Principles - Non-Negotiable

## Purpose

The Aegrid Rules serve as the foundational principles that guide every decision, feature, and interaction within the Aegrid platform. These rules represent a resilience-first philosophy that transforms asset management from reactive maintenance into proactive risk management. They are not suggestions or guidelines—they are the core north star that ensures Aegrid delivers genuine value to organisations managing critical assets.

## The Resilience-First Philosophy

Traditional asset management has failed because it treats assets as isolated objects rather than components of critical control systems. The result is a brittle, reactive approach that breaks down under pressure. The Aegrid Rules create antifragile asset management systems that get stronger when stressed.

**The Problem**: $1.3 billion in "found assets" that councils didn't know they owned, 60-80% CMMS implementation failure rates, and only 9.6% of councils meeting international asset management standards.

**The Solution**: The Aegrid Rules - a resilience-first philosophy that transforms asset management into a proactive risk management discipline.

## The Four Aegrid Rules

### Rule 1: Every Asset Has a Purpose

**"Tie each asset to the service it enables and the critical control it supports. If it doesn't serve a control or outcome, question why it exists."**

#### What This Means

- Every asset in the system must be linked to a critical control that prevents a significant hazard or enables a vital service
- Asset management decisions are driven by control effectiveness, not just ownership
- Asset value is measured by its contribution to critical control systems and service delivery
- Assets without clear control purpose should be questioned, not just maintained

#### The Critical Control Connection

Every asset in your portfolio should connect to a critical control that prevents a significant hazard or enables a vital service. For example:

- **Stormwater pumps** → Flood prevention control → Public safety outcome
- **Water treatment filters** → Safe drinking water control → Public health outcome
- **Traffic signals** → Intersection safety control → Road safety outcome
- **Playground equipment** → Child safety control → Community wellbeing outcome

When assets are disconnected from their control purpose, maintenance becomes arbitrary. When they're connected, every maintenance decision becomes a risk management decision.

#### Implementation Principles: Function-Based Anchoring

- **Structure assets around what they do (their service purpose), not just where they sit**
- **Hierarchies or tags should reflect intended function** (e.g., mowing, transport, lifting) so value is always visible
- **Avoid "miscellaneous" or "other" buckets** that obscure purpose
- **Purpose-Driven Asset Registration**: Every asset must have a defined service function
- **Value-Based Prioritisation**: Asset importance determined by service impact
- **Service-Level Tracking**: Monitor how assets contribute to service delivery
- **Purpose Validation**: Regular review of asset purpose and alignment with business goals

#### Technical Implementation

```cypher
// Function-based asset modeling
(asset:Asset)-[:PERFORMS_FUNCTION]->(function:ServiceFunction)
(function:ServiceFunction)-[:DELIVERS_VALUE]->(value:BusinessValue)
(asset:Asset)-[:TAGGED_WITH]->(tag:FunctionTag {type: "service_purpose"})

// Avoid generic categories
// BAD: (asset:Asset)-[:CATEGORISED_AS]->(category:Category {name: "Other"})
// GOOD: (asset:Asset)-[:PERFORMS_FUNCTION]->(function:ServiceFunction {name: "Mowing"})
```

#### User Story Alignment

- **US1.1**: As an Asset Manager, I want to define the service purpose of each asset so that I can align maintenance with business objectives
- **US1.2**: As a Manager, I want to see how assets contribute to service delivery so that I can prioritise investments
- **US1.3**: As an Executive, I want to understand asset value in terms of service impact so that I can make informed decisions

### Rule 2: Risk Sets the Rhythm

**"Let consequence × likelihood determine cadence, scope, and budget allocation. Assurance and maintenance intensity scale with the importance of the critical controls an asset underpins."**

#### What This Means

- The rhythm of maintenance—how often, how thoroughly, how much budget—is determined by the consequence of control failure multiplied by the likelihood of that failure occurring
- A critical water pump that could cause a boil-water notice (high consequence) with aging components (high likelihood) requires intensive maintenance investment
- A park bench that could cause minor inconvenience (low consequence) with low failure probability requires minimal investment
- Risk is not static—it changes based on seasonal factors, usage patterns, aging profiles, and external factors

#### Dynamic Risk Assessment

Risk changes based on:

- **Seasonal Factors**: Stormwater systems become higher risk before wet season
- **Usage Patterns**: Playground equipment becomes higher risk during school holidays
- **Aging Profiles**: Assets move from low to high likelihood as they age
- **External Factors**: Extreme weather, regulatory changes, community events

The Aegrid approach continuously recalculates risk and adjusts maintenance rhythm accordingly.

#### Implementation Principles: Criticality-Driven Grouping

- **Asset hierarchy should enable risk-based maintenance** by clearly tagging/structuring criticality, failure modes, and service impact
- **Allow grouping by condition, risk, and performance**, not just asset type or location
- **This supports RCM-lite approaches** — easy to filter assets into "inspect quarterly vs run-to-fail"
- **Risk-Based Maintenance**: Maintenance frequency and methods determined by risk assessment
- **RCM-Lite Methodology**: Simplified Reliability Centred Maintenance for practical implementation
- **Cost-Risk Optimization**: Balance maintenance costs against risk reduction benefits
- **Dynamic Adjustment**: Maintenance strategies adapt as risk profiles change

#### Technical Implementation

```cypher
// Risk-based asset grouping
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

#### User Story Alignment

- **US2.1**: As a Maintenance Manager, I want to set maintenance strategies based on asset risk so that I can optimise resource allocation
- **US2.2**: As a Planner, I want to see risk-based maintenance recommendations so that I can create efficient schedules
- **US2.3**: As a Supervisor, I want to understand why maintenance is required so that I can execute with purpose

### Rule 3: Respond to the Real World

**"Plans are guides, not gospel. When conditions, signals, or context change—adapt resources and priorities quickly."**

#### What This Means

- Traditional asset management treats plans as sacred documents, creating brittleness
- The Aegrid approach treats plans as hypotheses to be tested against reality
- When signals indicate that conditions have changed, resources and priorities adapt quickly to maintain control effectiveness
- This creates antifragile systems that get stronger when stressed

#### Signals That Trigger Adaptation

**Condition Signals:**

- Asset condition deterioration faster than expected
- Performance metrics falling below thresholds
- Inspection findings revealing unexpected issues
- Sensor data indicating abnormal operating conditions

**Environmental Signals:**

- Weather patterns changing seasonal risk profiles
- Usage patterns shifting due to community changes
- Regulatory changes altering compliance requirements
- Budget constraints requiring resource reallocation

**Operational Signals:**

- Backlog spikes indicating resource shortfalls
- SLA breaches showing service degradation
- Near misses revealing emerging risks
- Staff feedback identifying operational challenges

#### Implementation Principles: Visibility of Crown Jewels

- **Hierarchy must make the critical assets stand out from the noise**
- **Ensure the system can flag and elevate "high consequence" assets** in any view (finance, location, engineering)
- **Don't bury the vital 10% of assets in a deep tree** — surface them with tags, dashboards, or dedicated groupings
- **Critical Asset Identification**: Systematic process to identify truly critical assets
- **Consequence-Based Prioritisation**: Focus on failure impact, not just asset value
- **Resource Concentration**: Allocate disproportionate resources to critical assets
- **Continuous Monitoring**: Critical assets receive enhanced monitoring and attention

#### Technical Implementation

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

#### User Story Alignment

- **US3.1**: As a Risk Manager, I want to identify critical assets based on failure consequences so that I can protect what matters most
- **US3.2**: As a Manager, I want to see critical asset status at a glance so that I can ensure they receive proper attention
- **US3.3**: As a Supervisor, I want alerts for critical asset issues so that I can respond immediately

### Rule 4: Operate with Margin

**"Build practical slack, create room to recover so today's actions create tomorrow's resilience. Margin = time, capacity, and materials that let you absorb shocks without losing control."**

#### What This Means

- Traditional asset management optimizes for efficiency, eliminating "waste" like spare capacity, redundancy, and buffer time, creating brittle systems
- The Aegrid approach deliberately builds margin into the system—practical slack that enables resilience
- Margin appears inefficient in the short term but creates antifragility in the long term
- As Nassim Taleb notes: "redundancy is ambiguous because it seems like a waste if nothing unusual happens. Except that something unusual happens—usually"

#### Types of Margin in Asset Management

**Time Margin:**

- Protected crew hours each week for emergent risk work
- Buffer time in maintenance schedules for unexpected complexity
- Advance scheduling that allows for weather delays or equipment failures

**Capacity Margin:**

- Redundancy/failover on the critical path (N+1 for controls that prevent major hazards)
- Cross-trained staff who can work across different asset types
- Surge capacity agreements with contractors for peak demand periods

**Material Margin:**

- Critical spares for high-consequence assets (min–max with review on demand signals)
- Pre-kitted jobs: parts + permits + procedures bundled for rapid deployment
- Strategic inventory positioned near critical assets

**Financial Margin:**

- Pre-approved change windows and contingency budget for rapid rebalancing
- Emergency response budget separate from routine maintenance
- Reserve funds for unexpected critical repairs

#### Implementation Principles: Flexible, Future-Proof Models

- **Use graph-based or tag-enabled hierarchies that can adapt** when organisations, depots, or funding models change
- **Avoid hardcoding today's org chart into the structure** — assets outlive reporting lines
- **Enable multiple views (ops, finance, compliance, digital twin)** without restructuring
- **Strategic Asset Planning**: Long-term view drives short-term decisions
- **Sustainability Integration**: Environmental and social considerations in asset decisions
- **Resilience Building**: Assets designed and maintained for future challenges
- **Future Service Alignment**: Asset planning anticipates changing service requirements

#### Technical Implementation

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

#### User Story Alignment

- **US4.1**: As a Strategic Planner, I want to model long-term asset scenarios so that I can make informed investment decisions
- **US4.2**: As a Manager, I want to see sustainability impact of asset decisions so that I can align with environmental goals
- **US4.3**: As an Executive, I want to understand future service needs so that I can plan asset investments accordingly

## Cross-Cutting Principles

### Data-Driven Decision Making

Every rule implementation must be supported by data, analytics, and evidence. Gut feelings and assumptions have no place in asset management decisions.

### Continuous Improvement

The Aegrid Rules are not static—they evolve as we learn and as industry best practices develop. However, the core principles remain constant.

### User-Centric Design

While the rules guide the platform, they must be implemented in ways that serve users' needs and enhance their ability to deliver value.

### Transparency and Accountability

All decisions made under the Aegrid Rules must be transparent, auditable, and accountable to stakeholders.

## Implementation Framework

### Rule Integration in Features

Every feature must demonstrate how it supports one or more Aegrid Rules:

#### Feature Design Questions

1. **Rule 1 (Purpose)**: How does this feature help users understand and manage asset purpose?
2. **Rule 2 (Risk)**: How does this feature support risk-based maintenance decisions?
3. **Rule 3 (Critical)**: How does this feature help identify and protect critical assets?
4. **Rule 4 (Future)**: How does this feature support long-term planning and sustainability?

#### Epic Alignment

- **Strategic Overview Epic**: Primarily serves Rule 4 (Operate with Margin)
- **Asset Planning Epic**: Serves Rules 1, 2, and 4 (Purpose, Risk, Future)
- **Operations Management Epic**: Serves Rules 2 and 3 (Risk, Critical)
- **Community Engagement Epic**: Serves Rule 1 (Purpose through service delivery)
- **System Administration Epic**: Enables all rules through system support

### User Journey Alignment

Each user persona's journey must reflect the Aegrid Rules:

#### Executive Journey

- **Rule 1**: Understanding asset purpose in strategic context
- **Rule 3**: Monitoring critical asset performance
- **Rule 4**: Making long-term investment decisions

#### Manager Journey

- **Rule 1**: Aligning asset management with service delivery
- **Rule 2**: Implementing risk-based maintenance strategies
- **Rule 3**: Ensuring critical assets receive proper attention
- **Rule 4**: Planning for future service needs

#### Supervisor Journey

- **Rule 2**: Executing risk-based maintenance plans
- **Rule 3**: Prioritising critical asset work
- **Rule 4**: Implementing sustainable practices

#### Crew Journey

- **Rule 1**: Understanding why maintenance is performed
- **Rule 2**: Executing maintenance according to risk priorities
- **Rule 3**: Recognising and reporting critical asset issues

## Quality Gates

### Feature Acceptance Criteria

Every feature must pass these quality gates:

1. **Purpose Alignment**: Does the feature help users understand or manage asset purpose?
2. **Risk Integration**: Does the feature support risk-based decision making?
3. **Critical Focus**: Does the feature help identify or protect critical assets?
4. **Future Orientation**: Does the feature support long-term planning?

### User Story Validation

Every user story must answer:

- Which Aegrid Rule(s) does this story support?
- How does this story help users deliver value according to the rules?
- What evidence will demonstrate the story's success?

### Epic Success Criteria

Every epic must demonstrate:

- Clear alignment with one or more Aegrid Rules
- Measurable improvement in rule-based decision making
- User satisfaction with rule-based workflows
- Business value delivery through rule implementation

## Measurement and Metrics

### Rule 1 Metrics (Purpose)

- **Asset Purpose Coverage**: % of assets with defined service purpose
- **Purpose Alignment**: % of maintenance aligned with asset purpose
- **Service Impact Tracking**: Measurement of asset contribution to service delivery

### Rule 2 Metrics (Risk)

- **Risk-Based Maintenance**: % of maintenance scheduled based on risk assessment
- **Maintenance Efficiency**: Cost per unit of risk reduction
- **RCM-Lite Adoption**: % of assets using risk-based maintenance strategies

### Rule 3 Metrics (Critical)

- **Critical Asset Identification**: % of critical assets properly identified
- **Critical Asset Performance**: Uptime and reliability of critical assets
- **Resource Allocation**: % of resources allocated to critical vs non-critical assets

### Rule 4 Metrics (Future)

- **Strategic Planning**: % of asset decisions considering long-term implications
- **Sustainability Integration**: % of decisions incorporating sustainability factors
- **Future Service Alignment**: % of asset planning aligned with future service needs

## Governance and Compliance

### Rule Enforcement

- **Design Reviews**: All features reviewed for Aegrid Rules compliance
- **User Testing**: User acceptance testing includes rule-based scenarios
- **Performance Monitoring**: Continuous monitoring of rule-based metrics
- **Regular Audits**: Quarterly reviews of rule implementation and effectiveness

### Training and Education

- **User Training**: All users trained on Aegrid Rules and their application
- **Developer Training**: Development team trained on rule-based design
- **Management Training**: Leadership trained on rule-based decision making
- **Continuous Learning**: Regular updates on rule implementation best practices

## From Reactive to Resilient: A Transformation Framework

Transforming from traditional, brittle asset management to resilient, Aegrid-based management requires a systematic approach. This transformation cannot happen overnight, but it can begin immediately with small, high-impact changes that build momentum toward full implementation.

### Phase 1: Foundation (Months 1-3)

**Establish Critical Control Mapping:**

- Identify the top 10 critical controls in your organisation
- Map assets that enable each critical control
- Assess current risk exposure for each control
- Create simple dashboards showing control health

**Build Signal Detection Capability:**

- Implement basic condition monitoring for critical assets
- Establish feedback channels from operational staff
- Create simple alert systems for threshold breaches
- Begin collecting baseline performance data

**Create Initial Margin:**

- Reserve 10% of maintenance crew time for emergent work
- Establish minimum spare parts inventory for critical assets
- Create emergency response budget (5% of annual maintenance budget)
- Cross-train key staff on critical systems

### Phase 2: Expansion (Months 4-9)

**Implement Risk-Based Rhythms:**

- Develop risk matrices for all critical controls
- Adjust maintenance frequencies based on risk levels
- Create seasonal risk profiles and adaptive schedules
- Implement predictive maintenance for high-risk assets

**Enhance Adaptive Capacity:**

- Develop rapid response protocols for common scenarios
- Create flexible resource allocation procedures
- Implement mobile technology for real-time communication
- Establish performance dashboards for decision-making

**Scale Margin Operations:**

- Expand redundancy for critical control systems
- Develop pre-kitted repair capabilities
- Create surge capacity agreements with contractors
- Build comprehensive emergency response capabilities

### Phase 3: Optimization (Months 10-18)

**Full System Integration:**

- Integrate all assets into critical control framework
- Implement advanced analytics for signal detection
- Create automated resource reallocation capabilities
- Develop comprehensive resilience metrics

**Continuous Improvement:**

- Establish regular system performance reviews
- Implement lessons learned processes
- Create innovation programs for resilience enhancement
- Develop staff expertise in resilient asset management

**Cultural Transformation:**

- Shift performance metrics from efficiency to resilience
- Train all staff in Aegrid principles
- Create incentive systems that reward adaptive behavior
- Establish resilience as core organisational value

## Results and Benefits

Organisations implementing these principles report:

- **30% reduction in reactive maintenance** through proactive risk management
- **50% improvement in regulatory compliance** through critical control focus
- **20% increase in service reliability** through resilient system design
- **15% reduction in total maintenance costs** despite increased resilience investment

## Conclusion

The Aegrid Rules are not just principles—they are the foundation upon which every aspect of the Aegrid platform is built. They represent a fundamental shift from brittle, efficiency-focused asset management to resilient, outcome-focused asset management.

By following these rules, Aegrid becomes more than a platform—it becomes a partner in delivering reliable, efficient, and sustainable asset management that serves the real needs of organisations and their stakeholders.

The traditional approach to asset management—rigid, efficiency-focused, and reactive—is fundamentally broken. In a world of increasing complexity, climate volatility, and resource constraints, brittle systems fail catastrophically. The Aegrid Rules offer a different path—one that leads to resilient, antifragile asset management systems that thrive under pressure.

**Remember**: Every decision, every feature, every interaction must be evaluated against these rules. They are our north star, our quality gate, and our promise to deliver value that matters.

The question is not whether your asset management system will face unexpected challenges—it will. The question is whether it will break under pressure or get stronger. The choice is yours.
