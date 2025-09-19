import { useEffect, useState, useCallback } from "react";
import { onValue, ref, get } from "firebase/database";
import { db } from "../services/firebaseConfig";

export interface GreenhouseData {
  daysSincePlanting?: number;
  livingPlants?: number;
  deadPlants?: number;
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  updatedAt?: number;
}

export function useGreenhouseData() {
  const [data, setData] = useState<GreenhouseData>({});
  const [loading, setLoading] = useState(true);

  // live subscription
  useEffect(() => {
    const r = ref(db, "greenhouse");
    const unsub = onValue(r, (snap) => {
      if (snap.exists()) setData(snap.val());
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // manual refresh (one-shot fetch)
  const refresh = useCallback(async () => {
    setLoading(true);
    const snap = await get(ref(db, "greenhouse"));
    if (snap.exists()) setData(snap.val());
    setLoading(false);
  }, []);

  return { data, loading, refresh };
}
