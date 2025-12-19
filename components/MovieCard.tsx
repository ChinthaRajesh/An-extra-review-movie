
import React from 'react';
import { Movie } from '../types';
import { StarIcon } from './Icons';

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick }) => {
  return (
    <div 
      onClick={() => onClick(movie)}
      className="group relative bg-slate-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20"
    >
      <div className="aspect-[2/3] overflow-hidden">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center space-x-1 mb-1">
          <StarIcon className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold text-amber-400">{movie.rating}</span>
        </div>
        <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-indigo-400 transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-slate-400">{movie.year}</p>
      </div>
    </div>
  );
};

export default MovieCard;
