import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { firestore } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
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
  livingPlants: number;
  deadPlants: number;
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
      <Text style={styles.dateText}>
        {item.timestamp.toDate().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </Text>
      
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
      
      <View style={styles.statsContainer}>
        <Text style={styles.statText}>Day: {item.daysSincePlanting}</Text>
        <Text style={styles.statText}>Temp: {item.temperature}°C</Text>
        <Text style={styles.statText}>Humidity: {item.humidity}%</Text>
        <Text style={styles.statText}>
          Plants: {item.livingPlants} living, {item.deadPlants} dead
        </Text>
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
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 8,
  },
  recordImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  noImageContainer: {
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#9CA3AF',
    marginTop: 8,
    fontSize: 14,
  },
  statsContainer: {
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#374151',
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