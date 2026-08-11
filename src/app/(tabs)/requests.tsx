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
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { Alert } from '../../utils/alert';

interface RequestInterest {
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
}

export default function RequestsScreen() {
  const [requests, setRequests] = useState<RequestInterest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReceivedInterests();
      // Filter only "Pending" requests
      const pending = data.filter((item: any) => item.status === 'Pending');
      setRequests(pending);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRespond = async (interestId: number, status: 'Accepted' | 'Declined') => {
    try {
      await api.respondToInterest(interestId, status);
      Alert.alert('Request Updated', `Successfully ${status.toLowerCase()} connection request!`);
      // Remove item from pending requests view
      setRequests((prev) => prev.filter((item) => item.id !== interestId));
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not update status');
    }
  };

  const renderRequestItem = ({ item }: { item: RequestInterest }) => {
    const sender = item.sender_profile;
    if (!sender) return null;

    const mainPhoto = sender.photos?.find((p) => p.is_main)?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.profileSection} 
          activeOpacity={0.8}
          onPress={() => router.push(`/profile/${sender.id}`)}
        >
          <Image source={{ uri: mainPhoto }} style={styles.avatar} />
          <View style={styles.textDetails}>
            <Text style={styles.name}>{sender.name}, {sender.age}</Text>
            <Text style={styles.subtitle}>{sender.profession}</Text>
            <Text style={styles.location}>{sender.present_location}</Text>
          </View>
        </TouchableOpacity>

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
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.logoText}>HelpMeet</Text>
      </View>

      <View style={styles.headerTitleContainer}>
        <Text style={styles.headerTitle}>Connection Requests</Text>
        <Text style={styles.headerSubtitle}>Members interested in connecting with you</Text>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : requests.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="people-outline" size={48} color={Colors.light.textSecondary} />
          <Text style={styles.emptyText}>No pending requests at this time.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderRequestItem}
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
  headerTitleContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 10,
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
    paddingHorizontal: 20,
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
