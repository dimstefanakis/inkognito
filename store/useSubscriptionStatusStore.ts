import { create } from 'zustand';
import Purchases, { CustomerInfo } from 'react-native-purchases';

export const useSubscriptionStatusStore = create<{
  customerInfo: CustomerInfo | null;
  setCustomerInfo: (customerInfo: CustomerInfo | null) => void;
  subscriptionStatus: 'active' | 'inactive';
  setSubscriptionStatus: (status: 'active' | 'inactive') => void;
}>((set) => ({
  customerInfo: null,
  subscriptionStatus: 'inactive',
  setSubscriptionStatus: (status) => set({ subscriptionStatus: status }),
  setCustomerInfo: (customerInfo) => set({ customerInfo }),
}));
