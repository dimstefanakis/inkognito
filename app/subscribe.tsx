import React from 'react';
import { View } from 'react-native';

import RevenueCatUI from 'react-native-purchases-ui';

export default function SubscribeScreen() {
  // Display current offering
  return (
    <View style={{ flex: 1 }}>
      <RevenueCatUI.Paywall />
    </View>
  );
}
