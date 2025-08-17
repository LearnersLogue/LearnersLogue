/* // controllers/aiMilestoneController.js
import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Access your API key as an environment variable
// Create a .env file and add GEMINI_API_KEY="YOUR_API_KEY"
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Main controller
export const generateMilestoneFromAI = async (req, res) => {
  try {
    const { prompt } = req.body;
    const image = req.file;

    if (!prompt || !image) {
      return res
        .status(400)
        .json({ message: "Both prompt and image are required" });
    }

    // New: One-step multimodal processing with Gemini
    const milestone = await getMilestoneFromGemini(prompt, image.buffer);

    res.status(200).json({
      message: "Milestone generated successfully",
      data: milestone,
    });
  } catch (err) {
    console.error("AI generation error:", err);
    res
      .status(500)
      .json({ message: "Failed to generate milestone", error: err.message });
  }
};

// New function to handle the Gemini 1.5 Pro call
async function getMilestoneFromGemini(prompt, imageBuffer) {
  // For Gemini 1.5 Pro, you need to use the model with the 'pro' suffix
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

  const mimeType = "image/jpeg"; // Assuming you're handling JPEGs. You might need to adjust this.

  // The prompt that combines user context and the desired JSON output
  const fullPrompt = `
You are a highly specialized AI that extracts structured data from a provided image and text.
The image is a document or certificate. The user's text provides additional context.

Based on the image and the user's text, extract the following details into a JSON object.
Ensure the JSON format is strictly adhered to and no additional text is included.

User context: "${prompt}"

Return milestone details in this JSON format:
{
  "title": "",
  "date": "YYYY-MM-DD",
  "type": "Certificate/Award/Course/Achievement",
  "location": "",
  "description": "",
  "awardedBy": "",
  "grade": ""
}
`;

  const result = await model.generateContent([
    fullPrompt,
    {
      inlineData: { data: imageBuffer.toString("base64"), mimeType: mimeType },
    },
  ]);

  const response = await result.response;
  const text = response.text();

  // Parse JSON safely
  try {
    return JSON.parse(text);
  } catch (parseErr) {
    console.error("Failed to parse JSON response:", text);
    // Fallback to a default structure to prevent app crashes
    return {
      title: "Untitled Milestone",
      date: new Date().toISOString().split("T")[0],
      type: "Achievement",
      location: "",
      description: `Could not parse structured data from the response. Raw response: ${text}`,
      awardedBy: "",
      grade: "",
    };
  }
}

*/
