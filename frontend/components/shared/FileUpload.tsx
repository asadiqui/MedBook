import React from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  id?: string;
  label?: React.ReactNode;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept = "*", id = "file-upload", label = "Upload File" }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <label htmlFor={id} className="cursor-pointer inline-flex items-center gap-2 text-blue-600 hover:underline">
      {label}
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
};
