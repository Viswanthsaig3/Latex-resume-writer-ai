import React, { useState, useEffect, useRef } from 'react';
import Editor from './components/Editor';
import PDFPreview from './components/PDFPreview';
import Header from './components/Header';
import AIAssistant from './components/AIAssistant';
import Sidebar from './components/Sidebar';
import templates from './templates';
import { compileLatex } from './services/api';
import debounce from 'lodash.debounce';
import './styles/App.css';

function App() {
  const [activeTemplate, setActiveTemplate] = useState('default');
  const [latexCode, setLatexCode] = useState(templates[activeTemplate]?.template || '');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isSplitView, setIsSplitView] = useState(true);
  const [customTemplateName, setCustomTemplateName] = useState('');
  const appRef = useRef(null);
  
  // Create a debounced compile function
  const debouncedCompile = React.useCallback(
    debounce(async (code) => {
      setIsCompiling(true);
      setError(null);
      try {
        const response = await compileLatex(code);
        setPdfUrl(response.pdfUrl);
      } catch (err) {
        console.error('Compilation error:', err);
        setError(err.response?.data?.error || 'Failed to compile LaTeX');
      } finally {
        setIsCompiling(false);
      }
    }, 1000),
    []
  );

  // Add manual compile function
  const handleCompile = async () => {
    if (!latexCode || !latexCode.trim()) return;
    
    setIsCompiling(true);
    setError(null);
    try {
      const response = await compileLatex(latexCode);
      setPdfUrl(response.pdfUrl);
    } catch (err) {
      console.error('Compilation error:', err);
      setError(err.response?.data?.error || 'Failed to compile LaTeX');
    } finally {
      setIsCompiling(false);
    }
  };

  // Trigger compilation when latex code changes
  useEffect(() => {
    if (latexCode && latexCode.trim()) {
      debouncedCompile(latexCode);
    } else {
      setPdfUrl(null);
      setError(null);
      setIsCompiling(false);
    }
  }, [latexCode, debouncedCompile]);

  // Apply theme based on darkMode setting
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const handleEditorChange = (value) => {
    setLatexCode(value);
  };

  const handleSave = () => {
    const blob = new Blob([latexCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyAIChanges = (newLatexCode) => {
    console.log("App.js: handleApplyAIChanges called with new code (preview):", newLatexCode.substring(0, 100) + "..."); // Log: Received code
    setLatexCode(newLatexCode);
    console.log("App.js: latexCode state updated."); // Log: State updated
  };
  
  // Modified handleTemplateChange to accept a custom name
  const handleTemplateChange = (templateId, customName = '') => {
    if (templates[templateId]) {
      setActiveTemplate(templateId);
      setLatexCode(templates[templateId].template);
      if (customName) {
        setCustomTemplateName(customName);
      } else {
        setCustomTemplateName('');
      }
      setError(null);
      setPdfUrl(null);
    }
  };
  
  // Get template name, with custom name taking precedence
  const activeTemplateName = customTemplateName || templates[activeTemplate]?.name || 'Default';

  const toggleView = () => {
    setIsSplitView(!isSplitView);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`} ref={appRef}>
      <Header 
        onSave={handleSave}
        isCompiling={isCompiling}
        onToggleAI={() => setShowAIAssistant(!showAIAssistant)}
        showAIAssistant={showAIAssistant}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        showSidebar={showSidebar}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        isDarkMode={darkMode}
        onToggleView={toggleView}
        isSplitView={isSplitView}
        onCompile={handleCompile} // Add the new prop
      />
      
      <div className="main-content">
        {showSidebar && (
          <Sidebar 
            activeTemplate={activeTemplate} 
            onTemplateChange={handleTemplateChange}
            templates={templates}
          />
        )}
        
        <div className={`editor-preview-container ${isSplitView ? 'split-view' : 'full-view'}`}>
          {(isSplitView || !pdfUrl) && (
            <div className="editor-container">
              <Editor 
                value={latexCode} 
                onChange={handleEditorChange}
                darkMode={darkMode}
              />
            </div>
          )}
          
          {(isSplitView || (pdfUrl && !isSplitView)) && (
            <div className="preview-container">
              {error ? (
                <div className="error-container">
                  <h3>Compilation Error</h3>
                  <pre>{error}</pre>
                </div>
              ) : (
                <PDFPreview 
                  pdfUrl={pdfUrl} 
                  isCompiling={isCompiling} 
                  darkMode={darkMode}
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      {showAIAssistant && (
        <AIAssistant 
          latexCode={latexCode} 
          onApplyChanges={handleApplyAIChanges}
          darkMode={darkMode} 
          activeTemplateName={activeTemplateName}
        />
      )}
    </div>
  );
}

export default App;
