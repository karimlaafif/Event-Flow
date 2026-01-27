import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = false, className }) => {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('font-bold relative', sizeClasses[size])}>
        <span
          className="bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 50%, #9333ea 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontFamily: 'Orbitron, sans-serif',
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          TE
        </span>
      </div>
      {showText && (
        <div className={cn('flex flex-col', textSizeClasses[size])}>
          <span className="font-bold text-foreground leading-tight">Event</span>
          <span className="text-muted-foreground text-xs leading-tight">Flow</span>
        </div>
      )}
    </div>
  );
};

export default Logo;

