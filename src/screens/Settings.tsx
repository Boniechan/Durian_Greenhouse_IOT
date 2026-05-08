import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { configureNotifications, disableNotifications } from '../services/notificationService';
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
  const [selectedDay, setSelectedDay] = React.useState(plantingDate.getDate().toString());
  const [selectedMonth, setSelectedMonth] = React.useState(plantingDate.getMonth().toString());
  const [selectedYear, setSelectedYear] = React.useState(plantingDate.getFullYear().toString());

  // Load saved settings when component mounts
  React.useEffect(() => {
    loadSavedSettings();
  }, []);

  const parseStoredBoolean = (value: string | null): boolean => {
    if (!value) return false;

    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'boolean') {
        return parsed;
      }
      if (typeof parsed === 'string') {
        return parsed.toLowerCase() === 'true';
      }
      return Boolean(parsed);
    } catch {
      return value.toLowerCase() === 'true';
    }
  };

  const loadSavedSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem('notificationsEnabled');
      const savedInterval = await AsyncStorage.getItem('notificationInterval');
      const savedPlantingDate = await AsyncStorage.getItem('plantingDate');
      
      if (savedNotifications) {
        setNotificationsEnabled(parseStoredBoolean(savedNotifications));
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

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setPlantingDate(selectedDate);
      setSelectedDay(selectedDate.getDate().toString());
      setSelectedMonth(selectedDate.getMonth().toString());
      setSelectedYear(selectedDate.getFullYear().toString());
    }
  };

  const handleDateConfirm = () => {
    const newDate = new Date(parseInt(selectedYear), parseInt(selectedMonth), parseInt(selectedDay));
    setPlantingDate(newDate);
    setShowDatePicker(false);
  };

  const handleNotificationToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      const success = await configureNotifications(parseInt(notificationInterval));
      if (!success) {
        setNotificationsEnabled(false);
      }
    } else {
      await disableNotifications();
    }
  };

  const handleSaveSettings = async () => {
    try {
      if (notificationsEnabled) {
        const success = await configureNotifications(parseInt(notificationInterval));
        if (!success) {
          setNotificationsEnabled(false);
          Alert.alert('Error', 'Failed to schedule reminders');
          return;
        }
      } else {
        await disableNotifications();
      }

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
            value={!!notificationsEnabled}
            onValueChange={handleNotificationToggle}
            trackColor={{ false: '#E5E7EB', true: '#BBF7D0' }}
            thumbColor={notificationsEnabled ? '#16A34A' : '#9CA3AF'}
          />
        </View>

        {notificationsEnabled && (
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>Reminder Interval</Text>
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
            Reminders are off. Enable notifications in device settings if prompted.
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Monitoring Setup</Text>
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
        <>
          <TouchableOpacity 
            style={styles.datePickerBackdrop}
            activeOpacity={1}
            onPress={() => setShowDatePicker(false)}
          />
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Planting Date</Text>
              <TouchableOpacity 
                style={styles.datePickerCloseButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.pickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Month</Text>
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={setSelectedMonth}
                  style={styles.datePicker}
                  itemStyle={styles.pickerItem}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <Picker.Item key={i} label={new Date(2000, i).toLocaleString('default', { month: 'short' })} value={i.toString()} />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Day</Text>
                <Picker
                  selectedValue={selectedDay}
                  onValueChange={setSelectedDay}
                  style={styles.datePicker}
                  itemStyle={styles.pickerItem}
                >
                  {Array.from({ length: 31 }, (_, i) => (
                    <Picker.Item key={i} label={(i + 1).toString().padStart(2, '0')} value={(i + 1).toString()} />
                  ))}
                </Picker>
              </View>
              
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Year</Text>
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={setSelectedYear}
                  style={styles.datePicker}
                  itemStyle={styles.pickerItem}
                >
                  {Array.from({ length: 50 }, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <Picker.Item key={i} label={year.toString()} value={year.toString()} />;
                  })}
                </Picker>
              </View>
            </View>

            <View style={styles.datePickerButtonGroup}>
              <TouchableOpacity 
                style={styles.datePickerCancelButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.datePickerConfirmButton}
                onPress={handleDateConfirm}
              >
                <Text style={styles.datePickerConfirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </>
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
    position: 'absolute',
    bottom: 20,
    left: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  },
  datePickerBackdrop: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  datePickerCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#16A34A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    overflow: 'visible',
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  datePicker: {
    width: 100,
    height: 200,
    color: '#374151',
  },
  datePickerConfirmButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  datePickerConfirmButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  datePickerButtonGroup: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  datePickerCancelButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  datePickerCancelButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
  },
});
