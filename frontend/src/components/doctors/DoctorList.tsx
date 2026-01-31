import React from "react";
import type { DoctorDirectoryItem } from "../../api/doctorDirectory.api";
import DoctorCard from "./DoctorCard";

export type DoctorListProps = {
	doctors: DoctorDirectoryItem[];
	selectedDoctorId: string | null;
	onSelectDoctor: (doctorId: string) => void;
	loading?: boolean;
	error?: string | null;
};

export default function DoctorList({
	doctors,
	selectedDoctorId,
	onSelectDoctor,
	loading,
	error,
}: DoctorListProps) {
	if (loading) {
		return (
			<div className="space-y-4">
				<div className="h-40 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100" />
				<div className="h-40 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-red-100">
				<p className="text-sm font-medium text-red-700">{error}</p>
			</div>
		);
	}

	if (!doctors.length) {
		return (
			<div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
				<p className="text-sm text-gray-600">No doctors available.</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{doctors.map((doctor) => (
				<DoctorCard
					key={doctor.id}
					doctor={doctor}
					selected={doctor.id === selectedDoctorId}
					onSelect={onSelectDoctor}
				/>
			))}
		</div>
	);
}
