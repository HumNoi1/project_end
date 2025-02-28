'use client'

import { useEffect, useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Layout from '@/components/ui/Layout';
import Link from 'next/link';
import { ArrowLeft, Send, Save, AlertTriangle, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function CheckAnswerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const answerId = params.id;
  
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState<any>(null);
  const [answerKey, setAnswerKey] = useState<any>(null);
  const [assessment, setAssessment] = useState<any>(null);
  
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [confidence, setConfidence] = useState(90);
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    async function loadData() {
      try {
        // ดึงข้อมูลคำตอบ
        const { data: answerData, error: answerError } = await supabase
          .from('student_answers')
          .select(`
            *,
            students (name, student_id),
            answer_keys (*),
            folders (*)
          `)
          .eq('student_answer_id', answerId)
          .single();
          
        if (answerError || !answerData) {
          return notFound();
        }
        
        setAnswer(answerData);
        setAnswerKey(answerData.answer_keys);
        
        // ตรวจสอบว่ามีการประเมินหรือยัง
        const { data: assessmentData } = await supabase
          .from('assessments')
          .select('*')
          .eq('student_answer_id', answerId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (assessmentData) {
          setAssessment(assessmentData);
          setScore(assessmentData.score);
          setFeedback(assessmentData.feedback_text);
          setConfidence(assessmentData.confidence);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [answerId]);
  
  // ฟังก์ชันตรวจด้วย LLM
  const handleCheckWithLLM = async () => {
    if (!answer || !answerKey) return;
    
    setIsChecking(true);
    
    try {
      const response = await fetch('/api/assessment/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentAnswerId: answer.student_answer_id,
          answerKeyId: answerKey.answer_key_id,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to assess answer');
      }
      
      const result = await response.json();
      
      setScore(result.score);
      setFeedback(result.feedback);
      setConfidence(result.confidence);
      setAssessment({
        assessment_id: result.assessmentId,
        score: result.score,
        feedback_text: result.feedback,
        confidence: result.confidence,
      });
    } catch (error) {
      console.error('Error checking with LLM:', error);
      alert('เกิดข้อผิดพลาดในการตรวจด้วย LLM');
    } finally {
      setIsChecking(false);
    }
  };
  
  // ฟังก์ชันบันทึกการประเมิน
  const handleSaveAssessment = async () => {
    if (!answer || !answerKey) return;
    
    try {
      // ถ้ามีการประเมินอยู่แล้ว ให้อัปเดต
      if (assessment?.assessment_id) {
        await supabase
          .from('assessments')
          .update({
            score: score,
            feedback_text: feedback,
            confidence: confidence,
            updated_at: new Date().toISOString(),
          })
          .eq('assessment_id', assessment.assessment_id);
      } else {
        // ถ้ายังไม่มี ให้สร้างใหม่
        await supabase
          .from('assessments')
          .insert({
            student_answer_id: answer.student_answer_id,
            answer_key_id: answerKey.answer_key_id,
            score: score,
            max_score: answerKey.max_score || 100,
            feedback_text: feedback,
            confidence: confidence,
            is_approved: false,
            assessment_date: new Date().toISOString(),
          });
      }
      
      alert('บันทึกการประเมินเรียบร้อยแล้ว');
    } catch (error) {
      console.error('Error saving assessment:', error);
      alert('เกิดข้อผิดพลาดในการบันทึกการประเมิน');
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
          <span className="ml-2">กำลังโหลดข้อมูล...</span>
        </div>
      </Layout>
    );
  }
  
  if (!answer) {
    return notFound();
  }
  
  return (
    <Layout>
      {/* รายละเอียด UI ตามไฟล์เดิมที่คุณมี */}
      {/* แต่เปลี่ยน mock functions ให้ใช้ real functions ที่สร้างไว้ */}
    </Layout>
  );
}