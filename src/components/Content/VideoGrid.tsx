import React, { useState, useCallback, useEffect } from 'react';
import { Play, Upload, Search, RefreshCw } from 'lucide-react';
import { useLectureStore } from '../../store/lectureStore';
import { useAuthStore } from '../../store/authStore';
import { UploadModal } from '../Upload/UploadModal';

export const VideoGrid: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { user } = useAuthStore();
  const { lectures, selectedWeek, selectedCourse, isLoading, error, fetchLectures } = useLectureStore();

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchLectures();
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchLectures]);

  useEffect(() => {
    if (!lectures.length && !isLoading) {
      refreshData();
    }
  }, [lectures.length, isLoading, refreshData]);

  const filteredLectures = lectures.filter((lecture) => {
    const matchesFilter =
      (!selectedWeek || lecture.week_number === selectedWeek) &&
      (!selectedCourse || lecture.course_id === selectedCourse);
    if (!searchTerm) return matchesFilter;
    const lowerSearch = searchTerm.toLowerCase();
    return matchesFilter && (
      lecture.title.toLowerCase().includes(lowerSearch) ||
      lecture.instructor.toLowerCase().includes(lowerSearch)
    );
  });

  const handleVideoClick = (url: string) => {
    window.open(url, '_blank');
  };

  const handleModalClose = (success: boolean) => {
    setIsModalOpen(false);
    if (success) refreshData();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <header className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">
            {selectedWeek && selectedCourse
              ? `Week ${selectedWeek} - ${selectedCourse}`
              : selectedWeek
              ? `Week ${selectedWeek}`
              : selectedCourse
              ? selectedCourse
              : 'All Lectures'}
          </h1>
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search lectures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              {user && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  <Upload size={20} />
                  <span>Upload</span>
                </button>
              )}
              <button
                onClick={refreshData}
                disabled={isLoading || isRefreshing}
                className="flex items-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50"
              >
                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                <span className="hidden md:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {(isLoading || isRefreshing) ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-700 h-40 rounded mb-4" />
                <div className="bg-gray-700 h-4 w-3/4 rounded mb-2" />
                <div className="bg-gray-700 h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400">Error: {error}</p>
            <button onClick={refreshData} className="mt-4 p-2 bg-gray-700 rounded hover:bg-gray-600">
              Retry
            </button>
          </div>
        ) : filteredLectures.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            {searchTerm ? `No results for "${searchTerm}"` : 'No lectures available.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                onClick={() => handleVideoClick(lecture.video_url)}
              >
                <div className="relative">
                  <img
                    src={lecture.thumbnail_url}
                    alt={lecture.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image')}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play size={40} />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold line-clamp-2">{lecture.title}</h3>
                  <p className="text-sm text-gray-400">{lecture.instructor}</p>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Week {lecture.week_number}</span>
                    <span>{lecture.course_id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <UploadModal isOpen={isModalOpen} onClose={handleModalClose} />
    </div>
  );
};
