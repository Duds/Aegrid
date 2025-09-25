'use client';

import ReleaseBadge from '@/components/release-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    getAvatarImage,
    getUserInitials,
    handleAvatarError,
} from '@/lib/avatar-utils';
import {
    createTransformationContext,
    transformNavigationLabel,
} from '@/lib/language-dictionary/language-transformer';
import {
    AlertCircle,
    AlertTriangle,
    Building2,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Clock,
    LogOut,
    Shield,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import type { Route } from 'next';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

interface AppSidebarProps {
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'off' | 'icon' | 'none';
}

interface ControlItem {
  id: string;
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  riskLevel: 'critical' | 'important' | 'standard';
  badge?: string;
  roles: string[];
}

interface ControlSystem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  priority: 'critical' | 'important' | 'standard';
  items: ControlItem[];
  alerts?: number;
  status: 'healthy' | 'warning' | 'critical';
}

/**
 * Redesigned App Sidebar following Aegrid Rules and Manager Journey
 * Implements 3-tier hierarchy: Safety > Service > Portfolio Controls
 * @component AppSidebar
 * @example
 * ```tsx
 * <AppSidebar variant="sidebar" collapsible="icon" />
 * ```
 * @accessibility
 * - ARIA roles: navigation, menu
 * - Keyboard navigation: Tab through control systems and items
 * - Screen reader: Announces control system status and current selection
 */
