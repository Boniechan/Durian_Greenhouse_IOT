import { useEffect, useState, useCallback } from "react";
import { onValue, ref, get } from "firebase/database";
import { db } from "../services/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface GreenhouseData {
  daysSincePlanting?: number;
  livingPlants?: number;
  deadPlants?: number;
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  updatedAt?: number;
  waterPump?: boolean;
  fan?: boolean;
  misting?: boolean;
}

// Control logic based on sensor thresholds
function calculateControlStates(data: GreenhouseData): {
  waterPump: boolean;
  fan: boolean;
  misting: boolean;
} {
  const waterPump = data.soilMoisture ? data.soilMoisture > 650 : false;
  const fan = data.temperature ? data.temperature >= 34 : false;
  const misting = data.humidity ? data.humidity <= 55 : false;

  return { waterPump, fan, misting };
}

// Calculate days since planting date
async function calculateDaysSincePlanting(): Promise<number> {
  try {
    const plantingDateStr = await AsyncStorage.getItem("plantingDate");
    if (!plantingDateStr) return 0;

    const plantingDate = new Date(plantingDateStr);
    const today = new Date();
    const timeDifference = today.getTime() - plantingDate.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

    return Math.max(0, daysDifference);
  } catch (error) {
    console.error("Error calculating days since planting:", error);
    return 0;
  }
}

export function useGreenhouseData() {
  const [data, setData] = useState<GreenhouseData>({});
  const [loading, setLoading] = useState(true);

  // live subscription
  useEffect(() => {
    const r = ref(db, "/");
    const unsub = onValue(r, async (snap) => {
      if (snap.exists()) {
        const newData = snap.val();
        const daysSince = await calculateDaysSincePlanting();
        const controls = calculateControlStates(newData);
        const dataWithControls = { 
          ...newData, 
          daysSincePlanting: daysSince,
          ...controls 
        };
        setData(dataWithControls);
        console.log('✅ Firebase data updated:', {
          temperature: newData.temperature,
          humidity: newData.humidity,
          soilMoisture: newData.soilMoisture,
          daysSincePlanting: daysSince,
          controls: {
            waterPump: controls.waterPump ? 'ON' : 'OFF',
            fan: controls.fan ? 'ON' : 'OFF',
            misting: controls.misting ? 'ON' : 'OFF'
          },
          updatedAt: new Date(newData.updatedAt).toLocaleTimeString()
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // manual refresh (one-shot fetch)
  const refresh = useCallback(async () => {
    setLoading(true);
    const snap = await get(ref(db, "/"));
    if (snap.exists()) {
      const newData = snap.val();
      const daysSince = await calculateDaysSincePlanting();
      const controls = calculateControlStates(newData);
      setData({ 
        ...newData, 
        daysSincePlanting: daysSince,
        ...controls 
      });
    }
    setLoading(false);
  }, []);

  return { data, loading, refresh };
}
