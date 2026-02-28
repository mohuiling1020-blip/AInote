import { GoogleGenAI, Type, Schema } from '@google/genai';
import OpenAI from 'openai';
import { DbNote } from '@/types';
import { DailyReviewSummary } from '@/types/daily-review';

const GEMINI_MODEL_NAME = 'gemini-3-flash-preview';
const QWEN_MODEL_NAME = 'qwen3-max';

// JSON schema for Gemini structured output
const reviewSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: '今日复盘的标题，简洁有力，10字以内',
    },
    summary: {
      type: Type.STRING,
      description: '今日思维摘要，200字以内，Markdown格式',
    },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3-5个关键词标签',
    },
    provocativeQuestion: {
      type: Type.STRING,
      description: '一个启发性的追问，引导用户深度思考',
    },
    clusters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          theme: { type: Type.STRING, description: '主题名称' },
          summary: { type: Type.STRING, description: '主题下笔记的关联摘要' },
          noteIds: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '属于该主题的笔记ID列表',
          },
        },
        required: ['theme', 'summary', 'noteIds'],
      },
      description: '按主题聚类的笔记分组（2-5组）',
    },
  },
  required: ['title', 'summary', 'tags', 'provocativeQuestion', 'clusters'],
};

function buildReviewPrompt(notes: DbNote[]): string {
  const notesText = notes.map((n, i) => {
    const title = n.title || '无标题';
    const content = n.processed_content || n.content;
    const tags = (n.tags ?? []).join(', ');
    return `[笔记${i + 1}] ID: ${n.id}\n标题: ${title}\n内容: ${content}\n标签: ${tags}\n类型: ${n.type}`;
  }).join('\n\n---\n\n');

  return `# 角色
你是用户的"思维搭子"——一个聪明、有趣、真诚的朋友。你刚刚翻看了用户今天的笔记，现在要用轻松的方式帮 ta 回顾今天的思考。

# 语气指南
- 像朋友聊天，不像写报告。可以用"你今天…"、"有意思的是…"、"我注意到…"
- 适当用比喻、类比，把抽象的发现说得生动
- 真诚地指出亮点，也可以俏皮地提出疑问
- 避免"总结如下"、"综上所述"等公文体
- 可以用 emoji 点缀，但别过度（1-2个即可）

# 输入
以下是用户今天的 ${notes.length} 条笔记：

${notesText}

# 任务
请分析以上笔记，生成：
1. **标题**：今日思维主题的有趣概括（10字以内，可以用比喻或意象）
2. **摘要**：用聊天的口吻串联今天的思考脉络（200字以内，Markdown格式）。像是对朋友说"嘿，你今天想的这些事其实挺有意思的——"
3. **标签**：提取 3-5 个关键词标签
4. **启发追问**：提一个让人忍不住想回答的问题。不要正确但无聊的追问，要有洞察力的、甚至有点挑衅的好问题
5. **主题聚类**：将笔记按主题分成 2-5 个组，每组包含主题名、组内摘要、笔记ID列表。组内摘要也要有趣，点出笔记之间意想不到的联系

# 约束
- 只输出 JSON，严禁输出任何解释性文字
- 聚类中的 noteIds 必须使用笔记的实际 UUID
- 每条笔记只能属于一个聚类
- 保持中文回复`;
}

function buildHookPrompt(historicalNote: DbNote, todayTags: string[]): string {
  const title = historicalNote.title || '无标题';
  const content = historicalNote.processed_content || historicalNote.content;
  const tags = (historicalNote.tags ?? []).join(', ');

  return `# 角色
你是 MindSpark 的"灵感连结"引擎。你的任务是生成一段简短的引导语，将一条历史笔记与用户今天的思考联系起来。

# 历史笔记
标题: ${title}
内容: ${content}
标签: ${tags}
创建时间: ${historicalNote.created_at}

# 今日关键词
${todayTags.join(', ')}

# 任务
生成一段 30-50 字的引导语，解释这条历史笔记与今天的思考之间可能的关联。语气温和启发，像朋友提醒。

# 约束
- 只输出引导语文本，不要包含任何格式标记
- 保持中文回复`;
}

export async function generateReviewSummary(
  notes: DbNote[],
  model: string,
): Promise<DailyReviewSummary> {
  const prompt = buildReviewPrompt(notes);

  if (model === 'gemini-flash') {
    return generateReviewWithGemini(prompt);
  }
  return generateReviewWithQwen(prompt);
}

async function generateReviewWithGemini(prompt: string): Promise<DailyReviewSummary> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const httpOptions: Record<string, unknown> = {};
  if (process.env.GEMINI_PROXY_URL) {
    httpOptions.baseUrl = process.env.GEMINI_PROXY_URL;
  }
  httpOptions.timeout = 60000;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: Object.keys(httpOptions).length > 0 ? httpOptions : undefined,
  });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: reviewSchema,
      temperature: 0.5,
    },
  });

  const text = response.text;
  if (!text) throw new Error('Empty response from Gemini');

  return JSON.parse(text) as DailyReviewSummary;
}

async function generateReviewWithQwen(prompt: string): Promise<DailyReviewSummary> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error('QWEN_API_KEY is not configured');
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  });

  const completion = await client.chat.completions.create({
    model: QWEN_MODEL_NAME,
    messages: [
      {
        role: 'system',
        content: `${prompt}\n\nYou must respond with valid JSON only, following this structure: {"title": "...", "summary": "...", "tags": [...], "provocativeQuestion": "...", "clusters": [{"theme": "...", "summary": "...", "noteIds": [...]}]}`,
      },
      { role: 'user', content: '请生成今日复盘摘要。' },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.5,
    stream: false,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('Empty response from Qwen API');
  }

  let cleanedText = responseText.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const parsed = JSON.parse(cleanedText) as DailyReviewSummary;
  if (!parsed.title || !parsed.summary || !parsed.clusters) {
    throw new Error('Invalid review summary structure from Qwen API');
  }
  return parsed;
}

export async function generateHistoricalHook(
  historicalNote: DbNote,
  todayTags: string[],
  model: string,
): Promise<string> {
  const prompt = buildHookPrompt(historicalNote, todayTags);

  if (model === 'gemini-flash') {
    return generateHookWithGemini(prompt);
  }
  return generateHookWithQwen(prompt);
}

async function generateHookWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const httpOptions: Record<string, unknown> = {};
  if (process.env.GEMINI_PROXY_URL) {
    httpOptions.baseUrl = process.env.GEMINI_PROXY_URL;
  }
  httpOptions.timeout = 60000;

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: Object.keys(httpOptions).length > 0 ? httpOptions : undefined,
  });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL_NAME,
    contents: prompt,
    config: { temperature: 0.7 },
  });

  const text = response.text;
  if (!text) throw new Error('Empty hook response from Gemini');
  return text.trim();
}

async function generateHookWithQwen(prompt: string): Promise<string> {
  const apiKey = process.env.QWEN_API_KEY;
  if (!apiKey) {
    throw new Error('QWEN_API_KEY is not configured');
  }

  const client = new OpenAI({
    apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  });

  const completion = await client.chat.completions.create({
    model: QWEN_MODEL_NAME,
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: '请生成引导语。' },
    ],
    temperature: 0.7,
    stream: false,
  });

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new Error('Empty hook response from Qwen API');
  return text.trim();
}
