import React, { useState, useEffect } from 'react';
import { ChevronDown, GraduationCap, BookOpen, School, Trophy, Search, X, Book } from 'lucide-react';
import { useLectureStore } from '../../store/lectureStore';
import { motion, AnimatePresence } from 'framer-motion';

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Level {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  courses: Course[];
}

// More realistic course names for each academic level
const foundationCourses = [
  { id: 'Python', name: 'Python', code: 'F101' },
  { id: 'Math-1', name: 'Math-1', code: 'F102' },
  { id: 'CT', name: 'CT', code: 'F103' },
  { id: 'Math-2', name: 'Math-2', code: 'F104' },
  { id: 'Stats-1', name: 'Stats-1', code: 'F105' },
  { id: 'Stats-2', name: 'Stats-2', code: 'F106' },
  { id: 'English-1', name: 'English-1', code: 'F107' },
  { id: 'English-2', name: 'English-2', code: 'F108' },
];

const diplomaCourses = [
  { id: 'JAVA', name: 'JAVA', code: 'D201' },
  { id: 'PDSA', name: 'PDSA', code: 'D202' },
  { id: 'DBMS', name: 'DBMS', code: 'D203' },
  { id: 'App-Dev-1', name: 'App-Dev-1', code: 'D204' },
  { id: 'App-Dev-2', name: 'App-Dev-2', code: 'D205' },
  { id: 'SC', name: 'SC', code: 'D206' },
  { id: 'TDS', name: 'TDS', code: 'D207' },
  { id: 'MLF', name: 'MLF', code: 'D208' },
  { id: 'MLP', name: 'MLP', code: 'D209' },
  { id: 'MLT', name: 'MLT', code: 'D210' },
  { id: 'BDMS', name: 'BDMS', code: 'D211' },
  { id: 'BA', name: 'BA', code: 'D212' },
];

const bscCourses = [
  { id: 'bsc-1', name: 'Artificial Intelligence', code: 'B301' },
  { id: 'bsc-2', name: 'Machine Learning', code: 'B302' },
  { id: 'bsc-3', name: 'Cloud Computing', code: 'B303' },
  { id: 'bsc-4', name: 'Big Data Analytics', code: 'B304' },
  { id: 'bsc-5', name: 'Computer Graphics', code: 'B305' },
  { id: 'bsc-6', name: 'Cybersecurity', code: 'B306' },
  { id: 'bsc-7', name: 'Distributed Systems', code: 'B307' },
  { id: 'bsc-8', name: 'Software Project Management', code: 'B308' },
];

const bsCourses = [
  { id: 'bs-1', name: 'Software Eng.', code: 'BS401' },
  { id: 'bs-2', name: 'Software Testing', code: 'BS402' },
  { id: 'bs-3', name: 'AI: Search Method', code: 'BS403' },
  { id: 'bs-4', name: 'Deep Learning', code: 'BS404' },
  { id: 'bs-5', name: 'SFPG', code: 'BS405' },
  { id: 'bs-6', name: 'BDBN', code: 'BS406' },
  { id: 'bs-7', name: 'DVD', code: 'BS407' },
  { id: 'bs-8', name: 'STML', code: 'BS408' },
];

const academicLevels: Level[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    icon: <School className="w-5 h-5" />,
    color: 'from-blue-600 to-blue-400',
    courses: foundationCourses,
  },
  {
    id: 'diploma',
    name: 'Diploma',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'from-green-600 to-green-400',
    courses: diplomaCourses,
  },
  {
    id: 'bsc',
    name: 'BSc',
    icon: <GraduationCap className="w-5 h-5" />,
    color: 'from-purple-600 to-purple-400',
    courses: bscCourses,
  },
  {
    id: 'bs',
    name: 'BS',
    icon: <Trophy className="w-5 h-5" />,
    color: 'from-amber-600 to-amber-400',
    courses: bsCourses,
  },
];

