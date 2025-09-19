import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatusIndicator() {
  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Status Indicators</Text>
      <View style={styles.row}>
        <View style={styles.dotGreen} />
        <Text style={styles.textGreen}>Optimal/Normal</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.dotRed} />
        <Text style={styles.textRed}>Needs Attention</Text>
      </View>
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
  heading: { fontSize: 14, color: "#667085", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 6 },
  dotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#16A34A", marginRight: 8 },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444", marginRight: 8 },
  textGreen: { color: "#16A34A", fontWeight: "600" },
  textRed: { color: "#EF4444", fontWeight: "600" },
});
