import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// 1. Initialize the Server
const server = new Server(
  { name: "dummy-db-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 2. Register your "Tool List" handler
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_user_info",
      description: "Retrieve dummy user data",
      inputSchema: {
        type: "object",
        properties: { userId: { type: "string" } },
        required: ["userId"],
      },
    },
  ],
}));

// 3. Register your "Tool Execution" handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get_user_info") {
    return {
      content: [{ type: "text", text: "User: John Doe, Status: Active" }],
    };
  }
  throw new Error("Tool not found");
});

// 4. THE FIX: The new way to connect
async function main() {
  const transport = new StdioServerTransport();
  // In the latest version, we connect the transport to the server explicitly
  await server.connect(transport);
  console.error("Server is running on stdio"); 
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});