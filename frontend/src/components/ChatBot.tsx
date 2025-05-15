import { useState, useEffect, useRef } from 'react';
import chatbotService from '@/services/chatbot.service';
import { MessageCircle, Send, X, Minimize, ChevronUp, Loader2 } from 'lucide-react';

interface Message {
  type: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      type: 'bot', 
      text: 'Hi there! I am the WorkSphere Assistant. How can I help you today? You can ask about our pricing, features, free trial, or support options.',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fallbackAnswers = {
    "pricing": "WorkSphere offers a free 1-month trial. After that, we have three plans: Basic ($9.99/month), Professional ($19.99/month), and Enterprise (custom pricing).",
    "features": "WorkSphere includes attendance management, employee performance tracking, video conferencing, real-time messaging, project management, and task management.",
    "trial": "Yes! WorkSphere offers a full-featured 1-month free trial. No credit card required to get started.",
    "default": "I don't have specific information on that yet. For the best assistance, please ask about WorkSphere's pricing, features, free trial, or support options."
  };

  const fetchBotResponse = async (userQuery: string): Promise<string> => {
    setIsLoading(true);
    try {
      const botReply = await chatbotService.getBotResponse(userQuery);
      return botReply || getLocalFallbackResponse(userQuery);
    } catch (error) {
      return getLocalFallbackResponse(userQuery);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getLocalFallbackResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes("price") || lowerQuery.includes("cost") || lowerQuery.includes("plan")) {
      return fallbackAnswers.pricing;
    } else if (lowerQuery.includes("feature") || lowerQuery.includes("do") || lowerQuery.includes("offer")) {
      return fallbackAnswers.features;
    } else if (lowerQuery.includes("trial") || lowerQuery.includes("free")) {
      return fallbackAnswers.trial;
    } else {
      return fallbackAnswers.default;
    }
  };

  const handleSendMessage = async (): Promise<void> => {
    if (inputText.trim() === '') return;
    
    setMessages([...messages, { type: 'user', text: inputText, timestamp: new Date() }]);
    const userQuestion = inputText;
    setInputText('');
    
    setIsLoading(true);
    
    const botResponse = await fetchBotResponse(userQuestion);
    
    setMessages(prev => [...prev, { type: 'bot', text: botResponse, timestamp: new Date() }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleChat = (): void => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
  };

  const toggleMinimized = (e: React.MouseEvent): void => {
    e.stopPropagation();
    setIsMinimized(!isMinimized);
  };
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          className={`bg-card rounded-2xl shadow-xl w-80 sm:w-96 transition-all duration-300 mb-4 border border-border overflow-hidden flex flex-col ${
            isMinimized ? 'h-16' : 'h-96 sm:h-[450px]'
          }`}
          style={{ 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' 
          }}
        >
          <div className="bg-gradient-to-r from-primary/90 to-primary p-3 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center">
                <MessageCircle size={20} className="text-primary" />
              </div>
              <span className="ml-2 font-medium text-white">WorkSphere Assistant</span>
            </div>
            <div className="flex">
              <button 
                onClick={toggleMinimized} 
                className="p-1 text-white/80 hover:text-white transition-colors"
              >
                {isMinimized ? <ChevronUp size={18} /> : <Minimize size={18} />}
              </button>
              <button 
                onClick={toggleChat} 
                className="p-1 text-white/80 hover:text-white transition-colors ml-1"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div 
                className="flex-1 p-4 overflow-y-auto"
                style={{ 
                  backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(240, 240, 245, 0.3) 10%, rgba(250, 250, 255, 0.9) 90%)',
                  backgroundAttachment: 'fixed' 
                }}
              >
                {messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`mb-4 flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.type === 'bot' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1">
                        <MessageCircle size={16} className="text-primary/80" />
                      </div>
                    )}
                    
                    <div className="flex flex-col max-w-[75%]">
                      <div 
                        className={`p-3 ${
                          msg.type === 'user' 
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl rounded-tr-none shadow-sm' 
                            : 'bg-white text-gray-800 rounded-2xl rounded-tl-none shadow-sm border border-gray-100'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className={`text-xs mt-1 text-gray-500 ${msg.type === 'user' ? 'self-end mr-1' : 'self-start ml-1'}`}>
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    
                    {msg.type === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ml-2 mt-1">
                        <div className="w-4 h-4 rounded-full bg-primary"></div>
                      </div>
                    )}
                  </div>
                ))}
                
                {isLoading && (
                  <div className="mb-4 flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 mt-1">
                      <MessageCircle size={16} className="text-primary/80" />
                    </div>
                    <div className="p-4 bg-white rounded-2xl rounded-tl-none shadow-sm border border-gray-100">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="border-t border-gray-100 p-3 bg-white">
                <div className="flex bg-gray-50 rounded-full border border-gray-200 overflow-hidden">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 bg-transparent px-4 py-2 focus:outline-none"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`${isLoading ? 'bg-primary/70' : 'bg-primary'} text-white p-2 px-4 transition-colors`}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
      
      <button
        onClick={toggleChat}
        className="bg-gradient-to-r from-primary to-primary/90 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
      >
        <MessageCircle size={24} />
      </button>
    </div>
  );
}