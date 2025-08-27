/**
 * OnePagePDF Application - Main JavaScript Logic
 * Handles file upload, preview generation, and PDF merging functionality
 */

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Global variables
let selectedFiles = [];
let currentMergedCanvas = null;

// DOM elements
const fileInput = document.getElementById("fileInput");
const fileList = document.getElementById("fileList");
const mergeButton = document.getElementById("mergeButton");
const loadingIndicator = document.getElementById("loadingIndicator");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");
const previewContent = document.getElementById("previewContent");
const previewPlaceholder = document.getElementById("previewPlaceholder");
const previewLoading = document.getElementById("previewLoading");
const previewCanvas = document.getElementById("previewCanvas");
const uploadArea = document.querySelector(".upload-area");

/**
 * Initialize Event Listeners
 */
function initializeEventListeners() {
  // File selection
  fileInput.addEventListener("change", handleFileSelect);

  // Layout change events
  document.querySelectorAll('input[name="layout"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (selectedFiles.length >= 2) {
        generatePreview();
      }
    });
  });

  // Drag and drop events
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleDrop);

  // Merge button click
  mergeButton.addEventListener("click", handleMergeClick);
}

/**
 * File Selection Handlers
 */
function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  addFiles(files);
}

function handleDragOver(e) {
  e.preventDefault();
  uploadArea.style.borderColor = "#764ba2";
}

function handleDragLeave(e) {
  e.preventDefault();
  uploadArea.style.borderColor = "#667eea";
}

function handleDrop(e) {
  e.preventDefault();
  uploadArea.style.borderColor = "#667eea";

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
function addFiles(files) {
  files.forEach((file) => {
    if (file.type === "application/pdf") {
      selectedFiles.push(file);
    }
  });

  updateFileList();
  updateMergeButton();
  
  // Generate preview immediately if we have enough files
  if (selectedFiles.length >= 2) {
    generatePreview();
  } else if (selectedFiles.length === 0) {
    showPlaceholder();
  }
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  updateFileList();
  updateMergeButton();
  
  if (selectedFiles.length >= 2) {
    generatePreview();
  } else {
    showPlaceholder();
  }
}

function updateFileList() {
  fileList.innerHTML = "";

  selectedFiles.forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.className = "file-item p-3 mb-2";
    fileItem.innerHTML = `
      <div class="d-flex align-items-center justify-content-between">
        <div class="d-flex align-items-center">
          <i class="bi bi-file-earmark-pdf text-danger fs-4 me-3"></i>
          <div>
            <div class="fw-semibold">${file.name}</div>
            <small class="text-muted">${formatFileSize(file.size)}</small>
          </div>
        </div>
        <button class="btn btn-outline-danger btn-sm" onclick="removeFile(${index})">
          <i class="bi bi-trash"></i> Remove
        </button>
      </div>
    `;
    fileList.appendChild(fileItem);
  });
}

function updateMergeButton() {
  mergeButton.disabled = selectedFiles.length < 2;
}

/**
 * Utility Functions
 */
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Message Display Functions
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("d-none");
  successMessage.classList.add("d-none");
  setTimeout(() => {
    errorMessage.classList.add("d-none");
  }, 5000);
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.remove("d-none");
  errorMessage.classList.add("d-none");
  setTimeout(() => {
    successMessage.classList.add("d-none");
  }, 3000);
}

/**
 * Preview Display Functions
 */
function showPlaceholder() {
  previewPlaceholder.classList.remove("d-none");
  previewLoading.classList.add("d-none");
  previewCanvas.classList.add("d-none");
  currentMergedCanvas = null;
}

function showPreviewLoading() {
  previewPlaceholder.classList.add("d-none");
  previewLoading.classList.remove("d-none");
  previewCanvas.classList.add("d-none");
}

function showPreview() {
  previewPlaceholder.classList.add("d-none");
  previewLoading.classList.add("d-none");
  previewCanvas.classList.remove("d-none");
}

/**
 * Preview Generation Functions
 */
