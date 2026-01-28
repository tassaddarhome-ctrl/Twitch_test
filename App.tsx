import React, { useState, useEffect } from 'react';
import { GameType, ViewerStats } from './types';
import { useTwitchChat } from './services/twitchService';
import ChatFeed from './components/ChatFeed';
import Leaderboard from './components/Leaderboard';
import TriviaGame from './games/TriviaGame';
import TugOfWar from './games/TugOfWar';
import StoryMode from './games/StoryMode';
import PollGame from './games/PollGame';
import { GlassCard, GlassButton, NeonText, Badge } from './components/GlassUI';
import { GridBackground, SmileRain } from './components/Effects';

function App() {
  const [channel, setChannel] = useState('');
  const [inputChannel, setInputChannel] = useState('');
  const [currentGame, setCurrentGame] = useState<GameType>(GameType.NONE);
  const [viewerStats, setViewerStats] = useState<Record<string, ViewerStats>>({});
  
  // Effect Triggers
  const [smileTrigger, setSmileTrigger] = useState(0);

  const { messages, isConnected } = useTwitchChat(channel);

  // Monitor messages for effects
  useEffect(() => {
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    
    // Check for smileys
    if (lastMsg.message.includes(')') || lastMsg.message.includes('(')) {
      setSmileTrigger(prev => prev + 1);
    }
  }, [messages]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputChannel.trim()) {
      setChannel(inputChannel.trim());
    }
  };

  const handleReward = (username: string, amount: number) => {
    setViewerStats(prev => {
      const current = prev[username] || { username, score: 0, badges: [] };
      return {
        ...prev,
        [username]: {
          ...current,
          score: current.score + amount
        }
      };
    });
  };

  const renderGame = () => {
    switch (currentGame) {
      case GameType.TRIVIA:
        return <TriviaGame messages={messages} onExit={() => setCurrentGame(GameType.NONE)} onReward={handleReward} />;
      case GameType.TUG_OF_WAR:
        return <TugOfWar messages={messages} onExit={() => setCurrentGame(GameType.NONE)} />;
      case GameType.STORY_MODE:
        return <StoryMode messages={messages} onExit={() => setCurrentGame(GameType.NONE)} onReward={handleReward} />;
      case GameType.POLL:
        return <PollGame messages={messages} onExit={() => setCurrentGame(GameType.NONE)} onReward={handleReward} />;
      default:
        return (
          <div className="flex flex-col items-center w-full max-w-6xl mx-auto animate-fade-in-up">
            <div className="mb-12 text-center space-y-4">
              <Badge color="blue">COMMAND CENTER</Badge>
              <NeonText size="xl">SELECT PROTOCOL</NeonText>
              <p className="text-gray-400 max-w-lg mx-auto">
                Engage your audience with AI-powered interactive modules. Select a game card to initiate the session.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
              {/* Trivia Card */}
              <GlassCard 
                className="group cursor-pointer hover:-translate-y-2 relative" 
                onClick={() => setCurrentGame(GameType.TRIVIA)}
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl font-black">?</div>
                 <div className="h-full flex flex-col justify-between relative z-10">
                   <div>
                     <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform text-purple-400">🧠</div>
                     <h2 className="text-xl font-bold mb-2 text-white">Neural Trivia</h2>
                     <p className="text-gray-400 text-sm leading-relaxed">
                       AI-generated questions. Competitive ranking system. +50 PTS reward.
                     </p>
                   </div>
                   <div className="mt-6 flex items-center text-xs font-mono text-purple-400 uppercase tracking-widest group-hover:text-purple-300">
                     Initialize <span className="ml-2">→</span>
                   </div>
                 </div>
              </GlassCard>

              {/* Story Card */}
              <GlassCard 
                className="group cursor-pointer hover:-translate-y-2 relative" 
                onClick={() => setCurrentGame(GameType.STORY_MODE)}
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl font-black">A</div>
                 <div className="h-full flex flex-col justify-between relative z-10">
                   <div>
                     <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform text-pink-400">📜</div>
                     <h2 className="text-xl font-bold mb-2 text-white">Story Engine</h2>
                     <p className="text-gray-400 text-sm leading-relaxed">
                       Collaborative narrative generation. Branching paths. +10 PTS per vote.
                     </p>
                   </div>
                   <div className="mt-6 flex items-center text-xs font-mono text-pink-400 uppercase tracking-widest group-hover:text-pink-300">
                     Initialize <span className="ml-2">→</span>
                   </div>
                 </div>
              </GlassCard>

              {/* Poll Card */}
              <GlassCard 
                className="group cursor-pointer hover:-translate-y-2 relative" 
                onClick={() => setCurrentGame(GameType.POLL)}
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl font-black">%</div>
                 <div className="h-full flex flex-col justify-between relative z-10">
                   <div>
                     <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform text-green-400">📊</div>
                     <h2 className="text-xl font-bold mb-2 text-white">Consensus</h2>
                     <p className="text-gray-400 text-sm leading-relaxed">
                       Real-time polling system. Determine the stream's future trajectory.
                     </p>
                   </div>
                   <div className="mt-6 flex items-center text-xs font-mono text-green-400 uppercase tracking-widest group-hover:text-green-300">
                     Initialize <span className="ml-2">→</span>
                   </div>
                 </div>
              </GlassCard>

              {/* Chaos Card */}
              <GlassCard 
                className="group cursor-pointer hover:-translate-y-2 relative" 
                onClick={() => setCurrentGame(GameType.TUG_OF_WAR)}
              >
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-8xl font-black">X</div>
                 <div className="h-full flex flex-col justify-between relative z-10">
                   <div>
                     <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform text-orange-400">⚔️</div>
                     <h2 className="text-xl font-bold mb-2 text-white">Chaos War</h2>
                     <p className="text-gray-400 text-sm leading-relaxed">
                       Binary conflict resolution. Red vs Blue. High-frequency interaction.
                     </p>
                   </div>
                   <div className="mt-6 flex items-center text-xs font-mono text-orange-400 uppercase tracking-widest group-hover:text-orange-300">
                     Initialize <span className="ml-2">→</span>
                   </div>
                 </div>
              </GlassCard>
            </div>
          </div>
        );
    }
  };

  if (!channel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative font-sans text-white overflow-hidden">
        <GridBackground />
        <div className="bg-noise" />
        
        <GlassCard className="p-12 max-w-lg w-full mx-4 border-t-4 border-t-primary">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
              <span className="text-4xl">📡</span>
            </div>
            <NeonText size="lg" className="mb-2">STREAM NEXUS</NeonText>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-500 to-transparent my-4"></div>
            <p className="text-gray-400 font-light">Secure connection to Twitch IRC required.</p>
          </div>
          <form onSubmit={handleConnect} className="space-y-6">
            <div className="relative">
              <label className="block text-xs font-mono text-primary mb-2 uppercase tracking-wider">Target Channel</label>
              <input
                type="text"
                value={inputChannel}
                onChange={(e) => setInputChannel(e.target.value)}
                placeholder="ninja"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
              />
              <div className="absolute right-4 top-[42px] flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              </div>
            </div>
            <GlassButton type="submit" className="w-full py-4 text-lg">
              ESTABLISH UPLINK
            </GlassButton>
          </form>
        </GlassCard>
        
        <div className="absolute bottom-6 text-xs text-gray-600 font-mono">
          SYSTEM VERSION 2.0.4 // READY
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex font-sans text-white relative overflow-hidden bg-background">
      <GridBackground />
      <div className="bg-noise" />
      <SmileRain trigger={smileTrigger} />
      
      {/* Main Interface */}
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-white/5 flex items-center px-6 bg-[#030712]/50 backdrop-blur-md justify-between shrink-0">
          <div className="flex items-center space-x-4">
             <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-primary/20">
               SN
             </div>
             <span className="font-mono font-bold text-gray-200 tracking-wider">NEXUS_OS</span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-gray-500">
               <span>CPU: 12%</span>
               <span>MEM: 430MB</span>
            </div>
            
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded bg-black/40 border ${isConnected ? 'border-green-500/30' : 'border-red-500/30'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className={`text-[10px] font-mono uppercase tracking-wider ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
                {isConnected ? `CONNECTED: ${channel}` : 'OFFLINE'}
              </span>
            </div>
            
            <button onClick={() => setChannel('')} className="text-xs text-gray-400 hover:text-white transition-colors uppercase font-mono tracking-widest hover:underline">
              Disconnect
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-6 w-full relative">
          {renderGame()}
        </div>
      </main>

      {/* Right Sidebar */}
      <aside className="w-80 border-l border-white/5 bg-[#030712]/80 backdrop-blur-xl hidden lg:flex flex-col z-20 h-screen shadow-2xl">
        <div className="h-1/3 border-b border-white/5 relative">
            <Leaderboard stats={viewerStats} />
        </div>
        <div className="h-2/3 relative">
            <ChatFeed messages={messages} stats={viewerStats} />
        </div>
      </aside>
    </div>
  );
}

export default App;