import React, { useState } from 'react';
import {
  ScrollView, View, Text, Image, TouchableOpacity, StyleSheet,
  Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { discoverMovies, getMovieDetails } from '../api/tmdb';
import { useThemeColors } from '../hooks/useTheme';
import useMovieStore from '../store/movieStore';
import { MOOD_MAP, RUNTIME_OPTIONS, RATING_OPTIONS } from '../constants/genres';
import { pickRandom, runtimeMatches, getPosterUrl, getBackdropUrl, formatRating, formatRuntime, getReleaseYear } from '../utils/movieHelpers';
import { Spacing, FontSize, Radius } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function MoviePickerResultScreen({ route, navigation }) {
  const { movie: initialMovie, candidates: initialCandidateIds, pickerParams } = route.params;
  const colors = useThemeColors();

  const [movie, setMovie] = useState(initialMovie);
  const [shownIds, setShownIds] = useState([initialMovie.id]);
  const [repicking, setRepicking] = useState(false);

  const { toggleWatchlist, isInWatchlist, markAsWatched } = useMovieStore();
  const inWatchlist = isInWatchlist(movie.id);

  const pickAgain = async () => {
    setRepicking(true);
    try {
      const { mood, runtime, rating } = pickerParams;
      const moodObj = MOOD_MAP.find((m) => m.key === mood);
      const ratingOpt = RATING_OPTIONS.find((r) => r.key === rating);
      const runtimeOpt = RUNTIME_OPTIONS.find((r) => r.key === runtime);

      const params = {
        sort_by: 'vote_count.desc',
        'vote_count.gte': 100,
      };
      if (moodObj.genreIds.length > 0) params.with_genres = moodObj.genreIds.join('|');
      if (ratingOpt.value > 0) params['vote_average.gte'] = ratingOpt.value;

      const [p1, p2] = await Promise.all([
        discoverMovies({ ...params, page: 1 }),
        discoverMovies({ ...params, page: 2 }),
      ]);
      let pool = [...p1.results, ...p2.results];

      if (runtimeOpt.key !== 'any') {
        const sample = pool.slice(0, 12);
        const detailed = await Promise.all(sample.map((m) => getMovieDetails(m.id).catch(() => m)));
        pool = detailed.filter((m) => runtimeMatches(m.runtime, runtimeOpt));
      }

      // Avoid showing movies we've already shown this session
      const fresh = pool.filter((m) => !shownIds.includes(m.id));
      const picked = pickRandom(fresh.length > 0 ? fresh : pool, movie.id);
      if (!picked) { setRepicking(false); return; }

      const detail = await getMovieDetails(picked.id).catch(() => picked);
      setShownIds((prev) => [...prev, detail.id]);
      setMovie(detail);
    } catch (e) {
      console.error('Pick again error:', e);
    } finally {
      setRepicking(false);
    }
  };

  const letsWatch = () => {
    markAsWatched(movie, null);
    navigation.navigate('MovieDetails', { movieId: movie.id, movie });
  };

  const posterUrl = getPosterUrl(movie.poster_path, 'large');
  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const genres = movie.genres?.map((g) => g.name) || [];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdropWrap}>
          {backdropUrl ? (
            <Image source={{ uri: backdropUrl }} style={styles.backdrop} resizeMode="cover" />
          ) : (
            <View style={[styles.backdrop, { backgroundColor: colors.surface }]} />
          )}
          <View style={[styles.gradientOverlay, { backgroundColor: colors.overlay }]} />

          <SafeAreaView edges={['top']} style={styles.navBar}>
            <TouchableOpacity
              style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color="#FFF" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Reveal header */}
        <View style={styles.revealHeader}>
          <Text style={[styles.revealLabel, { color: colors.primary }]}>
            Tonight you're watching...
          </Text>
        </View>

        {/* Poster + info */}
        <View style={styles.mainBlock}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder, { backgroundColor: colors.placeholder }]}>
              <Ionicons name="film-outline" size={48} color={colors.textMuted} />
            </View>
          )}

          <Text style={[styles.title, { color: colors.text }]}>{movie.title}</Text>
          <Text style={[styles.metaLine, { color: colors.textSecondary }]}>
            {getReleaseYear(movie.release_date)}
            {movie.runtime ? `  ·  ${formatRuntime(movie.runtime)}` : ''}
          </Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={colors.accent} />
            <Text style={[styles.rating, { color: colors.accent }]}>
              {' '}{formatRating(movie.vote_average)}
            </Text>
          </View>

          {genres.length > 0 && (
            <View style={styles.genreRow}>
              {genres.map((g) => (
                <View key={g} style={[styles.genreChip, { backgroundColor: colors.chip }]}>
                  <Text style={[styles.genreText, { color: colors.chipText }]}>{g}</Text>
                </View>
              ))}
            </View>
          )}

          {!!movie.overview && (
            <Text style={[styles.overview, { color: colors.textSecondary }]} numberOfLines={4}>
              {movie.overview}
            </Text>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={letsWatch}
            accessibilityRole="button"
            accessibilityLabel="Let's watch this"
          >
            <View style={styles.btnInner}>
              <MaterialCommunityIcons name="popcorn" size={20} color="#FFF" />
              <Text style={styles.primaryBtnText}>Let's Watch This</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={pickAgain}
            disabled={repicking}
            accessibilityRole="button"
            accessibilityLabel="Pick again"
          >
            {repicking ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <View style={styles.btnInner}>
                <MaterialCommunityIcons name="dice-multiple" size={18} color={colors.text} />
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Pick Again</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              { backgroundColor: inWatchlist ? colors.surfaceElevated : colors.surface, borderColor: inWatchlist ? colors.primary : colors.border },
            ]}
            onPress={() => toggleWatchlist(movie)}
            accessibilityRole="button"
            accessibilityLabel={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            <Text style={[styles.secondaryBtnText, { color: inWatchlist ? colors.primary : colors.text }]}>
              <View style={styles.btnInner}>
                <Ionicons
                  name={inWatchlist ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={inWatchlist ? colors.primary : colors.text}
                />
                <Text style={[styles.secondaryBtnText, { color: inWatchlist ? colors.primary : colors.text }]}>
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </Text>
              </View>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ghostBtn]}
            onPress={() => navigation.navigate('MovieDetails', { movieId: movie.id, movie })}
            accessibilityRole="button"
            accessibilityLabel="View full details"
          >
            <Text style={[styles.ghostBtnText, { color: colors.primary }]}>View Details</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  backdropWrap: { width, height: 200, position: 'relative' },
  backdrop: { width: '100%', height: '100%' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject },
  navBar: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: Spacing.base },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginTop: Spacing.sm,
  },
  revealHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  revealLabel: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  mainBlock: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  poster: {
    width: 160,
    height: 240,
    borderRadius: Radius.lg,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 30,
  },
  metaLine: {
    fontSize: FontSize.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FontSize.lg,
    fontWeight: '700',
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  genreChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  genreText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  overview: {
    fontSize: FontSize.md,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  actions: {
    padding: Spacing.base,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  primaryBtn: {
    paddingVertical: Spacing.base,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: FontSize.base,
    fontWeight: '800',
  },
  secondaryBtn: {
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  ghostBtn: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  ghostBtnText: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
});
