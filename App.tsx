import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClipEngine from './components/ClipEngine';
import ViralScore from './components/ViralScore';
import LibraryChat from './components/LibraryChat';
import Login from './components/Login';
import Profile from './components/Profile';
import { AppView, LibraryItem, VideoClip } from './types';

const App: React.FC = () => {
  // Auth State
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // App State
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);

  useEffect(() => {
    // Check for existing session
    const storedEmail = localStorage.getItem('user_email');
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
    
    // Load library from local storage
    const storedLibrary = localStorage.getItem('user_library');
    if (storedLibrary) {
      try {
        setLibraryItems(JSON.parse(storedLibrary));
      } catch (e) {
        console.error("Failed to parse library", e);
      }
    }

    setIsLoadingAuth(false);
  }, []);

  const handleLogin = (email: string) => {
    localStorage.setItem('user_email', email);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem('user_email');
    setUserEmail(null);
    setCurrentView(AppView.DASHBOARD);
    setIsSidebarOpen(false);
  };

  const handleSaveClip = (clip: VideoClip, resolution: string) => {
    const newItem: LibraryItem = {
      id: Date.now().toString(),
      title: clip.title,
      date: 'Just now',
      size: resolution === '4k' ? '120 MB' : resolution === '1080p' ? '45 MB' : '22 MB',
      duration: `${clip.startTime}-${clip.endTime}`,
      thumbColor: 'bg-brand-600',
      resolution: resolution
    };

    const updatedLibrary = [newItem, ...libraryItems];
    setLibraryItems(updatedLibrary);
    localStorage.setItem('user_library', JSON.stringify(updatedLibrary));
  };

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} />;
      case AppView.CLIP_ENGINE:
        return <ClipEngine onSaveClip={handleSaveClip} />;
      case AppView.VIRAL_SCORE:
        return <ViralScore />;
      case AppView.LIBRARY_CHAT:
        return <LibraryChat />;
      case AppView.PROFILE:
        return <Profile userEmail={userEmail!} libraryItems={libraryItems} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
    </div>;
  }

  if (!userEmail) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex min-h-screen bg-dark-900 text-white font-sans selection:bg-brand-500/30 selection:text-brand-200">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        userEmail={userEmail}
      />
      
      <main className="flex-1 md:ml-64 min-h-screen relative flex flex-col transition-all duration-300">
        {/* Background Gradients */}
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-brand-900/10 to-transparent pointer-events-none z-0" />
        
        {/* Mobile Header */}
        <div className="md:hidden p-4 flex items-center justify-between border-b border-dark-800 bg-dark-900/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-700 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/20">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
             </div>
             <span className="font-bold text-lg">AIVaultsAI</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-dark-200 hover:bg-dark-800 rounded-lg"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="p-4 md:p-8 lg:p-12 relative z-10 max-w-7xl mx-auto w-full">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;