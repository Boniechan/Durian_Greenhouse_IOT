import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import AppStack from "./navigation/AppStack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { configureNotifications } from './services/notificationService';

export default function App() {
  React.useEffect(() => {
    // Initialize planting date on first app launch
    const initializePlantingDate = async () => {
      try {
        const existingDate = await AsyncStorage.getItem('plantingDate');
        if (!existingDate) {
          // Set today as the planting date on first launch
          const today = new Date();
          await AsyncStorage.setItem('plantingDate', today.toISOString());
          console.log('✅ Planting date initialized to today:', today.toLocaleDateString());
        }
      } catch (error) {
        console.error('Error initializing planting date:', error);
      }
    };

    // Initialize notifications
    const initializeNotifications = async () => {
      try {
        const success = await configureNotifications(24); // Check every 24 hours for periodic updates
        if (success) {
          console.log('✅ Notifications configured successfully');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializePlantingDate();
    initializeNotifications();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    </SafeAreaView>
  );
}
