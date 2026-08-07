import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageCircle, ArrowRight } from "lucide-react";
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

function TrackWhatsAppPage() {
  const nav = useNavigate();
  const { ref } = useSearch({ from: "/track/whatsapp" });
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const schema = z.object({
    firstName: z.string().trim().min(2, "Enter your first name").max(60),
    phone: z.string().trim().min(6, "Enter your WhatsApp number").max(30),
    business: z.string().trim().max(120).optional(),
    consent: z.literal(true, { errorMap: () => ({ message: "Please confirm WhatsApp consent" }) }),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse({ firstName, phone, business: business || undefined, consent });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your details");
      return;
    }
    setSubmitting(true);
    const reference = ref || `CTA-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    try {
      const raw = window.localStorage.getItem("canta:leads");
      const arr = raw ? JSON.parse(raw) : [];
      arr.unshift({
        source: "whatsapp_track_cta",
        reference,
        createdAt: new Date().toISOString(),
        ...parsed.data,
      });
      window.localStorage.setItem("canta:leads", JSON.stringify(arr.slice(0, 200)));
    } catch {
      /* ignore */
    }
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
          <Link to="/" className="font-bold text-lg">
            Canta
          </Link>
          <Link to="/track" className="text-xs text-muted-foreground">
            Back to tracking
          </Link>
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
              <Label htmlFor="firstName" className="text-xs">
                First name
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                maxLength={60}
              />
            </div>
            <div>
              <Label htmlFor="phone" className="text-xs">
                WhatsApp phone number
              </Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                maxLength={30}
              />
            </div>
            <div>
              <Label htmlFor="business" className="text-xs">
                Business or trading name <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="business"
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
                placeholder="Optional"
                maxLength={120}
              />
            </div>
            <label className="flex items-start gap-2 text-[12px] text-muted-foreground pt-1">
              <Checkbox
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
                className="mt-0.5"
              />
              <span>I agree to be contacted by Canta on WhatsApp about my shipment.</span>
            </label>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#25D366] hover:bg-[#1FB855] text-white"
            >
              Continue to WhatsApp <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">
              Industry and email are collected later on your full profile.
            </p>
          </form>
        </Card>
      </main>
    </div>
  );
}