export function LeftSidebar() {
  const [expandedLevel, setExpandedLevel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentCourses, setRecentCourses] = useState<Course[]>([]);
  const { selectedCourse, setSelectedCourse } = useLectureStore();

  // Auto-expand the level containing the selected course
  useEffect(() => {
    if (selectedCourse) {
      const levelId = selectedCourse.split('-')[0];
      setExpandedLevel(levelId);
      
      // Add to recent courses
      const allCourses = academicLevels.flatMap(level => level.courses);
      const course = allCourses.find(c => c.id === selectedCourse);
      if (course) {
        setRecentCourses(prev => {
          const filtered = prev.filter(c => c.id !== course.id);
          return [course, ...filtered].slice(0, 3);
        });
      }
    }
  }, [selectedCourse]);

  // Get all courses for search results
  const allCourses = academicLevels.flatMap(level => 
    level.courses.map(course => ({
      ...course,
      levelId: level.id,
      levelName: level.name,
      levelColor: level.color
    }))
  );

  // Filter courses based on search query
  const filteredCourses = searchQuery 
    ? allCourses.filter(course => 
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <div className="w-64 bg-gray-900 h-full overflow-y-auto border-r border-gray-800 flex flex-col">
      <div className="p-4 sticky top-0 bg-gray-900 z-10 border-b border-gray-800">
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-gray-400 hover:text-gray-200" />
            </button>
          )}
        </div>
        
        {/* Search Results */}
        {searchQuery && filteredCourses.length > 0 && (
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">
              Search Results ({filteredCourses.length})
            </h3>
            <div className="max-h-60 overflow-y-auto pr-1 space-y-1">
              {filteredCourses.map(course => (
                <button
                  key={`search-${course.id}`}
                  onClick={() => {
                    setSelectedCourse(course.id);
                    setSearchQuery(''); // Clear search after selection
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${course.levelColor}`}></div>
                  <div className="flex-1 text-left">
                    <div className="truncate font-medium">{course.name}</div>
                    <div className="flex items-center text-xs text-gray-500">
                      <span>{course.levelName}</span>
                      <span className="mx-1">•</span>
                      {/* <span>{course.code}</span> */}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* No Search Results */}
        {searchQuery && filteredCourses.length === 0 && (
          <div className="mb-4 py-3 px-4 bg-gray-800/50 rounded-lg text-center">
            <p className="text-gray-400 text-sm">No courses found matching "{searchQuery}"</p>
          </div>
        )}
        
        {/* Recent Courses */}
        {recentCourses.length > 0 && !searchQuery && (
          <div className="mb-4">
            <h3 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Recent Courses</h3>
            <div className="space-y-1">
              {recentCourses.map(course => (
                <button
                  key={`recent-${course.id}`}
                  onClick={() => setSelectedCourse(course.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                >
                  <Book className="w-4 h-4 text-blue-400" />
                  <span className="truncate">{course.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Only show academic levels when not searching */}
      {!searchQuery && (
        <div className="flex-1 overflow-y-auto p-4 pt-2">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">Academic Levels</h2>
          <div className="space-y-2">
            {academicLevels.map((level) => (
              <div key={level.id} className="rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedLevel(expandedLevel === level.id ? null : level.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-gray-200 hover:bg-gray-800 transition-all duration-200 ${
                    expandedLevel === level.id ? 'bg-gray-800 shadow-md' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-md bg-gradient-to-br ${level.color}`}>
                      {level.icon}
                    </div>
                    <span className="font-medium">{level.name}</span>
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      expandedLevel === level.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                
                <AnimatePresence>
                  {expandedLevel === level.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="py-1 pl-11 pr-2">
                        {level.courses.map((course) => (
                          <motion.button
                            key={course.id}
                            initial={{ x: -10, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setSelectedCourse(course.id)}
                            className={`w-full text-left py-2 px-3 my-1 text-sm rounded-md ${
                              selectedCourse === course.id 
                                ? `bg-gradient-to-r ${level.color} text-white font-medium shadow-md` 
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                            } transition-all duration-200`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">{course.name}</span>
                              {/* <span className="text-xs opacity-80 ml-1.5">{course.code}</span> */}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={() => {
            setSelectedCourse(null);
            setSearchQuery('');
          }}
          className="w-full py-2 px-3 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          View All Courses
        </button>
      </div>
    </div>
  );
}