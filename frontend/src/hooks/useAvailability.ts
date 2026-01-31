import { useEffect, useState } from "react";
import {
  getAvailability,
  createAvailability,
  deleteAvailability as deleteAvailabilityApi,
} from "../api/availability.api";
import { AvailabilitySlot } from "../types/availability";

interface CreateAvailabilityInput {
  date: string;
  startTime: string;
  endTime: string;
}

export type UseAvailabilityOptions = {
  doctorId?: string;
  date?: string;
  enabled?: boolean;
	accessToken?: string;
};

export function useAvailability(options: UseAvailabilityOptions = {}) {
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { doctorId, date, enabled = true, accessToken } = options;

  // Fetch list
  const fetchAvailability = async () => {
    try {
      setError(null);
      const data = await getAvailability({ doctorId, date });
      setAvailability(data);
    } catch (err: any) {
      setError(err.message || "Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled) {
      setAvailability([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId, date, enabled]);

  // Create
  const create = async (data: CreateAvailabilityInput) => {
    try {
      setError(null);
    if (!doctorId) {
      throw new Error("doctorId is required to create availability");
    }
    await createAvailability(
      {
        doctorId,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
      },
      { accessToken },
    );

      // Refresh list after creating
      await fetchAvailability();
    } catch (err: any) {
      setError(err.message || "Failed to create availability");
      throw err;
    }
  };

  // Delete
  const remove = async (id: string) => {
    try {
      setDeletingId(id);
      setError(null);

      await deleteAvailabilityApi(id, { accessToken });

      // Refresh list after delete
      await fetchAvailability();
    } catch (err: any) {
      setError(err.message || "Failed to delete availability");
    } finally {
      setDeletingId(null);
    }
  };

  return {
    availability,
    loading,
    error,
    deletingId,
    createAvailability: create,
    deleteAvailability: remove,
    refetch: fetchAvailability,
  };
}
