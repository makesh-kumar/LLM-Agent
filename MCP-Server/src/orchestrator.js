import { getAiResponse } from "./llm.js";

/**
 * The Orchestrator manages the conversation flow.
 * It coordinates between the MCP Client and the Gemini LLM.
 */
export async function runConversation(userInput, mcpClient) {
  // 1. Fetch current tools from the MCP server
  const { tools } = await mcpClient.listTools();

  // 2. Ask Gemini for the initial response/plan
  let aiDecision = await getAiResponse(userInput, tools);

  // 3. The "Agent Loop": While Gemini wants to use tools, keep going
  while (aiDecision.functionCall) {
    const { name, args } = aiDecision.functionCall;
    
    console.log(`\n[Orchestrator] AI is calling tool: ${name}...`);

    // 4. Execute the tool on the MCP Server via the Client
    const toolResult = await mcpClient.callTool({
      name,
      arguments: args
    });

    // 5. Feed the tool output back to Gemini to get the next step
    const result = await aiDecision.chat.sendMessage([{
      functionResponse: {
        name,
        response: { content: toolResult.content }
      }
    }]);

    // 6. Check if Gemini has a final answer or wants another tool
    const response = result.response;
    const nextCall = response.candidates[0].content.parts.find(p => p.functionCall);
    
    aiDecision = {
      text: response.text(),
      functionCall: nextCall ? nextCall.functionCall : null,
      chat: aiDecision.chat
    };
  }

  return aiDecision.text;
}