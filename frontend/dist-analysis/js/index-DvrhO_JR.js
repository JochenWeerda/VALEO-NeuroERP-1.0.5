import { j as jsxRuntimeExports, D as client, R as React, Q as QueryClientProvider } from "./react-vendor-C09FwfLq.js";
import { cl as QueryClient } from "./other-vendor-OscdKVAu.js";
import { A as AuthProvider, u as useAuth } from "./auth-Bv6CYr1e.js";
import { E as ErrorBoundary, N as Navigation, P as PreloadRouter, a as PreloadIndicator, b as PreloadStatusDebug } from "./components-Dj2tQkqX.js";
import { Y as createTheme, Z as ThemeProvider, _ as CssBaseline, B as Box, d as CircularProgress } from "./mui-material-B4Zm8Ctl.js";
import { i as initializeCriticalPreloading } from "./utils-Cn0CNrbA.js";
import "./lodash-BQSKQrpq.js";
import "./services-B0UdZUHq.js";
import "./axios-BDGNVNQ7.js";
import "./mui-icons-CGIi46zQ.js";
(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
const LoadingSpinner = () => /* @__PURE__ */ jsxRuntimeExports.jsxs(
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "1.1rem", fontWeight: 500, marginBottom: "0.5rem" }, children: "VALEO NeuroERP lädt..." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { fontSize: "0.9rem", color: "#666" }, children: "Bitte warten Sie einen Moment" })
      ] })
    ]
  }
);
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
      light: "#42a5f5",
      dark: "#1565c0"
    },
    secondary: {
      main: "#dc004e",
      light: "#ff5983",
      dark: "#9a0036"
    },
    background: {
      default: "#f5f5f5",
      paper: "#ffffff"
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }
      }
    }
  }
});
const AppContent = () => {
  const { isAuthenticated, loading, logout } = useAuth();
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingSpinner, {});
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Navigation, { isAuthenticated, onLogout: logout }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PreloadRouter, { isAuthenticated }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PreloadIndicator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PreloadStatusDebug, {})
  ] });
};
function App() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorBoundary, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ThemeProvider, { theme, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(CssBaseline, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AuthProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppContent, {}) })
  ] }) });
}
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1e3
      // 5 Minuten
    },
    mutations: {
      retry: 1
    }
  }
});
initializeCriticalPreloading();
client.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxRuntimeExports.jsx(React.StrictMode, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(App, {}) }) })
);
//# sourceMappingURL=index-DvrhO_JR.js.map
