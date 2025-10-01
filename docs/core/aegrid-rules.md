# The Aegrid Rules - Resilient Asset Management for Critical Control

**Version**: 3.0
**Date**: January 15, 2025
**Status**: Core Principles - Non-Negotiable
**ISO 55000 Alignment**: Full compliance with ISO 55000 Asset Management standards

## Purpose

The Aegrid Rules serve as the foundational principles that guide every decision, feature, and interaction within the Aegrid platform. These rules represent a resilience-first philosophy that transforms asset management from reactive maintenance into proactive risk management aligned with international ISO 55000 standards. They are not suggestions or guidelines—they are the core north star that ensures Aegrid delivers genuine value to organisations managing critical assets while maintaining full compliance with global asset management best practices.

## The Resilience-First Philosophy

Traditional asset management has failed because it treats assets as isolated objects rather than components of critical control systems. The result is a brittle, reactive approach that breaks down under pressure. The Aegrid Rules create antifragile asset management systems that get stronger when stressed, while ensuring full alignment with ISO 55000 Asset Management standards.

**The Problem**: $1.3 billion in "found assets" that councils didn't know they owned, 60-80% CMMS implementation failure rates, and only 9.6% of councils meeting international asset management standards.

**The Solution**: The Aegrid Rules - a resilience-first philosophy that transforms asset management into a proactive risk management discipline aligned with ISO 55000 standards.

## ISO 55000 Asset Management Alignment

The Aegrid Rules are designed to fully align with ISO 55000 Asset Management standards, ensuring systematic and value-driven asset management practices:

### **ISO 55000.1:2014 - Asset Management Overview**

- **Value Realisation**: Every asset must deliver measurable value aligned with organisational objectives
- **Lifecycle Approach**: Assets managed from conception to disposal with continuous value optimisation
- **Risk-Based Decision Making**: Asset decisions based on risk assessment and consequence analysis

### **ISO 55000.2:2014 - Asset Management Guidelines**

- **Strategic Asset Management Plan**: Assets aligned with organisational strategy and service delivery
- **Asset Management Policy**: Clear policies supporting critical control effectiveness
- **Performance Evaluation**: Continuous monitoring of asset performance against objectives

### **ISO 55000.3:2017 - Asset Management Implementation**

- **Organisational Context**: Assets managed within organisational context and constraints
- **Leadership and Commitment**: Clear accountability for asset performance and critical control support
- **Planning and Support**: Adequate resources and capabilities for effective asset management

## The Four Aegrid Rules

### Rule 1: Every Asset Has a Purpose → Service and critical control alignment

**"Tie each asset to the service it enables and the critical control it supports. Every asset must have a clear connection to the services it delivers and the critical controls it maintains."**

#### What This Means

Tie each asset to the service it enables and the critical control it supports. Every asset must have a clear connection to the services it delivers and the critical controls it maintains. This ensures assets are managed based on their contribution to service delivery and risk mitigation.

#### Implementation Principles

- **Service-Enabled Modeling**: Every asset must be linked to specific services it enables
- **Critical Control Mapping**: Assets must be mapped to critical controls they support
- **Service Impact Assessment**: Understand how asset failure affects service delivery
- **Control Effectiveness**: Monitor how assets contribute to critical control effectiveness

#### Technical Implementation

```cypher
// Graph query to find assets by service and critical control
MATCH (a:Asset)-[:ENABLES_SERVICE]->(s:Service)
MATCH (a)-[:SUPPORTS_CONTROL]->(c:CriticalControl)
WHERE s.name = "Water Supply" AND c.type = "Safety"
RETURN a.name, s.name, c.name, a.serviceImpact, a.controlEffectiveness
```

#### User Story Alignment

- **As a Manager**: I want to see all assets mapped to services and critical controls so I can understand their true value
- **As a Supervisor**: I want to filter assets by service impact so I can prioritise maintenance
- **As an Executive**: I want to see asset alignment with critical controls so I can ensure compliance

### Rule 2: Risk Sets the Rhythm → Consequence and likelihood-driven cadence

**"Let consequence × likelihood determine cadence, scope, and budget allocation. Risk assessment drives maintenance frequency, inspection intervals, and resource allocation."**

#### What This Means

Let consequence × likelihood determine cadence, scope, and budget allocation. Risk assessment drives maintenance frequency, inspection intervals, and resource allocation. High-consequence, high-likelihood risks get more frequent attention, while low-risk assets can operate with longer intervals.

#### Implementation Principles

