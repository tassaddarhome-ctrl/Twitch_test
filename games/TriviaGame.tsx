import React, { useState, useEffect } from 'react';
import { ChatMessage, TriviaQuestion } from '../types';
import { generateTriviaQuestion } from '../services/geminiService';
import { GlassButton, GlassCard, NeonText } from '../components/GlassUI';

interface TriviaGameProps {
  messages: ChatMessage[];
  onExit: () => void;
  onReward: (username: string, amount: number) => void;
}

const TriviaGame: React.FC<TriviaGameProps> = ({ messages, onExit, onReward }) => {
  const [question, setQuestion] = useState<TriviaQuestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(20);
  const [phase, setPhase] = useState<'IDLE' | 'PLAYING' | 'REVEAL'>('IDLE');
  
  // Store user votes: Map<Username, OptionIndex>
  const [userVotes, setUserVotes] = useState<Map<string, number>>(new Map());

  // Calculate aggregate votes for UI
  const voteCounts = [0, 0, 0, 0];
  userVotes.forEach((voteIndex) => {
    if (voteCounts[voteIndex] !== undefined) voteCounts[voteIndex]++;
  });

  // Process new messages
  useEffect(() => {
    if (phase !== 'PLAYING') return;

    const relevantMsg = messages[messages.length - 1];
    if (!relevantMsg) return;
    
    const content = relevantMsg.message.trim().toLowerCase();
    let voteIndex = -1;

    if (['1', 'a', 'а', 'ф'].includes(content)) voteIndex = 0;
    else if (['2', 'b', 'в', 'и'].includes(content)) voteIndex = 1;
    else if (['3', 'c', 'с'].includes(content)) voteIndex = 2;
    else if (['4', 'd', 'д', 'в'].includes(content)) voteIndex = 3;

    if (voteIndex !== -1) {
       // Using function update to ensure we don't miss updates in fast chat
       setUserVotes(prev => new Map(prev).set(relevantMsg.username, voteIndex));
    }
  }, [messages, phase]);

  // Timer Logic & Reward Distribution
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          // Time is up, move to REVEAL and distribute rewards
          clearInterval(interval);
          setPhase('REVEAL');
          distributeRewards();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  const distributeRewards = () => {
    if (!question) return;
    
    userVotes.forEach((voteIndex, username) => {
      // Participation reward
      let reward = 10;
      
      // Correct answer bonus
      if (voteIndex === question.correctAnswerIndex) {
        reward += 50;
      }
      
      onReward(username, reward);
    });
  };

  const startGame = async () => {
    setLoading(true);
    setPhase('IDLE');
    setUserVotes(new Map());
    
    const newQuestion = await generateTriviaQuestion();
    if (newQuestion) {
      setQuestion(newQuestion);
      setTimer(20);
      setPhase('PLAYING');
    }
    setLoading(false);
  };

  const getBarHeight = (count: number) => {
    const total = userVotes.size;
    if (total === 0) return '0%';
    return `${(count / total) * 100}%`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 space-y-6">
       <div className="w-full max-w-4xl flex justify-between items-center mb-4">
          <GlassButton variant="secondary" onClick={onExit}>← Назад</GlassButton>
          <div className="text-xl font-bold text-purple-300">Викторина AI</div>
       </div>

      {!question && !loading && (
        <div className="text-center space-y-4">
          <NeonText className="text-5xl md:text-7xl mb-8">AI TRIVIA</NeonText>
          <p className="text-xl text-blue-200 mb-8 max-w-lg mx-auto">
            Отвечайте правильно и зарабатывайте очки! Введите 1, 2, 3 или 4.
          </p>
          <GlassButton onClick={startGame} className="text-xl px-12 py-4">
            Начать Раунд
          </GlassButton>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center animate-pulse">
           <div className="w-16 h-16 border-4 border-t-purple-500 border-white/20 rounded-full animate-spin mb-4"></div>
           <p className="text-lg">AI генерирует вопрос...</p>
        </div>
      )}

      {question && !loading && (
        <GlassCard className="w-full max-w-4xl p-8 flex flex-col relative">
          
          {/* Header & Timer */}
          <div className="flex justify-between items-start mb-8">
            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
              question.difficulty === 'Hard' ? 'bg-red-500/50' : question.difficulty === 'Medium' ? 'bg-yellow-500/50' : 'bg-green-500/50'
            }`}>
              {question.difficulty}
            </span>
            <div className={`text-4xl font-mono font-bold shadow-purple-500 drop-shadow-lg ${timer < 5 ? 'text-red-500 animate-pulse-fast' : 'text-white'}`}>
              {timer}с
            </div>
          </div>

          {/* Question */}
          <h2 className="text-3xl font-bold text-center mb-10 leading-tight">
            {question.question}
          </h2>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {question.options.map((opt, idx) => {
              const isCorrect = idx === question.correctAnswerIndex;
              const showResult = phase === 'REVEAL';
              
              let cardClass = "p-4 rounded-xl border-2 transition-all flex justify-between items-center relative overflow-hidden group";
              
              if (showResult) {
                if (isCorrect) cardClass += " border-green-400 bg-green-500/20";
                else if (voteCounts[idx] > 0) cardClass += " border-red-400/30 opacity-50";
                else cardClass += " border-white/5 opacity-30";
              } else {
                 cardClass += " border-white/10 hover:border-purple-400/50 bg-white/5";
              }

              return (
                <div key={idx} className={cardClass}>
                   {/* Background Vote Bar */}
                   <div 
                      className="absolute left-0 top-0 bottom-0 bg-white/10 transition-all duration-500 z-0" 
                      style={{ width: getBarHeight(voteCounts[idx]) }} 
                   />

                   <div className="relative z-10 flex items-center w-full">
                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold mr-4 shrink-0">
                       {idx + 1}
                     </div>
                     <span className="text-lg font-medium">{opt}</span>
                   </div>
                   
                   <span className="relative z-10 text-sm font-mono text-purple-200">
                     {voteCounts[idx]}
                   </span>
                </div>
              );
            })}
          </div>

          {/* Footer Controls */}
          {phase === 'REVEAL' && (
             <div className="flex flex-col items-center mt-4 animate-fade-in">
                <div className="mb-4 text-green-300 font-bold">
                  Правильный ответ: {question.options[question.correctAnswerIndex]}
                </div>
                <GlassButton onClick={startGame}>Следующий вопрос</GlassButton>
             </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default TriviaGame;