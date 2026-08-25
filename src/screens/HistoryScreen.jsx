import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, SectionList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useMovieStore from '../store/movieStore';
import { useThemeColors } from '../hooks/useTheme';
import EmptyState from '../components/EmptyState';
import RatingStars from '../components/RatingStars';
import { getPosterUrl } from '../utils/movieHelpers';
import { groupByMonth, formatWatchedDate } from '../utils/dateHelpers';
import { Spacing, FontSize, Radius } from '../constants/colors';

export default function HistoryScreen({ navigation }) {
  const colors = useThemeColors();
  const { watchedMovies } = useMovieStore();

  if (watchedMovies.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
        <Text style={[styles.title, { color: colors.text }]}>Watch History</Text>
        <EmptyState
          icon="time-outline"
          title="No viewing history yet"
          message="Movies you mark as watched will appear here, grouped by month."
        />
      </SafeAreaView>
    );
  }

  const grouped = groupByMonth(watchedMovies);
  const sections = Object.entries(grouped).map(([title, data]) => ({ title, data }));

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Watch History</Text>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.movie.id)}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.monthHeader, { backgroundColor: colors.background }]}>
            <Text style={[styles.monthText, { color: colors.textMuted }]}>{title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <HistoryItem
            entry={item}
            colors={colors}
            onPress={() => navigation.navigate('MovieDetails', { movieId: item.movie.id, movie: item.movie })}
          />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

function HistoryItem({ entry, colors, onPress }) {
  const { movie, watchedAt, personalRating } = entry;
  const posterUrl = getPosterUrl(movie.poster_path, 'small');

  return (
    <TouchableOpacity
      style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={movie.title}
    >
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, { backgroundColor: colors.placeholder, alignItems: 'center', justifyContent: 'center' }]}>
          <Ionicons name="film-outline" size={22} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.info}>
        <Text style={[styles.movieTitle, { color: colors.text }]} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={[styles.date, { color: colors.textSecondary }]}>
          {formatWatchedDate(watchedAt)}
        </Text>
        {personalRating > 0 ? (
          <RatingStars rating={personalRating} size={15} />
        ) : (
          <Text style={[styles.noRating, { color: colors.textMuted }]}>No rating</Text>
        )}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
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
  list: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  monthHeader: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  monthText: {
    fontSize: FontSize.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  item: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  thumb: {
    width: 55,
    height: 80,
  },
  info: {
    flex: 1,
    padding: Spacing.sm,
    gap: 3,
  },
  movieTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    lineHeight: 20,
  },
  date: {
    fontSize: FontSize.sm,
  },
  noRating: {
    fontSize: FontSize.xs,
  },
});
