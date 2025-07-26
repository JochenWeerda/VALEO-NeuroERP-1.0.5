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
import { r as reactExports, j as jsxRuntimeExports } from "./react-vendor-C09FwfLq.js";
import { a as authService } from "./services-B0UdZUHq.js";
import { B as Box, C as Card, a as CardContent, T as Typography, A as Alert, b as TextField, c as Button, d as CircularProgress } from "./mui-material-B4Zm8Ctl.js";
const AuthContext = reactExports.createContext(void 0);
const useAuth = () => {
  const context = reactExports.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth muss innerhalb eines AuthProviders verwendet werden");
  }
  return context;
};
const AuthProvider = ({ children }) => {
  const [user, setUser] = reactExports.useState(null);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    const initializeAuth = () => __async(void 0, null, function* () {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = yield authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        yield authService.logout();
      } finally {
        setLoading(false);
      }
    });
    initializeAuth();
  }, []);
  const login = (credentials) => __async(void 0, null, function* () {
    setLoading(true);
    try {
      const response = yield authService.login(credentials);
      setUser(__spreadProps(__spreadValues({}, response.user), { disabled: false }));
    } finally {
      setLoading(false);
    }
  });
  const logout = () => __async(void 0, null, function* () {
    setLoading(true);
    try {
      yield authService.logout();
      setUser(null);
    } finally {
      setLoading(false);
    }
  });
  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuthContext.Provider, { value, children });
};
const LoginForm = () => {
  const [username, setUsername] = reactExports.useState("");
  const [password, setPassword] = reactExports.useState("");
  const [error, setError] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(false);
  const { login } = useAuth();
  const handleSubmit = (e) => __async(void 0, null, function* () {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      yield login({ username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Box,
    {
      sx: {
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "background.default",
        p: 2
      },
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { sx: { maxWidth: 400, width: "100%" }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { sx: { p: 4 }, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "h4", component: "h1", gutterBottom: true, align: "center", children: "VALEO NeuroERP" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Typography, { variant: "body2", color: "text.secondary", align: "center", sx: { mb: 3 }, children: "Anmelden" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, children: [
          error && /* @__PURE__ */ jsxRuntimeExports.jsx(Alert, { severity: "error", sx: { mb: 2 }, children: error }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Benutzername",
              value: username,
              onChange: (e) => setUsername(e.target.value),
              margin: "normal",
              required: true,
              disabled: loading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            TextField,
            {
              fullWidth: true,
              label: "Passwort",
              type: "password",
              value: password,
              onChange: (e) => setPassword(e.target.value),
              margin: "normal",
              required: true,
              disabled: loading
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              type: "submit",
              fullWidth: true,
              variant: "contained",
              size: "large",
              disabled: loading || !username || !password,
              sx: { mt: 3, mb: 2 },
              children: loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircularProgress, { size: 24 }) : "Anmelden"
            }
          )
        ] })
      ] }) })
    }
  );
};
const LoginForm$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: LoginForm
}, Symbol.toStringTag, { value: "Module" }));
export {
  AuthProvider as A,
  LoginForm$1 as L,
  useAuth as u
};
//# sourceMappingURL=auth-Bv6CYr1e.js.map
