import React, { useState, useEffect, useMemo } from 'react';
import { ChatMessage } from '../types';
import { GlassButton, GlassCard, NeonText } from '../components/GlassUI';

interface PollGameProps {
  messages: ChatMessage[];
  onExit: () => void;
  onReward: (username: string, amount: number) => void;
}

const PollGame: React.FC<PollGameProps> = ({ messages, onExit, onReward }) => {
  const [question, setQuestion] = useState('');
  const [optionsStr, setOptionsStr] = useState('Да, Нет');
  const [isActive, setIsActive] = useState(false);
  const [options, setOptions] = useState<string[]>([]);
  
  // Map username -> optionIndex
  const [votes, setVotes] = useState<Map<string, number>>(new Map());

  const voteCounts = useMemo(() => {
    const counts = new Array(options.length).fill(0);
    votes.forEach((optionIndex) => {
      if (counts[optionIndex] !== undefined) {
        counts[optionIndex]++;
      }
    });
    return counts;
  }, [votes, options]);

  const totalVotes = votes.size;

  useEffect(() => {
    if (!isActive) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    const content = lastMsg.message.trim();
    const index = parseInt(content) - 1;

    if (!isNaN(index) && index >= 0 && index < options.length) {
      if (!votes.has(lastMsg.username)) {
        // First time voting in this poll -> Reward
        onReward(lastMsg.username, 10);
      }
      setVotes(prev => new Map(prev).set(lastMsg.username, index));
    }
  }, [messages, isActive, options.length, votes, onReward]);

  const startPoll = () => {
    if (!question.trim()) return;
    const opts = optionsStr.split(',').map(s => s.trim()).filter(s => s);
    if (opts.length < 2) return;
    
    setOptions(opts);
    setVotes(new Map());
    setIsActive(true);
  };

  const stopPoll = () => {
    setIsActive(false);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 w-full max-w-4xl mx-auto">
      <div className="w-full flex justify-between items-center mb-6">
        <GlassButton variant="secondary" onClick={onExit}>← Меню</GlassButton>
        <NeonText className="text-2xl">Голосование</NeonText>
      </div>

      {!isActive && votes.size === 0 ? (
        <GlassCard className="p-8 w-full max-w-lg">
          <h2 className="text-xl font-bold mb-4">Создать Голосование</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Вопрос</label>
              <input 
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="Во что поиграем дальше?"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Варианты (через запятую)</label>
              <input 
                value={optionsStr}
                onChange={e => setOptionsStr(e.target.value)}
                placeholder="Minecraft, Valorant, Dota 2"
                className="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
            <GlassButton onClick={startPoll} className="w-full mt-4">Запустить Голосование</GlassButton>
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-8 w-full flex flex-col items-center">
           <h2 className="text-3xl font-bold mb-8 text-center">{question}</h2>
           
           <div className="grid gap-4 w-full mb-8">
             {options.map((opt, idx) => {
               const count = voteCounts[idx];
               const percent = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
               const isLeading = Math.max(...voteCounts) === count && count > 0;

               return (
                 <div key={idx} className={`relative h-16 rounded-xl border-2 overflow-hidden flex items-center px-4 transition-all ${isLeading ? 'border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.3)]' : 'border-white/10 bg-white/5'}`}>
                    <div 
                      className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ease-out opacity-20 ${isLeading ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${percent}%` }}
                    />
                    <div className="relative z-10 flex w-full justify-between items-center">
                      <div className="flex items-center">
                        <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold mr-3">{idx + 1}</span>
                        <span className="text-lg font-medium">{opt}</span>
                      </div>
                      <div className="text-right">
                         <div className="text-xl font-bold font-mono">{count}</div>
                         <div className="text-xs text-gray-400">{Math.round(percent)}%</div>
                      </div>
                    </div>
                 </div>
               );
             })}
           </div>

           <div className="flex gap-4">
             {isActive ? (
                <GlassButton variant="danger" onClick={stopPoll}>Остановить Голосование</GlassButton>
             ) : (
                <GlassButton onClick={() => { setVotes(new Map()); setIsActive(false); }}>Новое Голосование</GlassButton>
             )}
           </div>

           <div className="mt-6 text-sm text-gray-400">
             Чат: пишите <span className="font-mono text-white">1</span>, <span className="font-mono text-white">2</span>... чтобы проголосовать
           </div>
        </GlassCard>
      )}
    </div>
  );
};

export default PollGame;