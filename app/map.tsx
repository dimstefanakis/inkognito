import React, { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useTheme, View, Button, XStack, Adapt, Select, Sheet } from 'tamagui';
import { ChevronLeft } from '@tamagui/lucide-icons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { usePostsStore } from '@/store/usePostsStore';

import { TimeFilter } from '@/components/TimeFilter';
import type { Tables } from '@/types_db';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const { posts } = usePostsStore();
  const [timeRange, setTimeRange] = useState<string>('all');
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region | null>(null);
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    // Fetch user's location
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const visiblePosts = posts.filter(post => {
    if (!mapRegion) return true;
    if (!post.lat || !post.lng) return false;
    return (
      post.lat >= mapRegion.latitude - mapRegion.latitudeDelta / 2 &&
      post.lat <= mapRegion.latitude + mapRegion.latitudeDelta / 2 &&
      post.lng >= mapRegion.longitude - mapRegion.longitudeDelta / 2 &&
      post.lng <= mapRegion.longitude + mapRegion.longitudeDelta / 2
    );
  });

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={userLocation ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        } : undefined}
        onRegionChangeComplete={setMapRegion}
      >
        {visiblePosts.map((post) => (
          <Marker
            key={post.id}
            coordinate={{ latitude: post.lat || 0, longitude: post.lng || 0 }}
            title={post.content || ''}
            description={`Views: ${post.views}`}
            onPress={() => router.push('/subscribe')}
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
            onPress={() => router.back()}
          />
          <Select value={timeRange} onValueChange={setTimeRange}>
            <Select.Trigger width={180} h={50} backgroundColor={theme.gray3.get()}>
              <Select.Value placeholder="Select time range" />
            </Select.Trigger>
            <Adapt when="sm" platform="touch">
              {/* or <Select.Sheet> */}
              <Sheet
                native
                modal
                dismissOnSnapToBottom
                // animationConfig={{
                //   type: 'spring',
                //   damping: 20,
                //   mass: 1.2,
                //   stiffness: 250,
                // }}
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
              {/* <Select.ScrollUpButton /> */}
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
          </Select>
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
});
