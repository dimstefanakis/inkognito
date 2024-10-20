import React from 'react';
import { Button, XStack } from 'tamagui';

interface TimeFilterProps {
  onSelectTimeRange: (range: string) => void;
}

export function TimeFilter({ onSelectTimeRange }: TimeFilterProps) {
  return (
    <XStack space>
      <Button onPress={() => onSelectTimeRange('hour')}>Last Hour</Button>
      <Button onPress={() => onSelectTimeRange('day')}>Last Day</Button>
      <Button onPress={() => onSelectTimeRange('week')}>Last Week</Button>
      <Button onPress={() => onSelectTimeRange('all')}>All Time</Button>
    </XStack>
  );
}