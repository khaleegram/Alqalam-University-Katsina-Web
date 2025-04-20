import React from 'react';

const Timetable: React.FC = () => {
  return (
    <div className="bg-maroon p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">Timetable</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-yellow-400">Class Schedule</h2>
        <table className="w-full mt-4 table-auto">
          <thead>
            <tr>
              <th className="p-2 text-left text-yellow-400">Day</th>
              <th className="p-2 text-left text-yellow-400">Class</th>
              <th className="p-2 text-left text-yellow-400">Time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">Monday</td>
              <td className="p-2">Math 101</td>
              <td className="p-2">10:00 AM</td>
            </tr>
            <tr>
              <td className="p-2">Wednesday</td>
              <td className="p-2">Physics 202</td>
              <td className="p-2">2:00 PM</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timetable;
