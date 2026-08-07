import { test, expect, type Page } from "@playwright/test";

/**
 * Helpers
 */
async function clearStorage(page: Page) {
  // Establish an origin first so storage APIs are available.
  await page.goto("/");
  await page.evaluate(() => {
    try {
      window.localStorage.clear();
    } catch {
      /* ignore */
    }
    try {
      window.sessionStorage.clear();
    } catch {
      /* ignore */
    }
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
    { workspace, mode },
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
test("Cold /dashboard redirects to /welcome without flashing Treasury identity", async ({
  page,
}) => {
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
      expect(page.url(), `should not bounce demo supplier to KYB from ${p}`).not.toContain(
        "/kyb-onboarding",
      );
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

/* ------------------------------------------------------------------ */
/* Date sanity — importer & shipments                                  */
/* ------------------------------------------------------------------ */
async function assertDateSanity(page: Page, url: string) {
  await clearStorage(page);
  await seedWorkspace(page, "importer_portal", "Importer");
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  const body = (await page.textContent("body")) ?? "";

  // No NaN / Invalid Date / 1970 / 5-digit day count
  expect(body, `${url} contains NaN`).not.toMatch(/\bNaN\b/);
  expect(body, `${url} contains Invalid Date`).not.toMatch(/Invalid Date/i);
  expect(body, `${url} contains 1970 timestamp`).not.toMatch(/\b1970\b/);
  expect(body, `${url} contains 5-digit day count`).not.toMatch(/\b\d{5,}\s*days?\b/i);

  // No day count > 365
  const dayMatches = [...body.matchAll(/(\d{1,6})\s*days?\b/gi)];
  for (const m of dayMatches) {
    const n = parseInt(m[1], 10);
    expect(n, `${url}: day count ${n} exceeds 365`).toBeLessThanOrEqual(365);
  }
}

test("Importer dashboard date sanity", async ({ page }) => {
  await assertDateSanity(page, "/importer");
});
test("Shipments page date sanity", async ({ page }) => {
  await assertDateSanity(page, "/shipments");
});

/* ------------------------------------------------------------------ */
/* Demo supplier: Demo approved & no on-hold warnings                  */
/* ------------------------------------------------------------------ */
test("Demo supplier verification shows Demo approved", async ({ page }) => {
  await clearStorage(page);
  await seedDemoSupplier(page);
  await page.goto("/supplier-portal/verification");
  await page.waitForLoadState("networkidle");
  await assertPresent(page, ["Demo approved"]);
  await assertAbsent(page, ["Verification incomplete", "RMB settlement is on hold"]);
});

test("Demo supplier RMB settlement page has no on-hold warning", async ({ page }) => {
  await clearStorage(page);
  await seedDemoSupplier(page);
  await page.goto("/supplier-portal/rmb-wallet");
  await page.waitForLoadState("networkidle");
  await assertAbsent(page, ["Withdrawals are on hold"]);
});

/* ------------------------------------------------------------------ */
/* No 1969/1970 dates anywhere on shipments (raw string check)         */
/* ------------------------------------------------------------------ */
test("Shipments page contains no 1969 or 1970 dates", async ({ page }) => {
  await clearStorage(page);
  await seedWorkspace(page, "importer_portal", "Importer");
  await page.goto("/shipments");
  await page.waitForLoadState("networkidle");
  const body = (await page.textContent("body")) ?? "";
  expect(body).not.toMatch(/\b19(69|70)-\d{2}-\d{2}\b/);
  expect(body).not.toMatch(/\b19(69|70)\b/);
});

/* ------------------------------------------------------------------ */
/* Released never says "goods delivered"                                */
/* ------------------------------------------------------------------ */
test("Released shipment next step says 'arrange or track final delivery'", async ({ page }) => {
  await clearStorage(page);
  await seedWorkspace(page, "importer_portal", "Importer");
  // SHP-10429 is a Released shipment in the mock; visit its track page.
  await page.goto("/track/SHP-10429");
  await page.waitForLoadState("networkidle");
  await assertPresent(page, ["Goods released — arrange or track final delivery"]);
  await assertAbsent(page, ["Nothing to do — goods delivered"]);
});

/* ------------------------------------------------------------------ */
/* Landing → Supplier Portal card seeds demo persona                    */
/* ------------------------------------------------------------------ */
test("Landing page Supplier Portal card shows Demo approved on entry", async ({ page }) => {
  await clearStorage(page);
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Click the Supplier Portal entry-card CTA.
  await page
    .getByRole("link", { name: /Enter Supplier Portal/i })
    .first()
    .click();
  await page.waitForURL(/\/supplier-portal/, { timeout: 5000 });
  await page.waitForLoadState("networkidle");
  expect(page.url(), "landing → supplier must not bounce to KYB").not.toContain("/kyb-onboarding");
  await assertPresent(page, ["Li Wei"]);
  await assertAbsent(page, [
    "Verification incomplete",
    "RMB settlement is paused",
    "RMB wallet payouts unlock",
  ]);
});

/* ------------------------------------------------------------------ */
/* Supplier pages contain no obsolete wallet wording                    */
/* ------------------------------------------------------------------ */
test("Supplier pages have no 'Canta wallet' or obsolete Chinese wallet wording", async ({
  page,
}) => {
  await clearStorage(page);
  await seedDemoSupplier(page);
  for (const p of ["/supplier-portal", "/supplier-portal/rmb-wallet"]) {
    await page.goto(p);
    await page.waitForLoadState("networkidle");
    const body = (await page.textContent("body")) ?? "";
    expect(body, `${p} contains "Canta wallet"`).not.toContain("Canta wallet");
    expect(body, `${p} contains "RMB wallet"`).not.toMatch(/RMB wallet/i);
    expect(body, `${p} contains "lands in your"`).not.toContain("lands in your");
    expect(body, `${p} still uses 结算至您的钱包`).not.toContain("结算至您的钱包");
  }
});

/* ------------------------------------------------------------------ */
/* Importer overview contains no 'escrow option'                        */
/* ------------------------------------------------------------------ */
test("Importer overview contains no 'escrow option'", async ({ page }) => {
  await clearStorage(page);
  await seedWorkspace(page, "importer_portal", "Importer");
  await page.goto("/importer");
  await page.waitForLoadState("networkidle");
  const body = (await page.textContent("body")) ?? "";
  expect(body).not.toContain("escrow option");
});
