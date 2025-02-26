import React, { useState, useCallback, useEffect } from 'react';
import { Play, Upload, Search, RefreshCw } from 'lucide-react';
import { useLectureStore } from '../../store/lectureStore';
import { useAuthStore } from '../../store/authStore';
import UploadModal from '../Upload/UploadModal';

const VideoGrid: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuthStore();
  const { lectures, isLoading, error, fetchLectures } = useLectureStore();

  const refreshData = useCallback(async () => {
    try {
      console.log('Fetching lectures...');
      await fetchLectures();
      console.log('Lectures fetched:', lectures);
    } catch (err) {
      console.error('Refresh error:', err);
    }
  }, [fetchLectures, lectures]);

  useEffect(() => {
    if (!lectures.length && !isLoading) {
      refreshData();
    }
  }, [lectures.length, isLoading, refreshData]);

  const filteredLectures = lectures.filter((lecture) =>
    lecture.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleModalClose = (success: boolean) => {
    setIsModalOpen(false);
    if (success) {
      refreshData();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      <header className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <h1 className="text-2xl font-bold">Lectures</h1>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 p-2 bg-gray-700 rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            {user && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                <Upload size={20} />
                Upload
              </button>
            )}
            <button
              onClick={refreshData}
              className="flex items-center gap-2 p-2 bg-gray-700 rounded hover:bg-gray-600"
              disabled={isLoading}
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-400">Error: {error}</div>
        ) : filteredLectures.length === 0 ? (
          <div className="text-center text-gray-400">No lectures found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLectures.map((lecture) => (
              <div
                key={lecture.id}
                className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                onClick={() => window.open(lecture.video_url, '_blank')}
              >
                <img
                  src={lecture.thumbnail_url}
                  alt={lecture.title}
                  className="w-full h-40 object-cover"
                  onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image')}
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{lecture.title}</h3>
                  <p className="text-sm text-gray-400">{lecture.instructor}</p>
                  <p className="text-xs text-gray-500">Week {lecture.week_number} | {lecture.course_id}</p>
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

export default VideoGrid;
