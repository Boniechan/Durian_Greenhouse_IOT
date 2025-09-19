import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import Dashboard from '../screens/Dashboard';
import WeeklyRecords from '../screens/WeeklyRecords';
import WeeklyUpdate from '../screens/WeeklyUpdate';
import Settings from '../screens/Settings';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" component={Dashboard} />
      <Stack.Screen name="WeeklyRecords" component={WeeklyRecords} />
      <Stack.Screen name="WeeklyUpdate" component={WeeklyUpdate} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
}