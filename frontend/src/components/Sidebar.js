import React, { useState } from 'react';
import '../styles/Sidebar.css';

function Sidebar({ activeTemplate, onTemplateChange, templates }) {
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      setErrorMessage('Please enter a template name');
      return;
    }

    // Switch to blank template but with user's given name as context
    onTemplateChange('blank', newTemplateName);
    setShowNewTemplateDialog(false);
    setNewTemplateName('');
    setErrorMessage('');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Templates</h3>
        <button 
          className="new-template-btn" 
          onClick={() => setShowNewTemplateDialog(true)}
          title="Create a new template"
        >
          <i className="fa fa-plus"></i> New
        </button>
      </div>
      <div className="template-list">
        {Object.entries(templates).map(([id, template]) => (
          <div 
            key={id} 
            className={`template-item ${activeTemplate === id ? 'active' : ''}`}
            onClick={() => onTemplateChange(id)}
          >
            <h4>{template.name}</h4>
            <p>{template.description}</p>
          </div>
        ))}
      </div>
      
      {showNewTemplateDialog && (
        <div className="template-dialog-overlay">
          <div className="template-dialog">
            <h4>Create New Resume</h4>
            <p>Start with a blank template that you can customize</p>
            
            <div className="input-group">
              <label htmlFor="template-name">Resume Name:</label>
              <input 
                id="template-name"
                type="text" 
                value={newTemplateName} 
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="My Custom Resume"
              />
              {errorMessage && <div className="error-text">{errorMessage}</div>}
            </div>
            
            <div className="dialog-buttons">
              <button 
                className="cancel-btn"
                onClick={() => {
                  setShowNewTemplateDialog(false);
                  setNewTemplateName('');
                  setErrorMessage('');
                }}
              >
                Cancel
              </button>
              <button 
                className="create-btn"
                onClick={handleCreateTemplate}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="sidebar-footer">
        <a href="https://github.com/username/latex-resume-writer" target="_blank" rel="noopener noreferrer">
          <i className="fa fa-github"></i> View on GitHub
        </a>
      </div>
    </div>
  );
}

export default Sidebar;
