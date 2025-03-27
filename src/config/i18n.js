const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: { loadPath: "./src/locales/{{lng}}.json" },
    detection: { order: ["querystring", "header"] }
  });

module.exports = i18next;
