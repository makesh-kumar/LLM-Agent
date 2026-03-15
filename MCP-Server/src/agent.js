import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config.js";

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(config.apiKey);
const model = genAI.getGenerativeModel({ model: config.model });

// 2. Initialize MCP Client
const transport = new StdioClientTransport({
  command: "node",
  args: ["src/server.js"],
});
const mcpClient = new Client({ name: "mcp-agent", version: "1.0.0" }, { capabilities: {} });

async function runAgent(userPrompt) {
  await mcpClient.connect(transport);
  
  // Get available tools to tell the LLM what it can do
  const { tools } = await mcpClient.listTools();
  
  // Format tools for Gemini (Simplified for this example)
  const toolDeclarations = tools.map(t => ({
    name: t.name,
    description: t.description,
    parameters: t.inputSchema
  }));
  

  // Start a chat session
  let chat = model.startChat({
    tools: [{ functionDeclarations: toolDeclarations }],
  });

  console.log(`\n👤 User: ${userPrompt}`);
  let result = await chat.sendMessage(userPrompt);
  let response = result.response;

  // --- THE AGENTIC LOOP ---
  // Keep going as long as the LLM returns "functionCalls"
  while (response.functionCalls()) {
    const calls = response.functionCalls();
    const toolResults = [];

    for (const call of calls) {
      console.log(`\n🤖 AI is calling tool: ${call.name}...`);
      
      // Execute tool on our MCP Server
      const toolOutput = await mcpClient.callTool({
        name: call.name,
        arguments: call.args
      });

      console.log(`📦 Server returned data for ${call.name}`);

      toolResults.push({
        functionResponse: {
          name: call.name,
          response: { content: toolOutput.content[0].text }
        }
      });
    }

    // Send the tool results back to the LLM
    result = await chat.sendMessage(toolResults);
    response = result.response;
  }

  // Final Answer
  console.log(`\n✨ AI Answer: ${response.text()}`);
  process.exit();
}

const prompt = "what are different kind of products available";

runAgent(prompt);