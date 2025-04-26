// File: Dashboard.tsx

import React, { useState } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';

const baseUrl = 'http://192.168.94.83/ATG/backend/data_creation';

const Dashboard: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );
  const [message, setMessage] = useState<string | null>(null);

  const stats = {
    totalStudents: 1234,
    activeLecturers: 87,
    coursesRunning: 56,
  };

  const handleCleanup = async () => {
    try {
      const res = await axios.post(`${baseUrl}/cleanup.php`);
      if (res.data.status === 'success') {
        setMessage(res.data.message);
        // TODO: refresh dashboard stats if needed
      } else {
        setMessage(res.data.message);
      }
    } catch (err) {
      console.error('Cleanup error:', err);
      setMessage('Cleanup failed.');
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <main
          className={`flex-1 p-8 text-black overflow-y-auto ${
            theme === 'light' ? 'bg-cream' : 'bg-gray-900'
          }`}
        >
          {/* Header with Cleanup button */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-bold">Welcome, Admin 👽</h1>
            <button
              onClick={handleCleanup}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Run Cleanup
            </button>
          </div>

          {/* Feedback message */}
          {message && (
            <div
              className={`mb-6 p-3 rounded ${
                message.toLowerCase().includes('success')
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {message}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
              theme={theme}
            />
            <StatCard
              title="Active Lecturers"
              value={stats.activeLecturers}
              theme={theme}
            />
            <StatCard
              title="Courses Running"
              value={stats.coursesRunning}
              theme={theme}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
