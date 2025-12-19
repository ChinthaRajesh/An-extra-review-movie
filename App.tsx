
import React, { useState, useEffect, useCallback } from 'react';
import { Movie, MovieAnalysis } from './types';
import { getMovieAnalysis } from './services/geminiService';
import MovieCard from './components/MovieCard';
import { SearchIcon, StarIcon, CheckIcon, XIcon, ExternalLinkIcon } from './components/Icons';

// Mock data for initial trending movies
const TRENDING_MOVIES: Movie[] = [
  { id: '1', title: 'Dune: Part Two', year: '2024', rating: '8.6', poster: 'https://picsum.photos/seed/dune/400/600', genres: ['Sci-Fi', 'Action'], description: 'Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.' },
  { id: '2', title: 'Oppenheimer', year: '2023', rating: '8.4', poster: 'https://picsum.photos/seed/oppy/400/600', genres: ['Biography', 'Drama'], description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.' },
  { id: '3', title: 'Spider-Man: Across the Spider-Verse', year: '2023', rating: '8.6', poster: 'https://picsum.photos/seed/spidey/400/600', genres: ['Animation', 'Action'], description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.' },
  { id: '4', title: 'Poor Things', year: '2023', rating: '7.9', poster: 'https://picsum.photos/seed/poor/400/600', genres: ['Comedy', 'Drama'], description: 'The incredible tale about the fantastical evolution of Bella Baxter, a young woman brought back to life by the brilliant and unorthodox scientist Dr. Godwin Baxter.' },
  { id: '5', title: 'The Zone of Interest', year: '2023', rating: '7.5', poster: 'https://picsum.photos/seed/zone/400/600', genres: ['Drama', 'War'], description: 'The commandant of Auschwitz, Rudolf Höss, and his wife Hedwig, strive to build a dream life for their family in a house and garden next to the camp.' },
  { id: '6', title: 'Godzilla Minus One', year: '2023', rating: '8.3', poster: 'https://picsum.photos/seed/gojira/400/600', genres: ['Action', 'Sci-Fi'], description: 'Postwar Japan is at its lowest point when a new crisis emerges in the form of a giant monster, baptized in the horrific power of the atomic bomb.' },
];

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [analysis, setAnalysis] = useState<MovieAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);
    
    // Set a "virtual" movie for the search if not in TRENDING
    const foundInTrending = TRENDING_MOVIES.find(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));
    if (foundInTrending) {
      setSelectedMovie(foundInTrending);
    } else {
      setSelectedMovie({
        id: 'search-' + Date.now(),
        title: searchQuery,
        year: 'Recent',
        rating: 'TBD',
        poster: `https://picsum.photos/seed/${searchQuery}/400/600`,
        genres: ['Search Result'],
        description: `Deep analysis for ${searchQuery}...`
      });
    }

    try {
      const data = await getMovieAnalysis(searchQuery);
      setAnalysis(data);
    } catch (err) {
      setError("Failed to fetch analysis. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleMovieSelect = async (movie: Movie) => {
    setSelectedMovie(movie);
    setSearchQuery(movie.title);
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const data = await getMovieAnalysis(movie.title);
      setAnalysis(data);
    } catch (err) {
      setError("Failed to fetch analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header & Search */}
      <header className="sticky top-0 z-50 glass-panel border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => {
                setSelectedMovie(null);
                setAnalysis(null);
                setSearchQuery('');
              }}
            >
              <div className="bg-indigo-600 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                CineScore AI
              </h1>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-xl w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search movies for AI critical consensus..."
                className="w-full bg-slate-800/50 border border-slate-700 text-white pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-slate-500"
              />
              <SearchIcon className="absolute left-3.5 top-3 w-5 h-5 text-slate-500" />
              <button 
                type="submit"
                className="absolute right-2 top-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-full transition-colors"
              >
                Analyze
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {!selectedMovie ? (
          <>
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                  Trending & Critically Acclaimed
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                {TRENDING_MOVIES.map(movie => (
                  <MovieCard key={movie.id} movie={movie} onClick={handleMovieSelect} />
                ))}
              </div>
            </section>

            <section className="glass-panel rounded-3xl p-8 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-black text-white mb-4">The Future of Film Criticism</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                CineScore AI aggregates critical reviews, audience sentiment, and cinematic themes using real-time grounding search. 
                Type any movie name above to get a comprehensive "AI Consensus" summary.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {['Synthesized Analysis', 'Pros & Cons', 'Sentiment Tracking', 'Live Sourcing'].map(feature => (
                  <div key={feature} className="px-4 py-1.5 bg-slate-800 rounded-full border border-slate-700 text-xs font-medium text-slate-300">
                    {feature}
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Movie Detail Hero */}
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1">
                <div className="sticky top-24">
                  <img 
                    src={selectedMovie.poster} 
                    alt={selectedMovie.title}
                    className="w-full rounded-2xl shadow-2xl border border-slate-700"
                  />
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 uppercase text-xs font-bold tracking-widest">Global Rating</span>
                      <div className="flex items-center text-amber-400 font-bold">
                        <StarIcon className="w-5 h-5 mr-1" />
                        {selectedMovie.rating}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMovie.genres.map(g => (
                        <span key={g} className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700">
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-8">
                <div>
                  <div className="flex items-baseline gap-4 mb-2">
                    <h1 className="text-4xl md:text-5xl font-black text-white">{selectedMovie.title}</h1>
                    <span className="text-2xl text-slate-500 font-medium">{selectedMovie.year}</span>
                  </div>
                  <p className="text-lg text-slate-300 leading-relaxed italic">
                    {selectedMovie.description}
                  </p>
                </div>

                {/* Analysis Section */}
                <div className="glass-panel rounded-2xl p-6 min-h-[400px] relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    {analysis && (
                      <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest border ${
                        analysis.sentiment === 'Positive' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                        analysis.sentiment === 'Negative' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}>
                        {analysis.sentiment} Consensus
                      </div>
                    )}
                  </div>

                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    AI Critical Consensus
                  </h3>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-slate-400 animate-pulse">Aggregating reviews from the web...</p>
                    </div>
                  ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 flex items-center gap-3">
                      <XIcon />
                      {error}
                    </div>
                  ) : analysis ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="prose prose-invert max-w-none">
                        <p className="text-slate-300 leading-relaxed text-lg">
                          {analysis.summary}
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-green-500/5 rounded-xl p-5 border border-green-500/10">
                          <h4 className="text-green-400 font-bold mb-3 flex items-center gap-2">
                            <CheckIcon className="w-4 h-4" />
                            Key Strengths
                          </h4>
                          <ul className="space-y-2">
                            {analysis.pros.map((p, i) => (
                              <li key={i} className="text-slate-300 text-sm flex gap-2">
                                <span className="text-green-500/40">•</span>
                                {p}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-red-500/5 rounded-xl p-5 border border-red-500/10">
                          <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                            <XIcon className="w-4 h-4" />
                            Common Criticisms
                          </h4>
                          <ul className="space-y-2">
                            {analysis.cons.map((c, i) => (
                              <li key={i} className="text-slate-300 text-sm flex gap-2">
                                <span className="text-red-500/40">•</span>
                                {c}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {analysis.sources.length > 0 && (
                        <div className="pt-6 border-t border-slate-700">
                          <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Information Sources</h4>
                          <div className="flex flex-wrap gap-3">
                            {analysis.sources.map((source, i) => (
                              <a 
                                key={i}
                                href={source.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-indigo-300 transition-colors"
                              >
                                {source.title}
                                <ExternalLinkIcon />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500 italic">
                      No analysis loaded yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Persistent Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-4 glass-panel border-t border-slate-700/50 text-center">
        <p className="text-slate-500 text-xs font-medium">
          Powered by <span className="text-indigo-400">Gemini 3 Flash</span> & Google Search Grounding • CineScore AI © 2024
        </p>
      </footer>
    </div>
  );
};

export default App;
