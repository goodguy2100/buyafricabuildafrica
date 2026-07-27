import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { opportunities, type Kind } from "@/data/opportunities";

const KIND_VALUES = ["Trainings", "Masterclasses", "Events"] as const satisfies readonly Kind[];

export default defineTool({
  name: "list_opportunities",
  title: "List opportunities",
  description: "List Buy Africa Build Africa opportunities (trainings, masterclasses, events). Optionally filter by kind or search text.",
  inputSchema: {
    kind: z.enum(KIND_VALUES).optional().describe("Filter by opportunity kind."),
    search: z.string().optional().describe("Case-insensitive text match on title, org or description."),
    limit: z.number().int().min(1).max(50).optional().describe("Max items to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ kind, search, limit }) => {
    const needle = search?.trim().toLowerCase();
    let items = opportunities.slice();
    if (kind) items = items.filter((o) => o.kind === kind);
    if (needle) {
      items = items.filter((o) =>
        [o.title, o.org, o.description, o.location].some((v) => v.toLowerCase().includes(needle)),
      );
    }
    const trimmed = items.slice(0, limit ?? 20).map((o) => ({
      id: o.id,
      kind: o.kind,
      title: o.title,
      org: o.org,
      location: o.location,
      meta: o.meta,
      cta: o.cta,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(trimmed, null, 2) }],
      structuredContent: { items: trimmed, total: items.length },
    };
  },
});
