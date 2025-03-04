import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Play, Upload, Search, X } from 'lucide-react';
import { useLectureStore } from '../../store/lectureStore';
import { useAuthStore } from '../../store/authStore';
import { UploadModal } from '../Upload/UploadModal';

// Define interfaces
interface Lecture {
  id: string;
  title: string;
  instructor: string;
  week_number: number;
  course_id: string;
  video_url: string;
  thumbnail_url: string;
}

interface User {
  id: string;
  name: string;
}

export function VideoGrid() {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [lectureCache, setLectureCache] = useState<Lecture[]>([]); // Client-side cache

  const { user } = useAuthStore() as { user: User | null };
  const {
    lectures, // Lectures fetched from the store (current batch)
    selectedWeek,
    selectedCourse,
    isLoading,
    error,
    fetchLectures,
  } = useLectureStore() as {
    lectures: Lecture[];
    selectedWeek: number | null;
    selectedCourse: string | null;
    isLoading: boolean;
    error: string | null;
    fetchLectures: (page: number, limit: number) => Promise<Lecture[]>;
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 10;

  // Fetch initial lectures and populate cache
  useEffect(() => {
    const loadInitialLectures = async () => {
      const newLectures = await fetchLectures(1, LIMIT);
      setLectureCache(newLectures); // Initialize cache
      setHasMore(newLectures.length === LIMIT);
      setPage(1);
    };
    loadInitialLectures();
  }, [fetchLectures]);

  // Load more lectures when scrolling
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    const nextPage = page + 1;
    const newLectures = await fetchLectures(nextPage, LIMIT);
    setLectureCache((prev) => [...prev, ...newLectures]); // Append to cache
    setHasMore(newLectures.length === LIMIT);
    setPage(nextPage);
  }, [page, hasMore, isLoading, fetchLectures]);

  // Set up IntersectionObserver for infinite scrolling
  useEffect(() => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !isLoading) loadMore();
    });
    if (loadMoreRef.current) observer.current.observe(loadMoreRef.current);
    return () => observer.current?.disconnect();
  }, [loadMore, hasMore, isLoading]);

  // Filter lectures client-side from cache
  const filteredLectures = useMemo(() => {
    const filtered = lectureCache.filter((lecture) => {
      const matchesFilters =
        (!selectedWeek || lecture.week_number === selectedWeek) &&
        (!selectedCourse || lecture.course_id === selectedCourse);
      if (!searchQuery.trim()) return matchesFilters;

      const query = searchQuery.toLowerCase();
      return (
        matchesFilters &&
        (lecture.title.toLowerCase().includes(query) ||
          lecture.instructor.toLowerCase().includes(query))
      );
    });

    // If filtered results are too few and more data might exist, allow fetching
    if (filtered.length < LIMIT && hasMore) loadMore();

    return filtered;
  }, [lectureCache, selectedWeek, selectedCourse, searchQuery, hasMore, loadMore]);

  // Debounced search handler (if server-side search is needed later)
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
      // Optionally fetch from server if cache is insufficient (debounced)
    },
    []
  );

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Navbar */}
      <div className="sticky top-0 z-10 border-b border-gray-800 shadow-md">
        <div className="p-2">
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
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search lectures..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              {user && (
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-800 h-48 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-800 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-lg">Failed to load lectures. Please try again later.</p>
            <button
              onClick={() => fetchLectures(1, LIMIT)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredLectures.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">
              {searchQuery ? `No lectures found matching "${searchQuery}"` : 'No lectures found'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLectures.map((lecture) => (
                <a
                  key={lecture.id}
                  href={lecture.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="relative">
                    <img
                      src={lecture.thumbnail_url}
                      alt={lecture.title}
                      loading="lazy"
                      className="w-full aspect-video object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-200 font-semibold mb-2 line-clamp-2">{lecture.title}</h3>
                    <p className="text-gray-400 text-sm">{lecture.instructor}</p>
                  </div>
                </a>
              ))}
            </div>
            {hasMore && (
              <div ref={loadMoreRef} className="text-center py-4">
                {isLoading ? (
                  <p className="text-gray-400">Loading more lectures...</p>
                ) : (
                  <p className="text-gray-400">Scroll to load more</p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
    </div>
  );
}