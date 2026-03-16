// server.js
import express from 'express';
import { mcpManager } from './MCP/mcp-manager.js'; // Import the bridge
import cors from 'cors';

const app = express();
app.use(cors())
app.use(express.json());
// Get the current connection status and the path being used
app.get('/api/mcp/status', (req, res) => {
    const status = mcpManager.getStatus();
    res.json(status);
});
// ROUTE: The UI calls this to "Turn On" the MCP integration
app.post('/api/mcp/connect', async (req, res) => {
    const { command, args } = req.body;

    // Safety check: ensure we have the minimum requirements to spawn a process
    if (!command || !args || !Array.isArray(args)) {
        return res.status(400).json({ 
            error: "Payload must include 'command' (string) and 'args' (array of strings)." 
        });
    }

    try {
        // Log exactly what we are about to try running
        console.log(`[API]: Connecting to MCP via: ${command} ${args.join(' ')}`);
        
        const result = await mcpManager.connect(command, args);
        res.json(result);
    } catch (err) {
        console.error("[API Error]:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// server.js

app.post('/api/mcp/disconnect', async (req, res) => {
    try {
        await mcpManager.disconnect();
        res.json({ 
            status: "success", 
            message: "MCP Server process terminated successfully" 
        });
    } catch (err) {
        console.error("Disconnect Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// ROUTE: When the LLM needs to use a tool, it uses this internal logic
app.get('/api/mcp/tools', async (req, res) => {
    try {
        const tools = await mcpManager.getTools();
        res.json(tools);
    } catch (err) {
        res.status(400).json({ error: "MCP not connected yet" });
    }
});


app.post('/api/mcp/tools/call', async (req, res) => {
    const { name, arguments: toolArgs } = req.body;
    try {
        const result = await mcpManager.client.callTool({
            name: name,
            arguments: toolArgs
        });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(3000, () => console.log("Main Server running on :3000"));