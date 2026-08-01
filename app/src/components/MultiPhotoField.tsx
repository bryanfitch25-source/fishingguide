"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { uploadPhoto } from "@/lib/photoUpload";

// Extra photos beyond the primary one (used on both tackle items and catches) — a
// simple gallery rather than a single photo, since one shot rarely tells the whole
// story of a catch or how a piece of gear actually looks.
export function MultiPhotoField({
  folder,
  values,
  onChange,
  label = "More photos",
}: {
  folder: string;
  values: string[];
  onChange: (urls: string[]) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    setUploading(true);
    const supabase = createClient();
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const { url, error: uploadError } = await uploadPhoto(supabase, folder, file);
      if (uploadError) {
        setError(uploadError);
        continue;
      }
      if (url) newUrls.push(url);
    }
    setUploading(false);
    if (newUrls.length) onChange([...values, ...newUrls]);
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {values.map((url, i) => (
          <div key={url} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- user-uploaded photo */}
            <img src={url} alt="" className="h-16 w-16 rounded-lg object-cover border border-border" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute -right-1.5 -top-1.5 rounded-full bg-danger text-white h-5 w-5 text-xs leading-none flex items-center justify-center"
              aria-label="Remove photo"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="h-16 w-16 rounded-lg border border-dashed border-border text-xs text-muted hover:border-brand hover:text-brand transition disabled:opacity-60"
        >
          {uploading ? "…" : "+ Add"}
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
