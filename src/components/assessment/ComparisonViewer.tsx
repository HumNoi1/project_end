import React, { useState } from 'react';
import { Search, FileText, Check, X, AlertTriangle } from 'lucide-react';

type ComparisonViewerProps = {
  studentAnswer: {
    content: string;
    studentName: string;
    studentId: string;
    submittedDate: string;
  };
  answerKey: {
    content: string;
    maxScore: number;
  };
  highlights?: {
    student: { start: number; end: number; type: 'correct' | 'incorrect' | 'missing' }[];
    key: { start: number; end: number; type: 'covered' | 'uncovered' }[];
  };
};

export default function ComparisonViewer({
  studentAnswer,
  answerKey,
  highlights
}: ComparisonViewerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'side-by-side' | 'overlay'>('side-by-side');
  
  // ฟังก์ชันการค้นหาข้อความ
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;
    
    // ใช้ browser API เพื่อค้นหาข้อความในหน้า
    window.find(searchTerm);
  };

  // ฟังก์ชันการไฮไลท์เนื้อหา (อาจจะใช้ข้อมูลจากการวิเคราะห์ของ LLM)
  const renderHighlightedContent = (content: string, contentHighlights?: any[]) => {
    if (!contentHighlights || contentHighlights.length === 0) {
      return <p className="whitespace-pre-wrap">{content}</p>;
    }
    
    // สร้างเนื้อหาที่มีการไฮไลท์
    let lastIndex = 0;
    const parts = [];
    
    contentHighlights.forEach((highlight, idx) => {
      // เพิ่มข้อความปกติก่อนไฮไลท์
      if (highlight.start > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{content.slice(lastIndex, highlight.start)}</span>);
      }
      
      // เพิ่มข้อความที่ไฮไลท์
      const highlightClass = 
        highlight.type === 'correct' ? 'bg-green-100 text-green-800' :
        highlight.type === 'incorrect' ? 'bg-red-100 text-red-800' :
        highlight.type === 'missing' ? 'bg-yellow-100 text-yellow-800' :
        highlight.type === 'covered' ? 'bg-green-100 text-green-800' : 
        'bg-gray-100 text-gray-800';
      
      parts.push(
        <span key={`highlight-${idx}`} className={`${highlightClass} px-1 rounded`}>
          {content.slice(highlight.start, highlight.end)}
        </span>
      );
      
      lastIndex = highlight.end;
    });
    
    // เพิ่มข้อความที่เหลือ
    if (lastIndex < content.length) {
      parts.push(<span key="text-last">{content.slice(lastIndex)}</span>);
    }
    
    return <p className="whitespace-pre-wrap">{parts}</p>;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">เปรียบเทียบคำตอบและเฉลย</h2>
        
        <div className="flex items-center space-x-3">
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 text-sm border ${viewMode === 'side-by-side' 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-gray-700 border-gray-300'} rounded-l-md`}
            >
              แบบแยกส่วน
            </button>
            <button
              onClick={() => setViewMode('overlay')}
              className={`px-3 py-1 text-sm border ${viewMode === 'overlay' 
                ? 'bg-indigo-600 text-white border-indigo-600' 
                : 'bg-white text-gray-700 border-gray-300'} rounded-r-md`}
            >
              แบบซ้อนทับ
            </button>
          </div>
          
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหา..."
              className="pl-8 pr-3 py-1 w-40 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
              <Search size={14} className="text-gray-400" />
            </div>
            <button type="submit" className="hidden">ค้นหา</button>
          </form>
        </div>
      </div>
      
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-2 divide-x">
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <FileText size={16} className="text-indigo-600 mr-2" />
                <h3 className="font-medium text-indigo-600">คำตอบของนักเรียน</h3>
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">{studentAnswer.studentName}</span> ({studentAnswer.studentId})
              </div>
            </div>
            <div className="h-[500px] overflow-auto p-3 bg-gray-50 rounded border">
              <div className="prose prose-sm max-w-none">
                {renderHighlightedContent(studentAnswer.content, highlights?.student)}
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center">
                <FileText size={16} className="text-green-600 mr-2" />
                <h3 className="font-medium text-green-600">เฉลย</h3>
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">คะแนนเต็ม: {answerKey.maxScore}</span>
              </div>
            </div>
            <div className="h-[500px] overflow-auto p-3 bg-gray-50 rounded border">
              <div className="prose prose-sm max-w-none">
                {renderHighlightedContent(answerKey.content, highlights?.key)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          <div className="flex justify-between mb-3">
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                <span className="text-xs">ตรงกับเฉลย</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                <span className="text-xs">ไม่ตรงกับเฉลย</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                <span className="text-xs">ขาดเนื้อหาสำคัญ</span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-medium">{studentAnswer.studentName}</span> ({studentAnswer.studentId})
            </div>
          </div>
          
          <div className="relative border rounded-lg overflow-hidden h-[500px]">
            <div className="absolute top-0 left-0 w-full h-full overflow-auto p-4 bg-gray-50">
              <div className="prose prose-sm max-w-none">
                {renderHighlightedContent(studentAnswer.content, highlights?.student)}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4 border-t bg-gray-50">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <Check size={16} className="text-green-500 mr-1" />
            <span className="text-sm">ครอบคลุมหัวข้อหลัก 5/7 ข้อ</span>
          </div>
          <div className="flex items-center">
            <X size={16} className="text-red-500 mr-1" />
            <span className="text-sm">ข้อมูลไม่ถูกต้อง 2 จุด</span>
          </div>
          <div className="flex items-center">
            <AlertTriangle size={16} className="text-yellow-500 mr-1" />
            <span className="text-sm">ขาดรายละเอียดสำคัญ 3 จุด</span>
          </div>
        </div>
      </div>
    </div>
  );
}