import React, { useState, useRef } from 'react';
import { Upload, Zap, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import { calculateViralScore } from '../services/geminiService';
import { ViralScoreResult } from '../types';

const ViralScore: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ViralScoreResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    try {
      const data = await calculateViralScore(file);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Failed to calculate score.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreRingColor = (score: number) => {
    if (score >= 80) return "stroke-green-500";
    if (score >= 50) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-white">Viral Score Calculator</h2>
        <p className="text-dark-300">Analyze the first 3 seconds of your video to predict retention.</p>
      </div>

      {!file ? (
        <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-dark-700 rounded-2xl p-16 flex flex-col items-center justify-center bg-dark-800/50 hover:bg-dark-800 hover:border-brand-500/50 transition-all cursor-pointer group"
        >
           <div className="p-5 bg-dark-700 rounded-full group-hover:bg-brand-900/30 group-hover:text-brand-400 transition-colors text-dark-300 mb-6">
            <Zap size={40} />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">Check Your Hook</h3>
          <p className="text-dark-400">Upload a video to see if it stops the scroll.</p>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="video/mp4" className="hidden" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Preview Section */}
            <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-dark-700 bg-black aspect-[9/16] max-w-sm mx-auto relative shadow-2xl">
                    {fileUrl && <video src={fileUrl} className="w-full h-full object-cover" controls />}
                </div>
                {!result && (
                    <Button 
                        onClick={handleAnalyze} 
                        isLoading={isAnalyzing} 
                        className="w-full max-w-sm mx-auto block"
                        size="lg"
                    >
                        Calculate Score
                    </Button>
                )}
                <div className="text-center">
                    <button onClick={() => {setFile(null); setResult(null);}} className="text-sm text-dark-400 hover:text-white underline">Analyze another video</button>
                </div>
            </div>

            {/* Results Section */}
            {result && (
                <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 space-y-8">
                    <div className="flex flex-col items-center">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" className="stroke-dark-700" strokeWidth="12" fill="none" />
                                <circle 
                                    cx="80" cy="80" r="70" 
                                    className={`${getScoreRingColor(result.score)} transition-all duration-1000 ease-out`} 
                                    strokeWidth="12" 
                                    fill="none" 
                                    strokeDasharray={440} 
                                    strokeDashoffset={440 - (440 * result.score) / 100} 
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`text-4xl font-bold ${getScoreColor(result.score)}`}>{result.score}</span>
                                <span className="text-xs text-dark-400 uppercase tracking-wide font-medium">Viral Score</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700/50">
                            <h4 className="text-brand-300 font-medium mb-2 flex items-center gap-2">
                                <Zap size={16} /> Analysis
                            </h4>
                            <p className="text-dark-200 text-sm leading-relaxed">{result.hookAnalysis}</p>
                        </div>

                        <div>
                            <h4 className="text-white font-medium mb-3">Fix Your Hook</h4>
                            <ul className="space-y-3">
                                {result.improvements.map((imp, idx) => (
                                    <li key={idx} className="flex items-start gap-3 text-sm text-dark-300">
                                        <CheckCircle2 className="w-5 h-5 text-brand-500 shrink-0" />
                                        <span>{imp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default ViralScore;