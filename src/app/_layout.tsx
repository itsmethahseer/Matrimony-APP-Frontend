import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, useColorScheme } from 'react-native';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Check login status and handle routing redirects reactively on screen transitions
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const isAuth = !!token;
        setIsAuthenticated(isAuth);

        const inAuthGroup = segments[0] === 'login';

        if (!isAuth && !inAuthGroup) {
          // Redirect to login if not authenticated
          router.replace('/login');
        } else if (isAuth && inAuthGroup) {
          // Redirect to home tabs if already authenticated
          router.replace('/(tabs)');
        }
      } catch (e) {
        setIsAuthenticated(false);
        router.replace('/login');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthAndRedirect();
  }, [segments]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.light.background }}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="profile/[id]" options={{ presentation: 'card', headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
