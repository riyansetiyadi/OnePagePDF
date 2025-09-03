/**
 * PDF Merge and Download Functions
 * Handles the main PDF merging functionality
 */

import { DOM, selectedFiles } from './constants.js';
import { getSelectedLayout, getSelectedPaperSize, getPaperDimensions, getPdfsPerPage } from './utils.js';
import { showError, showSuccess } from './ui.js';
import { createPageCanvas } from './pdfRenderer.js';
import { calculateSlotDimensions } from './utils.js';

/**
 * Handle Merge Button Click
 */
export async function handleMergeClick() {
  if (selectedFiles.length < 2) {
    showError("Please select at least 2 PDF files to merge");
    return;
  }

  DOM.loadingIndicator.classList.remove("d-none");
  DOM.mergeButton.disabled = true;

  try {
    const layout = getSelectedLayout();
    const paperSize = getSelectedPaperSize();
    const pdfsPerPage = getPdfsPerPage();
    const { width, height } = getPaperDimensions(paperSize, layout);
    // Prefer vector merging using PDF-LIB when available to preserve original vector quality
    const PDFLib = window.PDFLib;
    if (PDFLib && PDFLib.PDFDocument) {
      const { PDFDocument } = PDFLib;
      const outPdf = await PDFDocument.create();

      // Prepare slot layout in points (utils.calculateSlotDimensions expects points)
      for (let pageIndex = 0; pageIndex < Math.ceil(selectedFiles.length / pdfsPerPage); pageIndex++) {
        const outPage = outPdf.addPage([width, height]);

        const startIndex = pageIndex * pdfsPerPage;
        const pageFiles = selectedFiles.slice(startIndex, startIndex + pdfsPerPage);
        const slots = calculateSlotDimensions(width, height, pdfsPerPage);

        for (let j = 0; j < pageFiles.length && j < slots.length; j++) {
          try {
            const file = pageFiles[j];
            const arrayBuffer = await file.arrayBuffer();
            const srcPdf = await PDFDocument.load(arrayBuffer);
            const [srcPage] = srcPdf.getPages();

            // Embed the page into the output PDF (preserves vector content)
            const embedded = await outPdf.embedPage(srcPage);

            const slot = slots[j];
            // Fit embedded page into slot while preserving aspect ratio
            const scale = Math.min(slot.width / embedded.width, slot.height / embedded.height);
            const drawWidth = embedded.width * scale;
            const drawHeight = embedded.height * scale;

            // PDF-lib uses bottom-left origin; convert slot.y (top-left) to bottom-left
            const x = slot.x + (slot.width - drawWidth) / 2;
            const y = height - (slot.y + drawHeight) ;

            outPage.drawPage(embedded, {
              x,
              y,
              width: drawWidth,
              height: drawHeight,
            });
          } catch (err) {
            console.error('Embed page failed, falling back to raster for this page:', err);
            // Fallback: rasterize this slot to avoid failing entire operation
            const fallbackCanvas = await createPageCanvas([pageFiles[j]], width, height, 1);
            const imgData = fallbackCanvas.toDataURL('image/png');
            // embed raster image into outPdf via jsPDF fallback (use PDF-lib image embedding)
            const pngImage = await outPdf.embedPng(imgData);
            const slot = calculateSlotDimensions(width, height, 1)[0];
            const drawWidth = slot.width;
            const drawHeight = slot.height;
            const x = slot.x;
            const y = height - (slot.y + drawHeight);
            outPage.drawImage(pngImage, { x, y, width: drawWidth, height: drawHeight });
          }
        }
      }

      const pdfBytes = await outPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const totalPages = Math.ceil(selectedFiles.length / pdfsPerPage);
      const filename = `merged-${paperSize}-${layout}-${pdfsPerPage}per-${totalPages}pages-${timestamp}.pdf`;
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);

    } else {
      // Fallback to raster approach with jsPDF if PDF-LIB is not available
      const { jsPDF } = window.jspdf;
      const orientation = width > height ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation: orientation, unit: "pt", format: [width, height] });

      let isFirstPage = true;
      for (let i = 0; i < selectedFiles.length; i += pdfsPerPage) {
        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;

        const pageFiles = selectedFiles.slice(i, i + pdfsPerPage);
        const pageCanvas = await createPageCanvas(pageFiles, width, height, pdfsPerPage);
        const imageData = pageCanvas.toDataURL("image/png");
        pdf.addImage(imageData, "PNG", 0, 0, width, height);
      }

      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const totalPages = Math.ceil(selectedFiles.length / pdfsPerPage);
      const filename = `merged-${paperSize}-${layout}-${pdfsPerPage}per-${totalPages}pages-${timestamp}.pdf`;
      pdf.save(filename);
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const totalPages = Math.ceil(selectedFiles.length / pdfsPerPage);
    const filename = `merged-${paperSize}-${layout}-${pdfsPerPage}per-${totalPages}pages-${timestamp}.pdf`;

    // Download PDF
    pdf.save(filename);

    showSuccess(`PDF successfully created with ${totalPages} page(s) and downloaded!`);
  } catch (error) {
    console.error("Error merging PDFs:", error);
    showError("An error occurred: " + error.message);
  } finally {
    DOM.loadingIndicator.classList.add("d-none");
    DOM.mergeButton.disabled = false;
  }
}