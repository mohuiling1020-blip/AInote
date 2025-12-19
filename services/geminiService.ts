import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NoteType, AIResponse } from "../types";

const MODEL_NAME = "gemini-3-flash-preview";

// Define the expected JSON schema for the model output
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    intent: {
      type: Type.STRING,
      enum: ["Action", "Query", "Idea", "Resource"],
      description: "Classify the user input into one of these categories.",
    },
    title: {
      type: Type.STRING,
      description: "A short, punchy title for the note.",
    },
    content: {
      type: Type.STRING,
      description: "The AI-processed content in Markdown format (lists, bolding, code blocks).",
    },
    meta: {
      type: Type.OBJECT,
      properties: {
        tags: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Relevant tags.",
        },
        suggested_action: {
          type: Type.STRING,
          description: "Optional next step.",
        },
        deadline: {
          type: Type.STRING,
          description: "Optional extracted date string.",
        },
      },
      required: ["tags"],
    },
  },
  required: ["intent", "title", "content", "meta"],
};

export const processNoteWithGemini = async (
  content: string,
  apiKey: string
): Promise<AIResponse> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `
# Role
你是 MindSpark，一个旨在将人类碎片化思维转化为结构化知识的智能引擎。你的核心目标是接收用户的原始输入（"Mark"），精准识别其意图，并基于意图生成高价值的增强内容（"Result"）。

# Workflow
当接收到用户输入时，请按以下步骤处理：
1. **意图识别**：分析文本语义，将输入归类为以下四类之一。
2. **内容增强**：根据分类执行特定的处理逻辑。
3. **格式输出**：输出符合指定Schema的纯JSON数据。

# Classification & Handling Logic

## 1. Action (待办/计划)
- **触发条件**：包含明确动作、时间、计划、提醒的文本（如“明天发邮件”、“准备周报”）。
- **处理逻辑**：
    - 提取核心任务作为标题。
    - **极度简洁**：直接列出执行步骤。
    - **必须**使用无序列表格式 ("- 步骤")，前端会将这些渲染为复选框。
    - 严禁包含 "Here is the list" 或 "步骤如下" 等废话。
- **输出风格**：清单体，简练，动词开头。

## 2. Query (百科/技术/问答)
- **触发条件**：疑问句、专有名词、技术概念、How-to 问题。
- **处理逻辑**：
    - 给出简明扼要的定义或直接回答。
    - 如果涉及编程，**必须**提供代码片段。
    - 如果是概念，提供一个易于理解的比喻。
- **输出风格**：专家口吻，逻辑清晰，Markdown 格式。

## 3. Idea (灵感/脑暴)
- **触发条件**：观点陈述、碎片化想法、"如果不...会怎样"、感悟。
- **处理逻辑**：
    - 利用 SCAMPER (替代/合并/改造/修改/用途/消除/重组) 模型对灵感进行发散。
    - 列出该想法潜在的 Pros (优点) 和 Cons (挑战)。
- **输出风格**：启发性，鼓励思考。

## 4. Resource (资源/链接)
- **触发条件**：URL 链接、书籍名称、论文标题。
- **处理逻辑**：
    - 生成一段 50 字以内的一句话摘要（TL;DR）。
    - 提取 3 个核心 Key Takeaways (关键收获)。
- **输出风格**：摘要性，提取精华。

# Constraints
1. **只输出 JSON**，严禁输出任何寒暄语或解释性文字。
2. 保持中文回复（除非用户输入的内容显式要求英文）。
3. 如果无法识别意图，默认归类为 "Query"。
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: content,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.3,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    const parsed = JSON.parse(text) as AIResponse;
    return parsed;
  } catch (error) {
    console.error("Gemini processing error:", error);
    throw error;
  }
};