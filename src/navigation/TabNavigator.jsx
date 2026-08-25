import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../hooks/useTheme';

import HomeStack from './HomeStack';
import DiscoverStack from './DiscoverStack';
import PickerStack from './PickerStack';
import MyMoviesStack from './MyMoviesStack';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Discover: { focused: 'search', unfocused: 'search-outline' },
  Pick: { focused: 'film', unfocused: 'film-outline' },
  'My Movies': { focused: 'heart', unfocused: 'heart-outline' },
  Settings: { focused: 'settings', unfocused: 'settings-outline' },
};

export default function TabNavigator() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const tabBarHeight = 54 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingTop: 6,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          if (route.name === 'Pick' && focused) {
            return (
              <View style={{ backgroundColor: colors.primary, borderRadius: 12, padding: 4 }}>
                <Ionicons name={iconName} size={size - 4} color="#FFF" />
              </View>
            );
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Discover" component={DiscoverStack} />
      <Tab.Screen name="Pick" component={PickerStack} />
      <Tab.Screen name="My Movies" component={MyMoviesStack} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
