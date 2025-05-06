import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const getAIResumeImprovement = async (prompt, latexCode) => {
  try {
    const response = await axios.post(`${API_URL}/ai/improve-resume`, {
      prompt,
      latex: latexCode
    });
    return response.data;
  } catch (error) {
    console.error('AI improvement error:', error.response?.data || error.message);
    throw error;
  }
};

// More AI-related functions could be added here in the future
