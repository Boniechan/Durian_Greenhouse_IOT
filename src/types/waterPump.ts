export interface WaterPumpRecord {
  id: string;
  timestamp: any; // Firestore timestamp - can be Timestamp object or plain object
  turnOnDate: string; // YYYY-MM-DD format
  turnOnTime: string; // HH:MM:SS format
  duration: number; // Duration in seconds
  turnOnCount: number; // Number of times pump turned on today
  soilMoisture: number; // Soil moisture percentage from Realtime Database
  soilMoistureAfter?: number;
  temperature: number; // Temperature when pump turned on
  temperatureAfter?: number;
  status: string | boolean; // 'on'/'off' from app records, boolean from device records
}

export interface WaterPumpDayStats {
  date: string; // YYYY-MM-DD format
  totalTurnsOn: number;
  totalDuration: number; // Total duration in seconds
  records: WaterPumpRecord[];
}
