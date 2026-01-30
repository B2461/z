
import { GoogleGenAI, Type, Modality } from "@google/genai";
// Fix: UserInput, Reading, and Place are now available in types.ts
import { DivinationType, UserInput, Reading, Place } from '../types';

/**
 * Utility to convert a file to base64 for Gemini
 */
const fileToGenerativePart = async (file: File) => {
  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64Data,
      mimeType: file.type,
    },
  };
};

/**
 * Generates an AI response based on the tool type and user input.
 * Returns a structured object with Past, Present, and Future sections.
 */
export const generateReading = async (type: DivinationType, input: UserInput): Promise<Reading> => {
    // Fix: Updated initialization and model selection to follow guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt = "";

    // Default Prompt for General Tools
    prompt = `You are an expert spiritual consultant and Vedic scholar specializing in ${type}. 
    Based on the following details, provide a deep, accurate, and culturally resonant response in HINDI:
    - User Name: ${input.name || 'Anonymous'}
    - Question/Context: ${input.question || 'Overall life guidance'}
    ${input.dob ? `- Birth Date: ${input.dob}` : ''}
    ${input.timeOfBirth ? `- Birth Time: ${input.timeOfBirth}` : ''}
    ${input.placeOfBirth ? `- Birth Place: ${input.placeOfBirth}` : ''}
    ${input.zodiacSign ? `- Zodiac: ${input.zodiacSign}` : ''}
    ${input.selectedZodiac ? `- Selected Sign: ${input.selectedZodiac}` : ''}

    You MUST strictly return your answer in three distinct JSON fields:
    1. "past" (भूतकाल): A detailed analysis of the roots, background energies, or past actions influencing the current state.
    2. "present" (वर्तमान): A clear description of current opportunities, obstacles, and general energy.
    3. "future" (भविष्य): A predictive outlook, potential outcomes, and specific actionable advice/remedies.

    Do NOT use Markdown formatting inside the JSON values. Keep the language profound, respectful, and accurate.
    Response Format: { "past": "...", "present": "...", "future": "..." }`;

    // Special Prompts
    if (type === DivinationType.SKILL_LEARNING) {
        prompt = `Act as an expert Career Counselor and Skill Coach in Hindi.
        User wants to learn about: "${input.question}".
        Provide a structured roadmap.
        Return answer in JSON:
        1. "past": "Introduction to the skill & Prerequisites (परिचय और आवश्यकताएं)"
        2. "present": "Roadmap & Learning Resources (कैसे सीखें और रिसोर्सेज)"
        3. "future": "Career Opportunities & Earning Potential (करियर और कमाई)"`;
    }
    else if (type === DivinationType.BUSINESS_MOTIVATION) {
        const topic = input.question || "General Success";
        prompt = `Write a powerful, short MOTIVATIONAL STORY about a successful businessman in the field of "${topic}" in Hindi.
        Return answer in JSON:
        1. "past": "The Struggle & Beginning (संघर्ष और शुरुआत)"
        2. "present": "The Turning Point & Strategy (महत्वपूर्ण मोड़ और रणनीति)"
        3. "future": "The Success & Lesson (सफलता और सीख)"`;
    }
    else if (type === DivinationType.AUDIO_STORY) {
        prompt = `Write an engaging, immersive story in Hindi about "${input.question}".
        It should be suitable for reading aloud (Audio Story format).
        Return answer in JSON:
        1. "past": "Story Beginning (कहानी की शुरुआत - पात्र और सेटिंग)"
        2. "present": "The Conflict/Climax (मुख्य घटना)"
        3. "future": "Conclusion (निष्कर्ष)"`;
    }
    // Fix: DivinationType now contains PALMISTRY and AI_FACE_READING
    else if (type === DivinationType.PALMISTRY && input.image) {
        const imagePart = await fileToGenerativePart(input.image);
        prompt = `Act as an expert Palmist (Hast Rekha Shastri). Analyze this palm image meticulously.
        Identify the Life Line, Heart Line, Head Line, and Fate Line.
        Provide a detailed reading in HINDI.
        Return the answer in this JSON structure:
        1. "past": Analysis of early life indications and foundational traits visible in the lines.
        2. "present": Current life phase, health, and career indications.
        3. "future": Future possibilities, longevity, and wealth indications based on the lines.`;
        
        let contents = { parts: [imagePart, { text: prompt }] };
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents,
            config: { responseMimeType: "application/json" }
        });
        const text = response.text;
        if (!text) throw new Error("No response");
        const json = JSON.parse(text);
        return { past: json.past, present: json.present, future: json.future, result: "" };
    } 
    else if (type === DivinationType.AI_FACE_READING && input.image) {
        const imagePart = await fileToGenerativePart(input.image);
        prompt = `Act as an expert Face Reader (Samudrik Shastra). Analyze this face image.
        Examine the forehead, eyes, nose, and chin.
        Provide a detailed reading in HINDI.
        Return the answer in this JSON structure:
        1. "past": Innate nature, childhood influences, and inherent strengths.
        2. "present": Current temperament, stress levels, and personality traits.
        3. "future": Potential for success, relationships, and health based on facial features.`;
        
        let contents = { parts: [imagePart, { text: prompt }] };
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: contents,
            config: { responseMimeType: "application/json" }
        });
        const text = response.text;
        if (!text) throw new Error("No response");
        const json = JSON.parse(text);
        return { past: json.past, present: json.present, future: json.future, result: "" };
    }

    // Fix: Updated to gemini-3-flash-preview as per guidelines
    let model = 'gemini-3-flash-preview';
    let contents = { parts: [{ text: prompt }] };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: contents,
            config: {
                responseMimeType: "application/json"
            }
        });

        const text = response.text;
        if (!text) throw new Error("No response from AI");
        
        const jsonResponse = JSON.parse(text);
        return {
            past: jsonResponse.past || "जानकारी उपलब्ध नहीं है।",
            present: jsonResponse.present || "जानकारी उपलब्ध नहीं है।",
            future: jsonResponse.future || "जानकारी उपलब्ध नहीं है.",
            result: ""
        };
    } catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("भविष्यवाणी प्राप्त करने में समस्या हुई। कृपया पुनः प्रयास करें।");
    }
};

export const generatePalmImage = async (prompt: string): Promise<string> => {
    // Placeholder as image generation is complex and requires specific model/setup
    return "https://via.placeholder.com/512?text=Palm+Reading+Chart"; 
};

export const generateSpeech = async (text: string): Promise<string> => {
    // Fix: Initialized with process.env.API_KEY
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: text }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });
    
    // Fix: Accessing .text or specific parts correctly based on Modality.AUDIO
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
        return audioData;
    }
    throw new Error("Speech generation failed");
};

export const findLocalExperts = async (query: string): Promise<Place[]> => {
    // Fix: Initialized with process.env.API_KEY and switched to gemini-3-flash-preview
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: `Find 5 popular ${query}. Return ONLY a JSON array of objects with 'name' and 'address' fields.` }] }],
        config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json"
        }
    });

    try {
        const text = response.text;
        return JSON.parse(text || "[]");
    } catch (e) {
        console.error(e);
        return [];
    }
};
