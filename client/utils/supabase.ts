import 'react-native-url-polyfill/auto'
import { Platform } from 'react-native'
import * as SecureStore from 'expo-secure-store'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;

// 1. Wrap the native SecureStore functions
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// 2. Switch based on the platform
const customStorage = Platform.OS === 'web' ? localStorage : ExpoSecureStoreAdapter;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: customStorage, // 3. Use the conditional storage here
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})