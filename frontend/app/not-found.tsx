import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-3xl font-semibold text-gray-900 mb-2">Page not found</h1>
      <Link href="/" className="text-blue-600 hover:text-blue-700">
        Go home
      </Link>
    </div>
  );
}
