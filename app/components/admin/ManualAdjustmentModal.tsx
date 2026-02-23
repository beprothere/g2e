"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { handleAdjustment } from "@/app/actions/wallets/actions";
import { Check, ChevronsUpDown, Search, User, DollarSign, Settings2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const types = [
  { label: "Deposit Adjustment", value: "Adjustment - Deposit", icon: DollarSign, color: "text-green-500" },
  { label: "Withdrawal Adjustment", value: "Adjustment - Withdrawal", icon: Settings2, color: "text-red-500" },
  { label: "Commission Adjustment", value: "Adjustment - Commission", icon: Check, color: "text-blue-500" },
];

export default function ManualAdjustmentModal({ open, setOpen }: { open: boolean, setOpen: (val: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userListOpen, setUserListOpen] = useState(false);
  const [adjType, setAdjType] = useState(types[0].value);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/admin/users/search").then(res => res.json()).then(data => setUsers(data));
    }
  }, [open]);

  const onSubmit = async () => {
    if (!selectedUser || !amount) return toast.error("Please fill all details");
    setLoading(true);
    const res = await handleAdjustment({ userId: selectedUser._id, type: adjType, amount: Number(amount) });
    setLoading(false);
    if (res.success) {
      toast.success(res.success);
      setOpen(false);
      setAmount("");
      setSelectedUser(null);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-112.5 p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-primary p-6 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-white">
              <Settings2 className="w-5 h-5" /> Fund Adjustment
            </DialogTitle>
            <p className="text-primary-foreground/80 text-xs">Manually override user balances and process commissions</p>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6 bg-background">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" /> Select Target User
            </label>
            <Popover open={userListOpen} onOpenChange={setUserListOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" className="w-full justify-between h-12 border-2 hover:border-primary/50 transition-all">
                  {selectedUser ? (
                    <div className="flex items-center gap-2">
                      <img src={selectedUser.avatar} className="w-6 h-6 rounded-full border" />
                      <span className="font-bold">{selectedUser.fullName}</span>
                    </div>
                  ) : "Search user by name or email..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Type user name..." />
                  <CommandList>
                    <CommandEmpty>No user found.</CommandEmpty>
                    <CommandGroup>
                      {users.map((u) => (
                        <CommandItem key={u._id} onSelect={() => { setSelectedUser(u); setUserListOpen(false); }}>
                          <div className="flex items-center gap-3 py-1">
                            <img src={u.avatar} className="w-8 h-8 rounded-full" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">{u.fullName}</span>
                              <span className="text-[10px] text-muted-foreground">{u.email}</span>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Adjustment Type</label>
              <div className="grid grid-cols-1 gap-1">
                {types.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setAdjType(t.value)}
                    className={cn(
                      "flex items-center gap-2 p-2 rounded-lg text-[11px] font-bold border-2 transition-all",
                      adjType === t.value ? "border-primary bg-primary/5 text-primary" : "border-transparent bg-muted/50 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <t.icon className={cn("w-3 h-3", t.color)} />
                    {t.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Amount ($)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">$</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  className="pl-7 h-24 text-3xl font-black border-2 focus-visible:ring-primary"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button 
            className="w-full h-12 text-md font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform" 
            onClick={onSubmit} 
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <Check className="mr-2 w-5 h-5" />}
            Confirm Adjustment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}