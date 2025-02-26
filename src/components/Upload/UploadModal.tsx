import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

interface UploadModalProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    weekNumber: 1,
    courseId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { user } = useAuthStore();

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setErrorMessage('Please log in to upload.');
      return;
    }

    const { title, videoUrl, thumbnailUrl, weekNumber, courseId } = formData;
    if (!title || !videoUrl || !thumbnailUrl || !weekNumber || !courseId) {
      setErrorMessage('All fields except description are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const lecture = {
      title: title.trim(),
      description: formData.description.trim() || null,
      video_url: videoUrl.trim(),
      thumbnail_url: thumbnailUrl.trim(),
      instructor: user.full_name || user.email || 'Anonymous',
      week_number: Number(weekNumber),
      course_id: courseId.trim(),
    };

    try {
      console.log('Attempting to upload:', lecture); // Debug payload
      const { data, error } = await supabase.from('lectures').insert(lecture).select();
      
      if (error) {
        console.error('Supabase error:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        if (error.code === '23505') {
          setErrorMessage('This video URL is already uploaded.');
        } else {
          setErrorMessage(`Upload failed: ${error.message}`);
        }
        return;
      }

      console.log('Upload successful:', data); // Confirm success
      onClose(true); // Signal success
    } catch (err: any) {
      console.error('Unexpected error:', err);
      setErrorMessage('Something went wrong. Check the console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Upload Lecture</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm text-gray-300">Title *</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm text-gray-300">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              rows={2}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label htmlFor="videoUrl" className="block text-sm text-gray-300">Video URL *</label>
            <input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>
          <div>
            <label htmlFor="thumbnailUrl" className="block text-sm text-gray-300">Thumbnail URL *</label>
            <input
              id="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weekNumber" className="block text-sm text-gray-300">Week *</label>
              <input
                id="weekNumber"
                type="number"
                min={1}
                value={formData.weekNumber}
                onChange={(e) => handleInputChange('weekNumber', e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label htmlFor="courseId" className="block text-sm text-gray-300">Course ID *</label>
              <input
                id="courseId"
                type="text"
                value={formData.courseId}
                onChange={(e) => handleInputChange('courseId', e.target.value)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          {errorMessage && (
            <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{errorMessage}</p>
          )}
          <button
            type="submit"
            className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <Upload size={20} />
                Upload
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
