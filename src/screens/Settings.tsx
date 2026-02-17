import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';
import { configureNotifications } from '../services/notificationService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

export default function Settings() {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(false);
  const [notificationInterval, setNotificationInterval] = React.useState('3');
  const [plantingDate, setPlantingDate] = React.useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  // Load saved settings when component mounts
  React.useEffect(() => {
    loadSavedSettings();
  }, []);

  const loadSavedSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const savedInterval = await AsyncStorage.getItem('notificationInterval');
      const savedPlantingDate = await AsyncStorage.getItem('plantingDate');
      
      if (savedNotifications) {
        setNotificationsEnabled(JSON.parse(savedNotifications));
      }
      if (savedInterval) {
        setNotificationInterval(savedInterval);
      }
      if (savedPlantingDate) {
        setPlantingDate(new Date(savedPlantingDate));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleDateChange = (selectedDate: Date) => {
    setPlantingDate(selectedDate);
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const success = await configureNotifications(parseInt(notificationInterval));
      if (!success) {
        setNotificationsEnabled(false);
      }
    }
  };

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
      await AsyncStorage.setItem('notificationInterval', notificationInterval);
      await AsyncStorage.setItem('plantingDate', plantingDate.toISOString());
      
      Alert.alert(
        'Success',
        'Settings saved successfully!',
        [
          { text: 'OK', onPress: () => navigation.navigate('Dashboard') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Settings</Text>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Enable Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
            thumbColor={notificationsEnabled ? '#16A34A' : '#9CA3AF'}
          />
        </View>

        {notificationsEnabled && (
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Check Interval</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={notificationInterval}
                onValueChange={setNotificationInterval}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                <Picker.Item label="Every 1 hour" value="1" />
                <Picker.Item label="Every 3 hours" value="3" />
                <Picker.Item label="Every 6 hours" value="6" />
                <Picker.Item label="Every 12 hours" value="12" />
                <Picker.Item label="Every 24 hours" value="24" />
              </Picker>
            </View>
          </View>
        )}

        {!notificationsEnabled && (
          <Text style={styles.errorText}>
            Notifications are blocked. Please enable them in your device settings.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Greenhouse Setup</Text>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingText}>Planting Date</Text>
            <Text style={styles.settingDescription}>
              {plantingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#166534" />
          </TouchableOpacity>
        </View>
      </View>

      {showDatePicker && (
        <View style={styles.datePickerContainer}>
          <DatePicker
            date={plantingDate}
            onDateChange={handleDateChange}
            maximumDate={new Date()}
            mode="date"
          />
          <TouchableOpacity 
            onPress={() => setShowDatePicker(false)}
            style={styles.datePickerCloseButton}
          >
            <Text style={styles.datePickerCloseButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity 
        style={styles.saveButton}
        onPress={handleSaveSettings}
      >
        <Text style={styles.saveButtonText}>Save Settings</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 45, // Add this line
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#166534',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingText: {
    fontSize: 16, // Increased from 15
    fontWeight: '600', // Added font weight
    color: '#374151',
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#16A34A',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20, // Added margin bottom
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    minWidth: 170,
  },
  picker: {
    width: 170,
    height: 50, // Increased height
    color: '#374151',
    fontSize: 16, // Added font size
  },
  pickerItem: {
    fontSize: 16, // Added for picker items
    height: 50, // Match picker height
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  dateButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  datePickerContainer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  datePickerCloseButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  datePickerCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});