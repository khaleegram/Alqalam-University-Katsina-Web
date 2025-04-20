// app.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ManageUsers from './pages/ManageUsers';
import Timetable from './pages/Timetable';
import DataCreation from './pages/DataCreation';
import Auth from './pages/auth';
import { FaSync } from 'react-icons/fa';

function AppWrapper() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
  };

  // Check if in standalone mode (already installed)
  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      setShowInstallButton(false);
    }
  }, []);

  return (
    <Router>
      {showInstallButton && (
        <button
          onClick={handleInstallClick}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            zIndex: 1000,
            background: '#800000',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '10px',
          }}
        >
          Install App
        </button>
      )}
      <App />
    </Router>
  );
}

function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTimeout(() => {
      setMobileMenuOpen(prev => !prev);
    }, 0);
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) setMobileMenuOpen(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (
      isMobileMenuOpen &&
      !(e.target as HTMLElement).closest('.mobile-sidebar') &&
      !(e.target as HTMLElement).closest('.mobile-header-button')
    ) {
      closeMobileMenu();
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-gray-900 dark:text-white relative bg-cover">
      {/* Mobile Header */}
      <div className="sm:hidden fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-black/60 backdrop-blur-md text-white px-4 py-3 shadow-md">
        <span className="font-bold text-lg">ATG</span>
        <Navbar mobile onToggleSidebar={toggleMobileMenu} />
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div className="mobile-sidebar sm:hidden fixed top-12 left-0 w-full bg-black/80 text-white p-4 z-40 rounded-b-xl">
          <Sidebar isOpen setIsOpen={() => {}} onLinkClick={closeMobileMenu} />
        </div>
      )}

      {/* Desktop Layout */}
      <div className="flex relative z-10">
        <div className={`fixed top-0 left-0 z-40 ${isSidebarOpen ? 'w-64' : 'w-16'} hidden sm:block`}>
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setSidebarOpen} />
        </div>

        <main
          onClick={closeMobileMenu}
          className={`transition-all duration-300 w-full h-screen overflow-y-auto ${
            isSidebarOpen ? 'ml-64' : 'ml-16'
          } p-6 pt-16 max-sm:ml-0 max-sm:px-4 max-sm:pt-20`}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/manage-users" element={<ManageUsers />} />
            <Route path="/timetable" element={<Timetable />} />
            <Route path="/data-creation/*" element={<DataCreation />} />
            <Route path="/login" element={<Auth isRegister={false} />} />
            <Route path="/register" element={<Auth isRegister={true} />} />


          </Routes>
        </main>
      </div>

      {/* Desktop Navbar */}
      <div className="hidden sm:block fixed top-4 right-4 z-50">
        <Navbar />
      </div>

      {/* Dashboard + Reload Buttons */}
      <div
        className={`hidden sm:flex fixed top-4 z-50 transition-all duration-300 ${
          isSidebarOpen ? 'left-64' : 'left-16'
        }`}
      >
        <div className="relative flex items-center space-x-3 bg-transparent">
          <div className="absolute inset-0 bg-[#800000]/40 dark:bg-[#b22222]/40 backdrop-blur-md rounded-tr-1xl rounded-br-2xl shadow-lg border-b border-gray-300 dark:border-gray-700" />
          <button
            onClick={() => navigate('/')}
            className="relative px-4 py-2 rounded-md bg-transparent text-white text-sm font-semibold hover:underline"
          >
            My Dashboard
          </button>
          <button
            onClick={() => window.location.reload()}
            className="relative p-2 rounded-md bg-transparent text-white"
            title="Reload Page"
          >
            <FaSync className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AppWrapper;
