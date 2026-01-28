import React, { useState, useEffect } from 'react';
import { ChatMessage, StorySegment } from '../types';
import { generateStoryStart, generateStoryContinuation } from '../services/geminiService';
import { GlassButton, GlassCard, NeonText } from '../components/GlassUI';

interface StoryModeProps {
  messages: ChatMessage[];
  onExit: () => void;
  onReward: (username: string, amount: number) => void;
}

const StoryMode: React.FC<StoryModeProps> = ({ messages, onExit, onReward }) => {
  const [history, setHistory] = useState<StorySegment[]>([]);
  const [loading, setLoading] = useState(false);
  const [votingOpen, setVotingOpen] = useState(false);
  
  // Track individual votes: Map<Username, 'A' | 'B'>
  const [userVotes, setUserVotes] = useState<Map<string, 'A' | 'B'>>(new Map());
  
  const [timeLeft, setTimeLeft] = useState(0);

  // Derived vote counts
  const votes = { A: 0, B: 0 };
  userVotes.forEach((vote) => {
    votes[vote]++;
  });

  // Voting Logic
  useEffect(() => {
    if (!votingOpen) return;
    
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    const txt = lastMsg.message.trim().toLowerCase();
    
    if (txt === 'a' || txt === 'а' || txt.includes('option a')) {
        setUserVotes(prev => new Map(prev).set(lastMsg.username, 'A'));
    } else if (txt === 'b' || txt === 'б' || txt.includes('option b')) {
        setUserVotes(prev => new Map(prev).set(lastMsg.username, 'B'));
    }
  }, [messages, votingOpen]);

  // Timer for voting
  useEffect(() => {
    if (!votingOpen || timeLeft <= 0) {
        if (votingOpen && timeLeft <= 0) {
            finishVoting();
        }
        return;
    }
    
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [votingOpen, timeLeft]);

  const initStory = async () => {
    setLoading(true);
    const segment = await generateStoryStart();
    if (segment) {
        setHistory([segment]);
        startVoting();
    }
    setLoading(false);
  };

  const startVoting = () => {
      setUserVotes(new Map());
      setTimeLeft(25);
      setVotingOpen(true);
  };

  const finishVoting = async () => {
      setVotingOpen(false);
      
      // Distribute rewards for participation
      userVotes.forEach((_, username) => {
          onReward(username, 10);
      });

      const winner = votes.A >= votes.B ? 'Option A' : 'Option B';
      const lastSegment = history[history.length - 1];
      const winningText = votes.A >= votes.B ? lastSegment.optionA : lastSegment.optionB;
      
      setLoading(true);
      const nextSegment = await generateStoryContinuation(lastSegment.text, winningText);
      if (nextSegment) {
          setHistory(prev => [...prev, nextSegment]);
          startVoting(); // Loop
      }
      setLoading(false);
  };

  const currentSegment = history[history.length - 1];

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto w-full">
       <div className="flex justify-between items-center mb-6">
          <GlassButton variant="secondary" onClick={onExit}>← Меню</GlassButton>
          <NeonText className="text-2xl">Интерактивная История</NeonText>
       </div>

       {!currentSegment && !loading && (
           <div className="flex-1 flex flex-col items-center justify-center">
               <h2 className="text-4xl font-bold mb-6 text-center">Создайте историю вместе</h2>
               <p className="text-gray-300 mb-8 max-w-lg text-center">
                   AI начнет рассказ, а чат будет выбирать повороты сюжета. 
                   <br/>
                   <span className="text-yellow-400">Получайте очки за каждое голосование!</span>
               </p>
               <GlassButton onClick={initStory} className="text-lg px-8 py-4">Начать Историю</GlassButton>
           </div>
       )}

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 mb-6 pr-2">
            {history.map((seg, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-l-4 border-purple-500 bg-white/5 animate-fade-in`}>
                    <p className="text-lg leading-relaxed text-gray-100">{seg.text}</p>
                </div>
            ))}
            {loading && (
                <div className="flex items-center space-x-2 text-purple-300 p-4">
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-150"></span>
                    <span>Пишем продолжение...</span>
                </div>
            )}
        </div>

       {currentSegment && !loading && (
           <GlassCard className="p-6 shrink-0">
               <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold uppercase text-gray-400">Голосование чата</h3>
                   {votingOpen ? (
                       <span className="text-2xl font-mono font-bold text-yellow-400 animate-pulse">{timeLeft}s</span>
                   ) : (
                       <span className="text-green-400 font-bold">Выбрано!</span>
                   )}
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className={`p-4 border rounded-xl relative overflow-hidden transition-colors ${votes.A > votes.B ? 'border-green-500/50 bg-green-500/10' : 'border-white/10'}`}>
                        <div className="absolute left-0 bottom-0 h-1 bg-green-500 transition-all duration-300" style={{ width: `${(votes.A / (votes.A + votes.B || 1)) * 100}%`}}></div>
                        <div className="flex justify-between items-center relative z-10">
                            <span className="font-bold text-xl mr-2 text-purple-300">A</span>
                            <span className="flex-1">{currentSegment.optionA}</span>
                            <span className="font-mono text-xl font-bold ml-2">{votes.A}</span>
                        </div>
                   </div>

                   <div className={`p-4 border rounded-xl relative overflow-hidden transition-colors ${votes.B > votes.A ? 'border-green-500/50 bg-green-500/10' : 'border-white/10'}`}>
                        <div className="absolute left-0 bottom-0 h-1 bg-green-500 transition-all duration-300" style={{ width: `${(votes.B / (votes.A + votes.B || 1)) * 100}%`}}></div>
                        <div className="flex justify-between items-center relative z-10">
                            <span className="font-bold text-xl mr-2 text-purple-300">B</span>
                            <span className="flex-1">{currentSegment.optionB}</span>
                            <span className="font-mono text-xl font-bold ml-2">{votes.B}</span>
                        </div>
                   </div>
               </div>
           </GlassCard>
       )}
    </div>
  );
};

export default StoryMode;