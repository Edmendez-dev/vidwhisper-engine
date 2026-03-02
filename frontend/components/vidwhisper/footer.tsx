"use-client";

// Function get year
function getCurrentYear() {
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <>
      <footer className="flex items-center justify-center flex-col text-white/20 text-xs pb-4 gap-1">
        <div>
          VidWhisper Engine · Transcripción con IA · &copy;{" "}
          {getCurrentYear()}{" "}
        </div>
        <span className="text-violet-500/60">v1.0</span>
      </footer>
    </>
  );
}
