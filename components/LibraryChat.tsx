import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, FileVideo } from 'lucide-react';
import Button from './Button';
import { ChatMessage } from '../types';
import { chatWithVideo } from '../services/geminiService';

const LibraryChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello! Upload a video and I can answer questions about its content, find specific moments, or summarize it for you.', timestamp: new Date() }
    ]);
    const [input, setInput] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        if (!file) {
            alert("Please upload a video context first.");
            return;
        }

        const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await chatWithVideo(file, input);
            const aiMsg: ChatMessage = { role: 'model', text: responseText, timestamp: new Date() };
            setMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-6 animate-in fade-in duration-500 h-[80vh] md:h-[calc(100vh-8rem)]">
             {/* Left: Context Manager */}
            <div className="w-full md:w-80 flex-none flex flex-col gap-4">
                <div className="bg-dark-800 p-6 rounded-2xl border border-dark-700 h-full overflow-y-auto">
                    <h3 className="text-lg font-bold text-white mb-4">Video Context</h3>
                    
                    {!file ? (
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-dark-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-brand-500 hover:bg-dark-700/50 transition-all"
                        >
                            <FileVideo className="w-8 h-8 text-dark-400 mb-2" />
                            <span className="text-sm text-dark-300">Select Active Video</span>
                            <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && setFile(e.target.files[0])} accept="video/*" className="hidden" />
                        </div>
                    ) : (
                        <div className="bg-dark-900 rounded-xl p-4 flex items-center gap-3 border border-dark-600">
                             <div className="w-10 h-10 bg-brand-900/30 rounded-lg flex items-center justify-center text-brand-400">
                                <FileVideo size={20} />
                             </div>
                             <div className="overflow-hidden">
                                <p className="text-sm font-medium text-white truncate">{file.name}</p>
                                <p className="text-xs text-dark-400">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                             </div>
                             <button onClick={() => setFile(null)} className="ml-auto text-xs text-red-400 hover:text-red-300">Remove</button>
                        </div>
                    )}

                    <div className="mt-8">
                        <h4 className="text-xs font-semibold text-dark-400 uppercase tracking-wider mb-3">Try asking</h4>
                        <ul className="space-y-2 flex flex-col">
                            {["Find moments where I say 'Money'", "Summarize the key takeaways", "Write a LinkedIn post based on this", "What is the tone of this video?"].map((q, i) => (
                                <li 
                                    key={i} 
                                    onClick={() => setInput(q)}
                                    className="text-sm text-brand-200/80 hover:text-brand-300 cursor-pointer hover:bg-dark-700/50 p-2 rounded transition-colors"
                                >
                                    "{q}"
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Right: Chat Area */}
            <div className="flex-1 bg-dark-800 rounded-2xl border border-dark-700 flex flex-col overflow-hidden min-h-[400px]">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6" ref={scrollRef}>
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-brand-600' : 'bg-dark-600'}`}>
                                {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-brand-300" />}
                            </div>
                            <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-2xl ${
                                msg.role === 'user' 
                                ? 'bg-brand-600 text-white rounded-tr-sm' 
                                : 'bg-dark-700 text-dark-100 rounded-tl-sm border border-dark-600'
                            }`}>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                <span className="text-[10px] opacity-50 mt-2 block">{msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-dark-600 flex items-center justify-center shrink-0">
                                <Bot size={16} className="text-brand-300" />
                            </div>
                            <div className="bg-dark-700 p-4 rounded-2xl rounded-tl-sm border border-dark-600">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-dark-400 rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                         </div>
                    )}
                </div>

                <div className="p-4 border-t border-dark-700 bg-dark-800">
                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full bg-dark-900 border border-dark-600 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 placeholder-dark-500"
                            placeholder={file ? "Ask something..." : "Upload video first..."}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            disabled={!file || isLoading}
                        />
                        <button 
                            onClick={handleSend}
                            disabled={!input.trim() || !file || isLoading}
                            className="absolute right-2 top-2 p-1.5 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:bg-dark-700 transition-colors"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LibraryChat;