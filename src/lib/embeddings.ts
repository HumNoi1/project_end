import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { embeddings } from './langchain';
import { milvusClient, ensureAnswerKeyCollection, ensureStudentAnswerCollection } from './milvus';

// แบ่งข้อความเป็นส่วนย่อยเพื่อทำ embeddings
export async function splitDocument(text: string) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  
  return await splitter.splitText(text);
}

// สร้าง embeddings สำหรับเฉลย
export async function createAnswerKeyEmbeddings(answerKeyId: string, content: string) {
  // 1. แบ่งเนื้อหาเป็นชิ้นๆ
  const chunks = await splitDocument(content);
  
  // 2. สร้าง embeddings
  const embeddingResults = await embeddings.embedDocuments(chunks);
  
  // 3. ตรวจสอบและเตรียมคอลเลกชัน
  const collectionName = await ensureAnswerKeyCollection();
  
  // 4. เตรียมข้อมูลสำหรับ Milvus
  const entities = chunks.map((chunk, i) => ({
    answer_key_id: answerKeyId,
    chunk_id: i,
    content_chunk: chunk,
    embedding: embeddingResults[i],
  }));
  
  // 5. บันทึกลง Milvus
  await milvusClient.insert({
    collection_name: collectionName,
    fields_data: entities,
  });
  
  return chunks.length; // จำนวนชิ้นที่สร้าง
}

// สร้าง embeddings สำหรับคำตอบนักเรียน (คล้ายกับด้านบน)
export async function createStudentAnswerEmbeddings(studentAnswerId: string, content: string) {
  // คล้ายกับด้านบน
}

// ค้นหาส่วนของเฉลยที่เกี่ยวข้องกับคำตอบนักเรียน
export async function findRelevantAnswerKeyChunks(answerKeyId: string, studentAnswerContent: string, topK = 3) {
  // 1. สร้าง embedding จากคำตอบนักเรียน
  const queryEmbedding = await embeddings.embedQuery(studentAnswerContent);
  
  // 2. ค้นหาใน Milvus
  const results = await milvusClient.search({
    collection_name: 'answer_key_embeddings',
    expr: `answer_key_id == "${answerKeyId}"`,
    vectors: [queryEmbedding],
    search_params: {
      metric_type: 'COSINE',
      params: { ef: 64 },
    },
    output_fields: ['content_chunk', 'chunk_id'],
    limit: topK,
  });
  
  return results.results.map(match => ({
    content: match.content_chunk,
    score: match.score,
    chunkId: match.chunk_id,
  }));
}