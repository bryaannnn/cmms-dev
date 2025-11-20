// GenbaAreaGate.tsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../../routes/AuthContext";
import EditFormGenbaArea from "./EditFormGanbaArea";
import ImagePublic from "../../../pages/ImagePublic";
import { Hourglass } from "lucide-react";

const GenbaAreaGate: React.FC = () => {
  const { user } = useAuth();

  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (user !== undefined) {
      setIsAuthChecked(true);
    }
  }, [user]);

  if (!isAuthChecked) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900 justify-center items-center">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg flex items-center shadow-lg animate-pulse" role="alert">
          <Hourglass className="animate-spin mr-3 text-2xl" />
          <span className="font-semibold text-lg">Checking User Authentication...</span>
        </div>
      </div>
    );
  }

  if (user) {
    return <EditFormGenbaArea />;
  } else {
    return <ImagePublic />;
  }
};

export default GenbaAreaGate;
