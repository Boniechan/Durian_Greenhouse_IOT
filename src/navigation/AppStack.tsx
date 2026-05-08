import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Dashboard from '../screens/Dashboard';
import WeeklyRecords from '../screens/WeeklyRecords';
import WeeklyUpdate from '../screens/WeeklyUpdate';
import Settings from '../screens/Settings';
import WaterPumpRecords from '../screens/WaterPumpRecords';
import MistingRecords from '../screens/MistingRecords';
import FanRecords from '../screens/FanRecords';
import SensorAnalytics from '../screens/SensorAnalytics';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="WeeklyRecords" component={WeeklyRecords} />
      <Stack.Screen name="WeeklyUpdate" component={WeeklyUpdate} />
      <Stack.Screen name="Settings" component={Settings} />
      <Stack.Screen name="WaterPumpRecords" component={WaterPumpRecords} />
      <Stack.Screen name="MistingRecords" component={MistingRecords} />
      <Stack.Screen name="FanRecords" component={FanRecords} />
      <Stack.Screen name="SensorAnalytics" component={SensorAnalytics} />
    </Stack.Navigator>
  );
}
