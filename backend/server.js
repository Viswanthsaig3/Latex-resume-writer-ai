// Load environment variables from .env file
require('dotenv').config();

// Log the API keys to verify
console.log('OPENAI_API_KEY loaded:', process.env.OPENAI_API_KEY ? 'Yes' : 'No');
console.log('OPENROUTER_API_KEY loaded:', process.env.OPENROUTER_API_KEY ? 'Yes' : 'No');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const morgan = require('morgan');
const { Configuration, OpenAIApi } = require("openai"); // Add OpenAI for AI assistance
const axios = require('axios');

// Check if running on Render
const isRunningOnRender = process.env.RENDER === 'true';

// Initialize express app
const app = express();
// Use PORT from environment variable provided by Render, default to 5001 for local
const PORT = process.env.PORT || 5001; 
const FRONTEND_URL = 'https://latex-resume-writer-ai-1.onrender.com'; // Always include deployed frontend
const LOCAL_URL = 'http://localhost:3000';

const ALLOWED_ORIGINS = [FRONTEND_URL, LOCAL_URL];

// Available AI models through OpenRouter and OpenAI
const AI_MODELS = {
  // OpenRouter models - explicitly requested by user
  "deepseek-chat": {
    path: "deepseek/deepseek-chat:free",
    provider: "openrouter",
    displayName: "DeepSeek Chat (Free)",
    description: "Powerful open-source chat model with strong reasoning"
  },
  "qwen3": {
    path: "qwen/qwen3-235b-a22b:free", // Corrected model path
    provider: "openrouter",
    displayName: "Qwen 3 (Free)",
    description: "High-performance language model with 23.5B parameters"
  },
  // OpenAI models - updated to the new GPT-4.1 family
  "gpt-4.1": {
    path: "openai/gpt-4.1",
    provider: "openai",
    displayName: "GPT-4.1",
    description: "OpenAI's latest and most advanced model"
  },
  "gpt-4.1-mini": {
    path: "openai/gpt-4.1-mini",
    provider: "openai",
    displayName: "GPT-4.1 Mini",
    description: "Balanced version of GPT-4.1 with excellent performance"
  },
  "gpt-4.1-nano": {
    path: "openai/gpt-4.1-nano",
    provider: "openai",
    displayName: "GPT-4.1 Nano", 
    description: "Efficient, lightweight version of GPT-4.1"
  }
};

// Direct mapping for OpenAI API calls (if using direct OpenAI API)
const OPENAI_MODEL_NAMES = {
  "gpt-4.1": "gpt-4.1",
  "gpt-4.1-mini": "gpt-4.1-mini",
  "gpt-4.1-nano": "gpt-4.1-nano"
};

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`Request from disallowed origin: ${origin}`);
      // Still allow the request to prevent breaking functionality
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add explicit OPTIONS handler for preflight requests
app.options('*', cors());

app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for large LaTeX files
app.use(morgan('dev'));
// Serve static files from the 'output' directory relative to the current directory
app.use('/preview', express.static(path.join(__dirname, 'output'))); 

// Create output directory if it doesn't exist
const outputDir = process.env.OUTPUT_DIR || path.join(__dirname, 'output');
fs.ensureDirSync(outputDir);

// Initialize OpenAI APIs
let openai = null;
let openRouter = null;

// Standard OpenAI configuration
if (process.env.OPENAI_API_KEY) {
  try {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    openai = new OpenAIApi(configuration);
    console.log('OpenAI configuration initialized successfully.');
  } catch (error) {
    console.error('Error initializing OpenAI configuration:', error);
    openai = null;
  }
}

// OpenRouter configuration (using axios directly)
if (process.env.OPENROUTER_API_KEY) {
  openRouter = {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
  };
  console.log('OpenRouter configuration initialized successfully.');
}

if (!openai && !openRouter) {
  console.warn('Neither OpenAI nor OpenRouter API Keys are available. AI features will use fallback responses.');
}

// Improved URL resolution function that considers the request's origin
const getFullUrl = (req, pdfUrl) => {
  // If it already has a protocol, return as is
  if (pdfUrl.startsWith('http')) {
    return pdfUrl;
  }
  
  // Get the origin from the request or use the deployed URL as fallback
  const origin = req.headers.origin || FRONTEND_URL;
  
  // If we're accessing from the deployed frontend, return a path on the same domain
  if (origin === FRONTEND_URL) {
    return `${FRONTEND_URL}${pdfUrl}`;
  }
  
  // For local development, use the backend URL
  const backendUrl = `http://localhost:${PORT}`;
  return `${backendUrl}${pdfUrl}`;
};

