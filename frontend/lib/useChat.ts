import { useState, useCallback, useEffect } from 'react';
import { ChatService, ChatMessage as ApiChatMessage } from './chatService';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  selectedModel: string;
  availableModels: string[];
}

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    selectedModel: 'openai/gpt-4o-mini',
    availableModels: [],
  });

  const [chatService] = useState(() => new ChatService());

  // Load available models on mount
  useEffect(() => {
    const loadModels = async () => {
      try {
        const models = await chatService.getAvailableModels();
        setChatState(prev => ({
          ...prev,
          availableModels: models,
        }));
      } catch (error) {
        console.warn('Failed to load models:', error);
      }
    };

    loadModels();
  }, [chatService]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Prepare messages for the API
      const apiMessages: ApiChatMessage[] = [
        ...chatState.messages.map(msg => ({
          role: msg.isUser ? 'user' as const : 'assistant' as const,
          content: msg.text,
        })),
        { role: 'user', content: messageText },
      ];

      const response = await chatService.sendChatMessage(
        apiMessages,
        chatState.selectedModel
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.choices[0]?.message?.content || 'No response received',
        isUser: false,
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
      }));

    } catch (error) {
      console.error('Failed to send message:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to send message',
      }));
    }
  }, [chatService, chatState.messages, chatState.selectedModel]);

  const clearMessages = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      messages: [],
      error: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      error: null,
    }));
  }, []);

  const setModel = useCallback((model: string) => {
    setChatState(prev => ({
      ...prev,
      selectedModel: model,
    }));
  }, []);

  return {
    ...chatState,
    sendMessage,
    clearMessages,
    clearError,
    setModel,
  };
}
