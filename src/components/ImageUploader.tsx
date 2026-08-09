"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploaderProps {
  maxFiles?: number;
  onUploadSuccess: (urls: string[]) => void;
  label?: string;
}

export default function ImageUploader({ maxFiles = 1, onUploadSuccess, label = "Upload Foto" }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previews, setPreviews] = useState<{url: string, file: File}[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (uploadedUrls.length + files.length > maxFiles) {
      setError(`Maksimal ${maxFiles} foto diperbolehkan.`);
      return;
    }

    setError(null);
    setIsUploading(true);

    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file
    }));
    setPreviews(prev => [...prev, ...newPreviews]);

    const newUrls: string[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Gagal upload");
        }

        const data = await res.json();
        newUrls.push(data.url);
      } catch (err: any) {
        setError(err.message || "Gagal mengunggah foto.");
        // Remove preview if failed
        setPreviews(prev => prev.filter(p => p.file !== file));
      }
    }

    if (newUrls.length > 0) {
      const allUrls = [...uploadedUrls, ...newUrls];
      setUploadedUrls(allUrls);
      onUploadSuccess(allUrls);
    }
    
    setIsUploading(false);
  };

  const removeImage = (indexToRemove: number) => {
    const newUrls = uploadedUrls.filter((_, idx) => idx !== indexToRemove);
    setUploadedUrls(newUrls);
    setPreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    onUploadSuccess(newUrls);
  };

  return (
    <div className="w-full">
      <div className="mb-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {previews.map((preview, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-secondary border group">
            <Image src={preview.url} alt={`Preview ${idx}`} fill className="object-cover" />
            <button 
              type="button"
              onClick={() => removeImage(idx)}
              className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {uploadedUrls.length < maxFiles && (
          <label className="aspect-square rounded-xl border-2 border-dashed border-border/60 bg-secondary/30 hover:bg-secondary/60 flex flex-col items-center justify-center cursor-pointer transition-colors text-muted-foreground hover:text-primary">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin mb-2" />
            ) : (
              <Upload className="w-6 h-6 mb-2" />
            )}
            <span className="text-xs font-medium px-2 text-center">
              {isUploading ? "Mengunggah..." : "Tambah Foto"}
            </span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/jpeg,image/png,image/webp" 
              multiple={maxFiles > 1}
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Format: JPG, PNG, WEBP. Maksimal {maxFiles} foto (Maks 5MB/foto).
      </p>
    </div>
  );
}
