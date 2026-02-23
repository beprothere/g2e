"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SerumOrderFilters } from "@/app/components/admin/serum-orders-filters";
import { SerumOrderTable } from "@/app/components/admin/serum-orders-table";

export default function SerumOrdersClient({
  initialOrders,
  total,
  pages,
  currentFilters,
}: {
  initialOrders: any[];
  total: number;
  pages: number;
  currentFilters: any;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filters, setFilters] = useState(currentFilters);

  const updateURL = (newFilters: any) => {
    const qs = new URLSearchParams({
      search: newFilters.search,
      status: newFilters.status,
      dateRange: newFilters.dateRange,
      page: String(newFilters.page),
      limit: String(newFilters.limit),
    }).toString();

    startTransition(() => {
      router.push(`?${qs}`);
      router.refresh();
    });
  };

  const onApply = () => {
    updateURL({ ...filters, page: 1 });
  };

  const onExport = async (type: "xlsx" | "pdf" | "docx" | "txt") => {
    const qs = new URLSearchParams(filters as any).toString();
    const res = await fetch(`/api/admin-panel/serum-order-list?${qs}`);
    const data = await res.json();

    const rows = data.orders.map((o: any) => ({
      orderId: `SERM-${o._id.slice(-6)}`,
      serum: o.serumName,
      user: o.fullName,
      email: o.email,
      phone: o.phone || "-",
      status: o.status,
      tracking: o.trackingNumber || "-",
    }));

    if (type === "xlsx") {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Serum Orders");
      XLSX.writeFile(wb, "serum-orders.xlsx");
    }

    if (type === "pdf") {
      const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable"),
      ]);

      const pdf = new jsPDF();
      autoTable(pdf, {
        head: [["No.", "Order ID", "Serum", "User", "Email", "Status", "Tracking"]],
        body: rows.map((r: any, i: number) => [
          i + 1,  
          r.orderId,
          r.serum,
          r.user,
          r.email,
          r.status,
          r.tracking,
        ]),
      });
      pdf.save("serum-orders.pdf");
    }

    if (type === "docx") {
      const [{ saveAs }, docx] = await Promise.all([
        import("file-saver"),
        import("docx"),
      ]);

      const table = new docx.Table({
        rows: [
          new docx.TableRow({
            children: ["Order ID", "Serum", "User", "Status"].map(
              (h) => new docx.TableCell({ children: [new docx.Paragraph(h)] }),
            ),
          }),
          ...rows.map(
            (r: any) =>
              new docx.TableRow({
                children: [r.orderId, r.serum, r.user, r.status].map(
                  (c) => new docx.TableCell({ children: [new docx.Paragraph(c)] }),
                ),
              }),
          ),
        ],
      });
      const doc = new docx.Document({ sections: [{ children: [table] }] });
      saveAs(await docx.Packer.toBlob(doc), "serum-orders.docx");
    }

    if (type === "txt") {
      const { saveAs } = await import("file-saver");
      const text = rows
        .map((r: any) => `${r.orderId} | ${r.serum} | ${r.status}`)
        .join("\n");
      saveAs(new Blob([text]), "serum-orders.txt");
    }
  };

  return (
    <div className="relative space-y-6">
      {isPending && (
        <div className="fixed inset-0 z-1000 bg-background/50 backdrop-blur-sm flex items-center justify-center">
          <p className="text-sm font-bold animate-pulse text-primary tracking-widest uppercase">
            Updating Results...
          </p>
        </div>
      )}

      <SerumOrderFilters
        filters={filters}
        setFilters={setFilters}
        onApply={onApply}
        onExport={onExport}
      />

      <SerumOrderTable
        initialOrders={initialOrders}
        total={total}
        pages={pages}
        filters={filters}
        onPageChange={(newPage: number) =>
          updateURL({ ...filters, page: newPage })
        }
      />
    </div>
  );
}
