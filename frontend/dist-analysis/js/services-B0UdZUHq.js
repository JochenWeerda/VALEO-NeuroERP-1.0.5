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
import { a as axios } from "./axios-BDGNVNQ7.js";
import { r as reactExports } from "./react-vendor-C09FwfLq.js";
const API_BASE_URL = "http://localhost:8000";
class AuthService {
  constructor() {
    __publicField(this, "tokenKey", "valeo_access_token");
    __publicField(this, "refreshTokenKey", "valeo_refresh_token");
  }
  login(credentials) {
    return __async(this, null, function* () {
      try {
        const response = yield axios.post(`${API_BASE_URL}/auth/login`, credentials);
        const data = response.data;
        localStorage.setItem(this.tokenKey, data.access_token);
        localStorage.setItem(this.refreshTokenKey, data.refresh_token);
        return data;
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }
  refreshToken() {
    return __async(this, null, function* () {
      try {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (!refreshToken) {
          throw new Error("Kein Refresh Token verfügbar");
        }
        const response = yield axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });
        const data = response.data;
        localStorage.setItem(this.tokenKey, data.access_token);
        localStorage.setItem(this.refreshTokenKey, data.refresh_token);
        return data;
      } catch (error) {
        this.logout();
        throw this.handleError(error);
      }
    });
  }
  logout() {
    return __async(this, null, function* () {
      try {
        const refreshToken = localStorage.getItem(this.refreshTokenKey);
        if (refreshToken) {
          yield axios.post(`${API_BASE_URL}/auth/logout`, {
            refresh_token: refreshToken
          });
        }
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.refreshTokenKey);
      }
    });
  }
  getCurrentUser() {
    return __async(this, null, function* () {
      try {
        const token = this.getAccessToken();
        const response = yield axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
      } catch (error) {
        throw this.handleError(error);
      }
    });
  }
  getAccessToken() {
    return localStorage.getItem(this.tokenKey);
  }
  isAuthenticated() {
    return !!this.getAccessToken();
  }
  handleError(error) {
    var _a, _b;
    if ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.detail) {
      return new Error(error.response.data.detail);
    }
    return new Error("Ein Fehler ist aufgetreten");
  }
}
const authService = new AuthService();
const CRITICAL_ROUTES = {
  "/dashboard": {
    priority: "critical",
    preloadTrigger: "immediate",
    estimatedSize: 45,
    loadTime: 120
  },
  "/streckengeschaeft": {
    priority: "high",
    preloadTrigger: "idle",
    dependencies: ["/dashboard"],
    estimatedSize: 78,
    loadTime: 200
  },
  "/pos": {
    priority: "high",
    preloadTrigger: "idle",
    dependencies: ["/dashboard"],
    estimatedSize: 92,
    loadTime: 250
  },
  "/lakasir-features": {
    priority: "medium",
    preloadTrigger: "hover",
    estimatedSize: 35,
    loadTime: 150
  },
  "/daily-report": {
    priority: "medium",
    preloadTrigger: "hover",
    dependencies: ["/pos"],
    estimatedSize: 28,
    loadTime: 100
  },
  "/e-invoicing": {
    priority: "medium",
    preloadTrigger: "network-idle",
    estimatedSize: 65,
    loadTime: 180
  },
  "/crm": {
    priority: "low",
    preloadTrigger: "intersection",
    estimatedSize: 120,
    loadTime: 300
  }
};
const lazyWithPreload = (importFunc, routeName, config) => {
  let Component = null;
  let loadingPromise = null;
  let loadStartTime = null;
  const loadComponent = () => __async(void 0, null, function* () {
    if (Component) return Component;
    if (loadingPromise) return loadingPromise;
    loadStartTime = performance.now();
    loadingPromise = importFunc().then((module) => {
      Component = module.default;
      const loadTime = performance.now() - (loadStartTime || 0);
      preloadService.recordPerformanceMetric({
        route: routeName,
        loadTime,
        bundleSize: 0,
        cacheHit: false,
        timestamp: Date.now()
      });
      return Component;
    });
    return loadingPromise;
  });
  const preload = () => {
    if (!Component && !loadingPromise) {
      loadComponent();
    }
  };
  const preloadWithPriority = (priority = "medium") => {
    if (!Component && !loadingPromise) {
      preloadService.queuePreload(routeName, priority, loadComponent);
    }
  };
  return {
    Component: reactExports.lazy(importFunc),
    preload,
    preloadWithPriority,
    isLoaded: () => Component !== null,
    routeName,
    config
  };
};
class PreloadService {
  constructor() {
    __publicField(this, "preloadedRoutes", /* @__PURE__ */ new Set());
    __publicField(this, "preloadQueue", []);
    __publicField(this, "performanceMetrics", []);
    __publicField(this, "isIdle", false);
    __publicField(this, "networkIdleTimer", null);
    __publicField(this, "bundleAnalysis", null);
    this.setupIdleDetection();
    this.setupIntersectionObserver();
    this.setupNetworkIdleDetection();
    this.setupPerformanceMonitoring();
  }
  // Bundle-Analyse generieren
  generateBundleAnalysis() {
    return __async(this, null, function* () {
      try {
        const response = yield fetch("/bundle-analysis.json");
        if (response.ok) {
          const data = yield response.json();
          this.bundleAnalysis = data;
          return data;
        }
      } catch (error) {
        console.warn("Bundle-Analyse nicht verfügbar:", error);
      }
      const totalSize = Object.values(CRITICAL_ROUTES).reduce(
        (sum, config) => sum + (config.estimatedSize || 0),
        0
      );
      this.bundleAnalysis = {
        totalSize,
        chunkCount: Object.keys(CRITICAL_ROUTES).length,
        largestChunks: Object.entries(CRITICAL_ROUTES).map(([route, config]) => ({
          name: route,
          size: config.estimatedSize || 0,
          percentage: (config.estimatedSize || 0) / totalSize * 100
        })).sort((a, b) => b.size - a.size).slice(0, 5),
        optimizationSuggestions: this.generateOptimizationSuggestions()
      };
      return this.bundleAnalysis;
    });
  }
  // Optimierungsvorschläge generieren
  generateOptimizationSuggestions() {
    var _a;
    const suggestions = [];
    if (this.bundleAnalysis) {
      const { totalSize, largestChunks } = this.bundleAnalysis;
      if (totalSize > 500) {
        suggestions.push("Bundle-Größe über 500KB - Code-Splitting empfohlen");
      }
      if (((_a = largestChunks[0]) == null ? void 0 : _a.percentage) > 30) {
        suggestions.push(`Chunk "${largestChunks[0].name}" macht ${largestChunks[0].percentage.toFixed(1)}% aus - Optimierung empfohlen`);
      }
      if (largestChunks.length > 3) {
        suggestions.push("Mehr als 3 große Chunks - Konsolidierung empfohlen");
      }
    }
    return suggestions;
  }
  // Performance-Metrik aufzeichnen
  recordPerformanceMetric(metric) {
    this.performanceMetrics.push(metric);
    if (this.performanceMetrics.length > 100) {
      this.performanceMetrics = this.performanceMetrics.slice(-100);
    }
    if (metric.loadTime > 1e3) {
      console.warn(`⚠️ Langsame Route: ${metric.route} (${metric.loadTime.toFixed(0)}ms)`);
    }
  }
  // Performance-Report generieren
  getPerformanceReport() {
    const avgLoadTime = this.performanceMetrics.length > 0 ? this.performanceMetrics.reduce((sum, m) => sum + m.loadTime, 0) / this.performanceMetrics.length : 0;
    const slowestRoutes = [...this.performanceMetrics].sort((a, b) => b.loadTime - a.loadTime).slice(0, 5);
    const cacheHitRate = this.performanceMetrics.length > 0 ? this.performanceMetrics.filter((m) => m.cacheHit).length / this.performanceMetrics.length * 100 : 0;
    return {
      averageLoadTime: avgLoadTime,
      slowestRoutes,
      totalPreloadedRoutes: this.preloadedRoutes.size,
      cacheHitRate
    };
  }
  // Preload mit Priorität in Queue einreihen
  queuePreload(route, priority, callback) {
    const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    const priorityValue = priorityMap[priority];
    this.preloadQueue.push({ route, priority: priorityValue, callback });
    this.preloadQueue.sort((a, b) => b.priority - a.priority);
    this.processQueue();
  }
  // Queue verarbeiten
  processQueue() {
    if (this.isIdle && this.preloadQueue.length > 0) {
      const item = this.preloadQueue.shift();
      if (item) {
        item.callback();
      }
    }
  }
  // Sofortiges Preloading für kritische Routen
  preloadCriticalRoutes() {
    Object.entries(CRITICAL_ROUTES).filter(([_, config]) => config.priority === "critical").forEach(([route]) => {
      this.preloadRoute(route);
    });
  }
  // Preloading basierend auf Konfiguration
  preloadRoute(route) {
    if (this.preloadedRoutes.has(route)) return;
    const config = CRITICAL_ROUTES[route];
    if (!config) return;
    switch (config.preloadTrigger) {
      case "immediate":
        this.executePreload(route);
        break;
      case "idle":
        this.queueForIdle(() => this.executePreload(route));
        break;
      case "network-idle":
        this.queueForNetworkIdle(() => this.executePreload(route));
        break;
      case "hover":
        this.setupHoverPreload(route);
        break;
      case "intersection":
        this.setupIntersectionPreload(route);
        break;
    }
  }
  // Abhängigkeiten preloaden
  preloadDependencies(route) {
    const config = CRITICAL_ROUTES[route];
    if (config == null ? void 0 : config.dependencies) {
      config.dependencies.forEach((dep) => this.preloadRoute(dep));
    }
  }
  // Preload basierend auf aktueller Route
  preloadBasedOnCurrentRoute(currentRoute) {
    const likelyNextRoutes = this.getLikelyNextRoutes(currentRoute);
    likelyNextRoutes.forEach((route) => this.preloadRoute(route));
  }
  // Wahrscheinliche nächste Routen basierend auf aktueller Route
  getLikelyNextRoutes(currentRoute) {
    const routeFlow = {
      "/dashboard": ["/streckengeschaeft", "/pos", "/lakasir-features"],
      "/streckengeschaeft": ["/pos", "/lakasir-features"],
      "/pos": ["/daily-report", "/dashboard"],
      "/lakasir-features": ["/dashboard", "/streckengeschaeft"],
      "/daily-report": ["/pos", "/dashboard"],
      "/e-invoicing": ["/dashboard", "/crm"],
      "/crm": ["/dashboard", "/e-invoicing"]
    };
    return routeFlow[currentRoute] || [];
  }
  // Preload ausführen
  executePreload(route) {
    var _a;
    if (this.preloadedRoutes.has(route)) return;
    const startTime = performance.now();
    console.log(`🔄 Preloading route: ${route}`);
    this.preloadedRoutes.add(route);
    this.recordPerformanceMetric({
      route,
      loadTime: performance.now() - startTime,
      bundleSize: ((_a = CRITICAL_ROUTES[route]) == null ? void 0 : _a.estimatedSize) || 0,
      preloadTime: performance.now() - startTime,
      cacheHit: false,
      timestamp: Date.now()
    });
  }
  // Queue für Idle-Zeit
  queueForIdle(callback) {
    if (this.isIdle) {
      callback();
    } else {
      this.preloadQueue.push({ route: "", priority: 1, callback });
    }
  }
  // Queue für Network-Idle
  queueForNetworkIdle(callback) {
    if (this.networkIdleTimer) {
      clearTimeout(this.networkIdleTimer);
    }
    this.networkIdleTimer = window.setTimeout(() => {
      callback();
    }, 1e3);
  }
  // Idle-Detection Setup
  setupIdleDetection() {
    if ("requestIdleCallback" in window) {
      const processQueue = () => {
        this.isIdle = true;
        this.processQueue();
        this.isIdle = false;
        requestIdleCallback(processQueue);
      };
      requestIdleCallback(processQueue);
    }
  }
  // Network-Idle Detection Setup
  setupNetworkIdleDetection() {
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      return originalFetch.apply(window, args);
    };
  }
  // Performance-Monitoring Setup
  setupPerformanceMonitoring() {
    if ("performance" in window) {
      window.addEventListener("load", () => {
        const navigation = performance.getEntriesByType("navigation")[0];
        if (navigation) {
          console.log(`📊 Page Load Time: ${navigation.loadEventEnd - navigation.loadEventStart}ms`);
        }
      });
    }
  }
  // Intersection Observer Setup
  setupIntersectionObserver() {
    if ("IntersectionObserver" in window) {
      console.log("🔍 Intersection Observer für Preloading eingerichtet");
    }
  }
  // Hover-Preloading Setup
  setupHoverPreload(route) {
    const links = document.querySelectorAll(`[data-route="${route}"]`);
    links.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        this.executePreload(route);
      });
    });
  }
  // Intersection-Preloading Setup
  setupIntersectionPreload(route) {
    const links = document.querySelectorAll(`[data-route="${route}"]`);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.executePreload(route);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    links.forEach((link) => observer.observe(link));
  }
  // Preload-Status abrufen
  getPreloadStatus() {
    const status = {};
    Object.keys(CRITICAL_ROUTES).forEach((route) => {
      status[route] = this.preloadedRoutes.has(route);
    });
    return status;
  }
  // Alle Routen preloaden
  preloadAllRoutes() {
    Object.keys(CRITICAL_ROUTES).forEach((route) => {
      this.preloadRoute(route);
    });
  }
  // Bundle-Analyse abrufen
  getBundleAnalysis() {
    return this.bundleAnalysis;
  }
  // Service-Status abrufen
  getServiceStatus() {
    return {
      preloadedRoutes: this.preloadedRoutes.size,
      queueLength: this.preloadQueue.length,
      isIdle: this.isIdle,
      performanceMetrics: this.performanceMetrics.length
    };
  }
}
const preloadService = new PreloadService();
const mockInvoices = [
  {
    id: "1",
    invoiceId: "INV-2024-001",
    customerName: "Max Mustermann GmbH",
    customerEmail: "max@mustermann.de",
    amount: 1250,
    status: "paid",
    createdAt: "2024-01-15T10:30:00Z",
    dueDate: "2024-02-15T00:00:00Z",
    taxAmount: 237.5,
    totalAmount: 1487.5,
    currency: "EUR",
    description: "Webdesign und Entwicklung",
    items: [
      {
        id: "1",
        name: "Webdesign",
        quantity: 1,
        unitPrice: 800,
        totalPrice: 800,
        taxRate: 19,
        taxAmount: 152
      },
      {
        id: "2",
        name: "Entwicklung",
        quantity: 10,
        unitPrice: 45,
        totalPrice: 450,
        taxRate: 19,
        taxAmount: 85.5
      }
    ]
  },
  {
    id: "2",
    invoiceId: "INV-2024-002",
    customerName: "Anna Schmidt e.K.",
    customerEmail: "anna@schmidt.de",
    amount: 850,
    status: "open",
    createdAt: "2024-01-20T14:15:00Z",
    dueDate: "2024-02-20T00:00:00Z",
    taxAmount: 161.5,
    totalAmount: 1011.5,
    currency: "EUR",
    description: "Marketing Beratung",
    items: [
      {
        id: "3",
        name: "Marketing Beratung",
        quantity: 8,
        unitPrice: 106.25,
        totalPrice: 850,
        taxRate: 19,
        taxAmount: 161.5
      }
    ]
  },
  {
    id: "3",
    invoiceId: "INV-2024-003",
    customerName: "Tech Solutions AG",
    customerEmail: "info@techsolutions.de",
    amount: 2200,
    status: "overdue",
    createdAt: "2024-01-10T09:00:00Z",
    dueDate: "2024-02-10T00:00:00Z",
    taxAmount: 418,
    totalAmount: 2618,
    currency: "EUR",
    description: "Software-Entwicklung",
    items: [
      {
        id: "4",
        name: "Software-Entwicklung",
        quantity: 20,
        unitPrice: 110,
        totalPrice: 2200,
        taxRate: 19,
        taxAmount: 418
      }
    ]
  }
];
class EInvoicingApi {
  /**
   * Lädt alle Rechnungen basierend auf den Filtern
   */
  static getInvoices(filter) {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 500));
      let filteredInvoices = [...mockInvoices];
      if (filter.status) {
        filteredInvoices = filteredInvoices.filter((invoice) => invoice.status === filter.status);
      }
      if (filter.startDate && filter.endDate) {
        filteredInvoices = filteredInvoices.filter((invoice) => {
          const invoiceDate = new Date(invoice.createdAt);
          const startDate = new Date(filter.startDate);
          const endDate = new Date(filter.endDate);
          return invoiceDate >= startDate && invoiceDate <= endDate;
        });
      }
      if (filter.searchTerm) {
        const searchTerm = filter.searchTerm.toLowerCase();
        filteredInvoices = filteredInvoices.filter(
          (invoice) => {
            var _a;
            return invoice.customerName.toLowerCase().includes(searchTerm) || invoice.invoiceId.toLowerCase().includes(searchTerm) || ((_a = invoice.description) == null ? void 0 : _a.toLowerCase().includes(searchTerm));
          }
        );
      }
      if (filter.minAmount) {
        filteredInvoices = filteredInvoices.filter((invoice) => invoice.amount >= filter.minAmount);
      }
      if (filter.maxAmount) {
        filteredInvoices = filteredInvoices.filter((invoice) => invoice.amount <= filter.maxAmount);
      }
      return filteredInvoices;
    });
  }
  /**
   * Lädt eine einzelne Rechnung
   */
  static getInvoice(id) {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 300));
      return mockInvoices.find((invoice) => invoice.id === id) || null;
    });
  }
  /**
   * Erstellt eine neue Rechnung
   */
  static createInvoice(invoiceData) {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 1e3));
      const newInvoice = {
        id: Date.now().toString(),
        invoiceId: `INV-2024-${String(mockInvoices.length + 1).padStart(3, "0")}`,
        customerName: invoiceData.customerName || "",
        customerEmail: invoiceData.customerEmail || "",
        amount: invoiceData.amount || 0,
        status: "open",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3).toISOString(),
        taxAmount: invoiceData.taxAmount || 0,
        totalAmount: invoiceData.totalAmount || 0,
        currency: invoiceData.currency || "EUR",
        description: invoiceData.description || "",
        items: invoiceData.items || []
      };
      mockInvoices.push(newInvoice);
      return newInvoice;
    });
  }
  /**
   * Aktualisiert eine Rechnung
   */
  static updateInvoice(id, invoiceData) {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 800));
      const index = mockInvoices.findIndex((invoice) => invoice.id === id);
      if (index === -1) {
        throw new Error("Rechnung nicht gefunden");
      }
      mockInvoices[index] = __spreadValues(__spreadValues({}, mockInvoices[index]), invoiceData);
      return mockInvoices[index];
    });
  }
  /**
   * Löscht eine Rechnung
   */
  static deleteInvoice(id) {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 500));
      const index = mockInvoices.findIndex((invoice) => invoice.id === id);
      if (index === -1) {
        throw new Error("Rechnung nicht gefunden");
      }
      mockInvoices.splice(index, 1);
    });
  }
  /**
   * Lädt eine Rechnung als PDF herunter
   */
  static downloadInvoice(id) {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 1e3));
      const invoice = mockInvoices.find((inv) => inv.id === id);
      if (!invoice) {
        throw new Error("Rechnung nicht gefunden");
      }
      const pdfContent = `
      Rechnung ${invoice.invoiceId}
      
      Kunde: ${invoice.customerName}
      E-Mail: ${invoice.customerEmail}
      
      Betrag: ${invoice.totalAmount} ${invoice.currency}
      Status: ${invoice.status}
      
      Erstellt: ${invoice.createdAt}
      Fällig: ${invoice.dueDate}
    `;
      return new Blob([pdfContent], { type: "application/pdf" });
    });
  }
  /**
   * Sendet eine Rechnung per E-Mail
   */
  static sendInvoice(id, email) {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 1500));
      const invoice = mockInvoices.find((inv) => inv.id === id);
      if (!invoice) {
        throw new Error("Rechnung nicht gefunden");
      }
      console.log(`Rechnung ${invoice.invoiceId} wurde an ${email || invoice.customerEmail} gesendet`);
    });
  }
  /**
   * Markiert eine Rechnung als bezahlt
   */
  static markAsPaid(id) {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 600));
      const index = mockInvoices.findIndex((invoice) => invoice.id === id);
      if (index === -1) {
        throw new Error("Rechnung nicht gefunden");
      }
      mockInvoices[index].status = "paid";
      return mockInvoices[index];
    });
  }
  /**
   * Lädt Statistiken
   */
  static getStatistics() {
    return __async(this, null, function* () {
      yield new Promise((resolve) => setTimeout(resolve, 400));
      const totalInvoices = mockInvoices.length;
      const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
      const paidInvoices = mockInvoices.filter((inv) => inv.status === "paid").length;
      const openInvoices = mockInvoices.filter((inv) => inv.status === "open").length;
      const overdueInvoices = mockInvoices.filter((inv) => inv.status === "overdue").length;
      return {
        totalInvoices,
        totalAmount,
        paidInvoices,
        openInvoices,
        overdueInvoices,
        averageAmount: totalInvoices > 0 ? totalAmount / totalInvoices : 0
      };
    });
  }
}
export {
  EInvoicingApi as E,
  authService as a,
  lazyWithPreload as l,
  preloadService as p
};
//# sourceMappingURL=services-B0UdZUHq.js.map
