import { useSyncExternalStore } from "react";

export type SupplierLang = "en" | "zh";

const KEY = "canta:supplier:lang";

function initial(): SupplierLang {
  if (typeof window === "undefined") return "en";
  try {
    return window.localStorage.getItem(KEY) === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

let lang: SupplierLang = "en";
let hydrated = false;
const subs = new Set<() => void>();

export const langStore = {
  get: () => lang,
  getServer: (): SupplierLang => "en",
  set: (v: SupplierLang) => {
    lang = v;
    try { window.localStorage.setItem(KEY, v); } catch { /* ignore */ }
    subs.forEach((f) => f());
  },
  subscribe: (f: () => void) => {
    if (!hydrated) {
      hydrated = true;
      const stored = initial();
      if (stored !== lang) { lang = stored; queueMicrotask(() => subs.forEach((s) => s())); }
    }
    subs.add(f);
    return () => subs.delete(f);
  },
};

export function useSupplierLang(): SupplierLang {
  return useSyncExternalStore(langStore.subscribe, langStore.get, langStore.getServer);
}

/** Lightweight label dictionary for the Supplier Portal only. */
const DICT: Record<string, [string, string]> = {
  dashboard: ["Dashboard", "首页"],
  createInvoice: ["Create Invoice", "创建发票"],
  ngnBalance: ["NGN Balance", "奈拉余额"],
  rmbBankAccount: ["RMB Bank Account", "人民币银行账户"],
  invoiceHistory: ["Invoice History", "发票记录"],
  settlements: ["Settlements", "结算"],
  verification: ["Verification", "认证"],
  support: ["Support", "支持"],
  settings: ["Settings", "设置"],

  welcome: ["Welcome, Li Wei", "欢迎，李伟"],
  company: ["Guangzhou Tech Factory Co., Ltd", "广州科技工厂有限公司"],
  demoAccount: ["Demo supplier account", "演示供应商账户"],

  ngnBalanceHelp: [
    "Money paid by Nigerian buyers appears here before RMB conversion.",
    "尼日利亚买家支付的款项在兑换人民币前显示在此处。",
  ],
  rmbPending: ["RMB Settlement Pending", "待结算人民币"],
  rmbPendingHelp: [
    "Converted funds waiting to be paid to your RMB bank account.",
    "已兑换、等待打入您人民币银行账户的资金。",
  ],
  paidToBank: ["Paid to RMB Bank", "已支付至人民币银行"],
  paidToBankHelp: [
    "Total settled to your verified RMB bank account.",
    "已结算至您已认证人民币银行账户的总额。",
  ],
  verificationStatus: ["Verification Status", "认证状态"],
  verificationHelp: [
    "Complete verification to receive RMB settlement.",
    "完成认证后方可接收人民币结算。",
  ],

  viewNgnDetails: ["View NGN Account Details", "查看奈拉账户信息"],
  addRmbBank: ["Add RMB Bank Account", "添加人民币银行账户"],
  viewSettlements: ["View Settlements", "查看结算"],

  howItWorks: ["How it works", "使用流程"],
  step1: ["Create invoice in RMB", "创建人民币发票"],
  step2: ["Buyer pays NGN", "买家支付尼日利亚奈拉"],
  step3: ["Canta converts automatically", "Canta 自动兑换"],
  step4: ["RMB paid to your bank", "人民币打入您的银行账户"],

  autoConvert: ["Automatic Convert", "自动兑换"],
  autoConvertDesc: [
    "When Nigerian Naira is paid into your Canta NGN account, Canta automatically converts it to RMB using the rate locked on the invoice, then pays your verified RMB bank account.",
    "当奈拉付入您的 Canta 奈拉账户后，Canta 会按发票锁定的汇率自动兑换为人民币，并支付到您已认证的人民币银行账户。",
  ],
  autoConvertOn: [
    "NGN received from buyers will be automatically converted to RMB after compliance review.",
    "买家支付的奈拉将在合规审核后自动兑换为人民币。",
  ],
  autoConvertOff: [
    "NGN will remain in your Canta NGN balance until you manually request conversion.",
    "奈拉将保留在您的 Canta 奈拉余额中，直到您手动申请兑换。",
  ],
  actionNeeded: ["Action needed before automatic conversion", "自动兑换前需要完成以下操作"],
  buyerPaysNgn: ["Buyer pays NGN", "买家支付奈拉"],
  youReceiveRmb: ["You receive RMB", "您收到人民币"],
  sendInvoice: ["Send invoice", "发送发票"],
  rmbPaidToBank: ["RMB paid to your bank", "人民币已打入您的银行"],
};

export function translate(lang: SupplierLang, key: keyof typeof DICT | string): string {
  const entry = DICT[key];
  if (!entry) return String(key);
  return lang === "zh" ? entry[1] : entry[0];
}

export function useT() {
  const lang = useSupplierLang();
  return (key: string) => translate(lang, key);
}
