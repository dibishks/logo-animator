
import { GoogleGenAI } from "@google/genai";
import type { AspectRatio } from "../types";

const POLLING_INTERVAL_MS = 5000;

const videoGenerationMessages = [
    "Warming up the animation engine...",
    "Choreographing pixels...",
    "Rendering your masterpiece frame by frame...",
    "Adding a touch of digital magic...",
    "Almost there, polishing the final scene...",
];

// Helper to extract pure base64 data from a data URL
const dataUrlToBase64 = (dataUrl: string): { mimeType: string, data: string } => {
    const parts = dataUrl.split(',');
    if (parts.length !== 2) {
        throw new Error('Invalid data URL format');
    }
    const meta = parts[0].split(';')[0].split(':')[1];
    const data = parts[1];
    return { mimeType: meta, data };
};


export const generateLogo = async (prompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateImages({
    model: 'imagen-4.0-generate-001',
    prompt: `A professional, modern, high-resolution logo for a company. The logo should be on a clean, solid white background. The description is: "${prompt}"`,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/jpeg',
      aspectRatio: '1:1',
    },
  });

  if (!response.generatedImages || response.generatedImages.length === 0) {
    throw new Error('No images were generated.');
  }

  const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
  return base64ImageBytes;
};

export const animateLogo = async (
    prompt: string, 
    logoDataUrl: string, 
    aspectRatio: AspectRatio,
    progressCallback: (message: string) => void
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable is not set.");
    }
    
    // Create a new instance right before the call to use the latest key from the dialog
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const { mimeType, data: imageBase64 } = dataUrlToBase64(logoDataUrl);

    progressCallback(videoGenerationMessages[0]);
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt,
        image: {
            imageBytes: imageBase64,
            mimeType: mimeType,
        },
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio
        }
    });

    let messageIndex = 1;
    while (!operation.done) {
        progressCallback(videoGenerationMessages[messageIndex % videoGenerationMessages.length]);
        messageIndex++;
        await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL_MS));
        try {
            operation = await ai.operations.getVideosOperation({ operation: operation });
        } catch(e: any) {
            if (e.message && e.message.includes("Requested entity was not found")) {
                 // This error often indicates an invalid or unbilled API key.
                 // We re-throw a more user-friendly error.
                 throw new Error("API Key validation failed. Please ensure your selected key is correct and has billing enabled.");
            }
            throw e; // Re-throw other errors
        }
    }

    if (operation.error) {
        throw new Error(`Video generation failed: ${operation.error.message}`);
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

    if (!downloadLink) {
        throw new Error('Video generation finished, but no download link was provided.');
    }
    
    progressCallback("Downloading your animation...");

    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) {
        throw new Error(`Failed to download video file. Status: ${response.statusText}`);
    }
    
    const videoBlob = await response.blob();
    return URL.createObjectURL(videoBlob);
};
