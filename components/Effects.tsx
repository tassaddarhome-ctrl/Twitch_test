import React, { useEffect, useState } from 'react';

export const GridBackground = () => (
  <div className="fixed inset-0 -z-10 bg-[#030712]">
    {/* Noise Overlay applied in CSS globally */}
    
    {/* Gradient Orb 1 */}
    <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-40 animate-float" />
    
    {/* Gradient Orb 2 */}
    <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent/20 rounded-full blur-[100px] opacity-30 animate-float" style={{ animationDelay: '2s' }} />
    
    {/* Grid Lines */}
    <div 
      className="absolute inset-0" 
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), 
                          linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
      }} 
    />
  </div>
);

interface SmileRainProps {
  trigger: number; // Incrementing this number triggers the effect
}

export const SmileRain: React.FC<SmileRainProps> = ({ trigger }) => {
  const [particles, setParticles] = useState<{id: number, left: number, emoji: string}[]>([]);

  useEffect(() => {
    if (trigger === 0) return;

    // Determine which emoji to spawn based on simple logic or random
    // Using simple smileys for ')' detection
    const emojis = ['😊', '😄', '✨', '🔥', '❤️', ')'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];

    const id = Date.now() + Math.random();
    const left = Math.random() * 90 + 5; // 5% to 95% width

    setParticles(prev => [...prev, { id, left, emoji }]);

    // Cleanup particle after animation
    const timeout = setTimeout(() => {
      setParticles(prev => prev.filter(p => p.id !== id));
    }, 4000);

    return () => clearTimeout(timeout);
  }, [trigger]);

  return (
    <>
      {particles.map(p => (
        <div 
          key={p.id} 
          className="smile-particle"
          style={{ left: `${p.left}%` }}
        >
          {p.emoji}
        </div>
      ))}
    </>
  );
};