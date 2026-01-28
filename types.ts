export interface ChatMessage {
  username: string;
  message: string;
  color?: string;
  id: string;
}

export enum GameType {
  NONE = 'NONE',
  TRIVIA = 'TRIVIA',
  TUG_OF_WAR = 'TUG_OF_WAR',
  STORY_MODE = 'STORY_MODE',
  POLL = 'POLL'
}

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface StorySegment {
  text: string;
  optionA: string;
  optionB: string;
}

export interface ViewerStats {
  username: string;
  score: number;
  badges: string[];
}

export const getBadge = (score: number): string => {
  if (score >= 1000) return '💎';
  if (score >= 500) return '🥇';
  if (score >= 100) return '🥈';
  if (score >= 10) return '🥉';
  return '';
};