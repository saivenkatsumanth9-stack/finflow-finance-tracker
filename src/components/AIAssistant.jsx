import React, { useState, useRef, useEffect } from 'react';
import { useFinance } from '../context/FinanceContext';
import { generateFinancialContext, callClaudeApi, getLocalAIResponse } from '../utils/aiHelper';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Bot as BotIcon,
  HelpCircle,
  AlertCircle
} from 'lucide-react';

export default function AIAssistant({ isOpen, onClose }) {
  const store = useFinance();
  const { profile } = store;
  
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'ai', 
      text: `Hello ${profile.name}! I'm FinFlow, your personal financial advisor. Ask me how you're doing this month or click a quick prompt below to begin.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const chatEndRef = useRef(null);

  const quickChips = [
    "How did I do this month?",
    "Where can I cut spending?",
    "Am I on track for my goals?",
    "What's my biggest expense category?",
    "How much can I save this month?"
  ];

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setErrorMsg('');

    // Compile current data context
    const financialContext = generateFinancialContext(store);

    try {
      let aiText = '';

      if (profile.useMockAI || !profile.claudeApiKey) {
        // Use Local Simulator
        aiText = getLocalAIResponse(textToSend, financialContext);
      } else {
        // Call Real Claude API
        aiText = await callClaudeApi(profile.claudeApiKey, textToSend, financialContext);
      }

      // Simulate streaming response word-by-word
      simulateStreaming(aiText);

    } catch (error) {
      console.error(error);
      setIsTyping(false);
      setErrorMsg(error.message);
      
      // Fallback message options
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'ai',
        text: `Error connecting to Claude: "${error.message}". I've activated the Local AI Simulator instead so we don't lose track of your questions.`,
        timestamp: new Date()
      }]);

      // Temporary switch to mock
      const mockText = getLocalAIResponse(textToSend, financialContext);
      simulateStreaming(mockText);
    }
  };

  // Simulated streaming typing effect
  const simulateStreaming = (fullText) => {
    setIsTyping(true);
    const words = fullText.split(' ');
    let currentText = '';
    let index = 0;

    const newAiMsg = {
      id: Date.now() + 2,
      sender: 'ai',
      text: '',
      timestamp: new Date()
    };

    // Add empty message placeholder
    setMessages(prev => [...prev, newAiMsg]);

    const timer = setInterval(() => {
      if (index < words.length) {
        currentText += (index === 0 ? '' : ' ') + words[index];
        setMessages(prev => prev.map(m => m.id === newAiMsg.id ? { ...m, text: currentText } : m));
        index++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
      }
    }, 60); // 60ms word printing speed
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full max-w-sm bg-surface border-l border-border shadow-2xl flex flex-col justify-between animate-slide-in glass-sidebar">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-bg-app/40 select-none">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-text-primary">
              <BotIcon className="w-5 h-5 text-accent-2" />
            </div>
            {/* Live pulsing indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-accent-2 rounded-full border-2 border-surface pulse-dot" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-text-primary">FinFlow AI Advisor</h3>
            <span className="text-[9px] text-text-muted">
              {profile.useMockAI ? 'Local Simulator Active' : 'Claude Sonnet 3.5 Linked'}
            </span>
          </div>
        </div>

        <button 
          onClick={onClose}
          className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-2 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message History area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
        {messages.map(msg => {
          const isAI = msg.sender === 'ai';
          return (
            <div key={msg.id} className={`flex items-end gap-2.5 ${isAI ? '' : 'justify-end'}`}>
              {isAI && (
                <div className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center text-accent shrink-0">
                  <BotIcon className="w-3.5 h-3.5 text-accent-2" />
                </div>
              )}
              <div 
                className={`max-w-[75%] rounded-2xl px-3 py-2.5 text-xs leading-normal shadow-sm
                  ${isAI 
                    ? 'bg-surface-2 text-text-primary border border-border/80 rounded-bl-sm' 
                    : 'bg-accent text-text-primary rounded-br-sm'
                  }
                `}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-end gap-2.5 select-none">
            <div className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center text-accent shrink-0">
              <BotIcon className="w-3.5 h-3.5 text-accent-2" />
            </div>
            <div className="bg-surface-2 text-text-muted rounded-2xl px-3 py-2 text-xs flex gap-1 items-center border border-border/80 rounded-bl-sm">
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts / Input area */}
      <div className="p-4 border-t border-border bg-bg-app/20 space-y-3">
        {/* Quick Chips list */}
        <div className="flex flex-wrap gap-1.5 max-h-[85px] overflow-y-auto pb-1 scrollbar-thin select-none">
          {quickChips.map(chip => (
            <button
              key={chip}
              onClick={() => handleSendMessage(chip)}
              className="text-[9px] bg-surface-2 border border-border hover:border-accent text-text-muted hover:text-text-primary py-1 px-2.5 rounded-full text-left transition-all leading-tight shrink-0"
              disabled={isTyping}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleFormSubmit} className="flex gap-2 relative">
          <input
            type="text"
            placeholder="Ask about budgets, goals, splits..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            className="flex-1 bg-surface border border-border rounded-xl py-2.5 pl-3.5 pr-10 text-xs focus:outline-none focus:border-accent placeholder:text-text-muted/65"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-accent-2 hover:bg-surface-2 transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
