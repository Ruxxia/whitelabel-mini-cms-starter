import { useState } from "react";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export function ImageUpload({
  value,
  onChange,
  bucket = "media",
}: {
  value?: string | null;
  onChange: (url: string) => void;
  bucket?: "media" | "products" | "gallery" | "blog";
}) {
  const [uploading, setUploading] = useState(false);
  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImage(bucket, file);
      onChange(url);
      toast.success("Gambar diunggah");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload gagal";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="space-y-2">
      {value && (
        <div className="relative w-32 h-32 rounded-md overflow-hidden border border-border">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 bg-background/80 rounded-full p-1">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <label className="inline-flex items-center gap-2 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted">
        <Upload className="h-4 w-4" />
        {uploading ? "Mengunggah..." : "Pilih gambar"}
        <input type="file" accept="image/*" className="hidden" onChange={handle} disabled={uploading} />
      </label>
    </div>
  );
}