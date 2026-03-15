import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

// Import the expanded dataset
// Note: Ensure your data/db.js uses 'export const' for all these arrays
import { users, orders, tickets, products } from "./data/db.js";

const server = new Server(
  { name: "enterprise-data-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

/**
 * 1. Define the Toolset
 * This tells the AI what "capabilities" it has.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_all_users",
      description: "Returns a complete list of all users in the system with their IDs, names, and roles.",
      inputSchema: { type: "object", properties: {} }
    },
    {
      name: "get_user_info",
      description: "Get detailed profile information for a specific user ID, including location and email.",
      inputSchema: {
        type: "object",
        properties: { userId: { type: "string" } },
        required: ["userId"]
      }
    },
    {
      name: "get_user_orders",
      description: "Retrieve all purchase history for a specific user. Includes SKUs, quantity, and dates.",
      inputSchema: {
        type: "object",
        properties: { userId: { type: "string" } },
        required: ["userId"]
      }
    },
    {
      name: "get_user_tickets",
      description: "List all support tickets (complaints/issues) filed by a user. Shows status and priority.",
      inputSchema: {
        type: "object",
        properties: { userId: { type: "string" } },
        required: ["userId"]
      }
    },
    {
      name: "get_product_catalog",
      description: "Returns the full product list, including prices, categories, and real-time stock levels.",
      inputSchema: { type: "object", properties: {} }
    }
  ]
}));

/**
 * 2. Implement the Tool Logic
 * This handles the actual data retrieval when the AI calls a tool.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "get_all_users":
        return { content: [{ type: "text", text: JSON.stringify(users, null, 2) }] };

      case "get_user_info":
        const user = users.find(u => u.id === args.userId);
        return { 
          content: [{ type: "text", text: user ? JSON.stringify(user) : `Error: User ${args.userId} not found.` }] 
        };

      case "get_user_orders":
        const userOrders = orders.filter(o => o.userId === args.userId);
        // Link with product names for better AI context
        const enrichedOrders = userOrders.map(order => ({
          ...order,
          productName: products.find(p => p.sku === order.sku)?.name || "Unknown Product"
        }));
        return { content: [{ type: "text", text: JSON.stringify(enrichedOrders) }] };

      case "get_user_tickets":
        const userTickets = tickets.filter(t => t.userId === args.userId);
        return { content: [{ type: "text", text: JSON.stringify(userTickets) }] };

      case "get_product_catalog":
        return { content: [{ type: "text", text: JSON.stringify(products, null, 2) }] };

      default:
        throw new Error(`Tool ${name} not implemented.`);
    }
  } catch (error) {
    return {
      content: [{ type: "text", text: `Runtime Error: ${error.message}` }],
      isError: true
    };
  }
});

/**
 * 3. Start the Server
 */
const transport = new StdioServerTransport();
await server.connect(transport);
console.error("MCP Data Server running on stdio");