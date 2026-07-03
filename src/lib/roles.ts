import type { RoleValue } from "@/lib/registrations.functions";

export const ROLE_LABELS: Record<RoleValue, string> = {
  individual: "Individual",
  professional_young: "Young Professional",
  professional_exp: "Experienced Professional",
  artisan: "Artisan",
  corporate: "Corporate",
};

/** One-time verification fee per role, in KSh. */
export const ROLE_FEES: Record<RoleValue, number> = {
  individual: 100,
  professional_young: 100,
  professional_exp: 300,
  artisan: 100,
  corporate: 23000,
};

export function formatKsh(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function isProfessional(role: string): boolean {
  return role === "professional_young" || role === "professional_exp";
}
