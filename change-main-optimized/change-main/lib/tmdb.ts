/**
 * TMDB API Utility for MFLIX
 * Handles all movie and TV show data fetching.
 */

const TMDB_API_KEY = "aa844700ff3f44363be5bf50f78df0b1";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const TMDB_IMAGE_SIZES = {
  poster: "w500",
  backdrop: "original",
  profile: "w185",
  still: "w300",
};

export const getImageUrl = (path: string | null, size: keyof typeof TMDB_IMAGE_SIZES = "poster") => {
  if (!path) return "https://picsum.photos/500/750?grayscale";
  return `${IMAGE_BASE_URL}/${TMDB_IMAGE_SIZES[size]}${path}`;
};

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: "en-US",
    ...params,
  });

  const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);

  if (!response.ok) {
    throw new Error(`TMDB API Error: ${response.statusText}`);
  }

  return response.json();
}

export const tmdb = {
  getTrending: (type: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "day", page: number = 1) =>
    fetchTMDB(`/trending/${type}/${timeWindow}`, { page: page.toString() }),

  getTopRated: (type: "movie" | "tv" = "movie", page: number = 1) =>
    fetchTMDB(`/${type}/top_rated`, { page: page.toString() }),

  getPopular: (type: "movie" | "tv" = "movie", page: number = 1) =>
    fetchTMDB(`/${type}/popular`, { page: page.toString() }),

  getMovieDetails: (id: number) =>
    fetchTMDB(`/movie/${id}`, { append_to_response: "videos,credits,similar" }),

  getTVDetails: (id: number) =>
    fetchTMDB(`/tv/${id}`, { append_to_response: "videos,credits,similar" }),

  getVideos: (type: "movie" | "tv", id: number) =>
    fetchTMDB(`/${type}/${id}/videos`),

  getCredits: (type: "movie" | "tv", id: number) =>
    fetchTMDB(`/${type}/${id}/credits`),

  getGenres: (type: "movie" | "tv" = "movie") =>
    fetchTMDB(`/genre/${type}/list`),

  discoverByGenre: (type: "movie" | "tv", genreIds: string, page: number = 1, sortBy: string = "popularity.desc") =>
    fetchTMDB(`/discover/${type}`, { with_genres: genreIds, sort_by: sortBy, page: page.toString() }),

  search: (query: string, page: number = 1) =>
    fetchTMDB("/search/multi", { query, page: page.toString() }),
};

export type Genre = {
  id: number;
  name: string;
};

export type Movie = {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  overview: string;
  genre_ids: number[];
  media_type?: "movie" | "tv";
  original_language?: string;
};
