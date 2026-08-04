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
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';

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
      // Update local state to reflect change
      setInterests((prev) => 
        prev.map((item) => (item.id === interestId ? { ...item, status } : item))
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not update status');
    }
  };

  const renderInterestItem = ({ item }: { item: Interest }) => {
    // Determine which profile is the other person
    const otherProfile = activeTab === 'received' ? item.sender_profile : item.receiver_profile;
    if (!otherProfile) return null;

    const mainPhoto = otherProfile.photos?.find((p) => p.is_main)?.url || 'https://via.placeholder.com/100';

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
            <Text style={styles.subtitle}>{otherProfile.profession}</Text>
            <Text style={styles.location}>{otherProfile.present_location}</Text>
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
          <View style={styles.statusContainer}>
            <Text style={styles.sentStatusLabel}>
              Status: <Text style={[styles.sentStatusText, item.status === 'Accepted' && styles.statusAccepted]}>{item.status}</Text>
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.logoText}>SoulMate</Text>
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
    paddingBottom: 40,
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
