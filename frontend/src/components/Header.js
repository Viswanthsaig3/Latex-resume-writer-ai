import React from 'react';
import '../styles/Header.css';

function Header({ 
  onSave, 
  isCompiling, 
  onToggleAI, 
  showAIAssistant, 
  onToggleSidebar,
  showSidebar,
  onToggleDarkMode,
  isDarkMode,
  onToggleView,
  isSplitView,
  onCompile // Add new prop
}) {
  return (
    <header className={`app-header ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="header-left">
        <button 
          className="icon-button sidebar-toggle"
          onClick={onToggleSidebar}
          title={showSidebar ? "Hide templates" : "Show templates"}
        >
          <i className={`fa fa-${showSidebar ? 'times' : 'bars'}`}></i>
        </button>
        <h1>LaTeX Resume Editor</h1>
      </div>
      
      <div className="header-center">
        {isCompiling && (
          <div className="compiling-indicator">
            <div className="spinner"></div>
            <span>Compiling...</span>
          </div>
        )}
        
        {/* Add compile button */}
        <button 
          className="tool-button compile-btn"
          onClick={onCompile}
          disabled={isCompiling}
          title="Compile LaTeX"
        >
          <i className="fa fa-sync"></i>
          <span>Compile Now</span>
        </button>
      </div>
      
      <div className="header-right">
        <button 
          className={`tool-button ${showAIAssistant ? 'active' : ''}`}
          onClick={onToggleAI}
          title={showAIAssistant ? "Hide AI Assistant" : "Show AI Assistant"}
        >
          <i className="fa fa-robot"></i>
          <span>AI Assistant</span>
        </button>
        
        <button 
          className="tool-button"
          onClick={onToggleView}
          title={isSplitView ? "Full View" : "Split View"}
        >
          <i className={`fa fa-${isSplitView ? 'expand' : 'columns'}`}></i>
          <span>{isSplitView ? "Full View" : "Split View"}</span>
        </button>
        
        <button 
          className="tool-button"
          onClick={onToggleDarkMode}
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          <i className={`fa fa-${isDarkMode ? 'sun' : 'moon'}`}></i>
          <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
        </button>
        
        <button 
          className="tool-button"
          onClick={onSave}
          title="Save as .tex file"
        >
          <i className="fa fa-save"></i>
          <span>Save .tex</span>
        </button>
        
        <a 
          className="tool-button download-btn"
          href="http://localhost:5001/download"
          title="Download PDF"
        >
          <i className="fa fa-file-pdf"></i>
          <span>Download PDF</span>
        </a>
      </div>
    </header>
  );
}

export default Header;
