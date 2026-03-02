import { useTranslations } from "next-intl";
import HeaderClient from "./headerClient";

export default function Header() {
  const t = useTranslations("Header");

  return (
    <>
      {/* ── Header ── */}
      <HeaderClient title={t("title")} subtitle={t("subtitle")} />
    </>
  );
}
