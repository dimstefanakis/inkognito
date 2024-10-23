import { useEffect, useState } from "react";
import { FlatList, SafeAreaView } from "react-native";
import { View } from "tamagui";
import { usePostsStore } from "@/store/usePostsStore";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Post } from "@/components/Post";
import type { Tables } from "@/types_db";

export default function PostScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<Tables<"posts">[]>([]);
  const { lng, lat } = useLocalSearchParams() as {
    lng: string;
    lat: string;
  };
  const { fetchPostsByLocationRange } = usePostsStore();

  useEffect(() => {
    const fetchPosts = async () => {
      // Changed the range to approximately 300m
      const posts = await fetchPostsByLocationRange(
        { longitude: parseFloat(lng), latitude: parseFloat(lat) },
        0.0003,
        false
      );
      if (posts) {
        setPosts(posts);
      }
    };
    fetchPosts();
  }, [lng, lat]);

  const renderItem = ({ item }: { item: Tables<"posts"> }) => (
    <Post post={item} />
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View flex={1}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8 }}
        />
      </View>
    </SafeAreaView>
  );
}
