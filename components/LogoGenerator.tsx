
import React, { useRef } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageIcon, SparklesIcon, UploadIcon } from './IconComponents';

interface LogoGeneratorProps {
  description: string;
  onDescriptionChange: (value: string) => void;
  onGenerate: () => void;
  onImageUpload: (file: File) => void;
  isLoading: boolean;
  logoUrl: string | null;
  error: string | null;
}

export const LogoGenerator: React.FC<LogoGeneratorProps> = ({
  description,
  onDescriptionChange,
  onGenerate,
  onImageUpload,
  isLoading,
  logoUrl,
  error,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };
    
    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-700">
      <h2 className="text-2xl font-semibold flex items-center gap-3">
        <span className="bg-purple-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">1</span>
        Design Your Logo
      </h2>

      <div className="mt-6 grid md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
            <label htmlFor="logo-description" className="block text-sm font-medium text-gray-300">
                Describe your company and the logo you envision.
            </label>
            <textarea
                id="logo-description"
                rows={4}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-shadow"
                placeholder="e.g., 'A minimalist logo for a coffee shop named Astrobrew, featuring a rocket ship leaving a coffee cup.'"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                disabled={isLoading}
            />
             <button
                onClick={onGenerate}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-900 disabled:text-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-all transform hover:scale-105"
            >
                <SparklesIcon className="w-5 h-5" />
                {isLoading ? 'Generating...' : 'Generate with AI'}
            </button>
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-600"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-600"></div>
            </div>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
            <button
                onClick={triggerFileSelect}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
                <UploadIcon className="w-5 h-5"/>
                Upload an Image
            </button>
        </div>

        <div className="w-full aspect-square bg-gray-900 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 overflow-hidden">
            {isLoading ? (
                <div className="text-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-gray-400">Conjuring up your logo...</p>
                </div>
            ) : logoUrl ? (
                <img src={logoUrl} alt="Generated Logo" className="w-full h-full object-contain" />
            ) : (
                <div className="text-center text-gray-500">
                <ImageIcon className="w-16 h-16 mx-auto" />
                <p className="mt-2">Your generated logo will appear here</p>
                </div>
            )}
        </div>
      </div>
      {error && error.includes("logo") && <p className="mt-4 text-red-400 text-center">{error}</p>}
    </div>
  );
};
