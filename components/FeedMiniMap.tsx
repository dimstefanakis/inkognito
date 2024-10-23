import React from "react";
import { View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { PostMarker } from "./PostMarker";
import { Text, YStack } from "tamagui";
import useUserLocationStore from "@/store/useUserLocationStore";
import { usePostsStore } from "@/store/usePostsStore";
import { useSubscriptionStatusStore } from "@/store/useSubscriptionStatusStore";

export default function FeedMiniMap() {
  const { location } = useUserLocationStore();
  const { subscriptionStatus } = useSubscriptionStatusStore();
  const { posts } = usePostsStore();

  const latDelta = 0.0922;
  const lngDelta = 0.0421;

  const visiblePosts = posts.filter(post => {
    if (!location) return false;
    if (!post.lat || !post.lng) return false;
    
    return (
      post.lat >= location.coords.latitude - latDelta / 2 &&
      post.lat <= location.coords.latitude + latDelta / 2 &&
      post.lng >= location.coords.longitude - lngDelta / 2 &&
      post.lng <= location.coords.longitude + lngDelta / 2
    );
  });

  // Calculate the range in km and round to the nearest 5
  const rangeInKm = Math.round(Math.sqrt(Math.pow(latDelta * 111, 2) + Math.pow(lngDelta * 111, 2)) / 5) * 5;

  return (
    location && (
      <YStack bg="$background">
        <MapView
          style={{ width: "100%", height: 150 }}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: latDelta,
            longitudeDelta: lngDelta,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          {visiblePosts.map((post) => (
            <PostMarker
              key={post.id}
              post={post}
              subscriptionStatus={subscriptionStatus}
            />
          ))}
        </MapView>
        <Text
          color="$textSecondary"
          fontSize="$3"
          fontWeight="500"
          paddingLeft="$3"
          paddingVertical="$4"
        >
          {visiblePosts.length} confessions around you
        </Text>
      </YStack>
    )
  );
}
