"use client";

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
      <p className="text-gray-400 mb-4 text-center">{error.message}</p>
      <button
        onClick={reset}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-full px-6 py-2 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
