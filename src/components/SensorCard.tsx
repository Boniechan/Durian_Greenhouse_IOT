import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Status = "optimal" | "normal" | "attention" | "dry";
interface Props {
  title: string;
  value: string;
  rightLabel?: string;
}

export default function SensorCard({ title, value, rightLabel }: Props) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {rightLabel ? <Text style={styles.badge}>{rightLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#EEF2F3",
  },
  title: { fontSize: 13, color: "#667085", marginBottom: 4 },
  value: { fontSize: 20, fontWeight: "700", color: "#101828" },
  badge: {
    color: "#16A34A",
    fontWeight: "700",
  },
});
