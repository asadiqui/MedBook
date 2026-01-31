export interface AvailabilitySlot {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string;
    endTime: string;
    doctorId: string;
}

// Backwards compatibility with earlier imports
export type Availabilityslot = AvailabilitySlot;