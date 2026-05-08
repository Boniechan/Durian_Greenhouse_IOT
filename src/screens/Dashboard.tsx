import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import SensorCard from "../components/SensorCard";
import StatusIndicator from "../components/StatusIndicator";
import { useGreenhouseData } from "../hooks/useGreenhouseData";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type DashboardScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, "Dashboard">;

export default function Dashboard() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const { data, loading, refresh } = useGreenhouseData();
  const soilMoisture = data.soilMoisture;

  const tempStatus = data.temperature && data.temperature > 35 ? "Needs Attention" : "Optimal";
  const humStatus = data.humidity && data.humidity < 40 ? "Needs Attention" : "Optimal";

  let soilStatus = "Optimal";
  if (typeof soilMoisture === "number" && soilMoisture <= 30) {
    soilStatus = "Dry";
  } else if (typeof soilMoisture === "number" && soilMoisture >= 70) {
    soilStatus = "Wet";
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Durian Monitoring App</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("WeeklyRecords")}
          >
            <FontAwesome5 name="calendar-alt" size={22} color="#166534" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("WeeklyUpdate")}
          >
            <Ionicons name="camera" size={24} color="#166534" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings-outline" size={24} color="#166534" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recordsButtonsContainer}>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => navigation.navigate("WaterPumpRecords")}
        >
          <MaterialCommunityIcons name="water-pump" size={20} color="#166534" />
          <Text style={styles.recordButtonText}>Water Pump</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => navigation.navigate("MistingRecords")}
        >
          <MaterialCommunityIcons name="water-opacity" size={20} color="#0EA5E9" />
          <Text style={styles.recordButtonText}>Misting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.recordButton}
          onPress={() => navigation.navigate("FanRecords")}
        >
          <MaterialCommunityIcons name="fan" size={20} color="#F59E0B" />
          <Text style={styles.recordButtonText}>Fan</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.analyticsContainer}>
        <TouchableOpacity
          style={styles.analyticsButton}
          onPress={() => navigation.navigate("SensorAnalytics")}
        >
          <MaterialCommunityIcons name="chart-line" size={24} color="#166534" />
          <View style={styles.analyticsContent}>
            <Text style={styles.analyticsTitle}>Sensor Analytics</Text>
            <Text style={styles.analyticsSubtitle}>View trends & statistics</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardLarge}>
        <View style={styles.row}>
          <Ionicons name="calendar" size={20} color="#22C55E" />
          <Text style={styles.smallTitle}>Days Since Planting</Text>
        </View>
        <Text style={styles.largeValue}>
          {loading ? "--" : `${data.daysSincePlanting ?? "--"} days`}
        </Text>
      </View>

      <SensorCard title="Temperature" value={`${data.temperature ?? "--"} °C`} rightLabel={tempStatus} />
      <SensorCard title="Humidity" value={`${data.humidity ?? "--"} %`} rightLabel={humStatus} />
      <SensorCard title="Soil Moisture" value={`${data.soilMoisture ?? "--"}% wet`} rightLabel={soilStatus} />

      <TouchableOpacity onPress={refresh} style={styles.refreshBtn} disabled={loading}>
        <Text style={styles.refreshText}>{loading ? "Refreshing..." : "Refresh"}</Text>
      </TouchableOpacity>

      <StatusIndicator data={data} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F5E9",
    padding: 16,
    marginTop: 45,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  recordsButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
    justifyContent: "space-between",
  },
  recordButton: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  recordButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#166534",
    marginTop: 6,
  },
  analyticsContainer: {
    marginBottom: 16,
  },
  analyticsButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    gap: 12,
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#166534",
    marginBottom: 4,
  },
  analyticsSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
});
