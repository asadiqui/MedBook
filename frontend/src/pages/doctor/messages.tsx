import DoctorLayout from "../../components/layout/DoctorLayout";

export default function DoctorMessagesPage() {
	return (
		<DoctorLayout title="Messages">
			<div className="rounded-xl border bg-white p-4 shadow-sm">
				<p className="text-sm text-gray-600">No messages yet.</p>
			</div>
		</DoctorLayout>
	);
}
