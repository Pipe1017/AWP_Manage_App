import React, { useState } from 'react';

function HatchLogo({ className = "h-8", variant = "full" }) {
  // Estado para controlar si la imagen cargó bien o mal
  const [imgError, setImgError] = useState(false);
  
  // Ruta esperada en la carpeta public
  const logoSrc = "/hatch_logo.png"; 

  // --- FALLBACK: SI EL PNG FALLA, MUESTRA ESTO (Logo Vectorial) ---
  if (imgError) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {/* Icono SVG que imita el logo real (Cuadrado Naranja con H) */}
        <svg viewBox="0 0 100 100" className="h-full w-auto aspect-square" fill="none" xmlns="http://www.w3.org/2000/svg">
           <rect width="100" height="100" rx="15" fill="#FF6B35"/> {/* Hatch Orange */}
           <path d="M28 25V75M72 25V75M28 50H72" stroke="white" strokeWidth="12" strokeLinecap="round"/>
        </svg>
        
        {/* Texto (Solo si variant es full) */}
        {variant === 'full' && (
          <span className="font-extrabold text-2xl tracking-tighter text-hatch-blue ml-1 font-sans">
            HATCH
          </span>
        )}
      </div>
    );
  }

  // --- INTENTO PRINCIPAL: CARGAR TU PNG ---
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoSrc} 
        alt="HATCH Logo" 
        className="h-full w-auto object-contain"
        onError={() => {
          console.warn("⚠️ No se encontró hatch_logo.png en /public. Usando logo SVG de respaldo.");
          setImgError(true);
        }}
      />
    </div>
  );
}

export default HatchLogo;