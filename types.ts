
export interface Movie {
  id: string;
  title: string;
  year: string;
  rating: string;
  poster: string;
  description: string;
  genres: string[];
}

export interface Review {
  author: string;
  score: number;
  content: string;
  date: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface MovieAnalysis {
  summary: string;
  pros: string[];
  cons: string[];
  sentiment: 'Positive' | 'Mixed' | 'Negative';
  sources: GroundingSource[];
}
