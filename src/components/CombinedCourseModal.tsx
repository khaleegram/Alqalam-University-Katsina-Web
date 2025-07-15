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
}

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  exam_type: 'CBT' | 'Written';
}

interface OfferingInput {
  program_id: number;
  level_id: number;
}

interface OfferingOutput {
  program_id: number;
  program_name: string;
  level_id: number;
  level_number: number;
}

export interface CombinedCourse {
  id: number;
  course_code: string;
  course_name: string;
  exam_type: 'CBT' | 'Written';
  offerings: OfferingOutput[];
}

// Reusable Modal component
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}
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

// Reusable Input Field
interface InputFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}
const InputField: React.FC<InputFieldProps> = ({ label, value, onChange, placeholder }) => (
  <div className="mb-3">
    <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</label>
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
    />
  </div>
);

// Reusable Modal Actions
interface ModalActionsProps {
  onCancel: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
}
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

// Combined Course Modal
interface CombinedCourseModalProps {
  onClose: () => void;
  onAdded?: (newCourse: CombinedCourse) => void;
}
const CombinedCourseModal: React.FC<CombinedCourseModalProps> = ({ onClose, onAdded }) => {
  const baseUrl = 'http://192.168.1.104/ATG/backend/data_creation/combined_courses.php';

  // State hooks
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseResults, setCourseResults] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const [programSearch, setProgramSearch] = useState('');
  const [availablePrograms, setAvailablePrograms] = useState<Program[]>([]);
  const [selectedPrograms, setSelectedPrograms] = useState<{
    id: number;
    name: string;
    selectedLevelId: string | null;
    availableLevels: Level[];
  }[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // Fetch programs & courses
  useEffect(() => {
    axios
      .get(`${baseUrl.replace('combined_courses.php', 'programs.php')}?fetch_programs=1`)
      .then(r => setAvailablePrograms(r.data.data || []))
      .catch(console.error);

    axios
      .get(`${baseUrl.replace('combined_courses.php', 'courses.php')}`)
      .then(r => setAllCourses(r.data.data || []))
      .catch(console.error);
  }, []);

  // Filter courses
  useEffect(() => {
    if (!courseSearch.trim()) return setCourseResults([]);
    const q = courseSearch.toLowerCase();
    setCourseResults(
      allCourses.filter(
        c =>
          c.course_code.toLowerCase().includes(q) ||
          c.course_name.toLowerCase().includes(q)
      )
    );
  }, [courseSearch, allCourses]);

  const handleSelectCourse = (c: Course) => {
    setSelectedCourse(c);
    setCourseSearch('');
    setCourseResults([]);
    setMessage(null);
  };

  const filteredPrograms = availablePrograms.filter(
    p =>
      p.name.toLowerCase().includes(programSearch.toLowerCase()) &&
      !selectedPrograms.some(sp => sp.id === p.id)
  );

  const handleAddProgram = (prog: Program) => {
    axios
      .get(`${baseUrl.replace('combined_courses.php', 'levels.php')}?program_id=${prog.id}`)
      .then(res => {
        const levels: Level[] = res.data.status === 'success' ? res.data.data : [];
        setSelectedPrograms(prev => [
          ...prev,
          { id: prog.id, name: prog.name, selectedLevelId: null, availableLevels: levels },
        ]);
      })
      .catch(console.error);
    setProgramSearch('');
  };

  const handleRemoveProgram = (pid: number) =>
    setSelectedPrograms(prev => prev.filter(sp => sp.id !== pid));

  const handleLevelChange = (pid: number, lvlId: string) =>
    setSelectedPrograms(prev =>
      prev.map(sp => (sp.id === pid ? { ...sp, selectedLevelId: lvlId } : sp))
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedCourse) {
      setMessage({ text: 'Please select a course.', isError: true });
      return;
    }
    if (selectedPrograms.some(sp => !sp.selectedLevelId)) {
      setMessage({ text: 'Select a level for every program.', isError: true });
      return;
    }

    const payload = {
      course_code: selectedCourse.course_code,
      course_name: selectedCourse.course_name,
      offerings: selectedPrograms.map(sp => ({
        program_id: sp.id,
        level_id: Number(sp.selectedLevelId),
      })) as OfferingInput[],
    };

    setIsSubmitting(true);
    try {
      const res = await axios.post(baseUrl, payload);
      if (res.data.status === 'success') {
        setMessage({ text: 'Combined course added successfully!', isError: false });
        onAdded?.(res.data.data as CombinedCourse);
      } else {
        setMessage({ text: res.data.message || 'Error adding course.', isError: true });
      }
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Server error.', isError: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Add Combined Course" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Course search */}
        <InputField
          label="Course"
          value={courseSearch}
          onChange={setCourseSearch}
          placeholder="Search code or name"
        />
        {courseResults.length > 0 && (
          <div className="border max-h-48 overflow-auto">
            {courseResults.map(c => (
              <div
                key={c.id}
                onClick={() => handleSelectCourse(c)}
                className="p-2 cursor-pointer hover:bg-gray-200"
              >
                <strong>{c.course_code}</strong> — {c.course_name}
              </div>
            ))}
          </div>
        )}

        {/* Read-only Exam Type */}
        {selectedCourse && (
          <div className="mb-3">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Exam Type:
            </label>
            <input
              type="text"
              value={selectedCourse.exam_type}
              disabled
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-800 dark:text-gray-200"
            />
          </div>
        )}

        {/* Program & Level pickers */}
        <InputField
          label="Search Program"
          value={programSearch}
          onChange={setProgramSearch}
          placeholder="Type program name"
        />
        {filteredPrograms.length > 0 && (
          <div className="border max-h-48 overflow-auto">
            {filteredPrograms.map(p => (
              <div
                key={p.id}
                onClick={() => handleAddProgram(p)}
                className="p-2 cursor-pointer hover:bg-gray-200"
              >
                {p.name}
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          {selectedPrograms.map(sp => (
            <div key={sp.id} className="bg-maroon text-white p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span>{sp.name}</span>
                <button type="button" onClick={() => handleRemoveProgram(sp.id)}>
                  ×
                </button>
              </div>
              <select
                value={sp.selectedLevelId || ''}
                onChange={e => handleLevelChange(sp.id, e.target.value)}
                className="w-full p-1 rounded text-black"
              >
                <option value="">— Select Level —</option>
                {sp.availableLevels.map(lv => (
                  <option key={lv.id} value={lv.id}>
                    Level {lv.level}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <ModalActions onCancel={onClose} submitLabel="Add Combined Course" isSubmitting={isSubmitting} />
        {message && (
          <div
            className={`mt-2 p-2 rounded ${
              message.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {message.text}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default CombinedCourseModal;
