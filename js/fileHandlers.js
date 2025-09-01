/**
 * File Handling Functions
 * Manages file selection, drag & drop, and file operations
 */

import { DOM, selectedFiles, updateSelectedFiles } from './constants.js';
import { updateFileList, updateMergeButton, showPlaceholder } from './ui.js';
import { generatePreview } from './preview.js';

/**
 * File Selection Handlers
 */
export function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addFiles(files);
}

export function handleDragOver(e) {
  e.preventDefault();
  DOM.uploadArea.style.borderColor = "#764ba2";
}

export function handleDragLeave(e) {
  e.preventDefault();
  DOM.uploadArea.style.borderColor = "#667eea";
}

export function handleDrop(e) {
  e.preventDefault();
  DOM.uploadArea.style.borderColor = "#667eea";

  const files = Array.from(e.dataTransfer.files).filter(
    (file) => file.type === "application/pdf"
  );
  
  if (files.length > 0) {
    addFiles(files);
  }
}

/**
 * File Management Functions
 */
export function addFiles(files) {
  const newFiles = [...selectedFiles];
  
  files.forEach((file) => {
    if (file.type === "application/pdf") {
      newFiles.push(file);
    }
  });

  updateSelectedFiles(newFiles);
  updateFileList();
  updateMergeButton();
  
  // Generate preview immediately if we have files
  if (selectedFiles.length >= 1) {
    generatePreview();
  } else {
    showPlaceholder();
  }
}