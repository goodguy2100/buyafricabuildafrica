/**
 * DEFAULT events — fallback/seed content only.
 *
 * The live events list is managed in the admin panel (Admin → Events) and
 * stored in Supabase (opportunities table, kind = 'event'). These defaults
 * are shown only while the database has no matching events, so the site
 * never looks broken before an admin adds or updates events.
 *
 * Dates are YYYYMMDD for sorting and calendar (ICS) exports.
 * - Gardens Expo = client-confirmed Aug 28, 2026 (Sarit Centre)
 * - The Showground = Nairobi International Trade Fair (28 Sep–4 Oct, Jamhuri Park)
 * - Build Expo (8–10 Jul 2026) deliberately NOT in defaults — it has passed.
 */

export interface DefaultEvent {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  description: string;
  iconKey: string;
  start: string; // YYYYMMDD
  end: string; // YYYYMMDD
}

export const defaultEvents: DefaultEvent[] = [
  {
    id: "default-gardens-expo",
    title: "Gardens Expo & Conference",
    dateLabel: "August 28, 2026",
    location: "Sarit Centre, Nairobi",
    description:
      "A celebration of landscaping, garden design and sustainable green spaces.",
    iconKey: "sparkles",
    start: "20260828",
    end: "20260828",
  },
  {
    id: "default-showground",
    title: "The Showground",
    dateLabel: "28 September – 4 October 2026",
    location: "Jamhuri Park Showground, Nairobi",
    description:
      "The Nairobi International Trade Fair — Kenya's premier national trade and agricultural exhibition, bringing together enterprise, innovation and value addition.",
    iconKey: "landmark",
    start: "20260928",
    end: "20261004",
  },
  {
    id: "default-baba-launch",
    title: "Official BABA Launch",
    dateLabel: "1st week of December 2026",
    location: "Nairobi, Kenya",
    description: "The official launch of Buy Africa Build Africa.",
    iconKey: "rocket",
    start: "20261201",
    end: "20261201",
  },
  {
    id: "default-excellence-awards",
    title: "BABA Excellence Awards",
    dateLabel: "1st December 2026",
    location: "To be announced",
    description: "An evening gala celebrating those building Africa.",
    iconKey: "award",
    start: "20261201",
    end: "20261201",
  },
];
