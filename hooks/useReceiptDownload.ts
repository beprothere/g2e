export const downloadAsImage = async (
  element: HTMLElement,
  fileName: string,
) => {
  const { toPng } = await import("html-to-image");
  const dataUrl = await toPng(element, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });

  const link = document.createElement("a");
  link.download = `${fileName}.png`;
  link.href = dataUrl;
  link.click();
};

export const downloadAsPDF = async (
  element: HTMLElement,
  fileName: string,
) => {
  const [{ toPng }, { default: jsPDF }] = await Promise.all([
    import("html-to-image"),
    import("jspdf"),
  ]);

  const dataUrl = await toPng(element, {
    backgroundColor: "#ffffff",
    pixelRatio: 2,
  });

  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const img = new Image();
  img.src = dataUrl;

  await new Promise((res) => (img.onload = res));

  const imgHeight = (img.height * pdfWidth) / img.width;
  pdf.addImage(img, "PNG", 0, 10, pdfWidth, imgHeight);
  pdf.save(`${fileName}.pdf`);
};
