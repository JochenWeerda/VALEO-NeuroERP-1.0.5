const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/neuroflow-DF58GYou.js","js/react-vendor-C09FwfLq.js","js/other-vendor-OscdKVAu.js","js/lodash-BQSKQrpq.js","js/auth-Bv6CYr1e.js","js/services-B0UdZUHq.js","js/axios-BDGNVNQ7.js","js/mui-material-B4Zm8Ctl.js","js/mui-icons-CGIi46zQ.js","js/hookform-resolvers-B3VX3b4X.js","js/validation-CXIZp7Zb.js","js/pages-DLIdYrrg.js","js/streckengeschaeft-CkKAL3kB.js","js/types-y_80m08G.js","js/antd-core-Bn6Stp_u.js","js/antd-icons-ZoMdwZyJ.js","js/pos-system-D3uS3wb4.js","js/e-invoicing-DCH02efg.js","js/utils-Cn0CNrbA.js"])))=>i.map(i=>d[i]);
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
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
import { r as reactExports, j as jsxRuntimeExports, B as BrowserRouter, d as Routes, e as Route, N as Navigate, R as React, u as useLocation, L as Link } from "./react-vendor-C09FwfLq.js";
import { B as Box, P as Paper, T as Typography, c as Button, d as CircularProgress, u as useTheme, e as AppBar, f as Toolbar, I as IconButton, D as Drawer, L as List, g as ListItem, h as ListItemIcon, i as ListItemText, C as Card, A as Alert, j as TableContainer, k as Table, l as TableHead, m as TableRow, n as TableCell, o as TableBody, p as Chip, q as Tooltip, r as Dialog, s as DialogTitle, t as DialogContent, b as TextField, v as DialogActions, F as FormControl, w as InputLabel, S as Select, M as MenuItem, x as FormControlLabel, y as Switch } from "./mui-material-B4Zm8Ctl.js";
import { B as BugReportIcon, R as RefreshIcon, D as DashboardIcon, S as StoreIcon, P as POSIcon, a as Receipt, b as DescriptionIcon, M as MenuIcon, A as AccountIcon, Q as QrCodeIcon, C as CameraIcon, I as InventoryIcon, c as AddIcon, d as CheckCircleIcon, W as WarningIcon, E as EditIcon, V as VoucherIcon, e as CopyIcon, f as ViewIcon, g as DeleteIcon } from "./mui-icons-CGIi46zQ.js";
import { l as lazyWithPreload, p as preloadService } from "./services-B0UdZUHq.js";
import { aZ as useMediaQuery, a_ as Quagga } from "./other-vendor-OscdKVAu.js";
class ErrorBoundary extends reactExports.Component {
  constructor(props) {
    super(props);
    __publicField(this, "handleReload", () => {
      window.location.reload();
    });
    __publicField(this, "handleReset", () => {
      this.setState({ hasError: false, error: void 0, errorInfo: void 0 });
    });
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return /* @__PURE__ */ jsxRuntimeExports.jsx(
        Box,
        {
          sx: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            p: 3,
            bgcolor: "background.default"
          },
          children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Paper,
            {
              elevation: 3,
              sx: {
                p: 4,
                maxWidth: 600,
                textAlign: "center",
                borderRadius: 2
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  BugReportIcon,
                  {
                    sx: {
                      fontSize: 64,
                      color: "error.main",
                      mb: 2
                    }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, color: "error.main", children: "Ein Fehler ist aufgetreten" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", sx: { mb: 3 }, children: "Entschuldigung, etwas ist schiefgelaufen. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support." }),
                false,
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }, children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "contained",
                      startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                      onClick: this.handleReset,
                      sx: { minWidth: 140 },
                      children: "Erneut versuchen"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      variant: "outlined",
                      startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
                      onClick: this.handleReload,
                      sx: { minWidth: 140 },
                      children: "Seite neu laden"
                    }
                  )
                ] })
              ]
            }
          )
        }
      );
    }
    return this.props.children;
  }
}
const scriptRel = "modulepreload";
const assetsURL = function(dep) {
  return "/" + dep;
};
const seen = {};
const __vitePreload = function preload(baseModule, deps, importerUrl) {
  let promise = Promise.resolve();
  if (deps && deps.length > 0) {
    document.getElementsByTagName("link");
    const cspNonceMeta = document.querySelector(
      "meta[property=csp-nonce]"
    );
    const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
    promise = Promise.allSettled(
      deps.map((dep) => {
        dep = assetsURL(dep);
        if (dep in seen) return;
        seen[dep] = true;
        const isCss = dep.endsWith(".css");
        const cssSelector = isCss ? '[rel="stylesheet"]' : "";
        if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
          return;
        }
        const link = document.createElement("link");
        link.rel = isCss ? "stylesheet" : scriptRel;
        if (!isCss) {
          link.as = "script";
        }
        link.crossOrigin = "";
        link.href = dep;
        if (cspNonce) {
          link.setAttribute("nonce", cspNonce);
        }
        document.head.appendChild(link);
        if (isCss) {
          return new Promise((res, rej) => {
            link.addEventListener("load", res);
            link.addEventListener(
              "error",
              () => rej(new Error(`Unable to preload CSS for ${dep}`))
            );
          });
        }
      })
    );
  }
  function handlePreloadError(err) {
    const e = new Event("vite:preloadError", {
      cancelable: true
    });
    e.payload = err;
    window.dispatchEvent(e);
    if (!e.defaultPrevented) {
      throw err;
    }
  }
  return promise.then((res) => {
    for (const item of res || []) {
      if (item.status !== "rejected") continue;
      handlePreloadError(item.reason);
    }
    return baseModule().catch(handlePreloadError);
  });
};
const Dashboard = lazyWithPreload(
  () => __vitePreload(() => import("./neuroflow-DF58GYou.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]) : void 0),
  "/dashboard"
);
const LoginForm = reactExports.lazy(() => __vitePreload(() => import("./auth-Bv6CYr1e.js").then((n) => n.L), true ? __vite__mapDeps([4,1,2,3,5,6,7]) : void 0));
const StreckengeschaeftPage = lazyWithPreload(
  () => __vitePreload(() => import("./pages-DLIdYrrg.js"), true ? __vite__mapDeps([11,1,2,3,12,13,10,9,14,15,7,8]) : void 0).then((module) => ({ default: module.StreckengeschaeftPage })),
  "/streckengeschaeft"
);
const POSPage = lazyWithPreload(
  () => __vitePreload(() => import("./pos-system-D3uS3wb4.js").then((n) => n.P), true ? __vite__mapDeps([16,1,2,3,7,8]) : void 0),
  "/pos"
);
const DailyReportPage = lazyWithPreload(
  () => __vitePreload(() => import("./pos-system-D3uS3wb4.js").then((n) => n.D), true ? __vite__mapDeps([16,1,2,3,7,8]) : void 0),
  "/daily-report"
);
const EInvoicingPage = lazyWithPreload(
  () => __vitePreload(() => import("./e-invoicing-DCH02efg.js"), true ? __vite__mapDeps([17,1,2,3,18,5,6,14,15,9,10,7,8]) : void 0),
  "/e-invoicing"
);
const RouteLoader = ({
  routeName,
  isPreloaded = false
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
  Box,
  {
    sx: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      flexDirection: "column",
      gap: 2
    },
    children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 60 }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", sx: { mb: 1 }, children: [
          routeName,
          " wird geladen..."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: "Bitte warten Sie einen Moment" }),
        isPreloaded && /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", color: "success.main", children: "✓ Route wurde bereits vorbereitet" })
      ] })
    ]
  }
);
const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/login", replace: true });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
};
const PreloadRoute = ({
  route,
  component: Component,
  isAuthenticated,
  routeName
}) => {
  const preloadStatus = preloadService.getPreloadStatus();
  const isPreloaded = preloadStatus[route] || false;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { isAuthenticated, children: /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { routeName, isPreloaded }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Component, {}) }) });
};
const NavigationObserver = ({ children }) => {
  const location = useLocation();
  reactExports.useEffect(() => {
    preloadService.preloadBasedOnCurrentRoute(location.pathname);
    preloadService.preloadDependencies(location.pathname);
  }, [location.pathname]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
};
const PreloadRouter = ({ isAuthenticated }) => {
  reactExports.useEffect(() => {
    preloadService.preloadCriticalRoutes();
  }, []);
  const routes = reactExports.useMemo(() => [
    {
      path: "/login",
      component: LoginForm,
      routeName: "Login",
      protected: false
    },
    {
      path: "/",
      component: Dashboard.Component,
      routeName: "Dashboard",
      protected: true,
      route: "/dashboard"
    },
    {
      path: "/dashboard",
      component: Dashboard.Component,
      routeName: "Dashboard",
      protected: true,
      route: "/dashboard"
    },
    {
      path: "/streckengeschaeft",
      component: StreckengeschaeftPage.Component,
      routeName: "Streckengeschäft",
      protected: true,
      route: "/streckengeschaeft"
    },
    {
      path: "/pos",
      component: POSPage.Component,
      routeName: "POS-System",
      protected: true,
      route: "/pos"
    },
    {
      path: "/daily-report",
      component: DailyReportPage.Component,
      routeName: "Tagesbericht",
      protected: true,
      route: "/daily-report"
    },
    {
      path: "/e-invoicing",
      component: EInvoicingPage.Component,
      routeName: "E-Invoicing",
      protected: true,
      route: "/e-invoicing"
    }
  ], []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(BrowserRouter, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(NavigationObserver, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Routes, { children: [
    routes.map(({ path, component: Component, routeName, protected: isProtected, route }) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      Route,
      {
        path,
        element: isProtected ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          PreloadRoute,
          {
            route: route || path,
            component: Component,
            isAuthenticated,
            routeName
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx(reactExports.Suspense, { fallback: /* @__PURE__ */ jsxRuntimeExports.jsx(RouteLoader, { routeName }), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Component, {}) })
      },
      path
    )),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Route,
      {
        path: "*",
        element: /* @__PURE__ */ jsxRuntimeExports.jsx(ProtectedRoute, { isAuthenticated, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Navigate, { to: "/dashboard", replace: true }) })
      }
    )
  ] }) }) });
};
const PreloadStatusDebug = () => {
  const [preloadStatus, setPreloadStatus] = React.useState({});
  reactExports.useEffect(() => {
    const updateStatus = () => {
      setPreloadStatus(preloadService.getPreloadStatus());
    };
    updateStatus();
    const interval = setInterval(updateStatus, 1e3);
    return () => clearInterval(interval);
  }, []);
  return null;
};
const navigationItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
    priority: "critical"
  },
  {
    path: "/streckengeschaeft",
    label: "Streckengeschäft",
    icon: StoreIcon,
    priority: "high"
  },
  {
    path: "/pos",
    label: "POS-System",
    icon: POSIcon,
    priority: "high"
  },
  {
    path: "/daily-report",
    label: "Tagesbericht",
    icon: Receipt,
    priority: "medium"
  },
  {
    path: "/e-invoicing",
    label: "E-Invoicing",
    icon: DescriptionIcon,
    priority: "medium"
  }
];
const NavigationLink = ({
  to,
  label,
  icon: Icon,
  isActive,
  onClick
}) => {
  const handleMouseEnter = () => {
    preloadService.preloadRoute(to);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Button,
    {
      component: Link,
      to,
      startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, {}),
      onClick,
      onMouseEnter: handleMouseEnter,
      "data-route": to,
      sx: {
        color: isActive ? "primary.main" : "inherit",
        backgroundColor: isActive ? "rgba(25, 118, 210, 0.08)" : "transparent",
        "&:hover": {
          backgroundColor: "rgba(25, 118, 210, 0.12)",
          color: "primary.main"
        },
        textTransform: "none",
        fontWeight: isActive ? 600 : 400,
        minWidth: "auto",
        px: 2,
        py: 1
      },
      children: label
    }
  );
};
const MobileNavigationItem = ({
  to,
  label,
  icon: Icon,
  isActive,
  onClick
}) => {
  const handleMouseEnter = () => {
    preloadService.preloadRoute(to);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    ListItem,
    {
      button: true,
      component: Link,
      to,
      onClick,
      onMouseEnter: handleMouseEnter,
      "data-route": to,
      sx: {
        backgroundColor: isActive ? "rgba(25, 118, 210, 0.08)" : "transparent",
        "&:hover": {
          backgroundColor: "rgba(25, 118, 210, 0.12)"
        }
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { color: isActive ? "primary" : "inherit" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ListItemText,
          {
            primary: label,
            sx: {
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "primary.main" : "inherit"
            }
          }
        )
      ]
    }
  );
};
const Navigation = ({
  isAuthenticated,
  onLogout
}) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  React.useEffect(() => {
    if (isAuthenticated) {
      preloadService.preloadCriticalRoutes();
    }
  }, [isAuthenticated]);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleNavigationClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  if (!isAuthenticated) {
    return null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      AppBar,
      {
        position: "static",
        elevation: 1,
        sx: {
          backgroundColor: "white",
          color: "text.primary",
          borderBottom: "1px solid",
          borderColor: "divider"
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Toolbar, { sx: { justifyContent: "space-between" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", alignItems: "center" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Typography,
            {
              variant: "h6",
              component: "div",
              sx: {
                fontWeight: 600,
                color: "primary.main",
                mr: 4
              },
              children: "VALEO NeuroERP"
            }
          ) }),
          !isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", gap: 1 }, children: navigationItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            NavigationLink,
            {
              to: item.path,
              label: item.label,
              icon: item.icon,
              isActive: location.pathname === item.path
            },
            item.path
          )) }),
          isMobile && /* @__PURE__ */ jsxRuntimeExports.jsx(
            IconButton,
            {
              color: "inherit",
              "aria-label": "open drawer",
              edge: "start",
              onClick: handleDrawerToggle,
              sx: { mr: 2 },
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(MenuIcon, {})
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", gap: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { color: "inherit", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountIcon, {}) }),
            onLogout && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                size: "small",
                onClick: onLogout,
                sx: { textTransform: "none" },
                children: "Abmelden"
              }
            )
          ] })
        ] })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Drawer,
      {
        variant: "temporary",
        anchor: "left",
        open: mobileOpen,
        onClose: handleDrawerToggle,
        ModalProps: {
          keepMounted: true
          // Bessere Performance auf Mobile
        },
        sx: {
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 280
          }
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", sx: { mb: 2, fontWeight: 600 }, children: "Navigation" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(List, { children: navigationItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            MobileNavigationItem,
            {
              to: item.path,
              label: item.label,
              icon: item.icon,
              isActive: location.pathname === item.path,
              onClick: handleNavigationClick
            },
            item.path
          )) })
        ] })
      }
    )
  ] });
};
const PreloadIndicator = () => {
  const [preloadStatus, setPreloadStatus] = React.useState({});
  React.useEffect(() => {
    const updateStatus = () => {
      setPreloadStatus(preloadService.getPreloadStatus());
    };
    updateStatus();
    const interval = setInterval(updateStatus, 2e3);
    return () => clearInterval(interval);
  }, []);
  return null;
};
const TabPanel = (props) => {
  const _a = props, { children, value, index } = _a, other = __objRest(_a, ["children", "value", "index"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      role: "tabpanel",
      hidden: value !== index,
      id: `simple-tabpanel-${index}`,
      "aria-labelledby": `simple-tab-${index}`,
      children: value === index && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { p: 3 }, children })
    }
  );
};
const BarcodeScanner = ({
  onBarcodeDetected,
  onError,
  autoStart = false,
  className = ""
}) => {
  const scannerRef = reactExports.useRef(null);
  const [isScanning, setIsScanning] = reactExports.useState(false);
  const [isInitialized, setIsInitialized] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [lastScannedCode, setLastScannedCode] = reactExports.useState(null);
  const onDetected = reactExports.useCallback((result) => {
    const code = result.codeResult.code;
    if (code && code !== lastScannedCode) {
      setLastScannedCode(code);
      onBarcodeDetected(code);
      setTimeout(() => {
        setLastScannedCode(null);
      }, 2e3);
    }
  }, [onBarcodeDetected, lastScannedCode]);
  const initializeScanner = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!scannerRef.current) return;
    try {
      setError(null);
      setIsInitialized(false);
      yield Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            facingMode: "environment"
            // Rückkamera bevorzugen
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 4,
        frequency: 10,
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader"
          ]
        },
        locate: true
      });
      Quagga.onDetected(onDetected);
      setIsInitialized(true);
      if (autoStart) {
        startScanning();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Scanner-Initialisierung fehlgeschlagen";
      setError(errorMessage);
      onError == null ? void 0 : onError(errorMessage);
    }
  }), [onDetected, autoStart, onError]);
  const startScanning = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!isInitialized) {
      yield initializeScanner();
    }
    try {
      yield Quagga.start();
      setIsScanning(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Scanner konnte nicht gestartet werden";
      setError(errorMessage);
      onError == null ? void 0 : onError(errorMessage);
    }
  }), [isInitialized, initializeScanner, onError]);
  const stopScanning = reactExports.useCallback(() => {
    Quagga.stop();
    setIsScanning(false);
  }, []);
  reactExports.useEffect(() => {
    return () => {
      if (isScanning) {
        Quagga.stop();
      }
    };
  }, [isScanning]);
  reactExports.useEffect(() => {
    if (autoStart) {
      initializeScanner();
    }
  }, [autoStart, initializeScanner]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: `p-4 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(QrCodeIcon, {}),
        "Barcode-Scanner"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "flex gap-2", children: !isScanning ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CameraIcon, {}),
          onClick: startScanning,
          disabled: !isInitialized && !autoStart,
          children: "Scanner starten"
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "outlined",
          color: "secondary",
          onClick: stopScanning,
          children: "Scanner stoppen"
        }
      ) })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", className: "mb-4", children: error }),
    lastScannedCode && /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, { severity: "success", className: "mb-4", children: [
      "Barcode erkannt: ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: lastScannedCode })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          ref: scannerRef,
          className: "w-full h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-300",
          children: !isScanning && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "flex items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "text-center", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CameraIcon, { className: "text-4xl text-gray-400 mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: 'Scanner bereit - Klicken Sie auf "Scanner starten"' })
          ] }) })
        }
      ),
      isScanning && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 40 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", children: "Unterstützte Formate: EAN-13, EAN-8, Code 128, Code 39, UPC" }) })
  ] });
};
const StockOpnameInterface = ({
  className = ""
}) => {
  const [stockOpnames, setStockOpnames] = reactExports.useState([]);
  const [currentOpname, setCurrentOpname] = reactExports.useState(null);
  const [opnameItems, setOpnameItems] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [success, setSuccess] = reactExports.useState(null);
  const [createDialogOpen, setCreateDialogOpen] = reactExports.useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = reactExports.useState(false);
  const [selectedItem, setSelectedItem] = reactExports.useState(null);
  const [newOpnameData, setNewOpnameData] = reactExports.useState({
    responsible_person: "",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
  });
  const [editItemData, setEditItemData] = reactExports.useState({
    actual_quantity: 0,
    notes: ""
  });
  const loadStockOpnames = reactExports.useCallback(() => __async(void 0, null, function* () {
    setLoading(true);
    try {
      const response = yield fetch("/api/stock-opname");
      if (response.ok) {
        const data = yield response.json();
        setStockOpnames(data.stock_opnames || []);
      } else {
        throw new Error("Fehler beim Laden der Inventuren");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }), []);
  const createStockOpname = reactExports.useCallback(() => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/stock-opname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newOpnameData)
      });
      if (response.ok) {
        const data = yield response.json();
        setSuccess("Inventur erfolgreich erstellt");
        setCreateDialogOpen(false);
        setNewOpnameData({ responsible_person: "", date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0] });
        loadStockOpnames();
      } else {
        throw new Error("Fehler beim Erstellen der Inventur");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }), [newOpnameData, loadStockOpnames]);
  const openStockOpname = reactExports.useCallback((opname) => __async(void 0, null, function* () {
    setLoading(true);
    try {
      const response = yield fetch(`/api/stock-opname/${opname.id}/items`);
      if (response.ok) {
        const data = yield response.json();
        setOpnameItems(data.items || []);
        setCurrentOpname(opname);
      } else {
        throw new Error("Fehler beim Laden der Inventur-Details");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }), []);
  const handleBarcodeDetected = reactExports.useCallback((barcode) => {
    console.log("Barcode erkannt:", barcode);
  }, []);
  const editItem = reactExports.useCallback((item) => {
    setSelectedItem(item);
    setEditItemData({
      actual_quantity: item.actual_quantity,
      notes: item.notes || ""
    });
    setEditItemDialogOpen(true);
  }, []);
  const saveItem = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!selectedItem) return;
    try {
      const response = yield fetch(`/api/stock-opname/items/${selectedItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editItemData)
      });
      if (response.ok) {
        setSuccess("Artikel erfolgreich aktualisiert");
        setEditItemDialogOpen(false);
        setSelectedItem(null);
        if (currentOpname) {
          openStockOpname(currentOpname);
        }
      } else {
        throw new Error("Fehler beim Aktualisieren des Artikels");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }), [selectedItem, editItemData, currentOpname, openStockOpname]);
  const closeStockOpname = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!currentOpname) return;
    try {
      const response = yield fetch(`/api/stock-opname/${currentOpname.id}/close`, {
        method: "POST"
      });
      if (response.ok) {
        setSuccess("Inventur erfolgreich abgeschlossen");
        setCurrentOpname(null);
        setOpnameItems([]);
        loadStockOpnames();
      } else {
        throw new Error("Fehler beim Abschließen der Inventur");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }), [currentOpname, loadStockOpnames]);
  const getStatusColor = (status) => {
    switch (status) {
      case "offen":
        return "default";
      case "in_bearbeitung":
        return "warning";
      case "abgeschlossen":
        return "success";
      case "storniert":
        return "error";
      default:
        return "default";
    }
  };
  const getStatusText = (status) => {
    switch (status) {
      case "offen":
        return "Offen";
      case "in_bearbeitung":
        return "In Bearbeitung";
      case "abgeschlossen":
        return "Abgeschlossen";
      case "storniert":
        return "Storniert";
      default:
        return status;
    }
  };
  const getProgress = (opname) => {
    return opname.total_items > 0 ? opname.completed_items / opname.total_items * 100 : 0;
  };
  reactExports.useEffect(() => {
    loadStockOpnames();
  }, [loadStockOpnames]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(InventoryIcon, {}),
        "Inventur-Verwaltung"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
          onClick: () => setCreateDialogOpen(true),
          children: "Neue Inventur"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", onClose: () => setError(null), children: error }),
    success && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", onClose: () => setSuccess(null), children: success }),
    !currentOpname && /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4", children: "Inventuren" }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "flex justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Nummer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Datum" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Verantwortlicher" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Fortschritt" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: stockOpnames.map((opname) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: opname.number }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: new Date(opname.date).toLocaleDateString("de-DE") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: opname.responsible_person }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: getStatusText(opname.status),
              color: getStatusColor(opname.status),
              size: "small"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "w-16 bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                className: "bg-blue-600 h-2 rounded-full",
                style: { width: `${getProgress(opname)}%` }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              opname.completed_items,
              "/",
              opname.total_items
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "small",
              onClick: () => openStockOpname(opname),
              disabled: opname.status === "abgeschlossen",
              children: "Öffnen"
            }
          ) })
        ] }, opname.id)) })
      ] }) })
    ] }),
    currentOpname && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", children: [
              "Inventur: ",
              currentOpname.number
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", color: "textSecondary", children: [
              new Date(currentOpname.date).toLocaleDateString("de-DE"),
              " - ",
              currentOpname.responsible_person
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "outlined",
                onClick: () => {
                  setCurrentOpname(null);
                  setOpnameItems([]);
                },
                children: "Zurück"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "contained",
                color: "success",
                startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {}),
                onClick: closeStockOpname,
                disabled: currentOpname.status === "abgeschlossen",
                children: "Inventur abschließen"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: getStatusText(currentOpname.status),
            color: getStatusColor(currentOpname.status)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BarcodeScanner,
        {
          onBarcodeDetected: handleBarcodeDetected,
          onError: setError,
          className: "mb-4"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4", children: "Inventur-Artikel" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Produkt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Code" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Erwartet" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Tatsächlich" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Differenz" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Notizen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Aktionen" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: opnameItems.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.product_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.product_code }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", children: [
              item.expected_quantity,
              " ",
              item.unit
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: item.actual_quantity !== item.expected_quantity ? "text-red-600 font-semibold" : "", children: [
              item.actual_quantity,
              " ",
              item.unit
            ] }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: `${item.difference > 0 ? "+" : ""}${item.difference}`,
                color: item.difference === 0 ? "success" : "warning",
                size: "small"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: item.notes && /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: item.notes, children: /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning", fontSize: "small" }) }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: () => editItem(item),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {})
              }
            ) })
          ] }, item.id)) })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: createDialogOpen, onClose: () => setCreateDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Neue Inventur erstellen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Verantwortlicher",
            fullWidth: true,
            value: newOpnameData.responsible_person,
            onChange: (e) => setNewOpnameData((prev) => __spreadProps(__spreadValues({}, prev), { responsible_person: e.target.value }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Datum",
            type: "date",
            fullWidth: true,
            value: newOpnameData.date,
            onChange: (e) => setNewOpnameData((prev) => __spreadProps(__spreadValues({}, prev), { date: e.target.value })),
            InputLabelProps: { shrink: true }
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCreateDialogOpen(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createStockOpname, variant: "contained", children: "Erstellen" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: editItemDialogOpen, onClose: () => setEditItemDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Artikel bearbeiten" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: selectedItem && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", children: [
          selectedItem.product_name,
          " (",
          selectedItem.product_code,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Tatsächliche Menge",
            type: "number",
            fullWidth: true,
            value: editItemData.actual_quantity,
            onChange: (e) => setEditItemData((prev) => __spreadProps(__spreadValues({}, prev), { actual_quantity: Number(e.target.value) }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Notizen",
            multiline: true,
            rows: 3,
            fullWidth: true,
            value: editItemData.notes,
            onChange: (e) => setEditItemData((prev) => __spreadProps(__spreadValues({}, prev), { notes: e.target.value }))
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setEditItemDialogOpen(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: saveItem, variant: "contained", children: "Speichern" })
      ] })
    ] })
  ] });
};
const VoucherManagement = ({
  className = ""
}) => {
  const [vouchers, setVouchers] = reactExports.useState([]);
  const [selectedVoucher, setSelectedVoucher] = reactExports.useState(null);
  const [voucherUsage, setVoucherUsage] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [success, setSuccess] = reactExports.useState(null);
  const [createDialogOpen, setCreateDialogOpen] = reactExports.useState(false);
  const [editDialogOpen, setEditDialogOpen] = reactExports.useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = reactExports.useState(false);
  const [voucherForm, setVoucherForm] = reactExports.useState({
    name: "",
    code: "",
    type: "betrag",
    nominal: 0,
    kuota: 1,
    start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    expired: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
    minimal_buying: 0,
    is_active: true
  });
  const loadVouchers = reactExports.useCallback(() => __async(void 0, null, function* () {
    setLoading(true);
    try {
      const response = yield fetch("/api/vouchers");
      if (response.ok) {
        const data = yield response.json();
        setVouchers(data.vouchers || []);
      } else {
        throw new Error("Fehler beim Laden der Gutscheine");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  }), []);
  const createVoucher = reactExports.useCallback(() => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/vouchers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucherForm)
      });
      if (response.ok) {
        const data = yield response.json();
        setSuccess("Gutschein erfolgreich erstellt");
        setCreateDialogOpen(false);
        resetVoucherForm();
        loadVouchers();
      } else {
        throw new Error("Fehler beim Erstellen des Gutscheins");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }), [voucherForm, loadVouchers]);
  const updateVoucher = reactExports.useCallback(() => __async(void 0, null, function* () {
    if (!selectedVoucher) return;
    try {
      const response = yield fetch(`/api/vouchers/${selectedVoucher.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(voucherForm)
      });
      if (response.ok) {
        setSuccess("Gutschein erfolgreich aktualisiert");
        setEditDialogOpen(false);
        setSelectedVoucher(null);
        resetVoucherForm();
        loadVouchers();
      } else {
        throw new Error("Fehler beim Aktualisieren des Gutscheins");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }), [selectedVoucher, voucherForm, loadVouchers]);
  const deleteVoucher = reactExports.useCallback((voucherId) => __async(void 0, null, function* () {
    if (!confirm("Sind Sie sicher, dass Sie diesen Gutschein löschen möchten?")) return;
    try {
      const response = yield fetch(`/api/vouchers/${voucherId}`, {
        method: "DELETE"
      });
      if (response.ok) {
        setSuccess("Gutschein erfolgreich gelöscht");
        loadVouchers();
      } else {
        throw new Error("Fehler beim Löschen des Gutscheins");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }), [loadVouchers]);
  const loadVoucherUsage = reactExports.useCallback((voucherId) => __async(void 0, null, function* () {
    try {
      const response = yield fetch(`/api/vouchers/${voucherId}/usage`);
      if (response.ok) {
        const data = yield response.json();
        setVoucherUsage(data.usage || []);
      } else {
        throw new Error("Fehler beim Laden der Gutschein-Nutzung");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    }
  }), []);
  const openEditDialog = reactExports.useCallback((voucher) => {
    setSelectedVoucher(voucher);
    setVoucherForm({
      name: voucher.name,
      code: voucher.code,
      type: voucher.type,
      nominal: voucher.nominal,
      kuota: voucher.kuota,
      start_date: voucher.start_date,
      expired: voucher.expired,
      minimal_buying: voucher.minimal_buying,
      is_active: voucher.is_active
    });
    setEditDialogOpen(true);
  }, []);
  const showVoucherUsage = reactExports.useCallback((voucher) => {
    setSelectedVoucher(voucher);
    loadVoucherUsage(voucher.id);
    setUsageDialogOpen(true);
  }, [loadVoucherUsage]);
  const copyVoucherCode = reactExports.useCallback((code) => {
    navigator.clipboard.writeText(code);
    setSuccess("Gutschein-Code kopiert");
  }, []);
  const resetVoucherForm = reactExports.useCallback(() => {
    setVoucherForm({
      name: "",
      code: "",
      type: "betrag",
      nominal: 0,
      kuota: 1,
      start_date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      expired: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString().split("T")[0],
      minimal_buying: 0,
      is_active: true
    });
  }, []);
  const generateCode = reactExports.useCallback(() => {
    const code = "VALE" + Math.random().toString(36).substr(2, 8).toUpperCase();
    setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { code }));
  }, []);
  const getStatusColor = (voucher) => {
    if (!voucher.is_active) return "error";
    if (voucher.used_count >= voucher.kuota) return "warning";
    if (new Date(voucher.expired) < /* @__PURE__ */ new Date()) return "error";
    return "success";
  };
  const getStatusText = (voucher) => {
    if (!voucher.is_active) return "Inaktiv";
    if (voucher.used_count >= voucher.kuota) return "Aufgebraucht";
    if (new Date(voucher.expired) < /* @__PURE__ */ new Date()) return "Abgelaufen";
    return "Aktiv";
  };
  const getTypeText = (type) => {
    switch (type) {
      case "prozent":
        return "Prozent";
      case "betrag":
        return "Betrag";
      case "versandkosten":
        return "Versandkosten";
      default:
        return type;
    }
  };
  const getUsageRate = (voucher) => {
    return voucher.kuota > 0 ? voucher.used_count / voucher.kuota * 100 : 0;
  };
  reactExports.useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-6 ${className}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h4", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(VoucherIcon, {}),
        "Gutschein-Verwaltung"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "contained",
          startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
          onClick: () => setCreateDialogOpen(true),
          children: "Neuer Gutschein"
        }
      )
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", onClose: () => setError(null), children: error }),
    success && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", onClose: () => setSuccess(null), children: success }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4", children: "Gutscheine" }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "flex justify-center p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Code" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Typ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Wert" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Verwendung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Gültig bis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Aktionen" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: vouchers.map((voucher) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { hover: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: voucher.name }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "bg-gray-100 px-2 py-1 rounded text-sm", children: voucher.code }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: () => copyVoucherCode(voucher.code),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(CopyIcon, { fontSize: "small" })
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: getTypeText(voucher.type),
              size: "small",
              variant: "outlined"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: voucher.type === "prozent" ? `${voucher.nominal}%` : `€${voucher.nominal.toFixed(2)}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: getStatusText(voucher),
              color: getStatusColor(voucher),
              size: "small"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "w-16 bg-gray-200 rounded-full h-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Box,
              {
                className: "bg-blue-600 h-2 rounded-full",
                style: { width: `${getUsageRate(voucher)}%` }
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", children: [
              voucher.used_count,
              "/",
              voucher.kuota
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: new Date(voucher.expired).toLocaleDateString("de-DE") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Bearbeiten", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: () => openEditDialog(voucher),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, { fontSize: "small" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Nutzung anzeigen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: () => showVoucherUsage(voucher),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(ViewIcon, { fontSize: "small" })
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tooltip, { title: "Löschen", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                color: "error",
                onClick: () => deleteVoucher(voucher.id),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(DeleteIcon, { fontSize: "small" })
              }
            ) })
          ] }) })
        ] }, voucher.id)) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: createDialogOpen, onClose: () => setCreateDialogOpen(false), maxWidth: "md", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Neuen Gutschein erstellen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Name",
            fullWidth: true,
            value: voucherForm.name,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { name: e.target.value }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Code",
              fullWidth: true,
              value: voucherForm.code,
              onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { code: e.target.value }))
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              onClick: generateCode,
              sx: { minWidth: "120px" },
              children: "Generieren"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Typ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: voucherForm.type,
              label: "Typ",
              onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { type: e.target.value })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "betrag", children: "Betrag (€)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "prozent", children: "Prozent (%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "versandkosten", children: "Versandkosten" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: voucherForm.type === "prozent" ? "Prozentsatz" : "Betrag",
            type: "number",
            fullWidth: true,
            value: voucherForm.nominal,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { nominal: Number(e.target.value) }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Verwendungslimit",
            type: "number",
            fullWidth: true,
            value: voucherForm.kuota,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { kuota: Number(e.target.value) }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Mindestbestellwert",
            type: "number",
            fullWidth: true,
            value: voucherForm.minimal_buying,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { minimal_buying: Number(e.target.value) }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Gültig ab",
              type: "date",
              fullWidth: true,
              value: voucherForm.start_date,
              onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { start_date: e.target.value })),
              InputLabelProps: { shrink: true }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Gültig bis",
              type: "date",
              fullWidth: true,
              value: voucherForm.expired,
              onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { expired: e.target.value })),
              InputLabelProps: { shrink: true }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormControlLabel,
          {
            control: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: voucherForm.is_active,
                onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { is_active: e.target.checked }))
              }
            ),
            label: "Aktiv"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCreateDialogOpen(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createVoucher, variant: "contained", children: "Erstellen" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: editDialogOpen, onClose: () => setEditDialogOpen(false), maxWidth: "md", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Gutschein bearbeiten" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "space-y-4 pt-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Name",
            fullWidth: true,
            value: voucherForm.name,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { name: e.target.value }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Code",
            fullWidth: true,
            value: voucherForm.code,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { code: e.target.value }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Typ" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Select,
            {
              value: voucherForm.type,
              label: "Typ",
              onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { type: e.target.value })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "betrag", children: "Betrag (€)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "prozent", children: "Prozent (%)" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "versandkosten", children: "Versandkosten" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: voucherForm.type === "prozent" ? "Prozentsatz" : "Betrag",
            type: "number",
            fullWidth: true,
            value: voucherForm.nominal,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { nominal: Number(e.target.value) }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Verwendungslimit",
            type: "number",
            fullWidth: true,
            value: voucherForm.kuota,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { kuota: Number(e.target.value) }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            label: "Mindestbestellwert",
            type: "number",
            fullWidth: true,
            value: voucherForm.minimal_buying,
            onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { minimal_buying: Number(e.target.value) }))
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Gültig ab",
              type: "date",
              fullWidth: true,
              value: voucherForm.start_date,
              onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { start_date: e.target.value })),
              InputLabelProps: { shrink: true }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Gültig bis",
              type: "date",
              fullWidth: true,
              value: voucherForm.expired,
              onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { expired: e.target.value })),
              InputLabelProps: { shrink: true }
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          FormControlLabel,
          {
            control: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: voucherForm.is_active,
                onChange: (e) => setVoucherForm((prev) => __spreadProps(__spreadValues({}, prev), { is_active: e.target.checked }))
              }
            ),
            label: "Aktiv"
          }
        )
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setEditDialogOpen(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: updateVoucher, variant: "contained", children: "Speichern" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: usageDialogOpen, onClose: () => setUsageDialogOpen(false), maxWidth: "lg", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogTitle, { children: [
        "Gutschein-Nutzung: ",
        selectedVoucher == null ? void 0 : selectedVoucher.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Datum" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Transaktion" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Kunde" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Verwendeter Betrag" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: voucherUsage.map((usage) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: new Date(usage.used_at).toLocaleDateString("de-DE") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: usage.transaction_id }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: usage.customer_id || "Anonym" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(TableCell, { align: "right", children: [
            "€",
            usage.used_amount.toFixed(2)
          ] })
        ] }, usage.id)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogActions, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setUsageDialogOpen(false), children: "Schließen" }) })
    ] })
  ] });
};
export {
  BarcodeScanner as B,
  ErrorBoundary as E,
  Navigation as N,
  PreloadRouter as P,
  StockOpnameInterface as S,
  TabPanel as T,
  VoucherManagement as V,
  __vitePreload as _,
  PreloadIndicator as a,
  PreloadStatusDebug as b
};
//# sourceMappingURL=components-Dj2tQkqX.js.map
