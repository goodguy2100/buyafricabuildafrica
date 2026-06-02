import {
  Wrench,
  ShoppingBag,
  Building2,
  Leaf,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export interface Pillar {
  key: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  focus: string[];
}

export const pillars: Pillar[] = [
  {
    key: "skills",
    name: "Skills Africa",
    tagline: "Empowering the youth",
    description:
      "Empowering the youth and experienced workers through specialized, technically certified training.",
    icon: Wrench,
    focus: [
      "Technically certified trades",
      "TVET partnerships",
      "Apprenticeships & attachments",
      "Continuous upskilling programs",
    ],
  },
  {
    key: "buy",
    name: "Buy Africa",
    tagline: "Local value first",
    description:
      "Fostering intra-continental trade and supporting home-grown brands and products.",
    icon: ShoppingBag,
    focus: [
      "Home-grown brand directory",
      "Local procurement grids",
      "Intra-continental trade",
      "Verified supplier network",
    ],
  },
  {
    key: "build",
    name: "Build Africa",
    tagline: "Modern infrastructure",
    description:
      "Developing infrastructure and smart cities through localized construction ecosystems.",
    icon: Building2,
    focus: [
      "Localized construction",
      "Smart city development",
      "Affordable housing",
      "Project tendering",
    ],
  },
  {
    key: "green",
    name: "Green Africa",
    tagline: "Sustainable by design",
    description:
      "Leading sustainable development and eco-friendly manufacturing practices.",
    icon: Leaf,
    focus: [
      "Recycling systems",
      "Renewable energy",
      "Eco-materials",
      "Climate-resilient design",
    ],
  },
  {
    key: "prosper",
    name: "Prosper Africa",
    tagline: "Shared prosperity",
    description:
      "Driving economic empowerment and financial inclusion across all worker levels.",
    icon: TrendingUp,
    focus: [
      "SME loans & financing",
      "Financial inclusion",
      "Wealth creation",
      "Cooperative investment",
    ],
  },
];
