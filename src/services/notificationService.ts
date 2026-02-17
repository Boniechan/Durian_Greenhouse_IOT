import * as Notifications from 'expo-notifications';
import { ref, onValue } from 'firebase/database';
import { db } from './firebaseConfig';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const configureNotifications = async (intervalHours: number) => {
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    return false;
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const greenhouseRef = ref(db, 'greenhouse');
  
  onValue(greenhouseRef, (snapshot) => {
    const data = snapshot.val();
    checkAndNotify(data);
  });

  await scheduleRecurringNotification(intervalHours);

  return true;
};

const checkAndNotify = async (data: any) => {
  if (data.temperature > 35) {
    await sendNotification(
      'High Temperature Alert',
      `Temperature is ${data.temperature}°C. Please check your greenhouse.`
    );
  }

  if (data.humidity < 40) {
    await sendNotification(
      'Low Humidity Alert',
      `Humidity is ${data.humidity}%. Please check your greenhouse.`
    );
  }

  if (data.soilMoisture < 500) {
    await sendNotification(
      'Low Soil Moisture Alert',
      'Soil moisture is low. Plants may need watering.'
    );
  }
};

const sendNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, 
  });
};

const scheduleRecurringNotification = async (intervalHours: number) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Greenhouse Status Update',
      body: 'Checking your greenhouse conditions...',
    },
    trigger: {
      seconds: intervalHours * 60 * 60, 
      repeats: true,
    } as Notifications.TimeIntervalTriggerInput,
  });
};