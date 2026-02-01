"use client";

interface LoadingSpinnerProps {
  message?: string;
  className?: string;
  sizeClassName?: string;
}

export function LoadingSpinner({
  message = "Loading...",
  className = "min-h-screen flex items-center justify-center bg-gray-50",
  sizeClassName = "h-12 w-12",
}: LoadingSpinnerProps) {
  return (
    <div className={className}>
      <div className="text-center">
        <div className={`animate-spin rounded-full border-b-2 border-blue-600 mx-auto ${sizeClassName}`} />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
