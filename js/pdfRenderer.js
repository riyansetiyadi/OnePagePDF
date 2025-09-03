/**
 * PDF Rendering Functions
 * Handles PDF rendering and canvas operations
 */

import { calculateSlotDimensions } from './utils.js';
import { TARGET_DPI, MAX_RENDER_SCALE } from './constants.js';

/**
 * Render PDF to Canvas
 */
export async function renderPdfToCanvas(file, maxWidth, maxHeight) {
  // maxWidth and maxHeight are expected in pixels
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const page = await pdf.getPage(1); // Get first page

  // Calculate scale to fit within max dimensions while maintaining aspect ratio
  const viewport = page.getViewport({ scale: 1 });
  const scaleX = maxWidth / viewport.width;
  const scaleY = maxHeight / viewport.height;
  let scale = Math.min(scaleX, scaleY);

  // Allow higher scales for better quality but cap to avoid OOM
  scale = Math.min(scale, MAX_RENDER_SCALE);

  const scaledViewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = Math.round(scaledViewport.width);
  canvas.height = Math.round(scaledViewport.height);

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
  
  // Convert points to pixels for canvas using TARGET_DPI (points are 1/72 in)
  const pixelRatio = TARGET_DPI / 72;
  canvas.width = Math.round(paperWidth * pixelRatio);
  canvas.height = Math.round(paperHeight * pixelRatio);

  // Fill with white background
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate slot dimensions in points
  const slots = calculateSlotDimensions(paperWidth, paperHeight, pdfsPerPage);
  
  // Render PDFs based on pdfsPerPage setting
  const filesToRender = files.slice(0, pdfsPerPage);

  for (let i = 0; i < filesToRender.length && i < slots.length; i++) {
    const slot = slots[i];
    const maxWidth = Math.round(slot.width * pixelRatio);
    const maxHeight = Math.round(slot.height * pixelRatio);

    try {
      const pdfCanvas = await renderPdfToCanvas(filesToRender[i], maxWidth, maxHeight);
      
      // Calculate position to center the PDF in the slot
      const x = Math.round((slot.x * pixelRatio) + (maxWidth - pdfCanvas.width) / 2);
      const y = Math.round((slot.y * pixelRatio) + (maxHeight - pdfCanvas.height) / 2);
      
      context.drawImage(pdfCanvas, x, y);
    } catch (error) {
      console.error(`Error rendering PDF ${i}:`, error);
    }
  }

  return canvas;
}