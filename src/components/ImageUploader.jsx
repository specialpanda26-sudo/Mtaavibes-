"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const MAX_FILE_BYTES = 8 * 1024 * 1024; // 8MB
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const BUCKET = "event-images";

/**
 * Drag/drop (or tap) image uploader backed by the public `event-images`
 * Supabase Storage bucket. Used for an event's poster and its gallery
 * (concert shots, crowd photos, dancefloor moments — whatever gives buyers
 * a real feel for the event before they pay).
 *
 * mode="single"   -> one image, calls onChange(url | null)
 * mode="multiple" -> up to `max` images, calls onChange(urls[])
 */
export default function ImageUploader({
  organizerId,
  mode = "single",
  max = 6,
  value,
  onChange,
  label,
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const urls = mode === "multiple" ? value ?? [] : value ? [value] : [];

  function validate(file) {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Please upload a JPG, PNG, or WEBP image.";
    if (file.size > MAX_FILE_BYTES) return "File is too large (max 8MB).";
    return null;
  }

  async function uploadFiles(fileList) {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;

    if (mode === "single") files.splice(1);
    if (mode === "multiple" && urls.length + files.length > max) {
      setError(`You can upload up to ${max} photos.`);
      files.splice(max - urls.length);
    }

    setError("");
    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const err = validate(file);
        if (err) throw new Error(err);

        const ext = file.name.split(".").pop();
        const path = `${organizerId || "anon"}/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false, contentType: file.type });
        if (uploadErr) throw uploadErr;

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(pub.publicUrl);
      }

      if (mode === "single") {
        onChange?.(uploaded[0] ?? value ?? null);
      } else {
        onChange?.([...urls, ...uploaded]);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      setError(err.message ?? "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  function removeAt(i) {
    if (mode === "single") {
      onChange?.(null);
    } else {
      onChange?.(urls.filter((_, idx) => idx !== i));
    }
  }

  return (
    <div>
      {label && <p className="text-[13px] font-medium mb-2">{label}</p>}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          uploadFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          "glass rounded-2xl border-2 border-dashed p-4 text-center cursor-pointer transition-colors",
          dragOver ? "border-ink/40 bg-black/5" : "border-black/10",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple={mode === "multiple"}
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
        />
        <p className="text-[12px] text-secondary">
          {uploading
            ? "Uploading…"
            : mode === "single"
            ? "Tap or drop a poster image"
            : `Tap or drop photos (${urls.length}/${max}) — concert shots, crowd, dancefloor…`}
        </p>
      </div>

      {error && <p className="text-[11px] text-red-600 mt-2">{error}</p>}

      {urls.length > 0 && (
        <div className={mode === "single" ? "mt-3" : "mt-3 grid grid-cols-3 gap-2"}>
          <AnimatePresence>
            {urls.map((url, i) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                className={[
                  "relative overflow-hidden rounded-xl bg-cover bg-center",
                  mode === "single" ? "h-[140px] w-full" : "aspect-square",
                ].join(" ")}
                style={{ backgroundImage: `url(${url})` }}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeAt(i);
                  }}
                  className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/60 text-white text-[13px] flex items-center justify-center"
                >
                  ×
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
