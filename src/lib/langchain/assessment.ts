import { llm } from "./llm";
import { embeddings } from "./embeddings";
import { getMilvusClient } from "../milvus/client";
import { supabaseAdmin } from "../supabase/server";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// ฟังก์ชันสำหรับประเมินคำตอบของนักเรียน
export async function assessStudentAnswer(
  studentAnswerId: string,
  answerKeyId: string
) {
  // ดึงข้อมูลคำตอบนักเรียนจาก Supabase
  const { data: studentAnswer } = await supabaseAdmin
    .from('student_answers')
    .select('*')
    .eq('student_answer_id', studentAnswerId)
    .single();
    
  if (!studentAnswer) {
    throw new Error('Student answer not found');
  }
  
  // ดึงข้อมูลเฉลยจาก Supabase
  const { data: answerKey } = await supabaseAdmin
    .from('answer_keys')
    .select('*')
    .eq('answer_key_id', answerKeyId)
    .single();
    
  if (!answerKey) {
    throw new Error('Answer key not found');
  }
  
  // สร้าง embedding สำหรับคำตอบนักเรียน
  const [studentEmbedding] = await embeddings.embedDocuments([studentAnswer.content]);
  
  // ค้นหาส่วนของเฉลยที่เกี่ยวข้องจาก Milvus
  const client = getMilvusClient();
  const searchResults = await client.search({
    collection_name: 'answer_key_embeddings',
    vector: studentEmbedding,
    limit: 3,
    output_fields: ['content_chunk'],
  });
  
  // สร้างบริบทจากเฉลยที่เกี่ยวข้อง
  const relevantAnswerKeyContent = searchResults.results
    .map(result => result.content_chunk)
    .join("\n\n");
    
  // สร้าง prompt สำหรับ LLM
  const promptTemplate = PromptTemplate.fromTemplate(`
    คุณเป็นผู้ช่วยตรวจข้อสอบอัตนัยที่มีความเชี่ยวชาญ

    # เฉลยของอาจารย์:
    {answerKey}

    # คำตอบของนักเรียน:
    {studentAnswer}

    # คำแนะนำ:
    - ให้คะแนนในช่วง 0-100
    - อธิบายจุดเด่นและจุดด้อยของคำตอบ
    - ให้คำแนะนำเพื่อปรับปรุง
    - ระบุระดับความมั่นใจในการตรวจ (0-100%)

    # การประเมิน:
    `);
    
  // เรียกใช้ LLM
  const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser());
  const assessment = await chain.invoke({
    answerKey: relevantAnswerKeyContent || answerKey.content,
    studentAnswer: studentAnswer.content,
  });
  
  // แยกคะแนนและความมั่นใจจากการตรวจ (อาจต้องพัฒนาตามรูปแบบผลลัพธ์)
  const scoreMatch = assessment.match(/คะแนน[^\d]*(\d+)/);
  const confidenceMatch = assessment.match(/ความมั่นใจ[^\d]*(\d+)/);
  
  const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
  const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 70;
  
  // บันทึกผลการประเมินลงใน Supabase
  const { data: assessmentRecord } = await supabaseAdmin
    .from('assessments')
    .insert({
      student_answer_id: studentAnswerId,
      answer_key_id: answerKeyId,
      score: score,
      max_score: 100,
      feedback_text: assessment,
      confidence: confidence,
      is_approved: false,
      assessment_date: new Date().toISOString(),
    })
    .select()
    .single();
    
  return {
    assessmentId: assessmentRecord.assessment_id,
    score,
    feedback: assessment,
    confidence,
  };
}