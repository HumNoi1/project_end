import { ChatOpenAI } from '@langchain/openai';
import { OpenAIEmbeddings } from '@langchain/openai';

// กำหนดค่า endpoint สำหรับ LMStudio
const localAIEndpoint = process.env.LM_STUDIO_ENDPOINT || 'http://localhost:1234/v1';
const localAIKey = 'not-needed';  // LMStudio อาจไม่ต้องการ API key

// สร้าง LLM model สำหรับการตรวจและวิเคราะห์คำตอบ
export const llm = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo', // หรือชื่อโมเดลที่ใช้ใน LMStudio
  temperature: 0.2,
  maxTokens: 4000,
  baseURL: localAIEndpoint,
  apiKey: localAIKey,
});

// สร้าง embedding model สำหรับแปลงข้อความเป็นเวกเตอร์
export const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-ada-002', // หรือโมเดลที่ LMStudio รองรับ
  batchSize: 512,
  stripNewLines: true,
  baseURL: localAIEndpoint,
  apiKey: localAIKey,
});