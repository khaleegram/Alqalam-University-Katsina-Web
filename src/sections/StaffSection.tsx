import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Staff {
  id: number;
  name: string;
  email: string;
  phone: string;
  college_id: number;
  college_name: string;
  department_id: number;
  department_name: string;
  position: string;
}

interface College {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
  college_id: number;
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

interface SelectDepartmentProps {
  value: string;
  setValue: (val: string) => void;
  departments: Department[];
}

interface CollegeSearchModalProps {
  colleges: College[];
  onSelect: (college: College) => void;
  onClose: () => void;
}

interface PositionSelectProps {
  value: string;
  setValue: (val: string) => void;
  positions: string[];
}

const positions = [
  "Vice Chancellor",
  "Pro Vice Chancellor",
  "Deputy Vice Chancellor",
  "Registrar",
  "Bursar",
  "Director of Academic Planning",
  "Head of Department",
  "Principal Lecturer",
  "Senior Lecturer",
  "Lecturer",
];

const StaffsSection: React.FC = () => {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  
  // Modal controls for add & edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCollegeSearchModal, setShowCollegeSearchModal] = useState(false);

  // Add form state
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffCollegeId, setNewStaffCollegeId] = useState('');
  const [newStaffCollegeName, setNewStaffCollegeName] = useState('');
  const [newStaffDepartmentId, setNewStaffDepartmentId] = useState('');
  const [newStaffPosition, setNewStaffPosition] = useState('');

