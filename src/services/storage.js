// Thin wrapper — persistence is handled by Zustand middleware.
// This file exists as a placeholder if direct AsyncStorage access is ever needed.
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getItem(key) {
  try {
    const value = await AsyncStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export async function setItem(key, value) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('AsyncStorage setItem error:', e);
  }
}

export async function removeItem(key) {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.warn('AsyncStorage removeItem error:', e);
  }
}
