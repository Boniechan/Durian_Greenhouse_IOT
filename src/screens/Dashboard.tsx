import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import SensorCard from "../components/SensorCard";
import StatusIndicator from "../components/StatusIndicator";
import { useGreenhouseData } from "../hooks/useGreenhouseData";
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function Dashboard() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { data, loading, refresh } = useGreenhouseData();

  const tempStatus = data.temperature && data.temperature > 35 ? "Needs Attention" : "Optimal";
  const humStatus = data.humidity && data.humidity < 40 ? "Needs Attention" : "Optimal";
  const soilStatus =
    data.soilMoisture && data.soilMoisture < 500 ? "Dry" : "Optimal";

  return (
    <View style={styles.container}>
      {/* Header with navigation buttons */}
      <View style={styles.header}>
        <Text style={styles.title}>🌱 Durian Greenhouse App</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('WeeklyRecords')}
          >
            <FontAwesome5 name="calendar-alt" size={22} color="#166534" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('WeeklyUpdate')}
          >
            <Ionicons name="camera" size={24} color="#166534" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#166534" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Days since planting */}
      <View style={styles.cardLarge}>
        <View style={styles.row}>
          <Ionicons name="calendar" size={20} color="#22C55E" />
          <Text style={styles.smallTitle}>Days Since Planting</Text>
        </View>
        <Text style={styles.largeValue}>
          {loading ? "--" : `${data.daysSincePlanting ?? "--"} days`}
        </Text>
      </View>

      {/* Plant status row */}
      <View style={styles.rowSplit}>
        <View style={[styles.cardMini]}>
          <View style={styles.row}>
            <Ionicons name="leaf" size={18} color="#16A34A" />
            <Text style={styles.smallTitle}>Living Plants</Text>
          </View>
          <Text style={styles.miniValue}>{data.livingPlants ?? 0}</Text>
        </View>

        <View style={[styles.cardMini, { borderColor: "#FEE2E2" }]}>
          <View style={styles.row}>
            <Ionicons name="close-circle" size={18} color="#EF4444" />
            <Text style={styles.smallTitle}>Dead Plants</Text>
          </View>
          <Text style={[styles.miniValue, { color: "#EF4444" }]}>
            {data.deadPlants ?? 0}
          </Text>
        </View>
      </View>

      {/* Sensor cards */}
      <SensorCard title="Temperature" value={`${data.temperature ?? "--"} °C`} rightLabel={tempStatus} />
      <SensorCard title="Humidity" value={`${data.humidity ?? "--"} %`} rightLabel={humStatus} />
      <SensorCard title="Soil Moisture" value={`${data.soilMoisture ?? "--"}`} rightLabel={soilStatus} />

      {/* Refresh */}
      <TouchableOpacity onPress={refresh} style={styles.refreshBtn} disabled={loading}>
        <Text style={styles.refreshText}>{loading ? "Refreshing..." : "Refresh"}</Text>
      </TouchableOpacity>

      <StatusIndicator />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#E8F5E9", 
    padding: 16,
    marginTop: 45, // Add this line for top margin
  },
  title: { fontSize: 22, fontWeight: "700", color: "#166534", textAlign: "left" },
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardLarge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    marginBottom: 14,
  },
  smallTitle: { fontSize: 13, color: "#667085" },
  largeValue: { fontSize: 22, fontWeight: "800", color: "#14532D", marginTop: 6 },
  rowSplit: { flexDirection: "row", gap: 10, marginBottom: 12 },
  cardMini: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  miniValue: { fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 6 },
  refreshBtn: {
    backgroundColor: "#BBF7D0",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  refreshText: { fontSize: 16, fontWeight: "700", color: "#166534" },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
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
