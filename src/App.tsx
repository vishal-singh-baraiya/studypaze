import React, { useState, useEffect } from 'react';
import { LeftSidebar } from './components/Sidebar/LeftSidebar';
import { RightSidebar } from './components/Sidebar/RightSidebar';
import { Navbar } from './components/Navigation/Navbar';
import { VideoGrid } from './components/Content/VideoGrid';
import { useAuthStore } from './store/authStore';

function App() {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { initializeAuth } = useAuthStore();
  
  const NAVBAR_HEIGHT: number = 64;

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) {
        setLeftSidebarOpen(false);
        setRightSidebarOpen(false);
      } else {
        setLeftSidebarOpen(true);
        setRightSidebarOpen(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleMainClick = (): void => {
    if (isMobile && (leftSidebarOpen || rightSidebarOpen)) {
      setLeftSidebarOpen(false);
      setRightSidebarOpen(false);
    }
  };

  // Mobile device message
  if (isMobile) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-950 text-gray-200">
        <h1 className="text-2xl font-bold text-center px-4">
          This website is not yet available for mobile devices.
        </h1>
        <p className="text-lg mt-4 text-center px-4">
          Please use a PC or laptop to access this website.
        </p>
      </div>
    );
  }

  // Original layout for non-mobile devices
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-200">
      <div className="fixed top-0 left-0 right-0 z-50" style={{ height: `${NAVBAR_HEIGHT}px` }}>
        <Navbar
          toggleLeftSidebar={() => setLeftSidebarOpen(!leftSidebarOpen)}
          toggleRightSidebar={() => setRightSidebarOpen(!rightSidebarOpen)}
          leftSidebarOpen={leftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
        />
      </div>

      <div className="flex w-full" style={{ marginTop: `${NAVBAR_HEIGHT}px`, height: `calc(100vh - ${NAVBAR_HEIGHT}px)` }}>
        {isMobile && (leftSidebarOpen || rightSidebarOpen) && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            style={{ top: `${NAVBAR_HEIGHT}px` }}
            onClick={handleMainClick}
          />
        )}

        <aside
          className={`fixed lg:static z-40 w-64 bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out
            ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ 
            top: `${NAVBAR_HEIGHT}px`, 
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            bottom: 0
          }}
        >
          <div className="h-full overflow-y-auto">
            <LeftSidebar />
          </div>
        </aside>

        <main 
          className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-900 to-gray-950 p-4"
          onClick={handleMainClick}
        >
          <VideoGrid />
        </main>

        <aside
          className={`fixed lg:static right-0 z-40 w-64 bg-gray-900 shadow-lg transition-transform duration-300 ease-in-out
            ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          style={{ 
            top: `${NAVBAR_HEIGHT}px`, 
            height: `calc(100vh - ${NAVBAR_HEIGHT}px)`,
            bottom: 0
          }}
        >
          <div className="h-full overflow-y-auto">
            <RightSidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;
