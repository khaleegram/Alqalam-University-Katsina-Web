import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Venue {
  id: number;
  name: string;
  code: string;
  capacity: number;
  latitude?: string;
  longitude?: string;
  radius?: number;
  venue_type: 'CBT' | 'Written';
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

const VenuesSection: React.FC = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  // Modal state for add and edit
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Add form state
  const [newVenueName, setNewVenueName] = useState('');
  const [newHallCode, setNewHallCode] = useState('');
  const [newCapacity, setNewCapacity] = useState('');
  const [newLatitude, setNewLatitude] = useState('');
  const [newLongitude, setNewLongitude] = useState('');
  const [newRadius, setNewRadius] = useState('');
  const [newVenueType, setNewVenueType] = useState<'CBT' | 'Written'>('CBT');

  // Edit form state
  const [editId, setEditId] = useState<number | null>(null);
  const [editVenueName, setEditVenueName] = useState('');
  const [editHallCode, setEditHallCode] = useState('');
  const [editCapacity, setEditCapacity] = useState('');
  const [editLatitude, setEditLatitude] = useState('');
  const [editLongitude, setEditLongitude] = useState('');
  const [editRadius, setEditRadius] = useState('');
  const [editVenueType, setEditVenueType] = useState<'CBT' | 'Written'>('CBT');

  const baseUrl = 'http://192.168.94.83/ATG/backend/data_creation';

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const res = await axios.get<Venue[]>(`${baseUrl}/venues.php`);
      setVenues(res.data);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setMessage('Error fetching venues');
    }
  };

  const resetMessages = () => setMessage('');

  // Validate latitude and longitude if provided (simple numeric validation)
  const validateCoordinates = (lat: string, lng: string): boolean => {
    if (lat && isNaN(parseFloat(lat))) {
      setMessage("Invalid latitude format.");
      return false;
    }
    if (lng && isNaN(parseFloat(lng))) {
      setMessage("Invalid longitude format.");
      return false;
    }
    return true;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCoordinates(newLatitude, newLongitude)) return;
    try {
      await axios.post(`${baseUrl}/venues.php`, {
        name: newVenueName,
        code: newHallCode,
        capacity: parseInt(newCapacity),
        latitude: newLatitude || null,
        longitude: newLongitude || null,
        radius: newRadius ? parseInt(newRadius) : null,
        venue_type: newVenueType,
      });
      setMessage('Venue added successfully');
      setShowAddModal(false);
      // reset form
      setNewVenueName('');
      setNewHallCode('');
      setNewCapacity('');
      setNewLatitude('');
      setNewLongitude('');
      setNewRadius('');
      setNewVenueType('CBT');
      fetchVenues();
    } catch (err) {
      console.error(err);
      setMessage('Error adding venue');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    if (!validateCoordinates(editLatitude, editLongitude)) return;
    try {
      await axios.put(`${baseUrl}/venues.php`, {
        id: editId,
        name: editVenueName,
        code: editHallCode,
        capacity: parseInt(editCapacity),
        latitude: editLatitude || null,
        longitude: editLongitude || null,
        radius: editRadius ? parseInt(editRadius) : null,
        venue_type: editVenueType,
      });
      setMessage('Venue updated successfully');
      setShowEditModal(false);
      setEditId(null);
      fetchVenues();
    } catch (err) {
      console.error(err);
      setMessage('Error updating venue');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this venue?')) return;
    try {
      await axios.delete(`${baseUrl}/venues.php`, { data: { id } });
      setMessage('Venue deleted successfully');
      fetchVenues();
    } catch (err) {
      console.error(err);
      setMessage('Error deleting venue');
    }
  };

  const openEditModal = (venue: Venue) => {
    setEditId(venue.id);
    setEditVenueName(venue.name);
    setEditHallCode(venue.code);
    setEditCapacity(venue.capacity.toString());
    setEditLatitude(venue.latitude || '');
    setEditLongitude(venue.longitude || '');
    setEditRadius(venue.radius !== undefined ? venue.radius.toString() : '');
    setEditVenueType(venue.venue_type);
    setShowEditModal(true);
    setMessage('');
  };

  const filteredVenues = venues.filter((venue) =>
    venue.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="bg-cream dark:bg-gray-900 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold text-maroon">Manage Venues</h3>
        <button
          onClick={() => {
            resetMessages();
            setShowAddModal(true);
          }}
          className="px-4 py-2 bg-maroon text-white rounded hover:bg-maroon-dark transition-colors"
        >
          Add Venue
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <input
        type="text"
        placeholder="Search venues by name..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hall Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Hall Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Coordinates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Radius</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-cream dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredVenues.map((venue) => (
              <tr key={venue.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{venue.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{venue.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{venue.code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{venue.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{venue.venue_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {(venue.latitude && venue.longitude) ? (
                    <a
                      href={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                    >
                      View Map
                    </a>
                  ) : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{venue.radius ? `${venue.radius}m` : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(venue)}
                      className="px-3 py-1 bg-maroon text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(venue.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredVenues.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                  No venues found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="space-y-4 block sm:hidden">
        {filteredVenues.map((venue) => (
          <div
            key={venue.id}
            className="bg-cream dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700"
          >
            <div className="mb-2">
              <h4 className="font-bold text-maroon">#{venue.id} - {venue.name}</h4>
              <p className="text-sm">Hall Code: {venue.code}</p>
              <p className="text-sm">Capacity: {venue.capacity}</p>
              <p className="text-sm">Type: {venue.venue_type}</p>
              <p className="text-sm">
                Coordinates: {(venue.latitude && venue.longitude) ? (
                  <a
                    href={`https://www.google.com/maps?q=${venue.latitude},${venue.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs"
                  >
                    View Map
                  </a>
                ) : 'N/A'}
              </p>
              <p className="text-sm">Radius: {venue.radius ? `${venue.radius}m` : 'N/A'}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => openEditModal(venue)}
                className="px-3 py-1 bg-maroon text-white rounded hover:bg-blue-700 text-sm transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(venue.id)}
                className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {filteredVenues.length === 0 && (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">No venues found</div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <Modal title="Add Venue" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <InputField label="Venue Name" value={newVenueName} setValue={setNewVenueName} />
            <InputField
              label="Hall Code"
              value={newHallCode}
              setValue={(val) => setNewHallCode(val.toUpperCase())}
            />
            <InputField label="Capacity" type="number" value={newCapacity} setValue={setNewCapacity} />
            <InputField label="Latitude (optional)" value={newLatitude} setValue={setNewLatitude} />
            <InputField label="Longitude (optional)" value={newLongitude} setValue={setNewLongitude} />
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Venue Type:
              </label>
              <select
                value={newVenueType}
                onChange={(e) => setNewVenueType(e.target.value as 'CBT' | 'Written')}
                required
                className="w-full p-2 rounded border border-maroon bg-cream dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon"
              >
                <option value="CBT">CBT</option>
                <option value="Written">Written</option>
              </select>
            </div>
            <InputField label="Radius (in meters)" type="number" value={newRadius} setValue={setNewRadius} />
            <ModalActions onCancel={() => setShowAddModal(false)} submitLabel="Add" />
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <Modal title="Edit Venue" onClose={() => setShowEditModal(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <InputField label="Venue Name" value={editVenueName} setValue={setEditVenueName} />
            <InputField
              label="Hall Code"
              value={editHallCode}
              setValue={(val) => setEditHallCode(val.toUpperCase())}
            />
            <InputField label="Capacity" type="number" value={editCapacity} setValue={setEditCapacity} />
            <InputField label="Latitude (optional)" value={editLatitude} setValue={setEditLatitude} />
            <InputField label="Longitude (optional)" value={editLongitude} setValue={setEditLongitude} />
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Venue Type:
              </label>
              <select
                value={editVenueType}
                onChange={(e) => setEditVenueType(e.target.value as 'CBT' | 'Written')}
                required
                className="w-full p-2 rounded border border-maroon bg-cream dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon"
              >
                <option value="CBT">CBT</option>
                <option value="Written">Written</option>
              </select>
            </div>
            <InputField label="Radius (in meters)" type="number" value={editRadius} setValue={setEditRadius} />
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
      className="w-full p-2 rounded border border-maroon bg-cream dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-maroon"
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

export default VenuesSection;
