"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface Use2FAReturn {
  // State
  show2FAModal: boolean;
  qrCode: string;
  twoFactorSecret: string;
  verificationCode: string;
  showDisable2FAModal: boolean;
  disable2FACode: string;

  // Actions
  setShow2FAModal: (show: boolean) => void;
  setVerificationCode: (code: string) => void;
  setShowDisable2FAModal: (show: boolean) => void;
  setDisable2FACode: (code: string) => void;

  // Functions
  handleEnable2FA: (accessToken: string | null) => Promise<void>;
  handleVerify2FA: (accessToken: string | null, onSuccess: () => void) => Promise<void>;
  handleDisable2FA: (accessToken: string | null, onSuccess: () => void) => Promise<void>;
}

export const use2FA = (): Use2FAReturn => {
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [disable2FACode, setDisable2FACode] = useState("");

  const handleEnable2FA = async (accessToken: string | null) => {
    if (!accessToken) {
      toast.error("Authentication token not available");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/enable`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCodeUrl);
        setTwoFactorSecret(data.secret);
        setShow2FAModal(true);
      } else {
        toast.error("Failed to generate 2FA QR code");
      }
    } catch (error) {
      toast.error("Failed to enable 2FA");
    }
  };

  const handleVerify2FA = async (accessToken: string | null, onSuccess: () => void) => {
    if (!accessToken) {
      toast.error("Authentication token not available");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            code: verificationCode,
          }),
        }
      );

      if (response.ok) {
        onSuccess();
        setShow2FAModal(false);
        setVerificationCode("");
        toast.success("Two-factor authentication enabled successfully!");
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Invalid verification code' }));
        toast.error(errorData.message || "Invalid verification code");
        // Don't clear the code so user can try again
      }
    } catch (error) {
      toast.error("Failed to verify 2FA");
    }
  };

  const handleDisable2FA = async (accessToken: string | null, onSuccess: () => void) => {
    if (!accessToken) {
      toast.error("Authentication token not available");
      return;
    }

    if (!disable2FACode || disable2FACode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/2fa/disable`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            code: disable2FACode,
          }),
        }
      );

      if (response.ok) {
        onSuccess();
        setShowDisable2FAModal(false);
        setDisable2FACode("");
        toast.success("Two-factor authentication disabled successfully!");
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Invalid verification code' }));
        toast.error(errorData.message || "Failed to disable 2FA");
      }
    } catch (error) {
      toast.error("Failed to disable 2FA");
    }
  };

  return {
    // State
    show2FAModal,
    qrCode,
    twoFactorSecret,
    verificationCode,
    showDisable2FAModal,
    disable2FACode,

    // Actions
    setShow2FAModal,
    setVerificationCode,
    setShowDisable2FAModal,
    setDisable2FACode,

    // Functions
    handleEnable2FA,
    handleVerify2FA,
    handleDisable2FA,
  };
};