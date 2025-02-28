import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

type AssessmentViewerProps = {
  assessment: {
    score: number;
    maxScore: number;
    feedback: string;
    confidence: number;
    createdAt: string;
  };
  onApprove?: () => void;
  onReject?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
};

export default function AssessmentViewer({
  assessment,
  onApprove,
  onReject,
  onEdit,
  showActions = true,
}: AssessmentViewerProps) {
  const [expanded, setExpanded] = useState(false);
  
  // แปลงเนื้อหา feedback เป็น HTML
  const formatFeedback = (text: string) => {
    // แยกหัวข้อและจัดรูปแบบ
    const formattedText = text
      .replace(/# (.*?)$/gm, '<h3 class="font-bold text-lg mt-3 mb-2">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/- (.*?)$/gm, '<li class="ml-5">$1</li>')
      .replace(/\n\n/g, '<p class="my-2"></p>');
      
    return { __html: formattedText };
  };
  
  // กำหนดสีตามคะแนน
  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // กำหนดสีตามความมั่นใจ
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // กำหนดไอคอนตามคะแนน
  const getScoreIcon = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (percentage >= 60) return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div 
        className="p-4 bg-indigo-50 flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-3">
          {getScoreIcon(assessment.score, assessment.maxScore)}
          <h3 className="font-semibold text-gray-900">ผลการประเมิน</h3>
          <div className={`font-bold text-lg ${getScoreColor(assessment.score, assessment.maxScore)}`}>
            {assessment.score}/{assessment.maxScore} คะแนน
          </div>
          <div className={`text-sm ${getConfidenceColor(assessment.confidence)}`}>
            (ความมั่นใจ {assessment.confidence}%)
          </div>
        </div>
        <div>
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </div>
      
      {expanded && (
        <div className="p-4">
          <div className="mb-4 text-sm text-gray-500">
            ประเมินเมื่อ: {new Date(assessment.createdAt).toLocaleString('th-TH')}
          </div>
          
          <div className="prose prose-sm max-w-none mb-4">
            <div dangerouslySetInnerHTML={formatFeedback(assessment.feedback)} />
          </div>
          
          {showActions && (
            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
              {onEdit && (
                <button 
                  onClick={onEdit}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  แก้ไขการประเมิน
                </button>
              )}
              {onReject && (
                <button 
                  onClick={onReject}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  ไม่อนุมัติ
                </button>
              )}
              {onApprove && (
                <button 
                  onClick={onApprove}
                  className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  อนุมัติ
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}