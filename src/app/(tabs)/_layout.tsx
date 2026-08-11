import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { Platform, ViewStyle } from 'react-native';

export const DEFAULT_TAB_BAR_STYLE: ViewStyle = {
  position: Platform.OS === 'web' ? 'relative' : 'absolute',
  bottom: Platform.OS === 'ios' ? 22 : (Platform.OS === 'android' ? 14 : 0),
  left: Platform.OS === 'web' ? 0 : 16,
  right: Platform.OS === 'web' ? 0 : 16,
  height: Platform.OS === 'ios' ? 68 : 64,
  backgroundColor: '#ffffff',
  borderRadius: Platform.OS === 'web' ? 0 : 28,
  borderTopWidth: Platform.OS === 'web' ? 1 : 0,
  borderTopColor: '#e2e8f0',
  paddingBottom: Platform.OS === 'ios' ? 10 : 8,
  paddingTop: 8,
  paddingHorizontal: 8,
  elevation: 10,
  shadowColor: '#0f172a',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.textSecondary,
        tabBarStyle: DEFAULT_TAB_BAR_STYLE,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
          letterSpacing: 0.3,
          marginTop: 2,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="interests"
        options={{
          title: 'Interests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'chatbubble-ellipses' : 'chatbubble-ellipses-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
