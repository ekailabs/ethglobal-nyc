import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { validateTransaction } from './tx-validator.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function openRouterProxy(req: Request, res: Response) {
  try {
    const { tx_hash, messages, model, stream = true, ...otherParams } = req.body;

    // Check if payment is required
    const paymentRequired = process.env.ENABLE_PAYMENT_REQUIRED === 'true';
    const txValidationEnabled = process.env.ENABLE_TX_VALIDATION === 'true';

    if (paymentRequired) {
      // Check if payment is provided via tx_hash
      if (!tx_hash) {
        // Return 402 Payment Required if no tx_hash provided
        return res.status(402).json({
          error: "PAYMENT is required",
          accepts: [{
            scheme: "exact",
            network: process.env.NETWORK_NAME || "sepolia",
            maxAmountRequired: process.env.PAYMENT_AMOUNT || "50000",
            resource: `${process.env.API_BASE_URL || "http://localhost:3001"}/v1/chat/completions`,
            description: "Chat with AI models via OpenRouter",
            mimeType: "",
            payTo: process.env.PAYMENT_RECIPIENT || "",
            token: process.env.PAYMENT_TOKEN_SYMBOL || "PYUSD"
          }]
        });
      }

      // Validate the transaction hash if validation is enabled
      if (txValidationEnabled) {
        console.log(`💳 Validating payment with tx_hash: ${tx_hash}`);
        const validationResult = await validateTransaction(tx_hash);
        
        if (!validationResult.isValid) {
          console.error(`❌ Payment validation failed: ${validationResult.error}`);
          return res.status(402).json({
            error: "Invalid payment",
            details: validationResult.error,
            accepts: [{
              scheme: "exact",
              network: process.env.NETWORK_NAME || "sepolia",
              maxAmountRequired: process.env.PAYMENT_AMOUNT || "50000",
              resource: `${process.env.API_BASE_URL || "http://localhost:3001"}/v1/chat/completions`,
              description: "Chat with AI models via OpenRouter",
              mimeType: "",
              payTo: process.env.PAYMENT_RECIPIENT || "",
              token: process.env.PAYMENT_TOKEN_SYMBOL || "PYUSD"
            }]
          });
        }
        
        console.log(`✅ Payment verified:`, validationResult.details);
      } else {
        console.log(`💳 Payment tx_hash provided (validation disabled): ${tx_hash}`);
      }
    } else {
      console.log(`🔓 Payment not required - proceeding with request`);
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY environment variable is required');
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }
    console.log('🤖 Messages array here is', req.body);
    if (!messages || !Array.isArray(messages)) {
      console.log('🤖 Messages array here is', messages);
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!model) {
      return res.status(400).json({ error: 'Model is required' });
    }

    const openRouterRequest = {
      model,
      messages,
      stream,
      ...otherParams
    };

    console.log(`🤖 Proxying request to OpenRouter for model: ${model}`);

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Title': 'OpenRouter Proxy Backend'
      },
      body: JSON.stringify(openRouterRequest)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: 'OpenRouter API error',
        details: errorText
      });
    }

    if (stream && response.body) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      response.body.pipe(res);
    } else {
      const data = await response.json();
      res.json(data);
    }
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}