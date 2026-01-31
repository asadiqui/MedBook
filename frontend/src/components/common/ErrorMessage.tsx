interface ErrorMessageProps {
    message ?: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="p-4 rounded-md bg-red-50 border border-red-200">
      <p className="text-red-700 font-medium">
        {message}
      </p>
    </div>
  );
}