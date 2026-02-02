"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import api from "@/lib/api";

interface Use2FAReturn {

  show2FAModal: boolean;
  qrCode: string;
  twoFactorSecret: string;
  verificationCode: string;
  showDisable2FAModal: boolean;
  disable2FACode: string;

  setShow2FAModal: (show: boolean) => void;
  setVerificationCode: (code: string) => void;
  setShowDisable2FAModal: (show: boolean) => void;
  setDisable2FACode: (code: string) => void;

  handleEnable2FA: () => Promise<void>;
  handleVerify2FA: (onSuccess: () => void) => Promise<void>;
  handleDisable2FA: (onSuccess: () => void) => Promise<void>;
}

export const use2FA = (): Use2FAReturn => {
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [disable2FACode, setDisable2FACode] = useState("");

  const handleEnable2FA = async () => {
    try {
      const response = await api.post("/auth/2fa/enable");
      const data = response.data;
      
      setQrCode(data.qrCodeUrl);
      setTwoFactorSecret(data.secret);
      setShow2FAModal(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to generate 2FA QR code";
      toast.error(errorMessage);
    }
  };

  const handleVerify2FA = async (onSuccess: () => void) => {
    try {
      await api.post("/auth/2fa/verify", { code: verificationCode });
      
      onSuccess();
      setShow2FAModal(false);
      setVerificationCode("");
      toast.success("Two-factor authentication enabled successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid verification code';
      toast.error(errorMessage);
    }
  };

  const handleDisable2FA = async (onSuccess: () => void) => {
    if (!disable2FACode || disable2FACode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    try {
      await api.post("/auth/2fa/disable", { code: disable2FACode });
      
      onSuccess();
      setShowDisable2FAModal(false);
      setDisable2FACode("");
      toast.success("Two-factor authentication disabled successfully!");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to disable 2FA";
      toast.error(errorMessage);
    }
  };

  return {

    show2FAModal,
    qrCode,
    twoFactorSecret,
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
  };
};