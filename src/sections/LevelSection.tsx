// File: LevelsSection.tsx

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

interface Session {
  session_id: number;
  session_name: string;
}

interface Semester {
  semester_id: number;
  semester_number: number;
  status: string;
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

const BASE_URL = 'http://192.168.1.104/ATG/backend/data_creation/academic_api.php';


const LevelsSection: React.FC = () => {
  // programs & levels
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  // versioned sessions & semesters
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemester] = useState<number | null>(null);

  // snapshot vs live
  const [snapshotLevels, setSnapshotLevels] = useState<Level[]>([]);

  // UI state
  const [programSearch, setProgramSearch] = useState('');
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // add/edit form state
  const [newProgramId, setNewProgramId] = useState('');
  const [newProgramSearch, setNewProgramSearch] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [newStudentsCount, setNewStudentsCount] = useState('');

  const [editId, setEditId] = useState<number | null>(null);
  const [editProgramId, setEditProgramId] = useState('');
  const [editProgramSearch, setEditProgramSearch] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [editStudentsCount, setEditStudentsCount] = useState('');

  // initial load
  useEffect(() => {
    fetchSessions();
    fetchPrograms();
    fetchAllLevels();
  }, []);

  // fetch academic sessions
// fetch academic sessions
const fetchSessions = async () => {
  try {
    const { data } = await axios.get(`${BASE_URL}?action=get_sessions`);
    setSessions(data.data);
    if (data.data.length) {
      setActiveSession(data.data[0].session_id);
    }
  } catch {
    setMessage('Error loading sessions');
  }
};


  // fetch semesters when session changes
  useEffect(() => {
    if (!activeSession) {
      setSemesters([]);
      setActiveSemester(null);
      return;
    }
    axios
      .get(`${BASE_URL}?action=get_semesters&session_id=${activeSession}`)
      .then(({ data }) => {
        if (data.status === 'success') {
          setSemesters(data.data);
          const openSem = data.data.find((s: Semester) => s.status === 'open') || data.data[0];
          setActiveSemester(openSem?.semester_id || null);
        }
      })
      .catch(() => {
        setSemesters([]);
        setActiveSemester(null);
      });
  }, [activeSession]);
  

  // fetch snapshot whenever session+semester change
  useEffect(() => {
    if (activeSession && activeSemester) {
      axios
        .get(
          `${BASE_URL}?action=get_level_history&session_id=${activeSession}&semester_id=${activeSemester}`
        )
        .then(({ data }) => {
          setSnapshotLevels(data.status === 'success' ? data.data : []);
        })
        .catch(() => {
          setSnapshotLevels([]);
        });
    } else {
      setSnapshotLevels([]);
    }
  }, [activeSession, activeSemester]);
  

