import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  BackHandler,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useLocalSearchParams, useRouter, useNavigation } from 'expo-router';
import { Alert } from '../../utils/alert';
import { DEFAULT_TAB_BAR_STYLE } from './_layout';

interface ChatParticipant {
  id: number;
  name: string;
  gender: string;
  age: number;
  photo_url?: string;
  is_online: boolean;
}

interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  message_text?: string;
  message_type: string;
  is_read: boolean;
  call_duration?: number;
  created_at: string;
}

interface Conversation {
  participant: ChatParticipant;
  last_message: Message;
  unread_count: number;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const autoChatId = params.autoChatId ? Number(params.autoChatId) : null;
  const router = useRouter();
  const navigation = useNavigation();

  const [activeFilter, setActiveFilter] = useState<'all' | 'requests' | 'chats' | 'calls'>('all');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Chat Window states
  const [activeChatUser, setActiveChatUser] = useState<ChatParticipant | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  
  const pollingRef = useRef<any>(null);
  const flatListRef = useRef<FlatList | null>(null);
  const autoChatProcessedRef = useRef<number | null>(null);

  // Hide the parent bottom tabs layout when an active user chat is open
  useEffect(() => {
    const parentNav = navigation.getParent();
    if (activeChatUser) {
      parentNav?.setOptions({
        tabBarStyle: { display: 'none' },
      });
    } else {
      parentNav?.setOptions({
        tabBarStyle: DEFAULT_TAB_BAR_STYLE,
      });
    }

    return () => {
      parentNav?.setOptions({
        tabBarStyle: DEFAULT_TAB_BAR_STYLE,
      });
    };
  }, [activeChatUser, navigation]);

