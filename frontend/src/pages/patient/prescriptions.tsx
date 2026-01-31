import PatientLayout from "../../components/layout/PatientLayout";

export default function PatientPrescriptionsPage() {
	return (
		<PatientLayout title="Prescriptions" subtitle="Your medications">
			<div className="rounded-2xl border bg-white p-6 shadow-sm">
				<p className="text-sm text-gray-600">Prescriptions are coming soon.</p>
			</div>
		</PatientLayout>
	);
}
