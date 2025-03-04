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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.from('lectures').insert({
        title,
        description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        instructor: user.full_name || 'Anonymous',
        week_number: weekNumber,
        course_id: courseId,
        uploader_id: user.id,
      });

      if (error) throw error;

      await fetchLectures();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-8 rounded-lg w-full max-w-md relative border border-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-200"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-gray-200">Upload Lecture</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-600"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Video URL
            </label>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-600"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-600"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Week Number
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={weekNumber}
                onChange={(e) => setWeekNumber(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-600"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Course ID
              </label>
              <input
                type="text"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-gray-600"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {isLoading ? 'Uploading...' : 'Upload Lecture'}
          </button>
        </form>
      </div>
    </div>
  );
}