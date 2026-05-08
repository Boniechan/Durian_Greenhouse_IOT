import { firestore } from './firebaseConfig';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  limit,
} from 'firebase/firestore';
import { WaterPumpRecord } from '../types/waterPump';
import { MistingRecord, FanRecord } from '../types/mistingFan';

const WATER_PUMP_COLLECTION = 'water-pump-records';
const MISTING_COLLECTION = 'misting-records';
const FAN_COLLECTION = 'fan-records';

function toNumber(value: any, fallback = 0): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function timestampToDate(timestamp: any): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  if (typeof timestamp.toDate === 'function') return timestamp.toDate();
  if (timestamp.seconds !== undefined) return new Date(timestamp.seconds * 1000);
  if (typeof timestamp === 'number') return new Date(timestamp);
  if (typeof timestamp === 'string') {
    const parsed = new Date(timestamp);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

export interface SensorReading {
  timestamp: number; // milliseconds since epoch
  date: string; // YYYY-MM-DD
  soilMoisture?: number;
  temperature?: number;
  humidity?: number;
  deviceType?: string; // 'water-pump', 'misting', 'fan'
}

export interface AnalyticsData {
  soilMoistureReadings: SensorReading[];
  temperatureReadings: SensorReading[];
  humidityReadings: SensorReading[];
  dateRange: {
    start: string;
    end: string;
  };
}

export async function getWaterPumpAnalytics(daysBack: number = 7): Promise<SensorReading[]> {
  try {
    const querySnapshot = await getDocs(collection(firestore, WATER_PUMP_COLLECTION));
    const readings: SensorReading[] = [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp ?? data.Water_Schdule ?? data.waterSchedule;
      const timestampDate = timestampToDate(timestamp);

      if (timestampDate && timestampDate.getTime() >= cutoffDate.getTime()) {
        readings.push({
          timestamp: timestampDate.getTime(),
          date: data.turnOnDate || timestampDate.toISOString().split('T')[0],
          soilMoisture: toNumber(data.soilMoisture),
          temperature: toNumber(data.temperature),
          deviceType: 'water-pump',
        });

        // If there's an "after" reading, add it as a separate entry
        if (
          data.soilMoistureAfter !== undefined ||
          data.temperatureAfter !== undefined
        ) {
          readings.push({
            timestamp: timestampDate.getTime() + 60000, // 1 minute after
            date: data.turnOnDate || timestampDate.toISOString().split('T')[0],
            soilMoisture:
              data.soilMoistureAfter !== undefined
                ? toNumber(data.soilMoistureAfter)
                : toNumber(data.soilMoisture),
            temperature:
              data.temperatureAfter !== undefined
                ? toNumber(data.temperatureAfter)
                : toNumber(data.temperature),
            deviceType: 'water-pump',
          });
        }
      }
    });

    return readings.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error fetching water pump analytics:', error);
    return [];
  }
}

export async function getMistingAnalytics(daysBack: number = 7): Promise<SensorReading[]> {
  try {
    const querySnapshot = await getDocs(collection(firestore, MISTING_COLLECTION));
    const readings: SensorReading[] = [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp ?? data.mistingSchedule;
      const timestampDate = timestampToDate(timestamp);

      if (timestampDate && timestampDate.getTime() >= cutoffDate.getTime()) {
        readings.push({
          timestamp: timestampDate.getTime(),
          date: data.activationDate || timestampDate.toISOString().split('T')[0],
          humidity: toNumber(data.humidity),
          temperature: toNumber(data.temperature),
          deviceType: 'misting',
        });

        // If there's an "after" reading, add it as a separate entry
        if (
          data.humidityAfter !== undefined ||
          data.temperatureAfter !== undefined
        ) {
          readings.push({
            timestamp: timestampDate.getTime() + 60000,
            date: data.activationDate || timestampDate.toISOString().split('T')[0],
            humidity:
              data.humidityAfter !== undefined
                ? toNumber(data.humidityAfter)
                : toNumber(data.humidity),
            temperature:
              data.temperatureAfter !== undefined
                ? toNumber(data.temperatureAfter)
                : toNumber(data.temperature),
            deviceType: 'misting',
          });
        }
      }
    });

    return readings.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error fetching misting analytics:', error);
    return [];
  }
}

