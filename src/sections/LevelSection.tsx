import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Program {
  id: number;
  name: string;
  department_id: number;
  department_name: string;
}

interface Level {
  id: number;
  level: number;
  students_count: number;
  program_id: number;
  program_name: string;
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

const LevelsSection: React.FC = () => {
  // States for programs and levels
  const [programs, setPrograms] = useState<Program[]>([]);
  // All levels fetched from the server (each level includes program_name)
  const [levels, setLevels] = useState<Level[]>([]);
  
  // Search input for filtering by program name in the main view
  const [programSearch, setProgramSearch] = useState<string>('');
  
  // Message and modal visibility states
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // State variables for adding a new level (from add modal)
  const [newProgramId, setNewProgramId] = useState('');
  const [newProgramSearch, setNewProgramSearch] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [newStudentsCount, setNewStudentsCount] = useState('');
  
  // State variables for editing a level (from edit modal)
  const [editId, setEditId] = useState<number | null>(null);
  const [editProgramId, setEditProgramId] = useState('');
  const [editProgramSearch, setEditProgramSearch] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editStudentsCount, setEditStudentsCount] = useState('');
  
  // Base URL for the PHP backend (adjust if needed)
  const baseUrl = 'http://192.168.21.83/ATG/backend/data_creation';

  // On mount, fetch all programs and all levels.
  useEffect(() => {
    fetchPrograms();
    fetchAllLevels();
  }, []);

