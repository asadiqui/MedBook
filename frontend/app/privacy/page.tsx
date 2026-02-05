import Link from "next/link";

export default function PrivacyPolicy() {
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
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: February 5, 2026</p>

          <div className="prose prose-blue max-w-none space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introduction</h2>
              <p>
                MedBook ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our healthcare 
                platform. Please read this privacy policy carefully.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">2.1 Personal Information</h3>
              <p>We collect personal information that you provide to us, including:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Name, email address, phone number</li>
                <li>Date of birth and gender</li>
                <li>Medical history and health information</li>
                <li>Insurance information</li>
                <li>Payment information</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">2.2 Healthcare Provider Information</h3>
              <p>For healthcare providers, we collect:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Professional credentials and licenses</li>
                <li>Specialty and practice information</li>
                <li>Professional documents and certifications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">2.3 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>IP address and browser information</li>
                <li>Device information and unique identifiers</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>To provide and maintain our Service</li>
                <li>To facilitate appointment booking and healthcare services</li>
                <li>To communicate with you about your appointments and account</li>
                <li>To process payments and prevent fraud</li>
                <li>To improve our Service and develop new features</li>
                <li>To comply with legal obligations and protect our rights</li>
                <li>To send you updates, newsletters, and marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. HIPAA Compliance</h2>
              <p>
                MedBook complies with the Health Insurance Portability and Accountability Act (HIPAA) and other 
                applicable healthcare privacy laws. Protected Health Information (PHI) is handled with the highest 
                level of security and confidentiality.
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>All PHI is encrypted in transit and at rest</li>
                <li>Access to PHI is restricted to authorized personnel only</li>
                <li>We maintain detailed audit logs of PHI access</li>
                <li>Business Associate Agreements are in place with third-party service providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Information Sharing and Disclosure</h2>
              <p>We may share your information in the following circumstances:</p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">5.1 With Healthcare Providers</h3>
              <p>
                We share necessary information with healthcare providers to facilitate your appointments and care.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">5.2 With Service Providers</h3>
              <p>
                We may share information with trusted third-party service providers who assist us in operating 
                our platform (e.g., payment processors, cloud hosting providers).
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">5.3 For Legal Requirements</h3>
              <p>
                We may disclose information if required by law, court order, or governmental request.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-4 mb-2">5.4 With Your Consent</h3>
              <p>
                We may share information with third parties when you provide explicit consent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Data Security</h2>
              <p>We implement industry-standard security measures to protect your information:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>End-to-end encryption for sensitive data</li>
                <li>Secure socket layer (SSL) technology</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data security and privacy</li>
              </ul>
              <p className="mt-2">
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Your Privacy Rights</h2>
              <p>You have the following rights regarding your personal information:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Restriction:</strong> Request restriction of processing your information</li>
                <li><strong>Portability:</strong> Request transfer of your information to another service</li>
                <li><strong>Objection:</strong> Object to processing of your information for certain purposes</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent for processing where consent was given</li>
              </ul>
              <p className="mt-2">
                To exercise these rights, please contact us at privacy@medbook.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to provide our Service and comply 
                with legal obligations. Healthcare records are retained in accordance with applicable medical 
                record retention laws. When information is no longer needed, we securely delete or anonymize it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Children's Privacy</h2>
              <p>
                Our Service is not intended for children under 13 years of age. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe your 
                child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">10. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and similar tracking technologies to enhance your experience. You can control 
                cookies through your browser settings. However, disabling cookies may limit your ability to use 
                certain features of our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">11. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of 
                residence. We ensure appropriate safeguards are in place to protect your information in accordance 
                with this Privacy Policy and applicable laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes 
                by posting the new Privacy Policy on this page and updating the "Last updated" date. We encourage 
                you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">13. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, 
                please contact us at:
              </p>
              <div className="mt-2 pl-4">
                <p>Email: privacy@medbook.com</p>
                <p>Data Protection Officer: dpo@medbook.com</p>
                <p>Address: MedBook Healthcare Platform</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
