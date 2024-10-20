import { useEffect } from 'react';
import 'react-native-reanimated';
import { Platform } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { TamaguiProvider, View, createTamagui, useTheme } from '@tamagui/core'
import { PortalProvider } from '@tamagui/portal'
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { config } from '@tamagui/config/v3'
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase';
import { usePostsStore } from '@/store/usePostsStore';
import useUserLocationStore from '@/store/useUserLocationStore';
import { useOfferingsStore } from '@/store/useOfferingsStore';

const tamaguiConfig = createTamagui(config)

type Conf = typeof tamaguiConfig
declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends Conf { }
}

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  const { setPosts } = usePostsStore();
  const { getLastKnownLocation } = useUserLocationStore();
  const { initializePurchases } = useOfferingsStore();
  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setPosts(data);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    getLastKnownLocation();
  }, []);

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    initializePurchases();
  }, [])

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <PortalProvider shouldAddRootHost>
          <Stack screenOptions={{ headerShown: false }} />
        </PortalProvider>
      </ThemeProvider>
    </TamaguiProvider>
  );
}
