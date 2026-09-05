import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Alert } from '../../utils/alert';

interface Interest {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: string;
  created_at: string;
  sender_profile?: {
    id: number;
    name: string;
    age: number;
    gender: string;
    present_location: string;
    profession: string;
    photos: Array<{ url: string; is_main: boolean }>;
  };
  receiver_profile?: {
    id: number;
    name: string;
    age: number;
    gender: string;
    present_location: string;
    profession: string;
    photos: Array<{ url: string; is_main: boolean }>;
  };
}

export default function InterestsScreen() {
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();

  const loadInterests = async () => {
    setIsLoading(true);
    try {
      if (activeTab === 'received') {
        const data = await api.getReceivedInterests();
        setInterests(data);
      } else {
        const data = await api.getSentInterests();
        setInterests(data);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not load interests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInterests();
  }, [activeTab]);

  const handleRespond = async (interestId: number, status: 'Accepted' | 'Declined') => {
    try {
      await api.respondToInterest(interestId, status);
      Alert.alert('Status Updated', `Interest successfully ${status.toLowerCase()}!`);
      // Update local state to reflect change (filter out declined requests instantly)
      setInterests((prev) => 
        status === 'Declined'
          ? prev.filter((item) => item.id !== interestId)
          : prev.map((item) => (item.id === interestId ? { ...item, status } : item))
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not update status');
    }
  };

  const handleCancelInterest = async (interestId: number, targetName?: string) => {
    Alert.alert(
      'Withdraw Interest?',
      `Are you sure you want to cancel your interest request${targetName ? ` to ${targetName}` : ''}? Your credits will be refunded.`,
      [
        { text: 'Keep Interest', style: 'cancel' },
        {
          text: 'Yes, Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await api.cancelInterest(interestId);
              Alert.alert('Interest Withdrawn', res?.message || 'Your interest request has been cancelled and credits refunded.');
              setInterests((prev) => prev.filter((item) => item.id !== interestId));
            } catch (error: any) {
              Alert.alert('Unable to Cancel', error.message || 'Could not cancel interest request.');
            }
          },
        },
      ]
    );
  };

  const renderInterestItem = ({ item }: { item: Interest }) => {
    // Determine which profile is the other person
    const otherProfile = activeTab === 'received' ? item.sender_profile : item.receiver_profile;
    if (!otherProfile) return null;

    const mainPhoto = otherProfile.photos?.find((p) => p.is_main)?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.profileSection} 
          activeOpacity={0.8}
          onPress={() => router.push(`/profile/${otherProfile.id}`)}
        >
          <Image source={{ uri: mainPhoto }} style={styles.avatar} />
          <View style={styles.textDetails}>
            <Text style={styles.name}>{otherProfile.name}, {otherProfile.age}</Text>
            <Text style={styles.subtitle}>{otherProfile.profession || 'Profession Not Disclosed'}</Text>
            <Text style={styles.location}>📍 {otherProfile.present_location || 'India'}</Text>
          </View>
        </TouchableOpacity>

        {activeTab === 'received' ? (
          item.status === 'Pending' ? (
            <View style={styles.actionRow}>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.declineBtn]}
                onPress={() => handleRespond(item.id, 'Declined')}
              >
                <Text style={styles.declineText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => handleRespond(item.id, 'Accepted')}
              >
                <Text style={styles.acceptText}>Accept</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, item.status === 'Accepted' ? styles.statusAccepted : styles.statusDeclined]}>
                Interest {item.status}
              </Text>
            </View>
          )
        ) : (
          item.status === 'Pending' ? (
            <View style={styles.sentActionRow}>
              <View style={styles.pendingBadgeContainer}>
                <View style={styles.pendingDot} />
                <Text style={styles.pendingBadgeText}>Pending Response</Text>
              </View>
              <TouchableOpacity 
                style={styles.cancelInterestBtn}
                onPress={() => handleCancelInterest(item.id, otherProfile.name)}
                activeOpacity={0.8}
              >
                <Ionicons name="close-circle-outline" size={16} color={Colors.light.error} />
                <Text style={styles.cancelInterestText}>Cancel Interest</Text>
              </TouchableOpacity>
            </View>
          ) : item.status === 'Accepted' ? (
            <View style={styles.sentActionRow}>
              <View style={styles.acceptedBadgeContainer}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.light.emerald} />
                <Text style={styles.acceptedBadgeText}>Connected</Text>
              </View>
              <TouchableOpacity 
                style={styles.chatActionBtn}
                onPress={() => router.push({ pathname: '/chat', params: { autoChatId: item.receiver_id } })}
              >
                <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
                <Text style={styles.chatActionText}>Chat</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.statusContainer}>
              <Text style={[styles.statusText, styles.statusDeclined]}>
                Interest Declined
              </Text>
            </View>
          )
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.logoText}>HelpMeet</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.activeTab]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.activeTabText]}>Received</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.activeTab]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.activeTabText]}>Sent</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : interests.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="heart-dislike-outline" size={48} color={Colors.light.textSecondary} />
          <Text style={styles.emptyText}>No connection interests found.</Text>
        </View>
      ) : (
        <FlatList
          data={interests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderInterestItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
  },
  appBar: {
    paddingHorizontal: 20,
    height: 60,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(224, 191, 191, 0.2)',
  },
  logoText: {
    fontFamily: Platform.OS === 'ios' ? 'Playfair Display' : 'serif',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: 'rgba(233, 225, 220, 0.3)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 21,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.light.onSurfaceVariant,
  },
  activeTabText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 120 : 100,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#2d2926',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  profileSection: {
    flexDirection: 'row',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  textDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  location: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    opacity: 0.8,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(233, 225, 220, 0.3)',
    paddingTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 90,
    alignItems: 'center',
  },
  declineBtn: {
    backgroundColor: 'rgba(233, 225, 220, 0.4)',
  },
  acceptBtn: {
    backgroundColor: Colors.light.primary,
  },
  declineText: {
    color: Colors.light.onSurfaceVariant,
    fontSize: 13,
    fontWeight: '600',
  },
  acceptText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  statusContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(233, 225, 220, 0.3)',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusAccepted: {
    color: Colors.light.emerald,
  },
  statusDeclined: {
    color: Colors.light.error,
  },
  sentStatusLabel: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  sentStatusText: {
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  sentActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(233, 225, 220, 0.3)',
    paddingTop: 12,
  },
  pendingBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbeb',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d97706',
    marginRight: 6,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#b45309',
  },
  cancelInterestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fee2e2',
    gap: 4,
  },
  cancelInterestText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.error,
  },
  acceptedBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    gap: 4,
  },
  acceptedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.emerald,
  },
  chatActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    gap: 6,
  },
  chatActionText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 12,
  },
});