// Compile LaTeX endpoint
app.post('/compile', async (req, res) => {
  const { latex } = req.body;
  
  if (!latex) {
    return res.status(400).json({ error: 'No LaTeX code provided' });
  }

  const sessionId = uuidv4();
  const sessionDir = path.join(outputDir, sessionId);

  try {
    // Create temporary directory for this session
    await fs.ensureDir(sessionDir);
    
    console.log('Created session directory:', sessionDir);
    
    // Write LaTeX to file
    const mainTexFile = path.join(sessionDir, 'main.tex');
    await fs.writeFile(mainTexFile, latex, 'utf8');
    
    // Skip Docker check on Render
    if (!isRunningOnRender) {
      // Original Docker availability check
      try {
        console.log('Checking Docker availability...');
        await new Promise((resolve, reject) => {
          exec('docker --version', (error) => {
            if (error) {
              console.error('Docker is not available:', error.message);
              reject(new Error('Docker is not installed or running. Please make sure Docker is installed and running.'));
            } else {
              console.log('Docker is available, proceeding with compilation');
              resolve();
            }
          });
        });
      } catch (dockerError) {
        throw dockerError;
      }
    }
    
    // Use local pdflatex directly on Render (it's installed via Dockerfile)
    console.log('Running pdflatex compilation...');
    try {
      await new Promise((localResolve, localReject) => {
        const localCmd = `pdflatex -interaction=nonstopmode -halt-on-error -output-directory="${sessionDir}" "${mainTexFile}"`;
        exec(localCmd, { timeout: 30000 }, (error, stdout, stderr) => {
          if (error) {
            console.error('Local compilation failed:', error.message);
            localReject(stderr || stdout || 'Local PDF compilation failed');
          } else {
            console.log('Local compilation succeeded');
            localResolve();
          }
        });
      });

      // Check if PDF was generated
      const pdfPath = path.join(sessionDir, 'main.pdf');
      if (!await fs.pathExists(pdfPath)) {
        throw new Error('Failed to generate PDF');
      }
      
      // Copy to output with a fixed name for consistent access
      const outputPdf = path.join(outputDir, 'resume.pdf');
      await fs.copy(pdfPath, outputPdf, { overwrite: true });
      
      // After successful compilation
      console.log(`PDF generated at: ${pdfPath}`);
      console.log(`PDF copied to: ${outputPdf}`);
      console.log(`PDF should be accessible at: /preview/resume.pdf`);
      
      // Clean up session directory
      await fs.remove(sessionDir);
      
      // Before sending the response
      console.log(`Sending response: ${JSON.stringify({
        success: true,
        pdfUrl: '/preview/resume.pdf'
      })}`);
      
      res.json({
        success: true,
        pdfUrl: getFullUrl(req, '/preview/resume.pdf'),
        message: 'LaTeX compiled successfully'
      });
      
    } catch (error) {
      console.error('Compilation error:', error);
      
      // Try to read log file if it exists
      let errorMessage = error.message;
      const logFile = path.join(sessionDir, 'main.log');
      
      try {
        if (await fs.pathExists(logFile)) {
          const logContent = await fs.readFile(logFile, 'utf8');
          // Extract relevant error from log
          const errorLines = logContent.split('\n')
            .filter(line => line.includes('!') || line.includes('Error'))
            .join('\n');
          
          if (errorLines) {
            errorMessage = errorLines;
          }
        }
      } catch (logError) {
        console.error('Error reading log file:', logError);
      }
      
      // Clean up session directory
      try {
        await fs.remove(sessionDir);
      } catch (cleanupError) {
        console.error('Error cleaning up:', cleanupError);
      }
      
      res.status(500).json({
        success: false,
        error: errorMessage
      });
    }
  } catch (error) {
    console.error('Compilation error:', error);
    
    // Try to read log file if it exists
    let errorMessage = error.message;
    const logFile = path.join(sessionDir, 'main.log');
    
    try {
      if (await fs.pathExists(logFile)) {
        const logContent = await fs.readFile(logFile, 'utf8');
        // Extract relevant error from log
        const errorLines = logContent.split('\n')
          .filter(line => line.includes('!') || line.includes('Error'))
          .join('\n');
        
        if (errorLines) {
          errorMessage = errorLines;
        }
      }
    } catch (logError) {
      console.error('Error reading log file:', logError);
    }
    
    // Clean up session directory
    try {
      await fs.remove(sessionDir);
    } catch (cleanupError) {
      console.error('Error cleaning up:', cleanupError);
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
});

// Get available models endpoint
app.get('/ai/models', (req, res) => {
  try {
    console.log('GET /ai/models - Request received');

    const availableModels = [];

    // Log API configuration status
    console.log('OpenAI API available:', openai ? 'Yes' : 'No');
    console.log('OpenRouter API available:', openRouter ? 'Yes' : 'No');

    // Add OpenRouter models first if available
    if (openRouter) {
      console.log('Adding OpenRouter models to the response');
      if (AI_MODELS["deepseek-chat"]) {
        availableModels.push({
          id: "deepseek-chat",
          name: AI_MODELS["deepseek-chat"].displayName,
          provider: "openrouter",
          description: AI_MODELS["deepseek-chat"].description
        });
      }
      if (AI_MODELS["qwen3"]) {
        availableModels.push({
          id: "qwen3",
          name: AI_MODELS["qwen3"].displayName,
          provider: "openrouter",
          description: AI_MODELS["qwen3"].description
        });
      }
    }

    // Then add OpenAI models if available
    if (openai) {
      console.log('Adding OpenAI models to the response');
      if (AI_MODELS["gpt-4.1"]) {
        availableModels.push({
          id: "gpt-4.1",
          name: AI_MODELS["gpt-4.1"].displayName,
          provider: "openai",
          description: AI_MODELS["gpt-4.1"].description
        });
      }
      if (AI_MODELS["gpt-4.1-mini"]) {
        availableModels.push({
          id: "gpt-4.1-mini",
          name: AI_MODELS["gpt-4.1-mini"].displayName,
          provider: "openai",
          description: AI_MODELS["gpt-4.1-mini"].description
        });
      }
      if (AI_MODELS["gpt-4.1-nano"]) {
        availableModels.push({
          id: "gpt-4.1-nano",
          name: AI_MODELS["gpt-4.1-nano"].displayName,
          provider: "openai",
          description: AI_MODELS["gpt-4.1-nano"].description
        });
      }
    }

    // If no models are available, send a clear error message
    if (availableModels.length === 0) {
      console.warn('No models available - API keys may be invalid or missing');
      return res.status(503).json({ 
        error: 'No AI models available', 
        message: 'API keys may be invalid or not configured',
        models: []
      });
    }

    console.log(`Returning ${availableModels.length} available models`);
    res.json({ models: availableModels });

  } catch (error) {
    console.error('Error in /ai/models endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      models: [] 
    });
  }
});

// AI resume improvement endpoint - updated to support multiple models
app.post('/ai/improve-resume', async (req, res) => {
  // Destructure templateName from request body
  const { prompt, latex, modelId = "deepseek-chat", templateName } = req.body; // Default to deepseek-chat

  if (!prompt || !latex) {
    return res.status(400).json({ error: 'Both prompt and LaTeX code are required' });
  }

  // Log the request for debugging
  console.log(`AI improve request received for model: ${modelId}, Template: ${templateName || 'Unknown'}`);
  console.log(`OpenAI available: ${openai ? 'Yes' : 'No'}, OpenRouter available: ${openRouter ? 'Yes' : 'No'}`);

  // Updated system prompt: Only provide the code block
  const systemPrompt = `You are an expert AI assistant specializing in improving LaTeX resumes based on user requests.

Your task is to analyze the provided LaTeX resume and the user's request, then provide the *complete*, updated LaTeX code reflecting the requested improvements.

Instructions:
1.  **ONLY Complete LaTeX Code:** Provide *only* the full, updated LaTeX code reflecting the user's request. Do NOT include any explanation, commentary, or introductory text before or after the code block.
2.  **Code Formatting:**
    *   Wrap the entire LaTeX code in a single markdown code block: \`\`\`latex ... \`\`\`
    *   Ensure the code starts with \\documentclass and includes the complete preamble.
    *   Include \\begin{document} and \\end{document}.
    *   The code must be valid and ready to compile.
    *   Do not include line numbers or other annotations within the code block itself.

Focus on directly implementing the user's request into the LaTeX code. If the user asks for layout changes, prioritize structure, readability, and modern aesthetics within the provided code structure.`;

  // Include template name in user content (still useful for context, even if explanation is omitted)
  const userContent = `Current LaTeX resume (potentially based on the '${templateName || 'default'}' template structure):

${latex}

User request: ${prompt}

Please provide ONLY the complete, updated LaTeX code in the specified format.`;

  try {
    console.log(`Sending request to AI model: ${modelId}`);

    let aiResponse;
    const modelConfig = AI_MODELS[modelId];

    if (!modelConfig) {
      console.warn(`Model ID ${modelId} not found in configuration. Using fallback.`);
      return res.json({
        success: true,
        response: generateFallbackResponse(prompt, latex, `Model ${modelId} not configured`)
      });
    }

    // Determine API and model path
    const useOpenRouter = modelConfig.provider === 'openrouter' || (modelConfig.provider === 'openai' && !openai && openRouter);
    const useDirectOpenAI = modelConfig.provider === 'openai' && openai;
    const modelPath = modelConfig.path;

    if (useDirectOpenAI && OPENAI_MODEL_NAMES[modelId]) {
      console.log(`Using direct OpenAI API with model: ${OPENAI_MODEL_NAMES[modelId]}`);
      try {
        const response = await openai.createChatCompletion({
          model: OPENAI_MODEL_NAMES[modelId],
          messages: [
            { role: "system", content: systemPrompt }, // Use updated systemPrompt
            { role: "user", content: userContent } // Use updated userContent
          ],
          temperature: 0.7,
          max_tokens: 2000, // Consider increasing if needed for full resumes
        });

        if (response.data.choices && response.data.choices[0].message) {
          aiResponse = response.data.choices[0].message.content;
          console.log(`Received successful response from OpenAI (${aiResponse.length} chars)`);
        } else {
          console.warn(`Unexpected OpenAI API response format:`, response.data);
          throw new Error("Unexpected OpenAI API response format");
        }
      } catch (openaiError) {
        console.error(`Direct OpenAI API error with ${OPENAI_MODEL_NAMES[modelId]}:`, openaiError.message);
        if (openaiError.response) {
          console.error('OpenAI API error details:', {
            status: openaiError.response.status,
            statusText: openaiError.response.statusText,
            data: openaiError.response.data
          });
        }
        // Attempt fallback via OpenRouter if available
        if (openRouter) {
          console.log("Attempting fallback via OpenRouter...");
          // Fall through to OpenRouter logic below
        } else {
          throw openaiError; // Re-throw if no OpenRouter fallback
        }
      }
    }

    // Use OpenRouter if configured or as fallback
    if (openRouter && (useOpenRouter || !aiResponse)) {
       console.log(`Using OpenRouter API with model path: ${modelPath}`);
       try {
         const openRouterRequest = {
           model: modelPath,
           messages: [
             { role: "system", content: systemPrompt }, // Use updated systemPrompt
             { role: "user", content: userContent } // Use updated userContent
           ],
           temperature: 0.7,
           max_tokens: 2000, // Consider increasing if needed for full resumes
           route: "fallback", // Use OpenRouter's fallback mechanism
           transforms: ["middle-out"],
         };

         console.log(`OpenRouter request configuration:`, {
           model: openRouterRequest.model,
           messagesCount: openRouterRequest.messages.length,
           temperature: openRouterRequest.temperature,
           max_tokens: openRouterRequest.max_tokens
         });

         const openRouterResponse = await axios.post(
           `${openRouter.baseURL}/chat/completions`,
           openRouterRequest,
           {
             headers: {
               'Authorization': `Bearer ${openRouter.apiKey}`,
               'HTTP-Referer': 'https://github.com/latex-resume-writer', // Replace with your actual referer if needed
               'X-Title': 'LaTeX Resume Writer', // Replace with your actual title if needed
               'Content-Type': 'application/json'
             },
             timeout: 150000 // 150 seconds timeout
           }
         );

         console.log(`OpenRouter response status: ${openRouterResponse.status}`);

         if (openRouterResponse.data && openRouterResponse.data.choices && openRouterResponse.data.choices[0]) {
           aiResponse = openRouterResponse.data.choices[0].message.content;
           console.log(`Received successful response from OpenRouter (${aiResponse.length} chars)`);
         } else {
           console.warn(`Unexpected OpenRouter API response format:`, openRouterResponse.data);
           throw new Error("Unexpected OpenRouter API response format");
         }
       } catch (openRouterError) {
         console.error(`OpenRouter API error with ${modelPath}:`, openRouterError.message);
         if (openRouterError.response) {
           console.error('OpenRouter API error details:', {
             status: openRouterError.response.status,
             statusText: openRouterError.response.statusText,
             data: openRouterError.response.data
           });
         }
         // If OpenRouter also fails, generate fallback
         if (!aiResponse) {
           console.warn(`OpenRouter failed for ${modelPath}. Generating fallback response.`);
           return res.json({
             success: true,
             response: generateFallbackResponse(prompt, latex, `OpenRouter API Error: ${openRouterError.message}`)
           });
         }
       }
    }

    // Final check if any response was obtained
    if (aiResponse) {
      console.log("Returning AI response to client");
      return res.json({
        success: true,
        response: aiResponse
      });
    } else {
      // If neither API worked or was configured
      console.warn(`No suitable API available or configured for model ${modelId}. Using fallback response.`);
      return res.json({
        success: true,
        response: generateFallbackResponse(prompt, latex, `No API available for model ${modelId}`)
      });
    }

  } catch (error) {
    console.error('Error during AI API request:', error);
    // Log the specific API error details if available
    if (error.response && error.response.data) {
      console.error('API error details:', error.response.data);
    }
    
    // Provide fallback response if the API call fails
    return res.json({
      success: true,
      response: generateFallbackResponse(prompt, latex, `API Error: ${error.message}`)
    });
  }
});

// Improved fallback response generator
function generateFallbackResponse(userPrompt, latex, errorInfo = null) {
  let baseMessage = "I'm currently unable to connect to the advanced AI model. ";
  if (errorInfo) {
    baseMessage += `(${errorInfo}) `;
  }
  baseMessage += "Here's a generic suggestion based on your request:\n\n";

  const promptLower = userPrompt.toLowerCase();
  
  // ... existing fallback logic ...
  if (promptLower.includes('improve') || promptLower.includes('enhance')) {
    return baseMessage + "Quantify achievements, use action verbs, and ensure consistent formatting. Example:\n\n```latex\n\\documentclass{article}\n\\usepackage{geometry}\n\\geometry{a4paper, margin=0.75in}\n\\usepackage{hyperref}\n\\usepackage{fontawesome}\n\n\\begin{document}\n\n\\begin{center}\n\\textbf{\\Large John Doe}\\\\\n123-456-7890 • \\href{mailto:john.doe@example.com}{john.doe@example.com} • \\href{https://linkedin.com/in/johndoe}{linkedin.com/in/johndoe}\n\\end{center}\n\n\\section*{Experience}\n\\textbf{Software Engineer} \\hfill Company Name, City, State \\\\\n\\textit{June 2022 - Present} \\hfill\n\\begin{itemize}\\itemsep -2pt\n  \\item Increased application performance by 40\\% through optimization of database queries\n  \\item Led development of 3 key features that attracted 1,000+ new users\n  \\item Collaborated with cross-functional teams to reduce deployment time by 25\\%\n\\end{itemize}\n\n\\section*{Education}\n\\textbf{University Name} \\hfill City, State \\\\\n\\textit{Bachelor of Science in Computer Science} \\hfill \\textit{2018-2022}\n\n\\section*{Skills}\n\\textbf{Programming Languages}: JavaScript, Python, Java\\\\\n\\textbf{Web Development}: React, Node.js, HTML, CSS\\\\\n\\textbf{Databases}: PostgreSQL, MongoDB\\\\\n\\textbf{Tools}: Git, Docker, AWS\n\n\\end{document}\n```";
  } else if (promptLower.includes('format') || promptLower.includes('layout')) {
    return baseMessage + "Consider using a cleaner layout with the moderncv package:\n\n```latex\n\\documentclass[11pt,a4paper,sans]{moderncv}\n\\moderncvstyle{classic}\n\\moderncvcolor{blue}\n\\usepackage[scale=0.8]{geometry}\n\n\\name{John}{Doe}\n\\phone{(123) 456-7890}\n\\email{john.doe@example.com}\n\\social[linkedin]{linkedin.com/in/johndoe}\n\\social[github]{github.com/johndoe}\n\n\\begin{document}\n\n\\makecvtitle\n\n\\section{Experience}\n\\cventry{2022--Present}{Software Engineer}{Company Name}{City, State}{}{}\n\\begin{itemize}\n  \\item Led development of a microservices architecture that improved system reliability by 35\\%\n  \\item Implemented CI/CD pipeline reducing deployment time from days to hours\n  \\item Optimized database queries resulting in 40\\% application performance improvement\n\\end{itemize}\n\n\\section{Education}\n\\cventry{2018--2022}{Bachelor of Science in Computer Science}{University Name}{City, State}{GPA: 3.8/4.0}{}\n\n\\section{Skills}\n\\cvitem{Programming}{JavaScript (ES6+), Python, Java, SQL}\n\\cvitem{Web Development}{React, Node.js, HTML, CSS}\n\\cvitem{Databases}{PostgreSQL, MongoDB}\n\\cvitem{Tools}{Git, Docker, AWS}\n\n\\end{document}\n```";
  } else {
    return baseMessage + "Here's a professionally structured LaTeX resume template:\n\n```latex\n\\documentclass{article}\n\\usepackage[margin=0.75in]{geometry}\n\\usepackage{hyperref}\n\n\\begin{document}\n\n\\begin{center}\n  \\textbf{\\LARGE Your Name} \\\\\n  \\vspace{0.1in}\n  123-456-7890 $\\cdot$ \\href{mailto:your.email@example.com}{your.email@example.com} $\\cdot$ \n  \\href{https://linkedin.com/in/yourprofile}{linkedin.com/in/yourprofile} $\\cdot$\n  \\href{https://github.com/yourusername}{github.com/yourusername}\n\\end{center}\n\n\\section*{Professional Summary}\nResults-driven professional with X years of experience in [your field]. Skilled in [key skills] with a proven track record of [major accomplishment]. Seeking to leverage my expertise in [relevant areas] to drive success at [target company or role].\n\n\\section*{Experience}\n\\textbf{Job Title} | Company Name | Location | MM/YYYY - Present\n\\begin{itemize}\n  \\item Achieved [specific result] by [action taken], resulting in [quantifiable improvement]\n  \\item Led [project/team] that [accomplishment], improving [metric] by [percentage]\n  \\item Developed and implemented [process/solution] that [benefit to company]\n\\end{itemize}\n\n\\section*{Education}\n\\textbf{Degree Name}, University Name, Location, Graduation Year\n\n\\section*{Skills}\n\\textbf{Technical Skills:} List of your technical skills\\\\\n\\textbf{Soft Skills:} Communication, leadership, teamwork, etc.\\\\\n\\textbf{Languages:} Programming languages or spoken languages\\\\\n\\textbf{Tools:} Software, platforms, frameworks you're proficient in\n\n\\end{document}\n```";
  }
}

// Download the latest PDF
app.get('/download', (req, res) => {
  const filePath = path.join(outputDir, 'resume.pdf');
  
  if (fs.existsSync(filePath)) {
    res.download(filePath, 'resume.pdf');
  } else {
    res.status(404).send('No PDF available for download');
  }
});

// Add a simple test endpoint to verify the server is running
app.get('/ping', (req, res) => {
  res.json({ message: 'Backend server is running' });
});

// Start server
app.listen(PORT, () => {
  // Render injects the host automatically, listen on 0.0.0.0 for Docker compatibility
  console.log(`Server running on port ${PORT}`); 
  console.log(`Accepting requests from: ${ALLOWED_ORIGINS.join(', ')}`);
  // console.log(`Test the server by visiting: http://localhost:${PORT}/ping`); // Comment out or remove local test message
});

// Modify the getFileUrl function in PDFPreview.js
const getFileUrl = () => {
  // Use window.location.origin to get the current domain
  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5001'
    : window.location.origin;
    
  if (pdfUrl && pdfUrl.startsWith('/')) {
    return `${baseUrl}${pdfUrl}`;
  }
  return pdfUrl;
};
