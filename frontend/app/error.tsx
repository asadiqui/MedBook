"use client";

export const dynamic = "force-dynamic";

export default function Error() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
      <p className="text-gray-600">Please try again later.</p>
    </div>
  );
}
