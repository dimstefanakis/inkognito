import { create } from 'zustand';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, PurchasesPackage, CustomerInfo } from 'react-native-purchases';

// Use your RevenueCat API keys
const APIKeys = {
  apple: process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY as string,
  google: process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY as string,
};

interface UserState {
  cookies: number;
  items: string[];
  pro: boolean;
}

interface OfferingsStore {
  user: UserState;
  packages: PurchasesPackage[];
  purchasePackage: (pack: PurchasesPackage) => Promise<void>;
  restorePermissions: () => Promise<CustomerInfo>;
  initializePurchases: () => Promise<void>;
  setPackages: (packages: PurchasesPackage[]) => void;
}

export const useOfferingsStore = create<OfferingsStore>((set, get) => ({
  user: {
    cookies: 0,
    items: [],
    pro: false,
  },
  packages: [],

  purchasePackage: async (pack: PurchasesPackage) => {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pack);
      set((state) => ({
        user: {
          ...state.user,
          pro: customerInfo.entitlements.active['pro'] !== undefined,
        },
      }));
    } catch (error) {
      console.error('Error purchasing package:', error);
    }
  },

  restorePermissions: async () => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      set((state) => ({
        user: {
          ...state.user,
          pro: customerInfo.entitlements.active['pro'] !== undefined,
        },
      }));
      return customerInfo;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  },

  initializePurchases: async () => {
    Purchases.setLogLevel(LOG_LEVEL.DEBUG);

    if (Platform.OS === 'ios') {
      await Purchases.configure({ apiKey: APIKeys.apple });
    } else if (Platform.OS === 'android') {
      await Purchases.configure({ apiKey: APIKeys.google });
    }

    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
        set({ packages: offerings.current.availablePackages });
      }
    } catch (error) {
      console.error('Error fetching offerings:', error);
    }
  },

  setPackages: (packages: PurchasesPackage[]) => set({ packages }),
}));

