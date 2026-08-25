import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useTheme';
import { getPosterUrl, getReleaseYear, formatRating } from '../utils/movieHelpers';
import { Spacing, FontSize, Radius } from '../constants/colors';

const CARD_WIDTH = 130;
const CARD_HEIGHT = 195;

export default function MovieCard({ movie, onPress }) {
  const colors = useThemeColors();
  const posterUrl = getPosterUrl(movie.poster_path, 'medium');
  const year = getReleaseYear(movie.release_date);
  const rating = formatRating(movie.vote_average);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => onPress && onPress(movie)}
      accessibilityRole="button"
      accessibilityLabel={`${movie.title}, ${year}, rated ${rating}`}
      activeOpacity={0.8}
    >
      {posterUrl ? (
        <Image
          source={{ uri: posterUrl }}
          style={styles.poster}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.poster, styles.placeholder, { backgroundColor: colors.placeholder }]}>
          <Ionicons name="film-outline" size={36} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <Text
          style={[styles.title, { color: colors.text }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {movie.title || 'Untitled'}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.year, { color: colors.textSecondary }]}>{year}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={11} color={colors.accent} />
            <Text style={[styles.rating, { color: colors.accent }]}> {rating}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginRight: Spacing.sm,
  },
  poster: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    padding: Spacing.xs + 2,
  },
  title: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    lineHeight: 15,
    marginBottom: 2,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  year: {
    fontSize: FontSize.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
});
