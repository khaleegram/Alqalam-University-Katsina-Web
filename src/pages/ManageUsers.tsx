import React from 'react';

const ManageUsers: React.FC = () => {
  return (
    <div className="bg-gray-900 p-8 text-white">
      <h1 className="text-4xl font-bold mb-4">Manage Users</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-yellow-400">User List</h2>
        <table className="w-full mt-4 table-auto">
          <thead>
            <tr>
              <th className="p-2 text-left text-yellow-400">Name</th>
              <th className="p-2 text-left text-yellow-400">Email</th>
              <th className="p-2 text-left text-yellow-400">Role</th>
              <th className="p-2 text-left text-yellow-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">John Doe</td>
              <td className="p-2">john@example.com</td>
              <td className="p-2">Admin</td>
              <td className="p-2">
                <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg">Edit</button>
              </td>
            </tr>
            <tr>
              <td className="p-2">Jane Smith</td>
              <td className="p-2">jane@example.com</td>
              <td className="p-2">User</td>
              <td className="p-2">
                <button className="bg-yellow-400 text-black px-4 py-2 rounded-lg">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
