import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WeeklyRecords from '../screens/WeeklyRecords';
import WeeklyUpdate from '../screens/WeeklyUpdate';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="WeeklyRecords" 
          component={WeeklyRecords}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="WeeklyUpdate" 
          component={WeeklyUpdate}
          options={{ 
            title: 'Add Weekly Update',
            headerTintColor: '#166534',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}