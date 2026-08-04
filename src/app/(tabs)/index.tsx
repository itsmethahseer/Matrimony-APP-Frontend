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
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { Alert } from '../../utils/alert';

const { width } = Dimensions.get('window');

interface Profile {
  id: number;
  user_id: number;
  name: string;
  age: number;
  gender: string;
  present_location?: string;
  profession?: string;
  photos?: Array<{ url: string; is_main: boolean }>;
  about?: string;
  education?: string;
  religion?: string;
  sect?: string;
  height?: number;
  weight?: number;
  marital_status?: string;
}

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
  const router = useRouter();

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
    // Get main photo or fallback to a placeholder
    const mainPhoto = item.photos?.find((p) => p.is_main)?.url || 
                      (item.photos && item.photos.length > 0 ? item.photos[0].url : 'https://via.placeholder.com/150');

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.95}
        onPress={() => {
          setPreviewProfile(item);
          setPreviewModalVisible(true);
        }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: mainPhoto }} style={styles.image} />
          <View style={styles.gradientOverlay} />
          
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={12} color={Colors.light.secondaryContainer} />
            <Text style={styles.badgeText}>Verified</Text>
          </View>

          <View style={styles.profileTextInfo}>
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
          </View>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.actionButtonCircle}
            onPress={() => handlePass(item.id, item.user_id)}
          >
            <Ionicons name="close" size={24} color={Colors.light.textSecondary} />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity 
              style={[styles.actionButtonCircle, { backgroundColor: 'rgba(87, 0, 19, 0.05)' }]}
              onPress={() => handleChat(item.user_id)}
            >
              <Ionicons name="chatbubble" size={20} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButtonCircle, styles.likeBtn]}
              onPress={() => handleLike(item.id, item.user_id)}
            >
              <Ionicons name="heart" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.logoText}>SoulMate</Text>
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
                                      (previewProfile.photos && previewProfile.photos.length > 0 ? previewProfile.photos[0].url : 'https://via.placeholder.com/150');
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
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
    paddingBottom: 40,
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
