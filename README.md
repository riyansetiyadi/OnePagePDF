# OnePagePDF - Modular Structure

## Overview
OnePagePDF is a web application that allows users to merge multiple PDF files into a single page layout. The application has been refactored into a modular structure for better organization and maintainability.

## File Structure

```
OnePagePDF/
├── index.html              # Main HTML file
├── styles.css              # CSS styles
├── script.js               # Original monolithic script (deprecated)
├── js/                     # Modular JavaScript files
│   ├── app.js              # Main application entry point
│   ├── constants.js        # Constants and configuration
│   ├── utils.js            # Utility functions
│   ├── ui.js               # UI management functions
│   ├── fileHandlers.js     # File handling and drag & drop
│   ├── pdfRenderer.js      # PDF rendering functions
│   ├── preview.js          # Preview generation
│   ├── pdfMerger.js        # PDF merging functionality
│   └── eventListeners.js   # Event listener setup
└── README.md               # This file
```

## Module Descriptions

### `js/app.js`
- Main application entry point
- Initializes the application when DOM is loaded
- Sets up initial UI state

### `js/constants.js`
- Contains all application constants
- Paper size definitions
- Global variables (selectedFiles, currentPreviewCanvas)
- DOM element references
- PDF.js worker configuration

### `js/utils.js`
- Utility functions used throughout the application
- File size formatting
- Layout and paper size getters
- Paper dimension calculations
- Slot dimension calculations for PDF placement

### `js/ui.js`
- UI management and updates
- Message display functions (error/success)
- Preview state management
- File list updates
- File removal functionality

### `js/fileHandlers.js`
- File selection handling
- Drag and drop functionality
- File validation and addition
- Upload area interactions

### `js/pdfRenderer.js`
- PDF rendering to canvas
- Page canvas creation
- PDF-to-image conversion
- Layout positioning logic

### `js/preview.js`
- Preview generation
- Canvas display management
- Error handling for preview

### `js/pdfMerger.js`
- Main PDF merging functionality
- jsPDF integration
- Multi-page PDF creation
- Download handling

### `js/eventListeners.js`
- Event listener initialization
- Binds all UI interactions
- Layout and paper size change handlers

## Benefits of Modular Structure

1. **Better Organization**: Each module has a specific responsibility
2. **Easier Maintenance**: Changes can be made to specific modules without affecting others
3. **Improved Readability**: Smaller, focused files are easier to understand
4. **Reusability**: Modules can be reused or extended more easily
5. **Testing**: Individual modules can be tested in isolation
6. **Collaboration**: Multiple developers can work on different modules simultaneously

## Usage

The application now uses ES6 modules. The main entry point is `js/app.js` which is loaded as a module in the HTML file:

```html
<script type="module" src="js/app.js"></script>
```

All modules use import/export statements to share functionality between files.

## Migration Notes

- The original `script.js` file has been split into multiple modules
- All functionality remains the same from a user perspective
- The application now uses modern ES6 module syntax
- Global functions like `removeFile` are still accessible via `window` object where needed for inline event handlers

## Development

To add new features:
1. Identify the appropriate module for your changes
2. Add new functions to the relevant module
3. Export functions that need to be used by other modules
4. Import required dependencies at the top of each module
5. Update the main `app.js` if initialization changes are needed