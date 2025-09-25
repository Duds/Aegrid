"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ViewToggleWithColumns } from "@/components/ui/view-toggle-with-columns";
import {
    Calendar,
    DollarSign,
    MapPin,
    MoreHorizontal,
    Plus,
    Search,
    Upload
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Asset, AssetDataTable } from "./asset-data-table";

interface AssetListProps {
  initialAssets?: Asset[];
}

/**
 * Asset List Component
 * Displays assets in either table or card view with filtering and search capabilities
 * @component AssetList
 * @example
 * ```tsx
 * <AssetList initialAssets={assets} />
 * ```
 * @accessibility
 * - ARIA roles: main content area
 * - Keyboard navigation: Tab through controls and content
 * - Screen reader: Announces view changes and content structure
 */
export function AssetList({ initialAssets = [] }: AssetListProps) {
  const { data: session } = useSession();
  const [assets, setAssets] = useState<Asset[]>(initialAssets);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"table" | "cards">("table");
  const [searchTerm, setSearchTerm] = useState("");
  const [tableInstance, setTableInstance] = useState<any>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  // Fetch all assets (let the table handle pagination)
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: "1000", // Fetch a large number to get all assets
        ...(searchTerm && { search: searchTerm }),
      });

      const response = await fetch(`/api/assets?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching assets:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (initialAssets.length === 0) {
      fetchAssets();
    }
  }, []);

  // Handle search
  const handleSearch = () => {
    fetchAssets();
  };


  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "ACTIVE": return "badge-status-active";
      case "INACTIVE": return "badge-status-inactive";
      case "UNDER_CONSTRUCTION": return "badge-status-construction";
      case "UNDER_MAINTENANCE": return "badge-status-maintenance";
      case "DECOMMISSIONED": return "badge-status-decommissioned";
      case "PLANNED": return "badge-status-planned";
      default: return "badge-status-inactive";
    }
  };

  // Get condition badge class
  const getConditionBadgeClass = (condition: string) => {
    switch (condition) {
      case "EXCELLENT": return "badge-condition-excellent";
      case "GOOD": return "badge-condition-good";
      case "FAIR": return "badge-condition-fair";
      case "POOR": return "badge-condition-poor";
      case "CRITICAL": return "badge-condition-critical";
      case "UNKNOWN": return "badge-condition-unknown";
      default: return "badge-condition-unknown";
    }
  };

  // Get priority badge class
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "LOW": return "badge-priority-low";
      case "MEDIUM": return "badge-priority-medium";
      case "HIGH": return "badge-priority-high";
      case "CRITICAL": return "badge-priority-critical";
      default: return "badge-priority-medium";
    }
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-AU");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assets</h1>
          <p className="text-sm text-muted-foreground">
            Manage and monitor council assets
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/assets/import">
              <Upload className="h-4 w-4 mr-2" />
              Import Assets
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/assets/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Asset
            </Link>
          </Button>
        </div>
      </div>

      {/* Search and View Controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search assets by name, number, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground h-9 flex items-center">
            {assets.length} assets
          </div>
          <ViewToggleWithColumns
            currentView={view}
            onViewChange={setView}
            table={tableInstance}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" text="Loading assets..." />
        </div>
      ) : assets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No assets found matching your criteria.</p>
            <Button asChild className="mt-4">
              <Link href="/assets/new">Add Your First Asset</Link>
            </Button>
          </CardContent>
        </Card>
      ) : view === "table" ? (
        <AssetDataTable
          data={assets}
          loading={loading}
          searchTerm={searchTerm}
          showColumnToggle={false}
          onTableReady={setTableInstance}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => (
            <Card key={asset.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/assets/${asset.id}`}>
                      <CardTitle className="text-lg hover:text-primary hover:underline cursor-pointer">
                        {asset.name}
                      </CardTitle>
                    </Link>
                    <CardDescription className="mt-1">
                      <Link
                        href={`/assets/${asset.id}`}
                        className="hover:text-primary hover:underline"
                      >
                        {asset.assetNumber}
                      </Link>
                      {" • "}
                      {asset.assetType.replace("_", " ")}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Status Badges */}
                <div className="flex flex-wrap gap-2">
                  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getStatusBadgeClass(asset.status)}`}>
                    {asset.status.replace("_", " ")}
                  </div>
                  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getConditionBadgeClass(asset.condition)}`}>
                    {asset.condition}
                  </div>
                  <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${getPriorityBadgeClass(asset.priority)}`}>
                    {asset.priority}
                  </div>
                </div>

                {/* Description */}
                {asset.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {asset.description}
                  </p>
                )}

                {/* Location */}
                {asset.address && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">
                      {asset.address}
                      {asset.suburb && `, ${asset.suburb}`}
                    </span>
                  </div>
                )}

                {/* Financial Info */}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Value:</span>
                  <span className="font-medium">
                    {formatCurrency(asset.currentValue || asset.purchasePrice)}
                  </span>
                </div>

                {/* Inspection Info */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Inspection:</span>
                  <span className="font-medium">
                    {formatDate(asset.lastInspection)}
                  </span>
                </div>

                {/* Counts */}
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{asset._count.documents} documents</span>
                  <span>{asset._count.inspections} inspections</span>
                  <span>{asset._count.maintenance} maintenance</span>
                  <span>{asset._count.workOrders} work orders</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/assets/${asset.id}`}>View Details</Link>
                  </Button>
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/assets/${asset.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Asset count display */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {assets.length} assets
        </p>
      </div>
    </div>
  );
}
