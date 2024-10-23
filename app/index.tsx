import { useEffect } from "react";
import { Redirect } from "expo-router";
import { View, Text } from "@tamagui/core";
import { ConfessButton } from "@/components/ConfessButton";
import { Feed } from "@/components/Feed";
import { useIsFreshInstall } from "@/hooks/useIsFreshInstall";

function App() {
  const isFreshInstall = useIsFreshInstall();

  if (isFreshInstall === true) {
    return <Redirect href="/stepper" />;
  }

  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <Feed />
      <ConfessButton />
    </View>
  );
}

export default App;
