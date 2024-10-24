import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Dimensions } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { BlurView } from 'expo-blur';
import { View, Text, Button, YStack, XStack, Separator } from 'tamagui';
import { Eye, MapPinned, Clock, ThumbsUp } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import useUserLocationStore from '@/store/useUserLocationStore';
import { useSubscriptionStatusStore } from '@/store/useSubscriptionStatusStore';
import { supabase } from '@/utils/supabase';
import type { Tables } from '@/types_db';

const { height } = Dimensions.get('window');
interface PostProps {
  content: string;
  views: number;
  created_at: string;
  lat: number;
  lng: number;
  upvotes?: number;
  replies?: Tables<'posts'>[];
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

function Reply({ reply }: { reply: Tables<'replies'> }) {
  return (
    <YStack
      backgroundColor="$backgroundStrong"
      // padding="$3"
      borderRadius="$2"
      marginVertical="$2"
    >
      <Text color="$color" fontSize="$4" marginBottom="$2">
        {reply.content}
      </Text>
      <XStack justifyContent="space-between" alignItems="center">
        <XStack alignItems="center" space="$0.5">
          <Clock size={14} color="$gray10" />
          <Text color="$gray10" fontSize="$2" ml="$1">
            {getRelativeTime(reply.created_at)}
          </Text>
        </XStack>
        <XStack alignItems="center" space="$0.5">
          <ThumbsUp size={14} color="$gray10" />
          <Text color="$gray10" fontSize="$2" ml="$1">
            {reply.upvotes}
          </Text>
        </XStack>
      </XStack>
    </YStack>
  );
}

export function Post({ post, onPress, showReplies = false }: {
  post: Tables<'posts'>
  onPress?: () => void
  showReplies?: boolean
}) {
  const router = useRouter();
  const [replies, setReplies] = useState<Tables<'replies'>[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const { location } = useUserLocationStore();
  const { subscriptionStatus } = useSubscriptionStatusStore();

  useFocusEffect(
    useCallback(() => {
      if (showReplies) {
        const fetchReplies = async () => {
          setLoadingReplies(true);
          try {
            const { data, error } = await supabase
              .from('replies')
              .select('*')
              .eq('post_id', post.id);

            if (error) throw error;
            setReplies(data || []);
          } catch (error) {
            console.error('Error fetching replies:', error);
          } finally {
            setLoadingReplies(false);
          }
        };

        fetchReplies();
      }
    }, [showReplies, post.id])
  );

  const distance = location
    ? calculateDistance(location.coords.latitude, location.coords.longitude, post.lat || 0, post.lng || 0)
    : null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/map?lat=${post.lat}&lng=${post.lng}`);
    }
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <YStack
        backgroundColor="$backgroundStrong"
        padding="$4"
        borderRadius="$4"
        marginVertical="$2"
      >
        <Pressable onPress={handlePress}>
          <Text color="$color" fontSize="$5" marginBottom="$3">
            {post.content}
          </Text>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$4">
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
        </Pressable>
        {showReplies && (
          <>
            <Separator marginVertical="$4" />
            <Text color="$gray11" fontSize="$4" fontWeight="bold" marginTop="$3" marginBottom="$2">
              Replies
            </Text>
            {loadingReplies ? (
              <ActivityIndicator size="small" color="$gray10" />
            ) : replies.length > 0 ? (
              // subscriptionStatus !== 'active' ? (
              //   <View flex={1} position="relative" width="100%" minHeight={200} borderRadius={8} overflow='hidden'>
              //     <BlurView intensity={50} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 2, borderRadius: 8 }} />
              //     <Text position='absolute' zIndex={4} top={50} left={0} right={0} bottom={0} color="white" fontSize="$6" textAlign='center' fontWeight='bold'>
              //       Tap to unlock replies
              //     </Text>
              //     <View style={{ flex: 1, width: '100%', zIndex: 1, padding: 8 }}>
              //       <Replies replies={replies} />
              //     </View>
              //   </View>
              // ) : (
              //   <Replies replies={replies} />
              // )
              <Replies replies={replies} />
            ) : (
              <Text color="$gray10" fontSize="$3" ml="$1">
                No replies yet.
              </Text>
            )}
          </>
        )}
      </YStack>
    </ScrollView>
  );
}

function Replies({ replies }: { replies: Tables<'replies'>[] }) {
  return (
    <YStack space="$6">
      {replies
        .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
        .map((reply, index) => (
          <Reply key={index} reply={reply} />
        ))
      }
    </YStack>
  );
}
