/**
 * Event Listeners Setup
 * Initializes all event listeners for the application
 */

import { DOM } from './constants.js';
import { handleFileSelect, handleDragOver, handleDragLeave, handleDrop } from './fileHandlers.js';
import { handleMergeClick } from './pdfMerger.js';
import { generatePreview, goToPreviousPage, goToNextPage } from './preview.js';
import { selectedFiles } from './constants.js';

/**
 * Initialize All Event Listeners
 */
export function initializeEventListeners() {
  // File selection
  DOM.fileInput.addEventListener("change", handleFileSelect);

  // Layout change events
  document.querySelectorAll('input[name="layout"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (selectedFiles.length >= 1) {
        generatePreview();
      }
    });
  });

  // Paper size change
  DOM.paperSizeSelect.addEventListener('change', () => {
    if (selectedFiles.length >= 1) {
      generatePreview();
    }
  });

  // PDFs per page change events
  document.querySelectorAll('input[name="pdfsPerPage"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (selectedFiles.length >= 1) {
        generatePreview();
      }
    });
  });

  // Custom PDFs input change
  DOM.customPdfsInput.addEventListener('input', () => {
    const customRadio = document.getElementById('customPdfs');
    if (customRadio.checked && selectedFiles.length >= 1) {
      generatePreview();
    }
  });

  // Custom PDFs input focus - auto select custom radio
  DOM.customPdfsInput.addEventListener('focus', () => {
    const customRadio = document.getElementById('customPdfs');
    customRadio.checked = true;
    if (selectedFiles.length >= 1) {
      generatePreview();
    }
  });

  // Preview navigation
  DOM.prevPage.addEventListener('click', goToPreviousPage);
  DOM.nextPage.addEventListener('click', goToNextPage);

  // Drag and drop events
  DOM.uploadArea.addEventListener("dragover", handleDragOver);
  DOM.uploadArea.addEventListener("dragleave", handleDragLeave);
  DOM.uploadArea.addEventListener("drop", handleDrop);

  // Merge button click
  DOM.mergeButton.addEventListener("click", handleMergeClick);
}