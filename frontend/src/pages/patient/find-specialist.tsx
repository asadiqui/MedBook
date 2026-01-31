import { useState } from "react";
import PatientLayout from "../../components/layout/PatientLayout";

// Placeholder doctor data
const PLACEHOLDER_DOCTORS = [
	{
		id: "1",
		name: "Dr. Sarah Jenkins",
		specialty: "Cardiologist",
		photo: null,
		description: "Specializes in heart failure and transplant cardiology with 12 years of experience.",
		rating: 4.9,
		availableTime: "Available Today, 2:00 PM",
		location: "Central Hospital, NY",
		isOnline: true,
	},
	{
		id: "2",
		name: "Dr. Michael Chen",
		specialty: "Neurologist",
		photo: null,
		description: "Expert in stroke management and epilepsy treatment.",
		rating: 4.8,
		availableTime: "Tomorrow, 9:30 AM",
		location: "Downtown Clinic, NY",
		isOnline: true,
	},
	{
		id: "3",
		name: "Dr. Emily Wilson",
		specialty: "Pediatrician",
		photo: null,
		description: "Caring and experienced pediatrician focusing on early childhood development.",
		rating: 5.0,
		availableTime: "Available Today, 4:15 PM",
		location: "Westside Pediatrics",
		isOnline: true,
	},
	{
		id: "4",
		name: "Dr. James Carter",
		specialty: "Dermatologist",
		photo: null,
		description: "Specializing in medical and cosmetic dermatology procedures.",
		rating: 4.7,
		availableTime: "Next Mon, 11:00 AM",
		location: "Skin Health Center",
		isOnline: false,
	},
	{
		id: "5",
		name: "Dr. Olivia Parker",
		specialty: "Orthopedist",
		photo: null,
		description: "Focus on sports medicine and joint replacement surgeries.",
		rating: 4.9,
		availableTime: "Thu, 3:30 PM",
		location: "Orthopedic Inst.",
		isOnline: false,
	},
	{
		id: "6",
		name: "Dr. Robert Fox",
		specialty: "General Practitioner",
		photo: null,
		description: "Provides comprehensive primary care services for families.",
		rating: 4.6,
		availableTime: "Available Today, 5:00 PM",
		location: "City Medical Group",
		isOnline: true,
	},
];

const TIME_SLOTS = [
	"08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
	"14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

function SearchIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
		</svg>
	);
}

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="currentColor" {...props}>
			<path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
		</svg>
	);
}

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<path d="M16 2v4M8 2v4M3 10h18" />
		</svg>
	);
}

function LocationIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
			<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
			<circle cx="12" cy="10" r="3" />
		</svg>
	);
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
			<circle cx="12" cy="12" r="10" />
			<path d="M12 6v6l4 2" />
		</svg>
	);
}

function getInitials(name: string): string {
	const parts = name.split(" ");
	const first = parts[0]?.[0] || "D";
	const last = parts[parts.length - 1]?.[0] || "R";
	return (first + last).toUpperCase();
}

