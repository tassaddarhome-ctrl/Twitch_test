import React, { useEffect, useRef } from 'react';
import { ChatMessage, ViewerStats, getBadge } from '../types';
import { GlassCard } from './GlassUI';

interface ChatFeedProps {
  messages: ChatMessage[];
  stats: Record<string, ViewerStats>;
}

const ChatFeed: React.FC<ChatFeedProps> = ({ messages, stats }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <GlassCard className="h-full flex flex-col !p-0 border-l border-white/5 rounded-none" noPadding>
      <div className="h-14 flex items-center px-4 border-b border-white/5 bg-white/[0.02]">
        <div className="w-2 h-2 rounded-full bg-green-500 mr-3 shadow-[0_0_10px_#22c55e]" />
        <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
          Live Feed
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-600 space-y-2">
            <span className="text-2xl opacity-20">💬</span>
            <span className="text-xs font-mono">WAITING FOR SIGNAL...</span>
          </div>
        )}
        {messages.map((msg) => {
          const userScore = stats[msg.username]?.score || 0;
          const badge = getBadge(userScore);
          
          return (
            <div key={msg.id} className="text-sm animate-fade-in-up group">
              <div className="flex items-baseline space-x-2">
                {badge && <span className="text-xs opacity-80" title={`${userScore} pts`}>{badge}</span>}
                <span 
                  style={{ color: msg.color }} 
                  className="font-bold text-xs font-mono opacity-80 group-hover:opacity-100 transition-opacity"
                >
                  {msg.username}
                </span>
                <span className="text-[10px] text-gray-600 font-mono">
                  {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <p className="text-gray-300 leading-snug mt-0.5 break-words font-light">
                {msg.message}
              </p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </GlassCard>
  );
};

export default ChatFeed;