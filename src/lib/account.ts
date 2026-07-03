// Lightweight client-side account store for the Get Started onboarding flow.
// This is UI/state logic only — no backend, no payment processing.
// Data is structured cleanly so it can be exported/synced to a backend later.

export type AccountRole = "individual" | "professional" | "organization";

export interface StoredAccount {
  id: string;
  role: AccountRole;
  verified: boolean; // controls whether the payment/verification gate shows
  createdAt: string;
  // Free-form, cleanly-keyed submission payload (exportable as-is)
  data: Record<string, unknown>;
}

const STORAGE_KEY = "baba.accounts.v1";
const CURRENT_KEY = "baba.currentAccountId.v1";

function isBrowser() {
  return typeof window !== "undefined" && !!window.localStorage;
}

export function getAccounts(): StoredAccount[] {
  if (!isBrowser()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveAccount(input: {
  role: AccountRole;
  data: Record<string, unknown>;
}): StoredAccount {
  const account: StoredAccount = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `acct_${Date.now()}`,
    role: input.role,
    verified: false, // always false on creation
    createdAt: new Date().toISOString(),
    data: input.data,
  };
  if (isBrowser()) {
    const all = getAccounts();
    all.push(account);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    window.localStorage.setItem(CURRENT_KEY, account.id);
  }
  return account;
}

export function getCurrentAccount(): StoredAccount | null {
  if (!isBrowser()) return null;
  const id = window.localStorage.getItem(CURRENT_KEY);
  if (!id) return null;
  return getAccounts().find((a) => a.id === id) || null;
}

export function isVerified(): boolean {
  return !!getCurrentAccount()?.verified;
}
