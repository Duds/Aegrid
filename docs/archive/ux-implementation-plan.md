# Journey-Centric UX Implementation Plan

## Technical Implementation Strategy

### 1. Component Architecture Redesign

#### Current Structure Issues

- Flat sidebar menu with individual items
- No grouping or workflow context
- Role-based visibility at item level only
- No progressive disclosure

#### Proposed Structure

```typescript
interface WorkflowGroup {
  id: string;
  label: string;
  icon: React.ComponentType;
  description: string;
  primaryPersonas: Persona[];
  journeyStage: JourneyStage;
  tabs: WorkflowTab[];
  isVisible: (userRole: Role) => boolean;
}

interface WorkflowTab {
  id: string;
  label: string;
  path: string;
  component: React.ComponentType;
  description: string;
  features: Feature[];
}
```

### 2. Navigation Component Structure

#### New Sidebar Component

```typescript
// components/navigation/JourneySidebar.tsx
export function JourneySidebar() {
  const { user } = useAuth();
  const workflowGroups = getWorkflowGroups(user.role);

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        {workflowGroups.map(group => (
          <WorkflowGroup key={group.id} group={group} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
}
```

#### Workflow Group Component

```typescript
// components/navigation/WorkflowGroup.tsx
export function WorkflowGroup({ group }: { group: WorkflowGroup }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(group.tabs[0]?.id);

  return (
    <SidebarGroup>
      <SidebarGroupLabel onClick={() => setIsExpanded(!isExpanded)}>
        <group.icon />
        {group.label}
        <ChevronDown className={isExpanded ? 'rotate-180' : ''} />
      </SidebarGroupLabel>

      {isExpanded && (
        <SidebarGroupContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              {group.tabs.map(tab => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {group.tabs.map(tab => (
              <TabsContent key={tab.id} value={tab.id}>
                <tab.component />
              </TabsContent>
            ))}
          </Tabs>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
}
```

### 3. Routing Strategy

#### Group-Based Routing

```typescript
// app/(dashboard)/layout.tsx
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <JourneySidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

// app/(dashboard)/strategic/page.tsx
export default function StrategicPage() {
  return (
    <div className="p-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardContent />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceContent />
        </TabsContent>

        <TabsContent value="trends">
          <TrendsContent />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsContent />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 4. State Management

#### Workflow State

```typescript
// hooks/useWorkflowState.ts
export function useWorkflowState() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const expandGroup = (groupId: string) => {
    setExpandedGroups(prev => new Set([...prev, groupId]));
  };

  const collapseGroup = (groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.delete(groupId);
      return next;
    });
  };

  return {
    activeGroup,
    activeTab,
    expandedGroups,
    setActiveGroup,
    setActiveTab,
    expandGroup,
    collapseGroup,
  };
}
```

### 5. Role-Based Visibility

#### Permission System

```typescript
// lib/workflow-permissions.ts
export const WORKFLOW_GROUPS = {
  STRATEGIC: {
    id: 'strategic',
    label: 'Strategic Overview',
    icon: BarChart3,
    personas: ['EXEC', 'MGR'],
    tabs: ['dashboard', 'compliance', 'trends', 'reports'],
  },
  PLANNING: {
    id: 'planning',
    label: 'Asset Planning',
    icon: Building2,
    personas: ['MGR', 'PLANNER'],
    tabs: ['register', 'templates', 'risk', 'planning', 'sustainability'],
  },
  OPERATIONS: {
    id: 'operations',
    label: 'Operations Management',
    icon: Wrench,
    personas: ['SUP', 'CREW', 'MGR'],
    tabs: ['work-orders', 'field-tool', 'map', 'team', 'controls'],
  },
  COMMUNITY: {
    id: 'community',
    label: 'Community Engagement',
    icon: Users,
    personas: ['CITIZEN', 'SUP', 'MGR'],
    tabs: ['triage', 'public', 'portal', 'notifications'],
  },
  ADMIN: {
    id: 'admin',
    label: 'System Administration',
    icon: Settings,
    personas: ['ADMIN'],
    tabs: ['users', 'data', 'logs', 'settings', 'help'],
  },
} as const;

export function getVisibleWorkflowGroups(userRole: Role): WorkflowGroup[] {
  return Object.values(WORKFLOW_GROUPS).filter(group =>
    group.personas.includes(userRole)
  );
}
```

### 6. Responsive Design Implementation

#### Mobile Navigation

```typescript
// components/navigation/MobileNavigation.tsx
export function MobileNavigation() {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  return (
    <div className="md:hidden">
      <BottomNavigation>
        {getVisibleWorkflowGroups(user.role).map(group => (
          <BottomNavigationItem
            key={group.id}
            label={group.label}
            icon={group.icon}
            isActive={activeGroup === group.id}
            onClick={() => setActiveGroup(group.id)}
          />
        ))}
      </BottomNavigation>

      {activeGroup && (
        <MobileWorkflowModal
          group={WORKFLOW_GROUPS[activeGroup]}
          onClose={() => setActiveGroup(null)}
        />
      )}
    </div>
  );
}
```

### 7. Performance Optimizations

#### Lazy Loading

```typescript
// components/navigation/LazyWorkflowTab.tsx
const LazyWorkflowTab = lazy(() => import('./WorkflowTab'));

export function WorkflowGroup({ group }: { group: WorkflowGroup }) {
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  const handleTabChange = (tabId: string) => {
    if (!loadedTabs.has(tabId)) {
      setLoadedTabs(prev => new Set([...prev, tabId]));
    }
  };

  return (
    <Tabs onValueChange={handleTabChange}>
      {group.tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id}>
          {loadedTabs.has(tab.id) ? (
            <LazyWorkflowTab tab={tab} />
          ) : (
            <TabSkeleton />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

### 8. Migration Strategy

#### Phase 1: Component Creation

1. Create new navigation components
2. Implement workflow group structure
3. Add role-based visibility
4. Create responsive design

#### Phase 2: Feature Migration

1. Move existing features to new structure
2. Update routing
3. Implement page tabs
4. Add missing features

#### Phase 3: Testing & Refinement

1. User testing
2. Performance optimization
3. Accessibility improvements
4. Documentation updates

### 9. Success Metrics

#### Technical Metrics

- **Bundle Size**: Reduction in initial bundle size through lazy loading
- **Load Time**: Faster initial page load
- **Navigation Speed**: Time to switch between workflow groups
- **Error Rate**: Reduction in navigation-related errors

#### User Experience Metrics

- **Task Completion**: % of users completing primary workflows
- **Time to Complete**: Average time for common operations
- **User Satisfaction**: Survey scores for navigation ease
- **Support Tickets**: Reduction in navigation-related requests

### 10. Implementation Timeline

#### Week 1-2: Foundation

- Create new navigation components
- Implement workflow group structure
- Add role-based visibility
- Create responsive design

#### Week 3-4: Migration

- Move existing features to new structure
- Update routing
- Implement page tabs
- Add missing features

#### Week 5-6: Enhancement

- Add advanced UX features
- Implement lazy loading
- Add performance optimizations
- Create mobile experience

#### Week 7-8: Testing

- User testing
- Performance testing
- Accessibility testing
- Bug fixes and refinements

This implementation plan provides a comprehensive roadmap for transforming the Aegrid sidebar into a journey-centric navigation system that aligns with user workflows and improves overall user experience.
