import React, { useEffect, useState } from 'react';
import { View, Button, Text } from 'tamagui';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostsStore } from '@/store/usePostsStore';
import { useSubscriptionStatusStore } from '@/store/useSubscriptionStatusStore';
import { Post } from '@/components/Post';
import type { Tables } from '@/types_db';
import { StyleSheet } from 'react-native';

export default function PostDetail() {
  const { id } = useLocalSearchParams() as { id: string };
  const { fetchPostById } = usePostsStore();
  const [post, setPost] = useState<Tables<"posts"> | null>(null);
  const router = useRouter();
  const { subscriptionStatus } = useSubscriptionStatusStore();
  useEffect(() => {
    const loadPost = async () => {
      const fetchedPost = await fetchPostById(id);
      if (fetchedPost) {
        setPost(fetchedPost);
      }
    };
    loadPost();
  }, [id]);

  const handleReply = () => {
    router.push(`/postReply?postId=${id}`);
  };

  if (!post) {
    return (
      <SafeAreaView style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="$gray10" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, width: '100%' }}>
      <Post post={post} showReplies />
      {/* {subscriptionStatus === 'active' && ( */}
        <Button onPress={handleReply} style={styles.replyButton}>Reply</Button>
      {/* )} */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  replyButton: {
    position: 'absolute',
    bottom: 80,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
  },
});
