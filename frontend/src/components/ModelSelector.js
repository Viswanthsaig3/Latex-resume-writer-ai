import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ModelSelector.css';

// Updated Fallback models with the new GPT-4.1 family
const FALLBACK_MODELS = [
  {
    id: "deepseek-chat",
    name: "DeepSeek Chat (Free)",
    provider: "openrouter",
    description: "Powerful open-source chat model"
  },
  {
    id: "qwen3",
    name: "Qwen 3 (Free)",
    provider: "openrouter",
    description: "High-performance 23.5B parameter model"
  },
  {
    id: "gpt-4.1",
    name: "GPT-4.1",
    provider: "openai",
    description: "OpenAI's latest model"
  },
  {
    id: "gpt-4.1-mini",
    name: "GPT-4.1 Mini",
    provider: "openai",
    description: "Balanced version of GPT-4.1"
  },
  {
    id: "gpt-4.1-nano",
    name: "GPT-4.1 Nano",
    provider: "openai",
    description: "Lightweight GPT-4.1 variant"
  }
];

function ModelSelector({ selectedModel, onModelChange, darkMode }) {
  const [models, setModels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch models
  const fetchModelsFromAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await axios.get('http://localhost:5001/ai/models', {
        timeout: 10000
      });
      
      if (response.data && response.data.models && Array.isArray(response.data.models)) {
        const fetchedModels = response.data.models.length > 0 ? response.data.models : FALLBACK_MODELS;
        setModels(fetchedModels);
        handleModelSelection(fetchedModels); // Pass fetched models here
      } else {
        setError('Invalid response format');
        setModels(FALLBACK_MODELS);
        handleModelSelection(FALLBACK_MODELS);
      }
    } catch (err) {
      console.error('Failed to fetch models:', err);
      
      if (err.response) {
        setError(`Server error: ${err.response.status}`);
      } else if (err.request) {
        setError('Cannot connect to server');
      } else {
        setError(`Request failed: ${err.message}`);
      }
      
      setModels(FALLBACK_MODELS);
      handleModelSelection(FALLBACK_MODELS);
    } finally {
      setIsLoading(false);
    }
  };

  // Set a default model when models are loaded
  const handleModelSelection = (availableModels) => {
    if (!availableModels || availableModels.length === 0) return; // Guard against empty list

    if (!selectedModel || !availableModels.some(m => m.id === selectedModel)) {
      // Prioritize OpenRouter free models, then GPT-4o, then others
      const preferredModel = availableModels.find(m => m.id === 'deepseek-chat') ||
                            availableModels.find(m => m.id === 'qwen3') ||
                            availableModels.find(m => m.id === 'gpt-4o') ||
                            availableModels[0]; // Fallback to the first available model

      if (preferredModel) {
        onModelChange(preferredModel.id);
      }
    }
  };

  useEffect(() => {
    fetchModelsFromAPI();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Keep dependency array empty to run only once on mount

  const selectedModelInfo = models.find(model => model.id === selectedModel);
  
  return (
    <div className={`model-selector ${darkMode ? 'dark-mode' : ''}`}>
      <div className="selector-header">
        <label>AI Model:</label>
        {error && (
          <button 
            className="retry-button"
            onClick={fetchModelsFromAPI}
            title="Retry loading models"
          >
            <i className="fa fa-sync-alt"></i>
          </button>
        )}
      </div>
      
      <div className="selector-dropdown">
        <div 
          className="selected-model"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {isLoading ? (
            <span className="loading-text">Loading models...</span>
          ) : selectedModelInfo ? (
            <div className="model-info">
              <div className="model-name">
                {selectedModelInfo.name}
                <div className={`provider-badge ${selectedModelInfo.provider}`}>
                  {selectedModelInfo.provider}
                </div>
              </div>
            </div>
          ) : (
            <span className="no-model">Select a model</span>
          )}
          <i className={`fa fa-chevron-${isDropdownOpen ? 'up' : 'down'}`}></i>
        </div>
        
        {isDropdownOpen && (
          <div className="dropdown-menu">
            {models.map(model => (
              <div 
                key={model.id} 
                className={`dropdown-item ${model.id === selectedModel ? 'selected' : ''}`}
                onClick={() => {
                  onModelChange(model.id);
                  setIsDropdownOpen(false);
                }}
              >
                <div className="model-info">
                  <div className="model-name">
                    {model.name}
                    <div className={`provider-badge ${model.provider}`}>
                      {model.provider}
                    </div>
                  </div>
                  <div className="model-description">{model.description}</div>
                </div>
                {model.id === selectedModel && <i className="fa fa-check"></i>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {error && (
        <div className="error-message">
          <i className="fa fa-exclamation-circle"></i>
          <span>{error}</span>
        </div>
      )}
      
      {selectedModelInfo && !isDropdownOpen && (
        <div className="model-description">
          {selectedModelInfo.description}
        </div>
      )}
    </div>
  );
}

export default ModelSelector;
