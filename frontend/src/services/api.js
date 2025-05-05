import axios from 'axios';

// Hard-code the API URL to ensure it's correctly pointing to the backend
const API_URL = 'http://localhost:5001';

export const compileLatex = async (latexCode) => {
  try {
    console.log('Sending LaTeX to server at:', API_URL);
    const response = await axios.post(`${API_URL}/compile`, { latex: latexCode });
    console.log('Server response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Compilation error details:', error.response?.data || error.message);
    throw error;
  }
};
