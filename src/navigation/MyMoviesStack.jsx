import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MyMoviesScreen from '../screens/MyMoviesScreen';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';
import HistoryScreen from '../screens/HistoryScreen';
import StatisticsScreen from '../screens/StatisticsScreen';

const Stack = createNativeStackNavigator();

export default function MyMoviesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyMoviesMain" component={MyMoviesScreen} />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="Statistics" component={StatisticsScreen} />
    </Stack.Navigator>
  );
}
