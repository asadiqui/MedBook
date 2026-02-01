"use client";

import Link from "next/link";

interface TermsAgreementProps {
  agreedToTerms: boolean;
  agreedToVerification?: boolean;
  onTermsChange: (agreed: boolean) => void;
  onVerificationChange?: (agreed: boolean) => void;
  showVerification?: boolean;
  error?: string;
}

export const TermsAgreement: React.FC<TermsAgreementProps> = ({
  agreedToTerms,
  agreedToVerification = false,
  onTermsChange,
  onVerificationChange,
  showVerification = false,
  error,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="terms"
          checked={agreedToTerms}
          onChange={(e) => onTermsChange(e.target.checked)}
          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="terms" className="text-sm text-gray-700">
          I agree to the{" "}
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          <span className="text-red-500">*</span>
        </label>
      </div>

      {showVerification && (
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="verification"
            checked={agreedToVerification}
            onChange={(e) => onVerificationChange?.(e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="verification" className="text-sm text-gray-700">
            I understand that my account will be subject to verification and approval before I can start accepting patients
            <span className="text-red-500">*</span>
          </label>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};