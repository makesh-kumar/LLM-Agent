import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import OpenAI from "openai";

// 1. CONFIGURATION - Change the model name here once to update the whole script
const LOCAL_MODEL = "llama3.2"; 

const ollama = new OpenAI({
  baseURL: "http://localhost:11434/v1",
  apiKey: "ollama", 
});

// 2. MCP TRANSPORT SETUP
const transport = new StdioClientTransport({
  command: "node",
  args: ["src/server.js"],
});

const mcpClient = new Client({ name: "local-mcp-agent", version: "1.0.0" }, { capabilities: {} });

async function runLocalAgent(userInput) {
  try {
    // Connect to your MCP server
    await mcpClient.connect(transport);
    const { tools } = await mcpClient.listTools();

    // Map tools to Llama-compatible format
    const toolDeclarations = tools.map(t => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema
      }
    }));

    // 3. FIRST CALL: Reasoning
    const response = await ollama.chat.completions.create({
      model: LOCAL_MODEL,
      messages: [
        { role: "system", content: "You are a helpful data assistant. Use tools to answer questions. Be concise." },
        { 
            role: "system", 
            content: `You are a Data Analyst Agent. 
            1. NEVER write code or Python scripts to answer questions. 
            2. Use the provided TOOLS to fetch real data from the system.
            3. To check stock, you must list products first.
            4. If you don't have information, call a tool. Do not guess.` 
        },
        { role: "user", content: userInput }
      ],
      tools: toolDeclarations,
      tool_choice: "auto"
    });

    let message = response.choices[0].message;

    // 4. HANDLE TOOL CALLS
    if (message.tool_calls) {
      const toolResults = [
        { role: "user", content: userInput },
        message
      ];

      for (const toolCall of message.tool_calls) {
        const name = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);

        console.log(`\n🦙 ${LOCAL_MODEL} is using tool: ${name}`);
        
        const toolOutput = await mcpClient.callTool({ name, arguments: args });

        // Add the tool output to the conversation history
        toolResults.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: toolOutput.content[0].text
        });
      }

      // 5. SECOND CALL: Final Summary (Now using the correct variable)
      const finalResponse = await ollama.chat.completions.create({
        model: LOCAL_MODEL,
        messages: toolResults
      });

      console.log("\n✨ Local AI Response:", finalResponse.choices[0].message.content);
    } else {
      console.log("\n✨ Local AI Response:", message.content);
    }

  } catch (error) {
    if (error.status === 404) {
        console.error(`\n❌ Error: Model '${LOCAL_MODEL}' not found. Did you run 'ollama pull ${LOCAL_MODEL}'?`);
    } else {
        console.error("\n❌ Local Agent Error:", error.message);
    }
  }
}

// Get prompt from terminal args
const userPrompt = "Who ordered the Ergonomic Mouse?";
runLocalAgent(userPrompt);