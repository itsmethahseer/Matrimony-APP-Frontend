import { useEffect, useState, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import {
  ActivityIndicator,
  View,
  TouchableOpacity,
  Modal,
  Text,
  Animated,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '@/constants/theme';
import { registerAlertListener, AlertButton } from '../utils/alert';
import { onUnauthorized } from '@/services/api';

// Helper to pick icon & accent color based on alert title keyword
function getAlertMeta(title: string): { icon: string; color: string; bg: string } {
  const t = title.toLowerCase();
  if (t.includes('success') || t.includes('approved') || t.includes('sent') || t.includes('uploaded') || t.includes('updated') || t.includes('saved')) {
    return { icon: '✓', color: '#ffffff', bg: '#10b981' };
  } else if (t.includes('error') || t.includes('failed') || t.includes('fail')) {
    return { icon: '✕', color: '#ffffff', bg: '#ef4444' };
  } else if (t.includes('warning') || t.includes('required') || t.includes('invalid') || t.includes('validation') || t.includes('unable')) {
    return { icon: '!', color: '#ffffff', bg: '#f59e0b' };
  } else if (t.includes('permission') || t.includes('denied') || t.includes('access')) {
    return { icon: '🔒', color: '#ffffff', bg: '#8b5cf6' };
  } else if (t.includes('delete') || t.includes('reject') || t.includes('rejected')) {
    return { icon: '✕', color: '#ffffff', bg: '#ef4444' };
  } else if (t.includes('payment')) {
    return { icon: '₹', color: '#ffffff', bg: '#d97706' };
  } else if (t.includes('login') || t.includes('password') || t.includes('reset')) {
    return { icon: '🔑', color: '#ffffff', bg: '#065f46' };
  } else {
    return { icon: 'i', color: '#ffffff', bg: '#065f46' };
  }
}

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const segments = useSegments();
  const router = useRouter();

  // Custom global alert modal states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const triggerShowAnimation = () => {
    scaleAnim.setValue(0.85);
    opacityAnim.setValue(0);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    if (alertVisible) triggerShowAnimation();
  }, [alertVisible]);

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

  // Register Alert Listener for custom modals on ALL platforms (Android, iOS, Web)
  useEffect(() => {
    registerAlertListener((title, message, buttons) => {
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertButtons(buttons || [{ text: 'OK' }]);
      setAlertVisible(true);
    });
  }, []);

  const handleButtonPress = (btn: AlertButton) => {
    Animated.timing(opacityAnim, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setAlertVisible(false);
      if (btn.onPress) btn.onPress();
    });
  };

  const alertMeta = getAlertMeta(alertTitle);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.light.background }}>
      <StatusBar style="dark" animated />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ gestureEnabled: false }} />
        <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
        <Stack.Screen name="profile/[id]" options={{ presentation: 'card', headerShown: false }} />
      </Stack>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      )}

      {/* Global Custom Alert Modal — All Platforms (Android, iOS, Web) */}
      <Modal visible={alertVisible} transparent animationType="none" statusBarTranslucent>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.alertBox,
              { opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
            ]}
          >
            {/* Coloured Icon Circle */}
            <View style={[styles.iconCircle, { backgroundColor: alertMeta.bg }]}>
              <Text style={styles.iconText}>{alertMeta.icon}</Text>
            </View>

            {/* Title */}
            <Text style={styles.alertTitle}>{alertTitle}</Text>

            {/* Message */}
            <Text style={styles.alertMessage}>{alertMessage}</Text>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Buttons */}
            <View style={[
              styles.buttonRow,
              alertButtons.length === 1 && styles.buttonRowSingle,
            ]}>
              {alertButtons.map((btn, idx) => (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.8}
                  style={[
                    styles.button,
                    alertButtons.length === 1 && styles.buttonFull,
                    btn.style === 'cancel'
                      ? styles.buttonCancel
                      : btn.style === 'destructive'
                        ? styles.buttonDestructive
                        : styles.buttonPrimary,
                  ]}
                  onPress={() => handleButtonPress(btn)}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      btn.style === 'cancel' && styles.buttonTextCancel,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    zIndex: 999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  alertBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 14,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: '700',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e2e8f0',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  buttonRowSingle: {
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    flex: 1,
  },
  buttonPrimary: {
    backgroundColor: '#065f46',
  },
  buttonCancel: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  buttonDestructive: {
    backgroundColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  buttonTextCancel: {
    color: '#475569',
  },
});
