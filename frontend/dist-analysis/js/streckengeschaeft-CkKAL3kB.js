var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a2, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a2, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a2, prop, b[prop]);
    }
  return a2;
};
var __spreadProps = (a2, b) => __defProps(a2, __getOwnPropDescs(b));
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
import { f as useForm, r as reactExports, j as jsxRuntimeExports, C as Controller, y as useQueryClient, z as useQuery, A as useMutation } from "./react-vendor-C09FwfLq.js";
import { V as VorgangsTyp, S as StreckengeschaeftSchema, c as calculateDeckungsbeitrag, g as getVorgangsTypLabel, a as StreckenStatus, b as getStatusLabel, B as BiomasseOption, d as getBiomasseOptionLabel, f as formatDate, e as formatNumber, h as formatCurrency, i as getStatusColor } from "./types-y_80m08G.js";
import { a } from "./hookform-resolvers-B3VX3b4X.js";
import { d as Typography, c as Space, B as Button, s as staticMethods, e as Form, f as Tabs, R as Row, a as Col, I as Input, b as Select, D as DatePicker, g as TypedInputNumber, h as Checkbox, C as Card, i as Divider, j as Collapse, S as Statistic, F as ForwardTable, M as Modal, T as Tag, k as Tooltip } from "./antd-core-Bn6Stp_u.js";
import { L as RefIcon, e as RefIcon$1, M as RefIcon$2, N as RefIcon$3, h as RefIcon$4, O as RefIcon$5, J as RefIcon$6, P as RefIcon$7, l as RefIcon$8, r as RefIcon$9, H as RefIcon$a, K as RefIcon$b } from "./antd-icons-ZoMdwZyJ.js";
const { TabPane: TabPane$1 } = Tabs;
const { Option: Option$1 } = Select;
const { Title: Title$1, Text: Text$1 } = Typography;
const StreckengeschaeftForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm({
    resolver: a(StreckengeschaeftSchema),
    defaultValues: {
      streckeNr: "",
      vorgangsTyp: VorgangsTyp.KAUF,
      datum: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      vorgangPosition: "",
      positionsNr: "",
      artikelVon: "",
      artikelBis: "",
      artikelBezeichnung: "",
      artikelNr: "",
      sortenNr: "",
      vertrag: "",
      lieferschein: "",
      kennzeichen: "",
      lkwKennzeichen: "",
      menge: 0,
      einheit: "kg",
      ekPreis: 0,
      vkPreis: 0,
      frachtkosten: 0,
      preisProEinheit: 0,
      ekMenge: 0,
      ekNetto: 0,
      ekLieferkosten: 0,
      ekRechnung: "",
      ekKontakt: "",
      ekKontaktNr: "",
      vkMenge: 0,
      vkNetto: 0,
      vkLieferkosten: 0,
      vkRechnung: "",
      vkKontakt: "",
      vkKontaktNr: "",
      lieferant: "",
      lieferantName: "",
      lieferantNr: "",
      kunde: "",
      kundeName: "",
      kundeNr: "",
      spediteurNr: "",
      spediteurName: "",
      frachtart: "LKW",
      beEntladestelle: "",
      beEntladestellePLZ: "",
      land: "Deutschland",
      partienNr: "",
      nlsNr: "",
      bereich: "",
      spediteur: "",
      start: "",
      ursprung: "",
      lagerhalle: "",
      fahrzeugKennzeichen: "",
      kostenstelle: "",
      bedarfsnummer: "",
      summeVk: 0,
      summeEk: 0,
      restwert: 0,
      geplanteMengeVk: 0,
      geplanteMengeEk: 0,
      bemerkung: "",
      referenzNr: "",
      waehrung: "EUR",
      skonto: 0,
      rabatt: 0,
      istBiomasse: false,
      hatEingangsrechnung: false,
      hatSpeditionsrechnung: false,
      hatFrachtabrechnung: false,
      deckungsbeitrag: 0
    }
  });
  const watchedValues = watch();
  const { ekPreis, vkPreis, menge, frachtkosten, ekMenge, vkMenge } = watchedValues;
  reactExports.useEffect(() => {
    const ekNetto = ekPreis * ekMenge;
    const vkNetto = vkPreis * vkMenge;
    const summeEk = ekNetto + (watchedValues.ekLieferkosten || 0);
    const summeVk = vkNetto + (watchedValues.vkLieferkosten || 0);
    const deckungsbeitrag = calculateDeckungsbeitrag(summeVk, summeEk, frachtkosten);
    const restwert = summeVk - summeEk - frachtkosten;
    setValue("ekNetto", ekNetto);
    setValue("vkNetto", vkNetto);
    setValue("summeEk", summeEk);
    setValue("summeVk", summeVk);
    setValue("deckungsbeitrag", deckungsbeitrag);
    setValue("restwert", restwert);
  }, [ekPreis, vkPreis, menge, frachtkosten, ekMenge, vkMenge, watchedValues.ekLieferkosten, watchedValues.vkLieferkosten, setValue]);
  reactExports.useEffect(() => {
    if (initialData) {
      const formData = __spreadValues({}, initialData);
      if (initialData.datum) {
        formData.datum = initialData.datum;
      }
      setValue("datum", formData.datum);
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== void 0) {
          setValue(key, formData[key]);
        }
      });
    }
  }, [initialData, setValue]);
  const handleFormSubmit = (values) => {
    onSubmit(values);
  };
  const vorgangsTypOptions = Object.values(VorgangsTyp).map((typ) => ({
    label: getVorgangsTypLabel(typ),
    value: typ
  }));
  Object.values(StreckenStatus).map((status) => ({
    label: getStatusLabel(status),
    value: status
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Title$1, { level: 4, children: initialData ? "Streckengeschäft bearbeiten" : "Neues Streckengeschäft" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Space, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, {}),
          onClick: () => staticMethods.info("Berechnungen werden automatisch aktualisiert"),
          children: "Berechnungen"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Form, { layout: "vertical", onFinish: handleSubmit(handleFormSubmit), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultActiveKey: "1", size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "GRUNDDATEN", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "streckeNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Strecke-Nr.",
                      validateStatus: errors.streckeNr ? "error" : "",
                      help: (_a = errors.streckeNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Strecke-Nr. eingeben" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vorgangsTyp",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Vorgangstyp",
                      validateStatus: errors.vorgangsTyp ? "error" : "",
                      help: (_a = errors.vorgangsTyp) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, __spreadProps(__spreadValues({}, field), { placeholder: "Vorgangstyp wählen", children: vorgangsTypOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: option.value, children: option.label }, option.value)) }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "datum",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Datum",
                      validateStatus: errors.datum ? "error" : "",
                      help: (_a = errors.datum) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                        DatePicker,
                        __spreadProps(__spreadValues({}, field), {
                          style: { width: "100%" },
                          format: "DD.MM.YYYY"
                        })
                      )
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vorgangPosition",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Vorgangsposition",
                      validateStatus: errors.vorgangPosition ? "error" : "",
                      help: (_a = errors.vorgangPosition) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Vorgangsposition" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "positionsNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Positions-Nr.",
                      validateStatus: errors.positionsNr ? "error" : "",
                      help: (_a = errors.positionsNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Positions-Nr." }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "bereich",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Bereich",
                      validateStatus: errors.bereich ? "error" : "",
                      help: (_a = errors.bereich) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Bereich" }))
                    }
                  );
                }
              }
            ) })
          ] })
        ] }, "1"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "ARTIKEL", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "artikelVon",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Artikel von",
                      validateStatus: errors.artikelVon ? "error" : "",
                      help: (_a = errors.artikelVon) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Artikel von" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "artikelBis",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Artikel bis",
                      validateStatus: errors.artikelBis ? "error" : "",
                      help: (_a = errors.artikelBis) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Artikel bis" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "artikelNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Artikel-Nr.",
                      validateStatus: errors.artikelNr ? "error" : "",
                      help: (_a = errors.artikelNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Artikel-Nr." }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "artikelBezeichnung",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Artikelbezeichnung",
                      validateStatus: errors.artikelBezeichnung ? "error" : "",
                      help: (_a = errors.artikelBezeichnung) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Artikelbezeichnung" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "sortenNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Sorten-Nr.",
                      validateStatus: errors.sortenNr ? "error" : "",
                      help: (_a = errors.sortenNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Sorten-Nr." }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "menge",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Menge",
                      validateStatus: errors.menge ? "error" : "",
                      help: (_a = errors.menge) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "Menge", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "einheit",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Einheit",
                      validateStatus: errors.einheit ? "error" : "",
                      help: (_a = errors.einheit) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, __spreadProps(__spreadValues({}, field), { placeholder: "Einheit wählen", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "kg", children: "kg" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "t", children: "t" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "Stück", children: "Stück" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "m³", children: "m³" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "l", children: "l" })
                      ] }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "preisProEinheit",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Preis pro Einheit",
                      validateStatus: errors.preisProEinheit ? "error" : "",
                      help: (_a = errors.preisProEinheit) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0.00", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) })
          ] })
        ] }, "2"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "VERTRÄGE & LIEFERSCHEINE", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vertrag",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Vertrag",
                      validateStatus: errors.vertrag ? "error" : "",
                      help: (_a = errors.vertrag) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Vertrag" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "lieferschein",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Lieferschein",
                      validateStatus: errors.lieferschein ? "error" : "",
                      help: (_a = errors.lieferschein) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Lieferschein" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "kennzeichen",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Kennzeichen",
                      validateStatus: errors.kennzeichen ? "error" : "",
                      help: (_a = errors.kennzeichen) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Kennzeichen" }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "lkwKennzeichen",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "LKW-Kennzeichen",
                      validateStatus: errors.lkwKennzeichen ? "error" : "",
                      help: (_a = errors.lkwKennzeichen) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "LKW-Kennzeichen" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "fahrzeugKennzeichen",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Fahrzeug-Kennzeichen",
                      validateStatus: errors.fahrzeugKennzeichen ? "error" : "",
                      help: (_a = errors.fahrzeugKennzeichen) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Fahrzeug-Kennzeichen" }))
                    }
                  );
                }
              }
            ) })
          ] })
        ] }, "3"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "EINKAUF", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "ekPreis",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "EK-Preis",
                      validateStatus: errors.ekPreis ? "error" : "",
                      help: (_a = errors.ekPreis) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0.00", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "ekMenge",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "EK-Menge",
                      validateStatus: errors.ekMenge ? "error" : "",
                      help: (_a = errors.ekMenge) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "ekLieferkosten",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "EK-Lieferkosten",
                      validateStatus: errors.ekLieferkosten ? "error" : "",
                      help: (_a = errors.ekLieferkosten) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0.00", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "ekNetto",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "EK-Netto (berechnet)",
                      validateStatus: errors.ekNetto ? "error" : "",
                      help: (_a = errors.ekNetto) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { disabled: true, style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "ekRechnung",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "EK-Rechnung",
                      validateStatus: errors.ekRechnung ? "error" : "",
                      help: (_a = errors.ekRechnung) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "EK-Rechnung" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "ekKontakt",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "EK-Kontakt",
                      validateStatus: errors.ekKontakt ? "error" : "",
                      help: (_a = errors.ekKontakt) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "EK-Kontakt" }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "ekKontaktNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "EK-Kontakt-Nr.",
                      validateStatus: errors.ekKontaktNr ? "error" : "",
                      help: (_a = errors.ekKontaktNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "EK-Kontakt-Nr." }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "summeEk",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Summe EK (berechnet)",
                      validateStatus: errors.summeEk ? "error" : "",
                      help: (_a = errors.summeEk) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { disabled: true, style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) })
          ] })
        ] }, "4"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "VERKAUF", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vkPreis",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "VK-Preis",
                      validateStatus: errors.vkPreis ? "error" : "",
                      help: (_a = errors.vkPreis) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0.00", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vkMenge",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "VK-Menge",
                      validateStatus: errors.vkMenge ? "error" : "",
                      help: (_a = errors.vkMenge) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vkLieferkosten",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "VK-Lieferkosten",
                      validateStatus: errors.vkLieferkosten ? "error" : "",
                      help: (_a = errors.vkLieferkosten) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0.00", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vkNetto",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "VK-Netto (berechnet)",
                      validateStatus: errors.vkNetto ? "error" : "",
                      help: (_a = errors.vkNetto) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { disabled: true, style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vkRechnung",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "VK-Rechnung",
                      validateStatus: errors.vkRechnung ? "error" : "",
                      help: (_a = errors.vkRechnung) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "VK-Rechnung" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vkKontakt",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "VK-Kontakt",
                      validateStatus: errors.vkKontakt ? "error" : "",
                      help: (_a = errors.vkKontakt) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "VK-Kontakt" }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "vkKontaktNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "VK-Kontakt-Nr.",
                      validateStatus: errors.vkKontaktNr ? "error" : "",
                      help: (_a = errors.vkKontaktNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "VK-Kontakt-Nr." }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "summeVk",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Summe VK (berechnet)",
                      validateStatus: errors.summeVk ? "error" : "",
                      help: (_a = errors.summeVk) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { disabled: true, style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) })
          ] })
        ] }, "5"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "PARTNER", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "lieferant",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Lieferant",
                      validateStatus: errors.lieferant ? "error" : "",
                      help: (_a = errors.lieferant) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Lieferant" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "lieferantName",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Lieferantname",
                      validateStatus: errors.lieferantName ? "error" : "",
                      help: (_a = errors.lieferantName) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Lieferantname" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "lieferantNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Lieferant-Nr.",
                      validateStatus: errors.lieferantNr ? "error" : "",
                      help: (_a = errors.lieferantNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Lieferant-Nr." }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "kunde",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Kunde",
                      validateStatus: errors.kunde ? "error" : "",
                      help: (_a = errors.kunde) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Kunde" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "kundeName",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Kundenname",
                      validateStatus: errors.kundeName ? "error" : "",
                      help: (_a = errors.kundeName) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Kundenname" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "kundeNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Kunde-Nr.",
                      validateStatus: errors.kundeNr ? "error" : "",
                      help: (_a = errors.kundeNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Kunde-Nr." }))
                    }
                  );
                }
              }
            ) })
          ] })
        ] }, "6"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "SPEDITION", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "spediteurNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Spediteur-Nr.",
                      validateStatus: errors.spediteurNr ? "error" : "",
                      help: (_a = errors.spediteurNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Spediteur-Nr." }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "spediteurName",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Spediteurname",
                      validateStatus: errors.spediteurName ? "error" : "",
                      help: (_a = errors.spediteurName) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Spediteurname" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "frachtart",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Frachtart",
                      validateStatus: errors.frachtart ? "error" : "",
                      help: (_a = errors.frachtart) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, __spreadProps(__spreadValues({}, field), { placeholder: "Frachtart wählen", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "LKW", children: "LKW" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "Bahn", children: "Bahn" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "Schiff", children: "Schiff" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "Flugzeug", children: "Flugzeug" })
                      ] }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "frachtkosten",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Frachtkosten",
                      validateStatus: errors.frachtkosten ? "error" : "",
                      help: (_a = errors.frachtkosten) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0.00", style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "spediteur",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Spediteur",
                      validateStatus: errors.spediteur ? "error" : "",
                      help: (_a = errors.spediteur) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Spediteur" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "start",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Start",
                      validateStatus: errors.start ? "error" : "",
                      help: (_a = errors.start) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Start" }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "ursprung",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Ursprung",
                      validateStatus: errors.ursprung ? "error" : "",
                      help: (_a = errors.ursprung) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Ursprung" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "lagerhalle",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Lagerhalle",
                      validateStatus: errors.lagerhalle ? "error" : "",
                      help: (_a = errors.lagerhalle) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Lagerhalle" }))
                    }
                  );
                }
              }
            ) })
          ] })
        ] }, "7"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabPane$1, { tab: "BE-/ENTLADESTELLE", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "beEntladestelle",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Form.Item,
                  {
                    label: "Be-/Entladestelle",
                    validateStatus: errors.beEntladestelle ? "error" : "",
                    help: (_a = errors.beEntladestelle) == null ? void 0 : _a.message,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Be-/Entladestelle" }))
                  }
                );
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "beEntladestellePLZ",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Form.Item,
                  {
                    label: "PLZ Be-/Entladestelle",
                    validateStatus: errors.beEntladestellePLZ ? "error" : "",
                    help: (_a = errors.beEntladestellePLZ) == null ? void 0 : _a.message,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "PLZ" }))
                  }
                );
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "land",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Form.Item,
                  {
                    label: "Land",
                    validateStatus: errors.land ? "error" : "",
                    help: (_a = errors.land) == null ? void 0 : _a.message,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Land" }))
                  }
                );
              }
            }
          ) })
        ] }) }, "8"),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabPane$1, { tab: "PARTIE/NLS", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "partienNr",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Form.Item,
                  {
                    label: "Partien-Nr.",
                    validateStatus: errors.partienNr ? "error" : "",
                    help: (_a = errors.partienNr) == null ? void 0 : _a.message,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Partien-Nr." }))
                  }
                );
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "nlsNr",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Form.Item,
                  {
                    label: "NLS-Nr.",
                    validateStatus: errors.nlsNr ? "error" : "",
                    help: (_a = errors.nlsNr) == null ? void 0 : _a.message,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "NLS-Nr." }))
                  }
                );
              }
            }
          ) })
        ] }) }, "9"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "SONSTIGES", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "kostenstelle",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Kostenstelle",
                      validateStatus: errors.kostenstelle ? "error" : "",
                      help: (_a = errors.kostenstelle) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Kostenstelle" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "bedarfsnummer",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Bedarfsnummer",
                      validateStatus: errors.bedarfsnummer ? "error" : "",
                      help: (_a = errors.bedarfsnummer) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Bedarfsnummer" }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "referenzNr",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Referenz-Nr.",
                      validateStatus: errors.referenzNr ? "error" : "",
                      help: (_a = errors.referenzNr) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, __spreadProps(__spreadValues({}, field), { placeholder: "Referenz-Nr." }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "waehrung",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Währung",
                      validateStatus: errors.waehrung ? "error" : "",
                      help: (_a = errors.waehrung) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, __spreadProps(__spreadValues({}, field), { placeholder: "Währung wählen", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "EUR", children: "EUR" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "USD", children: "USD" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Option$1, { value: "CHF", children: "CHF" })
                      ] }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "skonto",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Skonto (%)",
                      validateStatus: errors.skonto ? "error" : "",
                      help: (_a = errors.skonto) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0", min: 0, max: 100, style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "rabatt",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Rabatt (%)",
                      validateStatus: errors.rabatt ? "error" : "",
                      help: (_a = errors.rabatt) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0", min: 0, max: 100, style: { width: "100%" } }))
                    }
                  );
                }
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "bemerkung",
                control,
                render: ({ field }) => {
                  var _a;
                  return /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Form.Item,
                    {
                      label: "Bemerkung",
                      validateStatus: errors.bemerkung ? "error" : "",
                      help: (_a = errors.bemerkung) == null ? void 0 : _a.message,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input.TextArea, __spreadProps(__spreadValues({}, field), { placeholder: "Bemerkung", rows: 3 }))
                    }
                  );
                }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "istBiomasse",
                  control,
                  render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Biomasse", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, __spreadProps(__spreadValues({}, field), { checked: field.value, children: "Ist Biomasse" })) })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "hatEingangsrechnung",
                  control,
                  render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Rechnungen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, __spreadProps(__spreadValues({}, field), { checked: field.value, children: "Hat Eingangsrechnung" })) })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "hatSpeditionsrechnung",
                  control,
                  render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, __spreadProps(__spreadValues({}, field), { checked: field.value, children: "Hat Speditionsrechnung" }))
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Controller,
                {
                  name: "hatFrachtabrechnung",
                  control,
                  render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, __spreadProps(__spreadValues({}, field), { checked: field.value, children: "Hat Frachtabrechnung" }))
                }
              )
            ] }) })
          ] })
        ] }, "10"),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane$1, { tab: "BERECHNUNGEN", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { size: "small", className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Restwert (berechnet)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "restwert",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { disabled: true, style: { width: "100%" } }))
              }
            ) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Deckungsbeitrag (berechnet)", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "deckungsbeitrag",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { disabled: true, style: { width: "100%" } }))
              }
            ) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Geplante Menge VK", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "geplanteMengeVk",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0", style: { width: "100%" } }))
              }
            ) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Geplante Menge EK", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "geplanteMengeEk",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, __spreadProps(__spreadValues({}, field), { placeholder: "0", style: { width: "100%" } }))
              }
            ) }) })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-gray-600", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text$1, { strong: true, children: "Hinweis:" }),
            " Berechnungen werden automatisch basierend auf EK-Preis, VK-Preis, Mengen und Frachtkosten aktualisiert."
          ] })
        ] }, "11")
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$1, {}),
            onClick: onCancel,
            disabled: loading,
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "primary",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$2, {}),
            onClick: handleSubmit(handleFormSubmit),
            loading,
            disabled: !isValid,
            children: initialData ? "Aktualisieren" : "Erstellen"
          }
        )
      ] })
    ] })
  ] });
};
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;
const StreckengeschaeftFilterPanel = ({
  onFilterChange,
  onReset,
  loading = false
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = reactExports.useState(false);
  const handleFilterChange = (allValues) => {
    var _b, _c;
    const _a = allValues, { datumRange } = _a, restValues = __objRest(_a, ["datumRange"]);
    const filterData = __spreadProps(__spreadValues({}, restValues), {
      datumVon: (_b = datumRange == null ? void 0 : datumRange[0]) == null ? void 0 : _b.format("YYYY-MM-DD"),
      datumBis: (_c = datumRange == null ? void 0 : datumRange[1]) == null ? void 0 : _c.format("YYYY-MM-DD")
    });
    onFilterChange(filterData);
  };
  const handleReset = () => {
    form.resetFields();
    onReset();
  };
  const vorgangsTypOptions = Object.values(VorgangsTyp).map((typ) => ({
    label: getVorgangsTypLabel(typ),
    value: typ
  }));
  const statusOptions = Object.values(StreckenStatus).map((status) => ({
    label: getStatusLabel(status),
    value: status
  }));
  const biomasseOptions = Object.values(BiomasseOption).map((option) => ({
    label: getBiomasseOptionLabel(option),
    value: option
  }));
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Card,
    {
      className: "mb-4 shadow-sm",
      title: /* @__PURE__ */ jsxRuntimeExports.jsxs(Space, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$5, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Filter für Streckengeschäfte" })
      ] }),
      extra: /* @__PURE__ */ jsxRuntimeExports.jsx(Space, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          type: "text",
          icon: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$5, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$5, {}),
          onClick: () => setExpanded(!expanded),
          children: expanded ? "Einklappen" : "Ausklappen"
        }
      ) }),
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collapse, { activeKey: expanded ? ["1"] : [], ghost: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Collapse.Panel, { showArrow: false, header: "", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Form,
        {
          form,
          layout: "vertical",
          onValuesChange: handleFilterChange,
          className: "mt-4",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultActiveKey: "1", size: "small", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane, { tab: "STRECKE", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Strecke-Nr. von", name: "streckeNrVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von Strecke-Nr." }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Strecke-Nr. bis", name: "streckeNrBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis Strecke-Nr." }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Artikel-Nr. von", name: "artikelNrVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von Artikel-Nr." }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Artikel-Nr. bis", name: "artikelNrBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis Artikel-Nr." }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "nurErledigte", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Nur erledigte Strecken" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "nurUnerledigte", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Nur unerledigte Strecken" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "vorgaengeGetrennt", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Vorgänge getrennt" }) }) })
                ] })
              ] }, "1"),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane, { tab: "LIEFERANTEN/KUNDEN", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Lieferant-Nr. von", name: "lieferantNrVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von Lieferant-Nr." }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Lieferant-Nr. bis", name: "lieferantNrBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis Lieferant-Nr." }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Kunde-Nr. von", name: "kundeNrVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von Kunde-Nr." }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Kunde-Nr. bis", name: "kundeNrBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis Kunde-Nr." }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "nurOhneLieferant", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Nur Strecken ohne Lieferant" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "nurOhneKunde", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Nur Strecken ohne Kunde" }) }) })
                ] })
              ] }, "2"),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane, { tab: "KONTRAKTE", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "EK-Kontakt-Nr. von", name: "ekKontaktNrVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von EK-Kontakt-Nr." }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "EK-Kontakt-Nr. bis", name: "ekKontaktNrBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis EK-Kontakt-Nr." }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "VK-Kontakt-Nr. von", name: "vkKontaktNrVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von VK-Kontakt-Nr." }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "VK-Kontakt-Nr. bis", name: "vkKontaktNrBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis VK-Kontakt-Nr." }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { gutter: 16, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "EK/VK nach Biomasse", name: "biomasseOption", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { placeholder: "Biomasse-Option wählen", children: biomasseOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(Option, { value: option.value, children: option.label }, option.value)) }) }) }) })
              ] }, "3"),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane, { tab: "LIEFERRECHNUNG", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Liefer-Rechnungsdatum von", name: "lieferRechnungsdatumVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DatePicker, { placeholder: "Von Datum", style: { width: "100%" } }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Liefer-Rechnungsdatum bis", name: "lieferRechnungsdatumBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DatePicker, { placeholder: "Bis Datum", style: { width: "100%" } }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "LKW-Kennzeichen von", name: "lkwKennzeichenVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von LKW-Kennzeichen" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "LKW-Kennzeichen bis", name: "lkwKennzeichenBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis LKW-Kennzeichen" }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "keineEingangsrechnung", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Keine Eingangsrechnung" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "keineSpeditionsrechnung", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Keine Speditionsrechnung" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "keineFrachtabrechnung", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Keine Frachtabrechnung" }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { gutter: 16, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { name: "deckungsbeitragAusStreckendaten", valuePropName: "checked", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { children: "Deckungsbeitrag aus Streckendaten berechnen" }) }) }) })
              ] }, "4"),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane, { tab: "BE-/ENTLADESTELLE", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Land", name: "land", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Land eingeben" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Be-/Entladestelle PLZ von", name: "beEntladestellePLZVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von PLZ" }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { gutter: 16, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Be-/Entladestelle PLZ bis", name: "beEntladestellePLZBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis PLZ" }) }) }) })
              ] }, "5"),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane, { tab: "PARTIE/NLS", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Partie-Nr. von", name: "partienNrVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von Partie-Nr." }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Partie-Nr. bis", name: "partienNrBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis Partie-Nr." }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "NLS-Nr. von", name: "nlsNrVon", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Von NLS-Nr." }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "NLS-Nr. bis", name: "nlsNrBis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bis NLS-Nr." }) }) })
                ] })
              ] }, "6"),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane, { tab: "SONSTIGE SELEKTIONEN", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Spediteur", name: "spediteur", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Spediteur eingeben" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Start", name: "start", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Start eingeben" }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Ursprung", name: "ursprung", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Ursprung eingeben" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Lagerhalle", name: "lagerhalle", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Lagerhalle eingeben" }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Fahrzeug-Kennzeichen", name: "fahrzeugKennzeichen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Fahrzeug-Kennzeichen" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Sorten-Nr.", name: "sortenNr", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Sorten-Nr." }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Kostenstelle", name: "kostenstelle", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Kostenstelle" }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Bedarfsnummer", name: "bedarfsnummer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { placeholder: "Bedarfsnummer" }) }) })
                ] })
              ] }, "7"),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(TabPane, { tab: "ALLGEMEINE FILTER", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Vorgangstyp", name: "vorgangsTyp", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { placeholder: "Vorgangstyp wählen", allowClear: true, children: vorgangsTypOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(Option, { value: option.value, children: option.label }, option.value)) }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Status", name: "status", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Select, { placeholder: "Status wählen", allowClear: true, children: statusOptions.map((option) => /* @__PURE__ */ jsxRuntimeExports.jsx(Option, { value: option.value, children: option.label }, option.value)) }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Row, { gutter: 16, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Datum von/bis", name: "datumRange", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RangePicker, { style: { width: "100%" } }) }) }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Min. Menge", name: "minMenge", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, { placeholder: "Min", style: { width: "100%" } }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Max. Menge", name: "maxMenge", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, { placeholder: "Max", style: { width: "100%" } }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Min. EK-Preis", name: "minEkPreis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, { placeholder: "Min", style: { width: "100%" } }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Max. EK-Preis", name: "maxEkPreis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, { placeholder: "Max", style: { width: "100%" } }) }) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Min. VK-Preis", name: "minVkPreis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, { placeholder: "Min", style: { width: "100%" } }) }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Form.Item, { label: "Max. VK-Preis", name: "maxVkPreis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TypedInputNumber, { placeholder: "Max", style: { width: "100%" } }) }) })
                ] })
              ] }, "8")
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, justify: "end", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$3, {}),
                  onClick: handleReset,
                  disabled: loading,
                  children: "Zurücksetzen"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  type: "primary",
                  icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$4, {}),
                  loading,
                  children: "Filter anwenden"
                }
              ) })
            ] })
          ]
        }
      ) }, "1") })
    }
  );
};
const { Search } = Input;
const { Title, Text } = Typography;
const mockStreckengeschaeftData = [
  {
    streckeNr: "STR-2024-001",
    vorgangsTyp: VorgangsTyp.KAUF,
    datum: "2024-01-15",
    vorgangPosition: "POS-001",
    positionsNr: "001",
    artikelVon: "ART-001",
    artikelBis: "ART-002",
    artikelBezeichnung: "Holzpellets Premium",
    artikelNr: "HP-001",
    sortenNr: "SORT-001",
    vertrag: "V-2024-001",
    lieferschein: "LS-2024-001",
    kennzeichen: "KENN-001",
    lkwKennzeichen: "M-AB-1234",
    menge: 1e3,
    einheit: "kg",
    ekPreis: 0.25,
    vkPreis: 0.35,
    frachtkosten: 150,
    preisProEinheit: 0.3,
    ekMenge: 1e3,
    ekNetto: 250,
    ekLieferkosten: 50,
    ekRechnung: "EK-R-001",
    ekKontakt: "Max Mustermann",
    ekKontaktNr: "EK-001",
    vkMenge: 1e3,
    vkNetto: 350,
    vkLieferkosten: 100,
    vkRechnung: "VK-R-001",
    vkKontakt: "Anna Schmidt",
    vkKontaktNr: "VK-001",
    lieferant: "Holzlieferant GmbH",
    lieferantName: "Holzlieferant GmbH",
    lieferantNr: "L-001",
    kunde: "Energieversorger AG",
    kundeName: "Energieversorger AG",
    kundeNr: "K-001",
    spediteurNr: "SP-001",
    spediteurName: "Schnell Transport",
    frachtart: "LKW",
    beEntladestelle: "Lagerhalle Nord",
    beEntladestellePLZ: "12345",
    land: "Deutschland",
    partienNr: "PART-001",
    nlsNr: "NLS-001",
    bereich: "Biomasse",
    spediteur: "Schnell Transport",
    start: "Hamburg",
    ursprung: "Skandinavien",
    lagerhalle: "Lager Nord",
    fahrzeugKennzeichen: "HH-AB-5678",
    kostenstelle: "KS-001",
    bedarfsnummer: "BED-001",
    summeVk: 350,
    summeEk: 250,
    restwert: 100,
    geplanteMengeVk: 1e3,
    geplanteMengeEk: 1e3,
    status: StreckenStatus.BESTÄTIGT,
    erstelltAm: "2024-01-10",
    geaendertAm: "2024-01-15",
    erstelltVon: "admin",
    bemerkung: "Premium-Qualität, schnelle Lieferung",
    referenzNr: "REF-001",
    waehrung: "EUR",
    skonto: 2,
    rabatt: 5,
    istBiomasse: true,
    hatEingangsrechnung: true,
    hatSpeditionsrechnung: true,
    hatFrachtabrechnung: true,
    deckungsbeitrag: 50
  },
  {
    streckeNr: "STR-2024-002",
    vorgangsTyp: VorgangsTyp.VERKAUF,
    datum: "2024-01-20",
    vorgangPosition: "POS-002",
    positionsNr: "002",
    artikelVon: "ART-003",
    artikelBis: "ART-004",
    artikelBezeichnung: "Hackschnitzel Standard",
    artikelNr: "HS-001",
    sortenNr: "SORT-002",
    vertrag: "V-2024-002",
    lieferschein: "LS-2024-002",
    kennzeichen: "KENN-002",
    lkwKennzeichen: "M-CD-5678",
    menge: 2e3,
    einheit: "kg",
    ekPreis: 0.15,
    vkPreis: 0.25,
    frachtkosten: 200,
    preisProEinheit: 0.2,
    ekMenge: 2e3,
    ekNetto: 300,
    ekLieferkosten: 75,
    ekRechnung: "EK-R-002",
    ekKontakt: "Peter Müller",
    ekKontaktNr: "EK-002",
    vkMenge: 2e3,
    vkNetto: 500,
    vkLieferkosten: 125,
    vkRechnung: "VK-R-002",
    vkKontakt: "Maria Weber",
    vkKontaktNr: "VK-002",
    lieferant: "Waldholz AG",
    lieferantName: "Waldholz AG",
    lieferantNr: "L-002",
    kunde: "Heizwerk Süd",
    kundeName: "Heizwerk Süd",
    kundeNr: "K-002",
    spediteurNr: "SP-002",
    spediteurName: "Grün Transport",
    frachtart: "LKW",
    beEntladestelle: "Heizwerk Süd",
    beEntladestellePLZ: "54321",
    land: "Deutschland",
    partienNr: "PART-002",
    nlsNr: "NLS-002",
    bereich: "Biomasse",
    spediteur: "Grün Transport",
    start: "München",
    ursprung: "Bayern",
    lagerhalle: "Lager Süd",
    fahrzeugKennzeichen: "M-CD-9012",
    kostenstelle: "KS-002",
    bedarfsnummer: "BED-002",
    summeVk: 500,
    summeEk: 300,
    restwert: 200,
    geplanteMengeVk: 2e3,
    geplanteMengeEk: 2e3,
    status: StreckenStatus.IN_BEARBEITUNG,
    erstelltAm: "2024-01-18",
    geaendertAm: "2024-01-20",
    erstelltVon: "admin",
    bemerkung: "Standard-Qualität, regionale Herkunft",
    referenzNr: "REF-002",
    waehrung: "EUR",
    skonto: 1,
    rabatt: 3,
    istBiomasse: true,
    hatEingangsrechnung: false,
    hatSpeditionsrechnung: true,
    hatFrachtabrechnung: false,
    deckungsbeitrag: 125
  }
];
const mockSummen = {
  ekBetragInklMwSt: 654.5,
  vkBetragInklMwSt: 1012,
  frachtkosten: 350,
  sollDifferenz: 357.5,
  istDifferenz: 350,
  mwst: 157.5,
  deckungsbeitrag: 175,
  differenzSollIst: 7.5,
  restMenge: 0,
  restWert: 300,
  geplanteMengenEk: 3e3,
  geplanteMengenVk: 3e3
};
const StreckengeschaeftList = () => {
  const [searchText, setSearchText] = reactExports.useState("");
  const [filter, setFilter] = reactExports.useState({});
  const [isFormVisible, setIsFormVisible] = reactExports.useState(false);
  const [editingRecord, setEditingRecord] = reactExports.useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = reactExports.useState([]);
  const queryClient = useQueryClient();
  const { data: streckengeschaeftData = [], isLoading } = useQuery({
    queryKey: ["streckengeschaeft", filter, searchText],
    queryFn: () => {
      let filteredData = [...mockStreckengeschaeftData];
      if (searchText) {
        filteredData = filteredData.filter(
          (item) => item.streckeNr.toLowerCase().includes(searchText.toLowerCase()) || item.artikelBezeichnung.toLowerCase().includes(searchText.toLowerCase()) || item.lieferantName.toLowerCase().includes(searchText.toLowerCase()) || item.kundeName.toLowerCase().includes(searchText.toLowerCase())
        );
      }
      return filteredData;
    }
  });
  const { data: summen = mockSummen } = useQuery({
    queryKey: ["streckengeschaeft-summen", filter],
    queryFn: () => mockSummen
  });
  const createMutation = useMutation({
    mutationFn: (data) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(data), 1e3);
      });
    },
    onSuccess: () => {
      staticMethods.success("Streckengeschäft erfolgreich erstellt");
      setIsFormVisible(false);
      queryClient.invalidateQueries({ queryKey: ["streckengeschaeft"] });
    }
  });
  const deleteMutation = useMutation({
    mutationFn: (id) => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(), 1e3);
      });
    },
    onSuccess: () => {
      staticMethods.success("Streckengeschäft erfolgreich gelöscht");
      queryClient.invalidateQueries({ queryKey: ["streckengeschaeft"] });
    }
  });
  const handleCreate = () => {
    setEditingRecord(null);
    setIsFormVisible(true);
  };
  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsFormVisible(true);
  };
  const handleDelete = (record) => {
    Modal.confirm({
      title: "Streckengeschäft löschen",
      content: `Möchten Sie das Streckengeschäft "${record.streckeNr}" wirklich löschen?`,
      okText: "Löschen",
      okType: "danger",
      cancelText: "Abbrechen",
      onOk: () => deleteMutation.mutate(record.streckeNr)
    });
  };
  const handleFormSubmit = (values) => {
    if (editingRecord) {
      createMutation.mutate(__spreadValues(__spreadValues({}, editingRecord), values));
    } else {
      const newRecord = __spreadProps(__spreadValues({}, values), {
        streckeNr: `STR-${Date.now()}`,
        status: StreckenStatus.ENTWURF,
        erstelltAm: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        geaendertAm: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        erstelltVon: "admin"
      });
      createMutation.mutate(newRecord);
    }
  };
  const columns = [
    {
      title: "Strecke-Nr.",
      dataIndex: "streckeNr",
      key: "streckeNr",
      fixed: "left",
      width: 120,
      render: (text) => /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { strong: true, children: text })
    },
    {
      title: "Datum",
      dataIndex: "datum",
      key: "datum",
      width: 100,
      render: (text) => formatDate(text)
    },
    {
      title: "Vorgang",
      dataIndex: "vorgangsTyp",
      key: "vorgangsTyp",
      width: 100,
      render: (text) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: text === VorgangsTyp.KAUF ? "blue" : "green", children: getVorgangsTypLabel(text) })
    },
    {
      title: "Vorgangsposition",
      dataIndex: "vorgangPosition",
      key: "vorgangPosition",
      width: 120
    },
    {
      title: "Positions-Nr.",
      dataIndex: "positionsNr",
      key: "positionsNr",
      width: 100
    },
    {
      title: "Vertrag",
      dataIndex: "vertrag",
      key: "vertrag",
      width: 100
    },
    {
      title: "Lieferschein",
      dataIndex: "lieferschein",
      key: "lieferschein",
      width: 120
    },
    {
      title: "Kennzeichen",
      dataIndex: "kennzeichen",
      key: "kennzeichen",
      width: 100
    },
    {
      title: "Artikel-Nr.",
      dataIndex: "artikelNr",
      key: "artikelNr",
      width: 100
    },
    {
      title: "Artikelbezeichnung",
      dataIndex: "artikelBezeichnung",
      key: "artikelBezeichnung",
      width: 200
    },
    {
      title: "Bereich",
      dataIndex: "bereich",
      key: "bereich",
      width: 100
    },
    {
      title: "Lieferant",
      dataIndex: "lieferantName",
      key: "lieferantName",
      width: 150
    },
    {
      title: "EK-Kontakt",
      dataIndex: "ekKontakt",
      key: "ekKontakt",
      width: 120
    },
    {
      title: "EK-Menge",
      dataIndex: "ekMenge",
      key: "ekMenge",
      width: 100,
      render: (value) => formatNumber(value)
    },
    {
      title: "EK-Netto",
      dataIndex: "ekNetto",
      key: "ekNetto",
      width: 100,
      render: (value) => formatCurrency(value)
    },
    {
      title: "EK-Lieferkosten",
      dataIndex: "ekLieferkosten",
      key: "ekLieferkosten",
      width: 120,
      render: (value) => formatCurrency(value)
    },
    {
      title: "EK-Rechnung",
      dataIndex: "ekRechnung",
      key: "ekRechnung",
      width: 100
    },
    {
      title: "Kunde",
      dataIndex: "kundeName",
      key: "kundeName",
      width: 150
    },
    {
      title: "VK-Kontakt",
      dataIndex: "vkKontakt",
      key: "vkKontakt",
      width: 120
    },
    {
      title: "VK-Menge",
      dataIndex: "vkMenge",
      key: "vkMenge",
      width: 100,
      render: (value) => formatNumber(value)
    },
    {
      title: "VK-Netto",
      dataIndex: "vkNetto",
      key: "vkNetto",
      width: 100,
      render: (value) => formatCurrency(value)
    },
    {
      title: "VK-Lieferkosten",
      dataIndex: "vkLieferkosten",
      key: "vkLieferkosten",
      width: 120,
      render: (value) => formatCurrency(value)
    },
    {
      title: "VK-Rechnung",
      dataIndex: "vkRechnung",
      key: "vkRechnung",
      width: 100
    },
    {
      title: "Spediteur-Nr.",
      dataIndex: "spediteurNr",
      key: "spediteurNr",
      width: 100
    },
    {
      title: "Speditionsname",
      dataIndex: "spediteurName",
      key: "spediteurName",
      width: 150
    },
    {
      title: "Frachtart",
      dataIndex: "frachtart",
      key: "frachtart",
      width: 100
    },
    {
      title: "Frachtkosten",
      dataIndex: "frachtkosten",
      key: "frachtkosten",
      width: 100,
      render: (value) => formatCurrency(value)
    },
    {
      title: "Preis pro Einheit",
      dataIndex: "preisProEinheit",
      key: "preisProEinheit",
      width: 120,
      render: (value) => formatCurrency(value)
    },
    {
      title: "Summe VK",
      dataIndex: "summeVk",
      key: "summeVk",
      width: 100,
      render: (value) => formatCurrency(value)
    },
    {
      title: "Summe EK",
      dataIndex: "summeEk",
      key: "summeEk",
      width: 100,
      render: (value) => formatCurrency(value)
    },
    {
      title: "Restwert",
      dataIndex: "restwert",
      key: "restwert",
      width: 100,
      render: (value) => formatCurrency(value)
    },
    {
      title: "Geplante Menge VK",
      dataIndex: "geplanteMengeVk",
      key: "geplanteMengeVk",
      width: 140,
      render: (value) => formatNumber(value)
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      fixed: "right",
      render: (text) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: getStatusColor(text), children: getStatusLabel(text) })
    },
    {
      title: "Aktionen",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Space, { size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Anzeigen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "text",
            size: "small",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$9, {})
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "text",
            size: "small",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$a, {}),
            onClick: () => handleEdit(record)
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "text",
            size: "small",
            danger: true,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$b, {}),
            onClick: () => handleDelete(record)
          }
        ) })
      ] })
    }
  ];
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Title, { level: 3, children: "Streckengeschäfte" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Space, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$6, {}),
            onClick: () => staticMethods.info("Export-Funktion wird implementiert"),
            children: "Export"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$7, {}),
            onClick: () => queryClient.invalidateQueries({ queryKey: ["streckengeschaeft"] }),
            loading: isLoading,
            children: "Aktualisieren"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "primary",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$8, {}),
            onClick: handleCreate,
            children: "Neues Streckengeschäft"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      StreckengeschaeftFilterPanel,
      {
        onFilterChange: setFilter,
        onReset: () => setFilter({}),
        loading: isLoading
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { size: "small", className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "EK-Betrag inkl. MwSt.",
            value: summen.ekBetragInklMwSt,
            precision: 2,
            suffix: "€"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "VK-Betrag inkl. MwSt.",
            value: summen.vkBetragInklMwSt,
            precision: 2,
            suffix: "€"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "Frachtkosten",
            value: summen.frachtkosten,
            precision: 2,
            suffix: "€"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "Soll/Ist Differenz",
            value: summen.sollDifferenz,
            precision: 2,
            suffix: "€"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "MwSt.",
            value: summen.mwst,
            precision: 2,
            suffix: "€"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "Deckungsbeitrag",
            value: summen.deckungsbeitrag,
            precision: 2,
            suffix: "€",
            valueStyle: { color: summen.deckungsbeitrag > 0 ? "#3f8600" : "#cf1322" }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "Differenz Soll/Ist",
            value: summen.differenzSollIst,
            precision: 2,
            suffix: "€",
            valueStyle: { color: summen.differenzSollIst > 0 ? "#3f8600" : "#cf1322" }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "Rest-Menge",
            value: summen.restMenge,
            suffix: "kg"
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "Rest-Wert",
            value: summen.restWert,
            precision: 2,
            suffix: "€"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "Geplante Mengen EK",
            value: summen.geplanteMengenEk,
            suffix: "kg"
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Statistic,
          {
            title: "Geplante Mengen VK",
            value: summen.geplanteMengenVk,
            suffix: "kg"
          }
        ) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Search,
        {
          placeholder: "Streckengeschäfte durchsuchen...",
          allowClear: true,
          enterButton: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$4, {}),
          size: "large",
          value: searchText,
          onChange: (e) => setSearchText(e.target.value),
          style: { maxWidth: 400 }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ForwardTable,
        {
          columns,
          dataSource: streckengeschaeftData,
          rowKey: "streckeNr",
          loading: isLoading,
          scroll: { x: 3e3 },
          pagination: {
            total: streckengeschaeftData.length,
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} von ${total} Streckengeschäften`
          },
          rowSelection,
          size: "small"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Modal,
      {
        title: editingRecord ? "Streckengeschäft bearbeiten" : "Neues Streckengeschäft",
        open: isFormVisible,
        onCancel: () => setIsFormVisible(false),
        footer: null,
        width: 1200,
        destroyOnClose: true,
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          StreckengeschaeftForm,
          {
            initialData: editingRecord,
            onSubmit: handleFormSubmit,
            onCancel: () => setIsFormVisible(false),
            loading: createMutation.isPending
          }
        )
      }
    )
  ] });
};
export {
  StreckengeschaeftList as S
};
//# sourceMappingURL=streckengeschaeft-CkKAL3kB.js.map
