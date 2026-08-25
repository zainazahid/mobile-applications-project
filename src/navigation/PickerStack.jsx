import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoviePickerScreen from '../screens/MoviePickerScreen';
import MoviePickerResultScreen from '../screens/MoviePickerResultScreen';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';

const Stack = createNativeStackNavigator();

export default function PickerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PickerMain" component={MoviePickerScreen} />
      <Stack.Screen name="MoviePickerResult" component={MoviePickerResultScreen} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
    </Stack.Navigator>
  );
}
