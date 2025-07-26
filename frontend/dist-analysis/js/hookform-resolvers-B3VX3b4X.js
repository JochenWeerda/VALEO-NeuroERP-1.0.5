import { g as get, s as set, h as appendErrors } from "./react-vendor-C09FwfLq.js";
import { p as parse, d as parseAsync, $ as $ZodError } from "./validation-CXIZp7Zb.js";
const r = (t2, r2, o2) => {
  if (t2 && "reportValidity" in t2) {
    const s2 = get(o2, r2);
    t2.setCustomValidity(s2 && s2.message || ""), t2.reportValidity();
  }
}, o$1 = (e, t2) => {
  for (const o2 in t2.fields) {
    const s2 = t2.fields[o2];
    s2 && s2.ref && "reportValidity" in s2.ref ? r(s2.ref, o2, e) : s2 && s2.refs && s2.refs.forEach((t3) => r(t3, o2, e));
  }
}, s$1 = (r2, s2) => {
  s2.shouldUseNativeValidation && o$1(r2, s2);
  const n2 = {};
  for (const o2 in r2) {
    const f = get(s2.fields, o2), c = Object.assign(r2[o2] || {}, { ref: f && f.ref });
    if (i$1(s2.names || Object.keys(r2), o2)) {
      const r3 = Object.assign({}, get(n2, o2));
      set(r3, "root", c), set(n2, o2, r3);
    } else set(n2, o2, c);
  }
  return n2;
}, i$1 = (e, t2) => {
  const r2 = n(t2);
  return e.some((e2) => n(e2).match(`^${r2}\\.\\d+`));
};
function n(e) {
  return e.replace(/\]|\[/g, "");
}
function t(r2, e) {
  try {
    var o2 = r2();
  } catch (r3) {
    return e(r3);
  }
  return o2 && o2.then ? o2.then(void 0, e) : o2;
}
function s(r2, e) {
  for (var n2 = {}; r2.length; ) {
    var t2 = r2[0], s2 = t2.code, i2 = t2.message, a2 = t2.path.join(".");
    if (!n2[a2]) if ("unionErrors" in t2) {
      var u = t2.unionErrors[0].errors[0];
      n2[a2] = { message: u.message, type: u.code };
    } else n2[a2] = { message: i2, type: s2 };
    if ("unionErrors" in t2 && t2.unionErrors.forEach(function(e2) {
      return e2.errors.forEach(function(e3) {
        return r2.push(e3);
      });
    }), e) {
      var c = n2[a2].types, f = c && c[t2.code];
      n2[a2] = appendErrors(a2, e, n2, s2, f ? [].concat(f, t2.message) : t2.message);
    }
    r2.shift();
  }
  return n2;
}
function i(r2, e) {
  for (var n2 = {}; r2.length; ) {
    var t2 = r2[0], s2 = t2.code, i2 = t2.message, a2 = t2.path.join(".");
    if (!n2[a2]) if ("invalid_union" === t2.code) {
      var u = t2.errors[0][0];
      n2[a2] = { message: u.message, type: u.code };
    } else n2[a2] = { message: i2, type: s2 };
    if ("invalid_union" === t2.code && t2.errors.forEach(function(e2) {
      return e2.forEach(function(e3) {
        return r2.push(e3);
      });
    }), e) {
      var c = n2[a2].types, f = c && c[t2.code];
      n2[a2] = appendErrors(a2, e, n2, s2, f ? [].concat(f, t2.message) : t2.message);
    }
    r2.shift();
  }
  return n2;
}
function a(o2, a2, u) {
  if (void 0 === u && (u = {}), function(r2) {
    return "_def" in r2 && "object" == typeof r2._def && "typeName" in r2._def;
  }(o2)) return function(n2, i2, c) {
    try {
      return Promise.resolve(t(function() {
        return Promise.resolve(o2["sync" === u.mode ? "parse" : "parseAsync"](n2, a2)).then(function(e) {
          return c.shouldUseNativeValidation && o$1({}, c), { errors: {}, values: u.raw ? Object.assign({}, n2) : e };
        });
      }, function(r2) {
        if (function(r3) {
          return Array.isArray(null == r3 ? void 0 : r3.issues);
        }(r2)) return { values: {}, errors: s$1(s(r2.errors, !c.shouldUseNativeValidation && "all" === c.criteriaMode), c) };
        throw r2;
      }));
    } catch (r2) {
      return Promise.reject(r2);
    }
  };
  if (function(r2) {
    return "_zod" in r2 && "object" == typeof r2._zod;
  }(o2)) return function(s2, c, f) {
    try {
      return Promise.resolve(t(function() {
        return Promise.resolve(("sync" === u.mode ? parse : parseAsync)(o2, s2, a2)).then(function(e) {
          return f.shouldUseNativeValidation && o$1({}, f), { errors: {}, values: u.raw ? Object.assign({}, s2) : e };
        });
      }, function(r2) {
        if (function(r3) {
          return r3 instanceof $ZodError;
        }(r2)) return { values: {}, errors: s$1(i(r2.issues, !f.shouldUseNativeValidation && "all" === f.criteriaMode), f) };
        throw r2;
      }));
    } catch (r2) {
      return Promise.reject(r2);
    }
  };
  throw new Error("Invalid input: not a Zod schema");
}
function o(o2, n2, s2) {
  return void 0 === s2 && (s2 = {}), function(a2, i2, c) {
    try {
      return Promise.resolve(function(t2, r2) {
        try {
          var u = (null != n2 && n2.context && false, Promise.resolve(o2["sync" === s2.mode ? "validateSync" : "validate"](a2, Object.assign({ abortEarly: false }, n2, { context: i2 }))).then(function(t3) {
            return c.shouldUseNativeValidation && o$1({}, c), { values: s2.raw ? Object.assign({}, a2) : t3, errors: {} };
          }));
        } catch (e2) {
          return r2(e2);
        }
        return u && u.then ? u.then(void 0, r2) : u;
      }(0, function(e2) {
        if (!e2.inner) throw e2;
        return { values: {}, errors: s$1((o3 = e2, n22 = !c.shouldUseNativeValidation && "all" === c.criteriaMode, (o3.inner || []).reduce(function(e3, t2) {
          if (e3[t2.path] || (e3[t2.path] = { message: t2.message, type: t2.type }), n22) {
            var o4 = e3[t2.path].types, s22 = o4 && o4[t2.type];
            e3[t2.path] = appendErrors(t2.path, n22, e3, t2.type, s22 ? [].concat(s22, t2.message) : t2.message);
          }
          return e3;
        }, {})), c) };
        var o3, n22;
      }));
    } catch (e2) {
      return Promise.reject(e2);
    }
  };
}
export {
  a,
  o
};
//# sourceMappingURL=hookform-resolvers-B3VX3b4X.js.map
