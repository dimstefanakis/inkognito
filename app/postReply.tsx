import React, { useState, useEffect } from 'react';
import { Button, TextArea, YStack, Text, XStack, Spinner, useTheme } from 'tamagui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, Image, Pressable, Keyboard, ActivityIndicator } from 'react-native';
import { supabase } from '@/utils/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import type { Tables } from '@/types_db';

export default function PostReply() {
  const theme = useTheme();
  const [reply, setReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [post, setPost] = useState<Tables<"posts"> | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { postId } = useLocalSearchParams();
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }],
      opacity: successOpacity.value,
    };
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', postId)
          .single();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    successScale.value = withSpring(1, { damping: 10 });
    successOpacity.value = withTiming(1, { duration: 500 });
  };

  const handleReply = async () => {
    Keyboard.dismiss();
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('replies')
        .insert({
          post_id: postId,
          content: reply,
        })
        .single();

      if (error) throw error;

      setReply('');
      showSuccessAnimation();
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="$gray10" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, width: '100%' }}>
      <YStack space="$4" padding="$4">
        <Text fontSize="$6" fontWeight="bold">
          Reply to this confession
        </Text>
        <Text>{post?.content || ''}</Text>
        <TextArea
          value={reply}
          onChangeText={setReply}
          placeholder="Type your reply here..."
          minHeight={200}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <XStack space="$2">
          <Button
            onPress={handleReply}
            disabled={!reply.trim() || isSubmitting}
            themeInverse
            flex={1}
          >
            {isSubmitting ? <Spinner /> : 'Reply'}
          </Button>
        </XStack>
      </YStack>
      {showSuccess && (
        <Animated.View style={[styles.successOverlay, successAnimatedStyle]}>
          <Pressable onPress={() => router.back()} style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: theme.gray1.get() }}>
            <Image
              source={require('../assets/images/confess_white.png')}
              style={styles.successIcon}
            />
            <Text style={styles.successText}>Confession Submitted 🙏</Text>
            <Text style={{
              color: theme.gray12.get(),
              fontSize: 16,
              fontWeight: 'bold',
              marginTop: 10,
              position: 'absolute',
              bottom: 100,
            }}>Tap anywhere to go back</Text>
          </Pressable>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  successText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
});
