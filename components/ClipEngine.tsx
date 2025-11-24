import React, { useState, useRef } from 'react';
import { Upload, Play, Scissors, Share2, Download, AlertCircle, Settings, Check } from 'lucide-react';
import Button from './Button';
import VideoPlayer from './VideoPlayer';
import AdModal from './AdModal';
import { analyzeVideoForClips } from '../services/geminiService';
import { VideoClip } from '../types';

interface ClipEngineProps {
    onSaveClip?: (clip: VideoClip, resolution: string) => void;
}

const ClipEngine: React.FC<ClipEngineProps> = ({ onSaveClip }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clips, setClips] = useState<VideoClip[]>([]);
  const [activeClipId, setActiveClipId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Export Settings State
  const [exportRes, setExportRes] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [includeCaptions, setIncludeCaptions] = useState(true);
  
  // Ad State
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<'ANALYZE' | 'EXPORT' | null>(null);

  const activeClip = clips.find(c => c.id === activeClipId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB Limit for demo
          setError("File size too large. Please upload videos under 50MB for this demo.");
          return;
      }
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setClips([]);
      setActiveClipId(null);
      setError(null);
    }
  };

  const initiateAnalysis = () => {
    setPendingAction('ANALYZE');
    setShowAd(true);
    executeAnalysis();
  };

  const executeAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const results = await analyzeVideoForClips(file);
      const formattedResults = results.map((r, idx) => ({ ...r, id: r.id || `clip-${idx}` }));
      setClips(formattedResults);
      if (formattedResults.length > 0) {
        setActiveClipId(formattedResults[0].id);
      }
    } catch (err: any) {
      setError("Failed to analyze video. Please try again. " + (err.message || ""));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const initiateExport = () => {
      setPendingAction('EXPORT');
      setShowAd(true);
  };

  const executeExport = () => {
      if (activeClip && onSaveClip) {
          onSaveClip(activeClip, exportRes);
          alert(`Saved "${activeClip.title}" to your library in ${exportRes}.`);
      }
  };

  const handleAdComplete = () => {
      setShowAd(false);
      // If exporting, do it now
      if (pendingAction === 'EXPORT') {
          executeExport();
      }
      // If analyzing, it runs in background, so we just close modal to reveal state
      setPendingAction(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <AdModal 
        isOpen={showAd} 
        onClose={() => setShowAd(false)} 
        onComplete={handleAdComplete}
        context={pendingAction || 'EXPORT'}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
         <div>
            <h2 className="text-2xl font-bold text-white">Clip Engine</h2>
            <p className="text-dark-400 text-sm">AI-powered long-form to short-form repurposing.</p>
         </div>
         {clips.length > 0 && (
             <Button variant="outline" onClick={() => {setFile(null); setClips([]);}}>
                <Upload size={16} className="mr-2" /> New Video
             </Button>
         )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 overflow-hidden flex-col md:flex-row">
        
        {/* Upload State */}
        {!file ? (
             <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-dark-700 rounded-2xl flex flex-col items-center justify-center bg-dark-800/50 hover:bg-dark-800 hover:border-brand-500/50 transition-all cursor-pointer group"
            >
                <div className="p-6 bg-dark-700 rounded-full group-hover:bg-brand-900/30 group-hover:text-brand-400 transition-colors text-dark-300 mb-6">
                    <Upload size={48} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Upload Long Video</h3>
                <p className="text-dark-400 max-w-sm text-center mb-6">Drag & drop or click to upload. <br/> Supports MP4, MOV (Max 50MB)</p>
                <Button variant="secondary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                    Select File
                </Button>
                {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg">
                        <AlertCircle size={16} /> <span className="text-sm">{error}</span>
                    </div>
                )}
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/*" className="hidden" />
            </div>
        ) : clips.length === 0 ? (
            // Analyze State
            <div className="flex-1 flex flex-col items-center justify-center bg-dark-800 rounded-2xl border border-dark-700 p-8">
                 <div className="w-full max-w-md aspect-video bg-black rounded-xl overflow-hidden mb-8 shadow-2xl relative">
                     {fileUrl && <video src={fileUrl} className="w-full h-full object-contain" controls />}
                 </div>
                 
                 <div className="text-center space-y-6">
                    <div>
                        <h3 className="text-lg font-medium text-white mb-1">{file.name}</h3>
                        <p className="text-dark-400 text-sm">Ready to analyze</p>
                    </div>

                    <Button 
                        size="lg" 
                        onClick={initiateAnalysis} 
                        isLoading={isAnalyzing}
                        className="min-w-[200px]"
                    >
                        <Scissors className="mr-2" /> Find Viral Clips
                    </Button>
                    
                     {error && (
                        <div className="flex items-center gap-2 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg justify-center">
                            <AlertCircle size={16} /> <span className="text-sm">{error}</span>
                        </div>
                    )}
                 </div>
            </div>
        ) : (
            // Editor / Results State
            <>
                {/* Left: Video Player */}
                <div className="flex-1 flex flex-col gap-4 min-w-0">
                    <div className="flex-1 bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-dark-700 flex items-center justify-center">
                        {activeClip && fileUrl && (
                             <VideoPlayer 
                                key={activeClip.id}
                                src={fileUrl} 
                                startTime={activeClip.startSeconds}
                                endTime={activeClip.endSeconds}
                                aspectRatio="portrait"
                                autoPlay={true}
                                className="h-full w-auto aspect-[9/16]"
                             />
                        )}
                    </div>
                    {/* Controls */}
                    <div className="bg-dark-800 p-4 rounded-xl border border-dark-700 flex justify-between items-center">
                         <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm text-dark-300">
                                <Settings size={16} />
                                <span className="hidden md:inline">Export Settings:</span>
                            </div>
                            <div className="flex bg-dark-900 rounded-lg p-1 border border-dark-700">
                                {(['720p', '1080p', '4k'] as const).map(res => (
                                    <button
                                        key={res}
                                        onClick={() => setExportRes(res)}
                                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${exportRes === res ? 'bg-brand-600 text-white shadow-sm' : 'text-dark-400 hover:text-white'}`}
                                    >
                                        {res}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setIncludeCaptions(!includeCaptions)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${includeCaptions ? 'bg-brand-900/20 border-brand-500/50 text-brand-400' : 'border-dark-600 text-dark-400'}`}
                            >
                                <Check size={12} className={includeCaptions ? 'opacity-100' : 'opacity-0'} /> Auto-Captions
                            </button>
                         </div>
                         <Button onClick={initiateExport}>
                            <Download size={18} className="mr-2" /> Export Clip
                         </Button>
                    </div>
                </div>

                {/* Right: Clip List */}
                <div className="w-80 flex flex-col bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden">
                    <div className="p-4 border-b border-dark-700 bg-dark-900/50">
                        <h3 className="font-semibold text-white">Identified Clips</h3>
                        <span className="text-xs text-dark-400">{clips.length} moments found</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {clips.map(clip => (
                            <div 
                                key={clip.id}
                                onClick={() => setActiveClipId(clip.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                                    activeClipId === clip.id 
                                    ? 'bg-brand-900/10 border-brand-500/50 shadow-md' 
                                    : 'bg-dark-700/50 border-transparent hover:bg-dark-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        clip.viralityScore > 80 ? 'bg-green-900/30 text-green-400' : 'bg-yellow-900/30 text-yellow-400'
                                    }`}>
                                        Score: {clip.viralityScore}
                                    </span>
                                    <span className="text-xs font-mono text-dark-400">{clip.startTime} - {clip.endTime}</span>
                                </div>
                                <h4 className={`text-sm font-medium mb-1 line-clamp-2 ${activeClipId === clip.id ? 'text-brand-100' : 'text-dark-200'}`}>
                                    {clip.title}
                                </h4>
                                <p className="text-xs text-dark-400 line-clamp-2 mb-2">{clip.reasoning}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default ClipEngine;