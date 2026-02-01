"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
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

export function Logo({ size = "md", showText = true, className = "", textColor }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`bg-white ${containerSizes[size]} rounded-lg shadow-sm border border-gray-200`}>
        <svg className={`${sizeClasses[size]} text-blue-600`} viewBox="0 0 24 24" fill="currentColor">
          <rect x="4" y="4" width="16" height="16" rx="1" />
          <path d="M12 8V16M8 12H16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      </div>
      {showText && (
        <span className={`${textSizes[size]} font-bold ${textColor || 'text-gray-900'}`}>MedBook</span>
      )}
    </div>
  );
}

export default Logo;
