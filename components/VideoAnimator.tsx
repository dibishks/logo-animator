
import React, { useState, useEffect } from 'react';
import type { AspectRatio } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { VideoCameraIcon, WandIcon } from './IconComponents';

interface VideoAnimatorProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (value: AspectRatio) => void;
  onAnimate: () => void;
  isLoading: boolean;
  videoUrl: string | null;
  progressMessage: string;
  error: string | null;
  clearError: () => void;
}

// FIX: Define the AIStudio interface to resolve the global type conflict.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Declare the aistudio object on the window
declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

export const VideoAnimator: React.FC<VideoAnimatorProps> = ({
  prompt,
  onPromptChange,
  aspectRatio,
  onAspectRatioChange,
  onAnimate,
  isLoading,
  videoUrl,
  progressMessage,
  error,
  clearError,
}) => {
    const [apiKeySelected, setApiKeySelected] = useState(false);
    const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);

    useEffect(() => {
        const checkKey = async () => {
            if (window.aistudio) {
                setIsCheckingApiKey(true);
                try {
                    const hasKey = await window.aistudio.hasSelectedApiKey();
                    setApiKeySelected(hasKey);
                } catch (e) {
                    console.error("Error checking for API key:", e);
                    setApiKeySelected(false);
                } finally {
                    setIsCheckingApiKey(false);
                }
            } else {
                 // aistudio might not be available in all environments
                setApiKeySelected(true); // Assume key is present via env
                setIsCheckingApiKey(false);
            }
        };
        checkKey();
    }, []);

    const handleAnimateClick = async () => {
        clearError(); // Clear previous errors
        if (window.aistudio && !apiKeySelected) {
            try {
                await window.aistudio.openSelectKey();
                // Assume success after dialog opens, user needs to click again
                setApiKeySelected(true); 
                alert("API Key selection is ready. Please click 'Animate Logo' again to start.");
            } catch (e) {
                console.error("API key selection failed", e);
            }
            return;
        }
        onAnimate();
    };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-semibold flex items-center gap-3">
        <span className="bg-indigo-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">2</span>
        Animate Your Logo
      </h2>
      <div className="mt-6 grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
            <div>
                <label htmlFor="animation-prompt" className="block text-sm font-medium text-gray-300">
                    Describe the animation.
                </label>
                <textarea
                    id="animation-prompt"
                    rows={4}
                    className="mt-1 w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow"
                    placeholder="e.g., 'The logo zooms in with a trail of sparkling stardust.'"
                    value={prompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div>
                <span className="block text-sm font-medium text-gray-300">Aspect Ratio</span>
                <div className="mt-2 grid grid-cols-2 gap-3">
                    {(['16:9', '9:16'] as AspectRatio[]).map((ratio) => (
                        <button key={ratio} onClick={() => onAspectRatioChange(ratio)} disabled={isLoading}
                            className={`py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${aspectRatio === ratio ? 'bg-indigo-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>
                            {ratio} {ratio === '16:9' ? '(Landscape)' : '(Portrait)'}
                        </button>
                    ))}
                </div>
            </div>
            <button
                onClick={handleAnimateClick}
                disabled={isLoading || isCheckingApiKey}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
            >
                <WandIcon className="w-5 h-5" />
                {isCheckingApiKey ? 'Verifying...' : isLoading ? 'Animating...' : !apiKeySelected ? 'Select API Key & Animate' : 'Animate Logo'}
            </button>
            {window.aistudio && !apiKeySelected && !isCheckingApiKey &&
                <p className="text-xs text-yellow-400 text-center">Video generation requires an API key with billing enabled. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-300">Learn more</a></p>
            }
        </div>
        <div className={`w-full bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 overflow-hidden ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}>
           {isLoading ? (
                <div className="text-center p-4">
                    <LoadingSpinner />
                    <p className="mt-4 text-gray-300 font-medium">Animating your vision...</p>
                    <p className="mt-2 text-sm text-gray-400">{progressMessage}</p>
                </div>
            ) : videoUrl ? (
                <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
            ) : (
                <div className="text-center text-gray-500 p-4">
                    <VideoCameraIcon className="w-16 h-16 mx-auto" />
                    <p className="mt-2">Your animated logo will appear here</p>
                </div>
            )}
        </div>
      </div>
      {error && !error.includes("logo") && <p className="mt-4 text-red-400 text-center">{error}</p>}
    </div>
  );
};
