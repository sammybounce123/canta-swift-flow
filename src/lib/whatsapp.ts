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

  containerLoaded: (ctx = {}) =>
    `Canta Shipment Update — Container Loaded

Shipment: ${ctx.shipment ?? ""}
Container: ${ctx.container ?? ""}
Origin: ${ctx.origin ?? ""}
Vessel: ${ctx.vessel ?? "Vessel to be confirmed"}
Estimated sailing: ${ctx.sailing ?? ""}

We will notify you again when the vessel sails.`,

  vesselSailed: (ctx = {}) =>
    `Canta Shipment Update — Vessel Sailed

Shipment: ${ctx.shipment ?? ""}
Vessel: ${ctx.vessel ?? ""}
Departed: ${ctx.departed ?? ""}
ETA destination: ${ctx.eta ?? ""}

You will receive the next update when your goods arrive.`,

  arrivedAtPort: (ctx = {}) =>
    `Canta Shipment Update — Arrived at Port

Shipment: ${ctx.shipment ?? ""}
Port: ${ctx.port ?? ""}
Arrived: ${ctx.arrived ?? "today"}

Customs clearance will begin shortly.`,

  clearingStarted: (ctx = {}) =>
    `Canta Shipment Update — Clearing Started

Shipment: ${ctx.shipment ?? ""}
Port: ${ctx.port ?? ""}

Our clearing desk has filed documents. Please confirm duty payment so we can release your goods.`,

  clearedCustoms: (ctx = {}) =>
    `Canta Shipment Update — Cleared Customs

Shipment: ${ctx.shipment ?? ""}
Cleared: ${ctx.cleared ?? "today"}

We are now arranging delivery to your warehouse.`,

  outForDelivery: (ctx = {}) =>
    `Canta Shipment Update — Out for Delivery

Shipment: ${ctx.shipment ?? ""}
Driver: ${ctx.driver ?? ""}
Vehicle: ${ctx.vehicle ?? ""}
ETA at your warehouse: ${ctx.eta ?? ""}`,

  delivered: (ctx = {}) =>
    `Canta Shipment Update — Delivered ✓

Shipment: ${ctx.shipment ?? ""}
Delivered: ${ctx.delivered ?? "today"}
Received by: ${ctx.receiver ?? ""}

Thank you for shipping with Canta. Please rate your experience in the app.`,

  delayNotice: (ctx = {}) =>
    `Canta Shipment Update — Delay Notice

Shipment: ${ctx.shipment ?? ""}
Reason: ${ctx.reason ?? "Vessel/port delay"}
New ETA: ${ctx.newEta ?? "Being confirmed"}

No action needed from your side. We are monitoring closely.`,

  missingDocumentReminder: (ctx = {}) =>
    `Reminder — Missing Document

Shipment: ${ctx.shipment ?? ""}
Missing: ${ctx.document ?? ""}
Deadline: ${ctx.deadline ?? ""}

Please send the document on this chat so we can avoid clearing delays.`,

  paymentReminder: (ctx = {}) =>
    `Payment Reminder

Invoice: ${ctx.invoice ?? ""}
Amount due: ${ctx.amount ?? ""}
Due date: ${ctx.due ?? ""}

Pay via the Canta link in this chat. Reply if you'd like to discuss terms.`,

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
