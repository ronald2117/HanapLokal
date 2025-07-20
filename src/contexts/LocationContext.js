import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext();

export function useLocation() {
  return useContext(LocationContext);
}

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = async () => {
    setIsLoading(true);
    console.log('🔍 LocationContext: Requesting high-accuracy GPS location...');
    
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        console.log('LocationContext: Permission denied');
        return false;
      }

      // Use high-accuracy GPS for precise location detection
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation, // Highest accuracy for precise distance calculations
        timeout: 15000, // Increased timeout for better accuracy
        maximumAge: 0, // Don't use cached location
      });

      console.log('📍 LocationContext: GPS location detected:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      // Store in simplified format for easier access
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      setErrorMsg(null);
      return true;

    } catch (error) {
      console.error('LocationContext: Error getting GPS location:', error);
      setErrorMsg('Could not get precise location');
      
      // Fallback to lower accuracy if high accuracy fails
      try {
        console.log('🔄 LocationContext: Trying fallback location...');
        let fallbackLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 10000,
        });
        
        setLocation({
          latitude: fallbackLocation.coords.latitude,
          longitude: fallbackLocation.coords.longitude,
          accuracy: fallbackLocation.coords.accuracy
        });
        
        console.log('📍 LocationContext: Fallback location detected');
        setErrorMsg('Using fallback location (lower accuracy)');
        return true;
      } catch (fallbackError) {
        console.error('LocationContext: Fallback location also failed:', fallbackError);
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const value = useMemo(() => ({
    location,
    errorMsg,
    isLoading,
    refreshLocation: getCurrentLocation
  }), [location, errorMsg, isLoading]);

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
