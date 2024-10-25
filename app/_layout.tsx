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
import { MMKV } from 'react-native-mmkv';
import { config } from '@tamagui/config/v3'
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/utils/supabase';
import { usePostsStore } from '@/store/usePostsStore';
import useUserLocationStore from '@/store/useUserLocationStore';
import { useOfferingsStore } from '@/store/useOfferingsStore';
import { useSubscriptionStatusStore } from '@/store/useSubscriptionStatusStore';
import { useIsFreshInstall } from '@/hooks/useIsFreshInstall';
import { Redirect } from 'expo-router';

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
  const { setCustomerInfo, customerInfo, subscriptionStatus, setSubscriptionStatus } = useSubscriptionStatusStore();
  const storage = new MMKV();
  const isFreshinstall = storage.getString('IS_FRESH_INSTALL');

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
    if (isFreshinstall === 'false') {
      getLastKnownLocation();
    }
  }, [isFreshinstall]);

  useEffect(() => {
    Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

    initializePurchases();
  }, [])

  useEffect(() => {
    Purchases.getCustomerInfo().then(setCustomerInfo);

    Purchases.addCustomerInfoUpdateListener((info) => {
      setCustomerInfo(info);
    });
  }, []);

  useEffect(() => {
    if (customerInfo) {
      setSubscriptionStatus(customerInfo.entitlements.active['Premium'] !== undefined ? 'active' : 'inactive');
    }
  }, [customerInfo]);

  if (!loaded) {
    return null;
  }

  // if (isFreshInstall) {
  //   return <Redirect href="/stepper" />;
  // }

  return (
    <TamaguiProvider config={tamaguiConfig}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />

        {/* <PortalProvider shouldAddRootHost>
        </PortalProvider> */}
      </ThemeProvider>
    </TamaguiProvider>
  );
}
