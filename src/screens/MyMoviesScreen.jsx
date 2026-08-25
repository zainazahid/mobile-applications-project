import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useMovieStore from '../store/movieStore';
import { useThemeColors } from '../hooks/useTheme';
import EmptyState from '../components/EmptyState';
import RatingStars from '../components/RatingStars';
import { getPosterUrl, formatRating } from '../utils/movieHelpers';
import { formatWatchedDate } from '../utils/dateHelpers';
import { Spacing, FontSize, Radius } from '../constants/colors';

const TABS = ['Watchlist', 'Favourites', 'Watched'];

export default function MyMoviesScreen({ navigation }) {
  const colors = useThemeColors();
  const [activeTab, setActiveTab] = useState(0);

  const {
    watchlist, removeFromWatchlist, markAsWatched,
    favourites, removeFavourite,
    watchedMovies, removeFromWatched,
  } = useMovieStore();

  const goToDetails = (movie) =>
    navigation.navigate('MovieDetails', { movieId: movie.id, movie });

  const confirmRemove = (label, onConfirm) => {
    Alert.alert('Remove', `Remove this movie from your ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: onConfirm },
    ]);
  };

  // ── Watchlist ─────────────────────────────────────────────────────────────
  const renderWatchlistItem = ({ item }) => (
    <MovieListItem
      movie={item}
      colors={colors}
      onPress={() => goToDetails(item)}
      actions={[
        {
          icon: 'checkmark-circle-outline',
          label: 'Watched',
          onPress: () => markAsWatched(item),
          color: colors.success,
        },
        {
          icon: 'trash-outline',
          label: 'Remove',
          onPress: () => confirmRemove('Watchlist', () => removeFromWatchlist(item.id)),
          color: colors.error,
        },
      ]}
    />
  );

  // ── Favourites ────────────────────────────────────────────────────────────
  const renderFavouriteItem = ({ item }) => (
    <MovieListItem
      movie={item}
      colors={colors}
      onPress={() => goToDetails(item)}
      actions={[
        {
          icon: 'heart-dislike-outline',
          label: 'Remove',
          onPress: () => confirmRemove('Favourites', () => removeFavourite(item.id)),
          color: colors.error,
        },
      ]}
    />
  );

  // ── Watched ───────────────────────────────────────────────────────────────
  const renderWatchedItem = ({ item }) => (
    <WatchedListItem
      entry={item}
      colors={colors}
      onPress={() => goToDetails(item.movie)}
      onRemove={() => confirmRemove('Watch History', () => removeFromWatched(item.movie.id))}
    />
  );

  const currentData =
    activeTab === 0 ? watchlist : activeTab === 1 ? favourites : watchedMovies;

  const emptyConfig = [
    {
      icon: 'bookmark-outline',
      title: 'Your watchlist is empty',
      message: 'Found something interesting? Save it here for movie night.',
      actionLabel: 'Discover Movies',
      onAction: () => navigation.navigate('Discover'),
    },
    {
      icon: 'heart-outline',
      title: 'No favourites yet',
      message: 'Movies you love will appear here.',
      actionLabel: 'Browse Movies',
      onAction: () => navigation.navigate('Home'),
    },
    {
      icon: 'checkmark-circle-outline',
      title: 'No movies watched yet',
      message: "Movies you've marked as watched will appear here.",
      actionLabel: 'Discover Movies',
      onAction: () => navigation.navigate('Discover'),
    },
  ][activeTab];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>My Movies</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Statistics')}
            accessibilityRole="button"
            accessibilityLabel="Statistics"
            style={styles.headerIcon}
          >
            <Ionicons name="bar-chart-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('History')}
            accessibilityRole="button"
            accessibilityLabel="Watch history"
            style={styles.headerIcon}
          >
            <Ionicons name="time-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Segmented control */}
      <View style={[styles.segmentBar, { backgroundColor: colors.segmentBackground }]}>
        {TABS.map((tab, i) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.segment,
              i === activeTab && { backgroundColor: colors.segmentActive },
            ]}
            onPress={() => setActiveTab(i)}
            accessibilityRole="tab"
            accessibilityLabel={tab}
            accessibilityState={{ selected: i === activeTab }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: i === activeTab ? colors.segmentTextActive : colors.segmentText },
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {currentData.length === 0 ? (
        <EmptyState
          icon={emptyConfig.icon}
          title={emptyConfig.title}
          message={emptyConfig.message}
          actionLabel={emptyConfig.actionLabel}
          onAction={emptyConfig.onAction}
        />
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => String(activeTab === 2 ? item.movie.id : item.id)}
          renderItem={activeTab === 0 ? renderWatchlistItem : activeTab === 1 ? renderFavouriteItem : renderWatchedItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function MovieListItem({ movie, colors, onPress, actions }) {
  const posterUrl = getPosterUrl(movie.poster_path, 'small');
  return (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={movie.title}
    >
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.placeholder }]}>
          <Ionicons name="film-outline" size={24} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.listInfo}>
        <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={2}>
          {movie.title}
        </Text>
        <View style={styles.listMeta}>
          <Ionicons name="star" size={12} color={colors.accent} />
          <Text style={[styles.listRating, { color: colors.accent }]}>
            {' '}{formatRating(movie.vote_average)}
          </Text>
        </View>
      </View>
      <View style={styles.listActions}>
        {actions.map((a) => (
          <TouchableOpacity
            key={a.label}
            onPress={a.onPress}
            style={styles.listActionBtn}
            accessibilityRole="button"
            accessibilityLabel={a.label}
          >
            <Ionicons name={a.icon} size={22} color={a.color} />
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  );
}

function WatchedListItem({ entry, colors, onPress, onRemove }) {
  const { movie, watchedAt, personalRating } = entry;
  const posterUrl = getPosterUrl(movie.poster_path, 'small');
  return (
    <TouchableOpacity
      style={[styles.listItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={movie.title}
    >
      {posterUrl ? (
        <Image source={{ uri: posterUrl }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: colors.placeholder }]}>
          <Ionicons name="film-outline" size={24} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.listInfo}>
        <Text style={[styles.listTitle, { color: colors.text }]} numberOfLines={2}>
          {movie.title}
        </Text>
        <Text style={[styles.watchedDate, { color: colors.textSecondary }]}>
          {formatWatchedDate(watchedAt)}
        </Text>
        {personalRating > 0 && (
          <RatingStars rating={personalRating} size={14} />
        )}
      </View>
      <TouchableOpacity
        onPress={onRemove}
        style={styles.listActionBtn}
        accessibilityRole="button"
        accessibilityLabel="Remove from history"
      >
        <Ionicons name="trash-outline" size={22} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerIcon: {
    padding: Spacing.xs,
  },
  screenTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
  },
  segmentBar: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: Spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  list: {
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  listItem: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    alignItems: 'center',
  },
  thumb: {
    width: 60,
    height: 90,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  listInfo: {
    flex: 1,
    padding: Spacing.sm,
    gap: 3,
  },
  listTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    lineHeight: 20,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listRating: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  watchedDate: {
    fontSize: FontSize.sm,
  },
  listActions: {
    flexDirection: 'row',
    paddingRight: Spacing.sm,
    gap: Spacing.xs,
  },
  listActionBtn: {
    padding: Spacing.xs,
  },
});
