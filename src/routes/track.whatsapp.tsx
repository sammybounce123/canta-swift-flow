import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { MessageCircle, ArrowRight } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { toast } from "sonner";

const searchSchema = z.object({
  ref: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
  eta: z.string().optional(),
});

export const Route = createFileRoute("/track/whatsapp")({
  head: () => ({ meta: [{ title: "Track on WhatsApp — Canta" }] }),
  validateSearch: (s) => searchSchema.parse(s),
  component: TrackWhatsAppPage,
});

const INDUSTRIES = [
  "Importer / Trader",
  "Manufacturer",
  "Retail / E-commerce",
  "Freight / Logistics",
  "Agriculture",
  "Automotive",
  "Construction",
  "Electronics",
  "Fashion & Textiles",
  "Food & Beverage",
  "Other",
];

function TrackWhatsAppPage() {
  const nav = useNavigate();
  const { ref, origin, destination, eta } = useSearch({ from: "/track/whatsapp" });
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({
    name: z.string().trim().min(2, "Enter your name").max(100),
    industry: z.string().min(1, "Select an industry"),
    phone: z.string().trim().min(6, "Enter your WhatsApp number").max(30),
    email: z.string().trim().email("Enter a valid email").max(255),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ name, industry, phone, email });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    // Assign a temporary tracking reference and register the lead locally.
    const reference = ref || `CTA-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    try {
      const raw = window.localStorage.getItem("canta:leads");
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({
        source: "whatsapp_track_cta",
        reference,
        createdAt: new Date().toISOString(),
        ...parsed.data,
        consent: true,
      });
      window.localStorage.setItem("canta:leads", JSON.stringify(arr.slice(0, 200)));
    } catch { /* ignore */ }
    // Short prefilled message — details already captured in the lead.
    const text = `Hi Canta, I want to track my shipment. My tracking reference is ${reference}.`;
    const href = `https://wa.me/${(import.meta.env.VITE_CANTA_WHATSAPP_NUMBER as string | undefined)?.replace(/\D/g, "") || "2348000000000"}?text=${encodeURIComponent(text)}`;
    toast.success("Opening WhatsApp…", { description: `Reference ${reference}` });
    window.open(href, "_blank", "noopener,noreferrer");
    setSubmitting(false);
    nav({ to: "/track" });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg">Canta</Link>
          <Link to="/track" className="text-xs text-muted-foreground">Back to tracking</Link>
        </div>
      </header>
      <main className="max-w-md mx-auto px-4 py-10">
        <Card className="p-6 shadow-card">
          <div className="flex items-center gap-2 text-[#25D366]">
            <MessageCircle className="h-5 w-5" />
            <div className="text-sm font-semibold">Track on WhatsApp</div>
          </div>
          <h1 className="text-xl font-semibold mt-2">A few quick details</h1>
          <p className="text-sm text-muted-foreground mt-1">
            We'll assign a tracking reference and open WhatsApp so we can help you faster.
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <div>
              <Label htmlFor="name" className="text-xs">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" maxLength={100} />
            </div>
            <div>
              <Label className="text-xs">Industry</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((i) => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs">WhatsApp phone number</Label>
              <Input id="phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" maxLength={30} />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs">Email address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" maxLength={255} />
            </div>
            <Button type="submit" disabled={submitting} className="w-full bg-[#25D366] hover:bg-[#1FB855] text-white">
              Continue to WhatsApp <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              By continuing you agree to be contacted on WhatsApp about your shipment.
            </p>
          </form>
        </Card>
      </main>
    </div>
  );
}
