import { useCallback, useEffect, useState } from "react";
import { DoctorDirectoryItem, getDoctorDirectory } from "@/lib/api/doctorDirectory";

export function useDoctorDirectory() {
  const [doctors, setDoctors] = useState<DoctorDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDoctorDirectory();
      setDoctors(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || "Failed to load doctors");
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { doctors, loading, error, refresh };
}
