import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity, SectionList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import { WaterPumpRecord } from '../types/waterPump';
import {
  getLatestWaterPumpActivity,
  formatDuration,
  formatDateString,
} from '../services/waterPumpService';

interface GroupedRecords {
  date: string;
  data: WaterPumpRecord[];
}

// Helper function to convert Firestore timestamp to Date object
function convertTimestampToDate(timestamp: any): Date {
  if (!timestamp) return new Date();
  
  // If it's already a Date object
  if (timestamp instanceof Date) {
    return timestamp;
  }
  
  // If it has toDate() method (Firestore Timestamp object)
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  
  // If it's a plain object with seconds property (Firestore serialized)
  if (timestamp.seconds !== undefined) {
    return new Date(timestamp.seconds * 1000);
  }
  
  // If it's a number (milliseconds since epoch)
  if (typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  
  // Try to parse as string
  if (typeof timestamp === 'string') {
    return new Date(timestamp);
  }
  
  return new Date();
}

export default function WaterPumpRecords() {
  const navigation = useNavigation<NavigationProp>();
  const [records, setRecords] = useState<GroupedRecords[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWaterPumpRecords = async () => {
    try {
      const allRecords = await getLatestWaterPumpActivity();
      
      // Group records by date
      const grouped: { [key: string]: WaterPumpRecord[] } = {};
      allRecords.forEach((record) => {
        const date = record.turnOnDate;
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(record);
      });

      // Convert to array format for SectionList
      const groupedArray = Object.entries(grouped)
        .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
        .map(([date, data]) => ({
          date,
          data: data.sort((a, b) => {
            const timeA = convertTimestampToDate(b.timestamp);
            const timeB = convertTimestampToDate(a.timestamp);
            return timeA.getTime() - timeB.getTime();
          }),
        }));

      setRecords(groupedArray);
    } catch (error) {
      console.error('Error fetching water pump records:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWaterPumpRecords();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchWaterPumpRecords();
  }, []);

  const renderRecord = ({ item }: { item: WaterPumpRecord }) => {
    const durationText = item.duration > 0 ? formatDuration(item.duration) : 'Running...';
    const isRunning = item.status === 'on' || item.status === true;

    return (
      <View style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordTitleSection}>
            <MaterialCommunityIcons
              name="water-pump"
              size={20}
              color={isRunning ? '#16A34A' : '#6B7280'}
            />
            <View style={styles.recordInfo}>
              <Text style={styles.recordTime}>
                {item.turnOnTime}
                {isRunning && ' (Running)'}
              </Text>
              <Text style={styles.recordCount}>Turn #{item.turnOnCount}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, isRunning ? styles.statusOn : styles.statusOff]}>
            <Text style={styles.statusText}>{isRunning ? 'ON' : 'OFF'}</Text>
          </View>
        </View>

        <View style={styles.recordDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="timer-outline" size={16} color="#6B7280" />
            <Text style={styles.detailLabel}>Duration:</Text>
            <Text style={styles.detailValue}>{durationText}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="sprout" size={16} color="#8B5CF6" />
            <Text style={styles.detailLabel}>Soil:</Text>
            <Text style={styles.detailValue}>{Math.round(item.soilMoisture)}% wet</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="thermometer" size={16} color="#EF4444" />
            <Text style={styles.detailLabel}>Temp:</Text>
            <Text style={styles.detailValue}>{item.temperature.toFixed(1)}°C</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderSectionHeader = ({ section }: { section: GroupedRecords }) => {
    const dateObj = new Date(section.date);
    const dateString = dateObj.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const totalDuration = section.data.reduce((sum, record) => sum + (record.duration || 0), 0);
    const totalTurnsOn = section.data.length;

    return (
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionDate}>{dateString}</Text>
          <Text style={styles.sectionStats}>
            {totalTurnsOn} turn-ons • {formatDuration(totalDuration)} total
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>💧 Water Pump Records</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#166534" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="hourglass-outline" size={48} color="#9CA3AF" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💧 Water Pump Records</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="water-pump-off" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No pump activity yet</Text>
          <Text style={styles.emptyText}>
            Water pump activity will be recorded here when the pump turns on and off
          </Text>
        </View>
      ) : (
        <SectionList
          sections={records}
          keyExtractor={(item) => item.id}
          renderItem={renderRecord}
          renderSectionHeader={renderSectionHeader}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginTop: 45,
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
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
  },
  sectionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionStats: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  recordInfo: {
    flex: 1,
  },
  recordTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  recordCount: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusOn: {
    backgroundColor: '#D1FAE5',
  },
  statusOff: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  recordDetails: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
});
