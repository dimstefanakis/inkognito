import React, { useState, useEffect } from 'react';
import { Button, TextArea, YStack, Text, Theme, XStack, Spinner } from 'tamagui';
import { Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {openSettings} from 'expo-linking';
import * as Location from 'expo-location';
import * as IntentLauncher from 'expo-intent-launcher';
import { supabase } from '@/utils/supabase';
import { Tables } from '@/types_db';
import useUserLocationStore from '@/store/useUserLocationStore';

export default function ConfessionEditor() {
  const [confession, setConfession] = useState('');
  const { location, updateLocation, errorMsg, setErrorMsg } = useUserLocationStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      console.log('Location permission granted:', granted);
      if (granted) {
        console.log('Getting location...');
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

  const handleConfess = async () => {
    if (location) {
      setIsSubmitting(true);
      try {
        const { data, error } = await supabase
          .from('posts')
          .insert({
            content: confession,
            lat: location.coords.latitude,
            lng: location.coords.longitude,
          })
          .single();

        if (error) throw error;

        console.log('Confession submitted:', data);
        setConfession('');
        // You might want to show a success message to the user here
      } catch (error) {
        console.error('Error submitting confession:', error);
        // Handle error (e.g., show an error message to the user)
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.log('Location not available');
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
    </SafeAreaView>
  );
}
