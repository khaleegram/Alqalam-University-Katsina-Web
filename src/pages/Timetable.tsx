import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface ExamSession {
  examId: number;
  course: string;
  venue: string;
  startTime: string;
  endTime: string;
}

const Timetable: React.FC = () => {
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);

  useEffect(() => {
    const fetchExamSessions = async () => {
      try {
        const response = await axios.get<ExamSession[]>('/api/exam-sessions');
        setExamSessions(response.data);
      } catch (error) {
        console.error('Error fetching exam sessions:', error);
      }
    };

    fetchExamSessions();
  }, []);

  return (
    <div className="bg-maroon p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">Timetable</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-yellow-400">Exam Schedule</h2>
        <table className="w-full mt-4 table-auto">
          <thead>
            <tr>
              <th className="p-2 text-left text-yellow-400">Exam ID</th>
                <th className="p-2 text-left text-yellow-400">Course</th>
                <th className="p-2 text-left text-yellow-400">Venue</th>
                <th className="p-2 text-left text-yellow-400">Start Time</th>
                <th className="p-2 text-left text-yellow-400">End Time</th>
            </tr>
          </thead>
          <tbody>
            {examSessions.length > 0 ? (
                examSessions.map((session) => (
                    <tr key={session.examId}>
                        <td className="p-2">{session.examId}</td>
                        <td className="p-2">{session.course}</td>
                        <td className="p-2">{session.venue}</td>
                        <td className="p-2">{session.startTime}</td>
                        <td className="p-2">{session.endTime}</td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={5} className="p-2 text-center">
                        No exam sessions found.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Timetable;
