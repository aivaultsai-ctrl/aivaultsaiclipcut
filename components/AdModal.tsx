import React, { useEffect, useState } from 'react';
import { X, PlayCircle, ExternalLink, Loader2 } from 'lucide-react';
import Button from './Button';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  context?: 'ANALYZE' | 'EXPORT';
}

const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, onComplete, context = 'EXPORT' }) => {
  const [timeLeft, setTimeLeft] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(5);
      setCanSkip(false);
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
          <span className="text-xs font-bold text-dark-400 uppercase tracking-widest">Sponsored Advertisement</span>
          <button onClick={onClose} className="text-dark-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Ad Body */}
        <div className="p-6">
          <div className="aspect-video bg-gradient-to-br from-indigo-900 to-purple-900 rounded-xl flex flex-col items-center justify-center text-center p-8 mb-6 relative overflow-hidden group">
            {/* Animated bg effect */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
                <PlayCircle size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Upgrade Your Workflow</h3>
              <p className="text-indigo-200 text-sm mb-4">Get the pro tools used by top creators. Sign up today for 50% off.</p>
              <button className="text-xs bg-white text-indigo-900 font-bold px-4 py-2 rounded-full flex items-center gap-2 mx-auto hover:bg-indigo-50 transition-colors">
                Visit Sponsor <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm text-dark-300">
                {context === 'ANALYZE' && <Loader2 className="w-4 h-4 animate-spin text-brand-500" />}
                <p>
                  {context === 'ANALYZE' 
                    ? "Rendering your clips... Please watch this short ad." 
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