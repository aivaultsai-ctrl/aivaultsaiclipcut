
import React, { useState } from 'react';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Button from './Button';

interface LoginProps {
  onLogin: (email: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    // Simulate network delay for better UX
    setTimeout(() => {
      onLogin(email);
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 animate-in fade-in zoom-in-95 duration-500 relative z-10">
        
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-brand-400 to-brand-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-brand-900/30 transform rotate-3 border border-white/10">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white drop-shadow-md">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight mb-1">AIVaultsAI</h2>
          <span className="inline-block px-3 py-1 bg-brand-900/30 border border-brand-500/30 rounded-full text-brand-300 text-xs font-bold tracking-[0.2em] uppercase mb-2">ClipCut Edition</span>
          <p className="text-lg text-dark-300 mt-2">The #1 Free AI Repurposing Engine</p>
        </div>

        <div className="bg-dark-800/80 backdrop-blur-xl border border-dark-700 rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-300 mb-2 ml-1">
                Work Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-dark-900/50 border border-dark-600 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all placeholder-dark-500"
                placeholder="name@company.com"
              />
            </div>

            <Button 
                type="submit" 
                className="w-full py-3.5 text-base shadow-brand-500/20 shadow-lg" 
                size="lg"
                disabled={!email || isLoading}
                isLoading={isLoading}
            >
              Get Started for Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-sm text-dark-400">
                    <CheckCircle size={16} className="text-brand-500" />
                    <span>Unlimited 1080p Exports</span>
                </div>
                 <div className="flex items-center gap-2 text-sm text-dark-400">
                    <CheckCircle size={16} className="text-brand-500" />
                    <span>No Watermark</span>
                </div>
                 <div className="flex items-center gap-2 text-sm text-dark-400">
                    <CheckCircle size={16} className="text-brand-500" />
                    <span>Auto-Captions included</span>
                </div>
            </div>
          </form>
        </div>
        
        <p className="text-center text-xs text-dark-500">
          By continuing, you agree to our Terms of Service. 
        </p>
      </div>
    </div>
  );
};

export default Login;