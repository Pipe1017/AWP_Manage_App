// frontend/src/components/common/HatchLogo.jsx

import React from 'react';
import logoFull from '../../assets/hatch-logo.png';  // ✅ Logo completo
import logoIcon from '../../assets/hatch-logo.png';  // ✅ Solo ícono

function HatchLogo({ variant = "full", className = "" }) {
  if (variant === "icon") {
    return (
      <img 
        src={logoIcon} 
        alt="HATCH" 
        className={className || "w-12 h-12"}
      />
    );
  }

  return (
    <img 
      src={logoFull} 
      alt="HATCH Logo" 
      className={className || "h-12"}
    />
  );
}

export default HatchLogo;