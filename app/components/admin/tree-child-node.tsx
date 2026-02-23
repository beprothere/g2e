"use client";
import { useState } from "react";
import { ChevronDown, ChevronRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TreeChildNode({ node }: { node: any }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  const statusColor: any = {
    active: "bg-secondary/10 text-secondary",
    inactive: "bg-muted/10 text-muted-foreground",
    suspicious: "bg-destructive/10 text-destructive",
  };
 
  return (
    <div className="pl-0">
      <div className="flex items-center gap-2 py-3">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary text-sm font-bold">
              {node.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-foreground truncate">
                {node.name}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {node.email}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {node.status === "suspicious" && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          <Badge className={`${statusColor[node.status]} border-0 text-xs`}>
            Level {node.level}
          </Badge>
          <div className="text-right">
            <p className="font-semibold text-sm text-secondary">
              ${node.earnings.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {node.level === 2 ? "5%" : "30%"} comm
            </p>
          </div>
        </div>
      </div>

      {isExpanded && hasChildren && (
        <div className="ml-4 border-l-2 border-border">
          {node.children.map((child: any) => (
            <div key={child.id} className="pl-4">
              <TreeChildNode node={child} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
