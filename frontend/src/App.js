import React, { useState, useEffect } from 'react';
import Editor from './components/Editor';
import PDFPreview from './components/PDFPreview';
import Header from './components/Header';
import defaultLatexTemplate from './templates/default';
import { compileLatex } from './services/api';
import debounce from 'lodash.debounce';
import './App.css';

// Fallback styles in case Tailwind doesn't load
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f3f4f6',
  },
  header: {
    backgroundColor: '#1f2937',
    color: 'white',
    padding: '1rem',
  },
  content: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  leftPane: {
    width: '50%',
    height: '100%',
  },
  rightPane: {
    width: '50%',
    height: '100%',
    borderLeft: '1px solid #e5e7eb',
  },
  errorContainer: {
    padding: '1rem',
    color: '#dc2626',
    backgroundColor: '#fee2e2',
  }
};

function App() {
  const [latexCode, setLatexCode] = useState(defaultLatexTemplate);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);

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

  // Trigger compilation when latex code changes
  useEffect(() => {
    debouncedCompile(latexCode);
  }, [latexCode, debouncedCompile]);

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

  return (
    <div className="flex flex-col h-screen bg-gray-100" style={styles.container}>
      <Header onSave={handleSave} isCompiling={isCompiling} />
      <div className="flex flex-1 overflow-hidden" style={styles.content}>
        <div className="w-1/2 h-full" style={styles.leftPane}>
          <Editor 
            value={latexCode} 
            onChange={handleEditorChange} 
          />
        </div>
        <div className="w-1/2 h-full border-l border-gray-300" style={styles.rightPane}>
          {error ? (
            <div className="p-4 text-red-600 bg-red-100" style={styles.errorContainer}>
              <h3 className="font-bold">Compilation Error</h3>
              <pre className="mt-2 whitespace-pre-wrap">{error}</pre>
            </div>
          ) : (
            <PDFPreview pdfUrl={pdfUrl} isCompiling={isCompiling} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
