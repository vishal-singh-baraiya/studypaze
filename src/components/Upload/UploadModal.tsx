import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useLectureStore } from '../../store/lectureStore';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [weekNumber, setWeekNumber] = useState(1);
  const [courseId, setCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { fetchLectures } = useLectureStore();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setThumbnailUrl('');
    setWeekNumber(1);
    setCourseId('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    setIsLoading(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError("You must be logged in to upload a lecture");
      return;
    }

    if (!title || !videoUrl || !thumbnailUrl || !courseId) {
      setError("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First check if this video URL already exists
      const { data: existingData, error: checkError } = await supabase
        .from('lectures')
        .select('id')
        .eq('video_url', videoUrl)
        .limit(1);
      
      if (checkError) {
        throw new Error(checkError.message || "Error checking for existing lecture");
      }
      
      if (existingData && existingData.length > 0) {
        setError("This video URL has already been uploaded");
        setIsLoading(false);
        return;
      }

      // Proceed with insert if no duplicate
      const lectureData = {
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        instructor: user.full_name || user.email || 'Anonymous',
        week_number: weekNumber,
        course_id: courseId,
      };

      // Insert without returning data first
      const { error: insertError } = await supabase
        .from('lectures')
        .insert(lectureData);

      if (insertError) {
        throw new Error(insertError.message || "Failed to upload lecture");
      }

      // Success flow
      await fetchLectures();
      handleClose();
      
    } catch (err) {
      console.error("Error during upload:", err);
      setError((err as Error).message || "Failed to upload lecture");
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render anything if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md relative border border-gray-800 shadow-xl">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200 focus:outline-none"
          aria-label="Close"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 text-gray-200">Upload New Lecture</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields remain the same */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Video URL *
            </label>
            <input
              id="videoUrl"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=example"
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              required
            />
          </div>

          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm font-medium text-gray-300 mb-1">
              Thumbnail URL *
            </label>
            <input
              id="thumbnailUrl"
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weekNumber" className="block text-sm font-medium text-gray-300 mb-1">
                Week Number *
              </label>
              <input
                id="weekNumber"
                type="number"
                min="1"
                max="52"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <label htmlFor="courseId" className="block text-sm font-medium text-gray-300 mb-1">
                Course ID *
              </label>
              <input
                id="courseId"
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                placeholder="foundation-1"
                className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-800 text-red-200 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-600"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Lecture
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UploadModal;