export function AppSidebar({
  variant = 'sidebar',
  collapsible = 'icon',
}: AppSidebarProps) {
  const { data: session } = useSession();

  // State for collapsible control systems
  const [expandedSystems, setExpandedSystems] = useState<Set<string>>(
    new Set(['safety']) // Default to safety controls expanded
  );

  // State for control system status
  const [controlSystemStatus, setControlSystemStatus] = useState<{
    safety: { alerts: number; status: 'healthy' | 'warning' | 'critical' };
    service: { alerts: number; status: 'healthy' | 'warning' | 'critical' };
    portfolio: { alerts: number; status: 'healthy' | 'warning' | 'critical' };
  }>({
    safety: { alerts: 0, status: 'healthy' },
    service: { alerts: 0, status: 'healthy' },
    portfolio: { alerts: 0, status: 'healthy' },
  });

  // Fetch control system status on component mount
  useEffect(() => {
    const fetchControlSystemStatus = async () => {
      try {
        const response = await fetch('/api/control-systems/status');
        if (response.ok) {
          const data = await response.json();
          setControlSystemStatus(data.status);
        }
      } catch (error) {
        console.error('Failed to fetch control system status:', error);
      }
    };

    if (session?.user?.id) {
      fetchControlSystemStatus();
      // Refresh every 30 seconds
      const interval = setInterval(fetchControlSystemStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id]);

  const toggleSystem = (systemId: string) => {
    setExpandedSystems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(systemId)) {
        newSet.delete(systemId);
      } else {
        newSet.add(systemId);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    try {
      await signOut({
        callbackUrl: '/auth/sign-in',
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check if user has access to item
  const canAccessItem = (roles: string[], userRole?: string) => {
    return roles.includes(userRole || '');
  };

  // Get risk level styles
  const getRiskLevelStyles = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical':
        return {
          backgroundColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
          iconColor: 'text-red-600',
          badgeVariant: 'destructive' as const,
        };
      case 'important':
        return {
          backgroundColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-900',
          iconColor: 'text-orange-600',
          badgeVariant: 'secondary' as const,
        };
      case 'standard':
        return {
          backgroundColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-900',
          iconColor: 'text-green-600',
          badgeVariant: 'outline' as const,
        };
      default:
        return {
          backgroundColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-900',
          iconColor: 'text-gray-600',
          badgeVariant: 'outline' as const,
        };
    }
  };

  // Get status indicator color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'healthy':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Control System Definitions following Aegrid Rules
  const SAFETY_CONTROLS: ControlSystem = {
    id: 'safety',
    name: 'Safety Controls',
    icon: AlertTriangle,
    priority: 'critical',
    status: controlSystemStatus.safety.status,
    alerts: controlSystemStatus.safety.alerts,
    items: [
      {
        id: 'emergency',
        name: transformNavigationLabel(
          'Emergency Dashboard',
          createTransformationContext('AppSidebar', 'navigation', 'safety')
        ).transformed,
        href: '/manager/emergency',
        icon: AlertTriangle,
        riskLevel: 'critical',
        roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
      },
      {
        id: 'critical-controls',
        name: transformNavigationLabel(
          'Critical Controls Monitor',
          createTransformationContext('AppSidebar', 'navigation', 'safety')
        ).transformed,
        href: '/reports/critical-controls',
        icon: Shield,
        riskLevel: 'critical',
        roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
      },
      {
        id: 'risk-analysis',
        name: transformNavigationLabel(
          'Risk Analysis',
          createTransformationContext('AppSidebar', 'navigation', 'safety')
        ).transformed,
        href: '/risk-analysis',
        icon: AlertCircle,
        riskLevel: 'important',
        roles: ['ADMIN', 'MANAGER', 'EXEC'],
      },
    ],
  };

  const SERVICE_CONTROLS: ControlSystem = {
    id: 'service',
    name: 'Service Controls',
    icon: Zap,
    priority: 'important',
    status: controlSystemStatus.service.status,
    alerts: controlSystemStatus.service.alerts,
    items: [
      {
        id: 'asset-performance',
        name: transformNavigationLabel(
          'Asset Performance',
          createTransformationContext('AppSidebar', 'navigation', 'service')
        ).transformed,
        href: '/reports/asset-condition',
        icon: TrendingUp,
        riskLevel: 'important',
        roles: ['ADMIN', 'MANAGER', 'EXEC'],
      },
      {
        id: 'work-orders',
        name: transformNavigationLabel(
          'Work Orders',
          createTransformationContext('AppSidebar', 'navigation', 'service')
        ).transformed,
        href: '/manager/work-orders',
        icon: ClipboardList,
        riskLevel: 'important',
        roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
      },
      {
        id: 'maintenance-scheduling',
        name: transformNavigationLabel(
          'Maintenance Scheduling',
          createTransformationContext('AppSidebar', 'navigation', 'service')
        ).transformed,
        href: '/planning/maintenance-scheduling',
        icon: Clock,
        riskLevel: 'standard',
        roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
      },
    ],
  };

  const PORTFOLIO_CONTROLS: ControlSystem = {
    id: 'portfolio',
    name: 'Portfolio Controls',
    icon: Building2,
    priority: 'standard',
    status: controlSystemStatus.portfolio.status,
    alerts: controlSystemStatus.portfolio.alerts,
    items: [
      {
        id: 'asset-register',
        name: transformNavigationLabel(
          'Asset Register',
          createTransformationContext('AppSidebar', 'navigation', 'portfolio')
        ).transformed,
        href: '/assets',
        icon: Building2,
        riskLevel: 'standard',
        roles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CREW'],
      },
      {
        id: 'resource-operations',
        name: transformNavigationLabel(
          'Resource Operations',
          createTransformationContext('AppSidebar', 'navigation', 'portfolio')
        ).transformed,
        href: '/planning/resource-operations',
        icon: Users,
        riskLevel: 'important',
        roles: ['ADMIN', 'MANAGER', 'EXEC'],
      },
      {
        id: 'compliance-status',
        name: transformNavigationLabel(
          'Compliance Status',
          createTransformationContext('AppSidebar', 'navigation', 'portfolio')
        ).transformed,
        href: '/reports/risk-compliance',
        icon: CheckCircle,
        riskLevel: 'standard',
        roles: ['ADMIN', 'MANAGER', 'EXEC'],
      },
    ],
  };

  const controlSystems = [SAFETY_CONTROLS, SERVICE_CONTROLS, PORTFOLIO_CONTROLS];
  const userRole = session?.user?.role;

  // Control System Group Component
  const ControlSystemGroup = ({ system }: { system: ControlSystem }) => {
    const isExpanded = expandedSystems.has(system.id);
    const styles = getRiskLevelStyles(system.priority);
    const statusColor = getStatusColor(system.status);

    return (
      <SidebarGroup>
        <SidebarGroupLabel
          className={`flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1 ${styles.backgroundColor}`}
          onClick={() => toggleSystem(system.id)}
        >
          <system.icon className={`h-4 w-4 ${styles.iconColor}`} />
          <span className={`font-medium ${styles.textColor}`}>
            {system.name}
          </span>

          {/* Status and alerts */}
          <div className="ml-auto flex items-center gap-1">
            {system.alerts && system.alerts > 0 && (
              <Badge variant={styles.badgeVariant} className="text-xs">
                {system.alerts}
              </Badge>
            )}
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
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
              {system.items
                .filter(item => canAccessItem(item.roles, userRole))
                .map(item => {
                  const itemStyles = getRiskLevelStyles(item.riskLevel);
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href as Route}
                          className="flex items-center justify-between w-full min-w-0"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <item.icon className={`h-4 w-4 shrink-0 ${itemStyles.iconColor}`} />
                            <div className="min-w-0 flex-1">
                              <div className={`truncate font-medium ${itemStyles.textColor}`}>
                                {item.label}
                              </div>
                            </div>
                          </div>
                          {item.badge && (
                            <Badge
                              variant={itemStyles.badgeVariant}
                              className="ml-2 text-xs shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
            </SidebarMenu>
          </SidebarGroupContent>
        )}
      </SidebarGroup>
    );
  };

  return (
    <Sidebar variant={variant} collapsible={collapsible} className="!border-0">
      <SidebarHeader>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold px-2"
        >
          <Image
            src="/images/logos/Aegrid.svg"
            alt="Aegrid Logo"
            width={32}
            height={32}
            className="h-8 w-8"
          />
          <span className="text-xl group-data-[collapsible=icon]:hidden">
            Aegrid
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {/* Control Systems - Following Aegrid Rules */}
        {controlSystems.map(system => (
          <React.Fragment key={system.id}>
            <ControlSystemGroup system={system} />
            <SidebarSeparator />
          </React.Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 group-data-[collapsible=icon]:hidden">
          <ReleaseBadge />
        </div>
        <div className="p-2">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-sidebar-accent">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={getAvatarImage(session?.user?.image)}
                alt={session?.user?.name || 'User'}
                onError={() => handleAvatarError(session?.user?.image)}
              />
              <AvatarFallback className="text-xs">
                {getUserInitials(session?.user?.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <div className="text-sm font-medium truncate">
                {session?.user?.name || 'User'}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {session?.user?.role || 'Unknown'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-auto p-1 rounded-md hover:bg-sidebar-accent"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
