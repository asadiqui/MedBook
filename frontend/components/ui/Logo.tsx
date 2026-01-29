"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
  variant?: "default" | "admin";
  textColor?: string;
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-7 w-7",
  lg: "h-8 w-8",
};

const containerSizes = {
  sm: "p-2",
  md: "p-2.5",
  lg: "p-3",
};

const textSizes = {
  sm: "text-xl",
  md: "text-2xl",
  lg: "text-3xl",
};

export function Logo({ size = "md", showText = true, className = "", variant = "default", textColor }: LogoProps) {
  const isAdmin = variant === "admin";
  
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {isAdmin ? (
        // Admin shield logo - unique design
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg shadow-blue-500/30">
          <svg className={`${sizeClasses[size]} text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" opacity="0.2"/>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        </div>
      ) : (
        // Main logo - square with medical plus
        <div className={`bg-white ${containerSizes[size]} rounded-lg shadow-sm border border-gray-200`}>
          <svg className={`${sizeClasses[size]} text-blue-600`} viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="1" />
            <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
      )}
      {showText && (
        <span className={`${textSizes[size]} font-bold ${textColor || (isAdmin ? 'text-white' : 'text-gray-900')}`}>
          {isAdmin ? 'Sa7ti Admin' : 'Sa7ti'}
        </span>
      )}
    </div>
  );
}

export default Logo;
