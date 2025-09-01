/**
 * PDF Merge and Download Functions
 * Handles the main PDF merging functionality
 */

import { DOM, selectedFiles } from './constants.js';
import { getSelectedLayout, getSelectedPaperSize, getPaperDimensions, getPdfsPerPage } from './utils.js';
import { showError, showSuccess } from './ui.js';
import { createPageCanvas } from './pdfRenderer.js';

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

    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const orientation = width > height ? "landscape" : "portrait";
    const pdf = new jsPDF({
      orientation: orientation,
      unit: "pt",
      format: [width, height]
    });

    // Process files in groups based on PDFs per page setting
    let isFirstPage = true;
    for (let i = 0; i < selectedFiles.length; i += pdfsPerPage) {
      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      const pageFiles = selectedFiles.slice(i, i + pdfsPerPage);
      const pageCanvas = await createPageCanvas(pageFiles, width, height, pdfsPerPage);
      
      // Convert canvas to image and add to PDF
      const imageData = pageCanvas.toDataURL("image/jpeg", 0.95);
      pdf.addImage(imageData, "JPEG", 0, 0, width, height);
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