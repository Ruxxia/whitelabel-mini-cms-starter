import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/lib/seo";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  useSEO({ title: "Admin Login" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Successfully logged in");
        navigate({ to: "/admin" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Account created. Check email for verification (if required).");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 space-y-4" style={{ boxShadow: "var(--shadow-elegant)" }}>
        <h1 className="text-2xl font-bold">{mode === "signin" ? "Admin Login" : "Register Admin"}</h1>
        <p className="text-sm text-muted-foreground">The first user automatically becomes the admin.</p>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        <button disabled={loading} className="w-full rounded-md bg-primary text-primary-foreground py-2 font-medium disabled:opacity-60">
          {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Register"}
        </button>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-sm text-muted-foreground hover:text-foreground">
          {mode === "signin" ? "Don't have an account? Register" : "Already have an account? Sign In"}
        </button>
      </form>
    </div>
  );
}