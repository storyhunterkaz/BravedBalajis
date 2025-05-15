# BravedBalajis

A personalized learning platform that transforms X user activity into sovereignty-focused learning experiences, inspired by Balaji Srinivasan's Network State philosophy.

## Features

- 🐝 Mrs. Been AI character delivering 5-minute daily lessons
- 📚 BRAVED topics: Bitcoin, RWAs, AI, VR/AR, Emotional Intelligence, Decentralization
- 🔥 Streak tracking and progress monitoring
- 🎯 Future NFT rewards system (structure prepared)
- ⚡ High-performance architecture (<2s API response times)
- 🔄 Scalable design for thousands of users

## Tech Stack

- Backend: Node.js with Express
- Frontend: React with Styled Components
- AI Integration: Agno MCP
- Database: In-memory storage (MVP)

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Agno API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bravedbalajis.git
cd bravedbalajis
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
AGNO_API_KEY="your-agno-api-key"
PORT=3000
REACT_APP_API_URL="http://localhost:3000"
```

4. Start the development servers:
```bash
npm start
```

This will start both the backend (port 3000) and frontend (port 3001) servers concurrently.

## Development

- Backend API endpoints are in `/backend`
- Frontend React components are in `/src`
- Agno MCP integration is handled in `/backend/server.js`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 