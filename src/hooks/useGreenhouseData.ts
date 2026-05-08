import { useEffect, useState, useCallback, useRef } from "react";
import { onValue, ref, get } from "firebase/database";
import { db } from "../services/firebaseConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logWaterPumpTurnOn, logWaterPumpTurnOff } from "../services/waterPumpService";

function toBoolean(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const str = String(value).trim().toLowerCase();
    return str === "true" || str === "1" || str === "yes" || str === "on";
  }
  if (typeof value === "number") return value !== 0;
  return false;
}

function toNumber(value: any, defaultValue: number = 0): number {
  if (value === null || value === undefined) return defaultValue;
  if (typeof value === "number") return value;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
}

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
  temperatureActive?: boolean;
  humidityActive?: boolean;
  soilMoistureActive?: boolean;
}

function parseFirebaseData(rawData: any): GreenhouseData {
  return {
    daysSincePlanting: toNumber(rawData.daysSincePlanting),
    livingPlants: toNumber(rawData.livingPlants),
    deadPlants: toNumber(rawData.deadPlants),
    temperature: toNumber(rawData.temperature),
    humidity: toNumber(rawData.humidity),
    soilMoisture: toNumber(rawData.soilMoisture),
    updatedAt: toNumber(rawData.updatedAt),
    waterPump: toBoolean(rawData.waterPump),
    fan: toBoolean(rawData.fan),
    misting: toBoolean(rawData.misting),
    temperatureActive: toBoolean(rawData.temperatureActive),
    humidityActive: toBoolean(rawData.humidityActive),
    soilMoistureActive: toBoolean(rawData.soilMoistureActive),
  };
}

async function calculateDaysSincePlanting(): Promise<number> {
  try {
    const plantingDateStr = await AsyncStorage.getItem("plantingDate");
    if (!plantingDateStr) return 0;

    const plantingDate = new Date(plantingDateStr);
    const today = new Date();
    const plantingDateOnly = new Date(
      plantingDate.getFullYear(),
      plantingDate.getMonth(),
      plantingDate.getDate()
    );
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (todayOnly < plantingDateOnly) {
      return 0;
    }

    const timeDifference = todayOnly.getTime() - plantingDateOnly.getTime();
    const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

    return daysDifference + 1;
  } catch (error) {
    console.error("Error calculating days since planting:", error);
    return 0;
  }
}

export function useGreenhouseData() {
  const [data, setData] = useState<GreenhouseData>({});
  const [loading, setLoading] = useState(true);
  const prevPumpStateRef = useRef<boolean>(false);
  const pumpTurnOnTimeRef = useRef<Date | null>(null);
  const pumpRecordIdRef = useRef<string | null>(null);

  const trackWaterPumpActivity = useCallback(async (newPumpState: boolean, newData: GreenhouseData) => {
    const prevPumpState = prevPumpStateRef.current;

    if (newPumpState && !prevPumpState) {
      console.log("Water pump turned ON - logging activity");
      const record = await logWaterPumpTurnOn(
        newData.soilMoisture || 0,
        newData.temperature || 0
      );

      if (record) {
        pumpTurnOnTimeRef.current = new Date();
        pumpRecordIdRef.current = record.id;
      }
    } else if (!newPumpState && prevPumpState && pumpTurnOnTimeRef.current && pumpRecordIdRef.current) {
      console.log("Water pump turned OFF - calculating duration");
      const durationInSeconds = Math.floor(
        (new Date().getTime() - pumpTurnOnTimeRef.current.getTime()) / 1000
      );

      await logWaterPumpTurnOff(
        pumpRecordIdRef.current,
        durationInSeconds,
        newData.soilMoisture || 0,
        newData.temperature || 0
      );

      pumpTurnOnTimeRef.current = null;
      pumpRecordIdRef.current = null;
    }

    prevPumpStateRef.current = newPumpState;
  }, []);

  useEffect(() => {
    const realtimeRef = ref(db, "/");

    const unsub = onValue(realtimeRef, async (snap) => {
      if (snap.exists()) {
        const newData = parseFirebaseData(snap.val());
        const daysSince = await calculateDaysSincePlanting();
        const monitoredData = {
          ...newData,
          daysSincePlanting: daysSince,
        };

        await trackWaterPumpActivity(monitoredData.waterPump ?? false, monitoredData);
        setData(monitoredData);

        console.log("Firebase data updated:", {
          temperature: monitoredData.temperature,
          humidity: monitoredData.humidity,
          soilMoisture: monitoredData.soilMoisture,
          daysSincePlanting: monitoredData.daysSincePlanting,
          deviceStatus: {
            waterPump: monitoredData.waterPump ? "ON" : "OFF",
            fan: monitoredData.fan ? "ON" : "OFF",
            misting: monitoredData.misting ? "ON" : "OFF",
          },
          updatedAt: monitoredData.updatedAt
            ? new Date(monitoredData.updatedAt).toLocaleTimeString()
            : "N/A",
        });
      }

      setLoading(false);
    });

    return () => unsub();
  }, [trackWaterPumpActivity]);

  const refresh = useCallback(async () => {
    setLoading(true);
    const snap = await get(ref(db, "/"));

    if (snap.exists()) {
      const newData = parseFirebaseData(snap.val());
      const daysSince = await calculateDaysSincePlanting();
      const monitoredData = {
        ...newData,
        daysSincePlanting: daysSince,
      };

      await trackWaterPumpActivity(monitoredData.waterPump ?? false, monitoredData);
      setData(monitoredData);
    }

    setLoading(false);
  }, [trackWaterPumpActivity]);

  return { data, loading, refresh };
}
