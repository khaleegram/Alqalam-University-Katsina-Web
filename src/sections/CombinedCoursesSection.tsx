import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CombinedCourseModal, { CombinedCourse as CCType } from '../components/CombinedCourseModal';

interface Program { id: number; name: string; }
interface LevelOption { id: number; level: number; program_id: number; }

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

// Custom Confirm Modal
const ConfirmModal: React.FC<{
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ open, message, onConfirm, onCancel }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-cream dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm">
        <p className="text-gray-800 dark:text-gray-200 mb-4">{message}</p>
        <div className="flex justify-end space-x-2">
          <button onClick={onCancel} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-white rounded">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
};

const CombinedCoursesSection: React.FC = () => {
  const baseUrl = 'http://192.168.21.83/ATG/backend/data_creation';

  // Main data
  const [courses, setCourses] = useState<CCType[]>([]);
  const [filtered, setFiltered] = useState<CCType[]>([]);

  // Filters
  const [searchText, setSearchText] = useState('');
  const debouncedSearch = useDebounce(searchText, 300);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Pagination
  const [visibleCount, setVisibleCount] = useState(10);

  // Lookups
  const [programs, setPrograms] = useState<Program[]>([]);
  const [levels, setLevels] = useState<LevelOption[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Temp message auto-dismiss
  const showTempMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  // Confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editCourse, setEditCourse] = useState<CCType | null>(null);
  const [editOfferings, setEditOfferings] = useState<{
    program_id: number;
    program_name: string;
    level_id: number;
    level_number: number;
  }[]>([]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // New offering inputs
  const [newOfferProgram, setNewOfferProgram] = useState('');
  const [newOfferLevel, setNewOfferLevel] = useState('');
  const [availableLevels, setAvailableLevels] = useState<LevelOption[]>([]);

  // Fetch data
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${baseUrl}/combined_courses.php`);
      setCourses(res.data.data || []);
    } catch {
      showTempMessage('Error fetching combined courses.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${baseUrl}/programs.php?fetch_programs=1`);
      setPrograms(res.data.data || []);
    } catch {
      console.error('Error fetching programs');
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchCourses();
  }, []);

  // Fetch levels when program filter changes
  useEffect(() => {
    if (selectedProgram) {
      axios.get(`${baseUrl}/levels.php?program_id=${selectedProgram}`)
        .then(r => setLevels(r.data.data || []))
        .catch(() => setLevels([]));
    } else {
      setLevels([]);
      setSelectedLevel('');
    }
  }, [selectedProgram]);

  // Fetch levels for add
  useEffect(() => {
    if (newOfferProgram) {
      axios.get(`${baseUrl}/levels.php?program_id=${newOfferProgram}`)
        .then(res => setAvailableLevels(res.data.data || []))
        .catch(() => setAvailableLevels([]));
    } else {
      setAvailableLevels([]);
      setNewOfferLevel('');
    }
  }, [newOfferProgram]);

  // Filtering & sorting
  useEffect(() => {
    let list = [...courses];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(cc =>
        cc.course_code.toLowerCase().includes(q) || cc.course_name.toLowerCase().includes(q)
      );
    }
    if (selectedProgram) {
      list = list.filter(cc =>
        cc.offerings.some(o => o.program_id.toString() === selectedProgram)
      );
    }
    if (selectedLevel) {
      list = list.filter(cc =>
        cc.offerings.some(o => o.level_id.toString() === selectedLevel)
      );
    }
    list.sort((a, b) => {
      const aMin = Math.min(...a.offerings.map(o => o.level_number));
      const bMin = Math.min(...b.offerings.map(o => o.level_number));
      return aMin - bMin;
    });
    setFiltered(list);
    setVisibleCount(10);
  }, [debouncedSearch, selectedProgram, selectedLevel, courses]);

  // Handlers
  const confirmDelete = (id: number) => {
    setConfirmMessage('Are you sure you want to delete this combined course?');
    setConfirmAction(() => async () => {
      setConfirmOpen(false);
      try {
        await axios.delete(`${baseUrl}/combined_courses.php`, { data: { id } });
        showTempMessage('Deleted successfully.');
        fetchCourses();
      } catch {
        showTempMessage('Error deleting.');
      }
    });
    setConfirmOpen(true);
  };

  const openEditModal = async (cc: CCType) => {
    const offs = await Promise.all(cc.offerings.map(async o => o));
    setEditOfferings(offs);
    setEditCourse(cc);
    setNewOfferProgram('');
    setNewOfferLevel('');
  };

  const handleRemoveEditOffering = (pid: number, lid: number) => {
    setEditOfferings(prev => prev.filter(o => !(o.program_id === pid && o.level_id === lid)));
  };

  const handleAddOffering = () => {
    if (!newOfferProgram || !newOfferLevel) return;
    const exists = editOfferings.some(
      o => o.program_id === Number(newOfferProgram) && o.level_id === Number(newOfferLevel)
    );
    if (exists) return;
    const program = programs.find(p => p.id === Number(newOfferProgram));
    const levelOpt = availableLevels.find(l => l.id === Number(newOfferLevel));
    if (program && levelOpt) {
      setEditOfferings(prev => [
        ...prev,
        {
          program_id: levelOpt.program_id,
          program_name: program.name,
          level_id: levelOpt.id,
          level_number: levelOpt.level,
        }
      ]);
      setNewOfferProgram('');
      setNewOfferLevel('');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;
    setIsSubmittingEdit(true);
    try {
      const payload = {
        id: editCourse.id,
        course_code: editCourse.course_code,
        course_name: editCourse.course_name,
        offerings: editOfferings.map(o => ({ program_id: o.program_id, level_id: o.level_id }))
      };
      const res = await axios.put(`${baseUrl}/combined_courses.php`, payload);
      if (res.data.status === 'success') {
        showTempMessage('Updated successfully.');
        fetchCourses();
        setEditCourse(null);
      } else {
        showTempMessage(res.data.message || 'Error updating.');
      }
    } catch {
      showTempMessage('Error updating.');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // Render helpers
  const renderOfferings = (offs: { program_name: string }[]) =>
    offs.map(o => o.program_name).join(', ');

  const renderLevels = (offs: { level_number: number }[]) =>
    offs.map(o => `L${o.level_number}`).join(',');

  const displayData = filtered.slice(0, visibleCount);

  return (
    <section className="p-6 bg-cream dark:bg-gray-900 rounded-lg shadow-lg max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-maroon">Combined Courses</h3>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-maroon text-white rounded text-sm"
        >
          Add Combined Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
        <div>
          <label className="block">Search:</label>
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            placeholder="Course code or name"
            className="mt-1 p-1 text-sm border rounded w-48 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          />
        </div>
        <div>
          <label className="block">Program:</label>
          <select
            value={selectedProgram}
            onChange={e => setSelectedProgram(e.target.value)}
            className="mt-1 p-1 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          >
            <option value="">-- All --</option>
            {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block">Level:</label>
          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            disabled={!levels.length}
            className="mt-1 p-1 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          >
            <option value="">-- All --</option>
            {levels.map(l => <option key={l.id} value={l.id}>L{l.level}</option>)}
          </select>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-2 rounded ${message.includes('success') ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
          {message}
        </div>
      )}

      {isLoading ? (
        // Loading skeleton
        <div className="animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-200 dark:bg-gray-700 rounded my-2"></div>
          ))}
        </div>
      ) : displayData.length ? (
        <>
          <div className="max-h-80 overflow-auto">
            <div className="min-w-full overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">#</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Code</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Course Name</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Programs</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-cream dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayData.map((cc, idx) => (
                    <tr key={cc.id}>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">{idx + 1}</td>
                      <td className="px-3 py-2 whitespace-normal font-medium break-words text-gray-900 dark:text-gray-100">{cc.course_code}</td>
                      <td className="px-3 py-2 whitespace-normal break-words text-gray-900 dark:text-gray-100">{cc.course_name}</td>
                      <td className="px-3 py-2 whitespace-normal break-words text-gray-900 dark:text-gray-100">{renderOfferings(cc.offerings)}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-900 dark:text-gray-100">{renderLevels(cc.offerings)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex space-x-1">
                          <button onClick={() => openEditModal(cc)} className="px-2 py-1 bg-maroon text-white rounded text-xs">Edit</button>
                          <button onClick={() => confirmDelete(cc.id)} className="px-2 py-1 bg-red-600 text-white rounded text-xs">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {filtered.length > visibleCount && (
            <div className="flex justify-center mt-4">
              <button onClick={() => setVisibleCount(prev => prev + 10)} className="px-4 py-2 bg-maroon text-white rounded text-sm">
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-center text-gray-700 dark:text-gray-300">No combined courses found.</p>
      )}

      {/* Add Modal */}
      {showAdd && (
        <CombinedCourseModal
          onClose={() => { setShowAdd(false); fetchCourses(); }}
          onAdded={() => { setShowAdd(false); fetchCourses(); }}
        />
      )}

      {/* Edit Modal */}
      {editCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold text-maroon mb-4">Edit Combined Course</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Course Code:</label>
                <input type="text" value={editCourse.course_code} readOnly className="mt-1 w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-sm" />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200">Course Name:</label>
                <input type="text" value={editCourse.course_name} readOnly className="mt-1 w-full p-2 border rounded bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 text-sm" />
              </div>
              <div>
                <label className="block font-medium text-gray-700 dark:text-gray-200 mb-2">Existing Offerings:</label>
                <div className="flex flex-wrap gap-2">
                  {editOfferings.map(o => (
                    <div key={`${o.program_id}-${o.level_id}`} className="bg-maroon text-white p-2 rounded flex items-center text-xs">
                      <span className="break-words">{`${o.program_name} (L${o.level_number})`}</span>
                      <button type="button" onClick={() => handleRemoveEditOffering(o.program_id, o.level_id)} className="ml-2">×</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Add Program:</label>
                  <select
                    value={newOfferProgram}
                    onChange={e => setNewOfferProgram(e.target.value)}
                    className="mt-1 w-full p-2 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <option value="">-- Select --</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block font-medium text-gray-700 dark:text-gray-200">Add Level:</label>
                  <select
                    value={newOfferLevel}
                    onChange={e => setNewOfferLevel(e.target.value)}
                    disabled={!availableLevels.length}
                    className="mt-1 w-full p-2 text-sm border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                  >
                    <option value="">-- Select --</option>
                    {availableLevels.map(l => <option key={l.id} value={l.id}>L{l.level}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddOffering}
                    className="px-3 py-1 bg-maroon text-white rounded text-sm"
                  >
                    Add Offering
                  </button>
                </div>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setEditCourse(null)} className="px-4 py-2 border rounded bg-cream text-sm dark:bg-gray-700 dark:text-white">Cancel</button>
                <button type="submit" disabled={isSubmittingEdit} className="px-4 py-2 bg-maroon text-white rounded text-sm">
                  {isSubmittingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        message={confirmMessage}
        onConfirm={confirmAction}
        onCancel={() => setConfirmOpen(false)}
      />
    </section>
  );
};

export default CombinedCoursesSection;
