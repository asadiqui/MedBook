import { useState, FormEvent } from "react";

export interface AvailabilityFormValues {
  date: string;
  startTime: string;
  endTime: string;
}

interface AvailabilityFormProps {
  onSubmit: (values: AvailabilityFormValues) => void;
  error?: string | null;
  loading?: boolean;
}

export default function AvailabilityForm({
  onSubmit,
  error,
  loading = false,
}: AvailabilityFormProps) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Basic front-end validation
    if (!date || !startTime || !endTime) {
      return;
    }

    onSubmit({ date, startTime, endTime });
  };

  const timeOptions = (() => {
    // 08:00 -> 20:00 inclusive, hourly steps only
    const opts: Array<{ value: string; label: string }> = [];
    for (let hour = 8; hour <= 20; hour++) {
      const hh = String(hour).padStart(2, "0");
      const value = `${hh}:00`;
      const hour12 = ((hour + 11) % 12) + 1;
      const suffix = hour >= 12 ? "PM" : "AM";
      const label = `${hour12}:00 ${suffix}`;
      opts.push({ value, label });
    }
    return opts;
  })();

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 border rounded-lg bg-white shadow-sm"
    >
      <h2 className="text-xl font-semibold">Add Availability</h2>

      {/* Date */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="date" className="text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Start Time */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="startTime" className="text-sm font-medium text-gray-700">
          Start Time
        </label>
      <select
        id="startTime"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select a start time</option>
        {timeOptions.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      </div>

      {/* End Time */}
      <div className="flex flex-col space-y-1">
        <label htmlFor="endTime" className="text-sm font-medium text-gray-700">
          End Time
        </label>
      <select
        id="endTime"
        value={endTime}
        onChange={(e) => setEndTime(e.target.value)}
        className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select an end time</option>
        {timeOptions.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      </div>

      {/* Submit Button */}
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? "Creating..." : "Add Availability"}
    </button>


      {/* Error Message Area */}
  {error && (
    <div className="p-3 rounded-md bg-red-50 border border-red-200">
      <p className="text-red-700 text-sm font-medium">
        {error}
      </p>
    </div>
  )}

    </form>
  );
}
