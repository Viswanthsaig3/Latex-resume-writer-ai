import React from 'react';
import MonacoEditor from '@monaco-editor/react';

function Editor({ value, onChange }) {
  const handleEditorChange = (value) => {
    onChange(value);
  };

  return (
    <div className="h-full">
      <MonacoEditor
        height="100%"
        defaultLanguage="latex"
        value={value}
        onChange={handleEditorChange}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}

export default Editor;
