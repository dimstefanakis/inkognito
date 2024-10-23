import React from 'react';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

export default function SubscribeScreen() {
  const router = useRouter();

  const handlePurchaseSuccess = () => {
    router.back();
  };

  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall
        onPurchaseCompleted={handlePurchaseSuccess}
      />
    </View>
  );
}
