'use client';

import { AppSidebar } from '@/components/app-sidebar';
import ProtectedRoute from '@/components/auth/protected-route';
import { SiteHeader } from '@/components/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  title?: string;
  description?: string;
}

/**
 * Shared app layout for authenticated pages following shadcn/ui dashboard pattern
 * Provides sidebar navigation and header for all app pages using SidebarProvider
 * @component AppLayout
 * @example
 * ```tsx
 * <AppLayout requiredRoles={['ADMIN', 'MANAGER']} title="Settings">
 *   <SettingsPage />
 * </AppLayout>
 * ```
 * @accessibility
 * - ARIA roles: main, navigation
 * - Keyboard navigation: Tab through sidebar and main content
 * - Screen reader: Announces current page and navigation state
 */
export default function AppLayout({
  children,
  requiredRoles,
  title,
  description: _description,
}: AppLayoutProps) {
  return (
    <ProtectedRoute requiredRoles={requiredRoles}>
      <SidebarProvider
        className="flex min-h-screen w-full"
        style={
          {
            '--sidebar-width': '20rem', // 320px
            '--sidebar-width-icon': '3rem', // 48px
            '--header-height': '4rem',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="sidebar" collapsible="icon" />
        <SidebarInset className="flex-1 min-w-0 bg-sidebar flex flex-col min-h-screen">
          <div className="bg-white rounded-lg shadow-sm mx-1 my-1 border-0 flex flex-col min-h-full group-data-[collapsible=icon]/sidebar-wrapper:mx-1">
            <SiteHeader title={title} />
            <div className="flex-1 flex flex-col">
              <div className="@container/main flex flex-1 flex-col">
                <div className="flex flex-col gap-4 py-3 px-4 lg:px-6 flex-1">
                  {children}
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}