  // Fetch the complete list of programs
  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${baseUrl}/programs.php`);
      if (res.data.status === 'success') {
        setPrograms(res.data.data || []);
      } else {
        setMessage(res.data.message || 'Error fetching programs');
      }
    } catch (err) {
      console.error('Error fetching programs:', err);
      setMessage('Error fetching programs');
    }
  };

  // Fetch all levels (with program names) by omitting the program_id query parameter
  const fetchAllLevels = async () => {
    try {
      const res = await axios.get(`${baseUrl}/levels.php`);
      if (res.data.status === 'success') {
        setLevels(res.data.data);
      } else {
        setMessage(res.data.message || 'Error fetching levels');
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
      setMessage('Error fetching levels');
    }
  };

  // For the Add Modal: update newProgramId when a program is clicked from suggestions.
  const handleAddProgramSelect = (prog: Program) => {
    setNewProgramSearch(prog.name);
    setNewProgramId(prog.id.toString());
  };

  // For the Edit Modal: update editProgramId when a program is clicked from suggestions.
  const handleEditProgramSelect = (prog: Program) => {
    setEditProgramSearch(prog.name);
    setEditProgramId(prog.id.toString());
  };

  const resetMessages = () => setMessage('');

  // Add new level submission handler
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!newProgramId || !newLevel || !newStudentsCount || parseInt(newStudentsCount) <= 0) {
      setMessage('All fields are required and must be valid.');
      return;
    }
  
    const programId = parseInt(newProgramId);
    const levelNumber = parseInt(newLevel);
  
    // Check if this level already exists in the same program (within the currently loaded levels)
    const existing = levels.find(
      (lvl) => lvl.program_id === programId && lvl.level === levelNumber
    );
  
    if (existing) {
      setMessage('This level already exists in the selected program.');
      setShowAddModal(false);
      return;
    }
  
    try {
      const res = await axios.post(`${baseUrl}/levels.php`, {
        program_id: programId,
        level: levelNumber,
        students_count: parseInt(newStudentsCount),
      });
  
      if (res.data.status === 'success') {
        setMessage('Level added successfully');
        setShowAddModal(false);
        setNewProgramId('');
        setNewProgramSearch('');
        setNewLevel('');
        setNewStudentsCount('');
  
        // After adding, refresh the complete levels list.
        fetchAllLevels();
      } else {
        setMessage(res.data.message || 'Error adding level');
      }
    } catch (err) {
      console.error('Error adding level:', err);
      setMessage('Error adding level');
    }
  };

  // Edit level submission handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editProgramId || !editLevel || !editStudentsCount || parseInt(editStudentsCount) <= 0) {
      setMessage('All fields are required and must be valid.');
      return;
    }
    
    try {
      await axios.put(`${baseUrl}/levels.php`, {
        id: editId,
        program_id: parseInt(editProgramId),
        level: parseInt(editLevel),
        students_count: parseInt(editStudentsCount),
      });
      setMessage('Level updated successfully');
      setShowEditModal(false);
      setEditId(null);
      // Refresh all levels list after update.
      fetchAllLevels();
    } catch (err) {
      console.error('Error updating level:', err);
      setMessage('Error updating level');
    }
  };

  // Delete level handler
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this level?')) return;
    try {
      await axios.delete(`${baseUrl}/levels.php`, { data: { id } });
      setMessage('Level deleted successfully');
      fetchAllLevels();
    } catch (err) {
      console.error('Error deleting level:', err);
      setMessage('Error deleting level');
    }
  };

  // Open the edit modal and populate state
  const openEditModal = (lvl: Level) => {
    setEditId(lvl.id);
    setEditProgramId(lvl.program_id.toString());
    setEditProgramSearch(lvl.program_name);
    setEditLevel(lvl.level.toString());
    setEditStudentsCount(lvl.students_count.toString());
    setShowEditModal(true);
    setMessage('');
  };

  // Group levels by program_name.
  const groupedLevels = levels.reduce((acc: Record<string, Level[]>, lvl: Level) => {
    // Use program_name as the key.
    if (!acc[lvl.program_name]) {
      acc[lvl.program_name] = [];
    }
    acc[lvl.program_name].push(lvl);
    return acc;
  }, {});

  // If a search term is provided, filter groups to only include matching program names.
  const filteredGroups = Object.entries(groupedLevels).filter(([programName]) => {
    if (!programSearch.trim()) return true;
    return programName.toLowerCase().includes(programSearch.toLowerCase());
  });

  return (
    <section className="bg-cream dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-maroon mb-2 sm:mb-0">Manage Levels</h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Main view: dynamic program search input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Search Program"
              value={programSearch}
              onChange={(e) => setProgramSearch(e.target.value)}
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
            Add Level
          </button>
        </div>
      </div>
      
      {message && (
        <div className={`mb-4 p-3 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Render each program's levels in a separate table */}
      {filteredGroups.length > 0 ? (
        filteredGroups.map(([programName, lvlArray]) => (
          <div key={programName} className="mb-8">
            <h4 className="text-xl font-semibold text-maroon mb-2">{programName}</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">No.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Level</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Students Count</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-cream dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {lvlArray.sort((a, b) => a.level - b.level).map((lvl, index) => (
                    <tr key={lvl.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{index + 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{lvl.level}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lvl.students_count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => openEditModal(lvl)}
                            className="px-3 py-1 bg-maroon text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(lvl.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {lvlArray.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        No levels found
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
          No programs found.
        </div>
      )}

      {/* Add Level Modal */}
      {showAddModal && (
        <Modal title="Add Level" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            {/* Program Search Input */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Program:
              </label>
              <input
                type="text"
                placeholder="Search Program"
                value={newProgramSearch}
                onChange={(e) => {
                  setNewProgramSearch(e.target.value);
                  setNewProgramId('');
                }}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
              />
              {newProgramSearch && (
                <ul className="border border-gray-300 dark:border-gray-600 mt-1 max-h-40 overflow-auto rounded-md bg-white dark:bg-gray-800">
                  {programs
                    .filter(prog =>
                      prog.name?.toLowerCase().includes(newProgramSearch.toLowerCase())
                    )
                    .map(prog => (
                      <li
                        key={prog.id}
                        onClick={() => handleAddProgramSelect(prog)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {prog.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Level Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Level:
              </label>
              <select
                value={newLevel}
                onChange={(e) => setNewLevel(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Select Level --</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <InputField label="Students Count" value={newStudentsCount} setValue={setNewStudentsCount} type="number" />
            <ModalActions onCancel={() => setShowAddModal(false)} submitLabel="Add" />
          </form>
        </Modal>
      )}

      {/* Edit Level Modal */}
      {showEditModal && (
        <Modal title="Edit Level" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Program:
              </label>
              <input
                type="text"
                placeholder="Search Program"
                value={editProgramSearch}
                onChange={(e) => {
                  setEditProgramSearch(e.target.value);
                  setEditProgramId('');
                }}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
              />
              {editProgramSearch && (
                <ul className="border border-gray-300 dark:border-gray-600 mt-1 max-h-40 overflow-auto rounded-md bg-white dark:bg-gray-800">
                  {programs
                    .filter(prog =>
                      prog.name?.toLowerCase().includes(editProgramSearch.toLowerCase())
                    )
                    .map(prog => (
                      <li
                        key={prog.id}
                        onClick={() => handleEditProgramSelect(prog)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        {prog.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            {/* Level Dropdown */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Level:
              </label>
              <select
                value={editLevel}
                onChange={(e) => setEditLevel(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Select Level --</option>
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
            </div>

            <InputField label="Students Count" value={editStudentsCount} setValue={setEditStudentsCount} type="number" />
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

export default LevelsSection;