export default function FindSpecialistPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedSpecialty, setSelectedSpecialty] = useState("all");
	const [selectedAvailability, setSelectedAvailability] = useState("anytime");
	const [expandedDoctorId, setExpandedDoctorId] = useState<string | null>(null);
	const [selectedDate, setSelectedDate] = useState("");
	const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
	const [selectedDuration, setSelectedDuration] = useState<60 | 120>(60);
	const [reason, setReason] = useState("");

	const handleBookAppointment = (doctorId: string) => {
		setExpandedDoctorId(expandedDoctorId === doctorId ? null : doctorId);
		setSelectedTimeSlot(null);
		setSelectedDate("");
		setReason("");
	};

	const handleConfirmBooking = () => {
		alert("Booking confirmed! (This is a UI demo)");
		setExpandedDoctorId(null);
		setSelectedTimeSlot(null);
		setSelectedDate("");
		setReason("");
	};

	return (
		<PatientLayout>
			<div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white p-6">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Find a Specialist</h1>
					<p className="mt-2 text-base text-gray-600">
						Book appointments with top-rated doctors in your area. Filter by specialty, availability,
						and more to find the right care for you.
					</p>
				</div>

				{/* Search & Filters Card */}
				<div className="mb-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_1fr_1fr_auto]">
						{/* Search Input */}
						<div>
							<label className="mb-2 block text-sm font-semibold text-gray-700">
								Search Doctor or Condition
							</label>
							<div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 transition focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
								<SearchIcon className="h-5 w-5 text-gray-400" />
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="e.g. Dr. Smith, Cardiology, Flu…"
									className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none"
								/>
							</div>
						</div>

						{/* Specialty Dropdown */}
						<div>
							<label className="mb-2 block text-sm font-semibold text-gray-700">Specialty</label>
							<select
								value={selectedSpecialty}
								onChange={(e) => setSelectedSpecialty(e.target.value)}
								className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
							>
								<option value="all">All Specialties</option>
								<option value="cardiology">Cardiology</option>
								<option value="neurology">Neurology</option>
								<option value="pediatrics">Pediatrics</option>
								<option value="dermatology">Dermatology</option>
								<option value="orthopedics">Orthopedics</option>
								<option value="general">General Practice</option>
							</select>
						</div>

						{/* Availability Dropdown */}
						<div>
							<label className="mb-2 block text-sm font-semibold text-gray-700">Availability</label>
							<div className="relative">
								<CalendarIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
								<select
									value={selectedAvailability}
									onChange={(e) => setSelectedAvailability(e.target.value)}
									className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
								>
									<option value="anytime">Anytime</option>
									<option value="today">Today</option>
									<option value="tomorrow">Tomorrow</option>
									<option value="this-week">This Week</option>
								</select>
							</div>
						</div>

						{/* Search Button */}
						<div className="flex items-end">
							<button
								type="button"
								className="w-full rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 md:w-auto"
							>
								Search
							</button>
						</div>
					</div>
				</div>

				{/* Doctor Cards Grid */}
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{PLACEHOLDER_DOCTORS.map((doctor) => (
						<div key={doctor.id} className="flex flex-col">
							{/* Doctor Card */}
							<div className="flex flex-1 flex-col rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
								{/* Rating Badge */}
								<div className="mb-4 flex items-start justify-between">
									<div className="relative">
										{/* Doctor Photo */}
										<div className="h-20 w-20 overflow-hidden rounded-full bg-gradient-to-br from-blue-100 to-blue-200 ring-2 ring-white shadow-sm">
											<div className="flex h-full w-full items-center justify-center text-xl font-bold text-blue-700">
												{getInitials(doctor.name)}
											</div>
										</div>
										{/* Online Indicator */}
										{doctor.isOnline && (
											<span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-white" />
										)}
									</div>

									<div className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-sm font-semibold text-amber-700">
										<StarIcon className="h-4 w-4 text-amber-500" />
										<span>{doctor.rating.toFixed(1)}</span>
									</div>
								</div>

								{/* Doctor Info */}
								<h3 className="text-xl font-bold text-gray-900">{doctor.name}</h3>
								<p className="mt-1 cursor-pointer text-base font-medium text-blue-600 hover:underline">
									{doctor.specialty}
								</p>

								<p className="mt-3 line-clamp-2 text-sm leading-relaxed text-gray-600">
									{doctor.description}
								</p>

								{/* Divider */}
								<div className="my-4 h-px bg-gray-100" />

								{/* Availability & Location */}
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm text-emerald-600">
										<CalendarIcon className="h-5 w-5" />
										<span className="font-medium">{doctor.availableTime}</span>
									</div>
									<div className="flex items-center gap-2 text-sm text-gray-600">
										<LocationIcon className="h-5 w-5 text-gray-500" />
										<span>{doctor.location}</span>
									</div>
								</div>

								{/* Book Appointment Button */}
								<button
									type="button"
									onClick={() => handleBookAppointment(doctor.id)}
									className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
								>
									Book Appointment
								</button>
							</div>

							{/* Inline Booking Panel */}
							{expandedDoctorId === doctor.id && (
								<div className="mt-4 rounded-xl bg-white p-6 shadow-sm ring-1 ring-blue-100 animate-in fade-in slide-in-from-top-2 duration-200">
									<div className="mb-4 flex items-center justify-between">
										<h4 className="text-lg font-semibold text-gray-900">Book with {doctor.name}</h4>
										<button
											type="button"
											onClick={() => setExpandedDoctorId(null)}
											className="text-sm font-medium text-gray-500 hover:text-gray-700"
										>
											Cancel
										</button>
									</div>

									{/* Date Selector */}
									<div className="mb-4">
										<label className="mb-2 block text-sm font-semibold text-gray-700">
											Select Date
										</label>
										<input
											type="date"
											value={selectedDate}
											onChange={(e) => setSelectedDate(e.target.value)}
											className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
										/>
									</div>

									{/* Duration Selection */}
									<div className="mb-4">
										<label className="mb-2 block text-sm font-semibold text-gray-700">
											Duration
										</label>
										<div className="flex gap-3">
											<button
												type="button"
												onClick={() => setSelectedDuration(60)}
												className={
													"flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition " +
													(selectedDuration === 60
														? "border-blue-600 bg-blue-50 text-blue-700"
														: "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50")
												}
											>
												60 minutes
											</button>
											<button
												type="button"
												onClick={() => setSelectedDuration(120)}
												className={
													"flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition " +
													(selectedDuration === 120
														? "border-blue-600 bg-blue-50 text-blue-700"
														: "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50")
												}
											>
												120 minutes
											</button>
										</div>
									</div>

									{/* Time Slots Grid */}
									<div className="mb-4">
										<label className="mb-2 block text-sm font-semibold text-gray-700">
											Available Time Slots
										</label>
										<div className="grid grid-cols-3 gap-2">
											{TIME_SLOTS.map((time) => {
												const endHour = parseInt(time.split(":")[0]) + (selectedDuration === 60 ? 1 : 2);
												const endTime = `${String(endHour).padStart(2, "0")}:00`;
												const isSelected = selectedTimeSlot === time;

												return (
													<button
														key={time}
														type="button"
														onClick={() => setSelectedTimeSlot(time)}
														className={
															"flex flex-col items-center justify-center rounded-xl border px-3 py-2.5 text-sm font-medium transition " +
															(isSelected
																? "border-blue-600 bg-blue-600 text-white shadow-sm"
																: "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50")
														}
													>
														<div className="flex items-center gap-1">
															<ClockIcon className="h-3.5 w-3.5" />
															<span>{time}</span>
														</div>
														<span className="mt-0.5 text-xs opacity-75">to {endTime}</span>
													</button>
												);
											})}
										</div>
									</div>

									{/* Reason for Visit */}
									<div className="mb-4">
										<label className="mb-2 block text-sm font-semibold text-gray-700">
											Reason for Visit <span className="text-gray-400">(Optional)</span>
										</label>
										<textarea
											value={reason}
											onChange={(e) => setReason(e.target.value)}
											rows={3}
											placeholder="Brief description of your symptoms or request..."
											className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
										/>
									</div>

									{/* Action Buttons */}
									<div className="flex gap-3">
										<button
											type="button"
											onClick={handleConfirmBooking}
											disabled={!selectedDate || !selectedTimeSlot}
											className={
												"flex-1 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 " +
												(selectedDate && selectedTimeSlot
													? "bg-blue-600 hover:bg-blue-700"
													: "cursor-not-allowed bg-blue-300")
											}
										>
											Confirm Booking
										</button>
										<button
											type="button"
											onClick={() => setExpandedDoctorId(null)}
											className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
										>
											Cancel
										</button>
									</div>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</PatientLayout>
	);
}
