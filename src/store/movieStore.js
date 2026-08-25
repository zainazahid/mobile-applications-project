import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useMovieStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────────────────────────────
      watchlist: [],
      favourites: [],
      watchedMovies: [],   // [{ movie, watchedAt, personalRating }]
      theme: 'dark',       // 'dark' | 'light' | 'system'
      preferences: {
        defaultMinRating: 'any',
        favouriteGenreIds: [],
      },

      // ── Watchlist ──────────────────────────────────────────────────────────
      addToWatchlist(movie) {
        set((s) => ({
          watchlist: s.watchlist.some((m) => m.id === movie.id)
            ? s.watchlist
            : [movie, ...s.watchlist],
        }));
      },
      removeFromWatchlist(movieId) {
        set((s) => ({ watchlist: s.watchlist.filter((m) => m.id !== movieId) }));
      },
      toggleWatchlist(movie) {
        const { watchlist, addToWatchlist, removeFromWatchlist } = get();
        if (watchlist.some((m) => m.id === movie.id)) {
          removeFromWatchlist(movie.id);
        } else {
          addToWatchlist(movie);
        }
      },
      isInWatchlist(movieId) {
        return get().watchlist.some((m) => m.id === movieId);
      },
      clearWatchlist() {
        set({ watchlist: [] });
      },

      // ── Favourites ─────────────────────────────────────────────────────────
      addFavourite(movie) {
        set((s) => ({
          favourites: s.favourites.some((m) => m.id === movie.id)
            ? s.favourites
            : [movie, ...s.favourites],
        }));
      },
      removeFavourite(movieId) {
        set((s) => ({ favourites: s.favourites.filter((m) => m.id !== movieId) }));
      },
      toggleFavourite(movie) {
        const { favourites, addFavourite, removeFavourite } = get();
        if (favourites.some((m) => m.id === movie.id)) {
          removeFavourite(movie.id);
        } else {
          addFavourite(movie);
        }
      },
      isFavourite(movieId) {
        return get().favourites.some((m) => m.id === movieId);
      },
      clearFavourites() {
        set({ favourites: [] });
      },

      // ── Watched ────────────────────────────────────────────────────────────
      markAsWatched(movie, personalRating = null) {
        const entry = {
          movie,
          watchedAt: new Date().toISOString(),
          personalRating,
        };
        set((s) => {
          // Replace existing entry if already watched
          const filtered = s.watchedMovies.filter((e) => e.movie.id !== movie.id);
          return { watchedMovies: [entry, ...filtered] };
        });
      },
      removeFromWatched(movieId) {
        set((s) => ({
          watchedMovies: s.watchedMovies.filter((e) => e.movie.id !== movieId),
        }));
      },
      isWatched(movieId) {
        return get().watchedMovies.some((e) => e.movie.id === movieId);
      },
      getWatchedEntry(movieId) {
        return get().watchedMovies.find((e) => e.movie.id === movieId) || null;
      },
      clearHistory() {
        set({ watchedMovies: [] });
      },

      // ── Ratings ────────────────────────────────────────────────────────────
      rateMovie(movieId, rating) {
        set((s) => ({
          watchedMovies: s.watchedMovies.map((e) =>
            e.movie.id === movieId ? { ...e, personalRating: rating } : e
          ),
        }));
      },

      // ── Preferences ────────────────────────────────────────────────────────
      setTheme(theme) {
        set({ theme });
      },
      updatePreferences(partial) {
        set((s) => ({ preferences: { ...s.preferences, ...partial } }));
      },
      toggleFavouriteGenre(genreId) {
        set((s) => {
          const ids = s.preferences.favouriteGenreIds;
          const next = ids.includes(genreId)
            ? ids.filter((id) => id !== genreId)
            : [...ids, genreId];
          return { preferences: { ...s.preferences, favouriteGenreIds: next } };
        });
      },

      // ── Reset ───────────────────────────────────────────────────────────────
      resetAppData() {
        set({
          watchlist: [],
          favourites: [],
          watchedMovies: [],
          theme: 'dark',
          preferences: { defaultMinRating: 'any', favouriteGenreIds: [] },
        });
      },
    }),
    {
      name: 'movie-night-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useMovieStore;
