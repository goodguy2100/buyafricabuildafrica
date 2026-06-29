import {
  Users,
  BookOpen,
  Leaf,
  Award,
  Lightbulb,
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
    key: "network",
    name: "Membership & Industry Network",
    tagline: "Connecting Africa's People, Skills and Opportunities",
    description: "A platform for collaboration, visibility, professional growth, enterprise development, and industry engagement across Africa.",
    icon: Users,
    focus: [
      "Professional Visibility",
      "Networking Opportunities",
      "Industry Connections",
      "Business Opportunities",
      "Strategic Partnerships",
      "Market Access",
      "Industry Recognition",
    ],
  },
  {
    key: "capacity",
    name: "\u00a0Capacity Building Hub",
    tagline: "Building Skills. Strengthening Enterprises. Empowering Communities.",
    description: "Developing the skills, knowledge, leadership, and entrepreneurial capabilities needed to drive Africa's growth.",
    icon: BookOpen,
    focus: [
      "Technical Skills Development",
      "Entrepreneurship Development",
      "Financial Literacy",
      "Business Growth",
      "Leadership Development",
      "Digital Skills",
      "Sustainability Education",
    ],
  },
  {
    key: "sustainability",
    name: "\u00a0Sustainability & Green Building Initiative",
...
    name: "\u00a0Events & Recognition Platform",
...
    name: "Research, Innovation & Implementation Hub",
    tagline: "Turning Ideas Into Action",
    description: "Ensuring that ideas, discussions, and recommendations translate into practical action and measurable impact across Africa.",
    icon: Lightbulb,
    focus: [
      "Sustainable Cities",
      "Affordable Housing",
      "Youth Employment",
      "Skills Development",
      "SME Growth",
      "Innovation Ecosystems",
      "Policy Development",
    ],
  },
];
