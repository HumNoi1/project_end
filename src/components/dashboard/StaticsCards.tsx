import React from 'react';
import Link from 'next/link';
import { 
  Users, 
  Book, 
  Calendar, 
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  isIncrease?: boolean;
  href?: string;
  bgColor?: string;
  iconColor?: string;
};

export function StatCard({ 
  title, 
  value, 
  icon, 
  change, 
  isIncrease,
  href,
  bgColor = 'bg-white',
  iconColor
}: StatCardProps) {
  const CardContent = () => (
    <div className={`${bgColor} rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-700">{title}</h3>
        <div className={`${iconColor || ''}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold">{value}</p>
      {change && (
        <div className={`mt-2 flex items-center text-sm ${isIncrease ? 'text-green-600' : 'text-gray-500'}`}>
          {isIncrease ? <TrendingUp size={16} className="mr-1" /> : <TrendingDown size={16} className="mr-1" />}
          {change}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <CardContent />
      </Link>
    );
  }

  return <CardContent />;
}

type StatisticsProps = {
  classCount?: number;
  subjectCount?: number;
  termCount?: number;
  fileCount?: number;
  assessmentStats?: {
    checked: number;
    pending: number;
    issues: number;
  };
};

export default function StatisticsCards({
  classCount = 0,
  subjectCount = 0,
  termCount = 0,
  fileCount = 0,
  assessmentStats = { checked: 0, pending: 0, issues: 0 }
}: StatisticsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="ชั้นเรียน" 
          value={classCount} 
          icon={<Users size={24} className="text-blue-500" />} 
          href="/classes"
        />
        <StatCard 
          title="วิชาเรียน" 
          value={subjectCount} 
          icon={<Book size={24} className="text-green-500" />} 
          href="/subjects"
        />
        <StatCard 
          title="เทอมเรียน" 
          value={termCount} 
          icon={<Calendar size={24} className="text-purple-500" />} 
        />
        <StatCard 
          title="ไฟล์คำตอบ" 
          value={fileCount} 
          icon={<FileText size={24} className="text-orange-500" />} 
          href="/answers"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard 
          title="ตรวจแล้ว" 
          value={assessmentStats.checked} 
          icon={<CheckCircle size={24} />}
          bgColor="bg-green-50"
          iconColor="text-green-500" 
          href="/answers?status=checked"
        />
        <StatCard 
          title="รอการตรวจ" 
          value={assessmentStats.pending} 
          icon={<Clock size={24} />}
          bgColor="bg-amber-50"
          iconColor="text-amber-500"
          href="/answers?status=pending"
        />
        <StatCard 
          title="มีปัญหา" 
          value={assessmentStats.issues} 
          icon={<AlertTriangle size={24} />}
          bgColor="bg-red-50"
          iconColor="text-red-500"
          href="/answers?status=issues"
        />
      </div>
    </>
  );
}