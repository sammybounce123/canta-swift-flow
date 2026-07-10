import { test, expect, type Page } from "@playwright/test";

/**
 * Helpers
 */
async function clearStorage(page: Page) {
  // Establish an origin first so storage APIs are available.
  await page.goto("/");
  await page.evaluate(() => {
    try { window.localStorage.clear(); } catch {}
    try { window.sessionStorage.clear(); } catch {}
  });
}

async function seedWorkspace(page: Page, workspace: string, mode: string) {
  await page.goto("/");
  await page.evaluate(
    ({ workspace, mode }) => {
      window.localStorage.setItem("canta:active_workspace", workspace);
      window.localStorage.setItem("canta:mode", mode);
      // Simulate a KYB-completed workspace so the AppShell KYB gate does not
      // bounce warm navigation into /kyb-onboarding.
      window.localStorage.setItem("canta:kyb:" + workspace, "done");
    },
    { workspace, mode }
  );
}

/**
 * Seed the pre-verified investor-demo Supplier persona (Li Wei /
 * Guangzhou Tech Factory). Mirrors what src/lib/demo-supplier.ts writes
 * when a visitor picks Supplier on /welcome.
 */
async function seedDemoSupplier(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("canta:active_workspace", "supplier_dashboard");
    window.localStorage.setItem("canta:mode", "Supplier");
    window.localStorage.setItem("canta:kyb:supplier_dashboard", "done");
    window.localStorage.setItem("canta:payout:supplier_dashboard", "verified");
    window.localStorage.setItem("canta:persona", "supplier_demo");
  });
}

/**
 * Seed a genuinely unverified Supplier workspace — active workspace is set,
 * but no KYB approval flag is present. AppShell should redirect this
 * visitor to /kyb-onboarding?workspace=supplier_dashboard.
 */
async function seedUnverifiedSupplier(page: Page) {
  await page.goto("/");
  await page.evaluate(() => {
    window.localStorage.setItem("canta:active_workspace", "supplier_dashboard");
    window.localStorage.setItem("canta:mode", "Supplier");
  });
}


async function assertAbsent(page: Page, texts: string[]) {
  const body = (await page.textContent("body")) ?? "";
  for (const t of texts) {
    expect(body, `expected "${t}" to be absent on ${page.url()}`).not.toContain(t);
  }
}

async function assertPresent(page: Page, texts: string[]) {
  const body = (await page.textContent("body")) ?? "";
  for (const t of texts) {
    expect(body, `expected "${t}" to be present on ${page.url()}`).toContain(t);
  }
}

/* ------------------------------------------------------------------ */
/* Warm Importer navigation                                            */
/* ------------------------------------------------------------------ */
test.describe("Warm Importer navigation", () => {
  const paths = ["/documents", "/payments", "/whatsapp", "/team", "/settings"];

  for (const p of paths) {
    test(`Importer context preserved on ${p}`, async ({ page }) => {
      await clearStorage(page);
      // Warm the workspace by visiting /importer first.
      await page.goto("/importer");
      await page.waitForLoadState("networkidle");

      await page.goto(p);
      await page.waitForLoadState("networkidle");

      await assertPresent(page, ["Tunde Bakare", "Importer Mode"]);
      await assertAbsent(page, ["Adaeze Okonkwo", "Enterprise Treasury Mode"]);
    });
  }
});

/* ------------------------------------------------------------------ */
/* Cold shared-route navigation                                        */
/* ------------------------------------------------------------------ */
test.describe("Cold shared-route navigation redirects to /welcome", () => {
  const paths = [
    "/documents",
    "/payments",
    "/whatsapp",
    "/team",
    "/settings",
    "/reports",
    "/support",
    "/audit-logs",
  ];

  for (const p of paths) {
    test(`Cold ${p} → /welcome`, async ({ page }) => {
      await clearStorage(page);
      await page.goto(p);
      // Guard runs in useEffect; give it a moment.
      await page.waitForURL("**/welcome", { timeout: 5000 });
      expect(page.url()).toContain("/welcome");
      await assertAbsent(page, ["Adaeze Okonkwo", "Enterprise Treasury Mode"]);
    });
  }
});

