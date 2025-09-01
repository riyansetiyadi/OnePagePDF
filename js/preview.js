/**
 * Preview Generation Functions
 * Handles preview generation and display for all pages
 */

import { DOM, selectedFiles, updateCurrentPreviewCanvas, updateAllPreviewCanvases, updateCurrentPreviewPage, allPreviewCanvases, currentPreviewPage } from './constants.js';
import { getSelectedLayout, getSelectedPaperSize, getPaperDimensions, getPdfsPerPage } from './utils.js';
import { showPlaceholder, showPreviewLoading, showPreview, showError } from './ui.js';
import { createPageCanvas } from './pdfRenderer.js';

/**
 * Generate Preview of All Pages
 */
export async function generatePreview() {
  if (selectedFiles.length < 1) {
    showPlaceholder();
    updatePageNavigation(0, 0);
    return;
  }

  showPreviewLoading();

  try {
    const layout = getSelectedLayout();
    const paperSize = getSelectedPaperSize();
    const pdfsPerPage = getPdfsPerPage();
    const { width, height } = getPaperDimensions(paperSize, layout);

    // Calculate total pages needed
    const totalPages = Math.ceil(selectedFiles.length / pdfsPerPage);
    const canvases = [];

    // Generate all page canvases
    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const startIndex = pageIndex * pdfsPerPage;
      const pageFiles = selectedFiles.slice(startIndex, startIndex + pdfsPerPage);
      const pageCanvas = await createPageCanvas(pageFiles, width, height, pdfsPerPage);
      canvases.push(pageCanvas);
    }

    // Update global state
    updateAllPreviewCanvases(canvases);
    updateCurrentPreviewPage(0);
    
    // Display first page
    displayPreviewPage(0);
    updatePageNavigation(0, totalPages);
    
    showPreview();
  } catch (error) {
    console.error("Error generating preview:", error);
    showError("Failed to generate preview: " + error.message);
    showPlaceholder();
    updatePageNavigation(0, 0);
  }
}

/**
 * Display specific preview page
 */
export function displayPreviewPage(pageIndex) {
  if (pageIndex < 0 || pageIndex >= allPreviewCanvases.length) return;
  
  const canvas = allPreviewCanvases[pageIndex];
  updateCurrentPreviewCanvas(canvas);
  updateCurrentPreviewPage(pageIndex);
  
  // Display on preview canvas
  DOM.previewCanvas.width = canvas.width;
  DOM.previewCanvas.height = canvas.height;
  const previewContext = DOM.previewCanvas.getContext("2d");
  previewContext.drawImage(canvas, 0, 0);
  
  updatePageNavigation(pageIndex, allPreviewCanvases.length);
}

/**
 * Update page navigation controls
 */
function updatePageNavigation(currentPage, totalPages) {
  if (totalPages <= 1) {
    DOM.prevPage.disabled = true;
    DOM.nextPage.disabled = true;
    DOM.pageInfo.textContent = totalPages === 0 ? "No pages" : "Page 1 of 1";
  } else {
    DOM.prevPage.disabled = currentPage === 0;
    DOM.nextPage.disabled = currentPage === totalPages - 1;
    DOM.pageInfo.textContent = `Page ${currentPage + 1} of ${totalPages}`;
  }
}

/**
 * Navigate to previous page
 */
export function goToPreviousPage() {
  if (currentPreviewPage > 0) {
    displayPreviewPage(currentPreviewPage - 1);
  }
}

/**
 * Navigate to next page
 */
export function goToNextPage() {
  if (currentPreviewPage < allPreviewCanvases.length - 1) {
    displayPreviewPage(currentPreviewPage + 1);
  }
}