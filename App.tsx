
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { LogoGenerator } from './components/LogoGenerator';
import { VideoAnimator } from './components/VideoAnimator';
import { generateLogo, animateLogo } from './services/geminiService';
import type { AspectRatio } from './types';
import { ArrowDownIcon } from './components/IconComponents';

function App() {
  const [logoDescription, setLogoDescription] = useState<string>('');
  const [animationPrompt, setAnimationPrompt] = useState<string>('Make the logo gently float and shimmer with a subtle glow.');
  const [generatedLogoUrl, setGeneratedLogoUrl] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  
  const [isGeneratingLogo, setIsGeneratingLogo] = useState<boolean>(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState<boolean>(false);
  const [videoGenerationProgress, setVideoGenerationProgress] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerateLogo = useCallback(async () => {
    if (!logoDescription) {
      setError('Please enter a description for your logo.');
      return;
    }
    setError(null);
    setIsGeneratingLogo(true);
    setGeneratedLogoUrl(null);
    setGeneratedVideoUrl(null);

    try {
      const base64Image = await generateLogo(logoDescription);
      setGeneratedLogoUrl(`data:image/jpeg;base64,${base64Image}`);
    } catch (e) {
      console.error(e);
      setError('Failed to generate logo. Please try again.');
    } finally {
      setIsGeneratingLogo(false);
    }
  }, [logoDescription]);
  
  const handleImageUpload = (file: File) => {
    setError(null);
    setGeneratedVideoUrl(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setGeneratedLogoUrl(reader.result as string);
    };
    reader.onerror = () => {
        setError("Failed to read the uploaded file.");
    };
    reader.readAsDataURL(file);
  };

  const handleAnimateLogo = useCallback(async () => {
    if (!generatedLogoUrl) {
      setError('Please generate or upload a logo first.');
      return;
    }
    if (!animationPrompt) {
        setError('Please enter a prompt for the animation.');
        return;
    }

    setError(null);
    setIsGeneratingVideo(true);
    setGeneratedVideoUrl(null);

    const progressCallback = (message: string) => {
        setVideoGenerationProgress(message);
    };

    try {
      const videoUrl = await animateLogo(animationPrompt, generatedLogoUrl, aspectRatio, progressCallback);
      setGeneratedVideoUrl(videoUrl);
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || 'An unknown error occurred during video generation.';
      setError(`Failed to animate logo: ${errorMessage}`);
      // Special check for API key error to prompt user re-selection
      if (errorMessage.includes("Requested entity was not found")) {
        // The service will handle resetting the key state, but we can provide a more specific message.
        setError("API Key validation failed. Please select a valid key and try again.");
      }
    } finally {
      setIsGeneratingVideo(false);
      setVideoGenerationProgress('');
    }
  }, [generatedLogoUrl, animationPrompt, aspectRatio]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main className="mt-8 space-y-12">
          <LogoGenerator
            description={logoDescription}
            onDescriptionChange={setLogoDescription}
            onGenerate={handleGenerateLogo}
            onImageUpload={handleImageUpload}
            isLoading={isGeneratingLogo}
            logoUrl={generatedLogoUrl}
            error={error}
          />

          {generatedLogoUrl && (
            <>
              <div className="flex justify-center text-purple-400">
                <ArrowDownIcon className="w-10 h-10 animate-bounce" />
              </div>
              <VideoAnimator
                prompt={animationPrompt}
                onPromptChange={setAnimationPrompt}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
                onAnimate={handleAnimateLogo}
                isLoading={isGeneratingVideo}
                videoUrl={generatedVideoUrl}
                progressMessage={videoGenerationProgress}
                error={error}
                clearError={() => setError(null)}
              />
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
