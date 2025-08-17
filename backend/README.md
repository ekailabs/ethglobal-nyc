# OpenRouter Proxy Backend

A simple backend proxy service that provides access to OpenRouter AI models. This service acts as a middleman between your frontend applications and the OpenRouter API, keeping your API key secure on the server side.

## Features

- 🤖 **OpenRouter Integration**: Access to 100+ AI models through OpenRouter
- 🔒 **API Key Security**: Keep your OpenRouter API key server-side
- 🚀 **Simple Setup**: Minimal configuration required
- 🌐 **CORS Enabled**: Ready for frontend integration

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

## Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server

### Project Structure

```
src/
├── index.ts           # Main server setup and routes
├── openrouter-proxy.ts # OpenRouter API proxy logic
└── models.ts          # Models endpoint handler
```

## Dependencies

- **Express.js** - Web framework
- **node-fetch** - HTTP client for OpenRouter API
- **TypeScript** - Type safety and modern JavaScript features
- **CORS** - Cross-origin resource sharing

## Deployment

### Vercel
This service works with Vercel's serverless functions.

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["npm", "start"]
```

## Security Considerations

- ✅ **API Key Security** - OpenRouter key stays server-side
- ✅ **CORS configured** - Ready for frontend integration
- ✅ **Environment isolation** - Sensitive data in .env files

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues related to:
- **OpenRouter API**: Check [OpenRouter documentation](https://openrouter.ai/docs)
- **This service**: Open an issue in this repository
