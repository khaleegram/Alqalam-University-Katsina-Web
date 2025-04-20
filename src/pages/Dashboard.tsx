import React, { useState } from 'react';
import axios from 'axios';

const AdminDashboard: React.FC = () => {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleEndOfYearCleanup = async () => {
        if (window.confirm('Are you sure you want to run the end-of-year cleanup? This action cannot be undone.')) {
            setLoading(true);
            setMessage('');
            try {
                // Replace '/api/end-of-year-cleanup' with the actual path to your backend endpoint
                const response = await axios.post('/api/end-of-year-cleanup', {}, {
                    auth: { // If using HTTP Basic Auth (replace with your actual auth method)
                        username: 'admin',
                        password: 'your_admin_password',
                    },
                });
                setMessage(response.data.message); // Assuming the backend returns a message
            } catch (error: any) {
                setMessage(error.response?.data?.message || 'An error occurred during cleanup.');
                console.error('End-of-year cleanup error:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div>
            <h1>Admin Dashboard</h1>
            {message && <p>{message}</p>}
            <button
                onClick={handleEndOfYearCleanup}
                disabled={loading}
            >
                {loading ? 'Running Cleanup...' : 'Run End-of-Year Cleanup'}
            </button>
        </div>
    );
};

export default AdminDashboard;