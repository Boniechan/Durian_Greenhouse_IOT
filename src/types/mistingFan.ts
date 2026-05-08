export interface MistingRecord {
  id: string;
  timestamp: any; // Firestore timestamp - can be Timestamp object or plain object
  activationDate: string; // YYYY-MM-DD format
  activationTime: string; // HH:MM:SS format
  duration: number; // Duration in seconds
  activationCount: number; // Number of times misting activated today
  humidity: number; // Humidity percentage
  humidityAfter?: number;
  temperature: number; // Temperature when misting activated
  temperatureAfter?: number;
  status: string | boolean; // 'on'/'off' from app records, boolean from device records
}

export interface FanRecord {
  id: string;
  timestamp: any; // Firestore timestamp - can be Timestamp object or plain object
  activationDate: string; // YYYY-MM-DD format
  activationTime: string; // HH:MM:SS format
  duration: number; // Duration in seconds
  activationCount: number; // Number of times fan activated today
  temperature: number; // Temperature when fan activated
  temperatureAfter?: number;
  humidity: number; // Humidity percentage
  humidityAfter?: number;
  status: string | boolean; // 'on'/'off' from app records, boolean from device records
}

export interface MistingDayStats {
  date: string; // YYYY-MM-DD format
  totalActivations: number;
  totalDuration: number; // Total duration in seconds
  records: MistingRecord[];
}

export interface FanDayStats {
  date: string; // YYYY-MM-DD format
  totalActivations: number;
  totalDuration: number; // Total duration in seconds
  records: FanRecord[];
}
