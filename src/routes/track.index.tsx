import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Ship, MessageCircle } from "lucide-react";
import { useState } from "react";
import { shipments } from "@/lib/mock";

export const Route = createFileRoute("/track/")({
  head: () => ({ meta: [{ title: "Track your shipment — Canta" }] }),
  component: TrackIndex,
});

function TrackIndex() {
  const nav = useNavigate();
  const [id, setId] = useState("");
  const examples = shipments.slice(0, 3);

  const go = () => {
    if (!id.trim()) return;
    nav({ to: "/track/$id", params: { id: id.trim() } });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <Link to="/" className="font-bold text-lg">Canta</Link>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-12">
        <Card className="p-8 shadow-card text-center">
          <Ship className="h-10 w-10 text-primary mx-auto" />
          <h1 className="text-2xl font-semibold mt-3">Track your shipment</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your shipment ID or container number.</p>
          <div className="mt-6 flex gap-2">
            <Input value={id} onChange={(e) => setId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder="SHP-10421" className="text-center font-mono" />
            <Button className="bg-primary" onClick={go}>Track</Button>
          </div>
          <div className="mt-6 text-xs text-muted-foreground">
            Try one of these demo IDs:
            <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
              {examples.map((s) => (
                <Link key={s.id} to="/track/$id" params={{ id: s.id }} className="px-2 py-1 rounded-full bg-secondary text-xs font-mono hover:bg-secondary/70">{s.id}</Link>
              ))}
            </div>
          </div>
        </Card>
        <a href="https://wa.me/2348012345566" target="_blank" rel="noreferrer" className="mt-4 block">
          <Card className="p-4 bg-[#25D366] text-white shadow-card flex items-center justify-center gap-2">
            <MessageCircle className="h-4 w-4" /> <span className="text-sm font-semibold">Contact Canta on WhatsApp</span>
          </Card>
        </a>
      </main>
    </div>
  );
}
