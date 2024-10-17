import React, { useState } from 'react';
import { FlatList, RefreshControl } from 'react-native';
import { YStack, useTheme } from 'tamagui';
import { Post } from './Post';

interface PostData {
  id: string;
  content: string;
  views: number;
}

const dummyPosts: PostData[] = [
  {
    id: "1",
    content: "This is post 1",
    views: 100,
  },
];

export function Feed() {
  const [posts, setPosts] = useState<PostData[]>(dummyPosts);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const fetchPosts = async (refresh = false) => {
    // Simulating API call
    setLoading(true);
    const newPosts: PostData[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${refresh ? 'refresh' : 'append'}-${Date.now()}-${i}`,
      content: `This is post ${i + 1} ${refresh ? '(refreshed)' : ''}`,
      views: Math.floor(Math.random() * 1000),
    }));

    setTimeout(() => {
      if (refresh) {
        setPosts(newPosts);
      } else {
        setPosts((prevPosts) => [...prevPosts, ...newPosts]);
      }
      setLoading(false);
      setRefreshing(false);
    }, 1000);
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

  React.useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <YStack flex={1} w="100%" backgroundColor="$background">
      <FlatList
        data={posts}
        renderItem={({ item }) => <Post content={item.content} views={item.views} />}
        keyExtractor={(item) => item.id}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.color.get()}
          />
        }
      />
    </YStack>
  );
}

