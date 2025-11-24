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
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  // Ad State
  const [showAd, setShowAd] = useState(false);
  const [pendingAction, setPendingAction] = useState<'ANALYZE' | 'EXPORT' | null>(null);

  const activeClip = clips.find(c => c.id === activeClipId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 50 * 1024 * 1024) { // 50MB Limit for demo to avoid browser crash on base64
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

  // Triggered when user clicks "Auto-Generate Clips"
  const initiateAnalysis = () => {
    setPendingAction('ANALYZE');
    setShowAd(true);
    // Start analysis immediately in background while Ad shows (Parallel Flow)
    executeAnalysis();
  };

  // The actual logic
  const executeAnalysis = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const results = await analyzeVideoForClips(file);
      // Assign simple IDs if not present
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

  const triggerExportFlow = () => {
      setShowExportMenu(false);
      setPendingAction('EXPORT');
      setShowAd(true); // Show ad before downloading
  };

  const handleAdComplete = () => {
      setShowAd(false);

      // Only execute pending action for EXPORT (gated)
      // For ANALYZE, it was already started in initiateAnalysis so we don't need to do anything here
      if (pendingAction === 'EXPORT') {
          // In a real app, this would trigger the backend FFmpeg process
          if (activeClip && onSaveClip) {
              onSaveClip(activeClip, exportRes);
          }
          // Small delay to make the transition smooth
          setTimeout(() => {
              alert(`Export Complete!\nClip: "${activeClip?.title}"\nResolution: ${exportRes}\nCaptions: ${includeCaptions ? 'Yes' : 'No'}\n\n(Saved to Library)`);
          }, 300);
      }
      
      setPendingAction(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20 md:pb-0">
      <AdModal 
        isOpen={showAd} 
        onClose={() => setShowAd(false)} 
        onComplete={handleAdComplete} 
        context={pendingAction || 'EXPORT'}
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Viral Clip Engine</h2>
          <p className="text-dark-300 mt-1">AI-powered long-form to short-form video converter.</p>
        </div>
      </div>

      {/* Upload Section */}
      {!file ? (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-dark-700 rounded-2xl p-8 md:p-12 flex flex-col items-center justify-center bg-dark-800/50 hover:bg-dark-800 hover:border-brand-500/50 transition-all cursor-pointer group"
        >
          <div className="p-4 bg-dark-700 rounded-full group-hover:bg-brand-900/30 group-hover:text-brand-400 transition-colors text-dark-300 mb-4">
            <Upload size={32} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Upload Video</h3>
          <p className="text-dark-400 text-center max-w-md">
            Drag and drop MP4 files here, or click to browse. 
            <br/><span className="text-xs text-dark-500">(Max 50MB for demo)</span>
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="video/mp4,video/quicktime" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Source & Clips List */}
          <div className="lg:col-span-1 space-y-6">
             {/* Mini Source Preview */}
             <div className="bg-dark-800 p-4 rounded-xl border border-dark-700">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-dark-300">Source Video</span>
                    <button onClick={() => { setFile(null); setClips([]); }} className="text-xs text-brand-400 hover:underline">Change</button>
                </div>
                <div className="aspect-video bg-black rounded overflow-hidden opacity-50">
                    {fileUrl && <video src={fileUrl} className="w-full h-full object-cover" />}
                </div>
                <div className="mt-4">
                    {!isAnalyzing && clips.length === 0 && (
                        <Button onClick={initiateAnalysis} className="w-full" size="lg">
                            <Scissors className="w-4 h-4 mr-2" />
                            Auto-Generate Clips
                        </Button>
                    )}
                    {isAnalyzing && (
                         <Button disabled className="w-full" size="lg" isLoading={true}>
                            Processing...
                        </Button>
                    )}
                </div>
                {error && (
                    <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 rounded-lg flex items-start gap-2 text-sm text-red-200">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}
             </div>

             {/* Clips List */}
             {clips.length > 0 && (
                 <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider">Generated Clips</h3>
                    {clips.map((clip) => (
                        <div 
                            key={clip.id}
                            onClick={() => setActiveClipId(clip.id)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all ${
                                activeClipId === clip.id 
                                ? 'bg-brand-900/10 border-brand-500 ring-1 ring-brand-500' 
                                : 'bg-dark-800 border-dark-700 hover:border-dark-600'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h4 className={`font-medium line-clamp-1 ${activeClipId === clip.id ? 'text-brand-300' : 'text-white'}`}>{clip.title}</h4>
                                <span className="bg-dark-900 text-xs font-mono py-0.5 px-1.5 rounded text-dark-400">
                                    {clip.startTime}-{clip.endTime}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="h-1.5 flex-1 bg-dark-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-brand-600 to-green-400" style={{ width: `${clip.viralityScore}%` }} />
                                </div>
                                <span className="text-xs font-bold text-brand-400">{clip.viralityScore}</span>
                            </div>
                            <p className="text-xs text-dark-400 line-clamp-2">{clip.reasoning}</p>
                        </div>
                    ))}
                 </div>
             )}
          </div>

          {/* Right Column: Editor / Preview */}
          <div className="lg:col-span-2">
            {clips.length > 0 && activeClip && fileUrl ? (
                <div className="bg-dark-800 rounded-2xl border border-dark-700 overflow-hidden flex flex-col h-full min-h-[500px] lg:min-h-[600px]">
                    <div className="p-4 md:p-6 border-b border-dark-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-20">
                        <div>
                            <h3 className="text-xl font-bold text-white line-clamp-1">{activeClip.title}</h3>
                            <p className="text-sm text-dark-400 line-clamp-1">{activeClip.description}</p>
                        </div>
                        <div className="flex gap-2 relative w-full sm:w-auto">
                            <Button variant="secondary" size="sm" className="flex-1 sm:flex-none">
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </Button>
                            
                            {/* Export Menu */}
                            <div className="relative flex-1 sm:flex-none">
                                <Button 
                                    size="sm" 
                                    onClick={() => setShowExportMenu(!showExportMenu)}
                                    className={`w-full ${showExportMenu ? 'ring-2 ring-brand-500 ring-offset-2 ring-offset-dark-800' : ''}`}
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Export
                                </Button>

                                {showExportMenu && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                                        <div className="absolute top-full right-0 mt-3 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-2xl p-5 z-20 animate-in fade-in zoom-in-95 duration-200">
                                            <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                                                <Settings className="w-4 h-4 text-brand-400" />
                                                Export Settings
                                            </h4>

                                            {/* Preview Thumbnail in Export Menu */}
                                            <div className="mb-5 bg-black/50 rounded-lg p-3 border border-dark-700">
                                                <p className="text-xs text-dark-400 mb-2 uppercase tracking-wide font-medium">Preview Clip</p>
                                                <div className="mx-auto w-24">
                                                     <VideoPlayer 
                                                        src={fileUrl}
                                                        startTime={activeClip.startSeconds}
                                                        endTime={activeClip.endSeconds}
                                                        aspectRatio="portrait"
                                                        autoPlay={true}
                                                        className="aspect-[9/16] w-full rounded-md shadow-inner bg-black"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-5">
                                                {/* Resolution */}
                                                <div>
                                                    <label className="text-xs font-medium text-dark-400 uppercase tracking-wider block mb-2">Resolution</label>
                                                    <div className="grid grid-cols-3 gap-2">
                                                        {(['720p', '1080p', '4k'] as const).map((res) => (
                                                            <button 
                                                                key={res}
                                                                onClick={() => setExportRes(res)}
                                                                className={`py-2 px-3 text-sm rounded-lg border transition-all flex items-center justify-center gap-2 ${
                                                                    exportRes === res 
                                                                    ? 'bg-brand-900/20 border-brand-500 text-brand-300' 
                                                                    : 'bg-dark-900 border-dark-700 text-dark-400 hover:border-dark-500 hover:text-white'
                                                                }`}
                                                            >
                                                                {res === '4k' ? '4K' : res}
                                                                {exportRes === res && <Check size={14} />}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {/* Captions Toggle */}
                                                <div>
                                                    <label className="text-xs font-medium text-dark-400 uppercase tracking-wider block mb-2">Captions</label>
                                                    <button 
                                                        onClick={() => setIncludeCaptions(!includeCaptions)}
                                                        className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                                            includeCaptions
                                                            ? 'bg-brand-900/20 border-brand-500/50' 
                                                            : 'bg-dark-900 border-dark-700 hover:border-dark-600'
                                                        }`}
                                                    >
                                                        <div className="flex flex-col items-start text-left">
                                                            <span className={`text-sm font-medium ${includeCaptions ? 'text-brand-300' : 'text-dark-200'}`}>Burn-in Captions</span>
                                                            <span className="text-[10px] text-dark-400">Overlay AI subtitles</span>
                                                        </div>
                                                        <div className={`w-11 h-6 rounded-full relative transition-colors border ${includeCaptions ? 'bg-brand-600 border-brand-500' : 'bg-dark-800 border-dark-600'}`}>
                                                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200 ${includeCaptions ? 'left-[24px]' : 'left-[2px]'}`} />
                                                        </div>
                                                    </button>
                                                </div>

                                                <div className="pt-2 border-t border-dark-700">
                                                    <Button className="w-full" size="md" onClick={triggerExportFlow}>
                                                        <Download className="w-4 h-4 mr-2" />
                                                        Download {exportRes}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex-1 bg-dark-900/50 p-4 md:p-8 flex items-center justify-center relative">
                        {/* 
                           This player simulates the crop. In a real app, 
                           the export button would trigger a backend FFMPEG job. 
                        */}
                        <VideoPlayer 
                            src={fileUrl}
                            startTime={activeClip.startSeconds}
                            endTime={activeClip.endSeconds}
                            aspectRatio="portrait"
                            autoPlay={true}
                        />

                        {/* Simulated Captions Overlay */}
                        {includeCaptions && (
                            <div className="absolute bottom-20 left-0 right-0 text-center px-8 md:px-12 pointer-events-none animate-in fade-in duration-300">
                                <span className="inline-block bg-black/50 text-white text-base md:text-lg font-bold px-2 py-1 rounded backdrop-blur-sm shadow-xl">
                                    [AI Generated Captions Would Appear Here]
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // Empty State for Right Column
                <div className="h-full flex flex-col items-center justify-center text-dark-500 border border-dark-700 border-dashed rounded-2xl bg-dark-800/30 p-12 min-h-[400px]">
                    <Play className="w-16 h-16 opacity-20 mb-4" />
                    <p>Select a clip to preview and edit</p>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ClipEngine;