import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { runConversation } from "./orchestrator.js";
// 1. Setup the Transport
// This tells the client how to "spawn" the server we just built
const transport = new StdioClientTransport({
  command: "node",
  args: ["src/server.js"], 
});

// 2. Initialize the Client
const client = new Client(
  { name: "test-client", version: "1.0.0" },
  { capabilities: {} }
);



async function main() {
  await client.connect(transport);
  console.log("🚀 System connected.");

  // Now the client just hands off the work to the orchestrator
  const userQuery = "Who is user U123?";
  const finalAnswer = await runConversation(userQuery, client);

  console.log("\n--- FINAL ANSWER ---");
  console.log(finalAnswer);
}

main().catch(console.error);