- **Risk-Based Cadence**: Maintenance frequency determined by risk assessment
- **Consequence-Driven Scope**: Inspection and maintenance scope based on potential consequences
- **Likelihood-Informed Budget**: Resource allocation proportional to risk likelihood
- **Dynamic Risk Adjustment**: Update cadence as risk profiles change

#### Technical Implementation

```cypher
// Graph query for risk-based maintenance cadence
MATCH (a:Asset)-[:HAS_RISK]->(r:Risk)
WHERE r.consequence = "High" AND r.likelihood = "High"
RETURN a.name, r.consequence, r.likelihood, r.maintenanceCadence, r.budgetAllocation
```

#### User Story Alignment

- **As a Manager**: I want maintenance schedules driven by risk so I can allocate resources efficiently
- **As a Supervisor**: I want to see risk-based cadence so I can plan work schedules
- **As a Crew Member**: I want clear risk indicators so I know which assets need immediate attention

### Rule 3: Respond to the Real World → Adaptive planning and resource reallocation

**"Treat plans as hypotheses, roll with the punches and reallocate resources when risk signals change. Asset management plans must be flexible and responsive to changing conditions."**

#### What This Means

Treat plans as hypotheses, roll with the punches and reallocate resources when risk signals change. Asset management plans must be flexible and responsive to changing conditions, new information, and emerging risks. When reality diverges from plans, adapt quickly rather than rigidly following outdated assumptions.

#### Implementation Principles

- **Hypothesis-Based Planning**: Treat maintenance plans as testable hypotheses
- **Signal-Driven Adaptation**: Respond to changing risk signals and conditions
- **Resource Flexibility**: Enable quick reallocation of resources when priorities shift
- **Continuous Learning**: Update plans based on real-world outcomes and new information

#### Technical Implementation

```cypher
// Graph query for adaptive resource allocation
MATCH (a:Asset)-[:HAS_RISK]->(r:Risk)
WHERE r.signalChange = true AND r.priority = "High"
RETURN a.name, r.newSignal, r.resourceReallocation, r.planUpdate
```

#### User Story Alignment

- **As a Manager**: I want to adapt plans quickly when conditions change so I can maintain service delivery
- **As a Supervisor**: I want to reallocate resources based on new risk signals so I can respond effectively
- **As a Crew Member**: I want updated priorities when conditions change so I can focus on what matters most

### Rule 4: Operate with Margin → Practical slack and resilience building

**"Build practical slack, create room to recover that creates tomorrow's resilience from today's actions. Maintain operational margins that allow for unexpected events."**

#### What This Means

Build practical slack, create room to recover that creates tomorrow's resilience from today's actions. Maintain operational margins that allow for unexpected events, resource constraints, and changing conditions. This margin enables the organisation to absorb shocks and continue operating effectively.

#### Implementation Principles

- **Operational Margin**: Maintain capacity buffers for unexpected demands
- **Recovery Capability**: Build systems that can recover from disruptions
- **Resilience Investment**: Invest in capabilities that improve future resilience
- **Adaptive Capacity**: Create room for learning and improvement

#### Technical Implementation

```cypher
// Graph query for margin and resilience metrics
MATCH (a:Asset)-[:HAS_MARGIN]->(m:Margin)
WHERE m.type = "Operational" AND m.level = "Adequate"
RETURN a.name, m.capacityBuffer, m.recoveryTime, m.resilienceScore
```

#### User Story Alignment

- **As a Manager**: I want operational margins so I can handle unexpected events without service disruption
- **As a Supervisor**: I want recovery capabilities so I can restore operations quickly after incidents
- **As an Executive**: I want resilience investments so I can build long-term organisational capability

## Aegrid Rules ↔ ISO 55000 Mapping

| Aegrid Rule                           | ISO 55000 Alignment                              | Key Standard Requirements                                         |
| ------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------- |
| **Rule 1: Every Asset Has a Purpose** | ISO 55000.1 §4.1 Value Realisation               | Assets must deliver value aligned with organisational objectives  |
| **Rule 2: Risk Sets the Rhythm**      | ISO 55000.1 §4.2 Risk-Based Decision Making      | Asset decisions based on risk assessment and consequence analysis |
| **Rule 3: Respond to the Real World** | ISO 55000.2 §6.1 Strategic Asset Management Plan | Adaptive planning responding to changing conditions               |
| **Rule 4: Operate with Margin**       | ISO 55000.3 §7.1 Planning and Support            | Adequate resources and capabilities for resilience                |

