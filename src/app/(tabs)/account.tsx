import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, removeToken } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from '../../utils/alert';

interface MenuSummary {
  name: string;
  user_id: number;
  membership_status: string;
  plan_type: string | null;
  remaining_contact_views: number;
  remaining_messages: number;
  remaining_call_time: number;
  plan_validity: string | null;
  is_expired: boolean;
}

export default function AccountScreen() {
  const [summary, setSummary] = useState<MenuSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Modals visibility states
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [verifyModalVisible, setVerifyModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [payModalVisible, setPayModalVisible] = useState(false);
  
  // Support data state
  const [supportData, setSupportData] = useState<any>(null);

  // Verification form state
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Payment mock states
  const [selectedPlan, setSelectedPlan] = useState<'Silver' | 'Gold' | 'Platinum' | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiTxId, setUpiTxId] = useState('');
  const [isProcessingPay, setIsProcessingPay] = useState(false);
  const [merchantUpiId, setMerchantUpiId] = useState('matrimonyapp@upi');
  const [merchantName, setMerchantName] = useState('Matrimony Services');

  // Edit Profile States
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editAbout, setEditAbout] = useState('');
  const [editEducation, setEditEducation] = useState('');
  const [editIncome, setEditIncome] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [myProfile, setMyProfile] = useState<any>(null);

  const router = useRouter();

  const loadData = async () => {
    try {
      const menuData = await api.getMenuSummary();
      setSummary(menuData);
      
      const me = await api.getMe();
      setUserData(me);

      const config = await api.getPaymentConfig();
      setMerchantUpiId(config.merchant_upi_id);
      setMerchantName(config.merchant_name);

      const profile = await api.getMyProfile();
      setMyProfile(profile);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Log Out', 
          style: 'destructive',
          onPress: async () => {
            await removeToken();
            router.replace('/login');
          }
        }
      ]
    );
  };

  const getPlanPrice = (plan: 'Silver' | 'Gold' | 'Platinum') => {
    if (plan === 'Silver') return 1499;
    if (plan === 'Gold') return 2999;
    return 5499;
  };

  const handleSelectPlan = (plan: 'Silver' | 'Gold' | 'Platinum') => {
    setSelectedPlan(plan);
    setSubModalVisible(false);
    setPayModalVisible(true);
    setPaymentMethod('upi');
    setUpiTxId('');
    // Preset mock details for easy testing
    setCardNumber('4111 2222 3333 4444');
    setCardExpiry('12/28');
    setCardCvv('123');
    setCardName('Test User');
  };

  const handleUpiPayIntent = async () => {
    if (!selectedPlan) return;
    const price = getPlanPrice(selectedPlan);
    const upiUrl = `upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${price}&cu=INR&tn=${encodeURIComponent(selectedPlan + ' Plan Upgrade')}`;
    
    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        if (Platform.OS === 'web') {
          Alert.alert('Scan QR Code', 'Please scan the QR code using Google Pay, PhonePe, or Paytm on your mobile phone to complete payment.');
        } else {
          Alert.alert('No UPI App Found', 'Could not open any UPI app on this device. Please scan the QR code or use Card payment.');
        }
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'An error occurred opening the UPI application.');
    }
  };

  const handleUpgrade = async () => {
    if (!selectedPlan) return;
    setIsProcessingPay(true);
    try {
      // Simulate network request delay for realistic payment gateway loading
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      await api.subscribePlan(selectedPlan);
      Alert.alert('Payment Successful', `Successfully processed payment and upgraded to the ${selectedPlan} Plan!`);
      setPayModalVisible(false);
      loadData(); // Reload balances
    } catch (error: any) {
      Alert.alert('Payment Failed', error.message || 'Payment transaction failed.');
    } finally {
      setIsProcessingPay(false);
    }
  };

  const openEditProfile = async () => {
    setIsLoading(true);
    try {
      const profile = await api.getMyProfile();
      setEditName(profile.name || '');
      setEditAge(profile.age ? profile.age.toString() : '');
      setEditLocation(profile.present_location || '');
      setEditProfession(profile.profession || '');
      setEditAbout(profile.about || '');
      setEditEducation(profile.education || '');
      setEditIncome(profile.annual_income ? profile.annual_income.toString() : '');
      setEditHeight(profile.height ? profile.height.toString() : '');
      setEditWeight(profile.weight ? profile.weight.toString() : '');
      setEditModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not retrieve profile information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Name cannot be empty.');
      return;
    }
    const ageNum = parseInt(editAge);
    if (isNaN(ageNum) || ageNum < 18) {
      Alert.alert('Validation Error', 'Age must be a valid number and at least 18.');
      return;
    }

    setIsSavingProfile(true);
    try {
      const updatedData = {
        name: editName.trim(),
        age: ageNum,
        present_location: editLocation.trim(),
        profession: editProfession.trim(),
        about: editAbout.trim(),
        education: editEducation.trim(),
        annual_income: editIncome ? parseFloat(editIncome) : null,
        height: editHeight ? parseFloat(editHeight) : null,
        weight: editWeight ? parseFloat(editWeight) : null,
      };

      await api.updateMyProfile(updatedData);
      Alert.alert('Success', 'Profile updated successfully!');
      setEditModalVisible(false);
      loadData(); // Refresh summary values
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePickDocument = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        if (Platform.OS === 'web') {
          alert('Permission to access media library is required.');
        } else {
          Alert.alert('Permission Denied', 'Permission to access media library is required.');
        }
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        
        if (Platform.OS === 'web') {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const file = new File([blob], asset.fileName || 'verification_doc.jpg', { type: blob.type || 'image/jpeg' });
          setSelectedFile({
            file: file,
            name: asset.fileName || 'verification_doc.jpg',
            uri: asset.uri
          });
        } else {
          setSelectedFile({
            file: {
              uri: asset.uri,
              name: asset.fileName || 'verification_doc.jpg',
              type: asset.mimeType || 'image/jpeg',
            },
            name: asset.fileName || 'verification_doc.jpg',
            uri: asset.uri
          });
        }
      }
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(error.message || 'Error picking document');
      } else {
        Alert.alert('Error', error.message || 'Error picking document');
      }
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) return;
    setIsVerifying(true);
    try {
      await api.uploadVerifyId(selectedFile.file);
      if (Platform.OS === 'web') {
        alert('Verification document uploaded and submitted! Admin will review shortly.');
      } else {
        Alert.alert('Document Submitted', 'Verification document uploaded and submitted! Admin will review shortly.');
      }
      setVerifyModalVisible(false);
      setSelectedFile(null);
      loadData(); // Reload user data status
    } catch (error: any) {
      if (Platform.OS === 'web') {
        alert(error.message || 'Verification upload failed.');
      } else {
        Alert.alert('Error', error.message || 'Verification upload failed.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const openSupport = async () => {
    setSupportModalVisible(true);
    try {
      const data = await api.getSupport();
      setSupportData(data);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading || !summary) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  // Get user avatar or placeholder
  const avatarUrl = userData?.photos?.find((p: any) => p.is_main)?.url || 'https://via.placeholder.com/150';
  const isVerified = userData?.id_verification_status === 'Verified';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
              </View>
            )}
          </View>
          <Text style={styles.profileName}>{summary.name}</Text>
          <Text style={styles.profileId}>ID: SM-{summary.user_id}</Text>
        </View>

        {/* Membership Plan Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <View>
              <Text style={styles.membershipTierLabel}>CURRENT TIER</Text>
              <Text style={styles.membershipTierName}>
                {summary.plan_type ? `${summary.plan_type} Member` : 'Free Account'}
              </Text>
            </View>
            <Ionicons name="ribbon-sharp" size={32} color={Colors.light.secondaryContainer} />
          </View>

          <View style={styles.quotaGrid}>
            <View style={styles.quotaBox}>
              <Text style={styles.quotaLabel}>CONTACTS</Text>
              <Text style={styles.quotaValue}>
                {summary.remaining_contact_views === 9999 ? '∞' : summary.remaining_contact_views}
              </Text>
            </View>
            <View style={styles.quotaBox}>
              <Text style={styles.quotaLabel}>MESSAGES</Text>
              <Text style={styles.quotaValue}>
                {summary.remaining_messages === 9999 ? '∞' : summary.remaining_messages}
              </Text>
            </View>
            <View style={styles.quotaBox}>
              <Text style={styles.quotaLabel}>MINUTES</Text>
              <Text style={styles.quotaValue}>{summary.remaining_call_time}</Text>
            </View>
          </View>

          <View style={styles.membershipFooter}>
            <Text style={styles.validityText}>
              {summary.plan_validity 
                ? `Valid until: ${new Date(summary.plan_validity).toLocaleDateString()}` 
                : 'Subscribe to view profiles'}
            </Text>
            <TouchableOpacity 
              style={styles.upgradeBtn}
              onPress={() => setSubModalVisible(true)}
            >
              <Text style={styles.upgradeBtnText}>Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Navigation Options List */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={openEditProfile}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="create-outline" size={22} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              if (myProfile) {
                router.push(`/profile/${myProfile.id}`);
              } else {
                Alert.alert('Loading', 'Profile details are loading, please try again.');
              }
            }}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="eye-outline" size={22} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Preview My Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setSubModalVisible(true)}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="card-outline" size={22} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Subscriptions & Billing</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setVerifyModalVisible(true)}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.light.primary} />
              <View>
                <Text style={styles.menuItemText}>Verification Status</Text>
                <Text style={styles.menuItemSubtext}>
                  Status: <Text style={{ fontWeight: 'bold', color: Colors.light.primary }}>{userData?.id_verification_status || 'Unverified'}</Text>
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={openSupport}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={Colors.light.error} />
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* --- MODALS --- */}

      {/* Modal 1: Subscriptions Upgrade */}
      <Modal visible={subModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Choose a Plan</Text>
              <TouchableOpacity onPress={() => setSubModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {/* Plan 1: Silver */}
              <TouchableOpacity style={styles.planCard} onPress={() => handleSelectPlan('Silver')}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>Silver Plan</Text>
                  <Text style={styles.planPrice}>₹1,499 / mo</Text>
                </View>
                <Text style={styles.planDesc}>• 20 Contact Views • 200 Messages • 60 Mins Calls • Validity: 30 days</Text>
              </TouchableOpacity>

              {/* Plan 2: Gold */}
              <TouchableOpacity style={[styles.planCard, styles.goldPlanCard]} onPress={() => handleSelectPlan('Gold')}>
                <View style={styles.planHeader}>
                  <Text style={[styles.planTitle, { color: '#735c00' }]}>Gold Plan</Text>
                  <Text style={[styles.planPrice, { color: '#735c00' }]}>₹2,999 / 3 mos</Text>
                </View>
                <Text style={styles.planDesc}>• 100 Contact Views • 1000 Messages • 300 Mins Calls • Validity: 90 days</Text>
              </TouchableOpacity>

              {/* Plan 3: Platinum */}
              <TouchableOpacity style={[styles.planCard, styles.platPlanCard]} onPress={() => handleSelectPlan('Platinum')}>
                <View style={styles.planHeader}>
                  <Text style={[styles.planTitle, { color: '#fff' }]}>Platinum Plan</Text>
                  <Text style={[styles.planPrice, { color: '#fff' }]}>₹5,499 / 6 mos</Text>
                </View>
                <Text style={[styles.planDesc, { color: '#eee' }]}>• Unlimited Contacts • Unlimited Messages • 1000 Mins Calls • Validity: 180 days</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 2: ID Verification */}
      <Modal visible={verifyModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>Identity Verification</Text>
              <TouchableOpacity onPress={() => setVerifyModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.alertBody}>
              <Text style={styles.alertText}>
                Upload your ID document image (identity card, passport, or license) to get the verified badge and gain trust from matches.
              </Text>
              
              <TouchableOpacity 
                style={[styles.verifyInput, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', borderStyle: 'dashed', height: 80 }]}
                onPress={handlePickDocument}
              >
                <Ionicons name="cloud-upload-outline" size={24} color={Colors.light.primary} />
                <Text style={{ fontSize: 13, color: Colors.light.textSecondary, marginTop: 4, textAlign: 'center', paddingHorizontal: 10 }}>
                  {selectedFile ? selectedFile.name : 'Select ID Card/Passport Image'}
                </Text>
              </TouchableOpacity>

              {selectedFile?.uri && (
                <View style={{ alignItems: 'center', marginVertical: 12 }}>
                  <Image source={{ uri: selectedFile.uri }} style={{ width: 180, height: 110, borderRadius: 8, resizeMode: 'cover' }} />
                </View>
              )}

              <TouchableOpacity 
                style={[styles.verifySubmitBtn, { marginTop: selectedFile ? 10 : 20 }]}
                onPress={handleVerify}
                disabled={isVerifying || !selectedFile}
              >
                {isVerifying ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.verifySubmitBtnText}>Upload & Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal 3: Help & Support */}
      <Modal visible={supportModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Help & Support</Text>
              <TouchableOpacity onPress={() => setSupportModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {supportData ? (
              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.supportContactCard}>
                  <Text style={styles.supportHeadline}>Need immediate assistance?</Text>
                  <Text style={styles.supportDetail}>📧 Email: {supportData.support_email}</Text>
                  <Text style={styles.supportDetail}>📞 Hotline: {supportData.hotline}</Text>
                  <Text style={styles.supportDetail}>⏰ Hours: {supportData.operating_hours}</Text>
                </View>

                <Text style={styles.faqHeader}>Frequently Asked Questions</Text>
                {supportData.faq?.map((faq: any, index: number) => (
                  <View key={index} style={styles.faqCard}>
                    <Text style={styles.faqQuestion}>Q: {faq.question}</Text>
                    <Text style={styles.faqAnswer}>{faq.answer}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.sheetLoading}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal 4: Payment Checkout */}
      <Modal visible={payModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Payment Checkout</Text>
              <TouchableOpacity onPress={() => setPayModalVisible(false)} disabled={isProcessingPay}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.checkoutSummaryCard}>
                <Text style={styles.checkoutSummaryLabel}>SELECTED PLAN</Text>
                <Text style={styles.checkoutSummaryPlan}>{selectedPlan} Plan</Text>
                <Text style={styles.checkoutSummaryPrice}>
                  {selectedPlan === 'Silver' && '₹1,499'}
                  {selectedPlan === 'Gold' && '₹2,999'}
                  {selectedPlan === 'Platinum' && '₹5,499'}
                </Text>
              </View>

              {/* Payment Method Selector Tabs */}
              <View style={styles.paymentTabsContainer}>
                <TouchableOpacity 
                  style={[styles.paymentTab, paymentMethod === 'upi' && styles.activePaymentTab]}
                  onPress={() => setPaymentMethod('upi')}
                  disabled={isProcessingPay}
                >
                  <Ionicons name="qr-code-outline" size={18} color={paymentMethod === 'upi' ? Colors.light.primary : Colors.light.textSecondary} />
                  <Text style={[styles.paymentTabLabel, paymentMethod === 'upi' && styles.activePaymentTabLabel]}>
                    UPI (0% Fee)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.paymentTab, paymentMethod === 'card' && styles.activePaymentTab]}
                  onPress={() => setPaymentMethod('card')}
                  disabled={isProcessingPay}
                >
                  <Ionicons name="card-outline" size={18} color={paymentMethod === 'card' ? Colors.light.primary : Colors.light.textSecondary} />
                  <Text style={[styles.paymentTabLabel, paymentMethod === 'card' && styles.activePaymentTabLabel]}>
                    Card Payment
                  </Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'upi' ? (
                <View style={styles.upiContainer}>
                  <Text style={styles.upiInstructions}>
                    Pay securely using any UPI app (GPay, PhonePe, Paytm, BHIM) with **zero transaction fees**.
                  </Text>

                  {/* QR Code section */}
                  <View style={styles.qrCodeContainer}>
                    <Image 
                      source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=${merchantUpiId}&pn=${encodeURIComponent(merchantName)}&am=${selectedPlan ? getPlanPrice(selectedPlan) : 0}&cu=INR&tn=${selectedPlan}%20Upgrade`)}` }} 
                      style={styles.qrCodeImage} 
                    />
                    <Text style={styles.qrCodeSubtext}>Scan this QR code to pay instantly</Text>
                  </View>

                  {/* Mobile Direct Pay Button */}
                  {Platform.OS !== 'web' && (
                    <TouchableOpacity 
                      style={styles.upiDirectPayBtn}
                      onPress={handleUpiPayIntent}
                      disabled={isProcessingPay}
                    >
                      <Ionicons name="flash-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.upiDirectPayBtnText}>Open Installed UPI App</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.inputLabel}>UPI TRANSACTION ID / UTR (OPTIONAL)</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={upiTxId}
                    onChangeText={setUpiTxId}
                    placeholder="Enter 12-digit transaction Ref No"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="numeric"
                    maxLength={12}
                    editable={!isProcessingPay}
                  />

                  <TouchableOpacity
                    style={[styles.payNowBtn, { backgroundColor: isProcessingPay ? '#9ca3af' : Colors.light.primary }]}
                    onPress={handleUpgrade}
                    disabled={isProcessingPay}
                  >
                    {isProcessingPay ? (
                      <View style={styles.payBtnLoadingRow}>
                        <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.payNowBtnText}>Verifying Payment...</Text>
                      </View>
                    ) : (
                      <Text style={styles.payNowBtnText}>I Have Paid - Activate Plan</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.cardContainer}>
                  <Text style={styles.paymentSectionHeader}>Card Details</Text>

                  <Text style={styles.inputLabel}>CARDHOLDER NAME</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={cardName}
                    onChangeText={setCardName}
                    placeholder="Name on card"
                    placeholderTextColor={Colors.light.textSecondary}
                    editable={!isProcessingPay}
                  />

                  <Text style={styles.inputLabel}>CARD NUMBER</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    placeholder="4111 2222 3333 4444"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="numeric"
                    maxLength={19}
                    editable={!isProcessingPay}
                  />

                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.inputLabel}>EXPIRY DATE</Text>
                      <TextInput
                        style={styles.paymentInput}
                        value={cardExpiry}
                        onChangeText={setCardExpiry}
                        placeholder="MM/YY"
                        placeholderTextColor={Colors.light.textSecondary}
                        maxLength={5}
                        editable={!isProcessingPay}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>CVV</Text>
                      <TextInput
                        style={styles.paymentInput}
                        value={cardCvv}
                        onChangeText={setCardCvv}
                        placeholder="123"
                        placeholderTextColor={Colors.light.textSecondary}
                        keyboardType="numeric"
                        maxLength={4}
                        secureTextEntry
                        editable={!isProcessingPay}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.payNowBtn, { backgroundColor: isProcessingPay ? '#9ca3af' : Colors.light.primary }]}
                    onPress={handleUpgrade}
                    disabled={isProcessingPay || !cardNumber || !cardExpiry || !cardCvv || !cardName}
                  >
                    {isProcessingPay ? (
                      <View style={styles.payBtnLoadingRow}>
                        <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.payNowBtnText}>Processing Secure Payment...</Text>
                      </View>
                    ) : (
                      <Text style={styles.payNowBtnText}>Pay & Activate Plan</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.secureNotice}>
                🔒 Secure SSL encrypted transaction connection.
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 5: Edit Profile */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Profile Details</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} disabled={isSavingProfile}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.paymentInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Ahmed Khan"
                placeholderTextColor={Colors.light.textSecondary}
                editable={!isSavingProfile}
              />

              <Text style={styles.inputLabel}>AGE</Text>
              <TextInput
                style={styles.paymentInput}
                value={editAge}
                onChangeText={setEditAge}
                placeholder="28"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
                maxLength={3}
                editable={!isSavingProfile}
              />

              <Text style={styles.inputLabel}>PRESENT LOCATION (CITY/DISTRICT)</Text>
              <TextInput
                style={styles.paymentInput}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="Mumbai"
                placeholderTextColor={Colors.light.textSecondary}
                editable={!isSavingProfile}
              />

              <Text style={styles.inputLabel}>PROFESSION</Text>
              <TextInput
                style={styles.paymentInput}
                value={editProfession}
                onChangeText={setEditProfession}
                placeholder="Software Engineer"
                placeholderTextColor={Colors.light.textSecondary}
                editable={!isSavingProfile}
              />

              <Text style={styles.inputLabel}>EDUCATION</Text>
              <TextInput
                style={styles.paymentInput}
                value={editEducation}
                onChangeText={setEditEducation}
                placeholder="B.Tech Computer Science"
                placeholderTextColor={Colors.light.textSecondary}
                editable={!isSavingProfile}
              />

              <Text style={styles.inputLabel}>ANNUAL INCOME (INR)</Text>
              <TextInput
                style={styles.paymentInput}
                value={editIncome}
                onChangeText={setEditIncome}
                placeholder="1200000"
                placeholderTextColor={Colors.light.textSecondary}
                keyboardType="numeric"
                editable={!isSavingProfile}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editHeight}
                    onChangeText={setEditHeight}
                    placeholder="178"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="numeric"
                    maxLength={3}
                    editable={!isSavingProfile}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editWeight}
                    onChangeText={setEditWeight}
                    placeholder="74"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="numeric"
                    maxLength={3}
                    editable={!isSavingProfile}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>ABOUT ME</Text>
              <TextInput
                style={[styles.paymentInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                value={editAbout}
                onChangeText={setEditAbout}
                placeholder="Tell potential matches about yourself, hobbies, values, etc..."
                placeholderTextColor={Colors.light.textSecondary}
                multiline
                numberOfLines={3}
                editable={!isSavingProfile}
              />

              <TouchableOpacity
                style={[styles.payNowBtn, { backgroundColor: isSavingProfile ? '#9ca3af' : Colors.light.primary, marginBottom: 40 }]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <View style={styles.payBtnLoadingRow}>
                    <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.payNowBtnText}>Saving Profile Changes...</Text>
                  </View>
                ) : (
                  <Text style={styles.payNowBtnText}>Save Profile Details</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#2d2926',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.light.emerald,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  profileId: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 4,
    letterSpacing: 1,
  },
  membershipCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 30,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  membershipTierLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.light.onPrimaryContainer,
    opacity: 0.8,
    letterSpacing: 1,
  },
  membershipTierName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  quotaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  quotaBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  quotaLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  quotaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  membershipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 16,
  },
  validityText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  upgradeBtn: {
    backgroundColor: Colors.light.secondaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.light.onSecondaryContainer,
    textTransform: 'uppercase',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
    shadowColor: '#2d2926',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 225, 220, 0.2)',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuItemText: {
    fontSize: 15,
    color: Colors.light.text,
    fontWeight: '500',
  },
  menuItemSubtext: {
    fontSize: 10,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#ffdada',
    borderWidth: 1,
    borderColor: '#ffb3b5',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.error,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Layouts
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: 24,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 225, 220, 0.5)',
    paddingBottom: 12,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  sheetScroll: {
    marginBottom: 24,
  },
  sheetLoading: {
    paddingVertical: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planCard: {
    backgroundColor: '#fff8f5',
    borderWidth: 1,
    borderColor: 'rgba(224, 191, 191, 0.5)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  goldPlanCard: {
    backgroundColor: '#fffcf0',
    borderColor: 'rgba(254, 214, 91, 0.5)',
  },
  platPlanCard: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  planDesc: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },

  // Alert Modal
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    alignSelf: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  alertBody: {
    gap: 16,
  },
  alertText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  verifyInput: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.light.surfaceVariant,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: Colors.light.text,
  },
  verifySubmitBtn: {
    backgroundColor: Colors.light.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifySubmitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Support detail styles
  supportContactCard: {
    backgroundColor: 'rgba(115, 92, 0, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(254, 214, 91, 0.4)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  supportHeadline: {
    fontWeight: 'bold',
    color: Colors.light.secondary,
    marginBottom: 8,
  },
  supportDetail: {
    fontSize: 14,
    color: Colors.light.text,
    marginTop: 4,
  },
  faqHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 12,
  },
  faqCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(233, 225, 220, 0.5)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  faqQuestion: {
    fontWeight: 'bold',
    color: Colors.light.text,
    fontSize: 14,
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  checkoutSummaryCard: {
    backgroundColor: '#f7f6f5',
    borderWidth: 1,
    borderColor: '#e9e1dc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  checkoutSummaryLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    letterSpacing: 1,
  },
  checkoutSummaryPlan: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 4,
  },
  checkoutSummaryPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginTop: 8,
  },
  paymentSectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  paymentInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e9e1dc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    color: Colors.light.text,
    backgroundColor: '#fff',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payNowBtn: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  payNowBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  payBtnLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureNotice: {
    textAlign: 'center',
    color: Colors.light.textSecondary,
    fontSize: 12,
    marginTop: 16,
    marginBottom: 30,
  },
  paymentTabsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  paymentTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9e1dc',
    borderRadius: 8,
    backgroundColor: '#fff',
    gap: 6,
  },
  activePaymentTab: {
    borderColor: Colors.light.primary,
    backgroundColor: 'rgba(115, 92, 0, 0.04)',
  },
  paymentTabLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  activePaymentTabLabel: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  upiContainer: {
    gap: 12,
  },
  upiInstructions: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e9e1dc',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  qrCodeImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  qrCodeSubtext: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  upiDirectPayBtn: {
    backgroundColor: '#0070e0',
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#0070e0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
  },
  upiDirectPayBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  cardContainer: {
    gap: 12,
  },
});
