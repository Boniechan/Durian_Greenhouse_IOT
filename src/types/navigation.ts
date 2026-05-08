import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Dashboard: undefined;
  WeeklyRecords: undefined;
  WeeklyUpdate: undefined;
  Settings: undefined;
  WaterPumpRecords: undefined;
  MistingRecords: undefined;
  FanRecords: undefined;
  SensorAnalytics: undefined;
};

export type NavigationProp = NativeStackNavigationProp<RootStackParamList>;