import type { RoleValue } from "@/lib/registrations.functions";

export type ProfessionOption = {
  key: string;
  label: string; // "I am ..."
  role: RoleValue;
  trade?: string;
  example: string; // ego-glazing example for "what have you done?"
};

/** Every profession we celebrate — the more, the merrier. Nobody is left out. */
export const PROFESSIONS: ProfessionOption[] = [
  // The big ones
  { key: "architect", label: "I am an Architect", role: "professional_exp", example: "e.g. I have designed a beautiful building that people love." },
  { key: "engineer", label: "I am an Engineer", role: "professional_exp", example: "e.g. I have engineered structures that serve my community." },
  { key: "interior-designer", label: "I am an Interior Designer", role: "professional_exp", example: "e.g. I have turned rooms into stunning, welcoming spaces." },
  { key: "quantity-surveyor", label: "I am a Quantity Surveyor", role: "professional_exp", example: "e.g. I have kept big projects on budget, down to the last shilling." },
  { key: "project-manager", label: "I am a Project Manager", role: "professional_exp", example: "e.g. I have led teams that delivered projects on time." },
  { key: "contractor", label: "I am a Contractor", role: "professional_exp", example: "e.g. I have built projects from the ground up." },
  // The hands — jobs Africa depends on
  { key: "welder", label: "I am a Welder", role: "artisan", trade: "welder", example: "e.g. I have welded gates and structures that are strong, clean and artistic." },
  { key: "plumber", label: "I am a Plumber", role: "artisan", trade: "plumber", example: "e.g. I have done neat, reliable plumbing that never leaks." },
  { key: "mason", label: "I am a Mason", role: "artisan", trade: "mason", example: "e.g. I have laid bricks and stone that stand tall for years." },
  { key: "construction", label: "I am in Construction", role: "artisan", trade: "construction", example: "e.g. I have worked on building sites and helped put up homes, shops and offices." },
  { key: "electrician", label: "I am an Electrician", role: "artisan", trade: "electrician", example: "e.g. I have wired homes and shops safely and neatly." },
  { key: "painter", label: "I am a Painter", role: "artisan", trade: "painter", example: "e.g. I have given walls beautiful, smooth finishes." },
  { key: "tiler", label: "I am a Tiler", role: "artisan", trade: "tiler", example: "e.g. I have done beautiful bathroom and floor tiling." },
  { key: "carpenter", label: "I am a Carpenter", role: "artisan", trade: "carpenter", example: "e.g. I have crafted furniture and fittings that last." },
  { key: "gypsum-fabricator", label: "I am a Gypsum Fabricator", role: "artisan", trade: "gypsum_installer", example: "e.g. I have made ceilings and partitions that look elegant." },
  { key: "steel-fixer", label: "I am a Steel Fixer", role: "artisan", trade: "other", example: "e.g. I have tied the steel that holds strong buildings together." },
  { key: "roofer", label: "I am a Roofer", role: "artisan", trade: "other", example: "e.g. I have put up roofs that keep families safe and dry." },
  { key: "glass-aluminium", label: "I am a Glass & Aluminium Fitter", role: "artisan", trade: "other", example: "e.g. I have fitted windows and doors that look sharp." },
  { key: "metal-fabricator", label: "I am a Metal Fabricator", role: "artisan", trade: "other", example: "e.g. I have shaped metal into useful, beautiful things." },
  { key: "landscaper", label: "I am a Landscaper", role: "artisan", trade: "other", example: "e.g. I have turned bare ground into beautiful green spaces." },
  // Learners
  { key: "student", label: "I am a Student", role: "professional_young", example: "e.g. I am learning my craft and hungry to grow." },
  { key: "other", label: "I do something else (type it below)", role: "artisan", trade: "other", example: "Tell us something you have made or done that you are proud of." },
];

/** Highest tier wins the role: professional > artisan > student. */
export function deriveRole(keys: string[]): RoleValue {
  const roles = keys
    .map((k) => PROFESSIONS.find((p) => p.key === k)?.role)
    .filter(Boolean) as RoleValue[];
  if (roles.includes("professional_exp")) return "professional_exp";
  if (roles.includes("artisan")) return "artisan";
  return "professional_young";
}

export const EDUCATION_OPTIONS = [
  "Never went to school",
  "Primary school",
  "Secondary school",
  "Certificate",
  "Diploma",
  "Bachelor's degree",
  "Master's degree",
  "PhD / Doctorate",
];
export const EMPLOYMENT_OPTIONS = ["Employed", "Business owner / Entrepreneur", "Freelancer", "Student", "Other"];
export const YEARS_OPTIONS = ["Less than 1 year", "1–3 years", "3–5 years", "5–10 years", "More than 10 years"];
