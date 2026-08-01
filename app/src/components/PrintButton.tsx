"use client";

export function PrintButton({ label = "🖨️ Print this trip sheet" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      className="no-print rounded-lg border border-border px-4 py-2 text-sm font-medium hover:border-brand transition"
    >
      {label}
    </button>
  );
}
