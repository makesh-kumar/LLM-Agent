import { GoogleGenerativeAI } from "@google/generative-ai";
import { config } from "./config.js"; // Import the common config
// Initialize Gemini
const genAI = new GoogleGenerativeAI(config.apiKey);
const model = genAI.getGenerativeModel({ model: config.model });

/**
 * @param {string} userInput - What the human typed
 * @param {Array} mcpTools - The list of tools we got from the MCP Server
 */
export async function getAiResponse(userInput, mcpTools) {
  // 1. Convert MCP tool format to Gemini tool format
  const googleTools = {
    functionDeclarations: mcpTools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    })),
  };

  // 2. Start a chat with the tools enabled
  const chat = model.startChat({
    tools: [googleTools],
  });

  // 3. Send the message
  const result = await chat.sendMessage(userInput);
  const response = result.response;

  // 4. Check if Gemini wants to call a tool
  const call = response.candidates[0].content.parts.find(p => p.functionCall);

  return {
    text: response.text(),
    functionCall: call ? call.functionCall : null,
    chat: chat // Return the chat object so we can send the tool result back later
  };
}