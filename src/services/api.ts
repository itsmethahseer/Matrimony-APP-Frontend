import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { mockApi, resetMockData, switchDemoUser } from './mockApi';

// OFFLINE_MODE: Default to true for standalone portable APK & offline demo presentation
// When true, all features use the full SQLite dummy dataset from seed.py in-memory & AsyncStorage.
export const OFFLINE_MODE = true;

export { resetMockData, switchDemoUser };

// Base URL detection for online backend mode
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  }
  
  // Extract host IP dynamically from Expo debugger/host URI when running in Expo Go / Dev Client
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:8000`;
    }
  }

  // Fallback local IP for physical devices / emulators on local Wi-Fi
  return 'http://192.168.0.74:8000';
};

export const API_URL = getBaseUrl();

// Retrieve token helper
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('user_token');
  } catch {
    return null;
  }
};

// Set token helper
export const setToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('user_token', token);
  } catch (error) {
    console.error('Error saving user token:', error);
  }
};

// Remove token helper
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('user_token');
  } catch (error) {
    console.error('Error removing user token:', error);
  }
};

type AuthEventListener = () => void;
const authListeners: Set<AuthEventListener> = new Set();

export const onUnauthorized = (listener: AuthEventListener) => {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
};

const notifyUnauthorized = () => {
  authListeners.forEach((fn) => fn());
};

// Core request wrapper with automatic offline fallback
async function apiRequest<T = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  data?: any,
  isForm: boolean = false
): Promise<T> {
  const token = await getToken();
  
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body: any = undefined;
  if (data) {
    if (isForm) {
      const formData = new URLSearchParams();
      for (const key in data) {
        formData.append(key, data[key]);
      }
      body = formData.toString();
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      body = jsonSafeStringify(data);
      headers['Content-Type'] = 'application/json';
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body,
  });

  if (response.status === 204) {
    return null as any;
  }

  const responseText = await response.text();
  let resBody: any = null;

  if (responseText && responseText.trim().length > 0) {
    try {
      resBody = JSON.parse(responseText);
    } catch (e) {
      console.warn(`Non-JSON response received for ${method} ${path}:`, responseText);
      if (!response.ok) {
        const cleanText = responseText.replace(/<[^>]*>?/gm, '').trim();
        throw new Error(`Server Error (${response.status}): ${cleanText.substring(0, 150)}`);
      }
      return responseText as any;
    }
  }

  if (!response.ok) {
    const isAuthPath = path.includes('/auth/login') || path.includes('/auth/register') || path.includes('/auth/google-auth') || path.includes('/auth/send-otp') || path.includes('/auth/verify-otp');
    if (response.status === 401 && !isAuthPath) {
      await removeToken();
      notifyUnauthorized();
    }
    let errorMsg = 'Network request failed';
    if (resBody) {
      if (typeof resBody.detail === 'string') {
        errorMsg = resBody.detail;
      } else if (Array.isArray(resBody.detail)) {
        errorMsg = resBody.detail.map((err: any) => err.msg || err.detail || JSON.stringify(err)).join(', ');
      } else if (resBody.message) {
        errorMsg = resBody.message;
      }
    }
    throw new Error(errorMsg);
  }

  return resBody;
}

// Safely stringify JSON to prevent circular references
function jsonSafeStringify(obj: any) {
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return '';
  }
}

// API Services object mapping all backend paths, routing through mockApi in offline mode
export const api = {
  // Auth
  register: (email: string, password: string) => {
    if (OFFLINE_MODE) return mockApi.register(email, password);
    return apiRequest('POST', '/api/auth/register', { email, password });
  },
    
  login: async (email: string, password?: string) => {
    if (OFFLINE_MODE) return mockApi.login(email, password);
    const data = await apiRequest<{ access_token: string }>('POST', '/api/auth/login', { username: email, password }, true);
    await setToken(data.access_token);
    return data;
  },
  
  getMe: () => {
    if (OFFLINE_MODE) return mockApi.getMe();
    return apiRequest('GET', '/api/auth/me');
  },
  
  verifyId: (documentUrl: string) => {
    if (OFFLINE_MODE) return mockApi.verifyId(documentUrl);
    return apiRequest('POST', '/api/auth/verify-id', { document_url: documentUrl });
  },

  uploadVerifyId: async (fileData: any) => {
    if (OFFLINE_MODE) return mockApi.uploadVerifyId(fileData);
    const token = await getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const formData = new FormData();
    formData.append('file', fileData);

    const response = await fetch(`${API_URL}/api/auth/verify-id/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const responseText = await response.text();
    let resBody: any = null;
    if (responseText && responseText.trim().length > 0) {
      try {
        resBody = JSON.parse(responseText);
      } catch (e) {
        if (!response.ok) {
          throw new Error(`Upload Failed (${response.status}): ${responseText.replace(/<[^>]*>?/gm, '').substring(0, 100)}`);
        }
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        await removeToken();
        notifyUnauthorized();
      }
      throw new Error(resBody?.detail || 'File upload failed');
    }
    return resBody;
  },

  // Profiles
  getMyProfile: () => {
    if (OFFLINE_MODE) return mockApi.getMyProfile();
    return apiRequest('GET', '/api/profiles/me');
  },
  
  updateMyProfile: (data: any) => {
    if (OFFLINE_MODE) return mockApi.updateMyProfile(data);
    return apiRequest('PUT', '/api/profiles/me', data);
  },
  
  getMatches: (category?: string) => {
    if (OFFLINE_MODE) return mockApi.getMatches(category);
    return apiRequest('GET', `/api/profiles/matches${category ? `?category=${category}` : ''}`);
  },
    
  searchProfiles: (params: Record<string, string | number | boolean>) => {
    if (OFFLINE_MODE) return mockApi.searchProfiles(params);
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        query.append(key, String(params[key]));
      }
    }
    return apiRequest('GET', `/api/profiles/search?${query.toString()}`);
  },
  
  getProfileById: (id: number) => {
    if (OFFLINE_MODE) return mockApi.getProfileById(id);
    return apiRequest('GET', `/api/profiles/${id}`);
  },
  
  getProfileByUserId: (userId: number) => {
    if (OFFLINE_MODE) return mockApi.getProfileByUserId(userId);
    return apiRequest('GET', `/api/profiles/user/${userId}`);
  },
  
  // Photos
  getPhotos: () => {
    if (OFFLINE_MODE) return mockApi.getPhotos();
    return apiRequest('GET', '/api/profiles/photos');
  },
  
  uploadPhoto: (url: string, isMain: boolean = false) => {
    if (OFFLINE_MODE) return mockApi.uploadPhoto(url, isMain);
    return apiRequest('POST', '/api/profiles/photos', { url, is_main: isMain });
  },
    
  setMainPhoto: (id: number) => {
    if (OFFLINE_MODE) return mockApi.setMainPhoto(id);
    return apiRequest('PUT', `/api/profiles/photos/${id}/set-main`);
  },

  deletePhoto: (id: number) => {
    if (OFFLINE_MODE) return mockApi.deletePhoto(id);
    return apiRequest('DELETE', `/api/profiles/photos/${id}`);
  },

  // Explore / Interactions
  sendInterest: (receiverId: number) => {
    if (OFFLINE_MODE) return mockApi.sendInterest(receiverId);
    return apiRequest('POST', '/api/explore/interests', { receiver_id: receiverId });
  },

  cancelInterest: (interestId: number) => {
    if (OFFLINE_MODE) return mockApi.cancelInterest(interestId);
    return apiRequest('DELETE', `/api/explore/interests/${interestId}`);
  },

  cancelInterestByUser: (receiverId: number) => {
    if (OFFLINE_MODE) return mockApi.cancelInterestByUser(receiverId);
    return apiRequest('DELETE', `/api/explore/interests/cancel-by-user/${receiverId}`);
  },

  getInterestStatus: (targetUserId: number) => {
    if (OFFLINE_MODE) return mockApi.getInterestStatus(targetUserId);
    if (!targetUserId || isNaN(Number(targetUserId)) || Number(targetUserId) <= 0) {
      return Promise.resolve({ sent: null, received: null });
    }
    return apiRequest<{ sent: { id: number; status: string; created_at: string } | null; received: { id: number; status: string; created_at: string } | null }>('GET', `/api/explore/interests/status/${targetUserId}`);
  },
    
  getReceivedInterests: () => {
    if (OFFLINE_MODE) return mockApi.getReceivedInterests();
    return apiRequest('GET', '/api/explore/interests/received');
  },
  
  getSentInterests: () => {
    if (OFFLINE_MODE) return mockApi.getSentInterests();
    return apiRequest('GET', '/api/explore/interests/sent');
  },
  
  respondToInterest: (interestId: number, status: 'Accepted' | 'Declined') => {
    if (OFFLINE_MODE) return mockApi.respondToInterest(interestId, status);
    return apiRequest('PUT', `/api/explore/interests/${interestId}`, { status });
  },
    
  getVisitors: () => {
    if (OFFLINE_MODE) return mockApi.getVisitors();
    return apiRequest('GET', '/api/explore/visits/my-visitors');
  },
  
  getVisitedByMe: () => {
    if (OFFLINE_MODE) return mockApi.getVisitedByMe();
    return apiRequest('GET', '/api/explore/visits/visited-by-me');
  },
  
  viewContact: (targetUserId: number) => {
    if (OFFLINE_MODE) return mockApi.viewContact(targetUserId);
    return apiRequest('POST', `/api/explore/contact-views/${targetUserId}`);
  },
    
  getViewedContacts: () => {
    if (OFFLINE_MODE) return mockApi.getViewedContacts();
    return apiRequest<any[]>('GET', '/api/explore/contact-views/viewed-by-me');
  },
    
  getFavourites: () => {
    if (OFFLINE_MODE) return mockApi.getFavourites();
    return apiRequest('GET', '/api/explore/favourites');
  },
  
  addFavourite: (favouritedId: number) => {
    if (OFFLINE_MODE) return mockApi.addFavourite(favouritedId);
    return apiRequest('POST', '/api/explore/favourites', { favourited_id: favouritedId });
  },
    
  removeFavourite: (targetUserId: number) => {
    if (OFFLINE_MODE) return mockApi.removeFavourite(targetUserId);
    return apiRequest('DELETE', `/api/explore/favourites/${targetUserId}`);
  },
    
  getNote: (profileId: number) => {
    if (OFFLINE_MODE) return mockApi.getNote(profileId);
    return apiRequest('GET', `/api/explore/notes/${profileId}`);
  },
  
  saveNote: (profileId: number, noteText: string) => {
    if (OFFLINE_MODE) return mockApi.saveNote(profileId, noteText);
    return apiRequest('POST', '/api/explore/notes', { profile_id: profileId, note_text: noteText });
  },
    
  blockUser: (blockedId: number) => {
    if (OFFLINE_MODE) return mockApi.blockUser(blockedId);
    return apiRequest('POST', '/api/explore/blocked', { blocked_id: blockedId });
  },
    
  passUser: (passedId: number) => {
    if (OFFLINE_MODE) return mockApi.passUser(passedId);
    return apiRequest('POST', '/api/explore/passed', { passed_id: passedId });
  },

  // Inbox / Messages
  sendMessage: (receiverId: number, text: string, type: 'chat' | 'request' = 'chat', duration?: number) => {
    if (OFFLINE_MODE) return mockApi.sendMessage(receiverId, text, type, duration);
    return apiRequest('POST', '/api/inbox/messages', { 
      receiver_id: receiverId, 
      message_text: text, 
      message_type: type,
      call_duration: duration 
    });
  },
    
  getConversations: () => {
    if (OFFLINE_MODE) return mockApi.getConversations();
    return apiRequest('GET', '/api/inbox/conversations');
  },
  
  getMessageHistory: (participantId: number) => {
    if (OFFLINE_MODE) return mockApi.getMessageHistory(participantId);
    return apiRequest('GET', `/api/inbox/conversations/${participantId}`);
  },
    
  getInboxMessages: (type: 'all' | 'chats' | 'requests', onlineNow: boolean = false) => {
    if (OFFLINE_MODE) return mockApi.getInboxMessages(type, onlineNow);
    return apiRequest('GET', `/api/inbox/${type}?online_now=${onlineNow}`);
  },

  // Menu / Membership
  getMenuSummary: () => {
    if (OFFLINE_MODE) return mockApi.getMenuSummary();
    return apiRequest('GET', '/api/menu/summary');
  },
  
  subscribePlan: (planType: string) => {
    if (OFFLINE_MODE) return mockApi.subscribePlan(planType);
    return apiRequest('POST', '/api/menu/subscribe', { plan_type: planType, payment_status: 'Success' });
  },
    
  renewPlan: () => {
    if (OFFLINE_MODE) return mockApi.renewPlan();
    return apiRequest('POST', '/api/menu/renew');
  },
  
  submitFeedback: (rating: number, comment: string) => {
    if (OFFLINE_MODE) return mockApi.submitFeedback(rating, comment);
    return apiRequest('POST', '/api/menu/feedback', { rating, comment });
  },
  
  getNotifications: () => {
    if (OFFLINE_MODE) return mockApi.getNotifications();
    return apiRequest('GET', '/api/menu/notifications');
  },
  
  getSupport: () => {
    if (OFFLINE_MODE) return mockApi.getSupport();
    return apiRequest('GET', '/api/menu/support');
  },
  
  getPaymentConfig: () => {
    if (OFFLINE_MODE) return mockApi.getPaymentConfig();
    return apiRequest<{ merchant_upi_id: string; merchant_name: string }>('GET', '/api/menu/payment-config');
  },

  // Admin Console
  getPendingVerifications: () => {
    if (OFFLINE_MODE) return mockApi.getPendingVerifications();
    return apiRequest<{ documents: any[]; photos: any[] }>('GET', '/api/admin/pending-verifications');
  },
  
  verifyUserDoc: (userId: number, action: 'approve' | 'reject') => {
    if (OFFLINE_MODE) return mockApi.verifyUserDoc(userId, action);
    return apiRequest('POST', `/api/admin/verify-id/${userId}`, { action });
  },
    
  verifyUserPhoto: (photoId: number, action: 'approve' | 'reject') => {
    if (OFFLINE_MODE) return mockApi.verifyUserPhoto(photoId, action);
    return apiRequest('POST', `/api/admin/verify-photo/${photoId}`, { action });
  },
    
  getAdminUsers: () => {
    if (OFFLINE_MODE) return mockApi.getAdminUsers();
    return apiRequest<any[]>('GET', '/api/admin/users');
  },

  // Google, Phone OTP, and Forgot Password
  googleAuth: async (email: string, google_id: string, name?: string, photo_url?: string) => {
    if (OFFLINE_MODE) return mockApi.googleAuth(email, google_id, name);
    const res = await apiRequest<{ access_token: string }>('POST', '/api/auth/google-auth', { email, google_id, name, photo_url });
    if (res.access_token) {
      await setToken(res.access_token);
    }
    return res;
  },

  sendOTP: (phone_number: string) => {
    if (OFFLINE_MODE) return mockApi.sendOTP(phone_number);
    return apiRequest<{ message: string; otp_debug?: string }>('POST', '/api/auth/send-otp', { phone_number });
  },

  verifyOTP: async (phone_number: string, otp_code: string) => {
    if (OFFLINE_MODE) return mockApi.verifyOTP(phone_number, otp_code);
    const res = await apiRequest<{ access_token: string }>('POST', '/api/auth/verify-otp', { phone_number, otp_code });
    if (res.access_token) {
      await setToken(res.access_token);
    }
    return res;
  },

  forgotPassword: (identifier: string, method: 'email' | 'whatsapp' = 'email') => {
    if (OFFLINE_MODE) return mockApi.forgotPassword(identifier, method);
    return apiRequest<{ message: string; reset_token?: string; reset_code_debug?: string }>('POST', '/api/auth/forgot-password', { identifier, method });
  },

  resetPassword: (identifier: string, reset_token: string, new_password: string) => {
    if (OFFLINE_MODE) return mockApi.resetPassword(identifier, reset_token, new_password);
    return apiRequest<{ message: string }>('POST', '/api/auth/reset-password', { identifier, reset_token, new_password });
  },
};
