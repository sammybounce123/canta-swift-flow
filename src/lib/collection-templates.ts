export type FieldType = "text" | "number" | "date" | "select" | "textarea" | "file";
export type TemplateField = {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  placeholder?: string;
};
export type CollectionTemplate = {
  id: string;
  label: string;
  description: string;
  purpose: string;
  fields: TemplateField[];
};

const SETTLEMENT_CCY: TemplateField = {
  key: "settlementCcy",
  label: "Settlement currency",
  type: "select",
  required: true,
  options: ["USD", "GBP", "EUR", "RMB", "AED", "CAD"],
};
const PAYER_COUNTRY: TemplateField = {
  key: "payerCountry",
  label: "Payer country",
  type: "text",
  placeholder: "Nigeria",
};

export const TEMPLATES: CollectionTemplate[] = [
  {
    id: "tuition",
    label: "Tuition Collection",
    description: "Universities, schools, training programmes",
    purpose: "Tuition payment",
    fields: [
      { key: "studentName", label: "Student name", type: "text", required: true },
      { key: "studentRef", label: "Student ID / admission number", type: "text", required: true },
      { key: "programme", label: "Programme", type: "text" },
      {
        key: "session",
        label: "Academic session / term",
        type: "text",
        placeholder: "Spring 2026",
      },
      { key: "amount", label: "Invoice amount", type: "number", required: true },
      { key: "payerName", label: "Payer name", type: "text", required: true },
      PAYER_COUNTRY,
      SETTLEMENT_CCY,
      { key: "deadline", label: "Payment deadline", type: "date" },
      { key: "reconRef", label: "Reconciliation reference", type: "text" },
    ],
  },
  {
    id: "medical",
    label: "Medical Payment",
    description: "Hospitals, clinics, treatment programmes",
    purpose: "Medical payment",
    fields: [
      { key: "patientName", label: "Patient name", type: "text", required: true },
      { key: "patientRef", label: "Patient reference", type: "text" },
      { key: "facility", label: "Hospital / clinic", type: "text", required: true },
      { key: "category", label: "Treatment category", type: "text" },
      { key: "amount", label: "Invoice amount", type: "number", required: true },
      { key: "payerName", label: "Payer name", type: "text", required: true },
      SETTLEMENT_CCY,
      { key: "doc", label: "Supporting document", type: "file" },
    ],
  },
  {
    id: "property",
    label: "Property Payment",
    description: "Property purchase, milestones",
    purpose: "Property payment",
    fields: [
      { key: "buyerName", label: "Buyer name", type: "text", required: true },
      { key: "project", label: "Property / project", type: "text", required: true },
      { key: "milestone", label: "Payment milestone", type: "text" },
      { key: "recipient", label: "Solicitor / recipient", type: "text" },
      { key: "amount", label: "Amount", type: "number", required: true },
      SETTLEMENT_CCY,
      { key: "doc", label: "Supporting documents", type: "file" },
    ],
  },
  {
    id: "travel",
    label: "Travel Payment",
    description: "Airlines, travel agencies",
    purpose: "Travel payment",
    fields: [
      { key: "traveller", label: "Traveller name", type: "text", required: true },
      { key: "booking", label: "Booking reference", type: "text" },
      { key: "provider", label: "Airline / travel provider", type: "text" },
      { key: "serviceType", label: "Service type", type: "text" },
      { key: "amount", label: "Amount", type: "number", required: true },
      SETTLEMENT_CCY,
      { key: "deadline", label: "Payment deadline", type: "date" },
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce Order",
    description: "Online merchants, marketplaces",
    purpose: "E-commerce order",
    fields: [
      { key: "customer", label: "Customer name", type: "text", required: true },
      { key: "orderId", label: "Order ID", type: "text", required: true },
      { key: "product", label: "Product / service", type: "text" },
      { key: "amount", label: "Amount", type: "number", required: true },
      SETTLEMENT_CCY,
      {
        key: "delivery",
        label: "Delivery status",
        type: "select",
        options: ["Pending", "Shipped", "Delivered"],
      },
      { key: "paymentRef", label: "Payment reference", type: "text" },
    ],
  },
  {
    id: "services",
    label: "Professional Services",
    description: "Legal, consulting, professional fees",
    purpose: "Professional service",
    fields: [
      { key: "client", label: "Client name", type: "text", required: true },
      { key: "service", label: "Service description", type: "textarea" },
      { key: "invoiceRef", label: "Invoice reference", type: "text", required: true },
      { key: "amount", label: "Amount", type: "number", required: true },
      SETTLEMENT_CCY,
      { key: "deadline", label: "Payment deadline", type: "date" },
    ],
  },
  {
    id: "supplier",
    label: "Supplier Invoice",
    description: "B2B supplier settlements",
    purpose: "Supplier invoice",
    fields: [
      { key: "supplier", label: "Supplier name", type: "text", required: true },
      { key: "buyerName", label: "Buyer name", type: "text", required: true },
      { key: "invoiceNo", label: "Invoice number", type: "text", required: true },
      { key: "goods", label: "Goods / service description", type: "textarea" },
      { key: "amount", label: "Amount", type: "number", required: true },
      SETTLEMENT_CCY,
      { key: "deadline", label: "Payment deadline", type: "date" },
      { key: "doc", label: "Invoice document", type: "file" },
    ],
  },
];

export function getTemplate(id: string) {
  return TEMPLATES.find((t) => t.id === id);
}