/* ------------------------------------------------------------------ */
/* Generic dashboard cold visit                                        */
/* ------------------------------------------------------------------ */
test("Cold /dashboard redirects to /welcome without flashing Treasury identity", async ({ page }) => {
  await clearStorage(page);
  await page.goto("/dashboard");
  await page.waitForURL("**/welcome", { timeout: 5000 });
  expect(page.url()).toContain("/welcome");
  await assertAbsent(page, [
    "Adaeze Okonkwo",
    "Enterprise Treasury Mode",
    "Treasury Mode",
    // Treasury dashboard-specific hero copy — must never appear on cold visit.
    "Bulk Payouts",
    "Total balance",
  ]);
});

/* ------------------------------------------------------------------ */
/* Partner Activity Log                                                */
/* ------------------------------------------------------------------ */
test("Partner Activity Log keeps Partner context", async ({ page }) => {
  await clearStorage(page);
  await seedWorkspace(page, "partner_property", "Partner Property");
  await page.goto("/partner");
  await page.waitForLoadState("networkidle");
  await page.goto("/partner/activity-log");
  await page.waitForLoadState("networkidle");
  await assertPresent(page, ["Charlotte Baron", "Partner Mode"]);
  await assertAbsent(page, ["Importer Mode", "Enterprise Treasury Mode"]);
});

/* ------------------------------------------------------------------ */
/* Supplier routes                                                     */
/* ------------------------------------------------------------------ */
test.describe("Demo supplier navigation keeps supplier context", () => {
  const paths = [
    "/supplier-portal",
    "/supplier-portal/payment-requests",
    "/supplier-portal/rmb-wallet",
    "/supplier-portal/documents",
    "/supplier-portal/team",
    "/supplier-portal/settings",
  ];

  for (const p of paths) {
    test(`Demo supplier ${p}`, async ({ page }) => {
      await clearStorage(page);
      await seedDemoSupplier(page);
      await page.goto(p);
      await page.waitForLoadState("networkidle");
      expect(page.url(), `should not bounce demo supplier to KYB from ${p}`)
        .not.toContain("/kyb-onboarding");
      await assertPresent(page, ["Li Wei", "Supplier Mode"]);
      await assertAbsent(page, ["Adaeze Okonkwo", "Enterprise Treasury Mode"]);
    });
  }
});

test("Unverified supplier is redirected to KYB onboarding", async ({ page }) => {
  await clearStorage(page);
  await seedUnverifiedSupplier(page);
  await page.goto("/supplier-portal");
  await page.waitForURL(/\/kyb-onboarding/, { timeout: 5000 });
  expect(page.url()).toContain("workspace=supplier_dashboard");
});


/* ------------------------------------------------------------------ */
/* Shipment date consistency                                           */
/* ------------------------------------------------------------------ */
test("Shipments page has no illogical status/date pairings", async ({ page }) => {
  await clearStorage(page);
  await seedWorkspace(page, "importer_portal", "Importer");
  await page.goto("/shipments");
  await page.waitForLoadState("networkidle");
  const body = (await page.textContent("body")) ?? "";

  const badPairs: Array<[RegExp, string]> = [
    [/On Vessel[\s\S]{0,300}Arrived\s+\d+\s+day/i, "'On Vessel' with 'Arrived N days ago'"],
    [/Loaded[\s\S]{0,300}Arrived\s+\d+\s+day/i, "'Loaded' with 'Arrived N days ago'"],
    [/Delayed[\s\S]{0,300}Arrived\s+\d+\s+day/i, "'Delayed' with 'Arrived N days ago'"],
    [/Released[\s\S]{0,300}\bdelivered\b/i, "'Released' with 'delivered'"],
  ];
  for (const [re, label] of badPairs) {
    expect(body, `shipments page contains inconsistency: ${label}`).not.toMatch(re);
  }
});
