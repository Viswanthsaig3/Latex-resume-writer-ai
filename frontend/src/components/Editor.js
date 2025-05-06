import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import '../styles/Editor.css';

function Editor({ value, onChange, darkMode }) {
  const handleEditorChange = (value) => {
    onChange(value);
  };
  
  const editorOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    wordWrap: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    renderLineHighlight: 'all',
    lineNumbers: 'on',
    rulers: [80],
    bracketPairColorization: { enabled: true },
    formatOnPaste: true,
    formatOnType: true,
    suggestOnTriggerCharacters: true,
    tabSize: 2,
    autoIndent: 'full',
    renderWhitespace: 'selection',
    snippetSuggestions: 'inline',
    scrollbar: {
      vertical: 'visible',
      horizontal: 'visible',
      useShadows: true,
      verticalHasArrows: true,
      horizontalHasArrows: true,
    }
  };

  return (
    <div className={`editor-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <div className="editor-header">
        <div className="editor-title">LaTeX Source</div>
        <div className="editor-controls">
          <button className="editor-control-btn" title="Format Code">
            <i className="fa fa-indent"></i>
          </button>
          <button className="editor-control-btn" title="Search">
            <i className="fa fa-search"></i>
          </button>
          <button className="editor-control-btn" title="Settings">
            <i className="fa fa-cog"></i>
          </button>
        </div>
      </div>
      
      <MonacoEditor
        height="100%"
        defaultLanguage="latex"
        value={value}
        onChange={handleEditorChange}
        theme={darkMode ? 'vs-dark' : 'vs-light'}
        options={editorOptions}
        className="monaco-editor-container"
      />
      
      <div className="editor-footer">
        <div className="editor-status">
          <span className="editor-language">LaTeX</span>
        </div>
      </div>
    </div>
  );
}

export default Editor;
