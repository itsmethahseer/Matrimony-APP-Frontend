import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Platform,
  Linking,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api, API_URL, removeToken } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Alert } from '../../utils/alert';

const RELIGION_CASTE_MAP: Record<string, string[]> = {
  Islam: ['Sunni', 'Shia', 'Deobandi', 'Barelvi', 'Ahmadiyya', 'Other'],
  Hinduism: ['Brahmin', 'Kshatriya', 'Vaishya', 'Shudra', 'Maratha', 'Rajput', 'Kayastha', 'Nair', 'Ezhava', 'Yadav', 'Other'],
  Christianity: ['Catholic', 'Protestant', 'Orthodox', 'Pentecostal', 'Syrian Christian', 'Other'],
  Sikhism: ['Jat Sikh', 'Ramgarhia', 'Khatri', 'Arora', 'Ahluwalia', 'Other'],
  Buddhism: ['Theravada', 'Mahayana', 'Vajrayana', 'Other'],
  Jainism: ['Digambara', 'Shvetambara', 'Other'],
  Other: ['General', 'Other'],
};

interface MenuSummary {
  name: string;
  user_id: number;
  membership_status: string;
  plan_type: string | null;
  remaining_contact_views: number;
  remaining_messages: number;
  remaining_call_time: number;
  credits: number;
  plan_validity: string | null;
  is_expired: boolean;
  is_plan_active?: boolean;
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
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  
  // Settings toggle states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [matchAlerts, setMatchAlerts] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  
  // Support data state
  const [supportData, setSupportData] = useState<any>(null);

  // Admin Console States
  const [adminModalVisible, setAdminModalVisible] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'docs' | 'photos' | 'users'>('docs');
  const [adminPendingDocs, setAdminPendingDocs] = useState<any[]>([]);
  const [adminPendingPhotos, setAdminPendingPhotos] = useState<any[]>([]);
  const [adminUsersList, setAdminUsersList] = useState<any[]>([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

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

  // Categorized Edit Profile States
  const [activeEditTab, setActiveEditTab] = useState<'basic' | 'marriage' | 'contact' | 'education' | 'location' | 'questionnaire' | 'religious' | 'physical' | 'family' | 'lifestyle' | 'partner'>('basic');
  const [editTagline, setEditTagline] = useState('');
  const [editProfileDesc, setEditProfileDesc] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editMaritalStatus, setEditMaritalStatus] = useState('Never Married');
  const [editProfileCreatedFor, setEditProfileCreatedFor] = useState('Self');

  // Marriage Goals & Intros
  const [editMarriageGoals, setEditMarriageGoals] = useState('');
  const [editMarriagePlan, setEditMarriagePlan] = useState('');
  const [editVoiceIntroUrl, setEditVoiceIntroUrl] = useState('');
  const [editVideoIntroUrl, setEditVideoIntroUrl] = useState('');
  const [editFutureChildren, setEditFutureChildren] = useState('');

  // Contact Details
  const [editPrimaryNo, setEditPrimaryNo] = useState('');
  const [editSecondaryNo, setEditSecondaryNo] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editWhatsappNo, setEditWhatsappNo] = useState('');
  const [editContactPerson, setEditContactPerson] = useState('');
  const [editFullAddress, setEditFullAddress] = useState('');
  const [editPreferredContact, setEditPreferredContact] = useState('');
  const [editBestTimeToCall, setEditBestTimeToCall] = useState('');

  // Education & Profession
  const [editUniversity, setEditUniversity] = useState('');
  const [editJobTitle, setEditJobTitle] = useState('');
  const [editCompanyName, setEditCompanyName] = useState('');
  const [editJobExp, setEditJobExp] = useState('');

  // Location & Origin
  const [editPresentState, setEditPresentState] = useState('');
  const [editPresentCountry, setEditPresentCountry] = useState('India');
  const [editResLocation, setEditResLocation] = useState('');
  const [editHomeLocation, setEditHomeLocation] = useState('');
  const [editGrewUpIn, setEditGrewUpIn] = useState('');
  const [editRelocate, setEditRelocate] = useState('Yes');

