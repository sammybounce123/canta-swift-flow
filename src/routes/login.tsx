import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Lock } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Canta" },
      { name: "description", content: "Sign in to your Canta workspace for cross-border payments." },
      { property: "og:title", content: "Sign in — Canta" },
      { property: "og:description", content: "Sign in to your Canta workspace for cross-border payments." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem("canta_demo_user", JSON.stringify({ email: email || "demo@canta.app" }));
    } catch {}
    toast.success("Signed in");
    navigate({ to: "/welcome" });
  };

  return (
    <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Sign in to Canta</h1>
            <p className="text-sm text-muted-foreground">One login for every workspace</p>
          </div>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">
            Sign in <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/welcome" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            Skip for now — explore the app
          </Link>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Demo mode: any email and password will work.
        </p>
      </div>
    </div>
  );
}
