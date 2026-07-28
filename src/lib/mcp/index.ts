import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getMyProfile from "./tools/get-my-profile";
import listOpportunities from "./tools/list-opportunities";
import getOpportunity from "./tools/get-opportunity";
import listNews from "./tools/list-news";
import createNewsArticle from "./tools/create-news-article";
import fetchUrl from "./tools/fetch-url";

// The OAuth issuer MUST be the direct Supabase host (not the .lovable.cloud proxy).
// VITE_SUPABASE_PROJECT_ID is inlined by Vite at build time.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "baba-mcp",
  title: "Buy Africa Build Africa",
  version: "0.2.0",
  instructions:
    "Tools for the Buy Africa Build Africa (BABA) platform. Read: `list_opportunities`, `get_opportunity`, `list_news`, `get_my_profile`. Research: `fetch_url` to read a public web page. Write (admin only): `create_news_article` posts a finished article into the BABA newsroom — draft the piece yourself (title, summary, 3-5 paragraph body, topic tag, optional source_url) and call the tool with `publish: true` to publish immediately or `publish: false` to save as a draft.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    getMyProfile,
    listOpportunities,
    getOpportunity,
    listNews,
    fetchUrl,
    createNewsArticle,
  ],
});