  // Handle hardware back button press on Android to close active chat
  useEffect(() => {
    const onBackPress = () => {
      if (activeChatUser) {
        closeChat();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [activeChatUser]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      // Fetch conversations from backend
      const data = await api.getConversations();
      // Apply local filter based on activeFilter state
      let filteredData = data;
      if (activeFilter === 'chats') {
        filteredData = data.filter((c: any) => c.last_message.message_type === 'chat');
      } else if (activeFilter === 'requests') {
        filteredData = data.filter((c: any) => c.last_message.message_type === 'request');
      } else if (activeFilter === 'calls') {
        filteredData = data.filter((c: any) => c.last_message.message_type === 'call');
      }
      setConversations(filteredData);
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoOpenChat = async (targetId: number) => {
    try {
      const data = await api.getConversations();
      const targetConv = data.find((c: any) => c.participant.id === targetId);
      if (targetConv) {
        openChat(targetConv.participant);
      } else {
        // If no existing conversation, load profile details to start a blank chat
        const profile = await api.getProfileByUserId(targetId);
        openChat({
          id: profile.user_id,
          name: profile.name,
          gender: profile.gender,
          age: profile.age,
          photo_url: profile.photos?.[0]?.url,
          is_online: false
        });
      }
    } catch (e) {
      console.error('Error auto opening chat:', e);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [activeFilter]);

  useEffect(() => {
    if (autoChatId) {
      handleAutoOpenChat(autoChatId);
    }
  }, [autoChatId]);

  // Handle active chat message polling
  useEffect(() => {
    if (activeChatUser) {
      pollingRef.current = setInterval(() => {
        pollMessages(activeChatUser.id);
      }, 3000); // Poll every 3 seconds
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeChatUser]);

  const openChat = async (user: ChatParticipant) => {
    setActiveChatUser(user);
    setIsMessagesLoading(true);
    try {
      const history = await api.getMessageHistory(user.id);
      setMessages(history);
    } catch (error: any) {
      Alert.alert('Error', 'Could not retrieve message history');
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const pollMessages = async (userId: number) => {
    try {
      const history = await api.getMessageHistory(userId);
      setMessages(history);
    } catch (e) {
      // fail silently on background poll
    }
  };

  const closeChat = () => {
    setActiveChatUser(null);
    setMessages([]);
    setInputText('');
    router.setParams({ autoChatId: undefined });
    loadConversations(); // refresh unread badges
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeChatUser) return;
    
    const textToSend = inputText.trim();
    setInputText('');

    try {
      const sentMsg = await api.sendMessage(activeChatUser.id, textToSend, 'chat');
      setMessages((prev) => [...prev, sentMsg]);
      // Scroll to bottom
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error: any) {
      Alert.alert('Message Failed', error.message || 'Could not send message.');
    }
  };

  const handleCall = async () => {
    if (!activeChatUser) return;
    try {
      const callMsg = await api.sendMessage(activeChatUser.id, 'Voice Call Log', 'call', 60);
      setMessages((prev) => [...prev, callMsg]);
      Alert.alert('Call Connected', `Voice call simulated with ${activeChatUser.name}.`);
    } catch (error: any) {
      Alert.alert('Calling Unavailable', error.message || 'Calling is only available on an active paid membership plan.');
    }
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const avatar = item.participant.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
    const isUnread = item.unread_count > 0;
    
    // Format message timestamp
    const date = new Date(item.last_message.created_at);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let messagePreview = item.last_message.message_text || '';
    if (item.last_message.message_type === 'call') {
      const min = Math.ceil((item.last_message.call_duration || 0) / 60);
      messagePreview = `📞 Voice Call Log (${min} min)`;
    } else if (item.last_message.message_type === 'request') {
      messagePreview = `📬 Connection Request`;
    }

    return (
      <TouchableOpacity 
        style={styles.convItem} 
        activeOpacity={0.8}
        onPress={() => openChat(item.participant)}
      >
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: avatar }} style={styles.convAvatar} />
          {item.participant.is_online && <View style={styles.onlineDot} />}
        </View>

        <View style={styles.convTextSection}>
          <View style={styles.convHeaderRow}>
            <Text style={styles.convName}>{item.participant.name}</Text>
            <Text style={[styles.convTime, isUnread && styles.unreadTime]}>{timeString}</Text>
          </View>
          <View style={styles.convBodyRow}>
            <Text 
              style={[styles.convPreview, isUnread && styles.unreadPreview]} 
              numberOfLines={1}
            >
              {messagePreview}
            </Text>
            {isUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.appBar}>
        <Text style={styles.logoText}>HelpMeet</Text>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'all' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterText, activeFilter === 'all' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'requests' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('requests')}
          >
            <Text style={[styles.filterText, activeFilter === 'requests' && styles.activeFilterText]}>Requests</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'chats' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('chats')}
          >
            <Text style={[styles.filterText, activeFilter === 'chats' && styles.activeFilterText]}>Chats</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterChip, activeFilter === 'calls' && styles.activeFilterChip]}
            onPress={() => setActiveFilter('calls')}
          >
            <Text style={[styles.filterText, activeFilter === 'calls' && styles.activeFilterText]}>Calls</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="chatbubbles-outline" size={48} color={Colors.light.textSecondary} />
          <Text style={styles.emptyText}>No active conversations found.</Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.participant.id.toString()}
          renderItem={renderConversationItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Full-screen Chat Modal Overlay */}
      <Modal
        visible={!!activeChatUser}
        animationType="slide"
        onRequestClose={closeChat}
        statusBarTranslucent
      >
        <SafeAreaView style={styles.chatWindow}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : Platform.OS === 'android' ? 'height' : undefined}
            style={{ flex: 1 }}
          >
            {/* Chat Header */}
            {activeChatUser && (
              <View style={styles.chatHeader}>
                <TouchableOpacity onPress={closeChat} style={styles.chatBackBtn}>
                  <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
                </TouchableOpacity>
                
                <Image 
                  source={{ uri: activeChatUser.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' }} 
                  style={styles.chatHeaderAvatar} 
                />
                
                <View style={styles.chatHeaderDetails}>
                  <Text style={styles.chatHeaderName}>{activeChatUser.name}</Text>
                  <Text style={styles.chatHeaderStatus}>
                    {activeChatUser.is_online ? 'Online Now' : 'Active recently'}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.chatCallBtn} onPress={handleCall}>
                  <Ionicons name="call-outline" size={20} color={Colors.light.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* Messages timeline */}
            {isMessagesLoading ? (
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => {
                  if (!activeChatUser) return null;
                  const isMine = item.sender_id !== activeChatUser.id;
                  
                  let text = item.message_text;
                  if (item.message_type === 'call') {
                    const min = Math.ceil((item.call_duration || 0) / 60);
                    text = `📞 Call Completed: ${min} minute(s)`;
                  } else if (item.message_type === 'request') {
                    text = `📬 Connection Request sent.`;
                  }

                  return (
                    <View style={[styles.messageBubbleContainer, isMine ? styles.bubbleRight : styles.bubbleLeft]}>
                      <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
                        <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
                          {text}
                        </Text>
                      </View>
                    </View>
                  );
                }}
                contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 20 }}
                onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
              />
            )}

            {/* Chat Input */}
            <View style={styles.chatInputBar}>
              <TextInput
                style={styles.textInput}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
                onPress={handleSend}
                disabled={!inputText.trim()}
              >
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
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
  filterBar: {
    backgroundColor: Colors.light.background,
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(233, 225, 220, 0.3)',
  },
  activeFilterChip: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Colors.light.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeFilterText: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'android' ? 120 : 100,
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 225, 220, 0.2)',
  },
  avatarWrapper: {
    position: 'relative',
  },
  convAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.light.emerald,
    borderWidth: 2,
    borderColor: '#fff',
  },
  convTextSection: {
    flex: 1,
    marginLeft: 16,
  },
  convHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  convName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  convTime: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
  },
  unreadTime: {
    color: Colors.light.primary,
    fontWeight: 'bold',
  },
  convBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  convPreview: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  unreadPreview: {
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  unreadBadge: {
    backgroundColor: Colors.light.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
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

  // Chat Window Styles
  chatWindow: {
    flex: 1,
    backgroundColor: '#fff8f5',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(233, 225, 220, 0.3)',
  },
  chatBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatHeaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 8,
  },
  chatHeaderDetails: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeaderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  chatHeaderStatus: {
    fontSize: 11,
    color: Colors.light.textSecondary,
  },
  chatCallBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(233, 225, 220, 0.2)',
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  bubbleRight: {
    justifyContent: 'flex-end',
  },
  bubbleLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myBubble: {
    backgroundColor: Colors.light.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    backgroundColor: 'rgba(233, 225, 220, 0.4)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(233, 225, 220, 0.5)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: Colors.light.text,
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(233, 225, 220, 0.3)',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#f5ece7',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
    fontSize: 15,
    color: Colors.light.text,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(87, 0, 19, 0.3)',
  },
});
