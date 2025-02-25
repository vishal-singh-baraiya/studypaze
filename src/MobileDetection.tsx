// MobileDetection.tsx
import React, { useState, useEffect } from 'react';

interface MobileDetectionProps {
  children: React.ReactNode;
}

const MobileDetection: React.FC<MobileDetectionProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileDevices = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
      setIsMobile(mobileDevices.test(userAgent));
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="mobile-warning">
        <div className="mobile-warning-content">
          <h2>Mobile Access Unavailable</h2>
          <p>This website is not available for mobile devices yet.</p>
          <p>Please access from a desktop or laptop computer.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default MobileDetection;
