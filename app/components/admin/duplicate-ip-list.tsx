"use client";

import { AlertCircle, Trash2, Ban, ShieldCheck, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useTransition } from "react";
import {
  getDuplicateIPs,
  blockIPUsers,
  deleteIPUsers,
} from "@/app/actions/security-ip";
import { toast } from "sonner";

export function DuplicateIPList() {
  const [duplicateIPs, setDuplicateIPs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchData = async () => {
    const data = await getDuplicateIPs();
    setDuplicateIPs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBlock = async (ids: string[]) => {
    startTransition(async () => {
      const res = await blockIPUsers(ids);
      if (res.success) {
        toast.success("All users on this IP blocked");
        fetchData();
      }
    });
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm("Are you sure? Users will be moved to Deleted Records."))
      return;
    startTransition(async () => {
      const res = await deleteIPUsers(ids);
      if (res.success) {
        toast.success("Users deleted and archived");
        fetchData();
      }
    });
  };

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <Card className="rounded-2xl overflow-hidden shadow-lg border-none">
      <div className="p-6 border-b border-border bg-card">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-destructive" />
          Duplicate IPs
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Detecting multiple accounts from the same network
        </p>
      </div>

      <div className="divide-y divide-border">
        {duplicateIPs.length === 0 ? (
          /* Empty State UI */
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-medium text-foreground">All Clear!</h3>
            <p className="text-muted-foreground max-w-xs mt-2">
              No duplicate IP addresses found. Your security system is doing
              great.
            </p>
          </div>
        ) : (
          duplicateIPs.map((item, index) => (
            <div
              key={index}
              className="p-6 hover:bg-muted/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-bold text-lg text-foreground font-mono">
                    {item.ip}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {item.signups} users registered
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={`${item.risk === "high" ? "bg-red-500/10 text-red-500" : "bg-orange-500/10 text-orange-500"} border-none`}
                  >
                    {item.risk.toUpperCase()} RISK
                  </Badge>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {item.users.map((user: string, i: number) => (
                    <Badge key={i} variant="secondary" className="font-normal">
                      {user}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  disabled={isPending || item.status === "blocked"}
                  onClick={() => handleBlock(item.userIds)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-destructive/50 text-destructive hover:bg-destructive hover:text-white"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  {item.status === "blocked"
                    ? "Already Blocked"
                    : "Block All Users"}
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => handleDelete(item.userIds)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete & Archive
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
