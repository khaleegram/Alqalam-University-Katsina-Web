import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="bg-gray-900 p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">Profile</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-yellow-400">Admin Information</h2>
        <p className="mt-4">Name: John Doe</p>
        <p>Email: admin@example.com</p>
      </div>
    </div>
  );
};

export default Profile;
