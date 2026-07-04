import type { RoleValue } from "@/lib/registrations.functions";

export const ROLE_LABELS: Record<RoleValue, string> = {
  individual: "Artisan",
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

/** The 12 role-container types, in display order. */
export const CONTAINER_LABELS: Record<string, string> = {
  individual: "Individuals",
  professional_young: "Young Professionals",
  professional_exp: "Experienced Professionals",
  artisan_plumber: "Plumbers",
  artisan_electrician: "Electricians",
  artisan_mason: "Masons",
  artisan_carpenter: "Carpenters",
  artisan_painter: "Painters",
  artisan_welder: "Welders",
  artisan_tiler: "Tilers",
  artisan_gypsum_installer: "Gypsum Installers",
  corporate: "Corporate & NGO Partners",
};

export const ARTISAN_TRADES = [
  "plumber",
  "electrician",
  "mason",
  "carpenter",
  "painter",
  "welder",
  "tiler",
  "gypsum_installer",
] as const;

/** Map a registration's role + artisan trade to its container type. */
export function containerTypeFor(
  userRole: string | null,
  artisanType: string | null,
): string | null {
  if (userRole === "artisan") {
    if (artisanType && (ARTISAN_TRADES as readonly string[]).includes(artisanType)) {
      return `artisan_${artisanType}`;
    }
    return null;
  }
  if (
    userRole === "individual" ||
    userRole === "professional_young" ||
    userRole === "professional_exp" ||
    userRole === "corporate"
  ) {
    return userRole;
  }
  return null;
}

export function feeForRole(role: string): number {
  return (ROLE_FEES as Record<string, number>)[role] ?? 0;
}
