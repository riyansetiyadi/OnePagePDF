/**
 * Constants and Configuration
 * Contains all application constants and configuration values
 */

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Paper size definitions in points (1 point = 1/72 inch)
export const PAPER_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
  a3: { width: 841.89, height: 1190.55 }
};

// Rendering / export tuning
// TARGET_DPI: pixels per inch to use when creating canvas for export (72 points = 1 inch)
// Increase toward 300 for high-quality/print; higher values increase memory usage.
export const TARGET_DPI = 150;
// MAX_RENDER_SCALE: safety cap for pdf.js page render scale to avoid runaway memory usage
export const MAX_RENDER_SCALE = 4;

// Global variables
export let selectedFiles = [];
export let currentPreviewCanvas = null;
export let allPreviewCanvases = [];
export let currentPreviewPage = 0;

// DOM elements
export const DOM = {
  fileInput: document.getElementById("fileInput"),
  fileList: document.getElementById("fileList"),
  mergeButton: document.getElementById("mergeButton"),
  loadingIndicator: document.getElementById("loadingIndicator"),
  errorMessage: document.getElementById("errorMessage"),
  successMessage: document.getElementById("successMessage"),
  previewContent: document.getElementById("previewContent"),
  previewPlaceholder: document.getElementById("previewPlaceholder"),
  previewLoading: document.getElementById("previewLoading"),
  previewCanvas: document.getElementById("previewCanvas"),
  uploadArea: document.querySelector(".upload-area"),
  paperSizeSelect: document.getElementById("paperSize"),
  customPdfsInput: document.getElementById("customPdfsInput"),
  prevPage: document.getElementById("prevPage"),
  nextPage: document.getElementById("nextPage"),
  pageInfo: document.getElementById("pageInfo"),
  reorderInstructions: document.getElementById("reorderInstructions")
};

// Update selectedFiles
export function updateSelectedFiles(files) {
  selectedFiles = files;
}

// Update currentPreviewCanvas
export function updateCurrentPreviewCanvas(canvas) {
  currentPreviewCanvas = canvas;
}

// Update allPreviewCanvases
export function updateAllPreviewCanvases(canvases) {
  allPreviewCanvases = canvases;
}

// Update currentPreviewPage
export function updateCurrentPreviewPage(page) {
  currentPreviewPage = page;
}