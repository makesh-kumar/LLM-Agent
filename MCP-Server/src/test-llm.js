import { GoogleGenerativeAI } from "@google/generative-ai";

// Replace with your actual key
const API_KEY = "AIzaSyBoAM3KdBRL1y4965MxQiu4t0sqU4rhRwU"; 

// We will try the most stable 2026 free model first
const MODEL_NAME = "gemini-2.5-flash"; 

async function testConnection() {
  console.log(`Testing model: ${MODEL_NAME}...`);
  
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });

  try {
    const result = await model.generateContent("Say 'System Online' if you can hear me.");
    const response = await result.response;
    const text = response.text();
    
    console.log("-----------------------------------");
    console.log("✅ SUCCESS!");
    console.log("AI Response:", text);
    console.log("-----------------------------------");
  } catch (error) {
    console.error("❌ FAILED");
    console.error("Error Message:", error.message);
    
    if (error.message.includes("429") || error.message.includes("limit: 0")) {
      console.log("\n💡 SUGGESTION: Your account might be restricted on this specific model.");
      console.log("Try changing MODEL_NAME to 'gemini-2.5-flash-lite' or 'gemini-1.5-flash'.");
    }
  }
}

testConnection();