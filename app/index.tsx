import { useEffect } from "react";
import { Redirect } from "expo-router";
import { MMKV } from "react-native-mmkv";
import { View, Text } from "@tamagui/core";
import { ConfessButton } from "@/components/ConfessButton";
import { Feed } from "@/components/Feed";
import { useIsFreshInstall } from "@/hooks/useIsFreshInstall";

function App() {
  const storage = new MMKV();
  const isFreshInstall = storage.getString("IS_FRESH_INSTALL");

  if (isFreshInstall === undefined) {
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
