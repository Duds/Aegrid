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
    Activity,
    AlertCircle,
    AlertTriangle,
    BarChart3,
    Bell,
    Building2,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    ClipboardList,
    Clock,
    Cog,
    Eye,
    Globe,
    LogOut,
    MapPin,
    Play,
    Settings,
    Shield,
    Target,
    TrendingUp,
    Users,
    Wrench,
    Zap,
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

interface SidebarItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles?: string[];
  badge?: string;
}

/**
 * App Sidebar Component following shadcn/ui standards
 * Provides navigation based on user roles and Aegrid Rules
 * @component AppSidebar
 * @example
 * ```tsx
 * <AppSidebar variant="sidebar" collapsible="icon" />
 * ```
 * @accessibility
 * - ARIA roles: navigation, menu
 * - Keyboard navigation: Tab through workflow groups and menu items
 * - Screen reader: Announces workflow groups and current selection
 */
export function AppSidebar({
  variant = 'sidebar',
  collapsible = 'icon',
}: AppSidebarProps) {
  const { data: session } = useSession();

  // State for collapsible groups
  const [collapsedGroups, setCollapsedGroups] = useState<
    Record<string, boolean>
  >({
    controlCenter: false,
    dailyOperations: false,
    'asset-intelligence': false,
    strategic: false,
    assetPlanning: false,
    operations: false,
    contractor: false,
    community: false,
    system: false,
  });

  // State for dynamic counts
  const [sidebarCounts, setSidebarCounts] = useState<{
    emergencyAlerts: number;
    criticalControlsOverdue: number;
    workOrdersCount: number;
    totalAssetsCount: number;
    controlCenterAlerts: number;
  } | null>(null);

  // Fetch all sidebar counts on component mount
  useEffect(() => {
    const fetchSidebarCounts = async () => {
      try {
        const response = await fetch('/api/dashboard/sidebar-counts');
        if (response.ok) {
          const data = await response.json();
          setSidebarCounts(data.sidebarCounts);
        }
      } catch (error) {
        console.error('Failed to fetch sidebar counts:', error);
      }
    };

    if (session?.user?.id) {
      fetchSidebarCounts();
    }
  }, [session?.user?.id]);

  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
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

  // Check if user has admin access
  const canAccessAdmin = (role?: string) => {
    return role === 'ADMIN';
  };

  // Check if user has executive access (EXEC and ADMIN only, not MANAGER)
  const canAccessExecutive = (role?: string) => {
    return role === 'ADMIN' || role === 'EXEC';
  };

  // Check if user has manager access
  const canAccessManager = (role?: string) => {
    return role === 'ADMIN' || role === 'MANAGER' || role === 'EXEC';
  };

  // Check if user has supervisor access
  const canAccessSupervisor = (role?: string) => {
    return role === 'ADMIN' || role === 'MANAGER' || role === 'SUPERVISOR';
  };

  // Control Center Group - Always visible, top priority for critical functions
  const controlCenterItems: SidebarItem[] = [
    {
      href: '/manager/emergency',
      icon: AlertTriangle,
      label: transformNavigationLabel(
        'Emergency Dashboard',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'control_center'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
      badge: sidebarCounts?.emergencyAlerts?.toString() || '0', // Dynamic alert count
    },
    {
      href: '/manager/energy-control',
      icon: Zap,
      label: transformNavigationLabel(
        'Energy Control',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'control_center'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
    {
      href: '/reports/critical-controls',
      icon: Shield,
      label: transformNavigationLabel(
        'Critical Controls',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'control_center'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
      badge: sidebarCounts?.criticalControlsOverdue?.toString() || '0', // Dynamic overdue count
    },
    {
      href: '/dashboard',
      icon: BarChart3,
      label: transformNavigationLabel(
        'Executive Overview',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'control_center'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'EXEC'],
    },
  ];

  // Strategic Overview Group - Executive personas only (not MANAGER)
  const strategicOverviewItems: SidebarItem[] = [
    {
      href: '/dashboard',
      icon: BarChart3,
      label: transformNavigationLabel(
        'Dashboard',
        createTransformationContext('AppSidebar', 'navigation', 'strategic')
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'EXEC', 'SUPERVISOR'],
    },
    {
      href: '/manager',
      icon: Activity,
      label: transformNavigationLabel(
        'Manager Dashboard',
        createTransformationContext('AppSidebar', 'navigation', 'strategic')
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'EXEC'],
    },
    {
      href: '/margin-management',
      icon: Clock,
      label: transformNavigationLabel(
        'Margin Management',
        createTransformationContext('AppSidebar', 'navigation', 'strategic')
      ).transformed,
      roles: ['ADMIN', 'EXEC'],
    },
    {
      href: '/demo',
      icon: Play,
      label: transformNavigationLabel(
        'Demo Showcase',
        createTransformationContext('AppSidebar', 'navigation', 'strategic')
      ).transformed,
      roles: ['ADMIN', 'EXEC'],
    },
    {
      href: '/reports/asset-condition',
      icon: TrendingUp,
      label: transformNavigationLabel(
        'Asset Performance',
        createTransformationContext('AppSidebar', 'navigation', 'strategic')
      ).transformed,
      roles: ['ADMIN', 'EXEC'],
    },
    {
      href: '/risk-analysis',
      icon: AlertTriangle,
      label: transformNavigationLabel(
        'Risk Overview',
        createTransformationContext('AppSidebar', 'navigation', 'strategic')
      ).transformed,
      roles: ['ADMIN', 'EXEC'],
    },
    {
      href: '/reports/risk-compliance',
      icon: Shield,
      label: transformNavigationLabel(
        'Compliance Status',
        createTransformationContext('AppSidebar', 'navigation', 'strategic')
      ).transformed,
      roles: ['ADMIN', 'EXEC'],
    },
  ];

  // Daily Operations Group - Manager workflow focused
  const dailyOperationsItems: SidebarItem[] = [
    {
      href: '/manager/work-orders',
      icon: ClipboardList,
      label: transformNavigationLabel(
        'Work Orders',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'daily_operations'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
      badge: sidebarCounts?.workOrdersCount?.toString() || '0', // Dynamic work order count
    },
    {
      href: '/planning/resource-operations',
      icon: Users,
      label: transformNavigationLabel(
        'Resource Operations',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'daily_operations'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
    {
      href: '/planning/maintenance-scheduling',
      icon: Clock,
      label: transformNavigationLabel(
        'Maintenance Scheduling',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'daily_operations'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
    {
      href: '/manager/performance',
      icon: TrendingUp,
      label: transformNavigationLabel(
        'Performance Monitoring',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'daily_operations'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
  ];

  // Asset Intelligence Group - Asset-centric functions
  const assetIntelligenceItems: SidebarItem[] = [
    {
      href: '/assets',
      icon: Building2,
      label: transformNavigationLabel(
        'Asset Register',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'asset_intelligence'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR', 'CREW'],
      badge: sidebarCounts?.totalAssetsCount?.toString() || '0', // Dynamic asset count
    },
    {
      href: '/assets/map',
      icon: MapPin,
      label: transformNavigationLabel(
        'Asset Map',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'asset_intelligence'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
    {
      href: '/asset-intelligence',
      icon: BarChart3,
      label: transformNavigationLabel(
        'Asset Analytics',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'asset_intelligence'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
    {
      href: '/planning/asset-register',
      icon: Activity,
      label: transformNavigationLabel(
        'Lifecycle Management',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'asset_intelligence'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
  ];

  // Asset Planning Group - Manager, Asset Planner personas
  const assetPlanningItems: SidebarItem[] = [
    {
      href: '/planning/maintenance-scheduling',
      icon: Activity,
      label: transformNavigationLabel(
        'Maintenance Scheduling',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'asset_planning'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
    {
      href: '/planning/resource-operations',
      icon: Clock,
      label: transformNavigationLabel(
        'Resource Operations',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'asset_planning'
        )
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'EXEC'],
    },
    {
      href: '/planning/asset-register',
      icon: Building2,
      label: transformNavigationLabel(
        'Asset Register',
        createTransformationContext(
          'AppSidebar',
          'navigation',
          'asset_planning'
        )
      ).transformed,
      badge: sidebarCounts?.totalAssetsCount?.toLocaleString() || '0',
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
  ];

  // Operations Management Group - Supervisor, Crew, Contractor personas
  const operationsManagementItems: SidebarItem[] = [
    {
      href: '/assets/map',
      icon: MapPin,
      label: transformNavigationLabel(
        'Asset Map',
        createTransformationContext('AppSidebar', 'navigation', 'operations')
      ).transformed,
      roles: [
        'ADMIN',
        'MANAGER',
        'SUPERVISOR',
        'CREW',
        'CONTRACTOR',
        'MAINTENANCE_PLANNER',
      ],
    },
    {
      href: '/field-tool',
      icon: Wrench,
      label: transformNavigationLabel(
        'Field Operations',
        createTransformationContext('AppSidebar', 'navigation', 'operations')
      ).transformed,
      roles: [
        'ADMIN',
        'MANAGER',
        'SUPERVISOR',
        'CREW',
        'CONTRACTOR',
        'MAINTENANCE_PLANNER',
      ],
    },
    {
      href: '/mobile/dashboard',
      icon: Activity,
      label: transformNavigationLabel(
        'Mobile Dashboard',
        createTransformationContext('AppSidebar', 'navigation', 'operations')
      ).transformed,
      roles: [
        'ADMIN',
        'MANAGER',
        'SUPERVISOR',
        'CREW',
        'CONTRACTOR',
        'MAINTENANCE_PLANNER',
      ],
    },
    {
      href: '/mobile/inspections',
      icon: CheckCircle,
      label: transformNavigationLabel(
        'Inspections',
        createTransformationContext('AppSidebar', 'navigation', 'operations')
      ).transformed,
      roles: [
        'ADMIN',
        'MANAGER',
        'SUPERVISOR',
        'CREW',
        'CONTRACTOR',
        'MAINTENANCE_PLANNER',
      ],
    },
    {
      href: '/mobile/work-orders',
      icon: ClipboardList,
      label: transformNavigationLabel(
        'Work Orders',
        createTransformationContext('AppSidebar', 'navigation', 'operations')
      ).transformed,
      roles: [
        'ADMIN',
        'MANAGER',
        'SUPERVISOR',
        'CREW',
        'CONTRACTOR',
        'MAINTENANCE_PLANNER',
      ],
    },
    {
      href: '/sessions',
      icon: Clock,
      label: transformNavigationLabel(
        'Work Sessions',
        createTransformationContext('AppSidebar', 'navigation', 'operations')
      ).transformed,
      roles: [
        'ADMIN',
        'MANAGER',
        'SUPERVISOR',
        'CREW',
        'CONTRACTOR',
        'MAINTENANCE_PLANNER',
      ],
    },
  ];

  // Contractor Portal Group - Contractor, Partner personas (simplified from "Contractor/Partner Portal")
  const contractorPortalItems: SidebarItem[] = [
    {
      href: '/contractor/dashboard',
      icon: BarChart3,
      label: transformNavigationLabel(
        'Contract Dashboard',
        createTransformationContext('AppSidebar', 'navigation', 'contractor')
      ).transformed,
      roles: ['CONTRACTOR', 'PARTNER', 'ADMIN', 'MANAGER'],
    },
    {
      href: '/contractor/work-orders',
      icon: ClipboardList,
      label: transformNavigationLabel(
        'My Work Orders',
        createTransformationContext('AppSidebar', 'navigation', 'contractor')
      ).transformed,
      roles: [
        'CONTRACTOR',
        'MAINTENANCE_PLANNER',
        'ADMIN',
        'MANAGER',
        'SUPERVISOR',
      ],
    },
    {
      href: '/contractor/performance',
      icon: TrendingUp,
      label: transformNavigationLabel(
        'Performance Metrics',
        createTransformationContext('AppSidebar', 'navigation', 'contractor')
      ).transformed,
      roles: ['CONTRACTOR', 'PARTNER', 'ADMIN', 'MANAGER'],
    },
    {
      href: '/contractor/capacity',
      icon: Clock,
      label: transformNavigationLabel(
        'Capacity Management',
        createTransformationContext('AppSidebar', 'navigation', 'contractor')
      ).transformed,
      roles: ['CONTRACTOR', 'PARTNER', 'ADMIN', 'MANAGER'],
    },
    {
      href: '/partner/data-sharing',
      icon: Globe,
      label: transformNavigationLabel(
        'Data Sharing',
        createTransformationContext('AppSidebar', 'navigation', 'contractor')
      ).transformed,
      roles: ['PARTNER', 'ADMIN', 'MANAGER'],
    },
  ];

  // Community Engagement Group - Citizen, Supervisor, Admin personas
  const communityEngagementItems: SidebarItem[] = [
    {
      href: '/citizen',
      icon: Globe,
      label: transformNavigationLabel(
        'Community Portal',
        createTransformationContext('AppSidebar', 'navigation', 'community')
      ).transformed,
      roles: ['CITIZEN', 'ADMIN'],
    },
    {
      href: '/citizen/track',
      icon: Eye,
      label: transformNavigationLabel(
        'Track Requests',
        createTransformationContext('AppSidebar', 'navigation', 'community')
      ).transformed,
      roles: ['CITIZEN', 'ADMIN'],
    },
    {
      href: '/activity',
      icon: Activity,
      label: transformNavigationLabel(
        'Activity Logs',
        createTransformationContext('AppSidebar', 'navigation', 'community')
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
    {
      href: '/admin/triage',
      icon: AlertCircle,
      label: transformNavigationLabel(
        'Report Triage',
        createTransformationContext('AppSidebar', 'navigation', 'community')
      ).transformed,
      roles: ['ADMIN', 'MANAGER', 'SUPERVISOR'],
    },
  ];

  // System Administration Group - Admin persona
  const systemAdministrationItems: SidebarItem[] = [
    {
      href: '/admin',
      icon: BarChart3,
      label: transformNavigationLabel(
        'Admin Dashboard',
        createTransformationContext('AppSidebar', 'navigation', 'system')
      ).transformed,
      roles: ['ADMIN'],
    },
    {
      href: '/admin/users',
      icon: Users,
      label: transformNavigationLabel(
        'User Management',
        createTransformationContext('AppSidebar', 'navigation', 'system')
      ).transformed,
      roles: ['ADMIN'],
    },
    {
      href: '/admin/audit-logs',
      icon: Activity,
      label: transformNavigationLabel(
        'Audit Logs',
        createTransformationContext('AppSidebar', 'navigation', 'system')
      ).transformed,
      roles: ['ADMIN'],
    },
    {
      href: '/security',
      icon: Shield,
      label: transformNavigationLabel(
        'Security Dashboard',
        createTransformationContext('AppSidebar', 'navigation', 'system')
      ).transformed,
      roles: ['ADMIN', 'MANAGER'],
    },
    {
      href: '/admin/notifications',
      icon: Bell,
      label: transformNavigationLabel(
        'Notifications',
        createTransformationContext('AppSidebar', 'navigation', 'system')
      ).transformed,
      roles: ['ADMIN'],
    },
    {
      href: '/settings',
      icon: Settings,
      label: transformNavigationLabel(
        'System Settings',
        createTransformationContext('AppSidebar', 'navigation', 'system')
      ).transformed,
      roles: ['ADMIN'],
    },
  ];

  // Filter items based on user role
  const filterItemsByRole = (items: SidebarItem[], userRole?: string) => {
    return items.filter(
      item => !item.roles || item.roles.includes(userRole || '')
    );
  };

  const userRole = session?.user?.role;

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Sidebar Debug:', {
      session: !!session,
      userRole,
      userEmail: session?.user?.email,
      canAccessAdmin: canAccessAdmin(userRole),
      canAccessExecutive: canAccessExecutive(userRole),
      canAccessManager: canAccessManager(userRole),
      canAccessSupervisor: canAccessSupervisor(userRole),
    });
  }

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
        {/* Control Center Group - Always visible for critical functions */}
        {canAccessSupervisor(userRole) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel
                className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
                onClick={() => toggleGroup('controlCenter')}
              >
                <AlertTriangle className="h-4 w-4 text-red-500" />
                {
                  transformNavigationLabel(
                    'Control Center',
                    createTransformationContext(
                      'AppSidebar',
                      'navigation',
                      'group'
                    )
                  ).transformed
                }
                <Badge variant="destructive" className="ml-auto text-xs">
                  {sidebarCounts?.controlCenterAlerts || 0}
                </Badge>
                {collapsedGroups.controlCenter ? (
                  <ChevronRight className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </SidebarGroupLabel>
              {!collapsedGroups.controlCenter && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterItemsByRole(controlCenterItems, userRole).map(
                      item => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.href as Route}
                              className="flex items-center justify-between w-full min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <item.icon className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium">
                                    {item.label}
                                  </div>
                                </div>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant="destructive"
                                  className="ml-2 text-xs shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}

        {/* Daily Operations Group - Manager workflow focused */}
        {canAccessSupervisor(userRole) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel
                className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
                onClick={() => toggleGroup('dailyOperations')}
              >
                <ClipboardList className="h-4 w-4" />
                {
                  transformNavigationLabel(
                    'Daily Operations',
                    createTransformationContext(
                      'AppSidebar',
                      'navigation',
                      'group'
                    )
                  ).transformed
                }
                {collapsedGroups.dailyOperations ? (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </SidebarGroupLabel>
              {!collapsedGroups.dailyOperations && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterItemsByRole(dailyOperationsItems, userRole).map(
                      item => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.href as Route}
                              className="flex items-center justify-between w-full min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <item.icon className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium">
                                    {item.label}
                                  </div>
                                </div>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}

        {/* Asset Intelligence Group - Asset-centric functions */}
        {canAccessManager(userRole) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel
                className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
                onClick={() => toggleGroup('asset-intelligence')}
              >
                <Building2 className="h-4 w-4" />
                {
                  transformNavigationLabel(
                    'Asset Intelligence',
                    createTransformationContext(
                      'AppSidebar',
                      'navigation',
                      'group'
                    )
                  ).transformed
                }
                {collapsedGroups['asset-intelligence'] ? (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </SidebarGroupLabel>
              {!collapsedGroups['asset-intelligence'] && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterItemsByRole(assetIntelligenceItems, userRole).map(
                      item => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.href as Route}
                              className="flex items-center justify-between w-full min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <item.icon className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium">
                                    {item.label}
                                  </div>
                                </div>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}

        {/* Strategic Overview Group */}
        {canAccessExecutive(userRole) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel
                className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
                onClick={() => toggleGroup('strategic')}
              >
                <Target className="h-4 w-4" />
                {
                  transformNavigationLabel(
                    'Strategic Overview',
                    createTransformationContext(
                      'AppSidebar',
                      'navigation',
                      'group'
                    )
                  ).transformed
                }
                {collapsedGroups.strategic ? (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </SidebarGroupLabel>
              {!collapsedGroups.strategic && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterItemsByRole(strategicOverviewItems, userRole).map(
                      item => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.href as Route}
                              className="flex items-center justify-between w-full min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <item.icon className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium">
                                    {item.label}
                                  </div>
                                </div>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}

        {/* Asset Planning Group */}
        {canAccessSupervisor(userRole) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel
                className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
                onClick={() => toggleGroup('assetPlanning')}
              >
                <Shield className="h-4 w-4" />
                {
                  transformNavigationLabel(
                    'Asset Planning',
                    createTransformationContext(
                      'AppSidebar',
                      'navigation',
                      'group'
                    )
                  ).transformed
                }
                {collapsedGroups.assetPlanning ? (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </SidebarGroupLabel>
              {!collapsedGroups.assetPlanning && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterItemsByRole(assetPlanningItems, userRole).map(
                      item => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.href as Route}
                              className="flex items-center justify-between w-full min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <item.icon className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium">
                                    {item.label}
                                  </div>
                                </div>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}

        {/* Operations Management Group */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
            onClick={() => toggleGroup('operations')}
          >
            <Zap className="h-4 w-4" />
            {
              transformNavigationLabel(
                'Operations Management',
                createTransformationContext('AppSidebar', 'navigation', 'group')
              ).transformed
            }
            {collapsedGroups.operations ? (
              <ChevronRight className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-auto" />
            )}
          </SidebarGroupLabel>
          {!collapsedGroups.operations && (
            <SidebarGroupContent>
              <SidebarMenu>
                {filterItemsByRole(operationsManagementItems, userRole).map(
                  item => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href as Route}
                          className="flex items-center justify-between w-full min-w-0"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <item.icon className="h-4 w-4 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">
                                {item.label}
                              </div>
                            </div>
                          </div>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-2 text-xs shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
        <SidebarSeparator />

        {/* Contractor/Partner Portal Group */}
        {(userRole === 'CONTRACTOR' ||
          userRole === 'PARTNER' ||
          userRole === 'MAINTENANCE_PLANNER' ||
          canAccessManager(userRole)) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel
                className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
                onClick={() => toggleGroup('contractor')}
              >
                <Building2 className="h-4 w-4" />
                {
                  transformNavigationLabel(
                    'Contractor/Partner Portal',
                    createTransformationContext(
                      'AppSidebar',
                      'navigation',
                      'group'
                    )
                  ).transformed
                }
                {collapsedGroups.contractor ? (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </SidebarGroupLabel>
              {!collapsedGroups.contractor && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterItemsByRole(contractorPortalItems, userRole).map(
                      item => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.href as Route}
                              className="flex items-center justify-between w-full min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <item.icon className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium">
                                    {item.label}
                                  </div>
                                </div>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}

        {/* Community Engagement Group */}
        <SidebarGroup>
          <SidebarGroupLabel
            className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
            onClick={() => toggleGroup('community')}
          >
            <Globe className="h-4 w-4" />
            {
              transformNavigationLabel(
                'Community Engagement',
                createTransformationContext('AppSidebar', 'navigation', 'group')
              ).transformed
            }
            {collapsedGroups.community ? (
              <ChevronRight className="h-4 w-4 ml-auto" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-auto" />
            )}
          </SidebarGroupLabel>
          {!collapsedGroups.community && (
            <SidebarGroupContent>
              <SidebarMenu>
                {filterItemsByRole(communityEngagementItems, userRole).map(
                  item => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.href as Route}
                          className="flex items-center justify-between w-full min-w-0"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <item.icon className="h-4 w-4 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium">
                                {item.label}
                              </div>
                            </div>
                          </div>
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className="ml-2 text-xs shrink-0"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          )}
        </SidebarGroup>
        <SidebarSeparator />

        {/* System Administration Group */}
        {canAccessAdmin(userRole) && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel
                className="flex items-center gap-2 cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1"
                onClick={() => toggleGroup('system')}
              >
                <Cog className="h-4 w-4" />
                {
                  transformNavigationLabel(
                    'System Administration',
                    createTransformationContext(
                      'AppSidebar',
                      'navigation',
                      'group'
                    )
                  ).transformed
                }
                {collapsedGroups.system ? (
                  <ChevronRight className="h-4 w-4 ml-auto" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-auto" />
                )}
              </SidebarGroupLabel>
              {!collapsedGroups.system && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {filterItemsByRole(systemAdministrationItems, userRole).map(
                      item => (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.href as Route}
                              className="flex items-center justify-between w-full min-w-0"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <item.icon className="h-4 w-4 shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="truncate font-medium">
                                    {item.label}
                                  </div>
                                </div>
                              </div>
                              {item.badge && (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs shrink-0"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    )}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
            <SidebarSeparator />
          </>
        )}
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
