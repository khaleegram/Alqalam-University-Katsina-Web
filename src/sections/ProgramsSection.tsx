import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Department {
  id: number;
  name: string;
}

interface Program {
  id: number;
  department_id: number;
  name: string;
  department_name: string;
}

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
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

/**
 * Converts a string to title case.
 * Example: "software enignierring" → "Software Enignierring"
 */
const toTitleCase = (str: string): string => {
  return str
    .trim()
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word[0].toUpperCase() + word.substring(1).toLowerCase())
    .join(' ');
};

const ProgramsSection: React.FC = () => {
  // States for departments and programs.
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  
  // Search input for filtering by department in the main view.
  const [departmentSearch, setDepartmentSearch] = useState<string>('');
  
  // Message and modal visibility states.
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // State variables for adding a new program.
  // newDepartmentId is set from the department search input in the modal.
  const [newDepartmentId, setNewDepartmentId] = useState('');
  const [newDepartmentSearch, setNewDepartmentSearch] = useState('');
  const [newProgramName, setNewProgramName] = useState('');
  
  // State variables for editing a program.
  const [editId, setEditId] = useState<number | null>(null);
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editDepartmentSearch, setEditDepartmentSearch] = useState('');
  const [editProgramName, setEditProgramName] = useState('');
  
  // Base URL for the PHP backend (adjust if needed).
  const baseUrl = 'http://192.168.21.83/ATG/backend/data_creation';

  // On mount, fetch departments and then programs.
  useEffect(() => {
    const loadData = async () => {
      await fetchDepartments();
      await fetchPrograms();
    };
    loadData();
  }, []);

  // Fetch all departments.
  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${baseUrl}/departments.php`);
      // Assuming the endpoint returns an array of departments.
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setMessage('Error fetching departments');
    }
  };

  // Fetch all programs.
  const fetchPrograms = async () => {
    try {
      // Call the programs endpoint (it now returns department_name).
      const res = await axios.get(`${baseUrl}/programs.php`);
      if (res.data.status === 'success') {
        setPrograms(res.data.data);
      } else {
        setMessage(res.data.message || 'Error fetching programs');
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      setMessage('Error fetching programs');
    }
  };

  // Group programs by department_name.
  const groupedPrograms = programs.reduce((acc: Record<string, Program[]>, prog: Program) => {
    const deptName = prog.department_name;
    if (!acc[deptName]) {
      acc[deptName] = [];
    }
    acc[deptName].push(prog);
    return acc;
  }, {});

  // Filter groups based on the department search text.
  const filteredGroups = Object.entries(groupedPrograms).filter(([deptName]) => {
    if (!departmentSearch.trim()) return true;
    return deptName.toLowerCase().includes(departmentSearch.toLowerCase());
  });

  // For the Add Modal: update newDepartmentId when a department is clicked.
  const handleAddDepartmentSelect = (dept: Department) => {
    setNewDepartmentSearch(dept.name);
    setNewDepartmentId(dept.id.toString());
  };

  // For the Edit Modal: update editDepartmentId when a department is clicked.
  const handleEditDepartmentSelect = (dept: Department) => {
    setEditDepartmentSearch(dept.name);
    setEditDepartmentId(dept.id.toString());
  };

  const resetMessages = () => setMessage('');

  // Add new program submission handler.
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!newDepartmentId || !newProgramName.trim()) {
      setMessage('All fields are required.');
      return;
    }
  
    // Format the program name to title case.
    const formattedProgramName = toTitleCase(newProgramName);
  
    // Check if this program already exists in the same department.
    const existing = programs.find(
      (prog) =>
        prog.department_id === parseInt(newDepartmentId) &&
        prog.name.toLowerCase() === formattedProgramName.toLowerCase()
    );
  
    if (existing) {
      setMessage('This program already exists in the selected department.');
      setShowAddModal(false);
      return;
    }
  
    try {
      const res = await axios.post(`${baseUrl}/programs.php`, {
        department_id: parseInt(newDepartmentId),
        name: formattedProgramName,
      });
  
      if (res.data.status === 'success') {
        setMessage('Program added successfully');
        setShowAddModal(false);
        setNewDepartmentId('');
        setNewDepartmentSearch('');
        setNewProgramName('');
  
        // Refresh the complete programs list.
        fetchPrograms();
      } else {
        setMessage(res.data.message || 'Error adding program');
      }
    } catch (err) {
      console.error('Error adding program:', err);
      setMessage('Error adding program');
    }
  };

  // Edit program submission handler.
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editDepartmentId || !editProgramName.trim()) {
      setMessage('All fields are required.');
      return;
    }
    
    // Format the program name to title case.
    const formattedProgramName = toTitleCase(editProgramName);
  
    try {
      await axios.put(`${baseUrl}/programs.php`, {
        id: editId,
        department_id: parseInt(editDepartmentId),
        name: formattedProgramName,
      });
      setMessage('Program updated successfully');
      setShowEditModal(false);
      setEditId(null);
      // Refresh programs list.
      fetchPrograms();
    } catch (err) {
      console.error('Error updating program:', err);
      setMessage('Error updating program');
    }
  };

  // Delete program handler.
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await axios.delete(`${baseUrl}/programs.php`, { data: { id } });
      setMessage('Program deleted successfully');
      fetchPrograms();
    } catch (err) {
      console.error('Error deleting program:', err);
      setMessage('Error deleting program');
    }
  };

  // Open the edit modal and populate state.
  const openEditModal = (prog: Program) => {
    setEditId(prog.id);
    setEditDepartmentId(prog.department_id.toString());
    setEditDepartmentSearch(prog.department_name);
    setEditProgramName(prog.name);
    setShowEditModal(true);
    setMessage('');
  };

  return (
    <section className="bg-cream dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-maroon mb-2 sm:mb-0">Manage Programs</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Main view: dynamic department search input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search Department"
              value={departmentSearch}
              onChange={(e) => setDepartmentSearch(e.target.value)}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-maroon dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={() => {
              resetMessages();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition-colors"
          >
            Add Program
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Render each department's programs in a separate table */}
      {filteredGroups.length > 0 ? (
        filteredGroups.map(([deptName, progArray]) => (
          <div key={deptName} className="mb-8">
            <h4 className="text-xl font-semibold text-maroon mb-2">{deptName}</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Program Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-cream dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {progArray.sort((a, b) => a.name.localeCompare(b.name)).map((prog, index) => (
                    <tr key={prog.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{prog.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(prog)}
                            className="px-3 py-1 bg-maroon text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(prog.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {progArray.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                        No programs found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No departments found.
        </div>
      )}

      {/* Add Program Modal */}
      {showAddModal && (
        <Modal title="Add Program" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {/* Department Search Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Department:</label>
              <input
                type="text"
                placeholder="Search Department"
                value={newDepartmentSearch}
                onChange={(e) => {
                  setNewDepartmentSearch(e.target.value);
                  setNewDepartmentId('');
                }}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
              />
              {newDepartmentSearch && (
                <ul className="border border-gray-300 dark:border-gray-600 mt-1 max-h-40 overflow-auto rounded-md bg-white dark:bg-gray-800">
                  {departments
                    .filter(dept =>
                      dept.name.toLowerCase().includes(newDepartmentSearch.toLowerCase())
                    )
                    .map(dept => (
                      <li
                        key={dept.id}
                        onClick={() => handleAddDepartmentSelect(dept)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {dept.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Program Name Input */}
            <InputField label="Program Name" value={newProgramName} setValue={setNewProgramName} />
            <ModalActions onCancel={() => setShowAddModal(false)} submitLabel="Add" />
          </form>
        </Modal>
      )}

      {/* Edit Program Modal */}
      {showEditModal && (
        <Modal title="Edit Program" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Department:</label>
              <input
                type="text"
                placeholder="Search Department"
                value={editDepartmentSearch}
                onChange={(e) => {
                  setEditDepartmentSearch(e.target.value);
                  setEditDepartmentId('');
                }}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
              />
              {editDepartmentSearch && (
                <ul className="border border-gray-300 dark:border-gray-600 mt-1 max-h-40 overflow-auto rounded-md bg-white dark:bg-gray-800">
                  {departments
                    .filter(dept =>
                      dept.name.toLowerCase().includes(editDepartmentSearch.toLowerCase())
                    )
                    .map(dept => (
                      <li
                        key={dept.id}
                        onClick={() => handleEditDepartmentSelect(dept)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {dept.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <InputField label="Program Name" value={editProgramName} setValue={setEditProgramName} />
            <ModalActions onCancel={() => setShowEditModal(false)} submitLabel="Update" />
          </form>
        </Modal>
      )}
    </section>
  );
};

// Reusable Modal Component.
const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-cream dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
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

// Reusable Input Field Component.
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

// Reusable Modal Actions Component.
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

export default ProgramsSection;
