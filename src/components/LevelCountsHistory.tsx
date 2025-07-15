import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface LevelCount {
  id: number;
  program_id: number;
  program_name: string;
  level: number;
  students_count: number;
}

interface LevelCountsHistoryProps {
  sessionId: number | null;
  semesterId: number | null;
}

const API = 'http://192.168.1.104/ATG/backend/data_creation/academic_api.php';

const LevelCountsHistory: React.FC<LevelCountsHistoryProps> = ({ sessionId, semesterId }) => {
  const [data, setData] = useState<LevelCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId || !semesterId) {
      setData([]);
      return;
    }

    setLoading(true);
    setError(null);

    axios.get(`${API}?action=get_level_history&session_id=${sessionId}&semester_id=${semesterId}`)
      .then(res => {
        if (res.data.status === 'success') {
          setData(res.data.data);
        } else {
          setError(res.data.message || 'Failed to load data');
        }
      })
      .catch(() => {
        setError('Error loading level counts history');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId, semesterId]);

  if (!sessionId || !semesterId) {
    return <p className="text-sm italic text-gray-600">Please select a session and semester to view history.</p>;
  }

  if (loading) return <p>Loading level counts history...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (data.length === 0) return <p>No historical data available for this session and semester.</p>;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Level Counts History</h2>
      <table className="w-full border border-gray-300 rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Program</th>
            <th className="border p-2 text-center">Level</th>
            <th className="border p-2 text-center">Students Count</th>
          </tr>
        </thead>
        <tbody>
          {data.map(({ id, program_name, level, students_count }) => (
            <tr key={id} className="hover:bg-gray-50">
              <td className="border p-2">{program_name}</td>
              <td className="border p-2 text-center">{level}</td>
              <td className="border p-2 text-center">{students_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LevelCountsHistory;
