import React, { useState, useEffect } from 'react';
import { Button, TextArea, YStack, Text, Theme, XStack, Spinner, useTheme } from 'tamagui';
import { Platform, StyleSheet, Dimensions, Image, Pressable, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { openSettings } from 'expo-linking';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import { supabase } from '@/utils/supabase';
import { Tables } from '@/types_db';
import useUserLocationStore from '@/store/useUserLocationStore';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { router } from 'expo-router';

export default function ConfessionEditor() {
  const theme = useTheme();
  const [confession, setConfession] = useState('');
  const { location, updateLocation, errorMsg, setErrorMsg } = useUserLocationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: successScale.value }],
      opacity: successOpacity.value,
    };
  });

  const checkLocationPermission = async (): Promise<boolean> => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Location permission is required to confess');
      return false;
    }
    return true;
  };

  useEffect(() => {
    checkLocationPermission().then((granted) => {
      if (granted) {
        updateLocation();
      }
    });
  }, []);

  const openLocationSettings = () => {
    if (Platform.OS === 'ios') {
      openSettings();
    } else {
      IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.LOCATION_SOURCE_SETTINGS);
    }
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    successScale.value = withSpring(1, { damping: 10 });
    successOpacity.value = withTiming(1, { duration: 500 });
  };

  const handleConfess = async () => {
    Keyboard.dismiss();  // Add this line to dismiss the keyboard
    if (location) {
      setIsSubmitting(true);
      try {
        // Function to add a random offset to coordinates (approx. 300m)
        const addRandomOffset = (coord: number) => {
          const offsetDegrees = (Math.random() - 0.5) * 0.005; // ~300m at equator
          return coord + offsetDegrees;
        };

        // Apply random offset to latitude and longitude
        const randomizedLat = addRandomOffset(location.coords.latitude);
        const randomizedLng = addRandomOffset(location.coords.longitude);

        const { data, error } = await supabase
          .from('posts')
          .insert({
            content: confession,
            lat: randomizedLat,
            lng: randomizedLng,
          })
          .single();

        if (error) throw error;

        setConfession('');
        showSuccessAnimation();
      } catch (error) {
        console.error('Error submitting confession:', error);
        // Handle error (e.g., show an error message to the user)
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Handle case when location is not available
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, width: '100%' }}>
      <YStack space="$4" padding="$4">
        <Text fontSize="$6" fontWeight="bold">
          Confession Box
        </Text>
        <TextArea
          value={confession}
          onChangeText={setConfession}
          placeholder="Type your confession here..."
          minHeight={200}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <XStack space="$2">
          <Button
            onPress={handleConfess}
            disabled={!confession.trim() || !location || isSubmitting}
            themeInverse
            flex={1}
          >
            {isSubmitting ? <Spinner /> : 'Confess'}
          </Button>
          {!location && (
            <Button onPress={openLocationSettings} theme="alt2" flex={1}>
              Enable Location
            </Button>
          )}
        </XStack>
        {errorMsg && <Text color="$red10">{errorMsg}</Text>}
      </YStack>
      {showSuccess && (
        <Animated.View style={[styles.successOverlay, successAnimatedStyle]}>
          <Pressable onPress={() => router.replace('/')} style={{ alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: theme.gray1.get() }}>
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
