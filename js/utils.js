/**
 * Utility Functions
 * Contains helper functions used throughout the application
 */

import { PAPER_SIZES, DOM } from './constants.js';

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get selected layout from radio buttons
 */
export function getSelectedLayout() {
  return document.querySelector('input[name="layout"]:checked').value;
}

/**
 * Get selected paper size from dropdown
 */
export function getSelectedPaperSize() {
  return DOM.paperSizeSelect.value;
}

/**
 * Get selected PDFs per page from radio buttons or custom input
 */
export function getPdfsPerPage() {
  const selected = document.querySelector('input[name="pdfsPerPage"]:checked');
  if (selected && selected.value === 'custom') {
    const customInput = document.getElementById('customPdfsInput');
    const customValue = parseInt(customInput.value);
    return (customValue >= 1 && customValue <= 20) ? customValue : 8;
  }
  return selected ? parseInt(selected.value) : 2;
}

/**
 * Get paper dimensions based on size and layout
 */
export function getPaperDimensions(paperSize, layout) {
  const size = PAPER_SIZES[paperSize];
  if (layout === "horizontal") {
    // For horizontal layout, prefer landscape orientation
    return {
      width: Math.max(size.width, size.height),
      height: Math.min(size.width, size.height)
    };
  } else {
    // For vertical layout, prefer portrait orientation
    return {
      width: Math.min(size.width, size.height),
      height: Math.max(size.width, size.height)
    };
  }
}

/**
 * Calculate slot dimensions for PDF placement based on PDFs per page
 */
export function calculateSlotDimensions(paperWidth, paperHeight, pdfsPerPage, margin = 20, gap = 10) {
  const availableWidth = paperWidth - (2 * margin);
  const availableHeight = paperHeight - (2 * margin);
  const slots = [];

  // Calculate grid dimensions based on PDFs per page
  let cols, rows;
  
  if (pdfsPerPage <= 1) {
    cols = 1; rows = 1;
  } else if (pdfsPerPage <= 2) {
    cols = 2; rows = 1;
  } else if (pdfsPerPage <= 4) {
    cols = 2; rows = 2;
  } else if (pdfsPerPage <= 6) {
    cols = 3; rows = 2;
  } else if (pdfsPerPage <= 9) {
    cols = 3; rows = 3;
  } else if (pdfsPerPage <= 12) {
    cols = 4; rows = 3;
  } else if (pdfsPerPage <= 16) {
    cols = 4; rows = 4;
  } else {
    cols = 5; rows = 4;
  }

  // Calculate slot dimensions
  const slotWidth = (availableWidth - (gap * (cols - 1))) / cols;
  const slotHeight = (availableHeight - (gap * (rows - 1))) / rows;

  // Generate slot positions
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (slots.length >= pdfsPerPage) break;
      
      const x = margin + (col * (slotWidth + gap));
      const y = margin + (row * (slotHeight + gap));
      
      slots.push({
        x: x,
        y: y,
        width: slotWidth,
        height: slotHeight
      });
    }
    if (slots.length >= pdfsPerPage) break;
  }

  return slots;
}