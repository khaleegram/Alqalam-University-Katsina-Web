import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  theme: 'light' | 'dark'; // Add theme prop
}

const StatCard: React.FC<StatCardProps> = ({ title, value, theme }) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-md ${
        theme === 'light' ? 'bg-maroon' : 'bg-gray-900'
      }`}
    >
      <h2 className="text-xl font-semibold text-yellow-400">{title}</h2>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
