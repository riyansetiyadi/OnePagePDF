/**
 * PDF Rendering Functions
 * Handles PDF rendering and canvas operations
 */

import { calculateSlotDimensions } from './utils.js';

/**
 * Render PDF to Canvas
 */
export async function renderPdfToCanvas(file, maxWidth, maxHeight) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1); // Get first page

  // Calculate scale to fit within max dimensions while maintaining aspect ratio
  const viewport = page.getViewport({ scale: 1 });
  const scaleX = maxWidth / viewport.width;
  const scaleY = maxHeight / viewport.height;
  const scale = Math.min(scaleX, scaleY, 2); // Cap at 2x for quality

  const scaledViewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  // Fill canvas with white background
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Render PDF page to canvas
  await page.render({
    canvasContext: context,
    viewport: scaledViewport,
  }).promise;

  return canvas;
}

/**
 * Create Page Canvas with Multiple PDFs
 */
export async function createPageCanvas(files, paperWidth, paperHeight, pdfsPerPage) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  
  // Convert points to pixels for canvas (assuming 96 DPI)
  const pixelRatio = 96 / 72;
  canvas.width = paperWidth * pixelRatio;
  canvas.height = paperHeight * pixelRatio;

  // Fill with white background
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate slot dimensions in points
  const slots = calculateSlotDimensions(paperWidth, paperHeight, pdfsPerPage);
  
  // Render PDFs based on pdfsPerPage setting
  const filesToRender = files.slice(0, pdfsPerPage);

  for (let i = 0; i < filesToRender.length && i < slots.length; i++) {
    const slot = slots[i];
    const maxWidth = slot.width * pixelRatio;
    const maxHeight = slot.height * pixelRatio;

    try {
      const pdfCanvas = await renderPdfToCanvas(filesToRender[i], maxWidth, maxHeight);
      
      // Calculate position to center the PDF in the slot
      const x = (slot.x * pixelRatio) + (maxWidth - pdfCanvas.width) / 2;
      const y = (slot.y * pixelRatio) + (maxHeight - pdfCanvas.height) / 2;
      
      context.drawImage(pdfCanvas, x, y);
    } catch (error) {
      console.error(`Error rendering PDF ${i}:`, error);
    }
  }

  return canvas;
}