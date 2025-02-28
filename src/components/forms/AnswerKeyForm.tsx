import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { Upload, FileText, X, Check, Info, Loader } from 'lucide-react';

type FormData = {
  subjectId: string;
  termId: string;
  folderId: string;
  maxScore: number;
  description: string;
};

type SubjectOption = {
  id: string;
  name: string;
};

type TermOption = {
  id: string;
  name: string;
};

type FolderOption = {
  id: string;
  name: string;
};

type AnswerKeyFormProps = {
  subjects: SubjectOption[];
  terms: TermOption[];
  folders: FolderOption[];
  onSubmit: (data: FormData & { file: File }) => Promise<void>;
};

export default function AnswerKeyForm({ subjects, terms, folders, onSubmit }: AnswerKeyFormProps) {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'text/plain': ['.txt'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10485760, // 10MB
    multiple: false,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDrop: (acceptedFiles, rejectedFiles) => {
      setIsDragging(false);
      
      if (rejectedFiles.length > 0) {
        const error = rejectedFiles[0].errors[0];
        if (error.code === 'file-too-large') {
          setError('ขนาดไฟล์เกินกำหนด (สูงสุด 10MB)');
        } else if (error.code === 'file-invalid-type') {
          setError('รูปแบบไฟล์ไม่รองรับ (รองรับเฉพาะ .pdf, .doc, .docx, .txt)');
        } else {
          setError('เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
        }
        return;
      }
      
      if (acceptedFiles.length > 0) {
        setSelectedFile(acceptedFiles[0]);
        setError(null);
      }
    }
  });
  
  const onFormSubmit = async (data: FormData) => {
    if (!selectedFile) {
      setError('กรุณาเลือกไฟล์เฉลย');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({
        ...data,
        file: selectedFile
      });
      
      router.push('/answers');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาดในการอัปโหลดเฉลย');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const removeFile = () => {
    setSelectedFile(null);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)}>
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
            วิชา <span className="text-red-500">*</span>
          </label>
          <select
            id="subjectId"
            {...register('subjectId', { required: true })}
            className={`w-full px-3 py-2 border ${errors.subjectId ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="">-- เลือกวิชา --</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          {errors.subjectId && (
            <p className="mt-1 text-sm text-red-600">กรุณาเลือกวิชา</p>
          )}
        </div>
        
        <div>
          <label htmlFor="termId" className="block text-sm font-medium text-gray-700 mb-1">
            เทอมเรียน <span className="text-red-500">*</span>
          </label>
          <select
            id="termId"
            {...register('termId', { required: true })}
            className={`w-full px-3 py-2 border ${errors.termId ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          >
            <option value="">-- เลือกเทอมเรียน --</option>
            {terms.map(term => (
              <option key={term.id} value={term.id}>{term.name}</option>
            ))}
          </select>
          {errors.termId && (
            <p className="mt-1 text-sm text-red-600">กรุณาเลือกเทอมเรียน</p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="folderId" className="block text-sm font-medium text-gray-700 mb-1">
          โฟลเดอร์ <span className="text-red-500">*</span>
        </label>
        <select
          id="folderId"
          {...register('folderId', { required: true })}
          className={`w-full px-3 py-2 border ${errors.folderId ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
        >
          <option value="">-- เลือกโฟลเดอร์ --</option>
          {folders.map(folder => (
            <option key={folder.id} value={folder.id}>{folder.name}</option>
          ))}
        </select>
        {errors.folderId && (
          <p className="mt-1 text-sm text-red-600">กรุณาเลือกโฟลเดอร์</p>
        )}
      </div>
      
      <div className="mb-6">
        <label htmlFor="maxScore" className="block text-sm font-medium text-gray-700 mb-1">
          คะแนนเต็ม <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          id="maxScore"
          {...register('maxScore', { 
            required: true,
            min: 1,
            valueAsNumber: true
          })}
          min="1"
          className={`w-full px-3 py-2 border ${errors.maxScore ? 'border-red-300 ring-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
          placeholder="เช่น 100"
        />
        {errors.maxScore && (
          <p className="mt-1 text-sm text-red-600">
            {errors.maxScore.type === 'required' 
              ? 'กรุณาระบุคะแนนเต็ม' 
              : 'คะแนนเต็มต้องมากกว่า 0'}
          </p>
        )}
      </div>
      
      <div className="mb-6">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          รายละเอียดเฉลย
        </label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="คำอธิบายเพิ่มเติมเกี่ยวกับเฉลย"
        ></textarea>
      </div>
      
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6 flex">
        <Info size={20} className="text-blue-500 mr-3 flex-shrink-0" />
        <div className="text-sm text-blue-700">
          <p className="font-medium mb-1">คำแนะนำในการอัปโหลดเฉลย</p>
          <ul className="list-disc ml-5 space-y-1">
            <li>เฉลยควรมีรูปแบบที่ชัดเจนและละเอียด</li>
            <li>ควรระบุเกณฑ์การให้คะแนนในแต่ละข้อให้ชัดเจน</li>
            <li>หากมีหลายคำตอบที่ถูกต้อง ควรระบุทางเลือกทั้งหมด</li>
            <li>สามารถแนบตัวอย่างคำตอบที่ดีเพื่อใช้เป็นแนวทางในการตรวจ</li>
          </ul>
        </div>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          อัปโหลดไฟล์เฉลย <span className="text-red-500">*</span>
        </label>
        <div 
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 text-center ${
            isDragging 
              ? 'border-green-500 bg-green-50' 
              : error 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
          }`}
        >
          <input {...getInputProps()} />
          
          {!selectedFile ? (
            <div>
              <div className="flex justify-center">
                <Upload className="h-12 w-12 text-gray-400" />
              </div>
              <p className="mt-2 text-sm text-gray-600">คลิกเพื่อเลือกไฟล์เฉลยหรือลากไฟล์มาวางที่นี่</p>
              <p className="mt-1 text-xs text-gray-500">รองรับไฟล์ PDF, DOC, DOCX, TXT ขนาดไม่เกิน 10MB</p>
              <button 
                type="button"
                className="mt-3 inline-block px-4 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                เลือกไฟล์
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <FileText size={20} className="text-green-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button 
                type="button" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
        {!selectedFile && !error && (
          <p className="mt-1 text-sm text-gray-500">กรุณาอัปโหลดไฟล์เฉลย</p>
        )}
      </div>
      
      <div className="flex justify-end space-x-3">
        <button 
          type="button"
          onClick={() => router.push('/answers')}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          ยกเลิก
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:bg-green-400"
        >
          {isSubmitting ? (
            <>
              <Loader size={18} className="mr-2 animate-spin" />
              กำลังอัปโหลด...
            </>
          ) : (
            <>
              <Check size={18} className="mr-2" />
              อัปโหลดเฉลย
            </>
          )}
        </button>
      </div>
    </form>
  );
}