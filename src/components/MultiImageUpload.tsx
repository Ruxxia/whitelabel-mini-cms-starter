import { useState } from "react";
import { uploadImage } from "@/lib/storage";
import { toast } from "sonner";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

export function MultiImageUpload({
  values = [],
  onChange,
  bucket = "products",
  max = 5,
}: {
  values?: string[];
  onChange: (urls: string[]) => void;
  bucket?: "media" | "products" | "gallery" | "blog";
  max?: number;
}) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIndex(index);
    try {
      const url = await uploadImage(bucket, file);
      const newValues = [...values];
      newValues[index] = url;
      // Filter out empty entries to keep the array packed
      onChange(newValues.filter(Boolean));
      toast.success("Gambar berhasil diunggah");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload gagal";
      toast.error(msg);
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleDelete = (index: number) => {
    const newValues = values.filter((_, i) => i !== index);
    onChange(newValues);
    toast.success("Gambar dihapus dari galeri");
  };

  // Render a fixed set of slots up to `max`
  const slots = Array.from({ length: max }, (_, i) => i);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-5">
        {/* Cover / Primary Image Slot (Takes more space on larger displays) */}
        <div className="sm:col-span-2 relative aspect-square rounded-2xl overflow-hidden border-2 border-dashed border-border bg-muted/30 group flex flex-col items-center justify-center transition-all hover:bg-muted/50">
          {values[0] ? (
            <>
              <img src={values[0]} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(0)}
                  className="bg-destructive text-destructive-foreground p-2 rounded-full hover:scale-110 transition duration-150 shadow-lg"
                  title="Hapus Gambar Utama"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-semibold px-2.5 py-1 rounded-full shadow-md backdrop-blur">
                Gambar Utama
              </div>
            </>
          ) : (
            <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4 text-center">
              {uploadingIndex === 0 ? (
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              ) : (
                <>
                  <ImageIcon className="h-8 w-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                  <span className="text-sm font-semibold">Pilih Gambar Utama</span>
                  <span className="text-xs text-muted-foreground mt-1">Cover produk (Wajib)</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingIndex !== null}
                onChange={(e) => handleUpload(e, 0)}
              />
            </label>
          )}
        </div>

        {/* Gallery Image Slots (4 Slots) */}
        <div className="sm:col-span-3 grid grid-cols-2 gap-4">
          {slots.slice(1).map((index) => {
            const isSelectable = !!values[index - 1] || !!values[index]; // Can only upload if the previous slot exists
            const hasImage = !!values[index];

            return (
              <div
                key={index}
                className={`relative aspect-square rounded-xl overflow-hidden border border-dashed bg-muted/10 group flex flex-col items-center justify-center transition-all ${
                  hasImage ? "border-border" : "border-border/60 hover:bg-muted/30"
                } ${!isSelectable && !hasImage ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {hasImage ? (
                  <>
                    <img src={values[index]} alt={`Gallery ${index}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleDelete(index)}
                        className="bg-destructive text-destructive-foreground p-1.5 rounded-full hover:scale-110 transition duration-150 shadow"
                        title={`Hapus Gambar ${index}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="absolute bottom-2 left-2 bg-background/80 text-foreground text-[10px] px-1.5 py-0.5 rounded shadow backdrop-blur">
                      Galeri {index}
                    </div>
                  </>
                ) : (
                  <label
                    className={`w-full h-full flex flex-col items-center justify-center p-3 text-center ${
                      isSelectable && uploadingIndex === null ? "cursor-pointer" : "cursor-not-allowed"
                    }`}
                  >
                    {uploadingIndex === index ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted-foreground mb-1 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-medium">Unggah Galeri {index}</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={!isSelectable || uploadingIndex !== null}
                      onChange={(e) => handleUpload(e, index)}
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground italic">
        * Anda dapat menambahkan hingga maksimal 5 gambar (1 gambar utama + 4 galeri). Silakan isi gambar utama terlebih dahulu untuk mengaktifkan slot galeri lainnya.
      </p>
    </div>
  );
}
