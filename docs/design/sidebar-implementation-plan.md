# Sidebar Redesign Implementation Plan

## Phase 1: Core Structure Redesign (Week 1-2)

### 1.1 New Component Architecture
```typescript
// New sidebar structure with 3 control systems
interface ControlSystem {
  id: string;
  name: string;
  icon: React.ComponentType;
  priority: 'critical' | 'important' | 'standard';
  items: ControlItem[];
  alerts?: number;
  status: 'healthy' | 'warning' | 'critical';
}

interface ControlItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType;
  riskLevel: 'critical' | 'important' | 'standard';
  badge?: string;
  roles: string[];
}
```

### 1.2 Control System Definitions
```typescript
const SAFETY_CONTROLS: ControlSystem = {
  id: 'safety',
  name: 'Safety Controls',
  icon: AlertTriangle,
  priority: 'critical',
  status: 'healthy',
  items: [
    {
      id: 'emergency',
      name: 'Emergency Dashboard',
      href: '/manager/emergency',
      icon: AlertTriangle,
      riskLevel: 'critical',
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR']
    },
    {
      id: 'critical-controls',
      name: 'Critical Controls Monitor',
      href: '/reports/critical-controls',
      icon: Shield,
      riskLevel: 'critical',
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR']
    },
    {
      id: 'risk-analysis',
      name: 'Risk Analysis',
      href: '/risk-analysis',
      icon: AlertCircle,
      riskLevel: 'important',
      roles: ['ADMIN', 'MANAGER', 'EXEC']
    }
  ]
};

const SERVICE_CONTROLS: ControlSystem = {
  id: 'service',
  name: 'Service Controls',
  icon: Zap,
  priority: 'important',
  status: 'healthy',
  items: [
    {
      id: 'asset-performance',
      name: 'Asset Performance',
      href: '/reports/asset-condition',
      icon: TrendingUp,
      riskLevel: 'important',
      roles: ['ADMIN', 'MANAGER', 'EXEC']
    },
    {
      id: 'work-orders',
      name: 'Work Orders',
      href: '/manager/work-orders',
      icon: ClipboardList,
      riskLevel: 'important',
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR']
    },
    {
      id: 'maintenance-scheduling',
      name: 'Maintenance Scheduling',
      href: '/planning/maintenance-scheduling',
      icon: Clock,
      riskLevel: 'standard',
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR']
    }
  ]
};

const PORTFOLIO_CONTROLS: ControlSystem = {
  id: 'portfolio',
  name: 'Portfolio Controls',
  icon: Building2,
  priority: 'standard',
  status: 'healthy',
  items: [
    {
      id: 'asset-register',
      name: 'Asset Register',
      href: '/assets',
      icon: Building2,
      riskLevel: 'standard',
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CREW']
    },
    {
      id: 'resource-operations',
      name: 'Resource Operations',
      href: '/planning/resource-operations',
      icon: Users,
      riskLevel: 'important',
      roles: ['ADMIN', 'MANAGER', 'EXEC']
    },
    {
      id: 'compliance-status',
      name: 'Compliance Status',
      href: '/reports/risk-compliance',
      icon: CheckCircle,
      riskLevel: 'standard',
      roles: ['ADMIN', 'MANAGER', 'EXEC']
    }
  ]
};
```

## Phase 2: Dynamic Features (Week 3-4)

### 2.1 Real-time Status Integration
```typescript
// API endpoint for control system status
interface ControlSystemStatus {
  systemId: string;
  status: 'healthy' | 'warning' | 'critical';
  alerts: number;
  lastUpdated: string;
  marginStatus: {
    capacity: number; // percentage
    margin: number;   // percentage
    emergency: boolean;
  };
}

// Hook for real-time status
const useControlSystemStatus = () => {
  const [status, setStatus] = useState<ControlSystemStatus[]>([]);

  useEffect(() => {
    const fetchStatus = async () => {
      const response = await fetch('/api/control-systems/status');
      const data = await response.json();
      setStatus(data.status);
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  return status;
};
```

