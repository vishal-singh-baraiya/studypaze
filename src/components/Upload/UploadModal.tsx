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
  const [isFormDirty, setIsFormDirty] = useState(false);
  const { user } = useAuthStore();

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsFormDirty(true);
    setErrorMessage(null);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      weekNumber: 1,
      courseId: '',
    });
    setIsFormDirty(false);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { title, videoUrl, thumbnailUrl, courseId } = formData;
    if (!user) {
      setErrorMessage('Please log in to upload a lecture.');
      return;
    }
    if (!title || !videoUrl || !thumbnailUrl || !courseId) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const lecture = {
        title,
        description: formData.description,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        instructor: user.full_name || user.email || 'Anonymous',
        week_number: formData.weekNumber,
        course_id: courseId,
      };

      const { error } = await supabase.from('lectures').insert(lecture);
      if (error) {
        if (error.code === '23505') {
          throw new Error('This video URL is already in use.');
        }
        throw new Error(error.message || 'Upload failed.');
      }

      resetForm();
      onClose(true); // Signal success to parent
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(err.message || 'An error occurred while uploading.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isFormDirty && !confirm('Discard changes?')) return;
    resetForm();
    onClose(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Upload Lecture</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white disabled:opacity-50"
            disabled={isSubmitting}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
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
            <label className="block text-sm text-gray-300 mb-1" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="videoUrl">
              Video URL <span className="text-red-500">*</span>
            </label>
            <input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleInputChange('videoUrl', e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="thumbnailUrl">
              Thumbnail URL <span className="text-red-500">*</span>
            </label>
            <input
              id="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => handleInputChange('thumbnailUrl', e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="weekNumber">
                Week <span className="text-red-500">*</span>
              </label>
              <input
                id="weekNumber"
                type="number"
                min={1}
                max={52}
                value={formData.weekNumber}
                onChange={(e) => handleInputChange('weekNumber', parseInt(e.target.value) || 1)}
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1" htmlFor="courseId">
                Course ID <span className="text-red-500">*</span>
              </label>
              <input
                id="courseId"
                type="text"
                value={formData.courseId}
                onChange={(e) => handleInputChange('courseId', e.target.value)}
                placeholder="e.g., CS101"
                className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-red-400 text-sm bg-red-900/20 p-2 rounded">{errorMessage}</p>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 p-2 bg-gray-600 text-white rounded hover:bg-gray-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-2 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