  // Questionnaires
  const PREDEFINED_QUESTIONS = [
    "What are your core goals for marriage?",
    "What are your career expectations after marriage?",
    "How do you balance family and work life?",
    "What are your views on joint family living?",
    "What qualities do you value most in a life partner?"
  ];
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});

  // Physical & Appearance
  const [editSkinColor, setEditSkinColor] = useState('');
  const [editBloodGroup, setEditBloodGroup] = useState('');
  const [editBodyType, setEditBodyType] = useState('');

  // Family & Living
  const [editFamilyType, setEditFamilyType] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editMotherName, setEditMotherName] = useState('');

  // Interests & Lifestyle
  const [editInterests, setEditInterests] = useState('');
  const [editPersonality, setEditPersonality] = useState('');
  const [editEatingHabit, setEditEatingHabit] = useState('');
  const [editSmokingHabit, setEditSmokingHabit] = useState('');
  const [editDrinkingHabit, setEditDrinkingHabit] = useState('');

  // Partner Expectations
  const [editPartnerExpectation, setEditPartnerExpectation] = useState('');

  // Manage Photos & DP Modal States
  const [photosModalVisible, setPhotosModalVisible] = useState(false);
  const [photosList, setPhotosList] = useState<any[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Religion, Caste, Sub-Caste & Partner Preferences Modal States
  const [prefModalVisible, setPrefModalVisible] = useState(false);
  const [editReligion, setEditReligion] = useState('Islam');
  const [editCaste, setEditCaste] = useState('Sunni');
  const [editSubCaste, setEditSubCaste] = useState('');
  const [editPartnerReligion, setEditPartnerReligion] = useState('Islam');
  const [editPartnerCaste, setEditPartnerCaste] = useState('Sunni');
  const [editPartnerSubCaste, setEditPartnerSubCaste] = useState('');
  const [editPartnerAgeMin, setEditPartnerAgeMin] = useState('18');
  const [editPartnerAgeMax, setEditPartnerAgeMax] = useState('40');
  const [isSavingPref, setIsSavingPref] = useState(false);

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
      if (profile && profile.photos) {
        setPhotosList(profile.photos);
      }
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
    if (plan === 'Silver') return 299;
    if (plan === 'Gold') return 1299;
    return 2499;
  };

  const loadAdminData = async () => {
    setIsAdminLoading(true);
    try {
      const verifications = await api.getPendingVerifications();
      setAdminPendingDocs(verifications.documents || []);
      setAdminPendingPhotos(verifications.photos || []);
      const users = await api.getAdminUsers();
      setAdminUsersList(users || []);
    } catch (err: any) {
      Alert.alert('Admin Access', err.message || 'Failed to load admin verification data.');
    } finally {
      setIsAdminLoading(false);
    }
  };

  const openAdminConsole = async () => {
    setAdminModalVisible(true);
    await loadAdminData();
  };

  const handleApproveDoc = async (userId: number) => {
    try {
      await api.verifyUserDoc(userId, 'approve');
      Alert.alert('Approved', 'User document verified successfully!');
      await loadAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not approve document.');
    }
  };

  const handleRejectDoc = async (userId: number) => {
    try {
      await api.verifyUserDoc(userId, 'reject');
      Alert.alert('Rejected', 'User document request rejected.');
      await loadAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not reject document.');
    }
  };

  const handleApprovePhoto = async (photoId: number) => {
    try {
      await api.verifyUserPhoto(photoId, 'approve');
      Alert.alert('Approved', 'Photo approved successfully!');
      await loadAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not approve photo.');
    }
  };

  const handleRejectPhoto = async (photoId: number) => {
    try {
      await api.verifyUserPhoto(photoId, 'reject');
      Alert.alert('Rejected', 'Photo rejected and deleted.');
      await loadAdminData();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not reject photo.');
    }
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
      setEditAge(profile.age ? profile.age.toString() : '25');
      setEditGender(profile.gender || 'Male');
      setEditMaritalStatus(profile.marital_status || 'Never Married');
      setEditProfileCreatedFor(profile.profile_created_for || 'Self');
      setEditTagline(profile.tagline || '');
      setEditProfileDesc(profile.profile_description || '');
      setEditAbout(profile.about || '');

      setEditMarriageGoals(profile.marriage_goals || '');
      setEditMarriagePlan(profile.marriage_plan || '');
      setEditVoiceIntroUrl(profile.voice_intro_url || '');
      setEditVideoIntroUrl(profile.video_intro_url || '');
      setEditFutureChildren(profile.future_children_plans || '');

      setEditPrimaryNo(profile.primary_no || '');
      setEditSecondaryNo(profile.secondary_no || '');
      setEditEmail(profile.email || '');
      setEditWhatsappNo(profile.whatsapp_no || '');
      setEditContactPerson(profile.contact_person || '');
      setEditFullAddress(profile.full_address || '');
      setEditPreferredContact(profile.preferred_contact_method || 'Phone Call');
      setEditBestTimeToCall(profile.best_time_to_call || 'Evening 6-9 PM');

      setEditEducation(profile.education || '');
      setEditUniversity(profile.university_or_college || '');
      setEditProfession(profile.profession || '');
      setEditJobTitle(profile.job_title_or_role || '');
      setEditCompanyName(profile.company_name || '');
      setEditJobExp(profile.job_experience || '');
      setEditIncome(profile.annual_income ? profile.annual_income.toString() : '');

      setEditLocation(profile.present_location || '');
      setEditPresentState(profile.present_state || '');
      setEditPresentCountry(profile.present_country || 'India');
      setEditResLocation(profile.residential_location || '');
      setEditHomeLocation(profile.home_location || '');
      setEditGrewUpIn(profile.grew_up_in || '');
      setEditRelocate(profile.willing_to_relocate || 'Yes');

      setEditReligion(profile.religion || 'Islam');
      setEditCaste(profile.caste || profile.sect || 'Sunni');
      setEditSubCaste(profile.sub_caste || '');

      setEditHeight(profile.height ? profile.height.toString() : '');
      setEditWeight(profile.weight ? profile.weight.toString() : '');
      setEditSkinColor(profile.skin_color || '');
      setEditBloodGroup(profile.blood_group || '');
      setEditBodyType(profile.body_type || '');

      setEditFamilyType(profile.family_type || '');
      setEditFatherName(profile.father_name || '');
      setEditMotherName(profile.mother_name || '');

      setEditInterests(Array.isArray(profile.interests) ? profile.interests.join(', ') : (profile.interests || ''));
      setEditPersonality(profile.personality || '');
      setEditEatingHabit(profile.eating_habit || '');
      setEditSmokingHabit(profile.smoking_habit || '');
      setEditDrinkingHabit(profile.drinking_habit || '');

      setEditPartnerReligion(Array.isArray(profile.partner_religion) ? profile.partner_religion.join(', ') : (profile.partner_religion || 'Islam'));
      setEditPartnerCaste(Array.isArray(profile.partner_caste) ? profile.partner_caste.join(', ') : (profile.partner_caste || 'Sunni'));
      setEditPartnerSubCaste(Array.isArray(profile.partner_sub_caste) ? profile.partner_sub_caste.join(', ') : (profile.partner_sub_caste || ''));
      setEditPartnerAgeMin(profile.partner_age_min ? String(profile.partner_age_min) : '18');
      setEditPartnerAgeMax(profile.partner_age_max ? String(profile.partner_age_max) : '40');
      setEditPartnerExpectation(profile.partner_expectation || '');

      // Load questionnaires map
      const qAnswersMap: Record<string, string> = {};
      if (profile.questionnaires && Array.isArray(profile.questionnaires)) {
        profile.questionnaires.forEach((q: any) => {
          if (q.question && q.answer) {
            qAnswersMap[q.question] = q.answer;
          }
        });
      }
      setQuestionAnswers(qAnswersMap);

      setActiveEditTab('basic');
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
      const qList = Object.keys(questionAnswers).map((q) => ({
        question: q,
        answer: questionAnswers[q],
      })).filter((item) => item.answer && item.answer.trim().length > 0);

      const interestsArr = editInterests.split(',').map((s) => s.trim()).filter(Boolean);
      const partnerReligionArr = editPartnerReligion.split(',').map((s) => s.trim()).filter(Boolean);
      const partnerCasteArr = editPartnerCaste.split(',').map((s) => s.trim()).filter(Boolean);
      const partnerSubCasteArr = editPartnerSubCaste.split(',').map((s) => s.trim()).filter(Boolean);

      const updatedData = {
        name: editName.trim(),
        age: ageNum,
        gender: editGender,
        marital_status: editMaritalStatus,
        profile_created_for: editProfileCreatedFor,
        tagline: editTagline.trim(),
        profile_description: editProfileDesc.trim(),
        about: editAbout.trim(),

        marriage_goals: editMarriageGoals.trim(),
        marriage_plan: editMarriagePlan.trim(),
        voice_intro_url: editVoiceIntroUrl.trim(),
        video_intro_url: editVideoIntroUrl.trim(),
        future_children_plans: editFutureChildren.trim(),

        primary_no: editPrimaryNo.trim(),
        secondary_no: editSecondaryNo.trim(),
        email: editEmail.trim(),
        whatsapp_no: editWhatsappNo.trim(),
        contact_person: editContactPerson.trim(),
        full_address: editFullAddress.trim(),
        preferred_contact_method: editPreferredContact,
        best_time_to_call: editBestTimeToCall.trim(),

        education: editEducation.trim(),
        university_or_college: editUniversity.trim(),
        profession: editProfession.trim(),
        job_title_or_role: editJobTitle.trim(),
        company_name: editCompanyName.trim(),
        job_experience: editJobExp.trim(),
        annual_income: editIncome ? parseFloat(editIncome) : null,

        present_location: editLocation.trim(),
        present_state: editPresentState.trim(),
        present_country: editPresentCountry.trim(),
        residential_location: editResLocation.trim(),
        home_location: editHomeLocation.trim(),
        grew_up_in: editGrewUpIn.trim(),
        willing_to_relocate: editRelocate,

        religion: editReligion,
        sect: editCaste,
        caste: editCaste,
        sub_caste: editSubCaste.trim(),

        height: editHeight ? parseFloat(editHeight) : null,
        weight: editWeight ? parseFloat(editWeight) : null,
        skin_color: editSkinColor.trim(),
        blood_group: editBloodGroup.trim(),
        body_type: editBodyType.trim(),

        family_type: editFamilyType.trim(),
        father_name: editFatherName.trim(),
        mother_name: editMotherName.trim(),

        interests: interestsArr,
        personality: editPersonality.trim(),
        eating_habit: editEatingHabit,
        smoking_habit: editSmokingHabit,
        drinking_habit: editDrinkingHabit,

        partner_religion: partnerReligionArr,
        partner_caste: partnerCasteArr,
        partner_sub_caste: partnerSubCasteArr,
        partner_age_min: parseInt(editPartnerAgeMin) || 18,
        partner_age_max: parseInt(editPartnerAgeMax) || 70,
        partner_expectation: editPartnerExpectation.trim(),

        questionnaires: qList,
      };

      await api.updateMyProfile(updatedData);
      Alert.alert('Success', 'Profile updated successfully across all categories!');
      setEditModalVisible(false);
      loadData(); // Refresh summary values
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not save profile changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- Photo & DP Manager Functions ---
  const openPhotosModal = async () => {
    setIsLoading(true);
    try {
      const photos = await api.getPhotos();
      setPhotosList(photos);
      setPhotosModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not fetch user photos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMainPhoto = async (photoId: number) => {
    try {
      await api.setMainPhoto(photoId);
      Alert.alert('Success', 'Main profile photo (DP) updated successfully!');
      const updatedPhotos = await api.getPhotos();
      setPhotosList(updatedPhotos);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not set main photo.');
    }
  };

  const handleDeletePhoto = async (photoId: number) => {
    try {
      await api.deletePhoto(photoId);
      Alert.alert('Photo Deleted', 'Photo has been removed from your gallery.');
      const updatedPhotos = await api.getPhotos();
      setPhotosList(updatedPhotos);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not delete photo.');
    }
  };

  const handlePickAndUploadPhoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert('Permission Denied', 'Permission to access media library is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingPhoto(true);
        const asset = result.assets[0];
        const isFirst = photosList.length === 0;
        await api.uploadPhoto(asset.uri, isFirst);
        Alert.alert('Success', 'Photo uploaded successfully!');
        const updatedPhotos = await api.getPhotos();
        setPhotosList(updatedPhotos);
        loadData();
      }
    } catch (error: any) {
      Alert.alert('Upload Error', error.message || 'Could not upload photo.');
    } finally {
      setIsUploadingPhoto(false);
    }
  };



  // --- Dynamic Religion, Caste & Partner Preference Functions ---
  const openPrefModal = async () => {
    setIsLoading(true);
    try {
      const profile = await api.getMyProfile();
      setEditReligion(profile.religion || 'Islam');
      setEditCaste(profile.caste || profile.sect || 'Sunni');
      setEditSubCaste(profile.sub_caste || '');

      setEditPartnerReligion(Array.isArray(profile.partner_religion) ? profile.partner_religion.join(', ') : (profile.partner_religion || 'Islam'));
      setEditPartnerCaste(Array.isArray(profile.partner_caste) ? profile.partner_caste.join(', ') : (profile.partner_caste || 'Sunni'));
      setEditPartnerSubCaste(Array.isArray(profile.partner_sub_caste) ? profile.partner_sub_caste.join(', ') : (profile.partner_sub_caste || ''));

      setEditPartnerAgeMin(profile.partner_age_min ? String(profile.partner_age_min) : '18');
      setEditPartnerAgeMax(profile.partner_age_max ? String(profile.partner_age_max) : '40');

      setPrefModalVisible(true);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not load preferences.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPref(true);
    try {
      const partnerReligionArr = editPartnerReligion.split(',').map((s) => s.trim()).filter(Boolean);
      const partnerCasteArr = editPartnerCaste.split(',').map((s) => s.trim()).filter(Boolean);
      const partnerSubCasteArr = editPartnerSubCaste.split(',').map((s) => s.trim()).filter(Boolean);

      const updatePayload = {
        religion: editReligion,
        sect: editCaste,
        caste: editCaste,
        sub_caste: editSubCaste.trim(),
        partner_religion: partnerReligionArr,
        partner_caste: partnerCasteArr,
        partner_sub_caste: partnerSubCasteArr,
        partner_age_min: parseInt(editPartnerAgeMin) || 18,
        partner_age_max: parseInt(editPartnerAgeMax) || 70,
      };

      await api.updateMyProfile(updatePayload);
      Alert.alert('Success', 'Religion, Caste & Partner Preferences saved!');
      setPrefModalVisible(false);
      loadData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not save preferences.');
    } finally {
      setIsSavingPref(false);
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

  // Get user main avatar DP photo from photosList, myProfile, or fallback placeholder
  const avatarUrl = photosList.find((p: any) => p.is_main)?.url ||
                    (photosList.length > 0 ? photosList[0].url : null) ||
                    myProfile?.photos?.find((p: any) => p.is_main)?.url ||
                    (myProfile?.photos && myProfile.photos.length > 0 ? myProfile.photos[0].url : null) ||
                    userData?.photos?.find((p: any) => p.is_main)?.url ||
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const isVerified = userData?.id_verification_status === 'Verified';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <TouchableOpacity style={styles.avatarContainer} onPress={openPhotosModal} activeOpacity={0.8}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            {isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#fff" />
              </View>
            )}
            <View style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: Colors.light.primary,
              width: 32,
              height: 32,
              borderRadius: 16,
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 2,
              borderColor: '#fff',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.2,
              shadowRadius: 3,
              elevation: 4,
            }}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{summary.name}</Text>
          <Text style={styles.profileId}>ID: SM-{summary.user_id}</Text>
        </View>

        {/* Membership Plan Card */}
        <View style={styles.membershipCard}>
          <View style={styles.membershipHeader}>
            <View>
              <Text style={styles.membershipTierLabel}>CURRENT TIER</Text>
              <Text style={styles.membershipTierName}>
                {userData?.is_admin 
                  ? 'Administrator' 
                  : (summary.is_expired 
                    ? `${summary.plan_type || 'Plan'} (Expired)` 
                    : (summary.plan_type ? `${summary.plan_type} Member` : 'Free Account'))}
              </Text>
            </View>
            <Ionicons 
              name={userData?.is_admin ? "shield-checkmark" : (summary.is_expired ? "alert-circle" : "ribbon-sharp")} 
              size={32} 
              color={userData?.is_admin ? Colors.light.primary : (summary.is_expired ? '#e53e3e' : Colors.light.secondaryContainer)} 
            />
          </View>

          <View style={styles.quotaGrid}>
            <View style={styles.quotaBox}>
              <Text style={styles.quotaLabel}>CREDITS</Text>
              <Text style={styles.quotaValue}>
                {userData?.is_admin || summary.credits >= 9999 ? '∞' : (summary.credits ?? 0)}
              </Text>
            </View>
            <View style={styles.quotaBox}>
              <Text style={styles.quotaLabel}>MESSAGES</Text>
              <Text style={styles.quotaValue}>
                {userData?.is_admin || summary.remaining_messages >= 9999 ? '∞' : summary.remaining_messages}
              </Text>
            </View>
            <View style={styles.quotaBox}>
              <Text style={styles.quotaLabel}>CONTACT VIEWS</Text>
              <Text style={styles.quotaValue}>
                {userData?.is_admin || summary.remaining_contact_views >= 9999 ? '∞' : summary.remaining_contact_views}
              </Text>
            </View>
          </View>

          {summary.is_expired && (
            <View style={{ backgroundColor: '#fff5f5', borderWidth: 1, borderColor: '#feb2b2', padding: 8, borderRadius: 8, marginTop: 10, marginHorizontal: 16 }}>
              <Text style={{ color: '#c53030', fontSize: 12, textAlign: 'center', fontWeight: '600' }}>
                🔒 Your plan has expired. Your remaining credits and quotas are safely preserved. Recharge now to extend validity and unlock them!
              </Text>
            </View>
          )}

          <View style={styles.membershipFooter}>
            <Text style={styles.validityText}>
              {userData?.is_admin 
                ? '★ Unlimited Admin Access'
                : (summary.plan_validity 
                  ? (summary.is_expired 
                    ? `Expired on: ${new Date(summary.plan_validity).toLocaleDateString()}` 
                    : `Valid until: ${new Date(summary.plan_validity).toLocaleDateString()}`)
                  : 'Upgrade to unlock contact views & messaging')}
            </Text>
            {!userData?.is_admin && (
              <TouchableOpacity 
                style={[styles.upgradeBtn, summary.is_expired && { backgroundColor: '#e53e3e' }]}
                onPress={() => setSubModalVisible(true)}
              >
                <Text style={styles.upgradeBtnText}>
                  {summary.is_expired ? 'Recharge' : (summary.plan_type ? 'Extend' : 'Upgrade')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Navigation Options List */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={openPhotosModal}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="images-outline" size={22} color={Colors.light.primary} />
              <View>
                <Text style={styles.menuItemText}>Manage Photos & Profile Picture</Text>
                <Text style={styles.menuItemSubtext}>Upload photos, set main picture & manage gallery</Text>
              </View>
            </View>

          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={openPrefModal}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="heart-outline" size={22} color={Colors.light.primary} />
              <View>
                <Text style={styles.menuItemText}>Religion, Caste & Partner Prefs</Text>
                <Text style={styles.menuItemSubtext}>Set dynamic religion, caste, sub-caste & expectations</Text>
              </View>
            </View>

          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={openEditProfile}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="create-outline" size={22} color={Colors.light.primary} />
              <View>
                <Text style={styles.menuItemText}>Edit Profile Details</Text>
                <Text style={styles.menuItemSubtext}>Personal info, education, family & lifestyle</Text>
              </View>
            </View>

          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem} 
            onPress={() => {
              if (myProfile?.id) {
                router.push(`/profile/${myProfile.id}`);
              } else {
                Alert.alert('Profile Preview', 'Your profile details are loading. Please try again in a moment.');
              }
            }}
          >
            <View style={styles.menuItemLeft}>
              <Ionicons name="eye-outline" size={22} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Preview My Profile</Text>
            </View>

          </TouchableOpacity>

          {!userData?.is_admin && (
            <TouchableOpacity style={styles.menuItem} onPress={() => setSubModalVisible(true)}>
              <View style={styles.menuItemLeft}>
                <Ionicons name="card-outline" size={22} color={Colors.light.primary} />
                <Text style={styles.menuItemText}>Subscriptions & Billing</Text>
              </View>

            </TouchableOpacity>
          )}

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

          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setSettingsModalVisible(true)}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="settings-outline" size={22} color={Colors.light.primary} />
              <View>
                <Text style={styles.menuItemText}>Settings & Privacy</Text>
                <Text style={styles.menuItemSubtext}>Notifications, privacy preferences & session controls</Text>
              </View>
            </View>

          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={openSupport}>
            <View style={styles.menuItemLeft}>
              <Ionicons name="help-circle-outline" size={22} color={Colors.light.primary} />
              <Text style={styles.menuItemText}>Help & Support</Text>
            </View>

          </TouchableOpacity>

          {/* Admin Console Option (Visible Only For Admin Users) */}
          {userData?.is_admin && (
            <TouchableOpacity 
              style={[styles.menuItem, { backgroundColor: '#fffbe6', borderColor: '#ffe58f', borderWidth: 1 }]} 
              onPress={openAdminConsole}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="shield-checkmark" size={22} color="#d48806" />
                <View>
                  <Text style={[styles.menuItemText, { color: '#873800', fontWeight: 'bold' }]}>
                    Admin Console
                  </Text>
                  <Text style={styles.menuItemSubtext}>Validate user documents & uploaded photos</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#d48806" />
            </TouchableOpacity>
          )}
        </View>

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
                  <Text style={styles.planPrice}>₹299 / mo</Text>
                </View>
                <Text style={styles.planDesc}>• 20 Contact Views • 200 Messages • 100 Credits • Validity: 30 days (1 Month)</Text>
                <Text style={[styles.planDesc, { color: Colors.light.primary, fontWeight: '600', marginTop: 4 }]}>✓ Unused credits rollover and extend upon recharge</Text>
              </TouchableOpacity>
 
              {/* Plan 2: Gold */}
              <TouchableOpacity style={[styles.planCard, styles.goldPlanCard]} onPress={() => handleSelectPlan('Gold')}>
                <View style={styles.planHeader}>
                  <Text style={[styles.planTitle, { color: '#735c00' }]}>Gold Plan</Text>
                  <Text style={[styles.planPrice, { color: '#735c00' }]}>₹1,299 / 3 mos</Text>
                </View>
                <Text style={styles.planDesc}>• 100 Contact Views • 1000 Messages • 500 Credits • Validity: 90 days (3 Months)</Text>
                <Text style={[styles.planDesc, { color: '#735c00', fontWeight: '600', marginTop: 4 }]}>✓ Unused credits rollover and extend upon recharge</Text>
              </TouchableOpacity>
 
              {/* Plan 3: Platinum */}
              <TouchableOpacity style={[styles.planCard, styles.platPlanCard]} onPress={() => handleSelectPlan('Platinum')}>
                <View style={styles.planHeader}>
                  <Text style={[styles.planTitle, { color: '#fff' }]}>Platinum Plan</Text>
                  <Text style={[styles.planPrice, { color: '#fff' }]}>₹2,499 / 6 mos</Text>
                </View>
                <Text style={[styles.planDesc, { color: '#eee' }]}>• Unlimited Views & Credits • Unlimited Messages • Validity: 180 days (6 Months)</Text>
                <Text style={[styles.planDesc, { color: '#fff', fontWeight: '600', marginTop: 4 }]}>✓ Unused credits rollover and extend upon recharge</Text>
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
              
              {userData?.id_verification_status === "Pending" && (
                <View style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f', borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 12 }}>
                  <Text style={{ color: '#d48806', fontSize: 13, fontWeight: 'bold', textAlign: 'center' }}>
                    ⏳ Your uploaded document will be verified shortly by our admin team.
                  </Text>
                </View>
              )}
              
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
                  <Text style={styles.supportHeadline}>Need Immediate assistance?</Text>
                  <Text style={styles.supportDetail}>📧 Email: {supportData.support_email || supportData.email || 'support@helpmeet.com'}</Text>
                  <Text style={styles.supportDetail}>📞 Hotline: {supportData.hotline || supportData.phone || '+91 98765 43210'}</Text>
                  <Text style={styles.supportDetail}>⏰ Hours: {supportData.operating_hours || supportData.timings || '10 AM to 6 PM (IST)'}</Text>
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
                  {selectedPlan === 'Silver' && '₹299'}
                  {selectedPlan === 'Gold' && '₹1,299'}
                  {selectedPlan === 'Platinum' && '₹2,499'}
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

      {/* Modal 5: Edit Profile (Multi-Category Categorized Form) */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { height: '88%' }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Profile (All Categories)</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} disabled={isSavingProfile}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Category Navigation Bar */}
            <View style={{ height: 44, marginBottom: 8 }}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, alignItems: 'center' }}>
                {[
                  { id: 'basic', label: '1. Basic & Tagline' },
                  { id: 'marriage', label: '2. Marriage & Intros' },
                  { id: 'contact', label: '3. Contact Details' },
                  { id: 'education', label: '4. Edu & Profession' },
                  { id: 'location', label: '5. Location & Origin' },
                  { id: 'questionnaire', label: '6. Questionnaire' },
                  { id: 'religious', label: '7. Socio-Religious' },
                  { id: 'physical', label: '8. Physical & Appearance' },
                  { id: 'family', label: '9. Family & Living' },
                  { id: 'lifestyle', label: '10. Lifestyle & Habits' },
                  { id: 'partner', label: '11. Partner Prefs' },
                ].map((tab) => (
                  <TouchableOpacity
                    key={tab.id}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: activeEditTab === tab.id ? Colors.light.primary : '#f3f4f6',
                      marginRight: 6,
                    }}
                    onPress={() => setActiveEditTab(tab.id as any)}
                  >
                    <Text style={{ fontSize: 11, color: activeEditTab === tab.id ? '#fff' : Colors.light.text, fontWeight: activeEditTab === tab.id ? 'bold' : '500' }}>
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {/* TAB 1: BASIC & TAGLINE */}
              {activeEditTab === 'basic' && (
                <View>
                  <Text style={styles.faqHeader}>TAGLINE & ABOUT ME</Text>
                  <Text style={styles.inputLabel}>PROFILE TAGLINE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editTagline}
                    onChangeText={setEditTagline}
                    placeholder="e.g. Seeking a pious, family-oriented life partner"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>SHORT PROFILE DESCRIPTION</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editProfileDesc}
                    onChangeText={setEditProfileDesc}
                    placeholder="Brief intro for search card"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>ABOUT ME (DETAILED)</Text>
                  <TextInput
                    style={[styles.paymentInput, { height: 80, textAlignVertical: 'top', paddingTop: 10 }]}
                    value={editAbout}
                    onChangeText={setEditAbout}
                    placeholder="Tell potential matches about your values, goals, lifestyle..."
                    placeholderTextColor={Colors.light.textSecondary}
                    multiline
                  />

                  <Text style={[styles.faqHeader, { marginTop: 16 }]}>BASIC DETAILS</Text>
                  <Text style={styles.inputLabel}>FULL NAME</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editName}
                    onChangeText={setEditName}
                    placeholder="Ahmed Khan"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.inputLabel}>AGE</Text>
                      <TextInput
                        style={styles.paymentInput}
                        value={editAge}
                        onChangeText={setEditAge}
                        keyboardType="numeric"
                        maxLength={3}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>GENDER</Text>
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                        {['Male', 'Female'].map((g) => (
                          <TouchableOpacity
                            key={g}
                            style={{ flex: 1, paddingVertical: 8, borderRadius: 8, backgroundColor: editGender === g ? Colors.light.primary : '#f3f4f6', alignItems: 'center' }}
                            onPress={() => setEditGender(g)}
                          >
                            <Text style={{ color: editGender === g ? '#fff' : Colors.light.text, fontSize: 12, fontWeight: 'bold' }}>{g}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>MARITAL STATUS</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {['Never Married', 'Divorced', 'Widowed', 'Awaiting Divorce'].map((ms) => (
                      <TouchableOpacity
                        key={ms}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: editMaritalStatus === ms ? Colors.light.secondaryContainer : '#f3f4f6' }}
                        onPress={() => setEditMaritalStatus(ms)}
                      >
                        <Text style={{ color: editMaritalStatus === ms ? Colors.light.onSecondaryContainer : Colors.light.text, fontSize: 12, fontWeight: 'bold' }}>{ms}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>PROFILE CREATED FOR</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editProfileCreatedFor}
                    onChangeText={setEditProfileCreatedFor}
                    placeholder="Self, Son, Daughter, Brother, Sister, Friend"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              )}

              {/* TAB 2: MARRIAGE GOALS & INTROS */}
              {activeEditTab === 'marriage' && (
                <View>
                  <Text style={styles.faqHeader}>MARRIAGE GOALS & INTROS</Text>
                  <Text style={styles.inputLabel}>MARRIAGE GOALS & VISION</Text>
                  <TextInput
                    style={[styles.paymentInput, { height: 70, textAlignVertical: 'top', paddingTop: 8 }]}
                    value={editMarriageGoals}
                    onChangeText={setEditMarriageGoals}
                    placeholder="What are your goals and expectations for marriage?"
                    placeholderTextColor={Colors.light.textSecondary}
                    multiline
                  />

                  <Text style={styles.inputLabel}>MARRIAGE TIMELINE & PLAN</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editMarriagePlan}
                    onChangeText={setEditMarriagePlan}
                    placeholder="e.g. Planning to marry within 6-12 months"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>FUTURE CHILDREN PLANS</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editFutureChildren}
                    onChangeText={setEditFutureChildren}
                    placeholder="e.g. Want children, Open to discuss"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>VOICE INTRO AUDIO URL</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editVoiceIntroUrl}
                    onChangeText={setEditVoiceIntroUrl}
                    placeholder="https://example.com/voice-intro.mp3"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>VIDEO INTRO URL</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editVideoIntroUrl}
                    onChangeText={setEditVideoIntroUrl}
                    placeholder="https://example.com/video-intro.mp4"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              )}

              {/* TAB 3: CONTACT DETAILS */}
              {activeEditTab === 'contact' && (
                <View>
                  <Text style={styles.faqHeader}>CONTACT DETAILS</Text>
                  <Text style={styles.inputLabel}>PRIMARY CONTACT NUMBER</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPrimaryNo}
                    onChangeText={setEditPrimaryNo}
                    placeholder="+91 9876543210"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>SECONDARY / GUARDIAN NUMBER</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editSecondaryNo}
                    onChangeText={setEditSecondaryNo}
                    placeholder="+91 9123456789"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>WHATSAPP NUMBER</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editWhatsappNo}
                    onChangeText={setEditWhatsappNo}
                    placeholder="+91 9876543210"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editEmail}
                    onChangeText={setEditEmail}
                    placeholder="user@example.com"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="email-address"
                  />

                  <Text style={styles.inputLabel}>CONTACT PERSON (e.g. Father, Self)</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editContactPerson}
                    onChangeText={setEditContactPerson}
                    placeholder="Father - Abdul Khan"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>PREFERRED CONTACT METHOD</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPreferredContact}
                    onChangeText={setEditPreferredContact}
                    placeholder="Phone Call, WhatsApp, Email"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>BEST TIME TO CALL</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editBestTimeToCall}
                    onChangeText={setEditBestTimeToCall}
                    placeholder="Evening 6 PM - 9 PM"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>FULL RESIDENTIAL ADDRESS</Text>
                  <TextInput
                    style={[styles.paymentInput, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]}
                    value={editFullAddress}
                    onChangeText={setEditFullAddress}
                    placeholder="House No, Street, Landmark, District, Pincode"
                    placeholderTextColor={Colors.light.textSecondary}
                    multiline
                  />
                </View>
              )}

              {/* TAB 4: EDUCATION & PROFESSION */}
              {activeEditTab === 'education' && (
                <View>
                  <Text style={styles.faqHeader}>EDUCATION & PROFESSION</Text>
                  <Text style={styles.inputLabel}>HIGHEST EDUCATION</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editEducation}
                    onChangeText={setEditEducation}
                    placeholder="B.Tech Computer Science / Master of Science"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>UNIVERSITY / COLLEGE NAME</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editUniversity}
                    onChangeText={setEditUniversity}
                    placeholder="University of Mumbai / IIT Bombay"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>PROFESSION / FIELD</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editProfession}
                    onChangeText={setEditProfession}
                    placeholder="Software Engineer / Doctor / Business"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>JOB TITLE OR ROLE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editJobTitle}
                    onChangeText={setEditJobTitle}
                    placeholder="Senior Developer / Consultant"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>COMPANY / EMPLOYER NAME</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editCompanyName}
                    onChangeText={setEditCompanyName}
                    placeholder="Tech Corp Pvt Ltd"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>JOB EXPERIENCE (YEARS)</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editJobExp}
                    onChangeText={setEditJobExp}
                    placeholder="5 Years"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>ANNUAL INCOME (INR)</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editIncome}
                    onChangeText={setEditIncome}
                    placeholder="1200000"
                    placeholderTextColor={Colors.light.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              )}

              {/* TAB 5: LOCATION & ORIGIN */}
              {activeEditTab === 'location' && (
                <View>
                  <Text style={styles.faqHeader}>LOCATION & ORIGIN</Text>
                  <Text style={styles.inputLabel}>PRESENT LOCATION (CITY / DISTRICT)</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editLocation}
                    onChangeText={setEditLocation}
                    placeholder="Mumbai / Kochi / Dubai"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>PRESENT STATE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPresentState}
                    onChangeText={setEditPresentState}
                    placeholder="Maharashtra / Kerala"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>PRESENT COUNTRY</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPresentCountry}
                    onChangeText={setEditPresentCountry}
                    placeholder="India / UAE"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>NATIVE HOME LOCATION</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editHomeLocation}
                    onChangeText={setEditHomeLocation}
                    placeholder="Kozhikode, Kerala"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>GREW UP IN</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editGrewUpIn}
                    onChangeText={setEditGrewUpIn}
                    placeholder="Mumbai, Maharashtra"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>WILLING TO RELOCATE AFTER MARRIAGE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editRelocate}
                    onChangeText={setEditRelocate}
                    placeholder="Yes / No / Open to Discuss"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              )}

              {/* TAB 6: QUESTIONNAIRE */}
              {activeEditTab === 'questionnaire' && (
                <View>
                  <Text style={styles.faqHeader}>MATRIMONIAL QUESTIONNAIRE</Text>
                  <Text style={styles.alertText}>Answer key predefined matrimonial questions to give matches insight into your mindset.</Text>

                  {PREDEFINED_QUESTIONS.map((q, idx) => (
                    <View key={idx} style={{ marginBottom: 16 }}>
                      <Text style={[styles.inputLabel, { color: Colors.light.primary }]}>{idx + 1}. {q}</Text>
                      <TextInput
                        style={[styles.paymentInput, { height: 60, textAlignVertical: 'top', paddingTop: 8 }]}
                        value={questionAnswers[q] || ''}
                        onChangeText={(ans) => setQuestionAnswers((prev) => ({ ...prev, [q]: ans }))}
                        placeholder="Your thoughts/answer..."
                        placeholderTextColor={Colors.light.textSecondary}
                        multiline
                      />
                    </View>
                  ))}
                </View>
              )}

              {/* TAB 7: SOCIO-RELIGIOUS */}
              {activeEditTab === 'religious' && (
                <View>
                  <Text style={styles.faqHeader}>SOCIO-RELIGIOUS DETAILS</Text>
                  <Text style={styles.inputLabel}>RELIGION</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {Object.keys(RELIGION_CASTE_MAP).map((rel) => (
                      <TouchableOpacity
                        key={rel}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: editReligion === rel ? Colors.light.primary : '#f3f4f6' }}
                        onPress={() => {
                          setEditReligion(rel);
                          const defaultCastes = RELIGION_CASTE_MAP[rel] || ['Other'];
                          setEditCaste(defaultCastes[0]);
                        }}
                      >
                        <Text style={{ color: editReligion === rel ? '#fff' : Colors.light.text, fontSize: 12, fontWeight: 'bold' }}>{rel}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>CASTE / SECT (FOR {editReligion.toUpperCase()})</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                    {(RELIGION_CASTE_MAP[editReligion] || ['Other']).map((casteOpt) => (
                      <TouchableOpacity
                        key={casteOpt}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: editCaste === casteOpt ? Colors.light.secondaryContainer : '#f3f4f6' }}
                        onPress={() => setEditCaste(casteOpt)}
                      >
                        <Text style={{ color: editCaste === casteOpt ? Colors.light.onSecondaryContainer : Colors.light.text, fontSize: 12, fontWeight: 'bold' }}>{casteOpt}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.inputLabel}>SUB-CASTE / DENOMINATION</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editSubCaste}
                    onChangeText={setEditSubCaste}
                    placeholder="e.g. Mudaliar, Pillai, Iyer, Shafi'i, Kanthapuram"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              )}

              {/* TAB 8: PHYSICAL & APPEARANCE */}
              {activeEditTab === 'physical' && (
                <View>
                  <Text style={styles.faqHeader}>PHYSICAL & APPEARANCE</Text>
                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
                      <TextInput
                        style={styles.paymentInput}
                        value={editHeight}
                        onChangeText={setEditHeight}
                        placeholder="178"
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                      <TextInput
                        style={styles.paymentInput}
                        value={editWeight}
                        onChangeText={setEditWeight}
                        placeholder="74"
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>SKIN COLOR / COMPLEXION</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editSkinColor}
                    onChangeText={setEditSkinColor}
                    placeholder="Fair / Wheatish / Dark"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>BLOOD GROUP</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editBloodGroup}
                    onChangeText={setEditBloodGroup}
                    placeholder="O+ / A+ / B+"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>BODY TYPE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editBodyType}
                    onChangeText={setEditBodyType}
                    placeholder="Athletic / Average / Slim"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              )}

              {/* TAB 9: FAMILY & LIVING */}
              {activeEditTab === 'family' && (
                <View>
                  <Text style={styles.faqHeader}>FAMILY & LIVING DETAILS</Text>
                  <Text style={styles.inputLabel}>FAMILY TYPE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editFamilyType}
                    onChangeText={setEditFamilyType}
                    placeholder="Nuclear / Joint Family"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>FATHER'S NAME & OCCUPATION</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editFatherName}
                    onChangeText={setEditFatherName}
                    placeholder="Abdul Khan - Businessman"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>MOTHER'S NAME & OCCUPATION</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editMotherName}
                    onChangeText={setEditMotherName}
                    placeholder="Fatima Khan - Homemaker"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              )}

              {/* TAB 10: LIFESTYLE & HOBBIES */}
              {activeEditTab === 'lifestyle' && (
                <View>
                  <Text style={styles.faqHeader}>LIFESTYLE & HOBBIES</Text>
                  <Text style={styles.inputLabel}>INTERESTS & HOBBIES (COMMA SEPARATED)</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editInterests}
                    onChangeText={setEditInterests}
                    placeholder="Reading, Travelling, Football, Cooking"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>PERSONALITY TYPE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPersonality}
                    onChangeText={setEditPersonality}
                    placeholder="Ambivert / Introvert / Extrovert"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>EATING HABIT</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editEatingHabit}
                    onChangeText={setEditEatingHabit}
                    placeholder="Halal / Non-Veg / Vegetarian"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>SMOKING HABIT</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editSmokingHabit}
                    onChangeText={setEditSmokingHabit}
                    placeholder="Non-Smoker / Occasionally"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>DRINKING HABIT</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editDrinkingHabit}
                    onChangeText={setEditDrinkingHabit}
                    placeholder="Never / Teetotaler"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              )}

              {/* TAB 11: PARTNER PREFERENCES */}
              {activeEditTab === 'partner' && (
                <View>
                  <Text style={styles.faqHeader}>PARTNER PREFERENCES & EXPECTATIONS</Text>
                  <Text style={styles.inputLabel}>PREFERRED PARTNER RELIGION</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPartnerReligion}
                    onChangeText={setEditPartnerReligion}
                    placeholder="e.g. Islam, Hinduism, Any"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>PREFERRED PARTNER CASTE / SECT</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPartnerCaste}
                    onChangeText={setEditPartnerCaste}
                    placeholder="e.g. Sunni, Brahmin, Open to All"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <Text style={styles.inputLabel}>PREFERRED PARTNER SUB-CASTE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPartnerSubCaste}
                    onChangeText={setEditPartnerSubCaste}
                    placeholder="e.g. Any"
                    placeholderTextColor={Colors.light.textSecondary}
                  />

                  <View style={styles.rowInputs}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.inputLabel}>MIN AGE</Text>
                      <TextInput
                        style={styles.paymentInput}
                        value={editPartnerAgeMin}
                        onChangeText={setEditPartnerAgeMin}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inputLabel}>MAX AGE</Text>
                      <TextInput
                        style={styles.paymentInput}
                        value={editPartnerAgeMax}
                        onChangeText={setEditPartnerAgeMax}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <Text style={styles.inputLabel}>PARTNER EXPECTATIONS (NOTE)</Text>
                  <TextInput
                    style={[styles.paymentInput, { height: 80, textAlignVertical: 'top', paddingTop: 8 }]}
                    value={editPartnerExpectation}
                    onChangeText={setEditPartnerExpectation}
                    placeholder="Write a note about what you are looking for in your ideal spouse..."
                    placeholderTextColor={Colors.light.textSecondary}
                    multiline
                  />
                </View>
              )}

              <TouchableOpacity
                style={[styles.payNowBtn, { backgroundColor: isSavingProfile ? '#9ca3af' : Colors.light.primary, marginVertical: 30 }]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <View style={styles.payBtnLoadingRow}>
                    <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.payNowBtnText}>Saving All Profile Categories...</Text>
                  </View>
                ) : (
                  <Text style={styles.payNowBtnText}>Save Profile Updates</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 6: Manage Photos & Set DP */}
      <Modal visible={photosModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Manage Photos & DP</Text>
              <TouchableOpacity onPress={() => setPhotosModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.alertText}>
                Upload photos to your profile gallery. Select any photo to set as your **Main Profile DP**.
              </Text>

              {/* Upload Controls */}
              <View style={{ marginVertical: 15 }}>
                <TouchableOpacity
                  style={[styles.verifyInput, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9f9f9', borderStyle: 'dashed', height: 80 }]}
                  onPress={handlePickAndUploadPhoto}
                  disabled={isUploadingPhoto}
                >
                  <Ionicons name="camera-outline" size={28} color={Colors.light.primary} />
                  <Text style={{ fontSize: 14, color: Colors.light.primary, fontWeight: 'bold', marginTop: 6 }}>
                    {isUploadingPhoto ? 'Uploading...' : 'Pick Image from Device'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Photo List Grid */}
              <Text style={styles.faqHeader}>YOUR UPLOADS ({photosList.length})</Text>
              {photosList.length === 0 ? (
                <View style={{ padding: 30, alignItems: 'center' }}>
                  <Ionicons name="images-outline" size={40} color={Colors.light.textSecondary} />
                  <Text style={{ color: Colors.light.textSecondary, marginTop: 8 }}>No photos uploaded yet.</Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
                  {photosList.map((photo: any) => (
                    <View key={photo.id} style={{ width: '47%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: photo.is_main ? 2 : 1, borderColor: photo.is_main ? Colors.light.primary : '#eee', elevation: 2 }}>
                      <Image source={{ uri: photo.url }} style={{ width: '100%', height: 160, resizeMode: 'cover' }} />
                      {photo.is_main && (
                        <View style={{ position: 'absolute', top: 8, left: 8, backgroundColor: Colors.light.primary, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>★ MAIN DP</Text>
                        </View>
                      )}
                      {!photo.is_approved && (
                        <View style={{ backgroundColor: '#fffbe6', paddingVertical: 4, paddingHorizontal: 6, alignItems: 'center', borderTopWidth: 1, borderColor: '#ffe58f' }}>
                          <Text style={{ color: '#d48806', fontSize: 10, fontWeight: 'bold', textAlign: 'center' }}>
                            ⏳ Your uploaded photo will be verified shortly
                          </Text>
                        </View>
                      )}
                      <View style={{ padding: 8, gap: 6, backgroundColor: '#fdfbf7' }}>
                        {!photo.is_main && (
                          <TouchableOpacity
                            style={{ backgroundColor: Colors.light.primary, paddingVertical: 6, borderRadius: 6, alignItems: 'center' }}
                            onPress={() => handleSetMainPhoto(photo.id)}
                          >
                            <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Set as Main DP</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={{ backgroundColor: '#ffdada', paddingVertical: 6, borderRadius: 6, alignItems: 'center' }}
                          onPress={() => handleDeletePhoto(photo.id)}
                        >
                          <Text style={{ color: Colors.light.error, fontSize: 11, fontWeight: 'bold' }}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 7: Religion, Caste & Partner Preferences */}
      <Modal visible={prefModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Religion, Caste & Preferences</Text>
              <TouchableOpacity onPress={() => setPrefModalVisible(false)} disabled={isSavingPref}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.faqHeader, { marginTop: 0 }]}>MY RELIGION & CASTE DETAILS</Text>

              {/* Religion Selector */}
              <Text style={styles.inputLabel}>RELIGION</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {Object.keys(RELIGION_CASTE_MAP).map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 20,
                      backgroundColor: editReligion === rel ? Colors.light.primary : '#f3f4f6',
                    }}
                    onPress={() => {
                      setEditReligion(rel);
                      const defaultCastes = RELIGION_CASTE_MAP[rel] || ['Other'];
                      setEditCaste(defaultCastes[0]);
                    }}
                  >
                    <Text style={{ color: editReligion === rel ? '#fff' : Colors.light.text, fontSize: 13, fontWeight: editReligion === rel ? 'bold' : 'normal' }}>
                      {rel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Caste / Sect Selector (Dynamically changes based on Religion) */}
              <Text style={styles.inputLabel}>CASTE / SECT (DYNAMIC FOR {editReligion.toUpperCase()})</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {(RELIGION_CASTE_MAP[editReligion] || ['Other']).map((casteOpt) => (
                  <TouchableOpacity
                    key={casteOpt}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: editCaste === casteOpt ? Colors.light.secondaryContainer : '#f3f4f6',
                    }}
                    onPress={() => setEditCaste(casteOpt)}
                  >
                    <Text style={{ color: editCaste === casteOpt ? Colors.light.onSecondaryContainer : Colors.light.text, fontSize: 12, fontWeight: editCaste === casteOpt ? 'bold' : 'normal' }}>
                      {casteOpt}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Sub-Caste Input */}
              <Text style={styles.inputLabel}>SUB-CASTE / DENOMINATION</Text>
              <TextInput
                style={styles.paymentInput}
                value={editSubCaste}
                onChangeText={setEditSubCaste}
                placeholder="e.g. Mudaliar, Pillai, Iyer, Shafi'i, Kanthapuram, etc."
                placeholderTextColor={Colors.light.textSecondary}
              />

              <Text style={[styles.faqHeader, { marginTop: 20 }]}>PARTNER PREFERENCES</Text>

              {/* Partner Religion Preference */}
              <Text style={styles.inputLabel}>PREFERRED PARTNER RELIGION</Text>
              <TextInput
                style={styles.paymentInput}
                value={editPartnerReligion}
                onChangeText={setEditPartnerReligion}
                placeholder="e.g. Islam, Hinduism, Any"
                placeholderTextColor={Colors.light.textSecondary}
              />

              {/* Partner Caste Preference */}
              <Text style={styles.inputLabel}>PREFERRED PARTNER CASTE / SECT</Text>
              <TextInput
                style={styles.paymentInput}
                value={editPartnerCaste}
                onChangeText={setEditPartnerCaste}
                placeholder="e.g. Sunni, Brahmin, Open to All"
                placeholderTextColor={Colors.light.textSecondary}
              />

              {/* Partner Sub-Caste Preference */}
              <Text style={styles.inputLabel}>PREFERRED PARTNER SUB-CASTE</Text>
              <TextInput
                style={styles.paymentInput}
                value={editPartnerSubCaste}
                onChangeText={setEditPartnerSubCaste}
                placeholder="e.g. Any, Specific Sub-caste"
                placeholderTextColor={Colors.light.textSecondary}
              />

              {/* Partner Age Range */}
              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.inputLabel}>MIN AGE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPartnerAgeMin}
                    onChangeText={setEditPartnerAgeMin}
                    keyboardType="numeric"
                    placeholder="18"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>MAX AGE</Text>
                  <TextInput
                    style={styles.paymentInput}
                    value={editPartnerAgeMax}
                    onChangeText={setEditPartnerAgeMax}
                    keyboardType="numeric"
                    placeholder="40"
                    placeholderTextColor={Colors.light.textSecondary}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.payNowBtn, { backgroundColor: isSavingPref ? '#9ca3af' : Colors.light.primary, marginBottom: 40 }]}
                onPress={handleSavePreferences}
                disabled={isSavingPref}
              >
                {isSavingPref ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.payNowBtnText}>Save Preferences</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal 8: Admin Console */}
      <Modal visible={adminModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.bottomSheet, { height: '88%' }]}>
            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="shield-checkmark" size={24} color="#b45309" />
                <Text style={styles.sheetTitle}>Admin Validation Console</Text>
              </View>
              <TouchableOpacity onPress={() => setAdminModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            {/* Admin Tabs */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: adminActiveTab === 'docs' ? Colors.light.primary : '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={() => setAdminActiveTab('docs')}
              >
                <Text style={{ color: adminActiveTab === 'docs' ? '#fff' : Colors.light.text, fontWeight: 'bold', fontSize: 12 }}>
                  Pending ID Docs ({adminPendingDocs.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: adminActiveTab === 'photos' ? Colors.light.primary : '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={() => setAdminActiveTab('photos')}
              >
                <Text style={{ color: adminActiveTab === 'photos' ? '#fff' : Colors.light.text, fontWeight: 'bold', fontSize: 12 }}>
                  Pending Photos ({adminPendingPhotos.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: adminActiveTab === 'users' ? Colors.light.primary : '#f3f4f6',
                  alignItems: 'center',
                }}
                onPress={() => setAdminActiveTab('users')}
              >
                <Text style={{ color: adminActiveTab === 'users' ? '#fff' : Colors.light.text, fontWeight: 'bold', fontSize: 12 }}>
                  All Users ({adminUsersList.length})
                </Text>
              </TouchableOpacity>
            </View>

            {isAdminLoading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={{ marginTop: 10, color: Colors.light.textSecondary }}>Loading admin validation items...</Text>
              </View>
            ) : (
              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                {/* TAB 1: PENDING ID DOCUMENTS */}
                {adminActiveTab === 'docs' && (
                  <View>
                    <Text style={styles.faqHeader}>PENDING USER ID DOCUMENTS ({adminPendingDocs.length})</Text>
                    {adminPendingDocs.length === 0 ? (
                      <View style={{ padding: 30, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, marginVertical: 10 }}>
                        <Ionicons name="checkmark-done-circle-outline" size={44} color="#10b981" />
                        <Text style={{ color: '#059669', fontWeight: 'bold', marginTop: 8 }}>All Documents Verified!</Text>
                        <Text style={{ color: Colors.light.textSecondary, fontSize: 12, marginTop: 4 }}>No user ID documents currently pending approval.</Text>
                      </View>
                    ) : (
                      adminPendingDocs.map((doc: any) => (
                        <View key={doc.user_id} style={{ backgroundColor: '#fff', padding: 14, borderRadius: 12, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb', elevation: 2 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <View>
                              <Text style={{ fontSize: 15, fontWeight: 'bold', color: Colors.light.text }}>{doc.user_name}</Text>
                              <Text style={{ fontSize: 12, color: Colors.light.textSecondary }}>{doc.user_email} (ID: #{doc.user_id})</Text>
                            </View>
                            <View style={{ backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                              <Text style={{ color: '#b45309', fontSize: 11, fontWeight: 'bold' }}>⏳ Pending</Text>
                            </View>
                          </View>

                          {doc.document_url ? (
                            <Image 
                              source={{ uri: doc.document_url.startsWith('http') ? doc.document_url : `${API_URL}${doc.document_url}` }} 
                              style={{ width: '100%', height: 160, borderRadius: 8, marginVertical: 8, resizeMode: 'cover' }} 
                            />
                          ) : (
                            <View style={{ height: 80, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginVertical: 8 }}>
                              <Text style={{ color: Colors.light.textSecondary }}>No Document URL</Text>
                            </View>
                          )}

                          <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
                            <TouchableOpacity
                              style={{ flex: 1, backgroundColor: '#10b981', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
                              onPress={() => handleApproveDoc(doc.user_id)}
                            >
                              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Approve ID Document</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={{ flex: 1, backgroundColor: '#ef4444', paddingVertical: 10, borderRadius: 8, alignItems: 'center' }}
                              onPress={() => handleRejectDoc(doc.user_id)}
                            >
                              <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 13 }}>Reject Document</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                )}

                {/* TAB 2: PENDING PROFILE PHOTOS */}
                {adminActiveTab === 'photos' && (
                  <View>
                    <Text style={styles.faqHeader}>PENDING PROFILE PHOTOS ({adminPendingPhotos.length})</Text>
                    {adminPendingPhotos.length === 0 ? (
                      <View style={{ padding: 30, alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: 12, marginVertical: 10 }}>
                        <Ionicons name="images-outline" size={44} color="#10b981" />
                        <Text style={{ color: '#059669', fontWeight: 'bold', marginTop: 8 }}>All Photos Approved!</Text>
                        <Text style={{ color: Colors.light.textSecondary, fontSize: 12, marginTop: 4 }}>No user profile photos currently pending validation.</Text>
                      </View>
                    ) : (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                        {adminPendingPhotos.map((photo: any) => (
                          <View key={photo.photo_id} style={{ width: '47%', backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb', elevation: 2 }}>
                            <Image source={{ uri: photo.photo_url }} style={{ width: '100%', height: 160, resizeMode: 'cover' }} />
                            <View style={{ padding: 8, gap: 6 }}>
                              <Text style={{ fontWeight: 'bold', fontSize: 13, color: Colors.light.text }} numberOfLines={1}>{photo.user_name}</Text>
                              <Text style={{ fontSize: 10, color: Colors.light.textSecondary }} numberOfLines={1}>{photo.user_email}</Text>

                              <TouchableOpacity
                                style={{ backgroundColor: '#10b981', paddingVertical: 8, borderRadius: 6, alignItems: 'center', marginTop: 4 }}
                                onPress={() => handleApprovePhoto(photo.photo_id)}
                              >
                                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Approve Photo</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={{ backgroundColor: '#ef4444', paddingVertical: 8, borderRadius: 6, alignItems: 'center' }}
                                onPress={() => handleRejectPhoto(photo.photo_id)}
                              >
                                <Text style={{ color: '#fff', fontSize: 11, fontWeight: 'bold' }}>Reject & Remove</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}

                {/* TAB 3: ALL USERS DIRECTORY */}
                {adminActiveTab === 'users' && (
                  <View>
                    <Text style={styles.faqHeader}>REGISTERED ACCOUNTS ({adminUsersList.length})</Text>
                    {adminUsersList.map((usr: any) => (
                      <View key={usr.id} style={{ backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: 'bold', fontSize: 14, color: Colors.light.text }}>{usr.name} {usr.is_admin ? '👑 (Admin)' : ''}</Text>
                          <Text style={{ fontSize: 11, color: Colors.light.textSecondary }}>{usr.email}</Text>
                          <Text style={{ fontSize: 11, color: Colors.light.primary, marginTop: 2 }}>
                            Plan: {usr.plan_type || 'Free'} | ID Status: {usr.id_verification_status}
                          </Text>
                        </View>
                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          <Text style={{ fontSize: 11, color: '#059669', fontWeight: 'bold' }}>{usr.photos_count} Photos</Text>
                          {usr.unapproved_photos_count > 0 && (
                            <Text style={{ fontSize: 10, color: '#d97706', fontWeight: 'bold' }}>{usr.unapproved_photos_count} Pending</Text>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal: Settings & Privacy */}
      <Modal visible={settingsModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="settings" size={22} color={Colors.light.primary} />
                <Text style={styles.sheetTitle}>Settings & Privacy</Text>
              </View>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
              {/* Account Info Section */}
              <Text style={styles.faqHeader}>ACCOUNT INFORMATION</Text>
              <View style={{ backgroundColor: '#f8fafc', padding: 14, borderRadius: 12, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: Colors.light.textSecondary }}>Signed-in Email:</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: Colors.light.text }}>{userData?.email || 'N/A'}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 13, color: Colors.light.textSecondary }}>Membership Plan:</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: Colors.light.primary }}>{userData?.plan_type || 'Free Tier'}</Text>
                </View>
              </View>

              {/* Notifications & Preferences */}
              <Text style={styles.faqHeader}>NOTIFICATIONS & ALERTS</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 16 }}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
                  onPress={() => setPushNotifications(!pushNotifications)}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text }}>Push Notifications</Text>
                    <Text style={{ fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 }}>Instant updates for new matches and messages</Text>
                  </View>
                  <Ionicons 
                    name={pushNotifications ? "checkbox" : "square-outline"} 
                    size={22} 
                    color={pushNotifications ? Colors.light.primary : "#9ca3af"} 
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}
                  onPress={() => setMatchAlerts(!matchAlerts)}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text }}>Match Activity Digest</Text>
                    <Text style={{ fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 }}>Daily recommendations and profile view alerts</Text>
                  </View>
                  <Ionicons 
                    name={matchAlerts ? "checkbox" : "square-outline"} 
                    size={22} 
                    color={matchAlerts ? Colors.light.primary : "#9ca3af"} 
                  />
                </TouchableOpacity>
              </View>

              {/* Privacy Controls */}
              <Text style={styles.faqHeader}>PRIVACY & VISIBILITY</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', marginBottom: 20 }}>
                <TouchableOpacity 
                  style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14 }}
                  onPress={() => setPrivacyMode(!privacyMode)}
                >
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: Colors.light.text }}>Member Only Privacy Mode</Text>
                    <Text style={{ fontSize: 11, color: Colors.light.textSecondary, marginTop: 2 }}>Only show my profile to registered & verified members</Text>
                  </View>
                  <Ionicons 
                    name={privacyMode ? "checkbox" : "square-outline"} 
                    size={22} 
                    color={privacyMode ? Colors.light.primary : "#9ca3af"} 
                  />
                </TouchableOpacity>
              </View>

              {/* Session Control / Log Out */}
              <Text style={styles.faqHeader}>SESSION CONTROLS</Text>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  paddingVertical: 14,
                  marginBottom: 30,
                  backgroundColor: '#fff1f2',
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: '#fecdd3',
                }}
                onPress={() => {
                  setSettingsModalVisible(false);
                  handleLogout();
                }}
              >
                <Ionicons name="log-out-outline" size={20} color="#e11d48" />
                <Text style={{ color: '#e11d48', fontWeight: 'bold', fontSize: 14 }}>Log Out of Session</Text>
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
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 120 : 100,
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
