import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, useTheme, Card, Text, Image, XStack } from 'tamagui';
import { Info } from '@tamagui/lucide-icons';
import { Post } from './Post';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import FeedMiniMap from '@/components/FeedMiniMap';
import { usePostsStore } from '@/store/usePostsStore';
import useUserLocationStore from '@/store/useUserLocationStore';
import type { Tables } from '@/types_db';
import { supabase } from '@/utils/supabase';

const PostWithViewIncrement = React.memo(({ item }: { item: Tables<"posts"> }) => {
  const router = useRouter();

  useEffect(() => {
    const incrementView = async () => {
      const { data, error } = await supabase.rpc('increment_view', { post_id: item.id });
    };
    incrementView();
  }, [item.id]);

  return <Post post={item} onPress={() => {
    router.push(`/posts/${item.id}`)
  }} />;
});

function renderMapPreview() {
  const theme = useTheme();
  const router = useRouter();

  function openSettings() {
    router.push('/settings');
  }

  function openMapScreen() {
    router.push('/map');
  }

  return (
    <YStack>
      <XStack justifyContent="flex-end" paddingRight="$4" paddingTop="$2" marginBottom="$4">
        <Pressable onPress={openSettings}>
          <Info size={24} color={theme.color.get()} />
        </Pressable>
      </XStack>
      <Card elevate size="$4" scale={0.9} onPress={openMapScreen} backgroundColor='$background' borderRadius={'$2'} overflow='hidden' hoverStyle={{ scale: 0.925 }} pressStyle={{ scale: 0.875 }} animation="bouncy">
        <Card.Header padded backgroundColor='$background'>
          <Text fontWeight="bold">Explore Nearby Confessions</Text>
        </Card.Header>
        <FeedMiniMap />
      </Card>
    </YStack>
  );
}

export function Feed() {
  const { posts } = usePostsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { location, getLastKnownLocation } = useUserLocationStore();
  const { fetchPostsByLocationRange } = usePostsStore();
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    getLastKnownLocation();
  }, []);

  const fetchPosts = async (refresh = false) => {
    setLoading(true);
    try {
      if (location) {
        const range = 0.09; // Approximately 10km in latitude/longitude
        await fetchPostsByLocationRange(
          { latitude: location.coords.latitude, longitude: location.coords.longitude },
          range
        );
      } else {
        console.error('Location not available');
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts(true);
  }

  useEffect(() => {
    fetchPosts();
  }, [location]);

  const handleLoadMore = () => {
    if (!loading) {
      fetchPosts();
    }
  };

  const openMapScreen = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/map');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get(), width: '100%' }}>
      <YStack flex={1} w="100%" backgroundColor="$background">
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostWithViewIncrement item={item} />}
          keyExtractor={(item) => item?.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.color.get()}
            />
          }
          ListHeaderComponent={renderMapPreview}
          showsVerticalScrollIndicator={false}
        />
      </YStack>
    </SafeAreaView>
  );
}
