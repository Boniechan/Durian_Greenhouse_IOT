import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { GreenhouseData } from "../hooks/useGreenhouseData";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface StatusIndicatorProps {
  data: GreenhouseData;
}

export default function StatusIndicator({ data }: StatusIndicatorProps) {

  const ControlItem = ({ icon, label, status }: { icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"]; label: string; status: boolean }) => (
    <View style={styles.controlRow}>
      <View style={styles.controlItem}>
        <MaterialCommunityIcons 
          name={icon} 
          size={20} 
          color={status ? "#16A34A" : "#9CA3AF"} 
        />
        <Text style={styles.controlLabel}>{label}</Text>
      </View>
      <View style={[styles.statusBadge, status ? styles.statusOn : styles.statusOff]}>
        <Text style={[styles.statusText, status ? styles.statusOnText : styles.statusOffText]}>
          {status ? "ON" : "OFF"}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Live Device Status</Text>
      <ControlItem icon="water-pump" label="Water Pump" status={data.waterPump ?? false} />
      <ControlItem icon="fan" label="Fan" status={data.fan ?? false} />
      <ControlItem icon="water-opacity" label="Misting" status={data.misting ?? false} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#EEF2F3",
  },
  heading: { fontSize: 14, color: "#667085", marginBottom: 12, fontWeight: "600" },
  controlRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    marginTop: 10,
    paddingVertical: 8
  },
  controlItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  controlLabel: { 
    fontSize: 14, 
    color: "#374151", 
    fontWeight: "500" 
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOn: {
    backgroundColor: "#D1FAE5",
  },
  statusOff: {
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusOnText: {
    color: "#16A34A",
  },
  statusOffText: {
    color: "#9CA3AF",
  },
});
