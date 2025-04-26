import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Interfaces
interface Program {
  id: number;
  name: string;
}

interface Level {
  id: number;
  level: number;
  program_id: number;
  students_count: number;
  program_name?: string;
}

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  level_id: number;
  level?: number;
  program_id?: number;
  program_name?: string;
  credit_unit?: number;
  exam_type: 'CBT' | 'Written';
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
  placeholder?: string;
}

interface ModalActionsProps {
  onCancel: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
}

interface SelectOptionProps {
  value: string;
  setValue: (val: string) => void;
  options: { id: number; label: string }[];
  placeholder?: string;
}

const CoursesSection: React.FC = () => {
  const baseUrl = 'http://192.168.94.83/ATG/backend/data_creation';

  // Table & filter state
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');

  const [programs, setPrograms] = useState<Program[]>([]);
  const [filterLevels, setFilterLevels] = useState<Level[]>([]);
  const [programSearch, setProgramSearch] = useState('');
  const [filteredPrograms, setFilteredPrograms] = useState<Program[]>([]);
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('');

  // Add modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProgramSearch, setNewProgramSearch] = useState('');
  const [newFilteredPrograms, setNewFilteredPrograms] = useState<Program[]>([]);
  const [newProgramId, setNewProgramId] = useState('');
  const [newLevelId, setNewLevelId] = useState('');
  const [newLevels, setNewLevels] = useState<Level[]>([]);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCreditUnit, setNewCreditUnit] = useState('');
  const [newExamType, setNewExamType] = useState<'CBT' | 'Written'>('CBT');
  const [isAdding, setIsAdding] = useState(false);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editLevels, setEditLevels] = useState<Level[]>([]);
  const [editLevelId, setEditLevelId] = useState('');
  const [editCourseCode, setEditCourseCode] = useState('');
  const [editCourseName, setEditCourseName] = useState('');
  const [editCreditUnit, setEditCreditUnit] = useState('');
  const [editExamType, setEditExamType] = useState<'CBT' | 'Written'>('CBT');
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch routines
  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/courses.php`);
      setAllCourses(res.data.status === 'success' ? res.data.data : []);
    } catch {
      setMessage('Error fetching courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${baseUrl}/programs.php`);
      const data = res.data.status === 'success' ? res.data.data : [];
      setPrograms(data);
      setFilteredPrograms(data);
      setNewFilteredPrograms(data);
    } catch {
      setMessage('Error fetching programs');
    }
  };

  const fetchLevels = async (programId: number, forEdit = false) => {
    try {
      const res = await axios.get(`${baseUrl}/levels.php?program_id=${programId}`);
      const lvls = res.data.status === 'success' ? res.data.data : [];
      if (forEdit) setEditLevels(lvls);
      else setNewLevels(lvls);
    } catch {
      if (forEdit) setEditLevels([]);
      else setNewLevels([]);
      setMessage('Error fetching levels');
    }
  };

  // Effects
  useEffect(() => {
    fetchAll();
    fetchPrograms();
  }, []);

  useEffect(() => {
    setFilteredPrograms(
      programSearch
        ? programs.filter(p => p.name.toLowerCase().includes(programSearch.toLowerCase()))
        : programs
    );
  }, [programSearch, programs]);

  useEffect(() => {
    let data = [...allCourses];
    if (selectedProgramFilter) {
      data = data.filter(c => c.program_id?.toString() === selectedProgramFilter);
    }
    if (selectedLevelFilter) {
      data = data.filter(c => c.level_id.toString() === selectedLevelFilter);
    }
    setFilteredCourses(data);
  }, [allCourses, selectedProgramFilter, selectedLevelFilter]);

  useEffect(() => {
    if (selectedProgramFilter) {
      fetchLevels(parseInt(selectedProgramFilter), false);
      setSelectedLevelFilter('');
    } else {
      setFilterLevels([]);
      setSelectedLevelFilter('');
    }
  }, [selectedProgramFilter]);

  useEffect(() => {
    setNewFilteredPrograms(
      newProgramSearch
        ? programs.filter(p => p.name.toLowerCase().includes(newProgramSearch.toLowerCase()))
        : programs
    );
  }, [newProgramSearch, programs]);

  // Auto-set exam type on level change for Add
  useEffect(() => {
    if (newLevelId) {
      const lvl = newLevels.find(l => l.id.toString() === newLevelId);
      setNewExamType(lvl?.level === 1 ? 'CBT' : 'Written');
    }
  }, [newLevelId, newLevels]);

  // Auto-set exam type on level change for Edit
  useEffect(() => {
    if (editLevelId) {
      const lvl = editLevels.find(l => l.id.toString() === editLevelId);
      setEditExamType(lvl?.level === 1 ? 'CBT' : 'Written');
    }
  }, [editLevelId, editLevels]);

  // Handlers
  const resetMessage = () => setMessage('');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgramId || !newLevelId || !newCourseCode || !newCourseName || !newCreditUnit) {
      setMessage('All fields required');
      return;
    }
    setIsAdding(true);
    try {
      await axios.post(`${baseUrl}/courses.php`, {
        level_id: parseInt(newLevelId),
        course_code: newCourseCode,
        course_name: newCourseName,
        credit_unit: parseInt(newCreditUnit),
        exam_type: newExamType,
      });
      fetchAll();
      setShowAddModal(false);
    } catch {
      setMessage('Error adding');
    } finally {
      setIsAdding(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId || !editLevelId || !editCourseCode || !editCourseName || !editCreditUnit) {
      setMessage('All fields required');
      return;
    }
    setIsUpdating(true);
    try {
      await axios.put(`${baseUrl}/courses.php`, {
        id: editId,
        level_id: parseInt(editLevelId),
        course_code: editCourseCode,
        course_name: editCourseName,
        credit_unit: parseInt(editCreditUnit),
        exam_type: editExamType,
      });
      fetchAll();
      setShowEditModal(false);
    } catch {
      setMessage('Error updating');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this course?')) return;
    try {
      await axios.delete(`${baseUrl}/courses.php`, { data: { id } });
      fetchAll();
    } catch {
      setMessage('Error deleting');
    }
  };

  const openEdit = (c: Course) => {
    setEditId(c.id);
    setEditCourseCode(c.course_code);
    setEditCourseName(c.course_name);
    setEditCreditUnit(c.credit_unit?.toString() || '');
    setEditLevelId(c.level_id.toString());
    setEditExamType(c.exam_type);
    if (c.program_id) fetchLevels(c.program_id, true);
    setShowEditModal(true);
    resetMessage();
  };

  // group by program
  const grouped = filteredCourses.reduce((acc: Record<string, Course[]>, c) => {
    const key = c.program_id?.toString() ?? 'unassigned';
    (acc[key] ||= []).push(c);
    return acc;
  }, {});

  return (
    <section className="bg-cream dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h3 className="text-2xl font-semibold text-maroon mb-4">Manage Courses</h3>
      {message && <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">{message}</div>}
      {isLoading ? (
        <p className="text-center">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-4">
          <div>
            <label className="block mb-1">Program</label>
            <input
              type="text"
              value={programSearch}
              onChange={e => { setProgramSearch(e.target.value); setSelectedProgramFilter(''); }}
              className="w-full p-2 border rounded"
              placeholder="Search program"
            />
            {programSearch && !selectedProgramFilter && (
              <ul className="border max-h-40 overflow-auto">
                {filteredPrograms.map(p => (
                  <li
                    key={p.id}
                    onClick={() => { setSelectedProgramFilter(p.id.toString()); setProgramSearch(p.name); }}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
            {selectedProgramFilter && (
              <p>Selected: {programs.find(p => p.id.toString() === selectedProgramFilter)?.name}</p>
            )}
          </div>
          {selectedProgramFilter && (
            <SelectOption
              value={selectedLevelFilter}
              setValue={setSelectedLevelFilter}
              options={filterLevels.map(l => ({ id: l.id, label: `Level ${l.level}` }))}
              placeholder="Filter Level"
            />
          )}
          <button
            onClick={() => { resetMessage(); setShowAddModal(true); }}
            className="px-4 py-2 bg-maroon text-white rounded"
          >
            Add Course
          </button>
        </div>
      )}

      {Object.entries(grouped).map(([progKey, courses]) => {
        const progName =
          programs.find(p => p.id.toString() === progKey)?.name || 'Unassigned';
        return (
          <div key={progKey} className="mb-6">
            <h4 className="text-xl font-semibold text-maroon">{progName}</h4>
            <div className="overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Code</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Level</th>
                    <th className="px-4 py-2">Type</th>
                    <th className="px-4 py-2">Credit</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((c, i) => (
                    <tr key={c.id}>
                      <td className="px-4 py-2">{i + 1}</td>
                      <td className="px-4 py-2">{c.course_code}</td>
                      <td className="px-4 py-2">{c.course_name}</td>
                      <td className="px-4 py-2">{c.level ? `Level ${c.level}` : 'N/A'}</td>
                      <td className="px-4 py-2">{c.exam_type}</td>
                      <td className="px-4 py-2">{c.credit_unit ?? 'N/A'}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button onClick={() => openEdit(c)} className="bg-blue-500 text-white px-2 py-1 rounded">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="bg-red-600 text-white px-2 py-1 rounded">
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {showAddModal && (
        <Modal title="Add Course" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAdd} className="space-y-4">
            <InputField
              label="Search Program"
              value={newProgramSearch}
              setValue={val => { setNewProgramSearch(val); setNewProgramId(''); setNewLevels([]); }}
              placeholder="Enter program name"
            />
            {!newProgramId && newProgramSearch && (
              <ul className="border max-h-40 overflow-auto">
                {newFilteredPrograms.map(p => (
                  <li
                    key={p.id}
                    onClick={() => { setNewProgramId(p.id.toString()); fetchLevels(p.id, false); }}
                    className="p-2 hover:bg-gray-200 cursor-pointer"
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
            {newProgramId && <p>Selected Program: {programs.find(p => p.id.toString() === newProgramId)?.name}</p>}
            <SelectOption
              value={newLevelId}
              setValue={setNewLevelId}
              options={newLevels.map(l => ({ id: l.id, label: `Level ${l.level}` }))}
              placeholder="Select Level"
            />
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Exam Type:</label>
              <select
                value={newExamType}
                onChange={e => setNewExamType(e.target.value as 'CBT' | 'Written')}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
              >
                <option value="CBT">CBT</option>
                <option value="Written">Written</option>
              </select>
            </div>
            <InputField label="Course Name" value={newCourseName} setValue={setNewCourseName} />
            <InputField label="Course Code" value={newCourseCode} setValue={setNewCourseCode} />
            <InputField
              label="Credit Unit"
              value={newCreditUnit}
              setValue={setNewCreditUnit}
              type="number"
            />
            <ModalActions onCancel={() => setShowAddModal(false)} submitLabel="Add" isSubmitting={isAdding} />
          </form>
        </Modal>
      )}

      {showEditModal && (
        <Modal title="Edit Course" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEdit} className="space-y-4">
            <SelectOption
              value={editLevelId}
              setValue={setEditLevelId}
              options={editLevels.map(l => ({ id: l.id, label: `Level ${l.level}` }))}
              placeholder="Select Level"
            />
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Exam Type:</label>
              <select
                value={editExamType}
                onChange={e => setEditExamType(e.target.value as 'CBT' | 'Written')}
                required
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
              >
                <option value="CBT">CBT</option>
                <option value="Written">Written</option>
              </select>
            </div>
            <InputField label="Course Name" value={editCourseName} setValue={setEditCourseName} />
            <InputField label="Course Code" value={editCourseCode} setValue={setEditCourseCode} />
            <InputField
              label="Credit Unit"
              value={editCreditUnit}
              setValue={setEditCreditUnit}
              type="number"
            />
            <ModalActions onCancel={() => setShowEditModal(false)} submitLabel="Update" isSubmitting={isUpdating} />
          </form>
        </Modal>
      )}
    </section>
  );
};

// Reusable components

const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-cream dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-maroon">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {children}
    </div>
  </div>
);

const InputField: React.FC<InputFieldProps> = ({ label, value, setValue, type = 'text', placeholder }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={e => setValue(e.target.value)}
      required
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
    />
  </div>
);

const SelectOption: React.FC<SelectOptionProps> = ({ value, setValue, options, placeholder }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
      {placeholder || 'Select an option'}:
    </label>
    <select
      value={value}
      onChange={e => setValue(e.target.value)}
      required
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
    >
      <option value="">{placeholder ? `-- ${placeholder} --` : '-- Select --'}</option>
      {options.map(opt => (
        <option key={opt.id} value={opt.id}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const ModalActions: React.FC<ModalActionsProps> = ({ onCancel, submitLabel, isSubmitting = false }) => (
  <div className="flex justify-end space-x-3 pt-4">
    <button
      onClick={onCancel}
      type="button"
      disabled={isSubmitting}
      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-cream dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon disabled:opacity-50"
    >
      Cancel
    </button>
    <button
      type="submit"
      disabled={isSubmitting}
      className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-maroon hover:bg-maroon-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maroon ${
        isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isSubmitting ? 'Processing...' : submitLabel}
    </button>
  </div>
);

export default CoursesSection;
