"use client";

interface DecorativeBackgroundProps {
  variant?: "default" | "auth" | "profile";
  className?: string;
}

export function DecorativeBackground({ variant = "default", className = "" }: DecorativeBackgroundProps) {
  if (variant === "auth") {
    return (
      <div className={`absolute inset-0 opacity-30 ${className}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-100 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      </div>
    );
  }

  if (variant === "profile") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none lg:hidden ${className}`}>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30"></div>
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 opacity-30 pointer-events-none ${className}`}>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-100 rounded-full blur-3xl"></div>
    </div>
  );
}

export default DecorativeBackground;
