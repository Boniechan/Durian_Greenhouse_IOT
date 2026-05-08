import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';

// Update the WeeklyRecord interface
interface WeeklyRecord {
  id: string;
  timestamp: {
    toDate: () => Date;  // Firestore timestamp
  };
  daysSincePlanting: number;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  photoUrl: string | null;  // explicitly type photoUrl
}

export default function WeeklyRecords() {
  const navigation = useNavigation<NavigationProp>();
  const [records, setRecords] = useState<WeeklyRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Update the fetchRecords function
  const fetchRecords = async () => {
    try {
      const q = query(
        collection(firestore, 'weekly-records'),  // Changed from 'Durian_Data'
        orderBy('timestamp', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const recordsData: WeeklyRecord[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as WeeklyRecord));
      
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching records:', error);
      alert('Error loading records');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecords();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  // Update the renderItem function
  const renderItem = ({ item }: { item: WeeklyRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.dateText}>
            {item.timestamp.toDate().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.timeText}>
            {item.timestamp.toDate().toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        <View style={styles.dayBadge}>
          <Text style={styles.dayBadgeText}>Day {item.daysSincePlanting}</Text>
        </View>
      </View>
      
      {item.photoUrl ? (
        <Image 
          source={{ uri: item.photoUrl }} 
          style={styles.recordImage}
          resizeMode="cover"
          onError={() => console.error('Failed to load image')}
        />
      ) : (
        <View style={styles.noImageContainer}>
          <Ionicons name="image-outline" size={48} color="#9CA3AF" />
          <Text style={styles.noImageText}>No photo available</Text>
        </View>
      )}
      
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialCommunityIcons name="thermometer" size={20} color="#EF4444" />
          </View>
          <Text style={styles.statLabel}>Temperature</Text>
          <Text style={styles.statValue}>{item.temperature.toFixed(1)}°C</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialCommunityIcons name="water-percent" size={20} color="#3B82F6" />
          </View>
          <Text style={styles.statLabel}>Humidity</Text>
          <Text style={styles.statValue}>{item.humidity}%</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={styles.statIconContainer}>
            <MaterialCommunityIcons name="sprout" size={20} color="#92400E" />
          </View>
          <Text style={styles.statLabel}>Soil Moisture</Text>
          <Text style={styles.statValue}>{item.soilMoisture}% wet</Text>
        </View>
      </View>
    </View>
  );

  const handleAddRecord = () => {
    navigation.navigate('WeeklyUpdate');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Weekly Records</Text>
        <TouchableOpacity onPress={handleAddRecord}>
          <Ionicons name="add-circle" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      {records.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="calendar-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No weekly records yet</Text>
          <Text style={styles.emptyText}>
            Create your first weekly update to see records here
          </Text>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={handleAddRecord}
          >
            <Text style={styles.addButtonText}>Add Record</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={records}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    fontSize: 24,
    fontWeight: '700',
    color: '#166534',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  timeText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  dayBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  dayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  recordImage: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  noImageContainer: {
    height: 220,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  noImageText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#166534',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  addButtonText: {
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
});

function alert(arg0: string) {
  throw new Error('Function not implemented.');
}
