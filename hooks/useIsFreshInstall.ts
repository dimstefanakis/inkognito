import { useState, useEffect } from 'react';
import { MMKV } from "react-native-mmkv";

const FRESH_INSTALL_KEY = 'IS_FRESH_INSTALL';
export const storage = new MMKV();

export function useIsFreshInstall() {
  const [isFreshInstall, setIsFreshInstall] = useState<boolean | null>(null);

  useEffect(() => {
    const checkFreshInstall = async () => {
      try {
        const value = storage.getString(FRESH_INSTALL_KEY);
        
        if (value === null) {
          // If the key doesn't exist, it's a fresh install
          setIsFreshInstall(true);
          // Set the flag to indicate it's no longer a fresh install
          storage.set(FRESH_INSTALL_KEY, 'false');
        } else {
          setIsFreshInstall(false);
        }
      } catch (error) {
        console.error('Error checking fresh install status:', error);
        // In case of error, assume it's not a fresh install
        setIsFreshInstall(false);
      }
    };

    checkFreshInstall();
  }, []);

  return isFreshInstall;
}
