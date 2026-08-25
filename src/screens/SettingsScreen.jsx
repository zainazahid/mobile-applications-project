import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import useMovieStore from '../store/movieStore';
import { useThemeColors } from '../hooks/useTheme';
import GenreChip from '../components/GenreChip';
import { PREFERENCE_GENRES, RATING_OPTIONS } from '../constants/genres';
import { Spacing, FontSize, Radius } from '../constants/colors';

const THEME_OPTIONS = [
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const {
    theme, setTheme,
    preferences, updatePreferences, toggleFavouriteGenre,
    clearWatchlist, clearFavourites, clearHistory, resetAppData,
  } = useMovieStore();

  const confirmAction = (title, message, action) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', style: 'destructive', onPress: action },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Settings</Text>

        {/* Appearance */}
        <SettingsSection title="APPEARANCE" colors={colors}>
          <View style={styles.themeRow}>
            {THEME_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                style={[
                  styles.themeBtn,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  theme === opt.key && { borderColor: colors.primary, backgroundColor: colors.surfaceElevated },
                ]}
                onPress={() => setTheme(opt.key)}
                accessibilityRole="radio"
                accessibilityLabel={opt.label}
                accessibilityState={{ checked: theme === opt.key }}
              >
                <Ionicons
                  name={opt.icon}
                  size={22}
                  color={theme === opt.key ? colors.primary : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.themeBtnText,
                    { color: theme === opt.key ? colors.primary : colors.textSecondary },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SettingsSection>

        {/* Favourite genres */}
        <SettingsSection title="FAVOURITE GENRES" colors={colors}>
          <Text style={[styles.hint, { color: colors.textMuted }]}>
            Used to personalise recommendations.
          </Text>
          <View style={styles.chipRow}>
            {PREFERENCE_GENRES.map((g) => (
              <GenreChip
                key={g.id}
                label={g.name}
                selected={preferences.favouriteGenreIds.includes(g.id)}
                onPress={() => toggleFavouriteGenre(g.id)}
              />
            ))}
          </View>
        </SettingsSection>

        {/* Picker defaults */}
        <SettingsSection title="MOVIE PICKER DEFAULTS" colors={colors}>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Default minimum rating</Text>
          <View style={styles.pillRow}>
            {RATING_OPTIONS.map((o) => {
              const selected = preferences.defaultMinRating === o.key;
              return (
                <TouchableOpacity
                  key={o.key}
                  style={[
                    styles.pill,
                    { borderColor: colors.border },
                    selected && { backgroundColor: colors.primary, borderColor: colors.primary },
                  ]}
                  onPress={() => updatePreferences({ defaultMinRating: o.key })}
                  accessibilityRole="radio"
                  accessibilityLabel={`Minimum rating ${o.label}`}
                >
                  <Text style={[styles.pillText, { color: selected ? '#FFF' : colors.textSecondary }]}>
                    {o.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </SettingsSection>

        {/* Data management */}
        <SettingsSection title="DATA MANAGEMENT" colors={colors}>
          <DangerButton
            label="Clear Watchlist"
            icon="bookmark-outline"
            onPress={() =>
              confirmAction('Clear Watchlist', 'This will remove all movies from your watchlist.', clearWatchlist)
            }
            colors={colors}
          />
          <DangerButton
            label="Clear Favourites"
            icon="heart-outline"
            onPress={() =>
              confirmAction('Clear Favourites', 'This will remove all your favourite movies.', clearFavourites)
            }
            colors={colors}
          />
          <DangerButton
            label="Clear Watch History"
            icon="time-outline"
            onPress={() =>
              confirmAction('Clear History', 'This will remove your entire watch history and ratings.', clearHistory)
            }
            colors={colors}
          />
          <DangerButton
            label="Reset All App Data"
            icon="trash-outline"
            danger
            onPress={() =>
              confirmAction(
                'Reset all app data?',
                'This will remove your watchlist, favourites, ratings, history, and preferences.',
                resetAppData
              )
            }
            colors={colors}
          />
        </SettingsSection>

        {/* About */}
        <SettingsSection title="ABOUT" colors={colors}>
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Movie Night</Text>
            <Text style={[styles.aboutValue, { color: colors.textMuted }]}>v1.0.0</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.aboutRow}>
            <Text style={[styles.aboutLabel, { color: colors.textSecondary }]}>Movie data</Text>
            <Text style={[styles.aboutValue, { color: colors.textMuted }]}>TMDB</Text>
          </View>
        </SettingsSection>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingsSection({ title, children, colors }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>{children}</View>
    </View>
  );
}

function DangerButton({ label, icon, onPress, danger, colors }) {
  return (
    <TouchableOpacity
      style={[styles.dangerBtn, { borderColor: colors.border }]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={20} color={danger ? colors.error : colors.textSecondary} />
      <Text style={[styles.dangerLabel, { color: danger ? colors.error : colors.text }]}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: Spacing.base },
  screenTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  sectionCard: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    padding: Spacing.base,
    gap: Spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  themeBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 2,
    gap: Spacing.xs,
  },
  themeBtnText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  hint: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  pillText: {
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  dangerLabel: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: '500',
  },
  chevron: { marginLeft: 'auto' },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  aboutLabel: {
    fontSize: FontSize.md,
  },
  aboutValue: {
    fontSize: FontSize.md,
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
});
