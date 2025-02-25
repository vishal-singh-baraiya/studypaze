import React, { useEffect, useState } from 'react';
import { Play, Upload, Share2, Search } from 'lucide-react';
import { useLectureStore } from '../../store/lectureStore';
import { useAuthStore } from '../../store/authStore';
import { UploadModal } from '../Upload/UploadModal';

export function VideoGrid() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuthStore();
  
  const {
    lectures,
    selectedWeek,
    selectedCourse,
    isLoading,
    error,
    fetchLectures
  } = useLectureStore();

  useEffect(() => {
    fetchLectures();
  }, [fetchLectures]);

  const filteredLectures = lectures.filter(lecture => {
    // First apply week and course filters
    const matchesFilters = (
      (!selectedWeek || lecture.week_number === selectedWeek) &&
      (!selectedCourse || lecture.course_id === selectedCourse)
    );
    
    // Then apply search query filter if there is one
    if (!searchQuery.trim()) return matchesFilters;
    
    // Search in title and instructor fields
    const query = searchQuery.toLowerCase();
    return (
      matchesFilters && (
        lecture.title.toLowerCase().includes(query) ||
        lecture.instructor.toLowerCase().includes(query)
      )
    );
  });

  // Function to handle video click - open in a new tab
  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Navbar */}
      <div className="sticky top-0 z-10 border-b border-gray-800 shadow-md">
        <div className="p-2 md:p-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-200">
              {selectedWeek && selectedCourse
                ? `Week ${selectedWeek} - ${selectedCourse} Lectures`
                : selectedWeek
                ? `Week ${selectedWeek} Lectures`
                : selectedCourse
                ? `${selectedCourse} Lectures`
                : 'All Lectures'}
            </h1>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search lectures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {user && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Upload</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center">
            <p className="text-red-500">Error: {error}</p>
          </div>
        ) : filteredLectures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchQuery ? 
                `No lectures found matching "${searchQuery}"` : 
                "No lectures found for the selected filters"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-gray-900 rounded-lg overflow-hidden hover:transform hover:scale-105 transition-transform duration-200 border border-gray-800 cursor-pointer"
                onClick={() => handleVideoClick(lecture.video_url)}
              >
                <div className="relative">
                  <img
                    src={lecture.thumbnail_url}
                    alt={lecture.title}
                    className="w-full aspect-video object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-gray-200 font-semibold mb-2 line-clamp-2">
                    {lecture.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">{lecture.instructor}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
}