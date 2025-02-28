import { ChatOpenAI } from "@langchain/openai";
import { ChatOllama } from "@langchain/community/chat_models/ollama";

// สำหรับเชื่อมต่อกับ OpenAI (ใช้ตอนพัฒนา)
export const openaiLLM = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  temperature: 0.2,
  modelName: "gpt-4",
});

// สำหรับเชื่อมต่อกับ LMStudio (ใช้ตอนใช้งานจริง)
export const localLLM = new ChatOllama({
  baseUrl: process.env.LMSTUDIO_API_URL || "http://localhost:11434",
  model: process.env.LMSTUDIO_MODEL_NAME || "llama2",
  temperature: 0.1,
});

// เลือก LLM ตามสภาพแวดล้อม
export const llm = process.env.USE_LOCAL_LLM === "true" ? localLLM : openaiLLM;