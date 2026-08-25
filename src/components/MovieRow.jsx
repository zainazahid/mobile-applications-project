import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import MovieCard from './MovieCard';
import { Spacing } from '../constants/colors';

export default function MovieRow({ movies, onMoviePress }) {
  return (
    <FlatList
      data={movies}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => (
        <MovieCard movie={item} onPress={onMoviePress} />
      )}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
});
