import React from 'react';
import { Scissors, Zap, MessageSquare, LayoutDashboard, Settings, LogOut, X, UserCircle, Library } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  userEmail: string;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, onLogout, userEmail }) => {
  const navItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.CLIP_ENGINE, label: 'Clip Engine', icon: Scissors },
    { id: AppView.VIRAL_SCORE, label: 'Viral Score', icon: Zap },
    { id: AppView.LIBRARY_CHAT, label: 'Ask Library', icon: MessageSquare },
    { id: AppView.PROFILE, label: 'Library & Profile', icon: Library },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed left-0 top-0 h-full w-64 bg-dark-900 border-r border-dark-800 flex flex-col z-50 shadow-2xl md:shadow-none
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                {/* AIVaultsAI Custom Logo */}
                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-white tracking-tight leading-none">AIVaultsAI</span>
                    <span className="text-xs text-brand-400 font-medium tracking-widest uppercase">ClipCut</span>
                </div>
            </div>
            {/* Close Button Mobile */}
            <button onClick={onClose} className="md:hidden text-dark-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onClose(); // Close on mobile navigation
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive 
                      ? 'bg-brand-900/20 text-brand-400 font-medium' 
                      : 'text-dark-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-brand-400' : 'text-dark-500 group-hover:text-white'} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-dark-800">
           {/* User Profile Info */}
           <div 
             className="flex items-center gap-3 px-2 mb-4 overflow-hidden cursor-pointer hover:bg-dark-800 rounded-lg p-2 -mx-2 transition-colors"
             onClick={() => {
                onNavigate(AppView.PROFILE);
                onClose();
             }}
           >
              <UserCircle size={32} className="text-dark-400 shrink-0" />
              <div className="flex flex-col overflow-hidden">
                 <span className="text-xs text-dark-400 font-medium uppercase tracking-wide">Logged in as</span>
                 <span className="text-sm text-white truncate" title={userEmail}>{userEmail}</span>
              </div>
           </div>

           <button 
              onClick={() => {
                onNavigate(AppView.PROFILE);
                onClose();
              }}
              className="flex items-center gap-3 text-dark-400 hover:text-white transition-colors w-full px-4 py-2"
           >
              <Settings size={18} />
              <span className="text-sm">Settings</span>
           </button>
           <button 
              onClick={onLogout}
              className="flex items-center gap-3 text-dark-400 hover:text-red-400 transition-colors w-full px-4 py-2 mt-2"
           >
              <LogOut size={18} />
              <span className="text-sm">Sign Out</span>
           </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;