import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { Alert } from '../../utils/alert';

const { width } = Dimensions.get('window');

interface ProfileDetail {
  id: number;
  user_id: number;
  name: string;
  age: number;
  gender: string;
  marital_status: string;
  language: string;
  religion: string;
  sect: string;
  present_location: string;
  present_country: string;
  present_state: string;
  profession: string;
  annual_income: number;
  height: number;
  weight: number;
  differently_abled: boolean;
  orphan_poor_girl: boolean;
  education: string;
  health_or_disabilities: string | null;
  tagline: string;
  profile_description: string;
  about: string;
  primary_no: string;
  whatsapp_no: string;
  preferred_contact_method: string;
  best_time_to_call: string;
  contact_person: string;
  full_address: string;
  family_type: string;
  financial_status: string;
  interests: string[];
  last_active_at: string;
  photos: Array<{ id: number; url: string; is_main: boolean }>;
}

export default function ProfileDetailsScreen() {
  const { id } = useLocalSearchParams();
  const profileId = Number(id);
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileDetail | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Contact unlocked state
  const [isContactUnlocked, setIsContactUnlocked] = useState(false);
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const [isCreditModalVisible, setIsCreditModalVisible] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const noteTimeoutRef = useRef<any>(null);

  const loadProfileDetails = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch main profile
      const data = await api.getProfileById(profileId);
      setProfile(data);

      // 2. Fetch note if any
      try {
        const note = await api.getNote(profileId);
        if (note && note.note_text) {
          setNoteText(note.note_text);
        }
      } catch (e) {
        // no note yet
      }

      // 3. Check if favourited
      const favs = await api.getFavourites();
      const favourited = favs.some((fav: any) => fav.id === data.id);
      setIsFavourite(favourited);

      // 4. Fetch menu summary to see credit balance
      const menu = await api.getMenuSummary();
      setCreditsRemaining(50 - menu.remaining_contact_views); // calculated offset or display standard credits
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not load profile details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileId) {
      loadProfileDetails();
    }
  }, [profileId]);

  // Handle Note Auto-save simulation
  const handleNoteChange = (text: string) => {
    setNoteText(text);

    if (noteTimeoutRef.current) {
      clearTimeout(noteTimeoutRef.current);
    }

    noteTimeoutRef.current = setTimeout(async () => {
      try {
        await api.saveNote(profileId, text);
        console.log('Note auto-saved');
      } catch (error) {
        console.error('Note auto-save failed:', error);
      }
    }, 1500); // Save after 1.5 seconds of inactivity
  };

  const handleFavouriteToggle = async () => {
    if (!profile) return;
    try {
      if (isFavourite) {
        await api.removeFavourite(profile.user_id);
        setIsFavourite(false);
        Alert.alert('Removed', 'Removed from your shortlists.');
      } else {
        await api.addFavourite(profile.user_id);
        setIsFavourite(true);
        Alert.alert('Shortlisted', 'Profile successfully added to your shortlists!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not update shortlists.');
    }
  };

  const handleExpressInterest = async () => {
    if (!profile) return;
    try {
      await api.sendInterest(profile.user_id);
      Alert.alert('Interest Expressed', 'Your request has been sent successfully!');
    } catch (error: any) {
      Alert.alert('Unable to Connect', error.message || 'Interest could not be sent.');
    }
  };

  const handleUnlockContact = async () => {
    if (!profile) return;
    setIsUnlocking(true);
    try {
      await api.viewContact(profile.user_id);
      setIsContactUnlocked(true);
      setIsCreditModalVisible(false);
      Alert.alert('Success', 'Contact details unlocked successfully!');
    } catch (error: any) {
      Alert.alert('Unlock Failed', error.message || 'Insufficient credits or request failed.');
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoading || !profile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  // Get primary photo
  const primaryPhoto = profile.photos?.find((p) => p.is_main)?.url || 
                       (profile.photos && profile.photos.length > 0 ? profile.photos[0].url : 'https://via.placeholder.com/400');

  // Verify online status (active in last 5 minutes)
  const isOnline = (new Date().getTime() - new Date(profile.last_active_at).getTime()) < 5 * 60 * 1000;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header Row */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Hero Image */}
        <View style={styles.heroSection}>
          <Image source={{ uri: primaryPhoto }} style={styles.heroImage} />
          <View style={styles.gradientOverlay} />
          
          <View style={styles.heroTextContainer}>
            <View style={styles.onlineBadge}>
              <View style={[styles.onlineIndicatorDot, isOnline && { backgroundColor: Colors.light.emerald }]} />
              <Text style={styles.onlineBadgeText}>{isOnline ? 'Online Now' : 'Offline'}</Text>
            </View>

            <View style={styles.nameRow}>
              <Text style={styles.heroName}>{profile.name}, {profile.age}</Text>
              <Ionicons name="checkmark-circle" size={20} color={Colors.light.secondaryContainer} />
            </View>
            <Text style={styles.heroSub}>{profile.profession} • {profile.present_location}, {profile.present_state}</Text>
          </View>
        </View>

        {/* Photo Gallery Scroll */}
        {profile.photos && profile.photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.galleryContainer}>
            {profile.photos.map((photo) => (
              <Image key={photo.id} source={{ uri: photo.url }} style={styles.galleryImage} />
            ))}
          </ScrollView>
        )}

        {/* Tagline */}
        <View style={styles.taglineSection}>
          <Text style={styles.taglineText}>"{profile.tagline}"</Text>
        </View>

        {/* About Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>About Me</Text>
          <Text style={styles.bodyText}>{profile.about}</Text>
          
          <View style={styles.interestsContainer}>
            {profile.interests?.map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <Text style={styles.interestTagText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Details Grid: Physical Details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="body-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.gridSectionTitle}>Physical Attributes</Text>
          </View>
          <View style={styles.gridList}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Height</Text>
              <Text style={styles.gridValue}>{profile.height} cm</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Weight</Text>
              <Text style={styles.gridValue}>{profile.weight} kg</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Marital Status</Text>
              <Text style={styles.gridValue}>{profile.marital_status}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Diet</Text>
              <Text style={styles.gridValue}>Vegetarian (Standard)</Text>
            </View>
          </View>
        </View>

        {/* Details Grid: Education Details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="briefcase-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.gridSectionTitle}>Work & Education</Text>
          </View>
          <View style={styles.gridList}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Education</Text>
              <Text style={styles.gridValue}>{profile.education}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Profession</Text>
              <Text style={styles.gridValue}>{profile.profession}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Annual Income</Text>
              <Text style={styles.gridValue}>₹{(profile.annual_income / 100000).toFixed(1)} Lakhs PA</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Financial Status</Text>
              <Text style={styles.gridValue}>{profile.financial_status}</Text>
            </View>
          </View>
        </View>

        {/* Details Grid: Socio-Religious Details */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="planet-outline" size={20} color={Colors.light.primary} />
            <Text style={styles.gridSectionTitle}>Religion & Social</Text>
          </View>
          <View style={styles.gridList}>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Religion</Text>
              <Text style={styles.gridValue}>{profile.religion}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Sect / Caste</Text>
              <Text style={styles.gridValue}>{profile.sect}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Mother Tongue</Text>
              <Text style={styles.gridValue}>{profile.language}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.gridLabel}>Family Type</Text>
              <Text style={styles.gridValue}>{profile.family_type}</Text>
            </View>
          </View>
        </View>

        {/* Unlocked Contact Details Box */}
        {isContactUnlocked ? (
          <View style={styles.contactUnlockedCard}>
            <View style={styles.sectionHeaderRow}>
              <Ionicons name="call" size={20} color={Colors.light.emerald} />
              <Text style={[styles.gridSectionTitle, { color: Colors.light.emerald }]}>Contact Information Unlocked</Text>
            </View>
            <View style={styles.contactDetailsGrid}>
              <Text style={styles.contactText}>📞 Primary: <Text style={styles.contactBold}>{profile.primary_no}</Text></Text>
              <Text style={styles.contactText}>💬 WhatsApp: <Text style={styles.contactBold}>{profile.whatsapp_no}</Text></Text>
              <Text style={styles.contactText}>👤 Contact Person: <Text style={styles.contactBold}>{profile.contact_person}</Text></Text>
              <Text style={styles.contactText}>🕒 Best Time: <Text style={styles.contactBold}>{profile.best_time_to_call}</Text></Text>
              <Text style={styles.contactText}>📍 Address: <Text style={styles.contactBold}>{profile.full_address}</Text></Text>
            </View>
          </View>
        ) : null}

        {/* Private Notes Section */}
        <View style={styles.notesSection}>
          <View style={styles.notesHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Ionicons name="document-text" size={18} color={Colors.light.secondary} />
              <Text style={styles.notesTitle}>Private Match Note</Text>
            </View>
            <View style={styles.noteNotice}>
              <Text style={styles.noteNoticeText}>ONLY VISIBLE TO YOU</Text>
            </View>
          </View>
          
          <TextInput
            style={styles.notesInput}
            placeholder="Tap to write a private note about this match (e.g. 'Discuss family values next', 'Met on weekend call'). Changes save automatically."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={4}
            value={noteText}
            onChangeText={handleNoteChange}
          />
        </View>

      </ScrollView>

      {/* Floating Bottom Action Bar */}
      <View style={styles.floatingActionBar}>
        <TouchableOpacity 
          style={[styles.floatingCircleBtn, isFavourite && styles.favCircleBtnActive]}
          onPress={handleFavouriteToggle}
        >
          <Ionicons 
            name={isFavourite ? 'star' : 'star-outline'} 
            size={22} 
            color={isFavourite ? '#fff' : Colors.light.primary} 
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatingExpressBtn} onPress={handleExpressInterest}>
          <Ionicons name="heart" size={20} color="#fff" />
          <Text style={styles.expressBtnText}>Express Interest</Text>
        </TouchableOpacity>

        {!isContactUnlocked ? (
          <TouchableOpacity 
            style={styles.floatingUnlockBtn} 
            onPress={() => setIsCreditModalVisible(true)}
          >
            <Ionicons name="call" size={20} color="#fff" />
            <Ionicons name="lock-closed" size={10} color={Colors.light.secondaryContainer} style={styles.lockBadge} />
          </TouchableOpacity>
        ) : (
          <View style={[styles.floatingCircleBtn, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: Colors.light.emerald }]}>
            <Ionicons name="checkmark" size={22} color={Colors.light.emerald} />
          </View>
        )}
      </View>

      {/* Credits Unlock Confirmation Modal */}
      <Modal visible={isCreditModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.alertCard}>
            <View style={styles.alertHeader}>
              <Text style={styles.alertTitle}>Unlock Contact Details</Text>
              <TouchableOpacity onPress={() => setIsCreditModalVisible(false)}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <View style={styles.alertBody}>
              <View style={styles.coinIconWrapper}>
                <Ionicons name="key" size={36} color={Colors.light.secondary} />
              </View>

              <Text style={styles.alertText}>
                Unlocking contact details requires <Text style={{ fontWeight: 'bold', color: Colors.light.primary }}>5 Credits</Text>. You will be charged directly from your subscription balance.
              </Text>

              <TouchableOpacity 
                style={styles.unlockSubmitBtn}
                onPress={handleUnlockContact}
                disabled={isUnlocking}
              >
                {isUnlocking ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.unlockSubmitBtnText}>Confirm & Unlock</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.alertNotice}>YOUR DETAILS WILL ALSO BE SHARED WITH {profile.name.toUpperCase()}</Text>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 225, 220, 0.2)',
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  scrollContent: {
    paddingBottom: 100, // Safe padding for floating actions bar
  },
  heroSection: {
    width: '100%',
    aspectRatio: 1.1,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    bottom: 0,
    backgroundColor: 'rgba(87, 0, 19, 0.3)',
  },
  heroTextContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  onlineIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#aaa',
  },
  onlineBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
  },
  heroSub: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  galleryContainer: {
    paddingLeft: 20,
    paddingRight: 10,
    marginTop: 12,
    gap: 10,
  },
  galleryImage: {
    width: 90,
    height: 120,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  taglineSection: {
    paddingHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  taglineText: {
    fontSize: 15,
    fontStyle: 'italic',
    color: Colors.light.secondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    shadowColor: '#2d2926',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 10,
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
  },
  bodyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  interestTag: {
    backgroundColor: 'rgba(87, 0, 19, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  interestTagText: {
    color: Colors.light.primary,
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  gridSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  gridList: {
    gap: 12,
  },
  gridItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 225, 220, 0.2)',
    paddingBottom: 8,
  },
  gridLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  notesSection: {
    backgroundColor: 'rgba(254, 224, 136, 0.1)',
    borderColor: '#fed65b',
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  notesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  notesTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  noteNotice: {
    backgroundColor: '#fed65b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  noteNoticeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.light.onSecondaryContainer,
  },
  notesInput: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 18,
    padding: 0,
    textAlignVertical: 'top',
  },
  contactUnlockedCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderWidth: 1.5,
    borderColor: Colors.light.emerald,
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  contactDetailsGrid: {
    gap: 10,
  },
  contactText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  contactBold: {
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  floatingActionBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 70,
    backgroundColor: 'rgba(255, 248, 245, 0.95)',
    borderRadius: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(233, 225, 220, 0.3)',
    shadowColor: '#2d2926',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  floatingCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  favCircleBtnActive: {
    backgroundColor: Colors.light.primary,
  },
  floatingExpressBtn: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    height: 48,
    borderRadius: 24,
    marginHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  expressBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  floatingUnlockBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Modal Card
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    margin: 24,
    alignSelf: 'center',
    width: '90%',
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
  coinIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(254, 214, 91, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 16,
  },
  alertBody: {
    gap: 16,
  },
  alertText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    textAlign: 'center',
  },
  unlockSubmitBtn: {
    backgroundColor: Colors.light.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockSubmitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  alertNotice: {
    fontSize: 9,
    color: Colors.light.textSecondary,
    opacity: 0.6,
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
