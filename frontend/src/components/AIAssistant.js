import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ModelSelector from './ModelSelector';
import '../styles/AIAssistant.css';

// Accept activeTemplateName prop
function AIAssistant({ latexCode, onApplyChanges, darkMode, activeTemplateName }) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-4.1-mini'); // Updated default model
  const [conversation, setConversation] = useState([
    {
      role: 'ai',
      // Update initial message to reflect template context possibility
      content: `Hello! I can help improve your resume (currently based on '${activeTemplateName || 'Default'}'). What would you like me to help with?`
    }
  ]);
  
  const chatBodyRef = useRef(null);
  const inputRef = useRef(null);
  
  // Update initial message if template name changes
  useEffect(() => {
    setConversation(prev => {
      const firstMessage = prev[0];
      if (firstMessage && firstMessage.role === 'ai') {
        firstMessage.content = `Hello! I can help improve your resume (currently based on '${activeTemplateName || 'Default'}'). What would you like me to help with?`;
      }
      return [...prev];
    });
  }, [activeTemplateName]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
    
    // Focus input when assistant is opened
    if (!isMinimized && !isCollapsed && inputRef.current) {
      inputRef.current.focus();
    }
  }, [conversation, isMinimized, isCollapsed]);
  
  const handleSendPrompt = async () => {
    if (!prompt.trim() || isLoading) return;
    
    // Add user message to conversation
    const userMessage = { role: 'user', content: prompt };
    setConversation(prev => [...prev, userMessage]);
    
    // Clear input field
    setPrompt('');
    
    // Start loading
    setIsLoading(true);
    
    // Save the prompt for potential retry
    const currentPrompt = prompt;
    
    try {
      // Add temporary "thinking" message
      setConversation(prev => [
        ...prev, 
        { role: 'ai', content: `Thinking... (using ${selectedModel}, template: ${activeTemplateName || 'Default'})`, isTemporary: true }
      ]);
      
      // Call the backend API with enhanced error handling
      const response = await axios.post('http://localhost:5001/ai/improve-resume', {
        prompt: currentPrompt,
        latex: latexCode,
        modelId: selectedModel,
        templateName: activeTemplateName // Send template name
      }, { 
        timeout: 180000 // 3 minutes timeout (increased from 2 minutes)
      });
      
      // Remove temporary message
      setConversation(prev => prev.filter(msg => !msg.isTemporary));
      
      if (response.data && response.data.success) {
        const aiContent = response.data.response;
        
        // Add AI response to conversation
        setConversation(prev => [...prev, { role: 'ai', content: aiContent }]);
        
        // Auto-apply LaTeX code if found in response
        if (aiContent.includes('```latex')) {
          console.log('Auto-applying LaTeX code from AI response');
          extractAndApplyLatex(aiContent);
        }
      } else {
        throw new Error(response.data?.error || 'Failed to get response from AI');
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove temporary message
      setConversation(prev => prev.filter(msg => !msg.isTemporary));
      
      // Add more helpful error message
      let errorMsg = "I'm having trouble connecting. Please try again or check your network connection.";
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMsg = "There was an issue with the AI request format. Please try a different model or simplify your request.";
        } else if (error.response.status === 401 || error.response.status === 403) {
          errorMsg = "Authentication error with the AI service. The API key may be invalid or expired.";
        } else if (error.response.status === 429) {
          errorMsg = "The AI service rate limit has been reached. Please try again in a few minutes.";
        } else if (error.response.status >= 500) {
          errorMsg = "The AI service is currently experiencing issues. Please try again later.";
        } else {
          errorMsg = `Server error: ${error.response.status} - ${error.response.data?.message || error.message}`;
        }
      } else if (error.code === 'ECONNABORTED') {
        errorMsg = "The request timed out. The AI model may be busy - please try a different model or try again later.";
      } else if (!navigator.onLine) {
        errorMsg = "You appear to be offline. Please check your internet connection.";
      }
      
      // Add the error message to the conversation
      setConversation(prev => [
        ...prev, 
        { 
          role: 'ai', 
          content: errorMsg + "\n\nHere's a generic suggestion based on your request:\n\n" +
            "Consider using action verbs, quantifying achievements, and ensuring consistent formatting in your resume. " +
            "For example, change 'Responsible for managing team' to 'Led 5-person team, increasing productivity by 20%.'"
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Extract and apply LaTeX code from message content
  const extractAndApplyLatex = (content) => {
    console.log("Attempting to extract and apply LaTeX code...");
    
    // Find all code blocks with ```latex ... ```
    const latexRegex = /```latex\n([\s\S]*?)```/g;
    const matches = [...content.matchAll(latexRegex)];
    
    if (matches && matches.length > 0) {
      // Get the last LaTeX code block (most likely the complete one)
      const lastMatch = matches[matches.length - 1];
      const extractedCode = lastMatch[1];
      
      console.log("Extracted LaTeX code successfully:", extractedCode.substring(0, 50) + "...");
      
      // Apply the changes
      if (extractedCode && extractedCode.trim().length > 0) {
        onApplyChanges(extractedCode);
        console.log("LaTeX code applied to editor");
        return true;
      }
    }
    
    console.warn("No valid LaTeX code blocks found in:", content.substring(0, 100) + "...");
    return false;
  };
  
  // Handle apply changes button click
  const handleApplyChanges = (content) => {
    // Just call our extract and apply function with the content
    return extractAndApplyLatex(content);
  };

  // Format message content - handle LaTeX code blocks
  const formatMessage = (content) => {
    if (!content) return '';
    
    if (content.startsWith('Thinking...')) {
      return (
        <div className="thinking-indicator">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="thinking-text">{content}</span>
        </div>
      );
    }
    
    // Split by code blocks
    const parts = [];
    let lastIndex = 0;
    
    // Match ```latex ... ``` blocks
    const codeBlockRegex = /```latex\n([\s\S]*?)```/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index)
        });
      }
      
      // Add the code block
      parts.push({
        type: 'latex',
        content: match[1]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex)
      });
    }
    
    // Render parts
    return parts.map((part, index) => {
      if (part.type === 'text') {
        // Format markdown-style syntax in text parts
        const formattedText = part.content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>');
          
        return (
          <div 
            key={index} 
            className="text-content"
            dangerouslySetInnerHTML={{ __html: formattedText }}
          />
        );
      } else {
        return (
          <div key={index} className="latex-block-container">
            <pre className="latex-block">
              <div className="latex-header">
                <span>LaTeX Code</span>
              </div>
              <code>{part.content}</code>
            </pre>
            <button 
              className="apply-btn"
              onClick={() => handleApplyChanges("```latex\n" + part.content + "\n```")} // Wrap with latex markers
            >
              <i className="fa fa-check-circle"></i> Apply Changes
            </button>
          </div>
        );
      }
    });
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendPrompt();
    }
  };
  
  const handleMaximize = () => {
    setIsMinimized(false);
    setIsCollapsed(false);
  };
  
  const handleMinimize = () => {
    setIsMinimized(true);
    setIsCollapsed(false);
  };
  
  const handleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    setIsMinimized(false);
  };

  return (
    <div className={`ai-assistant ${darkMode ? 'dark-mode' : ''} ${isMinimized ? 'minimized' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="assistant-header">
        <div className="assistant-title">
          <i className="fa fa-robot"></i>
          <span>AI Assistant</span>
        </div>
        
        <div className="assistant-controls">
          <button 
            className="assistant-control"
            onClick={handleMinimize}
            title="Minimize"
          >
            <i className="fa fa-window-minimize"></i>
          </button>
          
          <button 
            className="assistant-control"
            onClick={handleCollapse}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <i className={`fa fa-${isCollapsed ? 'expand' : 'compress'}`}></i>
          </button>
          
          <button 
            className="assistant-control close"
            onClick={() => setIsMinimized(true)}
            title="Close"
          >
            <i className="fa fa-times"></i>
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {!isCollapsed && (
            <div className="model-selector-container">
              <ModelSelector 
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
                darkMode={darkMode}
              />
            </div>
          )}
          
          <div className="assistant-body" ref={chatBodyRef}>
            <div className="messages-container">
              {conversation.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.role}`}
                >
                  <div className="message-avatar">
                    {msg.role === 'ai' ? (
                      <i className="fa fa-robot"></i>
                    ) : (
                      <i className="fa fa-user"></i>
                    )}
                  </div>
                  <div className="message-content">
                    {msg.role === 'ai' ? formatMessage(msg.content) : msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="assistant-input">
            <textarea
              ref={inputRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask how to improve your resume..."
              disabled={isLoading}
              rows={1}
            />
            <button
              className={`send-button ${isLoading || !prompt.trim() ? 'disabled' : ''}`}
              onClick={handleSendPrompt}
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <div className="button-spinner"></div>
              ) : (
                <i className="fa fa-paper-plane"></i>
              )}
            </button>
          </div>
        </>
      )}
      
      {isMinimized && (
        <div className="minimized-indicator" onClick={handleMaximize}>
          <i className="fa fa-robot"></i>
          <span>Open AI Assistant</span>
        </div>
      )}
    </div>
  );
}

export default AIAssistant;
