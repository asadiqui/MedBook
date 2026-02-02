"use client";

import { Lock, Shield } from "lucide-react";
import { use2FA } from "@/lib/hooks/use2FA";
import { Modal } from "../shared/Modal";

interface SecuritySettingsProps {
  isOAuthUser: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  onPasswordChangeClick: () => void;
  on2FAStatusChange: (enabled: boolean) => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({
  isOAuthUser,
  twoFactorEnabled,
  lastPasswordChange,
  onPasswordChangeClick,
  on2FAStatusChange,
}) => {
  const {
    show2FAModal,
    qrCode,
    verificationCode,
    showDisable2FAModal,
    disable2FACode,
    setShow2FAModal,
    setVerificationCode,
    setShowDisable2FAModal,
    setDisable2FACode,
    handleEnable2FA,
    handleVerify2FA,
    handleDisable2FA,
  } = use2FA();

  const handleEnableClick = () => {
    handleEnable2FA();
  };

  const handleVerifyClick = () => {
    handleVerify2FA(() => on2FAStatusChange(true));
  };

  const handleDisableClick = () => {
    handleDisable2FA(() => on2FAStatusChange(false));
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          <p className="text-sm text-gray-600">Manage your password and account protection.</p>
        </div>

        <div className="p-6 space-y-4">
          {}
          {!isOAuthUser && (
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg">
                  <Lock className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Password</h3>
                  <p className="text-xs text-gray-600">Last changed {lastPasswordChange}</p>
                </div>
              </div>
              <button
                onClick={onPasswordChangeClick}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Change Password
              </button>
            </div>
          )}

          {}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4 flex-1">
              <div className="bg-white p-2 rounded-lg">
                <Shield className="h-5 w-5 text-gray-700" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-xs text-gray-600">Add an extra layer of security to your account.</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {twoFactorEnabled ? (
                <>
                  <span className="text-xs font-medium text-green-600">Enabled</span>
                  <button
                    onClick={() => setShowDisable2FAModal(true)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Disable
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEnableClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  Enable
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {}
      {show2FAModal && (
        <Modal isOpen={show2FAModal} onClose={() => setShow2FAModal(false)} title="Enable Two-Factor Authentication">
          <div className="text-center mb-6">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Enable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mt-2">
              Scan the QR code below with your authenticator app, then enter the 6-digit code.
            </p>
          </div>
          {qrCode && (
            <div className="text-center mb-6">
              <img src={qrCode} alt="2FA QR Code" className="mx-auto border rounded-lg" />
            </div>
          )}
          <div className="space-y-4">
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-lg tracking-widest"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShow2FAModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyClick}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Verify
              </button>
            </div>
          </div>
        </Modal>
      )}

      {}
      {showDisable2FAModal && (
        <Modal isOpen={showDisable2FAModal} onClose={() => setShowDisable2FAModal(false)} title="Disable Two-Factor Authentication">
          <div className="text-center mb-6">
            <Shield className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">Disable Two-Factor Authentication</h3>
            <p className="text-sm text-gray-600 mt-2">
              Enter your current 6-digit code to disable two-factor authentication.
            </p>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              value={disable2FACode}
              onChange={(e) => setDisable2FACode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-center text-lg tracking-widest"
              maxLength={6}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisable2FAModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDisableClick}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              >
                Disable
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};