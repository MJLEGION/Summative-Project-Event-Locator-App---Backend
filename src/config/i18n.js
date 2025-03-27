const i18next = require("i18next");
const Backend = require("i18next-fs-backend");
const middleware = require("i18next-http-middleware");
const path = require("path");

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: { 
      // Updated path to match your file structure - adjust if needed
      loadPath: path.join(__dirname, "../locales/{{lng}}.json") 
    },
    detection: { 
      order: ["querystring", "header"],
      lookupQuerystring: "lng",
      lookupHeader: "accept-language"
    }
  });

module.exports = i18next;