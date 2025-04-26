import React from 'react';
import { Link, useLocation, To } from 'react-router-dom';
import {
  FaBars,
  FaHome,
  FaUsers,
  FaCalendarAlt,
  FaDatabase,
  FaUniversity,
  FaBuilding,
  FaBook,
  FaChalkboardTeacher,
  FaDoorOpen
} from 'react-icons/fa';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  onLinkClick?: () => void;
}

interface MenuItem {
  to: To;
  label: string;
  icon: React.ReactElement;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onLinkClick }) => {
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const handleLinkClick = () => {
    setIsOpen(false);
    if (onLinkClick) {
      onLinkClick();
    }
  };

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
      location.pathname === path
        ? 'bg-yellow-500/20 text-yellow-400'
        : 'text-white hover:bg-cream/10 hover:text-yellow-400'
    }`;

  const menuItems: MenuItem[] = [
    { to: '/', label: 'Dashboard', icon: <FaHome /> },
    { to: '/manage-users', label: 'Manage Users', icon: <FaUsers /> },
    { to: '/timetable', label: 'Timetable', icon: <FaCalendarAlt /> },
    { to: '/data-creation', label: 'Data Creation', icon: <FaDatabase /> }
  ];

  const nestedItems: MenuItem[] = [
    { to: '/data-creation/colleges', label: 'Colleges', icon: <FaUniversity /> },
    { to: '/data-creation/departments', label: 'Departments', icon: <FaBuilding /> },
    { to: '/data-creation/programs', label: 'Programs', icon: <FaBook /> },
    { to: '/data-creation/levels', label: 'Levels', icon: <FaBook /> },
    { to: '/data-creation/courses', label: 'Courses', icon: <FaBook /> },
    { to: '/data-creation/combined-courses', label: 'Combined Courses', icon: <FaBook /> },
    { to: '/data-creation/staff', label: 'Staff', icon: <FaChalkboardTeacher /> },
    { to: '/data-creation/venues', label: 'Venues', icon: <FaDoorOpen /> }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 sm:hidden"
          onClick={handleLinkClick}
        />
      )}

      <div
        className={`fixed sm:relative top-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out ${
          isOpen ? 'w-64' : 'w-16'
        } bg-black/30 dark:bg-black/50 backdrop-blur-xl border-r border-white/10 shadow-xl flex flex-col`}
      >
        <div className="flex items-center justify-between p-4">
          <div onClick={toggleSidebar} className="cursor-pointer text-white">
            <FaBars size={20} />
          </div>
          {isOpen && (
            <span className="text-xl text-white font-bold tracking-wide">
              AUK
            </span>
          )}
        </div>

        {!isOpen && (
          <div className="flex-1 flex items-center justify-center sm:hidden">
            <span className="text-white text-sm transform -rotate-90 whitespace-nowrap">
              AI Timetable
            </span>
          </div>
        )}

        <nav className="px-2 mt-2 flex-1 overflow-y-auto">
          <ul className="space-y-2 text-sm font-medium">
            {menuItems.map((item) => (
              <li key={item.to.toString()}>
                <Link to={item.to} onClick={handleLinkClick} className={linkClass(item.to.toString())}>
                  {item.icon}
                  {isOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
            {isOpen && (
              <div className="ml-5 space-y-2">
                {nestedItems.map((item) => (
                  <li key={item.to.toString()}>
                    <Link to={item.to} onClick={handleLinkClick} className={linkClass(item.to.toString())}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </li>
                ))}
              </div>
            )}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
