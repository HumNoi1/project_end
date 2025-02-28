import { llm } from '@/lib/langchain';
import { findRelevantAnswerKeyChunks } from '@/lib/embeddings';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';

// ตรวจคำตอบโดยเทียบกับเฉลย
export async function assessStudentAnswer(
  answerKeyId: string,
  answerKeyContent: string,
  studentAnswerContent: string,
  maxScore: number
) {
  // 1. ค้นหาส่วนที่เกี่ยวข้องจากเฉลย
  const relevantChunks = await findRelevantAnswerKeyChunks(
    answerKeyId,
    studentAnswerContent
  );
  
  // 2. รวมข้อความที่เกี่ยวข้อง
  const relevantContent = relevantChunks.map(chunk => chunk.content).join("\n\n");
  
  // 3. สร้าง prompt สำหรับ LLM
  const systemPrompt = `คุณเป็นผู้ช่วยตรวจข้อสอบอัตนัยที่มีความเชี่ยวชาญ กรุณาตรวจคำตอบของนักเรียนโดยเปรียบเทียบกับเฉลย
และให้คะแนนตามความถูกต้อง ความครบถ้วน และคุณภาพของคำตอบ โดยคะแนนเต็มคือ ${maxScore} คะแนน

คุณต้องวิเคราะห์ดังนี้:
1. ความถูกต้องของเนื้อหา (ถูกต้องตามเฉลยมากน้อยเพียงใด)
2. ความครบถ้วนของประเด็นสำคัญ (ครอบคลุมทุกประเด็นหรือไม่)
3. การใช้ภาษาและการเรียบเรียง (ชัดเจน กระชับ เข้าใจง่าย)
4. การให้เหตุผลและการอธิบาย (มีการวิเคราะห์เชิงลึกหรือไม่)

ให้ตอบในรูปแบบนี้:
- คะแนน: [คะแนนที่ได้ เป็นตัวเลข]
- ความมั่นใจในการตรวจ: [เปอร์เซ็นต์ความมั่นใจ 0-100]
- ความคิดเห็น: [คำอธิบายการให้คะแนน จุดเด่น จุดด้อย]
- ข้อเสนอแนะ: [คำแนะนำสำหรับการปรับปรุง]`;

  // 4. ส่งคำขอไปยัง LLM
  const response = await llm.invoke([
    new SystemMessage(systemPrompt),
    new HumanMessage(`
# เฉลย
${relevantContent}

# คำตอบนักเรียน
${studentAnswerContent}
    `)
  ]);
  
  // 5. แปลงผลลัพธ์เป็นโครงสร้างข้อมูล
  const outputText = response.content.toString();
  
  // แยกคะแนนและความมั่นใจจากข้อความ
  const scoreMatch = outputText.match(/คะแนน:\s*(\d+(\.\d+)?)/i);
  const confidenceMatch = outputText.match(/ความมั่นใจในการตรวจ:\s*(\d+(\.\d+)?)/i);
  const feedback = outputText.replace(/คะแนน:.*\n/i, '')
                             .replace(/ความมั่นใจในการตรวจ:.*\n/i, '');
  
  return {
    score: scoreMatch ? parseFloat(scoreMatch[1]) : 0,
    confidence: confidenceMatch ? parseFloat(confidenceMatch[1]) : 0,
    feedback,
    rawOutput: outputText,
  };
}