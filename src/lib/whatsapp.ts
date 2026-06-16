// Canta official WhatsApp support number (placeholder — replace with live number)
export const CANTA_WHATSAPP_NUMBER = "234XXXXXXXXXX";

export type WhatsAppTemplateKey =
  | "sendInvoice"
  | "trackShipment"
  | "landedCost"
  | "verifySupplier"
  | "shipmentUpdate"
  | "missingDocument"
  | "containerLoaded"
  | "vesselSailed"
  | "arrivedAtPort"
  | "clearingStarted"
  | "clearedCustoms"
  | "outForDelivery"
  | "delivered"
  | "delayNotice"
  | "missingDocumentReminder"
  | "paymentReminder"
  | "general";

type TemplateContext = Record<string, string | number | undefined | null>;

const templates: Record<WhatsAppTemplateKey, (ctx?: TemplateContext) => string> = {
  sendInvoice: () =>
    `Hello Canta, I want to create a Trade File.

I want to send my supplier invoice for tracking, landed cost calculation, and document organization.

My name:
Business name:
Goods category:
Import country:`,

  trackShipment: (ctx = {}) =>
    `Hello Canta, I want to track my shipment.

My name:
Business name:
Container number / BL number / shipment number: ${ctx.reference ?? ""}
Shipping line: ${ctx.line ?? ""}
Origin: ${ctx.origin ?? ""}
Destination: ${ctx.destination ?? ""}
ETA, if known: ${ctx.eta ?? ""}`,

  landedCost: (ctx = {}) =>
    `Hello Canta, I want to calculate my landed cost.

Goods cost: ${ctx.goodsCost ?? ""}
Currency: ${ctx.currency ?? ""}
Freight cost: ${ctx.freight ?? ""}
Clearing estimate, if known: ${ctx.clearing ?? ""}
Destination: ${ctx.destination ?? ""}
Expected selling price: ${ctx.sellingPrice ?? ""}`,

  verifySupplier: (ctx = {}) =>
    `Hello Canta, I want to verify a supplier before I pay.

Supplier name: ${ctx.supplier ?? ""}
Country/city: ${ctx.location ?? ""}
Website or contact: ${ctx.contact ?? ""}
Invoice amount: ${ctx.amount ?? ""}
Goods category: ${ctx.category ?? ""}`,

  shipmentUpdate: (ctx = {}) =>
    `Canta Shipment Update

Shipment: ${ctx.shipment ?? ""}
Status: ${ctx.status ?? ""}
ETA: ${ctx.eta ?? ""}
Missing Documents: ${ctx.missingDocs ?? "None"}
Payment Status: ${ctx.payment ?? ""}
Next Action: ${ctx.nextAction ?? ""}`,

  missingDocument: (ctx = {}) =>
    `Hello, your shipment is missing the following document:

Missing document: ${ctx.document ?? ""}
Shipment: ${ctx.shipment ?? ""}
ETA: ${ctx.eta ?? ""}

Please upload or send it to Canta so your trade file can be updated.`,

  general: () => `Hello Canta, I would like to learn more about your platform.`,
};

export function buildWhatsAppUrl(
  template: WhatsAppTemplateKey,
  ctx?: TemplateContext,
  number: string = CANTA_WHATSAPP_NUMBER,
) {
  const text = templates[template](ctx);
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function openWhatsApp(
  template: WhatsAppTemplateKey,
  ctx?: TemplateContext,
  number?: string,
) {
  if (typeof window === "undefined") return;
  window.open(buildWhatsAppUrl(template, ctx, number), "_blank", "noopener,noreferrer");
}
