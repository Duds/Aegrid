/**
 * Professional Dashboard System Types
 * Refactored for asset manager workflow and Aegrid Rules alignment
 * Focuses on critical control systems and contextual awareness
 */

// Core Aegrid Rules alignment
export type ControlSystem = 'safety' | 'service' | 'portfolio';
export type ControlPriority = 'critical' | 'important' | 'standard';
export type ControlStatus = 'healthy' | 'warning' | 'critical';

// Professional card types aligned with manager needs
export type CardType =
  | 'control-summary'
  | 'alert-feed'
  | 'workflow-status'
  | 'performance-metric'
  | 'action-item';
export type CardSize = 'compact' | 'standard' | 'wide' | 'full-width';
export type Role =
  | 'ADMIN'
  | 'MANAGER'
  | 'SUPERVISOR'
  | 'CREW'
  | 'EXEC'
  | 'CITIZEN';

// Contextual categories based on Aegrid Rules
export type CardCategory =
  | 'critical-controls'
  | 'operational-flow'
  | 'performance-insights'
  | 'action-required';

// Professional dashboard card with contextual awareness
export interface DashboardCard {
  id: string;
  type: CardType;
  title: string;
  description?: string;
  size: CardSize;
  position: { x: number; y: number };
  config: CardConfig;
  permissions: Role[];
  category: CardCategory;

  // Contextual awareness
  controlSystem: ControlSystem;
  priority: ControlPriority;
  contextualTriggers?: ContextualTrigger[];

  // Real-time data
  refreshInterval?: number; // in seconds
  dataSource?: string; // API endpoint
  realTimeEnabled?: boolean;

  // Professional styling
  visualPriority?: 'high' | 'medium' | 'low';
  interactionType?: 'view-only' | 'actionable' | 'drill-down';
}

// Contextual triggers for smart dashboard behavior
export interface ContextualTrigger {
  condition: 'alert-count' | 'status-change' | 'time-based' | 'user-action';
  threshold?: number;
  action: 'highlight' | 'expand' | 'show-alert' | 'auto-refresh';
  priority: ControlPriority;
}

// Professional card configuration
export interface CardConfig {
  // Control Summary specific
  controlSystem?: ControlSystem;
  status?: ControlStatus;
  alertCount?: number;
  lastUpdated?: string;
  marginStatus?: {
    capacity: number;
    margin: number;
    emergency: boolean;
  };

  // Alert Feed specific
  alerts?: AlertItem[];
  maxAlerts?: number;
  severityFilter?: ('low' | 'medium' | 'high' | 'critical')[];

  // Workflow Status specific
  workflowStage?: string;
  completionRate?: number;
  bottlenecks?: BottleneckItem[];

  // Performance Metric specific
  value?: number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  trend?: 'up' | 'down' | 'stable';
  benchmark?: number;

  // Action Item specific
  actionType?: 'approval' | 'review' | 'assignment' | 'escalation';
  dueDate?: string;
  assignedTo?: string;
  urgency?: 'low' | 'medium' | 'high' | 'critical';

  // Common properties
  icon?: string; // Lucide icon name
  colorScheme?: 'neutral' | 'success' | 'warning' | 'critical';
  interactive?: boolean;
  drillDownUrl?: string;
}

// Alert item for alert feed cards
export interface AlertItem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  source: string;
  actionable: boolean;
  actionUrl?: string;
}

// Bottleneck item for workflow status cards
export interface BottleneckItem {
  id: string;
  name: string;
  impact: 'low' | 'medium' | 'high';
  duration: number; // in hours
  affectedAssets: number;
}

// Professional dashboard layout with contextual awareness
export interface DashboardLayout {
  id: string;
  name: string;
  description?: string;
  cards: DashboardCard[];
  isDefault?: boolean;
  role?: Role;

  // Contextual behavior
  contextualMode?:
    | 'normal'
    | 'alert-focus'
    | 'performance-review'
    | 'emergency';
  autoRefresh?: boolean;
  smartGrouping?: boolean;

  // Professional layout settings
  gridSize?: 'compact' | 'standard' | 'spacious';
  visualHierarchy?: 'flat' | 'layered' | 'focused';
}

// Enhanced dashboard preferences with professional UX
export interface DashboardPreferences {
  // Layout preferences
  layout: 'grid' | 'list' | 'compact' | 'focused';
  refreshInterval: number;
  defaultView: 'executive' | 'manager' | 'supervisor' | 'custom';

  // Contextual preferences
  contextualMode: 'auto' | 'manual';
  alertThresholds: {
    safety: number;
    service: number;
    portfolio: number;
  };

  // Visual preferences
  visualDensity: 'compact' | 'standard' | 'spacious';
  colorScheme: 'neutral' | 'high-contrast' | 'color-coded';
  showCardTitles: boolean;
  showCardDescriptions: boolean;

  // Interaction preferences
  autoRefresh: boolean;
  smartNotifications: boolean;
  drillDownEnabled: boolean;

  // Saved layouts
  savedLayouts: DashboardLayout[];
  customCards: string[];
}

// Dashboard state for real-time updates
export interface DashboardState {
  cards: DashboardCard[];
  layout: DashboardLayout;
  preferences: DashboardPreferences;
  contextualMode: 'normal' | 'alert-focus' | 'performance-review' | 'emergency';
  lastUpdated: string;
  isRefreshing: boolean;
  error?: string;
}
