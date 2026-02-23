"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { downloadAsImage, downloadAsPDF } from "@/hooks/useReceiptDownload";

export default function TransactionDetailModal({ open, onClose, transaction }: any) {
  const handleDownloadImage = () => {
    const element = document.getElementById("receipt");
    if (!element) return;
    downloadAsImage(element, `receipt-${transaction._id.slice(-6)}`);
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("receipt");
    if (!element) return;
    downloadAsPDF(element, `receipt-${transaction._id.slice(-6)}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaction Receipt</DialogTitle>
        </DialogHeader>

        <div id="receipt" className="space-y-3 border p-4 rounded">
          <h2 className="font-bold">TXN-{transaction._id.slice(-6)}</h2>

          <p>User: <b>{transaction.userId.fullName}</b></p>

          <Badge>{transaction.type}</Badge>
          <Badge variant="outline">{transaction.status}</Badge>

          <p>Amount: ${transaction.amount}</p>
          <p>Date: {new Date(transaction.createdAt).toLocaleString()}</p>
          <p>Balance After: ${transaction.userId.availableWithdraw}</p>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleDownloadImage}>
            Download Image
          </Button>
          <Button variant="outline" onClick={handleDownloadPDF}>
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
