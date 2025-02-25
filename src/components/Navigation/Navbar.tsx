import React, { useState } from 'react';
import { Search, User, Menu, GraduationCap, Calendar, X, BookOpen, ExternalLink } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { AuthModal } from '../Auth/AuthModal';

interface NavbarProps {
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  toggleLeftSidebar,
  toggleRightSidebar,
  leftSidebarOpen,
  rightSidebarOpen
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // External links data
  const externalLinks = [
    { name: "Notes", url: "https://acegrade.in/notes" },
    { name: "Practice", url: "https://quizpractice.space" },
    { name: "IITM BS", url: "https://study.iitm.ac.in/ds" },
    { name: "Reddit", url: "https://www.reddit.com/r/IITM_BS_DataScience" },
    { name: "Contribute", url: "https://github.com/vishal-singh-baraiya/studypaze" },
  ];

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 h-16 fixed top-0 left-0 right-0 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Left section: Logo and menu toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLeftSidebar}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 lg:hidden"
              aria-label="Toggle courses sidebar"
            >
              <Menu className="w-6 h-6 text-gray-300" />
            </button>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-gray-300" />
              <span className="text-xl font-bold text-gray-200 hidden sm:inline">StudyPaze</span>
            </div>
          </div>

          {/* Center section: External links */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2">
            {externalLinks.map((link, index) => (
              <a 
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mx-4 text-gray-300 hover:text-white transition-colors duration-200"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 md:hidden"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>

          {/* Right section: User auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Right sidebar toggle button */}
            <button
              onClick={toggleRightSidebar}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors duration-200 lg:hidden"
              aria-label="Toggle calendar sidebar"
            >
              <Calendar className="w-6 h-6 text-gray-300" />
            </button>
            
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-gray-300 hidden lg:inline">{user.full_name}</span>
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 md:hidden">
            <div className="flex flex-col gap-3">
              {/* External links in mobile menu */}
              <div className="flex flex-col gap-2">
                <div className="text-gray-300 px-4 py-1 font-medium">External Links</div>
                <div className="flex justify-center gap-6 py-2">
                  {externalLinks.map((link, index) => (
                    <a 
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white transition-colors duration-200"
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Calendar button in mobile menu */}
              <button
                onClick={() => {
                  toggleRightSidebar();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 w-full"
              >
                <Calendar className="w-5 h-5" />
                <span>Calendar</span>
              </button>
              
              {user ? (
                <>
                  <div className="text-gray-300 px-4 py-2">{user.full_name}</div>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 w-full"
                  >
                    <User className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsAuthModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200 w-full"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
