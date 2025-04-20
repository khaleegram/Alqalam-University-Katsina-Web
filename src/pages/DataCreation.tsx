import React from 'react';
import { Route, Routes } from 'react-router-dom';
import CollegesSection from '../sections/CollegesSection';
import DepartmentsSection from '../sections/DepartmentsSection';
import LevelsSection from '../sections/LevelSection';
import ProgramsSection from '../sections/Programssection'; // New import for Programs
import CoursesSection from '../sections/CoursesSection';
import CombinedCoursesSection from '../sections/CombinedCoursesSection';
import VenuesSection from '../sections/VenuesSection';
import StaffSection from '../sections/StaffSection';

const DataCreation: React.FC = () => {
  return (
    <div className="px-4 sm:px-8 py-6 text-black dark:text-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-center text-white">Data Creation</h1>
      {/* Data Creation Routes */}
      <div className="space-y-8">
        <Routes>
          <Route path="colleges" element={<CollegesSection />} />
          <Route path="departments" element={<DepartmentsSection />} />
          <Route path="programs" element={<ProgramsSection />} /> {/* New route for Programs */}
          <Route path="levels" element={<LevelsSection />} />
          <Route path="courses" element={<CoursesSection />} />
          <Route path="combined-courses" element={<CombinedCoursesSection />} />
          <Route path="venues" element={<VenuesSection />} />
          <Route path="staff" element={<StaffSection />} />
        </Routes>
      </div>
    </div>
  );
};

export default DataCreation;
