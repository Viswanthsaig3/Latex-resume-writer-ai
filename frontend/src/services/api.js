import axios from 'axios';

// Smart API URL detection
const getApiUrl = () => {
  // If an environment variable is set, use that
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // If we're running on the deployed domain, use the deployed backend URL
  if (window.location.hostname === 'latex-resume-writer-ai-1.onrender.com') {
    return 'https://latex-resume-writer-ai-1.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:5001';
};

const API_URL = getApiUrl();

console.log('Using API URL:', API_URL);

export const compileLatex = async (latexCode) => {
  try {
    console.log('Sending LaTeX to server at:', API_URL); // Log the actual URL being used
    const response = await axios.post(`${API_URL}/compile`, { latex: latexCode });
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Compilation error details:', error.response?.data || error.message);
    throw error;
  }
};

// Add function to get AI models (if not already present or needs update)
export const getAIModels = async () => {
  try {
    console.log('Fetching AI models from:', API_URL);
    const response = await axios.get(`${API_URL}/ai/models`);
    console.log('AI Models response:', response.data);
    return response.data.models || []; // Ensure it returns an array
  } catch (error) {
    console.error('Error fetching AI models:', error.response?.data || error.message);
    // Return fallback models or an empty array on error
    // Consider importing FALLBACK_MODELS from ModelSelector if needed here
    return []; 
  }
};

// Add function to call AI improvement endpoint (if not already present or needs update)
export const improveResumeAI = async (prompt, latex, modelId, templateName) => {
  try {
    console.log(`Sending AI request to ${API_URL}/ai/improve-resume`);
    const response = await axios.post(`${API_URL}/ai/improve-resume`, {
      prompt,
      latex,
      modelId,
      templateName
    }, { timeout: 180000 }); // Use timeout from AIAssistant or configure here
    console.log('AI response:', response.data);
    return response.data;
  } catch (error) {
    console.error('AI improvement error:', error.response?.data || error.message);
    throw error; // Re-throw to be handled in the component
  }
};
