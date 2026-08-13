import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, View, useColorScheme, TouchableOpacity, Modal, Text } from 'react-native';
import { ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { registerAlertListener, AlertButton } from '../utils/alert';
import { onUnauthorized } from '@/services/api';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Custom global alert modal states (to avoid native browser alert popup on Web)
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  // Check login status & handle auth navigation dynamically whenever segments change
  useEffect(() => {
    let isMounted = true;

    const checkAuthAndRedirect = async () => {
      try {
        const token = await AsyncStorage.getItem('user_token');
        const isAuth = !!token;

        if (isMounted) {
          setIsAuthenticated(isAuth);
          setIsLoading(false);

          const currentSegment = segments[0];
          const isLoginPage = !currentSegment || currentSegment === 'login';

          if (!isAuth && !isLoginPage) {
            router.replace('/login');
          } else if (isAuth && isLoginPage) {
            router.replace('/(tabs)');
          }
        }
      } catch (e) {
        if (isMounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          const currentSegment = segments[0];
          if (currentSegment && currentSegment !== 'login') {
            router.replace('/login');
          }
        }
      }
    };
    
    checkAuthAndRedirect();
    return () => {
      isMounted = false;
    };
  }, [segments]);

  // Handle unauthorized/expired token events by clearing auth state and redirecting to login
  useEffect(() => {
    const unsubscribe = onUnauthorized(() => {
      setIsAuthenticated(false);
      const currentSegment = segments[0];
      if (currentSegment && currentSegment !== 'login') {
        router.replace('/login');
      }
    });
    return unsubscribe;
  }, [segments]);

  // Register Alert Listener for custom modals on Web
  useEffect(() => {
    registerAlertListener((title, message, buttons) => {
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertButtons(buttons || [{ text: 'OK' }]);
      setAlertVisible(true);
    });
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
        <StatusBar style="dark" animated />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="login" options={{ gestureEnabled: false }} />
          <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
          <Stack.Screen name="profile/[id]" options={{ presentation: 'card', headerShown: false }} />
        </Stack>

        {isLoading && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: Colors.light.background,
            zIndex: 999,
          }}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        )}

        {/* Global Custom Alert Modal for Web */}
        <Modal visible={alertVisible} transparent animationType="fade">
          <View style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <View style={{
              width: 320,
              backgroundColor: '#fff',
              borderRadius: 16,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 5,
            }}>
              <Text style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: Colors.light.text,
                marginBottom: 10,
                textAlign: 'center',
              }}>{alertTitle}</Text>
              
              <Text style={{
                fontSize: 14,
                color: Colors.light.textSecondary,
                marginBottom: 24,
                textAlign: 'center',
                lineHeight: 20,
              }}>{alertMessage}</Text>
              
              <View style={{
                flexDirection: 'row',
                justifyContent: 'center',
                width: '100%',
                gap: 12,
              }}>
                {alertButtons.map((btn, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 8,
                      backgroundColor: btn.style === 'cancel' 
                        ? '#f3f4f6' 
                        : btn.style === 'destructive' 
                          ? Colors.light.error 
                          : Colors.light.primary,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      setAlertVisible(false);
                      if (btn.onPress) btn.onPress();
                    }}
                  >
                    <Text style={{
                      color: btn.style === 'cancel' ? Colors.light.textSecondary : '#fff',
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>{btn.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ThemeProvider>
  );
}
