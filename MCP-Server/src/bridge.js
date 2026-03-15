import express from 'express';
import cors from 'cors';
import OpenAI from "openai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const app = express();
app.use(cors());
app.use(express.json());

// --- CONFIG ---
const USE_GEMINI = false; 
const config = {
  apiKey: USE_GEMINI ? "YOUR_GEMINI_API_KEY" : "ollama",
  baseURL: USE_GEMINI ? "https://generativelanguage.googleapis.com/v1beta/openai/" : "http://localhost:11434/v1",
  model: USE_GEMINI ? "gemini-1.5-flash" : "llama3.2"
};

const aiClient = new OpenAI({ apiKey: config.apiKey, baseURL: config.baseURL });

const transport = new StdioClientTransport({
  command: "node",
  args: ["src/server.js"], 
});
const mcpClient = new Client({ name: "universal-bridge", version: "1.0.0" }, { capabilities: {} });

async function init() {
  try {
    await mcpClient.connect(transport);
    console.log(`✅ Bridge connected. Using: ${config.model}`);
  } catch (e) { console.error("MCP Connection Failed", e); }
}
init();

app.post('/ask', async (req, res) => {
  try {
    const { prompt } = req.body;
    const { tools } = await mcpClient.listTools();

    const response = await aiClient.chat.completions.create({
      model: config.model,
      messages: [{ role: "user", content: prompt }],
      tools: tools.map(t => ({
        type: "function",
        function: { name: t.name, description: t.description, parameters: t.inputSchema }
      })),
    });

    const message = response.choices[0].message;

    if (message.tool_calls) {
      const toolResults = [];
      const toolNames = [];

      for (const toolCall of message.tool_calls) {
        toolNames.push(toolCall.function.name);
        const result = await mcpClient.callTool({
          name: toolCall.function.name,
          arguments: JSON.parse(toolCall.function.arguments)
        });

        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          tool_name: toolCall.function.name,
          content: result.content[0].text
        });
      }

      const finalResponse = await aiClient.chat.completions.create({
        model: config.model,
        messages: [{ role: "user", content: prompt }, message, ...toolResults]
      });

      res.json({ 
        answer: finalResponse.choices[0].message.content, 
        logs: toolResults,
        executedTools: toolNames,
        modelUsed: config.model // <--- ADDED THIS
      });
    } else {
      res.json({ 
        answer: message.content, 
        logs: [], 
        executedTools: [], 
        modelUsed: config.model // <--- AND THIS
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("🌐 Bridge running on http://localhost:3000"));