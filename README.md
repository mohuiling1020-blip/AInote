# MindSpark - Next.js Version

A Next.js application that transforms fragmented thoughts into structured knowledge using AI.

## Features

- 🎨 Beautiful Morandi color palette with diffuse gradient background
- 🔒 Secure API key storage on the backend
- 🤖 Support for multiple AI models:
  - **Gemini Flash**: Fast and efficient
  - **Qwen3 Max**: Advanced reasoning
- 📝 Drag-and-drop note cards with glassmorphism design
- 🎯 Intelligent note classification (Action, Query, Idea, Resource)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Gemini API Key (for gemini-flash model)
GEMINI_API_KEY=your_gemini_api_key_here

# Qwen API Key (for qwen3-max model)
QWEN_API_KEY=sk-a2aaa4f67c21429a96a215316f54209c
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── api/
│   │   └── process-note/    # Backend API route for AI processing
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Main page
│   └── globals.css           # Global styles
├── components/
│   ├── InputBar.tsx          # Input component
│   └── NoteCard.tsx          # Note card component
├── services/
│   └── apiService.ts         # Frontend API service
└── types.ts                  # TypeScript types
```

## Security

- API keys are stored securely on the backend in environment variables
- Frontend never exposes API keys to the client
- All AI processing happens server-side

## Model Selection

Users can switch between models in the settings panel:
- **Gemini Flash**: Uses Google's Gemini API
- **Qwen3 Max**: Uses Alibaba Cloud's Qwen API (OpenAI-compatible)
