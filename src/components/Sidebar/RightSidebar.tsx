import React from 'react';
import { Calendar, BookOpen, CheckCircle, RotateCcw } from 'lucide-react';
import { useLectureStore } from '../../store/lectureStore';

interface WeekProgress {
  week: number;
  progress: number;
  overview: string;
}

const weeks: WeekProgress[] = Array.from({ length: 12 }, (_, i) => ({
  week: i + 1,
  progress: Math.floor(Math.random() * 100),
  overview: `Week ${i + 1} covers fundamental concepts and practical applications.`,
}));

export function RightSidebar() {
  const { selectedWeek, setSelectedWeek } = useLectureStore();

  const handleReset = () => {
    setSelectedWeek(null);
  };

  return (
    <div className="w-64 bg-gray-900 h-full overflow-y-auto border-l border-gray-800">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4 bg-gray-800/50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-200">Weeks</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors group"
              title="Reset week filter"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400" />
            </button>
            <Calendar className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        
        {selectedWeek && (
          <div className="mb-3 px-1">
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-md p-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-blue-400 font-medium">Week {selectedWeek} Selected</span>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-3 transition-all duration-300">
          {weeks.map((week) => (
            <div
              key={week.week}
              className="relative"
            >
              <button
                onClick={() => setSelectedWeek(week.week)}
                className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-300 overflow-hidden ${
                  selectedWeek === week.week 
                    ? 'bg-gradient-to-br from-blue-600/30 to-indigo-800/40 ring-2 ring-blue-500/50 shadow-lg shadow-blue-900/20' 
                    : 'bg-gray-800/40 hover:bg-gray-800/70 hover:scale-105'
                }`}
              >
                {selectedWeek === week.week && (
                  <div className="absolute inset-0 bg-blue-500/10 animate-pulse pointer-events-none"></div>
                )}
                
                <div className={`text-xl font-bold ${
                  selectedWeek === week.week ? 'text-blue-400' : 'text-gray-300'
                }`}>
                  {week.week}
                </div>
                
                {selectedWeek === week.week && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex justify-center">
          <div className="w-10 h-1 bg-blue-500/50 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}