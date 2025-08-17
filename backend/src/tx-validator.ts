import { ethers } from 'ethers';

// Get configuration from environment variables
const BASE_SEPOLIA_RPC = process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
const EXPECTED_RECIPIENT = process.env.PAYMENT_RECIPIENT;
const PAYMENT_AMOUNT = process.env.PAYMENT_AMOUNT || '50000';
const TOKEN_DECIMALS = parseInt(process.env.PAYMENT_TOKEN_DECIMALS || '6');
const PYUSD_CONTRACT = process.env.PAYMENT_TOKEN_ADDRESS;

// Validate required environment variables
if (!EXPECTED_RECIPIENT) {
  throw new Error('PAYMENT_RECIPIENT environment variable is required');
}
if (!PYUSD_CONTRACT) {
  throw new Error('PAYMENT_TOKEN_ADDRESS environment variable is required');
}

const EXPECTED_AMOUNT = ethers.parseUnits(PAYMENT_AMOUNT, TOKEN_DECIMALS);

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: {
    from: string;
    to: string;
    amount: string;
    token: string;
  };
}

export async function validateTransaction(txHash: string): Promise<ValidationResult> {
  try {
    // Connect to Base Sepolia
    const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC);
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(txHash);
    
    if (!receipt) {
      return {
        isValid: false,
        error: 'Transaction not found or not mined'
      };
    }

    // Check if transaction was successful
    if (receipt.status !== 1) {
      return {
        isValid: false,
        error: 'Transaction failed'
      };
    }

    // Get transaction details
    const tx = await provider.getTransaction(txHash);
    
    if (!tx) {
      return {
        isValid: false,
        error: 'Transaction details not found'
      };
    }

    // For PYUSD transfers, we need to check the logs for Transfer events
    const transferEventSignature = ethers.id('Transfer(address,address,uint256)');
    
    // Find Transfer event in logs
    const transferLog = receipt.logs.find(log => 
      log.address.toLowerCase() === PYUSD_CONTRACT.toLowerCase() &&
      log.topics[0] === transferEventSignature
    );

    if (!transferLog) {
      return {
        isValid: false,
        error: 'No PYUSD transfer found in transaction'
      };
    }

    // Decode the Transfer event
    const iface = new ethers.Interface([
      'event Transfer(address indexed from, address indexed to, uint256 value)'
    ]);
    
    const decodedLog = iface.parseLog({
      topics: transferLog.topics,
      data: transferLog.data
    });

    if (!decodedLog) {
      return {
        isValid: false,
        error: 'Could not decode transfer event'
      };
    }

    const { from, to, value } = decodedLog.args;

    // Validate recipient
    if (to.toLowerCase() !== EXPECTED_RECIPIENT.toLowerCase()) {
      return {
        isValid: false,
        error: `Invalid recipient. Expected: ${EXPECTED_RECIPIENT}, Got: ${to}`
      };
    }

    // Validate amount (must be at least the expected amount)
    if (value < EXPECTED_AMOUNT) {
      return {
        isValid: false,
        error: `Insufficient amount. Expected: ${ethers.formatUnits(EXPECTED_AMOUNT, TOKEN_DECIMALS)} ${process.env.PAYMENT_TOKEN_SYMBOL}, Got: ${ethers.formatUnits(value, TOKEN_DECIMALS)} ${process.env.PAYMENT_TOKEN_SYMBOL}`
      };
    }

    return {
      isValid: true,
      details: {
        from,
        to,
        amount: ethers.formatUnits(value, TOKEN_DECIMALS),
        token: process.env.PAYMENT_TOKEN_SYMBOL || 'PYUSD'
      }
    };

  } catch (error) {
    console.error('Transaction validation error:', error);
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown validation error'
    };
  }
}