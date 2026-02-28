"use-client";

import TypeIt from "typeit-react";

const TitleHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-5xl font-bold tracking-tight bg-linear-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
      {children}
    </h1>
  );
};
const SubtitleHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-white/45 text-base mx-auto leading-relaxed mt-5">
      {children}
    </p>
  );
};

export default function Header() {
  return (
    <>
      {/* ── Header ── */}
      <header className="text-center space-y-3">
        <TypeIt options={{ cursor: false }}>
          <TitleHeader>VidWhisper Engine</TitleHeader>
          <SubtitleHeader>
            Convierte audio y video a texto con IA en segundos.
          </SubtitleHeader>
        </TypeIt>
      </header>
    </>
  );
}
