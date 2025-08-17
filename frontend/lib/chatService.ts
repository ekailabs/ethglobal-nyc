export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model: string;
  messages: ChatMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PaymentInfo {
  payTo: string;
  maxAmountRequired: string;
  maxAmountRequiredRaw: string;
  token: string;
  network: string;
  description: string;
}

export class ChatService {
  private baseURL: string;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  async sendChatMessage(
    messages: ChatMessage[],
    model: string = 'openai/gpt-4o-mini',
    options: Partial<ChatRequest> = {},
    txHash?: string
  ): Promise<ChatResponse | { paymentRequired: true; paymentInfo: PaymentInfo }> {
    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options.max_tokens || 4000,
        temperature: options.temperature || 0.7,
        top_p: options.top_p || 0.9,
        stream: options.stream || false,
        ...(txHash && { tx_hash: txHash }),
        ...options,
      }),
    };

    const response = await fetch(`${this.baseURL}/v1/chat/completions`, requestOptions);

    if (response.status === 402) {
      // Payment required - parse the payment information
      const errorData = await response.json();
      console.log('🚨 Payment Required (402):', errorData);
      
      if (errorData.accepts && errorData.accepts.length > 0) {
        const paymentDetails = errorData.accepts[0];
        const rawAmount = paymentDetails.maxAmountRequired;
        
        // Convert from 6 decimals to human-readable amount
        const humanReadableAmount = (parseInt(rawAmount) / Math.pow(10, 6)).toFixed(6);
        
        console.log('💰 Payment Details:', {
          payTo: paymentDetails.payTo,
          maxAmountRequired: humanReadableAmount,
          maxAmountRequiredRaw: rawAmount,
          token: paymentDetails.token,
          network: paymentDetails.network,
          description: paymentDetails.description,
        });
        
        const paymentInfo: PaymentInfo = {
          payTo: paymentDetails.payTo,
          maxAmountRequired: humanReadableAmount,
          maxAmountRequiredRaw: rawAmount,
          token: paymentDetails.token,
          network: paymentDetails.network,
          description: paymentDetails.description,
        };
        
        return { paymentRequired: true, paymentInfo };
      }
      
      throw new Error('Payment required but payment details not available');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('Chat response received:', data);
    
    return data as ChatResponse;
  }

  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseURL}/v1/models`);
      if (response.ok) {
        const data = await response.json();
        return data.data?.map((model: any) => model.id) || [];
      }
    } catch (error) {
      console.warn('Failed to fetch models:', error);
    }
    
    // Fallback to common models
    return [
      'openai/gpt-4o-mini',
      'openai/gpt-4o',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3.5-sonnet',
      'meta-llama/llama-3.1-8b-instruct',
      'google/gemini-pro',
      'mistralai/mistral-7b-instruct',
    ];
  }
}
