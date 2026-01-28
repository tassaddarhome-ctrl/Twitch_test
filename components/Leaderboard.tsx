import React from 'react';
import { ViewerStats, getBadge } from '../types';
import { GlassCard } from './GlassUI';

interface LeaderboardProps {
  stats: Record<string, ViewerStats>;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ stats }) => {
  const sortedStats = Object.values(stats)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Top 10

  return (
    <GlassCard className="h-full flex flex-col !p-0 border-l border-white/5 rounded-none" noPadding>
      <div className="h-14 flex items-center px-4 border-b border-white/5 bg-white/[0.02]">
        <span className="text-yellow-500 mr-2 text-lg">🏆</span>
        <h3 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest">
          Top Agents
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {sortedStats.length === 0 && (
           <div className="text-gray-600 text-center text-xs font-mono mt-10">NO DATA AVAILABLE</div>
        )}
        {sortedStats.map((stat, index) => (
          <div key={stat.username} className="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors group cursor-default">
            <div className="flex items-center space-x-3">
               <div className={`
                 w-6 h-6 flex items-center justify-center rounded font-mono text-xs font-bold
                 ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : 
                   index === 1 ? 'bg-gray-400/20 text-gray-300' :
                   index === 2 ? 'bg-orange-700/20 text-orange-400' : 'text-gray-600'}
               `}>
                 {index + 1}
               </div>
               <div className="flex flex-col">
                  <span className="font-medium text-sm text-gray-200 group-hover:text-white transition-colors">
                    {stat.username}
                  </span>
               </div>
            </div>
            <span className="font-mono text-xs font-bold text-primary">
              {stat.score}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
};

export default Leaderboard;