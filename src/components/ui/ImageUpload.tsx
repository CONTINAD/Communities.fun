"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, Loader2 } from "lucide-react";

interface ImageUploadProps {
  name: string;
  label: string;
  currentImage?: string | null;
  shape?: "square" | "circle" | "banner";
  className?: string;
}

export default function ImageUpload({
  name,
  label,
  currentImage,
  shape = "square",
  className = "",
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [uploadedUrl, setUploadedUrl] = useState<string>(currentImage || "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setPreview(currentImage || null);
        setUploadedUrl(currentImage || "");
        return;
      }

      setUploadedUrl(data.url);
    } catch {
      setError("Upload failed. Try again.");
      setPreview(currentImage || null);
      setUploadedUrl(currentImage || "");
    } finally {
      setUploading(false);
    }
  }

  function removeImage() {
    setPreview(null);
    setUploadedUrl("");
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const shapeClasses = {
    square: "w-24 h-24 rounded-xl",
    circle: "w-24 h-24 rounded-full",
    banner: "w-full h-32 rounded-xl",
  };

  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-medium text-text-primary">
        {label}
      </label>

      {/* Hidden input for form submission */}
      <input type="hidden" name={name} value={uploadedUrl} />

      <div className="flex items-center gap-4">
        {/* Preview / Upload zone */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`${shapeClasses[shape]} relative overflow-hidden border-2 border-dashed border-border-primary bg-bg-secondary cursor-pointer hover:border-accent transition-colors flex items-center justify-center group`}
        >
          {preview ? (
            <>
              <Image
                src={preview}
                alt={label}
                fill
                className="object-cover"
              />
              {uploading && (
                <div className="absolute inset-0 bg-bg-primary/70 flex items-center justify-center">
                  <Loader2 size={24} className="animate-spin text-accent" />
                </div>
              )}
            </>
          ) : (
            <div className="text-center p-2">
              <Upload
                size={20}
                className="mx-auto text-text-secondary group-hover:text-accent transition-colors"
              />
              <span className="text-[11px] text-text-secondary mt-1 block">
                Upload
              </span>
            </div>
          )}
        </div>

        {/* Remove button */}
        {preview && !uploading && (
          <button
            type="button"
            onClick={removeImage}
            className="text-text-secondary hover:text-danger transition-colors p-1"
          >
            <X size={18} />
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-danger text-xs mt-2">{error}</p>
      )}
    </div>
  );
}
