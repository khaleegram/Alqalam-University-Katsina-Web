import React, { useState, useEffect } from 'react';
import { FaEllipsisV, FaMoon, FaSun } from 'react-icons/fa';
import avatar from '../assets/avater.png'; // Adjust path if needed

const user = {
  firstName: 'John',
  profilePicture: avatar,
};

interface NavbarProps {
  mobile?: boolean;
  onToggleSidebar?: (e: React.MouseEvent) => void;
}

export default function Navbar({ mobile = false, onToggleSidebar }: NavbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    () => localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Base style shared by mobile and desktop
  const baseClasses =
    "bg-cream dark:bg-black/20 text-black dark:text-white rounded-2xl shadow-lg border-b border-gray-300 dark:border-gray-700 h-10 px-4 flex items-center space-x-4";
    
  // On desktop we add fixed positioning; on mobile we do not.
  const containerClass = mobile ? baseClasses : `fixed top-4 right-4 z-50 ${baseClasses}`;

  return (
    <div className={containerClass}>
      {/* For mobile, show user info and theme toggle along with the three-dots */}
      {mobile ? (
        <>
          {/* Optionally include user info, adjust layout as desired */}
          <span className="text-sm font-medium">{user.firstName}</span>
          <img src={user.profilePicture} alt="User" className="w-8 h-8 rounded-full object-cover" />
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="bg-maroon p-2 rounded-full">
            {theme === 'light' ? <FaMoon className="text-white" /> : <FaSun className="text-white" />}
          </button>
          {/* Three-dots button placed inside Navbar on mobile */}
          <button onClick={onToggleSidebar} className="mobile-header-button">
            <FaEllipsisV className="cursor-pointer" />
          </button>
        </>
      ) : (
        // Desktop view remains unchanged.
        <>
          <span className="text-sm font-medium">{user.firstName}</span>
          <img src={user.profilePicture} alt="User" className="w-8 h-8 rounded-full object-cover" />
          <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="bg-maroon p-2 rounded-full">
            {theme === 'light' ? <FaMoon className="text-white" /> : <FaSun className="text-white" />}
          </button>
          {/* Optionally the ellipsis icon can be rendered on desktop if needed */}
          <FaEllipsisV className="cursor-pointer" />
        </>
      )}
    </div>
  );
}
