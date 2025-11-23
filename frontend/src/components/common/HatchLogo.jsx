// frontend/src/components/common/HatchLogo.jsx
import React from 'react';

function HatchLogo({ className = "h-8", variant = "full" }) {
  // Variante completa (con texto)
  if (variant === "full") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <svg viewBox="0 0 40 40" className="h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Símbolo H estilizado */}
          <rect width="40" height="40" rx="6" fill="#FF6B35"/>
          <path d="M10 10 L10 30 M10 20 L30 20 M30 10 L30 30" 
                stroke="white" 
                strokeWidth="4" 
                strokeLinecap="round"/>
        </svg>
        <span className="font-bold text-2xl tracking-tight text-hatch-blue">
          HATCH
        </span>
      </div>
    );
  }
  
  // Variante solo ícono
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="6" fill="#FF6B35"/>
      <path d="M10 10 L10 30 M10 20 L30 20 M30 10 L30 30" 
            stroke="white" 
            strokeWidth="4" 
            strokeLinecap="round"/>
    </svg>
  );
}

export default HatchLogo;