import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createCanyonMcpServer } from "./server.js";

async function main() {
  const server = createCanyonMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Canyon MCP server failed:", error);
  process.exit(1);
});
