export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        disallow: ["/dashboard/", "/api/"],
      },
    ],
    sitemap: "https://reelytics.io/sitemap.xml",
  };
}
