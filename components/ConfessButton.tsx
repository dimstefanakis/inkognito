import { Button, Image, YStack } from "tamagui";
import { useRouter } from "expo-router";

export const ConfessButton = () => {
  const router = useRouter();
  return (
    <YStack
      position="absolute"
      bottom="$8"
      alignSelf="center"
      zIndex={1}
    >
      <Button
        onPress={() => router.push('/editor')}
        size="$8"
        circular
        icon={<Image source={require('../assets/images/confess_white.png')} width={40} height={40} />}
        backgroundColor="$background"
        shadowColor="$shadowColor"
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.25}
        shadowRadius={3.84}
        elevation={5}
      />
    </YStack>
  );
};
