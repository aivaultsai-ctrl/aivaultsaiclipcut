export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CLIP_ENGINE = 'CLIP_ENGINE',
  VIRAL_SCORE = 'VIRAL_SCORE',
  LIBRARY_CHAT = 'LIBRARY_CHAT',
  PROFILE = 'PROFILE',
}

export interface VideoClip {
  id: string;
  startTime: string; // MM:SS format
  endTime: string; // MM:SS format
  startSeconds: number;
  endSeconds: number;
  title: string;
  description: string;
  viralityScore: number;
  reasoning: string;
}

export interface ViralScoreResult {
  score: number; // 0-100
  hookAnalysis: string;
  improvements: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface LibraryItem {
  id: string;
  title: string;
  date: string;
  size: string;
  duration: string;
  thumbColor: string;
  resolution: string;
}