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
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-C09FwfLq.js";
import { B as Box, T as Typography, A as Alert, G as Grid, C as Card, a as CardContent, b as TextField, F as FormControl, w as InputLabel, S as Select, M as MenuItem, d as CircularProgress, p as Chip, I as IconButton, z as Divider, c as Button, r as Dialog, s as DialogTitle, t as DialogContent, v as DialogActions, j as TableContainer, P as Paper, k as Table, l as TableHead, m as TableRow, n as TableCell, o as TableBody, J as Container, K as Tabs, N as Tab } from "./mui-material-B4Zm8Ctl.js";
import { K as SearchIcon, N as CartIcon, O as ClearIcon, U as RemoveIcon, V as VoucherIcon, z as PaymentIcon, r as AssessmentIcon, X as DownloadIcon, a as Receipt, Y as EuroIcon, T as TrendingUp, d as CheckCircleIcon, Q as QrCodeIcon, I as InventoryIcon } from "./mui-icons-CGIi46zQ.js";
import { B as BarcodeScanner, S as StockOpnameInterface, V as VoucherManagement } from "./components-Dj2tQkqX.js";
const POSPage = () => {
  const [products, setProducts] = reactExports.useState([]);
  const [cart, setCart] = reactExports.useState([]);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [selectedCategory, setSelectedCategory] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = reactExports.useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = reactExports.useState("bar");
  const [paymentMethods, setPaymentMethods] = reactExports.useState([]);
  const [discountDialogOpen, setDiscountDialogOpen] = reactExports.useState(false);
  const [discountPercent, setDiscountPercent] = reactExports.useState(0);
  reactExports.useEffect(() => {
    loadProducts();
    loadPaymentMethods();
  }, []);
  const loadProducts = () => __async(void 0, null, function* () {
    try {
      setLoading(true);
      const response = yield fetch("/api/pos/products");
      if (response.ok) {
        const data = yield response.json();
        setProducts(data);
      } else {
        setError("Fehler beim Laden der Produkte");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    } finally {
      setLoading(false);
    }
  });
  const loadPaymentMethods = () => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/pos/payment-methods");
      if (response.ok) {
        const data = yield response.json();
        setPaymentMethods(data.payment_methods);
      }
    } catch (err) {
      console.error("Fehler beim Laden der Zahlungsarten:", err);
    }
  });
  const addToCart = (product, quantity = 1) => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/pos/cart/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          artikel_nr: product.artikel_nr,
          menge: quantity
        })
      });
      if (response.ok) {
        const data = yield response.json();
        loadCart();
      } else {
        setError("Fehler beim Hinzufügen zum Warenkorb");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    }
  });
  const removeFromCart = (artikelNr, quantity) => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/pos/cart/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          artikel_nr: artikelNr,
          menge: quantity
        })
      });
      if (response.ok) {
        loadCart();
      } else {
        setError("Fehler beim Entfernen aus dem Warenkorb");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    }
  });
  const loadCart = () => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/pos/cart");
      if (response.ok) {
        const data = yield response.json();
        setCart(data.items);
      }
    } catch (err) {
      console.error("Fehler beim Laden des Warenkorbs:", err);
    }
  });
  const clearCart = () => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/pos/cart/clear", {
        method: "POST"
      });
      if (response.ok) {
        setCart([]);
      } else {
        setError("Fehler beim Leeren des Warenkorbs");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    }
  });
  const applyDiscount = () => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/pos/cart/discount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          rabatt_prozent: discountPercent
        })
      });
      if (response.ok) {
        loadCart();
        setDiscountDialogOpen(false);
        setDiscountPercent(0);
      } else {
        setError("Fehler beim Anwenden des Rabatts");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    }
  });
  const createSale = () => __async(void 0, null, function* () {
    try {
      const response = yield fetch("/api/pos/sale/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          zahlungsart: selectedPaymentMethod
        })
      });
      if (response.ok) {
        const data = yield response.json();
        setPaymentDialogOpen(false);
        setCart([]);
        alert("Verkauf erfolgreich abgeschlossen!");
      } else {
        setError("Fehler beim Erstellen der Verkaufstransaktion");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    }
  });
  const getCartTotal = () => {
    const netto = cart.reduce((sum, item) => sum + item.gesamtpreis_netto, 0);
    const brutto = cart.reduce((sum, item) => sum + item.gesamtpreis_brutto, 0);
    const mwst = cart.reduce((sum, item) => sum + item.mwst_betrag, 0);
    return { netto, brutto, mwst, anzahl: cart.length };
  };
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.bezeichnung.toLowerCase().includes(searchTerm.toLowerCase()) || product.artikel_nr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.kategorie === selectedCategory;
    return matchesSearch && matchesCategory && product.aktiv;
  });
  const categories = [...new Set(products.map((p) => p.kategorie).filter(Boolean))];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3, height: "100vh", display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", gutterBottom: true, children: "VALEO NeuroERP - Kassensystem" }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { flex: 1, minHeight: 0 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%", display: "flex", flexDirection: "column" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              placeholder: "Artikel suchen...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              InputProps: {
                startAdornment: /* @__PURE__ */ jsxRuntimeExports.jsx(SearchIcon, { sx: { mr: 1, color: "text.secondary" } })
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Kategorie" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: selectedCategory,
                onChange: (e) => setSelectedCategory(e.target.value),
                label: "Kategorie",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: "", children: "Alle Kategorien" }),
                  categories.map((category) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: category, children: category }, category))
                ]
              }
            )
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1, overflow: "auto" }, children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: filteredProducts.map((product) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, sm: 4, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          Card,
          {
            sx: {
              cursor: "pointer",
              "&:hover": { boxShadow: 3 },
              height: "100%",
              display: "flex",
              flexDirection: "column"
            },
            onClick: () => addToCart(product),
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { flex: 1, display: "flex", flexDirection: "column" }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", noWrap: true, children: product.bezeichnung }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mb: 1 }, children: product.kurztext }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", color: "primary", sx: { mt: "auto" }, children: [
                product.verkaufspreis_brutto.toFixed(2),
                "€"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
                product.artikel_nr,
                " • ",
                product.einheit
              ] }),
              product.lagerbestand <= 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: "Nicht verfügbar",
                  color: "error",
                  size: "small",
                  sx: { mt: 1 }
                }
              )
            ] })
          }
        ) }, product.artikel_nr)) }) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { height: "100%", display: "flex", flexDirection: "column" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { flex: 1, display: "flex", flexDirection: "column" }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center", mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CartIcon, { sx: { mr: 1 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Warenkorb" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { ml: "auto" }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(IconButton, { onClick: clearCart, size: "small", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ClearIcon, {}) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { flex: 1, overflow: "auto", mb: 2 }, children: cart.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { color: "text.secondary", align: "center", children: "Warenkorb ist leer" }) : cart.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { mb: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { sx: { py: 1 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { flex: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", noWrap: true, children: item.bezeichnung }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", color: "text.secondary", children: [
              item.menge,
              " ",
              item.einheit,
              " x ",
              item.einzelpreis_brutto.toFixed(2),
              "€"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", alignItems: "center" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle2", sx: { mr: 1 }, children: [
              item.gesamtpreis_brutto.toFixed(2),
              "€"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              IconButton,
              {
                size: "small",
                onClick: () => removeFromCart(item.artikel_nr),
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(RemoveIcon, {})
              }
            )
          ] })
        ] }) }) }, item.artikel_nr)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { mb: 2 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 2 }, children: (() => {
          const total = getCartTotal();
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "Zwischensumme:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
                total.netto.toFixed(2),
                "€"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 1 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { children: "MwSt.:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { children: [
                total.mwst.toFixed(2),
                "€"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", mb: 2 }, children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: "Gesamt:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", children: [
                total.brutto.toFixed(2),
                "€"
              ] })
            ] })
          ] });
        })() }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", flexDirection: "column", gap: 1 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "outlined",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(VoucherIcon, {}),
              onClick: () => setDiscountDialogOpen(true),
              disabled: cart.length === 0,
              fullWidth: true,
              children: "Rabatt"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              variant: "contained",
              startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, {}),
              onClick: () => setPaymentDialogOpen(true),
              disabled: cart.length === 0,
              fullWidth: true,
              size: "large",
              children: [
                "Bezahlen (",
                getCartTotal().brutto.toFixed(2),
                "€)"
              ]
            }
          )
        ] })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: paymentDialogOpen, onClose: () => setPaymentDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Zahlung abschließen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { mb: 2 }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", gutterBottom: true, children: [
          "Gesamtbetrag: ",
          getCartTotal().brutto.toFixed(2),
          "€"
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(FormControl, { fullWidth: true, sx: { mb: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(InputLabel, { children: "Zahlungsart" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Select,
            {
              value: selectedPaymentMethod,
              onChange: (e) => setSelectedPaymentMethod(e.target.value),
              label: "Zahlungsart",
              children: paymentMethods.map((method) => /* @__PURE__ */ jsxRuntimeExports.jsx(MenuItem, { value: method.value, children: method.label }, method.value))
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setPaymentDialogOpen(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createSale, variant: "contained", children: "Verkauf abschließen" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: discountDialogOpen, onClose: () => setDiscountDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Rabatt anwenden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          label: "Rabatt in Prozent",
          type: "number",
          value: discountPercent,
          onChange: (e) => setDiscountPercent(Number(e.target.value)),
          inputProps: { min: 0, max: 100, step: 0.1 },
          sx: { mt: 1 }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setDiscountDialogOpen(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: applyDiscount, variant: "contained", children: "Rabatt anwenden" })
      ] })
    ] })
  ] });
};
const POSPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: POSPage
}, Symbol.toStringTag, { value: "Module" }));
const DailyReportPage = () => {
  const [dailyReport, setDailyReport] = reactExports.useState(null);
  const [sales, setSales] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [error, setError] = reactExports.useState(null);
  const [createReportDialogOpen, setCreateReportDialogOpen] = reactExports.useState(false);
  const [exportFibuDialogOpen, setExportFibuDialogOpen] = reactExports.useState(false);
  const [kasseId, setKasseId] = reactExports.useState("");
  const [selectedDate, setSelectedDate] = reactExports.useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  reactExports.useEffect(() => {
    loadSales();
  }, []);
  const loadSales = () => __async(void 0, null, function* () {
    try {
      setLoading(true);
      const response = yield fetch("/api/pos/sales");
      if (response.ok) {
        const data = yield response.json();
        setSales(data.sales);
      } else {
        setError("Fehler beim Laden der Verkäufe");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    } finally {
      setLoading(false);
    }
  });
  const createDailyReport = () => __async(void 0, null, function* () {
    try {
      setLoading(true);
      const response = yield fetch("/api/pos/daily-report/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          kasse_id: kasseId
        })
      });
      if (response.ok) {
        const data = yield response.json();
        setDailyReport(data.daily_report);
        setCreateReportDialogOpen(false);
        setKasseId("");
      } else {
        setError("Fehler beim Erstellen des Tagesjournals");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    } finally {
      setLoading(false);
    }
  });
  const exportToFibu = () => __async(void 0, null, function* () {
    try {
      setLoading(true);
      const response = yield fetch("/api/pos/daily-report/export-fibu", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          datum: selectedDate
        })
      });
      if (response.ok) {
        setExportFibuDialogOpen(false);
        alert("Tagesjournal erfolgreich in FIBU exportiert!");
      } else {
        setError("Fehler beim FIBU-Export");
      }
    } catch (err) {
      setError("Verbindungsfehler");
    } finally {
      setLoading(false);
    }
  });
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR"
    }).format(amount);
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("de-DE");
  };
  const getPaymentMethodColor = (method) => {
    const colors = {
      "bar": "success",
      "ec_karte": "primary",
      "kreditkarte": "secondary",
      "paypal": "warning",
      "klarna": "error"
    };
    return colors[method] || "default";
  };
  const getPaymentMethodLabel = (method) => {
    const labels = {
      "bar": "Bar",
      "ec_karte": "EC-Karte",
      "kreditkarte": "Kreditkarte",
      "paypal": "PayPal",
      "klarna": "Klarna",
      "ueberweisung": "Überweisung",
      "rechnung": "Rechnung"
    };
    return labels[method] || method;
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { p: 3 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", children: "Tagesjournal - Kassensystem" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { display: "flex", gap: 2 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "contained",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(AssessmentIcon, {}),
            onClick: () => setCreateReportDialogOpen(true),
            children: "Tagesjournal erstellen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outlined",
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(DownloadIcon, {}),
            onClick: () => setExportFibuDialogOpen(true),
            disabled: !dailyReport,
            children: "FIBU Export"
          }
        )
      ] })
    ] }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, onClose: () => setError(null), children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      dailyReport && /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", gutterBottom: true, children: [
          "Tagesjournal vom ",
          formatDate(dailyReport.datum)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, sx: { mt: 2 }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", p: 2, bgcolor: "primary.light", borderRadius: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { sx: { fontSize: 40, color: "white", mb: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "white", children: dailyReport.anzahl_belege }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "white", children: "Belege" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", p: 2, bgcolor: "success.light", borderRadius: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(EuroIcon, { sx: { fontSize: 40, color: "white", mb: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "white", children: formatCurrency(dailyReport.gesamt_umsatz_brutto) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "white", children: "Umsatz (Brutto)" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", p: 2, bgcolor: "info.light", borderRadius: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { sx: { fontSize: 40, color: "white", mb: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "white", children: formatCurrency(dailyReport.gesamt_umsatz_netto) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "white", children: "Umsatz (Netto)" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { textAlign: "center", p: 2, bgcolor: "warning.light", borderRadius: 1 }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PaymentIcon, { sx: { fontSize: 40, color: "white", mb: 1 } }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", color: "white", children: formatCurrency(dailyReport.mwst_gesamt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "white", children: "Umsatzsteuer" })
          ] }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 3 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Zahlungsarten" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: Object.entries(dailyReport.zahlungsarten_aufschlüsselung).map(([method, amount]) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { textAlign: "center" }, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: getPaymentMethodLabel(method),
              color: getPaymentMethodColor(method),
              sx: { mb: 1 }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: formatCurrency(amount) })
        ] }) }) }, method)) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 3 } }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Kassenbestand" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Kassenbestand Anfang" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: formatCurrency(dailyReport.kassenbestand_anfang) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Kassenbestand Ende" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", children: formatCurrency(dailyReport.kassenbestand_ende) })
          ] }) }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { variant: "outlined", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle2", color: "text.secondary", children: "Differenz" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Typography,
              {
                variant: "h6",
                color: dailyReport.differenz >= 0 ? "success.main" : "error.main",
                children: formatCurrency(dailyReport.differenz)
              }
            )
          ] }) }) })
        ] }),
        dailyReport.tse_signaturen.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, { sx: { my: 3 } }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "h6", gutterBottom: true, children: [
            "TSE-Signaturen (",
            dailyReport.tse_signaturen.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", flexWrap: "wrap", gap: 1 }, children: dailyReport.tse_signaturen.map((signature, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: `TSE-${index + 1}`,
              variant: "outlined",
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, {})
            },
            index
          )) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", gutterBottom: true, children: "Verkäufe des Tages" }),
        loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { sx: { display: "flex", justifyContent: "center", p: 3 }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, {}) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(TableContainer, { component: Paper, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Table, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableHead, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Beleg-Nr" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Datum" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Kunde" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Artikel" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Netto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "MwSt." }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: "Brutto" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Zahlungsart" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: "Status" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(TableBody, { children: sales.map((sale) => /* @__PURE__ */ jsxRuntimeExports.jsxs(TableRow, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: sale.beleg_nr }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: formatDate(sale.verkaufsdatum) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: sale.kunde_name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: sale.anzahl_artikel }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: formatCurrency(sale.gesamt_netto) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: formatCurrency(sale.mwst_gesamt) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { align: "right", children: formatCurrency(sale.gesamt_brutto) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: getPaymentMethodLabel(sale.zahlungsart),
                color: getPaymentMethodColor(sale.zahlungsart),
                size: "small"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TableCell, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              Chip,
              {
                label: sale.status,
                color: sale.status === "abgeschlossen" ? "success" : "warning",
                size: "small"
              }
            ) })
          ] }, sale.beleg_nr)) })
        ] }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: createReportDialogOpen, onClose: () => setCreateReportDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "Tagesjournal erstellen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        TextField,
        {
          fullWidth: true,
          label: "Kasse ID",
          value: kasseId,
          onChange: (e) => setKasseId(e.target.value),
          sx: { mt: 1 },
          placeholder: "z.B. KASSE001"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setCreateReportDialogOpen(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: createDailyReport, variant: "contained", disabled: !kasseId, children: "Erstellen" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, { open: exportFibuDialogOpen, onClose: () => setExportFibuDialogOpen(false), maxWidth: "sm", fullWidth: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { children: "FIBU Export" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TextField,
          {
            fullWidth: true,
            label: "Datum",
            type: "date",
            value: selectedDate,
            onChange: (e) => setSelectedDate(e.target.value),
            sx: { mt: 1 },
            InputLabelProps: { shrink: true }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", sx: { mt: 2 }, children: "Das Tagesjournal wird in die Finanzbuchhaltung exportiert und die entsprechenden Buchungssätze erstellt." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogActions, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: () => setExportFibuDialogOpen(false), children: "Abbrechen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: exportToFibu, variant: "contained", children: "Exportieren" })
      ] })
    ] })
  ] });
};
const DailyReportPage$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: DailyReportPage
}, Symbol.toStringTag, { value: "Module" }));
function TabPanel(props) {
  const _a = props, { children, value, index } = _a, other = __objRest(_a, ["children", "value", "index"]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    __spreadProps(__spreadValues({
      role: "tabpanel",
      hidden: value !== index,
      id: `lakasir-tabpanel-${index}`,
      "aria-labelledby": `lakasir-tab-${index}`
    }, other), {
      children: value === index && /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "py-4", children })
    })
  );
}
function a11yProps(index) {
  return {
    id: `lakasir-tab-${index}`,
    "aria-controls": `lakasir-tabpanel-${index}`
  };
}
const LakasirFeatures = () => {
  const [tabValue, setTabValue] = reactExports.useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "xl", className: "py-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "mb-2", children: "Lakasir Features - VALEO NeuroERP" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "textSecondary", children: "Erweiterte POS-Funktionen adaptiert von Lakasir" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "border-b border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Tabs,
      {
        value: tabValue,
        onChange: handleTabChange,
        "aria-label": "Lakasir Features Tabs",
        variant: "scrollable",
        scrollButtons: "auto",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tab,
            __spreadValues({
              label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(QrCodeIcon, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Barcode-Scanner" })
              ] })
            }, a11yProps(0))
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tab,
            __spreadValues({
              label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(InventoryIcon, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Inventur" })
              ] })
            }, a11yProps(1))
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Tab,
            __spreadValues({
              label: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(VoucherIcon, {}),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Gutscheine" })
              ] })
            }, a11yProps(2))
          )
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4", children: "Barcode-Scanner Integration" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "textSecondary", className: "mb-4", children: "Scannen Sie Barcodes direkt über die Webcam oder verbinden Sie einen externen Barcode-Scanner." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        BarcodeScanner,
        {
          onBarcodeDetected: (barcode) => {
            console.log("Barcode erkannt:", barcode);
          },
          onError: (error) => {
            console.error("Scanner-Fehler:", error);
          }
        }
      )
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(StockOpnameInterface, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(VoucherManagement, {}) })
  ] }) });
};
const LakasirFeatures$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  LakasirFeatures
}, Symbol.toStringTag, { value: "Module" }));
export {
  DailyReportPage$1 as D,
  LakasirFeatures$1 as L,
  POSPage$1 as P
};
//# sourceMappingURL=pos-system-D3uS3wb4.js.map