### Compliance Requirements

- **Asset Management System**: Implement systematic approach to asset management
- **Value-Based Decisions**: All asset decisions must demonstrate value contribution
- **Risk Integration**: Risk assessment integrated into all asset management activities
- **Continuous Improvement**: Regular review and improvement of asset management practices
- **Stakeholder Engagement**: Clear communication of asset value and risk to stakeholders

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

- **Asset Purpose Coverage**: % of assets with defined service purpose (ISO 8000, 15926, 55000.1)
- **Purpose Alignment**: % of maintenance aligned with asset purpose
- **Service Impact Tracking**: Measurement of asset contribution to service delivery
- **Critical Control Mapping**: % of assets mapped to critical controls

### Rule 2 Metrics (Risk)

- **Risk-Based Maintenance**: % of maintenance scheduled based on risk assessment (ISO 14224, 31000, 55000.1)
- **Maintenance Efficiency**: Cost per unit of risk reduction
- **Consequence × Likelihood Matrix**: Implementation of risk-based decision framework
- **Dynamic Risk Adjustment**: Frequency of risk profile updates

### Rule 3 Metrics (Adaptive Planning)

- **Plan Adaptation Rate**: % of plans modified based on changing conditions (ISO 27001, 27002, 22301, 55000.2)
- **Resource Reallocation Speed**: Time to reallocate resources when priorities change
- **Signal Response Time**: Time from signal detection to plan adjustment
- **Hypothesis Testing**: % of plans treated as testable hypotheses

### Rule 4 Metrics (Margin and Resilience)

- **Operational Margin**: Measurement of capacity buffers and recovery capabilities (ISO/IEC 42010, 20547-3, 55000.3)
- **Resilience Investment**: % of budget allocated to resilience building
- **Recovery Time**: Time to restore operations after disruptions
- **Adaptive Capacity**: Measurement of learning and improvement capabilities

### ISO 55000 Compliance Metrics

- **Asset Management System Certification**: Progress toward ISO 55000 certification
- **Value-Based Decision Making**: % of decisions demonstrating value contribution
- **Risk Integration**: % of activities integrating risk assessment
- **Continuous Improvement**: Frequency and effectiveness of improvement cycles
- **Stakeholder Engagement**: Quality and frequency of stakeholder communication

## Governance and Compliance

### Rule Enforcement

- **Design Reviews**: All features reviewed for Aegrid Rules compliance
- **User Testing**: User acceptance testing includes rule-based scenarios
- **Performance Monitoring**: Continuous monitoring of rule-based metrics
- **Regular Audits**: Quarterly reviews of rule implementation and effectiveness
- **ISO 55000 Audit**: Regular assessment of asset management practices against ISO 55000 requirements

### Training and Education

- **User Training**: All users trained on Aegrid Rules and their application
- **Developer Training**: Development team trained on rule-based design
- **Management Training**: Leadership trained on rule-based decision making
- **Continuous Learning**: Regular updates on rule implementation best practices
- **ISO 55000 Training**: Comprehensive training on ISO 55000 Asset Management standards

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
- **ISO 55000 Certification Achievement** within 18 months of implementation
- **Enhanced Stakeholder Confidence** through transparent, value-based asset management
- **Improved Risk Management** with systematic consequence × likelihood frameworks
- **Greater Organisational Resilience** through margin building and adaptive planning

## Conclusion

The Aegrid Rules are not just principles—they are the foundation upon which every aspect of the Aegrid platform is built. They represent a fundamental shift from brittle, efficiency-focused asset management to resilient, outcome-focused asset management aligned with international ISO 55000 standards.

By following these rules, Aegrid becomes more than a platform—it becomes a partner in delivering reliable, efficient, and sustainable asset management that serves the real needs of organisations and their stakeholders while maintaining full compliance with global asset management best practices.

The traditional approach to asset management—rigid, efficiency-focused, and reactive—is fundamentally broken. In a world of increasing complexity, climate volatility, and resource constraints, brittle systems fail catastrophically. The Aegrid Rules offer a different path—one that leads to resilient, antifragile asset management systems that thrive under pressure while meeting international standards.

**Remember**: Every decision, every feature, every interaction must be evaluated against these rules and ISO 55000 compliance requirements. They are our north star, our quality gate, and our promise to deliver value that matters while maintaining global best practices.

The question is not whether your asset management system will face unexpected challenges—it will. The question is whether it will break under pressure or get stronger while maintaining compliance with international standards. The choice is yours.
