"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-5xl font-bold text-slate-300">Oops</p>
      <h1 className="mt-4 text-xl font-semibold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-sm text-slate-600">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-primary px-5 py-2.5 font-medium text-white"
      >
        Try again
      </button>
    </div>
  );
}
