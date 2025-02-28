import { NextRequest, NextResponse } from 'next/server';
import { assessStudentAnswer } from '@/services/llm-service';
import { supabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { studentAnswerId, answerKeyId } = body;
    
    // 1. ดึงข้อมูลคำตอบและเฉลยจาก Supabase
    const { data: studentAnswer, error: studentError } = await supabase
      .from('student_answers')
      .select('content')
      .eq('student_answer_id', studentAnswerId)
      .single();
      
    if (studentError || !studentAnswer) {
      return NextResponse.json(
        { error: 'ไม่พบคำตอบของนักเรียน' },
        { status: 404 }
      );
    }
    
    const { data: answerKey, error: keyError } = await supabase
      .from('answer_keys')
      .select('content, max_score')
      .eq('answer_key_id', answerKeyId)
      .single();
      
    if (keyError || !answerKey) {
      return NextResponse.json(
        { error: 'ไม่พบเฉลย' },
        { status: 404 }
      );
    }
    
    // 2. ตรวจคำตอบ
    const assessment = await assessStudentAnswer(
      answerKeyId,
      answerKey.content,
      studentAnswer.content,
      answerKey.max_score || 100
    );
    
    // 3. บันทึกผลการตรวจลง Supabase
    const { data: savedAssessment, error: saveError } = await supabase
      .from('assessments')
      .insert({
        student_answer_id: studentAnswerId,
        answer_key_id: answerKeyId,
        score: assessment.score,
        max_score: answerKey.max_score || 100,
        feedback_text: assessment.feedback,
        confidence: assessment.confidence,
        is_approved: false,
      })
      .select()
      .single();
      
    if (saveError) {
      console.error('Error saving assessment:', saveError);
      return NextResponse.json(
        { error: 'ไม่สามารถบันทึกผลการตรวจได้' },
        { status: 500 }
      );
    }
    
    // 4. บันทึกการใช้งาน LLM
    await supabase.from('llm_usage_logs').insert({
      operation_type: 'check_answer',
      input_prompt: `Student Answer ID: ${studentAnswerId}, Answer Key ID: ${answerKeyId}`,
      output_text: assessment.rawOutput,
      processing_time: 0, // ควรวัดเวลาจริง
      token_count: 0, // ควรคำนวณจากการใช้งานจริง
      assessment_id: savedAssessment.assessment_id,
    });
    
    return NextResponse.json({
      success: true,
      assessment: {
        id: savedAssessment.assessment_id,
        score: assessment.score,
        maxScore: answerKey.max_score || 100,
        feedback: assessment.feedback,
        confidence: assessment.confidence,
      }
    });
    
  } catch (error) {
    console.error('Error in check-answer API:', error);
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการตรวจคำตอบ' },
      { status: 500 }
    );
  }
}