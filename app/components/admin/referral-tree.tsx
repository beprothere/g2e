import { Card } from "@/components/ui/card";
import TreeChildNode from "./tree-child-node";
import { getReferralTreeData } from "@/lib/referral-tree-logic";
import { SearchX } from "lucide-react";
export async function ReferralTree() {
  const { treeData, summary } = await getReferralTreeData();

  return (
    <Card className="p-6 rounded-2xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-foreground">
          Referral Chain Viewer
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize multi-level referral networks with earnings distribution
        </p>
      </div>

      {treeData && treeData.length > 0 && (
        <div className="bg-card rounded-lg border border-border p-6 space-y-2">
          {treeData.map((node) => (
            <div
              key={node.id}
              className="border-b border-border/50 last:border-0"
            >
              <TreeChildNode node={node} />
            </div>
          ))}
        </div>
      )}

      <div>
        {!treeData || treeData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] mb-6 shadow-inner">
              <SearchX size={48} className="text-gray-200" />
            </div>
            <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
              No records found
            </h3>
            <p className="text-gray-400 text-sm max-w-sm mt-2 font-medium">
              No referral data is available. There may be no referrals yet, or
              there could be an issue with data retrieval. Please check back
              later or verify your referral setup.
            </p>
            {/* <button
                    onClick={handleResetFilters}
                    className="mt-8 px-8 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    Clear Filters
                  </button> */}
          </div>
        ) : (
          ""
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg bg-muted/30 border border-border">
          <p className="text-xs text-muted-foreground">Commission Breakdown</p>
          <p className="text-lg font-semibold text-foreground mt-2">
            Level 1: 30%
          </p>
          <p className="text-xs text-muted-foreground">Level 2: 5%</p>
        </div>
        <div className="p-4 rounded-lg bg-secondary/10 border border-border">
          <p className="text-xs text-secondary font-medium">Total Earned</p>
          <p className="text-lg font-semibold text-secondary mt-2">
            ${summary.totalEarned.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">
            From {summary.totalReferrals} referrals
          </p>
        </div>
        <div className="p-4 rounded-lg bg-destructive/10 border border-border">
          <p className="text-xs text-destructive font-medium">⚠️ Alerts</p>
          <p className="text-lg font-semibold text-destructive mt-2">
            {summary.suspicious} Suspicious
          </p>
          <p className="text-xs text-muted-foreground">Blocked or Pending</p>
        </div>
      </div>
    </Card>
  );
}
