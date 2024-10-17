import { View, Text } from "@tamagui/core";
import { ConfessButton } from "@/components/ConfessButton";
import { Feed } from "@/components/Feed";

function App() {
  return (
    <View flex={1} justifyContent="center" alignItems="center">
      <Feed />
      <ConfessButton />
    </View>
  );
}

export default App;