  // Edit form state
  const [editId, setEditId] = useState<number | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffEmail, setEditStaffEmail] = useState('');
  const [editStaffPhone, setEditStaffPhone] = useState('');
  const [editCollegeId, setEditCollegeId] = useState('');
  const [editCollegeName, setEditCollegeName] = useState('');
  const [editDepartmentId, setEditDepartmentId] = useState('');
  const [editStaffPosition, setEditStaffPosition] = useState('');

  const baseUrl = 'http://192.168.1.104/ATG/backend/data_creation';

  useEffect(() => {
    fetchStaffs();
    fetchColleges();
    fetchDepartments();
  }, []);

  // When college changes, reset department for add modal
  useEffect(() => {
    setNewStaffDepartmentId('');
  }, [newStaffCollegeId]);

  // When college changes, reset department for edit modal
  useEffect(() => {
    setEditDepartmentId('');
  }, [editCollegeId]);

  const fetchStaffs = async () => {
    try {
      const res = await axios.get(`${baseUrl}/staffs.php`);
      setStaffs(res.data);
    } catch (err) {
      console.error('Error fetching staffs:', err);
      setMessage('Error fetching staffs');
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

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${baseUrl}/departments.php`);
      setDepartments(res.data);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setMessage('Error fetching departments');
    }
  };

  const resetMessages = () => setMessage('');

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const duplicate = staffs.some(
      (s) =>
        s.name.toLowerCase() === newStaffName.toLowerCase() &&
        s.email.toLowerCase() === newStaffEmail.toLowerCase() &&
        s.phone === newStaffPhone &&
        s.college_id === parseInt(newStaffCollegeId) &&
        s.department_id === parseInt(newStaffDepartmentId) &&
        s.position === newStaffPosition
    );

    if (duplicate) {
      setMessage('This staff already exists in the selected college/department with the same position.');
      return;
    }

    try {
      await axios.post(`${baseUrl}/staffs.php`, {
        name: newStaffName,
        email: newStaffEmail,
        phone: newStaffPhone,
        college_id: parseInt(newStaffCollegeId),
        department_id: parseInt(newStaffDepartmentId),
        position: newStaffPosition,
      });
      setMessage('Staff added successfully');
      setShowAddModal(false);
      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('');
      setNewStaffCollegeId('');
      setNewStaffCollegeName('');
      setNewStaffDepartmentId('');
      setNewStaffPosition('');
      fetchStaffs();
    } catch (err) {
      console.error(err);
      setMessage('Error adding staff');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;

    const duplicate = staffs.some(
      (s) =>
        s.name.toLowerCase() === editStaffName.toLowerCase() &&
        s.email.toLowerCase() === editStaffEmail.toLowerCase() &&
        s.phone === editStaffPhone &&
        s.college_id === parseInt(editCollegeId) &&
        s.department_id === parseInt(editDepartmentId) &&
        s.position === editStaffPosition &&
        s.id !== editId
    );

    if (duplicate) {
      setMessage('Duplicate staff in selected college/department with the same position.');
      return;
    }

    try {
      await axios.put(`${baseUrl}/staffs.php`, {
        id: editId,
        name: editStaffName,
        email: editStaffEmail,
        phone: editStaffPhone,
        college_id: parseInt(editCollegeId),
        department_id: parseInt(editDepartmentId),
        position: editStaffPosition,
      });
      setMessage('Staff updated successfully');
      setShowEditModal(false);
      setEditId(null);
      fetchStaffs();
    } catch (err) {
      console.error(err);
      setMessage('Error updating staff');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this staff?')) return;
    try {
      await axios.delete(`${baseUrl}/staffs.php`, { data: { id } });
      setMessage('Staff deleted successfully');
      fetchStaffs();
    } catch (err) {
      console.error(err);
      setMessage('Error deleting staff');
    }
  };

  const openEditModal = (staff: Staff) => {
    setEditId(staff.id);
    setEditStaffName(staff.name);
    setEditStaffEmail(staff.email);
    setEditStaffPhone(staff.phone);
    setEditCollegeId(staff.college_id.toString());
    setEditCollegeName(staff.college_name);
    setEditDepartmentId(staff.department_id.toString());
    setEditStaffPosition(staff.position);
    setShowEditModal(true);
    setMessage('');
  };

  const filteredStaffs = staffs.filter((staff) =>
    staff.name.toLowerCase().includes(search.toLowerCase())
  );

  // Filter departments based on selected college
  const availableDepartmentsForAdd = departments.filter(
    (dept) => dept.college_id === parseInt(newStaffCollegeId)
  );
  const availableDepartmentsForEdit = departments.filter(
    (dept) => dept.college_id === parseInt(editCollegeId)
  );

  return (
    <section className="bg-cream dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-maroon">Manage Staffs</h3>
        <button
          onClick={() => {
            resetMessages();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition-colors"
        >
          Add Staff
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded ${
          message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {message}
        </div>
      )}

      <input
        type="text"
        placeholder="Search staffs by name..."
        className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-cream dark:bg-gray-800 text-black dark:text-white"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Desktop Table View */}
      <div className="overflow-x-auto hidden sm:block">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">College</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Department</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-cream dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredStaffs.map((staff) => (
              <tr key={staff.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staff.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{staff.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staff.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staff.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staff.college_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staff.department_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{staff.position}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(staff)}
                      className="px-3 py-1 bg-maroon text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStaffs.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No staffs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 block sm:hidden">
        {filteredStaffs.map((staff) => (
          <div
            key={staff.id}
            className="bg-cream dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-2">
              <h4 className="font-bold text-maroon">#{staff.id} - {staff.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">Email: {staff.email}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Phone: {staff.phone}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">College: {staff.college_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Department: {staff.department_name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Position: {staff.position}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => openEditModal(staff)}
                className="px-3 py-1 bg-maroon text-white rounded hover:bg-blue-700 transition-colors text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(staff.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredStaffs.length === 0 && (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">No staffs found</div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Staff" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <InputField label="Staff Name" value={newStaffName} setValue={setNewStaffName} />
            <InputField label="Email" type="email" value={newStaffEmail} setValue={setNewStaffEmail} />
            <InputField label="Phone Number" value={newStaffPhone} setValue={setNewStaffPhone} />
            <PositionSelect value={newStaffPosition} setValue={setNewStaffPosition} positions={positions} />
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">College:</label>
              {newStaffCollegeId ? (
                <div className="flex items-center justify-between bg-cream p-2 rounded border border-gray-300 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-white">{newStaffCollegeName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setNewStaffCollegeId('');
                      setNewStaffCollegeName('');
                      setNewStaffDepartmentId('');
                    }}
                    className="text-red-500"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCollegeSearchModal(true)}
                  className="px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition-colors"
                >
                  Select College
                </button>
              )}
            </div>
            {newStaffCollegeId && (
              <SelectDepartment
                value={newStaffDepartmentId}
                setValue={setNewStaffDepartmentId}
                departments={availableDepartmentsForAdd}
              />
            )}
            <ModalActions onCancel={() => setShowAddModal(false)} submitLabel="Add" />
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal title="Edit Staff" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <InputField label="Staff Name" value={editStaffName} setValue={setEditStaffName} />
            <InputField label="Email" type="email" value={editStaffEmail} setValue={setEditStaffEmail} />
            <InputField label="Phone Number" value={editStaffPhone} setValue={setEditStaffPhone} />
            <PositionSelect value={editStaffPosition} setValue={setEditStaffPosition} positions={positions} />
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">College:</label>
              {editCollegeId ? (
                <div className="flex items-center justify-between bg-cream p-2 rounded border border-gray-300 dark:border-gray-600">
                  <span className="text-gray-900 dark:text-white">{editCollegeName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditCollegeId('');
                      setEditCollegeName('');
                      setEditDepartmentId('');
                    }}
                    className="text-red-500"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCollegeSearchModal(true)}
                  className="px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition-colors"
                >
                  Select College
                </button>
              )}
            </div>
            {editCollegeId && (
              <SelectDepartment
                value={editDepartmentId}
                setValue={setEditDepartmentId}
                departments={availableDepartmentsForEdit}
              />
            )}
            <ModalActions onCancel={() => setShowEditModal(false)} submitLabel="Update" />
          </form>
        </Modal>
      )}

      {/* College Search Modal */}
      {showCollegeSearchModal && (
        <CollegeSearchModal
          colleges={colleges}
          onSelect={(college) => {
            if (showAddModal) {
              setNewStaffCollegeId(college.id.toString());
              setNewStaffCollegeName(college.name);
            }
            if (showEditModal) {
              setEditCollegeId(college.id.toString());
              setEditCollegeName(college.name);
            }
            setShowCollegeSearchModal(false);
          }}
          onClose={() => setShowCollegeSearchModal(false)}
        />
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

// Reusable Select College Component (exactly as in your departments section)
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

// Reusable Input Field Component (same as departments)
const InputField: React.FC<InputFieldProps> = ({ label, value, setValue, type = "text" }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">{label}:</label>
    <input
      type={type}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-cream dark:bg-gray-800 text-black dark:text-white"
    />
  </div>
);

// Reusable Modal Actions Component (same as departments)
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

// Select Department Component (simplified for college/department selection)
const SelectDepartment: React.FC<SelectDepartmentProps> = ({ value, setValue, departments }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">Select Department:</label>
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      className="w-full p-2 bg-black text-white"
    >
      <option value="">-- Select Department --</option>
      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.name}
        </option>
      ))}
    </select>
  </div>
);

// Position Select Component (using departments style for input fields)
const PositionSelect: React.FC<PositionSelectProps> = ({ value, setValue, positions }) => (
  <div>
    <label className="block mb-2 text-sm font-medium text-gray-700">Select Position:</label>
    <select
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-maroon focus:border-maroon dark:bg-gray-700 dark:text-white"
    >
      <option value="">-- Select Position --</option>
      {positions.map((position, index) => (
        <option key={index} value={position}>
          {position}
        </option>
      ))}
    </select>
  </div>
);

// College Search Modal Component (using the same input and button styles)
const CollegeSearchModal: React.FC<CollegeSearchModalProps> = ({ colleges, onSelect, onClose }) => {
  const [collegeSearch, setCollegeSearch] = useState('');

  const filteredColleges = colleges.filter((college) =>
    college.name.toLowerCase().includes(collegeSearch.toLowerCase())
  );

  return (
    <Modal title="Select College" onClose={onClose}>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search colleges..."
          value={collegeSearch}
          onChange={(e) => setCollegeSearch(e.target.value)}
          className="w-full p-2 mb-4 rounded border border-gray-300 dark:border-gray-600 bg-cream dark:bg-gray-800 text-black dark:text-white"
        />
        <div className="max-h-64 overflow-y-auto">
          {filteredColleges.map((college) => (
            <button
              key={college.id}
              onClick={() => onSelect(college)}
              className="w-full text-left p-2 bg-transparent border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {college.name}
            </button>
          ))}
          {filteredColleges.length === 0 && (
            <p className="text-center text-gray-500">No colleges found</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default StaffsSection;
