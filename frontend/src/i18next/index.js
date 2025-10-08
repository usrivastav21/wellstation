import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import englishJSON from "../i18next/locales/english/eng.json";
import bahasaJSON from "../i18next/locales/bahasa/bahasa.json";
import chineseJSON from "../i18next/locales/chinese/zh.json";
import tamilJSON from "../i18next/locales/tamil/tamil.json";

// Verify Chinese translations are loaded
console.log("Chinese translations:", chineseJSON);

const resources = {
  eng: {
    translation: englishJSON,
  },
  zh: {
    translation: chineseJSON,
  },
  bahasa: {
    translation: bahasaJSON,
  },
  tamil: {
    translation: tamilJSON,
  },
};

console.log("Loaded resources:", resources);

i18n.use(initReactI18next).init({
  resources,
  lng: "eng",
  fallbackLng: "eng",
  debug: true,
  interpolation: {
    escapeValue: false,
  },
  returnObjects: true,
  returnEmptyString: false,
  react: {
    useSuspense: false,
  },
  keySeparator: ".",
  nsSeparator: ":",
});

// Test Chinese translation directly
i18n.on("languageChanged", (lng) => {
  console.log("Language changed to:", lng);
  console.log(
    "Current translation for mainHeader:",
    i18n.t("consentScreen.mainHeader")
  );
  if (lng === "zh") {
    console.log("Testing Chinese translation:", {
      mainHeader: i18n.t("consentScreen.mainHeader"),
      mainDescription: i18n.t("consentScreen.mainDescription"),
      rawResources: i18n.store.data.zh,
    });
  }
});

i18n.on("languageChanged", (lng) => {
  console.log("Language changed to:", lng);
  console.log(
    "Current translation for mainHeader:",
    i18n.t("consentScreen.mainHeader")
  );
  if (lng === "tamil") {
    console.log("Testing Tamil translation:", {
      mainHeader: i18n.t("consentScreen.mainHeader"),
      mainDescription: i18n.t("consentScreen.mainDescription"),
      rawResources: i18n.store.data.tamil,
    });
  }
});

export default i18n;
