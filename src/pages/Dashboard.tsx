// File: Dashboard.tsx

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import StatCard from '../components/StatCard';
import LevelCountsHistory from '../components/LevelCountsHistory';


const API = 'http://192.168.1.104/ATG/backend/data_creation/academic_api.php';

interface Session {
  session_id: number;
  session_name: string;
}
interface Semester {
  semester_id: number;
  semester_number: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const [theme] = useState<'light' | 'dark'>(() =>
    localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );
  const [message, setMessage] = useState<string | null>(null);
  const messageTimer = useRef<number | null>(null);

  // sessions & semesters
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [activeSemester, setActiveSemester] = useState<number | null>(null);

  // stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeLecturers: 0,
    coursesRunning: 0,
  });

  // loading state for Advance Term
  const [advancing, setAdvancing] = useState(false);

  // initial load & cleanup
  useEffect(() => {
    loadSessions();
    loadStats();
    return () => {
      // clear any pending timeout
      if (messageTimer.current !== null) {
        clearTimeout(messageTimer.current);
      }
    };
  }, []);

  // whenever the session changes, reload semesters
  useEffect(() => {
    loadSemesters();
  }, [activeSession]);

  // helper for showing messages with auto‐clear
  const showMessage = (msg: string) => {
    setMessage(msg);
    if (messageTimer.current !== null) {
      clearTimeout(messageTimer.current);
    }
    messageTimer.current = window.setTimeout(() => {
      setMessage(null);
      messageTimer.current = null;
    }, 5000);
  };

  // --- Loaders ---

  const loadSessions = async () => {
    try {
      const { data } = await axios.get<{
        status: string;
        data: Session[];
      }>(`${API}?action=get_sessions`);
      setSessions(data.data || []);
      if (data.data?.length) {
        setActiveSession(data.data[0].session_id);
      }
    } catch {
      showMessage('❌ Error loading sessions');
    }
  };

  const loadSemesters = async () => {
    if (!activeSession) {
      setSemesters([]);
      setActiveSemester(null);
      return;
    }
    try {
      const { data } = await axios.get<{
        status: string;
        data: Semester[];
      }>(
        `${API}?action=get_semesters&session_id=${activeSession}`
      );
      const list = data.status === 'success' ? data.data : [];
      setSemesters(list);
      const open = list.find((s) => s.status === 'open') || list[0];
      setActiveSemester(open?.semester_id ?? null);
    } catch {
      showMessage('❌ Error loading semesters');
    }
  };

  const loadStats = async () => {
    try {
      const { data } = await axios.get<{
        status: string;
        data: typeof stats;
      }>(`${API}?action=get_stats`);
      if (data.status === 'success') {
        setStats(data.data);
      }
    } catch {
      // silently ignore—stats may not be implemented yet
    }
  };

  // --- Advance Term Logic ---

  const advanceTerm = async () => {
    if (!activeSession || !activeSemester) {
      showMessage('⚠️ Please select a session & semester first.');
      return;
    }
    setAdvancing(true);
    try {
      const sem = semesters.find((s) => s.semester_id === activeSemester);
      if (!sem) throw new Error('Invalid semester selected');

      if (sem.semester_number === 1) {
        // Semester 1 → Semester 2
        const { data } = await axios.post<{ status: string; message?: string }>(
          `${API}?action=cleanup`
        );
        if (data.status !== 'success') {
          throw new Error(data.message || 'Failed to advance to Semester 2');
        }
        showMessage('✅ Advanced to Semester 2');
      } else {
        // Semester 2 → New session (Semester 1)
        if (
          window.confirm(
            'You are in Semester 2. Finish the year and start a new session?'
          )
        ) {
          const { data } = await axios.post<{
            status: string;
            message?: string;
          }>(`${API}?action=create_session`);
          if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to create new session');
          }
          showMessage('✅ New session created. Semester 1 is now open');
          await loadSessions();
        }
      }
      // reload UI
      await loadSemesters();
      loadStats();
    } catch (err: any) {
      showMessage(`❌ ${err.message}`);
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <main
        className={`flex-1 p-8 overflow-y-auto ${
          theme === 'light' ? 'bg-cream text-black' : 'bg-gray-900 text-white'
        }`}
      >
        {/* Context selection */}
        <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-4">
            <select
              value={activeSession ?? ''}
              onChange={(e) =>
                setActiveSession(Number(e.target.value) || null)
              }
              className="p-2 border rounded"
            >
              <option value="">Select Session</option>
              {sessions.map((s) => (
                <option key={s.session_id} value={s.session_id}>
                  {s.session_name}
                </option>
              ))}
            </select>

            <select
              value={activeSemester ?? ''}
              onChange={(e) =>
                setActiveSemester(Number(e.target.value) || null)
              }
              disabled={!semesters.length}
              className="p-2 border rounded disabled:opacity-50"
            >
              {semesters.length ? (
                semesters.map((s) => (
                  <option key={s.semester_id} value={s.semester_id}>
                    Sem {s.semester_number}{' '}
                    {s.status === 'open' ? '(open)' : ''}
                  </option>
                ))
              ) : (
                <option value="">No semesters</option>
              )}
            </select>
          </div>

          {/* Advance Term */}
          <button
            onClick={advanceTerm}
            disabled={advancing}
            className={`px-4 py-2 rounded text-white ${
              advancing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {advancing ? 'Working…' : 'Advance Term'}
          </button>
        </div>

        {/* Feedback message */}
        {message && (
          <div
            className={`mb-6 p-3 rounded ${
              message.startsWith('✅')
                ? 'bg-green-100 text-green-800'
                : message.startsWith('⚠️')
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {message}
          </div>
        )}

        {/* Dashboard stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            theme={theme}
          />
          <StatCard
            title="Active Lecturers"
            value={stats.activeLecturers.toString()}
            theme={theme}
          />
          <StatCard
            title="Courses Running"
            value={stats.coursesRunning.toString()}
            theme={theme}
          />
        </div>
        <LevelCountsHistory sessionId={activeSession} semesterId={activeSemester} />

      </main>
    </div>
  );
};

export default Dashboard;