async function generatePreview() {
  if (selectedFiles.length < 2) {
    showPlaceholder();
    return;
  }

  showPreviewLoading();

  try {
    const layout = document.querySelector('input[name="layout"]:checked').value;
    currentMergedCanvas = await createMergedCanvas(selectedFiles, layout);
    
    // Display preview
    previewCanvas.width = currentMergedCanvas.width;
    previewCanvas.height = currentMergedCanvas.height;
    const previewContext = previewCanvas.getContext("2d");
    previewContext.drawImage(currentMergedCanvas, 0, 0);
    
    showPreview();
  } catch (error) {
    console.error("Error generating preview:", error);
    showError("Failed to generate preview: " + error.message);
    showPlaceholder();
  }
}

/**
 * Canvas Creation and PDF Processing
 */
async function createMergedCanvas(files, layout) {
  // Render each PDF to canvas
  const canvases = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const page = await pdf.getPage(1); // Get first page

    const viewport = page.getViewport({ scale: 2 }); // High quality
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Fill canvas with white background first
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, viewport.width, viewport.height);

    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    canvases.push({
      canvas: canvas,
      width: viewport.width,
      height: viewport.height,
    });
  }

  // Calculate merged canvas dimensions more precisely
  let mergedWidth, mergedHeight;

  if (layout === "horizontal") {
    // For horizontal layout, sum all widths and use the maximum height
    mergedWidth = canvases.reduce((sum, item) => sum + item.width, 0);
    mergedHeight = Math.max(...canvases.map((item) => item.height));
  } else {
    // For vertical layout, use maximum width and sum all heights
    mergedWidth = Math.max(...canvases.map((item) => item.width));
    mergedHeight = canvases.reduce((sum, item) => sum + item.height, 0);
  }

  // Create merged canvas with exact dimensions
  const mergedCanvas = document.createElement("canvas");
  const mergedContext = mergedCanvas.getContext("2d");
  mergedCanvas.width = mergedWidth;
  mergedCanvas.height = mergedHeight;

  // Fill merged canvas with white background
  mergedContext.fillStyle = "#ffffff";
  mergedContext.fillRect(0, 0, mergedWidth, mergedHeight);

  // Draw each canvas onto merged canvas with proper alignment
  let currentX = 0;
  let currentY = 0;

  for (let i = 0; i < canvases.length; i++) {
    const { canvas, width, height } = canvases[i];

    if (layout === "horizontal") {
      // For horizontal layout, align to top and place side by side
      mergedContext.drawImage(canvas, currentX, 0, width, height);
      currentX += width;
    } else {
      // For vertical layout, center horizontally and stack vertically
      const offsetX = (mergedWidth - width) / 2; // Center horizontally
      mergedContext.drawImage(canvas, offsetX, currentY, width, height);
      currentY += height;
    }
  }

  return mergedCanvas;
}

/**
 * PDF Merge and Download Handler
 */
async function handleMergeClick() {
  if (selectedFiles.length < 2) {
    showError("Please select at least 2 PDF files to merge");
    return;
  }

  loadingIndicator.classList.remove("d-none");
  mergeButton.disabled = true;

  try {
    // Use existing merged canvas if available, otherwise create new one
    let mergedCanvas = currentMergedCanvas;
    if (!mergedCanvas) {
      const layout = document.querySelector('input[name="layout"]:checked').value;
      mergedCanvas = await createMergedCanvas(selectedFiles, layout);
    }

    // Convert to PDF using jsPDF
    const { jsPDF } = window.jspdf;

    // Calculate PDF dimensions (convert pixels to points)
    const pdfWidth = mergedCanvas.width * 0.75;
    const pdfHeight = mergedCanvas.height * 0.75;

    const pdf = new jsPDF({
      orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
      unit: "pt",
      format: [pdfWidth, pdfHeight],
    });

    // Convert canvas to image and add to PDF
    const imageData = mergedCanvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(imageData, "JPEG", 0, 0, pdfWidth, pdfHeight);

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `onepage-pdf-${timestamp}.pdf`;

    // Download PDF
    pdf.save(filename);

    showSuccess("PDF successfully merged and downloaded!");
  } catch (error) {
    console.error("Error merging PDFs:", error);
    showError("An error occurred: " + error.message);
  } finally {
    loadingIndicator.classList.add("d-none");
    mergeButton.disabled = false;
  }
}

/**
 * Application Initialization
 */
document.addEventListener("DOMContentLoaded", function() {
  initializeEventListeners();
  showPlaceholder();
});

// Make removeFile function globally accessible for inline onclick handlers
window.removeFile = removeFile;