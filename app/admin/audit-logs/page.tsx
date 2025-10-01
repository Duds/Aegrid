'use client';

import AppLayout from '@/components/layout/app-layout';
import { Button } from '@/components/ui/button';
import { AuditAction } from '@prisma/client';
import { Activity, Download, Filter, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
interface AuditLog {
  id: string;
  action: AuditAction;
  userId: string | null;
  organisationId: string | null;
  details: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  } | null;
  organisation: {
    id: string;
    name: string;
  } | null;
}

interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

const actionLabels: Record<AuditAction, string> = {
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  USER_ROLE_CHANGE: 'Role Change',
  USER_STATUS_CHANGE: 'Status Change',
  USER_PASSWORD_RESET: 'Password Reset',
  USER_CREATED: 'User Created',
  USER_UPDATED: 'User Updated',
  USER_DELETED: 'User Deleted',
  ORGANISATION_CREATED: 'Organisation Created',
  ORGANISATION_UPDATED: 'Organisation Updated',
  ORGANISATION_DELETED: 'Organisation Deleted',
  MFA_ENABLED: 'MFA Enabled',
  MFA_DISABLED: 'MFA Disabled',
  MFA_VERIFIED: 'MFA Verified',
  MFA_BACKUP_CODE_USED: 'MFA Backup Code Used',
  ASSET_CREATED: 'Asset Created',
  ASSET_UPDATED: 'Asset Updated',
  ASSET_DELETED: 'Asset Deleted',
  ASSET_IMPORTED: 'Asset Imported',
  ASSET_DOCUMENT_ATTACHED: 'Asset Document Attached',
  ASSET_DOCUMENT_REMOVED: 'Asset Document Removed',
};

/**
 * Audit logs page for administrators
 * @component AuditLogs
 * @example
 * ```tsx
 * <AuditLogs />
 * ```
 * @accessibility
 * - ARIA roles: main, table, button
 * - Keyboard navigation: Tab through table and controls
 * - Screen reader: Announces audit log data and actions
 */
export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [userFilter, setUserFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '50',
      });

      if (actionFilter) params.append('action', actionFilter);
      if (userFilter) params.append('userId', userFilter);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await fetch(`/api/admin/audit-logs?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data: AuditLogsResponse = await response.json();
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, actionFilter, userFilter, startDate, endDate]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export audit logs');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getActionIcon = (action: AuditAction) => {
    switch (action) {
      case AuditAction.USER_LOGIN:
      case AuditAction.USER_LOGOUT:
        return <User className="h-4 w-4" />;
      case AuditAction.USER_ROLE_CHANGE:
      case AuditAction.USER_STATUS_CHANGE:
        return <Shield className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: AuditAction) => {
    switch (action) {
      case AuditAction.USER_LOGIN:
        return 'text-green-600';
      case AuditAction.USER_LOGOUT:
        return 'text-blue-600';
      case AuditAction.USER_ROLE_CHANGE:
      case AuditAction.USER_STATUS_CHANGE:
        return 'text-orange-600';
      case AuditAction.USER_DELETED:
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <AppLayout
        requiredRoles={['ADMIN']}
        title="Audit Logs"
        description="Monitor system activity and security events"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      requiredRoles={['ADMIN']}
      title="Audit Logs"
      description="Monitor system activity and security events"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
          </div>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-lg p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Action Type
                </label>
                <select
                  value={actionFilter}
                  onChange={e =>
                    setActionFilter(e.target.value as AuditAction | '')
                  }
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Actions</option>
                  {Object.values(AuditAction).map(action => (
                    <option key={action} value={action}>
                      {actionLabels[action]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  User Email
                </label>
                <input
                  type="text"
                  placeholder="Search by user email..."
                  value={userFilter}
                  onChange={e => setUserFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
            </div>
          </form>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table
              className="w-full"
              role="table"
              aria-label="Audit logs table"
            >
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className={`mr-2 ${getActionColor(log.action)}`}>
                          {getActionIcon(log.action)}
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {actionLabels[log.action]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.user ? (
                        <div>
                          <div className="text-sm font-medium text-foreground">
                            {log.user.name || 'No name'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.user.email}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-muted-foreground">
                        {log.details ? (
                          <pre className="whitespace-pre-wrap text-xs">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        ) : (
                          'No details'
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {log.ipAddress || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="bg-muted px-6 py-3 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
                of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pagination.pages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
