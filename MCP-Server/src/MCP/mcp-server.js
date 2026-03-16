import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { 
    CallToolRequestSchema, 
    ListToolsRequestSchema,
    McpError,
    ErrorCode 
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'database.json');

const server = new Server(
    { name: "relational-data-server", version: "1.0.0" },
    { capabilities: { tools: {} } }
);

async function readDb() {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (e) {
        console.error("[Server]: DB Read Error, returning empty state");
        return { users: [], orders: [], payments: [] };
    }
}

// 1. Define Tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "list_users",
            description: "Returns all users",
            inputSchema: { type: "object", properties: {} }
        },
        {
            name: "get_user_orders",
            description: "Get orders for a user ID",
            inputSchema: {
                type: "object",
                properties: { userId: { type: "string" } },
                required: ["userId"]
            }
        }
    ]
}));

// 2. Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const db = await readDb();
    const { name, arguments: args } = request.params;

    console.error(`[Server]: Tool Called -> ${name}`);

    switch (name) {
        case "list_users":
            return { content: [{ type: "text", text: JSON.stringify(db.users) }] };
        
        case "get_user_orders":
            const orders = db.orders.filter(o => o.userId === args.userId);
            return { content: [{ type: "text", text: JSON.stringify(orders) }] };

        default:
            throw new McpError(ErrorCode.MethodNotFound, "Tool not found");
    }
});

// 3. Start Server
async function main() {
    const transport = new StdioServerTransport();
    try {
        await server.connect(transport);
        console.error("🚀 MCP Server Ready and Listening on Stdio");
    } catch (err) {
        console.error("❌ Server Crash:", err);
    }
}

main();