import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Base URL detection
// - Web development uses localhost:8000
// - Mobile development (Simulator, Expo Go, physical device) dynamically resolves host IP address
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
  return 'http://192.168.0.109:8000';
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


// Core request wrapper
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
    if (response.status === 401) {
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

// API Services object mapping all backend paths
export const api = {
  // Auth
  register: (email: string, password: string) => 
    apiRequest('POST', '/api/auth/register', { email, password }),
    
  login: async (email: string, password: string) => {
    // Login uses form urlencoded format in FastAPI (OAuth2 standard)
    const data = await apiRequest<{ access_token: string }>('POST', '/api/auth/login', { username: email, password }, true);
    await setToken(data.access_token);
    return data;
  },
  
  getMe: () => apiRequest('GET', '/api/auth/me'),
  
  verifyId: (documentUrl: string) => 
    apiRequest('POST', '/api/auth/verify-id', { document_url: documentUrl }),

  uploadVerifyId: async (fileData: any) => {
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
  getMyProfile: () => apiRequest('GET', '/api/profiles/me'),
  
  updateMyProfile: (data: any) => apiRequest('PUT', '/api/profiles/me', data),
  
  getMatches: (category?: string) => 
    apiRequest('GET', `/api/profiles/matches${category ? `?category=${category}` : ''}`),
    
  searchProfiles: (params: Record<string, string | number | boolean>) => {
    const query = new URLSearchParams();
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        query.append(key, String(params[key]));
      }
    }
    return apiRequest('GET', `/api/profiles/search?${query.toString()}`);
  },
  
  getProfileById: (id: number) => apiRequest('GET', `/api/profiles/${id}`),
  
  // Photos
  getPhotos: () => apiRequest('GET', '/api/profiles/photos'),
  
  uploadPhoto: (url: string, isMain: boolean = false) => 
    apiRequest('POST', '/api/profiles/photos', { url, is_main: isMain }),
    
  setMainPhoto: (id: number) => 
    apiRequest('PUT', `/api/profiles/photos/${id}/set-main`),

  deletePhoto: (id: number) => apiRequest('DELETE', `/api/profiles/photos/${id}`),

  // Explore / Interactions
  sendInterest: (receiverId: number) => 
    apiRequest('POST', '/api/explore/interests', { receiver_id: receiverId }),
    
  getReceivedInterests: () => apiRequest('GET', '/api/explore/interests/received'),
  
  getSentInterests: () => apiRequest('GET', '/api/explore/interests/sent'),
  
  respondToInterest: (interestId: number, status: 'Accepted' | 'Declined') => 
    apiRequest('PUT', `/api/explore/interests/${interestId}`, { status }),
    
  getVisitors: () => apiRequest('GET', '/api/explore/visits/my-visitors'),
  
  getVisitedByMe: () => apiRequest('GET', '/api/explore/visits/visited-by-me'),
  
  viewContact: (targetUserId: number) => 
    apiRequest('POST', `/api/explore/contact-views/${targetUserId}`),
    
  getViewedContacts: () => apiRequest<any[]>('GET', '/api/explore/contact-views/viewed-by-me'),
    
  getFavourites: () => apiRequest('GET', '/api/explore/favourites'),
  
  addFavourite: (favouritedId: number) => 
    apiRequest('POST', '/api/explore/favourites', { favourited_id: favouritedId }),
    
  removeFavourite: (targetUserId: number) => 
    apiRequest('DELETE', `/api/explore/favourites/${targetUserId}`),
    
  getNote: (profileId: number) => apiRequest('GET', `/api/explore/notes/${profileId}`),
  
  saveNote: (profileId: number, noteText: string) => 
    apiRequest('POST', '/api/explore/notes', { profile_id: profileId, note_text: noteText }),
    
  blockUser: (blockedId: number) => 
    apiRequest('POST', '/api/explore/blocked', { blocked_id: blockedId }),
    
  passUser: (passedId: number) => 
    apiRequest('POST', '/api/explore/passed', { passed_id: passedId }),

  // Inbox / Messages
  sendMessage: (receiverId: number, text: string, type: 'chat' | 'request' | 'call' = 'chat', duration?: number) => 
    apiRequest('POST', '/api/inbox/messages', { 
      receiver_id: receiverId, 
      message_text: text, 
      message_type: type,
      call_duration: duration 
    }),
    
  getConversations: () => apiRequest('GET', '/api/inbox/conversations'),
  
  getMessageHistory: (participantId: number) => 
    apiRequest('GET', `/api/inbox/conversations/${participantId}`),
    
  getInboxMessages: (type: 'all' | 'chats' | 'requests' | 'calls', onlineNow: boolean = false) => 
    apiRequest('GET', `/api/inbox/${type}?online_now=${onlineNow}`),

  // Menu / Membership
  getMenuSummary: () => apiRequest('GET', '/api/menu/summary'),
  
  subscribePlan: (planType: string) => 
    apiRequest('POST', '/api/menu/subscribe', { plan_type: planType, payment_status: 'Success' }),
    
  renewPlan: () => apiRequest('POST', '/api/menu/renew'),
  
  submitFeedback: (rating: number, comment: string) => 
    apiRequest('POST', '/api/menu/feedback', { rating, comment }),
    
  getNotifications: () => apiRequest('GET', '/api/menu/notifications'),
  
  getSupport: () => apiRequest('GET', '/api/menu/support'),
  
  getPaymentConfig: () => apiRequest<{ merchant_upi_id: string; merchant_name: string }>('GET', '/api/menu/payment-config'),

  // Admin Console
  getPendingVerifications: () => apiRequest<{ documents: any[]; photos: any[] }>('GET', '/api/admin/pending-verifications'),
  
  verifyUserDoc: (userId: number, action: 'approve' | 'reject') => 
    apiRequest('POST', `/api/admin/verify-id/${userId}`, { action }),
    
  verifyUserPhoto: (photoId: number, action: 'approve' | 'reject') => 
    apiRequest('POST', `/api/admin/verify-photo/${photoId}`, { action }),
    
  getAdminUsers: () => apiRequest<any[]>('GET', '/api/admin/users'),

  // Google, Phone OTP, and Forgot Password
  googleAuth: async (email: string, google_id: string, name?: string, photo_url?: string) => {
    const res = await apiRequest<{ access_token: string }>('POST', '/api/auth/google-auth', { email, google_id, name, photo_url });
    if (res.access_token) {
      await setToken(res.access_token);
    }
    return res;
  },

  sendOTP: (phone_number: string) => 
    apiRequest<{ message: string; otp_debug?: string }>('POST', '/api/auth/send-otp', { phone_number }),

  verifyOTP: async (phone_number: string, otp_code: string) => {
    const res = await apiRequest<{ access_token: string }>('POST', '/api/auth/verify-otp', { phone_number, otp_code });
    if (res.access_token) {
      await setToken(res.access_token);
    }
    return res;
  },

  forgotPassword: (identifier: string, method: 'email' | 'whatsapp' = 'email') =>
    apiRequest<{ message: string; reset_token?: string; reset_code_debug?: string }>('POST', '/api/auth/forgot-password', { identifier, method }),

  resetPassword: (identifier: string, reset_token: string, new_password: string) =>
    apiRequest<{ message: string }>('POST', '/api/auth/reset-password', { identifier, reset_token, new_password }),
};