export async function getFanAnalytics(daysBack: number = 7): Promise<SensorReading[]> {
  try {
    const querySnapshot = await getDocs(collection(firestore, FAN_COLLECTION));
    const readings: SensorReading[] = [];

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const timestamp = data.timestamp ?? data.fanSchedule;
      const timestampDate = timestampToDate(timestamp);

      if (timestampDate && timestampDate.getTime() >= cutoffDate.getTime()) {
        readings.push({
          timestamp: timestampDate.getTime(),
          date: data.activationDate || timestampDate.toISOString().split('T')[0],
          temperature: toNumber(data.temperature),
          humidity: toNumber(data.humidity),
          deviceType: 'fan',
        });

        // If there's an "after" reading, add it as a separate entry
        if (
          data.temperatureAfter !== undefined ||
          data.humidityAfter !== undefined
        ) {
          readings.push({
            timestamp: timestampDate.getTime() + 60000,
            date: data.activationDate || timestampDate.toISOString().split('T')[0],
            temperature:
              data.temperatureAfter !== undefined
                ? toNumber(data.temperatureAfter)
                : toNumber(data.temperature),
            humidity:
              data.humidityAfter !== undefined
                ? toNumber(data.humidityAfter)
                : toNumber(data.humidity),
            deviceType: 'fan',
          });
        }
      }
    });

    return readings.sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error fetching fan analytics:', error);
    return [];
  }
}

export async function getAllSensorAnalytics(daysBack: number = 7): Promise<AnalyticsData> {
  try {
    const [waterPumpData, mistingData, fanData] = await Promise.all([
      getWaterPumpAnalytics(daysBack),
      getMistingAnalytics(daysBack),
      getFanAnalytics(daysBack),
    ]);

    const allReadings = [...waterPumpData, ...mistingData, ...fanData];

    const soilMoistureReadings = allReadings.filter(
      (r) => r.soilMoisture !== undefined && r.deviceType === 'water-pump'
    );
    const temperatureReadings = allReadings.filter((r) => r.temperature !== undefined);
    const humidityReadings = allReadings.filter((r) => r.humidity !== undefined);

    const allDates = allReadings.map((r) => r.timestamp);
    const minDate = Math.min(...allDates);
    const maxDate = Math.max(...allDates);

    const startDate = new Date(minDate).toISOString().split('T')[0];
    const endDate = new Date(maxDate).toISOString().split('T')[0];

    return {
      soilMoistureReadings: soilMoistureReadings.sort((a, b) => a.timestamp - b.timestamp),
      temperatureReadings: temperatureReadings.sort((a, b) => a.timestamp - b.timestamp),
      humidityReadings: humidityReadings.sort((a, b) => a.timestamp - b.timestamp),
      dateRange: {
        start: startDate,
        end: endDate,
      },
    };
  } catch (error) {
    console.error('Error fetching all sensor analytics:', error);
    return {
      soilMoistureReadings: [],
      temperatureReadings: [],
      humidityReadings: [],
      dateRange: {
        start: '',
        end: '',
      },
    };
  }
}

export function getAverageValue(readings: SensorReading[], field: 'soilMoisture' | 'temperature' | 'humidity'): number {
  if (readings.length === 0) return 0;
  const sum = readings.reduce((acc, reading) => {
    const value = reading[field];
    return acc + (typeof value === 'number' ? value : 0);
  }, 0);
  return Math.round((sum / readings.length) * 100) / 100;
}

export function getMinMaxValue(readings: SensorReading[], field: 'soilMoisture' | 'temperature' | 'humidity'): { min: number; max: number } {
  if (readings.length === 0) return { min: 0, max: 0 };
  
  const values = readings
    .map((r) => r[field])
    .filter((v) => typeof v === 'number') as number[];
  
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