  // fetch programs & levels
  const fetchPrograms = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/programs.php`);
      setPrograms(data.data);
    } catch {
      setMessage('Error fetching programs');
    }
  };
  const fetchAllLevels = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/levels.php`);
      setLevels(data.data);
    } catch {
      setMessage('Error fetching levels');
    }
  };

  // handle add/edit selection
  const handleAddProgramSelect = (p: Program) => {
    setNewProgramSearch(p.name);
    setNewProgramId(p.id.toString());
  };
  const handleEditProgramSelect = (p: Program) => {
    setEditProgramSearch(p.name);
    setEditProgramId(p.id.toString());
  };
  const resetMessages = () => setMessage('');

  // add level
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramId || !newLevel || !newStudentsCount || +newStudentsCount <= 0) {
      setMessage('All fields are required and must be valid.');
      return;
    }
    const exists = levels.some(
      l => l.program_id === +newProgramId && l.level === +newLevel
    );
    if (exists) {
      setMessage('This level already exists.');
      setShowAddModal(false);
      return;
    }
    try {
      const { data } = await axios.post(`${BASE_URL}/levels.php`, {
        program_id: +newProgramId,
        level: +newLevel,
        students_count: +newStudentsCount,
      });
      if (data.status === 'success') {
        setMessage('Level added successfully');
        setShowAddModal(false);
        fetchAllLevels();
      } else {
        setMessage(data.message);
      }
    } catch {
      setMessage('Error adding level');
    }
  };

  // edit level
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      editId === null ||
      !editProgramId ||
      !editLevel ||
      !editStudentsCount ||
      +editStudentsCount <= 0
    ) {
      setMessage('All fields are required and must be valid.');
      return;
    }
    try {
      await axios.put(`${BASE_URL}/levels.php`, {
        id: editId,
        program_id: +editProgramId,
        level: +editLevel,
        students_count: +editStudentsCount,
      });
      setMessage('Level updated successfully');
      setShowEditModal(false);
      fetchAllLevels();
    } catch {
      setMessage('Error updating level');
    }
  };

  // delete level
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this level?')) return;
    try {
      await axios.delete(`${BASE_URL}/levels.php`, { data: { id } });
      setMessage('Level deleted successfully');
      fetchAllLevels();
    } catch {
      setMessage('Error deleting level');
    }
  };

  // open edit modal
  const openEditModal = (lvl: Level) => {
    setEditId(lvl.id);
    setEditProgramId(lvl.program_id.toString());
    setEditProgramSearch(lvl.program_name);
    setEditLevel(lvl.level.toString());
    setEditStudentsCount(lvl.students_count.toString());
    setShowEditModal(true);
    resetMessages();
  };

  // choose data source
  const displayedLevels = snapshotLevels.length ? snapshotLevels : levels;

  // group & filter
  const grouped = displayedLevels.reduce<Record<string, Level[]>>((acc, l) => {
    acc[l.program_name] = acc[l.program_name] || [];
    acc[l.program_name].push(l);
    return acc;
  }, {});
  const filtered = Object.entries(grouped).filter(([name]) =>
    programSearch.trim()
      ? name.toLowerCase().includes(programSearch.toLowerCase())
      : true
  );

  return (
    <section className="bg-cream dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Session & Semester */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-6">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Academic Session
          </label>
          <select
            value={activeSession ?? ''}
            onChange={e => setActiveSession(+e.target.value)}
            className="p-2 border rounded"
          >
            {sessions.map(s => (
              <option key={s.session_id} value={s.session_id}>
                {s.session_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Semester
          </label>
          <select
            value={activeSemester ?? ''}
            onChange={e => setActiveSemester(+e.target.value)}
            disabled={!semesters.length}
            className="p-2 border rounded disabled:opacity-50"
          >
            {semesters.length ? (
              semesters.map(s => (
                <option key={s.semester_id} value={s.semester_id}>
                  Semester {s.semester_number}{' '}
                  {s.status === 'open' ? '(open)' : ''}
                </option>
              ))
            ) : (
              <option>No semesters</option>
            )}
          </select>
        </div>
      </div>

      {/* Manage Levels */}
      <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-maroon mb-2 sm:mb-0">
          Manage Levels
        </h3>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="text"
            placeholder="Search Program"
            value={programSearch}
            onChange={e => setProgramSearch(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={() => {
              resetMessages();
              setShowAddModal(true);
            }}
            className="px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark"
            disabled={!!snapshotLevels.length}
            title={
              snapshotLevels.length
                ? 'Cannot add while viewing a snapshot'
                : 'Add Level'
            }
          >
            Add Level
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes('success')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      {/* Levels Table */}
      {filtered.length ? (
        filtered.map(([progName, arr]) => (
          <div key={progName} className="mb-8">
            <h4 className="text-xl font-semibold text-maroon mb-2">
              {progName}
            </h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Students Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-cream dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {arr
                    .sort((a, b) => a.level - b.level)
                    .map((lvl, idx) => (
                      <tr key={lvl.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {lvl.level}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {lvl.students_count}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => openEditModal(lvl)}
                              className="px-3 py-1 bg-maroon text-white rounded hover:bg-maroon-dark"
                              disabled={!!snapshotLevels.length}
                              title={
                                snapshotLevels.length
                                  ? 'Cannot edit while viewing a snapshot'
                                  : 'Edit'
                              }
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(lvl.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                              disabled={!!snapshotLevels.length}
                              title={
                                snapshotLevels.length
                                  ? 'Cannot delete while viewing a snapshot'
                                  : 'Delete'
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center text-gray-500 dark:text-gray-400">
          {snapshotLevels.length
            ? 'No data in this snapshot.'
            : 'No levels found.'}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Level" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Program
              </label>
              <input
                type="text"
                placeholder="Search Program"
                value={newProgramSearch}
                onChange={e => {
                  setNewProgramSearch(e.target.value);
                  setNewProgramId('');
                }}
                className="w-full p-2 border rounded"
              />
              {newProgramSearch && (
                <ul className="border rounded max-h-40 overflow-auto">
                  {programs
                    .filter(p =>
                      p.name
                        .toLowerCase()
                        .includes(newProgramSearch.toLowerCase())
                    )
                    .map(p => (
                      <li
                        key={p.id}
                        onClick={() => handleAddProgramSelect(p)}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        {p.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Level</label>
              <select
                value={newLevel}
                onChange={e => setNewLevel(e.target.value)}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">-- Select Level --</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              label="Students Count"
              value={newStudentsCount}
              setValue={setNewStudentsCount}
              type="number"
            />
            <ModalActions
              onCancel={() => setShowAddModal(false)}
              submitLabel="Add"
            />
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal title="Edit Level" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="block mb-2 text-sm font-medium">
                Program
              </label>
              <input
                type="text"
                placeholder="Search Program"
                value={editProgramSearch}
                onChange={e => {
                  setEditProgramSearch(e.target.value);
                  setEditProgramId('');
                }}
                className="w-full p-2 border rounded"
              />
              {editProgramSearch && (
                <ul className="border rounded max-h-40 overflow-auto">
                  {programs
                    .filter(p =>
                      p.name
                        .toLowerCase()
                        .includes(editProgramSearch.toLowerCase())
                    )
                    .map(p => (
                      <li
                        key={p.id}
                        onClick={() => handleEditProgramSelect(p)}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                      >
                        {p.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Level</label>
              <select
                value={editLevel}
                onChange={e => setEditLevel(e.target.value)}
                required
                className="w-full p-2 border rounded"
              >
                <option value="">-- Select Level --</option>
                {[1, 2, 3, 4, 5].map(n => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <InputField
              label="Students Count"
              value={editStudentsCount}
              setValue={setEditStudentsCount}
              type="number"
            />
            <ModalActions
              onCancel={() => setShowEditModal(false)}
              submitLabel="Update"
            />
          </form>
        </Modal>
      )}
    </section>
  );
};

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-cream dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-maroon">{title}</h2>
        <button onClick={onClose} aria-label="Close">
          <svg className="h-6 w-6 text-gray-400 hover:text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const InputField: React.FC<InputFieldProps> = ({ label, value, setValue, type = 'text' }) => (
  <div>
    <label className="block mb-2 text-sm font-medium">{label}:</label>
    <input
      type={type}
      value={value}
      onChange={e => setValue(e.target.value)}
      required
      className="w-full p-2 border rounded"
    />
  </div>
);

const ModalActions: React.FC<ModalActionsProps> = ({ onCancel, submitLabel }) => (
  <div className="flex justify-end space-x-3 pt-4">
    <button
      onClick={onCancel}
      type="button"
      className="px-4 py-2 border rounded"
    >
      Cancel
    </button>
    <button type="submit" className="px-4 py-2 bg-maroon text-white rounded">
      {submitLabel}
    </button>
  </div>
);

export default LevelsSection;
