// Partner property projects / developments directory.
// Salespeople maintain the list of projects they sell, then pick one when
// creating a client payment case instead of typing free text.

import { useSyncExternalStore } from "react";

export type ProjectStatus = "Selling" | "Coming soon" | "Sold out" | "Paused";

export const PROJECT_STATUSES: ProjectStatus[] = ["Selling", "Coming soon", "Sold out", "Paused"];

export type PartnerProject = {
  id: string;
  name: string;
  developer: string;
  location: string;
  country: string;
  currency: string;
  priceFrom: number;
  units: number;
  completion: string;
  status: ProjectStatus;
  notes?: string;
  createdAt: string;
};

let projects: PartnerProject[] = [
  {
    id: "PRJ-1001",
    name: "The Wharf Residences",
    developer: "Kingsbridge Developments",
    location: "Manchester",
    country: "United Kingdom",
    currency: "GBP",
    priceFrom: 245000,
    units: 84,
    completion: "Q3 2027",
    status: "Selling",
    createdAt: "2026-05-12",
  },
  {
    id: "PRJ-1002",
    name: "Regent Quarter",
    developer: "Northgate Group",
    location: "Birmingham",
    country: "United Kingdom",
    currency: "GBP",
    priceFrom: 189500,
    units: 120,
    completion: "Q1 2028",
    status: "Selling",
    createdAt: "2026-06-02",
  },
  {
    id: "PRJ-1003",
    name: "Marina Heights",
    developer: "Aurelia Estates",
    location: "Dubai Marina",
    country: "United Arab Emirates",
    currency: "USD",
    priceFrom: 410000,
    units: 46,
    completion: "Q4 2026",
    status: "Coming soon",
    createdAt: "2026-07-19",
  },
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribeProjects(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getProjects() {
  return projects;
}

export function usePartnerProjects() {
  return useSyncExternalStore(subscribeProjects, getProjects, getProjects);
}

export function addProject(input: Omit<PartnerProject, "id" | "createdAt">) {
  const project: PartnerProject = {
    ...input,
    id: `PRJ-${1000 + projects.length + 1}`,
    createdAt: new Date().toISOString().slice(0, 10),
  };
  projects = [project, ...projects];
  emit();
  return project;
}

export function updateProject(id: string, patch: Partial<Omit<PartnerProject, "id">>) {
  projects = projects.map((p) => (p.id === id ? { ...p, ...patch } : p));
  emit();
}

export function removeProject(id: string) {
  projects = projects.filter((p) => p.id !== id);
  emit();
}

export const PROJECT_STATUS_TONE: Record<ProjectStatus, string> = {
  Selling: "bg-success/10 text-success border-success/20",
  "Coming soon": "bg-primary/10 text-primary border-primary/20",
  "Sold out": "bg-muted text-muted-foreground border-border",
  Paused: "bg-warning/10 text-warning border-warning/20",
};

export function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}
