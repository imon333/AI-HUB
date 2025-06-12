import React, { useState } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaSpinner } from 'react-icons/fa';
import './App.css';

/**
 * Main App component that handles the chat interface and API interactions
 */
const App: React.FC = () => {
  // State management for the application
  const [model, setModel] = useState('openai');
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  /**
   * Handle sending a prompt to the selected AI model
   */
  const handleSend = async () => {
    if (!prompt) return;
    setLoading(true);
    setMessages([...messages, prompt]);
    setPrompt('');
    try {
      const response = await axios.post('/api/generate', { model, prompt });
      setMessages([...messages, prompt, response.data.response]);
    } catch (error) {
      console.error('Error generating response:', error);
    } finally {
      setLoading(false);
    }
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
      setMessages([...messages, `Uploaded file: ${response.data.text}`]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  /**
   * Handle saving API keys
   */
  const handleSaveKeys = async () => {
    try {
      await axios.post('/api/store-keys', {
        openai_api_key: apiKey,
        gemini_api_key: apiKey,
        claude_api_key: apiKey,
        perplexity_api_key: apiKey,
      });
      alert('API keys saved successfully.');
    } catch (error) {
      console.error('Error saving API keys:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar with model selection and API key input */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="openai">OpenAI</option>
            <option value="gemini">Gemini</option>
            <option value="claude">Claude</option>
            <option value="perplexity">Perplexity</option>
          </select>
          <input
            type="text"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 mt-2 border rounded"
          />
          <button
            onClick={handleSaveKeys}
            className="w-full p-2 mt-2 bg-green-500 text-white rounded"
          >
            Save API Keys
          </button>
          <input
            type="file"
            onChange={handleUpload}
            className="w-full p-2 mt-2 border rounded"
          />
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Message display area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg, index) => (
            <div key={index} className="mb-2 p-2 bg-white rounded shadow">
              {msg}
            </div>
          ))}
          {loading && (
            <div className="flex justify-center">
              <FaSpinner className="animate-spin" />
            </div>
          )}
        </div>

        {/* Prompt input area */}
        <div className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              placeholder="Type your prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 p-2 border rounded"
            />
            <button
              onClick={handleSend}
              className="ml-2 p-2 bg-blue-500 text-white rounded"
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
