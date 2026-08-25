import { TMDB_IMAGE_BASE, IMAGE_SIZES } from '../constants/config';
import { GENRES } from '../constants/genres';

export function getPosterUrl(path, size = 'medium') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.poster[size]}${path}`;
}

export function getBackdropUrl(path, size = 'large') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${IMAGE_SIZES.backdrop[size]}${path}`;
}

export function getReleaseYear(dateString) {
  if (!dateString) return 'N/A';
  return dateString.substring(0, 4);
}

export function formatRuntime(minutes) {
  if (!minutes || minutes <= 0) return 'Runtime unavailable';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatRating(rating) {
  if (rating == null || rating === 0) return 'N/A';
  return Number(rating).toFixed(1);
}

export function getGenreNames(genreIds = [], movieGenres = []) {
  // movieGenres is the array from a movie detail response — prefer it
  if (movieGenres.length > 0) return movieGenres.map((g) => g.name);
  // Fall back to matching against the master GENRES list
  return genreIds
    .map((id) => GENRES.find((g) => g.id === id)?.name)
    .filter(Boolean);
}

// Pick a random item from an array, optionally excluding a specific id
export function pickRandom(array, excludeId = null) {
  const pool = excludeId ? array.filter((m) => m.id !== excludeId) : array;
  if (pool.length === 0) return array[0] ?? null;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Check whether a movie's runtime satisfies the picker constraint
export function runtimeMatches(runtimeMinutes, runtimeOption) {
  if (runtimeOption.key === 'any') return true;
  if (!runtimeMinutes) return true; // unknown — let it through
  const { min, max } = runtimeOption;
  if (min !== null && runtimeMinutes < min) return false;
  if (max !== null && runtimeMinutes > max) return false;
  return true;
}
