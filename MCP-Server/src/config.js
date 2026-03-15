import dotenv from 'dotenv';
dotenv.config(); // Reads the .env file into process.env

export const config = {
  apiKey: process.env.GEMINI_API_KEY,
  model: process.env.GEMINI_MODEL
};