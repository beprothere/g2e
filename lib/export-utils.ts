export const exportData = async (
  data: any[],
  type: "xlsx" | "pdf" | "docx" | "txt",
  fileName: string,
) => {
  if (!data || data.length === 0) {
    alert("No data available to export");
    return;
  }

  const headers = [["ID", "Name", "Email", "Status", "Plan"]];
  const body = data.map((u) => [
    u.id || u._id || "N/A",
    u.fullName || "N/A",
    u.email || "N/A",
    u.status || "N/A",
    u.plan || "N/A"
  ]);

  if (type === "pdf") {
    const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
      import("jspdf"),
      import("jspdf-autotable"),
    ]);

    const doc = new jsPDF();
    doc.text("Users Report", 14, 15);
    autoTable(doc, {
      head: headers,
      body: body,
      startY: 20,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185] },
    });
    doc.save(`${fileName}.pdf`);
  } else if (type === "xlsx") {
    const XLSX = await import("xlsx");

    const worksheetData = data.map((u) => ({
      ID: u.id || u._id,
      Name: u.fullName,
      Email: u.email,
      Status: u.status,
      Plan: u.plan,
      Date: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A",
    }));
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  } else if (type === "txt") {
    const content = body.map(row => row.join(" | ")).join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.txt`;
    link.click();
  } else if (type === "docx") {
    const content = "ID | Name | Email | Status | Plan\n" + body.map(row => row.join(" | ")).join("\n");
    const blob = new Blob([content], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.docx`;
    link.click();
  }
};
