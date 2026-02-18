import * as Notifications from 'expo-notifications';
import { ref, onValue } from 'firebase/database';
import { db } from './firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface GreenhouseStatus {
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  waterPump?: boolean;
  fan?: boolean;
  misting?: boolean;
  updatedAt?: number;
}

interface PreviousStatus {
  waterPump?: boolean;
  fan?: boolean;
  misting?: boolean;
}

// Sensor thresholds for optimal/needs attention
const THRESHOLDS = {
  TEMPERATURE_MAX: 35,
  HUMIDITY_MIN: 40,
  SOIL_MOISTURE_MIN: 500,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Evaluates sensor data and returns status
 */
const evaluateSensorStatus = (data: GreenhouseStatus) => {
  const status = {
    temperature: data.temperature && data.temperature > THRESHOLDS.TEMPERATURE_MAX ? 'Needs Attention ⚠️' : 'Optimal ✓',
    humidity: data.humidity && data.humidity < THRESHOLDS.HUMIDITY_MIN ? 'Needs Attention ⚠️' : 'Optimal ✓',
    soilMoisture: data.soilMoisture && data.soilMoisture < THRESHOLDS.SOIL_MOISTURE_MIN ? 'Dry (Needs Attention) ⚠️' : 'Optimal ✓',
  };
  return status;
};

/**
 * Checks for device state changes and major alerts
 */
const checkAndNotify = async (data: GreenhouseStatus) => {
  try {
    // Get previous status for change detection
    const previousStatusStr = await AsyncStorage.getItem('previousGreenhouseStatus');
    const previousStatus: PreviousStatus = previousStatusStr ? JSON.parse(previousStatusStr) : {};

    // Track device state changes
    const deviceChanges: string[] = [];

    if (data.waterPump !== undefined && previousStatus.waterPump !== undefined) {
      if (data.waterPump && !previousStatus.waterPump) {
        deviceChanges.push('💧 Water Pump turned ON');
      } else if (!data.waterPump && previousStatus.waterPump) {
        deviceChanges.push('💧 Water Pump turned OFF');
      }
    }

    if (data.fan !== undefined && previousStatus.fan !== undefined) {
      if (data.fan && !previousStatus.fan) {
        deviceChanges.push('🌀 Fan turned ON');
      } else if (!data.fan && previousStatus.fan) {
        deviceChanges.push('🌀 Fan turned OFF');
      }
    }

    if (data.misting !== undefined && previousStatus.misting !== undefined) {
      if (data.misting && !previousStatus.misting) {
        deviceChanges.push('💨 Misting System turned ON');
      } else if (!data.misting && previousStatus.misting) {
        deviceChanges.push('💨 Misting System turned OFF');
      }
    }

    // Send notification for device changes
    if (deviceChanges.length > 0) {
      await sendNotification(
        '🔧 Device Status Changed',
        deviceChanges.join('\n')
      );
    }

    // Evaluate sensor status and send alerts for critical conditions
    const sensorStatus = evaluateSensorStatus(data);

    if (data.temperature && data.temperature > THRESHOLDS.TEMPERATURE_MAX) {
      await sendNotification(
        '🌡️ High Temperature Alert',
        `Temperature is ${data.temperature}°C (${sensorStatus.temperature}). Please check your greenhouse.`
      );
    }

    if (data.humidity && data.humidity < THRESHOLDS.HUMIDITY_MIN) {
      await sendNotification(
        '💧 Low Humidity Alert',
        `Humidity is ${data.humidity}% (${sensorStatus.humidity}). Please check your greenhouse.`
      );
    }

    if (data.soilMoisture && data.soilMoisture < THRESHOLDS.SOIL_MOISTURE_MIN) {
      await sendNotification(
        '🌾 Low Soil Moisture Alert',
        `Soil moisture is ${data.soilMoisture} (${sensorStatus.soilMoisture}). Plants may need watering.`
      );
    }

    // Save current status for next comparison
    await AsyncStorage.setItem(
      'previousGreenhouseStatus',
      JSON.stringify({
        waterPump: data.waterPump,
        fan: data.fan,
        misting: data.misting,
      })
    );
  } catch (error) {
    console.error('Error in checkAndNotify:', error);
  }
};

export const configureNotifications = async (intervalHours: number) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Subscribe to real-time data changes
    const greenhouseRef = ref(db, '/');

    const unsubscribe = onValue(greenhouseRef, async (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Check for immediate alerts (device changes, critical sensor issues)
        await checkAndNotify(data);
      }
    });

    // Schedule periodic status update notifications
    await schedulePeriodicStatusUpdate(intervalHours);

    console.log('✅ Notifications configured with interval:', intervalHours, 'hours');
    return true;
  } catch (error) {
    console.error('Error configuring notifications:', error);
    return false;
  }
};

const sendNotification = async (title: string, body: string) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        badge: 1,
      },
      trigger: null, // Send immediately
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const schedulePeriodicStatusUpdate = async (intervalHours: number) => {
  try {
    // Get current data to include in the scheduled notification
    const greenhouseRef = ref(db, '/');
    let currentData: GreenhouseStatus = {};

    // Fetch once to get current data
    onValue(
      greenhouseRef,
      (snapshot) => {
        if (snapshot.exists()) {
          currentData = snapshot.val();
        }
      },
      { onlyOnce: true }
    );

    // Calculate seconds
    const intervalSeconds = intervalHours * 60 * 60;

    // Schedule recurring notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📊 Greenhouse Status Report',
        body: `Latest update: Temp ${currentData.temperature ?? '--'}°C, Humidity ${currentData.humidity ?? '--'}%`,
        sound: true,
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalSeconds,
        repeats: true,
      },
    });

    console.log('✅ Periodic status update scheduled every', intervalHours, 'hours');
  } catch (error) {
    console.error('Error scheduling periodic status update:', error);
  }
};

/**
 * Function to get current greenhouse status summary
 */
export const getGreenhouseStatusSummary = async (): Promise<string> => {
  try {
    const greenhouseRef = ref(db, '/');
    let data: GreenhouseStatus = {};

    return new Promise((resolve) => {
      onValue(
        greenhouseRef,
        (snapshot) => {
          if (snapshot.exists()) {
            data = snapshot.val();
            const sensorStatus = evaluateSensorStatus(data);
            const summary = `
🌡️ Temperature: ${data.temperature ?? '--'}°C (${sensorStatus.temperature})
💧 Humidity: ${data.humidity ?? '--'}% (${sensorStatus.humidity})
🌾 Soil Moisture: ${data.soilMoisture ?? '--'} (${sensorStatus.soilMoisture})
🌀 Fan: ${data.fan ? 'ON' : 'OFF'}
💨 Misting: ${data.misting ? 'ON' : 'OFF'}
💧 Water Pump: ${data.waterPump ? 'ON' : 'OFF'}
            `;
            resolve(summary);
          }
        },
        { onlyOnce: true }
      );
    });
  } catch (error) {
    console.error('Error getting greenhouse status summary:', error);
    return 'Unable to fetch greenhouse status';
  }
};