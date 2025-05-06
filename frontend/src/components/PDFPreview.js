import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import '../styles/PDFPreview.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

function PDFPreview({ pdfUrl, isCompiling, darkMode }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [rotation, setRotation] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const previewContainerRef = React.useRef(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const getFileUrl = () => {
    const baseUrl = 'http://localhost:5001';
    if (pdfUrl && pdfUrl.startsWith('/')) {
      return `${baseUrl}${pdfUrl}`;
    }
    return pdfUrl;
  };
  
  const toggleFullscreen = () => {
    if (isFullscreen) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    } else {
      const element = previewContainerRef.current;
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
    }
  };
  
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  
  const handlePrevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const handleNextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  return (
    <div className={`pdf-preview-wrapper ${darkMode ? 'dark-mode' : ''}`} ref={previewContainerRef}>
      <div className="preview-header">
        <div className="preview-title">PDF Preview</div>
        <div className="preview-controls">
          <button 
            className="preview-control-btn" 
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            title="Zoom Out"
          >
            <i className="fa fa-search-minus"></i>
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button 
            className="preview-control-btn" 
            onClick={handleZoomIn}
            disabled={scale >= 3}
            title="Zoom In"
          >
            <i className="fa fa-search-plus"></i>
          </button>
          <button 
            className="preview-control-btn"
            onClick={handleRotate}
            title="Rotate"
          >
            <i className="fa fa-redo"></i>
          </button>
          <button 
            className="preview-control-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <i className={`fa fa-${isFullscreen ? 'compress' : 'expand'}`}></i>
          </button>
        </div>
      </div>
      
      <div className="preview-content">
        {isCompiling ? (
          <div className="loading-container">
            <div className="spinner large"></div>
            <p>Compiling LaTeX...</p>
          </div>
        ) : pdfUrl ? (
          <>
            <div className="document-container">
              <Document
                file={getFileUrl()}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading PDF...</p>
                  </div>
                }
                error={
                  <div className="error-message">
                    <i className="fa fa-exclamation-triangle"></i>
                    <p>Failed to load PDF</p>
                  </div>
                }
              >
                <Page 
                  pageNumber={pageNumber} 
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  scale={scale}
                  rotate={rotation}
                  className={darkMode ? 'dark-page' : ''}
                />
              </Document>
            </div>
            
            <div className="page-navigation">
              <button 
                onClick={handlePrevPage}
                disabled={pageNumber <= 1}
                className="nav-btn"
                title="Previous Page"
              >
                <i className="fa fa-arrow-left"></i>
              </button>
              <span className="page-indicator">
                Page {pageNumber} of {numPages || '--'}
              </span>
              <button 
                onClick={handleNextPage}
                disabled={pageNumber >= numPages}
                className="nav-btn"
                title="Next Page"
              >
                <i className="fa fa-arrow-right"></i>
              </button>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <i className="fa fa-file-pdf fa-3x"></i>
            <p>No PDF preview available yet</p>
            <p className="hint">Start editing your LaTeX code to generate a preview</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PDFPreview;
