import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Department {
  id: number;
  name: string;
  college_id: number;
  college_name: string;
}

interface College {
  id: number;
  name: string;
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

interface SelectCollegeProps {
  value: string;
  setValue: (val: string) => void;
  colleges: College[];
}

interface InputFieldProps {
  label: string;
  value: string;
  setValue: (val: string) => void;
  type?: string;
}

interface ModalActionsProps {
  onCancel: () => void;
  submitLabel: string;
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const DepartmentsSection: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // For adding department, we store only the appended portion.
  const prefixDepartment = "B.SC. ";
  const [appendedDepartmentName, setAppendedDepartmentName] = useState('');
  // For editing, use separate state.
  const [editAppendedDepartmentName, setEditAppendedDepartmentName] = useState('');

  const [newCollegeId, setNewCollegeId] = useState('');
  const [editCollegeId, setEditCollegeId] = useState('');

  const [editId, setEditId] = useState<number | null>(null);

  const baseUrl = 'http://192.168.94.83/ATG/backend/data_creation';

  useEffect(() => {
    fetchDepartments();
    fetchColleges();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${baseUrl}/departments.php`);
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setMessage('Error fetching departments');
    }
  };

  const fetchColleges = async () => {
    try {
      const res = await axios.get(`${baseUrl}/colleges.php?action=get`);
      setColleges(res.data);
    } catch (err) {
      console.error('Error fetching colleges:', err);
      setMessage('Error fetching colleges');
    }
  };

  const resetMessages = () => setMessage('');

  // Construct full department names
  const fullNewDepartmentName = prefixDepartment + toTitleCase(appendedDepartmentName);
  const fullEditDepartmentName = prefixDepartment + toTitleCase(editAppendedDepartmentName);

  // New function that accepts a string value directly.
  const handleDepartmentNameValueChange = (value: string) => {
    const upperValue = value.toUpperCase();
    if (!upperValue.startsWith(prefixDepartment)) {
      // Force the prefix if missing.
      setAppendedDepartmentName('');
    } else {
      setAppendedDepartmentName(upperValue.slice(prefixDepartment.length));
    }
  };

  // Similarly for edit mode.
  const handleEditDepartmentNameValueChange = (value: string) => {
    const upperValue = value.toUpperCase();
    if (!upperValue.startsWith(prefixDepartment)) {
      setEditAppendedDepartmentName('');
    } else {
      setEditAppendedDepartmentName(upperValue.slice(prefixDepartment.length));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const duplicate = departments.some(
      (d) =>
        d.name.toLowerCase() === fullNewDepartmentName.toLowerCase() &&
        d.college_id === parseInt(newCollegeId)
    );
    
    if (duplicate) {
      setMessage('This department already exists in the selected college.');
      setShowAddModal(false); // Close modal on error.
      return;
    }

    try {
      await axios.post(`${baseUrl}/departments.php`, {
        name: fullNewDepartmentName,
        college_id: parseInt(newCollegeId),
      });
      setMessage('Department added successfully');
      setShowAddModal(false);
      setAppendedDepartmentName('');
      setNewCollegeId('');
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setMessage('Error adding department');
      setShowAddModal(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    const duplicate = departments.some(
      (d) =>
        d.name.toLowerCase() === fullEditDepartmentName.toLowerCase() &&
        d.college_id === parseInt(editCollegeId) &&
        d.id !== editId
    );
    
    if (duplicate) {
      setMessage('Duplicate department in selected college.');
      setShowEditModal(false);
      return;
    }

    try {
      await axios.put(`${baseUrl}/departments.php`, {
        id: editId,
        name: fullEditDepartmentName,
        college_id: parseInt(editCollegeId),
      });
      setMessage('Department updated successfully');
      setShowEditModal(false);
      setEditId(null);
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setMessage('Error updating department');
      setShowEditModal(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    try {
      await axios.delete(`${baseUrl}/departments.php`, { data: { id } });
      setMessage('Department deleted successfully');
      fetchDepartments();
    } catch (err) {
      console.error(err);
      setMessage('Error deleting department');
    }
  };

  const openEditModal = (dept: Department) => {
    setEditId(dept.id);
    // Assume stored department name starts with the prefix.
    if (dept.name.toUpperCase().startsWith(prefixDepartment)) {
      setEditAppendedDepartmentName(dept.name.slice(prefixDepartment.length));
    } else {
      setEditAppendedDepartmentName(dept.name);
    }
    setEditCollegeId(dept.college_id.toString());
    setShowEditModal(true);
    setMessage('');
  };

  const filteredDepartments = departments.filter((dept) =>
    dept.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="bg-cream dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-maroon">Manage Departments</h3>
        <button
          onClick={() => {
            resetMessages();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition-colors"
        >
          Add Department
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('success') || message.includes('added') || message.includes('updated')
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <input
        type="text"
        placeholder="Search departments..."
        className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-cream dark:bg-gray-800 text-black dark:text-white"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">College</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-cream dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredDepartments.map((dept, index) => (
              <tr key={dept.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{dept.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{dept.college_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="px-3 py-1 bg-maroon text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredDepartments.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No departments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 block sm:hidden">
        {filteredDepartments.map((dept, index) => (
          <div
            key={dept.id}
            className="bg-cream dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-2">
              <h4 className="font-bold text-maroon">#{index + 1} - {dept.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">College: {dept.college_name}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => openEditModal(dept)}
                className="px-3 py-1 bg-maroon text-white rounded hover:bg-blue-700 text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(dept.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredDepartments.length === 0 && (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">No departments found</div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Department" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <SelectCollege value={newCollegeId} setValue={setNewCollegeId} colleges={colleges} />
            <InputField
              label="Department Name"
              value={prefixDepartment + appendedDepartmentName}
              setValue={handleDepartmentNameValueChange}
            />
            <ModalActions onCancel={() => setShowAddModal(false)} submitLabel="Add" />
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal title="Edit Department" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <SelectCollege value={editCollegeId} setValue={setEditCollegeId} colleges={colleges} />
            <InputField
              label="Department Name"
              value={prefixDepartment + editAppendedDepartmentName}
              setValue={handleEditDepartmentNameValueChange}
            />
            <ModalActions onCancel={() => setShowEditModal(false)} submitLabel="Update" />
          </form>
        </Modal>
      )}
    </section>
  );
};

// Reusable Modal Component
const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-cream dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-maroon">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300" aria-label="Close">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

// Reusable Input Field Component
const InputField: React.FC<InputFieldProps> = ({ label, value, setValue, type = "text" }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</label>
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      className="w-full p-2 border border-maroon rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
    />
  </div>
);

// Reusable Modal Actions Component
const ModalActions: React.FC<ModalActionsProps> = ({ onCancel, submitLabel }) => (
  <div className="flex justify-end space-x-3 pt-4">
    <button
      onClick={onCancel}
      type="button"
      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-cream dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maroon hover:bg-maroon-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon"
    >
      {submitLabel}
    </button>
  </div>
);

// Reusable Select College Component
const SelectCollege: React.FC<SelectCollegeProps> = ({ value, setValue, colleges }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Select College:</label>
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
    >
      <option value="">-- Select College --</option>
      {colleges.map((college) => (
        <option key={college.id} value={college.id}>
          {college.name}
        </option>
      ))}
    </select>
  </div>
);

export default DepartmentsSection;
