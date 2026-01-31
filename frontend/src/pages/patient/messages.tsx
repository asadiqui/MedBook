import PatientLayout from "../../components/layout/PatientLayout";

export default function PatientMessagesPage() {
	return (
		<PatientLayout title="Messages" subtitle="Your conversations">
			<div className="rounded-2xl border bg-white p-6 shadow-sm">
				<p className="text-sm text-gray-600">Messages are coming soon.</p>
			</div>
		</PatientLayout>
	);
}
