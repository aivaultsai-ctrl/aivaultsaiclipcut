import React from 'react';
import { Scissors, Zap, TrendingUp, Clock, Video } from 'lucide-react';
import { AppView } from '../types';

interface DashboardProps {
    onNavigate: (view: AppView) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div>
            <h2 className="text-3xl font-bold text-white">Welcome back, Creator.</h2>
            <p className="text-dark-300 mt-1">Here is what's happening with your content today.</p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-brand-900/20 rounded-lg text-brand-400">
                        <Video size={24} />
                    </div>
                    <span className="text-xs font-medium text-green-400 bg-green-900/20 px-2 py-1 rounded">+12%</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">24</h3>
                <p className="text-sm text-dark-400">Clips generated this month</p>
            </div>
             <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-blue-900/20 rounded-lg text-blue-400">
                        <Clock size={24} />
                    </div>
                    <span className="text-xs font-medium text-green-400 bg-green-900/20 px-2 py-1 rounded">-45 hrs</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">12.5h</h3>
                <p className="text-sm text-dark-400">Editing time saved</p>
            </div>
             <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-purple-900/20 rounded-lg text-purple-400">
                        <TrendingUp size={24} />
                    </div>
                    <span className="text-xs font-medium text-green-400 bg-green-900/20 px-2 py-1 rounded">+8%</span>
                </div>
                <h3 className="text-3xl font-bold text-white mb-1">89.2</h3>
                <p className="text-sm text-dark-400">Avg. Virality Score</p>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div 
                onClick={() => onNavigate(AppView.CLIP_ENGINE)}
                className="group relative overflow-hidden bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-2xl p-8 cursor-pointer hover:border-brand-500/50 transition-all"
            >
                <div className="absolute top-0 right-0 p-32 bg-brand-500/5 rounded-full blur-3xl group-hover:bg-brand-500/10 transition-colors"></div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-brand-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-brand-900/20 group-hover:scale-110 transition-transform">
                        <Scissors size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Create Viral Clips</h3>
                    <p className="text-dark-300 mb-6 max-w-sm">
                        Upload long-form video. AI automatically finds the best moments, crops them to vertical, and generates captions.
                    </p>
                    <span className="text-brand-400 text-sm font-medium group-hover:underline">Start Repurposing &rarr;</span>
                </div>
            </div>

            <div 
                onClick={() => onNavigate(AppView.VIRAL_SCORE)}
                className="group relative overflow-hidden bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700 rounded-2xl p-8 cursor-pointer hover:border-yellow-500/50 transition-all"
            >
                 <div className="absolute top-0 right-0 p-32 bg-yellow-500/5 rounded-full blur-3xl group-hover:bg-yellow-500/10 transition-colors"></div>
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center text-white mb-6 shadow-lg shadow-yellow-900/20 group-hover:scale-110 transition-transform">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Check Hook Score</h3>
                    <p className="text-dark-300 mb-6 max-w-sm">
                        Test your video's first 3 seconds. Get an instant score (0-100) and actionable tips to improve retention.
                    </p>
                    <span className="text-yellow-400 text-sm font-medium group-hover:underline">Analyze Hook &rarr;</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Dashboard;