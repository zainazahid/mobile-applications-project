import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useMovieStore from '../store/movieStore';
import { useThemeColors } from '../hooks/useTheme';
import EmptyState from '../components/EmptyState';
import { GENRES } from '../constants/genres';
import { Spacing, FontSize, Radius } from '../constants/colors';

export default function StatisticsScreen() {
  const colors = useThemeColors();
  const { width } = useWindowDimensions();
  const { watchedMovies, favourites } = useMovieStore();

  // Card width: full content width minus the single gap between the two columns
  const contentPadding = Spacing.base * 2;
  const cardGap = Spacing.sm;
  const cardWidth = (width - contentPadding - cardGap) / 2;

  const stats = useMemo(() => {
    if (watchedMovies.length === 0) return null;

    const totalRuntime = watchedMovies.reduce(
      (sum, e) => sum + (e.movie.runtime || 90),
      0
    );
    const ratings = watchedMovies
      .map((e) => e.personalRating)
      .filter((r) => r > 0);
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
        : null;

    const genreCount = {};
    watchedMovies.forEach((e) => {
      const ids = e.movie.genre_ids || e.movie.genres?.map((g) => g.id) || [];
      ids.forEach((id) => {
        genreCount[id] = (genreCount[id] || 0) + 1;
      });
    });
    const topGenreId = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topGenre = topGenreId
      ? GENRES.find((g) => g.id === Number(topGenreId))?.name
      : null;

    const hours = Math.floor(totalRuntime / 60);
    const mins = totalRuntime % 60;
    const runtimeLabel = hours > 0
      ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}`
      : `${totalRuntime}m`;

    return {
      count: watchedMovies.length,
      runtime: runtimeLabel,
      avgRating,
      topGenre,
      favouriteCount: favourites.length,
    };
  }, [watchedMovies, favourites]);

  if (!stats) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
        <EmptyState
          icon="bar-chart-outline"
          title="No statistics yet"
          message="Watch some movies and your stats will appear here."
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>YOUR MOVIE STATS</Text>

        {/* Row 1: always present */}
        <View style={[styles.row, { gap: cardGap }]}>
          <StatCard value={stats.count} label="Movies Watched" colors={colors} width={cardWidth} />
          <StatCard value={stats.runtime} label="Watch Time" colors={colors} width={cardWidth} />
        </View>

        {/* Row 2: average rating + favourites */}
        <View style={[styles.row, { gap: cardGap, marginTop: cardGap }]}>
          <StatCard
            value={stats.avgRating ?? '—'}
            label="Avg Rating"
            colors={colors}
            width={cardWidth}
          />
          <StatCard value={stats.favouriteCount} label="Favourites" colors={colors} width={cardWidth} />
        </View>

        {/* Row 3: top genre, full width */}
        {stats.topGenre && (
          <View style={[styles.row, { marginTop: cardGap }]}>
            <StatCard value={stats.topGenre} label="Top Genre" colors={colors} wide />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label, colors, width, wide }) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface },
        wide ? styles.cardWide : { width },
      ]}
    >
      <Text style={[styles.statValue, { color: colors.primary }]} numberOfLines={1} adjustsFontSizeToFit>
        {String(value)}
      </Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  content: {
    padding: Spacing.base,
    paddingBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: Spacing.base,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  card: {
    padding: Spacing.base,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    gap: Spacing.xs,
  },
  cardWide: {
    flex: 1,
  },
  statValue: {
    fontSize: FontSize.xxxl,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
