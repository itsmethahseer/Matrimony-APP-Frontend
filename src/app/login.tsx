import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { Alert } from '../utils/alert';

export default function LoginScreen() {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);
  
  // Email state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Google Auth state
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleModalVisible, setGoogleModalVisible] = useState(false);

  // Forgot Password modal state
  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotChannel, setForgotChannel] = useState<'email' | 'whatsapp'>('email');
  const [resetCodeSent, setResetCodeSent] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotNotice, setForgotNotice] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const router = useRouter();

  // Handle Email + Password submit
  const handleEmailSubmit = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      if (isLogin) {
        await api.login(email.trim(), password);
        router.replace('/(tabs)');
      } else {
        await api.register(email.trim(), password);
        await api.login(email.trim(), password);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Sign-In / Register passwordless
  const handleGoogleSignIn = async (userEmail?: string) => {
    const targetEmail = (userEmail || googleEmailInput || 'user.google@gmail.com').trim();
    const googleId = `google_sub_${targetEmail.replace(/[^a-zA-Z0-9]/g, '')}`;
    
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.googleAuth(targetEmail, googleId, targetEmail.split('@')[0]);
      setGoogleModalVisible(false);
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Send OTP
  const handleSendOTP = async () => {
    if (!phoneNumber || phoneNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await api.sendOTP(phoneNumber.trim());
      setOtpSent(true);
      setOtpNotice(`✅ OTP Code sent! For testing, use code: ${res.otp_debug || '123456'}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMsg('Please enter the 6-digit OTP code.');
      return;
    }
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await api.verifyOTP(phoneNumber.trim(), otpCode.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMsg(err.message || 'OTP verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Forgot Password - Request Reset Code
  const handleRequestReset = async () => {
    if (!forgotIdentifier.trim()) {
      Alert.alert('Required', 'Please enter your registered Email or Mobile number.');
      return;
    }
    setIsLoading(true);

    try {
      const res = await api.forgotPassword(forgotIdentifier.trim(), forgotChannel);
      setResetCodeSent(true);
      setForgotNotice(`✅ Password reset link & code sent via ${forgotChannel.toUpperCase()}! Test Code: ${res.reset_code_debug || '889900'}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Reset Password Submit
  const handleResetPasswordSubmit = async () => {
    if (!resetCode.trim() || !newPassword.trim()) {
      Alert.alert('Required', 'Please enter the reset code and your new password.');
      return;
    }
    if (newPassword.trim().length < 6) {
      Alert.alert('Invalid Password', 'New password must be at least 6 characters.');
      return;
    }
    setIsLoading(true);

    try {
      await api.resetPassword(forgotIdentifier.trim(), resetCode.trim(), newPassword.trim());
      Alert.alert('Success 🎉', 'Your password has been updated successfully! Please sign in with your new password.');
      setForgotModalVisible(false);
      setResetCodeSent(false);
      setResetCode('');
      setNewPassword('');
      setForgotIdentifier('');
      setAuthMethod('email');
      setIsLogin(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not reset password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          
          {/* App Branding */}
          <View style={styles.headerSection}>
            <Text style={styles.appName}>HelpMeet</Text>
            <Text style={styles.appTagline}>Premium Matrimony Discovery</Text>
          </View>

          {/* Main Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{isLogin ? 'Welcome Back' : 'Create Account'}</Text>
            <Text style={styles.cardSubtitle}>
              {isLogin 
                ? 'Sign in to discover your perfect match' 
                : 'Join us to find your eternal partner'}
            </Text>

            {/* Error Notice */}
            {errorMsg && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            {/* OTP Notice */}
            {otpNotice && authMethod === 'phone' && (
              <View style={styles.noticeContainer}>
                <Text style={styles.noticeText}>{otpNotice}</Text>
              </View>
            )}

            {/* Auth Method Selector Tabs */}
            <View style={styles.methodTabContainer}>
              <TouchableOpacity
                style={[styles.methodTab, authMethod === 'email' && styles.activeMethodTab]}
                onPress={() => {
                  setAuthMethod('email');
                  setErrorMsg(null);
                }}
              >
                <Ionicons name="mail" size={16} color={authMethod === 'email' ? '#fff' : Colors.light.textSecondary} />
                <Text style={[styles.methodTabText, authMethod === 'email' && styles.activeMethodTabText]}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodTab, authMethod === 'phone' && styles.activeMethodTab]}
                onPress={() => {
                  setAuthMethod('phone');
                  setErrorMsg(null);
                }}
              >
                <Ionicons name="call" size={16} color={authMethod === 'phone' ? '#fff' : Colors.light.textSecondary} />
                <Text style={[styles.methodTabText, authMethod === 'phone' && styles.activeMethodTabText]}>Mobile OTP</Text>
              </TouchableOpacity>
            </View>

            {/* Google Sign-In Quick Button */}
            <TouchableOpacity
              style={styles.googleBtn}
              activeOpacity={0.85}
              onPress={() => {
                setErrorMsg(null);
                setGoogleModalVisible(true);
              }}
            >
              <Ionicons name="logo-google" size={20} color="#ea4335" />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with {authMethod === 'email' ? 'email' : 'mobile'}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* 1. Email & Password Form */}
            {authMethod === 'email' && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="email@example.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      setErrorMsg(null);
                    }}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={styles.label}>Password</Text>
                    {isLogin && (
                      <TouchableOpacity onPress={() => {
                        setForgotIdentifier(email);
                        setForgotNotice(null);
                        setResetCodeSent(false);
                        setForgotModalVisible(true);
                      }}>
                        <Text style={{ fontSize: 12, color: Colors.light.primary, fontWeight: 'bold' }}>Forgot Password?</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    autoCapitalize="none"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMsg(null);
                    }}
                  />
                </View>

                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleEmailSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{isLogin ? 'Sign In' : 'Sign Up'}</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* 2. Mobile Number + OTP Form */}
            {authMethod === 'phone' && (
              <View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mobile Number (with Country Code)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+91 9876543210"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={(text) => {
                      setPhoneNumber(text);
                      setErrorMsg(null);
                    }}
                  />
                </View>

                {otpSent && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>6-Digit Verification OTP</Text>
                    <TextInput
                      style={[styles.input, { letterSpacing: 4, fontWeight: 'bold', fontSize: 18, textAlign: 'center' }]}
                      placeholder="123456"
                      placeholderTextColor="#9ca3af"
                      keyboardType="numeric"
                      maxLength={6}
                      value={otpCode}
                      onChangeText={(text) => {
                        setOtpCode(text);
                        setErrorMsg(null);
                      }}
                    />
                  </View>
                )}

                <TouchableOpacity 
                  style={styles.button} 
                  onPress={otpSent ? handleVerifyOTP : handleSendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>{otpSent ? 'Verify OTP & Sign In' : 'Send Verification OTP'}</Text>
                  )}
                </TouchableOpacity>

                {otpSent && (
                  <TouchableOpacity 
                    style={{ marginTop: 12, alignItems: 'center' }}
                    onPress={handleSendOTP}
                  >
                    <Text style={{ color: Colors.light.primary, fontSize: 13, fontWeight: 'bold' }}>Resend OTP Code</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Toggle Mode Footer */}
            {authMethod === 'email' && (
              <View style={styles.switchModeContainer}>
                <Text style={styles.switchModeText}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                </Text>
                <TouchableOpacity onPress={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg(null);
                  setPassword('');
                }}>
                  <Text style={styles.switchModeLink}>
                    {isLogin ? 'Sign Up Now' : 'Sign In'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Google Authentication Modal */}
      <Modal visible={googleModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="logo-google" size={36} color="#ea4335" style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Google One-Tap Sign In</Text>
            <Text style={styles.modalSub}>
              Sign up or sign in passwordlessly using your Google account.
            </Text>

            <View style={{ width: '100%', marginVertical: 14 }}>
              <Text style={styles.label}>Google Account Email</Text>
              <TextInput
                style={styles.input}
                placeholder="user@gmail.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                value={googleEmailInput}
                onChangeText={setGoogleEmailInput}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { width: '100%', marginBottom: 10 }]}
              onPress={() => handleGoogleSignIn(googleEmailInput)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Continue as {googleEmailInput ? googleEmailInput.split('@')[0] : 'Google User'}</Text>
              )}
            </TouchableOpacity>

            {/* Demo Quick Accounts */}
            <Text style={{ fontSize: 11, color: Colors.light.textSecondary, marginBottom: 10 }}>Or quick test with:</Text>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
              {['ahmed.google@gmail.com', 'fatima.google@gmail.com', 'zara.google@gmail.com'].map((gEmail) => (
                <TouchableOpacity
                  key={gEmail}
                  style={{ backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}
                  onPress={() => {
                    setGoogleEmailInput(gEmail);
                    handleGoogleSignIn(gEmail);
                  }}
                >
                  <Text style={{ fontSize: 12, color: Colors.light.primary, fontWeight: 'bold' }}>{gEmail}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={{ paddingVertical: 8 }}
              onPress={() => setGoogleModalVisible(false)}
            >
              <Text style={{ color: Colors.light.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Forgot Password Modal (Email or WhatsApp Link/Code) */}
      <Modal visible={forgotModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Ionicons name="key-outline" size={36} color={Colors.light.primary} style={{ marginBottom: 10 }} />
            <Text style={styles.modalTitle}>Forgot Password?</Text>
            <Text style={styles.modalSub}>
              We can send a password reset code or link directly via Email or WhatsApp.
            </Text>

            {forgotNotice && (
              <View style={[styles.noticeContainer, { width: '100%', marginVertical: 10 }]}>
                <Text style={styles.noticeText}>{forgotNotice}</Text>
              </View>
            )}

            {/* Channel Tabs: Email vs WhatsApp */}
            <View style={[styles.methodTabContainer, { width: '100%', marginVertical: 12 }]}>
              <TouchableOpacity
                style={[styles.methodTab, forgotChannel === 'email' && styles.activeMethodTab]}
                onPress={() => setForgotChannel('email')}
              >
                <Ionicons name="mail" size={14} color={forgotChannel === 'email' ? '#fff' : Colors.light.textSecondary} />
                <Text style={[styles.methodTabText, forgotChannel === 'email' && styles.activeMethodTabText]}>Via Email</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.methodTab, forgotChannel === 'whatsapp' && styles.activeMethodTab]}
                onPress={() => setForgotChannel('whatsapp')}
              >
                <Ionicons name="logo-whatsapp" size={14} color={forgotChannel === 'whatsapp' ? '#fff' : Colors.light.textSecondary} />
                <Text style={[styles.methodTabText, forgotChannel === 'whatsapp' && styles.activeMethodTabText]}>Via WhatsApp</Text>
              </TouchableOpacity>
            </View>

            <View style={{ width: '100%', marginBottom: 14 }}>
              <Text style={styles.label}>Registered {forgotChannel === 'email' ? 'Email Address' : 'WhatsApp Number'}</Text>
              <TextInput
                style={styles.input}
                placeholder={forgotChannel === 'email' ? 'email@example.com' : '+91 9876543210'}
                placeholderTextColor="#9ca3af"
                keyboardType={forgotChannel === 'email' ? 'email-address' : 'phone-pad'}
                autoCapitalize="none"
                value={forgotIdentifier}
                onChangeText={setForgotIdentifier}
              />
            </View>

            {!resetCodeSent ? (
              <TouchableOpacity
                style={[styles.button, { width: '100%' }]}
                onPress={handleRequestReset}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Code via {forgotChannel.toUpperCase()}</Text>
                )}
              </TouchableOpacity>
            ) : (
              <View style={{ width: '100%', gap: 12 }}>
                <View>
                  <Text style={styles.label}>6-Digit Reset Code</Text>
                  <TextInput
                    style={[styles.input, { letterSpacing: 4, textAlign: 'center', fontWeight: 'bold' }]}
                    placeholder="889900"
                    placeholderTextColor="#9ca3af"
                    keyboardType="numeric"
                    maxLength={6}
                    value={resetCode}
                    onChangeText={setResetCode}
                  />
                </View>

                <View>
                  <Text style={styles.label}>New Password</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter new password (min 6 chars)"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.button, { width: '100%' }]}
                  onPress={handleResetPasswordSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Update Password & Complete Reset</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={{ marginTop: 16 }}
              onPress={() => setForgotModalVisible(false)}
            >
              <Text style={{ color: Colors.light.textSecondary, fontWeight: 'bold' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  appName: {
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    fontSize: 42,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 4,
  },
  appTagline: {
    fontSize: 13,
    color: Colors.light.secondary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 6,
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  noticeContainer: {
    backgroundColor: '#ecfdf5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  noticeText: {
    color: '#047857',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  methodTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeMethodTab: {
    backgroundColor: Colors.light.primary,
  },
  methodTabText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
  },
  activeMethodTabText: {
    color: '#ffffff',
  },
  googleBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  googleBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    paddingHorizontal: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Colors.light.text,
    backgroundColor: '#ffffff',
  },
  button: {
    backgroundColor: Colors.light.primary,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  switchModeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchModeText: {
    color: Colors.light.textSecondary,
    fontSize: 14,
  },
  switchModeLink: {
    color: Colors.light.primary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 6,
  },
  modalSub: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
});
