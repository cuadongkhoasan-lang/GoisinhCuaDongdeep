// App.tsx — Phiên bản dành cho DeepSeek (không còn phụ thuộc Gemini)

import React, { useState, useEffect, useRef } from 'react';
import ChatInterface from './components/ChatInterface';
import { ChatMessage } from './types';

// 👉 Dùng service mới của bạn
import { createChatSession, sendMessageToChat, ChatSession } from './services/deepseekService';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 👉 Session DeepSeek
  const chatSessionRef = useRef<ChatSession | null>(null);

  useEffect(() => {
    const initializeChat = () => {
      try {
        chatSessionRef.current = createChatSession();

        setMessages([
          {
            id: Date.now(),
            text: 'Xin chào! Tôi là trợ lý ảo của Bệnh viện Đa khoa Cửa Đông. Tôi có thể giúp gì cho bạn về các gói sinh ạ?',
            sender: 'bot',
          },
        ]);
      } catch (error) {
        console.error("Failed to initialize chat session:", error);
        setMessages([
          {
            id: Date.now(),
            text: 'Xin lỗi, đã có lỗi xảy ra khi khởi tạo cuộc trò chuyện. Vui lòng tải lại trang.',
            sender: 'bot',
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, []);

  const handleSendMessage = async (userMessage: string) => {
    if (!chatSessionRef.current || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const botResponse = await sendMessageToChat(chatSessionRef.current, userMessage);

      const newBotMessage: ChatMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
      };

      setMessages(prev => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);

      const errorMessage: ChatMessage = {
        id: Date.now() + 1,
        text: 'Rất xin lỗi, tôi đã gặp phải sự cố. Vui lòng thử lại.',
        sender: 'bot',
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const showQuickReplies = messages.length === 1 && messages[0].sender === 'bot';

  return (
    <div className="relative h-screen font-sans">
      <ChatInterface
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        showQuickReplies={showQuickReplies}
      />

      {/* Floating Action Button for Hotline */}
      <a
        href="tel:19008686"
        className="fixed bottom-24 right-6 bg-pink-500 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
        aria-label="Gọi tổng đài 1900.8686"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      </a>
    </div>
  );
};

export default App;
