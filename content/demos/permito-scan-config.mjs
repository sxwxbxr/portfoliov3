import { catalog, toConsentService } from "@weber-development/permito-catalog";
const entry = (id) => catalog.find((e) => e.id === id);
export default {
  consentVersion: "1",
  categories: [{ id: "necessary", required: true }, { id: "statistics" }, { id: "marketing" }],
  services: [toConsentService(entry("google-analytics-4"), { category: "statistics" })],
};
