var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
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
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-C09FwfLq.js";
import { S as StreckengeschaeftList } from "./streckengeschaeft-CkKAL3kB.js";
import { B as Box, T as Typography, p as Chip, G as Grid, C as Card, a as CardContent, K as Tabs, N as Tab } from "./mui-material-B4Zm8Ctl.js";
import { o as BusinessIcon, T as TrendingUp, r as AssessmentIcon, t as SettingsIcon } from "./mui-icons-CGIi46zQ.js";
import "./other-vendor-OscdKVAu.js";
import "./lodash-BQSKQrpq.js";
import "./types-y_80m08G.js";
import "./validation-CXIZp7Zb.js";
import "./hookform-resolvers-B3VX3b4X.js";
import "./antd-core-Bn6Stp_u.js";
import "./antd-icons-ZoMdwZyJ.js";
function TabPanel(props) {
  const _a = props, { children, value, index } = _a, other = __objRest(_a, ["children", "value", "index"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    __spreadProps(__spreadValues({
      role: "tabpanel",
      hidden: value !== index,
      id: `streckengeschaeft-tabpanel-${index}`,
      "aria-labelledby": `streckengeschaeft-tab-${index}`
    }, other), {
      children: value === index && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "pt-4", children })
    })
  );
}
const StreckengeschaeftPage = () => {
  const [tabValue, setTabValue] = reactExports.useState(0);
  const [selectedStrecke, setSelectedStrecke] = reactExports.useState(null);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  const stats = {
    totalStrecken: 156,
    activeStrecken: 23,
    totalRevenue: 125e4,
    totalProfit: 187500
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "min-h-screen bg-gray-50", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "bg-white shadow-sm border-b", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between h-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { className: "text-blue-600" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", className: "text-gray-900 font-semibold", children: "Streckengeschäfte" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: "VALEO NeuroERP",
            size: "small",
            color: "primary",
            variant: "outlined"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "flex items-center space-x-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", className: "text-gray-600", children: [
        "Letzte Aktualisierung: ",
        (/* @__PURE__ */ new Date()).toLocaleString("de-DE")
      ] }) })
    ] }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, className: "mb-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-gradient-to-r from-blue-500 to-blue-600 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "font-bold", children: stats.totalStrecken }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "opacity-90", children: "Gesamt Strecken" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { className: "text-4xl opacity-80" })
        ] }) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-gradient-to-r from-green-500 to-green-600 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "font-bold", children: stats.activeStrecken }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "opacity-90", children: "Aktive Strecken" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "text-4xl opacity-80" })
        ] }) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-gradient-to-r from-purple-500 to-purple-600 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "font-bold", children: new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(stats.totalRevenue) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "opacity-90", children: "Gesamtumsatz" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentIcon, { className: "text-4xl opacity-80" })
        ] }) }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "bg-gradient-to-r from-orange-500 to-orange-600 text-white", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "font-bold", children: new Intl.NumberFormat("de-DE", {
              style: "currency",
              currency: "EUR",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(stats.totalProfit) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "opacity-90", children: "Gesamtgewinn" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "text-4xl opacity-80" })
        ] }) }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-0", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Tabs,
          {
            value: tabValue,
            onChange: handleTabChange,
            variant: "scrollable",
            scrollButtons: "auto",
            className: "px-6",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tab,
                {
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Übersicht" })
                  ] }),
                  iconPosition: "start"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tab,
                {
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Analysen" })
                  ] }),
                  iconPosition: "start"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tab,
                {
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentIcon, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Berichte" })
                  ] }),
                  iconPosition: "start"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Tab,
                {
                  label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center space-x-2", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, {}),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Einstellungen" })
                  ] }),
                  iconPosition: "start"
                }
              )
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StreckengeschaeftList, {}) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4", children: "Streckengeschäft-Analysen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", className: "text-gray-600", children: "Hier werden detaillierte Analysen und Charts für die Streckengeschäfte angezeigt. Funktionen wie Gewinnmargen-Analyse, Trend-Analyse und Performance-Metriken werden implementiert." })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4", children: "Berichte und Exporte" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", className: "text-gray-600", children: "Hier können verschiedene Berichte generiert und exportiert werden: - Monatliche/Quartalsberichte - Gewinnmargen-Analyse - Kunden- und Lieferanten-Performance - Excel/PDF Exporte" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "p-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4", children: "Streckengeschäft-Einstellungen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", className: "text-gray-600", children: "Konfiguration für das Streckengeschäft-Modul: - Standardwerte für neue Strecken - Automatische Nummerierung - Benachrichtigungen - Workflow-Einstellungen" })
        ] }) })
      ] }) })
    ] })
  ] });
};
export {
  StreckengeschaeftPage
};
//# sourceMappingURL=pages-DLIdYrrg.js.map
