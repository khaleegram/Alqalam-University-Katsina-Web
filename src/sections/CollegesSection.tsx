import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface College {
  id: number;
  name: string;      // Short code (e.g., "NAS")
  full_name: string; // Full college name (e.g., "COLLEGE OF NATURAL AND APPLIED SCIENCES")
}

const AddCollege: React.FC = () => {
  // Fixed prefix for the full college name – not editable.
  const prefix = "COLLEGE OF ";
  // We store only the appended part; full college name = prefix + appended text.
  const [appendedCollegeName, setAppendedCollegeName] = useState('');
  const [collegeCode, setCollegeCode] = useState('');
  const [colleges, setColleges] = useState<College[]>([]);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  const endpoint = 'http://192.168.1.104/ATG/backend/data_creation/colleges.php';

  // Fetch colleges from backend.
  const fetchColleges = async () => {
    try {
      const response = await axios.get(endpoint);
      setColleges(response.data);
    } catch (error) {
      console.error('Error fetching colleges:', error);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, []);

  // Full college name is a combination of prefix and appended text.
  const fullCollegeName = prefix + appendedCollegeName;

  // Handle changes in the college name input.
  // The user sees a field that always starts with "COLLEGE OF " (non‑editable).
  // They can only append text after that prefix.
  const handleCollegeNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (!value.startsWith(prefix)) {
      // If the user deletes the prefix, reset appended portion.
      setAppendedCollegeName('');
    } else {
      setAppendedCollegeName(value.slice(prefix.length));
    }
  };

  // Handle college code input (force uppercase).
  const handleCollegeCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollegeCode(e.target.value.toUpperCase());
  };

  // Submission handler: if an error is returned, the modal is automatically closed.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;
      if (editId) {
        response = await axios.put(
          endpoint,
          { id: editId, name: fullCollegeName, code: collegeCode },
          { headers: { 'Content-Type': 'application/json' } }
        );
      } else {
        response = await axios.post(
          endpoint,
          { name: fullCollegeName, code: collegeCode },
          { headers: { 'Content-Type': 'application/json' } }
        );
      }
      // If an error occurred (duplicate, etc.), close the modal automatically.
      if (response.data.status === 'error') {
        setMessage(response.data.message);
        setShowModal(false);
      } else {
        setMessage(editId ? 'College updated successfully' : 'College added successfully');
        setShowModal(false);
        // Clear the fields.
        setAppendedCollegeName('');
        setCollegeCode('');
        setEditId(null);
        fetchColleges();
      }
    } catch (error) {
      console.error('Error saving college:', error);
      setMessage('An error occurred while saving the college');
      setShowModal(false);
    }
  };

  const handleEdit = (college: College) => {
    // When editing, pre-fill the appended portion from full_name (if it starts with the prefix).
    if (college.full_name.startsWith(prefix)) {
      setAppendedCollegeName(college.full_name.slice(prefix.length));
    } else {
      setAppendedCollegeName(college.full_name);
    }
    // Use the short code (stored in the "name" field) for editing.
    setCollegeCode(college.name);
    setEditId(college.id);
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(endpoint, {
        data: { id },
        headers: { 'Content-Type': 'application/json' },
      });
      setMessage('College deleted successfully');
      fetchColleges();
    } catch (error) {
      console.error('Error deleting college:', error);
    }
  };

  // Filter colleges by searching in the full college name.
  const filteredColleges = colleges.filter((college) =>
    college.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="bg-cream dark:bg-gray-900 p-8 text-black dark:text-white rounded-lg">
      <div className="max-w-4xl mx-auto">
        <h3 className="text-2xl font-bold mb-6 text-maroon">Manage Colleges</h3>

        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center">
          <input
            type="text"
            placeholder="Search colleges..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2 rounded border bg-gray-100 dark:bg-gray-800 dark:text-white w-full sm:max-w-sm mb-2 sm:mb-0"
          />
          <button
            onClick={() => {
              setEditId(null);
              setAppendedCollegeName('');
              setCollegeCode('');
              setShowModal(true);
            }}
            className="sm:ml-4 px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark"
          >
            + Add College
          </button>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="min-w-full table-auto border border-gray-300 dark:border-gray-600 rounded-lg">
            <thead>
              <tr className="bg-gray-200 dark:bg-gray-700 text-left">
                <th className="p-3">#</th>
                <th className="p-3">College Code</th>
                <th className="p-3">Full College Name</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredColleges.map((college, index) => (
                <tr key={college.id} className="border-t border-gray-300 dark:border-gray-600">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{college.name}</td>
                  <td className="p-3">{college.full_name}</td>
                  <td className="p-3 flex space-x-2">
                    <button
                      onClick={() => handleEdit(college)}
                      className="bg-maroon text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(college.id)}
                      className="bg-maroon text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredColleges.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center p-4 text-gray-500">
                    No colleges found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="space-y-4 block sm:hidden">
          {filteredColleges.map((college, index) => (
            <div key={college.id} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-300 dark:border-gray-600">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-maroon">#{index + 1}</h4>
                  <p><strong>Code:</strong> {college.name}</p>
                  <p><strong>Full Name:</strong> {college.full_name}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(college)}
                    className="bg-maroon text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(college.id)}
                    className="bg-maroon text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredColleges.length === 0 && (
            <div className="text-center p-4 text-gray-500">
              No colleges found
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit College */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-cream dark:bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md">
            <h4 className="text-xl font-semibold mb-4 text-maroon">
              {editId ? 'Edit College' : 'Add College'}
            </h4>
            <form onSubmit={handleSubmit}>
              {/* College name input always shows the fixed prefix */}
              <input
                type="text"
                value={prefix + appendedCollegeName}
                onChange={handleCollegeNameChange}
                required
                placeholder="Enter college name"
                className="w-full p-2 mb-4 rounded border border-maroon bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              />
              <input
                type="text"
                value={collegeCode}
                onChange={handleCollegeCodeChange}
                required
                placeholder="Enter college short code (e.g., NAS)"
                className="w-full p-2 mb-4 rounded border border-maroon bg-gray-200 dark:bg-gray-700 text-black dark:text-white"
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark"
                >
                  {editId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {message && (
        <div className="mt-4 text-center text-sm">
          <p className={message.includes('success') ? 'text-green-500' : 'text-red-500'}>
            {message}
          </p>
        </div>
      )}
    </section>
  );
};

export default AddCollege;
