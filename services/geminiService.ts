import { GoogleGenAI, Modality, Type } from "@google/genai";
import { NaatResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Text Generation ---

export const generateNaatText = async (topic: string): Promise<NaatResponse> => {
  try {
    const prompt = `
      Write a beautiful, professional, and spiritually uplifting Naat (Islamic poem praising Prophet Muhammad PBUH) in Urdu about the topic: "${topic}".
      
      Requirements:
      1. Strictly follow traditional Urdu poetry rules (Sher, Radif, Qaafiya).
      2. The tone must be respectful, emotional, and high-quality literature.
      3. Provide the response in a structured JSON format.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a world-class Urdu poet and scholar specializing in Hamd and Naat. Your vocabulary is rich and your style is classic.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "A poetic title for the Naat in Urdu" },
            urduLyrics: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Array of couplets (shers). Each string is one full line or two lines separated by newline." 
            },
            transliteration: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Roman Urdu transliteration corresponding to the lyrics" 
            },
            englishTranslation: { type: Type.STRING, description: "A summary of the Naat's meaning in English" }
          },
          required: ["title", "urduLyrics", "transliteration", "englishTranslation"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as NaatResponse;
    }
    throw new Error("No content generated");
  } catch (error) {
    console.error("Error generating Naat text:", error);
    throw error;
  }
};

// --- Audio Generation ---

export const generateNaatAudio = async (text: string): Promise<AudioBuffer> => {
  try {
    // We limit the text length for the preview model to ensure stability and speed
    const textToSpeak = text.slice(0, 600); 

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: textToSpeak }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Kore tends to have a deeper tone suitable for poetry
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    const audioBuffer = await decodeAudioData(
      decode(base64Audio),
      outputAudioContext,
      24000,
      1
    );

    return audioBuffer;
  } catch (error) {
    console.error("Error generating audio:", error);
    throw error;
  }
};

// --- Audio Helpers ---

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
