import Link from "next/link";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <Link 
            href="/" 
            className="text-blue-600 hover:text-blue-700 mb-6 inline-block"
          >
            ← Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600 mb-8">Last updated: February 5, 2026</p>

          <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using MedBook ("the Service"), you accept and agree to be bound by the terms 
                and provision of this agreement. If you do not agree to these Terms of Service, please do not 
                use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Description of Service</h2>
              <p>
                MedBook is a healthcare platform that connects patients with healthcare providers. The Service 
                allows users to:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Search and find qualified healthcare professionals</li>
                <li>Book medical appointments</li>
                <li>Communicate with healthcare providers through secure messaging</li>
                <li>Manage their healthcare records and appointments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. User Responsibilities</h2>
              <p>As a user of MedBook, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access to your account</li>
                <li>Use the Service in compliance with all applicable laws and regulations</li>
                <li>Not use the Service for any illegal or unauthorized purpose</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Healthcare Provider Verification</h2>
              <p>
                MedBook verifies the credentials of healthcare providers on the platform. However, users are 
                responsible for making their own decisions regarding their healthcare. MedBook does not provide 
                medical advice and is not responsible for the quality of care provided by healthcare professionals 
                on the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Appointment Booking and Cancellation</h2>
              <p>
                Users can book appointments through the Service. Cancellation policies may vary by healthcare 
                provider. Users are responsible for adhering to cancellation policies and may be subject to fees 
                for late cancellations or no-shows.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Communication and Privacy</h2>
              <p>
                All communications through the MedBook platform are encrypted and secure. However, for medical 
                emergencies, please contact emergency services immediately instead of using the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
              <p>
                All content on the MedBook platform, including text, graphics, logos, and software, is the 
                property of MedBook and is protected by intellectual property laws. Users may not reproduce, 
                distribute, or create derivative works without explicit permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Limitation of Liability</h2>
              <p>
                MedBook is provided "as is" without any warranties. We are not liable for any damages arising 
                from the use of the Service, including but not limited to direct, indirect, incidental, or 
                consequential damages.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Termination</h2>
              <p>
                We reserve the right to terminate or suspend your account at our sole discretion, without notice, 
                for conduct that we believe violates these Terms of Service or is harmful to other users, us, or 
                third parties.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms of Service at any time. We will notify users of any 
                material changes. Continued use of the Service after changes constitutes acceptance of the modified 
                terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of the 
                jurisdiction in which MedBook operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-2 pl-4">
                <p>Email: support@medbook.com</p>
                <p>Address: MedBook Healthcare Platform</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
