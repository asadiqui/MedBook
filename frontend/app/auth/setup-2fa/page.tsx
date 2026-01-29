"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, CheckCircle2, Copy, Check } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function Setup2FAPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (step === 1) {
      generateQRCode();
    }
  }, [step]);

  const generateQRCode = async () => {
    // TODO: Implement API call to generate QR code
    console.log("Generating QR code for 2FA setup");

    // Mock data
    setQrCode("https://via.placeholder.com/200x200?text=QR+Code");
    setSecret("JBSWY3DPEHPK3PXP");
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // TODO: Implement 2FA verification API call
    console.log("Verifying 2FA code:", verificationCode);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      if (verificationCode === "123456") {
        // Mock backup codes
        setBackupCodes([
          "A1B2-C3D4-E5F6",
          "G7H8-I9J0-K1L2",
          "M3N4-O5P6-Q7R8",
          "S9T0-U1V2-W3X4",
          "Y5Z6-A7B8-C9D0",
          "E1F2-G3H4-I5J6",
          "K7L8-M9N0-O1P2",
          "Q3R4-S5T6-U7V8"
        ]);
        setStep(3);
      } else {
        setError("Invalid verification code. Please try again.");
      }
    }, 1500);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadBackupCodes = () => {
    const element = document.createElement("a");
    const file = new Blob([backupCodes.join("\n")], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "sa7ti-backup-codes.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-2/5 relative bg-gradient-to-br from-blue-600 to-teal-500 items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1920&q=95&fit=crop&crop=faces')] bg-cover bg-center opacity-20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-blue-900/50 to-blue-950/70"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-white px-12 max-w-md">
          <Shield className="h-16 w-16 mb-6" />
          <h1 className="text-4xl font-bold mb-4">Enhanced Security</h1>
          <p className="text-lg text-blue-100">
            Two-Factor Authentication adds an extra layer of security to your account by requiring a verification code in addition to your password.
          </p>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 relative">
        {/* Decorative background for smaller screens */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none lg:hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-100 rounded-full blur-3xl opacity-30"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="mb-8">
            <Logo size="md" />
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                1
              </div>
              <span className="text-sm font-medium text-gray-700">Scan QR</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"} transition-all`} style={{ width: step >= 2 ? "100%" : "0%" }}></div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                2
              </div>
              <span className="text-sm font-medium text-gray-700">Verify</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full ${step >= 3 ? "bg-blue-600" : "bg-gray-200"} transition-all`} style={{ width: step >= 3 ? "100%" : "0%" }}></div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>
                3
              </div>
              <span className="text-sm font-medium text-gray-700">Backup</span>
            </div>
          </div>

          {/* Step 1: Scan QR Code */}
          {step === 1 && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
                <p className="text-gray-600">
                  Use an authenticator app like Google Authenticator or Authy to scan this QR code.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex justify-center mb-6">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono">
                      {secret}
                    </code>
                    <button
                      onClick={copySecret}
                      className="p-2 hover:bg-gray-100 rounded-lg transition"
                      title="Copy secret"
                    >
                      {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5 text-gray-600" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Continue
              </button>
            </>
          )}

          {/* Step 2: Verify Code */}
          {step === 2 && (
            <>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Code</h2>
                <p className="text-gray-600">
                  Enter the 6-digit code from your authenticator app to confirm setup.
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest font-mono"
                    placeholder="000000"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || verificationCode.length !== 6}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Backup Codes */}
          {step === 3 && (
            <>
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">2FA Enabled!</h2>
                <p className="text-gray-600">
                  Save these backup codes in a secure place. You can use them to access your account if you lose your device.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono text-center">
                      {code}
                    </code>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={copyBackupCodes}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied!" : "Copy Codes"}
                  </button>
                  <button
                    onClick={downloadBackupCodes}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                  >
                    Download
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  <strong>Important:</strong> Store these codes securely. Each code can only be used once.
                </p>
              </div>

              <Link
                href="/profile/patient"
                className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-center"
              >
                Complete Setup
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
