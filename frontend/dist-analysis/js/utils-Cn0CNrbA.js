const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["js/neuroflow-DF58GYou.js","js/components-Dj2tQkqX.js","js/react-vendor-C09FwfLq.js","js/other-vendor-OscdKVAu.js","js/lodash-BQSKQrpq.js","js/mui-material-B4Zm8Ctl.js","js/mui-icons-CGIi46zQ.js","js/services-B0UdZUHq.js","js/axios-BDGNVNQ7.js","js/auth-Bv6CYr1e.js","js/hookform-resolvers-B3VX3b4X.js","js/validation-CXIZp7Zb.js","js/pos-system-D3uS3wb4.js"])))=>i.map(i=>d[i]);
var __defProp = Object.defineProperty;
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
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { _ as __vitePreload } from "./components-Dj2tQkqX.js";
import "./react-vendor-C09FwfLq.js";
class PreloadManager {
  constructor() {
    __publicField(this, "preloadedModules", /* @__PURE__ */ new Set());
    __publicField(this, "preloadQueue", /* @__PURE__ */ new Map());
    __publicField(this, "observers", /* @__PURE__ */ new Map());
  }
  /**
   * Registriert ein Modul für Preloading
   */
  registerModule(moduleName, importFn, config) {
    if (this.preloadedModules.has(moduleName)) {
      return;
    }
    this.preloadQueue.set(moduleName, importFn);
    switch (config.strategy) {
      case "immediate":
        this.preloadImmediate(moduleName, importFn);
        break;
      case "idle":
        this.preloadOnIdle(moduleName, importFn);
        break;
    }
  }
  /**
   * Sofortiges Preloading
   */
  preloadImmediate(moduleName, importFn) {
    importFn().then(() => {
      this.preloadedModules.add(moduleName);
      console.log(`🚀 ${moduleName} sofort vorgeladen`);
    }).catch((error) => {
      console.warn(`⚠️ Preloading fehlgeschlagen für ${moduleName}:`, error);
    });
  }
  /**
   * Preloading bei Browser-Idle
   */
  preloadOnIdle(moduleName, importFn) {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        this.preloadImmediate(moduleName, importFn);
      });
    } else {
      setTimeout(() => {
        this.preloadImmediate(moduleName, importFn);
      }, 1e3);
    }
  }
  /**
   * Preloading bei Hover über Element
   */
  preloadOnHover(element, moduleName) {
    const importFn = this.preloadQueue.get(moduleName);
    if (!importFn) return;
    const handleMouseEnter = () => {
      this.preloadImmediate(moduleName, importFn);
      element.removeEventListener("mouseenter", handleMouseEnter);
    };
    element.addEventListener("mouseenter", handleMouseEnter);
  }
  /**
   * Preloading bei Sichtbarkeit
   */
  preloadOnIntersection(element, moduleName) {
    const importFn = this.preloadQueue.get(moduleName);
    if (!importFn) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.preloadImmediate(moduleName, importFn);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(element);
    this.observers.set(moduleName, observer);
  }
  /**
   * Prüft ob Modul bereits vorgeladen wurde
   */
  isPreloaded(moduleName) {
    return this.preloadedModules.has(moduleName);
  }
  /**
   * Bereinigt Observer
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}
const preloadManager = new PreloadManager();
const CRITICAL_ROUTES = {
  DASHBOARD: {
    moduleName: "NeuroFlowDashboard",
    importFn: () => __vitePreload(() => import("./neuroflow-DF58GYou.js"), true ? __vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]) : void 0),
    config: { strategy: "immediate", priority: "high" }
  },
  POS_SYSTEM: {
    moduleName: "POSPage",
    importFn: () => __vitePreload(() => import("./pos-system-D3uS3wb4.js").then((n) => n.P), true ? __vite__mapDeps([12,2,3,4,5,6,1,7,8]) : void 0),
    config: { strategy: "idle", priority: "medium" }
  },
  LAKASIR_FEATURES: {
    moduleName: "LakasirFeatures",
    importFn: () => __vitePreload(() => import("./pos-system-D3uS3wb4.js").then((n) => n.L), true ? __vite__mapDeps([12,2,3,4,5,6,1,7,8]) : void 0),
    config: { strategy: "idle", priority: "medium" }
  }
};
const initializeCriticalPreloading = () => {
  Object.values(CRITICAL_ROUTES).forEach((route) => {
    preloadManager.registerModule(
      route.moduleName,
      route.importFn,
      route.config
    );
  });
  console.log("🚀 Kritische Routen für Preloading registriert");
};
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    preloadManager.cleanup();
  });
}
const formatCurrency = (amount, currency = "EUR", locale = "de-DE") => {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};
const formatDate = (date, locale = "de-DE", options) => {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date;
  const defaultOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  };
  return new Intl.DateTimeFormat(locale, __spreadValues(__spreadValues({}, defaultOptions), options)).format(dateObj);
};
const formatPercentage = (value, locale = "de-DE") => {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
export {
  formatDate as a,
  formatPercentage as b,
  formatCurrency as f,
  initializeCriticalPreloading as i
};
//# sourceMappingURL=utils-Cn0CNrbA.js.map
