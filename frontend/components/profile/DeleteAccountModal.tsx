"use client";

import { useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { Modal } from "../shared/Modal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessToken: string | null;
  userId: string | null | undefined;
  onAccountDeleted: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  accessToken,
  userId,
  onAccountDeleted,
}) => {
  const [confirmation, setConfirmation] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!accessToken) {
      toast.error("Authentication token not available");
      return;
    }

    if (!userId) {
      toast.error("User ID not available");
      return;
    }

    if (confirmation !== "DELETE") {
      toast.error("Please type 'DELETE' to confirm");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success("Account deleted successfully");
        onAccountDeleted();
      } else {
        const error = await response.json();
        toast.error(error.message || "Failed to delete account");
      }
    } catch (error: any) {
      toast.error("Failed to delete account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Account">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Delete Account</h3>
          <p className="text-sm text-gray-600">This action cannot be undone</p>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">
            Deleting your account will permanently remove all your data, including your profile, appointments, and medical records. This action cannot be undone.
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type "DELETE" to confirm
          </label>
          <input
            type="text"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
            placeholder="Type DELETE here"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isLoading || confirmation !== "DELETE"}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
          >
            {isLoading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
    </Modal>
  );
};