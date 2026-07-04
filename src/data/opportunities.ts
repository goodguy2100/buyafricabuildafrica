export type Kind = "Trainings" | "Masterclasses" | "Events";

export interface Opp {
  id: number;
  kind: Kind;
  title: string;
  org: string;
  location: string;
  meta: string;
  description: string;
  requirements: string[];
  cta: "apply" | "register";
}

export const opportunities: Opp[] = [
  {
    id: 1,
    kind: "Trainings",
    title: "Advanced Masonry Training",
    org: "BABA Skills Academy",
    location: "Online + Nairobi",
    meta: "Runs every other month · Certificate",
    description:
      "A hands-on, competency-based programme covering advanced brick and block work, structural detailing, and modern finishing techniques. Delivered by master masons with site-based assessment and a recognised certificate on completion.",
    requirements: [
      "Basic literacy and numeracy",
      "Prior exposure to construction site work is an advantage",
      "Ability to attend the in-person Nairobi practical sessions",
    ],
    cta: "apply",
  },
  {
    id: 2,
    kind: "Trainings",
    title: "Green Building Fundamentals",
    org: "BABA Skills Academy",
    location: "Online",
    meta: "Every other month · Bi-monthly",
    description:
      "Learn the principles of sustainable construction — energy efficiency, low-carbon materials, water conservation and green certification pathways relevant to the African context.",
    requirements: [
      "Stable internet connection for live online sessions",
      "Interest in sustainable design and construction",
    ],
    cta: "apply",
  },
  {
    id: 3,
    kind: "Trainings",
    title: "Tiling & Finishing Workshop",
    org: "BABA Skills Academy",
    location: "Nairobi, Kenya",
    meta: "Every other month · Certificate",
    description:
      "Master ceramic and porcelain tiling, geometric layouts, grouting and premium finishing. Includes a practical portfolio piece and certification.",
    requirements: [
      "Comfortable with basic hand tools",
      "Attendance at all practical sessions",
    ],
    cta: "apply",
  },
  {
    id: 4,
    kind: "Trainings",
    title: "Electrical & Solar Installation",
    org: "BABA Skills Academy",
    location: "Online + Nairobi",
    meta: "Bi-monthly · Sign up",
    description:
      "Wiring fundamentals, safety standards and solar PV installation for residential and small commercial projects, with a focus on employability and self-employment.",
    requirements: [
      "Basic understanding of electricity is helpful",
      "Commitment to safety procedures",
    ],
    cta: "apply",
  },
  {
    id: 5,
    kind: "Trainings",
    title: "Plumbing & Pipe Fitting",
    org: "BABA Skills Academy",
    location: "Nairobi, Kenya",
    meta: "Every other month · Certificate",
    description:
      "Practical plumbing skills — pipe fitting, drainage, fixtures and maintenance — taught to industry standard with certification.",
    requirements: ["Physical fitness for site work", "Attendance at practical sessions"],
    cta: "apply",
  },
  {
    id: 6,
    kind: "Trainings",
    title: "Welding & Metal Fabrication",
    org: "BABA Skills Academy",
    location: "Nairobi, Kenya",
    meta: "Bi-monthly · Sign up",
    description:
      "Arc and MIG welding, metal fabrication and safety practices for structural and decorative metalwork.",
    requirements: ["No prior experience required", "Protective attire provided on site"],
    cta: "apply",
  },
  {
    id: 7,
    kind: "Trainings",
    title: "Carpentry & Wood Finishing",
    org: "BABA Skills Academy",
    location: "Nairobi, Kenya",
    meta: "Every other month · Certificate",
    description:
      "Joinery, furniture making and premium wood finishing with an emphasis on quality craftsmanship and market readiness.",
    requirements: ["Interest in woodworking", "Attendance at all sessions"],
    cta: "apply",
  },
  {
    id: 8,
    kind: "Trainings",
    title: "Gypsum & Drywall Installation",
    org: "BABA Skills Academy",
    location: "Nairobi, Kenya",
    meta: "Bi-monthly · Sign up",
    description:
      "Ceiling and partition systems, cornices and decorative gypsum finishing for interior fit-out work.",
    requirements: ["Comfortable working at height", "Attendance at practical sessions"],
    cta: "apply",
  },
  {
    id: 9,
    kind: "Masterclasses",
    title: "Sustainable Design Masterclass",
    org: "BABA Capacity Building Hub",
    location: "Nairobi, Kenya",
    meta: "1 day · Sign up",
    description:
      "An intensive one-day masterclass on sustainable design thinking, led by leading practitioners, with case studies from across the continent.",
    requirements: ["Open to professionals and students", "Register in advance"],
    cta: "register",
  },
  {
    id: 10,
    kind: "Masterclasses",
    title: "Entrepreneurship & Business Growth",
    org: "BABA Capacity Building Hub",
    location: "Online",
    meta: "Live session · Sign up",
    description:
      "Grow your construction or trade business — pricing, marketing, financing and scaling — in a live, interactive session.",
    requirements: ["Own or plan to start a business", "Join the live online session"],
    cta: "register",
  },
  {
    id: 11,
    kind: "Events",
    title: "Gardens Expo & Conference",
    org: "Buy Africa Build Africa",
    location: "Sarit Centre, Nairobi",
    meta: "26–30 Aug 2026 · Register",
    description:
      "A flagship five-day expo and conference bringing together the entire BABA ecosystem — exhibitors, professionals, artisans, partners and buyers.",
    requirements: ["Open to all", "Register to attend or exhibit"],
    cta: "register",
  },
  {
    id: 12,
    kind: "Events",
    title: "BABA Industry Networking Meetup",
    org: "Buy Africa Build Africa",
    location: "Nairobi, Kenya",
    meta: "Free · Sign up to attend",
    description:
      "A free evening networking meetup connecting members across the construction value chain.",
    requirements: ["Free to attend", "Sign up to reserve a place"],
    cta: "register",
  },
];

export const kinds: ("All" | Kind)[] = ["All", "Trainings", "Masterclasses", "Events"];

export function getOpportunity(id: number): Opp | undefined {
  return opportunities.find((o) => o.id === id);
}
