import { firestore } from './firebaseConfig';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { WaterPumpRecord, WaterPumpDayStats } from '../types/waterPump';

const WATER_PUMP_COLLECTION = 'water-pump-records';

export function formatDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTimeString(date: Date): string {
  return date.toTimeString().split(' ')[0];
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

function toNumber(value: any, fallback = 0): number {
  if (typeof value === 'number') return value;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function normalizeWaterPumpRecord(id: string, data: any): WaterPumpRecord {
  const timestamp = data.timestamp ?? data.Water_Schdule ?? data.waterSchedule;
  const timestampDate = timestampToDate(timestamp);

  return {
    id,
    timestamp,
    turnOnDate: data.turnOnDate ?? (timestampDate ? formatDateString(timestampDate) : ''),
    turnOnTime: data.turnOnTime ?? (timestampDate ? formatTimeString(timestampDate) : ''),
    duration: toNumber(data.duration ?? data.Duration),
    turnOnCount: toNumber(data.turnOnCount ?? data.TurnOnCount),
    soilMoisture: toNumber(data.soilMoisture),
    soilMoistureAfter:
      data.soilMoistureAfter !== undefined ? toNumber(data.soilMoistureAfter) : undefined,
    temperature: toNumber(data.temperature),
    temperatureAfter:
      data.temperatureAfter !== undefined ? toNumber(data.temperatureAfter) : undefined,
    status: data.status ?? 'off',
  };
}

export async function logWaterPumpTurnOn(
  soilMoisture: number,
  temperature: number
): Promise<WaterPumpRecord | null> {
  try {
    const now = new Date();
    const dateString = formatDateString(now);
    const timeString = formatTimeString(now);
    const todayCount = await getTodayTurnOnCount();

    const record = {
      timestamp: serverTimestamp(),
      turnOnDate: dateString,
      turnOnTime: timeString,
      duration: 0,
      turnOnCount: todayCount + 1,
      soilMoisture,
      temperature,
      status: 'on',
    };

    const docRef = await addDoc(collection(firestore, WATER_PUMP_COLLECTION), record);

    return {
      id: docRef.id,
      ...record,
    } as WaterPumpRecord;
  } catch (error) {
    console.error('Error logging water pump turn-on:', error);
    return null;
  }
}

export async function logWaterPumpTurnOff(
  recordId: string,
  durationInSeconds: number,
  soilMoisture: number,
  temperature: number
): Promise<boolean> {
  try {
    const recordRef = doc(firestore, WATER_PUMP_COLLECTION, recordId);
    await updateDoc(recordRef, {
      duration: durationInSeconds,
      status: 'off',
      soilMoistureAfter: soilMoisture,
      temperatureAfter: temperature,
    });
    return true;
  } catch (error) {
    console.error('Error logging water pump turn-off:', error);
    return false;
  }
}

export async function getTodayTurnOnCount(): Promise<number> {
  try {
    const today = formatDateString(new Date());
    const q = query(
      collection(firestore, WATER_PUMP_COLLECTION),
      where('turnOnDate', '==', today),
      where('status', '==', 'on')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting today turn-on count:', error);
    return 0;
  }
}

export async function getWaterPumpRecordsForDate(
  date: string
): Promise<WaterPumpRecord[]> {
  try {
    const q = query(
      collection(firestore, WATER_PUMP_COLLECTION),
      where('turnOnDate', '==', date),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => normalizeWaterPumpRecord(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching water pump records for date:', error);
    return [];
  }
}

export async function getWaterPumpRecordsForDateRange(
  startDate: string,
  endDate: string
): Promise<WaterPumpRecord[]> {
  try {
    const querySnapshot = await getDocs(collection(firestore, WATER_PUMP_COLLECTION));

    return querySnapshot.docs
      .map((doc) => normalizeWaterPumpRecord(doc.id, doc.data()))
      .filter((record) => record.turnOnDate >= startDate && record.turnOnDate <= endDate)
      .sort((a, b) => {
        const dateCompare = b.turnOnDate.localeCompare(a.turnOnDate);
        if (dateCompare !== 0) return dateCompare;

        const timeA = timestampToDate(a.timestamp)?.getTime() ?? 0;
        const timeB = timestampToDate(b.timestamp)?.getTime() ?? 0;
        return timeB - timeA;
      });
  } catch (error) {
    console.error('Error fetching water pump records for date range:', error);
    return [];
  }
}

export async function getWaterPumpDailyStats(
  date: string
): Promise<WaterPumpDayStats | null> {
  try {
    const records = await getWaterPumpRecordsForDate(date);

    if (records.length === 0) {
      return null;
    }

    const totalDuration = records.reduce((sum, record) => sum + (record.duration || 0), 0);
    const totalTurnsOn = records.length;

    return {
      date,
      totalTurnsOn,
      totalDuration,
      records,
    };
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }

  return `${secs}s`;
}

export async function getLatestWaterPumpActivity(): Promise<WaterPumpRecord[]> {
  try {
    // Fetch all records from Firestore without date filtering
    const querySnapshot = await getDocs(collection(firestore, WATER_PUMP_COLLECTION));

    return querySnapshot.docs
      .map((doc) => normalizeWaterPumpRecord(doc.id, doc.data()))
      .sort((a, b) => {
        const dateCompare = b.turnOnDate.localeCompare(a.turnOnDate);
        if (dateCompare !== 0) return dateCompare;

        const timeA = timestampToDate(a.timestamp)?.getTime() ?? 0;
        const timeB = timestampToDate(b.timestamp)?.getTime() ?? 0;
        return timeB - timeA;
      });
  } catch (error) {
    console.error('Error getting latest water pump activity:', error);
    return [];
  }
}
