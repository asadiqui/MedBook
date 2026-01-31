interface LoaderProps{
    text ?: string;
}

export default function Loader({ text = "Loading..." }: LoaderProps) {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
        <span className="text-gray-600 text-sm">{text}</span>
      </div>
    </div>
  );
}
