"use-client";

import { useTranslations } from "next-intl";

// Function get year
function getCurrentYear() {
  return new Date().getFullYear();
}

export default function Footer() {
  const t = useTranslations("Footer");

  return (
    <>
      <footer className="flex items-center justify-center flex-col text-white/20 text-xs pb-6 sm:pb-4 gap-1 px-4 text-center">
        <div>
          {t("copyright")} &copy; {getCurrentYear()}{" "}
        </div>
        <span className="text-violet-500/60">{t("version")}</span>
      </footer>
    </>
  );
}
