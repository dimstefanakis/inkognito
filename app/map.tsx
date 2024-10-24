import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Dimensions, SafeAreaView, Image, Text as RNText, Pressable } from 'react-native';
import MapView, { Marker, Region, Callout } from 'react-native-maps';
import { useLocalSearchParams } from 'expo-router';
import { useTheme, View, Button, XStack, Adapt, Select, Sheet, YStack, Text } from 'tamagui';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { usePostsStore } from '@/store/usePostsStore';
import useUserLocationStore from '@/store/useUserLocationStore';
import { useSubscriptionStatusStore } from '@/store/useSubscriptionStatusStore';
import { BlurView } from 'expo-blur';
import { PostMarker } from '@/components/PostMarker';

import { TimeFilter } from '@/components/TimeFilter';
import type { Tables } from '@/types_db';

const { width, height } = Dimensions.get('window');

// Utility function to filter posts by time range
const filterPostsByTimeRange = (posts: Tables<"posts">[], timeRange: string): Tables<"posts">[] => {
  const now = new Date();

  switch (timeRange) {
    case 'day':
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      return posts.filter(post => new Date(post.created_at) >= oneDayAgo);
    case 'week':
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return posts.filter(post => new Date(post.created_at) >= oneWeekAgo);
    case 'month':
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return posts.filter(post => new Date(post.created_at) >= oneMonthAgo);
    case 'all':
    default:
      return posts;
  }
};

export default function MapScreen() {
  const { posts, fetchPostsByLocationRange } = usePostsStore();
  const [timeRange, setTimeRange] = useState<string>('all');
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const [localPosts, setLocalPosts] = useState<Tables<"posts">[]>(posts);
  const theme = useTheme();
  const router = useRouter();
  const { location } = useUserLocationStore();
  const { subscriptionStatus, customerInfo } = useSubscriptionStatusStore();
  const { lat, lng } = useLocalSearchParams();

  // Set the initial map region based on lat/lng params or user's location
  useEffect(() => {
    if (lat && lng) {
      setMapRegion({
        latitude: parseFloat(lat as string),
        longitude: parseFloat(lng as string),
        latitudeDelta: 0.01, // Zoom in more for specific location
        longitudeDelta: 0.01,
      });
      // Fetch posts for the specific location
      handleRegionChange({
        latitude: parseFloat(lat as string),
        longitude: parseFloat(lng as string),
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } else if (location) {
      setMapRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      });
    }
  }, [location, lat, lng]);

  // Fetch posts when the map region changes
  const handleRegionChange = async (region: Region) => {
    setMapRegion(region);
    try {
      const fetchedPosts = await fetchPostsByLocationRange(
        { latitude: region.latitude, longitude: region.longitude },
        Math.max(region.latitudeDelta, region.longitudeDelta) / 2,
        false
      );
      if (fetchedPosts) {
        setLocalPosts(fetchedPosts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  // Set initial local posts to the posts from the store
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Filter posts based on the map region and time range
  const visiblePosts = useMemo(() => {
    if (!mapRegion) return localPosts;
    const filteredByRegion = localPosts.filter(post => {
      if (!post.lat || !post.lng) return false;
      return (
        post.lat >= mapRegion.latitude - mapRegion.latitudeDelta / 2 &&
        post.lat <= mapRegion.latitude + mapRegion.latitudeDelta / 2 &&
        post.lng >= mapRegion.longitude - mapRegion.longitudeDelta / 2 &&
        post.lng <= mapRegion.longitude + mapRegion.longitudeDelta / 2
      );
    });
    return filterPostsByTimeRange(filteredByRegion, timeRange);
  }, [localPosts, mapRegion, timeRange]);

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        region={mapRegion || undefined}
        onRegionChangeComplete={handleRegionChange}
      >
        {visiblePosts.map((post) => (
          <PostMarker
            key={post.id}
            post={post}
            subscriptionStatus={subscriptionStatus}
          />
        ))}
      </MapView>
      <SafeAreaView style={styles.safeArea}>
        <XStack style={styles.topContainer}>
          <Button
            borderRadius={100}
            w={50}
            h={50}
            icon={
              <ChevronLeft size={24} color={theme.color.get()} />
            }
            onPress={() => {
              router.back()
            }}
          />

          {/* This causes app to be unresponsive */}
          {/* <Select value={timeRange} onValueChange={setTimeRange}>
            <Select.Trigger width={180} h={50} backgroundColor={theme.gray3.get()}>
              <Select.Value placeholder="Select time range" />
            </Select.Trigger>
            <Adapt when="sm" platform="touch">
              <Sheet
                native
                modal
                dismissOnSnapToBottom
              >
                <Sheet.Frame>
                  <Sheet.ScrollView>
                    <Adapt.Contents />
                  </Sheet.ScrollView>
                </Sheet.Frame>
                <Sheet.Overlay
                  animation="lazy"
                  enterStyle={{ opacity: 0 }}
                  exitStyle={{ opacity: 0 }}
                />
              </Sheet>
            </Adapt>
            <Select.Content zIndex={1000}>
              <Select.Viewport minWidth={200}>
                <Select.Group>
                  <Select.Label>Time Range</Select.Label>
                  <Select.Item value="all" index={0}>
                    <Select.ItemText>All Time</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="day" index={1}>
                    <Select.ItemText>Last 24 Hours</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="week" index={2}>
                    <Select.ItemText>Last 7 Days</Select.ItemText>
                  </Select.Item>
                  <Select.Item value="month" index={3}>
                    <Select.ItemText>Last 30 Days</Select.ItemText>
                  </Select.Item>
                </Select.Group>
              </Select.Viewport>
              <Select.ScrollDownButton />
            </Select.Content>
          </Select> */}
        </XStack>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
    zIndex: -1,
  },
  safeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  topContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 6,
    padding: 10,
    width: 150,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calloutDescription: {
    fontSize: 12,
  },
  blurView: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
