
import React from 'react';
import { FilmIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="flex items-center justify-center gap-4">
        <FilmIcon className="w-12 h-12 text-purple-400"/>
        <h1 className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">
          AI Logo Animator
        </h1>
      </div>
      <p className="mt-4 text-lg text-gray-300">
        From concept to motion in two simple steps. Powered by Google AI.
      </p>
    </header>
  );
};
