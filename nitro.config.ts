// Static prerender for GitHub Pages
import { defineNitroConfig } from "nitro/config";

export default defineNitroConfig({
  preset: "github_pages",
  prerender: {
    crawlLinks: true,
    routes: ["/", "/about", "/contact", "/directory", "/events", "/impact", "/opportunities", "/partners", "/pillars", "/register"],
  },
});
