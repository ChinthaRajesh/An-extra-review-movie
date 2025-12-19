
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { MovieAnalysis, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || "";

export const getMovieAnalysis = async (movieTitle: string): Promise<MovieAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const prompt = `Provide a comprehensive critical consensus and review summary for the movie "${movieTitle}". 
  Identify the general sentiment, key strengths (pros), and common criticisms (cons). 
  Return the result in a clear structure. Include the release year if possible.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.7,
      },
    });

    const text = response.text || "No analysis available.";
    
    // Extract grounding sources
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || "Source",
        uri: chunk.web?.uri || "#"
      }));

    // Simple parsing logic (Gemini 3 Flash is smart, but we help it with a prompt structure if needed, 
    // here we just use AI to summarize based on the text it gives back)
    return parseAIResponse(text, sources);
  } catch (error) {
    console.error("Error fetching movie analysis:", error);
    throw error;
  }
};

const parseAIResponse = (text: string, sources: GroundingSource[]): MovieAnalysis => {
  // A very simple heuristic parser for the generated text
  const pros: string[] = [];
  const cons: string[] = [];
  
  const lines = text.split('\n');
  let currentSection: 'summary' | 'pros' | 'cons' = 'summary';
  let summary = "";

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('pros') || lowerLine.includes('strengths') || lowerLine.includes('what they liked')) {
      currentSection = 'pros';
    } else if (lowerLine.includes('cons') || lowerLine.includes('weaknesses') || lowerLine.includes('criticisms')) {
      currentSection = 'cons';
    } else if (currentSection === 'summary') {
      summary += line + " ";
    } else if (currentSection === 'pros' && (line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))) {
      pros.push(line.replace(/^[-*\d.]+\s*/, '').trim());
    } else if (currentSection === 'cons' && (line.trim().startsWith('-') || line.trim().startsWith('*') || /^\d+\./.test(line.trim()))) {
      cons.push(line.replace(/^[-*\d.]+\s*/, '').trim());
    }
  });

  // Determine sentiment
  let sentiment: 'Positive' | 'Mixed' | 'Negative' = 'Mixed';
  if (pros.length > cons.length + 2) sentiment = 'Positive';
  if (cons.length > pros.length + 1) sentiment = 'Negative';

  return {
    summary: summary.trim() || text.substring(0, 300) + "...",
    pros: pros.slice(0, 5),
    cons: cons.slice(0, 5),
    sentiment,
    sources: sources.slice(0, 5)
  };
};
