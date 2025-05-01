"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { LocationAdd } from "iconsax-react";

interface LocationPromptProps {
  onEnableLocation: () => void;
  className?: string;
}

const LocationPrompt: React.FC<LocationPromptProps> = ({
  onEnableLocation,
  className = "",
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleEnableClick = () => {
    setIsLoading(true);

    // Call the enable location function
    onEnableLocation();

    // Reset loading state after a delay to provide feedback
    // This helps prevent immediate re-render of the prompt
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  };

  return (
    <motion.div
      className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 
                  bg-black/90 border border-gray-700 rounded-lg p-4 
                  flex items-center gap-3 max-w-md z-50 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
    >
      <div className="rounded-full bg-primary-400 p-2 flex-shrink-0">
        <LocationAdd size={20} color="#ffffff" variant="Bold" />
      </div>

      <div className="flex-grow text-sm">
        <p className="text-white mb-1">
          Enable location services to find sports venues near you
        </p>
        <p className="text-gray-400 text-xs">
          We'll show you relevant options in your area
        </p>
      </div>

      <button
        onClick={handleEnableClick}
        disabled={isLoading}
        className={`bg-primary-500 hover:bg-primary-400 
                  text-white font-medium py-2 px-4 
                  rounded-lg text-sm transition
                  ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
      >
        {isLoading ? (
          <>
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Enabling...
          </>
        ) : (
          "Enable"
        )}
      </button>
    </motion.div>
  );
};

export default LocationPrompt;
