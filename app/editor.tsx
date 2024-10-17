import React, { useState } from 'react';
import { Button, TextArea, YStack, Text, Theme } from 'tamagui';

export default function ConfessionEditor() {
  const [confession, setConfession] = useState('');

  const handleConfess = () => {
    // Here you would typically send the confession to a server or perform some action
    console.log('Confession submitted:', confession);
    // Clear the text area after confession
    setConfession('');
  };

  return (
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
      <Button
        onPress={handleConfess}
        disabled={!confession.trim()}
        themeInverse
      >
        Confess
      </Button>
    </YStack>
  );
}

