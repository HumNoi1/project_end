import { OpenAIEmbeddings } from "@langchain/openai";
import { getMilvusClient } from "../milvus/client";
import { supabaseAdmin } from "../supabase/server";

// สร้าง embeddings model จาก OpenAI
export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "text-embedding-ada-002",
});

// ฟังก์ชันสำหรับแบ่งเนื้อหาเป็นส่วนย่อย (chunks)
export function splitTextIntoChunks(text: string, chunkSize = 1000, overlap = 200) {
  const chunks = [];
  const textLength = text.length;
  
  for (let i = 0; i < textLength; i += chunkSize - overlap) {
    const chunk = text.slice(i, i + chunkSize);
    chunks.push(chunk);
  }
  
  return chunks;
}

// ฟังก์ชันสำหรับสร้างและเก็บ embeddings ของเฉลย
export async function createAnswerKeyEmbeddings(
  answerKeyId: string,
  content: string
) {
  const chunks = splitTextIntoChunks(content);
  const client = getMilvusClient();
  
  // สร้าง embeddings สำหรับแต่ละ chunk
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const [embeddingVector] = await embeddings.embedDocuments([chunk]);
    
    // เก็บลงใน Milvus
    await client.insert({
      collection_name: 'answer_key_embeddings',
      fields_data: [{
        answer_key_id: answerKeyId,
        chunk_id: i,
        content_chunk: chunk,
        embedding: embeddingVector,
      }],
    });
  }
  
  // อัปเดตสถานะใน Supabase
  await supabaseAdmin
    .from('answer_keys')
    .update({
      milvus_collection_name: 'answer_key_embeddings',
      updated_at: new Date().toISOString(),
    })
    .eq('answer_key_id', answerKeyId);
    
  return chunks.length;
}