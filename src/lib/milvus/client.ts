import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusEndpoint = process.env.MILVUS_ENDPOINT || 'localhost:19530';

let milvusClient: MilvusClient | null = null;

export const getMilvusClient = () => {
  if (!milvusClient) {
    milvusClient = new MilvusClient(milvusEndpoint);
  }
  return milvusClient;
};

export async function createAnswerKeyCollection() {
  const client = getMilvusClient();
  
  // ตรวจสอบว่าคอลเลกชันมีอยู่แล้วหรือไม่
  const hasCollection = await client.hasCollection({
    collection_name: 'answer_key_embeddings',
  });
  
  if (!hasCollection.value) {
    await client.createCollection({
      collection_name: 'answer_key_embeddings',
      fields: [
        {
          name: 'id',
          data_type: 5, // DataType.INT64
          is_primary_key: true,
          autoID: true,
        },
        {
          name: 'answer_key_id',
          data_type: 21, // DataType.VARCHAR
          max_length: 36,
        },
        {
          name: 'chunk_id',
          data_type: 5, // DataType.INT64
        },
        {
          name: 'content_chunk',
          data_type: 21, // DataType.VARCHAR
          max_length: 65535,
        },
        {
          name: 'embedding',
          data_type: 101, // DataType.FLOAT_VECTOR
          dim: 1536,
        },
      ],
    });
    
    // สร้าง index
    await client.createIndex({
      collection_name: 'answer_key_embeddings',
      field_name: 'embedding',
      index_type: 'HNSW',
      metric_type: 'COSINE',
      params: { M: 8, efConstruction: 200 },
    });
  }
  
  return client;
}

// เพิ่มฟังก์ชันสำหรับคอลเลกชันของคำตอบนักเรียนเช่นกัน