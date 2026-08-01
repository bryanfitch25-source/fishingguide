"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { uploadPhoto } from "@/lib/photoUpload";

export function PhotoUploadField({
  folder,
  value,
  onChange,
  label = "Photo",
  onGpsDetected,
}: {
  /** Storage sub-folder under the signed-in user's own prefix, e.g. "tackle" or "catches". */
  folder: string;
  value: string;
  onChange: (url: string) => void;
  label?: string;
  /** Called when the uploaded photo's EXIF data includes GPS coordinates. */
  onGpsDetected?: (lat: number, lng: number) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);

    if (onGpsDetected) {
      try {
        const exifr = await import("exifr");
        const gps = await exifr.gps(file);
        if (gps?.latitude && gps?.longitude) onGpsDetected(gps.latitude, gps.longitude);
      } catch {
        // No/unreadable EXIF data — not an error, just no auto-location this time.
      }
    }

    const supabase = createClient();
    const { url, error: uploadError } = await uploadPhoto(supabase, folder, file);
    setUploading(false);
    if (uploadError) {
      setError(uploadError);
      return;
    }
    if (url) onChange(url);
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {value ? (
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo, arbitrary external storage URL */}
          <img src={value} alt="" className="h-20 w-20 rounded-lg object-cover border border-border" />
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-accent-dark hover:underline text-left"
            >
              Replace photo
            </button>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-danger hover:underline text-left"
            >
              Remove photo
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted hover:border-brand hover:text-brand transition w-full text-left disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "📷 Add a photo"}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
