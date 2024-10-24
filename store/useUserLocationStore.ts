import { create } from "zustand";
import * as Location from "expo-location";
import { Platform } from "react-native";
import { MMKV } from "react-native-mmkv";

interface UserLocationState {
  location: Location.LocationObject | null;
  errorMsg: string | null;
  setErrorMsg: (errorMsg: string | null) => void;
  requestPermission: () => Promise<void>;
  updateLocation: () => Promise<void>;
  getLastKnownLocation: () => Promise<void>;
}

const useUserLocationStore = create<UserLocationState>((set) => {
  // Request permission immediately when the store is created
  (async () => {
    const storage = new MMKV();
    const isFreshinstall = storage.getString("IS_FRESH_INSTALL");
    // If the user has not completed the onboarding, don't request location permission
    if (isFreshinstall === undefined) {
      return;
    }
    const isAndroid = Platform.OS === "android";
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        set({ errorMsg: "Permission to access location was denied" });
      } else {
        // If permission is granted, try to get the initial location
        const location = await Location.getCurrentPositionAsync({
          accuracy: isAndroid
            ? Location.Accuracy.Low
            : Location.Accuracy.Lowest,
        });
        set({ location, errorMsg: null });
      }
    } catch (error) {
      set({ errorMsg: "Error requesting location permission" });
    }
  })();

  return {
    location: null,
    errorMsg: null,
    setErrorMsg: (errorMsg: string | null) => set({ errorMsg }),
    requestPermission: async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          set({ errorMsg: "Permission to access location was denied" });
        }
      } catch (error) {
        set({ errorMsg: "Error requesting location permission" });
      }
    },
    updateLocation: async () => {
      const isAndroid = Platform.OS === "android";
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: isAndroid
            ? Location.Accuracy.Low
            : Location.Accuracy.Lowest,
        });
        set({ location, errorMsg: null });
      } catch (error) {
        set({ errorMsg: "Error getting current location" });
      }
    },
    getLastKnownLocation: async () => {
      try {
        const location = await Location.getLastKnownPositionAsync();
        if (location) {
          set({ location, errorMsg: null });
        } else {
          set({ errorMsg: "No last known location available" });
        }
      } catch (error) {
        set({ errorMsg: "Error getting last known location" });
      }
    },
  };
});

export default useUserLocationStore;
