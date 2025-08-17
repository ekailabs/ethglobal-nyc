import { useState, useCallback } from 'react';

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
}

export function useChat() {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });

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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Mock AI responses
      const responses = [
        "Hello! I'm an AI assistant. How can I help you today?",
        "That's an interesting question! Let me think about that...\n\nBased on what you've asked, I can provide some insights:\n\n1. **First point**: This is important because...\n2. **Second point**: Consider this aspect...\n3. **Third point**: Don't forget about...\n\nWould you like me to elaborate on any of these points?",
        "I understand what you're looking for. Here's what I recommend:\n\n```javascript\nconst solution = {\n  approach: 'systematic',\n  steps: ['analyze', 'plan', 'implement', 'test'],\n  outcome: 'success'\n};\n```\n\nThis should help you get started!",
        "Great question! Here are some key considerations:\n\n> \"The best way to predict the future is to invent it.\" - Alan Kay\n\n- **Technical aspects**: Focus on clean, maintainable code\n- **User experience**: Always prioritize the end user\n- **Performance**: Optimize for speed and efficiency\n\nLet me know if you need more specific guidance!",
        "I can help you with that! Here's a comprehensive breakdown:\n\n## Overview\nThis is a complex topic that requires careful consideration.\n\n### Key Points:\n1. Start with the basics\n2. Build incrementally\n3. Test thoroughly\n4. Document your work\n\n### Example Implementation:\n```python\ndef solve_problem(input_data):\n    # Process the input\n    result = process(input_data)\n    \n    # Validate the result\n    if validate(result):\n        return result\n    else:\n        raise ValueError(\"Invalid result\")\n```\n\nDoes this help clarify things?",
      ];

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responses[Math.floor(Math.random() * responses.length)],
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
  }, []);

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

  return {
    ...chatState,
    sendMessage,
    clearMessages,
    clearError,
  };
}
