import React, { useState, useRef } from 'react';
import { Image, Dimensions, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { YStack, XStack, Button, Text, Card, Theme } from 'tamagui';
import Carousel from 'react-native-reanimated-carousel';

const steps = [
  {
    image: require('../assets/images/step1.jpg'),
    title: 'See confessions around you',
    buttonText: 'See secrets',
    fontSize: '$9',
  },
  {
    image: require('../assets/images/icon.png'),
    title: 'Confess your secrets anonymously',
    buttonText: 'Share a secret',
    fontSize: '$9',
  },
];

export default function Stepper() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const width = Dimensions.get('window').width;
  const height = Dimensions.get('window').height;
  const carouselRef = useRef(null);

  const renderItem = ({ item, index }: { item: typeof steps[0], index: number }) => (
    <YStack f={1} p="$4">
      <Card elevate size="$8" bordered height={height - 180} overflow="hidden">
        <Card.Header p="$0">
          <Image
            source={item.image || ''}
            style={{ width: '100%', backgroundColor: '$background', objectFit: 'cover', height: height * 0.4 }}
          />
        </Card.Header>
        <YStack flex={1} mt="$4" p="$4">
        <Text ta="center" flex={1} mt="$4" fow="bold" fontSize={item.fontSize}>
          {item.title}
        </Text>
        <Button
          size="$6"
          theme="active"
          onPress={() => handleButtonPress(index)}
        >
          {item.buttonText}
        </Button>
        </YStack>
      </Card>
    </YStack>
  );

  const handleButtonPress = async (index: number) => {
    if (index === 0) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      // Move to the next step after granting permission
      // @ts-ignore
      carouselRef.current?.next();
    } else {
      // Clear navigation history and navigate to '/'
      router.replace('/editor');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <YStack f={1} bg="$background" w="100%" h="100%" ai="center" jc="center">
        <Carousel
          ref={carouselRef}
          loop={false}
          width={width}
          height={height}
          data={steps}
          scrollAnimationDuration={1000}
          onSnapToItem={(index) => setCurrentStep(index)}
          renderItem={renderItem}
          enabled={false} // Disable swiping
        />
        <XStack mt="$4" space>
          {steps.map((_, index) => (
            <YStack
              key={index}
              w={10}
              h={10}
              br={5}
              bg={index === currentStep ? 'white' : '$gray5'}
            />
          ))}
        </XStack>
      </YStack>
    </SafeAreaView>
  );
}
