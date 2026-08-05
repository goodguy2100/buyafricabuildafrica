import { Hammer, Landmark, type LucideIcon } from "lucide-react";

export interface UpcomingEvent {
  icon: LucideIcon;
  title: string;
  date: string;
  location: string;
  description: string;
}

/**
 * The events the BABA community is tracking — confirmed 2026 dates.
 * Build Expo = Buildexpo Kenya (8-10 Jul, Carnivore Grounds)
 * The Showground = Nairobi International Trade Fair (28 Sep-4 Oct, Jamhuri Park)
 * (Big 5 Construct Kenya removed 2026-08-05 — client unclear on it; re-add only if confirmed.)
 */
export const upcomingEvents: UpcomingEvent[] = [
  {
    icon: Hammer,
    title: "Build Expo",
    date: "8–10 July 2026",
    location: "Carnivore Exhibition Grounds, Nairobi",
    description:
      "Buildexpo Kenya — East Africa's largest building and construction trade fair, showcasing materials, machinery, tools and construction technology.",
  },
  {
    icon: Landmark,
    title: "The Showground",
    date: "28 September – 4 October 2026",
    location: "Jamhuri Park Showground, Nairobi",
    description:
      "The Nairobi International Trade Fair — Kenya's premier national trade and agricultural exhibition, bringing together enterprise, innovation and value addition.",
  },
];
