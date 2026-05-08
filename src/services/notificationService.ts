import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const REMINDER_TITLE = 'Durian Monitoring Reminder';

const buildReminderBody = (intervalHours: number): string => {
  if (intervalHours === 1) {
    return 'Time to check your durian monitoring app.';
  }

  return `Time to review your durian monitoring app. Reminder repeats every ${intervalHours} hours.`;
};

export const configureNotifications = async (intervalHours: number) => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Notification permissions not granted');
      return false;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: REMINDER_TITLE,
        body: buildReminderBody(intervalHours),
        sound: true,
        badge: 1,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalHours * 60 * 60,
        repeats: true,
      },
    });

    console.log('Interval reminder scheduled every', intervalHours, 'hours');
    return true;
  } catch (error) {
    console.error('Error configuring interval reminder:', error);
    return false;
  }
};

export const disableNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All scheduled reminders cancelled');
    return true;
  } catch (error) {
    console.error('Error cancelling reminders:', error);
    return false;
  }
};
