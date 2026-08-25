import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useThemeColors } from '../hooks/useTheme';
import { Spacing, FontSize, Radius } from '../constants/colors';

export default function GenreChip({ label, selected, onPress }) {
  const colors = useThemeColors();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? colors.chipSelected : colors.chip,
          borderColor: selected ? colors.chipSelected : colors.border,
        },
      ]}
      onPress={onPress}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked: selected }}
    >
      <Text
        style={[
          styles.text,
          { color: selected ? colors.chipTextSelected : colors.chipText },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  text: {
    fontSize: FontSize.sm,
    fontWeight: '600',
  },
});
