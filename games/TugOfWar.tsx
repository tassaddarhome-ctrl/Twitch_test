import React, { useState, useEffect } from 'react';
import { ChatMessage } from '../types';
import { GlassButton, GlassCard, NeonText } from '../components/GlassUI';

interface TugOfWarProps {
  messages: ChatMessage[];
  onExit: () => void;
}

const TugOfWar: React.FC<TugOfWarProps> = ({ messages, onExit }) => {
  const [balance, setBalance] = useState(50); // 0 = Blue Win, 100 = Red Win
  const [winner, setWinner] = useState<'RED' | 'BLUE' | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || winner) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    const txt = lastMsg.message.toLowerCase().trim();
    
    // Very simple logic: !red pushes up, !blue pushes down
    // Small random variance to make it feel organic
    const power = 1.5; 

    if (txt.includes('!red') || txt.includes('!красные')) {
      setBalance(prev => Math.min(prev + power, 100));
    } else if (txt.includes('!blue') || txt.includes('!синие')) {
      setBalance(prev => Math.max(prev - power, 0));
    }
  }, [messages, isActive, winner]);

  useEffect(() => {
    if (balance >= 100) {
      setWinner('RED');
      setIsActive(false);
    } else if (balance <= 0) {
      setWinner('BLUE');
      setIsActive(false);
    }
  }, [balance]);

  const resetGame = () => {
    setBalance(50);
    setWinner(null);
    setIsActive(true);
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 w-full">
      <div className="absolute top-6 left-6 z-50">
          <GlassButton variant="secondary" onClick={onExit}>← Выход</GlassButton>
      </div>

      <NeonText className="text-4xl md:text-6xl mb-4 tracking-widest">CHAOS BATTLE</NeonText>
      <p className="text-white/70 mb-12 text-lg">Пишите <span className="text-red-400 font-bold">!red</span> или <span className="text-blue-400 font-bold">!blue</span> в чат!</p>

      {/* Battle Bar */}
      <div className="relative w-full max-w-4xl h-24 bg-gray-800 rounded-full overflow-hidden border-4 border-white/20 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        
        {/* Blue Side */}
        <div 
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-900 via-blue-600 to-cyan-400 transition-all duration-100 ease-out"
          style={{ width: `${balance}%` }}
        />
        
        {/* Red Side (Visualized by remaining space/background if we did logic differently, but let's layer Red on top right for dual color effect) */}
        {/* Actually, simpler: Blue fills from left. The rest is Red background. */}
        <div className="absolute inset-0 bg-gradient-to-l from-red-900 via-red-600 to-orange-400 -z-10"></div>

        {/* Center Marker */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/50 transform -translate-x-1/2 z-20"></div>

        {/* Character/Icon on the seam */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full shadow-lg z-30 flex items-center justify-center text-2xl border-4 border-gray-900 transition-all duration-100 ease-out"
          style={{ left: `${balance}%`, transform: 'translate(-50%, -50%)' }}
        >
          ⚔️
        </div>
      </div>

      <div className="flex w-full max-w-4xl justify-between mt-4 text-2xl font-bold uppercase font-mono">
        <span className="text-blue-400 drop-shadow-lg">Синие Team ({Math.round(100 - balance)}%)</span>
        <span className="text-red-400 drop-shadow-lg">Красные Team ({Math.round(balance)}%)</span>
      </div>

      {winner && (
        <GlassCard className="mt-12 p-8 text-center animate-blob">
           <h2 className={`text-5xl font-extrabold mb-4 ${winner === 'RED' ? 'text-red-500' : 'text-blue-500'}`}>
             {winner === 'RED' ? 'КРАСНЫЕ' : 'СИНИЕ'} ПОБЕДИЛИ!
           </h2>
           <GlassButton onClick={resetGame} className="mt-4">Реванш</GlassButton>
        </GlassCard>
      )}

      {!isActive && !winner && (
        <GlassButton onClick={resetGame} className="mt-12 text-xl px-12 py-6">
          СТАРТ
        </GlassButton>
      )}
    </div>
  );
};

export default TugOfWar;