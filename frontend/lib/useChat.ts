import { useState, useCallback, useEffect } from 'react';
import { ChatService, ChatMessage as ApiChatMessage, PaymentInfo, ChatResponse } from './chatService';

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
  paymentRequired: boolean;
  paymentInfo: PaymentInfo | null;
}

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    selectedModel: 'openai/gpt-4o-mini',
    availableModels: [],
    paymentRequired: false,
    paymentInfo: null,
  });
  
  const [paymentStatus, setPaymentStatus] = useState<string>('');

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

  const sendMessage = useCallback(async (messageText: string, autoPayCallback?: (paymentInfo: PaymentInfo) => Promise<string>) => {
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
      paymentRequired: false,
      paymentInfo: null,
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

      // Check if payment is required
      if ('paymentRequired' in response && response.paymentRequired) {
        if (autoPayCallback) {
          setPaymentStatus('Paying for the alpha... 💸');
          console.log('💰 Auto-payment triggered');
          try {
            const txHash = await autoPayCallback(response.paymentInfo);
            setPaymentStatus('Payment confirmed, getting response... 🧠');
            console.log('✅ Auto-payment successful, getting response');
            
            // Now get the actual response with payment proof
            const finalResponse = await chatService.sendChatMessage(
              apiMessages,
              chatState.selectedModel,
              {},
              txHash
            );

            const chatResponse = finalResponse as ChatResponse;
            const aiMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: chatResponse.choices[0]?.message?.content || 'No response received',
              isUser: false,
              timestamp: new Date(),
            };

            setChatState(prev => ({
              ...prev,
              messages: [...prev.messages, aiMessage],
              isLoading: false,
            }));
            setPaymentStatus('');
            return;
          } catch (paymentError) {
            console.error('Auto-payment failed:', paymentError);
            setChatState(prev => ({
              ...prev,
              isLoading: false,
              error: `Payment failed: ${paymentError instanceof Error ? paymentError.message : 'Unknown error'}`,
            }));
            setPaymentStatus('');
            return;
          }
        } else {
          // Fallback to showing payment UI
          setChatState(prev => ({
            ...prev,
            isLoading: false,
            paymentRequired: true,
            paymentInfo: response.paymentInfo,
          }));
          return;
        }
      }

      // Normal AI response - TypeScript now knows this is ChatResponse
      const chatResponse = response as ChatResponse;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatResponse.choices[0]?.message?.content || 'No response received',
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
      paymentRequired: false,
      paymentInfo: null,
    }));
  }, []);

  const clearError = useCallback(() => {
    setChatState(prev => ({
      ...prev,
      error: null,
      paymentRequired: false,
      paymentInfo: null,
    }));
  }, []);

  const setModel = useCallback((model: string) => {
    setChatState(prev => ({
      ...prev,
      selectedModel: model,
    }));
  }, []);

  const sendPaymentAndGetResponse = useCallback(async (txHash: string) => {
    if (!chatState.paymentRequired || !chatState.paymentInfo) return;

    setChatState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const apiMessages: ApiChatMessage[] = chatState.messages.map(msg => ({
        role: msg.isUser ? 'user' as const : 'assistant' as const,
        content: msg.text,
      }));

      const response = await chatService.sendChatMessage(
        apiMessages,
        chatState.selectedModel,
        {},
        txHash
      );

      const chatResponse = response as ChatResponse;
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: chatResponse.choices[0]?.message?.content || 'No response received',
        isUser: false,
        timestamp: new Date(),
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isLoading: false,
        paymentRequired: false,
        paymentInfo: null,
      }));

    } catch (error) {
      console.error('Failed to get response after payment:', error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get response after payment',
      }));
    }
  }, [chatService, chatState.messages, chatState.selectedModel, chatState.paymentRequired, chatState.paymentInfo]);

  return {
    ...chatState,
    sendMessage,
    clearMessages,
    clearError,
    setModel,
    sendPaymentAndGetResponse,
    paymentStatus,
  };
}
