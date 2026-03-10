"use client";

import TypeIt from "typeit-react";

const TitleHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight bg-linear-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent leading-tight px-4 sm:px-0">
      {children}
    </h1>
  );
};

const SubtitleHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <p className="text-white/45 text-sm sm:text-base max-w-xs sm:max-w-md md:max-w-lg mx-auto leading-relaxed mt-3 sm:mt-5 px-6 sm:px-0">
      {children}
    </p>
  );
};

export default function HeaderClient({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="text-center space-y-2 sm:space-y-3 w-full">
      <TypeIt options={{ cursor: false }}>
        <TitleHeader>{title}</TitleHeader>
        <SubtitleHeader>{subtitle}</SubtitleHeader>
      </TypeIt>
    </header>
  );
}
