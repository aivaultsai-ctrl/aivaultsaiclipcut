import React, { useEffect, useState } from 'react';
import { X, PlayCircle, ExternalLink, Loader2, RefreshCcw } from 'lucide-react';
import Button from './Button';
import { getDailyAd } from '../services/adNetwork';
import { AdContent } from '../types';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  context?: 'ANALYZE' | 'EXPORT';
}

const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, onComplete, context = 'EXPORT' }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [ad, setAd] = useState<AdContent | null>(null);
  const [isLoadingAd, setIsLoadingAd] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Reset timer
      setTimeLeft(5);
      setCanSkip(false);
      
      // Fetch Ad
      const loadAd = async () => {
        setIsLoadingAd(true);
        const content = await getDailyAd();
        setAd(content);
        setIsLoadingAd(false);
      };
      loadAd();

      // Start Countdown
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanSkip(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const actionText = context === 'ANALYZE' ? 'Rendering Clips' : 'Download';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-dark-700 bg-dark-900/50">
          <span className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-2">
             Sponsored Advertisement
             {isLoadingAd && <RefreshCcw className="w-3 h-3 animate-spin" />}
          </span>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Ad Body */}
        <div className="p-6">
          {/* 
            CLICKABLE AD AREA 
          */}
          <a 
            href={ad?.affiliateLink || "#"} 
            target="_blank" 
            rel="noopener noreferrer"
            className="block aspect-video rounded-xl flex flex-col items-center justify-center text-center p-8 mb-6 relative overflow-hidden group hover:opacity-95 transition-opacity cursor-pointer text-decoration-none shadow-xl"
            style={{ 
                background: ad ? `linear-gradient(135deg, ${ad.themeColor}dd, #0f172a)` : '#1e293b'
            }}
          >
            {/* Animated bg effect */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10 w-full">
              {isLoadingAd ? (
                 <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-white/50" />
                    <span className="text-white/50 text-sm">Loading Offer...</span>
                 </div>
              ) : (
                <>
                    <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md group-hover:scale-110 transition-transform duration-500 shadow-inner border border-white/20">
                        <PlayCircle size={32} className="text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 leading-tight drop-shadow-md">{ad?.sponsorName}</h3>
                    <p className="text-white/90 text-sm mb-6 max-w-xs mx-auto font-medium">{ad?.sponsorTagline}</p>
                    
                    <div className="text-xs bg-white text-dark-900 font-bold px-5 py-2.5 rounded-full inline-flex items-center gap-2 mx-auto hover:bg-gray-100 transition-colors shadow-lg">
                        {ad?.ctaText} <ExternalLink size={12} />
                    </div>
                </>
              )}
            </div>
          </a>

          <div className="text-center space-y-4">
             {/* Dynamic Description */}
            {!isLoadingAd && ad && (
                <p className="text-sm text-dark-300 italic px-4">
                    "{ad.description}"
                </p>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-dark-400 pt-2 border-t border-dark-700/50">
                {context === 'ANALYZE' && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
                <p>
                  {context === 'ANALYZE' 
                    ? "Rendering your clips... Please check out this offer." 
                    : "Your download will begin automatically after the ad."}
                </p>
            </div>
            
            <Button 
              onClick={onComplete} 
              disabled={!canSkip}
              className={`w-full ${!canSkip ? 'opacity-80' : ''}`}
              variant={canSkip ? 'primary' : 'secondary'}
            >
              {canSkip ? (
                `Skip & ${context === 'ANALYZE' ? 'View Results' : 'Download Video'}`
              ) : (
                `Wait ${timeLeft}s to ${actionText}`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdModal;