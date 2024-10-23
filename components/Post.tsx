import React from 'react';
import { Pressable } from 'react-native';
import { View, Text, Button, YStack, XStack } from 'tamagui';
import { Eye, MapPinned, Clock } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import useUserLocationStore from '@/store/useUserLocationStore';
import { useSubscriptionStatusStore } from '@/store/useSubscriptionStatusStore';
import type { Tables } from '@/types_db';

interface PostProps {
  content: string;
  views: number;
  created_at: string;
  lat: number;
  lng: number;
}

// Helper function to calculate relative time
function getRelativeTime(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

// Helper function to calculate distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Helper function to format distance
function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m away`;
  }
  return `${distance.toFixed(1)}km away`;
}

export function Post({ post }: {
  post: Tables<'posts'>
}) {
  const router = useRouter();
  const { location } = useUserLocationStore();
  const { subscriptionStatus } = useSubscriptionStatusStore();

  const distance = location
    ? calculateDistance(location.coords.latitude, location.coords.longitude, post.lat || 0, post.lng || 0)
    : null;

  const handlePress = () => {
    if (subscriptionStatus === 'active') {
      router.push(`/map?lat=${post.lat}&lng=${post.lng}`);
    } else {
      router.push(`/subscribe`);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <YStack
        backgroundColor="$backgroundStrong"
        padding="$4"
        borderRadius="$4"
        marginVertical="$2"
      >
        <Text color="$color" fontSize="$5" marginBottom="$3">
          {post.content}
        </Text>
        <XStack justifyContent="space-between" alignItems="center">
          <XStack alignItems="center" space="$0.5">
            <Clock size={16} color="$gray10" />
            <Text color="$gray10" fontSize="$3" ml="$1">
              {getRelativeTime(post.created_at)}
            </Text>
          </XStack>
          <XStack alignItems="center" space="$0.5">
            <MapPinned size={16} color="$gray10" />
            <Text color="$gray10" fontSize="$3" ml="$1">
              {distance ? formatDistance(distance) : 'Unknown'}
            </Text>
          </XStack>
        </XStack>
      </YStack>
    </Pressable>
  );
}
