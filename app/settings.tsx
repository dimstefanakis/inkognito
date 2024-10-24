import React from 'react';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native';
import { YStack, Text, View, Stack, useTheme } from 'tamagui';
import { ExternalLink } from '@/components/ExternalLink';
import { useRouter } from 'expo-router';

export default function Settings() {
  const router = useRouter();
  const theme = useTheme();

  const openSubscription = () => {
    router.push('/subscribe');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack
        f={1}
        bg="$background"
        p="$4"
        width="100%"
      >
        <Text fontSize="$6" fontWeight="bold" mb="$4" color="$color">Settings</Text>

        <Stack
          bg="$gray3"
          borderRadius="$4"
          overflow="hidden"
          width="100%"
        >
          <ExternalLink href="https://example.com/privacy-policy" style={{
            width: '100%',
            borderBottomWidth: 1,
            borderColor: theme.gray4.get(),
          }}>
            <View
              py="$3"
              px="$4"
              borderBottomWidth={1}
              borderColor="$gray4"
              width="100%"
              minWidth='100%'
            >
              <Text color="$color" fontSize="$4" fontWeight="600">Privacy Policy</Text>
            </View>
          </ExternalLink>

          <ExternalLink href="https://example.com/terms-of-use"
            style={{
              width: '100%', borderBottomWidth: 1,
              borderColor: theme.gray4.get(),
            }}>
            <View
              py="$3"
              px="$4"
              borderBottomWidth={1}
              borderColor="$gray4"
              width="100%"
              minWidth='100%'
            >
              <Text color="$color" fontSize="$4" fontWeight="600">Terms of Use</Text>
            </View>
          </ExternalLink>

          <Link href="/subscribe" style={{ width: '100%' }}>
            <View
              py="$3"
              px="$4"
              width="100%"
            >
              <Text color="$color" fontSize="$4" fontWeight="600">My Subscription</Text>
            </View>
          </Link>
        </Stack>
      </YStack>
    </SafeAreaView>
  );
}
