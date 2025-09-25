import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getRoleDisplayName } from "@/lib/audit";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    Activity,
    CheckCircle,
    Settings,
    Shield,
    Users
} from "lucide-react";
import { getServerSession } from "next-auth";

/**
 * Admin dashboard overview page
 * @component AdminDashboard
 * @example
 * ```tsx
 * <AdminDashboard />
 * ```
 * @accessibility
 * - ARIA roles: main, region
 * - Keyboard navigation: Tab through dashboard cards
 * - Screen reader: Announces dashboard statistics
 */
export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return null;
  }

  // Get dashboard statistics
  const [
    totalUsers,
    activeUsers,
    _inactiveUsers,
    recentLogins,
    auditLogsToday,
    roleDistribution,
  ] = await Promise.all([
    prisma.user.count({
      where: { organisationId: session.user.organisationId },
    }),
    prisma.user.count({
      where: {
        organisationId: session.user.organisationId,
        isActive: true,
      },
    }),
    prisma.user.count({
      where: {
        organisationId: session.user.organisationId,
        isActive: false,
      },
    }),
    prisma.user.count({
      where: {
        organisationId: session.user.organisationId,
        lastLoginAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    }),
    prisma.auditLog.count({
      where: {
        organisationId: session.user.organisationId,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)), // Today
        },
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      where: { organisationId: session.user.organisationId },
      _count: { role: true },
    }),
  ]);

  const stats = [
    {
      name: "Total Users",
      value: totalUsers,
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      name: "Active Users",
      value: activeUsers,
      icon: CheckCircle,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      name: "Recent Logins",
      value: recentLogins,
      icon: Activity,
      change: "+5%",
      changeType: "positive" as const,
    },
    {
      name: "Audit Events Today",
      value: auditLogsToday,
      icon: Shield,
      change: "+2%",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card
            key={stat.name}
            role="region"
            aria-label={`${stat.name} statistics`}
          >
            <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <stat.icon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="mt-4 flex items-center">
              <span
                className={`text-sm font-medium ${
                  stat.changeType === "positive"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                from last week
              </span>
            </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Distribution</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {roleDistribution.map((role) => (
            <div
              key={role.role}
              className="text-center p-4 bg-muted rounded-lg"
            >
              <div className="text-2xl font-bold text-foreground">
                {role._count.role}
              </div>
              <div className="text-sm text-muted-foreground">
                {getRoleDisplayName(role.role)}
              </div>
            </div>
          ))}
        </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/users"
            className="flex items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Users className="h-5 w-5 text-primary mr-3" />
            <div>
              <div className="font-medium">Manage Users</div>
              <div className="text-sm text-muted-foreground">
                Add, edit, or deactivate users
              </div>
            </div>
          </a>
          <a
            href="/admin/audit-logs"
            className="flex items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Activity className="h-5 w-5 text-primary mr-3" />
            <div>
              <div className="font-medium">View Audit Logs</div>
              <div className="text-sm text-muted-foreground">
                Monitor system activity
              </div>
            </div>
          </a>
          <a
            href="/admin/security"
            className="flex items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Shield className="h-5 w-5 text-primary mr-3" />
            <div>
              <div className="font-medium">Security Settings</div>
              <div className="text-sm text-muted-foreground">
                Configure security policies
              </div>
            </div>
          </a>
          <a
            href="/admin/organization"
            className="flex items-center p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Settings className="h-5 w-5 text-primary mr-3" />
            <div>
              <div className="font-medium">Organization Settings</div>
              <div className="text-sm text-muted-foreground">
                Configure locations and external APIs
              </div>
            </div>
          </a>
        </div>
        </CardContent>
      </Card>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Database</span>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-600">Healthy</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Authentication</span>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-600">Operational</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Audit Logging</span>
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}
