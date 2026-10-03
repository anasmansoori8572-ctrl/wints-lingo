import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'dark', 
  showTagline = false,
  className = '',
  iconOnly = false
}) => {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-9.5 h-9.5 sm:w-10.5 sm:h-10.5',
    lg: 'w-14 h-14 sm:w-16 sm:h-16',
  };

  const textSizes = {
    sm: 'text-[15px] sm:text-lg',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
  };

  const taglineSizes = {
    sm: 'text-[8px] min-[360px]:text-[9px] min-[390px]:text-[9.5px] sm:text-[11px]',
    md: 'text-[10px] sm:text-[11px]',
    lg: 'text-xs sm:text-sm',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 select-none min-w-0 ${className}`}>
      {/* Official Wits Circular Mascot Logo Emblem */}
      <div
        className={`${iconSizes[size]} rounded-full flex items-center justify-center relative overflow-hidden group flex-shrink-0 transition-transform duration-200 hover:scale-105`}
      >
        <img
          src="/logo.svg"
          alt="Wits Lingo Logo"
          className="w-full h-full object-contain rounded-full shadow-md shadow-purple-950/20"
          referrerPolicy="no-referrer"
        />
      </div>

      {!iconOnly && (
        <div className="flex flex-col min-w-0 justify-center">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`${textSizes[size]} font-extrabold tracking-tight font-['Outfit'] uppercase ${
                isLight ? 'text-white' : 'text-[#1E1B26]'
              }`}
            >
              WITS <span className={isLight ? 'text-purple-300' : 'text-[#581C87]'}>LINGO</span>
            </span>
          </div>
          {showTagline && (
            <span
              className={`${taglineSizes[size]} font-medium tracking-tight sm:tracking-wide mt-0.5 whitespace-nowrap leading-tight ${
                isLight ? 'text-purple-200/90' : 'text-slate-500'
              }`}
            >
              A Global Language Platform
            </span>
          )}
        </div>
      )}
    </div>
  );
};
