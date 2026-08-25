import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../hooks/useTheme';
import { Spacing } from '../constants/colors';

export default function RatingStars({
  rating = 0,
  maxStars = 5,
  size = 28,
  interactive = false,
  onRate,
}) {
  const colors = useThemeColors();

  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const filled = i < rating;
        const icon = filled ? 'star' : 'star-outline';

        if (interactive) {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onRate && onRate(i + 1)}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${i + 1} star${i !== 0 ? 's' : ''}`}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            >
              <Ionicons
                name={icon}
                size={size}
                color={filled ? colors.star : colors.starEmpty}
                style={styles.star}
              />
            </TouchableOpacity>
          );
        }

        return (
          <Ionicons
            key={i}
            name={icon}
            size={size}
            color={filled ? colors.star : colors.starEmpty}
            style={styles.star}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginHorizontal: 2,
  },
});
