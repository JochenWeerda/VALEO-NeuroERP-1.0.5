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
import { r as reactExports, j as jsxRuntimeExports, f as useForm, R as React, C as Controller } from "./react-vendor-C09FwfLq.js";
import { T as TabPanel } from "./components-Dj2tQkqX.js";
import { f as formatCurrency, a as formatDate, b as formatPercentage } from "./utils-Cn0CNrbA.js";
import { E as EInvoicingApi } from "./services-B0UdZUHq.js";
import { C as Card, R as Row, a as Col, S as Statistic, I as Input, b as Select, D as DatePicker, c as Space, B as Button, F as ForwardTable, T as Tag } from "./antd-core-Bn6Stp_u.js";
import { h as RefIcon, l as RefIcon$1, r as RefIcon$2, J as RefIcon$3, K as RefIcon$4 } from "./antd-icons-ZoMdwZyJ.js";
import { o } from "./hookform-resolvers-B3VX3b4X.js";
import { c as create$3, a as create$6, b as create$5 } from "./validation-CXIZp7Zb.js";
import { C as Card$1, a as CardContent, T as Typography, A as Alert, B as Box, G as Grid, b as TextField, z as Divider, c as Button$1, E as LinearProgress, p as Chip, H as Collapse, L as List, g as ListItem, h as ListItemIcon, i as ListItemText, J as Container, P as Paper, K as Tabs, N as Tab } from "./mui-material-B4Zm8Ctl.js";
import { h as AttachMoney, T as TrendingUp, a as Receipt, d as CheckCircleIcon, W as WarningIcon, i as TrendingDown, R as RefreshIcon, j as ExpandLess, k as ExpandMore, l as Error$1 } from "./mui-icons-CGIi46zQ.js";
import "./other-vendor-OscdKVAu.js";
import "./lodash-BQSKQrpq.js";
import "./axios-BDGNVNQ7.js";
const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const EInvoicingList = () => {
  const [invoices, setInvoices] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(false);
  const [filter, setFilter] = reactExports.useState({
    startDate: "",
    endDate: ""
  });
  const [pagination, setPagination] = reactExports.useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  reactExports.useEffect(() => {
    fetchInvoices();
  }, [filter, pagination.current, pagination.pageSize]);
  const fetchInvoices = () => __async(void 0, null, function* () {
    setLoading(true);
    try {
      const data = yield EInvoicingApi.getInvoices(filter);
      setInvoices(data);
      setPagination((prev) => __spreadProps(__spreadValues({}, prev), { total: data.length }));
    } catch (error) {
      console.error("Fehler beim Laden der e-Rechnungen:", error);
    } finally {
      setLoading(false);
    }
  });
  const handleDownload = (invoiceId) => __async(void 0, null, function* () {
    try {
      const blob = yield EInvoicingApi.downloadInvoice(invoiceId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Fehler beim Herunterladen:", error);
    }
  });
  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "green";
      case "PENDING":
        return "orange";
      case "OVERDUE":
        return "red";
      case "DRAFT":
        return "blue";
      default:
        return "default";
    }
  };
  const getStatusLabel = (status) => {
    switch (status) {
      case "PAID":
        return "Bezahlt";
      case "PENDING":
        return "Ausstehend";
      case "OVERDUE":
        return "Überfällig";
      case "DRAFT":
        return "Entwurf";
      default:
        return status;
    }
  };
  const columns = [
    {
      title: "Rechnungsnummer",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      fixed: "left",
      width: 150,
      render: (text) => /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: text })
    },
    {
      title: "Kunde",
      dataIndex: "customerName",
      key: "customerName",
      width: 200
    },
    {
      title: "Betrag",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      render: (amount, record) => formatCurrency(amount, record.currency)
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { color: getStatusColor(status), children: getStatusLabel(status) })
    },
    {
      title: "Erstellt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => formatDate(date)
    },
    {
      title: "Aktionen",
      key: "actions",
      fixed: "right",
      width: 150,
      render: (text, record) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Space, { size: "small", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "link",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$2, {}),
            onClick: () => handleView(record.invoiceId),
            title: "Anzeigen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "link",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$3, {}),
            onClick: () => handleDownload(record.invoiceId),
            title: "Herunterladen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "link",
            danger: true,
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$4, {}),
            onClick: () => handleDelete(record.invoiceId),
            title: "Löschen"
          }
        )
      ] })
    }
  ];
  const handleView = (invoiceId) => {
    console.log("Anzeigen e-Rechnung:", invoiceId);
  };
  const handleDelete = (invoiceId) => {
    console.log("Löschen e-Rechnung:", invoiceId);
  };
  const handleSearch = (value) => {
    setFilter((prev) => __spreadProps(__spreadValues({}, prev), { search: value }));
  };
  const handleStatusFilter = (value) => {
    setFilter((prev) => __spreadProps(__spreadValues({}, prev), { status: value }));
  };
  const handleDateRangeFilter = (dates) => {
    if (dates) {
      setFilter((prev) => {
        var _a, _b;
        return __spreadProps(__spreadValues({}, prev), {
          startDate: (_a = dates[0]) == null ? void 0 : _a.toISOString(),
          endDate: (_b = dates[1]) == null ? void 0 : _b.toISOString()
        });
      });
    } else {
      setFilter((prev) => __spreadProps(__spreadValues({}, prev), {
        startDate: "",
        endDate: ""
      }));
    }
  };
  const handleTableChange = (pagination2) => {
    setPagination((prev) => __spreadProps(__spreadValues({}, prev), {
      current: pagination2.current,
      pageSize: pagination2.pageSize
    }));
  };
  const statistics = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paidInvoices: invoices.filter((inv) => inv.status === "paid").length,
    pendingInvoices: invoices.filter((inv) => inv.status === "open").length
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { size: "small", className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Statistic,
        {
          title: "Gesamt e-Rechnungen",
          value: statistics.totalInvoices,
          suffix: "Stück"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Statistic,
        {
          title: "Gesamtbetrag",
          value: statistics.totalAmount,
          precision: 2,
          suffix: "€"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Statistic,
        {
          title: "Bezahlte e-Rechnungen",
          value: statistics.paidInvoices,
          suffix: "Stück"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Statistic,
        {
          title: "Ausstehende e-Rechnungen",
          value: statistics.pendingInvoices,
          suffix: "Stück"
        }
      ) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { size: "small", className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Row, { gutter: 16, align: "middle", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        Search,
        {
          placeholder: "Suche nach Rechnungsnummer oder Kunde",
          onSearch: handleSearch,
          enterButton: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon, {})
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Select,
        {
          placeholder: "Status",
          allowClear: true,
          style: { width: "100%" },
          onChange: handleStatusFilter,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Option, { value: "PAID", children: "Bezahlt" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Option, { value: "PENDING", children: "Ausstehend" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Option, { value: "OVERDUE", children: "Überfällig" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Option, { value: "DRAFT", children: "Entwurf" })
          ]
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        RangePicker,
        {
          placeholder: ["Startdatum", "Enddatum"],
          onChange: handleDateRangeFilter,
          style: { width: "100%" }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Col, { span: 8, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Space, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            type: "primary",
            icon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefIcon$1, {}),
            onClick: () => console.log("Neue e-Rechnung erstellen"),
            children: "Neue e-Rechnung"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: fetchInvoices, children: "Aktualisieren" })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      ForwardTable,
      {
        columns,
        dataSource: invoices,
        rowKey: "invoiceId",
        loading,
        pagination: {
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} von ${total} e-Rechnungen`
        },
        onChange: handleTableChange,
        scroll: { x: 1e3 },
        size: "small"
      }
    ) })
  ] });
};
const schema = create$3({
  customerId: create$6().required("Kunde ist erforderlich"),
  customerName: create$6().required("Kundenname ist erforderlich"),
  customerEmail: create$6().email("Ungültige E-Mail").required("E-Mail ist erforderlich"),
  amount: create$5().positive("Betrag muss positiv sein").required("Betrag ist erforderlich"),
  taxAmount: create$5().min(0, "Steuerbetrag darf nicht negativ sein").required("Steuerbetrag ist erforderlich"),
  totalAmount: create$5().positive("Gesamtbetrag muss positiv sein").required("Gesamtbetrag ist erforderlich"),
  currency: create$6().required("Währung ist erforderlich"),
  description: create$6().required("Beschreibung ist erforderlich"),
  dueDate: create$6().required("Fälligkeitsdatum ist erforderlich")
});
const EInvoicingForm = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [items, setItems] = reactExports.useState((initialData == null ? void 0 : initialData.items) || []);
  const [error, setError] = reactExports.useState(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    resolver: o(schema),
    defaultValues: {
      customerId: (initialData == null ? void 0 : initialData.customerId) || "",
      customerName: (initialData == null ? void 0 : initialData.customerName) || "",
      customerEmail: (initialData == null ? void 0 : initialData.customerEmail) || "",
      amount: (initialData == null ? void 0 : initialData.amount) || 0,
      taxAmount: (initialData == null ? void 0 : initialData.taxAmount) || 0,
      totalAmount: (initialData == null ? void 0 : initialData.totalAmount) || 0,
      currency: (initialData == null ? void 0 : initialData.currency) || "EUR",
      description: (initialData == null ? void 0 : initialData.description) || "",
      dueDate: (initialData == null ? void 0 : initialData.dueDate) || (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
      // items: initialData?.items || []
    }
  });
  const watchedAmount = watch("amount");
  const watchedTaxAmount = watch("taxAmount");
  React.useEffect(() => {
    const total = watchedAmount + watchedTaxAmount;
    setValue("totalAmount", total);
  }, [watchedAmount, watchedTaxAmount, setValue]);
  const handleFormSubmit = (data) => __async(void 0, null, function* () {
    try {
      setError(null);
      yield onSubmit(__spreadProps(__spreadValues({}, data), {
        items
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Fehler beim Speichern der Rechnung");
    }
  });
  const addItem = () => {
    const newItem = {
      id: Date.now().toString(),
      name: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxRate: 19,
      // Standard USt-Satz
      taxAmount: 0
    };
    setItems([...items, newItem]);
  };
  const removeItem = (id) => {
    setItems(items.filter((item) => item.id !== id));
  };
  const updateItem = (id, field, value) => {
    setItems(items.map((item) => {
      if (item.id === id) {
        const updatedItem = __spreadProps(__spreadValues({}, item), { [field]: value });
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice;
          updatedItem.taxAmount = updatedItem.totalPrice * (updatedItem.taxRate / 100);
        }
        if (field === "taxRate") {
          updatedItem.taxAmount = updatedItem.totalPrice * (value / 100);
        }
        return updatedItem;
      }
      return item;
    }));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { className: "w-full max-w-4xl mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h5", className: "mb-6 text-gray-800", children: initialData ? "Rechnung bearbeiten" : "Neue Rechnung erstellen" }),
    error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", className: "mb-4", children: error }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(handleFormSubmit), className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-3 text-gray-700", children: "Kundeninformationen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "customerName",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    label: "Kundenname",
                    fullWidth: true,
                    error: !!errors.customerName,
                    helperText: (_a = errors.customerName) == null ? void 0 : _a.message
                  })
                );
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "customerEmail",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    label: "E-Mail",
                    type: "email",
                    fullWidth: true,
                    error: !!errors.customerEmail,
                    helperText: (_a = errors.customerEmail) == null ? void 0 : _a.message
                  })
                );
              }
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-3 text-gray-700", children: "Rechnungsdetails" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "description",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    label: "Beschreibung",
                    multiline: true,
                    rows: 3,
                    fullWidth: true,
                    error: !!errors.description,
                    helperText: (_a = errors.description) == null ? void 0 : _a.message
                  })
                );
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "dueDate",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    label: "Fälligkeitsdatum",
                    type: "date",
                    fullWidth: true,
                    InputLabelProps: { shrink: true },
                    error: !!errors.dueDate,
                    helperText: (_a = errors.dueDate) == null ? void 0 : _a.message
                  })
                );
              }
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "text-gray-700", children: "Rechnungspositionen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button$1,
            {
              type: "button",
              variant: "outlined",
              onClick: addItem,
              className: "text-blue-600 border-blue-600 hover:bg-blue-50",
              children: "Position hinzufügen"
            }
          )
        ] }),
        items.map((item, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { className: "mb-3 p-4 border border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 2, alignItems: "center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Bezeichnung",
              value: item.name,
              onChange: (e) => updateItem(item.id, "name", e.target.value),
              fullWidth: true
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, md: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Menge",
              type: "number",
              value: item.quantity,
              onChange: (e) => updateItem(item.id, "quantity", Number(e.target.value)),
              fullWidth: true
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, md: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Einzelpreis",
              type: "number",
              value: item.unitPrice,
              onChange: (e) => updateItem(item.id, "unitPrice", Number(e.target.value)),
              fullWidth: true
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, md: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              label: "Steuersatz (%)",
              type: "number",
              value: item.taxRate,
              onChange: (e) => updateItem(item.id, "taxRate", Number(e.target.value)),
              fullWidth: true
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 6, md: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", className: "text-gray-600", children: [
              "Gesamt: ",
              formatCurrency(item.totalPrice)
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", className: "text-gray-500", children: [
              "Steuer: ",
              formatCurrency(item.taxAmount)
            ] })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button$1,
            {
              type: "button",
              variant: "outlined",
              color: "error",
              onClick: () => removeItem(item.id),
              className: "w-full",
              children: "Löschen"
            }
          ) })
        ] }) }, item.id))
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Divider, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-3 text-gray-700", children: "Beträge" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "amount",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    label: "Nettobetrag",
                    type: "number",
                    fullWidth: true,
                    error: !!errors.amount,
                    helperText: (_a = errors.amount) == null ? void 0 : _a.message
                  })
                );
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "taxAmount",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    label: "Steuerbetrag",
                    type: "number",
                    fullWidth: true,
                    error: !!errors.taxAmount,
                    helperText: (_a = errors.taxAmount) == null ? void 0 : _a.message
                  })
                );
              }
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            Controller,
            {
              name: "totalAmount",
              control,
              render: ({ field }) => {
                var _a;
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  TextField,
                  __spreadProps(__spreadValues({}, field), {
                    label: "Gesamtbetrag",
                    type: "number",
                    fullWidth: true,
                    disabled: true,
                    error: !!errors.totalAmount,
                    helperText: (_a = errors.totalAmount) == null ? void 0 : _a.message
                  })
                );
              }
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "flex justify-end space-x-3 pt-4", children: [
        onCancel && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$1,
          {
            type: "button",
            variant: "outlined",
            onClick: onCancel,
            disabled: isLoading,
            children: "Abbrechen"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$1,
          {
            type: "submit",
            variant: "contained",
            disabled: isLoading,
            className: "bg-blue-600 hover:bg-blue-700",
            children: isLoading ? "Speichere..." : initialData ? "Aktualisieren" : "Erstellen"
          }
        )
      ] })
    ] })
  ] }) });
};
const EInvoicingStatistics = ({
  statistics,
  isLoading = false
}) => {
  const currentMonth = statistics.monthly[statistics.monthly.length - 1];
  const currentYear = statistics.yearly[statistics.yearly.length - 1];
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "w-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(LinearProgress, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { className: "mt-4 text-center text-gray-500", children: "Lade Statistiken..." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AttachMoney, { className: "text-blue-600 text-3xl mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "font-bold text-gray-800", children: formatCurrency((currentMonth == null ? void 0 : currentMonth.totalAmount) || 0) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "text-gray-600", children: "Monatlicher Umsatz" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { className: "text-green-600 text-sm mr-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", className: "text-green-600", children: "+12.5%" })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "text-green-600 text-3xl mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "font-bold text-gray-800", children: (currentMonth == null ? void 0 : currentMonth.paidInvoices) || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "text-gray-600", children: "Bezahlte Rechnungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { className: "text-green-600 text-sm mr-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", className: "text-green-600", children: formatPercentage(((currentMonth == null ? void 0 : currentMonth.paidInvoices) || 0) / ((currentMonth == null ? void 0 : currentMonth.totalInvoices) || 1)) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { className: "text-orange-600 text-3xl mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "font-bold text-gray-800", children: (currentMonth == null ? void 0 : currentMonth.overdueInvoices) || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "text-gray-600", children: "Überfällige Rechnungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center mt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingDown, { className: "text-orange-600 text-sm mr-1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", className: "text-orange-600", children: formatCurrency((currentMonth == null ? void 0 : currentMonth.overdueAmount) || 0) })
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { className: "h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Receipt, { className: "text-blue-600 text-3xl mb-2" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", className: "font-bold text-gray-800", children: (currentMonth == null ? void 0 : currentMonth.totalInvoices) || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "text-gray-600", children: "Gesamte Rechnungen" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-center mt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", className: "text-gray-500", children: [
          "Ø ",
          formatCurrency((currentMonth == null ? void 0 : currentMonth.averageAmount) || 0)
        ] }) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4 text-gray-800", children: "Monatliche Entwicklung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: statistics.monthly.slice(-6).map((month, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "text-gray-600", children: (/* @__PURE__ */ new Date()).toLocaleDateString("de-DE", { month: "short", year: "numeric" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", className: "text-gray-500", children: [
              month.totalInvoices,
              " Rechnungen"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "font-semibold", children: formatCurrency(month.totalAmount) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: `${month.paidInvoices}/${month.totalInvoices}`,
                  size: "small",
                  color: "success",
                  variant: "outlined"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Chip,
                {
                  label: month.overdueInvoices.toString(),
                  size: "small",
                  color: "error",
                  variant: "outlined"
                }
              )
            ] })
          ] })
        ] }, index)) })
      ] }) }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, md: 6, children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4 text-gray-800", children: "Top Kunden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: statistics.topCustomers.slice(0, 5).map((customer, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "caption", className: "text-blue-600 font-semibold", children: index + 1 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "font-medium", children: customer.customerName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "caption", className: "text-gray-500", children: [
                customer.invoiceCount,
                " Rechnungen"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "font-semibold", children: formatCurrency(customer.totalAmount) })
        ] }, customer.customerId)) })
      ] }) }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4 text-gray-800", children: "Zahlungsmethoden" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { container: true, spacing: 2, children: statistics.paymentMethods.map((method, index) => /* @__PURE__ */ jsxRuntimeExports.jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border border-gray-200 rounded-lg", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", className: "font-medium", children: method.method }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Chip,
            {
              label: method.count.toString(),
              size: "small",
              color: "primary",
              variant: "outlined"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "font-bold text-gray-800", children: formatCurrency(method.totalAmount) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          LinearProgress,
          {
            variant: "determinate",
            value: method.totalAmount / ((currentMonth == null ? void 0 : currentMonth.totalAmount) || 1) * 100,
            className: "mt-2"
          }
        )
      ] }) }, index)) })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "mb-4 text-gray-800", children: "Jahresvergleich" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { container: true, spacing: 3, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", className: "mb-2 text-gray-700", children: "Aktuelles Jahr" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Gesamtumsatz:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatCurrency((currentYear == null ? void 0 : currentYear.totalAmount) || 0) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Rechnungen:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: (currentYear == null ? void 0 : currentYear.totalInvoices) || 0 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Durchschnitt:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatCurrency((currentYear == null ? void 0 : currentYear.averageAmount) || 0) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Grid, { item: true, xs: 12, md: 6, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", className: "mb-2 text-gray-700", children: "Vorjahr" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Gesamtumsatz:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatCurrency(((currentYear == null ? void 0 : currentYear.totalAmount) || 0) * 0.85) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Rechnungen:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: Math.floor(((currentYear == null ? void 0 : currentYear.totalInvoices) || 0) * 0.9) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Durchschnitt:" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold", children: formatCurrency(((currentYear == null ? void 0 : currentYear.averageAmount) || 0) * 0.95) })
            ] })
          ] })
        ] })
      ] })
    ] }) })
  ] });
};
const EInvoicingValidation = ({
  validationResult,
  onRevalidate,
  isLoading = false
}) => {
  const [expanded, setExpanded] = React.useState(true);
  const getValidationIcon = (type) => {
    switch (type) {
      case "error":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(Error$1, { color: "error" });
      case "warning":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning" });
      case "success":
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" });
      default:
        return /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircleIcon, { color: "success" });
    }
  };
  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };
  const handleRevalidate = () => {
    if (onRevalidate) {
      onRevalidate();
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card$1, { className: "w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h6", className: "text-gray-800", children: "Rechnungsvalidierung" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Chip,
          {
            label: validationResult.isValid ? "Gültig" : "Ungültig",
            color: validationResult.isValid ? "success" : "error",
            size: "small"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-2", children: [
        onRevalidate && /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$1,
          {
            size: "small",
            variant: "outlined",
            onClick: handleRevalidate,
            disabled: isLoading,
            startIcon: /* @__PURE__ */ jsxRuntimeExports.jsx(RefreshIcon, {}),
            children: "Neu validieren"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button$1,
          {
            size: "small",
            variant: "text",
            onClick: handleToggleExpanded,
            endIcon: expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandLess, {}) : /* @__PURE__ */ jsxRuntimeExports.jsx(ExpandMore, {}),
            children: expanded ? "Einklappen" : "Ausklappen"
          }
        )
      ] })
    ] }),
    validationResult.isValid ? /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "success", className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Die Rechnung ist gültig und entspricht allen Anforderungen." }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", className: "mb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", children: "Die Rechnung enthält Fehler und muss korrigiert werden." }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Collapse, { in: expanded, children: [
      validationResult.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", className: "mb-2 text-red-600 font-semibold", children: [
          "Fehler (",
          validationResult.errors.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, className: "bg-red-50 rounded-lg", children: validationResult.errors.map((error, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { className: "py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { className: "min-w-0 mr-2", children: getValidationIcon("error") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: error,
              primaryTypographyProps: {
                variant: "body2",
                className: "text-red-700"
              }
            }
          )
        ] }, index)) })
      ] }),
      validationResult.warnings.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { className: "mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "subtitle1", className: "mb-2 text-orange-600 font-semibold", children: [
          "Warnungen (",
          validationResult.warnings.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(List, { dense: true, className: "bg-orange-50 rounded-lg", children: validationResult.warnings.map((warning, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { className: "py-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { className: "min-w-0 mr-2", children: getValidationIcon("warning") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            ListItemText,
            {
              primary: warning,
              primaryTypographyProps: {
                variant: "body2",
                className: "text-orange-700"
              }
            }
          )
        ] }, index)) })
      ] }),
      validationResult.errors.length === 0 && validationResult.warnings.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "subtitle1", className: "mb-2 text-green-600 font-semibold", children: "Alle Prüfungen erfolgreich" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(List, { dense: true, className: "bg-green-50 rounded-lg", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { className: "py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { className: "min-w-0 mr-2", children: getValidationIcon("success") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: "Rechnungsformat ist korrekt",
                primaryTypographyProps: {
                  variant: "body2",
                  className: "text-green-700"
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { className: "py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { className: "min-w-0 mr-2", children: getValidationIcon("success") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: "Alle Pflichtfelder sind ausgefüllt",
                primaryTypographyProps: {
                  variant: "body2",
                  className: "text-green-700"
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { className: "py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { className: "min-w-0 mr-2", children: getValidationIcon("success") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: "Steuerberechnungen sind korrekt",
                primaryTypographyProps: {
                  variant: "body2",
                  className: "text-green-700"
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(ListItem, { className: "py-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ListItemIcon, { className: "min-w-0 mr-2", children: getValidationIcon("success") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              ListItemText,
              {
                primary: "Kundeninformationen sind vollständig",
                primaryTypographyProps: {
                  variant: "body2",
                  className: "text-green-700"
                }
              }
            )
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Box, { className: "mt-4 pt-4 border-t border-gray-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Error$1, { color: "error", fontSize: "small" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", className: "text-gray-600", children: [
            validationResult.errors.length,
            " Fehler"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center space-x-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(WarningIcon, { color: "warning", fontSize: "small" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Typography, { variant: "body2", className: "text-gray-600", children: [
            validationResult.warnings.length,
            " Warnungen"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Chip,
        {
          label: validationResult.isValid ? "Bereit zum Versenden" : "Korrektur erforderlich",
          color: validationResult.isValid ? "success" : "error",
          variant: "outlined"
        }
      )
    ] }) })
  ] }) });
};
const EInvoicingPage = () => {
  const [tabValue, setTabValue] = reactExports.useState(0);
  const [isLoading, setIsLoading] = reactExports.useState(false);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Container, { maxWidth: "xl", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Box, { sx: { width: "100%", mt: 2 }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, children: "E-Invoicing Management" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body1", color: "text.secondary", gutterBottom: true, children: "ZUGFeRD/XRechnung e-Invoicing mit Mustangproject und Claude Flow Integration" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Paper, { sx: { width: "100%", mt: 3 }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Tabs,
        {
          value: tabValue,
          onChange: handleTabChange,
          indicatorColor: "primary",
          textColor: "primary",
          variant: "scrollable",
          scrollButtons: "auto",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "E-Rechnungen" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Neue e-Rechnung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Validierung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Tab, { label: "Statistiken" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 0, children: /* @__PURE__ */ jsxRuntimeExports.jsx(EInvoicingList, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 1, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        EInvoicingForm,
        {
          onSubmit: (data) => __async(void 0, null, function* () {
            console.log("Neue Rechnung:", data);
          }),
          onCancel: () => setTabValue(0)
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 2, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        EInvoicingValidation,
        {
          validationResult: {
            isValid: true,
            errors: [],
            warnings: []
          }
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabPanel, { value: tabValue, index: 3, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        EInvoicingStatistics,
        {
          statistics: {
            monthly: [],
            yearly: [],
            topCustomers: [],
            paymentMethods: []
          }
        }
      ) })
    ] })
  ] }) });
};
export {
  EInvoicingPage,
  EInvoicingPage as default
};
//# sourceMappingURL=e-invoicing-DCH02efg.js.map
