import type { HomeContent } from "./types"

/**
 * Home copy (de), converted from the copywriter draft. Removed `TODO(Seya)` placeholders
 * stay as comments above their string. Questions whose answer was only a placeholder are
 * listed at the bottom instead of being rendered.
 */

export const home: HomeContent = {
  metaTitle: "Software und Automatisierung für KMU",
  metaDescription: "Weber Development entwickelt Individualsoftware und Automatisierungen für KMU in der Ostschweiz. Seya Weber, Softwareentwicklung und Projektleitung, Bichwil SG.",
  intro: "Weber Development entwickelt Individualsoftware und Automatisierungen für KMU in der Ostschweiz. Dahinter steht Seya Weber, Softwareentwicklung und Projektleitung aus Bichwil SG. Wenn Excel zur Datenbank geworden ist, ein Ablauf jeden Tag Handarbeit kostet oder ein Digitalisierungsprojekt eine Leitung braucht, ist das der richtige Ort für ein Erstgespräch.",
  complement: "Wenn Excel zur Datenbank geworden ist, ein Ablauf jeden Tag Handarbeit kostet oder ein Digitalisierungsprojekt eine Leitung braucht, ist das der richtige Ort für ein Erstgespräch.",
  // TODO(Seya): bestätigen
  serviceArea: "Vor Ort in Wil, Uzwil, Gossau, St. Gallen und der ganzen Ostschweiz, remote in der ganzen Schweiz.",
  faq: [
    {
      q: "Was kostet eine Individualsoftware für ein KMU?",
      // TODO(Seya): Preisrahmen, z.B. ein internes Tool mit Login und einer Hauptfunktion ab CHF …, grössere Portale ab CHF …, exkl. MWST
      // TODO(Seya): Stundensatz
      a: "Das hängt vom Umfang ab, deshalb beginnt jedes Projekt mit einem Prototyp und einer schriftlichen Offerte. Abgerechnet wird als Pauschale mit Meilensteinen oder nach Aufwand mit monatlichem Rapport.",
    },
    {
      q: "Arbeiten Sie auch remote?",
      a: "Ja. Erstgespräch, Zwischenstände und Schulungen laufen per Video, wenn Sie das bevorzugen. Vor Ort in der Ostschweiz, in der übrigen Schweiz nach Absprache.",
    },
    {
      q: "Was passiert, wenn Sie als Einzelperson ausfallen?",
      // TODO(Seya): Stellvertretung oder Partnernetz nennen, falls vorhanden
      a: "Weber Development ist ein Ein-Personen-Betrieb, und die Absicherung dagegen ist gewöhnliche Technik: verbreitete Sprachen und Frameworks, Code und Dokumentation in Ihrem Besitz, Hosting auf Ihren Konten. Jede andere Entwicklerin kann weiterarbeiten.",
    },
  ],
  cta: {
    lead: "Schreiben Sie mir in drei Sätzen, was Sie beschäftigt.",
    text: "Ich antworte innert 24 Stunden. info@sweber.dev oder +41 79 899 11 12.",
  },
}

// OMITTED FAQ TODO(Seya): Wie schnell steht ein erster Prototyp? -> bestätigen, z.B. 2 bis 4 Wochen
// OMITTED FAQ TODO(Seya): Wem gehört die Software am Ende? -> vertragliche Regelung bestätigen, z.B. «Quellcode, Dokumentation und Hosting-Konten gehen mit der Schlusszahlung vollständig an Sie über.»
