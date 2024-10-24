import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupportedStorage } from "@supabase/supabase-js";
import { MMKV } from "react-native-mmkv";
const storage = new MMKV({ id: "supabase-storage" });

const mmkvStorageConfig = {
  setItem: (key: string, data: string) => storage.set(key, data),
  getItem: (key: string) => storage.getString(key) ?? null,
  removeItem: (key: string) => storage.delete(key),
} satisfies SupportedStorage;

const supabaseUrl = process.env.EXPO_PUBLIC_API_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_API_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: mmkvStorageConfig,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
