import React, { useState } from 'react';
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { discoverMovies, getMovieDetails } from '../api/tmdb';
import { useThemeColors } from '../hooks/useTheme';
import useMovieStore from '../store/movieStore';
import { MOOD_MAP, RUNTIME_OPTIONS, RATING_OPTIONS } from '../constants/genres';
import { pickRandom, runtimeMatches } from '../utils/movieHelpers';
import { Spacing, FontSize, Radius } from '../constants/colors';

export default function MoviePickerScreen({ navigation }) {
  const colors = useThemeColors();
  const { preferences } = useMovieStore();

  const [mood, setMood] = useState(null);
  const [runtime, setRuntime] = useState('any');
  const [rating, setRating] = useState(preferences.defaultMinRating || 'any');
  const [loading, setLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);

  const runtimeOpt = RUNTIME_OPTIONS.find((r) => r.key === runtime);
  const ratingOpt = RATING_OPTIONS.find((r) => r.key === rating);

  const handlePick = async () => {
    if (!mood) return;
    setLoading(true);
    setNoResults(false);

    try {
      const moodObj = MOOD_MAP.find((m) => m.key === mood);
      const params = {
        sort_by: 'vote_count.desc',
        'vote_count.gte': 100,
      };
      if (moodObj.genreIds.length > 0) {
        params.with_genres = moodObj.genreIds.join('|'); // OR logic for mood genres
      }
      if (ratingOpt.value > 0) {
        params['vote_average.gte'] = ratingOpt.value;
      }

      // Fetch multiple pages to get a good candidate pool
      const [page1, page2] = await Promise.all([
        discoverMovies({ ...params, page: 1 }),
        discoverMovies({ ...params, page: 2 }),
      ]);
      let candidates = [...page1.results, ...page2.results];

      // Apply runtime filter — requires fetching details for some candidates
      if (runtimeOpt.key !== 'any') {
        // First try to use candidates that already match (runtime often not in list response)
        // Sample up to 12 to avoid excessive API calls
        const sample = candidates.slice(0, 12);
        const detailed = await Promise.all(sample.map((m) => getMovieDetails(m.id).catch(() => m)));
        candidates = detailed.filter((m) => runtimeMatches(m.runtime, runtimeOpt));
      }

      if (candidates.length === 0) {
        setNoResults(true);
        setLoading(false);
        return;
      }

      const picked = pickRandom(candidates);
      // If we only did list-level data, ensure we have full details
      let finalMovie = picked;
      if (!picked.runtime && runtimeOpt.key === 'any') {
        finalMovie = await getMovieDetails(picked.id).catch(() => picked);
      }

      navigation.navigate('MoviePickerResult', {
        movie: finalMovie,
        candidates: candidates.map((m) => m.id),
        pickerParams: { mood, runtime, rating },
      });
    } catch (e) {
      console.error('Picker error:', e);
      setNoResults(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.heading, { color: colors.text }]}>
          What should we watch tonight?
        </Text>
        <Text style={[styles.sub, { color: colors.textSecondary }]}>
          Tell us your mood and we'll pick the perfect film.
        </Text>

        {/* Mood */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>HOW ARE YOU FEELING?</Text>
        <View style={styles.moodGrid}>
          {MOOD_MAP.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[
                styles.moodCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                mood === m.key && { borderColor: colors.primary, backgroundColor: colors.surfaceElevated },
              ]}
              onPress={() => setMood(m.key)}
              accessibilityRole="radio"
              accessibilityLabel={m.label}
              accessibilityState={{ checked: mood === m.key }}
            >
              <MaterialCommunityIcons
                name={m.icon}
                size={32}
                color={mood === m.key ? colors.primary : colors.textSecondary}
              />
              <Text
                style={[
                  styles.moodLabel,
                  { color: mood === m.key ? colors.primary : colors.text },
                ]}
                numberOfLines={2}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Runtime */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>
          HOW MUCH TIME DO YOU HAVE?
        </Text>
        <View style={styles.optionList}>
          {RUNTIME_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.key}
              style={[
                styles.optionRow,
                { borderColor: colors.border },
                runtime === o.key && { borderColor: colors.primary },
              ]}
              onPress={() => setRuntime(o.key)}
              accessibilityRole="radio"
              accessibilityLabel={o.label}
            >
              <View
                style={[
                  styles.radio,
                  { borderColor: runtime === o.key ? colors.primary : colors.border },
                ]}
              >
                {runtime === o.key && (
                  <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />
                )}
              </View>
              <Text style={[styles.optionText, { color: colors.text }]}>{o.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Minimum rating */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>MINIMUM RATING</Text>
        <View style={styles.pillRow}>
          {RATING_OPTIONS.map((o) => (
            <TouchableOpacity
              key={o.key}
              style={[
                styles.pill,
                { borderColor: colors.border },
                rating === o.key && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setRating(o.key)}
              accessibilityRole="radio"
              accessibilityLabel={`Minimum rating ${o.label}`}
            >
              <Text
                style={[
                  styles.pillText,
                  { color: rating === o.key ? '#FFF' : colors.textSecondary },
                ]}
              >
                {o.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {noResults && (
          <View style={[styles.noResults, { backgroundColor: colors.surface }]}>
            <Text style={[styles.noResultsTitle, { color: colors.text }]}>
              No perfect match found
            </Text>
            <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>
              Try changing your filters and give it another go.
            </Text>
          </View>
        )}

        {/* Pick button */}
        <TouchableOpacity
          style={[
            styles.pickBtn,
            { backgroundColor: mood ? colors.primary : colors.surface },
          ]}
          onPress={handlePick}
          disabled={!mood || loading}
          accessibilityRole="button"
          accessibilityLabel="Pick my movie"
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <View style={styles.pickBtnInner}>
              <MaterialCommunityIcons
                name="dice-multiple"
                size={22}
                color={mood ? '#FFF' : colors.textMuted}
              />
              <Text style={[styles.pickBtnText, { color: mood ? '#FFF' : colors.textMuted }]}>
                Pick My Movie
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {!mood && (
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Select a mood to continue
          </Text>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: Spacing.base,
  },
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  sub: {
    fontSize: FontSize.md,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  moodCard: {
    width: '47%',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 2,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pickBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  moodLabel: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  optionList: {
    gap: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    gap: Spacing.md,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  noResults: {
    marginTop: Spacing.lg,
    padding: Spacing.base,
    borderRadius: Radius.lg,
    gap: Spacing.xs,
  },
  noResultsTitle: {
    fontSize: FontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  noResultsText: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  pickBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.base + 2,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  pickBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '800',
  },
  hint: {
    textAlign: 'center',
    fontSize: FontSize.sm,
    marginTop: Spacing.sm,
  },
});
