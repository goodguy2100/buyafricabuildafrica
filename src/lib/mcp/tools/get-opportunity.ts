import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { opportunities } from "@/data/opportunities";

export default defineTool({
  name: "get_opportunity",
  title: "Get opportunity details",
  description: "Fetch the full description, requirements, location and CTA for a single BABA opportunity by id.",
  inputSchema: {
    id: z.number().int().positive().describe("Opportunity id from list_opportunities."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ id }) => {
    const opp = opportunities.find((o) => o.id === id);
    if (!opp) {
      return { content: [{ type: "text", text: `Opportunity ${id} not found` }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(opp, null, 2) }],
      structuredContent: opp,
    };
  },
});
