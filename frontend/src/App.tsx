import React, { useState, useRef } from 'react';
import axios from 'axios';
import { FaPaperPlane, FaPlus, FaRegComments, FaRegUserCircle, FaRobot, FaSpinner, FaUpload } from 'react-icons/fa';

const PROVIDER_MODELS: Record<string, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ],
  claude: [
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
  ],
  gemini: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.0-pro', label: 'Gemini 1.0 Pro' },
  ],
  perplexity: [
    { value: 'pplx-70b', label: 'PPLX-70B' },
    { value: 'pplx-8x7b', label: 'PPLX-8x7B' },
  ],
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  provider: string;
  model: string;
  messages: Message[];
  createdAt: string;
}

const App: React.FC = () => {
  const [provider, setProvider] = useState('openai');
  const [model, setModel] = useState(PROVIDER_MODELS['openai'][0].value);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConvId, setCurrentConvId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current conversation
  const currentConv = conversations.find((c) => c.id === currentConvId);

  // Handle provider change
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value;
    setProvider(newProvider);
    setModel(PROVIDER_MODELS[newProvider][0].value);
  };

  // Handle model change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModel(e.target.value);
  };

  // Start a new conversation
  const handleNewChat = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      provider,
      model,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    setConversations([newConv, ...conversations]);
    setCurrentConvId(newConv.id);
    setError(null);
  };

  // Select a conversation
  const handleSelectConv = (id: string) => {
    setCurrentConvId(id);
    setError(null);
  };

  // Send a message
  const handleSend = async () => {
    if (!input.trim()) return;
    let convId = currentConvId;
    let conv = currentConv;
    // If no conversation, create one
    if (!conv) {
      const newConv: Conversation = {
        id: Date.now().toString(),
        provider,
        model,
        messages: [],
        createdAt: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setCurrentConvId(newConv.id);
      convId = newConv.id;
      conv = newConv;
    }
    setLoading(true);
    setError(null);
    const userMsg: Message = { role: 'user', content: input };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c
      )
    );
    setInput('');
    try {
      // Only OpenAI is supported for real responses
      if (provider !== 'openai') {
        throw new Error('This provider is not yet supported.');
      }
      const formData = new FormData();
      formData.append('model', model);
      formData.append('prompt', userMsg.content);
      const response = await axios.post('/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const assistantMsg: Message = {
        role: 'assistant',
        content: response.data.response,
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, assistantMsg] }
            : c
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to get response.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('/api/upload', formData);
      const userMsg: Message = { role: 'user', content: `Uploaded file: ${file.name}` };
      let convId = currentConvId;
      let conv = currentConv;
      if (!conv) {
        const newConv: Conversation = {
          id: Date.now().toString(),
          provider,
          model,
          messages: [],
          createdAt: new Date().toISOString(),
        };
        setConversations((prev) => [newConv, ...prev]);
        setCurrentConvId(newConv.id);
        convId = newConv.id;
        conv = newConv;
      }
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId ? { ...c, messages: [...c.messages, userMsg] } : c
        )
      );
      // Optionally, you can display the extracted text as an assistant message
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, messages: [...c.messages, { role: 'assistant', content: response.data.text }] }
            : c
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload file.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // UI
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r flex flex-col">
        <button
          className="m-4 flex items-center gap-2 p-2 bg-blue-500 hover:bg-blue-600 text-white rounded shadow"
          onClick={handleNewChat}
        >
          <FaPlus /> New Chat
        </button>
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 text-xs text-gray-400 mb-2 mt-4">Recent Conversations</div>
          {conversations.length === 0 && (
            <div className="px-4 text-gray-400">No conversations yet.</div>
          )}
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                conv.id === currentConvId ? 'bg-blue-100 font-semibold' : ''
              }`}
              onClick={() => handleSelectConv(conv.id)}
            >
              <FaRegComments className="text-blue-400" />
              <span className="truncate">
                {conv.messages[0]?.content.slice(0, 30) || 'New Conversation'}
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center gap-4 p-4 border-b bg-white">
          <select
            className="p-2 border rounded bg-gray-50"
            value={provider}
            onChange={handleProviderChange}
          >
            <option value="openai">OpenAI</option>
            <option value="claude">Claude</option>
            <option value="gemini">Gemini</option>
            <option value="perplexity">Perplexity</option>
          </select>
          <select
            className="p-2 border rounded bg-gray-50"
            value={model}
            onChange={handleModelChange}
          >
            {PROVIDER_MODELS[provider].map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            className="ml-auto px-4 py-2 border rounded hover:bg-gray-100"
            onClick={handleNewChat}
          >
            New Conversation
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-y-auto px-0 md:px-24 py-8 bg-gray-50">
          {!currentConv || currentConv.messages.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center text-gray-400">
              <FaRobot className="text-6xl mb-4" />
              <div className="text-2xl font-semibold mb-2">Start a new conversation</div>
              <div className="mb-8">Choose a provider and send a message to begin</div>
              {error && (
                <div className="text-red-500 text-center mt-2">{error}</div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {currentConv.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`rounded-full w-8 h-8 flex items-center justify-center ${
                        msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                      }`}
                    >
                      {msg.role === 'user' ? <FaRegUserCircle /> : <FaRobot />}
                    </div>
                    <div
                      className={`max-w-lg px-4 py-2 rounded-lg shadow ${
                        msg.role === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-2 bg-gray-100 text-gray-900 px-4 py-2 rounded-lg shadow animate-pulse">
                    <FaRobot /> <span>Assistant is typing...</span>
                  </div>
                </div>
              )}
              {error && (
                <div className="text-red-500 text-center mt-2">{error}</div>
              )}
            </div>
          )}
        </div>

        {/* Input Area (always visible) */}
        <div className="p-4 border-t bg-white flex items-center gap-2">
          <input
            className="flex-1 p-3 border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your message here..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <label className="p-3 bg-gray-200 hover:bg-gray-300 rounded cursor-pointer flex items-center">
            <FaUpload />
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <button
            className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded disabled:opacity-50"
            onClick={handleSend}
            disabled={loading || !input.trim()}
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
