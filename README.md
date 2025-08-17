# VistAI - AI Chat with Wallet Integration

A AI chat application wallet integration, powered by OpenRouter AI models. Chat with GPT-4, Claude, Llama, and more while managing your wallet.

## 🚀 Features

- **🤖 AI Chat**: Access to 100+ AI models via OpenRouter (GPT-4, Claude, Llama, etc.)
- **💼 Wallet Integration**: Connect Ethereum wallets with Dynamic SDK
- **🔧 Model Selection**: Choose from various AI models

## 🏗️ Architecture

```
├── frontend/          # Next.js 15 React application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   ├── lib/          # Services and utilities
│   └── public/       # Static assets
└── backend/           # Express.js API server
    └── src/
        ├── index.ts   # Main server setup
        ├── openrouter-proxy.ts # OpenRouter API proxy
        └── models.ts  # Models endpoint
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Dynamic SDK** - Ethereum wallet integration
- **React Markdown** - Rich message rendering
- **Prism.js** - Syntax highlighting

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **node-fetch** - HTTP client
- **CORS** - Cross-origin support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenRouter API key
- Ethereum wallet

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd ethglobal
```

### 2. Backend Setup
```bash
cd backend
npm install
# Create .env file with your OpenRouter API key:
# OPENROUTER_API_KEY=sk-...
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Connect Wallet & Chat
- Visit `http://localhost:3000`
- Connect your Ethereum wallet
- Start chatting with AI models!

## 📁 Project Structure

```
ethglobal/
├── README.md                 # This file
├── SETUP.md                  # Detailed setup guide
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── index.ts         # Main server setup
│   │   ├── openrouter-proxy.ts # OpenRouter API proxy
│   │   └── models.ts        # Models endpoint
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json        # TypeScript config
└── frontend/                # Next.js React app
    ├── app/                 # App router pages
    ├── components/          # React components
    ├── lib/                 # Services and utilities
    ├── public/              # Static assets
    ├── package.json         # Frontend dependencies
    └── tsconfig.json        # TypeScript config
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
OPENROUTER_API_KEY=sk-...    # OpenRouter API key
PORT=3001                    # Server port (optional)
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 🚀 Development

### Backend
```bash
cd backend
npm run dev    # Development mode
npm start      # Production mode
```

### Frontend
```bash
cd frontend
npm run dev    # Development mode
npm run build  # Build for production
npm start      # Start production server
```

## 📚 API Endpoints

- `GET /health` - Health check
- `GET /v1/models` - Available AI models
- `POST /v1/chat/completions` - Chat with AI

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **OpenRouter API**: [OpenRouter documentation](https://openrouter.ai/docs)
- **Dynamic SDK**: [Dynamic documentation](https://docs.dynamic.xyz)
- **Issues**: Open an issue in this repository

## 🙏 Acknowledgments

- [OpenRouter](https://openrouter.ai) for AI model access
- [Dynamic Labs](https://dynamic.xyz) for wallet integration
- [Next.js](https://nextjs.org) for the React framework

---

Built with ❤️ for the Ethereum ecosystem
