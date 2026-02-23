"use client";

import { Search, Filter, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { SerumOrderFilterType } from "@/app/admin/serum-order/types";

const initialLocalFilters: Partial<SerumOrderFilterType> = {
  search: "",
  status: "all",
  dateRange: "all",
};

const chipStyles: Record<string, string> = {
  processing: "bg-yellow-100 text-yellow-700",
  dispatched: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  "7d": "bg-orange-100 text-orange-700",
  "30d": "bg-cyan-100 text-cyan-700",
  "90d": "bg-teal-100 text-teal-700",
};

type Props = {
  filters: SerumOrderFilterType;
  setFilters: React.Dispatch<React.SetStateAction<SerumOrderFilterType>>;
  onApply: () => void;
  onExport: (type: "xlsx" | "pdf" | "docx" | "txt") => void;
};

export function SerumOrderFilters({
  filters,
  setFilters,
  onApply,
  onExport,
}: Props) {
  const selectedFilters = (
    Object.entries(filters) as [
      keyof SerumOrderFilterType,
      SerumOrderFilterType[keyof SerumOrderFilterType],
    ][]
  ).filter(([key, value]) => {
    if (!["search", "status", "dateRange"].includes(key)) return false;

    if (value === "all") return false;

    if (typeof value === "string") {
      return value.trim() !== "";
    }

    return false;
  });

  return (
    <Card className="p-6">
      <div className="filter-inner-box-user serum-filter-outer-box">
        <div className="serum-filter-inner-box">
          <div className="search-serum-oder-filter ">
            <label className="text-sm font-medium mb-2 block lg:w-full! md:w-full! w-full">
              Search
            </label>
            <div className="relative lg:w-full! md:w-full! w-full">
              <Search className="absolute left-3 top-1/2 filter-search-input -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10 lg:w-full"
                placeholder="Serum, user, email..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((p) => ({
                    ...p,
                    search: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <div className="status-date-range">
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filters.status}
              onValueChange={(v) => setFilters((p) => ({ ...p, status: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="status-date-range">
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Select
              value={filters.dateRange}
              onValueChange={(v) =>
                setFilters((p) => ({
                  ...p,
                  dateRange: v,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="export-filter-btn-box">
          <Button
            variant="outline"
            size="sm"
            onClick={onApply}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onExport("xlsx")}>
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("pdf")}>
                PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("docx")}>
                Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onExport("txt")}>
                Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {selectedFilters.length > 0 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          <div className="flex flex-wrap gap-2">
            {selectedFilters.map(([key, value]) => (
              <div
                key={key}
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                  chipStyles[String(value)] || "bg-muted text-muted-foreground"
                }`}
              >
                {key}: {String(value)}
                <button
                  onClick={() =>
                    setFilters((p) => ({
                      ...p,
                      [key]:
                        initialLocalFilters[
                          key as keyof SerumOrderFilterType
                        ] ?? "",
                    }))
                  }
                  className="font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => {
              setFilters((p) => ({
                ...p,
                ...initialLocalFilters,
              }));
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}
    </Card>
  );
}
