import React from "react";
import { SafeAreaView, StatusBar } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import AppStack from "./navigation/AppStack";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <NavigationContainer>
        <AppStack />
      </NavigationContainer>
    </SafeAreaView>
  );
}
