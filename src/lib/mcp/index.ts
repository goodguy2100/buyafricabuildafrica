import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listOpportunities from "./tools/list-opportunities";
import getOpportunity from "./tools/get-opportunity";
import listNews from "./tools/list-news";

// The OAuth issuer MUST be the direct Supabase host (not the .lovable.cloud proxy).
// VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "baba-mcp",
  title: "Buy Africa Build Africa",
  version: "0.1.0",
  instructions:
    "Tools for the Buy Africa Build Africa (BABA) platform. Use `list_opportunities` and `get_opportunity` to browse trainings, masterclasses and events; `list_news` to read published articles; `get_my_profile` to fetch the signed-in member's profile.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getMyProfile, listOpportunities, getOpportunity, listNews],
});
