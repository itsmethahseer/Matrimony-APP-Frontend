import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  ScrollView,
  StatusBar as RNStatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
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

const { width } = Dimensions.get('window');

interface Profile {
  id: number;
  user_id: number;
  name: string;
  age: number;
  gender: string;
  present_location?: string;
  profession?: string;
  photos?: Array<{ id?: number; url: string; is_main?: boolean; is_approved?: boolean }>;
  about?: string;
  education?: string;
  religion?: string;
  sect?: string;
  height?: number;
  weight?: number;
  marital_status?: string;
  caste?: string;
  sub_caste?: string;
}

interface ProfileCardProps {
  item: Profile;
  onPreview: (profile: Profile) => void;
  onPass: (profileId: number, userId: number) => void;
  onChat: (userId: number) => void;
  onLike: (profileId: number, userId: number) => void;
}

const ProfileCardItem = ({ item, onPreview, onPass, onChat, onLike }: ProfileCardProps) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const userPhotos = (item.photos && item.photos.length > 0)
    ? item.photos
    : [{ id: 0, url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80', is_approved: true }];

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          nestedScrollEnabled
          onScroll={(e) => {
            const slideSize = e.nativeEvent.layoutMeasurement.width;
            if (slideSize > 0) {
              const index = Math.round(e.nativeEvent.contentOffset.x / slideSize);
              if (index !== activePhotoIdx && index >= 0 && index < userPhotos.length) {
                setActivePhotoIdx(index);
              }
            }
          }}
          scrollEventThrottle={16}
          style={{ width: '100%', height: '100%' }}
        >
          {userPhotos.map((photo: any, idx: number) => (
            <TouchableOpacity
              key={photo.id || idx}
              activeOpacity={0.95}
              onPress={() => onPreview(item)}
              style={{ width: Math.min(width - 40, 768), height: '100%', position: 'relative' }}
            >
              <Image source={{ uri: photo.url }} style={styles.image} resizeMode="cover" />
              {photo.is_approved === false && (
                <View style={{ position: 'absolute', top: 50, left: 16, right: 16, backgroundColor: '#fffbe6', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ffe58f', zIndex: 10 }}>
                  <Text style={{ color: '#d48806', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>
                    ⏳ Photo will be verified shortly
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Photos Pagination Dots Indicator */}
        {userPhotos.length > 1 && (
          <View style={{
            position: 'absolute',
            top: 14,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            zIndex: 20
          }} pointerEvents="none">
            {userPhotos.map((_, dotIdx) => (
              <View
                key={dotIdx}
                style={{
                  width: activePhotoIdx === dotIdx ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: activePhotoIdx === dotIdx ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                }}
              />
            ))}
          </View>
        )}

        <View style={styles.gradientOverlay} pointerEvents="none" />

        <View style={styles.badge} pointerEvents="none">
          <Ionicons name="shield-checkmark" size={12} color={Colors.light.secondaryContainer} />
          <Text style={styles.badgeText}>Verified</Text>
        </View>

        <TouchableOpacity 
          style={styles.profileTextInfo}
          activeOpacity={0.9}
          onPress={() => onPreview(item)}
        >
          <Text style={styles.profileName}>{item.name}, {item.age}</Text>
          {item.present_location && (
            <View style={styles.infoRow}>
              <Ionicons name="location-sharp" size={14} color="#ccc" />
              <Text style={styles.infoText}>{item.present_location}</Text>
            </View>
          )}
          {item.profession && (
            <View style={styles.infoRow}>
              <Ionicons name="briefcase-sharp" size={14} color="#ccc" />
              <Text style={styles.infoText}>{item.profession}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButtonCircle}
          onPress={() => onPass(item.id, item.user_id)}
        >
          <Ionicons name="close" size={24} color={Colors.light.textSecondary} />
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={[styles.actionButtonCircle, { backgroundColor: 'rgba(87, 0, 19, 0.05)' }]}
            onPress={() => onChat(item.user_id)}
          >
            <Ionicons name="chatbubble" size={20} color={Colors.light.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButtonCircle, styles.likeBtn]}
            onPress={() => onLike(item.id, item.user_id)}
          >
            <Ionicons name="heart" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const CATEGORIES = [
  { id: 'my_matches', label: 'My Matches' },
  { id: 'new_matches', label: 'New Matches' },
  { id: 'location', label: 'Location' },
  { id: 'profession', label: 'Profession' },
  { id: 'differently_abled', label: 'Differently Abled' },
  { id: 'orphan_poor_girls', label: 'Orphan/Poor Girls' },
];

export default function DiscoverScreen() {
  const [selectedCategory, setSelectedCategory] = useState('my_matches');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [previewProfile, setPreviewProfile] = useState<Profile | null>(null);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Preference Setup Modal States
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

  const openPreferencesModal = async () => {
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
    } catch (e: any) {
      Alert.alert('Preferences', 'Please log in to set partner preferences.');
    }
  };

  const handleSavePreferences = async () => {
    setIsSavingPref(true);
    try {
      const partnerReligionArr = editPartnerReligion.split(',').map((s) => s.trim()).filter(Boolean);
      const partnerCasteArr = editPartnerCaste.split(',').map((s) => s.trim()).filter(Boolean);
      const partnerSubCasteArr = editPartnerSubCaste.split(',').map((s) => s.trim()).filter(Boolean);

      await api.updateMyProfile({
        religion: editReligion,
        sect: editCaste,
        caste: editCaste,
        sub_caste: editSubCaste.trim(),
        partner_religion: partnerReligionArr,
        partner_caste: partnerCasteArr,
        partner_sub_caste: partnerSubCasteArr,
        partner_age_min: parseInt(editPartnerAgeMin) || 18,
        partner_age_max: parseInt(editPartnerAgeMax) || 70,
      });

      Alert.alert('Preferences Saved', 'Match recommendations updated based on your preferences!');
      setPrefModalVisible(false);
      loadProfiles(selectedCategory);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save partner preferences.');
    } finally {
      setIsSavingPref(false);
    }
  };

  const loadProfiles = async (category: string) => {
    setIsLoading(true);
    try {
      const data = await api.getMatches(category);
      setProfiles(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not load matches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles(selectedCategory);
  }, [selectedCategory]);

  const handleLike = async (profileId: number, receiverId: number) => {
    try {
      await api.sendInterest(receiverId);
      Alert.alert('Interest Sent', 'Successfully expressed interest in this profile!');
      // Remove liked profile from list dynamically
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } catch (error: any) {
      Alert.alert('Unable to Connect', error.message || 'Could not express interest.');
    }
  };

  const handlePass = async (profileId: number, targetUserId: number) => {
    try {
      await api.passUser(targetUserId);
      // Remove passed profile from list dynamically
      setProfiles((prev) => prev.filter((p) => p.id !== profileId));
    } catch (error: any) {
      console.error(error);
    }
  };

  const handleChat = (receiverId: number) => {
    router.push({ pathname: '/chat', params: { autoChatId: receiverId } });
  };

  const renderProfileCard = ({ item }: { item: Profile }) => {
    return (
      <ProfileCardItem
        item={item}
        onPreview={(p) => {
          setPreviewProfile(p);
          setPreviewModalVisible(true);
        }}
        onPass={handlePass}
        onChat={handleChat}
        onLike={handleLike}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.logoText}>HelpMeet</Text>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons name="notifications" size={22} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.chipContainer}>
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const active = item.id === selectedCategory;
            return (
              <TouchableOpacity
                style={[styles.chip, active && styles.activeChip]}
                onPress={() => setSelectedCategory(item.id)}
              >
                <Text style={[styles.chipText, active && styles.activeChipText]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        />
      </View>

      {selectedCategory === 'my_matches' && (
        <View style={styles.prefBanner}>
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={styles.prefBannerTitle}>🎯 Recommended For You</Text>
            <Text style={styles.prefBannerSub}>
              Filtered based on your Religion, Caste & Partner Preferences
            </Text>
          </View>
          <TouchableOpacity style={styles.prefBannerBtn} onPress={openPreferencesModal}>
            <Ionicons name="options-outline" size={14} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.prefBannerBtnText}>Preferences</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Curating profiles matching your soul...</Text>
        </View>
      ) : profiles.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="sad-outline" size={48} color={Colors.light.textSecondary} />
          <Text style={styles.noProfilesText}>No profiles found in this category.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadProfiles(selectedCategory)}>
            <Text style={styles.retryBtnText}>Reload Matches</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProfileCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Quick Profile Preview Modal */}
      <Modal visible={previewModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.previewContainer}>
            {previewProfile && (
              <>
                <View style={styles.previewHeader}>
                  <Text style={styles.previewTitle}>Quick Profile Preview</Text>
                  <TouchableOpacity 
                    onPress={() => setPreviewModalVisible(false)}
                    style={styles.previewCloseBtn}
                  >
                    <Ionicons name="close" size={24} color="#000" />
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={[1]}
                  keyExtractor={(i) => i.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={() => {
                    const mainPhoto = previewProfile.photos?.find((p) => p.is_main)?.url || 
                                      (previewProfile.photos && previewProfile.photos.length > 0 ? previewProfile.photos[0].url : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80');
                    return (
                      <View style={styles.previewScrollContent}>
                        <Image source={{ uri: mainPhoto }} style={styles.previewImage} />
                        
                        <View style={styles.previewMeta}>
                          <Text style={styles.previewName}>{previewProfile.name}, {previewProfile.age}</Text>
                          <Text style={styles.previewSub}>{previewProfile.profession || 'Profession Not Disclosed'}</Text>
                          <Text style={styles.previewLoc}>📍 {previewProfile.present_location || 'India'}</Text>
                        </View>

                        <View style={styles.previewSpecs}>
                          <View style={styles.specBox}>
                            <Ionicons name="school-outline" size={16} color={Colors.light.primary} />
                            <Text style={styles.specLabel}>EDUCATION</Text>
                            <Text style={styles.specVal} numberOfLines={1}>{previewProfile.education || 'Not Disclosed'}</Text>
                          </View>
                          <View style={styles.specBox}>
                            <Ionicons name="ribbon-outline" size={16} color={Colors.light.primary} />
                            <Text style={styles.specLabel}>RELIGION/SECT</Text>
                            <Text style={styles.specVal}>{previewProfile.religion || 'Islam'} ({previewProfile.sect || 'Sunni'})</Text>
                          </View>
                        </View>

                        <View style={styles.previewSpecs}>
                          <View style={styles.specBox}>
                            <Ionicons name="resize-outline" size={16} color={Colors.light.primary} />
                            <Text style={styles.specLabel}>HEIGHT/WEIGHT</Text>
                            <Text style={styles.specVal}>{previewProfile.height ? `${previewProfile.height} cm` : 'N/A'} / {previewProfile.weight ? `${previewProfile.weight} kg` : 'N/A'}</Text>
                          </View>
                          <View style={styles.specBox}>
                            <Ionicons name="heart-half-outline" size={16} color={Colors.light.primary} />
                            <Text style={styles.specLabel}>MARITAL STATUS</Text>
                            <Text style={styles.specVal}>{previewProfile.marital_status || 'Never Married'}</Text>
                          </View>
                        </View>

                        {previewProfile.about && (
                          <View style={styles.aboutContainer}>
                            <Text style={styles.aboutTitle}>About Me</Text>
                            <Text style={styles.aboutText}>{previewProfile.about}</Text>
                          </View>
                        )}
                      </View>
                    );
                  }}
                />

                <View style={styles.previewFooter}>
                  <TouchableOpacity 
                    style={[styles.footerBtn, styles.closeBtn]} 
                    onPress={() => setPreviewModalVisible(false)}
                  >
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.footerBtn, styles.fullProfileBtn]} 
                    onPress={() => {
                      setPreviewModalVisible(false);
                      router.push(`/profile/${previewProfile.id}`);
                    }}
                  >
                    <Text style={styles.fullProfileBtnText}>Full Profile</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Quick Set Preferences Modal */}
      <Modal visible={prefModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.previewContainer}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>Customize Match Preferences</Text>
              <TouchableOpacity onPress={() => setPrefModalVisible(false)} disabled={isSavingPref}>
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingTop: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.aboutTitle}>MY RELIGION & CASTE DETAILS</Text>

              {/* Religion Selector */}
              <Text style={styles.specLabel}>RELIGION</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 }}>
                {Object.keys(RELIGION_CASTE_MAP).map((rel) => (
                  <TouchableOpacity
                    key={rel}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: editReligion === rel ? Colors.light.primary : '#f3f4f6',
                    }}
                    onPress={() => {
                      setEditReligion(rel);
                      const defaultCastes = RELIGION_CASTE_MAP[rel] || ['Other'];
                      setEditCaste(defaultCastes[0]);
                    }}
                  >
                    <Text style={{ color: editReligion === rel ? '#fff' : Colors.light.text, fontSize: 12, fontWeight: editReligion === rel ? 'bold' : 'normal' }}>
                      {rel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Caste Selector */}
              <Text style={styles.specLabel}>CASTE / SECT (FOR {editReligion.toUpperCase()})</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 10 }}>
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
              <Text style={styles.specLabel}>SUB-CASTE / DENOMINATION</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, marginVertical: 8 }}
                value={editSubCaste}
                onChangeText={setEditSubCaste}
                placeholder="e.g. Mudaliar, Pillai, Iyer, Shafi'i, Kanthapuram"
                placeholderTextColor="#9ca3af"
              />

              <Text style={[styles.aboutTitle, { marginTop: 16 }]}>PARTNER PREFERENCES</Text>

              {/* Partner Religion */}
              <Text style={styles.specLabel}>PREFERRED PARTNER RELIGION</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, marginVertical: 8 }}
                value={editPartnerReligion}
                onChangeText={setEditPartnerReligion}
                placeholder="e.g. Islam, Hinduism, Any"
                placeholderTextColor="#9ca3af"
              />

              {/* Partner Caste */}
              <Text style={styles.specLabel}>PREFERRED PARTNER CASTE / SECT</Text>
              <TextInput
                style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, marginVertical: 8 }}
                value={editPartnerCaste}
                onChangeText={setEditPartnerCaste}
                placeholder="e.g. Sunni, Brahmin, Open to All"
                placeholderTextColor="#9ca3af"
              />

              {/* Age Range */}
              <View style={{ flexDirection: 'row', gap: 10, marginVertical: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.specLabel}>MIN AGE</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, marginTop: 4 }}
                    value={editPartnerAgeMin}
                    onChangeText={setEditPartnerAgeMin}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.specLabel}>MAX AGE</Text>
                  <TextInput
                    style={{ borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, fontSize: 14, marginTop: 4 }}
                    value={editPartnerAgeMax}
                    onChangeText={setEditPartnerAgeMax}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.fullProfileBtn, { height: 48, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginVertical: 20 }]}
                onPress={handleSavePreferences}
                disabled={isSavingPref}
              >
                {isSavingPref ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.fullProfileBtnText}>Save Preferences & Refresh Feed</Text>
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
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
  },
  prefBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(115, 92, 0, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(115, 92, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  prefBannerTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  prefBannerSub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  prefBannerBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefBannerBtnText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  appBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 191, 191, 0.2)',
  },
  logoText: {
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  chipContainer: {
    marginVertical: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(233, 225, 220, 0.3)',
    marginRight: 8,
  },
  activeChip: {
    backgroundColor: Colors.light.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeChipText: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
    paddingBottom: Platform.OS === 'android' ? 120 : 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#2d2926',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 2/3,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '60%',
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)', // Bottom dark gradient simulation
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.light.secondaryContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: Colors.light.onSecondaryContainer,
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileTextInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  profileName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  infoText: {
    color: '#eee',
    fontSize: 14,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(233, 225, 220, 0.5)',
    backgroundColor: '#fff',
  },
  likeBtn: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
    width: 52,
    height: 52,
    borderRadius: 26,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontStyle: 'italic',
  },
  noProfilesText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 12,
  },
  retryBtn: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  retryBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    padding: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewScrollContent: {
    paddingTop: 16,
    gap: 16,
  },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: 16,
    resizeMode: 'cover',
  },
  previewMeta: {
    gap: 4,
    marginTop: 4,
  },
  previewName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  previewSub: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  previewLoc: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  previewSpecs: {
    flexDirection: 'row',
    gap: 12,
  },
  specBox: {
    flex: 1,
    backgroundColor: '#fbfbfb',
    borderWidth: 1,
    borderColor: '#f0e9e4',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: Colors.light.textSecondary,
    letterSpacing: 0.5,
  },
  specVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  aboutContainer: {
    backgroundColor: 'rgba(115, 92, 0, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(115, 92, 0, 0.08)',
    borderRadius: 12,
    padding: 16,
    gap: 6,
    marginBottom: 20,
  },
  aboutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.secondary,
  },
  aboutText: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  previewFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtn: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  closeBtnText: {
    color: '#374151',
    fontWeight: 'bold',
  },
  fullProfileBtn: {
    backgroundColor: Colors.light.primary,
  },
  fullProfileBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
