import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// 1. Point to your server
const transport = new StdioClientTransport({
  command: "node",
  args: ["src/server.js"],
});

const client = new Client({ name: "test" ,version: '1.0.0'}, { capabilities: {} });

async function test() {
  // 2. Connect
  await client.connect(transport);

  // 3. Call the tool directly
  const result = await client.callTool({
    name: "get_user_info",
    arguments: { userId: "U123" }
  });

  // 4. Print the result
  console.log("Output from Server:", result.content[0].text);
  
  process.exit();
}

test();