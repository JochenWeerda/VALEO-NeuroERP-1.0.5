import { o as object, n as number, e as boolean, s as string, g as nativeEnum } from "./validation-CXIZp7Zb.js";
var VorgangsTyp = /* @__PURE__ */ ((VorgangsTyp2) => {
  VorgangsTyp2["KAUF"] = "kauf";
  VorgangsTyp2["VERKAUF"] = "verkauf";
  VorgangsTyp2["UMTASCH"] = "umtausch";
  VorgangsTyp2["RÜCKGABE"] = "rueckgabe";
  return VorgangsTyp2;
})(VorgangsTyp || {});
var StreckenStatus = /* @__PURE__ */ ((StreckenStatus2) => {
  StreckenStatus2["ENTWURF"] = "entwurf";
  StreckenStatus2["BESTÄTIGT"] = "bestaetigt";
  StreckenStatus2["IN_BEARBEITUNG"] = "in_bearbeitung";
  StreckenStatus2["ABGESCHLOSSEN"] = "abgeschlossen";
  StreckenStatus2["STORNIERT"] = "storniert";
  StreckenStatus2["ERLEDIGT"] = "erledigt";
  StreckenStatus2["UNERLEDIGT"] = "unerledigt";
  return StreckenStatus2;
})(StreckenStatus || {});
var BiomasseOption = /* @__PURE__ */ ((BiomasseOption2) => {
  BiomasseOption2["ALLE"] = "alle";
  BiomasseOption2["NUR_BIOMASSE"] = "nur_biomasse";
  return BiomasseOption2;
})(BiomasseOption || {});
const StreckengeschaeftSchema = object({
  streckeNr: string().min(1, "Strecken-Nr. ist erforderlich"),
  vorgangsTyp: nativeEnum(VorgangsTyp),
  datum: string().min(1, "Datum ist erforderlich"),
  vorgangPosition: string().min(1, "Vorgangsposition ist erforderlich"),
  positionsNr: string().min(1, "Positions-Nr. ist erforderlich"),
  artikelVon: string().min(1, "Artikel von ist erforderlich"),
  artikelBis: string().min(1, "Artikel bis ist erforderlich"),
  artikelBezeichnung: string().min(1, "Artikelbezeichnung ist erforderlich"),
  artikelNr: string().min(1, "Artikel-Nr. ist erforderlich"),
  sortenNr: string().optional(),
  vertrag: string().min(1, "Vertrag ist erforderlich"),
  lieferschein: string().min(1, "Lieferschein ist erforderlich"),
  kennzeichen: string().min(1, "Kennzeichen ist erforderlich"),
  lkwKennzeichen: string().optional(),
  menge: number().positive("Menge muss positiv sein"),
  einheit: string().min(1, "Einheit ist erforderlich"),
  ekPreis: number().min(0, "EK-Preis darf nicht negativ sein"),
  vkPreis: number().min(0, "VK-Preis darf nicht negativ sein"),
  frachtkosten: number().min(0, "Frachtkosten dürfen nicht negativ sein"),
  preisProEinheit: number().min(0, "Preis pro Einheit darf nicht negativ sein"),
  ekMenge: number().positive("EK-Menge muss positiv sein"),
  ekNetto: number().min(0, "EK-Netto darf nicht negativ sein"),
  ekLieferkosten: number().min(0, "EK-Lieferkosten dürfen nicht negativ sein"),
  ekRechnung: string().min(1, "EK-Rechnung ist erforderlich"),
  ekKontakt: string().min(1, "EK-Kontakt ist erforderlich"),
  ekKontaktNr: string().min(1, "EK-Kontakt-Nr. ist erforderlich"),
  vkMenge: number().positive("VK-Menge muss positiv sein"),
  vkNetto: number().min(0, "VK-Netto darf nicht negativ sein"),
  vkLieferkosten: number().min(0, "VK-Lieferkosten dürfen nicht negativ sein"),
  vkRechnung: string().min(1, "VK-Rechnung ist erforderlich"),
  vkKontakt: string().min(1, "VK-Kontakt ist erforderlich"),
  vkKontaktNr: string().min(1, "VK-Kontakt-Nr. ist erforderlich"),
  lieferant: string().min(1, "Lieferant ist erforderlich"),
  lieferantName: string().min(1, "Lieferantname ist erforderlich"),
  lieferantNr: string().min(1, "Lieferant-Nr. ist erforderlich"),
  kunde: string().min(1, "Kunde ist erforderlich"),
  kundeName: string().min(1, "Kundenname ist erforderlich"),
  kundeNr: string().min(1, "Kunde-Nr. ist erforderlich"),
  spediteurNr: string().min(1, "Spediteur-Nr. ist erforderlich"),
  spediteurName: string().min(1, "Spediteurname ist erforderlich"),
  frachtart: string().min(1, "Frachtart ist erforderlich"),
  beEntladestelle: string().min(1, "Be-/Entladestelle ist erforderlich"),
  beEntladestellePLZ: string().min(1, "PLZ Be-/Entladestelle ist erforderlich"),
  land: string().min(1, "Land ist erforderlich"),
  partienNr: string().optional(),
  nlsNr: string().optional(),
  bereich: string().min(1, "Bereich ist erforderlich"),
  spediteur: string().optional(),
  start: string().optional(),
  ursprung: string().optional(),
  lagerhalle: string().optional(),
  fahrzeugKennzeichen: string().optional(),
  kostenstelle: string().optional(),
  bedarfsnummer: string().optional(),
  summeVk: number().min(0, "Summe VK darf nicht negativ sein"),
  summeEk: number().min(0, "Summe EK darf nicht negativ sein"),
  restwert: number().min(0, "Restwert darf nicht negativ sein"),
  geplanteMengeVk: number().min(0, "Geplante Menge VK darf nicht negativ sein"),
  geplanteMengeEk: number().min(0).optional(),
  bemerkung: string().optional(),
  referenzNr: string().optional(),
  waehrung: string().default("EUR"),
  skonto: number().min(0).max(100).optional(),
  rabatt: number().min(0).max(100).optional(),
  istBiomasse: boolean().optional(),
  hatEingangsrechnung: boolean().optional(),
  hatSpeditionsrechnung: boolean().optional(),
  hatFrachtabrechnung: boolean().optional(),
  deckungsbeitrag: number().optional()
});
object({
  // STRECKE
  streckeNrVon: string().optional(),
  streckeNrBis: string().optional(),
  artikelNrVon: string().optional(),
  artikelNrBis: string().optional(),
  nurErledigte: boolean().optional(),
  nurUnerledigte: boolean().optional(),
  vorgaengeGetrennt: boolean().optional(),
  // LIEFERANTEN/KUNDEN
  lieferantNrVon: string().optional(),
  lieferantNrBis: string().optional(),
  kundeNrVon: string().optional(),
  kundeNrBis: string().optional(),
  nurOhneLieferant: boolean().optional(),
  nurOhneKunde: boolean().optional(),
  // KONTRAKTE
  ekKontaktNrVon: string().optional(),
  ekKontaktNrBis: string().optional(),
  vkKontaktNrVon: string().optional(),
  vkKontaktNrBis: string().optional(),
  biomasseOption: nativeEnum(BiomasseOption).optional(),
  // LIEFERRECHNUNG
  lieferRechnungsdatumVon: string().optional(),
  lieferRechnungsdatumBis: string().optional(),
  lkwKennzeichenVon: string().optional(),
  lkwKennzeichenBis: string().optional(),
  keineEingangsrechnung: boolean().optional(),
  keineSpeditionsrechnung: boolean().optional(),
  keineFrachtabrechnung: boolean().optional(),
  deckungsbeitragAusStreckendaten: boolean().optional(),
  // BE-/ENTLADESTELLE
  land: string().optional(),
  beEntladestellePLZVon: string().optional(),
  beEntladestellePLZBis: string().optional(),
  // PARTIE/NLS
  partienNrVon: string().optional(),
  partienNrBis: string().optional(),
  nlsNrVon: string().optional(),
  nlsNrBis: string().optional(),
  // SONSTIGE SELEKTIONEN
  spediteur: string().optional(),
  start: string().optional(),
  ursprung: string().optional(),
  lagerhalle: string().optional(),
  fahrzeugKennzeichen: string().optional(),
  sortenNr: string().optional(),
  kostenstelle: string().optional(),
  bedarfsnummer: string().optional(),
  // Allgemeine Filter
  vorgangsTyp: nativeEnum(VorgangsTyp).optional(),
  datumVon: string().optional(),
  datumBis: string().optional(),
  status: nativeEnum(StreckenStatus).optional(),
  minMenge: number().optional(),
  maxMenge: number().optional(),
  minEkPreis: number().optional(),
  maxEkPreis: number().optional(),
  minVkPreis: number().optional(),
  maxVkPreis: number().optional()
});
const getVorgangsTypLabel = (typ) => {
  const labels = {
    [
      "kauf"
      /* KAUF */
    ]: "Kauf",
    [
      "verkauf"
      /* VERKAUF */
    ]: "Verkauf",
    [
      "umtausch"
      /* UMTASCH */
    ]: "Umtausch",
    [
      "rueckgabe"
      /* RÜCKGABE */
    ]: "Rückgabe"
  };
  return labels[typ] || typ;
};
const getStatusLabel = (status) => {
  const labels = {
    [
      "entwurf"
      /* ENTWURF */
    ]: "Entwurf",
    [
      "bestaetigt"
      /* BESTÄTIGT */
    ]: "Bestätigt",
    [
      "in_bearbeitung"
      /* IN_BEARBEITUNG */
    ]: "In Bearbeitung",
    [
      "abgeschlossen"
      /* ABGESCHLOSSEN */
    ]: "Abgeschlossen",
    [
      "storniert"
      /* STORNIERT */
    ]: "Storniert",
    [
      "erledigt"
      /* ERLEDIGT */
    ]: "Erledigt",
    [
      "unerledigt"
      /* UNERLEDIGT */
    ]: "Unerledigt"
  };
  return labels[status] || status;
};
const getStatusColor = (status) => {
  const colors = {
    [
      "entwurf"
      /* ENTWURF */
    ]: "default",
    [
      "bestaetigt"
      /* BESTÄTIGT */
    ]: "processing",
    [
      "in_bearbeitung"
      /* IN_BEARBEITUNG */
    ]: "warning",
    [
      "abgeschlossen"
      /* ABGESCHLOSSEN */
    ]: "success",
    [
      "storniert"
      /* STORNIERT */
    ]: "error",
    [
      "erledigt"
      /* ERLEDIGT */
    ]: "success",
    [
      "unerledigt"
      /* UNERLEDIGT */
    ]: "warning"
  };
  return colors[status] || "default";
};
const getBiomasseOptionLabel = (option) => {
  const labels = {
    [
      "alle"
      /* ALLE */
    ]: "Alle",
    [
      "nur_biomasse"
      /* NUR_BIOMASSE */
    ]: "Nur Biomasse"
  };
  return labels[option] || option;
};
const calculateDeckungsbeitrag = (vkBetrag, ekBetrag, frachtkosten) => {
  return vkBetrag - ekBetrag - frachtkosten;
};
const formatCurrency = (amount, currency = "EUR") => {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency
  }).format(amount);
};
const formatNumber = (num) => {
  return new Intl.NumberFormat("de-DE").format(num);
};
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("de-DE");
};
export {
  BiomasseOption as B,
  StreckengeschaeftSchema as S,
  VorgangsTyp as V,
  StreckenStatus as a,
  getStatusLabel as b,
  calculateDeckungsbeitrag as c,
  getBiomasseOptionLabel as d,
  formatNumber as e,
  formatDate as f,
  getVorgangsTypLabel as g,
  formatCurrency as h,
  getStatusColor as i
};
//# sourceMappingURL=types-y_80m08G.js.map
