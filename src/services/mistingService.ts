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
import { MistingRecord, MistingDayStats } from '../types/mistingFan';

const MISTING_COLLECTION = 'misting-records';

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

function normalizeMistingRecord(id: string, data: any): MistingRecord {
  const timestamp = data.timestamp ?? data.mistingSchedule;
  const timestampDate = timestampToDate(timestamp);

  return {
    id,
    timestamp,
    activationDate: data.activationDate ?? (timestampDate ? formatDateString(timestampDate) : ''),
    activationTime: data.activationTime ?? (timestampDate ? formatTimeString(timestampDate) : ''),
    duration: toNumber(data.duration ?? data.Duration),
    activationCount: toNumber(data.activationCount ?? data.ActivationCount),
    humidity: toNumber(data.humidity),
    humidityAfter: data.humidityAfter !== undefined ? toNumber(data.humidityAfter) : undefined,
    temperature: toNumber(data.temperature),
    temperatureAfter:
      data.temperatureAfter !== undefined ? toNumber(data.temperatureAfter) : undefined,
    status: data.status ?? 'off',
  };
}

export async function logMistingActivation(
  humidity: number,
  temperature: number
): Promise<MistingRecord | null> {
  try {
    const now = new Date();
    const dateString = formatDateString(now);
    const timeString = formatTimeString(now);
    const todayCount = await getTodayActivationCount();

    const record = {
      timestamp: serverTimestamp(),
      activationDate: dateString,
      activationTime: timeString,
      duration: 0,
      activationCount: todayCount + 1,
      humidity,
      temperature,
      status: 'on',
    };

    const docRef = await addDoc(collection(firestore, MISTING_COLLECTION), record);

    return {
      id: docRef.id,
      ...record,
    } as MistingRecord;
  } catch (error) {
    console.error('Error logging misting activation:', error);
    return null;
  }
}

export async function logMistingDeactivation(
  recordId: string,
  durationInSeconds: number,
  humidity: number,
  temperature: number
): Promise<boolean> {
  try {
    const recordRef = doc(firestore, MISTING_COLLECTION, recordId);
    await updateDoc(recordRef, {
      duration: durationInSeconds,
      status: 'off',
      humidityAfter: humidity,
      temperatureAfter: temperature,
    });
    return true;
  } catch (error) {
    console.error('Error logging misting deactivation:', error);
    return false;
  }
}

export async function getTodayActivationCount(): Promise<number> {
  try {
    const today = formatDateString(new Date());
    const q = query(
      collection(firestore, MISTING_COLLECTION),
      where('activationDate', '==', today),
      where('status', '==', 'on')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting today activation count:', error);
    return 0;
  }
}

export async function getMistingRecordsForDate(date: string): Promise<MistingRecord[]> {
  try {
    const q = query(
      collection(firestore, MISTING_COLLECTION),
      where('activationDate', '==', date),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => normalizeMistingRecord(doc.id, doc.data()));
  } catch (error) {
    console.error('Error fetching misting records for date:', error);
    return [];
  }
}

export async function getMistingRecordsForDateRange(
  startDate: string,
  endDate: string
): Promise<MistingRecord[]> {
  try {
    const querySnapshot = await getDocs(collection(firestore, MISTING_COLLECTION));

    return querySnapshot.docs
      .map((doc) => normalizeMistingRecord(doc.id, doc.data()))
      .filter((record) => record.activationDate >= startDate && record.activationDate <= endDate)
      .sort((a, b) => {
        const dateCompare = b.activationDate.localeCompare(a.activationDate);
        if (dateCompare !== 0) return dateCompare;

        const timeA = timestampToDate(a.timestamp)?.getTime() ?? 0;
        const timeB = timestampToDate(b.timestamp)?.getTime() ?? 0;
        return timeB - timeA;
      });
  } catch (error) {
    console.error('Error fetching misting records for date range:', error);
    return [];
  }
}

export async function getMistingDailyStats(date: string): Promise<MistingDayStats | null> {
  try {
    const records = await getMistingRecordsForDate(date);

    if (records.length === 0) {
      return null;
    }

    const totalDuration = records.reduce((sum, record) => sum + (record.duration || 0), 0);
    const totalActivations = records.length;

    return {
      date,
      totalActivations,
      totalDuration,
      records,
    };
  } catch (error) {
    console.error('Error getting daily stats:', error);
    return null;
  }
}

export async function getLatestMistingActivity(daysBack: number = 30): Promise<MistingRecord[]> {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const startDateString = formatDateString(startDate);
    const endDateString = formatDateString(endDate);

    return await getMistingRecordsForDateRange(startDateString, endDateString);
  } catch (error) {
    console.error('Error fetching latest misting activity:', error);
    return [];
  }
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs}s`;
  }

  return `${minutes}m ${secs}s`;
}
