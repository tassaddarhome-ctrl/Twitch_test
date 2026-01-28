import React from 'react';

// A sophisticated card with a subtle gradient border and noise-ready transparency
export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement> & { 
  children: React.ReactNode; 
  className?: string;
  noPadding?: boolean;
}> = ({ children, className = '', noPadding = false, ...props }) => (
  <div 
    className={`
      relative group bg-[#0f172a]/60 backdrop-blur-xl 
      border border-white/5 rounded-2xl shadow-2xl 
      overflow-hidden transition-all duration-500
      hover:border-white/10 hover:shadow-primary/10
      ${noPadding ? '' : 'p-6'}
      ${className}
    `} 
    {...props}
  >
    {/* Inner subtle glow gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    <div className="relative z-10 h-full">
      {children}
    </div>
  </div>
);

export const GlassButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' 
}> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  ...props 
}) => {
  const baseStyle = "relative px-6 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-white text-black hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)]",
    secondary: "bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:border-white/20",
    danger: "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-300",
    ghost: "bg-transparent hover:bg-white/5 text-gray-400 hover:text-white"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

export const NeonText: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  color?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl'
}> = ({ children, className = '', color = 'text-white', size = 'lg' }) => {
  
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl md:text-5xl',
    xl: 'text-6xl md:text-7xl'
  };

  return (
    <h1 className={`font-bold tracking-tight ${color} ${sizes[size]} ${className}`}>
      {children}
    </h1>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'yellow' }> = ({ children, color = 'blue' }) => {
  const colors = {
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono uppercase tracking-wider border ${colors[color]}`}>
      {children}
    </span>
  );
};