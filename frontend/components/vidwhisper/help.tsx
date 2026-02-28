"use client";

import { useState } from "react";
import { X, HelpCircle } from "lucide-react";

export default function FloatingHelp() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transition-all hover:scale-110 active:scale-95"
        aria-label="Ayuda"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <HelpCircle className="w-6 h-6 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300 w-3/4 sm:w-fit">
          <div className="bg-white/10 border border-white/20 rounded-2xl rounded-tl-sm px-5 py-4 backdrop-blur-xl shadow-xl">
            <p className="text-white/90 text-sm leading-relaxed">
              ¡Hola! ¿Necesitas{" "}
              <span className="text-violet-400 font-semibold">ayuda</span>?
              <br />
              <br />
              Pega el link de un video de YouTube o sube un archivo <br />
              de audio/video y lo convierto a texto al instante.
            </p>
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
