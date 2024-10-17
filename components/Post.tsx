import React from 'react';
import { View, Text, Button, YStack, XStack } from 'tamagui';
import { Eye, MapPinned } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';

interface PostProps {
  content: string;
  views: number;
}

export function Post({ content, views }: PostProps) {
  const router = useRouter();

  const handleMapRedirect = () => {
    // router.push('/map');
  };

  return (
    <YStack
      backgroundColor="$backgroundStrong"
      padding="$4"
      borderRadius="$4"
      marginVertical="$2"
    >
      <Text color="$color" fontSize="$5" marginBottom="$3">
        {content}
      </Text>
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" space="$2">
          <Eye size="$1" color="$color" />
          <Text color="$color" fontSize="$3">
            {views} views
          </Text>
        </XStack>
        {/* <Button
          icon={MapPinned}
          size="$3"
          variant="outlined"
          onPress={handleMapRedirect}
        >
          View on Map
        </Button> */}
      </XStack>
    </YStack>
  );
}

