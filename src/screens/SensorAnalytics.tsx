import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import { SimpleLineChart } from '../components/SimpleLineChart';
import {
  getAllSensorAnalytics,
  AnalyticsData,
  SensorReading,
  getAverageValue,
  getMinMaxValue,
} from '../services/analyticsService';

const screenWidth = Dimensions.get('window').width;

export default function SensorAnalytics() {
  const navigation = useNavigation<NavigationProp>();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [daysRange, setDaysRange] = useState(365);

  const fetchAnalytics = async () => {
    try {
      const data = await getAllSensorAnalytics(daysRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, [daysRange]);

  const formatChartData = (readings: SensorReading[]): { x: number; y: number; label: string }[] => {
    if (readings.length === 0) return [];

    // Group by month and get average per month
    const grouped: { [key: string]: number[] } = {};
    readings.forEach((reading) => {
      const field = reading.soilMoisture !== undefined
        ? 'soilMoisture'
        : reading.temperature !== undefined
        ? 'temperature'
        : 'humidity';
      
      const value = reading[field];
      if (typeof value === 'number') {
        const dateObj = new Date(reading.date);
        const monthKey = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
        
        if (!grouped[monthKey]) grouped[monthKey] = [];
        grouped[monthKey].push(value);
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .slice(-12) // Last 12 months
      .map(([monthKey, values], index) => {
        const [year, month] = monthKey.split('-');
        const monthIndex = parseInt(month) - 1;
        const label = monthNames[monthIndex];
        
        return {
          x: index + 1,
          y: Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 100) / 100,
          label,
        };
      });
  };

  const StatCard = ({
    icon,
    label,
    value,
    unit,
    color,
  }: {
    icon: string;
    label: string;
    value: string;
    unit: string;
    color: string;
  }) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.statHeader}>
        <MaterialCommunityIcons name={icon as any} size={24} color={color} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>
        {value}
        <Text style={styles.statUnit}> {unit}</Text>
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Sensor Analytics</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#166534" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#166534" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </View>
    );
  }

  if (!analyticsData) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Sensor Analytics</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="close" size={24} color="#166534" />
          </TouchableOpacity>
        </View>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#9CA3AF" />
          <Text style={styles.errorText}>Failed to load analytics data</Text>
        </View>
      </View>
    );
  }

  const soilMoistureAvg = getAverageValue(analyticsData.soilMoistureReadings, 'soilMoisture');
  const soilMoistureMinMax = getMinMaxValue(analyticsData.soilMoistureReadings, 'soilMoisture');
  
  const temperatureAvg = getAverageValue(analyticsData.temperatureReadings, 'temperature');
  const temperatureMinMax = getMinMaxValue(analyticsData.temperatureReadings, 'temperature');
  
  const humidityAvg = getAverageValue(analyticsData.humidityReadings, 'humidity');
  const humidityMinMax = getMinMaxValue(analyticsData.humidityReadings, 'humidity');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>📊 Sensor Analytics</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#166534" />
        </TouchableOpacity>
      </View>

      <View style={styles.rangeSelector}>
        {[30, 90, 365].map((days, idx) => {
          const labels = ['1m', '3m', '12m'];
          return (
            <TouchableOpacity
              key={days}
              style={[
                styles.rangeButton,
                daysRange === days && styles.rangeButtonActive,
              ]}
              onPress={() => setDaysRange(days)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  daysRange === days && styles.rangeButtonTextActive,
                ]}
              >
                {labels[idx]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Soil Moisture Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌱 Soil Moisture</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="sprout"
            label="Average"
            value={soilMoistureAvg.toString()}
            unit="%"
            color="#8B5CF6"
          />
          <StatCard
            icon="chart-line"
            label="Range"
            value={`${soilMoistureMinMax.min} - ${soilMoistureMinMax.max}`}
            unit="%"
            color="#8B5CF6"
          />
        </View>
        {formatChartData(analyticsData.soilMoistureReadings).length > 0 ? (
          <View style={styles.chartContainer}>
            <SimpleLineChart
              data={formatChartData(analyticsData.soilMoistureReadings)}
              width={screenWidth - 40}
              height={220}
              color="#8B5CF6"
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No soil moisture data available</Text>
          </View>
        )}
      </View>

      {/* Temperature Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌡️ Temperature</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="thermometer"
            label="Average"
            value={temperatureAvg.toString()}
            unit="°C"
            color="#EF4444"
          />
          <StatCard
            icon="chart-line"
            label="Range"
            value={`${temperatureMinMax.min} - ${temperatureMinMax.max}`}
            unit="°C"
            color="#EF4444"
          />
        </View>
        {formatChartData(analyticsData.temperatureReadings).length > 0 ? (
          <View style={styles.chartContainer}>
            <SimpleLineChart
              data={formatChartData(analyticsData.temperatureReadings)}
              width={screenWidth - 40}
              height={220}
              color="#EF4444"
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No temperature data available</Text>
          </View>
        )}
      </View>

      {/* Humidity Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💨 Humidity</Text>
        <View style={styles.statsRow}>
          <StatCard
            icon="water-percent"
            label="Average"
            value={humidityAvg.toString()}
            unit="%"
            color="#0EA5E9"
          />
          <StatCard
            icon="chart-line"
            label="Range"
            value={`${humidityMinMax.min} - ${humidityMinMax.max}`}
            unit="%"
            color="#0EA5E9"
          />
        </View>
        {formatChartData(analyticsData.humidityReadings).length > 0 ? (
          <View style={styles.chartContainer}>
            <SimpleLineChart
              data={formatChartData(analyticsData.humidityReadings)}
              width={screenWidth - 40}
              height={220}
              color="#0EA5E9"
            />
          </View>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>No humidity data available</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Data from {analyticsData.dateRange.start} to {analyticsData.dateRange.end}
        </Text>
      </View>
    </ScrollView>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 12,
  },
  rangeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    justifyContent: 'center',
  },
  rangeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  rangeButtonActive: {
    backgroundColor: '#166534',
    borderColor: '#166534',
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  rangeButtonTextActive: {
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  statUnit: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noDataContainer: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
