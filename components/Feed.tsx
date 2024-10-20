import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { YStack, useTheme, Card, Text, Image } from 'tamagui';
import { Post } from './Post';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { usePostsStore } from '@/store/usePostsStore';
import useUserLocationStore from '@/store/useUserLocationStore';
import type { Tables } from '@/types_db';
import { supabase } from '@/utils/supabase';

export function Feed() {
  const { posts } = usePostsStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { location, getLastKnownLocation } = useUserLocationStore();
  const { setPosts } = usePostsStore();
  const theme = useTheme();
  const router = useRouter();

  useEffect(() => {
    getLastKnownLocation();
  }, []);

  const fetchPosts = async (refresh = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setPosts(data);
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
  };

  const handleLoadMore = () => {
    if (!loading) {
      fetchPosts();
    }
  };

  const openMapScreen = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/map');
  };

  const renderMapPreview = () => (
    <Card elevate size="$4" scale={0.9} onPress={openMapScreen} backgroundColor='$background' borderRadius={'$2'} overflow='hidden' hoverStyle={{ scale: 0.925 }} pressStyle={{ scale: 0.875 }} animation="bouncy">
      <Card.Header padded backgroundColor='$background'>
        <Text fontWeight="bold">Explore Nearby Confessions</Text>
      </Card.Header>
      {location && (
        <MapView
          // provider={PROVIDER_GOOGLE}
          style={{ width: '100%', height: 150, }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
        </MapView>
      )}
    </Card>
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background.get(), width: '100%' }}>
      <YStack flex={1} w="100%" backgroundColor="$background">
        <FlatList
          data={posts}
          renderItem={({ item }) => <Post content={item?.content || ''} views={item?.views || 0} />}
          keyExtractor={(item) => item?.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.color.get()}
            />
          }
          ListHeaderComponent={renderMapPreview}
        />
      </YStack>
    </SafeAreaView>
  );
}
