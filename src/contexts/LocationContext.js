import React, { createContext, useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext();

export function useLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const value = {
    location,
    errorMsg
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
