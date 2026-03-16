import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

class MCPManager {
    constructor() {
        this.client = null;
        this.transport = null;
        this.isConnected = false;
        this.currentConfig = null;
    }

 async connect(command, args) {
        if (this.isConnected) await this.disconnect();

        console.error(`[Manager]: Spawning -> ${command} ${args.join(' ')}`);

        try {
            /**
             * If the command is NOT 'node', we don't try to resolve a local file.
             * This allows 'npx' to go out and fetch the package from registry.
             */
            this.transport = new StdioClientTransport({ 
                command: command, 
                args: args 
            });

            // Standard error piping so we can see NPX download progress
            this.transport.stderr?.on('data', (data) => {
                console.error(`[MCP OS Log]: ${data.toString().trim()}`);
            });

            this.client = new Client(
                { name: "universal-mcp-manager", version: "1.0.0" },
                { capabilities: {} }
            );

            // Note: npx might take longer (downloading), so we don't use a tight timeout here
            await this.client.connect(this.transport);

            this.isConnected = true;
            this.currentConfig = { command, args };
            return { status: "success", message: "Bridge Established" };
        } catch (error) {
            this.isConnected = false;
            throw error;
        }
    }

    async disconnect() {
        if (this.transport) {
            await this.transport.close();
            this.transport = null;
            this.client = null;
            this.isConnected = false;
            this.currentConfig = null;
            console.error('[Manager]: 🔌 Disconnected');
        }
    }

    async getTools() {
        if (!this.isConnected) throw new Error("MCP not connected");
        const { tools } = await this.client.listTools();
        return tools;
    }

    getStatus() {
        return {
            connected: this.isConnected,
            config: this.currentConfig
        };
    }
}

export const mcpManager = new MCPManager();