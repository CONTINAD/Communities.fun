"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <p className="text-gray-400">{error.message}</p>
        <button
          onClick={reset}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-2 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
