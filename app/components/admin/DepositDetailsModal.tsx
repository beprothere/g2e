'use client'

import { CheckCircle, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function DepositDetailsModal({
  open,
  onClose,
  deposit,
  onApprove,
  onReject,
}: any) {
  if (!deposit) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          w-[calc(100%-2rem)]
          max-w-md sm:max-w-lg
          rounded-2xl
          p-0
          overflow-hidden
        "
      >
        <DialogHeader className="px-5 py-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Deposit Details
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="px-5 py-5 space-y-5 text-sm max-h-[65vh] overflow-y-auto">
          {/* User Info */}
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase">User</p>
              <p className="font-medium">{deposit.user}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase">Email</p>
              <p className="font-medium break-all">{deposit.email}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase">Address</p>
              <p className="font-medium">{deposit.address}</p>
            </div>
          </div>

          {/* Transaction */}
          <div className="pt-4 border-t space-y-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Transaction ID
              </p>
              <p className="font-mono text-xs break-all">
                {deposit.fullId}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Amount</p>
                <p className="font-semibold text-secondary text-base">
                  +${deposit.amount}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase">Status</p>
                <Badge
                  className={
                    deposit.status === 'approved'
                      ? 'bg-secondary/20 text-secondary border-0'
                      : deposit.status === 'pending'
                      ? 'bg-accent/20 text-accent border-0'
                      : 'bg-destructive/20 text-destructive border-0'
                  }
                >
                  {deposit.status}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground uppercase">Date</p>
              <p className="font-medium">{deposit.date}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        {deposit.status === 'pending' && (
          <div className="px-5 py-4 border-t flex flex-col gap-3">
            <Button
              className="w-full bg-secondary text-secondary-foreground gap-2"
              onClick={onApprove}
            >
              <CheckCircle className="h-4 w-4" />
              Approve Deposit
            </Button>

            <Button
              variant="destructive"
              className="w-full gap-2"
              onClick={onReject}
            >
              <XCircle className="h-4 w-4" />
              Reject Deposit
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
