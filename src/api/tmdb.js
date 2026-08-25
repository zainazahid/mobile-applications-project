import axios from 'axios';
import { TMDB_BASE_URL, TMDB_TOKEN } from '../constants/config';

// Single Axios instance — all requests go through here
const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  headers: {
    Authorization: `Bearer ${TMDB_TOKEN}`,
    Accept: 'application/json',
  },
  timeout: 10000,
});

// ─── Movie Lists ────────────────────────────────────────────────────────────

export async function getTrendingMovies(timeWindow = 'week') {
  const res = await tmdb.get(`/trending/movie/${timeWindow}`);
  return res.data.results;
}

export async function getPopularMovies(page = 1) {
  const res = await tmdb.get('/movie/popular', { params: { page } });
  return res.data.results;
}

export async function getTopRatedMovies(page = 1) {
  const res = await tmdb.get('/movie/top_rated', { params: { page } });
  return res.data.results;
}

export async function getNowPlayingMovies(page = 1) {
  const res = await tmdb.get('/movie/now_playing', { params: { page } });
  return res.data.results;
}

export async function getUpcomingMovies(page = 1) {
  const res = await tmdb.get('/movie/upcoming', { params: { page } });
  return res.data.results;
}

// ─── Search & Discover ───────────────────────────────────────────────────────

export async function searchMovies(query, page = 1) {
  const res = await tmdb.get('/search/movie', {
    params: { query, page, include_adult: false },
  });
  return res.data;
}

export async function discoverMovies(params = {}) {
  const res = await tmdb.get('/discover/movie', {
    params: {
      sort_by: 'popularity.desc',
      include_adult: false,
      ...params,
    },
  });
  return res.data;
}

// ─── Movie Details ───────────────────────────────────────────────────────────

export async function getMovieDetails(movieId) {
  const res = await tmdb.get(`/movie/${movieId}`);
  return res.data;
}

export async function getMovieCredits(movieId) {
  const res = await tmdb.get(`/movie/${movieId}/credits`);
  return res.data;
}

export async function getMovieRecommendations(movieId, page = 1) {
  const res = await tmdb.get(`/movie/${movieId}/recommendations`, {
    params: { page },
  });
  return res.data.results;
}

export async function getSimilarMovies(movieId, page = 1) {
  const res = await tmdb.get(`/movie/${movieId}/similar`, {
    params: { page },
  });
  return res.data.results;
}
