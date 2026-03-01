"use client";

// Components of VidWhisper
import Header from "@/components/vidwhisper/header";
import MainTranscription from "@/components/vidwhisper/mainTranscription";
import TranscriptionHistory from "@/components/vidwhisper/transcriptionHistory";
import FloatingHelp from "@/components/vidwhisper/help";

export default function Home() {
  return (
    <div className="dark min-h-screen bg-[#0c0e14] text-foreground font-sans">
      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-150 h-150 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -right-40 w-125 h-125 bg-cyan-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/3 w-100 h-100 bg-indigo-600/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 flex flex-col gap-12">
        {/* Header */}
        <Header />

        {/* Main Transcription Component */}
        <MainTranscription />

        {/* Transcription History Component */}
        <TranscriptionHistory />

        {/* Floating Help Button */}
        <FloatingHelp />
      </div>
    </div>
  );
}
