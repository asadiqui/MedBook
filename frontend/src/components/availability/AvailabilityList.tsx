import { AvailabilitySlot } from "@/types/availability";

interface AvailabilityListProps {
  availability: AvailabilitySlot[];
  onDelete: (id: string) => void;
  deletingId?: string | null;
}

export default function AvailabilityList({
  availability,
  onDelete,
  deletingId,
}: AvailabilityListProps) {
  if (availability.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-gray-500 text-sm">
          No availability yet. Create your first slot.
        </p>
      </div>
    );
  }

  // 🔹 Group by date
  const grouped = availability.reduce<Record<string, AvailabilitySlot[]>>(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = [];
      acc[slot.date].push(slot);
      return acc;
    },
    {}
  );

  const handleDeleteClick = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this availability slot?"
    );
    if (confirmed) onDelete(id);
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, slots]) => (
        <div key={date} className="space-y-2">
          {/* 📅 Date Header */}
          <h2 className="text-lg font-semibold text-gray-800 border-b pb-1">
            📅 {date}
          </h2>

          {/* Slots under this date */}
          <div className="space-y-2 pl-4">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between bg-white border rounded-md p-3 shadow-sm"
              >
                <span className="text-gray-700">
                  {slot.startTime} – {slot.endTime}
                </span>

                <button
                  onClick={() => handleDeleteClick(slot.id)}
                  disabled={deletingId === slot.id}
                  className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deletingId === slot.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
