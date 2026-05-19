import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/ImageUpload";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useConfirm } from "@/components/ConfirmDialog";

export const Route = createFileRoute("/admin/gallery")({ component: AdminGallery });

function AdminGallery() {
  const qc = useQueryClient();
  const confirm = useConfirm();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const { data } = useQuery({
    queryKey: ["admin_gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").order("sort_order");
      if (error) throw error;
      return data;
    },
  });
  const add = async () => {
    if (!imageUrl) return toast.error("Please upload an image first");
    const { error } = await supabase.from("gallery_images").insert({ title, image_url: imageUrl });
    if (error) return toast.error(error.message);
    setTitle(""); setImageUrl("");
    qc.invalidateQueries({ queryKey: ["admin_gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
    toast.success("Added successfully");
  };
  const remove = async (id: string) => {
    if (!(await confirm({ title: "Delete image?", destructive: true, confirmText: "Delete" }))) return;
    await supabase.from("gallery_images").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin_gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  };
  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Gallery</h1>
      <div className="mt-6 rounded-2xl border border-border bg-card p-4 space-y-3">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <ImageUpload bucket="gallery" value={imageUrl} onChange={setImageUrl} />
        <button onClick={add} className="rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium">Add to Gallery</button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.map((img) => (
          <div key={img.id} className="relative rounded-2xl overflow-hidden border border-border bg-card">
            <img src={img.image_url} alt={img.title ?? ""} className="aspect-square w-full object-cover" />
            <button onClick={() => remove(img.id)} className="absolute top-2 right-2 bg-background/90 rounded-full p-1.5 text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}