import React, { useRef } from "react";
import { Camera, X } from "lucide-react";

const CameraInput = ({ onPhotoCaptured }: { onPhotoCaptured: (file: File) => void }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenCamera = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onPhotoCaptured(file);
  };

  return (
    <div>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <button type="button" onClick={handleOpenCamera} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors">
        <Camera size={20} />
        Buka Kamera
      </button>
    </div>
  );
};

export default CameraInput;
