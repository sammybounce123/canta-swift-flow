// Shared mock data + helpers
export const fmtNGN = (n: number) =>
  "₦" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
export const fmtUSD = (n: number) =>
  "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtMoney = (n: number, ccy: string) => {
  const sym: Record<string, string> = { NGN: "₦", USD: "$", EUR: "€", GBP: "£" };
  return (
    (sym[ccy] ?? "") +
    n.toLocaleString(undefined, {
      minimumFractionDigits: ccy === "NGN" ? 0 : 2,
      maximumFractionDigits: ccy === "NGN" ? 0 : 2,
    })
  );
};

export const wallets = [
  { ccy: "NGN", balance: 1_284_500_000, label: "Naira Wallet", flag: "🇳🇬" },
  { ccy: "USD", balance: 4_820_410.55, label: "Dollar Wallet", flag: "🇺🇸" },
  { ccy: "EUR", balance: 612_300.12, label: "Euro Wallet", flag: "🇪🇺" },
  { ccy: "GBP", balance: 318_750.4, label: "Pound Wallet", flag: "🇬🇧" },
];

export const transactions = [
  { id: "TXN-948213", date: "2026-05-11 09:42", type: "FX Conversion", desc: "USD → NGN", amount: 1_250_000, ccy: "USD", status: "Completed" },
  { id: "TXN-948210", date: "2026-05-11 08:15", type: "Outgoing", desc: "Schlumberger Ltd · Houston", amount: 487_300, ccy: "USD", status: "Completed" },
  { id: "TXN-948205", date: "2026-05-10 17:01", type: "Funding", desc: "GTBank inflow", amount: 850_000_000, ccy: "NGN", status: "Completed" },
  { id: "TXN-948199", date: "2026-05-10 14:22", type: "Outgoing", desc: "Halliburton Energy · UK", amount: 92_400, ccy: "GBP", status: "Pending" },
  { id: "TXN-948188", date: "2026-05-10 11:08", type: "FX Conversion", desc: "EUR → USD", amount: 215_000, ccy: "EUR", status: "Completed" },
  { id: "TXN-948170", date: "2026-05-09 16:45", type: "Outgoing", desc: "Total Energies · Paris", amount: 380_000, ccy: "EUR", status: "Completed" },
  { id: "TXN-948161", date: "2026-05-09 12:30", type: "Funding", desc: "Card · Visa **4421", amount: 50_000_000, ccy: "NGN", status: "Failed" },
  { id: "TXN-948150", date: "2026-05-09 10:12", type: "Outgoing", desc: "Baker Hughes · Aberdeen", amount: 145_200, ccy: "GBP", status: "Completed" },
];

export const cashFlow = [
  { d: "May 5", inflow: 420, outflow: 280 },
  { d: "May 6", inflow: 380, outflow: 310 },
  { d: "May 7", inflow: 510, outflow: 290 },
  { d: "May 8", inflow: 470, outflow: 360 },
  { d: "May 9", inflow: 620, outflow: 410 },
  { d: "May 10", inflow: 850, outflow: 540 },
  { d: "May 11", inflow: 720, outflow: 480 },
];

export const beneficiaries = [
  { name: "Schlumberger Ltd", country: "USA", bank: "JPMorgan Chase", account: "•••• 8821", ccy: "USD" },
  { name: "Halliburton Energy", country: "UK", bank: "Barclays", account: "•••• 4412", ccy: "GBP" },
  { name: "Total Energies", country: "France", bank: "BNP Paribas", account: "•••• 7790", ccy: "EUR" },
  { name: "Baker Hughes", country: "UK", bank: "HSBC", account: "•••• 1230", ccy: "GBP" },
  { name: "ExxonMobil", country: "USA", bank: "Citibank", account: "•••• 5566", ccy: "USD" },
];

export const team = [
  { name: "Adaeze Okafor", email: "adaeze@ndexploration.ng", role: "Admin", status: "Active" },
  { name: "Kunle Adebayo", email: "kunle@ndexploration.ng", role: "Treasury", status: "Active" },
  { name: "Fatima Musa", email: "fatima@ndexploration.ng", role: "Finance", status: "Active" },
  { name: "Chinedu Eze", email: "chinedu@ndexploration.ng", role: "Compliance", status: "Pending" },
  { name: "Tomiwa Lawal", email: "tomiwa@ndexploration.ng", role: "Viewer", status: "Active" },
];

export const fxHistory = [
  { d: "Mon", rate: 1598 },
  { d: "Tue", rate: 1604 },
  { d: "Wed", rate: 1601 },
  { d: "Thu", rate: 1609 },
  { d: "Fri", rate: 1612 },
  { d: "Sat", rate: 1615 },
  { d: "Sun", rate: 1612 },
];
