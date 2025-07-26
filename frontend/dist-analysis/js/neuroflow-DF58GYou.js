const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/pages-DLIdYrrg.js","js/react-vendor-C09FwfLq.js","js/other-vendor-OscdKVAu.js","js/lodash-BQSKQrpq.js","js/streckengeschaeft-CkKAL3kB.js","js/types-y_80m08G.js","js/validation-CXIZp7Zb.js","js/hookform-resolvers-B3VX3b4X.js","js/antd-core-Bn6Stp_u.js","js/antd-icons-ZoMdwZyJ.js","js/mui-material-B4Zm8Ctl.js","js/mui-icons-CGIi46zQ.js","js/e-invoicing-DCH02efg.js","js/components-Dj2tQkqX.js","js/services-B0UdZUHq.js","js/axios-BDGNVNQ7.js","js/utils-Cn0CNrbA.js","js/pos-system-D3uS3wb4.js"])))=>i.map(i=>d[i]);
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
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};
import { _ as __vitePreload } from "./components-Dj2tQkqX.js";
import { r as reactExports, R as React, j as jsxRuntimeExports, f as useForm, C as Controller } from "./react-vendor-C09FwfLq.js";
import { u as useAuth } from "./auth-Bv6CYr1e.js";
import { B as Box, T as Typography, L as List, g as ListItem, h as ListItemIcon, i as ListItemText, c as Button, Q as Stack, q as Tooltip, I as IconButton, K as Tabs, N as Tab, G as Grid, R as styled, a as CardContent, U as ListItemSecondaryAction, A as Alert, P as Paper, d as CircularProgress, C as Card, p as Chip, b as TextField, V as Autocomplete, W as Popper, F as FormControl, w as InputLabel, S as Select, M as MenuItem, X as FormHelperText, x as FormControlLabel, y as Switch, j as TableContainer, k as Table, l as TableHead, m as TableRow, n as TableCell, o as TableBody, r as Dialog, s as DialogTitle, t as DialogContent, v as DialogActions } from "./mui-material-B4Zm8Ctl.js";
import { L as LogoutIcon, m as AutoGraphIcon, R as RefreshIcon, n as ScienceIcon, o as BusinessIcon, p as TimelineIcon, c as AddIcon, q as PlayArrowIcon, d as CheckCircleIcon, W as WarningIcon, D as DashboardIcon, a as Receipt, r as AssessmentIcon, s as RouteIcon, t as SettingsIcon, u as InfoIcon, l as Error2, v as BankIcon, w as LocationIcon, x as PersonIcon, b as DescriptionIcon, y as ContactIcon, z as PaymentIcon, F as ShippingIcon, G as CancelIcon, H as SaveIcon, Q as QrCodeIcon, f as ViewIcon, g as DeleteIcon, J as SecurityIcon } from "./mui-icons-CGIi46zQ.js";
import { a } from "./hookform-resolvers-B3VX3b4X.js";
import { o as object, s as string, e as boolean, n as number, _ as _enum, l as literal, f as array } from "./validation-CXIZp7Zb.js";
import { d as debounce } from "./lodash-BQSKQrpq.js";
import "./services-B0UdZUHq.js";
import "./axios-BDGNVNQ7.js";
import "./other-vendor-OscdKVAu.js";
const NeuroFlowSupplierForm$2 = reactExports.lazy(() => __vitePreload(() => Promise.resolve().then(() => NeuroFlowSupplierForm$1), true ? void 0 : void 0).then((module) => ({ default: module.NeuroFlowSupplierForm })));
const NeuroFlowChargenverwaltung$2 = reactExports.lazy(() => __vitePreload(() => Promise.resolve().then(() => NeuroFlowChargenverwaltung$1), true ? void 0 : void 0).then((module) => ({ default: module.NeuroFlowChargenverwaltung })));
const NeuroFlowAutocomplete$2 = reactExports.lazy(() => __vitePreload(() => Promise.resolve().then(() => NeuroFlowAutocomplete$1), true ? void 0 : void 0).then((module) => ({ default: module.NeuroFlowAutocomplete })));
const StreckengeschaeftPage = reactExports.lazy(() => __vitePreload(() => import("./pages-DLIdYrrg.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]) : void 0).then((module) => ({ default: module.StreckengeschaeftPage })));
const EInvoicingPage = reactExports.lazy(() => __vitePreload(() => import("./e-invoicing-DCH02efg.js"), true ? __vite__mapDeps([12,1,2,3,13,10,11,14,15,16,8,9,7,6]) : void 0));
const POSPage = reactExports.lazy(() => __vitePreload(() => import("./pos-system-D3uS3wb4.js").then((n) => n.P), true ? __vite__mapDeps([17,1,2,3,10,11,13,14,15]) : void 0));
const DailyReportPage = reactExports.lazy(() => __vitePreload(() => import("./pos-system-D3uS3wb4.js").then((n) => n.D), true ? __vite__mapDeps([17,1,2,3,10,11,13,14,15]) : void 0));
const ComponentLoader = ({ componentName }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Box,
  {
    sx: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "200px",
      flexDirection: "column",
      gap: 2
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 40 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
        componentName,
        " wird geladen..."
      ] })
    ]
  }
);
const DashboardCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-2px)"
  }
}));
const StatusChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  fontWeight: 600,
  "&.MuiChip-colorSuccess": {
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText
  },
  "&.MuiChip-colorWarning": {
    backgroundColor: theme.palette.warning.light,
    color: theme.palette.warning.contrastText
  },
  "&.MuiChip-colorError": {
    backgroundColor: theme.palette.error.light,
    color: theme.palette.error.contrastText
  },
  "&.MuiChip-colorInfo": {
    backgroundColor: theme.palette.info.light,
    color: theme.palette.info.contrastText
  }
}));
const NeuroFlowDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = reactExports.useState(0);
  const [showSupplierForm, setShowSupplierForm] = reactExports.useState(false);
  const [showChargeForm, setShowChargeForm] = reactExports.useState(false);
  const [stats, setStats] = reactExports.useState({
    totalCharges: 0,
    pendingCharges: 0,
    approvedCharges: 0,
    quarantinedCharges: 0,
    totalSuppliers: 0,
    activeSuppliers: 0,
    totalArticles: 0,
    lowStockArticles: 0,
    workflowExecutions: 0,
    successfulWorkflows: 0,
    failedWorkflows: 0,
    kiAnalysisCount: 0,
    averageProcessingTime: 0
  });
  const [services, setServices] = reactExports.useState([
    {
      name: "n8n Workflow Engine",
      status: "online",
      url: "http://localhost:5678",
      responseTime: 120,
      lastCheck: /* @__PURE__ */ new Date(),
      description: "Workflow-Automatisierung und KI-Integration"
    },
    {
      name: "MCP Resource Server",
      status: "online",
      url: "http://localhost:8001",
      responseTime: 85,
      lastCheck: /* @__PURE__ */ new Date(),
      description: "Model Context Protocol für KI-Kommunikation"
    },
    {
      name: "Autocomplete API",
      status: "online",
      url: "http://localhost:8003",
      responseTime: 45,
      lastCheck: /* @__PURE__ */ new Date(),
      description: "Intelligente Autocomplete-Funktionalität"
    },
    {
      name: "PostgreSQL Database",
      status: "online",
      url: "localhost:5432",
      responseTime: 12,
      lastCheck: /* @__PURE__ */ new Date(),
      description: "Hauptdatenbank für Stammdaten"
    }
  ]);
  const [loading, setLoading] = reactExports.useState(false);
  const trackDashboardLoad = React.useCallback(() => {
    const startTime = performance.now();
    return () => {
      const loadEnd = performance.now();
      const loadDuration = loadEnd - startTime;
      console.log(`🧠 NeuroFlowDashboard geladen in ${loadDuration.toFixed(2)}ms`);
    };
  }, []);
  reactExports.useEffect(() => {
    const loadDashboardData = () => __async(void 0, null, function* () {
      setLoading(true);
      const trackLoad = trackDashboardLoad();
      try {
        yield new Promise((resolve) => setTimeout(resolve, 1e3));
        setStats({
          totalCharges: 1247,
          pendingCharges: 23,
          approvedCharges: 1189,
          quarantinedCharges: 35,
          totalSuppliers: 89,
          activeSuppliers: 76,
          totalArticles: 456,
          lowStockArticles: 12,
          workflowExecutions: 2341,
          successfulWorkflows: 2218,
          failedWorkflows: 123,
          kiAnalysisCount: 1897,
          averageProcessingTime: 2.3
        });
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
        trackLoad();
      }
    });
    loadDashboardData();
  }, []);
  const tabs = [
    { label: "Übersicht", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardIcon, {}) },
    { label: "Kassensystem", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, {}) },
    { label: "Tagesjournal", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentIcon, {}) },
    { label: "Streckengeschäfte", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteIcon, {}) },
    { label: "E-Invoicing", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, {}) },
    { label: "Chargenverwaltung", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScienceIcon, {}) },
    { label: "Lieferantenstammdaten", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, {}) },
    { label: "Workflows", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineIcon, {}) },
    { label: "KI-Analysen", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoGraphIcon, {}) },
    { label: "Services", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, {}) }
  ];
  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "success";
      case "warning":
        return "warning";
      case "offline":
        return "error";
      default:
        return "default";
    }
  };
  const getStatusIcon = (status) => {
    switch (status) {
      case "online":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" });
      case "warning":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" });
      case "offline":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Error2, { color: "error" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { color: "action" });
    }
  };
  const handleLogout = () => __async(void 0, null, function* () {
    try {
      yield logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Box,
      {
        sx: {
          width: 280,
          backgroundColor: "background.paper",
          borderRight: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column"
        },
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, borderBottom: 1, borderColor: "divider" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", component: "h1", gutterBottom: true, children: "VALEO NeuroERP" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "text.secondary", children: [
              user == null ? void 0 : user.full_name,
              " (",
              user == null ? void 0 : user.role,
              ")"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1, p: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: tabs.map((tab, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            ListItem,
            {
              button: true,
              onClick: () => setActiveTab(index),
              selected: activeTab === index,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: tab.icon }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemText, { primary: tab.label })
              ]
            },
            index
          )) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 2, borderTop: 1, borderColor: "divider" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              fullWidth: true,
              variant: "outlined",
              onClick: handleLogout,
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(LogoutIcon, {}),
              children: "Abmelden"
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1, p: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AutoGraphIcon, { color: "primary", sx: { fontSize: 40 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, color: "text.primary", children: "VALEO NeuroERP Dashboard" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", children: "KI-first ERP-System mit intelligenter Workflow-Automatisierung" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Daten aktualisieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => window.location.reload(), color: "primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}) }) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { borderBottom: 1, borderColor: "divider", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: activeTab, onChange: (e, newValue) => setActiveTab(newValue), children: tabs.map((tab, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tab,
        {
          label: tab.label,
          icon: tab.icon,
          iconPosition: "start",
          sx: { minHeight: 64 }
        },
        index
      )) }) }),
      activeTab === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, color: "primary", children: stats.totalCharges }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Gesamte Chargen" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ScienceIcon, { color: "primary", sx: { fontSize: 40 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, mt: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { label: `${stats.approvedCharges} Genehmigt`, color: "success", size: "small" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { label: `${stats.pendingCharges} Ausstehend`, color: "warning", size: "small" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { label: `${stats.quarantinedCharges} Quarantäne`, color: "error", size: "small" })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, color: "secondary", children: stats.totalSuppliers }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Lieferanten" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { color: "secondary", sx: { fontSize: 40 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, mt: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { label: `${stats.activeSuppliers} Aktiv`, color: "success", size: "small" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { label: `${stats.totalSuppliers - stats.activeSuppliers} Inaktiv`, color: "default", size: "small" })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, color: "info", children: stats.workflowExecutions }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Workflow-Ausführungen" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineIcon, { color: "info", sx: { fontSize: 40 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, mt: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { label: `${stats.successfulWorkflows} Erfolgreich`, color: "success", size: "small" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { label: `${stats.failedWorkflows} Fehlgeschlagen`, color: "error", size: "small" })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", fontWeight: 700, color: "warning", children: stats.kiAnalysisCount }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "KI-Analysen" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AutoGraphIcon, { color: "warning", sx: { fontSize: 40 } })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1, mt: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { label: `${stats.averageProcessingTime}s Durchschnitt`, color: "info", size: "small" }) })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Schnellaktionen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                onClick: () => setShowChargeForm(true),
                children: "Neue Charge erstellen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
                onClick: () => setShowSupplierForm(true),
                children: "Neuen Lieferanten anlegen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrowIcon, {}),
                children: "Workflow ausführen"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoGraphIcon, {}),
                children: "KI-Analyse starten"
              }
            )
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Letzte Aktivitäten" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Charge CH20240701001 genehmigt",
                  secondary: "Vor 5 Minuten"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Charge CH20240702001 in Quarantäne",
                  secondary: "Vor 12 Minuten"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoGraphIcon, { color: "info" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "KI-Analyse für Sojaschrot abgeschlossen",
                  secondary: "Vor 18 Minuten"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { color: "primary" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ListItemText,
                {
                  primary: "Neuer Lieferant 'Agrarhandel GmbH' angelegt",
                  secondary: "Vor 25 Minuten"
                }
              )
            ] })
          ] })
        ] }) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Service-Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, children: services.map((service, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: getStatusIcon(service.status) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: service.name,
                secondary: `${service.responseTime}ms • ${service.description}`
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatusChip,
              {
                label: service.status,
                color: getStatusColor(service.status),
                size: "small"
              }
            ) })
          ] }, index)) })
        ] }) }) })
      ] }),
      activeTab === 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "Kassensystem" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(POSPage, {}) }) }),
      activeTab === 2 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "Tagesjournal" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(DailyReportPage, {}) }) }),
      activeTab === 3 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "Streckengeschäft" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(StreckengeschaeftPage, {}) }) }),
      activeTab === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "E-Invoicing" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(EInvoicingPage, {}) }) }),
      activeTab === 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 600, children: "Chargenverwaltung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
              onClick: () => setShowChargeForm(true),
              children: "Neue Charge"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "Chargenverwaltung" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeuroFlowChargenverwaltung$2, {}) })
      ] }),
      activeTab === 6 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 600, children: "Lieferantenstammdaten" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
              onClick: () => setShowSupplierForm(true),
              children: "Neuer Lieferant"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 3 }, children: "Verwenden Sie die Autocomplete-Funktionalität für schnelle Eingabe und intelligente Vorschläge." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Lieferanten-Suche" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "Autocomplete" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              NeuroFlowAutocomplete$2,
              {
                label: "Lieferant suchen",
                value: "",
                onChange: (value) => console.log("Selected:", value),
                type: "supplier",
                placeholder: "Lieferantenname oder -nummer eingeben...",
                onLoadOptions: (query) => __async(void 0, null, function* () {
                  const mockSuppliers = [
                    { id: "1", value: "L001", label: "L001 - Agrarhandel GmbH", type: "supplier", metadata: { category: "Landhandel" } },
                    { id: "2", value: "L002", label: "L002 - Futtermittel AG", type: "supplier", metadata: { category: "Futtermittel" } },
                    { id: "3", value: "L003", label: "L003 - Dünger & Co KG", type: "supplier", metadata: { category: "Düngemittel" } }
                  ];
                  return mockSuppliers.filter(
                    (s) => s.label.toLowerCase().includes(query.toLowerCase())
                  );
                })
              }
            ) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Artikel-Suche" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "Autocomplete" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              NeuroFlowAutocomplete$2,
              {
                label: "Artikel suchen",
                value: "",
                onChange: (value) => console.log("Selected:", value),
                type: "article",
                placeholder: "Artikelnummer oder -name eingeben...",
                onLoadOptions: (query) => __async(void 0, null, function* () {
                  const mockArticles = [
                    { id: "1", value: "ART001", label: "ART001 - Sojaschrot Premium", type: "article", metadata: { category: "Futtermittel" } },
                    { id: "2", value: "ART002", label: "ART002 - Weizenkleie", type: "article", metadata: { category: "Futtermittel" } },
                    { id: "3", value: "ART003", label: "ART003 - Maiskleber", type: "article", metadata: { category: "Futtermittel" } }
                  ];
                  return mockArticles.filter(
                    (a2) => a2.label.toLowerCase().includes(query.toLowerCase())
                  );
                })
              }
            ) })
          ] }) }) })
        ] })
      ] }),
      activeTab === 7 && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "n8n Workflow-Engine" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", sx: { mb: 2 }, children: "n8n Workflow-Engine läuft auf Port 5678" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrowIcon, {}),
              href: "http://localhost:5678",
              target: "_blank",
              children: "n8n Dashboard öffnen"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
              children: "Workflows aktualisieren"
            }
          )
        ] })
      ] }) }) }) }),
      activeTab === 8 && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "KI-Analysen Übersicht" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "success.main", children: stats.kiAnalysisCount }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Durchgeführte KI-Analysen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", color: "info.main", children: [
              stats.averageProcessingTime,
              "s"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Durchschnittliche Verarbeitungszeit" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { p: 2, textAlign: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "warning.main", children: "98.5%" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Genauigkeit der KI-Vorhersagen" })
          ] }) })
        ] })
      ] }) }) }) }),
      activeTab === 9 && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Service-Monitoring" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: services.map((service, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: getStatusIcon(service.status) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: service.name,
              secondary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: service.description }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                  "URL: ",
                  service.url,
                  " • Response Time: ",
                  service.responseTime,
                  "ms"
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemSecondaryAction, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              StatusChip,
              {
                label: service.status,
                color: getStatusColor(service.status)
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}) })
          ] }) })
        ] }, index)) })
      ] }) }) }) }),
      showSupplierForm && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { maxWidth: 1200, width: "100%", maxHeight: "90vh", overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "Lieferantenformular" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            NeuroFlowSupplierForm$2,
            {
              onCancel: () => setShowSupplierForm(false),
              onSubmit: (data) => __async(void 0, null, function* () {
                console.log("Supplier saved:", data);
                setShowSupplierForm(false);
              })
            }
          ) }) })
        }
      ),
      showChargeForm && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 1300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 2
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { maxWidth: 1400, width: "100%", maxHeight: "90vh", overflow: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(ComponentLoader, { componentName: "Chargenverwaltung" }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(NeuroFlowChargenverwaltung$2, {}) }) })
        }
      ),
      loading && /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            zIndex: 1400,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 })
        }
      )
    ] })
  ] });
};
const StyledAutocomplete = styled(Autocomplete)(({ theme }) => ({
  "& .MuiAutocomplete-inputRoot": {
    padding: theme.spacing(1.5),
    borderRadius: theme.shape.borderRadius * 1.5,
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      boxShadow: theme.shadows[2]
    },
    "&.Mui-focused": {
      boxShadow: theme.shadows[4]
    }
  },
  "& .MuiAutocomplete-option": {
    padding: theme.spacing(1.5),
    '&[data-focus="true"]': {
      backgroundColor: theme.palette.primary.light,
      color: theme.palette.primary.contrastText
    }
  }
}));
const CustomPopper = styled(Popper)(({ theme }) => ({
  "& .MuiAutocomplete-paper": {
    borderRadius: theme.shape.borderRadius * 1.5,
    boxShadow: theme.shadows[8],
    border: `1px solid ${theme.palette.divider}`,
    maxHeight: 400
  }
}));
const getIconForType = (type) => {
  switch (type) {
    case "customer":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, { color: "primary" });
    case "supplier":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { color: "secondary" });
    case "article":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionIcon, { color: "info" });
    case "personnel":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, { color: "success" });
    case "charge":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(ScienceIcon, { color: "warning" });
    case "location":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(LocationIcon, { color: "error" });
    case "bank":
      return /* @__PURE__ */ jsxRuntimeExports.jsx(BankIcon, { color: "primary" });
    default:
      return /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { color: "action" });
  }
};
const getApiEndpoint = (type) => {
  switch (type) {
    case "customer":
      return "/api/customers/search";
    case "supplier":
      return "/api/suppliers/search";
    case "article":
      return "/api/articles/search";
    case "personnel":
      return "/api/personnel/search";
    case "charge":
      return "/api/charges/search";
    case "location":
      return "/api/locations/search";
    case "bank":
      return "/api/banks/search";
    default:
      return "/api/search";
  }
};
const fuzzySearch = (query, text) => {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  if (textLower.includes(queryLower)) {
    return 1;
  }
  let score = 0;
  let queryIndex = 0;
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += 1;
      queryIndex++;
    }
  }
  return score / queryLower.length;
};
const NeuroFlowAutocomplete = ({
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  type,
  required = false,
  disabled = false,
  error = false,
  helperText,
  fullWidth = true,
  size = "medium",
  variant = "outlined",
  showChips = false,
  multiple = false,
  maxSuggestions = 10,
  minChars = 2,
  debounceMs = 300,
  apiEndpoint,
  customOptions = [],
  onLoadOptions,
  renderOption,
  getOptionLabel,
  filterOptions
}) => {
  const [options, setOptions] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [inputValue, setInputValue] = reactExports.useState(value);
  const [open, setOpen] = reactExports.useState(false);
  const abortControllerRef = reactExports.useRef(null);
  const debouncedSearch = reactExports.useCallback(
    debounce((query) => __async(void 0, null, function* () {
      if (query.length < minChars) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        let searchResults = [];
        if (onLoadOptions) {
          searchResults = yield onLoadOptions(query);
        } else {
          const endpoint = apiEndpoint || getApiEndpoint(type);
          const response = yield fetch(`${endpoint}?q=${encodeURIComponent(query)}&limit=${maxSuggestions}`, {
            signal: abortControllerRef.current.signal
          });
          if (response.ok) {
            const data = yield response.json();
            searchResults = data.results || data || [];
          }
        }
        const allOptions = [...customOptions, ...searchResults];
        const scoredOptions = allOptions.map((option) => __spreadProps(__spreadValues({}, option), {
          score: fuzzySearch(query, option.label),
          isExact: option.label.toLowerCase().includes(query.toLowerCase()),
          isFuzzy: !option.label.toLowerCase().includes(query.toLowerCase()) && fuzzySearch(query, option.label) > 0.5
        }));
        const sortedOptions = scoredOptions.filter((option) => option.score > 0.3).sort((a2, b) => {
          if (a2.isExact && !b.isExact) return -1;
          if (!a2.isExact && b.isExact) return 1;
          return (b.score || 0) - (a2.score || 0);
        }).slice(0, maxSuggestions);
        setOptions(sortedOptions);
      } catch (error2) {
        if (error2.name !== "AbortError") {
          console.error("Autocomplete search error:", error2);
          setOptions([]);
        }
      } finally {
        setLoading(false);
      }
    }), debounceMs),
    [type, apiEndpoint, onLoadOptions, customOptions, maxSuggestions, minChars]
  );
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    onChange(newInputValue);
    if (newInputValue.length >= minChars) {
      debouncedSearch(newInputValue);
    } else {
      setOptions([]);
    }
  };
  const handleOptionSelect = (event, option) => {
    if (option) {
      onChange(option.value, option);
      onSelect == null ? void 0 : onSelect(option);
    }
  };
  const defaultRenderOption = (option) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { dense: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: option.icon || getIconForType(option.type) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ListItemText,
      {
        primary: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", fontWeight: option.isExact ? 600 : 400, children: option.label }),
          option.isExact && /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success", sx: { fontSize: 16 } }),
          option.isFuzzy && /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning", sx: { fontSize: 16 } })
        ] }),
        secondary: option.metadata && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "text.secondary", children: option.metadata.description || option.metadata.category || option.category })
      }
    )
  ] });
  const defaultGetOptionLabel = (option) => option.label;
  const defaultFilterOptions = (options2, inputValue2) => {
    return options2.filter(
      (option) => option.label.toLowerCase().includes(inputValue2.toLowerCase()) || option.value.toLowerCase().includes(inputValue2.toLowerCase())
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    StyledAutocomplete,
    {
      open,
      onOpen: () => setOpen(true),
      onClose: () => setOpen(false),
      options,
      loading,
      value,
      onChange: handleOptionSelect,
      inputValue,
      onInputChange: handleInputChange,
      getOptionLabel: getOptionLabel || defaultGetOptionLabel,
      filterOptions: filterOptions || defaultFilterOptions,
      renderOption: renderOption || defaultRenderOption,
      renderInput: (params) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        __spreadProps(__spreadValues({}, params), {
          label,
          placeholder,
          required,
          error,
          helperText,
          fullWidth,
          size,
          variant,
          disabled,
          InputProps: __spreadProps(__spreadValues({}, params.InputProps), {
            endAdornment: /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
              loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { color: "inherit", size: 20 }) : null,
              params.InputProps.endAdornment
            ] })
          })
        })
      ),
      renderTags: (tagValue, getTagProps) => showChips && multiple ? tagValue.map((option, index) => /* @__PURE__ */ reactExports.createElement(
        Chip,
        __spreadProps(__spreadValues({}, getTagProps({ index })), {
          key: option.id,
          label: option.label,
          icon: option.icon || getIconForType(option.type),
          size: "small",
          color: "primary",
          variant: "outlined"
        })
      )) : null,
      PopperComponent: CustomPopper,
      multiple,
      freeSolo: true,
      autoHighlight: true,
      autoComplete: true,
      includeInputInList: true,
      filterSelectedOptions: true,
      clearOnBlur: false,
      selectOnFocus: true,
      handleHomeEndKeys: true,
      blurOnSelect: true
    }
  );
};
const CustomerAutocomplete = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  NeuroFlowAutocomplete,
  __spreadProps(__spreadValues({}, props), {
    type: "customer",
    placeholder: "Kundenname, -nummer oder E-Mail eingeben...",
    showChips: true
  })
);
const SupplierAutocomplete = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  NeuroFlowAutocomplete,
  __spreadProps(__spreadValues({}, props), {
    type: "supplier",
    placeholder: "Lieferantenname, -nummer oder Branche eingeben...",
    showChips: true
  })
);
const ArticleAutocomplete = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  NeuroFlowAutocomplete,
  __spreadProps(__spreadValues({}, props), {
    type: "article",
    placeholder: "Artikelnummer, -name oder Kategorie eingeben...",
    showChips: true
  })
);
const PersonnelAutocomplete = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  NeuroFlowAutocomplete,
  __spreadProps(__spreadValues({}, props), {
    type: "personnel",
    placeholder: "Mitarbeitername, -nummer oder Abteilung eingeben...",
    showChips: true
  })
);
const ChargeAutocomplete = (props) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  NeuroFlowAutocomplete,
  __spreadProps(__spreadValues({}, props), {
    type: "charge",
    placeholder: "Chargennummer, Artikel oder Lieferant eingeben...",
    showChips: true
  })
);
const NeuroFlowAutocomplete$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ArticleAutocomplete,
  ChargeAutocomplete,
  CustomerAutocomplete,
  NeuroFlowAutocomplete,
  PersonnelAutocomplete,
  SupplierAutocomplete,
  default: NeuroFlowAutocomplete
}, Symbol.toStringTag, { value: "Module" }));
const NeuroFlowCard$1 = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4]
  }
}));
const NeuroFlowButton$1 = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: "none",
  fontWeight: 600,
  padding: "0.75rem 1.5rem",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[3]
  }
}));
const SupplierSchema = object({
  // Grunddaten
  supplier_number: string().min(1, "Lieferantennummer ist erforderlich"),
  company_name: string().min(2, "Firmenname muss mindestens 2 Zeichen lang sein"),
  legal_form: _enum(["GmbH", "AG", "KG", "OHG", "Einzelunternehmen", "Gbr", "e.V.", "Sonstige"]),
  tax_number: string().optional(),
  vat_number: string().optional(),
  commercial_register: string().optional(),
  // Kontaktdaten
  contact_person: string().min(1, "Ansprechpartner ist erforderlich"),
  email: string().email("Ungültige E-Mail-Adresse"),
  phone: string().min(1, "Telefonnummer ist erforderlich"),
  fax: string().optional(),
  website: string().url("Ungültige Website-URL").optional().or(literal("")),
  // Adressdaten
  street: string().min(1, "Straße ist erforderlich"),
  house_number: string().min(1, "Hausnummer ist erforderlich"),
  postal_code: string().min(5, "PLZ muss mindestens 5 Zeichen lang sein"),
  city: string().min(1, "Stadt ist erforderlich"),
  country: string().min(1, "Land ist erforderlich"),
  // Bankdaten
  bank_name: string().optional(),
  iban: string().optional(),
  bic: string().optional(),
  account_holder: string().optional(),
  // Geschäftsdaten
  industry: _enum(["Elektronik", "Bürobedarf", "Werkzeuge", "Verbrauchsmaterial", "Dienstleistungen", "Software", "Hardware", "Sonstige"]),
  supplier_type: _enum(["Hauptlieferant", "Nebenlieferant", "Notfalllieferant", "Exklusivlieferant"]),
  payment_terms: number().min(0, "Zahlungsziel darf nicht negativ sein"),
  credit_limit: number().min(0, "Kreditlimit darf nicht negativ sein"),
  discount_percentage: number().min(0, "Rabatt darf nicht negativ sein").max(100, "Rabatt darf nicht über 100% sein"),
  // Bewertung
  rating: number().min(1, "Bewertung muss mindestens 1 sein").max(5, "Bewertung darf maximal 5 sein"),
  reliability_score: number().min(0, "Zuverlässigkeits-Score darf nicht negativ sein").max(100, "Zuverlässigkeits-Score darf nicht über 100 sein"),
  quality_score: number().min(0, "Qualitäts-Score darf nicht negativ sein").max(100, "Qualitäts-Score darf nicht über 100 sein"),
  delivery_score: number().min(0, "Liefer-Score darf nicht negativ sein").max(100, "Liefer-Score darf nicht über 100 sein"),
  // Status
  status: _enum(["active", "inactive", "blocked", "prospect"]),
  is_preferred: boolean(),
  is_certified: boolean(),
  is_local: boolean(),
  // ERP-spezifische Felder
  sales_rep: string().optional(),
  cost_center: string().optional(),
  notes: string().optional(),
  // Lieferdaten
  average_delivery_time: number().min(0, "Durchschnittliche Lieferzeit darf nicht negativ sein"),
  minimum_order_value: number().min(0, "Mindestbestellwert darf nicht negativ sein"),
  free_shipping_threshold: number().min(0, "Kostenlose Lieferung ab darf nicht negativ sein"),
  // Zertifizierungen
  iso_9001: boolean(),
  iso_14001: boolean(),
  other_certifications: string().optional()
});
const mockLegalForms = [
  { value: "GmbH", label: "GmbH" },
  { value: "AG", label: "Aktiengesellschaft (AG)" },
  { value: "KG", label: "Kommanditgesellschaft (KG)" },
  { value: "OHG", label: "Offene Handelsgesellschaft (OHG)" },
  { value: "Einzelunternehmen", label: "Einzelunternehmen" },
  { value: "Gbr", label: "Gesellschaft bürgerlichen Rechts (GbR)" },
  { value: "e.V.", label: "Eingetragener Verein (e.V.)" },
  { value: "Sonstige", label: "Sonstige" }
];
const mockIndustries = [
  { value: "Elektronik", label: "Elektronik" },
  { value: "Bürobedarf", label: "Bürobedarf" },
  { value: "Werkzeuge", label: "Werkzeuge" },
  { value: "Verbrauchsmaterial", label: "Verbrauchsmaterial" },
  { value: "Dienstleistungen", label: "Dienstleistungen" },
  { value: "Software", label: "Software" },
  { value: "Hardware", label: "Hardware" },
  { value: "Sonstige", label: "Sonstige" }
];
const mockSupplierTypes = [
  { value: "Hauptlieferant", label: "Hauptlieferant", color: "success" },
  { value: "Nebenlieferant", label: "Nebenlieferant", color: "primary" },
  { value: "Notfalllieferant", label: "Notfalllieferant", color: "warning" },
  { value: "Exklusivlieferant", label: "Exklusivlieferant", color: "secondary" }
];
const NeuroFlowSupplierForm = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create"
}) => {
  const [activeTab, setActiveTab] = reactExports.useState(0);
  const [submitLoading, setSubmitLoading] = reactExports.useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: a(SupplierSchema),
    defaultValues: __spreadValues({
      supplier_number: "",
      company_name: "",
      legal_form: "GmbH",
      tax_number: "",
      vat_number: "",
      commercial_register: "",
      contact_person: "",
      email: "",
      phone: "",
      fax: "",
      website: "",
      street: "",
      house_number: "",
      postal_code: "",
      city: "",
      country: "Deutschland",
      bank_name: "",
      iban: "",
      bic: "",
      account_holder: "",
      industry: "Elektronik",
      supplier_type: "Nebenlieferant",
      payment_terms: 30,
      credit_limit: 0,
      discount_percentage: 0,
      rating: 3,
      reliability_score: 75,
      quality_score: 75,
      delivery_score: 75,
      status: "active",
      is_preferred: false,
      is_certified: false,
      is_local: false,
      sales_rep: "",
      cost_center: "",
      notes: "",
      average_delivery_time: 7,
      minimum_order_value: 0,
      free_shipping_threshold: 0,
      iso_9001: false,
      iso_14001: false,
      other_certifications: ""
    }, initialData)
  });
  const handleFormSubmit = (data) => __async(void 0, null, function* () {
    setSubmitLoading(true);
    try {
      if (onSubmit) {
        yield onSubmit(data);
      }
      console.log("Supplier saved:", data);
    } catch (error) {
      console.error("Error saving supplier:", error);
    } finally {
      setSubmitLoading(false);
    }
  });
  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("Änderungen verwerfen?")) {
        reset();
        onCancel == null ? void 0 : onCancel();
      }
    } else {
      onCancel == null ? void 0 : onCancel();
    }
  };
  const generateSupplierNumber = () => {
    const date = /* @__PURE__ */ new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
    const supplierNumber = `L${year}${month}-${random}`;
    setValue("supplier_number", supplierNumber);
  };
  const tabs = [
    { label: "Grunddaten", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, {}) },
    { label: "Kontaktdaten", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactIcon, {}) },
    { label: "Adressdaten", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(LocationIcon, {}) },
    { label: "Bankdaten", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(BankIcon, {}) },
    { label: "Geschäftsdaten", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentIcon, {}) },
    { label: "Bewertung", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentIcon, {}) },
    { label: "Lieferdaten", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShippingIcon, {}) },
    { label: "Zertifizierungen", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsIcon, {}) }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NeuroFlowCard$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { color: "primary", sx: { fontSize: 32 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 600, color: "text.primary", children: mode === "create" ? "Neuer Lieferant" : "Lieferant bearbeiten" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Erstellen Sie einen neuen Lieferantenstammsatz mit allen erforderlichen Informationen" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Stack, { direction: "row", spacing: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Lieferantennummer generieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: generateSupplierNumber, color: "primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}) }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(handleFormSubmit), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { borderBottom: 1, borderColor: "divider", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: activeTab, onChange: (e, newValue) => setActiveTab(newValue), children: tabs.map((tab, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tab,
        {
          label: tab.label,
          icon: tab.icon,
          iconPosition: "start",
          sx: { minHeight: 64 }
        },
        index
      )) }) }),
      activeTab === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "supplier_number",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Lieferantennummer *",
                  fullWidth: true,
                  error: !!errors.supplier_number,
                  helperText: (_a = errors.supplier_number) == null ? void 0 : _a.message,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(BusinessIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "company_name",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                NeuroFlowAutocomplete,
                {
                  label: "Firmenname *",
                  value: field.value,
                  onChange: (value) => field.onChange(value),
                  type: "supplier",
                  placeholder: "Firmenname eingeben...",
                  error: !!errors.company_name,
                  helperText: (_a = errors.company_name) == null ? void 0 : _a.message,
                  onLoadOptions: (query) => __async(void 0, null, function* () {
                    const mockSuppliers = [
                      { id: "1", value: "Agrarhandel GmbH", label: "Agrarhandel GmbH", type: "supplier", metadata: { category: "Landhandel" } },
                      { id: "2", value: "Futtermittel AG", label: "Futtermittel AG", type: "supplier", metadata: { category: "Futtermittel" } },
                      { id: "3", value: "Dünger & Co KG", label: "Dünger & Co KG", type: "supplier", metadata: { category: "Düngemittel" } }
                    ];
                    return mockSuppliers.filter(
                      (s) => s.label.toLowerCase().includes(query.toLowerCase())
                    );
                  })
                }
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "legal_form",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.legal_form, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Rechtsform *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Select, __spreadProps(__spreadValues({}, field), { label: "Rechtsform *", children: mockLegalForms.map((form) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: form.value, children: form.label }, form.value)) })),
              errors.legal_form && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.legal_form.message })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "industry",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                NeuroFlowAutocomplete,
                {
                  label: "Branche *",
                  value: field.value,
                  onChange: (value) => field.onChange(value),
                  type: "supplier",
                  placeholder: "Branche auswählen...",
                  error: !!errors.industry,
                  helperText: (_a = errors.industry) == null ? void 0 : _a.message,
                  customOptions: mockIndustries.map((industry) => ({
                    id: industry.value,
                    value: industry.value,
                    label: industry.label,
                    type: "supplier",
                    metadata: { category: "Branche" }
                  }))
                }
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "tax_number",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Steuernummer",
                  fullWidth: true,
                  error: !!errors.tax_number,
                  helperText: (_a = errors.tax_number) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "vat_number",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "USt-ID",
                  fullWidth: true,
                  error: !!errors.vat_number,
                  helperText: (_a = errors.vat_number) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "commercial_register",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Handelsregister",
                  fullWidth: true,
                  error: !!errors.commercial_register,
                  helperText: (_a = errors.commercial_register) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) })
      ] }),
      activeTab === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "contact_person",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Ansprechpartner *",
                  fullWidth: true,
                  error: !!errors.contact_person,
                  helperText: (_a = errors.contact_person) == null ? void 0 : _a.message,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "email",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "E-Mail *",
                  type: "email",
                  fullWidth: true,
                  error: !!errors.email,
                  helperText: (_a = errors.email) == null ? void 0 : _a.message,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "phone",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Telefon *",
                  fullWidth: true,
                  error: !!errors.phone,
                  helperText: (_a = errors.phone) == null ? void 0 : _a.message,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(ContactIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "fax",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Fax",
                  fullWidth: true,
                  error: !!errors.fax,
                  helperText: (_a = errors.fax) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "website",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Website",
                  fullWidth: true,
                  error: !!errors.website,
                  helperText: (_a = errors.website) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) })
      ] }),
      activeTab === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "street",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Straße *",
                  fullWidth: true,
                  error: !!errors.street,
                  helperText: (_a = errors.street) == null ? void 0 : _a.message,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(LocationIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "house_number",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Hausnummer *",
                  fullWidth: true,
                  error: !!errors.house_number,
                  helperText: (_a = errors.house_number) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "postal_code",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "PLZ *",
                  fullWidth: true,
                  error: !!errors.postal_code,
                  helperText: (_a = errors.postal_code) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "city",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Stadt *",
                  fullWidth: true,
                  error: !!errors.city,
                  helperText: (_a = errors.city) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "country",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Land *",
                  fullWidth: true,
                  error: !!errors.country,
                  helperText: (_a = errors.country) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) })
      ] }),
      activeTab === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "bank_name",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Bankname",
                  fullWidth: true,
                  error: !!errors.bank_name,
                  helperText: (_a = errors.bank_name) == null ? void 0 : _a.message,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(BankIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "account_holder",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Kontoinhaber",
                  fullWidth: true,
                  error: !!errors.account_holder,
                  helperText: (_a = errors.account_holder) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "iban",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "IBAN",
                  fullWidth: true,
                  error: !!errors.iban,
                  helperText: (_a = errors.iban) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "bic",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "BIC",
                  fullWidth: true,
                  error: !!errors.bic,
                  helperText: (_a = errors.bic) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) })
      ] }),
      activeTab === 4 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "supplier_type",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.supplier_type, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Lieferantentyp *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Select, __spreadProps(__spreadValues({}, field), { label: "Lieferantentyp *", children: mockSupplierTypes.map((type) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: type.value, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: type.label,
                    size: "small",
                    color: type.color,
                    sx: { mr: 1 }
                  }
                ),
                type.label
              ] }, type.value)) })),
              errors.supplier_type && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.supplier_type.message })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "payment_terms",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Zahlungsziel (Tage) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.payment_terms,
                  helperText: (_a = errors.payment_terms) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseInt(e.target.value) || 0),
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "credit_limit",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Kreditlimit (€) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.credit_limit,
                  helperText: (_a = errors.credit_limit) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0),
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "discount_percentage",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Rabatt (%) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.discount_percentage,
                  helperText: (_a = errors.discount_percentage) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0),
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "status",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.status, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Status *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, __spreadProps(__spreadValues({}, field), { label: "Status *", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "active", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Aktiv", color: "success", size: "small", sx: { mr: 1 } }),
                  "Aktiv"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "inactive", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Inaktiv", color: "default", size: "small", sx: { mr: 1 } }),
                  "Inaktiv"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "blocked", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Gesperrt", color: "error", size: "small", sx: { mr: 1 } }),
                  "Gesperrt"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "prospect", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Interessent", color: "warning", size: "small", sx: { mr: 1 } }),
                  "Interessent"
                ] })
              ] })),
              errors.status && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.status.message })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "sales_rep",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Vertriebsmitarbeiter",
                  fullWidth: true,
                  error: !!errors.sales_rep,
                  helperText: (_a = errors.sales_rep) == null ? void 0 : _a.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Lieferanten-Eigenschaften" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "is_preferred",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: field.value,
                        onChange: field.onChange,
                        color: "success"
                      }
                    ),
                    label: "Bevorzugter Lieferant"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "is_certified",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: field.value,
                        onChange: field.onChange,
                        color: "primary"
                      }
                    ),
                    label: "Zertifiziert"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "is_local",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: field.value,
                        onChange: field.onChange,
                        color: "info"
                      }
                    ),
                    label: "Lokaler Lieferant"
                  }
                )
              }
            )
          ] })
        ] })
      ] }),
      activeTab === 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "rating",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.rating, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Bewertung (1-5) *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, __spreadProps(__spreadValues({}, field), { label: "Bewertung (1-5) *", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: 1, children: "1 - Sehr schlecht" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: 2, children: "2 - Schlecht" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: 3, children: "3 - Durchschnittlich" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: 4, children: "4 - Gut" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: 5, children: "5 - Sehr gut" })
              ] })),
              errors.rating && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.rating.message })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "reliability_score",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Zuverlässigkeits-Score (0-100) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.reliability_score,
                  helperText: (_a = errors.reliability_score) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseInt(e.target.value) || 0)
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "quality_score",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Qualitäts-Score (0-100) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.quality_score,
                  helperText: (_a = errors.quality_score) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseInt(e.target.value) || 0)
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "delivery_score",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Liefer-Score (0-100) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.delivery_score,
                  helperText: (_a = errors.delivery_score) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseInt(e.target.value) || 0)
                })
              );
            }
          }
        ) })
      ] }),
      activeTab === 6 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "average_delivery_time",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Durchschnittliche Lieferzeit (Tage) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.average_delivery_time,
                  helperText: (_a = errors.average_delivery_time) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseInt(e.target.value) || 0),
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(ShippingIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "minimum_order_value",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Mindestbestellwert (€) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.minimum_order_value,
                  helperText: (_a = errors.minimum_order_value) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0),
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "free_shipping_threshold",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Kostenlose Lieferung ab (€) *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.free_shipping_threshold,
                  helperText: (_a = errors.free_shipping_threshold) == null ? void 0 : _a.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0),
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(ShippingIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) })
      ] }),
      activeTab === 7 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Zertifizierungen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 3, mb: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "iso_9001",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: field.value,
                        onChange: field.onChange,
                        color: "primary"
                      }
                    ),
                    label: "ISO 9001 (Qualitätsmanagement)"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "iso_14001",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: field.value,
                        onChange: field.onChange,
                        color: "success"
                      }
                    ),
                    label: "ISO 14001 (Umweltmanagement)"
                  }
                )
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "other_certifications",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Weitere Zertifizierungen",
                  multiline: true,
                  rows: 4,
                  fullWidth: true,
                  error: !!errors.other_certifications,
                  helperText: (_a = errors.other_certifications) == null ? void 0 : _a.message,
                  placeholder: "Zusätzliche Zertifizierungen, Qualitätsstandards, etc."
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "notes",
            control,
            render: ({ field }) => {
              var _a;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Notizen",
                  multiline: true,
                  rows: 4,
                  fullWidth: true,
                  error: !!errors.notes,
                  helperText: (_a = errors.notes) == null ? void 0 : _a.message,
                  placeholder: "Zusätzliche Informationen, Besonderheiten, etc."
                })
              );
            }
          }
        ) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "flex-end", gap: 2, mt: 4, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NeuroFlowButton$1,
          {
            variant: "outlined",
            onClick: handleCancel,
            disabled: submitLoading,
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, {}),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NeuroFlowButton$1,
          {
            type: "submit",
            variant: "contained",
            disabled: submitLoading || loading,
            startIcon: submitLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SaveIcon, {}),
            children: submitLoading ? "Speichern..." : "Lieferant speichern"
          }
        )
      ] })
    ] })
  ] }) });
};
const NeuroFlowSupplierForm$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NeuroFlowSupplierForm,
  default: NeuroFlowSupplierForm
}, Symbol.toStringTag, { value: "Module" }));
const NeuroFlowCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[1],
  border: `1px solid ${theme.palette.divider}`,
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: theme.shadows[4]
  }
}));
const NeuroFlowButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: "none",
  fontWeight: 600,
  padding: "0.75rem 1.5rem",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: theme.shadows[3]
  }
}));
const ChargeSchema = object({
  // Grunddaten
  charge_number: string().min(1, "Chargennummer ist erforderlich"),
  article_number: string().min(1, "Artikelnummer ist erforderlich"),
  article_name: string().min(2, "Artikelname muss mindestens 2 Zeichen lang sein"),
  supplier_number: string().min(1, "Lieferantennummer ist erforderlich"),
  supplier_name: string().min(2, "Lieferantenname muss mindestens 2 Zeichen lang sein"),
  // Chargendaten
  production_date: string().min(1, "Produktionsdatum ist erforderlich"),
  expiry_date: string().min(1, "Verfallsdatum ist erforderlich"),
  batch_size: number().min(0, "Chargengröße darf nicht negativ sein"),
  unit: _enum(["kg", "t", "l", "stk", "m³"]),
  // Qualitätsdaten
  quality_status: _enum(["pending", "approved", "rejected", "quarantine"]),
  qs_milk_relevant: boolean(),
  vlog_gmo_status: _enum(["VLOG", "GMO", "unknown"]),
  eudr_compliant: boolean(),
  sustainability_rapeseed: boolean(),
  // Analysedaten
  protein_content: number().min(0).max(100).optional(),
  fat_content: number().min(0).max(100).optional(),
  moisture_content: number().min(0).max(100).optional(),
  ash_content: number().min(0).max(100).optional(),
  // Preisdaten
  purchase_price: number().min(0, "Einkaufspreis darf nicht negativ sein"),
  currency: _enum(["EUR", "USD", "CHF"]),
  // Lagerdaten
  warehouse_location: string().min(1, "Lagerort ist erforderlich"),
  storage_conditions: _enum(["ambient", "cooled", "frozen", "controlled"]),
  // Zertifikate
  certificates: array(object({
    id: string(),
    type: string(),
    filename: string(),
    upload_date: string(),
    valid_until: string().optional()
  })).optional(),
  // KI-Extensionen
  ki_analysis: object({
    risk_score: number().min(0).max(100),
    quality_prediction: _enum(["excellent", "good", "average", "poor"]),
    shelf_life_prediction: number().min(0),
    price_optimization_suggestion: number().optional(),
    anomaly_detection: boolean(),
    trend_analysis: string().optional()
  }).optional(),
  // Workflow-Status
  workflow_status: _enum(["draft", "in_review", "approved", "rejected", "archived"]),
  workflow_steps: array(object({
    step: string(),
    status: _enum(["pending", "completed", "failed"]),
    completed_by: string().optional(),
    completed_at: string().optional(),
    notes: string().optional()
  })).optional(),
  // Audit Trail
  created_by: string(),
  created_at: string(),
  updated_by: string().optional(),
  updated_at: string().optional(),
  // Notizen
  notes: string().optional()
});
const mockUnits = [
  { value: "kg", label: "Kilogramm (kg)" },
  { value: "t", label: "Tonne (t)" },
  { value: "l", label: "Liter (l)" },
  { value: "stk", label: "Stück (stk)" },
  { value: "m³", label: "Kubikmeter (m³)" }
];
const mockQualityStatuses = [
  { value: "pending", label: "Ausstehend", color: "warning" },
  { value: "approved", label: "Genehmigt", color: "success" },
  { value: "rejected", label: "Abgelehnt", color: "error" },
  { value: "quarantine", label: "Quarantäne", color: "error" }
];
const mockVlogGmoStatuses = [
  { value: "VLOG", label: "VLOG-konform", color: "success" },
  { value: "GMO", label: "GVO-haltig", color: "error" },
  { value: "unknown", label: "Unbekannt", color: "warning" }
];
const mockStorageConditions = [
  { value: "ambient", label: "Umgebungstemperatur" },
  { value: "cooled", label: "Gekühlt" },
  { value: "frozen", label: "Gefroren" },
  { value: "controlled", label: "Klimakontrolliert" }
];
const NeuroFlowChargenverwaltung = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  mode = "create"
}) => {
  var _a, _b;
  const [activeTab, setActiveTab] = reactExports.useState(0);
  const [submitLoading, setSubmitLoading] = reactExports.useState(false);
  const [n8nWorkflows, setN8nWorkflows] = reactExports.useState([]);
  const [workflowDialogOpen, setWorkflowDialogOpen] = reactExports.useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = reactExports.useState(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
    setValue
  } = useForm({
    resolver: a(ChargeSchema),
    defaultValues: __spreadValues({
      charge_number: "",
      article_number: "",
      article_name: "",
      supplier_number: "",
      supplier_name: "",
      production_date: "",
      expiry_date: "",
      batch_size: 0,
      unit: "kg",
      quality_status: "pending",
      qs_milk_relevant: false,
      vlog_gmo_status: "unknown",
      eudr_compliant: false,
      sustainability_rapeseed: false,
      protein_content: 0,
      fat_content: 0,
      moisture_content: 0,
      ash_content: 0,
      purchase_price: 0,
      currency: "EUR",
      warehouse_location: "",
      storage_conditions: "ambient",
      certificates: [],
      ki_analysis: {
        risk_score: 50,
        quality_prediction: "average",
        shelf_life_prediction: 365,
        anomaly_detection: false
      },
      workflow_status: "draft",
      workflow_steps: [],
      created_by: "System",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      notes: ""
    }, initialData)
  });
  reactExports.useEffect(() => {
    fetchN8nWorkflows();
  }, []);
  const fetchN8nWorkflows = () => __async(void 0, null, function* () {
    try {
      const response = yield fetch("http://localhost:5678/api/v1/workflows");
      if (response.ok) {
        const workflows = yield response.json();
        setN8nWorkflows(workflows.data || []);
      }
    } catch (error) {
      console.error("Fehler beim Laden der n8n Workflows:", error);
    }
  });
  const triggerWorkflow = (workflowId, data) => __async(void 0, null, function* () {
    try {
      const response = yield fetch(`http://localhost:5678/api/v1/workflows/${workflowId}/trigger`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        console.log("Workflow erfolgreich ausgelöst:", workflowId);
        return true;
      }
    } catch (error) {
      console.error("Fehler beim Auslösen des Workflows:", error);
    }
    return false;
  });
  const handleFormSubmit = (data) => __async(void 0, null, function* () {
    setSubmitLoading(true);
    try {
      const kiAnalysis = yield performKIAnalysis(data);
      data.ki_analysis = __spreadValues(__spreadValues({}, data.ki_analysis), kiAnalysis);
      yield triggerWorkflow("charge-processing", data);
      if (onSubmit) {
        yield onSubmit(data);
      }
      console.log("Charge saved:", data);
    } catch (error) {
      console.error("Error saving charge:", error);
    } finally {
      setSubmitLoading(false);
    }
  });
  const performKIAnalysis = (data) => __async(void 0, null, function* () {
    const riskScore = Math.random() * 100;
    const qualityPrediction = riskScore < 30 ? "excellent" : riskScore < 60 ? "good" : riskScore < 80 ? "average" : "poor";
    return {
      risk_score: Math.round(riskScore),
      quality_prediction: qualityPrediction,
      shelf_life_prediction: Math.floor(Math.random() * 730) + 30,
      price_optimization_suggestion: data.purchase_price * (0.9 + Math.random() * 0.2),
      anomaly_detection: Math.random() > 0.8,
      trend_analysis: "Stabile Qualität, leichte Preiserhöhung erwartet"
    };
  });
  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("Änderungen verwerfen?")) {
        reset();
        onCancel == null ? void 0 : onCancel();
      }
    } else {
      onCancel == null ? void 0 : onCancel();
    }
  };
  const generateChargeNumber = () => {
    const date = /* @__PURE__ */ new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const random = Math.floor(Math.random() * 1e3).toString().padStart(3, "0");
    const chargeNumber = `CH${year}${month}${day}-${random}`;
    setValue("charge_number", chargeNumber);
  };
  const tabs = [
    { label: "Grunddaten", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(DescriptionIcon, {}) },
    { label: "Qualität", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ScienceIcon, {}) },
    { label: "Analysen", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentIcon, {}) },
    { label: "Lagerung", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(ShippingIcon, {}) },
    { label: "Zertifikate", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(SecurityIcon, {}) },
    { label: "KI-Analyse", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(AutoGraphIcon, {}) },
    { label: "Workflow", icon: /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineIcon, {}) }
  ];
  return /* @__PURE__ */ jsxRuntimeExports.jsx(NeuroFlowCard, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 2, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ScienceIcon, { color: "primary", sx: { fontSize: 32 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", fontWeight: 600, color: "text.primary", children: mode === "create" ? "Neue Charge" : mode === "edit" ? "Charge bearbeiten" : "Charge anzeigen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", children: "Chargenverwaltung mit KI-Analyse und n8n Workflow-Integration" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 1, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Chargennummer generieren", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: generateChargeNumber, color: "primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "n8n Workflows", children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: () => setWorkflowDialogOpen(true), color: "secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineIcon, {}) }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(handleFormSubmit), children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { borderBottom: 1, borderColor: "divider", mb: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Tabs, { value: activeTab, onChange: (e, newValue) => setActiveTab(newValue), children: tabs.map((tab, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Tab,
        {
          label: tab.label,
          icon: tab.icon,
          iconPosition: "start",
          sx: { minHeight: 64 }
        },
        index
      )) }) }),
      activeTab === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "charge_number",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Chargennummer *",
                  fullWidth: true,
                  error: !!errors.charge_number,
                  helperText: (_a2 = errors.charge_number) == null ? void 0 : _a2.message,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(QrCodeIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "article_number",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                ArticleAutocomplete,
                {
                  label: "Artikelnummer *",
                  value: field.value,
                  onChange: (value) => field.onChange(value),
                  error: !!errors.article_number,
                  helperText: (_a2 = errors.article_number) == null ? void 0 : _a2.message,
                  onLoadOptions: (query) => __async(void 0, null, function* () {
                    const mockArticles = [
                      { id: "1", value: "ART001", label: "ART001 - Sojaschrot Premium", type: "article", metadata: { category: "Futtermittel" } },
                      { id: "2", value: "ART002", label: "ART002 - Weizenkleie", type: "article", metadata: { category: "Futtermittel" } },
                      { id: "3", value: "ART003", label: "ART003 - Maiskleber", type: "article", metadata: { category: "Futtermittel" } }
                    ];
                    return mockArticles.filter(
                      (a2) => a2.label.toLowerCase().includes(query.toLowerCase()) || a2.value.toLowerCase().includes(query.toLowerCase())
                    );
                  })
                }
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "article_name",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                ArticleAutocomplete,
                {
                  label: "Artikelname *",
                  value: field.value,
                  onChange: (value) => field.onChange(value),
                  error: !!errors.article_name,
                  helperText: (_a2 = errors.article_name) == null ? void 0 : _a2.message,
                  onLoadOptions: (query) => __async(void 0, null, function* () {
                    const mockArticleNames = [
                      { id: "1", value: "Sojaschrot Premium", label: "Sojaschrot Premium", type: "article", metadata: { category: "Futtermittel", protein: "45%" } },
                      { id: "2", value: "Weizenkleie", label: "Weizenkleie", type: "article", metadata: { category: "Futtermittel", protein: "15%" } },
                      { id: "3", value: "Maiskleber", label: "Maiskleber", type: "article", metadata: { category: "Futtermittel", protein: "60%" } }
                    ];
                    return mockArticleNames.filter(
                      (a2) => a2.label.toLowerCase().includes(query.toLowerCase())
                    );
                  })
                }
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "supplier_number",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                SupplierAutocomplete,
                {
                  label: "Lieferantennummer *",
                  value: field.value,
                  onChange: (value) => field.onChange(value),
                  error: !!errors.supplier_number,
                  helperText: (_a2 = errors.supplier_number) == null ? void 0 : _a2.message,
                  onLoadOptions: (query) => __async(void 0, null, function* () {
                    const mockSuppliers = [
                      { id: "1", value: "L001", label: "L001 - Agrarhandel GmbH", type: "supplier", metadata: { category: "Landhandel" } },
                      { id: "2", value: "L002", label: "L002 - Futtermittel AG", type: "supplier", metadata: { category: "Futtermittel" } },
                      { id: "3", value: "L003", label: "L003 - Dünger & Co KG", type: "supplier", metadata: { category: "Düngemittel" } }
                    ];
                    return mockSuppliers.filter(
                      (s) => s.label.toLowerCase().includes(query.toLowerCase()) || s.value.toLowerCase().includes(query.toLowerCase())
                    );
                  })
                }
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "supplier_name",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Lieferantenname *",
                  fullWidth: true,
                  error: !!errors.supplier_name,
                  helperText: (_a2 = errors.supplier_name) == null ? void 0 : _a2.message
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "production_date",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Produktionsdatum *",
                  type: "date",
                  fullWidth: true,
                  error: !!errors.production_date,
                  helperText: (_a2 = errors.production_date) == null ? void 0 : _a2.message,
                  InputLabelProps: { shrink: true }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "expiry_date",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Verfallsdatum *",
                  type: "date",
                  fullWidth: true,
                  error: !!errors.expiry_date,
                  helperText: (_a2 = errors.expiry_date) == null ? void 0 : _a2.message,
                  InputLabelProps: { shrink: true }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "batch_size",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Chargengröße *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.batch_size,
                  helperText: (_a2 = errors.batch_size) == null ? void 0 : _a2.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0)
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "unit",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.unit, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Einheit *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Select, __spreadProps(__spreadValues({}, field), { label: "Einheit *", children: mockUnits.map((unit) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: unit.value, children: unit.label }, unit.value)) })),
              errors.unit && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.unit.message })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "purchase_price",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Einkaufspreis *",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.purchase_price,
                  helperText: (_a2 = errors.purchase_price) == null ? void 0 : _a2.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0),
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "currency",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.currency, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Währung *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, __spreadProps(__spreadValues({}, field), { label: "Währung *", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "EUR", children: "EUR (Euro)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "USD", children: "USD (US-Dollar)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "CHF", children: "CHF (Schweizer Franken)" })
              ] })),
              errors.currency && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.currency.message })
            ] })
          }
        ) })
      ] }),
      activeTab === 1 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "quality_status",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.quality_status, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Qualitätsstatus *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Select, __spreadProps(__spreadValues({}, field), { label: "Qualitätsstatus *", children: mockQualityStatuses.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: status.value, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: status.label,
                    size: "small",
                    color: status.color,
                    sx: { mr: 1 }
                  }
                ),
                status.label
              ] }, status.value)) })),
              errors.quality_status && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.quality_status.message })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "vlog_gmo_status",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.vlog_gmo_status, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "VLOG/GMO Status *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Select, __spreadProps(__spreadValues({}, field), { label: "VLOG/GMO Status *", children: mockVlogGmoStatuses.map((status) => /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: status.value, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Chip,
                  {
                    label: status.label,
                    size: "small",
                    color: status.color,
                    sx: { mr: 1 }
                  }
                ),
                status.label
              ] }, status.value)) })),
              errors.vlog_gmo_status && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.vlog_gmo_status.message })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Qualitäts-Eigenschaften" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Stack, { direction: "row", spacing: 3, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "qs_milk_relevant",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: field.value,
                        onChange: field.onChange,
                        color: "primary"
                      }
                    ),
                    label: "QS Milch relevant"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "eudr_compliant",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: field.value,
                        onChange: field.onChange,
                        color: "success"
                      }
                    ),
                    label: "EUDR konform"
                  }
                )
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Controller,
              {
                name: "sustainability_rapeseed",
                control,
                render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
                  FormControlLabel,
                  {
                    control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                      Switch,
                      {
                        checked: field.value,
                        onChange: field.onChange,
                        color: "info"
                      }
                    ),
                    label: "Nachhaltiger Raps"
                  }
                )
              }
            )
          ] })
        ] })
      ] }),
      activeTab === 2 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "protein_content",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Proteingehalt (%)",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.protein_content,
                  helperText: (_a2 = errors.protein_content) == null ? void 0 : _a2.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0)
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "fat_content",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Fettgehalt (%)",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.fat_content,
                  helperText: (_a2 = errors.fat_content) == null ? void 0 : _a2.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0)
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "moisture_content",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Feuchtigkeitsgehalt (%)",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.moisture_content,
                  helperText: (_a2 = errors.moisture_content) == null ? void 0 : _a2.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0)
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "ash_content",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Aschegehalt (%)",
                  type: "number",
                  fullWidth: true,
                  error: !!errors.ash_content,
                  helperText: (_a2 = errors.ash_content) == null ? void 0 : _a2.message,
                  onChange: (e) => field.onChange(parseFloat(e.target.value) || 0)
                })
              );
            }
          }
        ) })
      ] }),
      activeTab === 3 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "warehouse_location",
            control,
            render: ({ field }) => {
              var _a2;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Lagerort *",
                  fullWidth: true,
                  error: !!errors.warehouse_location,
                  helperText: (_a2 = errors.warehouse_location) == null ? void 0 : _a2.message,
                  InputProps: {
                    startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(ShippingIcon, { sx: { mr: 1, color: "text.secondary" } })
                  }
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "storage_conditions",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.storage_conditions, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Lagerbedingungen *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Select, __spreadProps(__spreadValues({}, field), { label: "Lagerbedingungen *", children: mockStorageConditions.map((condition) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: condition.value, children: condition.label }, condition.value)) })),
              errors.storage_conditions && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.storage_conditions.message })
            ] })
          }
        ) })
      ] }),
      activeTab === 4 && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Zertifikate und Dokumente" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "Zertifikate können über das n8n Workflow-System automatisch verarbeitet werden." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Typ" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Dateiname" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Upload-Datum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Gültig bis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (_a = watch("certificates")) == null ? void 0 : _a.map((cert, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: cert.type }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: cert.filename }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: new Date(cert.upload_date).toLocaleDateString() }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: cert.valid_until ? new Date(cert.valid_until).toLocaleDateString() : "-" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", color: "primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ViewIcon, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { size: "small", color: "error", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, {}) })
            ] })
          ] }, index)) })
        ] }) })
      ] }) }),
      activeTab === 5 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "KI-Analyse und Vorhersagen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "Die KI-Analyse wird automatisch durchgeführt und basiert auf historischen Daten und Qualitätsparametern." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "ki_analysis.risk_score",
            control,
            render: ({ field }) => {
              var _a2, _b2, _c;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Risiko-Score (0-100)",
                  type: "number",
                  fullWidth: true,
                  error: !!((_a2 = errors.ki_analysis) == null ? void 0 : _a2.risk_score),
                  helperText: (_c = (_b2 = errors.ki_analysis) == null ? void 0 : _b2.risk_score) == null ? void 0 : _c.message,
                  onChange: (e) => field.onChange(parseInt(e.target.value) || 0)
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "ki_analysis.quality_prediction",
            control,
            render: ({ field }) => {
              var _a2, _b2;
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!((_a2 = errors.ki_analysis) == null ? void 0 : _a2.quality_prediction), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Qualitätsvorhersage" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, __spreadProps(__spreadValues({}, field), { label: "Qualitätsvorhersage", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "excellent", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Ausgezeichnet", color: "success", size: "small", sx: { mr: 1 } }),
                    "Ausgezeichnet"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "good", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Gut", color: "primary", size: "small", sx: { mr: 1 } }),
                    "Gut"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "average", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Durchschnittlich", color: "warning", size: "small", sx: { mr: 1 } }),
                    "Durchschnittlich"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "poor", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Schlecht", color: "error", size: "small", sx: { mr: 1 } }),
                    "Schlecht"
                  ] })
                ] })),
                ((_b2 = errors.ki_analysis) == null ? void 0 : _b2.quality_prediction) && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.ki_analysis.quality_prediction.message })
              ] });
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "ki_analysis.shelf_life_prediction",
            control,
            render: ({ field }) => {
              var _a2, _b2, _c;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Haltbarkeitsvorhersage (Tage)",
                  type: "number",
                  fullWidth: true,
                  error: !!((_a2 = errors.ki_analysis) == null ? void 0 : _a2.shelf_life_prediction),
                  helperText: (_c = (_b2 = errors.ki_analysis) == null ? void 0 : _b2.shelf_life_prediction) == null ? void 0 : _c.message,
                  onChange: (e) => field.onChange(parseInt(e.target.value) || 0)
                })
              );
            }
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "ki_analysis.anomaly_detection",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              FormControlLabel,
              {
                control: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Switch,
                  {
                    checked: field.value,
                    onChange: field.onChange,
                    color: "warning"
                  }
                ),
                label: "Anomalie erkannt"
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "ki_analysis.trend_analysis",
            control,
            render: ({ field }) => {
              var _a2, _b2, _c;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                TextField,
                __spreadProps(__spreadValues({}, field), {
                  label: "Trend-Analyse",
                  multiline: true,
                  rows: 3,
                  fullWidth: true,
                  error: !!((_a2 = errors.ki_analysis) == null ? void 0 : _a2.trend_analysis),
                  helperText: (_c = (_b2 = errors.ki_analysis) == null ? void 0 : _b2.trend_analysis) == null ? void 0 : _c.message
                })
              );
            }
          }
        ) })
      ] }),
      activeTab === 6 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", fontWeight: 600, mb: 2, children: "Workflow-Status und Automatisierung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "Der Workflow wird über n8n gesteuert und automatisiert die Chargenverarbeitung." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Controller,
          {
            name: "workflow_status",
            control,
            render: ({ field }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, error: !!errors.workflow_status, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Workflow-Status *" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, __spreadProps(__spreadValues({}, field), { label: "Workflow-Status *", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "draft", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Entwurf", color: "default", size: "small", sx: { mr: 1 } }),
                  "Entwurf"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "in_review", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "In Prüfung", color: "warning", size: "small", sx: { mr: 1 } }),
                  "In Prüfung"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "approved", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Genehmigt", color: "success", size: "small", sx: { mr: 1 } }),
                  "Genehmigt"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "rejected", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Abgelehnt", color: "error", size: "small", sx: { mr: 1 } }),
                  "Abgelehnt"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(MenuItem, { value: "archived", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Chip, { label: "Archiviert", color: "default", size: "small", sx: { mr: 1 } }),
                  "Archiviert"
                ] })
              ] })),
              errors.workflow_status && /* @__PURE__ */ jsxRuntimeExports.jsx(FormHelperText, { children: errors.workflow_status.message })
            ] })
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", fontWeight: 600, mb: 2, children: "Workflow-Schritte" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Schritt" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Ausgeführt von" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Ausgeführt am" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Notizen" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: (_b = watch("workflow_steps")) == null ? void 0 : _b.map((step, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: step.step }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: step.status === "completed" ? "Abgeschlossen" : step.status === "pending" ? "Ausstehend" : "Fehlgeschlagen",
                  color: step.status === "completed" ? "success" : step.status === "pending" ? "warning" : "error",
                  size: "small"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: step.completed_by || "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: step.completed_at ? new Date(step.completed_at).toLocaleString() : "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: step.notes || "-" })
            ] }, index)) })
          ] }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", justifyContent: "flex-end", gap: 2, mt: 4, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NeuroFlowButton,
          {
            variant: "outlined",
            onClick: handleCancel,
            disabled: submitLoading,
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CancelIcon, {}),
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          NeuroFlowButton,
          {
            type: "submit",
            variant: "contained",
            disabled: submitLoading || loading,
            startIcon: submitLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(SaveIcon, {}),
            children: submitLoading ? "Speichern..." : "Charge speichern"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Dialog,
      {
        open: workflowDialogOpen,
        onClose: () => setWorkflowDialogOpen(false),
        maxWidth: "md",
        fullWidth: true,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TimelineIcon, { color: "primary" }),
            "n8n Workflows"
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Name" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Trigger" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Nodes" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Letzte Ausführung" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Aktionen" })
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: n8nWorkflows.map((workflow) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: workflow.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: workflow.status === "active" ? "Aktiv" : "Inaktiv",
                  color: workflow.status === "active" ? "success" : "default",
                  size: "small"
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: workflow.trigger }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: workflow.nodes }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: workflow.lastExecution ? new Date(workflow.lastExecution).toLocaleString() : "-" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                IconButton,
                {
                  size: "small",
                  color: "primary",
                  onClick: () => {
                    setSelectedWorkflow(workflow);
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayArrowIcon, {})
                }
              ) })
            ] }, workflow.id)) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setWorkflowDialogOpen(false), children: "Schließen" }) })
        ]
      }
    )
  ] }) });
};
const NeuroFlowChargenverwaltung$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  NeuroFlowChargenverwaltung,
  default: NeuroFlowChargenverwaltung
}, Symbol.toStringTag, { value: "Module" }));
export {
  NeuroFlowDashboard,
  NeuroFlowDashboard as default
};
//# sourceMappingURL=neuroflow-DF58GYou.js.map
