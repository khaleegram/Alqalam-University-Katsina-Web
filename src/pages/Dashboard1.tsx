import React from 'react';
import StatCard from '../components/StatCard';

const Dashboard: React.FC = () => {
  // Assuming you have a theme state for light/dark mode
  const [theme] = React.useState<'light' | 'dark'>(
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );

  // Example data that could be fetched from an API or state
  const stats = {
    totalStudents: 1234,
    activeLecturers: 87,
    coursesRunning: 56,
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden">
        <main
          className={`flex-1 p-8 text-black overflow-y-auto ${
            theme === 'light' ? 'bg-cream' : 'bg-gray-900'
          }`} 
        >
          <h1 className="text-4xl font-bold mb-6">Welcome, Admin 👽</h1>
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