### 2.2 Risk-Based Visual Hierarchy
```typescript
// Risk level styling
const getRiskLevelStyles = (riskLevel: string) => {
  switch (riskLevel) {
    case 'critical':
      return {
        backgroundColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-900',
        iconColor: 'text-red-600',
        badgeVariant: 'destructive' as const
      };
    case 'important':
      return {
        backgroundColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-900',
        iconColor: 'text-orange-600',
        badgeVariant: 'secondary' as const
      };
    case 'standard':
      return {
        backgroundColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-900',
        iconColor: 'text-green-600',
        badgeVariant: 'outline' as const
      };
  }
};
```

## Phase 3: Enhanced UX Features (Week 5-6)

### 3.1 Progressive Disclosure
```typescript
// Collapsible control systems with smart defaults
const ControlSystemGroup = ({ system, isExpanded, onToggle }: {
  system: ControlSystem;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const styles = getRiskLevelStyles(system.priority);

  return (
    <SidebarGroup>
      <SidebarGroupLabel
        className={`flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1 ${styles.backgroundColor}`}
        onClick={onToggle}
      >
        <system.icon className={`h-4 w-4 ${styles.iconColor}`} />
        <span className={styles.textColor}>{system.name}</span>

        {/* Status indicator */}
        <div className={`ml-auto flex items-center gap-1`}>
          {system.alerts > 0 && (
            <Badge variant={styles.badgeVariant} className="text-xs">
              {system.alerts}
            </Badge>
          )}
          <div className={`w-2 h-2 rounded-full ${
            system.status === 'critical' ? 'bg-red-500' :
            system.status === 'warning' ? 'bg-orange-500' : 'bg-green-500'
          }`} />
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </SidebarGroupLabel>

      {isExpanded && (
        <SidebarGroupContent>
          <SidebarMenu>
            {system.items.map(item => (
              <ControlSystemItem key={item.id} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  );
};
```

### 3.2 Contextual Awareness
```typescript
// Smart defaults based on user role and current context
const getDefaultExpandedSystems = (userRole: string, currentPath: string) => {
  const defaults = {
    ADMIN: ['safety', 'service', 'portfolio'],
    MANAGER: ['safety', 'service'],
    SUPERVISOR: ['safety'],
    EXEC: ['safety', 'portfolio']
  };

  // Expand relevant system based on current page
  const pathToSystem = {
    '/manager/emergency': 'safety',
    '/reports/critical-controls': 'safety',
    '/risk-analysis': 'safety',
    '/manager/work-orders': 'service',
    '/planning/maintenance-scheduling': 'service',
    '/assets': 'portfolio',
    '/planning/resource-operations': 'portfolio'
  };

  const currentSystem = pathToSystem[currentPath];
  if (currentSystem) {
    return [currentSystem];
  }

  return defaults[userRole] || ['safety'];
};
```

## Phase 4: Performance & Accessibility (Week 7-8)

### 4.1 Performance Optimizations
- Lazy loading of control system status
- Memoized components to prevent unnecessary re-renders
- Efficient state management with React Query
- Optimized API calls with proper caching

### 4.2 Accessibility Improvements
- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader announcements for status changes
- High contrast mode support
- Focus management for collapsible sections

## Migration Strategy

### Step 1: Parallel Implementation
- Create new sidebar component alongside existing one
- Feature flag to switch between old and new
- A/B testing with different user groups

### Step 2: Gradual Rollout
- Start with ADMIN users (most forgiving)
- Move to MANAGER users
- Finally SUPERVISOR and other roles

### Step 3: Cleanup
- Remove old sidebar code
- Update documentation
- Train users on new navigation patterns

## Success Metrics

### Usability Metrics
- **Task Completion Time**: Reduce by 40%
- **Click-to-Action**: Reduce by 60%
- **User Satisfaction**: Increase to 90%+

### Business Metrics
- **Critical Control Response Time**: <2 minutes
- **Risk Detection Accuracy**: 95%+
- **Resource Utilization**: 20% improvement

### Technical Metrics
- **Page Load Time**: <1 second
- **API Response Time**: <200ms
- **Error Rate**: <0.1%
