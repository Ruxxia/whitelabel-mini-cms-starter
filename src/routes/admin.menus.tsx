import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ChevronUp, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/admin/menus")({ component: AdminMenus });

function AdminMenus() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin_menus"],
    queryFn: async () => {
      const { data, error } = await supabase.from("menus").select("*").order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin_menus"] });
    qc.invalidateQueries({ queryKey: ["menus", "header"] });
    qc.invalidateQueries({ queryKey: ["menus", "footer"] });
  };

  const move = async (id: string, dir: -1 | 1) => {
    if (!data) return;
    const idx = data.findIndex((m: any) => m.id === id);
    const swap = data[idx + dir];
    if (!swap) return;
    const a = data[idx];
    await supabase.from("menus").update({ sort_order: (swap as any).sort_order }).eq("id", a.id);
    await supabase.from("menus").update({ sort_order: (a as any).sort_order }).eq("id", swap.id);
    invalidate();
  };

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold">Navigation Menu</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Adjust the menu order. Adding/deleting pages is done in the <span className="font-medium">Pages</span> section.
      </p>
      <ul className="mt-6 rounded-2xl border border-border bg-card divide-y divide-border">
        {data?.map((m: any, i: number) => (
          <li key={m.id} className="flex items-center justify-between p-3">
            <div>
              <p className="font-medium">{m.label}</p>
              <p className="text-sm text-muted-foreground">{m.url} · {m.location}</p>
            </div>
            <div className="flex items-center gap-1">
              <button disabled={i === 0} onClick={() => move(m.id, -1)} className="p-2 rounded hover:bg-muted disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
              <button disabled={i === (data.length - 1)} onClick={() => move(m.id, 1)} className="p-2 rounded hover:bg-muted disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
            </div>
          </li>
        ))}
        {data && data.length === 0 && (
          <li className="p-6 text-center text-sm text-muted-foreground">No menus yet. Add them from Pages.</li>
        )}
      </ul>
    </AdminLayout>
  );
}