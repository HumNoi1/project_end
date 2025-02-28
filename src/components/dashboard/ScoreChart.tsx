import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// ข้อมูลตัวอย่าง
const sampleStudentScores = [
  { name: 'นายสมชาย', score: 85, avg: 78 },
  { name: 'นางสาวสมหญิง', score: 92, avg: 78 },
  { name: 'นายวิชัย', score: 68, avg: 78 },
  { name: 'นางสาวมนัสนันท์', score: 75, avg: 78 },
  { name: 'นายภูมิ', score: 78, avg: 78 },
  { name: 'นางสาวแก้ว', score: 89, avg: 78 },
  { name: 'นายณัฐ', score: 95, avg: 78 },
  { name: 'นางสาวพิมพ์', score: 73, avg: 78 },
  { name: 'นายนิติ', score: 82, avg: 78 },
  { name: 'นางสาวกนกพร', score: 77, avg: 78 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-md">
        <p className="font-medium">{label}</p>
        <p className="text-indigo-600">{`คะแนน: ${payload[0].value}`}</p>
        <p className="text-gray-500">{`ค่าเฉลี่ยของกลุ่ม: ${payload[1].value}`}</p>
      </div>
    );
  }

  return null;
};

const ScoreChart = ({ data = sampleStudentScores, title = "คะแนนนักเรียน", subject = "ภาษาไทย", className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">วิชา: {subject}</p>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="score" name="คะแนน" fill="#6366f1" />
            <Bar dataKey="avg" name="ค่าเฉลี่ย" fill="#d1d5db" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ScoreChart;