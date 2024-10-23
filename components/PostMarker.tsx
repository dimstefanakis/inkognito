import React from 'react';
import { Image } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { Button, YStack, XStack, Text } from 'tamagui';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Tables } from '@/types_db';

interface PostMarkerProps {
  post: Tables<"posts">;
  subscriptionStatus: string;
}

export function PostMarker({ post, subscriptionStatus }: PostMarkerProps) {
  const router = useRouter();

  return (
    <Marker
      coordinate={{ latitude: post.lat || 0, longitude: post.lng || 0 }}
    >
      <Button
        width={40}
        height={40}
        borderRadius={20}
        backgroundColor="$background"
        alignItems="center"
        justifyContent="center"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
        borderWidth={3}
        borderColor="white"
      >
        <Image
          source={require('../assets/images/confess_white.png')}
          style={{ width: 20, height: 20 }}
          resizeMode="contain"
        />
      </Button>
      <Callout
        tooltip
        onPress={(e) => {
          e.stopPropagation();
          if (subscriptionStatus === 'active') {
            router.push(`/posts/${post.lng}/${post.lat}`);
          } else {
            router.push('/subscribe');
          }
        }}
      >
        {subscriptionStatus === 'active' ? (
          <YStack
            backgroundColor="$background"
            borderRadius="$4"
            padding="$3"
            width={250}
          >
            <Text fontWeight="bold" marginBottom="$2">
              {post.content || ''}
            </Text>
            <XStack space="$2">
              <Text fontSize="$2">Views:</Text>
              <Text fontSize="$2">{post.views}</Text>
            </XStack>
          </YStack>
        ) : (
          <YStack
            backgroundColor="$background"
            borderRadius="$4"
            padding="$3"
            width={250}
            overflow="hidden"
          >
            <BlurView intensity={18} tint='dark' style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 2
            }}>
            </BlurView>

            <Text style={{ fontWeight: 'bold', zIndex: 0, marginBottom: 5, color: 'white' }}>
              {post.content || ''}
            </Text>
            <Text fontSize="$2" zIndex={3}>
              Get Premium to view this confession. Tap to subscribe.
            </Text>
          </YStack>
        )}
      </Callout>
    </Marker>
  );
}