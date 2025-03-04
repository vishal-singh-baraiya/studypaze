import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Lecture {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  instructor: string;
  week_number: number;
  course_id: string;
  rating: number;
  views: number;
}

interface LectureStore {
  lectures: Lecture[];
  selectedWeek: number | null;
  selectedCourse: string | null;
  isLoading: boolean;
  error: string | null;
  setSelectedWeek: (week: number | null) => void;
  setSelectedCourse: (courseId: string | null) => void;
  fetchLectures: (page: number, limit: number) => Promise<Lecture[]>;
}

export const useLectureStore = create<LectureStore>((set, get) => ({
  lectures: [],
  selectedWeek: null,
  selectedCourse: null,
  isLoading: false,
  error: null,
  setSelectedWeek: (week) => set({ selectedWeek: week }),
  setSelectedCourse: (courseId) => set({ selectedCourse: courseId }),
  fetchLectures: async (page: number, limit: number) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('lectures')
        .select('*')
        .order('rating', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) throw error;
      const lectures = data || [];
      set({ lectures });
      return lectures;
    } catch (error) {
      set({ error: (error as Error).message });
      return [];
    } finally {
      set({ isLoading: false });
    }
  },
}));