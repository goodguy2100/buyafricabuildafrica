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
    name: "BABA Sustainability & Green Building Initiative",
    tagline: "Building Resilient Cities and Communities for Future Generations",
    description: "Promoting practical solutions that support climate resilience, environmental stewardship, sustainable construction, and healthier communities.",
    icon: Leaf,
    focus: [
      "Green Building",
      "Climate Resilience",
      "Sustainable Urban Development",
      "Circular Economy",
      "Resource Efficiency",
      "Green Skills Development",
      "Community Sustainability",
    ],
  },
  {
    key: "events",
    name: "BABA Events & Recognition Platform",
    tagline: "Connecting Ideas, Opportunities and Excellence",
    description: "An annual engagement framework bringing together leaders, professionals, businesses, institutions, and communities to collaborate and celebrate excellence.",
    icon: Award,
    focus: [
      "Corporate Strategy Summit",
      "Expo & Conference",
      "Excellence Awards",
      "Industry Showcases",
      "Professional Recognition",
      "Business Matching",
    ],
  },
  {
    key: "research",
    name: "BABA Research, Innovation & Implementation Hub",
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
