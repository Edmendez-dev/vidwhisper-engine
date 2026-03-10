"use client";

import { useState } from "react";
import { X, HelpCircle } from "lucide-react";
import { useTranslations } from "next-intl";

export default function FloatingHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Help");

  return (
    <>
      {/* Floating Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-4 sm:right-6 z-50 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br from-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 transition-all hover:scale-110 active:scale-95"
        aria-label="Ayuda"
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        ) : (
          <HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 sm:bottom-24 right-4 sm:right-6 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300 w-[calc(100vw-2rem)] max-w-sm sm:w-80">
          <div className="bg-white/10 border border-white/20 rounded-2xl rounded-br-sm px-4 sm:px-5 py-4 backdrop-blur-xl shadow-xl">
            <p className="text-white/90 text-sm leading-relaxed">
              {t("title")}{" "}
              <span className="text-violet-400 font-semibold">
                {t("title2")}
              </span>
              ?
              <br />
              <br />
              {t("content_l1")} <br />
              {t("content_l2")}
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
