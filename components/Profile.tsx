import React, { useState } from 'react';
import { UserCircle, Mail, FolderOpen, Clock, MoreVertical, Download, Trash2, Shield, CreditCard, Video } from 'lucide-react';
import Button from './Button';
import { LibraryItem } from '../types';

interface ProfileProps {
    userEmail: string;
    libraryItems: LibraryItem[];
}

const Profile: React.FC<ProfileProps> = ({ userEmail, libraryItems }) => {
    const [activeTab, setActiveTab] = useState<'library' | 'settings'>('library');

    // Mock Library Data (displayed if libraryItems is empty or mixed in)
    const mockLibrary: LibraryItem[] = [
        { id: "mock1", title: "Alex Hormozi Strategy", date: "2 hrs ago", size: "12 MB", duration: "0:45", thumbColor: "bg-blue-500", resolution: '1080p' },
        { id: "mock2", title: "Podcast Highlight Ep 4", date: "Yesterday", size: "45 MB", duration: "1:02", thumbColor: "bg-purple-500", resolution: '1080p' },
        { id: "mock3", title: "Funny Cat compilation", date: "3 days ago", size: "128 MB", duration: "0:58", thumbColor: "bg-orange-500", resolution: '720p' },
        { id: "mock4", title: "Crypto Market Update", date: "1 week ago", size: "32 MB", duration: "0:30", thumbColor: "bg-green-500", resolution: '1080p' },
    ];

    // Combine real and mock items, prioritizing real ones
    const displayItems = [...libraryItems, ...mockLibrary];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / ID Card */}
            <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-dark-800">
                    <span className="text-3xl font-bold text-white">{userEmail.charAt(0).toUpperCase()}</span>
                </div>
                <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-white mb-1">Creator Account</h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-dark-400 mb-4">
                        <Mail size={16} />
                        <span>{userEmail}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className="bg-brand-900/30 text-brand-300 border border-brand-500/30 px-3 py-1 rounded-full text-xs font-medium">Free Plan</span>
                        <span className="bg-dark-700 text-dark-300 border border-dark-600 px-3 py-1 rounded-full text-xs font-medium">Member since 2024</span>
                    </div>
                </div>
                <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700 text-center min-w-[150px]">
                    <span className="block text-2xl font-bold text-white">{libraryItems.length + 4}</span>
                    <span className="text-xs text-dark-400 uppercase tracking-wide">Saved Clips</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-dark-700">
                <div className="flex gap-8">
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'library' ? 'text-white' : 'text-dark-400 hover:text-dark-200'}`}
                    >
                        Video Library
                        {activeTab === 'library' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('settings')}
                        className={`pb-4 px-2 text-sm font-medium transition-colors relative ${activeTab === 'settings' ? 'text-white' : 'text-dark-400 hover:text-dark-200'}`}
                    >
                        Account Settings
                        {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 rounded-t-full"></div>}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {activeTab === 'library' ? (
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white">Your Saved Projects</h3>
                        <div className="flex gap-2">
                             {/* Filter mockup */}
                            <select className="bg-dark-800 border border-dark-700 text-dark-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-brand-500">
                                <option>Newest First</option>
                                <option>Oldest First</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayItems.map((item) => (
                            <div key={item.id} className="group bg-dark-800 border border-dark-700 rounded-xl overflow-hidden hover:border-dark-500 transition-all hover:shadow-xl hover:shadow-black/20 animate-in fade-in duration-300">
                                {/* Thumbnail */}
                                <div className={`aspect-video ${item.thumbColor} opacity-80 group-hover:opacity-100 transition-opacity relative`}>
                                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded font-mono border border-white/10 uppercase">
                                        {item.resolution || 'HD'}
                                    </div>
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded font-mono">
                                        {item.duration}
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                                        <Button size="sm" variant="secondary" className="mr-2">Preview</Button>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                         <Video className="text-white/20 w-12 h-12" />
                                    </div>
                                </div>
                                {/* Info */}
                                <div className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-semibold text-white line-clamp-1" title={item.title}>{item.title}</h4>
                                        <button className="text-dark-400 hover:text-white"><MoreVertical size={16} /></button>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-dark-400 mb-4">
                                        <span className="flex items-center gap-1"><Clock size={12} /> {item.date}</span>
                                        <span className="flex items-center gap-1"><FolderOpen size={12} /> {item.size}</span>
                                    </div>
                                    <div className="flex gap-2 pt-3 border-t border-dark-700">
                                        <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                                            <Download size={12} className="mr-2" /> Download
                                        </Button>
                                        <Button size="sm" variant="ghost" className="px-2 h-8 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                         {/* Placeholder for "Add New" */}
                        <div className="border-2 border-dashed border-dark-700 rounded-xl flex flex-col items-center justify-center min-h-[200px] text-dark-500 hover:border-brand-500/50 hover:bg-dark-800/50 transition-all cursor-pointer">
                            <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center mb-3">
                                <span className="text-2xl text-dark-400">+</span>
                            </div>
                            <span className="text-sm font-medium">Create New Clip</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-2xl space-y-6">
                    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Shield size={20} className="text-brand-400" />
                            Security
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-4 border-b border-dark-700">
                                <div>
                                    <p className="text-sm font-medium text-white">Email Address</p>
                                    <p className="text-xs text-dark-400">{userEmail}</p>
                                </div>
                                <Button variant="outline" size="sm" disabled>Managed by Google</Button>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-white">Password</p>
                                    <p className="text-xs text-dark-400">Last changed 3 months ago</p>
                                </div>
                                <Button variant="outline" size="sm">Update</Button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-dark-800 border border-dark-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CreditCard size={20} className="text-brand-400" />
                            Billing (Free Tier)
                        </h3>
                        <div className="p-4 bg-brand-900/10 border border-brand-500/20 rounded-lg mb-4">
                            <p className="text-sm text-brand-200">You are currently on the <strong>Free Plan</strong>. You have unlimited exports with ad-support.</p>
                        </div>
                        <Button className="w-full">Upgrade to Pro (Ad-Free)</Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;