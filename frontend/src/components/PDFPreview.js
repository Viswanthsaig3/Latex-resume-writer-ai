import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PDFPreview({ pdfUrl, isCompiling }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  // Update API URL handling to ensure it works properly
  const getFileUrl = () => {
    // Hard-code the base URL
    const baseUrl = 'http://localhost:5001';
    console.log('PDF URL:', `${baseUrl}${pdfUrl}`);
    if (pdfUrl && pdfUrl.startsWith('/')) {
      return `${baseUrl}${pdfUrl}`;
    }
    return pdfUrl;
  };

  return (
    <div className="h-full flex flex-col items-center p-4 bg-gray-50 overflow-auto">
      {isCompiling ? (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3">Compiling your LaTeX...</span>
        </div>
      ) : pdfUrl ? (
        <>
          <div className="flex justify-between w-full mb-4">
            <button 
              onClick={() => setPageNumber(Math.max(pageNumber - 1, 1))}
              disabled={pageNumber <= 1}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Previous
            </button>
            <p className="text-center">
              Page {pageNumber} of {numPages || '--'}
            </p>
            <button 
              onClick={() => setPageNumber(Math.min(pageNumber + 1, numPages || 1))}
              disabled={pageNumber >= numPages}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
          <div className="shadow-lg">
            <Document
              file={getFileUrl()}
              onLoadSuccess={onDocumentLoadSuccess}
              renderMode="canvas"
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                scale={1.2}
              />
            </Document>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          No PDF preview available. Start typing to generate a preview.
        </div>
      )}
    </div>
  );
}

export default PDFPreview;
