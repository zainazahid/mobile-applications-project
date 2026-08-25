import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { searchMovies, discoverMovies } from '../api/tmdb';
import MovieCard from '../components/MovieCard';
import GenreChip from '../components/GenreChip';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { useThemeColors } from '../hooks/useTheme';
import { DISCOVER_GENRES } from '../constants/genres';
import { Spacing, FontSize, Radius } from '../constants/colors';

const RATING_OPTS = [
  { label: 'Any', value: 0 },
  { label: '6+', value: 6 },
  { label: '7+', value: 7 },
  { label: '8+', value: 8 },
];

const YEAR_OPTS = [
  { label: 'Any', gte: null, lte: null },
  { label: '2026', gte: '2026-01-01', lte: '2026-12-31' },
  { label: '2025', gte: '2025-01-01', lte: '2025-12-31' },
  { label: '2024', gte: '2024-01-01', lte: '2024-12-31' },
  { label: '2020–2023', gte: '2020-01-01', lte: '2023-12-31' },
  { label: 'Before 2020', gte: null, lte: '2019-12-31' },
];

export default function DiscoverScreen({ navigation }) {
  const colors = useThemeColors();
  const debounceRef = useRef(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Filters
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [yearIdx, setYearIdx] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(async (text, genres, rating, year) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      let data;
      if (text.trim().length > 0) {
        const res = await searchMovies(text.trim());
        let filtered = res.results;
        if (rating > 0) filtered = filtered.filter((m) => m.vote_average >= rating);
        if (genres.length > 0) {
          filtered = filtered.filter((m) =>
            genres.every((gId) => m.genre_ids?.includes(gId))
          );
        }
        data = filtered;
      } else {
        const params = {};
        if (genres.length > 0) params.with_genres = genres.join(',');
        if (rating > 0) params['vote_average.gte'] = rating;
        if (year.gte) params['primary_release_date.gte'] = year.gte;
        if (year.lte) params['primary_release_date.lte'] = year.lte;
        const res = await discoverMovies(params);
        data = res.results;
      }
      setResults(data);
    } catch (e) {
      console.error('Discover error:', e);
      setError('Could not complete search. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleQueryChange = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(text, selectedGenres, minRating, YEAR_OPTS[yearIdx]);
    }, 500);
  };

  const toggleGenre = (id) => {
    const next = selectedGenres.includes(id)
      ? selectedGenres.filter((g) => g !== id)
      : [...selectedGenres, id];
    setSelectedGenres(next);
    performSearch(query, next, minRating, YEAR_OPTS[yearIdx]);
  };

  const setRating = (val) => {
    setMinRating(val);
    performSearch(query, selectedGenres, val, YEAR_OPTS[yearIdx]);
  };

  const setYear = (idx) => {
    setYearIdx(idx);
    performSearch(query, selectedGenres, minRating, YEAR_OPTS[idx]);
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setMinRating(0);
    setYearIdx(0);
    if (query.trim()) performSearch(query, [], 0, YEAR_OPTS[0]);
    else { setResults([]); setSearched(false); }
  };

  const goToDetails = (movie) =>
    navigation.navigate('MovieDetails', { movieId: movie.id, movie });

  const hasActiveFilters =
    selectedGenres.length > 0 || minRating > 0 || yearIdx > 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Search bar */}
      <View style={[styles.searchRow, { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder }]}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search movies..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={handleQueryChange}
          returnKeyType="search"
          clearButtonMode="while-editing"
          accessibilityLabel="Search movies"
        />
        <TouchableOpacity
          onPress={() => setShowFilters((v) => !v)}
          style={[styles.filterBtn, hasActiveFilters && { backgroundColor: colors.primary }]}
          accessibilityRole="button"
          accessibilityLabel="Toggle filters"
        >
          <Ionicons
            name="options-outline"
            size={18}
            color={hasActiveFilters ? '#FFF' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Filters panel */}
      {showFilters && (
        <View style={[styles.filtersPanel, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Genre */}
            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>GENRE</Text>
            <View style={styles.chipRow}>
              {DISCOVER_GENRES.map((g) => (
                <GenreChip
                  key={g.id}
                  label={g.name}
                  selected={selectedGenres.includes(g.id)}
                  onPress={() => toggleGenre(g.id)}
                />
              ))}
            </View>

            {/* Rating */}
            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>MINIMUM RATING</Text>
            <View style={styles.pillRow}>
              {RATING_OPTS.map((o) => (
                <TouchableOpacity
                  key={o.value}
                  style={[
                    styles.pill,
                    { borderColor: colors.border },
                    minRating === o.value && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setRating(o.value)}
                >
                  <Text style={[styles.pillText, { color: minRating === o.value ? '#FFF' : colors.textSecondary }]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Year */}
            <Text style={[styles.filterLabel, { color: colors.textMuted }]}>RELEASE PERIOD</Text>
            <View style={styles.pillRow}>
              {YEAR_OPTS.map((o, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.pill,
                    { borderColor: colors.border },
                    yearIdx === i && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => setYear(i)}
                >
                  <Text style={[styles.pillText, { color: yearIdx === i ? '#FFF' : colors.textSecondary }]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reset */}
            {hasActiveFilters && (
              <TouchableOpacity style={styles.resetBtn} onPress={resetFilters}>
                <Text style={[styles.resetText, { color: colors.primary }]}>Reset Filters</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <ErrorState message={error} onRetry={() => performSearch(query, selectedGenres, minRating, YEAR_OPTS[yearIdx])} />
      ) : !searched ? (
        <EmptyState
          icon="search-outline"
          title="Search for movies"
          message="Type a title above, or use filters to discover something new."
        />
      ) : results.length === 0 ? (
        <EmptyState
          icon="film-outline"
          title="No results found"
          message={
            query.trim()
              ? `No movies found for "${query}".`
              : 'Try adjusting your filters.'
          }
          actionLabel={hasActiveFilters ? 'Reset Filters' : undefined}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => String(item.id)}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.gridRow}
          renderItem={({ item }) => (
            <View style={styles.gridItem}>
              <MovieCard movie={item} onPress={goToDetails} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.base,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: { marginRight: Spacing.xs },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: FontSize.md,
  },
  filterBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.sm,
  },
  filtersPanel: {
    maxHeight: 320,
    borderBottomWidth: 1,
    padding: Spacing.base,
  },
  filterLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
  resetBtn: {
    marginTop: Spacing.sm,
    alignSelf: 'flex-start',
  },
  resetText: {
    fontWeight: '700',
    fontSize: FontSize.sm,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    padding: Spacing.base,
  },
  gridRow: {
    justifyContent: 'flex-start',
    gap: Spacing.xs,
  },
  gridItem: {
    flex: 1 / 3,
    maxWidth: '33%',
  },
});
