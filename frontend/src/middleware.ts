import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  // List of languages supported by the application
  locales: ["en", "es"],

  // Language default
  defaultLocale: "en",
});

export const config = {
  matcher: ["/", "/(en|es)/:path*"],
};
