const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const morgan = require('morgan');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5001; // Changed default port from 5000 to 5001

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Explicitly allow requests from your frontend
  credentials: true
}));
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for large LaTeX files
app.use(morgan('dev'));
app.use('/preview', express.static(path.join(__dirname, 'output')));

// Create output directory if it doesn't exist
const outputDir = path.join(__dirname, 'output');
fs.ensureDirSync(outputDir);

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
    console.log('LaTeX file written to:', mainTexFile);
    
    // Check if Docker is available
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
    
    // Try local compilation first, fall back to Docker if local fails
    console.log('Trying local LaTeX compilation...');
    try {
      await new Promise((resolve, reject) => {
        // Check if pdflatex is installed locally
        exec('pdflatex --version', (error) => {
          if (error) {
            console.log('Local pdflatex not available, will use Docker instead');
            resolve(false);
          } else {
            console.log('Local pdflatex found, using it for compilation');
            resolve(true);
          }
        });
      }).then(async (hasLocalLatex) => {
        if (hasLocalLatex) {
          // Use local pdflatex
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
        } else {
          // Fall back to Docker with normalized path
          const normalizedPath = sessionDir.replace(/\\/g, '/').replace(/^C:/, '/c');
          
          // Define Docker image with appropriate fallback
          let dockerImageName = 'blang/latex'; // Use blang/latex as default
          
          // If Docker image doesn't exist, try pulling it
          await new Promise((pullResolve) => {
            console.log('Checking if Docker image exists...');
            exec('docker image ls blang/latex', async (error, stdout) => {
              if (!stdout.includes('blang/latex')) {
                console.log('Docker image not found. Pulling image (this may take a while)...');
                try {
                  // Use a longer timeout for pulling
                  await new Promise((resolve, reject) => {
                    exec('docker pull blang/latex', { timeout: 300000 }, (pullError) => {
                      if (pullError) {
                        console.error('Failed to pull Docker image:', pullError.message);
                        reject(pullError);
                      } else {
                        console.log('Successfully pulled Docker image');
                        resolve();
                      }
                    });
                  });
                } catch (pullErr) {
                  console.error('Error pulling Docker image:', pullErr);
                }
              } else {
                console.log('Docker image already exists');
              }
              pullResolve();
            });
          });
          
          const dockerCmd = `docker run --rm -v "${normalizedPath}:/data" ${dockerImageName} pdflatex -interaction=nonstopmode main.tex`;
          
          await new Promise((dockerResolve, dockerReject) => {
            console.log('Docker command:', dockerCmd);
            exec(dockerCmd, { cwd: sessionDir, timeout: 30000 }, (error, stdout, stderr) => {
              if (error) {
                console.error('Docker compilation error:', error.message);
                dockerReject(stderr || stdout || 'Docker PDF compilation failed');
              } else {
                console.log('Docker compilation succeeded');
                dockerResolve();
              }
            });
          });
        }
      });
    } catch (compError) {
      throw compError;
    }
    
    // Check if PDF was generated
    const pdfPath = path.join(sessionDir, 'main.pdf');
    if (!await fs.pathExists(pdfPath)) {
      throw new Error('Failed to generate PDF');
    }
    
    // Copy to output with a fixed name for consistent access
    const outputPdf = path.join(outputDir, 'resume.pdf');
    await fs.copy(pdfPath, outputPdf, { overwrite: true });
    
    // Clean up session directory
    await fs.remove(sessionDir);
    
    res.json({
      success: true,
      pdfUrl: '/preview/resume.pdf',
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
});

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
  console.log(`Server running on port ${PORT}`);
  console.log(`Test the server by visiting: http://localhost:${PORT}/ping`);
});
