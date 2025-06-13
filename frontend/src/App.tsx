import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaSpinner, FaRobot, FaUser, FaKey, FaUpload } from 'react-icons/fa';
import './App.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Main App component that handles the chat interface and API interactions
 */
const App: React.FC = () => {
  // State management for the application
  const [model, setModel] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved API key from localStorage for non-OpenAI models
    const savedKey = localStorage.getItem('apiKey');
    if (savedKey && model !== 'openai') {
      setApiKey(savedKey);
    }
  }, [model]);

  /**
   * Handle sending a prompt to the selected AI model
   */
  const handleSend = async () => {
    if (!prompt.trim()) return;
    
    // Only check for API key if not using OpenAI
    if (model !== 'openai' && !apiKey) {
      setError('Please enter your API key first');
      return;
    }

    setLoading(true);
    setError(null);
    
    // Add user message
    const userMessage: Message = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');

    try {
      const response = await axios.post('/api/generate', {
        model,
        prompt,
        // Only send API key for non-OpenAI models
        ...(model !== 'openai' && { apiKey })
      });

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.response
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to get response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /**
   * Handle saving API keys
   */
  const handleSaveKey = () => {
    if (!apiKey) {
      setError('Please enter an API key');
      return;
    }
    localStorage.setItem('apiKey', apiKey);
    setError(null);
  };

  /**
   * Handle file upload and text extraction
   */
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('/api/upload', formData);
      setMessages([...messages, { role: 'user', content: `Uploaded file: ${response.data.text}` }]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Sidebar */}
      <div className="w-80 bg-gray-800 border-r border-gray-700 p-6">
        <h1 className="text-2xl font-bold mb-6 text-blue-400">AI Chat Hub</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Select Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="openai">OpenAI GPT</option>
              <option value="gemini">Google Gemini</option>
              <option value="claude">Anthropic Claude</option>
              <option value="perplexity">Perplexity</option>
            </select>
          </div>

          {/* Only show API key input for non-OpenAI models */}
          {model !== 'openai' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  placeholder="Enter your API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSaveKey}
                  className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Save API Key"
                >
                  <FaKey />
                </button>
              </div>
            </div>
          )}

          <div className="pt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Upload File</label>
            <div className="flex items-center justify-center w-full">
              <label className="w-full flex flex-col items-center px-4 py-6 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors">
                <FaUpload className="text-2xl mb-2" />
                <span className="text-sm">Click to upload</span>
                <input type="file" className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start space-x-4 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <FaRobot />
                </div>
              )}
              <div
                className={`max-w-[70%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700 text-gray-100'
                }`}
              >
                {msg.content}
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                  <FaUser />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-center">
              <FaSpinner className="animate-spin text-2xl text-blue-500" />
            </div>
          )}
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg text-center">
              {error}
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-6 border-t border-gray-700">
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Type your message..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 p-4 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="p-4 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50"
            >
              <FaPaperPlane />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
