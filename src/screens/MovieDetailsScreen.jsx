import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView, View, Text, Image, TouchableOpacity, StyleSheet,
  Modal, Dimensions, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMovieDetails, getMovieCredits, getMovieRecommendations } from '../api/tmdb';
import { useThemeColors } from '../hooks/useTheme';
import useMovieStore from '../store/movieStore';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import MovieRow from '../components/MovieRow';
import RatingStars from '../components/RatingStars';
import GenreChip from '../components/GenreChip';
import { getPosterUrl, getBackdropUrl, getReleaseYear, formatRuntime, formatRating } from '../utils/movieHelpers';
import { Spacing, FontSize, Radius } from '../constants/colors';

const { width } = Dimensions.get('window');

export default function MovieDetailsScreen({ route, navigation }) {
  const { movieId } = route.params;
  const colors = useThemeColors();

  const [movie, setMovie] = useState(null);
  const [credits, setCredits] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watchedModal, setWatchedModal] = useState(false);
  const [pendingRating, setPendingRating] = useState(0);

  const {
    isInWatchlist, toggleWatchlist,
    isFavourite, toggleFavourite,
    isWatched, markAsWatched, rateMovie, getWatchedEntry,
  } = useMovieStore();

  const inWatchlist = movie ? isInWatchlist(movie.id) : false;
  const inFavourites = movie ? isFavourite(movie.id) : false;
  const watched = movie ? isWatched(movie.id) : false;
  const watchedEntry = movie ? getWatchedEntry(movie.id) : null;

  const fetchDetails = useCallback(async () => {
    try {
      setError(null);
      const [detail, cred, recs] = await Promise.all([
        getMovieDetails(movieId),
        getMovieCredits(movieId),
        getMovieRecommendations(movieId),
      ]);
      setMovie(detail);
      setCredits(cred);
      setRecommendations(recs.slice(0, 12));
    } catch (e) {
      console.error('MovieDetails fetch error:', e);
      setError('Could not load movie details.');
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const openWatchedModal = () => {
    setPendingRating(watchedEntry?.personalRating || 0);
    setWatchedModal(true);
  };

  const saveWatched = () => {
    if (watched) {
      rateMovie(movie.id, pendingRating);
    } else {
      markAsWatched(movie, pendingRating);
    }
    setWatchedModal(false);
  };

  if (loading) return <LoadingState message="Loading details..." />;
  if (error) {
    return (
      <ErrorState
        title="Couldn't load details"
        message={error}
        onRetry={() => { setLoading(true); fetchDetails(); }}
      />
    );
  }
  if (!movie) return null;

  const backdropUrl = getBackdropUrl(movie.backdrop_path);
  const posterUrl = getPosterUrl(movie.poster_path, 'large');
  const director = credits?.crew?.find((c) => c.job === 'Director');
  const cast = credits?.cast?.slice(0, 8) || [];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Backdrop */}
        <View style={styles.backdropContainer}>
          {backdropUrl ? (
            <Image source={{ uri: backdropUrl }} style={styles.backdrop} resizeMode="cover" />
          ) : (
            <View style={[styles.backdrop, { backgroundColor: colors.surface }]} />
          )}
          <View style={[styles.backdropOverlay, { backgroundColor: colors.overlay }]} />
          {/* Back button */}
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

        {/* Poster + Title row */}
        <View style={styles.heroRow}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} resizeMode="cover" />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder, { backgroundColor: colors.placeholder }]}>
              <Ionicons name="film-outline" size={40} color={colors.textMuted} />
            </View>
          )}

          <View style={styles.heroInfo}>
            <Text style={[styles.title, { color: colors.text }]}>{movie.title}</Text>
            <Text style={[styles.metaLine, { color: colors.textSecondary }]}>
              {getReleaseYear(movie.release_date)}
              {movie.runtime ? `  ·  ${formatRuntime(movie.runtime)}` : ''}
            </Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.accent} />
              <Text style={[styles.ratingText, { color: colors.accent }]}>
                {' '}{formatRating(movie.vote_average)} / 10
              </Text>
            </View>
            <Text style={[styles.metaLabel, { color: colors.textMuted }]}>TMDB Rating</Text>
          </View>
        </View>

        {/* Genres */}
        {movie.genres?.length > 0 && (
          <View style={styles.genres}>
            {movie.genres.map((g) => (
              <View key={g.id} style={[styles.genreTag, { backgroundColor: colors.chip }]}>
                <Text style={[styles.genreText, { color: colors.chipText }]}>{g.name}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View style={[styles.actions, { borderTopColor: colors.border, borderBottomColor: colors.border }]}>
          <ActionButton
            icon={inWatchlist ? 'bookmark' : 'bookmark-outline'}
            label={inWatchlist ? 'In Watchlist' : 'Watchlist'}
            active={inWatchlist}
            onPress={() => toggleWatchlist(movie)}
            colors={colors}
          />
          <ActionButton
            icon={inFavourites ? 'heart' : 'heart-outline'}
            label={inFavourites ? 'Favourited' : 'Favourite'}
            active={inFavourites}
            onPress={() => toggleFavourite(movie)}
            colors={colors}
          />
          <ActionButton
            icon={watched ? 'checkmark-circle' : 'checkmark-circle-outline'}
            label={watched ? 'Watched' : 'Mark Watched'}
            active={watched}
            onPress={openWatchedModal}
            colors={colors}
          />
        </View>

        {/* Your rating */}
        {watched && watchedEntry?.personalRating > 0 && (
          <View style={[styles.yourRating, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>YOUR RATING</Text>
            <RatingStars rating={watchedEntry.personalRating} size={22} />
            <TouchableOpacity onPress={openWatchedModal}>
              <Text style={[styles.editRating, { color: colors.primary }]}>Edit rating</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Overview */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>OVERVIEW</Text>
          <Text style={[styles.overview, { color: colors.text }]}>
            {movie.overview || 'No overview available.'}
          </Text>
        </View>

        {/* Director */}
        {director && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>DIRECTED BY</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>{director.name}</Text>
          </View>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CAST</Text>
            <Text style={[styles.bodyText, { color: colors.text }]}>
              {cast.map((a) => a.name).join(', ')}
            </Text>
          </View>
        )}

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
              YOU MIGHT ALSO LIKE
            </Text>
            <MovieRow
              movies={recommendations}
              onMoviePress={(m) => navigation.push('MovieDetails', { movieId: m.id, movie: m })}
            />
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Watched / Rating modal */}
      <Modal visible={watchedModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: colors.modalBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {watched ? `Update your rating` : `You watched ${movie.title}!`}
            </Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              How would you rate it?
            </Text>
            <View style={{ marginVertical: Spacing.base }}>
              <RatingStars
                rating={pendingRating}
                size={36}
                interactive
                onRate={setPendingRating}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setWatchedModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colors.primary }]}
                onPress={saveWatched}
              >
                <Text style={[styles.modalBtnText, { color: '#FFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ActionButton({ icon, label, active, onPress, colors }) {
  return (
    <TouchableOpacity
      style={styles.actionBtn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={24} color={active ? colors.primary : colors.textSecondary} />
      <Text style={[styles.actionLabel, { color: active ? colors.primary : colors.textSecondary }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  backdropContainer: { width, height: 220, position: 'relative' },
  backdrop: { width: '100%', height: '100%' },
  backdropOverlay: { ...StyleSheet.absoluteFillObject },
  navBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.base,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  heroRow: {
    flexDirection: 'row',
    padding: Spacing.base,
    gap: Spacing.md,
    marginTop: -50,
  },
  poster: {
    width: 110,
    height: 165,
    borderRadius: Radius.md,
  },
  posterPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInfo: {
    flex: 1,
    paddingTop: 55,
    gap: 4,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    lineHeight: 26,
  },
  metaLine: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  metaLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 0.5,
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  genreTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  genreText: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
  },
  actionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '600',
  },
  yourRating: {
    marginHorizontal: Spacing.base,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  section: {
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  overview: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  bodyText: {
    fontSize: FontSize.md,
    lineHeight: 22,
  },
  editRating: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modal: {
    width: '100%',
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.base,
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modalBtnText: {
    fontWeight: '700',
    fontSize: FontSize.md,
  },
});
