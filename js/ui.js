/**
 * UI Management Functions
 * Handles all user interface updates and interactions
 */

import { DOM, selectedFiles, updateSelectedFiles } from './constants.js';
import { formatFileSize, getPdfsPerPage } from './utils.js';
import { generatePreview } from './preview.js';

// Drag and drop state
let draggedIndex = null;

/**
 * Message Display Functions
 */
export function showError(message) {
  DOM.errorMessage.textContent = message;
  DOM.errorMessage.classList.remove("d-none");
  DOM.successMessage.classList.add("d-none");
  setTimeout(() => {
    DOM.errorMessage.classList.add("d-none");
  }, 5000);
}

export function showSuccess(message) {
  DOM.successMessage.textContent = message;
  DOM.successMessage.classList.remove("d-none");
  DOM.errorMessage.classList.add("d-none");
  setTimeout(() => {
    DOM.successMessage.classList.add("d-none");
  }, 3000);
}

/**
 * Preview Display Functions
 */
export function showPlaceholder() {
  DOM.previewPlaceholder.classList.remove("d-none");
  DOM.previewLoading.classList.add("d-none");
  DOM.previewCanvas.classList.add("d-none");
  // Reset navigation
  DOM.prevPage.disabled = true;
  DOM.nextPage.disabled = true;
  DOM.pageInfo.textContent = "No pages";
}

export function showPreviewLoading() {
  DOM.previewPlaceholder.classList.add("d-none");
  DOM.previewLoading.classList.remove("d-none");
  DOM.previewCanvas.classList.add("d-none");
}

export function showPreview() {
  DOM.previewPlaceholder.classList.add("d-none");
  DOM.previewLoading.classList.add("d-none");
  DOM.previewCanvas.classList.remove("d-none");
}

/**
 * Drag and Drop Event Handlers
 */
function handleDragStart(e, index) {
  draggedIndex = index;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/html', e.target.outerHTML);
  e.target.style.opacity = '0.5';
  e.target.classList.add('dragging');
}

function handleDragEnd(e) {
  e.target.style.opacity = '1';
  e.target.classList.remove('dragging');
  draggedIndex = null;
  
  // Remove drag-over class from all items
  document.querySelectorAll('.file-item').forEach(item => {
    item.classList.remove('drag-over');
  });
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  return false;
}

function handleDragEnter(e) {
  e.preventDefault();
  e.target.closest('.file-item').classList.add('drag-over');
}

function handleDragLeave(e) {
  e.preventDefault();
  const rect = e.target.getBoundingClientRect();
  const x = e.clientX;
  const y = e.clientY;
  
  // Only remove drag-over if mouse is actually outside the element
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
    e.target.closest('.file-item').classList.remove('drag-over');
  }
}

function handleDrop(e, dropIndex) {
  e.preventDefault();
  e.stopPropagation();
  
  if (draggedIndex === null || draggedIndex === dropIndex) {
    return false;
  }
  
  // Reorder the files array
  const newFiles = [...selectedFiles];
  const draggedFile = newFiles[draggedIndex];
  
  // Remove the dragged file from its original position
  newFiles.splice(draggedIndex, 1);
  
  // Insert it at the new position
  // Adjust the drop index if we removed an item before it
  const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
  newFiles.splice(adjustedDropIndex, 0, draggedFile);
  
  // Update the files array
  updateSelectedFiles(newFiles);
  
  // Update UI
  updateFileList();
  
  // Regenerate preview with new order
  if (selectedFiles.length >= 1) {
    generatePreview();
  }
  
  return false;
}

/**
 * File List Management
 */
export function updateFileList() {
  DOM.fileList.innerHTML = "";

  // Show/hide reorder instructions
  if (selectedFiles.length > 1) {
    DOM.reorderInstructions.classList.remove("d-none");
  } else {
    DOM.reorderInstructions.classList.add("d-none");
  }

  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item p-3 mb-2";
    fileItem.draggable = true;
    fileItem.dataset.index = index;
    
    fileItem.innerHTML = `
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <div class="drag-handle me-2" title="Drag to reorder">
            <i class="bi bi-grip-vertical text-muted"></i>
          </div>
          <div class="file-order-number me-2">
            <span class="badge bg-primary">${index + 1}</span>
          </div>
          <i class="bi bi-file-earmark-pdf text-danger fs-4 me-3"></i>
          <div>
            <div class="fw-semibold">${file.name}</div>
            <small class="text-muted">${formatFileSize(file.size)}</small>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm" onclick="window.removeFile(${index})">
          <i class="bi bi-trash"></i> Remove
        </button>
      </div>
    `;
    
    // Add drag and drop event listeners
    fileItem.addEventListener('dragstart', (e) => handleDragStart(e, index));
    fileItem.addEventListener('dragend', handleDragEnd);
    fileItem.addEventListener('dragover', handleDragOver);
    fileItem.addEventListener('dragenter', handleDragEnter);
    fileItem.addEventListener('dragleave', handleDragLeave);
    fileItem.addEventListener('drop', (e) => handleDrop(e, index));
    
    DOM.fileList.appendChild(fileItem);
  });
}

export function updateMergeButton() {
  DOM.mergeButton.disabled = selectedFiles.length < 2;
}

/**
 * File Management Functions
 */
export function removeFile(index) {
  const newFiles = [...selectedFiles];
  newFiles.splice(index, 1);
  updateSelectedFiles(newFiles);
  
  updateFileList();
  updateMergeButton();
  
  if (selectedFiles.length >= 1) {
    generatePreview();
  } else {
    showPlaceholder();
  }
}

// Make removeFile function globally accessible for inline onclick handlers
window.removeFile = removeFile;