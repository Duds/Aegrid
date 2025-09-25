"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OfflineInspection, offlineStorage } from "@/lib/offline-storage";
import {
    AlertTriangle,
    Camera,
    CheckCircle,
    Clock,
    Loader2,
    MapPin,
    RefreshCw,
    Settings,
    WifiOff,
    Wrench
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { LoadingSpinner } from '@/components/ui/loading-spinner';
interface DashboardStats {
  totalAssets: number;
  pendingInspections: number;
  completedInspections: number;
  overdueMaintenance: number;
  offlineData: number;
}

/**
 * Mobile Dashboard Component
 * Optimized dashboard for mobile devices with offline capabilities
 */
export function MobileDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalAssets: 0,
    pendingInspections: 0,
    completedInspections: 0,
    overdueMaintenance: 0,
    offlineData: 0,
  });
  const [isOnline, setIsOnline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [recentInspections, setRecentInspections] = useState<OfflineInspection[]>([]);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Back online - syncing data");
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("You're offline - data will sync when online");
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    loadDashboardData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load offline data
      const [inspections, assets] = await Promise.all([
        offlineStorage.getInspections(),
        offlineStorage.getAssets(),
      ]);

      // Calculate stats
      const pendingInspections = inspections.filter(i => i.syncStatus === 'pending').length;
      const completedInspections = inspections.filter(i => i.syncStatus === 'synced').length;

      setStats({
        totalAssets: assets.length,
        pendingInspections,
        completedInspections,
        overdueMaintenance: 0, // Would calculate from maintenance data
        offlineData: inspections.length + assets.length,
      });

      // Load recent inspections
      const sortedInspections = inspections
        .sort((a, b) => new Date(b.inspectionDate).getTime() - new Date(a.inspectionDate).getTime())
        .slice(0, 5);
      setRecentInspections(sortedInspections);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard data");
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Trigger background sync
      if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register('inspection-sync');
        await registration.sync.register('asset-sync');

        toast.success("Sync initiated - data will sync in background");
      } else {
        toast.error("Background sync not supported");
      }
    } catch (error) {
      console.error("Failed to trigger sync:", error);
      toast.error("Failed to trigger sync");
    } finally {
      setSyncing(false);
    }
  };

  const getConditionBadgeVariant = (condition: string) => {
    switch (condition) {
      case "EXCELLENT": return "secondary";
      case "GOOD": return "secondary";
      case "FAIR": return "outline";
      case "POOR": return "destructive";
      case "CRITICAL": return "destructive";
      default: return "default";
    }
  };

  const getSyncStatusIcon = (syncStatus: string) => {
    switch (syncStatus) {
      case "synced": return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending": return <Clock className="h-4 w-4 text-orange-600" />;
      case "failed": return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mobile Dashboard</h1>

        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
          >
            {syncing ? (
              <LoadingSpinner size="sm" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium">
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.totalAssets}</p>

              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Camera className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.completedInspections}</p>

              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.pendingInspections}</p>

              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.overdueMaintenance}</p>

              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-16 flex-col gap-2" asChild>
              <a href="/mobile/inspections/new">
                <Camera className="h-6 w-6" />
                <span className="text-sm">New Inspection</span>
              </a>
            </Button>

            <Button variant="outline" className="h-16 flex-col gap-2" asChild>
              <a href="/mobile/work-orders">
                <Wrench className="h-6 w-6" />
                <span className="text-sm">Work Orders</span>
              </a>
            </Button>

            <Button variant="outline" className="h-16 flex-col gap-2" asChild>
              <a href="/assets/map">
                <MapPin className="h-6 w-6" />
                <span className="text-sm">View Assets</span>
              </a>
            </Button>

            <Button variant="outline" className="h-16 flex-col gap-2" onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <RefreshCw className="h-6 w-6" />
              )}
              <span className="text-sm">Sync Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Inspections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Inspections</CardTitle>
          <CardDescription>
            Latest inspection activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentInspections.length > 0 ? (
              recentInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{inspection.assetName}</h4>
                      <Badge variant={getConditionBadgeVariant(inspection.condition)} size="sm">
                        {inspection.condition}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{inspection.inspectionType}</span>
                      <span>{new Date(inspection.inspectionDate).toLocaleDateString("en-AU")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSyncStatusIcon(inspection.syncStatus)}
                    {inspection.photos && inspection.photos.length > 0 && (
                      <Badge variant="outline" size="sm">
                        {inspection.photos.length} photos
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4" />
                <p className="text-sm">No inspections yet</p>
                <p className="text-xs">Start your first inspection</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Summary */}
      {!isOnline && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <WifiOff className="h-5 w-5" />
              Offline Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">{stats.offlineData}</div>

                </div>
                <div>
                  <div className="text-lg font-bold text-orange-600">{stats.pendingInspections}</div>

                </div>
                <div>
                  <div className="text-lg font-bold text-green-600">{stats.completedInspections}</div>

                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
