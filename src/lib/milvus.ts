import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const MILVUS_ADDRESS = process.env.MILVUS_ADDRESS || 'localhost:19530';

export const milvusClient = new MilvusClient(MILVUS_ADDRESS);

// ฟังก์ชันตรวจสอบและสร้างคอลเลกชันสำหรับ answer key embeddings
export async function ensureAnswerKeyCollection() {
  const collectionName = 'answer_key_embeddings';
  const hasCollection = await milvusClient.hasCollection({
    collection_name: collectionName,
  });

  if (!hasCollection) {
    // สร้างคอลเลกชันใหม่
    await milvusClient.createCollection({
      collection_name: collectionName,
      fields: [
        {
          name: 'id',
          data_type: 'Int64',
          is_primary_key: true,
          autoID: true,
        },
        {
          name: 'answer_key_id',
          data_type: 'VarChar',
          max_length: 36,
        },
        {
          name: 'chunk_id',
          data_type: 'Int64',
        },
        {
          name: 'content_chunk',
          data_type: 'VarChar',
          max_length: 65535,
        },
        {
          name: 'embedding',
          data_type: 'FloatVector',
          dim: 1536, // ขนาดของเวกเตอร์ (ขึ้นอยู่กับโมเดล embedding ที่ใช้)
        },
      ],
    });

    // สร้าง index สำหรับค้นหาเวกเตอร์
    await milvusClient.createIndex({
      collection_name: collectionName,
      field_name: 'embedding',
      index_type: 'HNSW',
      metric_type: 'COSINE',
      params: { M: 8, efConstruction: 200 },
    });
  }

  return collectionName;
}

// ทำแบบเดียวกันสำหรับคอลเลกชัน student_answer_embeddings
export async function ensureStudentAnswerCollection() {
  // คล้ายกับด้านบน แต่ใช้ชื่อคอลเลกชันต่างกัน
}