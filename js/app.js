/**
 * Main Application Entry Point
 * Initializes the OnePagePDF application
 */

import { initializeEventListeners } from './eventListeners.js';
import { showPlaceholder } from './ui.js';

/**
 * Application Initialization
 */
document.addEventListener("DOMContentLoaded", function() {
  initializeEventListeners();
  showPlaceholder();
});