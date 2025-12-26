# MindSpark - Next.js Version

A Next.js application that transforms fragmented thoughts into structured knowledge using AI.

AI便签：https://ainote-eight.vercel.app/
（MVP因为暂时部署在一个国外云服务器上所以需要翻墙）
1. 场景与故事 
作为一个ADHD，我经常有很多碎片化的想法（灵感/待办），通常是先发给微信文件传输助手。但当我空下来想处理时，链路太长了：复制 -> 翻墙 -> 打开LLM -> 粘贴 -> 交互。这就导致很多灵感‘记了白记’，变成了死数据。我认为记录不应该只是存储，而应该触发思考。
一个讲好故事的场景：
很多AI产品的桌面端下载量很大，但‘每日首次对话’的渗透率却不高。我一直在想，为什么用户明明装了，却想不起来用？‘主动找AI聊天’这件事的认知负荷太重了。当用户想到要找AI时，他往往已经很累了。这时候让他去思考AI的边界、去组织Prompt，本质上是在要求用户‘在收益未知的情况下，先付出巨大的输入成本’。
所以，我做这个AI便签的核心逻辑是：用‘零边际成本’换取‘增量价值’。
旧体验：用户本来就要记便签，就要Mark一下。这个动作不仅没有迁移成本，甚至是一种肌肉记忆。
新体验：我在用户完成‘Mark’这个低成本动作后，异步地把AI的价值推给他。
我不需要用户刻意去‘聊’，我只需要用户‘记’。Mark即Query。这种‘把AI藏在习惯背后’的设计，我认为是打破当前AI应用‘高下载低活跃’魔咒的一个解法，也是我希望在未来的产品中去验证的方向。”


2. 核心思考 (Task & Solution)
Mark = Query = Result。Mark 这件事本身就是一个「既轻又异步」的过程，轻=频次高/要求相对简单；异步=实时性要求低，这个过程中应该要让AI帮我做点什么（给点启发、做点判断、梳理代办list 等）
轻交互：前端极简，像便签一样，保证记录的低门槛。
异步Agent：这是核心。用户记录后不仅是‘保存’，而是触发一个后台Agent。
如果识别为**【待办】**（比如‘下周要做竞品分析’），Agent自动拆解成Checklist。
如果识别为【灵感】（比如‘关于猫箱的一个新玩法’），Agent自动调用Gemini进行脑暴发散，生成3个维度的建议。
如果识别为【问题】，AI给我回答。这样利用‘碎片时间的空隙’，让AI帮我完成了预处理。”

3.下一步计划
P0每日回顾，分析总结
P1商业化尝试，依赖集成国内外登陆、注册、支付等

欢迎给我反馈体验建议和沟通探讨~

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

# Optional: Proxy configuration (if needed for network access)
# HTTP_PROXY=http://proxy-server:port
# HTTPS_PROXY=http://proxy-server:port
# Or use lowercase versions:
# http_proxy=http://proxy-server:port
# https_proxy=http://proxy-server:port
```

**Note:** If you're experiencing network connection issues (especially in regions where Google services are restricted), you may need to configure a proxy. Set `HTTP_PROXY` and `HTTPS_PROXY` environment variables in your `.env.local` file or system environment.

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
