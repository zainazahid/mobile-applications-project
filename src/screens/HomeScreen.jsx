import React, { useEffect, useState, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getTrendingMovies, getPopularMovies, getTopRatedMovies, getNowPlayingMovies } from '../api/tmdb';
import MovieRow from '../components/MovieRow';
import SectionHeader from '../components/SectionHeader';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useTheme';
import { Spacing, FontSize } from '../constants/colors';

export default function HomeScreen({ navigation }) {
  const colors = useThemeColors();

  const [data, setData] = useState({
    trending: [],
    popular: [],
    topRated: [],
    nowPlaying: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [trending, popular, topRated, nowPlaying] = await Promise.all([
        getTrendingMovies('week'),
        getPopularMovies(),
        getTopRatedMovies(),
        getNowPlayingMovies(),
      ]);
      setData({ trending, popular, topRated, nowPlaying });
    } catch (e) {
      console.error('HomeScreen fetch error:', e);
      setError('Unable to connect. Please check your internet connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll();
  };

  const goToDetails = (movie) => {
    navigation.navigate('MovieDetails', { movieId: movie.id, movie });
  };

  if (loading) return <LoadingState />;
  if (error) {
    return (
      <ErrorState
        title="Couldn't load movies"
        message={error}
        onRetry={() => { setLoading(true); fetchAll(); }}
      />
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.appNameRow}>
            <Text style={[styles.appName, { color: colors.text }]}>Movie Night</Text>
            <MaterialCommunityIcons name="popcorn" size={28} color={colors.primary} />
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            What are we watching tonight?
          </Text>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Trending This Week" />
          <MovieRow movies={data.trending} onMoviePress={goToDetails} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Popular" />
          <MovieRow movies={data.popular} onMoviePress={goToDetails} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Top Rated" />
          <MovieRow movies={data.topRated} onMoviePress={goToDetails} />
        </View>

        <View style={styles.section}>
          <SectionHeader title="Now Playing" />
          <MovieRow movies={data.nowPlaying} onMoviePress={goToDetails} />
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  appNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  appName: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  section: {
    marginBottom: Spacing.lg,
  },
});
