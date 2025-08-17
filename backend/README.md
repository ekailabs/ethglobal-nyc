# OpenRouter Proxy Backend

Backend proxy for OpenRouter AI models with HTTP 402 payment integration. Supports pay-per-use via blockchain micro-transactions using stablecoins.

## Features

- 🤖 **Multi-model**: Access to 100+ AI models through OpenRouter
- 🔒 **API Key Security**: End-users do not need API keys
- 💳 **HTTP 402 Payment Required**: Implements payment standards for API access
- 🔗 **Blockchain Payment Validation**: Validates PYUSD or any token transactions on Base Sepolia
- 🚀 **Simple Setup**: Minimal configuration required
- ⚙️ **Configurable Payment**: Toggle payment requirements and validation

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or pnpm
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd openrouter-proxy-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenRouter API key
   ```

4. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm run build
   npm start
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `OPENROUTER_API_KEY` | Your OpenRouter API key | **Required** |
| `ENABLE_PAYMENT_REQUIRED` | Enable HTTP 402 payment requirement | `true` |
| `ENABLE_TX_VALIDATION` | Enable blockchain transaction validation | `true` |
| `PAYMENT_RECIPIENT` | Payment recipient address | - |
| `PAYMENT_AMOUNT` | Required payment amount | `50000` |
| `PAYMENT_TOKEN_SYMBOL` | Payment token symbol | `PYUSD` |
| `PAYMENT_TOKEN_ADDRESS` | Payment token contract address | - |
| `BASE_SEPOLIA_RPC` | Base Sepolia RPC URL | `https://sepolia.base.org` |

## API Endpoints

### Health Check
```http
GET /health
```

### Get Available Models
```http
GET /v1/models
```

### Chat Completions
```http
POST /v1/chat/completions
```

**Without Payment** (when `ENABLE_PAYMENT_REQUIRED=false`):
```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "anthropic/claude-3.5-sonnet",
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

**With Payment** (when `ENABLE_PAYMENT_REQUIRED=true`):
```bash
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "tx_hash": "0x777a34705d68431748145b12800f055e694930d554f0b4a8664f9efc3904a969",
    "model": "anthropic/claude-3.5-sonnet", 
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

## Payment System

**x402 Standard Implementation** - Modified version without facilitator component.

**Flow**: Request without payment → HTTP 402 response → Pay → Request with `tx_hash` → API access

**Validation**: Direct blockchain verification on Base Sepolia for PYUSD transfers.

**Configuration**:
- `ENABLE_PAYMENT_REQUIRED=false` - Disable payments entirely
- `ENABLE_TX_VALIDATION=false` - Accept any tx_hash without validation

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

## Credits

Modified **[x402 standard](https://github.com/coinbase/x402/)** - removes facilitator component, implements direct blockchain validation. 