"use client";

import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header";
import { DataTablePagination } from "@/components/ui/data-table-pagination";
import { DataTableViewOptions } from "@/components/ui/data-table-view-options";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export interface Asset {
  id: string;
  assetNumber: string;
  name: string;
  description?: string;
  assetType: string;
  status: string;
  condition: string;
  priority: string;
  address?: string;
  suburb?: string;
  latitude?: number;
  longitude?: number;
  purchasePrice?: number;
  currentValue?: number;
  lastInspection?: string;
  nextInspection?: string;
  createdAt: string;
  _count: {
    documents: number;
    inspections: number;
    maintenance: number;
    workOrders: number;
  };
}

interface AssetDataTableProps {
  data: Asset[];
  loading?: boolean;
  searchTerm?: string;
  showColumnToggle?: boolean;
  onTableReady?: (table: any) => void;
}

/**
 * Asset Data Table Component
 * Displays assets in a sortable, filterable, and paginated table format
 * @component AssetDataTable
 * @example
 * ```tsx
 * <AssetDataTable data={assets} loading={false} />
 * ```
 * @accessibility
 * - ARIA roles: table, row, cell
 * - Keyboard navigation: Tab through table elements
 * - Screen reader: Announces table structure and content
 */
export function AssetDataTable({ data, loading = false, searchTerm = "", showColumnToggle = true, onTableReady }: AssetDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // Sync searchTerm with column filters
  React.useEffect(() => {
    setColumnFilters([{ id: "name", value: searchTerm }]);
  }, [searchTerm]);

  const columns: ColumnDef<Asset>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "assetNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Asset Number" />
      ),
      cell: ({ row }) => {
        const assetNumber = row.getValue("assetNumber") as string;
        const assetId = row.original.id;
        return (
          <Link
            href={`/assets/${assetId}`}
            className="font-medium hover:text-primary hover:underline"
          >
            {assetNumber}
          </Link>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        const assetId = row.original.id;
        return (
          <Link
            href={`/assets/${assetId}`}
            className="max-w-[200px] truncate font-medium hover:text-primary hover:underline"
          >
            {name}
          </Link>
        );
      },
      filterFn: (row, id, value) => {
        const name = row.getValue("name") as string;
        const assetNumber = row.getValue("assetNumber") as string;
        const description = row.original.description || "";
        const searchValue = value.toLowerCase();

        return (
          name.toLowerCase().includes(searchValue) ||
          assetNumber.toLowerCase().includes(searchValue) ||
          description.toLowerCase().includes(searchValue)
        );
      },
    },
    {
      accessorKey: "assetType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.getValue("assetType").replace("_", " ")}
        </Badge>
      ),
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const statusClass = status === "ACTIVE" ? "badge-status-active" :
                           status === "INACTIVE" ? "badge-status-inactive" :
                           status === "UNDER_CONSTRUCTION" ? "badge-status-construction" :
                           status === "UNDER_MAINTENANCE" ? "badge-status-maintenance" :
                           status === "DECOMMISSIONED" ? "badge-status-decommissioned" :
                           status === "PLANNED" ? "badge-status-planned" : "badge-status-inactive";

        return (
          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${statusClass}`}>
            {status.replace("_", " ")}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "condition",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Condition" />
      ),
      cell: ({ row }) => {
        const condition = row.getValue("condition") as string;
        const conditionClass = condition === "EXCELLENT" ? "badge-condition-excellent" :
                              condition === "GOOD" ? "badge-condition-good" :
                              condition === "FAIR" ? "badge-condition-fair" :
                              condition === "POOR" ? "badge-condition-poor" :
                              condition === "CRITICAL" ? "badge-condition-critical" :
                              condition === "UNKNOWN" ? "badge-condition-unknown" : "badge-condition-unknown";

        return (
          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${conditionClass}`}>
            {condition}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = row.getValue("priority") as string;
        const priorityClass = priority === "LOW" ? "badge-priority-low" :
                             priority === "MEDIUM" ? "badge-priority-medium" :
                             priority === "HIGH" ? "badge-priority-high" :
                             priority === "CRITICAL" ? "badge-priority-critical" : "badge-priority-medium";

        return (
          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${priorityClass}`}>
            {priority}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "currentValue",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => {
        const value = row.getValue("currentValue") as number;
        if (!value) return <div className="text-muted-foreground">N/A</div>;

        const formatted = new Intl.NumberFormat("en-AU", {
          style: "currency",
          currency: "AUD",
        }).format(value);

        return <div className="text-right font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "address",
      header: "Location",
      cell: ({ row }) => {
        const address = row.getValue("address") as string;
        const suburb = row.original.suburb;

        if (!address) return <div className="text-muted-foreground">N/A</div>;

        return (
          <div className="max-w-[200px] truncate">
            {address}
            {suburb && `, ${suburb}`}
          </div>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const asset = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-background border shadow-md">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(asset.id)}
              >
                Copy asset ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/assets/${asset.id}`}>
                  View details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/assets/${asset.id}/edit`}>
                  Edit asset
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Notify parent when table is ready
  React.useEffect(() => {
    if (onTableReady && table) {
      onTableReady(table);
    }
  }, [onTableReady, table]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="lg" text="Loading assets..." />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        {showColumnToggle && <DataTableViewOptions table={table} />}
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No assets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="mt-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
