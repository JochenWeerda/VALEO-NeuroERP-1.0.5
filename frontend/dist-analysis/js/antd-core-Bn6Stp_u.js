import { l as locale$2, a as locale$3, F as FastColor, g as generate, p as presetPrimaryColors, b as presetPalettes, c as createTheme, d as canUseDom, u as updateCSS, e as useCacheToken, f as unit, h as genStyleUtils, i as useStyleRegister, j as useMemo, k as isEqual, M as MotionProvider, S as StyleContext, m as merge, w as wrapperRaf, n as merge$1, K as Keyframe, N as Notify, o as classNames, q as useNotification, r as NotificationProvider, _ as _toConsumableArray, s as render, t as unmount, C as CSSMotion, v as composeRef, x as useEvent, y as supportRef, z as getNodeRef, A as isVisible, B as toArray$1, D as _createClass, E as _classCallCheck, G as Color, H as Collapse$2, I as omit, J as useComposeRef, L as useSafeState, O as FormProvider$1, P as pickAttrs, Q as DialogWrap, R as useMergedState, T as TypedSelect, U as Option, V as OptGroup, W as useLayoutEffect, X as Popup, Y as Tooltip$1, Z as Divider$1, $ as MenuItem$1, a0 as supportNodeRef, a1 as useFullPath, a2 as SubMenu$1, a3 as ExportMenu, a4 as MenuItemGroup, a5 as Dropdown$2, a6 as Checkbox$2, a7 as useForm$1, a8 as e, a9 as getDOM, aa as useId$1, ab as Tabs$1, ac as InputNumber$1, ad as Input$2, ae as RefRangePicker, af as RefPicker, ag as generateConfig, ah as CSSMotionList, ai as RefForm, aj as get, ak as set, al as Context, am as ListContext, an as WrapperField, ao as List, ap as useWatch, aq as triggerFocus, ar as TextArea$1, as as Pagination$1, at as debounce, au as Panel, av as convertDataToEntities, aw as conductCheck, ax as INTERNAL_COL_DEFINE, ay as arrDel, az as arrAdd, aA as Tree$2, aB as fillFieldNames, aC as conductExpandParent, aD as convertTreeToData, aE as TreeNode, aF as KeyCode, aG as genTable, aH as genVirtualTable, aI as convertChildrenToColumns, aJ as INTERNAL_HOOKS, aK as EXPAND_COLUMN, aL as FooterComponents, aM as gold, aN as copy, aO as isStyleSupport, aP as RefResizeObserver } from "./other-vendor-OscdKVAu.js";
import { r as reactExports, R as React, a as React$1, c as cloneElement, i as isFragment, b as replaceElement } from "./react-vendor-C09FwfLq.js";
import { I as IconContext, R as RefIcon, a as RefIcon$1, b as RefIcon$2, c as RefIcon$3, d as RefIcon$4, e as RefIcon$5, f as RefIcon$6, g as RefIcon$7, h as RefIcon$8, i as RefIcon$9, j as RefIcon$a, k as RefIcon$b, l as RefIcon$c, m as RefIcon$d, n as RefIcon$e, o as RefIcon$f, p as RefIcon$g, q as RefIcon$h, r as RefIcon$i, s as RefIcon$j, t as RefIcon$k, u as RefIcon$l, v as RefIcon$m, w as RefIcon$n, x as RefIcon$o, y as RefIcon$p, z as RefIcon$q, A as RefIcon$r, B as RefIcon$s, C as RefIcon$t, D as RefIcon$u, E as RefIcon$v, F as RefIcon$w, G as RefIcon$x, H as RefIcon$y } from "./antd-icons-ZoMdwZyJ.js";
function noop() {
}
const WarningContext = /* @__PURE__ */ reactExports.createContext({});
const devUseWarning = () => {
  const noopWarning = () => {
  };
  noopWarning.deprecated = noop;
  return noopWarning;
};
const ValidateMessagesContext = /* @__PURE__ */ reactExports.createContext(void 0);
const locale$1 = {
  placeholder: "Select time",
  rangePlaceholder: ["Start time", "End time"]
};
const locale = {
  lang: Object.assign({
    placeholder: "Select date",
    yearPlaceholder: "Select year",
    quarterPlaceholder: "Select quarter",
    monthPlaceholder: "Select month",
    weekPlaceholder: "Select week",
    rangePlaceholder: ["Start date", "End date"],
    rangeYearPlaceholder: ["Start year", "End year"],
    rangeQuarterPlaceholder: ["Start quarter", "End quarter"],
    rangeMonthPlaceholder: ["Start month", "End month"],
    rangeWeekPlaceholder: ["Start week", "End week"]
  }, locale$2),
  timePickerLocale: Object.assign({}, locale$1)
};
const typeTemplate = "${label} is not a valid ${type}";
const localeValues = {
  locale: "en",
  Pagination: locale$3,
  DatePicker: locale,
  TimePicker: locale$1,
  Calendar: locale,
  global: {
    placeholder: "Please select",
    close: "Close"
  },
  Table: {
    filterTitle: "Filter menu",
    filterConfirm: "OK",
    filterReset: "Reset",
    filterEmptyText: "No filters",
    filterCheckAll: "Select all items",
    filterSearchPlaceholder: "Search in filters",
    emptyText: "No data",
    selectAll: "Select current page",
    selectInvert: "Invert current page",
    selectNone: "Clear all data",
    selectionAll: "Select all data",
    sortTitle: "Sort",
    expand: "Expand row",
    collapse: "Collapse row",
    triggerDesc: "Click to sort descending",
    triggerAsc: "Click to sort ascending",
    cancelSort: "Click to cancel sorting"
  },
  Tour: {
    Next: "Next",
    Previous: "Previous",
    Finish: "Finish"
  },
  Modal: {
    okText: "OK",
    cancelText: "Cancel",
    justOkText: "OK"
  },
  Popconfirm: {
    okText: "OK",
    cancelText: "Cancel"
  },
  Transfer: {
    titles: ["", ""],
    searchPlaceholder: "Search here",
    itemUnit: "item",
    itemsUnit: "items",
    remove: "Remove",
    selectCurrent: "Select current page",
    removeCurrent: "Remove current page",
    selectAll: "Select all data",
    deselectAll: "Deselect all data",
    removeAll: "Remove all data",
    selectInvert: "Invert current page"
  },
  Upload: {
    uploading: "Uploading...",
    removeFile: "Remove file",
    uploadError: "Upload error",
    previewFile: "Preview file",
    downloadFile: "Download file"
  },
  Empty: {
    description: "No data"
  },
  Icon: {
    icon: "icon"
  },
  Text: {
    edit: "Edit",
    copy: "Copy",
    copied: "Copied",
    expand: "Expand",
    collapse: "Collapse"
  },
  Form: {
    optional: "(optional)",
    defaultValidateMessages: {
      default: "Field validation error for ${label}",
      required: "Please enter ${label}",
      enum: "${label} must be one of [${enum}]",
      whitespace: "${label} cannot be a blank character",
      date: {
        format: "${label} date format is invalid",
        parse: "${label} cannot be converted to a date",
        invalid: "${label} is an invalid date"
      },
      types: {
        string: typeTemplate,
        method: typeTemplate,
        array: typeTemplate,
        object: typeTemplate,
        number: typeTemplate,
        date: typeTemplate,
        boolean: typeTemplate,
        integer: typeTemplate,
        float: typeTemplate,
        regexp: typeTemplate,
        email: typeTemplate,
        url: typeTemplate,
        hex: typeTemplate
      },
      string: {
        len: "${label} must be ${len} characters",
        min: "${label} must be at least ${min} characters",
        max: "${label} must be up to ${max} characters",
        range: "${label} must be between ${min}-${max} characters"
      },
      number: {
        len: "${label} must be equal to ${len}",
        min: "${label} must be minimum ${min}",
        max: "${label} must be maximum ${max}",
        range: "${label} must be between ${min}-${max}"
      },
      array: {
        len: "Must be ${len} ${label}",
        min: "At least ${min} ${label}",
        max: "At most ${max} ${label}",
        range: "The amount of ${label} must be between ${min}-${max}"
      },
      pattern: {
        mismatch: "${label} does not match the pattern ${pattern}"
      }
    }
  },
  Image: {
    preview: "Preview"
  },
  QRCode: {
    expired: "QR code expired",
    refresh: "Refresh",
    scanned: "Scanned"
  },
  ColorPicker: {
    presetEmpty: "Empty",
    transparent: "Transparent",
    singleColor: "Single",
    gradientColor: "Gradient"
  }
};
let runtimeLocale = Object.assign({}, localeValues.Modal);
let localeList = [];
const generateLocale = () => localeList.reduce((merged, locale2) => Object.assign(Object.assign({}, merged), locale2), localeValues.Modal);
function changeConfirmLocale(newLocale) {
  if (newLocale) {
    const cloneLocale = Object.assign({}, newLocale);
    localeList.push(cloneLocale);
    runtimeLocale = generateLocale();
    return () => {
      localeList = localeList.filter((locale2) => locale2 !== cloneLocale);
      runtimeLocale = generateLocale();
    };
  }
  runtimeLocale = Object.assign({}, localeValues.Modal);
}
function getConfirmLocale() {
  return runtimeLocale;
}
const LocaleContext = /* @__PURE__ */ reactExports.createContext(void 0);
const useLocale = (componentName, defaultLocale) => {
  const fullLocale = reactExports.useContext(LocaleContext);
  const getLocale = reactExports.useMemo(() => {
    var _a;
    const locale2 = defaultLocale || localeValues[componentName];
    const localeFromContext = (_a = fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale[componentName]) !== null && _a !== void 0 ? _a : {};
    return Object.assign(Object.assign({}, typeof locale2 === "function" ? locale2() : locale2), localeFromContext || {});
  }, [componentName, defaultLocale, fullLocale]);
  const getLocaleCode = reactExports.useMemo(() => {
    const localeCode = fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale.locale;
    if ((fullLocale === null || fullLocale === void 0 ? void 0 : fullLocale.exist) && !localeCode) {
      return localeValues.locale;
    }
    return localeCode;
  }, [fullLocale]);
  return [getLocale, getLocaleCode];
};
const ANT_MARK = "internalMark";
const LocaleProvider = (props) => {
  const {
    locale: locale2 = {},
    children,
    _ANT_MARK__
  } = props;
  reactExports.useEffect(() => {
    const clearLocale = changeConfirmLocale(locale2 === null || locale2 === void 0 ? void 0 : locale2.Modal);
    return clearLocale;
  }, [locale2]);
  const getMemoizedContextValue = reactExports.useMemo(() => Object.assign(Object.assign({}, locale2), {
    exist: true
  }), [locale2]);
  return /* @__PURE__ */ reactExports.createElement(LocaleContext.Provider, {
    value: getMemoizedContextValue
  }, children);
};
const defaultPresetColors = {
  blue: "#1677FF",
  purple: "#722ED1",
  cyan: "#13C2C2",
  green: "#52C41A",
  magenta: "#EB2F96",
  /**
   * @deprecated Use magenta instead
   */
  pink: "#EB2F96",
  red: "#F5222D",
  orange: "#FA8C16",
  yellow: "#FADB14",
  volcano: "#FA541C",
  geekblue: "#2F54EB",
  gold: "#FAAD14",
  lime: "#A0D911"
};
const seedToken = Object.assign(Object.assign({}, defaultPresetColors), {
  // Color
  colorPrimary: "#1677ff",
  colorSuccess: "#52c41a",
  colorWarning: "#faad14",
  colorError: "#ff4d4f",
  colorInfo: "#1677ff",
  colorLink: "",
  colorTextBase: "",
  colorBgBase: "",
  // Font
  fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
'Noto Color Emoji'`,
  fontFamilyCode: `'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace`,
  fontSize: 14,
  // Line
  lineWidth: 1,
  lineType: "solid",
  // Motion
  motionUnit: 0.1,
  motionBase: 0,
  motionEaseOutCirc: "cubic-bezier(0.08, 0.82, 0.17, 1)",
  motionEaseInOutCirc: "cubic-bezier(0.78, 0.14, 0.15, 0.86)",
  motionEaseOut: "cubic-bezier(0.215, 0.61, 0.355, 1)",
  motionEaseInOut: "cubic-bezier(0.645, 0.045, 0.355, 1)",
  motionEaseOutBack: "cubic-bezier(0.12, 0.4, 0.29, 1.46)",
  motionEaseInBack: "cubic-bezier(0.71, -0.46, 0.88, 0.6)",
  motionEaseInQuint: "cubic-bezier(0.755, 0.05, 0.855, 0.06)",
  motionEaseOutQuint: "cubic-bezier(0.23, 1, 0.32, 1)",
  // Radius
  borderRadius: 6,
  // Size
  sizeUnit: 4,
  sizeStep: 4,
  sizePopupArrow: 16,
  // Control Base
  controlHeight: 32,
  // zIndex
  zIndexBase: 0,
  zIndexPopupBase: 1e3,
  // Image
  opacityImage: 1,
  // Wireframe
  wireframe: false,
  // Motion
  motion: true
});
function genColorMapToken(seed, {
  generateColorPalettes: generateColorPalettes2,
  generateNeutralColorPalettes: generateNeutralColorPalettes2
}) {
  const {
    colorSuccess: colorSuccessBase,
    colorWarning: colorWarningBase,
    colorError: colorErrorBase,
    colorInfo: colorInfoBase,
    colorPrimary: colorPrimaryBase,
    colorBgBase,
    colorTextBase
  } = seed;
  const primaryColors = generateColorPalettes2(colorPrimaryBase);
  const successColors = generateColorPalettes2(colorSuccessBase);
  const warningColors = generateColorPalettes2(colorWarningBase);
  const errorColors = generateColorPalettes2(colorErrorBase);
  const infoColors = generateColorPalettes2(colorInfoBase);
  const neutralColors = generateNeutralColorPalettes2(colorBgBase, colorTextBase);
  const colorLink = seed.colorLink || seed.colorInfo;
  const linkColors = generateColorPalettes2(colorLink);
  const colorErrorBgFilledHover = new FastColor(errorColors[1]).mix(new FastColor(errorColors[3]), 50).toHexString();
  return Object.assign(Object.assign({}, neutralColors), {
    colorPrimaryBg: primaryColors[1],
    colorPrimaryBgHover: primaryColors[2],
    colorPrimaryBorder: primaryColors[3],
    colorPrimaryBorderHover: primaryColors[4],
    colorPrimaryHover: primaryColors[5],
    colorPrimary: primaryColors[6],
    colorPrimaryActive: primaryColors[7],
    colorPrimaryTextHover: primaryColors[8],
    colorPrimaryText: primaryColors[9],
    colorPrimaryTextActive: primaryColors[10],
    colorSuccessBg: successColors[1],
    colorSuccessBgHover: successColors[2],
    colorSuccessBorder: successColors[3],
    colorSuccessBorderHover: successColors[4],
    colorSuccessHover: successColors[4],
    colorSuccess: successColors[6],
    colorSuccessActive: successColors[7],
    colorSuccessTextHover: successColors[8],
    colorSuccessText: successColors[9],
    colorSuccessTextActive: successColors[10],
    colorErrorBg: errorColors[1],
    colorErrorBgHover: errorColors[2],
    colorErrorBgFilledHover,
    colorErrorBgActive: errorColors[3],
    colorErrorBorder: errorColors[3],
    colorErrorBorderHover: errorColors[4],
    colorErrorHover: errorColors[5],
    colorError: errorColors[6],
    colorErrorActive: errorColors[7],
    colorErrorTextHover: errorColors[8],
    colorErrorText: errorColors[9],
    colorErrorTextActive: errorColors[10],
    colorWarningBg: warningColors[1],
    colorWarningBgHover: warningColors[2],
    colorWarningBorder: warningColors[3],
    colorWarningBorderHover: warningColors[4],
    colorWarningHover: warningColors[4],
    colorWarning: warningColors[6],
    colorWarningActive: warningColors[7],
    colorWarningTextHover: warningColors[8],
    colorWarningText: warningColors[9],
    colorWarningTextActive: warningColors[10],
    colorInfoBg: infoColors[1],
    colorInfoBgHover: infoColors[2],
    colorInfoBorder: infoColors[3],
    colorInfoBorderHover: infoColors[4],
    colorInfoHover: infoColors[4],
    colorInfo: infoColors[6],
    colorInfoActive: infoColors[7],
    colorInfoTextHover: infoColors[8],
    colorInfoText: infoColors[9],
    colorInfoTextActive: infoColors[10],
    colorLinkHover: linkColors[4],
    colorLink: linkColors[6],
    colorLinkActive: linkColors[7],
    colorBgMask: new FastColor("#000").setA(0.45).toRgbString(),
    colorWhite: "#fff"
  });
}
const genRadius = (radiusBase) => {
  let radiusLG = radiusBase;
  let radiusSM = radiusBase;
  let radiusXS = radiusBase;
  let radiusOuter = radiusBase;
  if (radiusBase < 6 && radiusBase >= 5) {
    radiusLG = radiusBase + 1;
  } else if (radiusBase < 16 && radiusBase >= 6) {
    radiusLG = radiusBase + 2;
  } else if (radiusBase >= 16) {
    radiusLG = 16;
  }
  if (radiusBase < 7 && radiusBase >= 5) {
    radiusSM = 4;
  } else if (radiusBase < 8 && radiusBase >= 7) {
    radiusSM = 5;
  } else if (radiusBase < 14 && radiusBase >= 8) {
    radiusSM = 6;
  } else if (radiusBase < 16 && radiusBase >= 14) {
    radiusSM = 7;
  } else if (radiusBase >= 16) {
    radiusSM = 8;
  }
  if (radiusBase < 6 && radiusBase >= 2) {
    radiusXS = 1;
  } else if (radiusBase >= 6) {
    radiusXS = 2;
  }
  if (radiusBase > 4 && radiusBase < 8) {
    radiusOuter = 4;
  } else if (radiusBase >= 8) {
    radiusOuter = 6;
  }
  return {
    borderRadius: radiusBase,
    borderRadiusXS: radiusXS,
    borderRadiusSM: radiusSM,
    borderRadiusLG: radiusLG,
    borderRadiusOuter: radiusOuter
  };
};
function genCommonMapToken(token) {
  const {
    motionUnit,
    motionBase,
    borderRadius,
    lineWidth
  } = token;
  return Object.assign({
    // motion
    motionDurationFast: `${(motionBase + motionUnit).toFixed(1)}s`,
    motionDurationMid: `${(motionBase + motionUnit * 2).toFixed(1)}s`,
    motionDurationSlow: `${(motionBase + motionUnit * 3).toFixed(1)}s`,
    // line
    lineWidthBold: lineWidth + 1
  }, genRadius(borderRadius));
}
const genControlHeight = (token) => {
  const {
    controlHeight
  } = token;
  return {
    controlHeightSM: controlHeight * 0.75,
    controlHeightXS: controlHeight * 0.5,
    controlHeightLG: controlHeight * 1.25
  };
};
function getLineHeight(fontSize) {
  return (fontSize + 8) / fontSize;
}
function getFontSizes(base) {
  const fontSizes = Array.from({
    length: 10
  }).map((_, index) => {
    const i = index - 1;
    const baseSize = base * Math.pow(Math.E, i / 5);
    const intSize = index > 1 ? Math.floor(baseSize) : Math.ceil(baseSize);
    return Math.floor(intSize / 2) * 2;
  });
  fontSizes[1] = base;
  return fontSizes.map((size) => ({
    size,
    lineHeight: getLineHeight(size)
  }));
}
const genFontMapToken = (fontSize) => {
  const fontSizePairs = getFontSizes(fontSize);
  const fontSizes = fontSizePairs.map((pair) => pair.size);
  const lineHeights = fontSizePairs.map((pair) => pair.lineHeight);
  const fontSizeMD = fontSizes[1];
  const fontSizeSM = fontSizes[0];
  const fontSizeLG = fontSizes[2];
  const lineHeight = lineHeights[1];
  const lineHeightSM = lineHeights[0];
  const lineHeightLG = lineHeights[2];
  return {
    fontSizeSM,
    fontSize: fontSizeMD,
    fontSizeLG,
    fontSizeXL: fontSizes[3],
    fontSizeHeading1: fontSizes[6],
    fontSizeHeading2: fontSizes[5],
    fontSizeHeading3: fontSizes[4],
    fontSizeHeading4: fontSizes[3],
    fontSizeHeading5: fontSizes[2],
    lineHeight,
    lineHeightLG,
    lineHeightSM,
    fontHeight: Math.round(lineHeight * fontSizeMD),
    fontHeightLG: Math.round(lineHeightLG * fontSizeLG),
    fontHeightSM: Math.round(lineHeightSM * fontSizeSM),
    lineHeightHeading1: lineHeights[6],
    lineHeightHeading2: lineHeights[5],
    lineHeightHeading3: lineHeights[4],
    lineHeightHeading4: lineHeights[3],
    lineHeightHeading5: lineHeights[2]
  };
};
function genSizeMapToken(token) {
  const {
    sizeUnit,
    sizeStep
  } = token;
  return {
    sizeXXL: sizeUnit * (sizeStep + 8),
    // 48
    sizeXL: sizeUnit * (sizeStep + 4),
    // 32
    sizeLG: sizeUnit * (sizeStep + 2),
    // 24
    sizeMD: sizeUnit * (sizeStep + 1),
    // 20
    sizeMS: sizeUnit * sizeStep,
    // 16
    size: sizeUnit * sizeStep,
    // 16
    sizeSM: sizeUnit * (sizeStep - 1),
    // 12
    sizeXS: sizeUnit * (sizeStep - 2),
    // 8
    sizeXXS: sizeUnit * (sizeStep - 3)
    // 4
  };
}
const getAlphaColor$1 = (baseColor, alpha) => new FastColor(baseColor).setA(alpha).toRgbString();
const getSolidColor = (baseColor, brightness) => {
  const instance = new FastColor(baseColor);
  return instance.darken(brightness).toHexString();
};
const generateColorPalettes = (baseColor) => {
  const colors = generate(baseColor);
  return {
    1: colors[0],
    2: colors[1],
    3: colors[2],
    4: colors[3],
    5: colors[4],
    6: colors[5],
    7: colors[6],
    8: colors[4],
    9: colors[5],
    10: colors[6]
    // 8: colors[7],
    // 9: colors[8],
    // 10: colors[9],
  };
};
const generateNeutralColorPalettes = (bgBaseColor, textBaseColor) => {
  const colorBgBase = bgBaseColor || "#fff";
  const colorTextBase = textBaseColor || "#000";
  return {
    colorBgBase,
    colorTextBase,
    colorText: getAlphaColor$1(colorTextBase, 0.88),
    colorTextSecondary: getAlphaColor$1(colorTextBase, 0.65),
    colorTextTertiary: getAlphaColor$1(colorTextBase, 0.45),
    colorTextQuaternary: getAlphaColor$1(colorTextBase, 0.25),
    colorFill: getAlphaColor$1(colorTextBase, 0.15),
    colorFillSecondary: getAlphaColor$1(colorTextBase, 0.06),
    colorFillTertiary: getAlphaColor$1(colorTextBase, 0.04),
    colorFillQuaternary: getAlphaColor$1(colorTextBase, 0.02),
    colorBgSolid: getAlphaColor$1(colorTextBase, 1),
    colorBgSolidHover: getAlphaColor$1(colorTextBase, 0.75),
    colorBgSolidActive: getAlphaColor$1(colorTextBase, 0.95),
    colorBgLayout: getSolidColor(colorBgBase, 4),
    colorBgContainer: getSolidColor(colorBgBase, 0),
    colorBgElevated: getSolidColor(colorBgBase, 0),
    colorBgSpotlight: getAlphaColor$1(colorTextBase, 0.85),
    colorBgBlur: "transparent",
    colorBorder: getSolidColor(colorBgBase, 15),
    colorBorderSecondary: getSolidColor(colorBgBase, 6)
  };
};
function derivative(token) {
  presetPrimaryColors.pink = presetPrimaryColors.magenta;
  presetPalettes.pink = presetPalettes.magenta;
  const colorPalettes = Object.keys(defaultPresetColors).map((colorKey) => {
    const colors = token[colorKey] === presetPrimaryColors[colorKey] ? presetPalettes[colorKey] : generate(token[colorKey]);
    return Array.from({
      length: 10
    }, () => 1).reduce((prev, _, i) => {
      prev[`${colorKey}-${i + 1}`] = colors[i];
      prev[`${colorKey}${i + 1}`] = colors[i];
      return prev;
    }, {});
  }).reduce((prev, cur) => {
    prev = Object.assign(Object.assign({}, prev), cur);
    return prev;
  }, {});
  return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, token), colorPalettes), genColorMapToken(token, {
    generateColorPalettes,
    generateNeutralColorPalettes
  })), genFontMapToken(token.fontSize)), genSizeMapToken(token)), genControlHeight(token)), genCommonMapToken(token));
}
const defaultTheme = createTheme(derivative);
const defaultConfig = {
  token: seedToken,
  override: {
    override: seedToken
  },
  hashed: true
};
const DesignTokenContext = /* @__PURE__ */ React.createContext(defaultConfig);
const defaultPrefixCls = "ant";
const defaultIconPrefixCls = "anticon";
const Variants = ["outlined", "borderless", "filled", "underlined"];
const defaultGetPrefixCls = (suffixCls, customizePrefixCls) => {
  if (customizePrefixCls) {
    return customizePrefixCls;
  }
  return suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls;
};
const ConfigContext = /* @__PURE__ */ reactExports.createContext({
  // We provide a default function for Context without provider
  getPrefixCls: defaultGetPrefixCls,
  iconPrefixCls: defaultIconPrefixCls
});
const {
  Consumer: ConfigConsumer
} = ConfigContext;
const EMPTY_OBJECT = {};
function useComponentConfig(propName) {
  const context = reactExports.useContext(ConfigContext);
  const {
    getPrefixCls,
    direction,
    getPopupContainer
  } = context;
  const propValue = context[propName];
  return Object.assign(Object.assign({
    classNames: EMPTY_OBJECT,
    styles: EMPTY_OBJECT
  }, propValue), {
    getPrefixCls,
    direction,
    getPopupContainer
  });
}
const dynamicStyleMark = `-ant-${Date.now()}-${Math.random()}`;
function getStyle$1(globalPrefixCls2, theme) {
  const variables = {};
  const formatColor = (color, updater) => {
    let clone = color.clone();
    clone = (updater === null || updater === void 0 ? void 0 : updater(clone)) || clone;
    return clone.toRgbString();
  };
  const fillColor = (colorVal, type) => {
    const baseColor = new FastColor(colorVal);
    const colorPalettes = generate(baseColor.toRgbString());
    variables[`${type}-color`] = formatColor(baseColor);
    variables[`${type}-color-disabled`] = colorPalettes[1];
    variables[`${type}-color-hover`] = colorPalettes[4];
    variables[`${type}-color-active`] = colorPalettes[6];
    variables[`${type}-color-outline`] = baseColor.clone().setA(0.2).toRgbString();
    variables[`${type}-color-deprecated-bg`] = colorPalettes[0];
    variables[`${type}-color-deprecated-border`] = colorPalettes[2];
  };
  if (theme.primaryColor) {
    fillColor(theme.primaryColor, "primary");
    const primaryColor = new FastColor(theme.primaryColor);
    const primaryColors = generate(primaryColor.toRgbString());
    primaryColors.forEach((color, index) => {
      variables[`primary-${index + 1}`] = color;
    });
    variables["primary-color-deprecated-l-35"] = formatColor(primaryColor, (c) => c.lighten(35));
    variables["primary-color-deprecated-l-20"] = formatColor(primaryColor, (c) => c.lighten(20));
    variables["primary-color-deprecated-t-20"] = formatColor(primaryColor, (c) => c.tint(20));
    variables["primary-color-deprecated-t-50"] = formatColor(primaryColor, (c) => c.tint(50));
    variables["primary-color-deprecated-f-12"] = formatColor(primaryColor, (c) => c.setA(c.a * 0.12));
    const primaryActiveColor = new FastColor(primaryColors[0]);
    variables["primary-color-active-deprecated-f-30"] = formatColor(primaryActiveColor, (c) => c.setA(c.a * 0.3));
    variables["primary-color-active-deprecated-d-02"] = formatColor(primaryActiveColor, (c) => c.darken(2));
  }
  if (theme.successColor) {
    fillColor(theme.successColor, "success");
  }
  if (theme.warningColor) {
    fillColor(theme.warningColor, "warning");
  }
  if (theme.errorColor) {
    fillColor(theme.errorColor, "error");
  }
  if (theme.infoColor) {
    fillColor(theme.infoColor, "info");
  }
  const cssList = Object.keys(variables).map((key) => `--${globalPrefixCls2}-${key}: ${variables[key]};`);
  return `
  :root {
    ${cssList.join("\n")}
  }
  `.trim();
}
function registerTheme(globalPrefixCls2, theme) {
  const style = getStyle$1(globalPrefixCls2, theme);
  if (canUseDom()) {
    updateCSS(style, `${dynamicStyleMark}-dynamic-theme`);
  }
}
const DisabledContext = /* @__PURE__ */ reactExports.createContext(false);
const DisabledContextProvider = ({
  children,
  disabled
}) => {
  const originDisabled = reactExports.useContext(DisabledContext);
  return /* @__PURE__ */ reactExports.createElement(DisabledContext.Provider, {
    value: disabled !== null && disabled !== void 0 ? disabled : originDisabled
  }, children);
};
const SizeContext = /* @__PURE__ */ reactExports.createContext(void 0);
const SizeContextProvider = ({
  children,
  size
}) => {
  const originSize = reactExports.useContext(SizeContext);
  return /* @__PURE__ */ reactExports.createElement(SizeContext.Provider, {
    value: size || originSize
  }, children);
};
function useConfig() {
  const componentDisabled = reactExports.useContext(DisabledContext);
  const componentSize = reactExports.useContext(SizeContext);
  return {
    componentDisabled,
    componentSize
  };
}
const PresetColors = ["blue", "purple", "cyan", "green", "magenta", "pink", "red", "orange", "yellow", "volcano", "geekblue", "lime", "gold"];
const version = "5.26.6";
function isStableColor(color) {
  return color >= 0 && color <= 255;
}
function getAlphaColor(frontColor, backgroundColor) {
  const {
    r: fR,
    g: fG,
    b: fB,
    a: originAlpha
  } = new FastColor(frontColor).toRgb();
  if (originAlpha < 1) {
    return frontColor;
  }
  const {
    r: bR,
    g: bG,
    b: bB
  } = new FastColor(backgroundColor).toRgb();
  for (let fA = 0.01; fA <= 1; fA += 0.01) {
    const r = Math.round((fR - bR * (1 - fA)) / fA);
    const g = Math.round((fG - bG * (1 - fA)) / fA);
    const b = Math.round((fB - bB * (1 - fA)) / fA);
    if (isStableColor(r) && isStableColor(g) && isStableColor(b)) {
      return new FastColor({
        r,
        g,
        b,
        a: Math.round(fA * 100) / 100
      }).toRgbString();
    }
  }
  return new FastColor({
    r: fR,
    g: fG,
    b: fB,
    a: 1
  }).toRgbString();
}
var __rest$X = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function formatToken(derivativeToken) {
  const {
    override
  } = derivativeToken, restToken = __rest$X(derivativeToken, ["override"]);
  const overrideTokens = Object.assign({}, override);
  Object.keys(seedToken).forEach((token) => {
    delete overrideTokens[token];
  });
  const mergedToken = Object.assign(Object.assign({}, restToken), overrideTokens);
  const screenXS = 480;
  const screenSM = 576;
  const screenMD = 768;
  const screenLG = 992;
  const screenXL = 1200;
  const screenXXL = 1600;
  if (mergedToken.motion === false) {
    const fastDuration = "0s";
    mergedToken.motionDurationFast = fastDuration;
    mergedToken.motionDurationMid = fastDuration;
    mergedToken.motionDurationSlow = fastDuration;
  }
  const aliasToken = Object.assign(Object.assign(Object.assign({}, mergedToken), {
    // ============== Background ============== //
    colorFillContent: mergedToken.colorFillSecondary,
    colorFillContentHover: mergedToken.colorFill,
    colorFillAlter: mergedToken.colorFillQuaternary,
    colorBgContainerDisabled: mergedToken.colorFillTertiary,
    // ============== Split ============== //
    colorBorderBg: mergedToken.colorBgContainer,
    colorSplit: getAlphaColor(mergedToken.colorBorderSecondary, mergedToken.colorBgContainer),
    // ============== Text ============== //
    colorTextPlaceholder: mergedToken.colorTextQuaternary,
    colorTextDisabled: mergedToken.colorTextQuaternary,
    colorTextHeading: mergedToken.colorText,
    colorTextLabel: mergedToken.colorTextSecondary,
    colorTextDescription: mergedToken.colorTextTertiary,
    colorTextLightSolid: mergedToken.colorWhite,
    colorHighlight: mergedToken.colorError,
    colorBgTextHover: mergedToken.colorFillSecondary,
    colorBgTextActive: mergedToken.colorFill,
    colorIcon: mergedToken.colorTextTertiary,
    colorIconHover: mergedToken.colorText,
    colorErrorOutline: getAlphaColor(mergedToken.colorErrorBg, mergedToken.colorBgContainer),
    colorWarningOutline: getAlphaColor(mergedToken.colorWarningBg, mergedToken.colorBgContainer),
    // Font
    fontSizeIcon: mergedToken.fontSizeSM,
    // Line
    lineWidthFocus: mergedToken.lineWidth * 3,
    // Control
    lineWidth: mergedToken.lineWidth,
    controlOutlineWidth: mergedToken.lineWidth * 2,
    // Checkbox size and expand icon size
    controlInteractiveSize: mergedToken.controlHeight / 2,
    controlItemBgHover: mergedToken.colorFillTertiary,
    controlItemBgActive: mergedToken.colorPrimaryBg,
    controlItemBgActiveHover: mergedToken.colorPrimaryBgHover,
    controlItemBgActiveDisabled: mergedToken.colorFill,
    controlTmpOutline: mergedToken.colorFillQuaternary,
    controlOutline: getAlphaColor(mergedToken.colorPrimaryBg, mergedToken.colorBgContainer),
    lineType: mergedToken.lineType,
    borderRadius: mergedToken.borderRadius,
    borderRadiusXS: mergedToken.borderRadiusXS,
    borderRadiusSM: mergedToken.borderRadiusSM,
    borderRadiusLG: mergedToken.borderRadiusLG,
    fontWeightStrong: 600,
    opacityLoading: 0.65,
    linkDecoration: "none",
    linkHoverDecoration: "none",
    linkFocusDecoration: "none",
    controlPaddingHorizontal: 12,
    controlPaddingHorizontalSM: 8,
    paddingXXS: mergedToken.sizeXXS,
    paddingXS: mergedToken.sizeXS,
    paddingSM: mergedToken.sizeSM,
    padding: mergedToken.size,
    paddingMD: mergedToken.sizeMD,
    paddingLG: mergedToken.sizeLG,
    paddingXL: mergedToken.sizeXL,
    paddingContentHorizontalLG: mergedToken.sizeLG,
    paddingContentVerticalLG: mergedToken.sizeMS,
    paddingContentHorizontal: mergedToken.sizeMS,
    paddingContentVertical: mergedToken.sizeSM,
    paddingContentHorizontalSM: mergedToken.size,
    paddingContentVerticalSM: mergedToken.sizeXS,
    marginXXS: mergedToken.sizeXXS,
    marginXS: mergedToken.sizeXS,
    marginSM: mergedToken.sizeSM,
    margin: mergedToken.size,
    marginMD: mergedToken.sizeMD,
    marginLG: mergedToken.sizeLG,
    marginXL: mergedToken.sizeXL,
    marginXXL: mergedToken.sizeXXL,
    boxShadow: `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
    boxShadowSecondary: `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
    boxShadowTertiary: `
      0 1px 2px 0 rgba(0, 0, 0, 0.03),
      0 1px 6px -1px rgba(0, 0, 0, 0.02),
      0 2px 4px 0 rgba(0, 0, 0, 0.02)
    `,
    screenXS,
    screenXSMin: screenXS,
    screenXSMax: screenSM - 1,
    screenSM,
    screenSMMin: screenSM,
    screenSMMax: screenMD - 1,
    screenMD,
    screenMDMin: screenMD,
    screenMDMax: screenLG - 1,
    screenLG,
    screenLGMin: screenLG,
    screenLGMax: screenXL - 1,
    screenXL,
    screenXLMin: screenXL,
    screenXLMax: screenXXL - 1,
    screenXXL,
    screenXXLMin: screenXXL,
    boxShadowPopoverArrow: "2px 2px 5px rgba(0, 0, 0, 0.05)",
    boxShadowCard: `
      0 1px 2px -2px ${new FastColor("rgba(0, 0, 0, 0.16)").toRgbString()},
      0 3px 6px 0 ${new FastColor("rgba(0, 0, 0, 0.12)").toRgbString()},
      0 5px 12px 4px ${new FastColor("rgba(0, 0, 0, 0.09)").toRgbString()}
    `,
    boxShadowDrawerRight: `
      -6px 0 16px 0 rgba(0, 0, 0, 0.08),
      -3px 0 6px -4px rgba(0, 0, 0, 0.12),
      -9px 0 28px 8px rgba(0, 0, 0, 0.05)
    `,
    boxShadowDrawerLeft: `
      6px 0 16px 0 rgba(0, 0, 0, 0.08),
      3px 0 6px -4px rgba(0, 0, 0, 0.12),
      9px 0 28px 8px rgba(0, 0, 0, 0.05)
    `,
    boxShadowDrawerUp: `
      0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
    boxShadowDrawerDown: `
      0 -6px 16px 0 rgba(0, 0, 0, 0.08),
      0 -3px 6px -4px rgba(0, 0, 0, 0.12),
      0 -9px 28px 8px rgba(0, 0, 0, 0.05)
    `,
    boxShadowTabsOverflowLeft: "inset 10px 0 8px -8px rgba(0, 0, 0, 0.08)",
    boxShadowTabsOverflowRight: "inset -10px 0 8px -8px rgba(0, 0, 0, 0.08)",
    boxShadowTabsOverflowTop: "inset 0 10px 8px -8px rgba(0, 0, 0, 0.08)",
    boxShadowTabsOverflowBottom: "inset 0 -10px 8px -8px rgba(0, 0, 0, 0.08)"
  }), overrideTokens);
  return aliasToken;
}
var __rest$W = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const unitless = {
  lineHeight: true,
  lineHeightSM: true,
  lineHeightLG: true,
  lineHeightHeading1: true,
  lineHeightHeading2: true,
  lineHeightHeading3: true,
  lineHeightHeading4: true,
  lineHeightHeading5: true,
  opacityLoading: true,
  fontWeightStrong: true,
  zIndexPopupBase: true,
  zIndexBase: true,
  opacityImage: true
};
const ignore = {
  size: true,
  sizeSM: true,
  sizeLG: true,
  sizeMD: true,
  sizeXS: true,
  sizeXXS: true,
  sizeMS: true,
  sizeXL: true,
  sizeXXL: true,
  sizeUnit: true,
  sizeStep: true,
  motionBase: true,
  motionUnit: true
};
const preserve = {
  screenXS: true,
  screenXSMin: true,
  screenXSMax: true,
  screenSM: true,
  screenSMMin: true,
  screenSMMax: true,
  screenMD: true,
  screenMDMin: true,
  screenMDMax: true,
  screenLG: true,
  screenLGMin: true,
  screenLGMax: true,
  screenXL: true,
  screenXLMin: true,
  screenXLMax: true,
  screenXXL: true,
  screenXXLMin: true
};
const getComputedToken = (originToken, overrideToken, theme) => {
  const derivativeToken = theme.getDerivativeToken(originToken);
  const {
    override
  } = overrideToken, components = __rest$W(overrideToken, ["override"]);
  let mergedDerivativeToken = Object.assign(Object.assign({}, derivativeToken), {
    override
  });
  mergedDerivativeToken = formatToken(mergedDerivativeToken);
  if (components) {
    Object.entries(components).forEach(([key, value]) => {
      const {
        theme: componentTheme
      } = value, componentTokens = __rest$W(value, ["theme"]);
      let mergedComponentToken = componentTokens;
      if (componentTheme) {
        mergedComponentToken = getComputedToken(Object.assign(Object.assign({}, mergedDerivativeToken), componentTokens), {
          override: componentTokens
        }, componentTheme);
      }
      mergedDerivativeToken[key] = mergedComponentToken;
    });
  }
  return mergedDerivativeToken;
};
function useToken() {
  const {
    token: rootDesignToken,
    hashed,
    theme,
    override,
    cssVar
  } = React.useContext(DesignTokenContext);
  const salt = `${version}-${hashed || ""}`;
  const mergedTheme = theme || defaultTheme;
  const [token, hashId, realToken] = useCacheToken(mergedTheme, [seedToken, rootDesignToken], {
    salt,
    override,
    getComputedToken,
    // formatToken will not be consumed after 1.15.0 with getComputedToken.
    // But token will break if @ant-design/cssinjs is under 1.15.0 without it
    formatToken,
    cssVar: cssVar && {
      prefix: cssVar.prefix,
      key: cssVar.key,
      unitless,
      ignore,
      preserve
    }
  });
  return [mergedTheme, realToken, hashed ? hashId : "", token, cssVar];
}
const textEllipsis = {
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis"
};
const resetComponent = (token, needInheritFontFamily = false) => ({
  boxSizing: "border-box",
  margin: 0,
  padding: 0,
  color: token.colorText,
  fontSize: token.fontSize,
  // font-variant: @font-variant-base;
  lineHeight: token.lineHeight,
  listStyle: "none",
  // font-feature-settings: @font-feature-settings-base;
  fontFamily: needInheritFontFamily ? "inherit" : token.fontFamily
});
const resetIcon = () => ({
  display: "inline-flex",
  alignItems: "center",
  color: "inherit",
  fontStyle: "normal",
  lineHeight: 0,
  textAlign: "center",
  textTransform: "none",
  // for SVG icon, see https://blog.prototypr.io/align-svg-icons-to-text-and-say-goodbye-to-font-icons-d44b3d7b26b4
  verticalAlign: "-0.125em",
  textRendering: "optimizeLegibility",
  "-webkit-font-smoothing": "antialiased",
  "-moz-osx-font-smoothing": "grayscale",
  "> *": {
    lineHeight: 1
  },
  svg: {
    display: "inline-block"
  }
});
const clearFix = () => ({
  // https://github.com/ant-design/ant-design/issues/21301#issuecomment-583955229
  "&::before": {
    display: "table",
    content: '""'
  },
  "&::after": {
    // https://github.com/ant-design/ant-design/issues/21864
    display: "table",
    clear: "both",
    content: '""'
  }
});
const genLinkStyle$1 = (token) => ({
  a: {
    color: token.colorLink,
    textDecoration: token.linkDecoration,
    backgroundColor: "transparent",
    // remove the gray background on active links in IE 10.
    outline: "none",
    cursor: "pointer",
    transition: `color ${token.motionDurationSlow}`,
    "-webkit-text-decoration-skip": "objects",
    // remove gaps in links underline in iOS 8+ and Safari 8+.
    "&:hover": {
      color: token.colorLinkHover
    },
    "&:active": {
      color: token.colorLinkActive
    },
    "&:active, &:hover": {
      textDecoration: token.linkHoverDecoration,
      outline: 0
    },
    // https://github.com/ant-design/ant-design/issues/22503
    "&:focus": {
      textDecoration: token.linkFocusDecoration,
      outline: 0
    },
    "&[disabled]": {
      color: token.colorTextDisabled,
      cursor: "not-allowed"
    }
  }
});
const genCommonStyle = (token, componentPrefixCls, rootCls, resetFont) => {
  const prefixSelector = `[class^="${componentPrefixCls}"], [class*=" ${componentPrefixCls}"]`;
  const rootPrefixSelector = rootCls ? `.${rootCls}` : prefixSelector;
  const resetStyle = {
    boxSizing: "border-box",
    "&::before, &::after": {
      boxSizing: "border-box"
    }
  };
  let resetFontStyle = {};
  if (resetFont !== false) {
    resetFontStyle = {
      fontFamily: token.fontFamily,
      fontSize: token.fontSize
    };
  }
  return {
    [rootPrefixSelector]: Object.assign(Object.assign(Object.assign({}, resetFontStyle), resetStyle), {
      [prefixSelector]: resetStyle
    })
  };
};
const genFocusOutline = (token, offset2) => ({
  outline: `${unit(token.lineWidthFocus)} solid ${token.colorPrimaryBorder}`,
  outlineOffset: offset2 !== null && offset2 !== void 0 ? offset2 : 1,
  transition: "outline-offset 0s, outline 0s"
});
const genFocusStyle = (token, offset2) => ({
  "&:focus-visible": Object.assign({}, genFocusOutline(token, offset2))
});
const genIconStyle = (iconPrefixCls) => ({
  [`.${iconPrefixCls}`]: Object.assign(Object.assign({}, resetIcon()), {
    [`.${iconPrefixCls} .${iconPrefixCls}-icon`]: {
      display: "block"
    }
  })
});
const operationUnit = (token) => Object.assign(Object.assign({
  // FIXME: This use link but is a operation unit. Seems should be a colorPrimary.
  // And Typography use this to generate link style which should not do this.
  color: token.colorLink,
  textDecoration: token.linkDecoration,
  outline: "none",
  cursor: "pointer",
  transition: `all ${token.motionDurationSlow}`,
  border: 0,
  padding: 0,
  background: "none",
  userSelect: "none"
}, genFocusStyle(token)), {
  "&:focus, &:hover": {
    color: token.colorLinkHover
  },
  "&:active": {
    color: token.colorLinkActive
  }
});
const {
  genStyleHooks,
  genComponentStyleHook,
  genSubStyleComponent
} = genStyleUtils({
  usePrefix: () => {
    const {
      getPrefixCls,
      iconPrefixCls
    } = reactExports.useContext(ConfigContext);
    const rootPrefixCls = getPrefixCls();
    return {
      rootPrefixCls,
      iconPrefixCls
    };
  },
  useToken: () => {
    const [theme, realToken, hashId, token, cssVar] = useToken();
    return {
      theme,
      realToken,
      hashId,
      token,
      cssVar
    };
  },
  useCSP: () => {
    const {
      csp
    } = reactExports.useContext(ConfigContext);
    return csp !== null && csp !== void 0 ? csp : {};
  },
  getResetStyles: (token, config) => {
    var _a;
    const linkStyle = genLinkStyle$1(token);
    return [linkStyle, {
      "&": linkStyle
    }, genIconStyle((_a = config === null || config === void 0 ? void 0 : config.prefix.iconPrefixCls) !== null && _a !== void 0 ? _a : defaultIconPrefixCls)];
  },
  getCommonStyle: genCommonStyle,
  getCompUnitless: () => unitless
});
function genPresetColor(token, genCss) {
  return PresetColors.reduce((prev, colorKey) => {
    const lightColor = token[`${colorKey}1`];
    const lightBorderColor = token[`${colorKey}3`];
    const darkColor = token[`${colorKey}6`];
    const textColor = token[`${colorKey}7`];
    return Object.assign(Object.assign({}, prev), genCss(colorKey, {
      lightColor,
      lightBorderColor,
      darkColor,
      textColor
    }));
  }, {});
}
const useResetIconStyle = (iconPrefixCls, csp) => {
  const [theme, token] = useToken();
  return useStyleRegister({
    token,
    hashId: "",
    path: ["ant-design-icons", iconPrefixCls],
    nonce: () => csp === null || csp === void 0 ? void 0 : csp.nonce,
    layer: {
      name: "antd"
    }
  }, () => [genIconStyle(iconPrefixCls)]);
};
const fullClone = Object.assign({}, React$1);
const {
  useId
} = fullClone;
const useEmptyId = () => "";
const useThemeKey = typeof useId === "undefined" ? useEmptyId : useId;
function useTheme(theme, parentTheme, config) {
  var _a;
  devUseWarning();
  const themeConfig = theme || {};
  const parentThemeConfig = themeConfig.inherit === false || !parentTheme ? Object.assign(Object.assign({}, defaultConfig), {
    hashed: (_a = parentTheme === null || parentTheme === void 0 ? void 0 : parentTheme.hashed) !== null && _a !== void 0 ? _a : defaultConfig.hashed,
    cssVar: parentTheme === null || parentTheme === void 0 ? void 0 : parentTheme.cssVar
  }) : parentTheme;
  const themeKey = useThemeKey();
  return useMemo(() => {
    var _a2, _b2;
    if (!theme) {
      return parentTheme;
    }
    const mergedComponents = Object.assign({}, parentThemeConfig.components);
    Object.keys(theme.components || {}).forEach((componentName) => {
      mergedComponents[componentName] = Object.assign(Object.assign({}, mergedComponents[componentName]), theme.components[componentName]);
    });
    const cssVarKey = `css-var-${themeKey.replace(/:/g, "")}`;
    const mergedCssVar = ((_a2 = themeConfig.cssVar) !== null && _a2 !== void 0 ? _a2 : parentThemeConfig.cssVar) && Object.assign(Object.assign(Object.assign({
      prefix: config === null || config === void 0 ? void 0 : config.prefixCls
    }, typeof parentThemeConfig.cssVar === "object" ? parentThemeConfig.cssVar : {}), typeof themeConfig.cssVar === "object" ? themeConfig.cssVar : {}), {
      key: typeof themeConfig.cssVar === "object" && ((_b2 = themeConfig.cssVar) === null || _b2 === void 0 ? void 0 : _b2.key) || cssVarKey
    });
    return Object.assign(Object.assign(Object.assign({}, parentThemeConfig), themeConfig), {
      token: Object.assign(Object.assign({}, parentThemeConfig.token), themeConfig.token),
      components: mergedComponents,
      cssVar: mergedCssVar
    });
  }, [themeConfig, parentThemeConfig], (prev, next) => prev.some((prevTheme, index) => {
    const nextTheme = next[index];
    return !isEqual(prevTheme, nextTheme, true);
  }));
}
const MotionCacheContext = /* @__PURE__ */ reactExports.createContext(true);
function MotionWrapper(props) {
  const parentMotion = reactExports.useContext(MotionCacheContext);
  const {
    children
  } = props;
  const [, token] = useToken();
  const {
    motion: motion2
  } = token;
  const needWrapMotionProviderRef = reactExports.useRef(false);
  needWrapMotionProviderRef.current || (needWrapMotionProviderRef.current = parentMotion !== motion2);
  if (needWrapMotionProviderRef.current) {
    return /* @__PURE__ */ reactExports.createElement(MotionCacheContext.Provider, {
      value: motion2
    }, /* @__PURE__ */ reactExports.createElement(MotionProvider, {
      motion: motion2
    }, children));
  }
  return children;
}
const PropWarning = () => null;
var __rest$V = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const PASSED_PROPS = ["getTargetContainer", "getPopupContainer", "renderEmpty", "input", "pagination", "form", "select", "button"];
let globalPrefixCls;
let globalIconPrefixCls;
let globalTheme;
let globalHolderRender;
function getGlobalPrefixCls() {
  return globalPrefixCls || defaultPrefixCls;
}
function getGlobalIconPrefixCls() {
  return globalIconPrefixCls || defaultIconPrefixCls;
}
function isLegacyTheme(theme) {
  return Object.keys(theme).some((key) => key.endsWith("Color"));
}
const setGlobalConfig = (props) => {
  const {
    prefixCls,
    iconPrefixCls,
    theme,
    holderRender
  } = props;
  if (prefixCls !== void 0) {
    globalPrefixCls = prefixCls;
  }
  if (iconPrefixCls !== void 0) {
    globalIconPrefixCls = iconPrefixCls;
  }
  if ("holderRender" in props) {
    globalHolderRender = holderRender;
  }
  if (theme) {
    if (isLegacyTheme(theme)) {
      registerTheme(getGlobalPrefixCls(), theme);
    } else {
      globalTheme = theme;
    }
  }
};
const globalConfig = () => ({
  getPrefixCls: (suffixCls, customizePrefixCls) => {
    if (customizePrefixCls) {
      return customizePrefixCls;
    }
    return suffixCls ? `${getGlobalPrefixCls()}-${suffixCls}` : getGlobalPrefixCls();
  },
  getIconPrefixCls: getGlobalIconPrefixCls,
  getRootPrefixCls: () => {
    if (globalPrefixCls) {
      return globalPrefixCls;
    }
    return getGlobalPrefixCls();
  },
  getTheme: () => globalTheme,
  holderRender: globalHolderRender
});
const ProviderChildren = (props) => {
  const {
    children,
    csp: customCsp,
    autoInsertSpaceInButton,
    alert,
    anchor,
    form,
    locale: locale2,
    componentSize,
    direction,
    space,
    splitter,
    virtual,
    dropdownMatchSelectWidth,
    popupMatchSelectWidth,
    popupOverflow,
    legacyLocale,
    parentContext,
    iconPrefixCls: customIconPrefixCls,
    theme,
    componentDisabled,
    segmented,
    statistic,
    spin,
    calendar,
    carousel,
    cascader,
    collapse,
    typography,
    checkbox,
    descriptions,
    divider,
    drawer,
    skeleton,
    steps,
    image,
    layout,
    list,
    mentions,
    modal,
    progress,
    result,
    slider,
    breadcrumb,
    menu,
    pagination,
    input,
    textArea,
    empty,
    badge,
    radio,
    rate,
    switch: SWITCH,
    transfer,
    avatar,
    message: message2,
    tag,
    table,
    card,
    tabs,
    timeline,
    timePicker,
    upload,
    notification,
    tree,
    colorPicker,
    datePicker,
    rangePicker,
    flex,
    wave,
    dropdown,
    warning: warningConfig,
    tour,
    tooltip,
    popover,
    popconfirm,
    floatButtonGroup,
    variant,
    inputNumber,
    treeSelect
  } = props;
  const getPrefixCls = reactExports.useCallback((suffixCls, customizePrefixCls) => {
    const {
      prefixCls
    } = props;
    if (customizePrefixCls) {
      return customizePrefixCls;
    }
    const mergedPrefixCls = prefixCls || parentContext.getPrefixCls("");
    return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
  }, [parentContext.getPrefixCls, props.prefixCls]);
  const iconPrefixCls = customIconPrefixCls || parentContext.iconPrefixCls || defaultIconPrefixCls;
  const csp = customCsp || parentContext.csp;
  useResetIconStyle(iconPrefixCls, csp);
  const mergedTheme = useTheme(theme, parentContext.theme, {
    prefixCls: getPrefixCls("")
  });
  const baseConfig = {
    csp,
    autoInsertSpaceInButton,
    alert,
    anchor,
    locale: locale2 || legacyLocale,
    direction,
    space,
    splitter,
    virtual,
    popupMatchSelectWidth: popupMatchSelectWidth !== null && popupMatchSelectWidth !== void 0 ? popupMatchSelectWidth : dropdownMatchSelectWidth,
    popupOverflow,
    getPrefixCls,
    iconPrefixCls,
    theme: mergedTheme,
    segmented,
    statistic,
    spin,
    calendar,
    carousel,
    cascader,
    collapse,
    typography,
    checkbox,
    descriptions,
    divider,
    drawer,
    skeleton,
    steps,
    image,
    input,
    textArea,
    layout,
    list,
    mentions,
    modal,
    progress,
    result,
    slider,
    breadcrumb,
    menu,
    pagination,
    empty,
    badge,
    radio,
    rate,
    switch: SWITCH,
    transfer,
    avatar,
    message: message2,
    tag,
    table,
    card,
    tabs,
    timeline,
    timePicker,
    upload,
    notification,
    tree,
    colorPicker,
    datePicker,
    rangePicker,
    flex,
    wave,
    dropdown,
    warning: warningConfig,
    tour,
    tooltip,
    popover,
    popconfirm,
    floatButtonGroup,
    variant,
    inputNumber,
    treeSelect
  };
  const config = Object.assign({}, parentContext);
  Object.keys(baseConfig).forEach((key) => {
    if (baseConfig[key] !== void 0) {
      config[key] = baseConfig[key];
    }
  });
  PASSED_PROPS.forEach((propName) => {
    const propValue = props[propName];
    if (propValue) {
      config[propName] = propValue;
    }
  });
  if (typeof autoInsertSpaceInButton !== "undefined") {
    config.button = Object.assign({
      autoInsertSpace: autoInsertSpaceInButton
    }, config.button);
  }
  const memoedConfig = useMemo(() => config, config, (prevConfig, currentConfig) => {
    const prevKeys = Object.keys(prevConfig);
    const currentKeys = Object.keys(currentConfig);
    return prevKeys.length !== currentKeys.length || prevKeys.some((key) => prevConfig[key] !== currentConfig[key]);
  });
  const {
    layer
  } = reactExports.useContext(StyleContext);
  const memoIconContextValue = reactExports.useMemo(() => ({
    prefixCls: iconPrefixCls,
    csp,
    layer: layer ? "antd" : void 0
  }), [iconPrefixCls, csp, layer]);
  let childNode = /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(PropWarning, {
    dropdownMatchSelectWidth
  }), children);
  const validateMessages = reactExports.useMemo(() => {
    var _a, _b, _c, _d;
    return merge(((_a = localeValues.Form) === null || _a === void 0 ? void 0 : _a.defaultValidateMessages) || {}, ((_c = (_b = memoedConfig.locale) === null || _b === void 0 ? void 0 : _b.Form) === null || _c === void 0 ? void 0 : _c.defaultValidateMessages) || {}, ((_d = memoedConfig.form) === null || _d === void 0 ? void 0 : _d.validateMessages) || {}, (form === null || form === void 0 ? void 0 : form.validateMessages) || {});
  }, [memoedConfig, form === null || form === void 0 ? void 0 : form.validateMessages]);
  if (Object.keys(validateMessages).length > 0) {
    childNode = /* @__PURE__ */ reactExports.createElement(ValidateMessagesContext.Provider, {
      value: validateMessages
    }, childNode);
  }
  if (locale2) {
    childNode = /* @__PURE__ */ reactExports.createElement(LocaleProvider, {
      locale: locale2,
      _ANT_MARK__: ANT_MARK
    }, childNode);
  }
  {
    childNode = /* @__PURE__ */ reactExports.createElement(IconContext.Provider, {
      value: memoIconContextValue
    }, childNode);
  }
  if (componentSize) {
    childNode = /* @__PURE__ */ reactExports.createElement(SizeContextProvider, {
      size: componentSize
    }, childNode);
  }
  childNode = /* @__PURE__ */ reactExports.createElement(MotionWrapper, null, childNode);
  const memoTheme = reactExports.useMemo(() => {
    const _a = mergedTheme || {}, {
      algorithm,
      token,
      components,
      cssVar
    } = _a, rest = __rest$V(_a, ["algorithm", "token", "components", "cssVar"]);
    const themeObj = algorithm && (!Array.isArray(algorithm) || algorithm.length > 0) ? createTheme(algorithm) : defaultTheme;
    const parsedComponents = {};
    Object.entries(components || {}).forEach(([componentName, componentToken]) => {
      const parsedToken = Object.assign({}, componentToken);
      if ("algorithm" in parsedToken) {
        if (parsedToken.algorithm === true) {
          parsedToken.theme = themeObj;
        } else if (Array.isArray(parsedToken.algorithm) || typeof parsedToken.algorithm === "function") {
          parsedToken.theme = createTheme(parsedToken.algorithm);
        }
        delete parsedToken.algorithm;
      }
      parsedComponents[componentName] = parsedToken;
    });
    const mergedToken = Object.assign(Object.assign({}, seedToken), token);
    return Object.assign(Object.assign({}, rest), {
      theme: themeObj,
      token: mergedToken,
      components: parsedComponents,
      override: Object.assign({
        override: mergedToken
      }, parsedComponents),
      cssVar
    });
  }, [mergedTheme]);
  if (theme) {
    childNode = /* @__PURE__ */ reactExports.createElement(DesignTokenContext.Provider, {
      value: memoTheme
    }, childNode);
  }
  if (memoedConfig.warning) {
    childNode = /* @__PURE__ */ reactExports.createElement(WarningContext.Provider, {
      value: memoedConfig.warning
    }, childNode);
  }
  if (componentDisabled !== void 0) {
    childNode = /* @__PURE__ */ reactExports.createElement(DisabledContextProvider, {
      disabled: componentDisabled
    }, childNode);
  }
  return /* @__PURE__ */ reactExports.createElement(ConfigContext.Provider, {
    value: memoedConfig
  }, childNode);
};
const ConfigProvider = (props) => {
  const context = reactExports.useContext(ConfigContext);
  const antLocale = reactExports.useContext(LocaleContext);
  return /* @__PURE__ */ reactExports.createElement(ProviderChildren, Object.assign({
    parentContext: context,
    legacyLocale: antLocale
  }, props));
};
ConfigProvider.ConfigContext = ConfigContext;
ConfigProvider.SizeContext = SizeContext;
ConfigProvider.config = setGlobalConfig;
ConfigProvider.useConfig = useConfig;
Object.defineProperty(ConfigProvider, "SizeContext", {
  get: () => {
    return SizeContext;
  }
});
function isWindow(obj) {
  return obj !== null && obj !== void 0 && obj === obj.window;
}
const getScroll = (target) => {
  var _a, _b;
  if (typeof window === "undefined") {
    return 0;
  }
  let result = 0;
  if (isWindow(target)) {
    result = target.pageYOffset;
  } else if (target instanceof Document) {
    result = target.documentElement.scrollTop;
  } else if (target instanceof HTMLElement) {
    result = target.scrollTop;
  } else if (target) {
    result = target["scrollTop"];
  }
  if (target && !isWindow(target) && typeof result !== "number") {
    result = (_b = ((_a = target.ownerDocument) !== null && _a !== void 0 ? _a : target).documentElement) === null || _b === void 0 ? void 0 : _b.scrollTop;
  }
  return result;
};
function easeInOutCubic(t, b, c, d) {
  const cc = c - b;
  t /= d / 2;
  if (t < 1) {
    return cc / 2 * t * t * t + b;
  }
  return cc / 2 * ((t -= 2) * t * t + 2) + b;
}
function scrollTo(y, options = {}) {
  const {
    getContainer = () => window,
    callback,
    duration = 450
  } = options;
  const container = getContainer();
  const scrollTop = getScroll(container);
  const startTime = Date.now();
  const frameFunc = () => {
    const timestamp = Date.now();
    const time = timestamp - startTime;
    const nextScrollTop = easeInOutCubic(time > duration ? duration : time, scrollTop, y, duration);
    if (isWindow(container)) {
      container.scrollTo(window.pageXOffset, nextScrollTop);
    } else if (container instanceof Document || container.constructor.name === "HTMLDocument") {
      container.documentElement.scrollTop = nextScrollTop;
    } else {
      container.scrollTop = nextScrollTop;
    }
    if (time < duration) {
      wrapperRaf(frameFunc);
    } else if (typeof callback === "function") {
      callback();
    }
  };
  wrapperRaf(frameFunc);
}
const useCSSVarCls = (prefixCls) => {
  const [, , , , cssVar] = useToken();
  return cssVar ? `${prefixCls}-css-var` : "";
};
const zIndexContext = /* @__PURE__ */ React.createContext(void 0);
const CONTAINER_OFFSET = 100;
const CONTAINER_OFFSET_MAX_COUNT = 10;
const CONTAINER_MAX_OFFSET = CONTAINER_OFFSET * CONTAINER_OFFSET_MAX_COUNT;
const containerBaseZIndexOffset = {
  Modal: CONTAINER_OFFSET,
  Drawer: CONTAINER_OFFSET,
  Popover: CONTAINER_OFFSET,
  Popconfirm: CONTAINER_OFFSET,
  Tooltip: CONTAINER_OFFSET,
  Tour: CONTAINER_OFFSET,
  FloatButton: CONTAINER_OFFSET
};
const consumerBaseZIndexOffset = {
  SelectLike: 50,
  Dropdown: 50,
  DatePicker: 50,
  Menu: 50,
  ImagePreview: 1
};
function isContainerType(type) {
  return type in containerBaseZIndexOffset;
}
const useZIndex = (componentType, customZIndex) => {
  const [, token] = useToken();
  const parentZIndex = React.useContext(zIndexContext);
  const isContainer = isContainerType(componentType);
  let result;
  if (customZIndex !== void 0) {
    result = [customZIndex, customZIndex];
  } else {
    let zIndex = parentZIndex !== null && parentZIndex !== void 0 ? parentZIndex : 0;
    if (isContainer) {
      zIndex += // Use preset token zIndex by default but not stack when has parent container
      (parentZIndex ? 0 : token.zIndexPopupBase) + // Container offset
      containerBaseZIndexOffset[componentType];
    } else {
      zIndex += consumerBaseZIndexOffset[componentType];
    }
    result = [parentZIndex === void 0 ? customZIndex : zIndex, zIndex];
  }
  return result;
};
const genMessageStyle = (token) => {
  const {
    componentCls,
    iconCls,
    boxShadow,
    colorText,
    colorSuccess,
    colorError,
    colorWarning,
    colorInfo,
    fontSizeLG,
    motionEaseInOutCirc,
    motionDurationSlow,
    marginXS,
    paddingXS,
    borderRadiusLG,
    zIndexPopup,
    // Custom token
    contentPadding,
    contentBg
  } = token;
  const noticeCls = `${componentCls}-notice`;
  const messageMoveIn = new Keyframe("MessageMoveIn", {
    "0%": {
      padding: 0,
      transform: "translateY(-100%)",
      opacity: 0
    },
    "100%": {
      padding: paddingXS,
      transform: "translateY(0)",
      opacity: 1
    }
  });
  const messageMoveOut = new Keyframe("MessageMoveOut", {
    "0%": {
      maxHeight: token.height,
      padding: paddingXS,
      opacity: 1
    },
    "100%": {
      maxHeight: 0,
      padding: 0,
      opacity: 0
    }
  });
  const noticeStyle = {
    padding: paddingXS,
    textAlign: "center",
    [`${componentCls}-custom-content`]: {
      display: "flex",
      alignItems: "center"
    },
    [`${componentCls}-custom-content > ${iconCls}`]: {
      marginInlineEnd: marginXS,
      // affected by ltr or rtl
      fontSize: fontSizeLG
    },
    [`${noticeCls}-content`]: {
      display: "inline-block",
      padding: contentPadding,
      background: contentBg,
      borderRadius: borderRadiusLG,
      boxShadow,
      pointerEvents: "all"
    },
    [`${componentCls}-success > ${iconCls}`]: {
      color: colorSuccess
    },
    [`${componentCls}-error > ${iconCls}`]: {
      color: colorError
    },
    [`${componentCls}-warning > ${iconCls}`]: {
      color: colorWarning
    },
    [`${componentCls}-info > ${iconCls},
      ${componentCls}-loading > ${iconCls}`]: {
      color: colorInfo
    }
  };
  return [
    // ============================ Holder ============================
    {
      [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
        color: colorText,
        position: "fixed",
        top: marginXS,
        width: "100%",
        pointerEvents: "none",
        zIndex: zIndexPopup,
        [`${componentCls}-move-up`]: {
          animationFillMode: "forwards"
        },
        [`
        ${componentCls}-move-up-appear,
        ${componentCls}-move-up-enter
      `]: {
          animationName: messageMoveIn,
          animationDuration: motionDurationSlow,
          animationPlayState: "paused",
          animationTimingFunction: motionEaseInOutCirc
        },
        [`
        ${componentCls}-move-up-appear${componentCls}-move-up-appear-active,
        ${componentCls}-move-up-enter${componentCls}-move-up-enter-active
      `]: {
          animationPlayState: "running"
        },
        [`${componentCls}-move-up-leave`]: {
          animationName: messageMoveOut,
          animationDuration: motionDurationSlow,
          animationPlayState: "paused",
          animationTimingFunction: motionEaseInOutCirc
        },
        [`${componentCls}-move-up-leave${componentCls}-move-up-leave-active`]: {
          animationPlayState: "running"
        },
        "&-rtl": {
          direction: "rtl",
          span: {
            direction: "rtl"
          }
        }
      })
    },
    // ============================ Notice ============================
    {
      [componentCls]: {
        [`${noticeCls}-wrapper`]: Object.assign({}, noticeStyle)
      }
    },
    // ============================= Pure =============================
    {
      [`${componentCls}-notice-pure-panel`]: Object.assign(Object.assign({}, noticeStyle), {
        padding: 0,
        textAlign: "start"
      })
    }
  ];
};
const prepareComponentToken$m = (token) => ({
  zIndexPopup: token.zIndexPopupBase + CONTAINER_MAX_OFFSET + 10,
  contentBg: token.colorBgElevated,
  contentPadding: `${(token.controlHeightLG - token.fontSize * token.lineHeight) / 2}px ${token.paddingSM}px`
});
const useStyle$s = genStyleHooks("Message", (token) => {
  const combinedToken = merge$1(token, {
    height: 150
  });
  return [genMessageStyle(combinedToken)];
}, prepareComponentToken$m);
var __rest$U = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const TypeIcon = {
  info: /* @__PURE__ */ reactExports.createElement(RefIcon$4, null),
  success: /* @__PURE__ */ reactExports.createElement(RefIcon$3, null),
  error: /* @__PURE__ */ reactExports.createElement(RefIcon$2, null),
  warning: /* @__PURE__ */ reactExports.createElement(RefIcon$1, null),
  loading: /* @__PURE__ */ reactExports.createElement(RefIcon, null)
};
const PureContent = ({
  prefixCls,
  type,
  icon,
  children
}) => /* @__PURE__ */ reactExports.createElement("div", {
  className: classNames(`${prefixCls}-custom-content`, `${prefixCls}-${type}`)
}, icon || TypeIcon[type], /* @__PURE__ */ reactExports.createElement("span", null, children));
const PurePanel$6 = (props) => {
  const {
    prefixCls: staticPrefixCls,
    className,
    type,
    icon,
    content
  } = props, restProps = __rest$U(props, ["prefixCls", "className", "type", "icon", "content"]);
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = staticPrefixCls || getPrefixCls("message");
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$s(prefixCls, rootCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(Notify, Object.assign({}, restProps, {
    prefixCls,
    className: classNames(className, hashId, `${prefixCls}-notice-pure-panel`, cssVarCls, rootCls),
    eventKey: "pure",
    duration: null,
    content: /* @__PURE__ */ reactExports.createElement(PureContent, {
      prefixCls,
      type,
      icon
    }, content)
  })));
};
function getMotion(prefixCls, transitionName) {
  return {
    motionName: transitionName !== null && transitionName !== void 0 ? transitionName : `${prefixCls}-move-up`
  };
}
function wrapPromiseFn(openFn) {
  let closeFn;
  const closePromise = new Promise((resolve) => {
    closeFn = openFn(() => {
      resolve(true);
    });
  });
  const result = () => {
    closeFn === null || closeFn === void 0 ? void 0 : closeFn();
  };
  result.then = (filled, rejected) => closePromise.then(filled, rejected);
  result.promise = closePromise;
  return result;
}
var __rest$T = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const DEFAULT_OFFSET = 8;
const DEFAULT_DURATION = 3;
const Wrapper = ({
  children,
  prefixCls
}) => {
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$s(prefixCls, rootCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(NotificationProvider, {
    classNames: {
      list: classNames(hashId, cssVarCls, rootCls)
    }
  }, children));
};
const renderNotifications = (node, {
  prefixCls,
  key
}) => /* @__PURE__ */ reactExports.createElement(Wrapper, {
  prefixCls,
  key
}, node);
const Holder = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    top,
    prefixCls: staticPrefixCls,
    getContainer: staticGetContainer,
    maxCount,
    duration = DEFAULT_DURATION,
    rtl,
    transitionName,
    onAllRemoved
  } = props;
  const {
    getPrefixCls,
    getPopupContainer,
    message: message2,
    direction
  } = reactExports.useContext(ConfigContext);
  const prefixCls = staticPrefixCls || getPrefixCls("message");
  const getStyle2 = () => ({
    left: "50%",
    transform: "translateX(-50%)",
    top: top !== null && top !== void 0 ? top : DEFAULT_OFFSET
  });
  const getClassName = () => classNames({
    [`${prefixCls}-rtl`]: rtl !== null && rtl !== void 0 ? rtl : direction === "rtl"
  });
  const getNotificationMotion = () => getMotion(prefixCls, transitionName);
  const mergedCloseIcon = /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-close-x`
  }, /* @__PURE__ */ reactExports.createElement(RefIcon$5, {
    className: `${prefixCls}-close-icon`
  }));
  const [api, holder] = useNotification({
    prefixCls,
    style: getStyle2,
    className: getClassName,
    motion: getNotificationMotion,
    closable: false,
    closeIcon: mergedCloseIcon,
    duration,
    getContainer: () => (staticGetContainer === null || staticGetContainer === void 0 ? void 0 : staticGetContainer()) || (getPopupContainer === null || getPopupContainer === void 0 ? void 0 : getPopupContainer()) || document.body,
    maxCount,
    onAllRemoved,
    renderNotifications
  });
  reactExports.useImperativeHandle(ref, () => Object.assign(Object.assign({}, api), {
    prefixCls,
    message: message2
  }));
  return holder;
});
let keyIndex = 0;
function useInternalMessage(messageConfig) {
  const holderRef = reactExports.useRef(null);
  devUseWarning();
  const wrapAPI = reactExports.useMemo(() => {
    const close = (key) => {
      var _a;
      (_a = holderRef.current) === null || _a === void 0 ? void 0 : _a.close(key);
    };
    const open2 = (config) => {
      if (!holderRef.current) {
        const fakeResult = () => {
        };
        fakeResult.then = () => {
        };
        return fakeResult;
      }
      const {
        open: originOpen,
        prefixCls,
        message: message2
      } = holderRef.current;
      const noticePrefixCls = `${prefixCls}-notice`;
      const {
        content,
        icon,
        type,
        key,
        className,
        style,
        onClose
      } = config, restConfig = __rest$T(config, ["content", "icon", "type", "key", "className", "style", "onClose"]);
      let mergedKey = key;
      if (mergedKey === void 0 || mergedKey === null) {
        keyIndex += 1;
        mergedKey = `antd-message-${keyIndex}`;
      }
      return wrapPromiseFn((resolve) => {
        originOpen(Object.assign(Object.assign({}, restConfig), {
          key: mergedKey,
          content: /* @__PURE__ */ reactExports.createElement(PureContent, {
            prefixCls,
            type,
            icon
          }, content),
          placement: "top",
          className: classNames(type && `${noticePrefixCls}-${type}`, className, message2 === null || message2 === void 0 ? void 0 : message2.className),
          style: Object.assign(Object.assign({}, message2 === null || message2 === void 0 ? void 0 : message2.style), style),
          onClose: () => {
            onClose === null || onClose === void 0 ? void 0 : onClose();
            resolve();
          }
        }));
        return () => {
          close(mergedKey);
        };
      });
    };
    const destroy2 = (key) => {
      var _a;
      if (key !== void 0) {
        close(key);
      } else {
        (_a = holderRef.current) === null || _a === void 0 ? void 0 : _a.destroy();
      }
    };
    const clone = {
      open: open2,
      destroy: destroy2
    };
    const keys = ["info", "success", "warning", "error", "loading"];
    keys.forEach((type) => {
      const typeOpen2 = (jointContent, duration, onClose) => {
        let config;
        if (jointContent && typeof jointContent === "object" && "content" in jointContent) {
          config = jointContent;
        } else {
          config = {
            content: jointContent
          };
        }
        let mergedDuration;
        let mergedOnClose;
        if (typeof duration === "function") {
          mergedOnClose = duration;
        } else {
          mergedDuration = duration;
          mergedOnClose = onClose;
        }
        const mergedConfig = Object.assign(Object.assign({
          onClose: mergedOnClose,
          duration: mergedDuration
        }, config), {
          type
        });
        return open2(mergedConfig);
      };
      clone[type] = typeOpen2;
    });
    return clone;
  }, []);
  return [wrapAPI, /* @__PURE__ */ reactExports.createElement(Holder, Object.assign({
    key: "message-holder"
  }, messageConfig, {
    ref: holderRef
  }))];
}
function useMessage(messageConfig) {
  return useInternalMessage(messageConfig);
}
function usePatchElement() {
  const [elements, setElements] = reactExports.useState([]);
  const patchElement = reactExports.useCallback((element) => {
    setElements((originElements) => [].concat(_toConsumableArray(originElements), [element]));
    return () => {
      setElements((originElements) => originElements.filter((ele) => ele !== element));
    };
  }, []);
  return [elements, patchElement];
}
const defaultReactRender = (node, container) => {
  render(node, container);
  return () => {
    return unmount(container);
  };
};
let unstableRender = defaultReactRender;
function unstableSetRender(render2) {
  return unstableRender;
}
const getCollapsedHeight = () => ({
  height: 0,
  opacity: 0
});
const getRealHeight = (node) => {
  const {
    scrollHeight
  } = node;
  return {
    height: scrollHeight,
    opacity: 1
  };
};
const getCurrentHeight = (node) => ({
  height: node ? node.offsetHeight : 0
});
const skipOpacityTransition = (_, event) => (event === null || event === void 0 ? void 0 : event.deadline) === true || event.propertyName === "height";
const initCollapseMotion = (rootCls = defaultPrefixCls) => ({
  motionName: `${rootCls}-motion-collapse`,
  onAppearStart: getCollapsedHeight,
  onEnterStart: getCollapsedHeight,
  onAppearActive: getRealHeight,
  onEnterActive: getRealHeight,
  onLeaveStart: getCurrentHeight,
  onLeaveActive: getCollapsedHeight,
  onAppearEnd: skipOpacityTransition,
  onEnterEnd: skipOpacityTransition,
  onLeaveEnd: skipOpacityTransition,
  motionDeadline: 500
});
const getTransitionName = (rootPrefixCls, motion2, transitionName) => {
  if (transitionName !== void 0) {
    return transitionName;
  }
  return `${rootPrefixCls}-${motion2}`;
};
const genWaveStyle = (token) => {
  const {
    componentCls,
    colorPrimary
  } = token;
  return {
    [componentCls]: {
      position: "absolute",
      background: "transparent",
      pointerEvents: "none",
      boxSizing: "border-box",
      color: `var(--wave-color, ${colorPrimary})`,
      boxShadow: `0 0 0 0 currentcolor`,
      opacity: 0.2,
      // =================== Motion ===================
      "&.wave-motion-appear": {
        transition: [`box-shadow 0.4s ${token.motionEaseOutCirc}`, `opacity 2s ${token.motionEaseOutCirc}`].join(","),
        "&-active": {
          boxShadow: `0 0 0 6px currentcolor`,
          opacity: 0
        },
        "&.wave-quick": {
          transition: [`box-shadow ${token.motionDurationSlow} ${token.motionEaseInOut}`, `opacity ${token.motionDurationSlow} ${token.motionEaseInOut}`].join(",")
        }
      }
    }
  };
};
const useStyle$r = genComponentStyleHook("Wave", (token) => [genWaveStyle(token)]);
const TARGET_CLS = `${defaultPrefixCls}-wave-target`;
function isValidWaveColor(color) {
  return color && color !== "#fff" && color !== "#ffffff" && color !== "rgb(255, 255, 255)" && color !== "rgba(255, 255, 255, 1)" && !/rgba\((?:\d*, ){3}0\)/.test(color) && // any transparent rgba color
  color !== "transparent";
}
function getTargetWaveColor(node) {
  const {
    borderTopColor,
    borderColor,
    backgroundColor
  } = getComputedStyle(node);
  if (isValidWaveColor(borderTopColor)) {
    return borderTopColor;
  }
  if (isValidWaveColor(borderColor)) {
    return borderColor;
  }
  if (isValidWaveColor(backgroundColor)) {
    return backgroundColor;
  }
  return null;
}
function validateNum(value) {
  return Number.isNaN(value) ? 0 : value;
}
const WaveEffect = (props) => {
  const {
    className,
    target,
    component,
    registerUnmount
  } = props;
  const divRef = reactExports.useRef(null);
  const unmountRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    unmountRef.current = registerUnmount();
  }, []);
  const [color, setWaveColor] = reactExports.useState(null);
  const [borderRadius, setBorderRadius] = reactExports.useState([]);
  const [left, setLeft] = reactExports.useState(0);
  const [top, setTop] = reactExports.useState(0);
  const [width, setWidth] = reactExports.useState(0);
  const [height, setHeight] = reactExports.useState(0);
  const [enabled, setEnabled] = reactExports.useState(false);
  const waveStyle = {
    left,
    top,
    width,
    height,
    borderRadius: borderRadius.map((radius2) => `${radius2}px`).join(" ")
  };
  if (color) {
    waveStyle["--wave-color"] = color;
  }
  function syncPos() {
    const nodeStyle = getComputedStyle(target);
    setWaveColor(getTargetWaveColor(target));
    const isStatic = nodeStyle.position === "static";
    const {
      borderLeftWidth,
      borderTopWidth
    } = nodeStyle;
    setLeft(isStatic ? target.offsetLeft : validateNum(-parseFloat(borderLeftWidth)));
    setTop(isStatic ? target.offsetTop : validateNum(-parseFloat(borderTopWidth)));
    setWidth(target.offsetWidth);
    setHeight(target.offsetHeight);
    const {
      borderTopLeftRadius,
      borderTopRightRadius,
      borderBottomLeftRadius,
      borderBottomRightRadius
    } = nodeStyle;
    setBorderRadius([borderTopLeftRadius, borderTopRightRadius, borderBottomRightRadius, borderBottomLeftRadius].map((radius2) => validateNum(parseFloat(radius2))));
  }
  reactExports.useEffect(() => {
    if (target) {
      const id = wrapperRaf(() => {
        syncPos();
        setEnabled(true);
      });
      let resizeObserver;
      if (typeof ResizeObserver !== "undefined") {
        resizeObserver = new ResizeObserver(syncPos);
        resizeObserver.observe(target);
      }
      return () => {
        wrapperRaf.cancel(id);
        resizeObserver === null || resizeObserver === void 0 ? void 0 : resizeObserver.disconnect();
      };
    }
  }, []);
  if (!enabled) {
    return null;
  }
  const isSmallComponent = (component === "Checkbox" || component === "Radio") && (target === null || target === void 0 ? void 0 : target.classList.contains(TARGET_CLS));
  return /* @__PURE__ */ reactExports.createElement(CSSMotion, {
    visible: true,
    motionAppear: true,
    motionName: "wave-motion",
    motionDeadline: 5e3,
    onAppearEnd: (_, event) => {
      var _a, _b;
      if (event.deadline || event.propertyName === "opacity") {
        const holder = (_a = divRef.current) === null || _a === void 0 ? void 0 : _a.parentElement;
        (_b = unmountRef.current) === null || _b === void 0 ? void 0 : _b.call(unmountRef).then(() => {
          holder === null || holder === void 0 ? void 0 : holder.remove();
        });
      }
      return false;
    }
  }, ({
    className: motionClassName
  }, ref) => /* @__PURE__ */ reactExports.createElement("div", {
    ref: composeRef(divRef, ref),
    className: classNames(className, motionClassName, {
      "wave-quick": isSmallComponent
    }),
    style: waveStyle
  }));
};
const showWaveEffect = (target, info) => {
  var _a;
  const {
    component
  } = info;
  if (component === "Checkbox" && !((_a = target.querySelector("input")) === null || _a === void 0 ? void 0 : _a.checked)) {
    return;
  }
  const holder = document.createElement("div");
  holder.style.position = "absolute";
  holder.style.left = "0px";
  holder.style.top = "0px";
  target === null || target === void 0 ? void 0 : target.insertBefore(holder, target === null || target === void 0 ? void 0 : target.firstChild);
  const reactRender = unstableSetRender();
  let unmountCallback = null;
  function registerUnmount() {
    return unmountCallback;
  }
  unmountCallback = reactRender(/* @__PURE__ */ reactExports.createElement(WaveEffect, Object.assign({}, info, {
    target,
    registerUnmount
  })), holder);
};
const useWave = (nodeRef, className, component) => {
  const {
    wave
  } = reactExports.useContext(ConfigContext);
  const [, token, hashId] = useToken();
  const showWave = useEvent((event) => {
    const node = nodeRef.current;
    if ((wave === null || wave === void 0 ? void 0 : wave.disabled) || !node) {
      return;
    }
    const targetNode = node.querySelector(`.${TARGET_CLS}`) || node;
    const {
      showEffect
    } = wave || {};
    (showEffect || showWaveEffect)(targetNode, {
      className,
      token,
      component,
      event,
      hashId
    });
  });
  const rafId = reactExports.useRef(null);
  const showDebounceWave = (event) => {
    wrapperRaf.cancel(rafId.current);
    rafId.current = wrapperRaf(() => {
      showWave(event);
    });
  };
  return showDebounceWave;
};
const Wave = (props) => {
  const {
    children,
    disabled,
    component
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const containerRef = reactExports.useRef(null);
  const prefixCls = getPrefixCls("wave");
  const [, hashId] = useStyle$r(prefixCls);
  const showWave = useWave(containerRef, classNames(prefixCls, hashId), component);
  React.useEffect(() => {
    const node = containerRef.current;
    if (!node || node.nodeType !== 1 || disabled) {
      return;
    }
    const onClick = (e2) => {
      if (!isVisible(e2.target) || // No need wave
      !node.getAttribute || node.getAttribute("disabled") || node.disabled || node.className.includes("disabled") || node.className.includes("-leave")) {
        return;
      }
      showWave(e2);
    };
    node.addEventListener("click", onClick, true);
    return () => {
      node.removeEventListener("click", onClick, true);
    };
  }, [disabled]);
  if (!/* @__PURE__ */ React.isValidElement(children)) {
    return children !== null && children !== void 0 ? children : null;
  }
  const ref = supportRef(children) ? composeRef(getNodeRef(children), containerRef) : containerRef;
  return cloneElement(children, {
    ref
  });
};
const useSize = (customSize) => {
  const size = React.useContext(SizeContext);
  const mergedSize = React.useMemo(() => {
    if (!customSize) {
      return size;
    }
    if (typeof customSize === "string") {
      return customSize !== null && customSize !== void 0 ? customSize : size;
    }
    if (typeof customSize === "function") {
      return customSize(size);
    }
    return size;
  }, [customSize, size]);
  return mergedSize;
};
const genSpaceCompactStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [componentCls]: {
      "&-block": {
        display: "flex",
        width: "100%"
      },
      "&-vertical": {
        flexDirection: "column"
      }
    }
  };
};
const genSpaceStyle = (token) => {
  const {
    componentCls,
    antCls
  } = token;
  return {
    [componentCls]: {
      display: "inline-flex",
      "&-rtl": {
        direction: "rtl"
      },
      "&-vertical": {
        flexDirection: "column"
      },
      "&-align": {
        flexDirection: "column",
        "&-center": {
          alignItems: "center"
        },
        "&-start": {
          alignItems: "flex-start"
        },
        "&-end": {
          alignItems: "flex-end"
        },
        "&-baseline": {
          alignItems: "baseline"
        }
      },
      [`${componentCls}-item:empty`]: {
        display: "none"
      },
      // https://github.com/ant-design/ant-design/issues/47875
      [`${componentCls}-item > ${antCls}-badge-not-a-wrapper:only-child`]: {
        display: "block"
      }
    }
  };
};
const genSpaceGapStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [componentCls]: {
      "&-gap-row-small": {
        rowGap: token.spaceGapSmallSize
      },
      "&-gap-row-middle": {
        rowGap: token.spaceGapMiddleSize
      },
      "&-gap-row-large": {
        rowGap: token.spaceGapLargeSize
      },
      "&-gap-col-small": {
        columnGap: token.spaceGapSmallSize
      },
      "&-gap-col-middle": {
        columnGap: token.spaceGapMiddleSize
      },
      "&-gap-col-large": {
        columnGap: token.spaceGapLargeSize
      }
    }
  };
};
const useStyle$q = genStyleHooks("Space", (token) => {
  const spaceToken = merge$1(token, {
    spaceGapSmallSize: token.paddingXS,
    spaceGapMiddleSize: token.padding,
    spaceGapLargeSize: token.paddingLG
  });
  return [genSpaceStyle(spaceToken), genSpaceGapStyle(spaceToken), genSpaceCompactStyle(spaceToken)];
}, () => ({}), {
  // Space component don't apply extra font style
  // https://github.com/ant-design/ant-design/issues/40315
  resetStyle: false
});
var __rest$S = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const SpaceCompactItemContext = /* @__PURE__ */ reactExports.createContext(null);
const useCompactItemContext = (prefixCls, direction) => {
  const compactItemContext = reactExports.useContext(SpaceCompactItemContext);
  const compactItemClassnames = reactExports.useMemo(() => {
    if (!compactItemContext) {
      return "";
    }
    const {
      compactDirection,
      isFirstItem,
      isLastItem
    } = compactItemContext;
    const separator = compactDirection === "vertical" ? "-vertical-" : "-";
    return classNames(`${prefixCls}-compact${separator}item`, {
      [`${prefixCls}-compact${separator}first-item`]: isFirstItem,
      [`${prefixCls}-compact${separator}last-item`]: isLastItem,
      [`${prefixCls}-compact${separator}item-rtl`]: direction === "rtl"
    });
  }, [prefixCls, direction, compactItemContext]);
  return {
    compactSize: compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.compactSize,
    compactDirection: compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.compactDirection,
    compactItemClassnames
  };
};
const NoCompactStyle = (props) => {
  const {
    children
  } = props;
  return /* @__PURE__ */ reactExports.createElement(SpaceCompactItemContext.Provider, {
    value: null
  }, children);
};
const CompactItem = (props) => {
  const {
    children
  } = props, others = __rest$S(props, ["children"]);
  return /* @__PURE__ */ reactExports.createElement(SpaceCompactItemContext.Provider, {
    value: reactExports.useMemo(() => others, [others])
  }, children);
};
const Compact$1 = (props) => {
  const {
    getPrefixCls,
    direction: directionConfig
  } = reactExports.useContext(ConfigContext);
  const {
    size,
    direction,
    block,
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children
  } = props, restProps = __rest$S(props, ["size", "direction", "block", "prefixCls", "className", "rootClassName", "children"]);
  const mergedSize = useSize((ctx) => size !== null && size !== void 0 ? size : ctx);
  const prefixCls = getPrefixCls("space-compact", customizePrefixCls);
  const [wrapCSSVar, hashId] = useStyle$q(prefixCls);
  const clx = classNames(prefixCls, hashId, {
    [`${prefixCls}-rtl`]: directionConfig === "rtl",
    [`${prefixCls}-block`]: block,
    [`${prefixCls}-vertical`]: direction === "vertical"
  }, className, rootClassName);
  const compactItemContext = reactExports.useContext(SpaceCompactItemContext);
  const childNodes = toArray$1(children);
  const nodes = reactExports.useMemo(() => childNodes.map((child, i) => {
    const key = (child === null || child === void 0 ? void 0 : child.key) || `${prefixCls}-item-${i}`;
    return /* @__PURE__ */ reactExports.createElement(CompactItem, {
      key,
      compactSize: mergedSize,
      compactDirection: direction,
      isFirstItem: i === 0 && (!compactItemContext || (compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.isFirstItem)),
      isLastItem: i === childNodes.length - 1 && (!compactItemContext || (compactItemContext === null || compactItemContext === void 0 ? void 0 : compactItemContext.isLastItem))
    }, child);
  }), [size, childNodes, compactItemContext]);
  if (childNodes.length === 0) {
    return null;
  }
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({
    className: clx
  }, restProps), nodes));
};
var __rest$R = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const GroupSizeContext = /* @__PURE__ */ reactExports.createContext(void 0);
const ButtonGroup = (props) => {
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    size,
    className
  } = props, others = __rest$R(props, ["prefixCls", "size", "className"]);
  const prefixCls = getPrefixCls("btn-group", customizePrefixCls);
  const [, , hashId] = useToken();
  const sizeCls = reactExports.useMemo(() => {
    switch (size) {
      case "large":
        return "lg";
      case "small":
        return "sm";
      default:
        return "";
    }
  }, [size]);
  const classes = classNames(prefixCls, {
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, className, hashId);
  return /* @__PURE__ */ reactExports.createElement(GroupSizeContext.Provider, {
    value: size
  }, /* @__PURE__ */ reactExports.createElement("div", Object.assign({}, others, {
    className: classes
  })));
};
const rxTwoCNChar = /^[\u4E00-\u9FA5]{2}$/;
const isTwoCNChar = rxTwoCNChar.test.bind(rxTwoCNChar);
function convertLegacyProps(type) {
  if (type === "danger") {
    return {
      danger: true
    };
  }
  return {
    type
  };
}
function isString(str) {
  return typeof str === "string";
}
function isUnBorderedButtonVariant(type) {
  return type === "text" || type === "link";
}
function splitCNCharsBySpace(child, needInserted) {
  if (child === null || child === void 0) {
    return;
  }
  const SPACE = needInserted ? " " : "";
  if (typeof child !== "string" && typeof child !== "number" && isString(child.type) && isTwoCNChar(child.props.children)) {
    return cloneElement(child, {
      children: child.props.children.split("").join(SPACE)
    });
  }
  if (isString(child)) {
    return isTwoCNChar(child) ? /* @__PURE__ */ React.createElement("span", null, child.split("").join(SPACE)) : /* @__PURE__ */ React.createElement("span", null, child);
  }
  if (isFragment(child)) {
    return /* @__PURE__ */ React.createElement("span", null, child);
  }
  return child;
}
function spaceChildren(children, needInserted) {
  let isPrevChildPure = false;
  const childList = [];
  React.Children.forEach(children, (child) => {
    const type = typeof child;
    const isCurrentChildPure = type === "string" || type === "number";
    if (isPrevChildPure && isCurrentChildPure) {
      const lastIndex = childList.length - 1;
      const lastChild = childList[lastIndex];
      childList[lastIndex] = `${lastChild}${child}`;
    } else {
      childList.push(child);
    }
    isPrevChildPure = isCurrentChildPure;
  });
  return React.Children.map(childList, (child) => splitCNCharsBySpace(child, needInserted));
}
["default", "primary", "danger"].concat(_toConsumableArray(PresetColors));
const IconWrapper = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    className,
    style,
    children,
    prefixCls
  } = props;
  const iconWrapperCls = classNames(`${prefixCls}-icon`, className);
  return /* @__PURE__ */ React.createElement("span", {
    ref,
    className: iconWrapperCls,
    style
  }, children);
});
const InnerLoadingIcon = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls,
    className,
    style,
    iconClassName
  } = props;
  const mergedIconCls = classNames(`${prefixCls}-loading-icon`, className);
  return /* @__PURE__ */ React.createElement(IconWrapper, {
    prefixCls,
    className: mergedIconCls,
    style,
    ref
  }, /* @__PURE__ */ React.createElement(RefIcon, {
    className: iconClassName
  }));
});
const getCollapsedWidth = () => ({
  width: 0,
  opacity: 0,
  transform: "scale(0)"
});
const getRealWidth = (node) => ({
  width: node.scrollWidth,
  opacity: 1,
  transform: "scale(1)"
});
const DefaultLoadingIcon = (props) => {
  const {
    prefixCls,
    loading,
    existIcon,
    className,
    style,
    mount
  } = props;
  const visible = !!loading;
  if (existIcon) {
    return /* @__PURE__ */ React.createElement(InnerLoadingIcon, {
      prefixCls,
      className,
      style
    });
  }
  return /* @__PURE__ */ React.createElement(CSSMotion, {
    visible,
    // Used for minus flex gap style only
    motionName: `${prefixCls}-loading-icon-motion`,
    motionAppear: !mount,
    motionEnter: !mount,
    motionLeave: !mount,
    removeOnLeave: true,
    onAppearStart: getCollapsedWidth,
    onAppearActive: getRealWidth,
    onEnterStart: getCollapsedWidth,
    onEnterActive: getRealWidth,
    onLeaveStart: getRealWidth,
    onLeaveActive: getCollapsedWidth
  }, ({
    className: motionCls,
    style: motionStyle
  }, ref) => {
    const mergedStyle = Object.assign(Object.assign({}, style), motionStyle);
    return /* @__PURE__ */ React.createElement(InnerLoadingIcon, {
      prefixCls,
      className: classNames(className, motionCls),
      style: mergedStyle,
      ref
    });
  });
};
const genButtonBorderStyle = (buttonTypeCls, borderColor) => ({
  // Border
  [`> span, > ${buttonTypeCls}`]: {
    "&:not(:last-child)": {
      [`&, & > ${buttonTypeCls}`]: {
        "&:not(:disabled)": {
          borderInlineEndColor: borderColor
        }
      }
    },
    "&:not(:first-child)": {
      [`&, & > ${buttonTypeCls}`]: {
        "&:not(:disabled)": {
          borderInlineStartColor: borderColor
        }
      }
    }
  }
});
const genGroupStyle$1 = (token) => {
  const {
    componentCls,
    fontSize,
    lineWidth,
    groupBorderColor,
    colorErrorHover
  } = token;
  return {
    [`${componentCls}-group`]: [
      {
        position: "relative",
        display: "inline-flex",
        // Border
        [`> span, > ${componentCls}`]: {
          "&:not(:last-child)": {
            [`&, & > ${componentCls}`]: {
              borderStartEndRadius: 0,
              borderEndEndRadius: 0
            }
          },
          "&:not(:first-child)": {
            marginInlineStart: token.calc(lineWidth).mul(-1).equal(),
            [`&, & > ${componentCls}`]: {
              borderStartStartRadius: 0,
              borderEndStartRadius: 0
            }
          }
        },
        [componentCls]: {
          position: "relative",
          zIndex: 1,
          "&:hover, &:focus, &:active": {
            zIndex: 2
          },
          "&[disabled]": {
            zIndex: 0
          }
        },
        [`${componentCls}-icon-only`]: {
          fontSize
        }
      },
      // Border Color
      genButtonBorderStyle(`${componentCls}-primary`, groupBorderColor),
      genButtonBorderStyle(`${componentCls}-danger`, colorErrorHover)
    ]
  };
};
const toHexFormat = (value, alpha) => (value === null || value === void 0 ? void 0 : value.replace(/[^\w/]/g, "").slice(0, alpha ? 8 : 6)) || "";
const getHex = (value, alpha) => value ? toHexFormat(value, alpha) : "";
let AggregationColor = /* @__PURE__ */ function() {
  function AggregationColor2(color) {
    _classCallCheck(this, AggregationColor2);
    var _a;
    this.cleared = false;
    if (color instanceof AggregationColor2) {
      this.metaColor = color.metaColor.clone();
      this.colors = (_a = color.colors) === null || _a === void 0 ? void 0 : _a.map((info) => ({
        color: new AggregationColor2(info.color),
        percent: info.percent
      }));
      this.cleared = color.cleared;
      return;
    }
    const isArray = Array.isArray(color);
    if (isArray && color.length) {
      this.colors = color.map(({
        color: c,
        percent
      }) => ({
        color: new AggregationColor2(c),
        percent
      }));
      this.metaColor = new Color(this.colors[0].color.metaColor);
    } else {
      this.metaColor = new Color(isArray ? "" : color);
    }
    if (!color || isArray && !this.colors) {
      this.metaColor = this.metaColor.setA(0);
      this.cleared = true;
    }
  }
  return _createClass(AggregationColor2, [{
    key: "toHsb",
    value: function toHsb() {
      return this.metaColor.toHsb();
    }
  }, {
    key: "toHsbString",
    value: function toHsbString() {
      return this.metaColor.toHsbString();
    }
  }, {
    key: "toHex",
    value: function toHex() {
      return getHex(this.toHexString(), this.metaColor.a < 1);
    }
  }, {
    key: "toHexString",
    value: function toHexString() {
      return this.metaColor.toHexString();
    }
  }, {
    key: "toRgb",
    value: function toRgb() {
      return this.metaColor.toRgb();
    }
  }, {
    key: "toRgbString",
    value: function toRgbString() {
      return this.metaColor.toRgbString();
    }
  }, {
    key: "isGradient",
    value: function isGradient() {
      return !!this.colors && !this.cleared;
    }
  }, {
    key: "getColors",
    value: function getColors() {
      return this.colors || [{
        color: this,
        percent: 0
      }];
    }
  }, {
    key: "toCssString",
    value: function toCssString() {
      const {
        colors
      } = this;
      if (colors) {
        const colorsStr = colors.map((c) => `${c.color.toRgbString()} ${c.percent}%`).join(", ");
        return `linear-gradient(90deg, ${colorsStr})`;
      }
      return this.metaColor.toRgbString();
    }
  }, {
    key: "equals",
    value: function equals(color) {
      if (!color || this.isGradient() !== color.isGradient()) {
        return false;
      }
      if (!this.isGradient()) {
        return this.toHexString() === color.toHexString();
      }
      return this.colors.length === color.colors.length && this.colors.every((c, i) => {
        const target = color.colors[i];
        return c.percent === target.percent && c.color.equals(target.color);
      });
    }
  }]);
}();
const CollapsePanel = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    showArrow = true
  } = props;
  const prefixCls = getPrefixCls("collapse", customizePrefixCls);
  const collapsePanelClassName = classNames({
    [`${prefixCls}-no-arrow`]: !showArrow
  }, className);
  return /* @__PURE__ */ reactExports.createElement(Collapse$2.Panel, Object.assign({
    ref
  }, props, {
    prefixCls,
    className: collapsePanelClassName
  }));
});
const genCollapseMotion = (token) => ({
  [token.componentCls]: {
    // For common/openAnimation
    [`${token.antCls}-motion-collapse-legacy`]: {
      overflow: "hidden",
      "&-active": {
        transition: `height ${token.motionDurationMid} ${token.motionEaseInOut},
        opacity ${token.motionDurationMid} ${token.motionEaseInOut} !important`
      }
    },
    [`${token.antCls}-motion-collapse`]: {
      overflow: "hidden",
      transition: `height ${token.motionDurationMid} ${token.motionEaseInOut},
        opacity ${token.motionDurationMid} ${token.motionEaseInOut} !important`
    }
  }
});
const initMotionCommon = (duration) => ({
  animationDuration: duration,
  animationFillMode: "both"
});
const initMotionCommonLeave = (duration) => ({
  animationDuration: duration,
  animationFillMode: "both"
});
const initMotion = (motionCls, inKeyframes, outKeyframes, duration, sameLevel = false) => {
  const sameLevelPrefix = sameLevel ? "&" : "";
  return {
    [`
      ${sameLevelPrefix}${motionCls}-enter,
      ${sameLevelPrefix}${motionCls}-appear
    `]: Object.assign(Object.assign({}, initMotionCommon(duration)), {
      animationPlayState: "paused"
    }),
    [`${sameLevelPrefix}${motionCls}-leave`]: Object.assign(Object.assign({}, initMotionCommonLeave(duration)), {
      animationPlayState: "paused"
    }),
    [`
      ${sameLevelPrefix}${motionCls}-enter${motionCls}-enter-active,
      ${sameLevelPrefix}${motionCls}-appear${motionCls}-appear-active
    `]: {
      animationName: inKeyframes,
      animationPlayState: "running"
    },
    [`${sameLevelPrefix}${motionCls}-leave${motionCls}-leave-active`]: {
      animationName: outKeyframes,
      animationPlayState: "running",
      pointerEvents: "none"
    }
  };
};
const fadeIn = new Keyframe("antFadeIn", {
  "0%": {
    opacity: 0
  },
  "100%": {
    opacity: 1
  }
});
const fadeOut = new Keyframe("antFadeOut", {
  "0%": {
    opacity: 1
  },
  "100%": {
    opacity: 0
  }
});
const initFadeMotion = (token, sameLevel = false) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-fade`;
  const sameLevelPrefix = sameLevel ? "&" : "";
  return [initMotion(motionCls, fadeIn, fadeOut, token.motionDurationMid, sameLevel), {
    [`
        ${sameLevelPrefix}${motionCls}-enter,
        ${sameLevelPrefix}${motionCls}-appear
      `]: {
      opacity: 0,
      animationTimingFunction: "linear"
    },
    [`${sameLevelPrefix}${motionCls}-leave`]: {
      animationTimingFunction: "linear"
    }
  }];
};
const moveDownIn = new Keyframe("antMoveDownIn", {
  "0%": {
    transform: "translate3d(0, 100%, 0)",
    transformOrigin: "0 0",
    opacity: 0
  },
  "100%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  }
});
const moveDownOut = new Keyframe("antMoveDownOut", {
  "0%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  },
  "100%": {
    transform: "translate3d(0, 100%, 0)",
    transformOrigin: "0 0",
    opacity: 0
  }
});
const moveLeftIn = new Keyframe("antMoveLeftIn", {
  "0%": {
    transform: "translate3d(-100%, 0, 0)",
    transformOrigin: "0 0",
    opacity: 0
  },
  "100%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  }
});
const moveLeftOut = new Keyframe("antMoveLeftOut", {
  "0%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  },
  "100%": {
    transform: "translate3d(-100%, 0, 0)",
    transformOrigin: "0 0",
    opacity: 0
  }
});
const moveRightIn = new Keyframe("antMoveRightIn", {
  "0%": {
    transform: "translate3d(100%, 0, 0)",
    transformOrigin: "0 0",
    opacity: 0
  },
  "100%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  }
});
const moveRightOut = new Keyframe("antMoveRightOut", {
  "0%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  },
  "100%": {
    transform: "translate3d(100%, 0, 0)",
    transformOrigin: "0 0",
    opacity: 0
  }
});
const moveUpIn = new Keyframe("antMoveUpIn", {
  "0%": {
    transform: "translate3d(0, -100%, 0)",
    transformOrigin: "0 0",
    opacity: 0
  },
  "100%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  }
});
const moveUpOut = new Keyframe("antMoveUpOut", {
  "0%": {
    transform: "translate3d(0, 0, 0)",
    transformOrigin: "0 0",
    opacity: 1
  },
  "100%": {
    transform: "translate3d(0, -100%, 0)",
    transformOrigin: "0 0",
    opacity: 0
  }
});
const moveMotion = {
  "move-up": {
    inKeyframes: moveUpIn,
    outKeyframes: moveUpOut
  },
  "move-down": {
    inKeyframes: moveDownIn,
    outKeyframes: moveDownOut
  },
  "move-left": {
    inKeyframes: moveLeftIn,
    outKeyframes: moveLeftOut
  },
  "move-right": {
    inKeyframes: moveRightIn,
    outKeyframes: moveRightOut
  }
};
const initMoveMotion = (token, motionName) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-${motionName}`;
  const {
    inKeyframes,
    outKeyframes
  } = moveMotion[motionName];
  return [initMotion(motionCls, inKeyframes, outKeyframes, token.motionDurationMid), {
    [`
        ${motionCls}-enter,
        ${motionCls}-appear
      `]: {
      opacity: 0,
      animationTimingFunction: token.motionEaseOutCirc
    },
    [`${motionCls}-leave`]: {
      animationTimingFunction: token.motionEaseInOutCirc
    }
  }];
};
const slideUpIn = new Keyframe("antSlideUpIn", {
  "0%": {
    transform: "scaleY(0.8)",
    transformOrigin: "0% 0%",
    opacity: 0
  },
  "100%": {
    transform: "scaleY(1)",
    transformOrigin: "0% 0%",
    opacity: 1
  }
});
const slideUpOut = new Keyframe("antSlideUpOut", {
  "0%": {
    transform: "scaleY(1)",
    transformOrigin: "0% 0%",
    opacity: 1
  },
  "100%": {
    transform: "scaleY(0.8)",
    transformOrigin: "0% 0%",
    opacity: 0
  }
});
const slideDownIn = new Keyframe("antSlideDownIn", {
  "0%": {
    transform: "scaleY(0.8)",
    transformOrigin: "100% 100%",
    opacity: 0
  },
  "100%": {
    transform: "scaleY(1)",
    transformOrigin: "100% 100%",
    opacity: 1
  }
});
const slideDownOut = new Keyframe("antSlideDownOut", {
  "0%": {
    transform: "scaleY(1)",
    transformOrigin: "100% 100%",
    opacity: 1
  },
  "100%": {
    transform: "scaleY(0.8)",
    transformOrigin: "100% 100%",
    opacity: 0
  }
});
const slideLeftIn = new Keyframe("antSlideLeftIn", {
  "0%": {
    transform: "scaleX(0.8)",
    transformOrigin: "0% 0%",
    opacity: 0
  },
  "100%": {
    transform: "scaleX(1)",
    transformOrigin: "0% 0%",
    opacity: 1
  }
});
const slideLeftOut = new Keyframe("antSlideLeftOut", {
  "0%": {
    transform: "scaleX(1)",
    transformOrigin: "0% 0%",
    opacity: 1
  },
  "100%": {
    transform: "scaleX(0.8)",
    transformOrigin: "0% 0%",
    opacity: 0
  }
});
const slideRightIn = new Keyframe("antSlideRightIn", {
  "0%": {
    transform: "scaleX(0.8)",
    transformOrigin: "100% 0%",
    opacity: 0
  },
  "100%": {
    transform: "scaleX(1)",
    transformOrigin: "100% 0%",
    opacity: 1
  }
});
const slideRightOut = new Keyframe("antSlideRightOut", {
  "0%": {
    transform: "scaleX(1)",
    transformOrigin: "100% 0%",
    opacity: 1
  },
  "100%": {
    transform: "scaleX(0.8)",
    transformOrigin: "100% 0%",
    opacity: 0
  }
});
const slideMotion = {
  "slide-up": {
    inKeyframes: slideUpIn,
    outKeyframes: slideUpOut
  },
  "slide-down": {
    inKeyframes: slideDownIn,
    outKeyframes: slideDownOut
  },
  "slide-left": {
    inKeyframes: slideLeftIn,
    outKeyframes: slideLeftOut
  },
  "slide-right": {
    inKeyframes: slideRightIn,
    outKeyframes: slideRightOut
  }
};
const initSlideMotion = (token, motionName) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-${motionName}`;
  const {
    inKeyframes,
    outKeyframes
  } = slideMotion[motionName];
  return [initMotion(motionCls, inKeyframes, outKeyframes, token.motionDurationMid), {
    [`
      ${motionCls}-enter,
      ${motionCls}-appear
    `]: {
      transform: "scale(0)",
      transformOrigin: "0% 0%",
      opacity: 0,
      animationTimingFunction: token.motionEaseOutQuint,
      "&-prepare": {
        transform: "scale(1)"
      }
    },
    [`${motionCls}-leave`]: {
      animationTimingFunction: token.motionEaseInQuint
    }
  }];
};
const zoomIn = new Keyframe("antZoomIn", {
  "0%": {
    transform: "scale(0.2)",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    opacity: 1
  }
});
const zoomOut = new Keyframe("antZoomOut", {
  "0%": {
    transform: "scale(1)"
  },
  "100%": {
    transform: "scale(0.2)",
    opacity: 0
  }
});
const zoomBigIn = new Keyframe("antZoomBigIn", {
  "0%": {
    transform: "scale(0.8)",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    opacity: 1
  }
});
const zoomBigOut = new Keyframe("antZoomBigOut", {
  "0%": {
    transform: "scale(1)"
  },
  "100%": {
    transform: "scale(0.8)",
    opacity: 0
  }
});
const zoomUpIn = new Keyframe("antZoomUpIn", {
  "0%": {
    transform: "scale(0.8)",
    transformOrigin: "50% 0%",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    transformOrigin: "50% 0%"
  }
});
const zoomUpOut = new Keyframe("antZoomUpOut", {
  "0%": {
    transform: "scale(1)",
    transformOrigin: "50% 0%"
  },
  "100%": {
    transform: "scale(0.8)",
    transformOrigin: "50% 0%",
    opacity: 0
  }
});
const zoomLeftIn = new Keyframe("antZoomLeftIn", {
  "0%": {
    transform: "scale(0.8)",
    transformOrigin: "0% 50%",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    transformOrigin: "0% 50%"
  }
});
const zoomLeftOut = new Keyframe("antZoomLeftOut", {
  "0%": {
    transform: "scale(1)",
    transformOrigin: "0% 50%"
  },
  "100%": {
    transform: "scale(0.8)",
    transformOrigin: "0% 50%",
    opacity: 0
  }
});
const zoomRightIn = new Keyframe("antZoomRightIn", {
  "0%": {
    transform: "scale(0.8)",
    transformOrigin: "100% 50%",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    transformOrigin: "100% 50%"
  }
});
const zoomRightOut = new Keyframe("antZoomRightOut", {
  "0%": {
    transform: "scale(1)",
    transformOrigin: "100% 50%"
  },
  "100%": {
    transform: "scale(0.8)",
    transformOrigin: "100% 50%",
    opacity: 0
  }
});
const zoomDownIn = new Keyframe("antZoomDownIn", {
  "0%": {
    transform: "scale(0.8)",
    transformOrigin: "50% 100%",
    opacity: 0
  },
  "100%": {
    transform: "scale(1)",
    transformOrigin: "50% 100%"
  }
});
const zoomDownOut = new Keyframe("antZoomDownOut", {
  "0%": {
    transform: "scale(1)",
    transformOrigin: "50% 100%"
  },
  "100%": {
    transform: "scale(0.8)",
    transformOrigin: "50% 100%",
    opacity: 0
  }
});
const zoomMotion = {
  zoom: {
    inKeyframes: zoomIn,
    outKeyframes: zoomOut
  },
  "zoom-big": {
    inKeyframes: zoomBigIn,
    outKeyframes: zoomBigOut
  },
  "zoom-big-fast": {
    inKeyframes: zoomBigIn,
    outKeyframes: zoomBigOut
  },
  "zoom-left": {
    inKeyframes: zoomLeftIn,
    outKeyframes: zoomLeftOut
  },
  "zoom-right": {
    inKeyframes: zoomRightIn,
    outKeyframes: zoomRightOut
  },
  "zoom-up": {
    inKeyframes: zoomUpIn,
    outKeyframes: zoomUpOut
  },
  "zoom-down": {
    inKeyframes: zoomDownIn,
    outKeyframes: zoomDownOut
  }
};
const initZoomMotion = (token, motionName) => {
  const {
    antCls
  } = token;
  const motionCls = `${antCls}-${motionName}`;
  const {
    inKeyframes,
    outKeyframes
  } = zoomMotion[motionName];
  return [initMotion(motionCls, inKeyframes, outKeyframes, motionName === "zoom-big-fast" ? token.motionDurationFast : token.motionDurationMid), {
    [`
        ${motionCls}-enter,
        ${motionCls}-appear
      `]: {
      transform: "scale(0)",
      opacity: 0,
      animationTimingFunction: token.motionEaseOutCirc,
      "&-prepare": {
        transform: "none"
      }
    },
    [`${motionCls}-leave`]: {
      animationTimingFunction: token.motionEaseInOutCirc
    }
  }];
};
const genBaseStyle$5 = (token) => {
  const {
    componentCls,
    contentBg,
    padding,
    headerBg,
    headerPadding,
    collapseHeaderPaddingSM,
    collapseHeaderPaddingLG,
    collapsePanelBorderRadius,
    lineWidth,
    lineType,
    colorBorder,
    colorText,
    colorTextHeading,
    colorTextDisabled,
    fontSizeLG,
    lineHeight,
    lineHeightLG,
    marginSM,
    paddingSM,
    paddingLG,
    paddingXS,
    motionDurationSlow,
    fontSizeIcon,
    contentPadding,
    fontHeight,
    fontHeightLG
  } = token;
  const borderBase = `${unit(lineWidth)} ${lineType} ${colorBorder}`;
  return {
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      backgroundColor: headerBg,
      border: borderBase,
      borderRadius: collapsePanelBorderRadius,
      "&-rtl": {
        direction: "rtl"
      },
      [`& > ${componentCls}-item`]: {
        borderBottom: borderBase,
        "&:first-child": {
          [`
            &,
            & > ${componentCls}-header`]: {
            borderRadius: `${unit(collapsePanelBorderRadius)} ${unit(collapsePanelBorderRadius)} 0 0`
          }
        },
        "&:last-child": {
          [`
            &,
            & > ${componentCls}-header`]: {
            borderRadius: `0 0 ${unit(collapsePanelBorderRadius)} ${unit(collapsePanelBorderRadius)}`
          }
        },
        [`> ${componentCls}-header`]: Object.assign(Object.assign({
          position: "relative",
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "flex-start",
          padding: headerPadding,
          color: colorTextHeading,
          lineHeight,
          cursor: "pointer",
          transition: `all ${motionDurationSlow}, visibility 0s`
        }, genFocusStyle(token)), {
          [`> ${componentCls}-header-text`]: {
            flex: "auto"
          },
          // >>>>> Arrow
          [`${componentCls}-expand-icon`]: {
            height: fontHeight,
            display: "flex",
            alignItems: "center",
            paddingInlineEnd: marginSM
          },
          [`${componentCls}-arrow`]: Object.assign(Object.assign({}, resetIcon()), {
            fontSize: fontSizeIcon,
            // when `transform: rotate()` is applied to icon's root element
            transition: `transform ${motionDurationSlow}`,
            // when `transform: rotate()` is applied to icon's child element
            svg: {
              transition: `transform ${motionDurationSlow}`
            }
          }),
          // >>>>> Text
          [`${componentCls}-header-text`]: {
            marginInlineEnd: "auto"
          }
        }),
        [`${componentCls}-collapsible-header`]: {
          cursor: "default",
          [`${componentCls}-header-text`]: {
            flex: "none",
            cursor: "pointer"
          }
        },
        [`${componentCls}-collapsible-icon`]: {
          cursor: "unset",
          [`${componentCls}-expand-icon`]: {
            cursor: "pointer"
          }
        }
      },
      [`${componentCls}-content`]: {
        color: colorText,
        backgroundColor: contentBg,
        borderTop: borderBase,
        [`& > ${componentCls}-content-box`]: {
          padding: contentPadding
        },
        "&-hidden": {
          display: "none"
        }
      },
      "&-small": {
        [`> ${componentCls}-item`]: {
          [`> ${componentCls}-header`]: {
            padding: collapseHeaderPaddingSM,
            paddingInlineStart: paddingXS,
            [`> ${componentCls}-expand-icon`]: {
              // Arrow offset
              marginInlineStart: token.calc(paddingSM).sub(paddingXS).equal()
            }
          },
          [`> ${componentCls}-content > ${componentCls}-content-box`]: {
            padding: paddingSM
          }
        }
      },
      "&-large": {
        [`> ${componentCls}-item`]: {
          fontSize: fontSizeLG,
          lineHeight: lineHeightLG,
          [`> ${componentCls}-header`]: {
            padding: collapseHeaderPaddingLG,
            paddingInlineStart: padding,
            [`> ${componentCls}-expand-icon`]: {
              height: fontHeightLG,
              // Arrow offset
              marginInlineStart: token.calc(paddingLG).sub(padding).equal()
            }
          },
          [`> ${componentCls}-content > ${componentCls}-content-box`]: {
            padding: paddingLG
          }
        }
      },
      [`${componentCls}-item:last-child`]: {
        borderBottom: 0,
        [`> ${componentCls}-content`]: {
          borderRadius: `0 0 ${unit(collapsePanelBorderRadius)} ${unit(collapsePanelBorderRadius)}`
        }
      },
      [`& ${componentCls}-item-disabled > ${componentCls}-header`]: {
        [`
          &,
          & > .arrow
        `]: {
          color: colorTextDisabled,
          cursor: "not-allowed"
        }
      },
      // ========================== Icon Position ==========================
      [`&${componentCls}-icon-position-end`]: {
        [`& > ${componentCls}-item`]: {
          [`> ${componentCls}-header`]: {
            [`${componentCls}-expand-icon`]: {
              order: 1,
              paddingInlineEnd: 0,
              paddingInlineStart: marginSM
            }
          }
        }
      }
    })
  };
};
const genArrowStyle = (token) => {
  const {
    componentCls
  } = token;
  const fixedSelector = `> ${componentCls}-item > ${componentCls}-header ${componentCls}-arrow`;
  return {
    [`${componentCls}-rtl`]: {
      [fixedSelector]: {
        transform: `rotate(180deg)`
      }
    }
  };
};
const genBorderlessStyle$2 = (token) => {
  const {
    componentCls,
    headerBg,
    borderlessContentPadding,
    borderlessContentBg,
    colorBorder
  } = token;
  return {
    [`${componentCls}-borderless`]: {
      backgroundColor: headerBg,
      border: 0,
      [`> ${componentCls}-item`]: {
        borderBottom: `1px solid ${colorBorder}`
      },
      [`
        > ${componentCls}-item:last-child,
        > ${componentCls}-item:last-child ${componentCls}-header
      `]: {
        borderRadius: 0
      },
      [`> ${componentCls}-item:last-child`]: {
        borderBottom: 0
      },
      [`> ${componentCls}-item > ${componentCls}-content`]: {
        backgroundColor: borderlessContentBg,
        borderTop: 0
      },
      [`> ${componentCls}-item > ${componentCls}-content > ${componentCls}-content-box`]: {
        padding: borderlessContentPadding
      }
    }
  };
};
const genGhostStyle = (token) => {
  const {
    componentCls,
    paddingSM
  } = token;
  return {
    [`${componentCls}-ghost`]: {
      backgroundColor: "transparent",
      border: 0,
      [`> ${componentCls}-item`]: {
        borderBottom: 0,
        [`> ${componentCls}-content`]: {
          backgroundColor: "transparent",
          border: 0,
          [`> ${componentCls}-content-box`]: {
            paddingBlock: paddingSM
          }
        }
      }
    }
  };
};
const prepareComponentToken$l = (token) => ({
  headerPadding: `${token.paddingSM}px ${token.padding}px`,
  headerBg: token.colorFillAlter,
  contentPadding: `${token.padding}px 16px`,
  // Fixed Value
  contentBg: token.colorBgContainer,
  borderlessContentPadding: `${token.paddingXXS}px 16px ${token.padding}px`,
  borderlessContentBg: "transparent"
});
const useStyle$p = genStyleHooks("Collapse", (token) => {
  const collapseToken = merge$1(token, {
    collapseHeaderPaddingSM: `${unit(token.paddingXS)} ${unit(token.paddingSM)}`,
    collapseHeaderPaddingLG: `${unit(token.padding)} ${unit(token.paddingLG)}`,
    collapsePanelBorderRadius: token.borderRadiusLG
  });
  return [genBaseStyle$5(collapseToken), genBorderlessStyle$2(collapseToken), genGhostStyle(collapseToken), genArrowStyle(collapseToken), genCollapseMotion(collapseToken)];
}, prepareComponentToken$l);
const Collapse = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction,
    expandIcon: contextExpandIcon,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig("collapse");
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    bordered = true,
    ghost,
    size: customizeSize,
    expandIconPosition = "start",
    children,
    destroyInactivePanel,
    destroyOnHidden,
    expandIcon
  } = props;
  const mergedSize = useSize((ctx) => {
    var _a;
    return (_a = customizeSize !== null && customizeSize !== void 0 ? customizeSize : ctx) !== null && _a !== void 0 ? _a : "middle";
  });
  const prefixCls = getPrefixCls("collapse", customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$p(prefixCls);
  const mergedExpandIconPosition = reactExports.useMemo(() => {
    if (expandIconPosition === "left") {
      return "start";
    }
    return expandIconPosition === "right" ? "end" : expandIconPosition;
  }, [expandIconPosition]);
  const mergedExpandIcon = expandIcon !== null && expandIcon !== void 0 ? expandIcon : contextExpandIcon;
  const renderExpandIcon2 = reactExports.useCallback((panelProps = {}) => {
    const icon = typeof mergedExpandIcon === "function" ? mergedExpandIcon(panelProps) : /* @__PURE__ */ reactExports.createElement(RefIcon$6, {
      rotate: panelProps.isActive ? direction === "rtl" ? -90 : 90 : void 0,
      "aria-label": panelProps.isActive ? "expanded" : "collapsed"
    });
    return cloneElement(icon, () => {
      var _a;
      return {
        className: classNames((_a = icon.props) === null || _a === void 0 ? void 0 : _a.className, `${prefixCls}-arrow`)
      };
    });
  }, [mergedExpandIcon, prefixCls, direction]);
  const collapseClassName = classNames(`${prefixCls}-icon-position-${mergedExpandIconPosition}`, {
    [`${prefixCls}-borderless`]: !bordered,
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-ghost`]: !!ghost,
    [`${prefixCls}-${mergedSize}`]: mergedSize !== "middle"
  }, contextClassName, className, rootClassName, hashId, cssVarCls);
  const openMotion = reactExports.useMemo(() => Object.assign(Object.assign({}, initCollapseMotion(rootPrefixCls)), {
    motionAppear: false,
    leavedClassName: `${prefixCls}-content-hidden`
  }), [rootPrefixCls, prefixCls]);
  const items = reactExports.useMemo(() => {
    if (!children) {
      return null;
    }
    return toArray$1(children).map((child, index) => {
      var _a, _b;
      const childProps = child.props;
      if (childProps === null || childProps === void 0 ? void 0 : childProps.disabled) {
        const key = (_a = child.key) !== null && _a !== void 0 ? _a : String(index);
        const mergedChildProps = Object.assign(Object.assign({}, omit(child.props, ["disabled"])), {
          key,
          collapsible: (_b = childProps.collapsible) !== null && _b !== void 0 ? _b : "disabled"
        });
        return cloneElement(child, mergedChildProps);
      }
      return child;
    });
  }, [children]);
  return wrapCSSVar(
    // @ts-ignore
    /* @__PURE__ */ reactExports.createElement(Collapse$2, Object.assign({
      ref,
      openMotion
    }, omit(props, ["rootClassName"]), {
      expandIcon: renderExpandIcon2,
      prefixCls,
      className: collapseClassName,
      style: Object.assign(Object.assign({}, contextStyle), style),
      // TODO: In the future, destroyInactivePanel in rc-collapse needs to be upgrade to destroyOnHidden
      destroyInactivePanel: destroyOnHidden !== null && destroyOnHidden !== void 0 ? destroyOnHidden : destroyInactivePanel
    }), items)
  );
});
const Collapse$1 = Object.assign(Collapse, {
  Panel: CollapsePanel
});
const isBright = (value, bgColorToken) => {
  const {
    r,
    g,
    b,
    a
  } = value.toRgb();
  const hsv = new Color(value.toRgbString()).onBackground(bgColorToken).toHsv();
  if (a <= 0.5) {
    return hsv.v > 0.5;
  }
  return r * 0.299 + g * 0.587 + b * 0.114 > 192;
};
const prepareToken$4 = (token) => {
  const {
    paddingInline,
    onlyIconSize
  } = token;
  const buttonToken = merge$1(token, {
    buttonPaddingHorizontal: paddingInline,
    buttonPaddingVertical: 0,
    buttonIconOnlyFontSize: onlyIconSize
  });
  return buttonToken;
};
const prepareComponentToken$k = (token) => {
  var _a, _b, _c, _d, _e, _f;
  const contentFontSize = (_a = token.contentFontSize) !== null && _a !== void 0 ? _a : token.fontSize;
  const contentFontSizeSM = (_b = token.contentFontSizeSM) !== null && _b !== void 0 ? _b : token.fontSize;
  const contentFontSizeLG = (_c = token.contentFontSizeLG) !== null && _c !== void 0 ? _c : token.fontSizeLG;
  const contentLineHeight = (_d = token.contentLineHeight) !== null && _d !== void 0 ? _d : getLineHeight(contentFontSize);
  const contentLineHeightSM = (_e = token.contentLineHeightSM) !== null && _e !== void 0 ? _e : getLineHeight(contentFontSizeSM);
  const contentLineHeightLG = (_f = token.contentLineHeightLG) !== null && _f !== void 0 ? _f : getLineHeight(contentFontSizeLG);
  const solidTextColor = isBright(new AggregationColor(token.colorBgSolid), "#fff") ? "#000" : "#fff";
  const shadowColorTokens = PresetColors.reduce((prev, colorKey) => Object.assign(Object.assign({}, prev), {
    [`${colorKey}ShadowColor`]: `0 ${unit(token.controlOutlineWidth)} 0 ${getAlphaColor(token[`${colorKey}1`], token.colorBgContainer)}`
  }), {});
  return Object.assign(Object.assign({}, shadowColorTokens), {
    fontWeight: 400,
    defaultShadow: `0 ${token.controlOutlineWidth}px 0 ${token.controlTmpOutline}`,
    primaryShadow: `0 ${token.controlOutlineWidth}px 0 ${token.controlOutline}`,
    dangerShadow: `0 ${token.controlOutlineWidth}px 0 ${token.colorErrorOutline}`,
    primaryColor: token.colorTextLightSolid,
    dangerColor: token.colorTextLightSolid,
    borderColorDisabled: token.colorBorder,
    defaultGhostColor: token.colorBgContainer,
    ghostBg: "transparent",
    defaultGhostBorderColor: token.colorBgContainer,
    paddingInline: token.paddingContentHorizontal - token.lineWidth,
    paddingInlineLG: token.paddingContentHorizontal - token.lineWidth,
    paddingInlineSM: 8 - token.lineWidth,
    onlyIconSize: "inherit",
    onlyIconSizeSM: "inherit",
    onlyIconSizeLG: "inherit",
    groupBorderColor: token.colorPrimaryHover,
    linkHoverBg: "transparent",
    textTextColor: token.colorText,
    textTextHoverColor: token.colorText,
    textTextActiveColor: token.colorText,
    textHoverBg: token.colorFillTertiary,
    defaultColor: token.colorText,
    defaultBg: token.colorBgContainer,
    defaultBorderColor: token.colorBorder,
    defaultBorderColorDisabled: token.colorBorder,
    defaultHoverBg: token.colorBgContainer,
    defaultHoverColor: token.colorPrimaryHover,
    defaultHoverBorderColor: token.colorPrimaryHover,
    defaultActiveBg: token.colorBgContainer,
    defaultActiveColor: token.colorPrimaryActive,
    defaultActiveBorderColor: token.colorPrimaryActive,
    solidTextColor,
    contentFontSize,
    contentFontSizeSM,
    contentFontSizeLG,
    contentLineHeight,
    contentLineHeightSM,
    contentLineHeightLG,
    paddingBlock: Math.max((token.controlHeight - contentFontSize * contentLineHeight) / 2 - token.lineWidth, 0),
    paddingBlockSM: Math.max((token.controlHeightSM - contentFontSizeSM * contentLineHeightSM) / 2 - token.lineWidth, 0),
    paddingBlockLG: Math.max((token.controlHeightLG - contentFontSizeLG * contentLineHeightLG) / 2 - token.lineWidth, 0)
  });
};
const genSharedButtonStyle = (token) => {
  const {
    componentCls,
    iconCls,
    fontWeight,
    opacityLoading,
    motionDurationSlow,
    motionEaseInOut,
    marginXS,
    calc
  } = token;
  return {
    [componentCls]: {
      outline: "none",
      position: "relative",
      display: "inline-flex",
      gap: token.marginXS,
      alignItems: "center",
      justifyContent: "center",
      fontWeight,
      whiteSpace: "nowrap",
      textAlign: "center",
      backgroundImage: "none",
      background: "transparent",
      border: `${unit(token.lineWidth)} ${token.lineType} transparent`,
      cursor: "pointer",
      transition: `all ${token.motionDurationMid} ${token.motionEaseInOut}`,
      userSelect: "none",
      touchAction: "manipulation",
      color: token.colorText,
      "&:disabled > *": {
        pointerEvents: "none"
      },
      // https://github.com/ant-design/ant-design/issues/51380
      [`${componentCls}-icon > svg`]: resetIcon(),
      "> a": {
        color: "currentColor"
      },
      "&:not(:disabled)": genFocusStyle(token),
      [`&${componentCls}-two-chinese-chars::first-letter`]: {
        letterSpacing: "0.34em"
      },
      [`&${componentCls}-two-chinese-chars > *:not(${iconCls})`]: {
        marginInlineEnd: "-0.34em",
        letterSpacing: "0.34em"
      },
      [`&${componentCls}-icon-only`]: {
        paddingInline: 0,
        // make `btn-icon-only` not too narrow
        [`&${componentCls}-compact-item`]: {
          flex: "none"
        },
        [`&${componentCls}-round`]: {
          width: "auto"
        }
      },
      // Loading
      [`&${componentCls}-loading`]: {
        opacity: opacityLoading,
        cursor: "default"
      },
      [`${componentCls}-loading-icon`]: {
        transition: ["width", "opacity", "margin"].map((transition) => `${transition} ${motionDurationSlow} ${motionEaseInOut}`).join(",")
      },
      // iconPosition
      [`&:not(${componentCls}-icon-end)`]: {
        [`${componentCls}-loading-icon-motion`]: {
          "&-appear-start, &-enter-start": {
            marginInlineEnd: calc(marginXS).mul(-1).equal()
          },
          "&-appear-active, &-enter-active": {
            marginInlineEnd: 0
          },
          "&-leave-start": {
            marginInlineEnd: 0
          },
          "&-leave-active": {
            marginInlineEnd: calc(marginXS).mul(-1).equal()
          }
        }
      },
      "&-icon-end": {
        flexDirection: "row-reverse",
        [`${componentCls}-loading-icon-motion`]: {
          "&-appear-start, &-enter-start": {
            marginInlineStart: calc(marginXS).mul(-1).equal()
          },
          "&-appear-active, &-enter-active": {
            marginInlineStart: 0
          },
          "&-leave-start": {
            marginInlineStart: 0
          },
          "&-leave-active": {
            marginInlineStart: calc(marginXS).mul(-1).equal()
          }
        }
      }
    }
  };
};
const genHoverActiveButtonStyle = (btnCls, hoverStyle, activeStyle) => ({
  [`&:not(:disabled):not(${btnCls}-disabled)`]: {
    "&:hover": hoverStyle,
    "&:active": activeStyle
  }
});
const genCircleButtonStyle = (token) => ({
  minWidth: token.controlHeight,
  paddingInlineStart: 0,
  paddingInlineEnd: 0,
  borderRadius: "50%"
});
const genRoundButtonStyle = (token) => ({
  borderRadius: token.controlHeight,
  paddingInlineStart: token.calc(token.controlHeight).div(2).equal(),
  paddingInlineEnd: token.calc(token.controlHeight).div(2).equal()
});
const genDisabledStyle$1 = (token) => ({
  cursor: "not-allowed",
  borderColor: token.borderColorDisabled,
  color: token.colorTextDisabled,
  background: token.colorBgContainerDisabled,
  boxShadow: "none"
});
const genGhostButtonStyle = (btnCls, background, textColor, borderColor, textColorDisabled, borderColorDisabled, hoverStyle, activeStyle) => ({
  [`&${btnCls}-background-ghost`]: Object.assign(Object.assign({
    color: textColor || void 0,
    background,
    borderColor: borderColor || void 0,
    boxShadow: "none"
  }, genHoverActiveButtonStyle(btnCls, Object.assign({
    background
  }, hoverStyle), Object.assign({
    background
  }, activeStyle))), {
    "&:disabled": {
      cursor: "not-allowed",
      color: textColorDisabled || void 0,
      borderColor: borderColorDisabled || void 0
    }
  })
});
const genSolidDisabledButtonStyle = (token) => ({
  [`&:disabled, &${token.componentCls}-disabled`]: Object.assign({}, genDisabledStyle$1(token))
});
const genPureDisabledButtonStyle = (token) => ({
  [`&:disabled, &${token.componentCls}-disabled`]: {
    cursor: "not-allowed",
    color: token.colorTextDisabled
  }
});
const genVariantButtonStyle = (token, hoverStyle, activeStyle, variant) => {
  const isPureDisabled = variant && ["link", "text"].includes(variant);
  const genDisabledButtonStyle = isPureDisabled ? genPureDisabledButtonStyle : genSolidDisabledButtonStyle;
  return Object.assign(Object.assign({}, genDisabledButtonStyle(token)), genHoverActiveButtonStyle(token.componentCls, hoverStyle, activeStyle));
};
const genSolidButtonStyle = (token, textColor, background, hoverStyle, activeStyle) => ({
  [`&${token.componentCls}-variant-solid`]: Object.assign({
    color: textColor,
    background
  }, genVariantButtonStyle(token, hoverStyle, activeStyle))
});
const genOutlinedDashedButtonStyle = (token, borderColor, background, hoverStyle, activeStyle) => ({
  [`&${token.componentCls}-variant-outlined, &${token.componentCls}-variant-dashed`]: Object.assign({
    borderColor,
    background
  }, genVariantButtonStyle(token, hoverStyle, activeStyle))
});
const genDashedButtonStyle = (token) => ({
  [`&${token.componentCls}-variant-dashed`]: {
    borderStyle: "dashed"
  }
});
const genFilledButtonStyle = (token, background, hoverStyle, activeStyle) => ({
  [`&${token.componentCls}-variant-filled`]: Object.assign({
    boxShadow: "none",
    background
  }, genVariantButtonStyle(token, hoverStyle, activeStyle))
});
const genTextLinkButtonStyle = (token, textColor, variant, hoverStyle, activeStyle) => ({
  [`&${token.componentCls}-variant-${variant}`]: Object.assign({
    color: textColor,
    boxShadow: "none"
  }, genVariantButtonStyle(token, hoverStyle, activeStyle, variant))
});
const genPresetColorStyle = (token) => {
  const {
    componentCls
  } = token;
  return PresetColors.reduce((prev, colorKey) => {
    const darkColor = token[`${colorKey}6`];
    const lightColor = token[`${colorKey}1`];
    const hoverColor = token[`${colorKey}5`];
    const lightHoverColor = token[`${colorKey}2`];
    const lightBorderColor = token[`${colorKey}3`];
    const activeColor = token[`${colorKey}7`];
    return Object.assign(Object.assign({}, prev), {
      [`&${componentCls}-color-${colorKey}`]: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
        color: darkColor,
        boxShadow: token[`${colorKey}ShadowColor`]
      }, genSolidButtonStyle(token, token.colorTextLightSolid, darkColor, {
        background: hoverColor
      }, {
        background: activeColor
      })), genOutlinedDashedButtonStyle(token, darkColor, token.colorBgContainer, {
        color: hoverColor,
        borderColor: hoverColor,
        background: token.colorBgContainer
      }, {
        color: activeColor,
        borderColor: activeColor,
        background: token.colorBgContainer
      })), genDashedButtonStyle(token)), genFilledButtonStyle(token, lightColor, {
        background: lightHoverColor
      }, {
        background: lightBorderColor
      })), genTextLinkButtonStyle(token, darkColor, "link", {
        color: hoverColor
      }, {
        color: activeColor
      })), genTextLinkButtonStyle(token, darkColor, "text", {
        color: hoverColor,
        background: lightColor
      }, {
        color: activeColor,
        background: lightBorderColor
      }))
    });
  }, {});
};
const genDefaultButtonStyle = (token) => Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
  color: token.defaultColor,
  boxShadow: token.defaultShadow
}, genSolidButtonStyle(token, token.solidTextColor, token.colorBgSolid, {
  color: token.solidTextColor,
  background: token.colorBgSolidHover
}, {
  color: token.solidTextColor,
  background: token.colorBgSolidActive
})), genDashedButtonStyle(token)), genFilledButtonStyle(token, token.colorFillTertiary, {
  background: token.colorFillSecondary
}, {
  background: token.colorFill
})), genGhostButtonStyle(token.componentCls, token.ghostBg, token.defaultGhostColor, token.defaultGhostBorderColor, token.colorTextDisabled, token.colorBorder)), genTextLinkButtonStyle(token, token.textTextColor, "link", {
  color: token.colorLinkHover,
  background: token.linkHoverBg
}, {
  color: token.colorLinkActive
}));
const genPrimaryButtonStyle = (token) => Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
  color: token.colorPrimary,
  boxShadow: token.primaryShadow
}, genOutlinedDashedButtonStyle(token, token.colorPrimary, token.colorBgContainer, {
  color: token.colorPrimaryTextHover,
  borderColor: token.colorPrimaryHover,
  background: token.colorBgContainer
}, {
  color: token.colorPrimaryTextActive,
  borderColor: token.colorPrimaryActive,
  background: token.colorBgContainer
})), genDashedButtonStyle(token)), genFilledButtonStyle(token, token.colorPrimaryBg, {
  background: token.colorPrimaryBgHover
}, {
  background: token.colorPrimaryBorder
})), genTextLinkButtonStyle(token, token.colorPrimaryText, "text", {
  color: token.colorPrimaryTextHover,
  background: token.colorPrimaryBg
}, {
  color: token.colorPrimaryTextActive,
  background: token.colorPrimaryBorder
})), genTextLinkButtonStyle(token, token.colorPrimaryText, "link", {
  color: token.colorPrimaryTextHover,
  background: token.linkHoverBg
}, {
  color: token.colorPrimaryTextActive
})), genGhostButtonStyle(token.componentCls, token.ghostBg, token.colorPrimary, token.colorPrimary, token.colorTextDisabled, token.colorBorder, {
  color: token.colorPrimaryHover,
  borderColor: token.colorPrimaryHover
}, {
  color: token.colorPrimaryActive,
  borderColor: token.colorPrimaryActive
}));
const genDangerousStyle = (token) => Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
  color: token.colorError,
  boxShadow: token.dangerShadow
}, genSolidButtonStyle(token, token.dangerColor, token.colorError, {
  background: token.colorErrorHover
}, {
  background: token.colorErrorActive
})), genOutlinedDashedButtonStyle(token, token.colorError, token.colorBgContainer, {
  color: token.colorErrorHover,
  borderColor: token.colorErrorBorderHover
}, {
  color: token.colorErrorActive,
  borderColor: token.colorErrorActive
})), genDashedButtonStyle(token)), genFilledButtonStyle(token, token.colorErrorBg, {
  background: token.colorErrorBgFilledHover
}, {
  background: token.colorErrorBgActive
})), genTextLinkButtonStyle(token, token.colorError, "text", {
  color: token.colorErrorHover,
  background: token.colorErrorBg
}, {
  color: token.colorErrorHover,
  background: token.colorErrorBgActive
})), genTextLinkButtonStyle(token, token.colorError, "link", {
  color: token.colorErrorHover
}, {
  color: token.colorErrorActive
})), genGhostButtonStyle(token.componentCls, token.ghostBg, token.colorError, token.colorError, token.colorTextDisabled, token.colorBorder, {
  color: token.colorErrorHover,
  borderColor: token.colorErrorHover
}, {
  color: token.colorErrorActive,
  borderColor: token.colorErrorActive
}));
const genLinkStyle = (token) => Object.assign(Object.assign({}, genTextLinkButtonStyle(token, token.colorLink, "link", {
  color: token.colorLinkHover
}, {
  color: token.colorLinkActive
})), genGhostButtonStyle(token.componentCls, token.ghostBg, token.colorInfo, token.colorInfo, token.colorTextDisabled, token.colorBorder, {
  color: token.colorInfoHover,
  borderColor: token.colorInfoHover
}, {
  color: token.colorInfoActive,
  borderColor: token.colorInfoActive
}));
const genColorButtonStyle = (token) => {
  const {
    componentCls
  } = token;
  return Object.assign({
    [`${componentCls}-color-default`]: genDefaultButtonStyle(token),
    [`${componentCls}-color-primary`]: genPrimaryButtonStyle(token),
    [`${componentCls}-color-dangerous`]: genDangerousStyle(token),
    [`${componentCls}-color-link`]: genLinkStyle(token)
  }, genPresetColorStyle(token));
};
const genCompatibleButtonStyle = (token) => Object.assign(Object.assign(Object.assign(Object.assign({}, genOutlinedDashedButtonStyle(token, token.defaultBorderColor, token.defaultBg, {
  color: token.defaultHoverColor,
  borderColor: token.defaultHoverBorderColor,
  background: token.defaultHoverBg
}, {
  color: token.defaultActiveColor,
  borderColor: token.defaultActiveBorderColor,
  background: token.defaultActiveBg
})), genTextLinkButtonStyle(token, token.textTextColor, "text", {
  color: token.textTextHoverColor,
  background: token.textHoverBg
}, {
  color: token.textTextActiveColor,
  background: token.colorBgTextActive
})), genSolidButtonStyle(token, token.primaryColor, token.colorPrimary, {
  background: token.colorPrimaryHover,
  color: token.primaryColor
}, {
  background: token.colorPrimaryActive,
  color: token.primaryColor
})), genTextLinkButtonStyle(token, token.colorLink, "link", {
  color: token.colorLinkHover,
  background: token.linkHoverBg
}, {
  color: token.colorLinkActive
}));
const genButtonStyle = (token, prefixCls = "") => {
  const {
    componentCls,
    controlHeight,
    fontSize,
    borderRadius,
    buttonPaddingHorizontal,
    iconCls,
    buttonPaddingVertical,
    buttonIconOnlyFontSize
  } = token;
  return [
    {
      [prefixCls]: {
        fontSize,
        height: controlHeight,
        padding: `${unit(buttonPaddingVertical)} ${unit(buttonPaddingHorizontal)}`,
        borderRadius,
        [`&${componentCls}-icon-only`]: {
          width: controlHeight,
          [iconCls]: {
            fontSize: buttonIconOnlyFontSize
          }
        }
      }
    },
    // Shape - patch prefixCls again to override solid border radius style
    {
      [`${componentCls}${componentCls}-circle${prefixCls}`]: genCircleButtonStyle(token)
    },
    {
      [`${componentCls}${componentCls}-round${prefixCls}`]: genRoundButtonStyle(token)
    }
  ];
};
const genSizeBaseButtonStyle = (token) => {
  const baseToken = merge$1(token, {
    fontSize: token.contentFontSize
  });
  return genButtonStyle(baseToken, token.componentCls);
};
const genSizeSmallButtonStyle = (token) => {
  const smallToken = merge$1(token, {
    controlHeight: token.controlHeightSM,
    fontSize: token.contentFontSizeSM,
    padding: token.paddingXS,
    buttonPaddingHorizontal: token.paddingInlineSM,
    buttonPaddingVertical: 0,
    borderRadius: token.borderRadiusSM,
    buttonIconOnlyFontSize: token.onlyIconSizeSM
  });
  return genButtonStyle(smallToken, `${token.componentCls}-sm`);
};
const genSizeLargeButtonStyle = (token) => {
  const largeToken = merge$1(token, {
    controlHeight: token.controlHeightLG,
    fontSize: token.contentFontSizeLG,
    buttonPaddingHorizontal: token.paddingInlineLG,
    buttonPaddingVertical: 0,
    borderRadius: token.borderRadiusLG,
    buttonIconOnlyFontSize: token.onlyIconSizeLG
  });
  return genButtonStyle(largeToken, `${token.componentCls}-lg`);
};
const genBlockButtonStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [componentCls]: {
      [`&${componentCls}-block`]: {
        width: "100%"
      }
    }
  };
};
const useStyle$o = genStyleHooks("Button", (token) => {
  const buttonToken = prepareToken$4(token);
  return [
    // Shared
    genSharedButtonStyle(buttonToken),
    // Size
    genSizeBaseButtonStyle(buttonToken),
    genSizeSmallButtonStyle(buttonToken),
    genSizeLargeButtonStyle(buttonToken),
    // Block
    genBlockButtonStyle(buttonToken),
    // Color
    genColorButtonStyle(buttonToken),
    // https://github.com/ant-design/ant-design/issues/50969
    genCompatibleButtonStyle(buttonToken),
    // Button Group
    genGroupStyle$1(buttonToken)
  ];
}, prepareComponentToken$k, {
  unitless: {
    fontWeight: true,
    contentLineHeight: true,
    contentLineHeightSM: true,
    contentLineHeightLG: true
  }
});
function compactItemBorder(token, parentCls, options) {
  const {
    focusElCls,
    focus,
    borderElCls
  } = options;
  const childCombinator = borderElCls ? "> *" : "";
  const hoverEffects = ["hover", focus ? "focus" : null, "active"].filter(Boolean).map((n) => `&:${n} ${childCombinator}`).join(",");
  return {
    [`&-item:not(${parentCls}-last-item)`]: {
      marginInlineEnd: token.calc(token.lineWidth).mul(-1).equal()
    },
    "&-item": Object.assign(Object.assign({
      [hoverEffects]: {
        zIndex: 2
      }
    }, focusElCls ? {
      [`&${focusElCls}`]: {
        zIndex: 2
      }
    } : {}), {
      [`&[disabled] ${childCombinator}`]: {
        zIndex: 0
      }
    })
  };
}
function compactItemBorderRadius(prefixCls, parentCls, options) {
  const {
    borderElCls
  } = options;
  const childCombinator = borderElCls ? `> ${borderElCls}` : "";
  return {
    [`&-item:not(${parentCls}-first-item):not(${parentCls}-last-item) ${childCombinator}`]: {
      borderRadius: 0
    },
    [`&-item:not(${parentCls}-last-item)${parentCls}-first-item`]: {
      [`& ${childCombinator}, &${prefixCls}-sm ${childCombinator}, &${prefixCls}-lg ${childCombinator}`]: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0
      }
    },
    [`&-item:not(${parentCls}-first-item)${parentCls}-last-item`]: {
      [`& ${childCombinator}, &${prefixCls}-sm ${childCombinator}, &${prefixCls}-lg ${childCombinator}`]: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0
      }
    }
  };
}
function genCompactItemStyle(token, options = {
  focus: true
}) {
  const {
    componentCls
  } = token;
  const compactCls = `${componentCls}-compact`;
  return {
    [compactCls]: Object.assign(Object.assign({}, compactItemBorder(token, compactCls, options)), compactItemBorderRadius(componentCls, compactCls, options))
  };
}
function compactItemVerticalBorder(token, parentCls) {
  return {
    // border collapse
    [`&-item:not(${parentCls}-last-item)`]: {
      marginBottom: token.calc(token.lineWidth).mul(-1).equal()
    },
    "&-item": {
      "&:hover,&:focus,&:active": {
        zIndex: 2
      },
      "&[disabled]": {
        zIndex: 0
      }
    }
  };
}
function compactItemBorderVerticalRadius(prefixCls, parentCls) {
  return {
    [`&-item:not(${parentCls}-first-item):not(${parentCls}-last-item)`]: {
      borderRadius: 0
    },
    [`&-item${parentCls}-first-item:not(${parentCls}-last-item)`]: {
      [`&, &${prefixCls}-sm, &${prefixCls}-lg`]: {
        borderEndEndRadius: 0,
        borderEndStartRadius: 0
      }
    },
    [`&-item${parentCls}-last-item:not(${parentCls}-first-item)`]: {
      [`&, &${prefixCls}-sm, &${prefixCls}-lg`]: {
        borderStartStartRadius: 0,
        borderStartEndRadius: 0
      }
    }
  };
}
function genCompactItemVerticalStyle(token) {
  const compactCls = `${token.componentCls}-compact-vertical`;
  return {
    [compactCls]: Object.assign(Object.assign({}, compactItemVerticalBorder(token, compactCls)), compactItemBorderVerticalRadius(token.componentCls, compactCls))
  };
}
const genButtonCompactStyle = (token) => {
  const {
    componentCls,
    colorPrimaryHover,
    lineWidth,
    calc
  } = token;
  const insetOffset = calc(lineWidth).mul(-1).equal();
  const getCompactBorderStyle = (vertical) => {
    const selector = `${componentCls}-compact${vertical ? "-vertical" : ""}-item${componentCls}-primary:not([disabled])`;
    return {
      [`${selector} + ${selector}::before`]: {
        position: "absolute",
        top: vertical ? insetOffset : 0,
        insetInlineStart: vertical ? 0 : insetOffset,
        backgroundColor: colorPrimaryHover,
        content: '""',
        width: vertical ? "100%" : lineWidth,
        height: vertical ? lineWidth : "100%"
      }
    };
  };
  return Object.assign(Object.assign({}, getCompactBorderStyle()), getCompactBorderStyle(true));
};
const Compact = genSubStyleComponent(["Button", "compact"], (token) => {
  const buttonToken = prepareToken$4(token);
  return [
    // Space Compact
    genCompactItemStyle(buttonToken),
    genCompactItemVerticalStyle(buttonToken),
    genButtonCompactStyle(buttonToken)
  ];
}, prepareComponentToken$k);
var __rest$Q = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function getLoadingConfig(loading) {
  if (typeof loading === "object" && loading) {
    let delay = loading === null || loading === void 0 ? void 0 : loading.delay;
    delay = !Number.isNaN(delay) && typeof delay === "number" ? delay : 0;
    return {
      loading: delay <= 0,
      delay
    };
  }
  return {
    loading: !!loading,
    delay: 0
  };
}
const ButtonTypeMap = {
  default: ["default", "outlined"],
  primary: ["primary", "solid"],
  dashed: ["default", "dashed"],
  // `link` is not a real color but we should compatible with it
  link: ["link", "link"],
  text: ["default", "text"]
};
const InternalCompoundedButton = /* @__PURE__ */ React.forwardRef((props, ref) => {
  var _a, _b;
  const {
    loading = false,
    prefixCls: customizePrefixCls,
    color,
    variant,
    type,
    danger = false,
    shape = "default",
    size: customizeSize,
    styles,
    disabled: customDisabled,
    className,
    rootClassName,
    children,
    icon,
    iconPosition = "start",
    ghost = false,
    block = false,
    // React does not recognize the `htmlType` prop on a DOM element. Here we pick it out of `rest`.
    htmlType = "button",
    classNames: customClassNames,
    style: customStyle = {},
    autoInsertSpace,
    autoFocus
  } = props, rest = __rest$Q(props, ["loading", "prefixCls", "color", "variant", "type", "danger", "shape", "size", "styles", "disabled", "className", "rootClassName", "children", "icon", "iconPosition", "ghost", "block", "htmlType", "classNames", "style", "autoInsertSpace", "autoFocus"]);
  const mergedType = type || "default";
  const {
    button
  } = React.useContext(ConfigContext);
  const [mergedColor, mergedVariant] = reactExports.useMemo(() => {
    if (color && variant) {
      return [color, variant];
    }
    if (type || danger) {
      const colorVariantPair = ButtonTypeMap[mergedType] || [];
      if (danger) {
        return ["danger", colorVariantPair[1]];
      }
      return colorVariantPair;
    }
    if ((button === null || button === void 0 ? void 0 : button.color) && (button === null || button === void 0 ? void 0 : button.variant)) {
      return [button.color, button.variant];
    }
    return ["default", "outlined"];
  }, [type, color, variant, danger, button === null || button === void 0 ? void 0 : button.variant, button === null || button === void 0 ? void 0 : button.color]);
  const isDanger = mergedColor === "danger";
  const mergedColorText = isDanger ? "dangerous" : mergedColor;
  const {
    getPrefixCls,
    direction,
    autoInsertSpace: contextAutoInsertSpace,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig("button");
  const mergedInsertSpace = (_a = autoInsertSpace !== null && autoInsertSpace !== void 0 ? autoInsertSpace : contextAutoInsertSpace) !== null && _a !== void 0 ? _a : true;
  const prefixCls = getPrefixCls("btn", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$o(prefixCls);
  const disabled = reactExports.useContext(DisabledContext);
  const mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
  const groupSize = reactExports.useContext(GroupSizeContext);
  const loadingOrDelay = reactExports.useMemo(() => getLoadingConfig(loading), [loading]);
  const [innerLoading, setLoading] = reactExports.useState(loadingOrDelay.loading);
  const [hasTwoCNChar, setHasTwoCNChar] = reactExports.useState(false);
  const buttonRef = reactExports.useRef(null);
  const mergedRef = useComposeRef(ref, buttonRef);
  const needInserted = reactExports.Children.count(children) === 1 && !icon && !isUnBorderedButtonVariant(mergedVariant);
  const isMountRef = reactExports.useRef(true);
  React.useEffect(() => {
    isMountRef.current = false;
    return () => {
      isMountRef.current = true;
    };
  }, []);
  reactExports.useLayoutEffect(() => {
    let delayTimer = null;
    if (loadingOrDelay.delay > 0) {
      delayTimer = setTimeout(() => {
        delayTimer = null;
        setLoading(true);
      }, loadingOrDelay.delay);
    } else {
      setLoading(loadingOrDelay.loading);
    }
    function cleanupTimer() {
      if (delayTimer) {
        clearTimeout(delayTimer);
        delayTimer = null;
      }
    }
    return cleanupTimer;
  }, [loadingOrDelay.delay, loadingOrDelay.loading]);
  reactExports.useEffect(() => {
    if (!buttonRef.current || !mergedInsertSpace) {
      return;
    }
    const buttonText = buttonRef.current.textContent || "";
    if (needInserted && isTwoCNChar(buttonText)) {
      if (!hasTwoCNChar) {
        setHasTwoCNChar(true);
      }
    } else if (hasTwoCNChar) {
      setHasTwoCNChar(false);
    }
  });
  reactExports.useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, []);
  const handleClick = React.useCallback((e2) => {
    var _a2;
    if (innerLoading || mergedDisabled) {
      e2.preventDefault();
      return;
    }
    (_a2 = props.onClick) === null || _a2 === void 0 ? void 0 : _a2.call(props, "href" in props ? e2 : e2);
  }, [props.onClick, innerLoading, mergedDisabled]);
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const sizeClassNameMap2 = {
    large: "lg",
    small: "sm",
    middle: void 0
  };
  const sizeFullName = useSize((ctxSize) => {
    var _a2, _b2;
    return (_b2 = (_a2 = customizeSize !== null && customizeSize !== void 0 ? customizeSize : compactSize) !== null && _a2 !== void 0 ? _a2 : groupSize) !== null && _b2 !== void 0 ? _b2 : ctxSize;
  });
  const sizeCls = sizeFullName ? (_b = sizeClassNameMap2[sizeFullName]) !== null && _b !== void 0 ? _b : "" : "";
  const iconType = innerLoading ? "loading" : icon;
  const linkButtonRestProps = omit(rest, ["navigate"]);
  const classes = classNames(prefixCls, hashId, cssVarCls, {
    [`${prefixCls}-${shape}`]: shape !== "default" && shape,
    // Compatible with versions earlier than 5.21.0
    [`${prefixCls}-${mergedType}`]: mergedType,
    [`${prefixCls}-dangerous`]: danger,
    [`${prefixCls}-color-${mergedColorText}`]: mergedColorText,
    [`${prefixCls}-variant-${mergedVariant}`]: mergedVariant,
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-icon-only`]: !children && children !== 0 && !!iconType,
    [`${prefixCls}-background-ghost`]: ghost && !isUnBorderedButtonVariant(mergedVariant),
    [`${prefixCls}-loading`]: innerLoading,
    [`${prefixCls}-two-chinese-chars`]: hasTwoCNChar && mergedInsertSpace && !innerLoading,
    [`${prefixCls}-block`]: block,
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-icon-end`]: iconPosition === "end"
  }, compactItemClassnames, className, rootClassName, contextClassName);
  const fullStyle = Object.assign(Object.assign({}, contextStyle), customStyle);
  const iconClasses = classNames(customClassNames === null || customClassNames === void 0 ? void 0 : customClassNames.icon, contextClassNames.icon);
  const iconStyle = Object.assign(Object.assign({}, (styles === null || styles === void 0 ? void 0 : styles.icon) || {}), contextStyles.icon || {});
  const iconNode = icon && !innerLoading ? /* @__PURE__ */ React.createElement(IconWrapper, {
    prefixCls,
    className: iconClasses,
    style: iconStyle
  }, icon) : loading && typeof loading === "object" && loading.icon ? /* @__PURE__ */ React.createElement(IconWrapper, {
    prefixCls,
    className: iconClasses,
    style: iconStyle
  }, loading.icon) : /* @__PURE__ */ React.createElement(DefaultLoadingIcon, {
    existIcon: !!icon,
    prefixCls,
    loading: innerLoading,
    mount: isMountRef.current
  });
  const kids = children || children === 0 ? spaceChildren(children, needInserted && mergedInsertSpace) : null;
  if (linkButtonRestProps.href !== void 0) {
    return wrapCSSVar(/* @__PURE__ */ React.createElement("a", Object.assign({}, linkButtonRestProps, {
      className: classNames(classes, {
        [`${prefixCls}-disabled`]: mergedDisabled
      }),
      href: mergedDisabled ? void 0 : linkButtonRestProps.href,
      style: fullStyle,
      onClick: handleClick,
      ref: mergedRef,
      tabIndex: mergedDisabled ? -1 : 0
    }), iconNode, kids));
  }
  let buttonNode = /* @__PURE__ */ React.createElement("button", Object.assign({}, rest, {
    type: htmlType,
    className: classes,
    style: fullStyle,
    onClick: handleClick,
    disabled: mergedDisabled,
    ref: mergedRef
  }), iconNode, kids, compactItemClassnames && /* @__PURE__ */ React.createElement(Compact, {
    prefixCls
  }));
  if (!isUnBorderedButtonVariant(mergedVariant)) {
    buttonNode = /* @__PURE__ */ React.createElement(Wave, {
      component: "Button",
      disabled: innerLoading
    }, buttonNode);
  }
  return wrapCSSVar(buttonNode);
});
const Button$1 = InternalCompoundedButton;
Button$1.Group = ButtonGroup;
Button$1.__ANT_BUTTON = true;
function isThenable(thing) {
  return !!(thing === null || thing === void 0 ? void 0 : thing.then);
}
const ActionButton = (props) => {
  const {
    type,
    children,
    prefixCls,
    buttonProps,
    close,
    autoFocus,
    emitEvent,
    isSilent,
    quitOnNullishReturnValue,
    actionFn
  } = props;
  const clickedRef = reactExports.useRef(false);
  const buttonRef = reactExports.useRef(null);
  const [loading, setLoading] = useSafeState(false);
  const onInternalClose = (...args) => {
    close === null || close === void 0 ? void 0 : close.apply(void 0, args);
  };
  reactExports.useEffect(() => {
    let timeoutId = null;
    if (autoFocus) {
      timeoutId = setTimeout(() => {
        var _a;
        (_a = buttonRef.current) === null || _a === void 0 ? void 0 : _a.focus({
          preventScroll: true
        });
      });
    }
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);
  const handlePromiseOnOk = (returnValueOfOnOk) => {
    if (!isThenable(returnValueOfOnOk)) {
      return;
    }
    setLoading(true);
    returnValueOfOnOk.then((...args) => {
      setLoading(false, true);
      onInternalClose.apply(void 0, args);
      clickedRef.current = false;
    }, (e2) => {
      setLoading(false, true);
      clickedRef.current = false;
      if (isSilent === null || isSilent === void 0 ? void 0 : isSilent()) {
        return;
      }
      return Promise.reject(e2);
    });
  };
  const onClick = (e2) => {
    if (clickedRef.current) {
      return;
    }
    clickedRef.current = true;
    if (!actionFn) {
      onInternalClose();
      return;
    }
    let returnValueOfOnOk;
    if (emitEvent) {
      returnValueOfOnOk = actionFn(e2);
      if (quitOnNullishReturnValue && !isThenable(returnValueOfOnOk)) {
        clickedRef.current = false;
        onInternalClose(e2);
        return;
      }
    } else if (actionFn.length) {
      returnValueOfOnOk = actionFn(close);
      clickedRef.current = false;
    } else {
      returnValueOfOnOk = actionFn();
      if (!isThenable(returnValueOfOnOk)) {
        onInternalClose();
        return;
      }
    }
    handlePromiseOnOk(returnValueOfOnOk);
  };
  return /* @__PURE__ */ reactExports.createElement(Button$1, Object.assign({}, convertLegacyProps(type), {
    onClick,
    loading,
    prefixCls
  }, buttonProps, {
    ref: buttonRef
  }), children);
};
const ModalContext = /* @__PURE__ */ React.createContext({});
const {
  Provider: ModalContextProvider
} = ModalContext;
const ConfirmCancelBtn = () => {
  const {
    autoFocusButton,
    cancelButtonProps,
    cancelTextLocale,
    isSilent,
    mergedOkCancel,
    rootPrefixCls,
    close,
    onCancel,
    onConfirm
  } = reactExports.useContext(ModalContext);
  return mergedOkCancel ? /* @__PURE__ */ React.createElement(ActionButton, {
    isSilent,
    actionFn: onCancel,
    close: (...args) => {
      close === null || close === void 0 ? void 0 : close.apply(void 0, args);
      onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm(false);
    },
    autoFocus: autoFocusButton === "cancel",
    buttonProps: cancelButtonProps,
    prefixCls: `${rootPrefixCls}-btn`
  }, cancelTextLocale) : null;
};
const ConfirmOkBtn = () => {
  const {
    autoFocusButton,
    close,
    isSilent,
    okButtonProps,
    rootPrefixCls,
    okTextLocale,
    okType,
    onConfirm,
    onOk
  } = reactExports.useContext(ModalContext);
  return /* @__PURE__ */ React.createElement(ActionButton, {
    isSilent,
    type: okType || "primary",
    actionFn: onOk,
    close: (...args) => {
      close === null || close === void 0 ? void 0 : close.apply(void 0, args);
      onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm(true);
    },
    autoFocus: autoFocusButton === "ok",
    buttonProps: okButtonProps,
    prefixCls: `${rootPrefixCls}-btn`
  }, okTextLocale);
};
const FormContext = /* @__PURE__ */ reactExports.createContext({
  labelAlign: "right",
  vertical: false,
  itemRef: () => {
  }
});
const NoStyleItemContext = /* @__PURE__ */ reactExports.createContext(null);
const FormProvider = (props) => {
  const providerProps = omit(props, ["prefixCls"]);
  return /* @__PURE__ */ reactExports.createElement(FormProvider$1, Object.assign({}, providerProps));
};
const FormItemPrefixContext = /* @__PURE__ */ reactExports.createContext({
  prefixCls: ""
});
const FormItemInputContext = /* @__PURE__ */ reactExports.createContext({});
const NoFormStyle = ({
  children,
  status,
  override
}) => {
  const formItemInputContext = reactExports.useContext(FormItemInputContext);
  const newFormItemInputContext = reactExports.useMemo(() => {
    const newContext = Object.assign({}, formItemInputContext);
    if (override) {
      delete newContext.isFormItemInput;
    }
    if (status) {
      delete newContext.status;
      delete newContext.hasFeedback;
      delete newContext.feedbackIcon;
    }
    return newContext;
  }, [status, override, formItemInputContext]);
  return /* @__PURE__ */ reactExports.createElement(FormItemInputContext.Provider, {
    value: newFormItemInputContext
  }, children);
};
const VariantContext = /* @__PURE__ */ reactExports.createContext(void 0);
const ContextIsolator = (props) => {
  const {
    space,
    form,
    children
  } = props;
  if (children === void 0 || children === null) {
    return null;
  }
  let result = children;
  if (form) {
    result = /* @__PURE__ */ React.createElement(NoFormStyle, {
      override: true,
      status: true
    }, result);
  }
  if (space) {
    result = /* @__PURE__ */ React.createElement(NoCompactStyle, null, result);
  }
  return result;
};
function mergeProps(...items) {
  const ret = {};
  items.forEach((item) => {
    if (item) {
      Object.keys(item).forEach((key) => {
        if (item[key] !== void 0) {
          ret[key] = item[key];
        }
      });
    }
  });
  return ret;
}
function pickClosable(context) {
  if (!context) {
    return void 0;
  }
  return {
    closable: context.closable,
    closeIcon: context.closeIcon
  };
}
function useClosableConfig(closableCollection) {
  const {
    closable,
    closeIcon
  } = closableCollection || {};
  return React.useMemo(() => {
    if (
      // If `closable`, whatever rest be should be true
      !closable && (closable === false || closeIcon === false || closeIcon === null)
    ) {
      return false;
    }
    if (closable === void 0 && closeIcon === void 0) {
      return null;
    }
    let closableConfig = {
      closeIcon: typeof closeIcon !== "boolean" && closeIcon !== null ? closeIcon : void 0
    };
    if (closable && typeof closable === "object") {
      closableConfig = Object.assign(Object.assign({}, closableConfig), closable);
    }
    return closableConfig;
  }, [closable, closeIcon]);
}
const EmptyFallbackCloseCollection = {};
function useClosable(propCloseCollection, contextCloseCollection, fallbackCloseCollection = EmptyFallbackCloseCollection) {
  const propCloseConfig = useClosableConfig(propCloseCollection);
  const contextCloseConfig = useClosableConfig(contextCloseCollection);
  const [contextLocale] = useLocale("global", localeValues.global);
  const closeBtnIsDisabled = typeof propCloseConfig !== "boolean" ? !!(propCloseConfig === null || propCloseConfig === void 0 ? void 0 : propCloseConfig.disabled) : false;
  const mergedFallbackCloseCollection = React.useMemo(() => Object.assign({
    closeIcon: /* @__PURE__ */ React.createElement(RefIcon$5, null)
  }, fallbackCloseCollection), [fallbackCloseCollection]);
  const mergedClosableConfig = React.useMemo(() => {
    if (propCloseConfig === false) {
      return false;
    }
    if (propCloseConfig) {
      return mergeProps(mergedFallbackCloseCollection, contextCloseConfig, propCloseConfig);
    }
    if (contextCloseConfig === false) {
      return false;
    }
    if (contextCloseConfig) {
      return mergeProps(mergedFallbackCloseCollection, contextCloseConfig);
    }
    return !mergedFallbackCloseCollection.closable ? false : mergedFallbackCloseCollection;
  }, [propCloseConfig, contextCloseConfig, mergedFallbackCloseCollection]);
  return React.useMemo(() => {
    var _a, _b;
    if (mergedClosableConfig === false) {
      return [false, null, closeBtnIsDisabled, {}];
    }
    const {
      closeIconRender
    } = mergedFallbackCloseCollection;
    const {
      closeIcon
    } = mergedClosableConfig;
    let mergedCloseIcon = closeIcon;
    const ariaOrDataProps = pickAttrs(mergedClosableConfig, true);
    if (mergedCloseIcon !== null && mergedCloseIcon !== void 0) {
      if (closeIconRender) {
        mergedCloseIcon = closeIconRender(closeIcon);
      }
      mergedCloseIcon = /* @__PURE__ */ React.isValidElement(mergedCloseIcon) ? /* @__PURE__ */ React.cloneElement(mergedCloseIcon, Object.assign(Object.assign(Object.assign({}, mergedCloseIcon.props), {
        "aria-label": (_b = (_a = mergedCloseIcon.props) === null || _a === void 0 ? void 0 : _a["aria-label"]) !== null && _b !== void 0 ? _b : contextLocale.close
      }), ariaOrDataProps)) : /* @__PURE__ */ React.createElement("span", Object.assign({
        "aria-label": contextLocale.close
      }, ariaOrDataProps), mergedCloseIcon);
    }
    return [true, mergedCloseIcon, closeBtnIsDisabled, ariaOrDataProps];
  }, [mergedClosableConfig, mergedFallbackCloseCollection]);
}
const canUseDocElement = () => canUseDom() && window.document.documentElement;
const Element = (props) => {
  const {
    prefixCls,
    className,
    style,
    size,
    shape
  } = props;
  const sizeCls = classNames({
    [`${prefixCls}-lg`]: size === "large",
    [`${prefixCls}-sm`]: size === "small"
  });
  const shapeCls = classNames({
    [`${prefixCls}-circle`]: shape === "circle",
    [`${prefixCls}-square`]: shape === "square",
    [`${prefixCls}-round`]: shape === "round"
  });
  const sizeStyle = reactExports.useMemo(() => typeof size === "number" ? {
    width: size,
    height: size,
    lineHeight: `${size}px`
  } : {}, [size]);
  return /* @__PURE__ */ reactExports.createElement("span", {
    className: classNames(prefixCls, sizeCls, shapeCls, className),
    style: Object.assign(Object.assign({}, sizeStyle), style)
  });
};
const skeletonClsLoading = new Keyframe(`ant-skeleton-loading`, {
  "0%": {
    backgroundPosition: "100% 50%"
  },
  "100%": {
    backgroundPosition: "0 50%"
  }
});
const genSkeletonElementCommonSize = (size) => ({
  height: size,
  lineHeight: unit(size)
});
const genSkeletonElementAvatarSize = (size) => Object.assign({
  width: size
}, genSkeletonElementCommonSize(size));
const genSkeletonColor = (token) => ({
  background: token.skeletonLoadingBackground,
  backgroundSize: "400% 100%",
  animationName: skeletonClsLoading,
  animationDuration: token.skeletonLoadingMotionDuration,
  animationTimingFunction: "ease",
  animationIterationCount: "infinite"
});
const genSkeletonElementInputSize = (size, calc) => Object.assign({
  width: calc(size).mul(5).equal(),
  minWidth: calc(size).mul(5).equal()
}, genSkeletonElementCommonSize(size));
const genSkeletonElementAvatar = (token) => {
  const {
    skeletonAvatarCls,
    gradientFromColor,
    controlHeight,
    controlHeightLG,
    controlHeightSM
  } = token;
  return {
    [skeletonAvatarCls]: Object.assign({
      display: "inline-block",
      verticalAlign: "top",
      background: gradientFromColor
    }, genSkeletonElementAvatarSize(controlHeight)),
    [`${skeletonAvatarCls}${skeletonAvatarCls}-circle`]: {
      borderRadius: "50%"
    },
    [`${skeletonAvatarCls}${skeletonAvatarCls}-lg`]: Object.assign({}, genSkeletonElementAvatarSize(controlHeightLG)),
    [`${skeletonAvatarCls}${skeletonAvatarCls}-sm`]: Object.assign({}, genSkeletonElementAvatarSize(controlHeightSM))
  };
};
const genSkeletonElementInput = (token) => {
  const {
    controlHeight,
    borderRadiusSM,
    skeletonInputCls,
    controlHeightLG,
    controlHeightSM,
    gradientFromColor,
    calc
  } = token;
  return {
    [skeletonInputCls]: Object.assign({
      display: "inline-block",
      verticalAlign: "top",
      background: gradientFromColor,
      borderRadius: borderRadiusSM
    }, genSkeletonElementInputSize(controlHeight, calc)),
    [`${skeletonInputCls}-lg`]: Object.assign({}, genSkeletonElementInputSize(controlHeightLG, calc)),
    [`${skeletonInputCls}-sm`]: Object.assign({}, genSkeletonElementInputSize(controlHeightSM, calc))
  };
};
const genSkeletonElementImageSize = (size) => Object.assign({
  width: size
}, genSkeletonElementCommonSize(size));
const genSkeletonElementImage = (token) => {
  const {
    skeletonImageCls,
    imageSizeBase,
    gradientFromColor,
    borderRadiusSM,
    calc
  } = token;
  return {
    [skeletonImageCls]: Object.assign(Object.assign({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      verticalAlign: "middle",
      background: gradientFromColor,
      borderRadius: borderRadiusSM
    }, genSkeletonElementImageSize(calc(imageSizeBase).mul(2).equal())), {
      [`${skeletonImageCls}-path`]: {
        fill: "#bfbfbf"
      },
      [`${skeletonImageCls}-svg`]: Object.assign(Object.assign({}, genSkeletonElementImageSize(imageSizeBase)), {
        maxWidth: calc(imageSizeBase).mul(4).equal(),
        maxHeight: calc(imageSizeBase).mul(4).equal()
      }),
      [`${skeletonImageCls}-svg${skeletonImageCls}-svg-circle`]: {
        borderRadius: "50%"
      }
    }),
    [`${skeletonImageCls}${skeletonImageCls}-circle`]: {
      borderRadius: "50%"
    }
  };
};
const genSkeletonElementButtonShape = (token, size, buttonCls) => {
  const {
    skeletonButtonCls
  } = token;
  return {
    [`${buttonCls}${skeletonButtonCls}-circle`]: {
      width: size,
      minWidth: size,
      borderRadius: "50%"
    },
    [`${buttonCls}${skeletonButtonCls}-round`]: {
      borderRadius: size
    }
  };
};
const genSkeletonElementButtonSize = (size, calc) => Object.assign({
  width: calc(size).mul(2).equal(),
  minWidth: calc(size).mul(2).equal()
}, genSkeletonElementCommonSize(size));
const genSkeletonElementButton = (token) => {
  const {
    borderRadiusSM,
    skeletonButtonCls,
    controlHeight,
    controlHeightLG,
    controlHeightSM,
    gradientFromColor,
    calc
  } = token;
  return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
    [skeletonButtonCls]: Object.assign({
      display: "inline-block",
      verticalAlign: "top",
      background: gradientFromColor,
      borderRadius: borderRadiusSM,
      width: calc(controlHeight).mul(2).equal(),
      minWidth: calc(controlHeight).mul(2).equal()
    }, genSkeletonElementButtonSize(controlHeight, calc))
  }, genSkeletonElementButtonShape(token, controlHeight, skeletonButtonCls)), {
    [`${skeletonButtonCls}-lg`]: Object.assign({}, genSkeletonElementButtonSize(controlHeightLG, calc))
  }), genSkeletonElementButtonShape(token, controlHeightLG, `${skeletonButtonCls}-lg`)), {
    [`${skeletonButtonCls}-sm`]: Object.assign({}, genSkeletonElementButtonSize(controlHeightSM, calc))
  }), genSkeletonElementButtonShape(token, controlHeightSM, `${skeletonButtonCls}-sm`));
};
const genBaseStyle$4 = (token) => {
  const {
    componentCls,
    skeletonAvatarCls,
    skeletonTitleCls,
    skeletonParagraphCls,
    skeletonButtonCls,
    skeletonInputCls,
    skeletonImageCls,
    controlHeight,
    controlHeightLG,
    controlHeightSM,
    gradientFromColor,
    padding,
    marginSM,
    borderRadius,
    titleHeight,
    blockRadius,
    paragraphLiHeight,
    controlHeightXS,
    paragraphMarginTop
  } = token;
  return {
    [componentCls]: {
      display: "table",
      width: "100%",
      [`${componentCls}-header`]: {
        display: "table-cell",
        paddingInlineEnd: padding,
        verticalAlign: "top",
        // Avatar
        [skeletonAvatarCls]: Object.assign({
          display: "inline-block",
          verticalAlign: "top",
          background: gradientFromColor
        }, genSkeletonElementAvatarSize(controlHeight)),
        [`${skeletonAvatarCls}-circle`]: {
          borderRadius: "50%"
        },
        [`${skeletonAvatarCls}-lg`]: Object.assign({}, genSkeletonElementAvatarSize(controlHeightLG)),
        [`${skeletonAvatarCls}-sm`]: Object.assign({}, genSkeletonElementAvatarSize(controlHeightSM))
      },
      [`${componentCls}-content`]: {
        display: "table-cell",
        width: "100%",
        verticalAlign: "top",
        // Title
        [skeletonTitleCls]: {
          width: "100%",
          height: titleHeight,
          background: gradientFromColor,
          borderRadius: blockRadius,
          [`+ ${skeletonParagraphCls}`]: {
            marginBlockStart: controlHeightSM
          }
        },
        // paragraph
        [skeletonParagraphCls]: {
          padding: 0,
          "> li": {
            width: "100%",
            height: paragraphLiHeight,
            listStyle: "none",
            background: gradientFromColor,
            borderRadius: blockRadius,
            "+ li": {
              marginBlockStart: controlHeightXS
            }
          }
        },
        [`${skeletonParagraphCls}> li:last-child:not(:first-child):not(:nth-child(2))`]: {
          width: "61%"
        }
      },
      [`&-round ${componentCls}-content`]: {
        [`${skeletonTitleCls}, ${skeletonParagraphCls} > li`]: {
          borderRadius
        }
      }
    },
    [`${componentCls}-with-avatar ${componentCls}-content`]: {
      // Title
      [skeletonTitleCls]: {
        marginBlockStart: marginSM,
        [`+ ${skeletonParagraphCls}`]: {
          marginBlockStart: paragraphMarginTop
        }
      }
    },
    // Skeleton element
    [`${componentCls}${componentCls}-element`]: Object.assign(Object.assign(Object.assign(Object.assign({
      display: "inline-block",
      width: "auto"
    }, genSkeletonElementButton(token)), genSkeletonElementAvatar(token)), genSkeletonElementInput(token)), genSkeletonElementImage(token)),
    // Skeleton Block Button, Input
    [`${componentCls}${componentCls}-block`]: {
      width: "100%",
      [skeletonButtonCls]: {
        width: "100%"
      },
      [skeletonInputCls]: {
        width: "100%"
      }
    },
    // With active animation
    [`${componentCls}${componentCls}-active`]: {
      [`
        ${skeletonTitleCls},
        ${skeletonParagraphCls} > li,
        ${skeletonAvatarCls},
        ${skeletonButtonCls},
        ${skeletonInputCls},
        ${skeletonImageCls}
      `]: Object.assign({}, genSkeletonColor(token))
    }
  };
};
const prepareComponentToken$j = (token) => {
  const {
    colorFillContent,
    colorFill
  } = token;
  const gradientFromColor = colorFillContent;
  const gradientToColor = colorFill;
  return {
    color: gradientFromColor,
    colorGradientEnd: gradientToColor,
    gradientFromColor,
    gradientToColor,
    titleHeight: token.controlHeight / 2,
    blockRadius: token.borderRadiusSM,
    paragraphMarginTop: token.marginLG + token.marginXXS,
    paragraphLiHeight: token.controlHeight / 2
  };
};
const useStyle$n = genStyleHooks("Skeleton", (token) => {
  const {
    componentCls,
    calc
  } = token;
  const skeletonToken = merge$1(token, {
    skeletonAvatarCls: `${componentCls}-avatar`,
    skeletonTitleCls: `${componentCls}-title`,
    skeletonParagraphCls: `${componentCls}-paragraph`,
    skeletonButtonCls: `${componentCls}-button`,
    skeletonInputCls: `${componentCls}-input`,
    skeletonImageCls: `${componentCls}-image`,
    imageSizeBase: calc(token.controlHeight).mul(1.5).equal(),
    borderRadius: 100,
    // Large number to make capsule shape
    skeletonLoadingBackground: `linear-gradient(90deg, ${token.gradientFromColor} 25%, ${token.gradientToColor} 37%, ${token.gradientFromColor} 63%)`,
    skeletonLoadingMotionDuration: "1.4s"
  });
  return [genBaseStyle$4(skeletonToken)];
}, prepareComponentToken$j, {
  deprecatedTokens: [["color", "gradientFromColor"], ["colorGradientEnd", "gradientToColor"]]
});
const SkeletonAvatar = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    active,
    shape = "circle",
    size = "default"
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$n(prefixCls);
  const otherProps = omit(props, ["prefixCls", "className"]);
  const cls = classNames(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active
  }, className, rootClassName, hashId, cssVarCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
    className: cls
  }, /* @__PURE__ */ reactExports.createElement(Element, Object.assign({
    prefixCls: `${prefixCls}-avatar`,
    shape,
    size
  }, otherProps))));
};
const SkeletonButton = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    active,
    block = false,
    size = "default"
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$n(prefixCls);
  const otherProps = omit(props, ["prefixCls"]);
  const cls = classNames(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-block`]: block
  }, className, rootClassName, hashId, cssVarCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
    className: cls
  }, /* @__PURE__ */ reactExports.createElement(Element, Object.assign({
    prefixCls: `${prefixCls}-button`,
    size
  }, otherProps))));
};
const path = "M365.714286 329.142857q0 45.714286-32.036571 77.677714t-77.677714 32.036571-77.677714-32.036571-32.036571-77.677714 32.036571-77.677714 77.677714-32.036571 77.677714 32.036571 32.036571 77.677714zM950.857143 548.571429l0 256-804.571429 0 0-109.714286 182.857143-182.857143 91.428571 91.428571 292.571429-292.571429zM1005.714286 146.285714l-914.285714 0q-7.460571 0-12.873143 5.412571t-5.412571 12.873143l0 694.857143q0 7.460571 5.412571 12.873143t12.873143 5.412571l914.285714 0q7.460571 0 12.873143-5.412571t5.412571-12.873143l0-694.857143q0-7.460571-5.412571-12.873143t-12.873143-5.412571zM1097.142857 164.571429l0 694.857143q0 37.741714-26.843429 64.585143t-64.585143 26.843429l-914.285714 0q-37.741714 0-64.585143-26.843429t-26.843429-64.585143l0-694.857143q0-37.741714 26.843429-64.585143t64.585143-26.843429l914.285714 0q37.741714 0 64.585143 26.843429t26.843429 64.585143z";
const SkeletonImage = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    active
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$n(prefixCls);
  const cls = classNames(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active
  }, className, rootClassName, hashId, cssVarCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
    className: cls
  }, /* @__PURE__ */ reactExports.createElement("div", {
    className: classNames(`${prefixCls}-image`, className),
    style
  }, /* @__PURE__ */ reactExports.createElement("svg", {
    viewBox: "0 0 1098 1024",
    xmlns: "http://www.w3.org/2000/svg",
    className: `${prefixCls}-image-svg`
  }, /* @__PURE__ */ reactExports.createElement("title", null, "Image placeholder"), /* @__PURE__ */ reactExports.createElement("path", {
    d: path,
    className: `${prefixCls}-image-path`
  })))));
};
const SkeletonInput = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    active,
    block,
    size = "default"
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$n(prefixCls);
  const otherProps = omit(props, ["prefixCls"]);
  const cls = classNames(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active,
    [`${prefixCls}-block`]: block
  }, className, rootClassName, hashId, cssVarCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
    className: cls
  }, /* @__PURE__ */ reactExports.createElement(Element, Object.assign({
    prefixCls: `${prefixCls}-input`,
    size
  }, otherProps))));
};
const SkeletonNode = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    active,
    children
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$n(prefixCls);
  const cls = classNames(prefixCls, `${prefixCls}-element`, {
    [`${prefixCls}-active`]: active
  }, hashId, className, rootClassName, cssVarCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
    className: cls
  }, /* @__PURE__ */ reactExports.createElement("div", {
    className: classNames(`${prefixCls}-image`, className),
    style
  }, children)));
};
const getWidth = (index, props) => {
  const {
    width,
    rows = 2
  } = props;
  if (Array.isArray(width)) {
    return width[index];
  }
  if (rows - 1 === index) {
    return width;
  }
  return void 0;
};
const Paragraph$1 = (props) => {
  const {
    prefixCls,
    className,
    style,
    rows = 0
  } = props;
  const rowList = Array.from({
    length: rows
  }).map((_, index) => (
    // eslint-disable-next-line react/no-array-index-key
    /* @__PURE__ */ reactExports.createElement("li", {
      key: index,
      style: {
        width: getWidth(index, props)
      }
    })
  ));
  return /* @__PURE__ */ reactExports.createElement("ul", {
    className: classNames(prefixCls, className),
    style
  }, rowList);
};
const Title$1 = ({
  prefixCls,
  className,
  width,
  style
}) => (
  // biome-ignore lint/a11y/useHeadingContent: HOC here
  /* @__PURE__ */ reactExports.createElement("h3", {
    className: classNames(prefixCls, className),
    style: Object.assign({
      width
    }, style)
  })
);
function getComponentProps(prop) {
  if (prop && typeof prop === "object") {
    return prop;
  }
  return {};
}
function getAvatarBasicProps(hasTitle, hasParagraph) {
  if (hasTitle && !hasParagraph) {
    return {
      size: "large",
      shape: "square"
    };
  }
  return {
    size: "large",
    shape: "circle"
  };
}
function getTitleBasicProps(hasAvatar, hasParagraph) {
  if (!hasAvatar && hasParagraph) {
    return {
      width: "38%"
    };
  }
  if (hasAvatar && hasParagraph) {
    return {
      width: "50%"
    };
  }
  return {};
}
function getParagraphBasicProps(hasAvatar, hasTitle) {
  const basicProps = {};
  if (!hasAvatar || !hasTitle) {
    basicProps.width = "61%";
  }
  if (!hasAvatar && hasTitle) {
    basicProps.rows = 3;
  } else {
    basicProps.rows = 2;
  }
  return basicProps;
}
const Skeleton = (props) => {
  const {
    prefixCls: customizePrefixCls,
    loading,
    className,
    rootClassName,
    style,
    children,
    avatar = false,
    title = true,
    paragraph = true,
    active,
    round
  } = props;
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig("skeleton");
  const prefixCls = getPrefixCls("skeleton", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$n(prefixCls);
  if (loading || !("loading" in props)) {
    const hasAvatar = !!avatar;
    const hasTitle = !!title;
    const hasParagraph = !!paragraph;
    let avatarNode;
    if (hasAvatar) {
      const avatarProps = Object.assign(Object.assign({
        prefixCls: `${prefixCls}-avatar`
      }, getAvatarBasicProps(hasTitle, hasParagraph)), getComponentProps(avatar));
      avatarNode = /* @__PURE__ */ reactExports.createElement("div", {
        className: `${prefixCls}-header`
      }, /* @__PURE__ */ reactExports.createElement(Element, Object.assign({}, avatarProps)));
    }
    let contentNode;
    if (hasTitle || hasParagraph) {
      let $title;
      if (hasTitle) {
        const titleProps = Object.assign(Object.assign({
          prefixCls: `${prefixCls}-title`
        }, getTitleBasicProps(hasAvatar, hasParagraph)), getComponentProps(title));
        $title = /* @__PURE__ */ reactExports.createElement(Title$1, Object.assign({}, titleProps));
      }
      let paragraphNode;
      if (hasParagraph) {
        const paragraphProps = Object.assign(Object.assign({
          prefixCls: `${prefixCls}-paragraph`
        }, getParagraphBasicProps(hasAvatar, hasTitle)), getComponentProps(paragraph));
        paragraphNode = /* @__PURE__ */ reactExports.createElement(Paragraph$1, Object.assign({}, paragraphProps));
      }
      contentNode = /* @__PURE__ */ reactExports.createElement("div", {
        className: `${prefixCls}-content`
      }, $title, paragraphNode);
    }
    const cls = classNames(prefixCls, {
      [`${prefixCls}-with-avatar`]: hasAvatar,
      [`${prefixCls}-active`]: active,
      [`${prefixCls}-rtl`]: direction === "rtl",
      [`${prefixCls}-round`]: round
    }, contextClassName, className, rootClassName, hashId, cssVarCls);
    return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
      className: cls,
      style: Object.assign(Object.assign({}, contextStyle), style)
    }, avatarNode, contentNode));
  }
  return children !== null && children !== void 0 ? children : null;
};
Skeleton.Button = SkeletonButton;
Skeleton.Avatar = SkeletonAvatar;
Skeleton.Input = SkeletonInput;
Skeleton.Image = SkeletonImage;
Skeleton.Node = SkeletonNode;
function voidFunc() {
}
const WatermarkContext = /* @__PURE__ */ reactExports.createContext({
  add: voidFunc,
  remove: voidFunc
});
function usePanelRef(panelSelector) {
  const watermark = reactExports.useContext(WatermarkContext);
  const panelEleRef = reactExports.useRef(null);
  const panelRef = useEvent((ele) => {
    if (ele) {
      const innerContentEle = panelSelector ? ele.querySelector(panelSelector) : ele;
      watermark.add(innerContentEle);
      panelEleRef.current = innerContentEle;
    } else {
      watermark.remove(panelEleRef.current);
    }
  });
  return panelRef;
}
const NormalCancelBtn = () => {
  const {
    cancelButtonProps,
    cancelTextLocale,
    onCancel
  } = reactExports.useContext(ModalContext);
  return /* @__PURE__ */ React.createElement(Button$1, Object.assign({
    onClick: onCancel
  }, cancelButtonProps), cancelTextLocale);
};
const NormalOkBtn = () => {
  const {
    confirmLoading,
    okButtonProps,
    okType,
    okTextLocale,
    onOk
  } = reactExports.useContext(ModalContext);
  return /* @__PURE__ */ React.createElement(Button$1, Object.assign({}, convertLegacyProps(okType), {
    loading: confirmLoading,
    onClick: onOk
  }, okButtonProps), okTextLocale);
};
function renderCloseIcon(prefixCls, closeIcon) {
  return /* @__PURE__ */ React.createElement("span", {
    className: `${prefixCls}-close-x`
  }, closeIcon || /* @__PURE__ */ React.createElement(RefIcon$5, {
    className: `${prefixCls}-close-icon`
  }));
}
const Footer = (props) => {
  const {
    okText,
    okType = "primary",
    cancelText,
    confirmLoading,
    onOk,
    onCancel,
    okButtonProps,
    cancelButtonProps,
    footer
  } = props;
  const [locale2] = useLocale("Modal", getConfirmLocale());
  const okTextLocale = okText || (locale2 === null || locale2 === void 0 ? void 0 : locale2.okText);
  const cancelTextLocale = cancelText || (locale2 === null || locale2 === void 0 ? void 0 : locale2.cancelText);
  const btnCtxValue = {
    confirmLoading,
    okButtonProps,
    cancelButtonProps,
    okTextLocale,
    cancelTextLocale,
    okType,
    onOk,
    onCancel
  };
  const btnCtxValueMemo = React.useMemo(() => btnCtxValue, _toConsumableArray(Object.values(btnCtxValue)));
  let footerNode;
  if (typeof footer === "function" || typeof footer === "undefined") {
    footerNode = /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(NormalCancelBtn, null), /* @__PURE__ */ React.createElement(NormalOkBtn, null));
    if (typeof footer === "function") {
      footerNode = footer(footerNode, {
        OkBtn: NormalOkBtn,
        CancelBtn: NormalCancelBtn
      });
    }
    footerNode = /* @__PURE__ */ React.createElement(ModalContextProvider, {
      value: btnCtxValueMemo
    }, footerNode);
  } else {
    footerNode = footer;
  }
  return /* @__PURE__ */ React.createElement(DisabledContextProvider, {
    disabled: false
  }, footerNode);
};
const genGridRowStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    // Grid system
    [componentCls]: {
      display: "flex",
      flexFlow: "row wrap",
      minWidth: 0,
      "&::before, &::after": {
        display: "flex"
      },
      "&-no-wrap": {
        flexWrap: "nowrap"
      },
      // The origin of the X-axis
      "&-start": {
        justifyContent: "flex-start"
      },
      // The center of the X-axis
      "&-center": {
        justifyContent: "center"
      },
      // The opposite of the X-axis
      "&-end": {
        justifyContent: "flex-end"
      },
      "&-space-between": {
        justifyContent: "space-between"
      },
      "&-space-around": {
        justifyContent: "space-around"
      },
      "&-space-evenly": {
        justifyContent: "space-evenly"
      },
      // Align at the top
      "&-top": {
        alignItems: "flex-start"
      },
      // Align at the center
      "&-middle": {
        alignItems: "center"
      },
      "&-bottom": {
        alignItems: "flex-end"
      }
    }
  };
};
const genGridColStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    // Grid system
    [componentCls]: {
      position: "relative",
      maxWidth: "100%",
      // Prevent columns from collapsing when empty
      minHeight: 1
    }
  };
};
const genLoopGridColumnsStyle = (token, sizeCls) => {
  const {
    prefixCls,
    componentCls,
    gridColumns
  } = token;
  const gridColumnsStyle = {};
  for (let i = gridColumns; i >= 0; i--) {
    if (i === 0) {
      gridColumnsStyle[`${componentCls}${sizeCls}-${i}`] = {
        display: "none"
      };
      gridColumnsStyle[`${componentCls}-push-${i}`] = {
        insetInlineStart: "auto"
      };
      gridColumnsStyle[`${componentCls}-pull-${i}`] = {
        insetInlineEnd: "auto"
      };
      gridColumnsStyle[`${componentCls}${sizeCls}-push-${i}`] = {
        insetInlineStart: "auto"
      };
      gridColumnsStyle[`${componentCls}${sizeCls}-pull-${i}`] = {
        insetInlineEnd: "auto"
      };
      gridColumnsStyle[`${componentCls}${sizeCls}-offset-${i}`] = {
        marginInlineStart: 0
      };
      gridColumnsStyle[`${componentCls}${sizeCls}-order-${i}`] = {
        order: 0
      };
    } else {
      gridColumnsStyle[`${componentCls}${sizeCls}-${i}`] = [
        // https://github.com/ant-design/ant-design/issues/44456
        // Form set `display: flex` on Col which will override `display: block`.
        // Let's get it from css variable to support override.
        {
          ["--ant-display"]: "block",
          // Fallback to display if variable not support
          display: "block"
        },
        {
          display: "var(--ant-display)",
          flex: `0 0 ${i / gridColumns * 100}%`,
          maxWidth: `${i / gridColumns * 100}%`
        }
      ];
      gridColumnsStyle[`${componentCls}${sizeCls}-push-${i}`] = {
        insetInlineStart: `${i / gridColumns * 100}%`
      };
      gridColumnsStyle[`${componentCls}${sizeCls}-pull-${i}`] = {
        insetInlineEnd: `${i / gridColumns * 100}%`
      };
      gridColumnsStyle[`${componentCls}${sizeCls}-offset-${i}`] = {
        marginInlineStart: `${i / gridColumns * 100}%`
      };
      gridColumnsStyle[`${componentCls}${sizeCls}-order-${i}`] = {
        order: i
      };
    }
  }
  gridColumnsStyle[`${componentCls}${sizeCls}-flex`] = {
    flex: `var(--${prefixCls}${sizeCls}-flex)`
  };
  return gridColumnsStyle;
};
const genGridStyle = (token, sizeCls) => genLoopGridColumnsStyle(token, sizeCls);
const genGridMediaStyle = (token, screenSize, sizeCls) => ({
  [`@media (min-width: ${unit(screenSize)})`]: Object.assign({}, genGridStyle(token, sizeCls))
});
const prepareRowComponentToken = () => ({});
const prepareColComponentToken = () => ({});
const useRowStyle = genStyleHooks("Grid", genGridRowStyle, prepareRowComponentToken);
const getMediaSize = (token) => {
  const mediaSizesMap = {
    xs: token.screenXSMin,
    sm: token.screenSMMin,
    md: token.screenMDMin,
    lg: token.screenLGMin,
    xl: token.screenXLMin,
    xxl: token.screenXXLMin
  };
  return mediaSizesMap;
};
const useColStyle = genStyleHooks("Grid", (token) => {
  const gridToken = merge$1(token, {
    gridColumns: 24
    // Row is divided into 24 parts in Grid
  });
  const gridMediaSizesMap = getMediaSize(gridToken);
  delete gridMediaSizesMap.xs;
  return [genGridColStyle(gridToken), genGridStyle(gridToken, ""), genGridStyle(gridToken, "-xs"), Object.keys(gridMediaSizesMap).map((key) => genGridMediaStyle(gridToken, gridMediaSizesMap[key], `-${key}`)).reduce((pre, cur) => Object.assign(Object.assign({}, pre), cur), {})];
}, prepareColComponentToken);
function box(position2) {
  return {
    position: position2,
    inset: 0
  };
}
const genModalMaskStyle = (token) => {
  const {
    componentCls,
    antCls
  } = token;
  return [{
    [`${componentCls}-root`]: {
      [`${componentCls}${antCls}-zoom-enter, ${componentCls}${antCls}-zoom-appear`]: {
        // reset scale avoid mousePosition bug
        transform: "none",
        opacity: 0,
        animationDuration: token.motionDurationSlow,
        // https://github.com/ant-design/ant-design/issues/11777
        userSelect: "none"
      },
      // https://github.com/ant-design/ant-design/issues/37329
      // https://github.com/ant-design/ant-design/issues/40272
      [`${componentCls}${antCls}-zoom-leave ${componentCls}-content`]: {
        pointerEvents: "none"
      },
      [`${componentCls}-mask`]: Object.assign(Object.assign({}, box("fixed")), {
        zIndex: token.zIndexPopupBase,
        height: "100%",
        backgroundColor: token.colorBgMask,
        pointerEvents: "none",
        [`${componentCls}-hidden`]: {
          display: "none"
        }
      }),
      [`${componentCls}-wrap`]: Object.assign(Object.assign({}, box("fixed")), {
        zIndex: token.zIndexPopupBase,
        overflow: "auto",
        outline: 0,
        WebkitOverflowScrolling: "touch"
      })
    }
  }, {
    [`${componentCls}-root`]: initFadeMotion(token)
  }];
};
const genModalStyle = (token) => {
  const {
    componentCls
  } = token;
  return [
    // ======================== Root =========================
    {
      [`${componentCls}-root`]: {
        [`${componentCls}-wrap-rtl`]: {
          direction: "rtl"
        },
        [`${componentCls}-centered`]: {
          textAlign: "center",
          "&::before": {
            display: "inline-block",
            width: 0,
            height: "100%",
            verticalAlign: "middle",
            content: '""'
          },
          [componentCls]: {
            top: 0,
            display: "inline-block",
            paddingBottom: 0,
            textAlign: "start",
            verticalAlign: "middle"
          }
        },
        [`@media (max-width: ${token.screenSMMax}px)`]: {
          [componentCls]: {
            maxWidth: "calc(100vw - 16px)",
            margin: `${unit(token.marginXS)} auto`
          },
          [`${componentCls}-centered`]: {
            [componentCls]: {
              flex: 1
            }
          }
        }
      }
    },
    // ======================== Modal ========================
    {
      [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
        pointerEvents: "none",
        position: "relative",
        top: 100,
        width: "auto",
        maxWidth: `calc(100vw - ${unit(token.calc(token.margin).mul(2).equal())})`,
        margin: "0 auto",
        paddingBottom: token.paddingLG,
        [`${componentCls}-title`]: {
          margin: 0,
          color: token.titleColor,
          fontWeight: token.fontWeightStrong,
          fontSize: token.titleFontSize,
          lineHeight: token.titleLineHeight,
          wordWrap: "break-word"
        },
        [`${componentCls}-content`]: {
          position: "relative",
          backgroundColor: token.contentBg,
          backgroundClip: "padding-box",
          border: 0,
          borderRadius: token.borderRadiusLG,
          boxShadow: token.boxShadow,
          pointerEvents: "auto",
          padding: token.contentPadding
        },
        [`${componentCls}-close`]: Object.assign({
          position: "absolute",
          top: token.calc(token.modalHeaderHeight).sub(token.modalCloseBtnSize).div(2).equal(),
          insetInlineEnd: token.calc(token.modalHeaderHeight).sub(token.modalCloseBtnSize).div(2).equal(),
          zIndex: token.calc(token.zIndexPopupBase).add(10).equal(),
          padding: 0,
          color: token.modalCloseIconColor,
          fontWeight: token.fontWeightStrong,
          lineHeight: 1,
          textDecoration: "none",
          background: "transparent",
          borderRadius: token.borderRadiusSM,
          width: token.modalCloseBtnSize,
          height: token.modalCloseBtnSize,
          border: 0,
          outline: 0,
          cursor: "pointer",
          transition: `color ${token.motionDurationMid}, background-color ${token.motionDurationMid}`,
          "&-x": {
            display: "flex",
            fontSize: token.fontSizeLG,
            fontStyle: "normal",
            lineHeight: unit(token.modalCloseBtnSize),
            justifyContent: "center",
            textTransform: "none",
            textRendering: "auto"
          },
          "&:disabled": {
            pointerEvents: "none"
          },
          "&:hover": {
            color: token.modalCloseIconHoverColor,
            backgroundColor: token.colorBgTextHover,
            textDecoration: "none"
          },
          "&:active": {
            backgroundColor: token.colorBgTextActive
          }
        }, genFocusStyle(token)),
        [`${componentCls}-header`]: {
          color: token.colorText,
          background: token.headerBg,
          borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`,
          marginBottom: token.headerMarginBottom,
          padding: token.headerPadding,
          borderBottom: token.headerBorderBottom
        },
        [`${componentCls}-body`]: {
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          wordWrap: "break-word",
          padding: token.bodyPadding,
          [`${componentCls}-body-skeleton`]: {
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: `${unit(token.margin)} auto`
          }
        },
        [`${componentCls}-footer`]: {
          textAlign: "end",
          background: token.footerBg,
          marginTop: token.footerMarginTop,
          padding: token.footerPadding,
          borderTop: token.footerBorderTop,
          borderRadius: token.footerBorderRadius,
          [`> ${token.antCls}-btn + ${token.antCls}-btn`]: {
            marginInlineStart: token.marginXS
          }
        },
        [`${componentCls}-open`]: {
          overflow: "hidden"
        }
      })
    },
    // ======================== Pure =========================
    {
      [`${componentCls}-pure-panel`]: {
        top: "auto",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        [`${componentCls}-content,
          ${componentCls}-body,
          ${componentCls}-confirm-body-wrapper`]: {
          display: "flex",
          flexDirection: "column",
          flex: "auto"
        },
        [`${componentCls}-confirm-body`]: {
          marginBottom: "auto"
        }
      }
    }
  ];
};
const genRTLStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-root`]: {
      [`${componentCls}-wrap-rtl`]: {
        direction: "rtl",
        [`${componentCls}-confirm-body`]: {
          direction: "rtl"
        }
      }
    }
  };
};
const genResponsiveWidthStyle = (token) => {
  const {
    componentCls
  } = token;
  const oriGridMediaSizesMap = getMediaSize(token);
  const gridMediaSizesMap = Object.assign({}, oriGridMediaSizesMap);
  delete gridMediaSizesMap.xs;
  const cssVarPrefix = `--${componentCls.replace(".", "")}-`;
  const responsiveStyles = Object.keys(gridMediaSizesMap).map((key) => ({
    [`@media (min-width: ${unit(gridMediaSizesMap[key])})`]: {
      width: `var(${cssVarPrefix}${key}-width)`
    }
  }));
  return {
    [`${componentCls}-root`]: {
      [componentCls]: [].concat(_toConsumableArray(Object.keys(oriGridMediaSizesMap).map((currentKey, index) => {
        const previousKey = Object.keys(oriGridMediaSizesMap)[index - 1];
        return previousKey ? {
          [`${cssVarPrefix}${currentKey}-width`]: `var(${cssVarPrefix}${previousKey}-width)`
        } : null;
      })), [{
        width: `var(${cssVarPrefix}xs-width)`
      }], _toConsumableArray(responsiveStyles))
    }
  };
};
const prepareToken$3 = (token) => {
  const headerPaddingVertical = token.padding;
  const headerFontSize = token.fontSizeHeading5;
  const headerLineHeight = token.lineHeightHeading5;
  const modalToken = merge$1(token, {
    modalHeaderHeight: token.calc(token.calc(headerLineHeight).mul(headerFontSize).equal()).add(token.calc(headerPaddingVertical).mul(2).equal()).equal(),
    modalFooterBorderColorSplit: token.colorSplit,
    modalFooterBorderStyle: token.lineType,
    modalFooterBorderWidth: token.lineWidth,
    modalCloseIconColor: token.colorIcon,
    modalCloseIconHoverColor: token.colorIconHover,
    modalCloseBtnSize: token.controlHeight,
    modalConfirmIconSize: token.fontHeight,
    modalTitleHeight: token.calc(token.titleFontSize).mul(token.titleLineHeight).equal()
  });
  return modalToken;
};
const prepareComponentToken$i = (token) => ({
  footerBg: "transparent",
  headerBg: token.colorBgElevated,
  titleLineHeight: token.lineHeightHeading5,
  titleFontSize: token.fontSizeHeading5,
  contentBg: token.colorBgElevated,
  titleColor: token.colorTextHeading,
  // internal
  contentPadding: token.wireframe ? 0 : `${unit(token.paddingMD)} ${unit(token.paddingContentHorizontalLG)}`,
  headerPadding: token.wireframe ? `${unit(token.padding)} ${unit(token.paddingLG)}` : 0,
  headerBorderBottom: token.wireframe ? `${unit(token.lineWidth)} ${token.lineType} ${token.colorSplit}` : "none",
  headerMarginBottom: token.wireframe ? 0 : token.marginXS,
  bodyPadding: token.wireframe ? token.paddingLG : 0,
  footerPadding: token.wireframe ? `${unit(token.paddingXS)} ${unit(token.padding)}` : 0,
  footerBorderTop: token.wireframe ? `${unit(token.lineWidth)} ${token.lineType} ${token.colorSplit}` : "none",
  footerBorderRadius: token.wireframe ? `0 0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)}` : 0,
  footerMarginTop: token.wireframe ? 0 : token.marginSM,
  confirmBodyPadding: token.wireframe ? `${unit(token.padding * 2)} ${unit(token.padding * 2)} ${unit(token.paddingLG)}` : 0,
  confirmIconMarginInlineEnd: token.wireframe ? token.margin : token.marginSM,
  confirmBtnsMarginTop: token.wireframe ? token.marginLG : token.marginSM
});
const useStyle$m = genStyleHooks("Modal", (token) => {
  const modalToken = prepareToken$3(token);
  return [genModalStyle(modalToken), genRTLStyle(modalToken), genModalMaskStyle(modalToken), initZoomMotion(modalToken, "zoom"), genResponsiveWidthStyle(modalToken)];
}, prepareComponentToken$i, {
  unitless: {
    titleLineHeight: true
  }
});
var __rest$P = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
let mousePosition;
const getClickPosition = (e2) => {
  mousePosition = {
    x: e2.pageX,
    y: e2.pageY
  };
  setTimeout(() => {
    mousePosition = null;
  }, 100);
};
if (canUseDocElement()) {
  document.documentElement.addEventListener("click", getClickPosition, true);
}
const Modal$1 = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    open: open2,
    wrapClassName,
    centered,
    getContainer,
    focusTriggerAfterClose = true,
    style,
    // Deprecated
    visible,
    width = 520,
    footer,
    classNames: modalClassNames,
    styles: modalStyles,
    children,
    loading,
    confirmLoading,
    zIndex: customizeZIndex,
    mousePosition: customizeMousePosition,
    onOk,
    onCancel,
    destroyOnHidden,
    destroyOnClose
  } = props, restProps = __rest$P(props, ["prefixCls", "className", "rootClassName", "open", "wrapClassName", "centered", "getContainer", "focusTriggerAfterClose", "style", "visible", "width", "footer", "classNames", "styles", "children", "loading", "confirmLoading", "zIndex", "mousePosition", "onOk", "onCancel", "destroyOnHidden", "destroyOnClose"]);
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction,
    modal: modalContext
  } = reactExports.useContext(ConfigContext);
  const handleCancel = (e2) => {
    if (confirmLoading) {
      return;
    }
    onCancel === null || onCancel === void 0 ? void 0 : onCancel(e2);
  };
  const handleOk = (e2) => {
    onOk === null || onOk === void 0 ? void 0 : onOk(e2);
  };
  const prefixCls = getPrefixCls("modal", customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$m(prefixCls, rootCls);
  const wrapClassNameExtended = classNames(wrapClassName, {
    [`${prefixCls}-centered`]: centered !== null && centered !== void 0 ? centered : modalContext === null || modalContext === void 0 ? void 0 : modalContext.centered,
    [`${prefixCls}-wrap-rtl`]: direction === "rtl"
  });
  const dialogFooter = footer !== null && !loading ? /* @__PURE__ */ reactExports.createElement(Footer, Object.assign({}, props, {
    onOk: handleOk,
    onCancel: handleCancel
  })) : null;
  const [mergedClosable, mergedCloseIcon, closeBtnIsDisabled, ariaProps] = useClosable(pickClosable(props), pickClosable(modalContext), {
    closable: true,
    closeIcon: /* @__PURE__ */ reactExports.createElement(RefIcon$5, {
      className: `${prefixCls}-close-icon`
    }),
    closeIconRender: (icon) => renderCloseIcon(prefixCls, icon)
  });
  const panelRef = usePanelRef(`.${prefixCls}-content`);
  const [zIndex, contextZIndex] = useZIndex("Modal", customizeZIndex);
  const [numWidth, responsiveWidth] = reactExports.useMemo(() => {
    if (width && typeof width === "object") {
      return [void 0, width];
    }
    return [width, void 0];
  }, [width]);
  const responsiveWidthVars = reactExports.useMemo(() => {
    const vars = {};
    if (responsiveWidth) {
      Object.keys(responsiveWidth).forEach((breakpoint) => {
        const breakpointWidth = responsiveWidth[breakpoint];
        if (breakpointWidth !== void 0) {
          vars[`--${prefixCls}-${breakpoint}-width`] = typeof breakpointWidth === "number" ? `${breakpointWidth}px` : breakpointWidth;
        }
      });
    }
    return vars;
  }, [responsiveWidth]);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(ContextIsolator, {
    form: true,
    space: true
  }, /* @__PURE__ */ reactExports.createElement(zIndexContext.Provider, {
    value: contextZIndex
  }, /* @__PURE__ */ reactExports.createElement(DialogWrap, Object.assign({
    width: numWidth
  }, restProps, {
    zIndex,
    getContainer: getContainer === void 0 ? getContextPopupContainer : getContainer,
    prefixCls,
    rootClassName: classNames(hashId, rootClassName, cssVarCls, rootCls),
    footer: dialogFooter,
    visible: open2 !== null && open2 !== void 0 ? open2 : visible,
    mousePosition: customizeMousePosition !== null && customizeMousePosition !== void 0 ? customizeMousePosition : mousePosition,
    onClose: handleCancel,
    closable: mergedClosable ? Object.assign({
      disabled: closeBtnIsDisabled,
      closeIcon: mergedCloseIcon
    }, ariaProps) : mergedClosable,
    closeIcon: mergedCloseIcon,
    focusTriggerAfterClose,
    transitionName: getTransitionName(rootPrefixCls, "zoom", props.transitionName),
    maskTransitionName: getTransitionName(rootPrefixCls, "fade", props.maskTransitionName),
    className: classNames(hashId, className, modalContext === null || modalContext === void 0 ? void 0 : modalContext.className),
    style: Object.assign(Object.assign(Object.assign({}, modalContext === null || modalContext === void 0 ? void 0 : modalContext.style), style), responsiveWidthVars),
    classNames: Object.assign(Object.assign(Object.assign({}, modalContext === null || modalContext === void 0 ? void 0 : modalContext.classNames), modalClassNames), {
      wrapper: classNames(wrapClassNameExtended, modalClassNames === null || modalClassNames === void 0 ? void 0 : modalClassNames.wrapper)
    }),
    styles: Object.assign(Object.assign({}, modalContext === null || modalContext === void 0 ? void 0 : modalContext.styles), modalStyles),
    panelRef,
    // TODO: In the future, destroyOnClose in rc-dialog needs to be upgrade to destroyOnHidden
    destroyOnClose: destroyOnHidden !== null && destroyOnHidden !== void 0 ? destroyOnHidden : destroyOnClose
  }), loading ? /* @__PURE__ */ reactExports.createElement(Skeleton, {
    active: true,
    title: false,
    paragraph: {
      rows: 4
    },
    className: `${prefixCls}-body-skeleton`
  }) : children))));
};
const genModalConfirmStyle = (token) => {
  const {
    componentCls,
    titleFontSize,
    titleLineHeight,
    modalConfirmIconSize,
    fontSize,
    lineHeight,
    modalTitleHeight,
    fontHeight,
    confirmBodyPadding
  } = token;
  const confirmComponentCls = `${componentCls}-confirm`;
  return {
    [confirmComponentCls]: {
      "&-rtl": {
        direction: "rtl"
      },
      [`${token.antCls}-modal-header`]: {
        display: "none"
      },
      [`${confirmComponentCls}-body-wrapper`]: Object.assign({}, clearFix()),
      [`&${componentCls} ${componentCls}-body`]: {
        padding: confirmBodyPadding
      },
      // ====================== Body ======================
      [`${confirmComponentCls}-body`]: {
        display: "flex",
        flexWrap: "nowrap",
        alignItems: "start",
        [`> ${token.iconCls}`]: {
          flex: "none",
          fontSize: modalConfirmIconSize,
          marginInlineEnd: token.confirmIconMarginInlineEnd,
          marginTop: token.calc(token.calc(fontHeight).sub(modalConfirmIconSize).equal()).div(2).equal()
        },
        [`&-has-title > ${token.iconCls}`]: {
          marginTop: token.calc(token.calc(modalTitleHeight).sub(modalConfirmIconSize).equal()).div(2).equal()
        }
      },
      [`${confirmComponentCls}-paragraph`]: {
        display: "flex",
        flexDirection: "column",
        flex: "auto",
        rowGap: token.marginXS,
        // https://github.com/ant-design/ant-design/issues/51912
        maxWidth: `calc(100% - ${unit(token.marginSM)})`
      },
      // https://github.com/ant-design/ant-design/issues/48159
      [`${token.iconCls} + ${confirmComponentCls}-paragraph`]: {
        maxWidth: `calc(100% - ${unit(token.calc(token.modalConfirmIconSize).add(token.marginSM).equal())})`
      },
      [`${confirmComponentCls}-title`]: {
        color: token.colorTextHeading,
        fontWeight: token.fontWeightStrong,
        fontSize: titleFontSize,
        lineHeight: titleLineHeight
      },
      [`${confirmComponentCls}-content`]: {
        color: token.colorText,
        fontSize,
        lineHeight
      },
      // ===================== Footer =====================
      [`${confirmComponentCls}-btns`]: {
        textAlign: "end",
        marginTop: token.confirmBtnsMarginTop,
        [`${token.antCls}-btn + ${token.antCls}-btn`]: {
          marginBottom: 0,
          marginInlineStart: token.marginXS
        }
      }
    },
    [`${confirmComponentCls}-error ${confirmComponentCls}-body > ${token.iconCls}`]: {
      color: token.colorError
    },
    [`${confirmComponentCls}-warning ${confirmComponentCls}-body > ${token.iconCls},
        ${confirmComponentCls}-confirm ${confirmComponentCls}-body > ${token.iconCls}`]: {
      color: token.colorWarning
    },
    [`${confirmComponentCls}-info ${confirmComponentCls}-body > ${token.iconCls}`]: {
      color: token.colorInfo
    },
    [`${confirmComponentCls}-success ${confirmComponentCls}-body > ${token.iconCls}`]: {
      color: token.colorSuccess
    }
  };
};
const Confirm = genSubStyleComponent(["Modal", "confirm"], (token) => {
  const modalToken = prepareToken$3(token);
  return [genModalConfirmStyle(modalToken)];
}, prepareComponentToken$i, {
  // confirm is weak than modal since no conflict here
  order: -1e3
});
var __rest$O = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function ConfirmContent(props) {
  const {
    prefixCls,
    icon,
    okText,
    cancelText,
    confirmPrefixCls,
    type,
    okCancel,
    footer,
    // Legacy for static function usage
    locale: staticLocale
  } = props, resetProps = __rest$O(props, ["prefixCls", "icon", "okText", "cancelText", "confirmPrefixCls", "type", "okCancel", "footer", "locale"]);
  let mergedIcon = icon;
  if (!icon && icon !== null) {
    switch (type) {
      case "info":
        mergedIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$4, null);
        break;
      case "success":
        mergedIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$3, null);
        break;
      case "error":
        mergedIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$2, null);
        break;
      default:
        mergedIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$1, null);
    }
  }
  const mergedOkCancel = okCancel !== null && okCancel !== void 0 ? okCancel : type === "confirm";
  const autoFocusButton = props.autoFocusButton === null ? false : props.autoFocusButton || "ok";
  const [locale2] = useLocale("Modal");
  const mergedLocale = staticLocale || locale2;
  const okTextLocale = okText || (mergedOkCancel ? mergedLocale === null || mergedLocale === void 0 ? void 0 : mergedLocale.okText : mergedLocale === null || mergedLocale === void 0 ? void 0 : mergedLocale.justOkText);
  const cancelTextLocale = cancelText || (mergedLocale === null || mergedLocale === void 0 ? void 0 : mergedLocale.cancelText);
  const btnCtxValue = Object.assign({
    autoFocusButton,
    cancelTextLocale,
    okTextLocale,
    mergedOkCancel
  }, resetProps);
  const btnCtxValueMemo = reactExports.useMemo(() => btnCtxValue, _toConsumableArray(Object.values(btnCtxValue)));
  const footerOriginNode = /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(ConfirmCancelBtn, null), /* @__PURE__ */ reactExports.createElement(ConfirmOkBtn, null));
  const hasTitle = props.title !== void 0 && props.title !== null;
  const bodyCls = `${confirmPrefixCls}-body`;
  return /* @__PURE__ */ reactExports.createElement("div", {
    className: `${confirmPrefixCls}-body-wrapper`
  }, /* @__PURE__ */ reactExports.createElement("div", {
    className: classNames(bodyCls, {
      [`${bodyCls}-has-title`]: hasTitle
    })
  }, mergedIcon, /* @__PURE__ */ reactExports.createElement("div", {
    className: `${confirmPrefixCls}-paragraph`
  }, hasTitle && /* @__PURE__ */ reactExports.createElement("span", {
    className: `${confirmPrefixCls}-title`
  }, props.title), /* @__PURE__ */ reactExports.createElement("div", {
    className: `${confirmPrefixCls}-content`
  }, props.content))), footer === void 0 || typeof footer === "function" ? /* @__PURE__ */ reactExports.createElement(ModalContextProvider, {
    value: btnCtxValueMemo
  }, /* @__PURE__ */ reactExports.createElement("div", {
    className: `${confirmPrefixCls}-btns`
  }, typeof footer === "function" ? footer(footerOriginNode, {
    OkBtn: ConfirmOkBtn,
    CancelBtn: ConfirmCancelBtn
  }) : footerOriginNode)) : footer, /* @__PURE__ */ reactExports.createElement(Confirm, {
    prefixCls
  }));
}
const ConfirmDialog = (props) => {
  const {
    close,
    zIndex,
    maskStyle,
    direction,
    prefixCls,
    wrapClassName,
    rootPrefixCls,
    bodyStyle,
    closable = false,
    onConfirm,
    styles
  } = props;
  const confirmPrefixCls = `${prefixCls}-confirm`;
  const width = props.width || 416;
  const style = props.style || {};
  const mask = props.mask === void 0 ? true : props.mask;
  const maskClosable = props.maskClosable === void 0 ? false : props.maskClosable;
  const classString = classNames(confirmPrefixCls, `${confirmPrefixCls}-${props.type}`, {
    [`${confirmPrefixCls}-rtl`]: direction === "rtl"
  }, props.className);
  const [, token] = useToken();
  const mergedZIndex = reactExports.useMemo(() => {
    if (zIndex !== void 0) {
      return zIndex;
    }
    return token.zIndexPopupBase + CONTAINER_MAX_OFFSET;
  }, [zIndex, token]);
  return /* @__PURE__ */ reactExports.createElement(Modal$1, Object.assign({}, props, {
    className: classString,
    wrapClassName: classNames({
      [`${confirmPrefixCls}-centered`]: !!props.centered
    }, wrapClassName),
    onCancel: () => {
      close === null || close === void 0 ? void 0 : close({
        triggerCancel: true
      });
      onConfirm === null || onConfirm === void 0 ? void 0 : onConfirm(false);
    },
    title: "",
    footer: null,
    transitionName: getTransitionName(rootPrefixCls || "", "zoom", props.transitionName),
    maskTransitionName: getTransitionName(rootPrefixCls || "", "fade", props.maskTransitionName),
    mask,
    maskClosable,
    style,
    styles: Object.assign({
      body: bodyStyle,
      mask: maskStyle
    }, styles),
    width,
    zIndex: mergedZIndex,
    closable
  }), /* @__PURE__ */ reactExports.createElement(ConfirmContent, Object.assign({}, props, {
    confirmPrefixCls
  })));
};
const ConfirmDialogWrapper$1 = (props) => {
  const {
    rootPrefixCls,
    iconPrefixCls,
    direction,
    theme
  } = props;
  return /* @__PURE__ */ reactExports.createElement(ConfigProvider, {
    prefixCls: rootPrefixCls,
    iconPrefixCls,
    direction,
    theme
  }, /* @__PURE__ */ reactExports.createElement(ConfirmDialog, Object.assign({}, props)));
};
const destroyFns = [];
let defaultRootPrefixCls = "";
function getRootPrefixCls() {
  return defaultRootPrefixCls;
}
const ConfirmDialogWrapper = (props) => {
  var _a, _b;
  const {
    prefixCls: customizePrefixCls,
    getContainer,
    direction
  } = props;
  const runtimeLocale2 = getConfirmLocale();
  const config = reactExports.useContext(ConfigContext);
  const rootPrefixCls = getRootPrefixCls() || config.getPrefixCls();
  const prefixCls = customizePrefixCls || `${rootPrefixCls}-modal`;
  let mergedGetContainer = getContainer;
  if (mergedGetContainer === false) {
    mergedGetContainer = void 0;
  }
  return /* @__PURE__ */ React.createElement(ConfirmDialogWrapper$1, Object.assign({}, props, {
    rootPrefixCls,
    prefixCls,
    iconPrefixCls: config.iconPrefixCls,
    theme: config.theme,
    direction: direction !== null && direction !== void 0 ? direction : config.direction,
    locale: (_b = (_a = config.locale) === null || _a === void 0 ? void 0 : _a.Modal) !== null && _b !== void 0 ? _b : runtimeLocale2,
    getContainer: mergedGetContainer
  }));
};
function confirm(config) {
  const global = globalConfig();
  const container = document.createDocumentFragment();
  let currentConfig = Object.assign(Object.assign({}, config), {
    close,
    open: true
  });
  let timeoutId;
  let reactUnmount;
  function destroy2(...args) {
    var _a;
    const triggerCancel = args.some((param) => param === null || param === void 0 ? void 0 : param.triggerCancel);
    if (triggerCancel) {
      var _a2;
      (_a = config.onCancel) === null || _a === void 0 ? void 0 : (_a2 = _a).call.apply(_a2, [config, () => {
      }].concat(_toConsumableArray(args.slice(1))));
    }
    for (let i = 0; i < destroyFns.length; i++) {
      const fn = destroyFns[i];
      if (fn === close) {
        destroyFns.splice(i, 1);
        break;
      }
    }
    reactUnmount();
  }
  function render2(props) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      const rootPrefixCls = global.getPrefixCls(void 0, getRootPrefixCls());
      const iconPrefixCls = global.getIconPrefixCls();
      const theme = global.getTheme();
      const dom = /* @__PURE__ */ React.createElement(ConfirmDialogWrapper, Object.assign({}, props));
      const reactRender = unstableSetRender();
      reactUnmount = reactRender(/* @__PURE__ */ React.createElement(ConfigProvider, {
        prefixCls: rootPrefixCls,
        iconPrefixCls,
        theme
      }, global.holderRender ? global.holderRender(dom) : dom), container);
    });
  }
  function close(...args) {
    currentConfig = Object.assign(Object.assign({}, currentConfig), {
      open: false,
      afterClose: () => {
        if (typeof config.afterClose === "function") {
          config.afterClose();
        }
        destroy2.apply(this, args);
      }
    });
    if (currentConfig.visible) {
      delete currentConfig.visible;
    }
    render2(currentConfig);
  }
  function update(configUpdate) {
    if (typeof configUpdate === "function") {
      currentConfig = configUpdate(currentConfig);
    } else {
      currentConfig = Object.assign(Object.assign({}, currentConfig), configUpdate);
    }
    render2(currentConfig);
  }
  render2(currentConfig);
  destroyFns.push(close);
  return {
    destroy: close,
    update
  };
}
function withWarn(props) {
  return Object.assign(Object.assign({}, props), {
    type: "warning"
  });
}
function withInfo(props) {
  return Object.assign(Object.assign({}, props), {
    type: "info"
  });
}
function withSuccess(props) {
  return Object.assign(Object.assign({}, props), {
    type: "success"
  });
}
function withError(props) {
  return Object.assign(Object.assign({}, props), {
    type: "error"
  });
}
function withConfirm(props) {
  return Object.assign(Object.assign({}, props), {
    type: "confirm"
  });
}
function modalGlobalConfig({
  rootPrefixCls
}) {
  defaultRootPrefixCls = rootPrefixCls;
}
var __rest$N = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const HookModal = (_a, ref) => {
  var _b;
  var {
    afterClose: hookAfterClose,
    config
  } = _a, restProps = __rest$N(_a, ["afterClose", "config"]);
  const [open2, setOpen] = reactExports.useState(true);
  const [innerConfig, setInnerConfig] = reactExports.useState(config);
  const {
    direction,
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("modal");
  const rootPrefixCls = getPrefixCls();
  const afterClose = () => {
    var _a2;
    hookAfterClose();
    (_a2 = innerConfig.afterClose) === null || _a2 === void 0 ? void 0 : _a2.call(innerConfig);
  };
  const close = (...args) => {
    var _a2;
    setOpen(false);
    const triggerCancel = args.some((param) => param === null || param === void 0 ? void 0 : param.triggerCancel);
    if (triggerCancel) {
      var _a22;
      (_a2 = innerConfig.onCancel) === null || _a2 === void 0 ? void 0 : (_a22 = _a2).call.apply(_a22, [innerConfig, () => {
      }].concat(_toConsumableArray(args.slice(1))));
    }
  };
  reactExports.useImperativeHandle(ref, () => ({
    destroy: close,
    update: (newConfig) => {
      setInnerConfig((originConfig) => {
        const nextConfig = typeof newConfig === "function" ? newConfig(originConfig) : newConfig;
        return Object.assign(Object.assign({}, originConfig), nextConfig);
      });
    }
  }));
  const mergedOkCancel = (_b = innerConfig.okCancel) !== null && _b !== void 0 ? _b : innerConfig.type === "confirm";
  const [contextLocale] = useLocale("Modal", localeValues.Modal);
  return /* @__PURE__ */ reactExports.createElement(ConfirmDialogWrapper$1, Object.assign({
    prefixCls,
    rootPrefixCls
  }, innerConfig, {
    close,
    open: open2,
    afterClose,
    okText: innerConfig.okText || (mergedOkCancel ? contextLocale === null || contextLocale === void 0 ? void 0 : contextLocale.okText : contextLocale === null || contextLocale === void 0 ? void 0 : contextLocale.justOkText),
    direction: innerConfig.direction || direction,
    cancelText: innerConfig.cancelText || (contextLocale === null || contextLocale === void 0 ? void 0 : contextLocale.cancelText)
  }, restProps));
};
const HookModal$1 = /* @__PURE__ */ reactExports.forwardRef(HookModal);
let uuid = 0;
const ElementsHolder = /* @__PURE__ */ reactExports.memo(/* @__PURE__ */ reactExports.forwardRef((_props, ref) => {
  const [elements, patchElement] = usePatchElement();
  reactExports.useImperativeHandle(ref, () => ({
    patchElement
  }), []);
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, elements);
}));
function useModal() {
  const holderRef = reactExports.useRef(null);
  const [actionQueue, setActionQueue] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (actionQueue.length) {
      const cloneQueue = _toConsumableArray(actionQueue);
      cloneQueue.forEach((action) => {
        action();
      });
      setActionQueue([]);
    }
  }, [actionQueue]);
  const getConfirmFunc = reactExports.useCallback((withFunc) => function hookConfirm(config) {
    var _a;
    uuid += 1;
    const modalRef = /* @__PURE__ */ reactExports.createRef();
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    let silent = false;
    let closeFunc;
    const modal = /* @__PURE__ */ reactExports.createElement(HookModal$1, {
      key: `modal-${uuid}`,
      config: withFunc(config),
      ref: modalRef,
      afterClose: () => {
        closeFunc === null || closeFunc === void 0 ? void 0 : closeFunc();
      },
      isSilent: () => silent,
      onConfirm: (confirmed) => {
        resolvePromise(confirmed);
      }
    });
    closeFunc = (_a = holderRef.current) === null || _a === void 0 ? void 0 : _a.patchElement(modal);
    if (closeFunc) {
      destroyFns.push(closeFunc);
    }
    const instance = {
      destroy: () => {
        function destroyAction() {
          var _a2;
          (_a2 = modalRef.current) === null || _a2 === void 0 ? void 0 : _a2.destroy();
        }
        if (modalRef.current) {
          destroyAction();
        } else {
          setActionQueue((prev) => [].concat(_toConsumableArray(prev), [destroyAction]));
        }
      },
      update: (newConfig) => {
        function updateAction() {
          var _a2;
          (_a2 = modalRef.current) === null || _a2 === void 0 ? void 0 : _a2.update(newConfig);
        }
        if (modalRef.current) {
          updateAction();
        } else {
          setActionQueue((prev) => [].concat(_toConsumableArray(prev), [updateAction]));
        }
      },
      then: (resolve) => {
        silent = true;
        return promise.then(resolve);
      }
    };
    return instance;
  }, []);
  const fns = reactExports.useMemo(() => ({
    info: getConfirmFunc(withInfo),
    success: getConfirmFunc(withSuccess),
    error: getConfirmFunc(withError),
    warning: getConfirmFunc(withWarn),
    confirm: getConfirmFunc(withConfirm)
  }), []);
  return [fns, /* @__PURE__ */ reactExports.createElement(ElementsHolder, {
    key: "modal-holder",
    ref: holderRef
  })];
}
const AppConfigContext = /* @__PURE__ */ React.createContext({});
function withPureRenderTheme(Component) {
  return (props) => /* @__PURE__ */ reactExports.createElement(ConfigProvider, {
    theme: {
      token: {
        motion: false,
        zIndexPopupBase: 0
      }
    }
  }, /* @__PURE__ */ reactExports.createElement(Component, Object.assign({}, props)));
}
const genPurePanel = (Component, alignPropName, postProps, defaultPrefixCls2, getDropdownCls) => {
  const PurePanel2 = (props) => {
    const {
      prefixCls: customizePrefixCls,
      style
    } = props;
    const holderRef = reactExports.useRef(null);
    const [popupHeight, setPopupHeight] = reactExports.useState(0);
    const [popupWidth, setPopupWidth] = reactExports.useState(0);
    const [open2, setOpen] = useMergedState(false, {
      value: props.open
    });
    const {
      getPrefixCls
    } = reactExports.useContext(ConfigContext);
    const prefixCls = getPrefixCls(defaultPrefixCls2 || "select", customizePrefixCls);
    reactExports.useEffect(() => {
      setOpen(true);
      if (typeof ResizeObserver !== "undefined") {
        const resizeObserver = new ResizeObserver((entries) => {
          const element = entries[0].target;
          setPopupHeight(element.offsetHeight + 8);
          setPopupWidth(element.offsetWidth);
        });
        const interval = setInterval(() => {
          var _a;
          const dropdownCls = getDropdownCls ? `.${getDropdownCls(prefixCls)}` : `.${prefixCls}-dropdown`;
          const popup = (_a = holderRef.current) === null || _a === void 0 ? void 0 : _a.querySelector(dropdownCls);
          if (popup) {
            clearInterval(interval);
            resizeObserver.observe(popup);
          }
        }, 10);
        return () => {
          clearInterval(interval);
          resizeObserver.disconnect();
        };
      }
    }, []);
    let mergedProps = Object.assign(Object.assign({}, props), {
      style: Object.assign(Object.assign({}, style), {
        margin: 0
      }),
      open: open2,
      visible: open2,
      getPopupContainer: () => holderRef.current
    });
    if (alignPropName) {
      Object.assign(mergedProps, {
        [alignPropName]: {
          overflow: {
            adjustX: false,
            adjustY: false
          }
        }
      });
    }
    const mergedStyle = {
      paddingBottom: popupHeight,
      position: "relative",
      minWidth: popupWidth
    };
    return /* @__PURE__ */ reactExports.createElement("div", {
      ref: holderRef,
      style: mergedStyle
    }, /* @__PURE__ */ reactExports.createElement(Component, Object.assign({}, mergedProps)));
  };
  return withPureRenderTheme(PurePanel2);
};
function getStatusClassNames(prefixCls, status, hasFeedback) {
  return classNames({
    [`${prefixCls}-status-success`]: status === "success",
    [`${prefixCls}-status-warning`]: status === "warning",
    [`${prefixCls}-status-error`]: status === "error",
    [`${prefixCls}-status-validating`]: status === "validating",
    [`${prefixCls}-has-feedback`]: hasFeedback
  });
}
const getMergedStatus = (contextStatus, customStatus) => customStatus || contextStatus;
const Empty$1 = () => {
  const [, token] = useToken();
  const [locale2] = useLocale("Empty");
  const bgColor = new FastColor(token.colorBgBase);
  const themeStyle = bgColor.toHsl().l < 0.5 ? {
    opacity: 0.65
  } : {};
  return /* @__PURE__ */ reactExports.createElement("svg", {
    style: themeStyle,
    width: "184",
    height: "152",
    viewBox: "0 0 184 152",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ reactExports.createElement("title", null, (locale2 === null || locale2 === void 0 ? void 0 : locale2.description) || "Empty"), /* @__PURE__ */ reactExports.createElement("g", {
    fill: "none",
    fillRule: "evenodd"
  }, /* @__PURE__ */ reactExports.createElement("g", {
    transform: "translate(24 31.67)"
  }, /* @__PURE__ */ reactExports.createElement("ellipse", {
    fillOpacity: ".8",
    fill: "#F5F5F7",
    cx: "67.797",
    cy: "106.89",
    rx: "67.797",
    ry: "12.668"
  }), /* @__PURE__ */ reactExports.createElement("path", {
    d: "M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z",
    fill: "#AEB8C2"
  }), /* @__PURE__ */ reactExports.createElement("path", {
    d: "M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z",
    fill: "url(#linearGradient-1)",
    transform: "translate(13.56)"
  }), /* @__PURE__ */ reactExports.createElement("path", {
    d: "M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z",
    fill: "#F5F5F7"
  }), /* @__PURE__ */ reactExports.createElement("path", {
    d: "M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z",
    fill: "#DCE0E6"
  })), /* @__PURE__ */ reactExports.createElement("path", {
    d: "M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z",
    fill: "#DCE0E6"
  }), /* @__PURE__ */ reactExports.createElement("g", {
    transform: "translate(149.65 15.383)",
    fill: "#FFF"
  }, /* @__PURE__ */ reactExports.createElement("ellipse", {
    cx: "20.654",
    cy: "3.167",
    rx: "2.849",
    ry: "2.815"
  }), /* @__PURE__ */ reactExports.createElement("path", {
    d: "M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"
  }))));
};
const Simple = () => {
  const [, token] = useToken();
  const [locale2] = useLocale("Empty");
  const {
    colorFill,
    colorFillTertiary,
    colorFillQuaternary,
    colorBgContainer
  } = token;
  const {
    borderColor,
    shadowColor,
    contentColor
  } = reactExports.useMemo(() => ({
    borderColor: new FastColor(colorFill).onBackground(colorBgContainer).toHexString(),
    shadowColor: new FastColor(colorFillTertiary).onBackground(colorBgContainer).toHexString(),
    contentColor: new FastColor(colorFillQuaternary).onBackground(colorBgContainer).toHexString()
  }), [colorFill, colorFillTertiary, colorFillQuaternary, colorBgContainer]);
  return /* @__PURE__ */ reactExports.createElement("svg", {
    width: "64",
    height: "41",
    viewBox: "0 0 64 41",
    xmlns: "http://www.w3.org/2000/svg"
  }, /* @__PURE__ */ reactExports.createElement("title", null, (locale2 === null || locale2 === void 0 ? void 0 : locale2.description) || "Empty"), /* @__PURE__ */ reactExports.createElement("g", {
    transform: "translate(0 1)",
    fill: "none",
    fillRule: "evenodd"
  }, /* @__PURE__ */ reactExports.createElement("ellipse", {
    fill: shadowColor,
    cx: "32",
    cy: "33",
    rx: "32",
    ry: "7"
  }), /* @__PURE__ */ reactExports.createElement("g", {
    fillRule: "nonzero",
    stroke: borderColor
  }, /* @__PURE__ */ reactExports.createElement("path", {
    d: "M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"
  }), /* @__PURE__ */ reactExports.createElement("path", {
    d: "M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z",
    fill: contentColor
  }))));
};
const genSharedEmptyStyle = (token) => {
  const {
    componentCls,
    margin,
    marginXS,
    marginXL,
    fontSize,
    lineHeight
  } = token;
  return {
    [componentCls]: {
      marginInline: marginXS,
      fontSize,
      lineHeight,
      textAlign: "center",
      // 原来 &-image 没有父子结构，现在为了外层承担我们的 hashId，改成父子结构
      [`${componentCls}-image`]: {
        height: token.emptyImgHeight,
        marginBottom: marginXS,
        opacity: token.opacityImage,
        img: {
          height: "100%"
        },
        svg: {
          maxWidth: "100%",
          height: "100%",
          margin: "auto"
        }
      },
      [`${componentCls}-description`]: {
        color: token.colorTextDescription
      },
      // 原来 &-footer 没有父子结构，现在为了外层承担我们的 hashId，改成父子结构
      [`${componentCls}-footer`]: {
        marginTop: margin
      },
      "&-normal": {
        marginBlock: marginXL,
        color: token.colorTextDescription,
        [`${componentCls}-description`]: {
          color: token.colorTextDescription
        },
        [`${componentCls}-image`]: {
          height: token.emptyImgHeightMD
        }
      },
      "&-small": {
        marginBlock: marginXS,
        color: token.colorTextDescription,
        [`${componentCls}-image`]: {
          height: token.emptyImgHeightSM
        }
      }
    }
  };
};
const useStyle$l = genStyleHooks("Empty", (token) => {
  const {
    componentCls,
    controlHeightLG,
    calc
  } = token;
  const emptyToken = merge$1(token, {
    emptyImgCls: `${componentCls}-img`,
    emptyImgHeight: calc(controlHeightLG).mul(2.5).equal(),
    emptyImgHeightMD: controlHeightLG,
    emptyImgHeightSM: calc(controlHeightLG).mul(0.875).equal()
  });
  return [genSharedEmptyStyle(emptyToken)];
});
var __rest$M = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const defaultEmptyImg = /* @__PURE__ */ reactExports.createElement(Empty$1, null);
const simpleEmptyImg = /* @__PURE__ */ reactExports.createElement(Simple, null);
const Empty = (props) => {
  const {
    className,
    rootClassName,
    prefixCls: customizePrefixCls,
    image = defaultEmptyImg,
    description,
    children,
    imageStyle,
    style,
    classNames: emptyClassNames,
    styles
  } = props, restProps = __rest$M(props, ["className", "rootClassName", "prefixCls", "image", "description", "children", "imageStyle", "style", "classNames", "styles"]);
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig("empty");
  const prefixCls = getPrefixCls("empty", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$l(prefixCls);
  const [locale2] = useLocale("Empty");
  const des = typeof description !== "undefined" ? description : locale2 === null || locale2 === void 0 ? void 0 : locale2.description;
  const alt = typeof des === "string" ? des : "empty";
  let imageNode = null;
  if (typeof image === "string") {
    imageNode = /* @__PURE__ */ reactExports.createElement("img", {
      alt,
      src: image
    });
  } else {
    imageNode = image;
  }
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({
    className: classNames(hashId, cssVarCls, prefixCls, contextClassName, {
      [`${prefixCls}-normal`]: image === simpleEmptyImg,
      [`${prefixCls}-rtl`]: direction === "rtl"
    }, className, rootClassName, contextClassNames.root, emptyClassNames === null || emptyClassNames === void 0 ? void 0 : emptyClassNames.root),
    style: Object.assign(Object.assign(Object.assign(Object.assign({}, contextStyles.root), contextStyle), styles === null || styles === void 0 ? void 0 : styles.root), style)
  }, restProps), /* @__PURE__ */ reactExports.createElement("div", {
    className: classNames(`${prefixCls}-image`, contextClassNames.image, emptyClassNames === null || emptyClassNames === void 0 ? void 0 : emptyClassNames.image),
    style: Object.assign(Object.assign(Object.assign({}, imageStyle), contextStyles.image), styles === null || styles === void 0 ? void 0 : styles.image)
  }, imageNode), des && /* @__PURE__ */ reactExports.createElement("div", {
    className: classNames(`${prefixCls}-description`, contextClassNames.description, emptyClassNames === null || emptyClassNames === void 0 ? void 0 : emptyClassNames.description),
    style: Object.assign(Object.assign({}, contextStyles.description), styles === null || styles === void 0 ? void 0 : styles.description)
  }, des), children && /* @__PURE__ */ reactExports.createElement("div", {
    className: classNames(`${prefixCls}-footer`, contextClassNames.footer, emptyClassNames === null || emptyClassNames === void 0 ? void 0 : emptyClassNames.footer),
    style: Object.assign(Object.assign({}, contextStyles.footer), styles === null || styles === void 0 ? void 0 : styles.footer)
  }, children)));
};
Empty.PRESENTED_IMAGE_DEFAULT = defaultEmptyImg;
Empty.PRESENTED_IMAGE_SIMPLE = simpleEmptyImg;
const DefaultRenderEmpty = (props) => {
  const {
    componentName
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefix = getPrefixCls("empty");
  switch (componentName) {
    case "Table":
    case "List":
      return /* @__PURE__ */ React.createElement(Empty, {
        image: Empty.PRESENTED_IMAGE_SIMPLE
      });
    case "Select":
    case "TreeSelect":
    case "Cascader":
    case "Transfer":
    case "Mentions":
      return /* @__PURE__ */ React.createElement(Empty, {
        image: Empty.PRESENTED_IMAGE_SIMPLE,
        className: `${prefix}-small`
      });
    case "Table.filter":
      return null;
    default:
      return /* @__PURE__ */ React.createElement(Empty, null);
  }
};
const useVariant = (component, variant, legacyBordered = void 0) => {
  var _a, _b;
  const {
    variant: configVariant,
    [component]: componentConfig
  } = reactExports.useContext(ConfigContext);
  const ctxVariant = reactExports.useContext(VariantContext);
  const configComponentVariant = componentConfig === null || componentConfig === void 0 ? void 0 : componentConfig.variant;
  let mergedVariant;
  if (typeof variant !== "undefined") {
    mergedVariant = variant;
  } else if (legacyBordered === false) {
    mergedVariant = "borderless";
  } else {
    mergedVariant = (_b = (_a = ctxVariant !== null && ctxVariant !== void 0 ? ctxVariant : configComponentVariant) !== null && _a !== void 0 ? _a : configVariant) !== null && _b !== void 0 ? _b : "outlined";
  }
  const enableVariantCls = Variants.includes(mergedVariant);
  return [mergedVariant, enableVariantCls];
};
const getBuiltInPlacements = (popupOverflow) => {
  const htmlRegion = popupOverflow === "scroll" ? "scroll" : "visible";
  const sharedConfig = {
    overflow: {
      adjustX: true,
      adjustY: true,
      shiftY: true
    },
    htmlRegion,
    dynamicInset: true
  };
  return {
    bottomLeft: Object.assign(Object.assign({}, sharedConfig), {
      points: ["tl", "bl"],
      offset: [0, 4]
    }),
    bottomRight: Object.assign(Object.assign({}, sharedConfig), {
      points: ["tr", "br"],
      offset: [0, 4]
    }),
    topLeft: Object.assign(Object.assign({}, sharedConfig), {
      points: ["bl", "tl"],
      offset: [0, -4]
    }),
    topRight: Object.assign(Object.assign({}, sharedConfig), {
      points: ["br", "tr"],
      offset: [0, -4]
    })
  };
};
function mergedBuiltinPlacements(buildInPlacements, popupOverflow) {
  return buildInPlacements || getBuiltInPlacements(popupOverflow);
}
const genItemStyle = (token) => {
  const {
    optionHeight,
    optionFontSize,
    optionLineHeight,
    optionPadding
  } = token;
  return {
    position: "relative",
    display: "block",
    minHeight: optionHeight,
    padding: optionPadding,
    color: token.colorText,
    fontWeight: "normal",
    fontSize: optionFontSize,
    lineHeight: optionLineHeight,
    boxSizing: "border-box"
  };
};
const genSingleStyle$1 = (token) => {
  const {
    antCls,
    componentCls
  } = token;
  const selectItemCls = `${componentCls}-item`;
  const slideUpEnterActive = `&${antCls}-slide-up-enter${antCls}-slide-up-enter-active`;
  const slideUpAppearActive = `&${antCls}-slide-up-appear${antCls}-slide-up-appear-active`;
  const slideUpLeaveActive = `&${antCls}-slide-up-leave${antCls}-slide-up-leave-active`;
  const dropdownPlacementCls = `${componentCls}-dropdown-placement-`;
  const selectedItemCls = `${selectItemCls}-option-selected`;
  return [
    {
      [`${componentCls}-dropdown`]: Object.assign(Object.assign({}, resetComponent(token)), {
        position: "absolute",
        top: -9999,
        zIndex: token.zIndexPopup,
        boxSizing: "border-box",
        padding: token.paddingXXS,
        overflow: "hidden",
        fontSize: token.fontSize,
        // Fix select render lag of long text in chrome
        // https://github.com/ant-design/ant-design/issues/11456
        // https://github.com/ant-design/ant-design/issues/11843
        fontVariant: "initial",
        backgroundColor: token.colorBgElevated,
        borderRadius: token.borderRadiusLG,
        outline: "none",
        boxShadow: token.boxShadowSecondary,
        [`
          ${slideUpEnterActive}${dropdownPlacementCls}bottomLeft,
          ${slideUpAppearActive}${dropdownPlacementCls}bottomLeft
        `]: {
          animationName: slideUpIn
        },
        [`
          ${slideUpEnterActive}${dropdownPlacementCls}topLeft,
          ${slideUpAppearActive}${dropdownPlacementCls}topLeft,
          ${slideUpEnterActive}${dropdownPlacementCls}topRight,
          ${slideUpAppearActive}${dropdownPlacementCls}topRight
        `]: {
          animationName: slideDownIn
        },
        [`${slideUpLeaveActive}${dropdownPlacementCls}bottomLeft`]: {
          animationName: slideUpOut
        },
        [`
          ${slideUpLeaveActive}${dropdownPlacementCls}topLeft,
          ${slideUpLeaveActive}${dropdownPlacementCls}topRight
        `]: {
          animationName: slideDownOut
        },
        "&-hidden": {
          display: "none"
        },
        [selectItemCls]: Object.assign(Object.assign({}, genItemStyle(token)), {
          cursor: "pointer",
          transition: `background ${token.motionDurationSlow} ease`,
          borderRadius: token.borderRadiusSM,
          // =========== Group ============
          "&-group": {
            color: token.colorTextDescription,
            fontSize: token.fontSizeSM,
            cursor: "default"
          },
          // =========== Option ===========
          "&-option": {
            display: "flex",
            "&-content": Object.assign({
              flex: "auto"
            }, textEllipsis),
            "&-state": {
              flex: "none",
              display: "flex",
              alignItems: "center"
            },
            [`&-active:not(${selectItemCls}-option-disabled)`]: {
              backgroundColor: token.optionActiveBg
            },
            [`&-selected:not(${selectItemCls}-option-disabled)`]: {
              color: token.optionSelectedColor,
              fontWeight: token.optionSelectedFontWeight,
              backgroundColor: token.optionSelectedBg,
              [`${selectItemCls}-option-state`]: {
                color: token.colorPrimary
              }
            },
            "&-disabled": {
              [`&${selectItemCls}-option-selected`]: {
                backgroundColor: token.colorBgContainerDisabled
              },
              color: token.colorTextDisabled,
              cursor: "not-allowed"
            },
            "&-grouped": {
              paddingInlineStart: token.calc(token.controlPaddingHorizontal).mul(2).equal()
            }
          },
          "&-empty": Object.assign(Object.assign({}, genItemStyle(token)), {
            color: token.colorTextDisabled
          })
        }),
        // https://github.com/ant-design/ant-design/pull/46646
        [`${selectedItemCls}:has(+ ${selectedItemCls})`]: {
          borderEndStartRadius: 0,
          borderEndEndRadius: 0,
          [`& + ${selectedItemCls}`]: {
            borderStartStartRadius: 0,
            borderStartEndRadius: 0
          }
        },
        // =========================== RTL ===========================
        "&-rtl": {
          direction: "rtl"
        }
      })
    },
    // Follow code may reuse in other components
    initSlideMotion(token, "slide-up"),
    initSlideMotion(token, "slide-down"),
    initMoveMotion(token, "move-up"),
    initMoveMotion(token, "move-down")
  ];
};
const getMultipleSelectorUnit = (token) => {
  const {
    multipleSelectItemHeight,
    paddingXXS,
    lineWidth,
    INTERNAL_FIXED_ITEM_MARGIN
  } = token;
  const basePadding = token.max(token.calc(paddingXXS).sub(lineWidth).equal(), 0);
  const containerPadding = token.max(token.calc(basePadding).sub(INTERNAL_FIXED_ITEM_MARGIN).equal(), 0);
  return {
    basePadding,
    containerPadding,
    itemHeight: unit(multipleSelectItemHeight),
    itemLineHeight: unit(token.calc(multipleSelectItemHeight).sub(token.calc(token.lineWidth).mul(2)).equal())
  };
};
const getSelectItemStyle = (token) => {
  const {
    multipleSelectItemHeight,
    selectHeight,
    lineWidth
  } = token;
  const selectItemDist = token.calc(selectHeight).sub(multipleSelectItemHeight).div(2).sub(lineWidth).equal();
  return selectItemDist;
};
const genOverflowStyle = (token) => {
  const {
    componentCls,
    iconCls,
    borderRadiusSM,
    motionDurationSlow,
    paddingXS,
    multipleItemColorDisabled,
    multipleItemBorderColorDisabled,
    colorIcon,
    colorIconHover,
    INTERNAL_FIXED_ITEM_MARGIN
  } = token;
  const selectOverflowPrefixCls = `${componentCls}-selection-overflow`;
  return {
    /**
     * Do not merge `height` & `line-height` under style with `selection` & `search`, since chrome
     * may update to redesign with its align logic.
     */
    // =========================== Overflow ===========================
    [selectOverflowPrefixCls]: {
      position: "relative",
      display: "flex",
      flex: "auto",
      flexWrap: "wrap",
      maxWidth: "100%",
      "&-item": {
        flex: "none",
        alignSelf: "center",
        // https://github.com/ant-design/ant-design/issues/54179
        maxWidth: "calc(100% - 4px)",
        display: "inline-flex"
      },
      // ======================== Selections ==========================
      [`${componentCls}-selection-item`]: {
        display: "flex",
        alignSelf: "center",
        flex: "none",
        boxSizing: "border-box",
        maxWidth: "100%",
        marginBlock: INTERNAL_FIXED_ITEM_MARGIN,
        borderRadius: borderRadiusSM,
        cursor: "default",
        transition: `font-size ${motionDurationSlow}, line-height ${motionDurationSlow}, height ${motionDurationSlow}`,
        marginInlineEnd: token.calc(INTERNAL_FIXED_ITEM_MARGIN).mul(2).equal(),
        paddingInlineStart: paddingXS,
        paddingInlineEnd: token.calc(paddingXS).div(2).equal(),
        [`${componentCls}-disabled&`]: {
          color: multipleItemColorDisabled,
          borderColor: multipleItemBorderColorDisabled,
          cursor: "not-allowed"
        },
        // It's ok not to do this, but 24px makes bottom narrow in view should adjust
        "&-content": {
          display: "inline-block",
          marginInlineEnd: token.calc(paddingXS).div(2).equal(),
          overflow: "hidden",
          whiteSpace: "pre",
          // fix whitespace wrapping. custom tags display all whitespace within.
          textOverflow: "ellipsis"
        },
        "&-remove": Object.assign(Object.assign({}, resetIcon()), {
          display: "inline-flex",
          alignItems: "center",
          color: colorIcon,
          fontWeight: "bold",
          fontSize: 10,
          lineHeight: "inherit",
          cursor: "pointer",
          [`> ${iconCls}`]: {
            verticalAlign: "-0.2em"
          },
          "&:hover": {
            color: colorIconHover
          }
        })
      }
    }
  };
};
const genSelectionStyle$1 = (token, suffix) => {
  const {
    componentCls,
    INTERNAL_FIXED_ITEM_MARGIN
  } = token;
  const selectOverflowPrefixCls = `${componentCls}-selection-overflow`;
  const selectItemHeight = token.multipleSelectItemHeight;
  const selectItemDist = getSelectItemStyle(token);
  const suffixCls = suffix ? `${componentCls}-${suffix}` : "";
  const multipleSelectorUnit = getMultipleSelectorUnit(token);
  return {
    [`${componentCls}-multiple${suffixCls}`]: Object.assign(Object.assign({}, genOverflowStyle(token)), {
      // ========================= Selector =========================
      [`${componentCls}-selector`]: {
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100%",
        // Multiple is little different that horizontal is follow the vertical
        paddingInline: multipleSelectorUnit.basePadding,
        paddingBlock: multipleSelectorUnit.containerPadding,
        borderRadius: token.borderRadius,
        [`${componentCls}-disabled&`]: {
          background: token.multipleSelectorBgDisabled,
          cursor: "not-allowed"
        },
        "&:after": {
          display: "inline-block",
          width: 0,
          margin: `${unit(INTERNAL_FIXED_ITEM_MARGIN)} 0`,
          lineHeight: unit(selectItemHeight),
          visibility: "hidden",
          content: '"\\a0"'
        }
      },
      // ======================== Selections ========================
      [`${componentCls}-selection-item`]: {
        height: multipleSelectorUnit.itemHeight,
        lineHeight: unit(multipleSelectorUnit.itemLineHeight)
      },
      // ========================== Wrap ===========================
      [`${componentCls}-selection-wrap`]: {
        alignSelf: "flex-start",
        "&:after": {
          lineHeight: unit(selectItemHeight),
          marginBlock: INTERNAL_FIXED_ITEM_MARGIN
        }
      },
      // ========================== Input ==========================
      [`${componentCls}-prefix`]: {
        marginInlineStart: token.calc(token.inputPaddingHorizontalBase).sub(multipleSelectorUnit.basePadding).equal()
      },
      [`${selectOverflowPrefixCls}-item + ${selectOverflowPrefixCls}-item,
        ${componentCls}-prefix + ${componentCls}-selection-wrap
      `]: {
        [`${componentCls}-selection-search`]: {
          marginInlineStart: 0
        },
        [`${componentCls}-selection-placeholder`]: {
          insetInlineStart: 0
        }
      },
      // https://github.com/ant-design/ant-design/issues/44754
      // Same as `wrap:after`
      [`${selectOverflowPrefixCls}-item-suffix`]: {
        minHeight: multipleSelectorUnit.itemHeight,
        marginBlock: INTERNAL_FIXED_ITEM_MARGIN
      },
      [`${componentCls}-selection-search`]: {
        display: "inline-flex",
        position: "relative",
        maxWidth: "100%",
        marginInlineStart: token.calc(token.inputPaddingHorizontalBase).sub(selectItemDist).equal(),
        [`
          &-input,
          &-mirror
        `]: {
          height: selectItemHeight,
          fontFamily: token.fontFamily,
          lineHeight: unit(selectItemHeight),
          transition: `all ${token.motionDurationSlow}`
        },
        "&-input": {
          width: "100%",
          minWidth: 4.1
          // fix search cursor missing
        },
        "&-mirror": {
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          insetInlineEnd: "auto",
          zIndex: 999,
          whiteSpace: "pre",
          // fix whitespace wrapping caused width calculation bug
          visibility: "hidden"
        }
      },
      // ======================= Placeholder =======================
      [`${componentCls}-selection-placeholder`]: {
        position: "absolute",
        top: "50%",
        insetInlineStart: token.calc(token.inputPaddingHorizontalBase).sub(multipleSelectorUnit.basePadding).equal(),
        insetInlineEnd: token.inputPaddingHorizontalBase,
        transform: "translateY(-50%)",
        transition: `all ${token.motionDurationSlow}`
      }
    })
  };
};
function genSizeStyle$3(token, suffix) {
  const {
    componentCls
  } = token;
  const suffixCls = suffix ? `${componentCls}-${suffix}` : "";
  const rawStyle = {
    [`${componentCls}-multiple${suffixCls}`]: {
      fontSize: token.fontSize,
      // ========================= Selector =========================
      [`${componentCls}-selector`]: {
        [`${componentCls}-show-search&`]: {
          cursor: "text"
        }
      },
      [`
        &${componentCls}-show-arrow ${componentCls}-selector,
        &${componentCls}-allow-clear ${componentCls}-selector
      `]: {
        paddingInlineEnd: token.calc(token.fontSizeIcon).add(token.controlPaddingHorizontal).equal()
      }
    }
  };
  return [genSelectionStyle$1(token, suffix), rawStyle];
}
const genMultipleStyle = (token) => {
  const {
    componentCls
  } = token;
  const smallToken = merge$1(token, {
    selectHeight: token.controlHeightSM,
    multipleSelectItemHeight: token.multipleItemHeightSM,
    borderRadius: token.borderRadiusSM,
    borderRadiusSM: token.borderRadiusXS
  });
  const largeToken = merge$1(token, {
    fontSize: token.fontSizeLG,
    selectHeight: token.controlHeightLG,
    multipleSelectItemHeight: token.multipleItemHeightLG,
    borderRadius: token.borderRadiusLG,
    borderRadiusSM: token.borderRadius
  });
  return [
    genSizeStyle$3(token),
    // ======================== Small ========================
    genSizeStyle$3(smallToken, "sm"),
    // Padding
    {
      [`${componentCls}-multiple${componentCls}-sm`]: {
        [`${componentCls}-selection-placeholder`]: {
          insetInline: token.calc(token.controlPaddingHorizontalSM).sub(token.lineWidth).equal()
        },
        // https://github.com/ant-design/ant-design/issues/29559
        [`${componentCls}-selection-search`]: {
          marginInlineStart: 2
          // Magic Number
        }
      }
    },
    // ======================== Large ========================
    genSizeStyle$3(largeToken, "lg")
  ];
};
function genSizeStyle$2(token, suffix) {
  const {
    componentCls,
    inputPaddingHorizontalBase,
    borderRadius
  } = token;
  const selectHeightWithoutBorder = token.calc(token.controlHeight).sub(token.calc(token.lineWidth).mul(2)).equal();
  const suffixCls = suffix ? `${componentCls}-${suffix}` : "";
  return {
    [`${componentCls}-single${suffixCls}`]: {
      fontSize: token.fontSize,
      height: token.controlHeight,
      // ========================= Selector =========================
      [`${componentCls}-selector`]: Object.assign(Object.assign({}, resetComponent(token, true)), {
        display: "flex",
        borderRadius,
        flex: "1 1 auto",
        [`${componentCls}-selection-wrap:after`]: {
          lineHeight: unit(selectHeightWithoutBorder)
        },
        [`${componentCls}-selection-search`]: {
          position: "absolute",
          inset: 0,
          width: "100%",
          "&-input": {
            width: "100%",
            WebkitAppearance: "textfield"
          }
        },
        [`
          ${componentCls}-selection-item,
          ${componentCls}-selection-placeholder
        `]: {
          display: "block",
          padding: 0,
          lineHeight: unit(selectHeightWithoutBorder),
          transition: `all ${token.motionDurationSlow}, visibility 0s`,
          alignSelf: "center"
        },
        [`${componentCls}-selection-placeholder`]: {
          transition: "none",
          pointerEvents: "none"
        },
        // For common baseline align
        [[
          "&:after",
          /* For '' value baseline align */
          `${componentCls}-selection-item:empty:after`,
          /* For undefined value baseline align */
          `${componentCls}-selection-placeholder:empty:after`
        ].join(",")]: {
          display: "inline-block",
          width: 0,
          visibility: "hidden",
          content: '"\\a0"'
        }
      }),
      [`
        &${componentCls}-show-arrow ${componentCls}-selection-item,
        &${componentCls}-show-arrow ${componentCls}-selection-search,
        &${componentCls}-show-arrow ${componentCls}-selection-placeholder
      `]: {
        paddingInlineEnd: token.showArrowPaddingInlineEnd
      },
      // Opacity selection if open
      [`&${componentCls}-open ${componentCls}-selection-item`]: {
        color: token.colorTextPlaceholder
      },
      // ========================== Input ==========================
      // We only change the style of non-customize input which is only support by `combobox` mode.
      // Not customize
      [`&:not(${componentCls}-customize-input)`]: {
        [`${componentCls}-selector`]: {
          width: "100%",
          height: "100%",
          alignItems: "center",
          padding: `0 ${unit(inputPaddingHorizontalBase)}`,
          [`${componentCls}-selection-search-input`]: {
            height: selectHeightWithoutBorder,
            fontSize: token.fontSize
          },
          "&:after": {
            lineHeight: unit(selectHeightWithoutBorder)
          }
        }
      },
      [`&${componentCls}-customize-input`]: {
        [`${componentCls}-selector`]: {
          "&:after": {
            display: "none"
          },
          [`${componentCls}-selection-search`]: {
            position: "static",
            width: "100%"
          },
          [`${componentCls}-selection-placeholder`]: {
            position: "absolute",
            insetInlineStart: 0,
            insetInlineEnd: 0,
            padding: `0 ${unit(inputPaddingHorizontalBase)}`,
            "&:after": {
              display: "none"
            }
          }
        }
      }
    }
  };
}
function genSingleStyle(token) {
  const {
    componentCls
  } = token;
  const inputPaddingHorizontalSM = token.calc(token.controlPaddingHorizontalSM).sub(token.lineWidth).equal();
  return [
    genSizeStyle$2(token),
    // ======================== Small ========================
    // Shared
    genSizeStyle$2(merge$1(token, {
      controlHeight: token.controlHeightSM,
      borderRadius: token.borderRadiusSM
    }), "sm"),
    // padding
    {
      [`${componentCls}-single${componentCls}-sm`]: {
        [`&:not(${componentCls}-customize-input)`]: {
          [`${componentCls}-selector`]: {
            padding: `0 ${unit(inputPaddingHorizontalSM)}`
          },
          // With arrow should provides `padding-right` to show the arrow
          [`&${componentCls}-show-arrow ${componentCls}-selection-search`]: {
            insetInlineEnd: token.calc(inputPaddingHorizontalSM).add(token.calc(token.fontSize).mul(1.5)).equal()
          },
          [`
            &${componentCls}-show-arrow ${componentCls}-selection-item,
            &${componentCls}-show-arrow ${componentCls}-selection-placeholder
          `]: {
            paddingInlineEnd: token.calc(token.fontSize).mul(1.5).equal()
          }
        }
      }
    },
    // ======================== Large ========================
    // Shared
    genSizeStyle$2(merge$1(token, {
      controlHeight: token.singleItemHeightLG,
      fontSize: token.fontSizeLG,
      borderRadius: token.borderRadiusLG
    }), "lg")
  ];
}
const prepareComponentToken$h = (token) => {
  const {
    fontSize,
    lineHeight,
    lineWidth,
    controlHeight,
    controlHeightSM,
    controlHeightLG,
    paddingXXS,
    controlPaddingHorizontal,
    zIndexPopupBase,
    colorText,
    fontWeightStrong,
    controlItemBgActive,
    controlItemBgHover,
    colorBgContainer,
    colorFillSecondary,
    colorBgContainerDisabled,
    colorTextDisabled,
    colorPrimaryHover,
    colorPrimary,
    controlOutline
  } = token;
  const dblPaddingXXS = paddingXXS * 2;
  const dblLineWidth = lineWidth * 2;
  const multipleItemHeight = Math.min(controlHeight - dblPaddingXXS, controlHeight - dblLineWidth);
  const multipleItemHeightSM = Math.min(controlHeightSM - dblPaddingXXS, controlHeightSM - dblLineWidth);
  const multipleItemHeightLG = Math.min(controlHeightLG - dblPaddingXXS, controlHeightLG - dblLineWidth);
  const INTERNAL_FIXED_ITEM_MARGIN = Math.floor(paddingXXS / 2);
  return {
    INTERNAL_FIXED_ITEM_MARGIN,
    zIndexPopup: zIndexPopupBase + 50,
    optionSelectedColor: colorText,
    optionSelectedFontWeight: fontWeightStrong,
    optionSelectedBg: controlItemBgActive,
    optionActiveBg: controlItemBgHover,
    optionPadding: `${(controlHeight - fontSize * lineHeight) / 2}px ${controlPaddingHorizontal}px`,
    optionFontSize: fontSize,
    optionLineHeight: lineHeight,
    optionHeight: controlHeight,
    selectorBg: colorBgContainer,
    clearBg: colorBgContainer,
    singleItemHeightLG: controlHeightLG,
    multipleItemBg: colorFillSecondary,
    multipleItemBorderColor: "transparent",
    multipleItemHeight,
    multipleItemHeightSM,
    multipleItemHeightLG,
    multipleSelectorBgDisabled: colorBgContainerDisabled,
    multipleItemColorDisabled: colorTextDisabled,
    multipleItemBorderColorDisabled: "transparent",
    showArrowPaddingInlineEnd: Math.ceil(token.fontSize * 1.25),
    hoverBorderColor: colorPrimaryHover,
    activeBorderColor: colorPrimary,
    activeOutlineColor: controlOutline,
    selectAffixPadding: paddingXXS
  };
};
const genBaseOutlinedStyle$1 = (token, options) => {
  const {
    componentCls,
    antCls,
    controlOutlineWidth
  } = token;
  return {
    [`&:not(${componentCls}-customize-input) ${componentCls}-selector`]: {
      border: `${unit(token.lineWidth)} ${token.lineType} ${options.borderColor}`,
      background: token.selectorBg
    },
    [`&:not(${componentCls}-disabled):not(${componentCls}-customize-input):not(${antCls}-pagination-size-changer)`]: {
      [`&:hover ${componentCls}-selector`]: {
        borderColor: options.hoverBorderHover
      },
      [`${componentCls}-focused& ${componentCls}-selector`]: {
        borderColor: options.activeBorderColor,
        boxShadow: `0 0 0 ${unit(controlOutlineWidth)} ${options.activeOutlineColor}`,
        outline: 0
      },
      [`${componentCls}-prefix`]: {
        color: options.color
      }
    }
  };
};
const genOutlinedStatusStyle$1 = (token, options) => ({
  [`&${token.componentCls}-status-${options.status}`]: Object.assign({}, genBaseOutlinedStyle$1(token, options))
});
const genOutlinedStyle$1 = (token) => ({
  "&-outlined": Object.assign(Object.assign(Object.assign(Object.assign({}, genBaseOutlinedStyle$1(token, {
    borderColor: token.colorBorder,
    hoverBorderHover: token.hoverBorderColor,
    activeBorderColor: token.activeBorderColor,
    activeOutlineColor: token.activeOutlineColor,
    color: token.colorText
  })), genOutlinedStatusStyle$1(token, {
    status: "error",
    borderColor: token.colorError,
    hoverBorderHover: token.colorErrorHover,
    activeBorderColor: token.colorError,
    activeOutlineColor: token.colorErrorOutline,
    color: token.colorError
  })), genOutlinedStatusStyle$1(token, {
    status: "warning",
    borderColor: token.colorWarning,
    hoverBorderHover: token.colorWarningHover,
    activeBorderColor: token.colorWarning,
    activeOutlineColor: token.colorWarningOutline,
    color: token.colorWarning
  })), {
    [`&${token.componentCls}-disabled`]: {
      [`&:not(${token.componentCls}-customize-input) ${token.componentCls}-selector`]: {
        background: token.colorBgContainerDisabled,
        color: token.colorTextDisabled
      }
    },
    [`&${token.componentCls}-multiple ${token.componentCls}-selection-item`]: {
      background: token.multipleItemBg,
      border: `${unit(token.lineWidth)} ${token.lineType} ${token.multipleItemBorderColor}`
    }
  })
});
const genBaseFilledStyle$1 = (token, options) => {
  const {
    componentCls,
    antCls
  } = token;
  return {
    [`&:not(${componentCls}-customize-input) ${componentCls}-selector`]: {
      background: options.bg,
      border: `${unit(token.lineWidth)} ${token.lineType} transparent`,
      color: options.color
    },
    [`&:not(${componentCls}-disabled):not(${componentCls}-customize-input):not(${antCls}-pagination-size-changer)`]: {
      [`&:hover ${componentCls}-selector`]: {
        background: options.hoverBg
      },
      [`${componentCls}-focused& ${componentCls}-selector`]: {
        background: token.selectorBg,
        borderColor: options.activeBorderColor,
        outline: 0
      }
    }
  };
};
const genFilledStatusStyle$1 = (token, options) => ({
  [`&${token.componentCls}-status-${options.status}`]: Object.assign({}, genBaseFilledStyle$1(token, options))
});
const genFilledStyle$1 = (token) => ({
  "&-filled": Object.assign(Object.assign(Object.assign(Object.assign({}, genBaseFilledStyle$1(token, {
    bg: token.colorFillTertiary,
    hoverBg: token.colorFillSecondary,
    activeBorderColor: token.activeBorderColor,
    color: token.colorText
  })), genFilledStatusStyle$1(token, {
    status: "error",
    bg: token.colorErrorBg,
    hoverBg: token.colorErrorBgHover,
    activeBorderColor: token.colorError,
    color: token.colorError
  })), genFilledStatusStyle$1(token, {
    status: "warning",
    bg: token.colorWarningBg,
    hoverBg: token.colorWarningBgHover,
    activeBorderColor: token.colorWarning,
    color: token.colorWarning
  })), {
    [`&${token.componentCls}-disabled`]: {
      [`&:not(${token.componentCls}-customize-input) ${token.componentCls}-selector`]: {
        borderColor: token.colorBorder,
        background: token.colorBgContainerDisabled,
        color: token.colorTextDisabled
      }
    },
    [`&${token.componentCls}-multiple ${token.componentCls}-selection-item`]: {
      background: token.colorBgContainer,
      border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorSplit}`
    }
  })
});
const genBorderlessStyle$1 = (token) => ({
  "&-borderless": {
    [`${token.componentCls}-selector`]: {
      background: "transparent",
      border: `${unit(token.lineWidth)} ${token.lineType} transparent`
    },
    [`&${token.componentCls}-disabled`]: {
      [`&:not(${token.componentCls}-customize-input) ${token.componentCls}-selector`]: {
        color: token.colorTextDisabled
      }
    },
    [`&${token.componentCls}-multiple ${token.componentCls}-selection-item`]: {
      background: token.multipleItemBg,
      border: `${unit(token.lineWidth)} ${token.lineType} ${token.multipleItemBorderColor}`
    },
    // Status
    [`&${token.componentCls}-status-error`]: {
      [`${token.componentCls}-prefix, ${token.componentCls}-selection-item`]: {
        color: token.colorError
      }
    },
    [`&${token.componentCls}-status-warning`]: {
      [`${token.componentCls}-prefix, ${token.componentCls}-selection-item`]: {
        color: token.colorWarning
      }
    }
  }
});
const genBaseUnderlinedStyle$1 = (token, options) => {
  const {
    componentCls,
    antCls
  } = token;
  return {
    [`&:not(${componentCls}-customize-input) ${componentCls}-selector`]: {
      borderWidth: `0 0 ${unit(token.lineWidth)} 0`,
      borderStyle: `none none ${token.lineType} none`,
      borderColor: options.borderColor,
      background: token.selectorBg,
      borderRadius: 0
    },
    [`&:not(${componentCls}-disabled):not(${componentCls}-customize-input):not(${antCls}-pagination-size-changer)`]: {
      [`&:hover ${componentCls}-selector`]: {
        borderColor: options.hoverBorderHover
      },
      [`${componentCls}-focused& ${componentCls}-selector`]: {
        borderColor: options.activeBorderColor,
        outline: 0
      },
      [`${componentCls}-prefix`]: {
        color: options.color
      }
    }
  };
};
const genUnderlinedStatusStyle$1 = (token, options) => ({
  [`&${token.componentCls}-status-${options.status}`]: Object.assign({}, genBaseUnderlinedStyle$1(token, options))
});
const genUnderlinedStyle$1 = (token) => ({
  "&-underlined": Object.assign(Object.assign(Object.assign(Object.assign({}, genBaseUnderlinedStyle$1(token, {
    borderColor: token.colorBorder,
    hoverBorderHover: token.hoverBorderColor,
    activeBorderColor: token.activeBorderColor,
    activeOutlineColor: token.activeOutlineColor,
    color: token.colorText
  })), genUnderlinedStatusStyle$1(token, {
    status: "error",
    borderColor: token.colorError,
    hoverBorderHover: token.colorErrorHover,
    activeBorderColor: token.colorError,
    activeOutlineColor: token.colorErrorOutline,
    color: token.colorError
  })), genUnderlinedStatusStyle$1(token, {
    status: "warning",
    borderColor: token.colorWarning,
    hoverBorderHover: token.colorWarningHover,
    activeBorderColor: token.colorWarning,
    activeOutlineColor: token.colorWarningOutline,
    color: token.colorWarning
  })), {
    [`&${token.componentCls}-disabled`]: {
      [`&:not(${token.componentCls}-customize-input) ${token.componentCls}-selector`]: {
        color: token.colorTextDisabled
      }
    },
    [`&${token.componentCls}-multiple ${token.componentCls}-selection-item`]: {
      background: token.multipleItemBg,
      border: `${unit(token.lineWidth)} ${token.lineType} ${token.multipleItemBorderColor}`
    }
  })
});
const genVariantsStyle$1 = (token) => ({
  [token.componentCls]: Object.assign(Object.assign(Object.assign(Object.assign({}, genOutlinedStyle$1(token)), genFilledStyle$1(token)), genBorderlessStyle$1(token)), genUnderlinedStyle$1(token))
});
const genSelectorStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    position: "relative",
    transition: `all ${token.motionDurationMid} ${token.motionEaseInOut}`,
    input: {
      cursor: "pointer"
    },
    [`${componentCls}-show-search&`]: {
      cursor: "text",
      input: {
        cursor: "auto",
        color: "inherit",
        height: "100%"
      }
    },
    [`${componentCls}-disabled&`]: {
      cursor: "not-allowed",
      input: {
        cursor: "not-allowed"
      }
    }
  };
};
const getSearchInputWithoutBorderStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-selection-search-input`]: {
      margin: 0,
      padding: 0,
      background: "transparent",
      border: "none",
      outline: "none",
      appearance: "none",
      fontFamily: "inherit",
      "&::-webkit-search-cancel-button": {
        display: "none",
        appearance: "none"
      }
    }
  };
};
const genBaseStyle$3 = (token) => {
  const {
    antCls,
    componentCls,
    inputPaddingHorizontalBase,
    iconCls
  } = token;
  const hoverShowClearStyle = {
    [`${componentCls}-clear`]: {
      opacity: 1,
      background: token.colorBgBase,
      borderRadius: "50%"
    }
  };
  return {
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      position: "relative",
      display: "inline-flex",
      cursor: "pointer",
      [`&:not(${componentCls}-customize-input) ${componentCls}-selector`]: Object.assign(Object.assign({}, genSelectorStyle(token)), getSearchInputWithoutBorderStyle(token)),
      // ======================== Selection ========================
      [`${componentCls}-selection-item`]: Object.assign(Object.assign({
        flex: 1,
        fontWeight: "normal",
        position: "relative",
        userSelect: "none"
      }, textEllipsis), {
        // https://github.com/ant-design/ant-design/issues/40421
        [`> ${antCls}-typography`]: {
          display: "inline"
        }
      }),
      // ======================= Placeholder =======================
      [`${componentCls}-selection-placeholder`]: Object.assign(Object.assign({}, textEllipsis), {
        flex: 1,
        color: token.colorTextPlaceholder,
        pointerEvents: "none"
      }),
      // ========================== Arrow ==========================
      [`${componentCls}-arrow`]: Object.assign(Object.assign({}, resetIcon()), {
        position: "absolute",
        top: "50%",
        insetInlineStart: "auto",
        insetInlineEnd: inputPaddingHorizontalBase,
        height: token.fontSizeIcon,
        marginTop: token.calc(token.fontSizeIcon).mul(-1).div(2).equal(),
        color: token.colorTextQuaternary,
        fontSize: token.fontSizeIcon,
        lineHeight: 1,
        textAlign: "center",
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        transition: `opacity ${token.motionDurationSlow} ease`,
        [iconCls]: {
          verticalAlign: "top",
          transition: `transform ${token.motionDurationSlow}`,
          "> svg": {
            verticalAlign: "top"
          },
          [`&:not(${componentCls}-suffix)`]: {
            pointerEvents: "auto"
          }
        },
        [`${componentCls}-disabled &`]: {
          cursor: "not-allowed"
        },
        "> *:not(:last-child)": {
          marginInlineEnd: 8
          // FIXME: magic
        }
      }),
      // ========================== Wrap ===========================
      [`${componentCls}-selection-wrap`]: {
        display: "flex",
        width: "100%",
        position: "relative",
        minWidth: 0,
        // https://github.com/ant-design/ant-design/issues/51669
        "&:after": {
          content: '"\\a0"',
          width: 0,
          overflow: "hidden"
        }
      },
      // ========================= Prefix ==========================
      [`${componentCls}-prefix`]: {
        flex: "none",
        marginInlineEnd: token.selectAffixPadding
      },
      // ========================== Clear ==========================
      [`${componentCls}-clear`]: {
        position: "absolute",
        top: "50%",
        insetInlineStart: "auto",
        insetInlineEnd: inputPaddingHorizontalBase,
        zIndex: 1,
        display: "inline-block",
        width: token.fontSizeIcon,
        height: token.fontSizeIcon,
        marginTop: token.calc(token.fontSizeIcon).mul(-1).div(2).equal(),
        color: token.colorTextQuaternary,
        fontSize: token.fontSizeIcon,
        fontStyle: "normal",
        lineHeight: 1,
        textAlign: "center",
        textTransform: "none",
        cursor: "pointer",
        opacity: 0,
        transition: `color ${token.motionDurationMid} ease, opacity ${token.motionDurationSlow} ease`,
        textRendering: "auto",
        // https://github.com/ant-design/ant-design/issues/54205
        // Force GPU compositing on Safari to prevent flickering on opacity/transform transitions
        transform: "translateZ(0)",
        "&:before": {
          display: "block"
        },
        "&:hover": {
          color: token.colorIcon
        }
      },
      "@media(hover:none)": hoverShowClearStyle,
      "&:hover": hoverShowClearStyle
    }),
    // ========================= Feedback ==========================
    [`${componentCls}-status`]: {
      "&-error, &-warning, &-success, &-validating": {
        [`&${componentCls}-has-feedback`]: {
          [`${componentCls}-clear`]: {
            insetInlineEnd: token.calc(inputPaddingHorizontalBase).add(token.fontSize).add(token.paddingXS).equal()
          }
        }
      }
    }
  };
};
const genSelectStyle = (token) => {
  const {
    componentCls
  } = token;
  return [
    {
      [componentCls]: {
        // ==================== In Form ====================
        [`&${componentCls}-in-form-item`]: {
          width: "100%"
        }
      }
    },
    // =====================================================
    // ==                       LTR                       ==
    // =====================================================
    // Base
    genBaseStyle$3(token),
    // Single
    genSingleStyle(token),
    // Multiple
    genMultipleStyle(token),
    // Dropdown
    genSingleStyle$1(token),
    // =====================================================
    // ==                       RTL                       ==
    // =====================================================
    {
      [`${componentCls}-rtl`]: {
        direction: "rtl"
      }
    },
    // =====================================================
    // ==             Space Compact                       ==
    // =====================================================
    genCompactItemStyle(token, {
      borderElCls: `${componentCls}-selector`,
      focusElCls: `${componentCls}-focused`
    })
  ];
};
const useSelectStyle = genStyleHooks("Select", (token, {
  rootPrefixCls
}) => {
  const selectToken = merge$1(token, {
    rootPrefixCls,
    inputPaddingHorizontalBase: token.calc(token.paddingSM).sub(1).equal(),
    multipleSelectItemHeight: token.multipleItemHeight,
    selectHeight: token.controlHeight
  });
  return [genSelectStyle(selectToken), genVariantsStyle$1(selectToken)];
}, prepareComponentToken$h, {
  unitless: {
    optionLineHeight: true,
    optionSelectedFontWeight: true
  }
});
function useIcons$1({
  suffixIcon,
  clearIcon,
  menuItemSelectedIcon,
  removeIcon,
  loading,
  multiple,
  hasFeedback,
  prefixCls,
  showSuffixIcon,
  feedbackIcon,
  showArrow,
  componentName
}) {
  const mergedClearIcon = clearIcon !== null && clearIcon !== void 0 ? clearIcon : /* @__PURE__ */ reactExports.createElement(RefIcon$2, null);
  const getSuffixIconNode = (arrowIcon) => {
    if (suffixIcon === null && !hasFeedback && !showArrow) {
      return null;
    }
    return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, showSuffixIcon !== false && arrowIcon, hasFeedback && feedbackIcon);
  };
  let mergedSuffixIcon = null;
  if (suffixIcon !== void 0) {
    mergedSuffixIcon = getSuffixIconNode(suffixIcon);
  } else if (loading) {
    mergedSuffixIcon = getSuffixIconNode(/* @__PURE__ */ reactExports.createElement(RefIcon, {
      spin: true
    }));
  } else {
    const iconCls = `${prefixCls}-suffix`;
    mergedSuffixIcon = ({
      open: open2,
      showSearch
    }) => {
      if (open2 && showSearch) {
        return getSuffixIconNode(/* @__PURE__ */ reactExports.createElement(RefIcon$8, {
          className: iconCls
        }));
      }
      return getSuffixIconNode(/* @__PURE__ */ reactExports.createElement(RefIcon$9, {
        className: iconCls
      }));
    };
  }
  let mergedItemIcon = null;
  if (menuItemSelectedIcon !== void 0) {
    mergedItemIcon = menuItemSelectedIcon;
  } else if (multiple) {
    mergedItemIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$7, null);
  } else {
    mergedItemIcon = null;
  }
  let mergedRemoveIcon = null;
  if (removeIcon !== void 0) {
    mergedRemoveIcon = removeIcon;
  } else {
    mergedRemoveIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$5, null);
  }
  return {
    clearIcon: mergedClearIcon,
    suffixIcon: mergedSuffixIcon,
    itemIcon: mergedItemIcon,
    removeIcon: mergedRemoveIcon
  };
}
function useShowArrow(suffixIcon, showArrow) {
  return showArrow !== void 0 ? showArrow : suffixIcon !== null;
}
var __rest$L = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const SECRET_COMBOBOX_MODE_DO_NOT_USE = "SECRET_COMBOBOX_MODE_DO_NOT_USE";
const InternalSelect = (props, ref) => {
  var _a, _b, _c, _d, _e;
  const {
    prefixCls: customizePrefixCls,
    bordered,
    className,
    rootClassName,
    getPopupContainer,
    popupClassName,
    dropdownClassName,
    listHeight = 256,
    placement,
    listItemHeight: customListItemHeight,
    size: customizeSize,
    disabled: customDisabled,
    notFoundContent,
    status: customStatus,
    builtinPlacements,
    dropdownMatchSelectWidth,
    popupMatchSelectWidth,
    direction: propDirection,
    style,
    allowClear,
    variant: customizeVariant,
    dropdownStyle,
    transitionName,
    tagRender,
    maxCount,
    prefix,
    dropdownRender,
    popupRender,
    onDropdownVisibleChange,
    onOpenChange,
    styles,
    classNames: classNames$1
  } = props, rest = __rest$L(props, ["prefixCls", "bordered", "className", "rootClassName", "getPopupContainer", "popupClassName", "dropdownClassName", "listHeight", "placement", "listItemHeight", "size", "disabled", "notFoundContent", "status", "builtinPlacements", "dropdownMatchSelectWidth", "popupMatchSelectWidth", "direction", "style", "allowClear", "variant", "dropdownStyle", "transitionName", "tagRender", "maxCount", "prefix", "dropdownRender", "popupRender", "onDropdownVisibleChange", "onOpenChange", "styles", "classNames"]);
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    renderEmpty,
    direction: contextDirection,
    virtual,
    popupMatchSelectWidth: contextPopupMatchSelectWidth,
    popupOverflow
  } = reactExports.useContext(ConfigContext);
  const {
    showSearch,
    style: contextStyle,
    styles: contextStyles,
    className: contextClassName,
    classNames: contextClassNames
  } = useComponentConfig("select");
  const [, token] = useToken();
  const listItemHeight = customListItemHeight !== null && customListItemHeight !== void 0 ? customListItemHeight : token === null || token === void 0 ? void 0 : token.controlHeight;
  const prefixCls = getPrefixCls("select", customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const direction = propDirection !== null && propDirection !== void 0 ? propDirection : contextDirection;
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const [variant, enableVariantCls] = useVariant("select", customizeVariant, bordered);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useSelectStyle(prefixCls, rootCls);
  const mode = reactExports.useMemo(() => {
    const {
      mode: m
    } = props;
    if (m === "combobox") {
      return void 0;
    }
    if (m === SECRET_COMBOBOX_MODE_DO_NOT_USE) {
      return "combobox";
    }
    return m;
  }, [props.mode]);
  const isMultiple = mode === "multiple" || mode === "tags";
  const showSuffixIcon = useShowArrow(props.suffixIcon, props.showArrow);
  const mergedPopupMatchSelectWidth = (_a = popupMatchSelectWidth !== null && popupMatchSelectWidth !== void 0 ? popupMatchSelectWidth : dropdownMatchSelectWidth) !== null && _a !== void 0 ? _a : contextPopupMatchSelectWidth;
  const mergedPopupStyle = ((_b = styles === null || styles === void 0 ? void 0 : styles.popup) === null || _b === void 0 ? void 0 : _b.root) || ((_c = contextStyles.popup) === null || _c === void 0 ? void 0 : _c.root) || dropdownStyle;
  const mergedPopupRender = popupRender || dropdownRender;
  const mergedOnOpenChange = onOpenChange || onDropdownVisibleChange;
  const {
    status: contextStatus,
    hasFeedback,
    isFormItemInput,
    feedbackIcon
  } = reactExports.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  let mergedNotFound;
  if (notFoundContent !== void 0) {
    mergedNotFound = notFoundContent;
  } else if (mode === "combobox") {
    mergedNotFound = null;
  } else {
    mergedNotFound = (renderEmpty === null || renderEmpty === void 0 ? void 0 : renderEmpty("Select")) || /* @__PURE__ */ reactExports.createElement(DefaultRenderEmpty, {
      componentName: "Select"
    });
  }
  const {
    suffixIcon,
    itemIcon,
    removeIcon,
    clearIcon
  } = useIcons$1(Object.assign(Object.assign({}, rest), {
    multiple: isMultiple,
    hasFeedback,
    feedbackIcon,
    showSuffixIcon,
    prefixCls,
    componentName: "Select"
  }));
  const mergedAllowClear = allowClear === true ? {
    clearIcon
  } : allowClear;
  const selectProps = omit(rest, ["suffixIcon", "itemIcon"]);
  const mergedPopupClassName = classNames(((_d = classNames$1 === null || classNames$1 === void 0 ? void 0 : classNames$1.popup) === null || _d === void 0 ? void 0 : _d.root) || ((_e = contextClassNames === null || contextClassNames === void 0 ? void 0 : contextClassNames.popup) === null || _e === void 0 ? void 0 : _e.root) || popupClassName || dropdownClassName, {
    [`${prefixCls}-dropdown-${direction}`]: direction === "rtl"
  }, rootClassName, contextClassNames.root, classNames$1 === null || classNames$1 === void 0 ? void 0 : classNames$1.root, cssVarCls, rootCls, hashId);
  const mergedSize = useSize((ctx) => {
    var _a2;
    return (_a2 = customizeSize !== null && customizeSize !== void 0 ? customizeSize : compactSize) !== null && _a2 !== void 0 ? _a2 : ctx;
  });
  const disabled = reactExports.useContext(DisabledContext);
  const mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
  const mergedClassName = classNames({
    [`${prefixCls}-lg`]: mergedSize === "large",
    [`${prefixCls}-sm`]: mergedSize === "small",
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-${variant}`]: enableVariantCls,
    [`${prefixCls}-in-form-item`]: isFormItemInput
  }, getStatusClassNames(prefixCls, mergedStatus, hasFeedback), compactItemClassnames, contextClassName, className, contextClassNames.root, classNames$1 === null || classNames$1 === void 0 ? void 0 : classNames$1.root, rootClassName, cssVarCls, rootCls, hashId);
  const memoPlacement = reactExports.useMemo(() => {
    if (placement !== void 0) {
      return placement;
    }
    return direction === "rtl" ? "bottomRight" : "bottomLeft";
  }, [placement, direction]);
  const [zIndex] = useZIndex("SelectLike", mergedPopupStyle === null || mergedPopupStyle === void 0 ? void 0 : mergedPopupStyle.zIndex);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(TypedSelect, Object.assign({
    ref,
    virtual,
    showSearch
  }, selectProps, {
    style: Object.assign(Object.assign(Object.assign(Object.assign({}, contextStyles.root), styles === null || styles === void 0 ? void 0 : styles.root), contextStyle), style),
    dropdownMatchSelectWidth: mergedPopupMatchSelectWidth,
    transitionName: getTransitionName(rootPrefixCls, "slide-up", transitionName),
    builtinPlacements: mergedBuiltinPlacements(builtinPlacements, popupOverflow),
    listHeight,
    listItemHeight,
    mode,
    prefixCls,
    placement: memoPlacement,
    direction,
    prefix,
    suffixIcon,
    menuItemSelectedIcon: itemIcon,
    removeIcon,
    allowClear: mergedAllowClear,
    notFoundContent: mergedNotFound,
    className: mergedClassName,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    dropdownClassName: mergedPopupClassName,
    disabled: mergedDisabled,
    dropdownStyle: Object.assign(Object.assign({}, mergedPopupStyle), {
      zIndex
    }),
    maxCount: isMultiple ? maxCount : void 0,
    tagRender: isMultiple ? tagRender : void 0,
    dropdownRender: mergedPopupRender,
    onDropdownVisibleChange: mergedOnOpenChange
  })));
};
const Select = /* @__PURE__ */ reactExports.forwardRef(InternalSelect);
const PurePanel$5 = genPurePanel(Select, "dropdownAlign");
Select.SECRET_COMBOBOX_MODE_DO_NOT_USE = SECRET_COMBOBOX_MODE_DO_NOT_USE;
Select.Option = Option;
Select.OptGroup = OptGroup;
Select._InternalPanelDoNotUseOrYouWillBeFired = PurePanel$5;
const addMediaQueryListener = (mql, handler) => {
  if (typeof (mql === null || mql === void 0 ? void 0 : mql.addEventListener) !== "undefined") {
    mql.addEventListener("change", handler);
  } else if (typeof (mql === null || mql === void 0 ? void 0 : mql.addListener) !== "undefined") {
    mql.addListener(handler);
  }
};
const removeMediaQueryListener = (mql, handler) => {
  if (typeof (mql === null || mql === void 0 ? void 0 : mql.removeEventListener) !== "undefined") {
    mql.removeEventListener("change", handler);
  } else if (typeof (mql === null || mql === void 0 ? void 0 : mql.removeListener) !== "undefined") {
    mql.removeListener(handler);
  }
};
const responsiveArray = ["xxl", "xl", "lg", "md", "sm", "xs"];
const getResponsiveMap = (token) => ({
  xs: `(max-width: ${token.screenXSMax}px)`,
  sm: `(min-width: ${token.screenSM}px)`,
  md: `(min-width: ${token.screenMD}px)`,
  lg: `(min-width: ${token.screenLG}px)`,
  xl: `(min-width: ${token.screenXL}px)`,
  xxl: `(min-width: ${token.screenXXL}px)`
});
const validateBreakpoints = (token) => {
  const indexableToken = token;
  const revBreakpoints = [].concat(responsiveArray).reverse();
  revBreakpoints.forEach((breakpoint, i) => {
    const breakpointUpper = breakpoint.toUpperCase();
    const screenMin = `screen${breakpointUpper}Min`;
    const screen = `screen${breakpointUpper}`;
    if (!(indexableToken[screenMin] <= indexableToken[screen])) {
      throw new Error(`${screenMin}<=${screen} fails : !(${indexableToken[screenMin]}<=${indexableToken[screen]})`);
    }
    if (i < revBreakpoints.length - 1) {
      const screenMax = `screen${breakpointUpper}Max`;
      if (!(indexableToken[screen] <= indexableToken[screenMax])) {
        throw new Error(`${screen}<=${screenMax} fails : !(${indexableToken[screen]}<=${indexableToken[screenMax]})`);
      }
      const nextBreakpointUpperMin = revBreakpoints[i + 1].toUpperCase();
      const nextScreenMin = `screen${nextBreakpointUpperMin}Min`;
      if (!(indexableToken[screenMax] <= indexableToken[nextScreenMin])) {
        throw new Error(`${screenMax}<=${nextScreenMin} fails : !(${indexableToken[screenMax]}<=${indexableToken[nextScreenMin]})`);
      }
    }
  });
  return token;
};
const useResponsiveObserver = () => {
  const [, token] = useToken();
  const responsiveMap = getResponsiveMap(validateBreakpoints(token));
  return React.useMemo(() => {
    const subscribers = /* @__PURE__ */ new Map();
    let subUid = -1;
    let screens = {};
    return {
      responsiveMap,
      matchHandlers: {},
      dispatch(pointMap) {
        screens = pointMap;
        subscribers.forEach((func) => func(screens));
        return subscribers.size >= 1;
      },
      subscribe(func) {
        if (!subscribers.size) {
          this.register();
        }
        subUid += 1;
        subscribers.set(subUid, func);
        func(screens);
        return subUid;
      },
      unsubscribe(paramToken) {
        subscribers.delete(paramToken);
        if (!subscribers.size) {
          this.unregister();
        }
      },
      register() {
        Object.entries(responsiveMap).forEach(([screen, mediaQuery]) => {
          const listener = ({
            matches
          }) => {
            this.dispatch(Object.assign(Object.assign({}, screens), {
              [screen]: matches
            }));
          };
          const mql = window.matchMedia(mediaQuery);
          addMediaQueryListener(mql, listener);
          this.matchHandlers[mediaQuery] = {
            mql,
            listener
          };
          listener(mql);
        });
      },
      unregister() {
        Object.values(responsiveMap).forEach((mediaQuery) => {
          const handler = this.matchHandlers[mediaQuery];
          removeMediaQueryListener(handler === null || handler === void 0 ? void 0 : handler.mql, handler === null || handler === void 0 ? void 0 : handler.listener);
        });
        subscribers.clear();
      }
    };
  }, [token]);
};
function useForceUpdate() {
  const [, forceUpdate] = reactExports.useReducer((x) => x + 1, 0);
  return forceUpdate;
}
function useBreakpoint(refreshOnChange = true, defaultScreens = {}) {
  const screensRef = reactExports.useRef(defaultScreens);
  const forceUpdate = useForceUpdate();
  const responsiveObserver = useResponsiveObserver();
  useLayoutEffect(() => {
    const token = responsiveObserver.subscribe((supportScreens) => {
      screensRef.current = supportScreens;
      if (refreshOnChange) {
        forceUpdate();
      }
    });
    return () => responsiveObserver.unsubscribe(token);
  }, []);
  return screensRef.current;
}
function getArrowToken(token) {
  const {
    sizePopupArrow,
    borderRadiusXS,
    borderRadiusOuter
  } = token;
  const unitWidth = sizePopupArrow / 2;
  const ax = 0;
  const ay = unitWidth;
  const bx = borderRadiusOuter * 1 / Math.sqrt(2);
  const by = unitWidth - borderRadiusOuter * (1 - 1 / Math.sqrt(2));
  const cx = unitWidth - borderRadiusXS * (1 / Math.sqrt(2));
  const cy = borderRadiusOuter * (Math.sqrt(2) - 1) + borderRadiusXS * (1 / Math.sqrt(2));
  const dx = 2 * unitWidth - cx;
  const dy = cy;
  const ex = 2 * unitWidth - bx;
  const ey = by;
  const fx = 2 * unitWidth - ax;
  const fy = ay;
  const shadowWidth = unitWidth * Math.sqrt(2) + borderRadiusOuter * (Math.sqrt(2) - 2);
  const polygonOffset = borderRadiusOuter * (Math.sqrt(2) - 1);
  const arrowPolygon = `polygon(${polygonOffset}px 100%, 50% ${polygonOffset}px, ${2 * unitWidth - polygonOffset}px 100%, ${polygonOffset}px 100%)`;
  const arrowPath = `path('M ${ax} ${ay} A ${borderRadiusOuter} ${borderRadiusOuter} 0 0 0 ${bx} ${by} L ${cx} ${cy} A ${borderRadiusXS} ${borderRadiusXS} 0 0 1 ${dx} ${dy} L ${ex} ${ey} A ${borderRadiusOuter} ${borderRadiusOuter} 0 0 0 ${fx} ${fy} Z')`;
  return {
    arrowShadowWidth: shadowWidth,
    arrowPath,
    arrowPolygon
  };
}
const genRoundedArrow = (token, bgColor, boxShadow) => {
  const {
    sizePopupArrow,
    arrowPolygon,
    arrowPath,
    arrowShadowWidth,
    borderRadiusXS,
    calc
  } = token;
  return {
    pointerEvents: "none",
    width: sizePopupArrow,
    height: sizePopupArrow,
    overflow: "hidden",
    "&::before": {
      position: "absolute",
      bottom: 0,
      insetInlineStart: 0,
      width: sizePopupArrow,
      height: calc(sizePopupArrow).div(2).equal(),
      background: bgColor,
      clipPath: {
        _multi_value_: true,
        value: [arrowPolygon, arrowPath]
      },
      content: '""'
    },
    "&::after": {
      content: '""',
      position: "absolute",
      width: arrowShadowWidth,
      height: arrowShadowWidth,
      bottom: 0,
      insetInline: 0,
      margin: "auto",
      borderRadius: {
        _skip_check_: true,
        value: `0 0 ${unit(borderRadiusXS)} 0`
      },
      transform: "translateY(50%) rotate(-135deg)",
      boxShadow,
      zIndex: 0,
      background: "transparent"
    }
  };
};
const MAX_VERTICAL_CONTENT_RADIUS = 8;
function getArrowOffsetToken(options) {
  const {
    contentRadius,
    limitVerticalRadius
  } = options;
  const arrowOffset = contentRadius > 12 ? contentRadius + 2 : 12;
  const arrowOffsetVertical = limitVerticalRadius ? MAX_VERTICAL_CONTENT_RADIUS : arrowOffset;
  return {
    arrowOffsetHorizontal: arrowOffset,
    arrowOffsetVertical
  };
}
function isInject(valid, code) {
  if (!valid) {
    return {};
  }
  return code;
}
function getArrowStyle(token, colorBg, options) {
  const {
    componentCls,
    boxShadowPopoverArrow,
    arrowOffsetVertical,
    arrowOffsetHorizontal
  } = token;
  const {
    arrowDistance = 0,
    arrowPlacement = {
      left: true,
      right: true,
      top: true,
      bottom: true
    }
  } = options || {};
  return {
    [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign({
      // ============================ Basic ============================
      [`${componentCls}-arrow`]: [Object.assign(Object.assign({
        position: "absolute",
        zIndex: 1,
        display: "block"
      }, genRoundedArrow(token, colorBg, boxShadowPopoverArrow)), {
        "&:before": {
          background: colorBg
        }
      })]
    }, isInject(!!arrowPlacement.top, {
      [[`&-placement-top > ${componentCls}-arrow`, `&-placement-topLeft > ${componentCls}-arrow`, `&-placement-topRight > ${componentCls}-arrow`].join(",")]: {
        bottom: arrowDistance,
        transform: "translateY(100%) rotate(180deg)"
      },
      [`&-placement-top > ${componentCls}-arrow`]: {
        left: {
          _skip_check_: true,
          value: "50%"
        },
        transform: "translateX(-50%) translateY(100%) rotate(180deg)"
      },
      "&-placement-topLeft": {
        "--arrow-offset-horizontal": arrowOffsetHorizontal,
        [`> ${componentCls}-arrow`]: {
          left: {
            _skip_check_: true,
            value: arrowOffsetHorizontal
          }
        }
      },
      "&-placement-topRight": {
        "--arrow-offset-horizontal": `calc(100% - ${unit(arrowOffsetHorizontal)})`,
        [`> ${componentCls}-arrow`]: {
          right: {
            _skip_check_: true,
            value: arrowOffsetHorizontal
          }
        }
      }
    })), isInject(!!arrowPlacement.bottom, {
      [[`&-placement-bottom > ${componentCls}-arrow`, `&-placement-bottomLeft > ${componentCls}-arrow`, `&-placement-bottomRight > ${componentCls}-arrow`].join(",")]: {
        top: arrowDistance,
        transform: `translateY(-100%)`
      },
      [`&-placement-bottom > ${componentCls}-arrow`]: {
        left: {
          _skip_check_: true,
          value: "50%"
        },
        transform: `translateX(-50%) translateY(-100%)`
      },
      "&-placement-bottomLeft": {
        "--arrow-offset-horizontal": arrowOffsetHorizontal,
        [`> ${componentCls}-arrow`]: {
          left: {
            _skip_check_: true,
            value: arrowOffsetHorizontal
          }
        }
      },
      "&-placement-bottomRight": {
        "--arrow-offset-horizontal": `calc(100% - ${unit(arrowOffsetHorizontal)})`,
        [`> ${componentCls}-arrow`]: {
          right: {
            _skip_check_: true,
            value: arrowOffsetHorizontal
          }
        }
      }
    })), isInject(!!arrowPlacement.left, {
      [[`&-placement-left > ${componentCls}-arrow`, `&-placement-leftTop > ${componentCls}-arrow`, `&-placement-leftBottom > ${componentCls}-arrow`].join(",")]: {
        right: {
          _skip_check_: true,
          value: arrowDistance
        },
        transform: "translateX(100%) rotate(90deg)"
      },
      [`&-placement-left > ${componentCls}-arrow`]: {
        top: {
          _skip_check_: true,
          value: "50%"
        },
        transform: "translateY(-50%) translateX(100%) rotate(90deg)"
      },
      [`&-placement-leftTop > ${componentCls}-arrow`]: {
        top: arrowOffsetVertical
      },
      [`&-placement-leftBottom > ${componentCls}-arrow`]: {
        bottom: arrowOffsetVertical
      }
    })), isInject(!!arrowPlacement.right, {
      [[`&-placement-right > ${componentCls}-arrow`, `&-placement-rightTop > ${componentCls}-arrow`, `&-placement-rightBottom > ${componentCls}-arrow`].join(",")]: {
        left: {
          _skip_check_: true,
          value: arrowDistance
        },
        transform: "translateX(-100%) rotate(-90deg)"
      },
      [`&-placement-right > ${componentCls}-arrow`]: {
        top: {
          _skip_check_: true,
          value: "50%"
        },
        transform: "translateY(-50%) translateX(-100%) rotate(-90deg)"
      },
      [`&-placement-rightTop > ${componentCls}-arrow`]: {
        top: arrowOffsetVertical
      },
      [`&-placement-rightBottom > ${componentCls}-arrow`]: {
        bottom: arrowOffsetVertical
      }
    }))
  };
}
function getOverflowOptions(placement, arrowOffset, arrowWidth, autoAdjustOverflow) {
  if (autoAdjustOverflow === false) {
    return {
      adjustX: false,
      adjustY: false
    };
  }
  const overflow = autoAdjustOverflow && typeof autoAdjustOverflow === "object" ? autoAdjustOverflow : {};
  const baseOverflow = {};
  switch (placement) {
    case "top":
    case "bottom":
      baseOverflow.shiftX = arrowOffset.arrowOffsetHorizontal * 2 + arrowWidth;
      baseOverflow.shiftY = true;
      baseOverflow.adjustY = true;
      break;
    case "left":
    case "right":
      baseOverflow.shiftY = arrowOffset.arrowOffsetVertical * 2 + arrowWidth;
      baseOverflow.shiftX = true;
      baseOverflow.adjustX = true;
      break;
  }
  const mergedOverflow = Object.assign(Object.assign({}, baseOverflow), overflow);
  if (!mergedOverflow.shiftX) {
    mergedOverflow.adjustX = true;
  }
  if (!mergedOverflow.shiftY) {
    mergedOverflow.adjustY = true;
  }
  return mergedOverflow;
}
const PlacementAlignMap = {
  left: {
    points: ["cr", "cl"]
  },
  right: {
    points: ["cl", "cr"]
  },
  top: {
    points: ["bc", "tc"]
  },
  bottom: {
    points: ["tc", "bc"]
  },
  topLeft: {
    points: ["bl", "tl"]
  },
  leftTop: {
    points: ["tr", "tl"]
  },
  topRight: {
    points: ["br", "tr"]
  },
  rightTop: {
    points: ["tl", "tr"]
  },
  bottomRight: {
    points: ["tr", "br"]
  },
  rightBottom: {
    points: ["bl", "br"]
  },
  bottomLeft: {
    points: ["tl", "bl"]
  },
  leftBottom: {
    points: ["br", "bl"]
  }
};
const ArrowCenterPlacementAlignMap = {
  topLeft: {
    points: ["bl", "tc"]
  },
  leftTop: {
    points: ["tr", "cl"]
  },
  topRight: {
    points: ["br", "tc"]
  },
  rightTop: {
    points: ["tl", "cr"]
  },
  bottomRight: {
    points: ["tr", "bc"]
  },
  rightBottom: {
    points: ["bl", "cr"]
  },
  bottomLeft: {
    points: ["tl", "bc"]
  },
  leftBottom: {
    points: ["br", "cl"]
  }
};
const DisableAutoArrowList = /* @__PURE__ */ new Set(["topLeft", "topRight", "bottomLeft", "bottomRight", "leftTop", "leftBottom", "rightTop", "rightBottom"]);
function getPlacements(config) {
  const {
    arrowWidth,
    autoAdjustOverflow,
    arrowPointAtCenter,
    offset: offset2,
    borderRadius,
    visibleFirst
  } = config;
  const halfArrowWidth = arrowWidth / 2;
  const placementMap = {};
  Object.keys(PlacementAlignMap).forEach((key) => {
    const template = arrowPointAtCenter && ArrowCenterPlacementAlignMap[key] || PlacementAlignMap[key];
    const placementInfo = Object.assign(Object.assign({}, template), {
      offset: [0, 0],
      dynamicInset: true
    });
    placementMap[key] = placementInfo;
    if (DisableAutoArrowList.has(key)) {
      placementInfo.autoArrow = false;
    }
    switch (key) {
      case "top":
      case "topLeft":
      case "topRight":
        placementInfo.offset[1] = -halfArrowWidth - offset2;
        break;
      case "bottom":
      case "bottomLeft":
      case "bottomRight":
        placementInfo.offset[1] = halfArrowWidth + offset2;
        break;
      case "left":
      case "leftTop":
      case "leftBottom":
        placementInfo.offset[0] = -halfArrowWidth - offset2;
        break;
      case "right":
      case "rightTop":
      case "rightBottom":
        placementInfo.offset[0] = halfArrowWidth + offset2;
        break;
    }
    const arrowOffset = getArrowOffsetToken({
      contentRadius: borderRadius,
      limitVerticalRadius: true
    });
    if (arrowPointAtCenter) {
      switch (key) {
        case "topLeft":
        case "bottomLeft":
          placementInfo.offset[0] = -arrowOffset.arrowOffsetHorizontal - halfArrowWidth;
          break;
        case "topRight":
        case "bottomRight":
          placementInfo.offset[0] = arrowOffset.arrowOffsetHorizontal + halfArrowWidth;
          break;
        case "leftTop":
        case "rightTop":
          placementInfo.offset[1] = -arrowOffset.arrowOffsetHorizontal * 2 + halfArrowWidth;
          break;
        case "leftBottom":
        case "rightBottom":
          placementInfo.offset[1] = arrowOffset.arrowOffsetHorizontal * 2 - halfArrowWidth;
          break;
      }
    }
    placementInfo.overflow = getOverflowOptions(key, arrowOffset, arrowWidth, autoAdjustOverflow);
    if (visibleFirst) {
      placementInfo.htmlRegion = "visibleFirst";
    }
  });
  return placementMap;
}
const genTooltipStyle = (token) => {
  const {
    calc,
    componentCls,
    // ant-tooltip
    tooltipMaxWidth,
    tooltipColor,
    tooltipBg,
    tooltipBorderRadius,
    zIndexPopup,
    controlHeight,
    boxShadowSecondary,
    paddingSM,
    paddingXS,
    arrowOffsetHorizontal,
    sizePopupArrow
  } = token;
  const edgeAlignMinWidth = calc(tooltipBorderRadius).add(sizePopupArrow).add(arrowOffsetHorizontal).equal();
  const centerAlignMinWidth = calc(tooltipBorderRadius).mul(2).add(sizePopupArrow).equal();
  return [
    {
      [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), {
        position: "absolute",
        zIndex: zIndexPopup,
        display: "block",
        width: "max-content",
        maxWidth: tooltipMaxWidth,
        visibility: "visible",
        // When use `autoArrow`, origin will follow the arrow position
        "--valid-offset-x": "var(--arrow-offset-horizontal, var(--arrow-x))",
        transformOrigin: [`var(--valid-offset-x, 50%)`, `var(--arrow-y, 50%)`].join(" "),
        "&-hidden": {
          display: "none"
        },
        "--antd-arrow-background-color": tooltipBg,
        // Wrapper for the tooltip content
        [`${componentCls}-inner`]: {
          minWidth: centerAlignMinWidth,
          minHeight: controlHeight,
          padding: `${unit(token.calc(paddingSM).div(2).equal())} ${unit(paddingXS)}`,
          color: tooltipColor,
          textAlign: "start",
          textDecoration: "none",
          wordWrap: "break-word",
          backgroundColor: tooltipBg,
          borderRadius: tooltipBorderRadius,
          boxShadow: boxShadowSecondary,
          boxSizing: "border-box"
        },
        // Align placement should have another min width
        [[`&-placement-topLeft`, `&-placement-topRight`, `&-placement-bottomLeft`, `&-placement-bottomRight`].join(",")]: {
          minWidth: edgeAlignMinWidth
        },
        // Limit left and right placement radius
        [[`&-placement-left`, `&-placement-leftTop`, `&-placement-leftBottom`, `&-placement-right`, `&-placement-rightTop`, `&-placement-rightBottom`].join(",")]: {
          [`${componentCls}-inner`]: {
            borderRadius: token.min(tooltipBorderRadius, MAX_VERTICAL_CONTENT_RADIUS)
          }
        },
        [`${componentCls}-content`]: {
          position: "relative"
        }
      }), genPresetColor(token, (colorKey, {
        darkColor
      }) => ({
        [`&${componentCls}-${colorKey}`]: {
          [`${componentCls}-inner`]: {
            backgroundColor: darkColor
          },
          [`${componentCls}-arrow`]: {
            "--antd-arrow-background-color": darkColor
          }
        }
      }))), {
        // RTL
        "&-rtl": {
          direction: "rtl"
        }
      })
    },
    // Arrow Style
    getArrowStyle(token, "var(--antd-arrow-background-color)"),
    // Pure Render
    {
      [`${componentCls}-pure`]: {
        position: "relative",
        maxWidth: "none",
        margin: token.sizePopupArrow
      }
    }
  ];
};
const prepareComponentToken$g = (token) => Object.assign(Object.assign({
  zIndexPopup: token.zIndexPopupBase + 70
}, getArrowOffsetToken({
  contentRadius: token.borderRadius,
  limitVerticalRadius: true
})), getArrowToken(merge$1(token, {
  borderRadiusOuter: Math.min(token.borderRadiusOuter, 4)
})));
const useStyle$k = (prefixCls, injectStyle = true) => {
  const useStyle2 = genStyleHooks("Tooltip", (token) => {
    const {
      borderRadius,
      colorTextLightSolid,
      colorBgSpotlight
    } = token;
    const TooltipToken = merge$1(token, {
      // default variables
      tooltipMaxWidth: 250,
      tooltipColor: colorTextLightSolid,
      tooltipBorderRadius: borderRadius,
      tooltipBg: colorBgSpotlight
    });
    return [genTooltipStyle(TooltipToken), initZoomMotion(token, "zoom-big-fast")];
  }, prepareComponentToken$g, {
    resetStyle: false,
    // Popover use Tooltip as internal component. We do not need to handle this.
    injectStyle
  });
  return useStyle2(prefixCls);
};
const inverseColors = PresetColors.map((color) => `${color}-inverse`);
const PresetStatusColorTypes = ["success", "processing", "error", "default", "warning"];
function isPresetColor(color, includeInverse = true) {
  if (includeInverse) {
    return [].concat(_toConsumableArray(inverseColors), _toConsumableArray(PresetColors)).includes(color);
  }
  return PresetColors.includes(color);
}
function isPresetStatusColor(color) {
  return PresetStatusColorTypes.includes(color);
}
function parseColor(prefixCls, color) {
  const isInternalColor = isPresetColor(color);
  const className = classNames({
    [`${prefixCls}-${color}`]: color && isInternalColor
  });
  const overlayStyle = {};
  const arrowStyle = {};
  if (color && !isInternalColor) {
    overlayStyle.background = color;
    arrowStyle["--antd-arrow-background-color"] = color;
  }
  return {
    className,
    overlayStyle,
    arrowStyle
  };
}
const PurePanel$4 = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    placement = "top",
    title,
    color,
    overlayInnerStyle
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("tooltip", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$k(prefixCls);
  const colorInfo = parseColor(prefixCls, color);
  const arrowContentStyle = colorInfo.arrowStyle;
  const formattedOverlayInnerStyle = Object.assign(Object.assign({}, overlayInnerStyle), colorInfo.overlayStyle);
  const cls = classNames(hashId, cssVarCls, prefixCls, `${prefixCls}-pure`, `${prefixCls}-placement-${placement}`, className, colorInfo.className);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
    className: cls,
    style: arrowContentStyle
  }, /* @__PURE__ */ reactExports.createElement("div", {
    className: `${prefixCls}-arrow`
  }), /* @__PURE__ */ reactExports.createElement(Popup, Object.assign({}, props, {
    className: hashId,
    prefixCls,
    overlayInnerStyle: formattedOverlayInnerStyle
  }), title)));
};
var __rest$K = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const InternalTooltip = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  var _a, _b;
  const {
    prefixCls: customizePrefixCls,
    openClassName,
    getTooltipContainer,
    color,
    overlayInnerStyle,
    children,
    afterOpenChange,
    afterVisibleChange,
    destroyTooltipOnHide,
    destroyOnHidden,
    arrow = true,
    title,
    overlay,
    builtinPlacements,
    arrowPointAtCenter = false,
    autoAdjustOverflow = true,
    motion: motion2,
    getPopupContainer,
    placement = "top",
    mouseEnterDelay = 0.1,
    mouseLeaveDelay = 0.1,
    overlayStyle,
    rootClassName,
    overlayClassName,
    styles,
    classNames: tooltipClassNames
  } = props, restProps = __rest$K(props, ["prefixCls", "openClassName", "getTooltipContainer", "color", "overlayInnerStyle", "children", "afterOpenChange", "afterVisibleChange", "destroyTooltipOnHide", "destroyOnHidden", "arrow", "title", "overlay", "builtinPlacements", "arrowPointAtCenter", "autoAdjustOverflow", "motion", "getPopupContainer", "placement", "mouseEnterDelay", "mouseLeaveDelay", "overlayStyle", "rootClassName", "overlayClassName", "styles", "classNames"]);
  const mergedShowArrow = !!arrow;
  const [, token] = useToken();
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig("tooltip");
  const warning = devUseWarning();
  const tooltipRef = reactExports.useRef(null);
  const forceAlign = () => {
    var _a2;
    (_a2 = tooltipRef.current) === null || _a2 === void 0 ? void 0 : _a2.forceAlign();
  };
  reactExports.useImperativeHandle(ref, () => {
    var _a2, _b2;
    return {
      forceAlign,
      forcePopupAlign: () => {
        warning.deprecated(false, "forcePopupAlign", "forceAlign");
        forceAlign();
      },
      nativeElement: (_a2 = tooltipRef.current) === null || _a2 === void 0 ? void 0 : _a2.nativeElement,
      popupElement: (_b2 = tooltipRef.current) === null || _b2 === void 0 ? void 0 : _b2.popupElement
    };
  });
  const [open2, setOpen] = useMergedState(false, {
    value: (_a = props.open) !== null && _a !== void 0 ? _a : props.visible,
    defaultValue: (_b = props.defaultOpen) !== null && _b !== void 0 ? _b : props.defaultVisible
  });
  const noTitle = !title && !overlay && title !== 0;
  const onOpenChange = (vis) => {
    var _a2, _b2;
    setOpen(noTitle ? false : vis);
    if (!noTitle) {
      (_a2 = props.onOpenChange) === null || _a2 === void 0 ? void 0 : _a2.call(props, vis);
      (_b2 = props.onVisibleChange) === null || _b2 === void 0 ? void 0 : _b2.call(props, vis);
    }
  };
  const tooltipPlacements = reactExports.useMemo(() => {
    var _a2, _b2;
    let mergedArrowPointAtCenter = arrowPointAtCenter;
    if (typeof arrow === "object") {
      mergedArrowPointAtCenter = (_b2 = (_a2 = arrow.pointAtCenter) !== null && _a2 !== void 0 ? _a2 : arrow.arrowPointAtCenter) !== null && _b2 !== void 0 ? _b2 : arrowPointAtCenter;
    }
    return builtinPlacements || getPlacements({
      arrowPointAtCenter: mergedArrowPointAtCenter,
      autoAdjustOverflow,
      arrowWidth: mergedShowArrow ? token.sizePopupArrow : 0,
      borderRadius: token.borderRadius,
      offset: token.marginXXS,
      visibleFirst: true
    });
  }, [arrowPointAtCenter, arrow, builtinPlacements, token]);
  const memoOverlay = reactExports.useMemo(() => {
    if (title === 0) {
      return title;
    }
    return overlay || title || "";
  }, [overlay, title]);
  const memoOverlayWrapper = /* @__PURE__ */ reactExports.createElement(ContextIsolator, {
    space: true
  }, typeof memoOverlay === "function" ? memoOverlay() : memoOverlay);
  const prefixCls = getPrefixCls("tooltip", customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const injectFromPopover = props["data-popover-inject"];
  let tempOpen = open2;
  if (!("open" in props) && !("visible" in props) && noTitle) {
    tempOpen = false;
  }
  const child = /* @__PURE__ */ reactExports.isValidElement(children) && !isFragment(children) ? children : /* @__PURE__ */ reactExports.createElement("span", null, children);
  const childProps = child.props;
  const childCls = !childProps.className || typeof childProps.className === "string" ? classNames(childProps.className, openClassName || `${prefixCls}-open`) : childProps.className;
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$k(prefixCls, !injectFromPopover);
  const colorInfo = parseColor(prefixCls, color);
  const arrowContentStyle = colorInfo.arrowStyle;
  const rootClassNames = classNames(overlayClassName, {
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, colorInfo.className, rootClassName, hashId, cssVarCls, contextClassName, contextClassNames.root, tooltipClassNames === null || tooltipClassNames === void 0 ? void 0 : tooltipClassNames.root);
  const bodyClassNames = classNames(contextClassNames.body, tooltipClassNames === null || tooltipClassNames === void 0 ? void 0 : tooltipClassNames.body);
  const [zIndex, contextZIndex] = useZIndex("Tooltip", restProps.zIndex);
  const content = /* @__PURE__ */ reactExports.createElement(Tooltip$1, Object.assign({}, restProps, {
    zIndex,
    showArrow: mergedShowArrow,
    placement,
    mouseEnterDelay,
    mouseLeaveDelay,
    prefixCls,
    classNames: {
      root: rootClassNames,
      body: bodyClassNames
    },
    styles: {
      root: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, arrowContentStyle), contextStyles.root), contextStyle), overlayStyle), styles === null || styles === void 0 ? void 0 : styles.root),
      body: Object.assign(Object.assign(Object.assign(Object.assign({}, contextStyles.body), overlayInnerStyle), styles === null || styles === void 0 ? void 0 : styles.body), colorInfo.overlayStyle)
    },
    getTooltipContainer: getPopupContainer || getTooltipContainer || getContextPopupContainer,
    ref: tooltipRef,
    builtinPlacements: tooltipPlacements,
    overlay: memoOverlayWrapper,
    visible: tempOpen,
    onVisibleChange: onOpenChange,
    afterVisibleChange: afterOpenChange !== null && afterOpenChange !== void 0 ? afterOpenChange : afterVisibleChange,
    arrowContent: /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-arrow-content`
    }),
    motion: {
      motionName: getTransitionName(rootPrefixCls, "zoom-big-fast", props.transitionName),
      motionDeadline: 1e3
    },
    // TODO: In the future, destroyTooltipOnHide in rc-tooltip needs to be upgrade to destroyOnHidden
    destroyTooltipOnHide: destroyOnHidden !== null && destroyOnHidden !== void 0 ? destroyOnHidden : !!destroyTooltipOnHide
  }), tempOpen ? cloneElement(child, {
    className: childCls
  }) : child);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(zIndexContext.Provider, {
    value: contextZIndex
  }, content));
});
const Tooltip = InternalTooltip;
Tooltip._InternalPanelDoNotUseOrYouWillBeFired = PurePanel$4;
const isPrimitive = (value) => typeof value !== "object" && typeof value !== "function" || value === null;
const SiderContext = /* @__PURE__ */ reactExports.createContext({});
const MenuContext = /* @__PURE__ */ reactExports.createContext({
  prefixCls: "",
  firstLevel: true,
  inlineCollapsed: false
});
var __rest$J = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const MenuDivider = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    dashed
  } = props, restProps = __rest$J(props, ["prefixCls", "className", "dashed"]);
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("menu", customizePrefixCls);
  const classString = classNames({
    [`${prefixCls}-item-divider-dashed`]: !!dashed
  }, className);
  return /* @__PURE__ */ reactExports.createElement(Divider$1, Object.assign({
    className: classString
  }, restProps));
};
const MenuItem = (props) => {
  var _a;
  const {
    className,
    children,
    icon,
    title,
    danger,
    extra
  } = props;
  const {
    prefixCls,
    firstLevel,
    direction,
    disableMenuItemTitleTooltip,
    inlineCollapsed: isInlineCollapsed
  } = reactExports.useContext(MenuContext);
  const renderItemChildren = (inlineCollapsed) => {
    const label = children === null || children === void 0 ? void 0 : children[0];
    const wrapNode = /* @__PURE__ */ reactExports.createElement("span", {
      className: classNames(`${prefixCls}-title-content`, {
        [`${prefixCls}-title-content-with-extra`]: !!extra || extra === 0
      })
    }, children);
    if (!icon || /* @__PURE__ */ reactExports.isValidElement(children) && children.type === "span") {
      if (children && inlineCollapsed && firstLevel && typeof label === "string") {
        return /* @__PURE__ */ reactExports.createElement("div", {
          className: `${prefixCls}-inline-collapsed-noicon`
        }, label.charAt(0));
      }
    }
    return wrapNode;
  };
  const {
    siderCollapsed
  } = reactExports.useContext(SiderContext);
  let tooltipTitle = title;
  if (typeof title === "undefined") {
    tooltipTitle = firstLevel ? children : "";
  } else if (title === false) {
    tooltipTitle = "";
  }
  const tooltipProps = {
    title: tooltipTitle
  };
  if (!siderCollapsed && !isInlineCollapsed) {
    tooltipProps.title = null;
    tooltipProps.open = false;
  }
  const childrenLength = toArray$1(children).length;
  let returnNode = /* @__PURE__ */ reactExports.createElement(MenuItem$1, Object.assign({}, omit(props, ["title", "icon", "danger"]), {
    className: classNames({
      [`${prefixCls}-item-danger`]: danger,
      [`${prefixCls}-item-only-child`]: (icon ? childrenLength + 1 : childrenLength) === 1
    }, className),
    title: typeof title === "string" ? title : void 0
  }), cloneElement(icon, {
    className: classNames(/* @__PURE__ */ reactExports.isValidElement(icon) ? (_a = icon.props) === null || _a === void 0 ? void 0 : _a.className : void 0, `${prefixCls}-item-icon`)
  }), renderItemChildren(isInlineCollapsed));
  if (!disableMenuItemTitleTooltip) {
    returnNode = /* @__PURE__ */ reactExports.createElement(Tooltip, Object.assign({}, tooltipProps, {
      placement: direction === "rtl" ? "left" : "right",
      classNames: {
        root: `${prefixCls}-inline-collapsed-tooltip`
      }
    }), returnNode);
  }
  return returnNode;
};
var __rest$I = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const OverrideContext = /* @__PURE__ */ reactExports.createContext(null);
const OverrideProvider = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    children
  } = props, restProps = __rest$I(props, ["children"]);
  const override = reactExports.useContext(OverrideContext);
  const context = reactExports.useMemo(() => Object.assign(Object.assign({}, override), restProps), [
    override,
    restProps.prefixCls,
    // restProps.expandIcon, Not mark as deps since this is a ReactNode
    restProps.mode,
    restProps.selectable,
    restProps.rootClassName
    // restProps.validator, Not mark as deps since this is a function
  ]);
  const canRef = supportNodeRef(children);
  const mergedRef = useComposeRef(ref, canRef ? getNodeRef(children) : null);
  return /* @__PURE__ */ reactExports.createElement(OverrideContext.Provider, {
    value: context
  }, /* @__PURE__ */ reactExports.createElement(ContextIsolator, {
    space: true
  }, canRef ? /* @__PURE__ */ reactExports.cloneElement(children, {
    ref: mergedRef
  }) : children));
});
const getHorizontalStyle = (token) => {
  const {
    componentCls,
    motionDurationSlow,
    horizontalLineHeight,
    colorSplit,
    lineWidth,
    lineType,
    itemPaddingInline
  } = token;
  return {
    [`${componentCls}-horizontal`]: {
      lineHeight: horizontalLineHeight,
      border: 0,
      borderBottom: `${unit(lineWidth)} ${lineType} ${colorSplit}`,
      boxShadow: "none",
      "&::after": {
        display: "block",
        clear: "both",
        height: 0,
        content: '"\\20"'
      },
      // ======================= Item =======================
      [`${componentCls}-item, ${componentCls}-submenu`]: {
        position: "relative",
        display: "inline-block",
        verticalAlign: "bottom",
        paddingInline: itemPaddingInline
      },
      [`> ${componentCls}-item:hover,
        > ${componentCls}-item-active,
        > ${componentCls}-submenu ${componentCls}-submenu-title:hover`]: {
        backgroundColor: "transparent"
      },
      [`${componentCls}-item, ${componentCls}-submenu-title`]: {
        transition: [`border-color ${motionDurationSlow}`, `background ${motionDurationSlow}`].join(",")
      },
      // ===================== Sub Menu =====================
      [`${componentCls}-submenu-arrow`]: {
        display: "none"
      }
    }
  };
};
const getRTLStyle = ({
  componentCls,
  menuArrowOffset,
  calc
}) => ({
  [`${componentCls}-rtl`]: {
    direction: "rtl"
  },
  [`${componentCls}-submenu-rtl`]: {
    transformOrigin: "100% 0"
  },
  // Vertical Arrow
  [`${componentCls}-rtl${componentCls}-vertical,
    ${componentCls}-submenu-rtl ${componentCls}-vertical`]: {
    [`${componentCls}-submenu-arrow`]: {
      "&::before": {
        transform: `rotate(-45deg) translateY(${unit(calc(menuArrowOffset).mul(-1).equal())})`
      },
      "&::after": {
        transform: `rotate(45deg) translateY(${unit(menuArrowOffset)})`
      }
    }
  }
});
const accessibilityFocus = (token) => Object.assign({}, genFocusOutline(token));
const getThemeStyle = (token, themeSuffix) => {
  const {
    componentCls,
    itemColor,
    itemSelectedColor,
    subMenuItemSelectedColor,
    groupTitleColor,
    itemBg,
    subMenuItemBg,
    itemSelectedBg,
    activeBarHeight,
    activeBarWidth,
    activeBarBorderWidth,
    motionDurationSlow,
    motionEaseInOut,
    motionEaseOut,
    itemPaddingInline,
    motionDurationMid,
    itemHoverColor,
    lineType,
    colorSplit,
    // Disabled
    itemDisabledColor,
    // Danger
    dangerItemColor,
    dangerItemHoverColor,
    dangerItemSelectedColor,
    dangerItemActiveBg,
    dangerItemSelectedBg,
    // Bg
    popupBg,
    itemHoverBg,
    itemActiveBg,
    menuSubMenuBg,
    // Horizontal
    horizontalItemSelectedColor,
    horizontalItemSelectedBg,
    horizontalItemBorderRadius,
    horizontalItemHoverBg
  } = token;
  return {
    [`${componentCls}-${themeSuffix}, ${componentCls}-${themeSuffix} > ${componentCls}`]: {
      color: itemColor,
      background: itemBg,
      [`&${componentCls}-root:focus-visible`]: Object.assign({}, accessibilityFocus(token)),
      // ======================== Item ========================
      [`${componentCls}-item`]: {
        "&-group-title, &-extra": {
          color: groupTitleColor
        }
      },
      [`${componentCls}-submenu-selected > ${componentCls}-submenu-title`]: {
        color: subMenuItemSelectedColor
      },
      [`${componentCls}-item, ${componentCls}-submenu-title`]: {
        color: itemColor,
        [`&:not(${componentCls}-item-disabled):focus-visible`]: Object.assign({}, accessibilityFocus(token))
      },
      // Disabled
      [`${componentCls}-item-disabled, ${componentCls}-submenu-disabled`]: {
        color: `${itemDisabledColor} !important`
      },
      // Hover
      [`${componentCls}-item:not(${componentCls}-item-selected):not(${componentCls}-submenu-selected)`]: {
        [`&:hover, > ${componentCls}-submenu-title:hover`]: {
          color: itemHoverColor
        }
      },
      [`&:not(${componentCls}-horizontal)`]: {
        [`${componentCls}-item:not(${componentCls}-item-selected)`]: {
          "&:hover": {
            backgroundColor: itemHoverBg
          },
          "&:active": {
            backgroundColor: itemActiveBg
          }
        },
        [`${componentCls}-submenu-title`]: {
          "&:hover": {
            backgroundColor: itemHoverBg
          },
          "&:active": {
            backgroundColor: itemActiveBg
          }
        }
      },
      // Danger - only Item has
      [`${componentCls}-item-danger`]: {
        color: dangerItemColor,
        [`&${componentCls}-item:hover`]: {
          [`&:not(${componentCls}-item-selected):not(${componentCls}-submenu-selected)`]: {
            color: dangerItemHoverColor
          }
        },
        [`&${componentCls}-item:active`]: {
          background: dangerItemActiveBg
        }
      },
      [`${componentCls}-item a`]: {
        "&, &:hover": {
          color: "inherit"
        }
      },
      [`${componentCls}-item-selected`]: {
        color: itemSelectedColor,
        // Danger
        [`&${componentCls}-item-danger`]: {
          color: dangerItemSelectedColor
        },
        "a, a:hover": {
          color: "inherit"
        }
      },
      [`& ${componentCls}-item-selected`]: {
        backgroundColor: itemSelectedBg,
        // Danger
        [`&${componentCls}-item-danger`]: {
          backgroundColor: dangerItemSelectedBg
        }
      },
      [`&${componentCls}-submenu > ${componentCls}`]: {
        backgroundColor: menuSubMenuBg
      },
      // ===== 设置浮层的颜色 =======
      // ！dark 模式会被popupBg 会被rest 为 darkPopupBg
      [`&${componentCls}-popup > ${componentCls}`]: {
        backgroundColor: popupBg
      },
      [`&${componentCls}-submenu-popup > ${componentCls}`]: {
        backgroundColor: popupBg
      },
      // ===== 设置浮层的颜色 end =======
      // ====================== Horizontal ======================
      [`&${componentCls}-horizontal`]: Object.assign(Object.assign({}, themeSuffix === "dark" ? {
        borderBottom: 0
      } : {}), {
        [`> ${componentCls}-item, > ${componentCls}-submenu`]: {
          top: activeBarBorderWidth,
          marginTop: token.calc(activeBarBorderWidth).mul(-1).equal(),
          marginBottom: 0,
          borderRadius: horizontalItemBorderRadius,
          "&::after": {
            position: "absolute",
            insetInline: itemPaddingInline,
            bottom: 0,
            borderBottom: `${unit(activeBarHeight)} solid transparent`,
            transition: `border-color ${motionDurationSlow} ${motionEaseInOut}`,
            content: '""'
          },
          "&:hover, &-active, &-open": {
            background: horizontalItemHoverBg,
            "&::after": {
              borderBottomWidth: activeBarHeight,
              borderBottomColor: horizontalItemSelectedColor
            }
          },
          "&-selected": {
            color: horizontalItemSelectedColor,
            backgroundColor: horizontalItemSelectedBg,
            "&:hover": {
              backgroundColor: horizontalItemSelectedBg
            },
            "&::after": {
              borderBottomWidth: activeBarHeight,
              borderBottomColor: horizontalItemSelectedColor
            }
          }
        }
      }),
      // ================== Inline & Vertical ===================
      //
      [`&${componentCls}-root`]: {
        [`&${componentCls}-inline, &${componentCls}-vertical`]: {
          borderInlineEnd: `${unit(activeBarBorderWidth)} ${lineType} ${colorSplit}`
        }
      },
      // ======================== Inline ========================
      [`&${componentCls}-inline`]: {
        // Sub
        [`${componentCls}-sub${componentCls}-inline`]: {
          background: subMenuItemBg
        },
        [`${componentCls}-item`]: {
          position: "relative",
          "&::after": {
            position: "absolute",
            insetBlock: 0,
            insetInlineEnd: 0,
            borderInlineEnd: `${unit(activeBarWidth)} solid ${itemSelectedColor}`,
            transform: "scaleY(0.0001)",
            opacity: 0,
            transition: [`transform ${motionDurationMid} ${motionEaseOut}`, `opacity ${motionDurationMid} ${motionEaseOut}`].join(","),
            content: '""'
          },
          // Danger
          [`&${componentCls}-item-danger`]: {
            "&::after": {
              borderInlineEndColor: dangerItemSelectedColor
            }
          }
        },
        [`${componentCls}-selected, ${componentCls}-item-selected`]: {
          "&::after": {
            transform: "scaleY(1)",
            opacity: 1,
            transition: [`transform ${motionDurationMid} ${motionEaseInOut}`, `opacity ${motionDurationMid} ${motionEaseInOut}`].join(",")
          }
        }
      }
    }
  };
};
const getVerticalInlineStyle = (token) => {
  const {
    componentCls,
    itemHeight,
    itemMarginInline,
    padding,
    menuArrowSize,
    marginXS,
    itemMarginBlock,
    itemWidth,
    itemPaddingInline
  } = token;
  const paddingWithArrow = token.calc(menuArrowSize).add(padding).add(marginXS).equal();
  return {
    [`${componentCls}-item`]: {
      position: "relative",
      overflow: "hidden"
    },
    [`${componentCls}-item, ${componentCls}-submenu-title`]: {
      height: itemHeight,
      lineHeight: unit(itemHeight),
      paddingInline: itemPaddingInline,
      overflow: "hidden",
      textOverflow: "ellipsis",
      marginInline: itemMarginInline,
      marginBlock: itemMarginBlock,
      width: itemWidth
    },
    [`> ${componentCls}-item,
            > ${componentCls}-submenu > ${componentCls}-submenu-title`]: {
      height: itemHeight,
      lineHeight: unit(itemHeight)
    },
    [`${componentCls}-item-group-list ${componentCls}-submenu-title,
            ${componentCls}-submenu-title`]: {
      paddingInlineEnd: paddingWithArrow
    }
  };
};
const getVerticalStyle = (token) => {
  const {
    componentCls,
    iconCls,
    itemHeight,
    colorTextLightSolid,
    dropdownWidth,
    controlHeightLG,
    motionEaseOut,
    paddingXL,
    itemMarginInline,
    fontSizeLG,
    motionDurationFast,
    motionDurationSlow,
    paddingXS,
    boxShadowSecondary,
    collapsedWidth,
    collapsedIconSize
  } = token;
  const inlineItemStyle = {
    height: itemHeight,
    lineHeight: unit(itemHeight),
    listStylePosition: "inside",
    listStyleType: "disc"
  };
  return [
    {
      [componentCls]: {
        "&-inline, &-vertical": Object.assign({
          [`&${componentCls}-root`]: {
            boxShadow: "none"
          }
        }, getVerticalInlineStyle(token))
      },
      [`${componentCls}-submenu-popup`]: {
        [`${componentCls}-vertical`]: Object.assign(Object.assign({}, getVerticalInlineStyle(token)), {
          boxShadow: boxShadowSecondary
        })
      }
    },
    // Vertical only
    {
      [`${componentCls}-submenu-popup ${componentCls}-vertical${componentCls}-sub`]: {
        minWidth: dropdownWidth,
        maxHeight: `calc(100vh - ${unit(token.calc(controlHeightLG).mul(2.5).equal())})`,
        padding: "0",
        overflow: "hidden",
        borderInlineEnd: 0,
        // https://github.com/ant-design/ant-design/issues/22244
        // https://github.com/ant-design/ant-design/issues/26812
        "&:not([class*='-active'])": {
          overflowX: "hidden",
          overflowY: "auto"
        }
      }
    },
    // Inline Only
    {
      [`${componentCls}-inline`]: {
        width: "100%",
        // Motion enhance for first level
        [`&${componentCls}-root`]: {
          [`${componentCls}-item, ${componentCls}-submenu-title`]: {
            display: "flex",
            alignItems: "center",
            transition: [`border-color ${motionDurationSlow}`, `background ${motionDurationSlow}`, `padding ${motionDurationFast} ${motionEaseOut}`].join(","),
            [`> ${componentCls}-title-content`]: {
              flex: "auto",
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis"
            },
            "> *": {
              flex: "none"
            }
          }
        },
        // >>>>> Sub
        [`${componentCls}-sub${componentCls}-inline`]: {
          padding: 0,
          border: 0,
          borderRadius: 0,
          boxShadow: "none",
          [`& > ${componentCls}-submenu > ${componentCls}-submenu-title`]: inlineItemStyle,
          [`& ${componentCls}-item-group-title`]: {
            paddingInlineStart: paddingXL
          }
        },
        // >>>>> Item
        [`${componentCls}-item`]: inlineItemStyle
      }
    },
    // Inline Collapse Only
    {
      [`${componentCls}-inline-collapsed`]: {
        width: collapsedWidth,
        [`&${componentCls}-root`]: {
          [`${componentCls}-item, ${componentCls}-submenu ${componentCls}-submenu-title`]: {
            [`> ${componentCls}-inline-collapsed-noicon`]: {
              fontSize: fontSizeLG,
              textAlign: "center"
            }
          }
        },
        [`> ${componentCls}-item,
          > ${componentCls}-item-group > ${componentCls}-item-group-list > ${componentCls}-item,
          > ${componentCls}-item-group > ${componentCls}-item-group-list > ${componentCls}-submenu > ${componentCls}-submenu-title,
          > ${componentCls}-submenu > ${componentCls}-submenu-title`]: {
          insetInlineStart: 0,
          paddingInline: `calc(50% - ${unit(token.calc(collapsedIconSize).div(2).equal())} - ${unit(itemMarginInline)})`,
          textOverflow: "clip",
          [`
            ${componentCls}-submenu-arrow,
            ${componentCls}-submenu-expand-icon
          `]: {
            opacity: 0
          },
          [`${componentCls}-item-icon, ${iconCls}`]: {
            margin: 0,
            fontSize: collapsedIconSize,
            lineHeight: unit(itemHeight),
            "+ span": {
              display: "inline-block",
              opacity: 0
            }
          }
        },
        [`${componentCls}-item-icon, ${iconCls}`]: {
          display: "inline-block"
        },
        "&-tooltip": {
          pointerEvents: "none",
          [`${componentCls}-item-icon, ${iconCls}`]: {
            display: "none"
          },
          "a, a:hover": {
            color: colorTextLightSolid
          }
        },
        [`${componentCls}-item-group-title`]: Object.assign(Object.assign({}, textEllipsis), {
          paddingInline: paddingXS
        })
      }
    }
  ];
};
const genMenuItemStyle = (token) => {
  const {
    componentCls,
    motionDurationSlow,
    motionDurationMid,
    motionEaseInOut,
    motionEaseOut,
    iconCls,
    iconSize,
    iconMarginInlineEnd
  } = token;
  return {
    // >>>>> Item
    [`${componentCls}-item, ${componentCls}-submenu-title`]: {
      position: "relative",
      display: "block",
      margin: 0,
      whiteSpace: "nowrap",
      cursor: "pointer",
      transition: [`border-color ${motionDurationSlow}`, `background ${motionDurationSlow}`, `padding calc(${motionDurationSlow} + 0.1s) ${motionEaseInOut}`].join(","),
      [`${componentCls}-item-icon, ${iconCls}`]: {
        minWidth: iconSize,
        fontSize: iconSize,
        transition: [`font-size ${motionDurationMid} ${motionEaseOut}`, `margin ${motionDurationSlow} ${motionEaseInOut}`, `color ${motionDurationSlow}`].join(","),
        "+ span": {
          marginInlineStart: iconMarginInlineEnd,
          opacity: 1,
          transition: [`opacity ${motionDurationSlow} ${motionEaseInOut}`, `margin ${motionDurationSlow}`, `color ${motionDurationSlow}`].join(",")
        }
      },
      [`${componentCls}-item-icon`]: Object.assign({}, resetIcon()),
      [`&${componentCls}-item-only-child`]: {
        [`> ${iconCls}, > ${componentCls}-item-icon`]: {
          marginInlineEnd: 0
        }
      }
    },
    // Disabled state sets text to gray and nukes hover/tab effects
    [`${componentCls}-item-disabled, ${componentCls}-submenu-disabled`]: {
      background: "none !important",
      cursor: "not-allowed",
      "&::after": {
        borderColor: "transparent !important"
      },
      a: {
        color: "inherit !important",
        cursor: "not-allowed",
        pointerEvents: "none"
      },
      [`> ${componentCls}-submenu-title`]: {
        color: "inherit !important",
        cursor: "not-allowed"
      }
    }
  };
};
const genSubMenuArrowStyle = (token) => {
  const {
    componentCls,
    motionDurationSlow,
    motionEaseInOut,
    borderRadius,
    menuArrowSize,
    menuArrowOffset
  } = token;
  return {
    [`${componentCls}-submenu`]: {
      "&-expand-icon, &-arrow": {
        position: "absolute",
        top: "50%",
        insetInlineEnd: token.margin,
        width: menuArrowSize,
        color: "currentcolor",
        transform: "translateY(-50%)",
        transition: `transform ${motionDurationSlow} ${motionEaseInOut}, opacity ${motionDurationSlow}`
      },
      "&-arrow": {
        // →
        "&::before, &::after": {
          position: "absolute",
          width: token.calc(menuArrowSize).mul(0.6).equal(),
          height: token.calc(menuArrowSize).mul(0.15).equal(),
          backgroundColor: "currentcolor",
          borderRadius,
          transition: [`background ${motionDurationSlow} ${motionEaseInOut}`, `transform ${motionDurationSlow} ${motionEaseInOut}`, `top ${motionDurationSlow} ${motionEaseInOut}`, `color ${motionDurationSlow} ${motionEaseInOut}`].join(","),
          content: '""'
        },
        "&::before": {
          transform: `rotate(45deg) translateY(${unit(token.calc(menuArrowOffset).mul(-1).equal())})`
        },
        "&::after": {
          transform: `rotate(-45deg) translateY(${unit(menuArrowOffset)})`
        }
      }
    }
  };
};
const getBaseStyle = (token) => {
  const {
    antCls,
    componentCls,
    fontSize,
    motionDurationSlow,
    motionDurationMid,
    motionEaseInOut,
    paddingXS,
    padding,
    colorSplit,
    lineWidth,
    zIndexPopup,
    borderRadiusLG,
    subMenuItemBorderRadius,
    menuArrowSize,
    menuArrowOffset,
    lineType,
    groupTitleLineHeight,
    groupTitleFontSize
  } = token;
  return [
    // Misc
    {
      "": {
        [componentCls]: Object.assign(Object.assign({}, clearFix()), {
          // Hidden
          "&-hidden": {
            display: "none"
          }
        })
      },
      [`${componentCls}-submenu-hidden`]: {
        display: "none"
      }
    },
    {
      [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), clearFix()), {
        marginBottom: 0,
        paddingInlineStart: 0,
        // Override default ul/ol
        fontSize,
        lineHeight: 0,
        listStyle: "none",
        outline: "none",
        // Magic cubic here but smooth transition
        transition: `width ${motionDurationSlow} cubic-bezier(0.2, 0, 0, 1) 0s`,
        "ul, ol": {
          margin: 0,
          padding: 0,
          listStyle: "none"
        },
        // Overflow ellipsis
        "&-overflow": {
          display: "flex",
          [`${componentCls}-item`]: {
            flex: "none"
          }
        },
        [`${componentCls}-item, ${componentCls}-submenu, ${componentCls}-submenu-title`]: {
          borderRadius: token.itemBorderRadius
        },
        [`${componentCls}-item-group-title`]: {
          padding: `${unit(paddingXS)} ${unit(padding)}`,
          fontSize: groupTitleFontSize,
          lineHeight: groupTitleLineHeight,
          transition: `all ${motionDurationSlow}`
        },
        [`&-horizontal ${componentCls}-submenu`]: {
          transition: [`border-color ${motionDurationSlow} ${motionEaseInOut}`, `background ${motionDurationSlow} ${motionEaseInOut}`].join(",")
        },
        [`${componentCls}-submenu, ${componentCls}-submenu-inline`]: {
          transition: [`border-color ${motionDurationSlow} ${motionEaseInOut}`, `background ${motionDurationSlow} ${motionEaseInOut}`, `padding ${motionDurationMid} ${motionEaseInOut}`].join(",")
        },
        [`${componentCls}-submenu ${componentCls}-sub`]: {
          cursor: "initial",
          transition: [`background ${motionDurationSlow} ${motionEaseInOut}`, `padding ${motionDurationSlow} ${motionEaseInOut}`].join(",")
        },
        [`${componentCls}-title-content`]: {
          transition: `color ${motionDurationSlow}`,
          "&-with-extra": {
            display: "inline-flex",
            alignItems: "center",
            width: "100%"
          },
          // https://github.com/ant-design/ant-design/issues/41143
          [`> ${antCls}-typography-ellipsis-single-line`]: {
            display: "inline",
            verticalAlign: "unset"
          },
          [`${componentCls}-item-extra`]: {
            marginInlineStart: "auto",
            paddingInlineStart: token.padding
          }
        },
        [`${componentCls}-item a`]: {
          "&::before": {
            position: "absolute",
            inset: 0,
            backgroundColor: "transparent",
            content: '""'
          }
        },
        // Removed a Badge related style seems it's safe
        // https://github.com/ant-design/ant-design/issues/19809
        // >>>>> Divider
        [`${componentCls}-item-divider`]: {
          overflow: "hidden",
          lineHeight: 0,
          borderColor: colorSplit,
          borderStyle: lineType,
          borderWidth: 0,
          borderTopWidth: lineWidth,
          marginBlock: lineWidth,
          padding: 0,
          "&-dashed": {
            borderStyle: "dashed"
          }
        }
      }), genMenuItemStyle(token)), {
        [`${componentCls}-item-group`]: {
          [`${componentCls}-item-group-list`]: {
            margin: 0,
            padding: 0,
            [`${componentCls}-item, ${componentCls}-submenu-title`]: {
              paddingInline: `${unit(token.calc(fontSize).mul(2).equal())} ${unit(padding)}`
            }
          }
        },
        // ======================= Sub Menu =======================
        "&-submenu": {
          "&-popup": {
            position: "absolute",
            zIndex: zIndexPopup,
            borderRadius: borderRadiusLG,
            boxShadow: "none",
            transformOrigin: "0 0",
            [`&${componentCls}-submenu`]: {
              background: "transparent"
            },
            // https://github.com/ant-design/ant-design/issues/13955
            "&::before": {
              position: "absolute",
              inset: 0,
              zIndex: -1,
              width: "100%",
              height: "100%",
              opacity: 0,
              content: '""'
            },
            [`> ${componentCls}`]: Object.assign(Object.assign(Object.assign({
              borderRadius: borderRadiusLG
            }, genMenuItemStyle(token)), genSubMenuArrowStyle(token)), {
              [`${componentCls}-item, ${componentCls}-submenu > ${componentCls}-submenu-title`]: {
                borderRadius: subMenuItemBorderRadius
              },
              [`${componentCls}-submenu-title::after`]: {
                transition: `transform ${motionDurationSlow} ${motionEaseInOut}`
              }
            })
          },
          [`
          &-placement-leftTop,
          &-placement-bottomRight,
          `]: {
            transformOrigin: "100% 0"
          },
          [`
          &-placement-leftBottom,
          &-placement-topRight,
          `]: {
            transformOrigin: "100% 100%"
          },
          [`
          &-placement-rightBottom,
          &-placement-topLeft,
          `]: {
            transformOrigin: "0 100%"
          },
          [`
          &-placement-bottomLeft,
          &-placement-rightTop,
          `]: {
            transformOrigin: "0 0"
          },
          [`
          &-placement-leftTop,
          &-placement-leftBottom
          `]: {
            paddingInlineEnd: token.paddingXS
          },
          [`
          &-placement-rightTop,
          &-placement-rightBottom
          `]: {
            paddingInlineStart: token.paddingXS
          },
          [`
          &-placement-topRight,
          &-placement-topLeft
          `]: {
            paddingBottom: token.paddingXS
          },
          [`
          &-placement-bottomRight,
          &-placement-bottomLeft
          `]: {
            paddingTop: token.paddingXS
          }
        }
      }), genSubMenuArrowStyle(token)), {
        [`&-inline-collapsed ${componentCls}-submenu-arrow,
        &-inline ${componentCls}-submenu-arrow`]: {
          // ↓
          "&::before": {
            transform: `rotate(-45deg) translateX(${unit(menuArrowOffset)})`
          },
          "&::after": {
            transform: `rotate(45deg) translateX(${unit(token.calc(menuArrowOffset).mul(-1).equal())})`
          }
        },
        [`${componentCls}-submenu-open${componentCls}-submenu-inline > ${componentCls}-submenu-title > ${componentCls}-submenu-arrow`]: {
          // ↑
          transform: `translateY(${unit(token.calc(menuArrowSize).mul(0.2).mul(-1).equal())})`,
          "&::after": {
            transform: `rotate(-45deg) translateX(${unit(token.calc(menuArrowOffset).mul(-1).equal())})`
          },
          "&::before": {
            transform: `rotate(45deg) translateX(${unit(menuArrowOffset)})`
          }
        }
      })
    },
    // Integration with header element so menu items have the same height
    {
      [`${antCls}-layout-header`]: {
        [componentCls]: {
          lineHeight: "inherit"
        }
      }
    }
  ];
};
const prepareComponentToken$f = (token) => {
  var _a, _b, _c;
  const {
    colorPrimary,
    colorError,
    colorTextDisabled,
    colorErrorBg,
    colorText,
    colorTextDescription,
    colorBgContainer,
    colorFillAlter,
    colorFillContent,
    lineWidth,
    lineWidthBold,
    controlItemBgActive,
    colorBgTextHover,
    controlHeightLG,
    lineHeight,
    colorBgElevated,
    marginXXS,
    padding,
    fontSize,
    controlHeightSM,
    fontSizeLG,
    colorTextLightSolid,
    colorErrorHover
  } = token;
  const activeBarWidth = (_a = token.activeBarWidth) !== null && _a !== void 0 ? _a : 0;
  const activeBarBorderWidth = (_b = token.activeBarBorderWidth) !== null && _b !== void 0 ? _b : lineWidth;
  const itemMarginInline = (_c = token.itemMarginInline) !== null && _c !== void 0 ? _c : token.marginXXS;
  const colorTextDark = new FastColor(colorTextLightSolid).setA(0.65).toRgbString();
  return {
    dropdownWidth: 160,
    zIndexPopup: token.zIndexPopupBase + 50,
    radiusItem: token.borderRadiusLG,
    itemBorderRadius: token.borderRadiusLG,
    radiusSubMenuItem: token.borderRadiusSM,
    subMenuItemBorderRadius: token.borderRadiusSM,
    colorItemText: colorText,
    itemColor: colorText,
    colorItemTextHover: colorText,
    itemHoverColor: colorText,
    colorItemTextHoverHorizontal: colorPrimary,
    horizontalItemHoverColor: colorPrimary,
    colorGroupTitle: colorTextDescription,
    groupTitleColor: colorTextDescription,
    colorItemTextSelected: colorPrimary,
    itemSelectedColor: colorPrimary,
    subMenuItemSelectedColor: colorPrimary,
    colorItemTextSelectedHorizontal: colorPrimary,
    horizontalItemSelectedColor: colorPrimary,
    colorItemBg: colorBgContainer,
    itemBg: colorBgContainer,
    colorItemBgHover: colorBgTextHover,
    itemHoverBg: colorBgTextHover,
    colorItemBgActive: colorFillContent,
    itemActiveBg: controlItemBgActive,
    colorSubItemBg: colorFillAlter,
    subMenuItemBg: colorFillAlter,
    colorItemBgSelected: controlItemBgActive,
    itemSelectedBg: controlItemBgActive,
    colorItemBgSelectedHorizontal: "transparent",
    horizontalItemSelectedBg: "transparent",
    colorActiveBarWidth: 0,
    activeBarWidth,
    colorActiveBarHeight: lineWidthBold,
    activeBarHeight: lineWidthBold,
    colorActiveBarBorderSize: lineWidth,
    activeBarBorderWidth,
    // Disabled
    colorItemTextDisabled: colorTextDisabled,
    itemDisabledColor: colorTextDisabled,
    // Danger
    colorDangerItemText: colorError,
    dangerItemColor: colorError,
    colorDangerItemTextHover: colorError,
    dangerItemHoverColor: colorError,
    colorDangerItemTextSelected: colorError,
    dangerItemSelectedColor: colorError,
    colorDangerItemBgActive: colorErrorBg,
    dangerItemActiveBg: colorErrorBg,
    colorDangerItemBgSelected: colorErrorBg,
    dangerItemSelectedBg: colorErrorBg,
    itemMarginInline,
    horizontalItemBorderRadius: 0,
    horizontalItemHoverBg: "transparent",
    itemHeight: controlHeightLG,
    groupTitleLineHeight: lineHeight,
    collapsedWidth: controlHeightLG * 2,
    popupBg: colorBgElevated,
    itemMarginBlock: marginXXS,
    itemPaddingInline: padding,
    horizontalLineHeight: `${controlHeightLG * 1.15}px`,
    iconSize: fontSize,
    iconMarginInlineEnd: controlHeightSM - fontSize,
    collapsedIconSize: fontSizeLG,
    groupTitleFontSize: fontSize,
    // Disabled
    darkItemDisabledColor: new FastColor(colorTextLightSolid).setA(0.25).toRgbString(),
    // Dark
    darkItemColor: colorTextDark,
    darkDangerItemColor: colorError,
    darkItemBg: "#001529",
    darkPopupBg: "#001529",
    darkSubMenuItemBg: "#000c17",
    darkItemSelectedColor: colorTextLightSolid,
    darkItemSelectedBg: colorPrimary,
    darkDangerItemSelectedBg: colorError,
    darkItemHoverBg: "transparent",
    darkGroupTitleColor: colorTextDark,
    darkItemHoverColor: colorTextLightSolid,
    darkDangerItemHoverColor: colorErrorHover,
    darkDangerItemSelectedColor: colorTextLightSolid,
    darkDangerItemActiveBg: colorError,
    // internal
    itemWidth: activeBarWidth ? `calc(100% + ${activeBarBorderWidth}px)` : `calc(100% - ${itemMarginInline * 2}px)`
  };
};
const useStyle$j = (prefixCls, rootCls = prefixCls, injectStyle = true) => {
  const useStyle2 = genStyleHooks("Menu", (token) => {
    const {
      colorBgElevated,
      controlHeightLG,
      fontSize,
      darkItemColor,
      darkDangerItemColor,
      darkItemBg,
      darkSubMenuItemBg,
      darkItemSelectedColor,
      darkItemSelectedBg,
      darkDangerItemSelectedBg,
      darkItemHoverBg,
      darkGroupTitleColor,
      darkItemHoverColor,
      darkItemDisabledColor,
      darkDangerItemHoverColor,
      darkDangerItemSelectedColor,
      darkDangerItemActiveBg,
      popupBg,
      darkPopupBg
    } = token;
    const menuArrowSize = token.calc(fontSize).div(7).mul(5).equal();
    const menuToken = merge$1(token, {
      menuArrowSize,
      menuHorizontalHeight: token.calc(controlHeightLG).mul(1.15).equal(),
      menuArrowOffset: token.calc(menuArrowSize).mul(0.25).equal(),
      menuSubMenuBg: colorBgElevated,
      calc: token.calc,
      popupBg
    });
    const menuDarkToken = merge$1(menuToken, {
      itemColor: darkItemColor,
      itemHoverColor: darkItemHoverColor,
      groupTitleColor: darkGroupTitleColor,
      itemSelectedColor: darkItemSelectedColor,
      subMenuItemSelectedColor: darkItemSelectedColor,
      itemBg: darkItemBg,
      popupBg: darkPopupBg,
      subMenuItemBg: darkSubMenuItemBg,
      itemActiveBg: "transparent",
      itemSelectedBg: darkItemSelectedBg,
      activeBarHeight: 0,
      activeBarBorderWidth: 0,
      itemHoverBg: darkItemHoverBg,
      // Disabled
      itemDisabledColor: darkItemDisabledColor,
      // Danger
      dangerItemColor: darkDangerItemColor,
      dangerItemHoverColor: darkDangerItemHoverColor,
      dangerItemSelectedColor: darkDangerItemSelectedColor,
      dangerItemActiveBg: darkDangerItemActiveBg,
      dangerItemSelectedBg: darkDangerItemSelectedBg,
      menuSubMenuBg: darkSubMenuItemBg,
      // Horizontal
      horizontalItemSelectedColor: darkItemSelectedColor,
      horizontalItemSelectedBg: darkItemSelectedBg
    });
    return [
      // Basic
      getBaseStyle(menuToken),
      // Horizontal
      getHorizontalStyle(menuToken),
      // Hard code for some light style
      // Vertical
      getVerticalStyle(menuToken),
      // Hard code for some light style
      // Theme
      getThemeStyle(menuToken, "light"),
      getThemeStyle(menuDarkToken, "dark"),
      // RTL
      getRTLStyle(menuToken),
      // Motion
      genCollapseMotion(menuToken),
      initSlideMotion(menuToken, "slide-up"),
      initSlideMotion(menuToken, "slide-down"),
      initZoomMotion(menuToken, "zoom-big")
    ];
  }, prepareComponentToken$f, {
    deprecatedTokens: [["colorGroupTitle", "groupTitleColor"], ["radiusItem", "itemBorderRadius"], ["radiusSubMenuItem", "subMenuItemBorderRadius"], ["colorItemText", "itemColor"], ["colorItemTextHover", "itemHoverColor"], ["colorItemTextHoverHorizontal", "horizontalItemHoverColor"], ["colorItemTextSelected", "itemSelectedColor"], ["colorItemTextSelectedHorizontal", "horizontalItemSelectedColor"], ["colorItemTextDisabled", "itemDisabledColor"], ["colorDangerItemText", "dangerItemColor"], ["colorDangerItemTextHover", "dangerItemHoverColor"], ["colorDangerItemTextSelected", "dangerItemSelectedColor"], ["colorDangerItemBgActive", "dangerItemActiveBg"], ["colorDangerItemBgSelected", "dangerItemSelectedBg"], ["colorItemBg", "itemBg"], ["colorItemBgHover", "itemHoverBg"], ["colorSubItemBg", "subMenuItemBg"], ["colorItemBgActive", "itemActiveBg"], ["colorItemBgSelectedHorizontal", "horizontalItemSelectedBg"], ["colorActiveBarWidth", "activeBarWidth"], ["colorActiveBarHeight", "activeBarHeight"], ["colorActiveBarBorderSize", "activeBarBorderWidth"], ["colorItemBgSelected", "itemSelectedBg"]],
    // Dropdown will handle menu style self. We do not need to handle this.
    injectStyle,
    unitless: {
      groupTitleLineHeight: true
    }
  });
  return useStyle2(prefixCls, rootCls);
};
const SubMenu = (props) => {
  var _a;
  const {
    popupClassName,
    icon,
    title,
    theme: customTheme
  } = props;
  const context = reactExports.useContext(MenuContext);
  const {
    prefixCls,
    inlineCollapsed,
    theme: contextTheme
  } = context;
  const parentPath = useFullPath();
  let titleNode;
  if (!icon) {
    titleNode = inlineCollapsed && !parentPath.length && title && typeof title === "string" ? /* @__PURE__ */ reactExports.createElement("div", {
      className: `${prefixCls}-inline-collapsed-noicon`
    }, title.charAt(0)) : /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-title-content`
    }, title);
  } else {
    const titleIsSpan = /* @__PURE__ */ reactExports.isValidElement(title) && title.type === "span";
    titleNode = /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, cloneElement(icon, {
      className: classNames(/* @__PURE__ */ reactExports.isValidElement(icon) ? (_a = icon.props) === null || _a === void 0 ? void 0 : _a.className : void 0, `${prefixCls}-item-icon`)
    }), titleIsSpan ? title : /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-title-content`
    }, title));
  }
  const contextValue = reactExports.useMemo(() => Object.assign(Object.assign({}, context), {
    firstLevel: false
  }), [context]);
  const [zIndex] = useZIndex("Menu");
  return /* @__PURE__ */ reactExports.createElement(MenuContext.Provider, {
    value: contextValue
  }, /* @__PURE__ */ reactExports.createElement(SubMenu$1, Object.assign({}, omit(props, ["icon"]), {
    title: titleNode,
    popupClassName: classNames(prefixCls, popupClassName, `${prefixCls}-${customTheme || contextTheme}`),
    popupStyle: Object.assign({
      zIndex
    }, props.popupStyle)
  })));
};
var __rest$H = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function isEmptyIcon(icon) {
  return icon === null || icon === false;
}
const MENU_COMPONENTS = {
  item: MenuItem,
  submenu: SubMenu,
  divider: MenuDivider
};
const InternalMenu = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  var _a;
  const override = reactExports.useContext(OverrideContext);
  const overrideObj = override || {};
  const {
    getPrefixCls,
    getPopupContainer,
    direction,
    menu
  } = reactExports.useContext(ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    theme = "light",
    expandIcon,
    _internalDisableMenuItemTitleTooltip,
    inlineCollapsed,
    siderCollapsed,
    rootClassName,
    mode,
    selectable,
    onClick,
    overflowedIndicatorPopupClassName
  } = props, restProps = __rest$H(props, ["prefixCls", "className", "style", "theme", "expandIcon", "_internalDisableMenuItemTitleTooltip", "inlineCollapsed", "siderCollapsed", "rootClassName", "mode", "selectable", "onClick", "overflowedIndicatorPopupClassName"]);
  const passedProps = omit(restProps, ["collapsedWidth"]);
  (_a = overrideObj.validator) === null || _a === void 0 ? void 0 : _a.call(overrideObj, {
    mode
  });
  const onItemClick = useEvent((...args) => {
    var _a2;
    onClick === null || onClick === void 0 ? void 0 : onClick.apply(void 0, args);
    (_a2 = overrideObj.onClick) === null || _a2 === void 0 ? void 0 : _a2.call(overrideObj);
  });
  const mergedMode = overrideObj.mode || mode;
  const mergedSelectable = selectable !== null && selectable !== void 0 ? selectable : overrideObj.selectable;
  const mergedInlineCollapsed = inlineCollapsed !== null && inlineCollapsed !== void 0 ? inlineCollapsed : siderCollapsed;
  const defaultMotions = {
    horizontal: {
      motionName: `${rootPrefixCls}-slide-up`
    },
    inline: initCollapseMotion(rootPrefixCls),
    other: {
      motionName: `${rootPrefixCls}-zoom-big`
    }
  };
  const prefixCls = getPrefixCls("menu", customizePrefixCls || overrideObj.prefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$j(prefixCls, rootCls, !override);
  const menuClassName = classNames(`${prefixCls}-${theme}`, menu === null || menu === void 0 ? void 0 : menu.className, className);
  const mergedExpandIcon = reactExports.useMemo(() => {
    var _a2, _b;
    if (typeof expandIcon === "function" || isEmptyIcon(expandIcon)) {
      return expandIcon || null;
    }
    if (typeof overrideObj.expandIcon === "function" || isEmptyIcon(overrideObj.expandIcon)) {
      return overrideObj.expandIcon || null;
    }
    if (typeof (menu === null || menu === void 0 ? void 0 : menu.expandIcon) === "function" || isEmptyIcon(menu === null || menu === void 0 ? void 0 : menu.expandIcon)) {
      return (menu === null || menu === void 0 ? void 0 : menu.expandIcon) || null;
    }
    const mergedIcon = (_a2 = expandIcon !== null && expandIcon !== void 0 ? expandIcon : overrideObj === null || overrideObj === void 0 ? void 0 : overrideObj.expandIcon) !== null && _a2 !== void 0 ? _a2 : menu === null || menu === void 0 ? void 0 : menu.expandIcon;
    return cloneElement(mergedIcon, {
      className: classNames(`${prefixCls}-submenu-expand-icon`, /* @__PURE__ */ reactExports.isValidElement(mergedIcon) ? (_b = mergedIcon.props) === null || _b === void 0 ? void 0 : _b.className : void 0)
    });
  }, [expandIcon, overrideObj === null || overrideObj === void 0 ? void 0 : overrideObj.expandIcon, menu === null || menu === void 0 ? void 0 : menu.expandIcon, prefixCls]);
  const contextValue = reactExports.useMemo(() => ({
    prefixCls,
    inlineCollapsed: mergedInlineCollapsed || false,
    direction,
    firstLevel: true,
    theme,
    mode: mergedMode,
    disableMenuItemTitleTooltip: _internalDisableMenuItemTitleTooltip
  }), [prefixCls, mergedInlineCollapsed, direction, _internalDisableMenuItemTitleTooltip, theme]);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(OverrideContext.Provider, {
    value: null
  }, /* @__PURE__ */ reactExports.createElement(MenuContext.Provider, {
    value: contextValue
  }, /* @__PURE__ */ reactExports.createElement(ExportMenu, Object.assign({
    getPopupContainer,
    overflowedIndicator: /* @__PURE__ */ reactExports.createElement(RefIcon$a, null),
    overflowedIndicatorPopupClassName: classNames(prefixCls, `${prefixCls}-${theme}`, overflowedIndicatorPopupClassName),
    mode: mergedMode,
    selectable: mergedSelectable,
    onClick: onItemClick
  }, passedProps, {
    inlineCollapsed: mergedInlineCollapsed,
    style: Object.assign(Object.assign({}, menu === null || menu === void 0 ? void 0 : menu.style), style),
    className: menuClassName,
    prefixCls,
    direction,
    defaultMotions,
    expandIcon: mergedExpandIcon,
    ref,
    rootClassName: classNames(rootClassName, hashId, overrideObj.rootClassName, cssVarCls, rootCls),
    _internalComponents: MENU_COMPONENTS
  })))));
});
const Menu = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const menuRef = reactExports.useRef(null);
  const context = reactExports.useContext(SiderContext);
  reactExports.useImperativeHandle(ref, () => ({
    menu: menuRef.current,
    focus: (options) => {
      var _a;
      (_a = menuRef.current) === null || _a === void 0 ? void 0 : _a.focus(options);
    }
  }));
  return /* @__PURE__ */ reactExports.createElement(InternalMenu, Object.assign({
    ref: menuRef
  }, props, context));
});
Menu.Item = MenuItem;
Menu.SubMenu = SubMenu;
Menu.Divider = MenuDivider;
Menu.ItemGroup = MenuItemGroup;
const genStatusStyle = (token) => {
  const {
    componentCls,
    menuCls,
    colorError,
    colorTextLightSolid
  } = token;
  const itemCls = `${menuCls}-item`;
  return {
    [`${componentCls}, ${componentCls}-menu-submenu`]: {
      [`${menuCls} ${itemCls}`]: {
        [`&${itemCls}-danger:not(${itemCls}-disabled)`]: {
          color: colorError,
          "&:hover": {
            color: colorTextLightSolid,
            backgroundColor: colorError
          }
        }
      }
    }
  };
};
const genBaseStyle$2 = (token) => {
  const {
    componentCls,
    menuCls,
    zIndexPopup,
    dropdownArrowDistance,
    sizePopupArrow,
    antCls,
    iconCls,
    motionDurationMid,
    paddingBlock,
    fontSize,
    dropdownEdgeChildPadding,
    colorTextDisabled,
    fontSizeIcon,
    controlPaddingHorizontal,
    colorBgElevated
  } = token;
  return [
    {
      [componentCls]: {
        position: "absolute",
        top: -9999,
        left: {
          _skip_check_: true,
          value: -9999
        },
        zIndex: zIndexPopup,
        display: "block",
        // A placeholder out of dropdown visible range to avoid close when user moving
        "&::before": {
          position: "absolute",
          insetBlock: token.calc(sizePopupArrow).div(2).sub(dropdownArrowDistance).equal(),
          // insetInlineStart: -7, // FIXME: Seems not work for hidden element
          zIndex: -9999,
          opacity: 1e-4,
          content: '""'
        },
        // Makes vertical dropdowns have a scrollbar once they become taller than the viewport.
        "&-menu-vertical": {
          maxHeight: "100vh",
          overflowY: "auto"
        },
        [`&-trigger${antCls}-btn`]: {
          [`& > ${iconCls}-down, & > ${antCls}-btn-icon > ${iconCls}-down`]: {
            fontSize: fontSizeIcon
          }
        },
        [`${componentCls}-wrap`]: {
          position: "relative",
          [`${antCls}-btn > ${iconCls}-down`]: {
            fontSize: fontSizeIcon
          },
          [`${iconCls}-down::before`]: {
            transition: `transform ${motionDurationMid}`
          }
        },
        [`${componentCls}-wrap-open`]: {
          [`${iconCls}-down::before`]: {
            transform: `rotate(180deg)`
          }
        },
        [`
        &-hidden,
        &-menu-hidden,
        &-menu-submenu-hidden
      `]: {
          display: "none"
        },
        // =============================================================
        // ==                         Motion                          ==
        // =============================================================
        // When position is not enough for dropdown, the placement will revert.
        // We will handle this with revert motion name.
        [`&${antCls}-slide-down-enter${antCls}-slide-down-enter-active${componentCls}-placement-bottomLeft,
          &${antCls}-slide-down-appear${antCls}-slide-down-appear-active${componentCls}-placement-bottomLeft,
          &${antCls}-slide-down-enter${antCls}-slide-down-enter-active${componentCls}-placement-bottom,
          &${antCls}-slide-down-appear${antCls}-slide-down-appear-active${componentCls}-placement-bottom,
          &${antCls}-slide-down-enter${antCls}-slide-down-enter-active${componentCls}-placement-bottomRight,
          &${antCls}-slide-down-appear${antCls}-slide-down-appear-active${componentCls}-placement-bottomRight`]: {
          animationName: slideUpIn
        },
        [`&${antCls}-slide-up-enter${antCls}-slide-up-enter-active${componentCls}-placement-topLeft,
          &${antCls}-slide-up-appear${antCls}-slide-up-appear-active${componentCls}-placement-topLeft,
          &${antCls}-slide-up-enter${antCls}-slide-up-enter-active${componentCls}-placement-top,
          &${antCls}-slide-up-appear${antCls}-slide-up-appear-active${componentCls}-placement-top,
          &${antCls}-slide-up-enter${antCls}-slide-up-enter-active${componentCls}-placement-topRight,
          &${antCls}-slide-up-appear${antCls}-slide-up-appear-active${componentCls}-placement-topRight`]: {
          animationName: slideDownIn
        },
        [`&${antCls}-slide-down-leave${antCls}-slide-down-leave-active${componentCls}-placement-bottomLeft,
          &${antCls}-slide-down-leave${antCls}-slide-down-leave-active${componentCls}-placement-bottom,
          &${antCls}-slide-down-leave${antCls}-slide-down-leave-active${componentCls}-placement-bottomRight`]: {
          animationName: slideUpOut
        },
        [`&${antCls}-slide-up-leave${antCls}-slide-up-leave-active${componentCls}-placement-topLeft,
          &${antCls}-slide-up-leave${antCls}-slide-up-leave-active${componentCls}-placement-top,
          &${antCls}-slide-up-leave${antCls}-slide-up-leave-active${componentCls}-placement-topRight`]: {
          animationName: slideDownOut
        }
      }
    },
    // =============================================================
    // ==                        Arrow style                      ==
    // =============================================================
    getArrowStyle(token, colorBgElevated, {
      arrowPlacement: {
        top: true,
        bottom: true
      }
    }),
    {
      // =============================================================
      // ==                          Menu                           ==
      // =============================================================
      [`${componentCls} ${menuCls}`]: {
        position: "relative",
        margin: 0
      },
      [`${menuCls}-submenu-popup`]: {
        position: "absolute",
        zIndex: zIndexPopup,
        background: "transparent",
        boxShadow: "none",
        transformOrigin: "0 0",
        "ul, li": {
          listStyle: "none",
          margin: 0
        }
      },
      [`${componentCls}, ${componentCls}-menu-submenu`]: Object.assign(Object.assign({}, resetComponent(token)), {
        [menuCls]: Object.assign(Object.assign({
          padding: dropdownEdgeChildPadding,
          listStyleType: "none",
          backgroundColor: colorBgElevated,
          backgroundClip: "padding-box",
          borderRadius: token.borderRadiusLG,
          outline: "none",
          boxShadow: token.boxShadowSecondary
        }, genFocusStyle(token)), {
          "&:empty": {
            padding: 0,
            boxShadow: "none"
          },
          [`${menuCls}-item-group-title`]: {
            padding: `${unit(paddingBlock)} ${unit(controlPaddingHorizontal)}`,
            color: token.colorTextDescription,
            transition: `all ${motionDurationMid}`
          },
          // ======================= Item Content =======================
          [`${menuCls}-item`]: {
            position: "relative",
            display: "flex",
            alignItems: "center"
          },
          [`${menuCls}-item-icon`]: {
            minWidth: fontSize,
            marginInlineEnd: token.marginXS,
            fontSize: token.fontSizeSM
          },
          [`${menuCls}-title-content`]: {
            flex: "auto",
            "&-with-extra": {
              display: "inline-flex",
              alignItems: "center",
              width: "100%"
            },
            "> a": {
              color: "inherit",
              transition: `all ${motionDurationMid}`,
              "&:hover": {
                color: "inherit"
              },
              "&::after": {
                position: "absolute",
                inset: 0,
                content: '""'
              }
            },
            [`${menuCls}-item-extra`]: {
              paddingInlineStart: token.padding,
              marginInlineStart: "auto",
              fontSize: token.fontSizeSM,
              color: token.colorTextDescription
            }
          },
          // =========================== Item ===========================
          [`${menuCls}-item, ${menuCls}-submenu-title`]: Object.assign(Object.assign({
            display: "flex",
            margin: 0,
            padding: `${unit(paddingBlock)} ${unit(controlPaddingHorizontal)}`,
            color: token.colorText,
            fontWeight: "normal",
            fontSize,
            lineHeight: token.lineHeight,
            cursor: "pointer",
            transition: `all ${motionDurationMid}`,
            borderRadius: token.borderRadiusSM,
            "&:hover, &-active": {
              backgroundColor: token.controlItemBgHover
            }
          }, genFocusStyle(token)), {
            "&-selected": {
              color: token.colorPrimary,
              backgroundColor: token.controlItemBgActive,
              "&:hover, &-active": {
                backgroundColor: token.controlItemBgActiveHover
              }
            },
            "&-disabled": {
              color: colorTextDisabled,
              cursor: "not-allowed",
              "&:hover": {
                color: colorTextDisabled,
                backgroundColor: colorBgElevated,
                cursor: "not-allowed"
              },
              a: {
                pointerEvents: "none"
              }
            },
            "&-divider": {
              height: 1,
              // By design
              margin: `${unit(token.marginXXS)} 0`,
              overflow: "hidden",
              lineHeight: 0,
              backgroundColor: token.colorSplit
            },
            [`${componentCls}-menu-submenu-expand-icon`]: {
              position: "absolute",
              insetInlineEnd: token.paddingXS,
              [`${componentCls}-menu-submenu-arrow-icon`]: {
                marginInlineEnd: "0 !important",
                color: token.colorIcon,
                fontSize: fontSizeIcon,
                fontStyle: "normal"
              }
            }
          }),
          [`${menuCls}-item-group-list`]: {
            margin: `0 ${unit(token.marginXS)}`,
            padding: 0,
            listStyle: "none"
          },
          [`${menuCls}-submenu-title`]: {
            paddingInlineEnd: token.calc(controlPaddingHorizontal).add(token.fontSizeSM).equal()
          },
          [`${menuCls}-submenu-vertical`]: {
            position: "relative"
          },
          [`${menuCls}-submenu${menuCls}-submenu-disabled ${componentCls}-menu-submenu-title`]: {
            [`&, ${componentCls}-menu-submenu-arrow-icon`]: {
              color: colorTextDisabled,
              backgroundColor: colorBgElevated,
              cursor: "not-allowed"
            }
          },
          // https://github.com/ant-design/ant-design/issues/19264
          [`${menuCls}-submenu-selected ${componentCls}-menu-submenu-title`]: {
            color: token.colorPrimary
          }
        })
      })
    },
    // Follow code may reuse in other components
    [initSlideMotion(token, "slide-up"), initSlideMotion(token, "slide-down"), initMoveMotion(token, "move-up"), initMoveMotion(token, "move-down"), initZoomMotion(token, "zoom-big")]
  ];
};
const prepareComponentToken$e = (token) => Object.assign(Object.assign({
  zIndexPopup: token.zIndexPopupBase + 50,
  paddingBlock: (token.controlHeight - token.fontSize * token.lineHeight) / 2
}, getArrowOffsetToken({
  contentRadius: token.borderRadiusLG,
  limitVerticalRadius: true
})), getArrowToken(token));
const useStyle$i = genStyleHooks("Dropdown", (token) => {
  const {
    marginXXS,
    sizePopupArrow,
    paddingXXS,
    componentCls
  } = token;
  const dropdownToken = merge$1(token, {
    menuCls: `${componentCls}-menu`,
    dropdownArrowDistance: token.calc(sizePopupArrow).div(2).add(marginXXS).equal(),
    dropdownEdgeChildPadding: paddingXXS
  });
  return [genBaseStyle$2(dropdownToken), genStatusStyle(dropdownToken)];
}, prepareComponentToken$e, {
  resetStyle: false
});
const Dropdown$1 = (props) => {
  var _a;
  const {
    menu,
    arrow,
    prefixCls: customizePrefixCls,
    children,
    trigger,
    disabled,
    dropdownRender,
    popupRender,
    getPopupContainer,
    overlayClassName,
    rootClassName,
    overlayStyle,
    open: open2,
    onOpenChange,
    // Deprecated
    visible,
    onVisibleChange,
    mouseEnterDelay = 0.15,
    mouseLeaveDelay = 0.1,
    autoAdjustOverflow = true,
    placement = "",
    overlay,
    transitionName,
    destroyOnHidden,
    destroyPopupOnHide
  } = props;
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction,
    dropdown
  } = reactExports.useContext(ConfigContext);
  const mergedPopupRender = popupRender || dropdownRender;
  devUseWarning();
  const memoTransitionName = reactExports.useMemo(() => {
    const rootPrefixCls = getPrefixCls();
    if (transitionName !== void 0) {
      return transitionName;
    }
    if (placement.includes("top")) {
      return `${rootPrefixCls}-slide-down`;
    }
    return `${rootPrefixCls}-slide-up`;
  }, [getPrefixCls, placement, transitionName]);
  const memoPlacement = reactExports.useMemo(() => {
    if (!placement) {
      return direction === "rtl" ? "bottomRight" : "bottomLeft";
    }
    if (placement.includes("Center")) {
      return placement.slice(0, placement.indexOf("Center"));
    }
    return placement;
  }, [placement, direction]);
  const prefixCls = getPrefixCls("dropdown", customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$i(prefixCls, rootCls);
  const [, token] = useToken();
  const child = reactExports.Children.only(isPrimitive(children) ? /* @__PURE__ */ reactExports.createElement("span", null, children) : children);
  const popupTrigger = cloneElement(child, {
    className: classNames(`${prefixCls}-trigger`, {
      [`${prefixCls}-rtl`]: direction === "rtl"
    }, child.props.className),
    disabled: (_a = child.props.disabled) !== null && _a !== void 0 ? _a : disabled
  });
  const triggerActions = disabled ? [] : trigger;
  const alignPoint = !!(triggerActions === null || triggerActions === void 0 ? void 0 : triggerActions.includes("contextMenu"));
  const [mergedOpen, setOpen] = useMergedState(false, {
    value: open2 !== null && open2 !== void 0 ? open2 : visible
  });
  const onInnerOpenChange = useEvent((nextOpen) => {
    onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(nextOpen, {
      source: "trigger"
    });
    onVisibleChange === null || onVisibleChange === void 0 ? void 0 : onVisibleChange(nextOpen);
    setOpen(nextOpen);
  });
  const overlayClassNameCustomized = classNames(overlayClassName, rootClassName, hashId, cssVarCls, rootCls, dropdown === null || dropdown === void 0 ? void 0 : dropdown.className, {
    [`${prefixCls}-rtl`]: direction === "rtl"
  });
  const builtinPlacements = getPlacements({
    arrowPointAtCenter: typeof arrow === "object" && arrow.pointAtCenter,
    autoAdjustOverflow,
    offset: token.marginXXS,
    arrowWidth: arrow ? token.sizePopupArrow : 0,
    borderRadius: token.borderRadius
  });
  const onMenuClick = reactExports.useCallback(() => {
    if ((menu === null || menu === void 0 ? void 0 : menu.selectable) && (menu === null || menu === void 0 ? void 0 : menu.multiple)) {
      return;
    }
    onOpenChange === null || onOpenChange === void 0 ? void 0 : onOpenChange(false, {
      source: "menu"
    });
    setOpen(false);
  }, [menu === null || menu === void 0 ? void 0 : menu.selectable, menu === null || menu === void 0 ? void 0 : menu.multiple]);
  const renderOverlay = () => {
    let overlayNode;
    if (menu === null || menu === void 0 ? void 0 : menu.items) {
      overlayNode = /* @__PURE__ */ reactExports.createElement(Menu, Object.assign({}, menu));
    } else if (typeof overlay === "function") {
      overlayNode = overlay();
    } else {
      overlayNode = overlay;
    }
    if (mergedPopupRender) {
      overlayNode = mergedPopupRender(overlayNode);
    }
    overlayNode = reactExports.Children.only(typeof overlayNode === "string" ? /* @__PURE__ */ reactExports.createElement("span", null, overlayNode) : overlayNode);
    return /* @__PURE__ */ reactExports.createElement(OverrideProvider, {
      prefixCls: `${prefixCls}-menu`,
      rootClassName: classNames(cssVarCls, rootCls),
      expandIcon: /* @__PURE__ */ reactExports.createElement("span", {
        className: `${prefixCls}-menu-submenu-arrow`
      }, direction === "rtl" ? /* @__PURE__ */ reactExports.createElement(RefIcon$b, {
        className: `${prefixCls}-menu-submenu-arrow-icon`
      }) : /* @__PURE__ */ reactExports.createElement(RefIcon$6, {
        className: `${prefixCls}-menu-submenu-arrow-icon`
      })),
      mode: "vertical",
      selectable: false,
      onClick: onMenuClick,
      validator: ({
        mode
      }) => {
      }
    }, overlayNode);
  };
  const [zIndex, contextZIndex] = useZIndex("Dropdown", overlayStyle === null || overlayStyle === void 0 ? void 0 : overlayStyle.zIndex);
  let renderNode = /* @__PURE__ */ reactExports.createElement(Dropdown$2, Object.assign({
    alignPoint
  }, omit(props, ["rootClassName"]), {
    mouseEnterDelay,
    mouseLeaveDelay,
    visible: mergedOpen,
    builtinPlacements,
    arrow: !!arrow,
    overlayClassName: overlayClassNameCustomized,
    prefixCls,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    transitionName: memoTransitionName,
    trigger: triggerActions,
    overlay: renderOverlay,
    placement: memoPlacement,
    onVisibleChange: onInnerOpenChange,
    overlayStyle: Object.assign(Object.assign(Object.assign({}, dropdown === null || dropdown === void 0 ? void 0 : dropdown.style), overlayStyle), {
      zIndex
    }),
    autoDestroy: destroyOnHidden !== null && destroyOnHidden !== void 0 ? destroyOnHidden : destroyPopupOnHide
  }), popupTrigger);
  if (zIndex) {
    renderNode = /* @__PURE__ */ reactExports.createElement(zIndexContext.Provider, {
      value: contextZIndex
    }, renderNode);
  }
  return wrapCSSVar(renderNode);
};
const PurePanel$3 = genPurePanel(Dropdown$1, "align", void 0, "dropdown", (prefixCls) => prefixCls);
const WrapPurePanel = (props) => /* @__PURE__ */ reactExports.createElement(PurePanel$3, Object.assign({}, props), /* @__PURE__ */ reactExports.createElement("span", null));
Dropdown$1._InternalPanelDoNotUseOrYouWillBeFired = WrapPurePanel;
const RadioGroupContext = /* @__PURE__ */ reactExports.createContext(null);
const RadioGroupContextProvider = RadioGroupContext.Provider;
const RadioOptionTypeContext = /* @__PURE__ */ reactExports.createContext(null);
const RadioOptionTypeContextProvider = RadioOptionTypeContext.Provider;
function useBubbleLock(onOriginInputClick) {
  const labelClickLockRef = React.useRef(null);
  const clearLock = () => {
    wrapperRaf.cancel(labelClickLockRef.current);
    labelClickLockRef.current = null;
  };
  const onLabelClick = () => {
    clearLock();
    labelClickLockRef.current = wrapperRaf(() => {
      labelClickLockRef.current = null;
    });
  };
  const onInputClick = (e2) => {
    if (labelClickLockRef.current) {
      e2.stopPropagation();
      clearLock();
    }
    onOriginInputClick === null || onOriginInputClick === void 0 ? void 0 : onOriginInputClick(e2);
  };
  return [onLabelClick, onInputClick];
}
const getGroupRadioStyle = (token) => {
  const {
    componentCls,
    antCls
  } = token;
  const groupPrefixCls = `${componentCls}-group`;
  return {
    [groupPrefixCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      display: "inline-block",
      fontSize: 0,
      // RTL
      [`&${groupPrefixCls}-rtl`]: {
        direction: "rtl"
      },
      [`&${groupPrefixCls}-block`]: {
        display: "flex"
      },
      [`${antCls}-badge ${antCls}-badge-count`]: {
        zIndex: 1
      },
      [`> ${antCls}-badge:not(:first-child) > ${antCls}-button-wrapper`]: {
        borderInlineStart: "none"
      }
    })
  };
};
const getRadioBasicStyle = (token) => {
  const {
    componentCls,
    wrapperMarginInlineEnd,
    colorPrimary,
    radioSize,
    motionDurationSlow,
    motionDurationMid,
    motionEaseInOutCirc,
    colorBgContainer,
    colorBorder,
    lineWidth,
    colorBgContainerDisabled,
    colorTextDisabled,
    paddingXS,
    dotColorDisabled,
    lineType,
    radioColor,
    radioBgColor,
    calc
  } = token;
  const radioInnerPrefixCls = `${componentCls}-inner`;
  const dotPadding = 4;
  const radioDotDisabledSize = calc(radioSize).sub(calc(dotPadding).mul(2));
  const radioSizeCalc = calc(1).mul(radioSize).equal({
    unit: true
  });
  return {
    [`${componentCls}-wrapper`]: Object.assign(Object.assign({}, resetComponent(token)), {
      display: "inline-flex",
      alignItems: "baseline",
      marginInlineStart: 0,
      marginInlineEnd: wrapperMarginInlineEnd,
      cursor: "pointer",
      "&:last-child": {
        marginInlineEnd: 0
      },
      // RTL
      [`&${componentCls}-wrapper-rtl`]: {
        direction: "rtl"
      },
      "&-disabled": {
        cursor: "not-allowed",
        color: token.colorTextDisabled
      },
      "&::after": {
        display: "inline-block",
        width: 0,
        overflow: "hidden",
        content: '"\\a0"'
      },
      "&-block": {
        flex: 1,
        justifyContent: "center"
      },
      // hashId 在 wrapper 上，只能铺平
      [`${componentCls}-checked::after`]: {
        position: "absolute",
        insetBlockStart: 0,
        insetInlineStart: 0,
        width: "100%",
        height: "100%",
        border: `${unit(lineWidth)} ${lineType} ${colorPrimary}`,
        borderRadius: "50%",
        visibility: "hidden",
        opacity: 0,
        content: '""'
      },
      [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
        position: "relative",
        display: "inline-block",
        outline: "none",
        cursor: "pointer",
        alignSelf: "center",
        borderRadius: "50%"
      }),
      [`${componentCls}-wrapper:hover &,
        &:hover ${radioInnerPrefixCls}`]: {
        borderColor: colorPrimary
      },
      [`${componentCls}-input:focus-visible + ${radioInnerPrefixCls}`]: Object.assign({}, genFocusOutline(token)),
      [`${componentCls}:hover::after, ${componentCls}-wrapper:hover &::after`]: {
        visibility: "visible"
      },
      [`${componentCls}-inner`]: {
        "&::after": {
          boxSizing: "border-box",
          position: "absolute",
          insetBlockStart: "50%",
          insetInlineStart: "50%",
          display: "block",
          width: radioSizeCalc,
          height: radioSizeCalc,
          marginBlockStart: calc(1).mul(radioSize).div(-2).equal({
            unit: true
          }),
          marginInlineStart: calc(1).mul(radioSize).div(-2).equal({
            unit: true
          }),
          backgroundColor: radioColor,
          borderBlockStart: 0,
          borderInlineStart: 0,
          borderRadius: radioSizeCalc,
          transform: "scale(0)",
          opacity: 0,
          transition: `all ${motionDurationSlow} ${motionEaseInOutCirc}`,
          content: '""'
        },
        boxSizing: "border-box",
        position: "relative",
        insetBlockStart: 0,
        insetInlineStart: 0,
        display: "block",
        width: radioSizeCalc,
        height: radioSizeCalc,
        backgroundColor: colorBgContainer,
        borderColor: colorBorder,
        borderStyle: "solid",
        borderWidth: lineWidth,
        borderRadius: "50%",
        transition: `all ${motionDurationMid}`
      },
      [`${componentCls}-input`]: {
        position: "absolute",
        inset: 0,
        zIndex: 1,
        cursor: "pointer",
        opacity: 0
      },
      // 选中状态
      [`${componentCls}-checked`]: {
        [radioInnerPrefixCls]: {
          borderColor: colorPrimary,
          backgroundColor: radioBgColor,
          "&::after": {
            transform: `scale(${token.calc(token.dotSize).div(radioSize).equal()})`,
            opacity: 1,
            transition: `all ${motionDurationSlow} ${motionEaseInOutCirc}`
          }
        }
      },
      [`${componentCls}-disabled`]: {
        cursor: "not-allowed",
        [radioInnerPrefixCls]: {
          backgroundColor: colorBgContainerDisabled,
          borderColor: colorBorder,
          cursor: "not-allowed",
          "&::after": {
            backgroundColor: dotColorDisabled
          }
        },
        [`${componentCls}-input`]: {
          cursor: "not-allowed"
        },
        [`${componentCls}-disabled + span`]: {
          color: colorTextDisabled,
          cursor: "not-allowed"
        },
        [`&${componentCls}-checked`]: {
          [radioInnerPrefixCls]: {
            "&::after": {
              transform: `scale(${calc(radioDotDisabledSize).div(radioSize).equal()})`
            }
          }
        }
      },
      [`span${componentCls} + *`]: {
        paddingInlineStart: paddingXS,
        paddingInlineEnd: paddingXS
      }
    })
  };
};
const getRadioButtonStyle = (token) => {
  const {
    buttonColor,
    controlHeight,
    componentCls,
    lineWidth,
    lineType,
    colorBorder,
    motionDurationSlow,
    motionDurationMid,
    buttonPaddingInline,
    fontSize,
    buttonBg,
    fontSizeLG,
    controlHeightLG,
    controlHeightSM,
    paddingXS,
    borderRadius,
    borderRadiusSM,
    borderRadiusLG,
    buttonCheckedBg,
    buttonSolidCheckedColor,
    colorTextDisabled,
    colorBgContainerDisabled,
    buttonCheckedBgDisabled,
    buttonCheckedColorDisabled,
    colorPrimary,
    colorPrimaryHover,
    colorPrimaryActive,
    buttonSolidCheckedBg,
    buttonSolidCheckedHoverBg,
    buttonSolidCheckedActiveBg,
    calc
  } = token;
  return {
    [`${componentCls}-button-wrapper`]: {
      position: "relative",
      display: "inline-block",
      height: controlHeight,
      margin: 0,
      paddingInline: buttonPaddingInline,
      paddingBlock: 0,
      color: buttonColor,
      fontSize,
      lineHeight: unit(calc(controlHeight).sub(calc(lineWidth).mul(2)).equal()),
      background: buttonBg,
      border: `${unit(lineWidth)} ${lineType} ${colorBorder}`,
      // strange align fix for chrome but works
      // https://gw.alipayobjects.com/zos/rmsportal/VFTfKXJuogBAXcvfAUWJ.gif
      borderBlockStartWidth: calc(lineWidth).add(0.02).equal(),
      borderInlineStartWidth: 0,
      borderInlineEndWidth: lineWidth,
      cursor: "pointer",
      transition: [`color ${motionDurationMid}`, `background ${motionDurationMid}`, `box-shadow ${motionDurationMid}`].join(","),
      a: {
        color: buttonColor
      },
      [`> ${componentCls}-button`]: {
        position: "absolute",
        insetBlockStart: 0,
        insetInlineStart: 0,
        zIndex: -1,
        width: "100%",
        height: "100%"
      },
      "&:not(:first-child)": {
        "&::before": {
          position: "absolute",
          insetBlockStart: calc(lineWidth).mul(-1).equal(),
          insetInlineStart: calc(lineWidth).mul(-1).equal(),
          display: "block",
          boxSizing: "content-box",
          width: 1,
          height: "100%",
          paddingBlock: lineWidth,
          paddingInline: 0,
          backgroundColor: colorBorder,
          transition: `background-color ${motionDurationSlow}`,
          content: '""'
        }
      },
      "&:first-child": {
        borderInlineStart: `${unit(lineWidth)} ${lineType} ${colorBorder}`,
        borderStartStartRadius: borderRadius,
        borderEndStartRadius: borderRadius
      },
      "&:last-child": {
        borderStartEndRadius: borderRadius,
        borderEndEndRadius: borderRadius
      },
      "&:first-child:last-child": {
        borderRadius
      },
      [`${componentCls}-group-large &`]: {
        height: controlHeightLG,
        fontSize: fontSizeLG,
        lineHeight: unit(calc(controlHeightLG).sub(calc(lineWidth).mul(2)).equal()),
        "&:first-child": {
          borderStartStartRadius: borderRadiusLG,
          borderEndStartRadius: borderRadiusLG
        },
        "&:last-child": {
          borderStartEndRadius: borderRadiusLG,
          borderEndEndRadius: borderRadiusLG
        }
      },
      [`${componentCls}-group-small &`]: {
        height: controlHeightSM,
        paddingInline: calc(paddingXS).sub(lineWidth).equal(),
        paddingBlock: 0,
        lineHeight: unit(calc(controlHeightSM).sub(calc(lineWidth).mul(2)).equal()),
        "&:first-child": {
          borderStartStartRadius: borderRadiusSM,
          borderEndStartRadius: borderRadiusSM
        },
        "&:last-child": {
          borderStartEndRadius: borderRadiusSM,
          borderEndEndRadius: borderRadiusSM
        }
      },
      "&:hover": {
        position: "relative",
        color: colorPrimary
      },
      "&:has(:focus-visible)": Object.assign({}, genFocusOutline(token)),
      [`${componentCls}-inner, input[type='checkbox'], input[type='radio']`]: {
        width: 0,
        height: 0,
        opacity: 0,
        pointerEvents: "none"
      },
      [`&-checked:not(${componentCls}-button-wrapper-disabled)`]: {
        zIndex: 1,
        color: colorPrimary,
        background: buttonCheckedBg,
        borderColor: colorPrimary,
        "&::before": {
          backgroundColor: colorPrimary
        },
        "&:first-child": {
          borderColor: colorPrimary
        },
        "&:hover": {
          color: colorPrimaryHover,
          borderColor: colorPrimaryHover,
          "&::before": {
            backgroundColor: colorPrimaryHover
          }
        },
        "&:active": {
          color: colorPrimaryActive,
          borderColor: colorPrimaryActive,
          "&::before": {
            backgroundColor: colorPrimaryActive
          }
        }
      },
      [`${componentCls}-group-solid &-checked:not(${componentCls}-button-wrapper-disabled)`]: {
        color: buttonSolidCheckedColor,
        background: buttonSolidCheckedBg,
        borderColor: buttonSolidCheckedBg,
        "&:hover": {
          color: buttonSolidCheckedColor,
          background: buttonSolidCheckedHoverBg,
          borderColor: buttonSolidCheckedHoverBg
        },
        "&:active": {
          color: buttonSolidCheckedColor,
          background: buttonSolidCheckedActiveBg,
          borderColor: buttonSolidCheckedActiveBg
        }
      },
      "&-disabled": {
        color: colorTextDisabled,
        backgroundColor: colorBgContainerDisabled,
        borderColor: colorBorder,
        cursor: "not-allowed",
        "&:first-child, &:hover": {
          color: colorTextDisabled,
          backgroundColor: colorBgContainerDisabled,
          borderColor: colorBorder
        }
      },
      [`&-disabled${componentCls}-button-wrapper-checked`]: {
        color: buttonCheckedColorDisabled,
        backgroundColor: buttonCheckedBgDisabled,
        borderColor: colorBorder,
        boxShadow: "none"
      },
      "&-block": {
        flex: 1,
        textAlign: "center"
      }
    }
  };
};
const prepareComponentToken$d = (token) => {
  const {
    wireframe,
    padding,
    marginXS,
    lineWidth,
    fontSizeLG,
    colorText,
    colorBgContainer,
    colorTextDisabled,
    controlItemBgActiveDisabled,
    colorTextLightSolid,
    colorPrimary,
    colorPrimaryHover,
    colorPrimaryActive,
    colorWhite
  } = token;
  const dotPadding = 4;
  const radioSize = fontSizeLG;
  const radioDotSize = wireframe ? radioSize - dotPadding * 2 : radioSize - (dotPadding + lineWidth) * 2;
  return {
    // Radio
    radioSize,
    dotSize: radioDotSize,
    dotColorDisabled: colorTextDisabled,
    // Radio buttons
    buttonSolidCheckedColor: colorTextLightSolid,
    buttonSolidCheckedBg: colorPrimary,
    buttonSolidCheckedHoverBg: colorPrimaryHover,
    buttonSolidCheckedActiveBg: colorPrimaryActive,
    buttonBg: colorBgContainer,
    buttonCheckedBg: colorBgContainer,
    buttonColor: colorText,
    buttonCheckedBgDisabled: controlItemBgActiveDisabled,
    buttonCheckedColorDisabled: colorTextDisabled,
    buttonPaddingInline: padding - lineWidth,
    wrapperMarginInlineEnd: marginXS,
    // internal
    radioColor: wireframe ? colorPrimary : colorWhite,
    radioBgColor: wireframe ? colorBgContainer : colorPrimary
  };
};
const useStyle$h = genStyleHooks("Radio", (token) => {
  const {
    controlOutline,
    controlOutlineWidth
  } = token;
  const radioFocusShadow = `0 0 0 ${unit(controlOutlineWidth)} ${controlOutline}`;
  const radioButtonFocusShadow = radioFocusShadow;
  const radioToken = merge$1(token, {
    radioFocusShadow,
    radioButtonFocusShadow
  });
  return [getGroupRadioStyle(radioToken), getRadioBasicStyle(radioToken), getRadioButtonStyle(radioToken)];
}, prepareComponentToken$d, {
  unitless: {
    radioSize: true,
    dotSize: true
  }
});
var __rest$G = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const InternalRadio = (props, ref) => {
  var _a, _b;
  const groupContext = reactExports.useContext(RadioGroupContext);
  const radioOptionTypeContext = reactExports.useContext(RadioOptionTypeContext);
  const {
    getPrefixCls,
    direction,
    radio
  } = reactExports.useContext(ConfigContext);
  const innerRef = reactExports.useRef(null);
  const mergedRef = composeRef(ref, innerRef);
  const {
    isFormItemInput
  } = reactExports.useContext(FormItemInputContext);
  const onChange = (e2) => {
    var _a2, _b2;
    (_a2 = props.onChange) === null || _a2 === void 0 ? void 0 : _a2.call(props, e2);
    (_b2 = groupContext === null || groupContext === void 0 ? void 0 : groupContext.onChange) === null || _b2 === void 0 ? void 0 : _b2.call(groupContext, e2);
  };
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children,
    style,
    title
  } = props, restProps = __rest$G(props, ["prefixCls", "className", "rootClassName", "children", "style", "title"]);
  const radioPrefixCls = getPrefixCls("radio", customizePrefixCls);
  const isButtonType = ((groupContext === null || groupContext === void 0 ? void 0 : groupContext.optionType) || radioOptionTypeContext) === "button";
  const prefixCls = isButtonType ? `${radioPrefixCls}-button` : radioPrefixCls;
  const rootCls = useCSSVarCls(radioPrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$h(radioPrefixCls, rootCls);
  const radioProps = Object.assign({}, restProps);
  const disabled = reactExports.useContext(DisabledContext);
  if (groupContext) {
    radioProps.name = groupContext.name;
    radioProps.onChange = onChange;
    radioProps.checked = props.value === groupContext.value;
    radioProps.disabled = (_a = radioProps.disabled) !== null && _a !== void 0 ? _a : groupContext.disabled;
  }
  radioProps.disabled = (_b = radioProps.disabled) !== null && _b !== void 0 ? _b : disabled;
  const wrapperClassString = classNames(`${prefixCls}-wrapper`, {
    [`${prefixCls}-wrapper-checked`]: radioProps.checked,
    [`${prefixCls}-wrapper-disabled`]: radioProps.disabled,
    [`${prefixCls}-wrapper-rtl`]: direction === "rtl",
    [`${prefixCls}-wrapper-in-form-item`]: isFormItemInput,
    [`${prefixCls}-wrapper-block`]: !!(groupContext === null || groupContext === void 0 ? void 0 : groupContext.block)
  }, radio === null || radio === void 0 ? void 0 : radio.className, className, rootClassName, hashId, cssVarCls, rootCls);
  const [onLabelClick, onInputClick] = useBubbleLock(radioProps.onClick);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(Wave, {
    component: "Radio",
    disabled: radioProps.disabled
  }, /* @__PURE__ */ reactExports.createElement("label", {
    className: wrapperClassString,
    style: Object.assign(Object.assign({}, radio === null || radio === void 0 ? void 0 : radio.style), style),
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    title,
    onClick: onLabelClick
  }, /* @__PURE__ */ reactExports.createElement(Checkbox$2, Object.assign({}, radioProps, {
    className: classNames(radioProps.className, {
      [TARGET_CLS]: !isButtonType
    }),
    type: "radio",
    prefixCls,
    ref: mergedRef,
    onClick: onInputClick
  })), children !== void 0 ? /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-label`
  }, children) : null)));
};
const Radio$1 = /* @__PURE__ */ reactExports.forwardRef(InternalRadio);
const formItemNameBlackList = ["parentNode"];
const defaultItemNamePrefixCls = "form_item";
function toArray(candidate) {
  if (candidate === void 0 || candidate === false) return [];
  return Array.isArray(candidate) ? candidate : [candidate];
}
function getFieldId(namePath, formName) {
  if (!namePath.length) {
    return void 0;
  }
  const mergedId = namePath.join("_");
  if (formName) {
    return `${formName}_${mergedId}`;
  }
  const isIllegalName = formItemNameBlackList.includes(mergedId);
  return isIllegalName ? `${defaultItemNamePrefixCls}_${mergedId}` : mergedId;
}
function getStatus(errors, warnings, meta, defaultValidateStatus, hasFeedback, validateStatus) {
  let status = defaultValidateStatus;
  if (validateStatus !== void 0) {
    status = validateStatus;
  } else if (meta.validating) {
    status = "validating";
  } else if (errors.length) {
    status = "error";
  } else if (warnings.length) {
    status = "warning";
  } else if (meta.touched || hasFeedback && meta.validated) {
    status = "success";
  }
  return status;
}
var __rest$F = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function toNamePathStr(name) {
  const namePath = toArray(name);
  return namePath.join("_");
}
function getFieldDOMNode(name, wrapForm) {
  const field = wrapForm.getFieldInstance(name);
  const fieldDom = getDOM(field);
  if (fieldDom) {
    return fieldDom;
  }
  const fieldId = getFieldId(toArray(name), wrapForm.__INTERNAL__.name);
  if (fieldId) {
    return document.getElementById(fieldId);
  }
}
function useForm(form) {
  const [rcForm] = useForm$1();
  const itemsRef = reactExports.useRef({});
  const wrapForm = reactExports.useMemo(() => form !== null && form !== void 0 ? form : Object.assign(Object.assign({}, rcForm), {
    __INTERNAL__: {
      itemRef: (name) => (node) => {
        const namePathStr = toNamePathStr(name);
        if (node) {
          itemsRef.current[namePathStr] = node;
        } else {
          delete itemsRef.current[namePathStr];
        }
      }
    },
    scrollToField: (name, options = {}) => {
      const {
        focus
      } = options, restOpt = __rest$F(options, ["focus"]);
      const node = getFieldDOMNode(name, wrapForm);
      if (node) {
        e(node, Object.assign({
          scrollMode: "if-needed",
          block: "nearest"
        }, restOpt));
        if (focus) {
          wrapForm.focusField(name);
        }
      }
    },
    focusField: (name) => {
      var _a, _b;
      const itemRef = wrapForm.getFieldInstance(name);
      if (typeof (itemRef === null || itemRef === void 0 ? void 0 : itemRef.focus) === "function") {
        itemRef.focus();
      } else {
        (_b = (_a = getFieldDOMNode(name, wrapForm)) === null || _a === void 0 ? void 0 : _a.focus) === null || _b === void 0 ? void 0 : _b.call(_a);
      }
    },
    getFieldInstance: (name) => {
      const namePathStr = toNamePathStr(name);
      return itemsRef.current[namePathStr];
    }
  }), [form, rcForm]);
  return [wrapForm];
}
const RadioGroup = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const {
    name: formItemName
  } = reactExports.useContext(FormItemInputContext);
  const defaultName = useId$1(toNamePathStr(formItemName));
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    options,
    buttonStyle = "outline",
    disabled,
    children,
    size: customizeSize,
    style,
    id,
    optionType,
    name = defaultName,
    defaultValue,
    value: customizedValue,
    block = false,
    onChange,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur
  } = props;
  const [value, setValue] = useMergedState(defaultValue, {
    value: customizedValue
  });
  const onRadioChange = reactExports.useCallback((event) => {
    const lastValue = value;
    const val = event.target.value;
    if (!("value" in props)) {
      setValue(val);
    }
    if (val !== lastValue) {
      onChange === null || onChange === void 0 ? void 0 : onChange(event);
    }
  }, [value, setValue, onChange]);
  const prefixCls = getPrefixCls("radio", customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-group`;
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$h(prefixCls, rootCls);
  let childrenToRender = children;
  if (options && options.length > 0) {
    childrenToRender = options.map((option) => {
      if (typeof option === "string" || typeof option === "number") {
        return /* @__PURE__ */ reactExports.createElement(Radio$1, {
          key: option.toString(),
          prefixCls,
          disabled,
          value: option,
          checked: value === option
        }, option);
      }
      return /* @__PURE__ */ reactExports.createElement(Radio$1, {
        key: `radio-group-value-options-${option.value}`,
        prefixCls,
        disabled: option.disabled || disabled,
        value: option.value,
        checked: value === option.value,
        title: option.title,
        style: option.style,
        className: option.className,
        id: option.id,
        required: option.required
      }, option.label);
    });
  }
  const mergedSize = useSize(customizeSize);
  const classString = classNames(groupPrefixCls, `${groupPrefixCls}-${buttonStyle}`, {
    [`${groupPrefixCls}-${mergedSize}`]: mergedSize,
    [`${groupPrefixCls}-rtl`]: direction === "rtl",
    [`${groupPrefixCls}-block`]: block
  }, className, rootClassName, hashId, cssVarCls, rootCls);
  const memoizedValue = reactExports.useMemo(() => ({
    onChange: onRadioChange,
    value,
    disabled,
    name,
    optionType,
    block
  }), [onRadioChange, value, disabled, name, optionType, block]);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({}, pickAttrs(props, {
    aria: true,
    data: true
  }), {
    className: classString,
    style,
    onMouseEnter,
    onMouseLeave,
    onFocus,
    onBlur,
    id,
    ref
  }), /* @__PURE__ */ reactExports.createElement(RadioGroupContextProvider, {
    value: memoizedValue
  }, childrenToRender)));
});
const Group$1 = /* @__PURE__ */ reactExports.memo(RadioGroup);
var __rest$E = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const RadioButton = (props, ref) => {
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls
  } = props, radioProps = __rest$E(props, ["prefixCls"]);
  const prefixCls = getPrefixCls("radio", customizePrefixCls);
  return /* @__PURE__ */ reactExports.createElement(RadioOptionTypeContextProvider, {
    value: "button"
  }, /* @__PURE__ */ reactExports.createElement(Radio$1, Object.assign({
    prefixCls
  }, radioProps, {
    type: "radio",
    ref
  })));
};
const Button = /* @__PURE__ */ reactExports.forwardRef(RadioButton);
const Radio = Radio$1;
Radio.Button = Button;
Radio.Group = Group$1;
Radio.__ANT_RADIO = true;
function initInputToken(token) {
  return merge$1(token, {
    inputAffixPadding: token.paddingXXS
  });
}
const initComponentToken$1 = (token) => {
  const {
    controlHeight,
    fontSize,
    lineHeight,
    lineWidth,
    controlHeightSM,
    controlHeightLG,
    fontSizeLG,
    lineHeightLG,
    paddingSM,
    controlPaddingHorizontalSM,
    controlPaddingHorizontal,
    colorFillAlter,
    colorPrimaryHover,
    colorPrimary,
    controlOutlineWidth,
    controlOutline,
    colorErrorOutline,
    colorWarningOutline,
    colorBgContainer,
    inputFontSize,
    inputFontSizeLG,
    inputFontSizeSM
  } = token;
  const mergedFontSize = inputFontSize || fontSize;
  const mergedFontSizeSM = inputFontSizeSM || mergedFontSize;
  const mergedFontSizeLG = inputFontSizeLG || fontSizeLG;
  const paddingBlock = Math.round((controlHeight - mergedFontSize * lineHeight) / 2 * 10) / 10 - lineWidth;
  const paddingBlockSM = Math.round((controlHeightSM - mergedFontSizeSM * lineHeight) / 2 * 10) / 10 - lineWidth;
  const paddingBlockLG = Math.ceil((controlHeightLG - mergedFontSizeLG * lineHeightLG) / 2 * 10) / 10 - lineWidth;
  return {
    paddingBlock: Math.max(paddingBlock, 0),
    paddingBlockSM: Math.max(paddingBlockSM, 0),
    paddingBlockLG: Math.max(paddingBlockLG, 0),
    paddingInline: paddingSM - lineWidth,
    paddingInlineSM: controlPaddingHorizontalSM - lineWidth,
    paddingInlineLG: controlPaddingHorizontal - lineWidth,
    addonBg: colorFillAlter,
    activeBorderColor: colorPrimary,
    hoverBorderColor: colorPrimaryHover,
    activeShadow: `0 0 0 ${controlOutlineWidth}px ${controlOutline}`,
    errorActiveShadow: `0 0 0 ${controlOutlineWidth}px ${colorErrorOutline}`,
    warningActiveShadow: `0 0 0 ${controlOutlineWidth}px ${colorWarningOutline}`,
    hoverBg: colorBgContainer,
    activeBg: colorBgContainer,
    inputFontSize: mergedFontSize,
    inputFontSizeLG: mergedFontSizeLG,
    inputFontSizeSM: mergedFontSizeSM
  };
};
const genHoverStyle = (token) => ({
  borderColor: token.hoverBorderColor,
  backgroundColor: token.hoverBg
});
const genDisabledStyle = (token) => ({
  color: token.colorTextDisabled,
  backgroundColor: token.colorBgContainerDisabled,
  borderColor: token.colorBorder,
  boxShadow: "none",
  cursor: "not-allowed",
  opacity: 1,
  "input[disabled], textarea[disabled]": {
    cursor: "not-allowed"
  },
  "&:hover:not([disabled])": Object.assign({}, genHoverStyle(merge$1(token, {
    hoverBorderColor: token.colorBorder,
    hoverBg: token.colorBgContainerDisabled
  })))
});
const genBaseOutlinedStyle = (token, options) => ({
  background: token.colorBgContainer,
  borderWidth: token.lineWidth,
  borderStyle: token.lineType,
  borderColor: options.borderColor,
  "&:hover": {
    borderColor: options.hoverBorderColor,
    backgroundColor: token.hoverBg
  },
  "&:focus, &:focus-within": {
    borderColor: options.activeBorderColor,
    boxShadow: options.activeShadow,
    outline: 0,
    backgroundColor: token.activeBg
  }
});
const genOutlinedStatusStyle = (token, options) => ({
  [`&${token.componentCls}-status-${options.status}:not(${token.componentCls}-disabled)`]: Object.assign(Object.assign({}, genBaseOutlinedStyle(token, options)), {
    [`${token.componentCls}-prefix, ${token.componentCls}-suffix`]: {
      color: options.affixColor
    }
  }),
  [`&${token.componentCls}-status-${options.status}${token.componentCls}-disabled`]: {
    borderColor: options.borderColor
  }
});
const genOutlinedStyle = (token, extraStyles) => ({
  "&-outlined": Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, genBaseOutlinedStyle(token, {
    borderColor: token.colorBorder,
    hoverBorderColor: token.hoverBorderColor,
    activeBorderColor: token.activeBorderColor,
    activeShadow: token.activeShadow
  })), {
    [`&${token.componentCls}-disabled, &[disabled]`]: Object.assign({}, genDisabledStyle(token))
  }), genOutlinedStatusStyle(token, {
    status: "error",
    borderColor: token.colorError,
    hoverBorderColor: token.colorErrorBorderHover,
    activeBorderColor: token.colorError,
    activeShadow: token.errorActiveShadow,
    affixColor: token.colorError
  })), genOutlinedStatusStyle(token, {
    status: "warning",
    borderColor: token.colorWarning,
    hoverBorderColor: token.colorWarningBorderHover,
    activeBorderColor: token.colorWarning,
    activeShadow: token.warningActiveShadow,
    affixColor: token.colorWarning
  })), extraStyles)
});
const genOutlinedGroupStatusStyle = (token, options) => ({
  [`&${token.componentCls}-group-wrapper-status-${options.status}`]: {
    [`${token.componentCls}-group-addon`]: {
      borderColor: options.addonBorderColor,
      color: options.addonColor
    }
  }
});
const genOutlinedGroupStyle = (token) => ({
  "&-outlined": Object.assign(Object.assign(Object.assign({
    [`${token.componentCls}-group`]: {
      "&-addon": {
        background: token.addonBg,
        border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`
      },
      "&-addon:first-child": {
        borderInlineEnd: 0
      },
      "&-addon:last-child": {
        borderInlineStart: 0
      }
    }
  }, genOutlinedGroupStatusStyle(token, {
    status: "error",
    addonBorderColor: token.colorError,
    addonColor: token.colorErrorText
  })), genOutlinedGroupStatusStyle(token, {
    status: "warning",
    addonBorderColor: token.colorWarning,
    addonColor: token.colorWarningText
  })), {
    [`&${token.componentCls}-group-wrapper-disabled`]: {
      [`${token.componentCls}-group-addon`]: Object.assign({}, genDisabledStyle(token))
    }
  })
});
const genBorderlessStyle = (token, extraStyles) => {
  const {
    componentCls
  } = token;
  return {
    "&-borderless": Object.assign({
      background: "transparent",
      border: "none",
      "&:focus, &:focus-within": {
        outline: "none"
      },
      // >>>>> Disabled
      [`&${componentCls}-disabled, &[disabled]`]: {
        color: token.colorTextDisabled,
        cursor: "not-allowed"
      },
      // >>>>> Status
      [`&${componentCls}-status-error`]: {
        "&, & input, & textarea": {
          color: token.colorError
        }
      },
      [`&${componentCls}-status-warning`]: {
        "&, & input, & textarea": {
          color: token.colorWarning
        }
      }
    }, extraStyles)
  };
};
const genBaseFilledStyle = (token, options) => {
  var _a;
  return {
    background: options.bg,
    borderWidth: token.lineWidth,
    borderStyle: token.lineType,
    borderColor: "transparent",
    "input&, & input, textarea&, & textarea": {
      color: (_a = options === null || options === void 0 ? void 0 : options.inputColor) !== null && _a !== void 0 ? _a : "unset"
    },
    "&:hover": {
      background: options.hoverBg
    },
    "&:focus, &:focus-within": {
      outline: 0,
      borderColor: options.activeBorderColor,
      backgroundColor: token.activeBg
    }
  };
};
const genFilledStatusStyle = (token, options) => ({
  [`&${token.componentCls}-status-${options.status}:not(${token.componentCls}-disabled)`]: Object.assign(Object.assign({}, genBaseFilledStyle(token, options)), {
    [`${token.componentCls}-prefix, ${token.componentCls}-suffix`]: {
      color: options.affixColor
    }
  })
});
const genFilledStyle = (token, extraStyles) => ({
  "&-filled": Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, genBaseFilledStyle(token, {
    bg: token.colorFillTertiary,
    hoverBg: token.colorFillSecondary,
    activeBorderColor: token.activeBorderColor
  })), {
    [`&${token.componentCls}-disabled, &[disabled]`]: Object.assign({}, genDisabledStyle(token))
  }), genFilledStatusStyle(token, {
    status: "error",
    bg: token.colorErrorBg,
    hoverBg: token.colorErrorBgHover,
    activeBorderColor: token.colorError,
    inputColor: token.colorErrorText,
    affixColor: token.colorError
  })), genFilledStatusStyle(token, {
    status: "warning",
    bg: token.colorWarningBg,
    hoverBg: token.colorWarningBgHover,
    activeBorderColor: token.colorWarning,
    inputColor: token.colorWarningText,
    affixColor: token.colorWarning
  })), extraStyles)
});
const genFilledGroupStatusStyle = (token, options) => ({
  [`&${token.componentCls}-group-wrapper-status-${options.status}`]: {
    [`${token.componentCls}-group-addon`]: {
      background: options.addonBg,
      color: options.addonColor
    }
  }
});
const genFilledGroupStyle = (token) => ({
  "&-filled": Object.assign(Object.assign(Object.assign({
    [`${token.componentCls}-group-addon`]: {
      background: token.colorFillTertiary,
      "&:last-child": {
        position: "static"
      }
    }
  }, genFilledGroupStatusStyle(token, {
    status: "error",
    addonBg: token.colorErrorBg,
    addonColor: token.colorErrorText
  })), genFilledGroupStatusStyle(token, {
    status: "warning",
    addonBg: token.colorWarningBg,
    addonColor: token.colorWarningText
  })), {
    [`&${token.componentCls}-group-wrapper-disabled`]: {
      [`${token.componentCls}-group`]: {
        "&-addon": {
          background: token.colorFillTertiary,
          color: token.colorTextDisabled
        },
        "&-addon:first-child": {
          borderInlineStart: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
          borderTop: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
          borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`
        },
        "&-addon:last-child": {
          borderInlineEnd: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
          borderTop: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
          borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`
        }
      }
    }
  })
});
const genBaseUnderlinedStyle = (token, options) => ({
  background: token.colorBgContainer,
  borderWidth: `${unit(token.lineWidth)} 0`,
  borderStyle: `${token.lineType} none`,
  borderColor: `transparent transparent ${options.borderColor} transparent`,
  borderRadius: 0,
  "&:hover": {
    borderColor: `transparent transparent ${options.borderColor} transparent`,
    backgroundColor: token.hoverBg
  },
  "&:focus, &:focus-within": {
    borderColor: `transparent transparent ${options.activeBorderColor} transparent`,
    outline: 0,
    backgroundColor: token.activeBg
  }
});
const genUnderlinedStatusStyle = (token, options) => ({
  [`&${token.componentCls}-status-${options.status}:not(${token.componentCls}-disabled)`]: Object.assign(Object.assign({}, genBaseUnderlinedStyle(token, options)), {
    [`${token.componentCls}-prefix, ${token.componentCls}-suffix`]: {
      color: options.affixColor
    }
  }),
  [`&${token.componentCls}-status-${options.status}${token.componentCls}-disabled`]: {
    borderColor: `transparent transparent ${options.borderColor} transparent`
  }
});
const genUnderlinedStyle = (token, extraStyles) => ({
  "&-underlined": Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, genBaseUnderlinedStyle(token, {
    borderColor: token.colorBorder,
    hoverBorderColor: token.hoverBorderColor,
    activeBorderColor: token.activeBorderColor,
    activeShadow: token.activeShadow
  })), {
    // >>>>> Disabled
    [`&${token.componentCls}-disabled, &[disabled]`]: {
      color: token.colorTextDisabled,
      boxShadow: "none",
      cursor: "not-allowed",
      "&:hover": {
        borderColor: `transparent transparent ${token.colorBorder} transparent`
      }
    },
    "input[disabled], textarea[disabled]": {
      cursor: "not-allowed"
    }
  }), genUnderlinedStatusStyle(token, {
    status: "error",
    borderColor: token.colorError,
    hoverBorderColor: token.colorErrorBorderHover,
    activeBorderColor: token.colorError,
    activeShadow: token.errorActiveShadow,
    affixColor: token.colorError
  })), genUnderlinedStatusStyle(token, {
    status: "warning",
    borderColor: token.colorWarning,
    hoverBorderColor: token.colorWarningBorderHover,
    activeBorderColor: token.colorWarning,
    activeShadow: token.warningActiveShadow,
    affixColor: token.colorWarning
  })), extraStyles)
});
const genPlaceholderStyle = (color) => ({
  // Firefox
  "&::-moz-placeholder": {
    opacity: 1
  },
  "&::placeholder": {
    color,
    userSelect: "none"
    // https://github.com/ant-design/ant-design/pull/32639
  },
  "&:placeholder-shown": {
    textOverflow: "ellipsis"
  }
});
const genInputLargeStyle = (token) => {
  const {
    paddingBlockLG,
    lineHeightLG,
    borderRadiusLG,
    paddingInlineLG
  } = token;
  return {
    padding: `${unit(paddingBlockLG)} ${unit(paddingInlineLG)}`,
    fontSize: token.inputFontSizeLG,
    lineHeight: lineHeightLG,
    borderRadius: borderRadiusLG
  };
};
const genInputSmallStyle = (token) => ({
  padding: `${unit(token.paddingBlockSM)} ${unit(token.paddingInlineSM)}`,
  fontSize: token.inputFontSizeSM,
  borderRadius: token.borderRadiusSM
});
const genBasicInputStyle = (token) => Object.assign(Object.assign({
  position: "relative",
  display: "inline-block",
  width: "100%",
  minWidth: 0,
  padding: `${unit(token.paddingBlock)} ${unit(token.paddingInline)}`,
  color: token.colorText,
  fontSize: token.inputFontSize,
  lineHeight: token.lineHeight,
  borderRadius: token.borderRadius,
  transition: `all ${token.motionDurationMid}`
}, genPlaceholderStyle(token.colorTextPlaceholder)), {
  // Size
  "&-lg": Object.assign({}, genInputLargeStyle(token)),
  "&-sm": Object.assign({}, genInputSmallStyle(token)),
  // RTL
  "&-rtl, &-textarea-rtl": {
    direction: "rtl"
  }
});
const genInputGroupStyle = (token) => {
  const {
    componentCls,
    antCls
  } = token;
  return {
    position: "relative",
    display: "table",
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: 0,
    // Undo padding and float of grid classes
    "&[class*='col-']": {
      paddingInlineEnd: token.paddingXS,
      "&:last-child": {
        paddingInlineEnd: 0
      }
    },
    // Sizing options
    [`&-lg ${componentCls}, &-lg > ${componentCls}-group-addon`]: Object.assign({}, genInputLargeStyle(token)),
    [`&-sm ${componentCls}, &-sm > ${componentCls}-group-addon`]: Object.assign({}, genInputSmallStyle(token)),
    // Fix https://github.com/ant-design/ant-design/issues/5754
    [`&-lg ${antCls}-select-single ${antCls}-select-selector`]: {
      height: token.controlHeightLG
    },
    [`&-sm ${antCls}-select-single ${antCls}-select-selector`]: {
      height: token.controlHeightSM
    },
    [`> ${componentCls}`]: {
      display: "table-cell",
      "&:not(:first-child):not(:last-child)": {
        borderRadius: 0
      }
    },
    [`${componentCls}-group`]: {
      "&-addon, &-wrap": {
        display: "table-cell",
        width: 1,
        whiteSpace: "nowrap",
        verticalAlign: "middle",
        "&:not(:first-child):not(:last-child)": {
          borderRadius: 0
        }
      },
      "&-wrap > *": {
        display: "block !important"
      },
      "&-addon": {
        position: "relative",
        padding: `0 ${unit(token.paddingInline)}`,
        color: token.colorText,
        fontWeight: "normal",
        fontSize: token.inputFontSize,
        textAlign: "center",
        borderRadius: token.borderRadius,
        transition: `all ${token.motionDurationSlow}`,
        lineHeight: 1,
        // Reset Select's style in addon
        [`${antCls}-select`]: {
          margin: `${unit(token.calc(token.paddingBlock).add(1).mul(-1).equal())} ${unit(token.calc(token.paddingInline).mul(-1).equal())}`,
          [`&${antCls}-select-single:not(${antCls}-select-customize-input):not(${antCls}-pagination-size-changer)`]: {
            [`${antCls}-select-selector`]: {
              backgroundColor: "inherit",
              border: `${unit(token.lineWidth)} ${token.lineType} transparent`,
              boxShadow: "none"
            }
          }
        },
        // https://github.com/ant-design/ant-design/issues/31333
        [`${antCls}-cascader-picker`]: {
          margin: `-9px ${unit(token.calc(token.paddingInline).mul(-1).equal())}`,
          backgroundColor: "transparent",
          [`${antCls}-cascader-input`]: {
            textAlign: "start",
            border: 0,
            boxShadow: "none"
          }
        }
      }
    },
    [componentCls]: {
      width: "100%",
      marginBottom: 0,
      textAlign: "inherit",
      "&:focus": {
        zIndex: 1,
        // Fix https://gw.alipayobjects.com/zos/rmsportal/DHNpoqfMXSfrSnlZvhsJ.png
        borderInlineEndWidth: 1
      },
      "&:hover": {
        zIndex: 1,
        borderInlineEndWidth: 1,
        [`${componentCls}-search-with-button &`]: {
          zIndex: 0
        }
      }
    },
    // Reset rounded corners
    [`> ${componentCls}:first-child, ${componentCls}-group-addon:first-child`]: {
      borderStartEndRadius: 0,
      borderEndEndRadius: 0,
      // Reset Select's style in addon
      [`${antCls}-select ${antCls}-select-selector`]: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0
      }
    },
    [`> ${componentCls}-affix-wrapper`]: {
      [`&:not(:first-child) ${componentCls}`]: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0
      },
      [`&:not(:last-child) ${componentCls}`]: {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0
      }
    },
    [`> ${componentCls}:last-child, ${componentCls}-group-addon:last-child`]: {
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      // Reset Select's style in addon
      [`${antCls}-select ${antCls}-select-selector`]: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0
      }
    },
    [`${componentCls}-affix-wrapper`]: {
      "&:not(:last-child)": {
        borderStartEndRadius: 0,
        borderEndEndRadius: 0,
        [`${componentCls}-search &`]: {
          borderStartStartRadius: token.borderRadius,
          borderEndStartRadius: token.borderRadius
        }
      },
      [`&:not(:first-child), ${componentCls}-search &:not(:first-child)`]: {
        borderStartStartRadius: 0,
        borderEndStartRadius: 0
      }
    },
    [`&${componentCls}-group-compact`]: Object.assign(Object.assign({
      display: "block"
    }, clearFix()), {
      [`${componentCls}-group-addon, ${componentCls}-group-wrap, > ${componentCls}`]: {
        "&:not(:first-child):not(:last-child)": {
          borderInlineEndWidth: token.lineWidth,
          "&:hover, &:focus": {
            zIndex: 1
          }
        }
      },
      "& > *": {
        display: "inline-flex",
        float: "none",
        verticalAlign: "top",
        // https://github.com/ant-design/ant-design-pro/issues/139
        borderRadius: 0
      },
      [`
        & > ${componentCls}-affix-wrapper,
        & > ${componentCls}-number-affix-wrapper,
        & > ${antCls}-picker-range
      `]: {
        display: "inline-flex"
      },
      "& > *:not(:last-child)": {
        marginInlineEnd: token.calc(token.lineWidth).mul(-1).equal(),
        borderInlineEndWidth: token.lineWidth
      },
      // Undo float for .ant-input-group .ant-input
      [componentCls]: {
        float: "none"
      },
      // reset border for Select, DatePicker, AutoComplete, Cascader, Mention, TimePicker, Input
      [`& > ${antCls}-select > ${antCls}-select-selector,
      & > ${antCls}-select-auto-complete ${componentCls},
      & > ${antCls}-cascader-picker ${componentCls},
      & > ${componentCls}-group-wrapper ${componentCls}`]: {
        borderInlineEndWidth: token.lineWidth,
        borderRadius: 0,
        "&:hover, &:focus": {
          zIndex: 1
        }
      },
      [`& > ${antCls}-select-focused`]: {
        zIndex: 1
      },
      // update z-index for arrow icon
      [`& > ${antCls}-select > ${antCls}-select-arrow`]: {
        zIndex: 1
        // https://github.com/ant-design/ant-design/issues/20371
      },
      [`& > *:first-child,
      & > ${antCls}-select:first-child > ${antCls}-select-selector,
      & > ${antCls}-select-auto-complete:first-child ${componentCls},
      & > ${antCls}-cascader-picker:first-child ${componentCls}`]: {
        borderStartStartRadius: token.borderRadius,
        borderEndStartRadius: token.borderRadius
      },
      [`& > *:last-child,
      & > ${antCls}-select:last-child > ${antCls}-select-selector,
      & > ${antCls}-cascader-picker:last-child ${componentCls},
      & > ${antCls}-cascader-picker-focused:last-child ${componentCls}`]: {
        borderInlineEndWidth: token.lineWidth,
        borderStartEndRadius: token.borderRadius,
        borderEndEndRadius: token.borderRadius
      },
      // https://github.com/ant-design/ant-design/issues/12493
      [`& > ${antCls}-select-auto-complete ${componentCls}`]: {
        verticalAlign: "top"
      },
      [`${componentCls}-group-wrapper + ${componentCls}-group-wrapper`]: {
        marginInlineStart: token.calc(token.lineWidth).mul(-1).equal(),
        [`${componentCls}-affix-wrapper`]: {
          borderRadius: 0
        }
      },
      [`${componentCls}-group-wrapper:not(:last-child)`]: {
        [`&${componentCls}-search > ${componentCls}-group`]: {
          [`& > ${componentCls}-group-addon > ${componentCls}-search-button`]: {
            borderRadius: 0
          },
          [`& > ${componentCls}`]: {
            borderStartStartRadius: token.borderRadius,
            borderStartEndRadius: 0,
            borderEndEndRadius: 0,
            borderEndStartRadius: token.borderRadius
          }
        }
      }
    })
  };
};
const genInputStyle = (token) => {
  const {
    componentCls,
    controlHeightSM,
    lineWidth,
    calc
  } = token;
  const FIXED_CHROME_COLOR_HEIGHT = 16;
  const colorSmallPadding = calc(controlHeightSM).sub(calc(lineWidth).mul(2)).sub(FIXED_CHROME_COLOR_HEIGHT).div(2).equal();
  return {
    [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), genBasicInputStyle(token)), genOutlinedStyle(token)), genFilledStyle(token)), genBorderlessStyle(token)), genUnderlinedStyle(token)), {
      '&[type="color"]': {
        height: token.controlHeight,
        [`&${componentCls}-lg`]: {
          height: token.controlHeightLG
        },
        [`&${componentCls}-sm`]: {
          height: controlHeightSM,
          paddingTop: colorSmallPadding,
          paddingBottom: colorSmallPadding
        }
      },
      '&[type="search"]::-webkit-search-cancel-button, &[type="search"]::-webkit-search-decoration': {
        appearance: "none"
      }
    })
  };
};
const genAllowClearStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    // ========================= Input =========================
    [`${componentCls}-clear-icon`]: {
      margin: 0,
      padding: 0,
      lineHeight: 0,
      color: token.colorTextQuaternary,
      fontSize: token.fontSizeIcon,
      verticalAlign: -1,
      // https://github.com/ant-design/ant-design/pull/18151
      // https://codesandbox.io/s/wizardly-sun-u10br
      cursor: "pointer",
      transition: `color ${token.motionDurationSlow}`,
      border: "none",
      outline: "none",
      backgroundColor: "transparent",
      "&:hover": {
        color: token.colorIcon
      },
      "&:active": {
        color: token.colorText
      },
      "&-hidden": {
        visibility: "hidden"
      },
      "&-has-suffix": {
        margin: `0 ${unit(token.inputAffixPadding)}`
      }
    }
  };
};
const genAffixStyle = (token) => {
  const {
    componentCls,
    inputAffixPadding,
    colorTextDescription,
    motionDurationSlow,
    colorIcon,
    colorIconHover,
    iconCls
  } = token;
  const affixCls = `${componentCls}-affix-wrapper`;
  const affixClsDisabled = `${componentCls}-affix-wrapper-disabled`;
  return {
    [affixCls]: Object.assign(Object.assign(Object.assign(Object.assign({}, genBasicInputStyle(token)), {
      display: "inline-flex",
      [`&:not(${componentCls}-disabled):hover`]: {
        zIndex: 1,
        [`${componentCls}-search-with-button &`]: {
          zIndex: 0
        }
      },
      "&-focused, &:focus": {
        zIndex: 1
      },
      [`> input${componentCls}`]: {
        padding: 0
      },
      [`> input${componentCls}, > textarea${componentCls}`]: {
        fontSize: "inherit",
        border: "none",
        borderRadius: 0,
        outline: "none",
        background: "transparent",
        color: "inherit",
        "&::-ms-reveal": {
          display: "none"
        },
        "&:focus": {
          boxShadow: "none !important"
        }
      },
      "&::before": {
        display: "inline-block",
        width: 0,
        visibility: "hidden",
        content: '"\\a0"'
      },
      [componentCls]: {
        "&-prefix, &-suffix": {
          display: "flex",
          flex: "none",
          alignItems: "center",
          "> *:not(:last-child)": {
            marginInlineEnd: token.paddingXS
          }
        },
        "&-show-count-suffix": {
          color: colorTextDescription,
          direction: "ltr"
        },
        "&-show-count-has-suffix": {
          marginInlineEnd: token.paddingXXS
        },
        "&-prefix": {
          marginInlineEnd: inputAffixPadding
        },
        "&-suffix": {
          marginInlineStart: inputAffixPadding
        }
      }
    }), genAllowClearStyle(token)), {
      // password
      [`${iconCls}${componentCls}-password-icon`]: {
        color: colorIcon,
        cursor: "pointer",
        transition: `all ${motionDurationSlow}`,
        "&:hover": {
          color: colorIconHover
        }
      }
    }),
    // 覆盖 affix-wrapper borderRadius！
    [`${componentCls}-underlined`]: {
      borderRadius: 0
    },
    [affixClsDisabled]: {
      // password disabled
      [`${iconCls}${componentCls}-password-icon`]: {
        color: colorIcon,
        cursor: "not-allowed",
        "&:hover": {
          color: colorIcon
        }
      }
    }
  };
};
const genGroupStyle = (token) => {
  const {
    componentCls,
    borderRadiusLG,
    borderRadiusSM
  } = token;
  return {
    [`${componentCls}-group`]: Object.assign(Object.assign(Object.assign({}, resetComponent(token)), genInputGroupStyle(token)), {
      "&-rtl": {
        direction: "rtl"
      },
      "&-wrapper": Object.assign(Object.assign(Object.assign({
        display: "inline-block",
        width: "100%",
        textAlign: "start",
        verticalAlign: "top",
        "&-rtl": {
          direction: "rtl"
        },
        // Size
        "&-lg": {
          [`${componentCls}-group-addon`]: {
            borderRadius: borderRadiusLG,
            fontSize: token.inputFontSizeLG
          }
        },
        "&-sm": {
          [`${componentCls}-group-addon`]: {
            borderRadius: borderRadiusSM
          }
        }
      }, genOutlinedGroupStyle(token)), genFilledGroupStyle(token)), {
        // '&-disabled': {
        //   [`${componentCls}-group-addon`]: {
        //     ...genDisabledStyle(token),
        //   },
        // },
        // Fix the issue of using icons in Space Compact mode
        // https://github.com/ant-design/ant-design/issues/42122
        [`&:not(${componentCls}-compact-first-item):not(${componentCls}-compact-last-item)${componentCls}-compact-item`]: {
          [`${componentCls}, ${componentCls}-group-addon`]: {
            borderRadius: 0
          }
        },
        [`&:not(${componentCls}-compact-last-item)${componentCls}-compact-first-item`]: {
          [`${componentCls}, ${componentCls}-group-addon`]: {
            borderStartEndRadius: 0,
            borderEndEndRadius: 0
          }
        },
        [`&:not(${componentCls}-compact-first-item)${componentCls}-compact-last-item`]: {
          [`${componentCls}, ${componentCls}-group-addon`]: {
            borderStartStartRadius: 0,
            borderEndStartRadius: 0
          }
        },
        // Fix the issue of input use show-count param in space compact mode
        // https://github.com/ant-design/ant-design/issues/46872
        [`&:not(${componentCls}-compact-last-item)${componentCls}-compact-item`]: {
          [`${componentCls}-affix-wrapper`]: {
            borderStartEndRadius: 0,
            borderEndEndRadius: 0
          }
        },
        // Fix the issue of input use `addonAfter` param in space compact mode
        // https://github.com/ant-design/ant-design/issues/52483
        [`&:not(${componentCls}-compact-first-item)${componentCls}-compact-item`]: {
          [`${componentCls}-affix-wrapper`]: {
            borderStartStartRadius: 0,
            borderEndStartRadius: 0
          }
        }
      })
    })
  };
};
const genSearchInputStyle = (token) => {
  const {
    componentCls,
    antCls
  } = token;
  const searchPrefixCls = `${componentCls}-search`;
  return {
    [searchPrefixCls]: {
      [componentCls]: {
        "&:hover, &:focus": {
          [`+ ${componentCls}-group-addon ${searchPrefixCls}-button:not(${antCls}-btn-color-primary):not(${antCls}-btn-variant-text)`]: {
            borderInlineStartColor: token.colorPrimaryHover
          }
        }
      },
      [`${componentCls}-affix-wrapper`]: {
        height: token.controlHeight,
        borderRadius: 0
      },
      // fix slight height diff in Firefox:
      // https://ant.design/components/auto-complete-cn/#auto-complete-demo-certain-category
      [`${componentCls}-lg`]: {
        lineHeight: token.calc(token.lineHeightLG).sub(2e-4).equal()
      },
      [`> ${componentCls}-group`]: {
        [`> ${componentCls}-group-addon:last-child`]: {
          insetInlineStart: -1,
          padding: 0,
          border: 0,
          [`${searchPrefixCls}-button`]: {
            // Fix https://github.com/ant-design/ant-design/issues/47150
            marginInlineEnd: -1,
            borderStartStartRadius: 0,
            borderEndStartRadius: 0,
            boxShadow: "none"
          },
          [`${searchPrefixCls}-button:not(${antCls}-btn-color-primary)`]: {
            color: token.colorTextDescription,
            "&:hover": {
              color: token.colorPrimaryHover
            },
            "&:active": {
              color: token.colorPrimaryActive
            },
            [`&${antCls}-btn-loading::before`]: {
              inset: 0
            }
          }
        }
      },
      [`${searchPrefixCls}-button`]: {
        height: token.controlHeight,
        "&:hover, &:focus": {
          zIndex: 1
        }
      },
      "&-large": {
        [`${componentCls}-affix-wrapper, ${searchPrefixCls}-button`]: {
          height: token.controlHeightLG
        }
      },
      "&-small": {
        [`${componentCls}-affix-wrapper, ${searchPrefixCls}-button`]: {
          height: token.controlHeightSM
        }
      },
      "&-rtl": {
        direction: "rtl"
      },
      // ===================== Compact Item Customized Styles =====================
      [`&${componentCls}-compact-item`]: {
        [`&:not(${componentCls}-compact-last-item)`]: {
          [`${componentCls}-group-addon`]: {
            [`${componentCls}-search-button`]: {
              marginInlineEnd: token.calc(token.lineWidth).mul(-1).equal(),
              borderRadius: 0
            }
          }
        },
        [`&:not(${componentCls}-compact-first-item)`]: {
          [`${componentCls},${componentCls}-affix-wrapper`]: {
            borderRadius: 0
          }
        },
        [`> ${componentCls}-group-addon ${componentCls}-search-button,
        > ${componentCls},
        ${componentCls}-affix-wrapper`]: {
          "&:hover, &:focus, &:active": {
            zIndex: 2
          }
        },
        [`> ${componentCls}-affix-wrapper-focused`]: {
          zIndex: 2
        }
      }
    }
  };
};
const genRangeStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-out-of-range`]: {
      [`&, & input, & textarea, ${componentCls}-show-count-suffix, ${componentCls}-data-count`]: {
        color: token.colorError
      }
    }
  };
};
const useSharedStyle = genStyleHooks(["Input", "Shared"], (token) => {
  const inputToken = merge$1(token, initInputToken(token));
  return [genInputStyle(inputToken), genAffixStyle(inputToken)];
}, initComponentToken$1, {
  resetFont: false
});
const useStyle$g = genStyleHooks(["Input", "Component"], (token) => {
  const inputToken = merge$1(token, initInputToken(token));
  return [
    genGroupStyle(inputToken),
    genSearchInputStyle(inputToken),
    genRangeStyle(inputToken),
    // =====================================================
    // ==             Space Compact                       ==
    // =====================================================
    genCompactItemStyle(inputToken)
  ];
}, initComponentToken$1, {
  resetFont: false
});
const genSize = (token, suffix) => {
  const {
    componentCls,
    controlHeight
  } = token;
  const suffixCls = suffix ? `${componentCls}-${suffix}` : "";
  const multipleSelectorUnit = getMultipleSelectorUnit(token);
  return [
    // genSelectionStyle(token, suffix),
    {
      [`${componentCls}-multiple${suffixCls}`]: {
        paddingBlock: multipleSelectorUnit.containerPadding,
        paddingInlineStart: multipleSelectorUnit.basePadding,
        minHeight: controlHeight,
        // ======================== Selections ========================
        [`${componentCls}-selection-item`]: {
          height: multipleSelectorUnit.itemHeight,
          lineHeight: unit(multipleSelectorUnit.itemLineHeight)
        }
      }
    }
  ];
};
const genPickerMultipleStyle = (token) => {
  const {
    componentCls,
    calc,
    lineWidth
  } = token;
  const smallToken = merge$1(token, {
    fontHeight: token.fontSize,
    selectHeight: token.controlHeightSM,
    multipleSelectItemHeight: token.multipleItemHeightSM,
    borderRadius: token.borderRadiusSM,
    borderRadiusSM: token.borderRadiusXS,
    controlHeight: token.controlHeightSM
  });
  const largeToken = merge$1(token, {
    fontHeight: calc(token.multipleItemHeightLG).sub(calc(lineWidth).mul(2).equal()).equal(),
    fontSize: token.fontSizeLG,
    selectHeight: token.controlHeightLG,
    multipleSelectItemHeight: token.multipleItemHeightLG,
    borderRadius: token.borderRadiusLG,
    borderRadiusSM: token.borderRadius,
    controlHeight: token.controlHeightLG
  });
  return [
    // ======================== Size ========================
    genSize(smallToken, "small"),
    genSize(token),
    genSize(largeToken, "large"),
    // ====================== Selection ======================
    {
      [`${componentCls}${componentCls}-multiple`]: Object.assign(Object.assign({
        width: "100%",
        cursor: "text",
        // ==================== Selector =====================
        [`${componentCls}-selector`]: {
          flex: "auto",
          padding: 0,
          position: "relative",
          "&:after": {
            margin: 0
          },
          // ================== placeholder ==================
          [`${componentCls}-selection-placeholder`]: {
            position: "absolute",
            top: "50%",
            insetInlineStart: token.inputPaddingHorizontalBase,
            insetInlineEnd: 0,
            transform: "translateY(-50%)",
            transition: `all ${token.motionDurationSlow}`,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            flex: 1,
            color: token.colorTextPlaceholder,
            pointerEvents: "none"
          }
        }
      }, genOverflowStyle(token)), {
        // ====================== Input ======================
        // Input is `readonly`, which is used for a11y only
        [`${componentCls}-multiple-input`]: {
          width: 0,
          height: 0,
          border: 0,
          visibility: "hidden",
          position: "absolute",
          zIndex: -1
        }
      })
    }
  ];
};
const genPickerCellInnerStyle = (token) => {
  const {
    pickerCellCls,
    pickerCellInnerCls,
    cellHeight,
    borderRadiusSM,
    motionDurationMid,
    cellHoverBg,
    lineWidth,
    lineType,
    colorPrimary,
    cellActiveWithRangeBg,
    colorTextLightSolid,
    colorTextDisabled,
    cellBgDisabled,
    colorFillSecondary
  } = token;
  return {
    "&::before": {
      position: "absolute",
      top: "50%",
      insetInlineStart: 0,
      insetInlineEnd: 0,
      zIndex: 1,
      height: cellHeight,
      transform: "translateY(-50%)",
      content: '""',
      pointerEvents: "none"
    },
    // >>> Default
    [pickerCellInnerCls]: {
      position: "relative",
      zIndex: 2,
      display: "inline-block",
      minWidth: cellHeight,
      height: cellHeight,
      lineHeight: unit(cellHeight),
      borderRadius: borderRadiusSM,
      transition: `background ${motionDurationMid}`
    },
    // >>> Hover
    [`&:hover:not(${pickerCellCls}-in-view):not(${pickerCellCls}-disabled),
    &:hover:not(${pickerCellCls}-selected):not(${pickerCellCls}-range-start):not(${pickerCellCls}-range-end):not(${pickerCellCls}-disabled)`]: {
      [pickerCellInnerCls]: {
        background: cellHoverBg
      }
    },
    // >>> Today
    [`&-in-view${pickerCellCls}-today ${pickerCellInnerCls}`]: {
      "&::before": {
        position: "absolute",
        top: 0,
        insetInlineEnd: 0,
        bottom: 0,
        insetInlineStart: 0,
        zIndex: 1,
        border: `${unit(lineWidth)} ${lineType} ${colorPrimary}`,
        borderRadius: borderRadiusSM,
        content: '""'
      }
    },
    // >>> In Range
    [`&-in-view${pickerCellCls}-in-range,
      &-in-view${pickerCellCls}-range-start,
      &-in-view${pickerCellCls}-range-end`]: {
      position: "relative",
      [`&:not(${pickerCellCls}-disabled):before`]: {
        background: cellActiveWithRangeBg
      }
    },
    // >>> Selected
    [`&-in-view${pickerCellCls}-selected,
      &-in-view${pickerCellCls}-range-start,
      &-in-view${pickerCellCls}-range-end`]: {
      [`&:not(${pickerCellCls}-disabled) ${pickerCellInnerCls}`]: {
        color: colorTextLightSolid,
        background: colorPrimary
      },
      [`&${pickerCellCls}-disabled ${pickerCellInnerCls}`]: {
        background: colorFillSecondary
      }
    },
    [`&-in-view${pickerCellCls}-range-start:not(${pickerCellCls}-disabled):before`]: {
      insetInlineStart: "50%"
    },
    [`&-in-view${pickerCellCls}-range-end:not(${pickerCellCls}-disabled):before`]: {
      insetInlineEnd: "50%"
    },
    // range start border-radius
    [`&-in-view${pickerCellCls}-range-start:not(${pickerCellCls}-range-end) ${pickerCellInnerCls}`]: {
      borderStartStartRadius: borderRadiusSM,
      borderEndStartRadius: borderRadiusSM,
      borderStartEndRadius: 0,
      borderEndEndRadius: 0
    },
    // range end border-radius
    [`&-in-view${pickerCellCls}-range-end:not(${pickerCellCls}-range-start) ${pickerCellInnerCls}`]: {
      borderStartStartRadius: 0,
      borderEndStartRadius: 0,
      borderStartEndRadius: borderRadiusSM,
      borderEndEndRadius: borderRadiusSM
    },
    // >>> Disabled
    "&-disabled": {
      color: colorTextDisabled,
      cursor: "not-allowed",
      [pickerCellInnerCls]: {
        background: "transparent"
      },
      "&::before": {
        background: cellBgDisabled
      }
    },
    [`&-disabled${pickerCellCls}-today ${pickerCellInnerCls}::before`]: {
      borderColor: colorTextDisabled
    }
  };
};
const genPanelStyle = (token) => {
  const {
    componentCls,
    pickerCellCls,
    pickerCellInnerCls,
    pickerYearMonthCellWidth,
    pickerControlIconSize,
    cellWidth,
    paddingSM,
    paddingXS,
    paddingXXS,
    colorBgContainer,
    lineWidth,
    lineType,
    borderRadiusLG,
    colorPrimary,
    colorTextHeading,
    colorSplit,
    pickerControlIconBorderWidth,
    colorIcon,
    textHeight,
    motionDurationMid,
    colorIconHover,
    fontWeightStrong,
    cellHeight,
    pickerCellPaddingVertical,
    colorTextDisabled,
    colorText,
    fontSize,
    motionDurationSlow,
    withoutTimeCellHeight,
    pickerQuarterPanelContentHeight,
    borderRadiusSM,
    colorTextLightSolid,
    cellHoverBg,
    timeColumnHeight,
    timeColumnWidth,
    timeCellHeight,
    controlItemBgActive,
    marginXXS,
    pickerDatePanelPaddingHorizontal,
    pickerControlIconMargin
  } = token;
  const pickerPanelWidth = token.calc(cellWidth).mul(7).add(token.calc(pickerDatePanelPaddingHorizontal).mul(2)).equal();
  return {
    [componentCls]: {
      "&-panel": {
        display: "inline-flex",
        flexDirection: "column",
        textAlign: "center",
        background: colorBgContainer,
        borderRadius: borderRadiusLG,
        outline: "none",
        "&-focused": {
          borderColor: colorPrimary
        },
        "&-rtl": {
          [`${componentCls}-prev-icon,
              ${componentCls}-super-prev-icon`]: {
            transform: "rotate(45deg)"
          },
          [`${componentCls}-next-icon,
              ${componentCls}-super-next-icon`]: {
            transform: "rotate(-135deg)"
          },
          [`${componentCls}-time-panel`]: {
            [`${componentCls}-content`]: {
              direction: "ltr",
              "> *": {
                direction: "rtl"
              }
            }
          }
        }
      },
      // ========================================================
      // =                     Shared Panel                     =
      // ========================================================
      [`&-decade-panel,
        &-year-panel,
        &-quarter-panel,
        &-month-panel,
        &-week-panel,
        &-date-panel,
        &-time-panel`]: {
        display: "flex",
        flexDirection: "column",
        width: pickerPanelWidth
      },
      // ======================= Header =======================
      "&-header": {
        display: "flex",
        padding: `0 ${unit(paddingXS)}`,
        color: colorTextHeading,
        borderBottom: `${unit(lineWidth)} ${lineType} ${colorSplit}`,
        "> *": {
          flex: "none"
        },
        button: {
          padding: 0,
          color: colorIcon,
          lineHeight: unit(textHeight),
          background: "transparent",
          border: 0,
          cursor: "pointer",
          transition: `color ${motionDurationMid}`,
          fontSize: "inherit",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          "&:empty": {
            display: "none"
          }
        },
        "> button": {
          minWidth: "1.6em",
          fontSize,
          "&:hover": {
            color: colorIconHover
          },
          "&:disabled": {
            opacity: 0.25,
            pointerEvents: "none"
          }
        },
        "&-view": {
          flex: "auto",
          fontWeight: fontWeightStrong,
          lineHeight: unit(textHeight),
          "> button": {
            color: "inherit",
            fontWeight: "inherit",
            verticalAlign: "top",
            "&:not(:first-child)": {
              marginInlineStart: paddingXS
            },
            "&:hover": {
              color: colorPrimary
            }
          }
        }
      },
      // Arrow button
      [`&-prev-icon,
        &-next-icon,
        &-super-prev-icon,
        &-super-next-icon`]: {
        position: "relative",
        width: pickerControlIconSize,
        height: pickerControlIconSize,
        "&::before": {
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          width: pickerControlIconSize,
          height: pickerControlIconSize,
          border: `0 solid currentcolor`,
          borderBlockStartWidth: pickerControlIconBorderWidth,
          borderInlineStartWidth: pickerControlIconBorderWidth,
          content: '""'
        }
      },
      [`&-super-prev-icon,
        &-super-next-icon`]: {
        "&::after": {
          position: "absolute",
          top: pickerControlIconMargin,
          insetInlineStart: pickerControlIconMargin,
          display: "inline-block",
          width: pickerControlIconSize,
          height: pickerControlIconSize,
          border: "0 solid currentcolor",
          borderBlockStartWidth: pickerControlIconBorderWidth,
          borderInlineStartWidth: pickerControlIconBorderWidth,
          content: '""'
        }
      },
      "&-prev-icon, &-super-prev-icon": {
        transform: "rotate(-45deg)"
      },
      "&-next-icon, &-super-next-icon": {
        transform: "rotate(135deg)"
      },
      // ======================== Body ========================
      "&-content": {
        width: "100%",
        tableLayout: "fixed",
        borderCollapse: "collapse",
        "th, td": {
          position: "relative",
          minWidth: cellHeight,
          fontWeight: "normal"
        },
        th: {
          height: token.calc(cellHeight).add(token.calc(pickerCellPaddingVertical).mul(2)).equal(),
          color: colorText,
          verticalAlign: "middle"
        }
      },
      "&-cell": Object.assign({
        padding: `${unit(pickerCellPaddingVertical)} 0`,
        color: colorTextDisabled,
        cursor: "pointer",
        // In view
        "&-in-view": {
          color: colorText
        }
      }, genPickerCellInnerStyle(token)),
      [`&-decade-panel,
        &-year-panel,
        &-quarter-panel,
        &-month-panel`]: {
        [`${componentCls}-content`]: {
          height: token.calc(withoutTimeCellHeight).mul(4).equal()
        },
        [pickerCellInnerCls]: {
          padding: `0 ${unit(paddingXS)}`
        }
      },
      "&-quarter-panel": {
        [`${componentCls}-content`]: {
          height: pickerQuarterPanelContentHeight
        }
      },
      // ========================================================
      // =                       Special                        =
      // ========================================================
      // ===================== Decade Panel =====================
      "&-decade-panel": {
        [pickerCellInnerCls]: {
          padding: `0 ${unit(token.calc(paddingXS).div(2).equal())}`
        },
        [`${componentCls}-cell::before`]: {
          display: "none"
        }
      },
      // ============= Year & Quarter & Month Panel =============
      [`&-year-panel,
        &-quarter-panel,
        &-month-panel`]: {
        [`${componentCls}-body`]: {
          padding: `0 ${unit(paddingXS)}`
        },
        [pickerCellInnerCls]: {
          width: pickerYearMonthCellWidth
        }
      },
      // ====================== Date Panel ======================
      "&-date-panel": {
        [`${componentCls}-body`]: {
          padding: `${unit(paddingXS)} ${unit(pickerDatePanelPaddingHorizontal)}`
        },
        [`${componentCls}-content th`]: {
          boxSizing: "border-box",
          padding: 0
        }
      },
      // ====================== Week Panel ======================
      "&-week-panel": {
        // Clear cell style
        [`${componentCls}-cell`]: {
          [`&:hover ${pickerCellInnerCls},
            &-selected ${pickerCellInnerCls},
            ${pickerCellInnerCls}`]: {
            background: "transparent !important"
          }
        },
        "&-row": {
          td: {
            "&:before": {
              transition: `background ${motionDurationMid}`
            },
            "&:first-child:before": {
              borderStartStartRadius: borderRadiusSM,
              borderEndStartRadius: borderRadiusSM
            },
            "&:last-child:before": {
              borderStartEndRadius: borderRadiusSM,
              borderEndEndRadius: borderRadiusSM
            }
          },
          "&:hover td:before": {
            background: cellHoverBg
          },
          "&-range-start td, &-range-end td, &-selected td, &-hover td": {
            // Rise priority to override hover style
            [`&${pickerCellCls}`]: {
              "&:before": {
                background: colorPrimary
              },
              [`&${componentCls}-cell-week`]: {
                color: new FastColor(colorTextLightSolid).setA(0.5).toHexString()
              },
              [pickerCellInnerCls]: {
                color: colorTextLightSolid
              }
            }
          },
          "&-range-hover td:before": {
            background: controlItemBgActive
          }
        }
      },
      // >>> ShowWeek
      "&-week-panel, &-date-panel-show-week": {
        [`${componentCls}-body`]: {
          padding: `${unit(paddingXS)} ${unit(paddingSM)}`
        },
        [`${componentCls}-content th`]: {
          width: "auto"
        }
      },
      // ==================== Datetime Panel ====================
      "&-datetime-panel": {
        display: "flex",
        [`${componentCls}-time-panel`]: {
          borderInlineStart: `${unit(lineWidth)} ${lineType} ${colorSplit}`
        },
        [`${componentCls}-date-panel,
          ${componentCls}-time-panel`]: {
          transition: `opacity ${motionDurationSlow}`
        },
        // Keyboard
        "&-active": {
          [`${componentCls}-date-panel,
            ${componentCls}-time-panel`]: {
            opacity: 0.3,
            "&-active": {
              opacity: 1
            }
          }
        }
      },
      // ====================== Time Panel ======================
      "&-time-panel": {
        width: "auto",
        minWidth: "auto",
        [`${componentCls}-content`]: {
          display: "flex",
          flex: "auto",
          height: timeColumnHeight
        },
        "&-column": {
          flex: "1 0 auto",
          width: timeColumnWidth,
          margin: `${unit(paddingXXS)} 0`,
          padding: 0,
          overflowY: "hidden",
          textAlign: "start",
          listStyle: "none",
          transition: `background ${motionDurationMid}`,
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: 8,
            backgroundColor: "transparent"
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: token.colorTextTertiary,
            borderRadius: token.borderRadiusSM
          },
          // For Firefox
          "&": {
            scrollbarWidth: "thin",
            scrollbarColor: `${token.colorTextTertiary} transparent`
          },
          "&::after": {
            display: "block",
            height: `calc(100% - ${unit(timeCellHeight)})`,
            content: '""'
          },
          "&:not(:first-child)": {
            borderInlineStart: `${unit(lineWidth)} ${lineType} ${colorSplit}`
          },
          "&-active": {
            background: new FastColor(controlItemBgActive).setA(0.2).toHexString()
          },
          "&:hover": {
            overflowY: "auto"
          },
          "> li": {
            margin: 0,
            padding: 0,
            [`&${componentCls}-time-panel-cell`]: {
              marginInline: marginXXS,
              [`${componentCls}-time-panel-cell-inner`]: {
                display: "block",
                width: token.calc(timeColumnWidth).sub(token.calc(marginXXS).mul(2)).equal(),
                height: timeCellHeight,
                margin: 0,
                paddingBlock: 0,
                paddingInlineEnd: 0,
                paddingInlineStart: token.calc(timeColumnWidth).sub(timeCellHeight).div(2).equal(),
                color: colorText,
                lineHeight: unit(timeCellHeight),
                borderRadius: borderRadiusSM,
                cursor: "pointer",
                transition: `background ${motionDurationMid}`,
                "&:hover": {
                  background: cellHoverBg
                }
              },
              "&-selected": {
                [`${componentCls}-time-panel-cell-inner`]: {
                  background: controlItemBgActive
                }
              },
              "&-disabled": {
                [`${componentCls}-time-panel-cell-inner`]: {
                  color: colorTextDisabled,
                  background: "transparent",
                  cursor: "not-allowed"
                }
              }
            }
          }
        }
      }
    }
  };
};
const genPickerPanelStyle = (token) => {
  const {
    componentCls,
    textHeight,
    lineWidth,
    paddingSM,
    antCls,
    colorPrimary,
    cellActiveWithRangeBg,
    colorPrimaryBorder,
    lineType,
    colorSplit
  } = token;
  return {
    [`${componentCls}-dropdown`]: {
      // ======================== Footer ========================
      [`${componentCls}-footer`]: {
        borderTop: `${unit(lineWidth)} ${lineType} ${colorSplit}`,
        "&-extra": {
          padding: `0 ${unit(paddingSM)}`,
          lineHeight: unit(token.calc(textHeight).sub(token.calc(lineWidth).mul(2)).equal()),
          textAlign: "start",
          "&:not(:last-child)": {
            borderBottom: `${unit(lineWidth)} ${lineType} ${colorSplit}`
          }
        }
      },
      // ==================== Footer > Ranges ===================
      [`${componentCls}-panels + ${componentCls}-footer ${componentCls}-ranges`]: {
        justifyContent: "space-between"
      },
      [`${componentCls}-ranges`]: {
        marginBlock: 0,
        paddingInline: unit(paddingSM),
        overflow: "hidden",
        textAlign: "start",
        listStyle: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "> li": {
          lineHeight: unit(token.calc(textHeight).sub(token.calc(lineWidth).mul(2)).equal()),
          display: "inline-block"
        },
        [`${componentCls}-now-btn-disabled`]: {
          pointerEvents: "none",
          color: token.colorTextDisabled
        },
        // https://github.com/ant-design/ant-design/issues/23687
        [`${componentCls}-preset > ${antCls}-tag-blue`]: {
          color: colorPrimary,
          background: cellActiveWithRangeBg,
          borderColor: colorPrimaryBorder,
          cursor: "pointer"
        },
        [`${componentCls}-ok`]: {
          paddingBlock: token.calc(lineWidth).mul(2).equal(),
          marginInlineStart: "auto"
        }
      }
    }
  };
};
const initPickerPanelToken = (token) => {
  const {
    componentCls,
    controlHeightLG,
    paddingXXS,
    padding
  } = token;
  return {
    pickerCellCls: `${componentCls}-cell`,
    pickerCellInnerCls: `${componentCls}-cell-inner`,
    pickerYearMonthCellWidth: token.calc(controlHeightLG).mul(1.5).equal(),
    pickerQuarterPanelContentHeight: token.calc(controlHeightLG).mul(1.4).equal(),
    pickerCellPaddingVertical: token.calc(paddingXXS).add(token.calc(paddingXXS).div(2)).equal(),
    pickerCellBorderGap: 2,
    // Magic for gap between cells
    pickerControlIconSize: 7,
    pickerControlIconMargin: 4,
    pickerControlIconBorderWidth: 1.5,
    pickerDatePanelPaddingHorizontal: token.calc(padding).add(token.calc(paddingXXS).div(2)).equal()
    // 18 in normal
  };
};
const initPanelComponentToken = (token) => {
  const {
    colorBgContainerDisabled,
    controlHeight,
    controlHeightSM,
    controlHeightLG,
    paddingXXS,
    lineWidth
  } = token;
  const dblPaddingXXS = paddingXXS * 2;
  const dblLineWidth = lineWidth * 2;
  const multipleItemHeight = Math.min(controlHeight - dblPaddingXXS, controlHeight - dblLineWidth);
  const multipleItemHeightSM = Math.min(controlHeightSM - dblPaddingXXS, controlHeightSM - dblLineWidth);
  const multipleItemHeightLG = Math.min(controlHeightLG - dblPaddingXXS, controlHeightLG - dblLineWidth);
  const INTERNAL_FIXED_ITEM_MARGIN = Math.floor(paddingXXS / 2);
  const filledToken = {
    INTERNAL_FIXED_ITEM_MARGIN,
    cellHoverBg: token.controlItemBgHover,
    cellActiveWithRangeBg: token.controlItemBgActive,
    cellHoverWithRangeBg: new FastColor(token.colorPrimary).lighten(35).toHexString(),
    cellRangeBorderColor: new FastColor(token.colorPrimary).lighten(20).toHexString(),
    cellBgDisabled: colorBgContainerDisabled,
    timeColumnWidth: controlHeightLG * 1.4,
    timeColumnHeight: 28 * 8,
    timeCellHeight: 28,
    cellWidth: controlHeightSM * 1.5,
    cellHeight: controlHeightSM,
    textHeight: controlHeightLG,
    withoutTimeCellHeight: controlHeightLG * 1.65,
    multipleItemBg: token.colorFillSecondary,
    multipleItemBorderColor: "transparent",
    multipleItemHeight,
    multipleItemHeightSM,
    multipleItemHeightLG,
    multipleSelectorBgDisabled: colorBgContainerDisabled,
    multipleItemColorDisabled: token.colorTextDisabled,
    multipleItemBorderColorDisabled: "transparent"
  };
  return filledToken;
};
const prepareComponentToken$c = (token) => Object.assign(Object.assign(Object.assign(Object.assign({}, initComponentToken$1(token)), initPanelComponentToken(token)), getArrowToken(token)), {
  presetsWidth: 120,
  presetsMaxWidth: 200,
  zIndexPopup: token.zIndexPopupBase + 50
});
const genVariantsStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [componentCls]: [
      Object.assign(Object.assign(Object.assign(Object.assign({}, genOutlinedStyle(token)), genUnderlinedStyle(token)), genFilledStyle(token)), genBorderlessStyle(token)),
      // ========================= Multiple =========================
      {
        "&-outlined": {
          [`&${componentCls}-multiple ${componentCls}-selection-item`]: {
            background: token.multipleItemBg,
            border: `${unit(token.lineWidth)} ${token.lineType} ${token.multipleItemBorderColor}`
          }
        },
        "&-filled": {
          [`&${componentCls}-multiple ${componentCls}-selection-item`]: {
            background: token.colorBgContainer,
            border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorSplit}`
          }
        },
        "&-borderless": {
          [`&${componentCls}-multiple ${componentCls}-selection-item`]: {
            background: token.multipleItemBg,
            border: `${unit(token.lineWidth)} ${token.lineType} ${token.multipleItemBorderColor}`
          }
        },
        "&-underlined": {
          [`&${componentCls}-multiple ${componentCls}-selection-item`]: {
            background: token.multipleItemBg,
            border: `${unit(token.lineWidth)} ${token.lineType} ${token.multipleItemBorderColor}`
          }
        }
      }
    ]
  };
};
const genPickerPadding = (paddingBlock, paddingInline) => {
  return {
    padding: `${unit(paddingBlock)} ${unit(paddingInline)}`
  };
};
const genPickerStatusStyle = (token) => {
  const {
    componentCls,
    colorError,
    colorWarning
  } = token;
  return {
    [`${componentCls}:not(${componentCls}-disabled):not([disabled])`]: {
      [`&${componentCls}-status-error`]: {
        [`${componentCls}-active-bar`]: {
          background: colorError
        }
      },
      [`&${componentCls}-status-warning`]: {
        [`${componentCls}-active-bar`]: {
          background: colorWarning
        }
      }
    }
  };
};
const genPickerStyle = (token) => {
  var _a;
  const {
    componentCls,
    antCls,
    paddingInline,
    lineWidth,
    lineType,
    colorBorder,
    borderRadius,
    motionDurationMid,
    colorTextDisabled,
    colorTextPlaceholder,
    fontSizeLG,
    inputFontSizeLG,
    fontSizeSM,
    inputFontSizeSM,
    controlHeightSM,
    paddingInlineSM,
    paddingXS,
    marginXS,
    colorIcon,
    lineWidthBold,
    colorPrimary,
    motionDurationSlow,
    zIndexPopup,
    paddingXXS,
    sizePopupArrow,
    colorBgElevated,
    borderRadiusLG,
    boxShadowSecondary,
    borderRadiusSM,
    colorSplit,
    cellHoverBg,
    presetsWidth,
    presetsMaxWidth,
    boxShadowPopoverArrow,
    fontHeight,
    lineHeightLG
  } = token;
  return [
    {
      [componentCls]: Object.assign(Object.assign(Object.assign({}, resetComponent(token)), genPickerPadding(token.paddingBlock, token.paddingInline)), {
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        lineHeight: 1,
        borderRadius,
        transition: `border ${motionDurationMid}, box-shadow ${motionDurationMid}, background ${motionDurationMid}`,
        [`${componentCls}-prefix`]: {
          flex: "0 0 auto",
          marginInlineEnd: token.inputAffixPadding
        },
        // ======================== Input =========================
        [`${componentCls}-input`]: {
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          width: "100%",
          "> input": Object.assign(Object.assign({
            position: "relative",
            display: "inline-block",
            width: "100%",
            color: "inherit",
            fontSize: (_a = token.inputFontSize) !== null && _a !== void 0 ? _a : token.fontSize,
            lineHeight: token.lineHeight,
            transition: `all ${motionDurationMid}`
          }, genPlaceholderStyle(colorTextPlaceholder)), {
            flex: "auto",
            // Fix Firefox flex not correct:
            // https://github.com/ant-design/ant-design/pull/20023#issuecomment-564389553
            minWidth: 1,
            height: "auto",
            padding: 0,
            background: "transparent",
            border: 0,
            fontFamily: "inherit",
            "&:focus": {
              boxShadow: "none",
              outline: 0
            },
            "&[disabled]": {
              background: "transparent",
              color: colorTextDisabled,
              cursor: "not-allowed"
            }
          }),
          "&-placeholder": {
            "> input": {
              color: colorTextPlaceholder
            }
          }
        },
        // Size
        "&-large": Object.assign(Object.assign({}, genPickerPadding(token.paddingBlockLG, token.paddingInlineLG)), {
          [`${componentCls}-input > input`]: {
            fontSize: inputFontSizeLG !== null && inputFontSizeLG !== void 0 ? inputFontSizeLG : fontSizeLG,
            lineHeight: lineHeightLG
          }
        }),
        "&-small": Object.assign(Object.assign({}, genPickerPadding(token.paddingBlockSM, token.paddingInlineSM)), {
          [`${componentCls}-input > input`]: {
            fontSize: inputFontSizeSM !== null && inputFontSizeSM !== void 0 ? inputFontSizeSM : fontSizeSM
          }
        }),
        [`${componentCls}-suffix`]: {
          display: "flex",
          flex: "none",
          alignSelf: "center",
          marginInlineStart: token.calc(paddingXS).div(2).equal(),
          color: colorTextDisabled,
          lineHeight: 1,
          pointerEvents: "none",
          transition: `opacity ${motionDurationMid}, color ${motionDurationMid}`,
          "> *": {
            verticalAlign: "top",
            "&:not(:last-child)": {
              marginInlineEnd: marginXS
            }
          }
        },
        [`${componentCls}-clear`]: {
          position: "absolute",
          top: "50%",
          insetInlineEnd: 0,
          color: colorTextDisabled,
          lineHeight: 1,
          transform: "translateY(-50%)",
          cursor: "pointer",
          opacity: 0,
          transition: `opacity ${motionDurationMid}, color ${motionDurationMid}`,
          "> *": {
            verticalAlign: "top"
          },
          "&:hover": {
            color: colorIcon
          }
        },
        "&:hover": {
          [`${componentCls}-clear`]: {
            opacity: 1
          },
          // Should use the following selector, but since `:has` has poor compatibility,
          // we use `:not(:last-child)` instead, which may cause some problems in some cases.
          // [`${componentCls}-suffix:has(+ ${componentCls}-clear)`]: {
          [`${componentCls}-suffix:not(:last-child)`]: {
            opacity: 0
          }
        },
        [`${componentCls}-separator`]: {
          position: "relative",
          display: "inline-block",
          width: "1em",
          height: fontSizeLG,
          color: colorTextDisabled,
          fontSize: fontSizeLG,
          verticalAlign: "top",
          cursor: "default",
          [`${componentCls}-focused &`]: {
            color: colorIcon
          },
          [`${componentCls}-range-separator &`]: {
            [`${componentCls}-disabled &`]: {
              cursor: "not-allowed"
            }
          }
        },
        // ======================== Range =========================
        "&-range": {
          position: "relative",
          display: "inline-flex",
          // Active bar
          [`${componentCls}-active-bar`]: {
            bottom: token.calc(lineWidth).mul(-1).equal(),
            height: lineWidthBold,
            background: colorPrimary,
            opacity: 0,
            transition: `all ${motionDurationSlow} ease-out`,
            pointerEvents: "none"
          },
          [`&${componentCls}-focused`]: {
            [`${componentCls}-active-bar`]: {
              opacity: 1
            }
          },
          [`${componentCls}-range-separator`]: {
            alignItems: "center",
            padding: `0 ${unit(paddingXS)}`,
            lineHeight: 1
          }
        },
        // ======================== Clear =========================
        "&-range, &-multiple": {
          // Clear
          [`${componentCls}-clear`]: {
            insetInlineEnd: paddingInline
          },
          [`&${componentCls}-small`]: {
            [`${componentCls}-clear`]: {
              insetInlineEnd: paddingInlineSM
            }
          }
        },
        // ======================= Dropdown =======================
        "&-dropdown": Object.assign(Object.assign(Object.assign({}, resetComponent(token)), genPanelStyle(token)), {
          pointerEvents: "none",
          position: "absolute",
          // Fix incorrect position of picker popup
          // https://github.com/ant-design/ant-design/issues/35590
          top: -9999,
          left: {
            _skip_check_: true,
            value: -9999
          },
          zIndex: zIndexPopup,
          [`&${componentCls}-dropdown-hidden`]: {
            display: "none"
          },
          "&-rtl": {
            direction: "rtl"
          },
          [`&${componentCls}-dropdown-placement-bottomLeft,
            &${componentCls}-dropdown-placement-bottomRight`]: {
            [`${componentCls}-range-arrow`]: {
              top: 0,
              display: "block",
              transform: "translateY(-100%)"
            }
          },
          [`&${componentCls}-dropdown-placement-topLeft,
            &${componentCls}-dropdown-placement-topRight`]: {
            [`${componentCls}-range-arrow`]: {
              bottom: 0,
              display: "block",
              transform: "translateY(100%) rotate(180deg)"
            }
          },
          [`&${antCls}-slide-up-appear, &${antCls}-slide-up-enter`]: {
            [`${componentCls}-range-arrow${componentCls}-range-arrow`]: {
              transition: "none"
            }
          },
          [`&${antCls}-slide-up-enter${antCls}-slide-up-enter-active${componentCls}-dropdown-placement-topLeft,
          &${antCls}-slide-up-enter${antCls}-slide-up-enter-active${componentCls}-dropdown-placement-topRight,
          &${antCls}-slide-up-appear${antCls}-slide-up-appear-active${componentCls}-dropdown-placement-topLeft,
          &${antCls}-slide-up-appear${antCls}-slide-up-appear-active${componentCls}-dropdown-placement-topRight`]: {
            animationName: slideDownIn
          },
          [`&${antCls}-slide-up-enter${antCls}-slide-up-enter-active${componentCls}-dropdown-placement-bottomLeft,
          &${antCls}-slide-up-enter${antCls}-slide-up-enter-active${componentCls}-dropdown-placement-bottomRight,
          &${antCls}-slide-up-appear${antCls}-slide-up-appear-active${componentCls}-dropdown-placement-bottomLeft,
          &${antCls}-slide-up-appear${antCls}-slide-up-appear-active${componentCls}-dropdown-placement-bottomRight`]: {
            animationName: slideUpIn
          },
          // https://github.com/ant-design/ant-design/issues/48727
          [`&${antCls}-slide-up-leave ${componentCls}-panel-container`]: {
            pointerEvents: "none"
          },
          [`&${antCls}-slide-up-leave${antCls}-slide-up-leave-active${componentCls}-dropdown-placement-topLeft,
          &${antCls}-slide-up-leave${antCls}-slide-up-leave-active${componentCls}-dropdown-placement-topRight`]: {
            animationName: slideDownOut
          },
          [`&${antCls}-slide-up-leave${antCls}-slide-up-leave-active${componentCls}-dropdown-placement-bottomLeft,
          &${antCls}-slide-up-leave${antCls}-slide-up-leave-active${componentCls}-dropdown-placement-bottomRight`]: {
            animationName: slideUpOut
          },
          // Time picker with additional style
          [`${componentCls}-panel > ${componentCls}-time-panel`]: {
            paddingTop: paddingXXS
          },
          // ======================== Ranges ========================
          [`${componentCls}-range-wrapper`]: {
            display: "flex",
            position: "relative"
          },
          [`${componentCls}-range-arrow`]: Object.assign(Object.assign({
            position: "absolute",
            zIndex: 1,
            display: "none",
            paddingInline: token.calc(paddingInline).mul(1.5).equal(),
            boxSizing: "content-box",
            transition: `all ${motionDurationSlow} ease-out`
          }, genRoundedArrow(token, colorBgElevated, boxShadowPopoverArrow)), {
            "&:before": {
              insetInlineStart: token.calc(paddingInline).mul(1.5).equal()
            }
          }),
          [`${componentCls}-panel-container`]: {
            overflow: "hidden",
            verticalAlign: "top",
            background: colorBgElevated,
            borderRadius: borderRadiusLG,
            boxShadow: boxShadowSecondary,
            transition: `margin ${motionDurationSlow}`,
            display: "inline-block",
            pointerEvents: "auto",
            // ======================== Layout ========================
            [`${componentCls}-panel-layout`]: {
              display: "flex",
              flexWrap: "nowrap",
              alignItems: "stretch"
            },
            // ======================== Preset ========================
            [`${componentCls}-presets`]: {
              display: "flex",
              flexDirection: "column",
              minWidth: presetsWidth,
              maxWidth: presetsMaxWidth,
              ul: {
                height: 0,
                flex: "auto",
                listStyle: "none",
                overflow: "auto",
                margin: 0,
                padding: paddingXS,
                borderInlineEnd: `${unit(lineWidth)} ${lineType} ${colorSplit}`,
                li: Object.assign(Object.assign({}, textEllipsis), {
                  borderRadius: borderRadiusSM,
                  paddingInline: paddingXS,
                  paddingBlock: token.calc(controlHeightSM).sub(fontHeight).div(2).equal(),
                  cursor: "pointer",
                  transition: `all ${motionDurationSlow}`,
                  "+ li": {
                    marginTop: marginXS
                  },
                  "&:hover": {
                    background: cellHoverBg
                  }
                })
              }
            },
            // ======================== Panels ========================
            [`${componentCls}-panels`]: {
              display: "inline-flex",
              flexWrap: "nowrap",
              // [`${componentCls}-panel`]: {
              //   borderWidth: `0 0 ${unit(lineWidth)}`,
              // },
              "&:last-child": {
                [`${componentCls}-panel`]: {
                  borderWidth: 0
                }
              }
            },
            [`${componentCls}-panel`]: {
              verticalAlign: "top",
              background: "transparent",
              borderRadius: 0,
              borderWidth: 0,
              [`${componentCls}-content, table`]: {
                textAlign: "center"
              },
              "&-focused": {
                borderColor: colorBorder
              }
            }
          }
        }),
        "&-dropdown-range": {
          padding: `${unit(token.calc(sizePopupArrow).mul(2).div(3).equal())} 0`,
          "&-hidden": {
            display: "none"
          }
        },
        "&-rtl": {
          direction: "rtl",
          [`${componentCls}-separator`]: {
            transform: "scale(-1, 1)"
          },
          [`${componentCls}-footer`]: {
            "&-extra": {
              direction: "rtl"
            }
          }
        }
      })
    },
    // Follow code may reuse in other components
    initSlideMotion(token, "slide-up"),
    initSlideMotion(token, "slide-down"),
    initMoveMotion(token, "move-up"),
    initMoveMotion(token, "move-down")
  ];
};
const useStyle$f = genStyleHooks("DatePicker", (token) => {
  const pickerToken = merge$1(initInputToken(token), initPickerPanelToken(token), {
    inputPaddingHorizontalBase: token.calc(token.paddingSM).sub(1).equal(),
    multipleSelectItemHeight: token.multipleItemHeight,
    selectHeight: token.controlHeight
  });
  return [
    genPickerPanelStyle(pickerToken),
    genPickerStyle(pickerToken),
    genVariantsStyle(pickerToken),
    genPickerStatusStyle(pickerToken),
    genPickerMultipleStyle(pickerToken),
    // =====================================================
    // ==             Space Compact                       ==
    // =====================================================
    genCompactItemStyle(token, {
      focusElCls: `${token.componentCls}-focused`
    })
  ];
}, prepareComponentToken$c);
const motion = {
  motionAppear: false,
  motionEnter: true,
  motionLeave: true
};
function useAnimateConfig(prefixCls, animated = {
  inkBar: true,
  tabPane: false
}) {
  let mergedAnimated;
  if (animated === false) {
    mergedAnimated = {
      inkBar: false,
      tabPane: false
    };
  } else if (animated === true) {
    mergedAnimated = {
      inkBar: true,
      tabPane: true
    };
  } else {
    mergedAnimated = Object.assign({
      inkBar: true
    }, typeof animated === "object" ? animated : {});
  }
  if (mergedAnimated.tabPane) {
    mergedAnimated.tabPaneMotion = Object.assign(Object.assign({}, motion), {
      motionName: getTransitionName(prefixCls, "switch")
    });
  }
  return mergedAnimated;
}
var __rest$D = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function filter(items) {
  return items.filter((item) => item);
}
function useLegacyItems(items, children) {
  if (items) {
    return items.map((item) => {
      var _a;
      const mergedDestroyOnHidden = (_a = item.destroyOnHidden) !== null && _a !== void 0 ? _a : item.destroyInactiveTabPane;
      return Object.assign(Object.assign({}, item), {
        // TODO: In the future, destroyInactiveTabPane in rc-tabs needs to be upgrade to destroyOnHidden
        destroyInactiveTabPane: mergedDestroyOnHidden
      });
    });
  }
  const childrenItems = toArray$1(children).map((node) => {
    if (/* @__PURE__ */ reactExports.isValidElement(node)) {
      const {
        key,
        props
      } = node;
      const _a = props || {}, {
        tab
      } = _a, restProps = __rest$D(_a, ["tab"]);
      const item = Object.assign(Object.assign({
        key: String(key)
      }, restProps), {
        label: tab
      });
      return item;
    }
    return null;
  });
  return filter(childrenItems);
}
const genMotionStyle = (token) => {
  const {
    componentCls,
    motionDurationSlow
  } = token;
  return [
    {
      [componentCls]: {
        [`${componentCls}-switch`]: {
          "&-appear, &-enter": {
            transition: "none",
            "&-start": {
              opacity: 0
            },
            "&-active": {
              opacity: 1,
              transition: `opacity ${motionDurationSlow}`
            }
          },
          "&-leave": {
            position: "absolute",
            transition: "none",
            inset: 0,
            "&-start": {
              opacity: 1
            },
            "&-active": {
              opacity: 0,
              transition: `opacity ${motionDurationSlow}`
            }
          }
        }
      }
    },
    // Follow code may reuse in other components
    [initSlideMotion(token, "slide-up"), initSlideMotion(token, "slide-down")]
  ];
};
const genCardStyle$1 = (token) => {
  const {
    componentCls,
    tabsCardPadding,
    cardBg,
    cardGutter,
    colorBorderSecondary,
    itemSelectedColor
  } = token;
  return {
    [`${componentCls}-card`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        [`${componentCls}-tab`]: {
          margin: 0,
          padding: tabsCardPadding,
          background: cardBg,
          border: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
          transition: `all ${token.motionDurationSlow} ${token.motionEaseInOut}`
        },
        [`${componentCls}-tab-active`]: {
          color: itemSelectedColor,
          background: token.colorBgContainer
        },
        [`${componentCls}-tab-focus:has(${componentCls}-tab-btn:focus-visible)`]: genFocusOutline(token, -3),
        [`& ${componentCls}-tab${componentCls}-tab-focus ${componentCls}-tab-btn:focus-visible`]: {
          outline: "none"
        },
        [`${componentCls}-ink-bar`]: {
          visibility: "hidden"
        }
      },
      // ========================== Top & Bottom ==========================
      [`&${componentCls}-top, &${componentCls}-bottom`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab + ${componentCls}-tab`]: {
            marginLeft: {
              _skip_check_: true,
              value: unit(cardGutter)
            }
          }
        }
      },
      [`&${componentCls}-top`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`
          },
          [`${componentCls}-tab-active`]: {
            borderBottomColor: token.colorBgContainer
          }
        }
      },
      [`&${componentCls}-bottom`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            borderRadius: `0 0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)}`
          },
          [`${componentCls}-tab-active`]: {
            borderTopColor: token.colorBgContainer
          }
        }
      },
      // ========================== Left & Right ==========================
      [`&${componentCls}-left, &${componentCls}-right`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab + ${componentCls}-tab`]: {
            marginTop: unit(cardGutter)
          }
        }
      },
      [`&${componentCls}-left`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            borderRadius: {
              _skip_check_: true,
              value: `${unit(token.borderRadiusLG)} 0 0 ${unit(token.borderRadiusLG)}`
            }
          },
          [`${componentCls}-tab-active`]: {
            borderRightColor: {
              _skip_check_: true,
              value: token.colorBgContainer
            }
          }
        }
      },
      [`&${componentCls}-right`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            borderRadius: {
              _skip_check_: true,
              value: `0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0`
            }
          },
          [`${componentCls}-tab-active`]: {
            borderLeftColor: {
              _skip_check_: true,
              value: token.colorBgContainer
            }
          }
        }
      }
    }
  };
};
const genDropdownStyle = (token) => {
  const {
    componentCls,
    itemHoverColor,
    dropdownEdgeChildVerticalPadding
  } = token;
  return {
    [`${componentCls}-dropdown`]: Object.assign(Object.assign({}, resetComponent(token)), {
      position: "absolute",
      top: -9999,
      left: {
        _skip_check_: true,
        value: -9999
      },
      zIndex: token.zIndexPopup,
      display: "block",
      "&-hidden": {
        display: "none"
      },
      [`${componentCls}-dropdown-menu`]: {
        maxHeight: token.tabsDropdownHeight,
        margin: 0,
        padding: `${unit(dropdownEdgeChildVerticalPadding)} 0`,
        overflowX: "hidden",
        overflowY: "auto",
        textAlign: {
          _skip_check_: true,
          value: "left"
        },
        listStyleType: "none",
        backgroundColor: token.colorBgContainer,
        backgroundClip: "padding-box",
        borderRadius: token.borderRadiusLG,
        outline: "none",
        boxShadow: token.boxShadowSecondary,
        "&-item": Object.assign(Object.assign({}, textEllipsis), {
          display: "flex",
          alignItems: "center",
          minWidth: token.tabsDropdownWidth,
          margin: 0,
          padding: `${unit(token.paddingXXS)} ${unit(token.paddingSM)}`,
          color: token.colorText,
          fontWeight: "normal",
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          cursor: "pointer",
          transition: `all ${token.motionDurationSlow}`,
          "> span": {
            flex: 1,
            whiteSpace: "nowrap"
          },
          "&-remove": {
            flex: "none",
            marginLeft: {
              _skip_check_: true,
              value: token.marginSM
            },
            color: token.colorIcon,
            fontSize: token.fontSizeSM,
            background: "transparent",
            border: 0,
            cursor: "pointer",
            "&:hover": {
              color: itemHoverColor
            }
          },
          "&:hover": {
            background: token.controlItemBgHover
          },
          "&-disabled": {
            "&, &:hover": {
              color: token.colorTextDisabled,
              background: "transparent",
              cursor: "not-allowed"
            }
          }
        })
      }
    })
  };
};
const genPositionStyle = (token) => {
  const {
    componentCls,
    margin,
    colorBorderSecondary,
    horizontalMargin,
    verticalItemPadding,
    verticalItemMargin,
    calc
  } = token;
  return {
    // ========================== Top & Bottom ==========================
    [`${componentCls}-top, ${componentCls}-bottom`]: {
      flexDirection: "column",
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        margin: horizontalMargin,
        "&::before": {
          position: "absolute",
          right: {
            _skip_check_: true,
            value: 0
          },
          left: {
            _skip_check_: true,
            value: 0
          },
          borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
          content: "''"
        },
        [`${componentCls}-ink-bar`]: {
          height: token.lineWidthBold,
          "&-animated": {
            transition: `width ${token.motionDurationSlow}, left ${token.motionDurationSlow},
            right ${token.motionDurationSlow}`
          }
        },
        [`${componentCls}-nav-wrap`]: {
          "&::before, &::after": {
            top: 0,
            bottom: 0,
            width: token.controlHeight
          },
          "&::before": {
            left: {
              _skip_check_: true,
              value: 0
            },
            boxShadow: token.boxShadowTabsOverflowLeft
          },
          "&::after": {
            right: {
              _skip_check_: true,
              value: 0
            },
            boxShadow: token.boxShadowTabsOverflowRight
          },
          [`&${componentCls}-nav-wrap-ping-left::before`]: {
            opacity: 1
          },
          [`&${componentCls}-nav-wrap-ping-right::after`]: {
            opacity: 1
          }
        }
      }
    },
    [`${componentCls}-top`]: {
      [`> ${componentCls}-nav,
        > div > ${componentCls}-nav`]: {
        "&::before": {
          bottom: 0
        },
        [`${componentCls}-ink-bar`]: {
          bottom: 0
        }
      }
    },
    [`${componentCls}-bottom`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        order: 1,
        marginTop: margin,
        marginBottom: 0,
        "&::before": {
          top: 0
        },
        [`${componentCls}-ink-bar`]: {
          top: 0
        }
      },
      [`> ${componentCls}-content-holder, > div > ${componentCls}-content-holder`]: {
        order: 0
      }
    },
    // ========================== Left & Right ==========================
    [`${componentCls}-left, ${componentCls}-right`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        flexDirection: "column",
        minWidth: calc(token.controlHeight).mul(1.25).equal(),
        // >>>>>>>>>>> Tab
        [`${componentCls}-tab`]: {
          padding: verticalItemPadding,
          textAlign: "center"
        },
        [`${componentCls}-tab + ${componentCls}-tab`]: {
          margin: verticalItemMargin
        },
        // >>>>>>>>>>> Nav
        [`${componentCls}-nav-wrap`]: {
          flexDirection: "column",
          "&::before, &::after": {
            right: {
              _skip_check_: true,
              value: 0
            },
            left: {
              _skip_check_: true,
              value: 0
            },
            height: token.controlHeight
          },
          "&::before": {
            top: 0,
            boxShadow: token.boxShadowTabsOverflowTop
          },
          "&::after": {
            bottom: 0,
            boxShadow: token.boxShadowTabsOverflowBottom
          },
          [`&${componentCls}-nav-wrap-ping-top::before`]: {
            opacity: 1
          },
          [`&${componentCls}-nav-wrap-ping-bottom::after`]: {
            opacity: 1
          }
        },
        // >>>>>>>>>>> Ink Bar
        [`${componentCls}-ink-bar`]: {
          width: token.lineWidthBold,
          "&-animated": {
            transition: `height ${token.motionDurationSlow}, top ${token.motionDurationSlow}`
          }
        },
        [`${componentCls}-nav-list, ${componentCls}-nav-operations`]: {
          flex: "1 0 auto",
          // fix safari scroll problem
          flexDirection: "column"
        }
      }
    },
    [`${componentCls}-left`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        [`${componentCls}-ink-bar`]: {
          right: {
            _skip_check_: true,
            value: 0
          }
        }
      },
      [`> ${componentCls}-content-holder, > div > ${componentCls}-content-holder`]: {
        marginLeft: {
          _skip_check_: true,
          value: unit(calc(token.lineWidth).mul(-1).equal())
        },
        borderLeft: {
          _skip_check_: true,
          value: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`
        },
        [`> ${componentCls}-content > ${componentCls}-tabpane`]: {
          paddingLeft: {
            _skip_check_: true,
            value: token.paddingLG
          }
        }
      }
    },
    [`${componentCls}-right`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        order: 1,
        [`${componentCls}-ink-bar`]: {
          left: {
            _skip_check_: true,
            value: 0
          }
        }
      },
      [`> ${componentCls}-content-holder, > div > ${componentCls}-content-holder`]: {
        order: 0,
        marginRight: {
          _skip_check_: true,
          value: calc(token.lineWidth).mul(-1).equal()
        },
        borderRight: {
          _skip_check_: true,
          value: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`
        },
        [`> ${componentCls}-content > ${componentCls}-tabpane`]: {
          paddingRight: {
            _skip_check_: true,
            value: token.paddingLG
          }
        }
      }
    }
  };
};
const genSizeStyle$1 = (token) => {
  const {
    componentCls,
    cardPaddingSM,
    cardPaddingLG,
    cardHeightSM,
    cardHeightLG,
    horizontalItemPaddingSM,
    horizontalItemPaddingLG
  } = token;
  return {
    // >>>>> shared
    [componentCls]: {
      "&-small": {
        [`> ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            padding: horizontalItemPaddingSM,
            fontSize: token.titleFontSizeSM
          }
        }
      },
      "&-large": {
        [`> ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            padding: horizontalItemPaddingLG,
            fontSize: token.titleFontSizeLG,
            lineHeight: token.lineHeightLG
          }
        }
      }
    },
    // >>>>> card
    [`${componentCls}-card`]: {
      // Small
      [`&${componentCls}-small`]: {
        [`> ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            padding: cardPaddingSM
          },
          [`${componentCls}-nav-add`]: {
            minWidth: cardHeightSM,
            minHeight: cardHeightSM
          }
        },
        [`&${componentCls}-bottom`]: {
          [`> ${componentCls}-nav ${componentCls}-tab`]: {
            borderRadius: `0 0 ${unit(token.borderRadius)} ${unit(token.borderRadius)}`
          }
        },
        [`&${componentCls}-top`]: {
          [`> ${componentCls}-nav ${componentCls}-tab`]: {
            borderRadius: `${unit(token.borderRadius)} ${unit(token.borderRadius)} 0 0`
          }
        },
        [`&${componentCls}-right`]: {
          [`> ${componentCls}-nav ${componentCls}-tab`]: {
            borderRadius: {
              _skip_check_: true,
              value: `0 ${unit(token.borderRadius)} ${unit(token.borderRadius)} 0`
            }
          }
        },
        [`&${componentCls}-left`]: {
          [`> ${componentCls}-nav ${componentCls}-tab`]: {
            borderRadius: {
              _skip_check_: true,
              value: `${unit(token.borderRadius)} 0 0 ${unit(token.borderRadius)}`
            }
          }
        }
      },
      // Large
      [`&${componentCls}-large`]: {
        [`> ${componentCls}-nav`]: {
          [`${componentCls}-tab`]: {
            padding: cardPaddingLG
          },
          [`${componentCls}-nav-add`]: {
            minWidth: cardHeightLG,
            minHeight: cardHeightLG
          }
        }
      }
    }
  };
};
const genTabStyle = (token) => {
  const {
    componentCls,
    itemActiveColor,
    itemHoverColor,
    iconCls,
    tabsHorizontalItemMargin,
    horizontalItemPadding,
    itemSelectedColor,
    itemColor
  } = token;
  const tabCls = `${componentCls}-tab`;
  return {
    [tabCls]: {
      position: "relative",
      WebkitTouchCallout: "none",
      WebkitTapHighlightColor: "transparent",
      display: "inline-flex",
      alignItems: "center",
      padding: horizontalItemPadding,
      fontSize: token.titleFontSize,
      background: "transparent",
      border: 0,
      outline: "none",
      cursor: "pointer",
      color: itemColor,
      "&-btn, &-remove": {
        "&:focus:not(:focus-visible), &:active": {
          color: itemActiveColor
        }
      },
      "&-btn": {
        outline: "none",
        transition: `all ${token.motionDurationSlow}`,
        [`${tabCls}-icon:not(:last-child)`]: {
          marginInlineEnd: token.marginSM
        }
      },
      "&-remove": Object.assign({
        flex: "none",
        marginRight: {
          _skip_check_: true,
          value: token.calc(token.marginXXS).mul(-1).equal()
        },
        marginLeft: {
          _skip_check_: true,
          value: token.marginXS
        },
        color: token.colorIcon,
        fontSize: token.fontSizeSM,
        background: "transparent",
        border: "none",
        outline: "none",
        cursor: "pointer",
        transition: `all ${token.motionDurationSlow}`,
        "&:hover": {
          color: token.colorTextHeading
        }
      }, genFocusStyle(token)),
      "&:hover": {
        color: itemHoverColor
      },
      [`&${tabCls}-active ${tabCls}-btn`]: {
        color: itemSelectedColor,
        textShadow: token.tabsActiveTextShadow
      },
      [`&${tabCls}-focus ${tabCls}-btn:focus-visible`]: genFocusOutline(token),
      [`&${tabCls}-disabled`]: {
        color: token.colorTextDisabled,
        cursor: "not-allowed"
      },
      [`&${tabCls}-disabled ${tabCls}-btn, &${tabCls}-disabled ${componentCls}-remove`]: {
        "&:focus, &:active": {
          color: token.colorTextDisabled
        }
      },
      [`& ${tabCls}-remove ${iconCls}`]: {
        margin: 0
      },
      [`${iconCls}:not(:last-child)`]: {
        marginRight: {
          _skip_check_: true,
          value: token.marginSM
        }
      }
    },
    [`${tabCls} + ${tabCls}`]: {
      margin: {
        _skip_check_: true,
        value: tabsHorizontalItemMargin
      }
    }
  };
};
const genRtlStyle = (token) => {
  const {
    componentCls,
    tabsHorizontalItemMarginRTL,
    iconCls,
    cardGutter,
    calc
  } = token;
  const rtlCls = `${componentCls}-rtl`;
  return {
    [rtlCls]: {
      direction: "rtl",
      [`${componentCls}-nav`]: {
        [`${componentCls}-tab`]: {
          margin: {
            _skip_check_: true,
            value: tabsHorizontalItemMarginRTL
          },
          [`${componentCls}-tab:last-of-type`]: {
            marginLeft: {
              _skip_check_: true,
              value: 0
            }
          },
          [iconCls]: {
            marginRight: {
              _skip_check_: true,
              value: 0
            },
            marginLeft: {
              _skip_check_: true,
              value: unit(token.marginSM)
            }
          },
          [`${componentCls}-tab-remove`]: {
            marginRight: {
              _skip_check_: true,
              value: unit(token.marginXS)
            },
            marginLeft: {
              _skip_check_: true,
              value: unit(calc(token.marginXXS).mul(-1).equal())
            },
            [iconCls]: {
              margin: 0
            }
          }
        }
      },
      [`&${componentCls}-left`]: {
        [`> ${componentCls}-nav`]: {
          order: 1
        },
        [`> ${componentCls}-content-holder`]: {
          order: 0
        }
      },
      [`&${componentCls}-right`]: {
        [`> ${componentCls}-nav`]: {
          order: 0
        },
        [`> ${componentCls}-content-holder`]: {
          order: 1
        }
      },
      // ====================== Card ======================
      [`&${componentCls}-card${componentCls}-top, &${componentCls}-card${componentCls}-bottom`]: {
        [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
          [`${componentCls}-tab + ${componentCls}-tab`]: {
            marginRight: {
              _skip_check_: true,
              value: cardGutter
            },
            marginLeft: {
              _skip_check_: true,
              value: 0
            }
          }
        }
      }
    },
    [`${componentCls}-dropdown-rtl`]: {
      direction: "rtl"
    },
    [`${componentCls}-menu-item`]: {
      [`${componentCls}-dropdown-rtl`]: {
        textAlign: {
          _skip_check_: true,
          value: "right"
        }
      }
    }
  };
};
const genTabsStyle = (token) => {
  const {
    componentCls,
    tabsCardPadding,
    cardHeight,
    cardGutter,
    itemHoverColor,
    itemActiveColor,
    colorBorderSecondary
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), {
      display: "flex",
      // ========================== Navigation ==========================
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        position: "relative",
        display: "flex",
        flex: "none",
        alignItems: "center",
        [`${componentCls}-nav-wrap`]: {
          position: "relative",
          display: "flex",
          flex: "auto",
          alignSelf: "stretch",
          overflow: "hidden",
          whiteSpace: "nowrap",
          transform: "translate(0)",
          // Fix chrome render bug
          // >>>>> Ping shadow
          "&::before, &::after": {
            position: "absolute",
            zIndex: 1,
            opacity: 0,
            transition: `opacity ${token.motionDurationSlow}`,
            content: "''",
            pointerEvents: "none"
          }
        },
        [`${componentCls}-nav-list`]: {
          position: "relative",
          display: "flex",
          transition: `opacity ${token.motionDurationSlow}`
        },
        // >>>>>>>> Operations
        [`${componentCls}-nav-operations`]: {
          display: "flex",
          alignSelf: "stretch"
        },
        [`${componentCls}-nav-operations-hidden`]: {
          position: "absolute",
          visibility: "hidden",
          pointerEvents: "none"
        },
        [`${componentCls}-nav-more`]: {
          position: "relative",
          padding: tabsCardPadding,
          background: "transparent",
          border: 0,
          color: token.colorText,
          "&::after": {
            position: "absolute",
            right: {
              _skip_check_: true,
              value: 0
            },
            bottom: 0,
            left: {
              _skip_check_: true,
              value: 0
            },
            height: token.calc(token.controlHeightLG).div(8).equal(),
            transform: "translateY(100%)",
            content: "''"
          }
        },
        [`${componentCls}-nav-add`]: Object.assign({
          minWidth: cardHeight,
          minHeight: cardHeight,
          marginLeft: {
            _skip_check_: true,
            value: cardGutter
          },
          background: "transparent",
          border: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
          borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`,
          outline: "none",
          cursor: "pointer",
          color: token.colorText,
          transition: `all ${token.motionDurationSlow} ${token.motionEaseInOut}`,
          "&:hover": {
            color: itemHoverColor
          },
          "&:active, &:focus:not(:focus-visible)": {
            color: itemActiveColor
          }
        }, genFocusStyle(token, -3))
      },
      [`${componentCls}-extra-content`]: {
        flex: "none"
      },
      // ============================ InkBar ============================
      [`${componentCls}-ink-bar`]: {
        position: "absolute",
        background: token.inkBarColor,
        pointerEvents: "none"
      }
    }), genTabStyle(token)), {
      // =========================== TabPanes ===========================
      [`${componentCls}-content`]: {
        position: "relative",
        width: "100%"
      },
      [`${componentCls}-content-holder`]: {
        flex: "auto",
        minWidth: 0,
        minHeight: 0
      },
      [`${componentCls}-tabpane`]: Object.assign(Object.assign({}, genFocusStyle(token)), {
        "&-hidden": {
          display: "none"
        }
      })
    }),
    [`${componentCls}-centered`]: {
      [`> ${componentCls}-nav, > div > ${componentCls}-nav`]: {
        [`${componentCls}-nav-wrap`]: {
          [`&:not([class*='${componentCls}-nav-wrap-ping']) > ${componentCls}-nav-list`]: {
            margin: "auto"
          }
        }
      }
    }
  };
};
const prepareComponentToken$b = (token) => {
  const {
    cardHeight,
    cardHeightSM,
    cardHeightLG,
    controlHeight,
    controlHeightLG
  } = token;
  const mergedCardHeight = cardHeight || controlHeightLG;
  const mergedCardHeightSM = cardHeightSM || controlHeight;
  const mergedCardHeightLG = cardHeightLG || controlHeightLG + 8;
  return {
    zIndexPopup: token.zIndexPopupBase + 50,
    cardBg: token.colorFillAlter,
    // We can not pass this as valid value,
    // Since `cardHeight` will lock nav add button height.
    cardHeight: mergedCardHeight,
    cardHeightSM: mergedCardHeightSM,
    cardHeightLG: mergedCardHeightLG,
    // Initialize with empty string, because cardPadding will be calculated with cardHeight by default.
    cardPadding: `${(mergedCardHeight - token.fontHeight) / 2 - token.lineWidth}px ${token.padding}px`,
    cardPaddingSM: `${(mergedCardHeightSM - token.fontHeight) / 2 - token.lineWidth}px ${token.paddingXS}px`,
    cardPaddingLG: `${(mergedCardHeightLG - token.fontHeightLG) / 2 - token.lineWidth}px ${token.padding}px`,
    titleFontSize: token.fontSize,
    titleFontSizeLG: token.fontSizeLG,
    titleFontSizeSM: token.fontSize,
    inkBarColor: token.colorPrimary,
    horizontalMargin: `0 0 ${token.margin}px 0`,
    horizontalItemGutter: 32,
    // Fixed Value
    // Initialize with empty string, because horizontalItemMargin will be calculated with horizontalItemGutter by default.
    horizontalItemMargin: ``,
    horizontalItemMarginRTL: ``,
    horizontalItemPadding: `${token.paddingSM}px 0`,
    horizontalItemPaddingSM: `${token.paddingXS}px 0`,
    horizontalItemPaddingLG: `${token.padding}px 0`,
    verticalItemPadding: `${token.paddingXS}px ${token.paddingLG}px`,
    verticalItemMargin: `${token.margin}px 0 0 0`,
    itemColor: token.colorText,
    itemSelectedColor: token.colorPrimary,
    itemHoverColor: token.colorPrimaryHover,
    itemActiveColor: token.colorPrimaryActive,
    cardGutter: token.marginXXS / 2
  };
};
const useStyle$e = genStyleHooks("Tabs", (token) => {
  const tabsToken = merge$1(token, {
    // `cardPadding` is empty by default, so we could calculate with dynamic `cardHeight`
    tabsCardPadding: token.cardPadding,
    dropdownEdgeChildVerticalPadding: token.paddingXXS,
    tabsActiveTextShadow: "0 0 0.25px currentcolor",
    tabsDropdownHeight: 200,
    tabsDropdownWidth: 120,
    tabsHorizontalItemMargin: `0 0 0 ${unit(token.horizontalItemGutter)}`,
    tabsHorizontalItemMarginRTL: `0 0 0 ${unit(token.horizontalItemGutter)}`
  });
  return [genSizeStyle$1(tabsToken), genRtlStyle(tabsToken), genPositionStyle(tabsToken), genDropdownStyle(tabsToken), genCardStyle$1(tabsToken), genTabsStyle(tabsToken), genMotionStyle(tabsToken)];
}, prepareComponentToken$b);
const TabPane = () => null;
var __rest$C = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Tabs = (props) => {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
  const {
    type,
    className,
    rootClassName,
    size: customSize,
    onEdit,
    hideAdd,
    centered,
    addIcon,
    removeIcon,
    moreIcon,
    more,
    popupClassName,
    children,
    items,
    animated,
    style,
    indicatorSize,
    indicator,
    destroyInactiveTabPane,
    destroyOnHidden
  } = props, otherProps = __rest$C(props, ["type", "className", "rootClassName", "size", "onEdit", "hideAdd", "centered", "addIcon", "removeIcon", "moreIcon", "more", "popupClassName", "children", "items", "animated", "style", "indicatorSize", "indicator", "destroyInactiveTabPane", "destroyOnHidden"]);
  const {
    prefixCls: customizePrefixCls
  } = otherProps;
  const {
    direction,
    tabs,
    getPrefixCls,
    getPopupContainer
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("tabs", customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$e(prefixCls, rootCls);
  let editable;
  if (type === "editable-card") {
    editable = {
      onEdit: (editType, {
        key,
        event
      }) => {
        onEdit === null || onEdit === void 0 ? void 0 : onEdit(editType === "add" ? event : key, editType);
      },
      removeIcon: (_a = removeIcon !== null && removeIcon !== void 0 ? removeIcon : tabs === null || tabs === void 0 ? void 0 : tabs.removeIcon) !== null && _a !== void 0 ? _a : /* @__PURE__ */ reactExports.createElement(RefIcon$5, null),
      addIcon: (addIcon !== null && addIcon !== void 0 ? addIcon : tabs === null || tabs === void 0 ? void 0 : tabs.addIcon) || /* @__PURE__ */ reactExports.createElement(RefIcon$c, null),
      showAdd: hideAdd !== true
    };
  }
  const rootPrefixCls = getPrefixCls();
  const size = useSize(customSize);
  const mergedItems = useLegacyItems(items, children);
  const mergedAnimated = useAnimateConfig(prefixCls, animated);
  const mergedStyle = Object.assign(Object.assign({}, tabs === null || tabs === void 0 ? void 0 : tabs.style), style);
  const mergedIndicator = {
    align: (_b = indicator === null || indicator === void 0 ? void 0 : indicator.align) !== null && _b !== void 0 ? _b : (_c = tabs === null || tabs === void 0 ? void 0 : tabs.indicator) === null || _c === void 0 ? void 0 : _c.align,
    size: (_g = (_e = (_d = indicator === null || indicator === void 0 ? void 0 : indicator.size) !== null && _d !== void 0 ? _d : indicatorSize) !== null && _e !== void 0 ? _e : (_f = tabs === null || tabs === void 0 ? void 0 : tabs.indicator) === null || _f === void 0 ? void 0 : _f.size) !== null && _g !== void 0 ? _g : tabs === null || tabs === void 0 ? void 0 : tabs.indicatorSize
  };
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(Tabs$1, Object.assign({
    direction,
    getPopupContainer
  }, otherProps, {
    items: mergedItems,
    className: classNames({
      [`${prefixCls}-${size}`]: size,
      [`${prefixCls}-card`]: ["card", "editable-card"].includes(type),
      [`${prefixCls}-editable-card`]: type === "editable-card",
      [`${prefixCls}-centered`]: centered
    }, tabs === null || tabs === void 0 ? void 0 : tabs.className, className, rootClassName, hashId, cssVarCls, rootCls),
    popupClassName: classNames(popupClassName, hashId, cssVarCls, rootCls),
    style: mergedStyle,
    editable,
    more: Object.assign({
      icon: (_l = (_k = (_j = (_h = tabs === null || tabs === void 0 ? void 0 : tabs.more) === null || _h === void 0 ? void 0 : _h.icon) !== null && _j !== void 0 ? _j : tabs === null || tabs === void 0 ? void 0 : tabs.moreIcon) !== null && _k !== void 0 ? _k : moreIcon) !== null && _l !== void 0 ? _l : /* @__PURE__ */ reactExports.createElement(RefIcon$a, null),
      transitionName: `${rootPrefixCls}-slide-up`
    }, more),
    prefixCls,
    animated: mergedAnimated,
    indicator: mergedIndicator,
    // TODO: In the future, destroyInactiveTabPane in rc-tabs needs to be upgrade to destroyOnHidden
    destroyInactiveTabPane: destroyOnHidden !== null && destroyOnHidden !== void 0 ? destroyOnHidden : destroyInactiveTabPane
  })));
};
Tabs.TabPane = TabPane;
var __rest$B = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Grid = (_a) => {
  var {
    prefixCls,
    className,
    hoverable = true
  } = _a, props = __rest$B(_a, ["prefixCls", "className", "hoverable"]);
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefix = getPrefixCls("card", prefixCls);
  const classString = classNames(`${prefix}-grid`, className, {
    [`${prefix}-grid-hoverable`]: hoverable
  });
  return /* @__PURE__ */ reactExports.createElement("div", Object.assign({}, props, {
    className: classString
  }));
};
const genCardHeadStyle = (token) => {
  const {
    antCls,
    componentCls,
    headerHeight,
    headerPadding,
    tabsMarginBottom
  } = token;
  return Object.assign(Object.assign({
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    minHeight: headerHeight,
    marginBottom: -1,
    padding: `0 ${unit(headerPadding)}`,
    color: token.colorTextHeading,
    fontWeight: token.fontWeightStrong,
    fontSize: token.headerFontSize,
    background: token.headerBg,
    borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderSecondary}`,
    borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`
  }, clearFix()), {
    "&-wrapper": {
      width: "100%",
      display: "flex",
      alignItems: "center"
    },
    "&-title": Object.assign(Object.assign({
      display: "inline-block",
      flex: 1
    }, textEllipsis), {
      [`
          > ${componentCls}-typography,
          > ${componentCls}-typography-edit-content
        `]: {
        insetInlineStart: 0,
        marginTop: 0,
        marginBottom: 0
      }
    }),
    [`${antCls}-tabs-top`]: {
      clear: "both",
      marginBottom: tabsMarginBottom,
      color: token.colorText,
      fontWeight: "normal",
      fontSize: token.fontSize,
      "&-bar": {
        borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorderSecondary}`
      }
    }
  });
};
const genCardGridStyle = (token) => {
  const {
    cardPaddingBase,
    colorBorderSecondary,
    cardShadow,
    lineWidth
  } = token;
  return {
    width: "33.33%",
    padding: cardPaddingBase,
    border: 0,
    borderRadius: 0,
    boxShadow: `
      ${unit(lineWidth)} 0 0 0 ${colorBorderSecondary},
      0 ${unit(lineWidth)} 0 0 ${colorBorderSecondary},
      ${unit(lineWidth)} ${unit(lineWidth)} 0 0 ${colorBorderSecondary},
      ${unit(lineWidth)} 0 0 0 ${colorBorderSecondary} inset,
      0 ${unit(lineWidth)} 0 0 ${colorBorderSecondary} inset;
    `,
    transition: `all ${token.motionDurationMid}`,
    "&-hoverable:hover": {
      position: "relative",
      zIndex: 1,
      boxShadow: cardShadow
    }
  };
};
const genCardActionsStyle = (token) => {
  const {
    componentCls,
    iconCls,
    actionsLiMargin,
    cardActionsIconSize,
    colorBorderSecondary,
    actionsBg
  } = token;
  return Object.assign(Object.assign({
    margin: 0,
    padding: 0,
    listStyle: "none",
    background: actionsBg,
    borderTop: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
    display: "flex",
    borderRadius: `0 0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)}`
  }, clearFix()), {
    "& > li": {
      margin: actionsLiMargin,
      color: token.colorTextDescription,
      textAlign: "center",
      "> span": {
        position: "relative",
        display: "block",
        minWidth: token.calc(token.cardActionsIconSize).mul(2).equal(),
        fontSize: token.fontSize,
        lineHeight: token.lineHeight,
        cursor: "pointer",
        "&:hover": {
          color: token.colorPrimary,
          transition: `color ${token.motionDurationMid}`
        },
        [`a:not(${componentCls}-btn), > ${iconCls}`]: {
          display: "inline-block",
          width: "100%",
          color: token.colorIcon,
          lineHeight: unit(token.fontHeight),
          transition: `color ${token.motionDurationMid}`,
          "&:hover": {
            color: token.colorPrimary
          }
        },
        [`> ${iconCls}`]: {
          fontSize: cardActionsIconSize,
          lineHeight: unit(token.calc(cardActionsIconSize).mul(token.lineHeight).equal())
        }
      },
      "&:not(:last-child)": {
        borderInlineEnd: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`
      }
    }
  });
};
const genCardMetaStyle = (token) => Object.assign(Object.assign({
  margin: `${unit(token.calc(token.marginXXS).mul(-1).equal())} 0`,
  display: "flex"
}, clearFix()), {
  "&-avatar": {
    paddingInlineEnd: token.padding
  },
  "&-detail": {
    overflow: "hidden",
    flex: 1,
    "> div:not(:last-child)": {
      marginBottom: token.marginXS
    }
  },
  "&-title": Object.assign({
    color: token.colorTextHeading,
    fontWeight: token.fontWeightStrong,
    fontSize: token.fontSizeLG
  }, textEllipsis),
  "&-description": {
    color: token.colorTextDescription
  }
});
const genCardTypeInnerStyle = (token) => {
  const {
    componentCls,
    colorFillAlter,
    headerPadding,
    bodyPadding
  } = token;
  return {
    [`${componentCls}-head`]: {
      padding: `0 ${unit(headerPadding)}`,
      background: colorFillAlter,
      "&-title": {
        fontSize: token.fontSize
      }
    },
    [`${componentCls}-body`]: {
      padding: `${unit(token.padding)} ${unit(bodyPadding)}`
    }
  };
};
const genCardLoadingStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    overflow: "hidden",
    [`${componentCls}-body`]: {
      userSelect: "none"
    }
  };
};
const genCardStyle = (token) => {
  const {
    componentCls,
    cardShadow,
    cardHeadPadding,
    colorBorderSecondary,
    boxShadowTertiary,
    bodyPadding,
    extraColor
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      position: "relative",
      background: token.colorBgContainer,
      borderRadius: token.borderRadiusLG,
      [`&:not(${componentCls}-bordered)`]: {
        boxShadow: boxShadowTertiary
      },
      [`${componentCls}-head`]: genCardHeadStyle(token),
      [`${componentCls}-extra`]: {
        // https://stackoverflow.com/a/22429853/3040605
        marginInlineStart: "auto",
        color: extraColor,
        fontWeight: "normal",
        fontSize: token.fontSize
      },
      [`${componentCls}-body`]: Object.assign({
        padding: bodyPadding,
        borderRadius: `0 0 ${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)}`
      }, clearFix()),
      [`${componentCls}-grid`]: genCardGridStyle(token),
      [`${componentCls}-cover`]: {
        "> *": {
          display: "block",
          width: "100%",
          borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0`
        }
      },
      [`${componentCls}-actions`]: genCardActionsStyle(token),
      [`${componentCls}-meta`]: genCardMetaStyle(token)
    }),
    [`${componentCls}-bordered`]: {
      border: `${unit(token.lineWidth)} ${token.lineType} ${colorBorderSecondary}`,
      [`${componentCls}-cover`]: {
        marginTop: -1,
        marginInlineStart: -1,
        marginInlineEnd: -1
      }
    },
    [`${componentCls}-hoverable`]: {
      cursor: "pointer",
      transition: `box-shadow ${token.motionDurationMid}, border-color ${token.motionDurationMid}`,
      "&:hover": {
        borderColor: "transparent",
        boxShadow: cardShadow
      }
    },
    [`${componentCls}-contain-grid`]: {
      borderRadius: `${unit(token.borderRadiusLG)} ${unit(token.borderRadiusLG)} 0 0 `,
      [`${componentCls}-body`]: {
        display: "flex",
        flexWrap: "wrap"
      },
      [`&:not(${componentCls}-loading) ${componentCls}-body`]: {
        marginBlockStart: token.calc(token.lineWidth).mul(-1).equal(),
        marginInlineStart: token.calc(token.lineWidth).mul(-1).equal(),
        padding: 0
      }
    },
    [`${componentCls}-contain-tabs`]: {
      [`> div${componentCls}-head`]: {
        minHeight: 0,
        [`${componentCls}-head-title, ${componentCls}-extra`]: {
          paddingTop: cardHeadPadding
        }
      }
    },
    [`${componentCls}-type-inner`]: genCardTypeInnerStyle(token),
    [`${componentCls}-loading`]: genCardLoadingStyle(token),
    [`${componentCls}-rtl`]: {
      direction: "rtl"
    }
  };
};
const genCardSizeStyle = (token) => {
  const {
    componentCls,
    bodyPaddingSM,
    headerPaddingSM,
    headerHeightSM,
    headerFontSizeSM
  } = token;
  return {
    [`${componentCls}-small`]: {
      [`> ${componentCls}-head`]: {
        minHeight: headerHeightSM,
        padding: `0 ${unit(headerPaddingSM)}`,
        fontSize: headerFontSizeSM,
        [`> ${componentCls}-head-wrapper`]: {
          [`> ${componentCls}-extra`]: {
            fontSize: token.fontSize
          }
        }
      },
      [`> ${componentCls}-body`]: {
        padding: bodyPaddingSM
      }
    },
    [`${componentCls}-small${componentCls}-contain-tabs`]: {
      [`> ${componentCls}-head`]: {
        [`${componentCls}-head-title, ${componentCls}-extra`]: {
          paddingTop: 0,
          display: "flex",
          alignItems: "center"
        }
      }
    }
  };
};
const prepareComponentToken$a = (token) => {
  var _a, _b;
  return {
    headerBg: "transparent",
    headerFontSize: token.fontSizeLG,
    headerFontSizeSM: token.fontSize,
    headerHeight: token.fontSizeLG * token.lineHeightLG + token.padding * 2,
    headerHeightSM: token.fontSize * token.lineHeight + token.paddingXS * 2,
    actionsBg: token.colorBgContainer,
    actionsLiMargin: `${token.paddingSM}px 0`,
    tabsMarginBottom: -token.padding - token.lineWidth,
    extraColor: token.colorText,
    bodyPaddingSM: 12,
    // Fixed padding.
    headerPaddingSM: 12,
    bodyPadding: (_a = token.bodyPadding) !== null && _a !== void 0 ? _a : token.paddingLG,
    headerPadding: (_b = token.headerPadding) !== null && _b !== void 0 ? _b : token.paddingLG
  };
};
const useStyle$d = genStyleHooks("Card", (token) => {
  const cardToken = merge$1(token, {
    cardShadow: token.boxShadowCard,
    cardHeadPadding: token.padding,
    cardPaddingBase: token.paddingLG,
    cardActionsIconSize: token.fontSize
  });
  return [
    // Style
    genCardStyle(cardToken),
    // Size
    genCardSizeStyle(cardToken)
  ];
}, prepareComponentToken$a);
var __rest$A = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const ActionNode = (props) => {
  const {
    actionClasses,
    actions = [],
    actionStyle
  } = props;
  return /* @__PURE__ */ reactExports.createElement("ul", {
    className: actionClasses,
    style: actionStyle
  }, actions.map((action, index) => {
    const key = `action-${index}`;
    return /* @__PURE__ */ reactExports.createElement("li", {
      style: {
        width: `${100 / actions.length}%`
      },
      key
    }, /* @__PURE__ */ reactExports.createElement("span", null, action));
  }));
};
const Card$1 = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    extra,
    headStyle = {},
    bodyStyle = {},
    title,
    loading,
    bordered,
    variant: customVariant,
    size: customizeSize,
    type,
    cover,
    actions,
    tabList,
    children,
    activeTabKey,
    defaultActiveTabKey,
    tabBarExtraContent,
    hoverable,
    tabProps = {},
    classNames: customClassNames,
    styles: customStyles
  } = props, others = __rest$A(props, ["prefixCls", "className", "rootClassName", "style", "extra", "headStyle", "bodyStyle", "title", "loading", "bordered", "variant", "size", "type", "cover", "actions", "tabList", "children", "activeTabKey", "defaultActiveTabKey", "tabBarExtraContent", "hoverable", "tabProps", "classNames", "styles"]);
  const {
    getPrefixCls,
    direction,
    card
  } = reactExports.useContext(ConfigContext);
  const [variant] = useVariant("card", customVariant, bordered);
  const onTabChange = (key) => {
    var _a;
    (_a = props.onTabChange) === null || _a === void 0 ? void 0 : _a.call(props, key);
  };
  const moduleClass = (moduleName) => {
    var _a;
    return classNames((_a = card === null || card === void 0 ? void 0 : card.classNames) === null || _a === void 0 ? void 0 : _a[moduleName], customClassNames === null || customClassNames === void 0 ? void 0 : customClassNames[moduleName]);
  };
  const moduleStyle = (moduleName) => {
    var _a;
    return Object.assign(Object.assign({}, (_a = card === null || card === void 0 ? void 0 : card.styles) === null || _a === void 0 ? void 0 : _a[moduleName]), customStyles === null || customStyles === void 0 ? void 0 : customStyles[moduleName]);
  };
  const isContainGrid = reactExports.useMemo(() => {
    let containGrid = false;
    reactExports.Children.forEach(children, (element) => {
      if ((element === null || element === void 0 ? void 0 : element.type) === Grid) {
        containGrid = true;
      }
    });
    return containGrid;
  }, [children]);
  const prefixCls = getPrefixCls("card", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$d(prefixCls);
  const loadingBlock = /* @__PURE__ */ reactExports.createElement(Skeleton, {
    loading: true,
    active: true,
    paragraph: {
      rows: 4
    },
    title: false
  }, children);
  const hasActiveTabKey = activeTabKey !== void 0;
  const extraProps = Object.assign(Object.assign({}, tabProps), {
    [hasActiveTabKey ? "activeKey" : "defaultActiveKey"]: hasActiveTabKey ? activeTabKey : defaultActiveTabKey,
    tabBarExtraContent
  });
  let head;
  const mergedSize = useSize(customizeSize);
  const tabSize = !mergedSize || mergedSize === "default" ? "large" : mergedSize;
  const tabs = tabList ? /* @__PURE__ */ reactExports.createElement(Tabs, Object.assign({
    size: tabSize
  }, extraProps, {
    className: `${prefixCls}-head-tabs`,
    onChange: onTabChange,
    items: tabList.map((_a) => {
      var {
        tab
      } = _a, item = __rest$A(_a, ["tab"]);
      return Object.assign({
        label: tab
      }, item);
    })
  })) : null;
  if (title || extra || tabs) {
    const headClasses = classNames(`${prefixCls}-head`, moduleClass("header"));
    const titleClasses = classNames(`${prefixCls}-head-title`, moduleClass("title"));
    const extraClasses = classNames(`${prefixCls}-extra`, moduleClass("extra"));
    const mergedHeadStyle = Object.assign(Object.assign({}, headStyle), moduleStyle("header"));
    head = /* @__PURE__ */ reactExports.createElement("div", {
      className: headClasses,
      style: mergedHeadStyle
    }, /* @__PURE__ */ reactExports.createElement("div", {
      className: `${prefixCls}-head-wrapper`
    }, title && /* @__PURE__ */ reactExports.createElement("div", {
      className: titleClasses,
      style: moduleStyle("title")
    }, title), extra && /* @__PURE__ */ reactExports.createElement("div", {
      className: extraClasses,
      style: moduleStyle("extra")
    }, extra)), tabs);
  }
  const coverClasses = classNames(`${prefixCls}-cover`, moduleClass("cover"));
  const coverDom = cover ? /* @__PURE__ */ reactExports.createElement("div", {
    className: coverClasses,
    style: moduleStyle("cover")
  }, cover) : null;
  const bodyClasses = classNames(`${prefixCls}-body`, moduleClass("body"));
  const mergedBodyStyle = Object.assign(Object.assign({}, bodyStyle), moduleStyle("body"));
  const body = /* @__PURE__ */ reactExports.createElement("div", {
    className: bodyClasses,
    style: mergedBodyStyle
  }, loading ? loadingBlock : children);
  const actionClasses = classNames(`${prefixCls}-actions`, moduleClass("actions"));
  const actionDom = (actions === null || actions === void 0 ? void 0 : actions.length) ? /* @__PURE__ */ reactExports.createElement(ActionNode, {
    actionClasses,
    actionStyle: moduleStyle("actions"),
    actions
  }) : null;
  const divProps = omit(others, ["onTabChange"]);
  const classString = classNames(prefixCls, card === null || card === void 0 ? void 0 : card.className, {
    [`${prefixCls}-loading`]: loading,
    [`${prefixCls}-bordered`]: variant !== "borderless",
    [`${prefixCls}-hoverable`]: hoverable,
    [`${prefixCls}-contain-grid`]: isContainGrid,
    [`${prefixCls}-contain-tabs`]: tabList === null || tabList === void 0 ? void 0 : tabList.length,
    [`${prefixCls}-${mergedSize}`]: mergedSize,
    [`${prefixCls}-type-${type}`]: !!type,
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, className, rootClassName, hashId, cssVarCls);
  const mergedStyle = Object.assign(Object.assign({}, card === null || card === void 0 ? void 0 : card.style), style);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({
    ref
  }, divProps, {
    className: classString,
    style: mergedStyle
  }), head, coverDom, body, actionDom));
});
var __rest$z = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Meta = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    avatar,
    title,
    description
  } = props, others = __rest$z(props, ["prefixCls", "className", "avatar", "title", "description"]);
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("card", customizePrefixCls);
  const classString = classNames(`${prefixCls}-meta`, className);
  const avatarDom = avatar ? /* @__PURE__ */ reactExports.createElement("div", {
    className: `${prefixCls}-meta-avatar`
  }, avatar) : null;
  const titleDom = title ? /* @__PURE__ */ reactExports.createElement("div", {
    className: `${prefixCls}-meta-title`
  }, title) : null;
  const descriptionDom = description ? /* @__PURE__ */ reactExports.createElement("div", {
    className: `${prefixCls}-meta-description`
  }, description) : null;
  const MetaDetail = titleDom || descriptionDom ? /* @__PURE__ */ reactExports.createElement("div", {
    className: `${prefixCls}-meta-detail`
  }, titleDom, descriptionDom) : null;
  return /* @__PURE__ */ reactExports.createElement("div", Object.assign({}, others, {
    className: classString
  }), avatarDom, MetaDetail);
};
const Card = Card$1;
Card.Grid = Grid;
Card.Meta = Meta;
const genCheckboxStyle = (token) => {
  const {
    checkboxCls
  } = token;
  const wrapperCls = `${checkboxCls}-wrapper`;
  return [
    // ===================== Basic =====================
    {
      // Group
      [`${checkboxCls}-group`]: Object.assign(Object.assign({}, resetComponent(token)), {
        display: "inline-flex",
        flexWrap: "wrap",
        columnGap: token.marginXS,
        // Group > Grid
        [`> ${token.antCls}-row`]: {
          flex: 1
        }
      }),
      // Wrapper
      [wrapperCls]: Object.assign(Object.assign({}, resetComponent(token)), {
        display: "inline-flex",
        alignItems: "baseline",
        cursor: "pointer",
        // Fix checkbox & radio in flex align #30260
        "&:after": {
          display: "inline-block",
          width: 0,
          overflow: "hidden",
          content: "'\\a0'"
        },
        // Checkbox near checkbox
        [`& + ${wrapperCls}`]: {
          marginInlineStart: 0
        },
        [`&${wrapperCls}-in-form-item`]: {
          'input[type="checkbox"]': {
            width: 14,
            // FIXME: magic
            height: 14
            // FIXME: magic
          }
        }
      }),
      // Wrapper > Checkbox
      [checkboxCls]: Object.assign(Object.assign({}, resetComponent(token)), {
        position: "relative",
        whiteSpace: "nowrap",
        lineHeight: 1,
        cursor: "pointer",
        borderRadius: token.borderRadiusSM,
        // To make alignment right when `controlHeight` is changed
        // Ref: https://github.com/ant-design/ant-design/issues/41564
        alignSelf: "center",
        // Wrapper > Checkbox > input
        [`${checkboxCls}-input`]: {
          position: "absolute",
          // Since baseline align will get additional space offset,
          // we need to move input to top to make it align with text.
          // Ref: https://github.com/ant-design/ant-design/issues/38926#issuecomment-1486137799
          inset: 0,
          zIndex: 1,
          cursor: "pointer",
          opacity: 0,
          margin: 0,
          [`&:focus-visible + ${checkboxCls}-inner`]: Object.assign({}, genFocusOutline(token))
        },
        // Wrapper > Checkbox > inner
        [`${checkboxCls}-inner`]: {
          boxSizing: "border-box",
          display: "block",
          width: token.checkboxSize,
          height: token.checkboxSize,
          direction: "ltr",
          backgroundColor: token.colorBgContainer,
          border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
          borderRadius: token.borderRadiusSM,
          borderCollapse: "separate",
          transition: `all ${token.motionDurationSlow}`,
          "&:after": {
            boxSizing: "border-box",
            position: "absolute",
            top: "50%",
            insetInlineStart: "25%",
            display: "table",
            width: token.calc(token.checkboxSize).div(14).mul(5).equal(),
            height: token.calc(token.checkboxSize).div(14).mul(8).equal(),
            border: `${unit(token.lineWidthBold)} solid ${token.colorWhite}`,
            borderTop: 0,
            borderInlineStart: 0,
            transform: "rotate(45deg) scale(0) translate(-50%,-50%)",
            opacity: 0,
            content: '""',
            transition: `all ${token.motionDurationFast} ${token.motionEaseInBack}, opacity ${token.motionDurationFast}`
          }
        },
        // Wrapper > Checkbox + Text
        "& + span": {
          paddingInlineStart: token.paddingXS,
          paddingInlineEnd: token.paddingXS
        }
      })
    },
    // ===================== Hover =====================
    {
      // Wrapper & Wrapper > Checkbox
      [`
        ${wrapperCls}:not(${wrapperCls}-disabled),
        ${checkboxCls}:not(${checkboxCls}-disabled)
      `]: {
        [`&:hover ${checkboxCls}-inner`]: {
          borderColor: token.colorPrimary
        }
      },
      [`${wrapperCls}:not(${wrapperCls}-disabled)`]: {
        [`&:hover ${checkboxCls}-checked:not(${checkboxCls}-disabled) ${checkboxCls}-inner`]: {
          backgroundColor: token.colorPrimaryHover,
          borderColor: "transparent"
        },
        [`&:hover ${checkboxCls}-checked:not(${checkboxCls}-disabled):after`]: {
          borderColor: token.colorPrimaryHover
        }
      }
    },
    // ==================== Checked ====================
    {
      // Wrapper > Checkbox
      [`${checkboxCls}-checked`]: {
        [`${checkboxCls}-inner`]: {
          backgroundColor: token.colorPrimary,
          borderColor: token.colorPrimary,
          "&:after": {
            opacity: 1,
            transform: "rotate(45deg) scale(1) translate(-50%,-50%)",
            transition: `all ${token.motionDurationMid} ${token.motionEaseOutBack} ${token.motionDurationFast}`
          }
        }
      },
      [`
        ${wrapperCls}-checked:not(${wrapperCls}-disabled),
        ${checkboxCls}-checked:not(${checkboxCls}-disabled)
      `]: {
        [`&:hover ${checkboxCls}-inner`]: {
          backgroundColor: token.colorPrimaryHover,
          borderColor: "transparent"
        }
      }
    },
    // ================= Indeterminate =================
    {
      [checkboxCls]: {
        "&-indeterminate": {
          "&": {
            // Wrapper > Checkbox > inner
            [`${checkboxCls}-inner`]: {
              backgroundColor: `${token.colorBgContainer}`,
              borderColor: `${token.colorBorder}`,
              "&:after": {
                top: "50%",
                insetInlineStart: "50%",
                width: token.calc(token.fontSizeLG).div(2).equal(),
                height: token.calc(token.fontSizeLG).div(2).equal(),
                backgroundColor: token.colorPrimary,
                border: 0,
                transform: "translate(-50%, -50%) scale(1)",
                opacity: 1,
                content: '""'
              }
            },
            // https://github.com/ant-design/ant-design/issues/50074
            [`&:hover ${checkboxCls}-inner`]: {
              backgroundColor: `${token.colorBgContainer}`,
              borderColor: `${token.colorPrimary}`
            }
          }
        }
      }
    },
    // ==================== Disable ====================
    {
      // Wrapper
      [`${wrapperCls}-disabled`]: {
        cursor: "not-allowed"
      },
      // Wrapper > Checkbox
      [`${checkboxCls}-disabled`]: {
        // Wrapper > Checkbox > input
        [`&, ${checkboxCls}-input`]: {
          cursor: "not-allowed",
          // Disabled for native input to enable Tooltip event handler
          // ref: https://github.com/ant-design/ant-design/issues/39822#issuecomment-1365075901
          pointerEvents: "none"
        },
        // Wrapper > Checkbox > inner
        [`${checkboxCls}-inner`]: {
          background: token.colorBgContainerDisabled,
          borderColor: token.colorBorder,
          "&:after": {
            borderColor: token.colorTextDisabled
          }
        },
        "&:after": {
          display: "none"
        },
        "& + span": {
          color: token.colorTextDisabled
        },
        [`&${checkboxCls}-indeterminate ${checkboxCls}-inner::after`]: {
          background: token.colorTextDisabled
        }
      }
    }
  ];
};
function getStyle(prefixCls, token) {
  const checkboxToken = merge$1(token, {
    checkboxCls: `.${prefixCls}`,
    checkboxSize: token.controlInteractiveSize
  });
  return [genCheckboxStyle(checkboxToken)];
}
const useStyle$c = genStyleHooks("Checkbox", (token, {
  prefixCls
}) => [getStyle(prefixCls, token)]);
const GroupContext = /* @__PURE__ */ React.createContext(null);
var __rest$y = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const InternalCheckbox = (props, ref) => {
  var _a;
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    children,
    indeterminate = false,
    style,
    onMouseEnter,
    onMouseLeave,
    skipGroup = false,
    disabled
  } = props, restProps = __rest$y(props, ["prefixCls", "className", "rootClassName", "children", "indeterminate", "style", "onMouseEnter", "onMouseLeave", "skipGroup", "disabled"]);
  const {
    getPrefixCls,
    direction,
    checkbox
  } = reactExports.useContext(ConfigContext);
  const checkboxGroup = reactExports.useContext(GroupContext);
  const {
    isFormItemInput
  } = reactExports.useContext(FormItemInputContext);
  const contextDisabled = reactExports.useContext(DisabledContext);
  const mergedDisabled = (_a = (checkboxGroup === null || checkboxGroup === void 0 ? void 0 : checkboxGroup.disabled) || disabled) !== null && _a !== void 0 ? _a : contextDisabled;
  const prevValue = reactExports.useRef(restProps.value);
  const checkboxRef = reactExports.useRef(null);
  const mergedRef = composeRef(ref, checkboxRef);
  reactExports.useEffect(() => {
    checkboxGroup === null || checkboxGroup === void 0 ? void 0 : checkboxGroup.registerValue(restProps.value);
  }, []);
  reactExports.useEffect(() => {
    if (skipGroup) {
      return;
    }
    if (restProps.value !== prevValue.current) {
      checkboxGroup === null || checkboxGroup === void 0 ? void 0 : checkboxGroup.cancelValue(prevValue.current);
      checkboxGroup === null || checkboxGroup === void 0 ? void 0 : checkboxGroup.registerValue(restProps.value);
      prevValue.current = restProps.value;
    }
    return () => checkboxGroup === null || checkboxGroup === void 0 ? void 0 : checkboxGroup.cancelValue(restProps.value);
  }, [restProps.value]);
  reactExports.useEffect(() => {
    var _a2;
    if ((_a2 = checkboxRef.current) === null || _a2 === void 0 ? void 0 : _a2.input) {
      checkboxRef.current.input.indeterminate = indeterminate;
    }
  }, [indeterminate]);
  const prefixCls = getPrefixCls("checkbox", customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$c(prefixCls, rootCls);
  const checkboxProps = Object.assign({}, restProps);
  if (checkboxGroup && !skipGroup) {
    checkboxProps.onChange = (...args) => {
      if (restProps.onChange) {
        restProps.onChange.apply(restProps, args);
      }
      if (checkboxGroup.toggleOption) {
        checkboxGroup.toggleOption({
          label: children,
          value: restProps.value
        });
      }
    };
    checkboxProps.name = checkboxGroup.name;
    checkboxProps.checked = checkboxGroup.value.includes(restProps.value);
  }
  const classString = classNames(`${prefixCls}-wrapper`, {
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-wrapper-checked`]: checkboxProps.checked,
    [`${prefixCls}-wrapper-disabled`]: mergedDisabled,
    [`${prefixCls}-wrapper-in-form-item`]: isFormItemInput
  }, checkbox === null || checkbox === void 0 ? void 0 : checkbox.className, className, rootClassName, cssVarCls, rootCls, hashId);
  const checkboxClass = classNames({
    [`${prefixCls}-indeterminate`]: indeterminate
  }, TARGET_CLS, hashId);
  const [onLabelClick, onInputClick] = useBubbleLock(checkboxProps.onClick);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(Wave, {
    component: "Checkbox",
    disabled: mergedDisabled
  }, /* @__PURE__ */ reactExports.createElement("label", {
    className: classString,
    style: Object.assign(Object.assign({}, checkbox === null || checkbox === void 0 ? void 0 : checkbox.style), style),
    onMouseEnter,
    onMouseLeave,
    onClick: onLabelClick
  }, /* @__PURE__ */ reactExports.createElement(Checkbox$2, Object.assign({}, checkboxProps, {
    onClick: onInputClick,
    prefixCls,
    className: checkboxClass,
    disabled: mergedDisabled,
    ref: mergedRef
  })), children !== void 0 && children !== null && /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-label`
  }, children))));
};
const Checkbox$1 = /* @__PURE__ */ reactExports.forwardRef(InternalCheckbox);
var __rest$x = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const CheckboxGroup = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    defaultValue,
    children,
    options = [],
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    onChange
  } = props, restProps = __rest$x(props, ["defaultValue", "children", "options", "prefixCls", "className", "rootClassName", "style", "onChange"]);
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const [value, setValue] = reactExports.useState(restProps.value || defaultValue || []);
  const [registeredValues, setRegisteredValues] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if ("value" in restProps) {
      setValue(restProps.value || []);
    }
  }, [restProps.value]);
  const memoizedOptions = reactExports.useMemo(() => options.map((option) => {
    if (typeof option === "string" || typeof option === "number") {
      return {
        label: option,
        value: option
      };
    }
    return option;
  }), [options]);
  const cancelValue = (val) => {
    setRegisteredValues((prevValues) => prevValues.filter((v) => v !== val));
  };
  const registerValue = (val) => {
    setRegisteredValues((prevValues) => [].concat(_toConsumableArray(prevValues), [val]));
  };
  const toggleOption = (option) => {
    const optionIndex = value.indexOf(option.value);
    const newValue = _toConsumableArray(value);
    if (optionIndex === -1) {
      newValue.push(option.value);
    } else {
      newValue.splice(optionIndex, 1);
    }
    if (!("value" in restProps)) {
      setValue(newValue);
    }
    onChange === null || onChange === void 0 ? void 0 : onChange(newValue.filter((val) => registeredValues.includes(val)).sort((a, b) => {
      const indexA = memoizedOptions.findIndex((opt) => opt.value === a);
      const indexB = memoizedOptions.findIndex((opt) => opt.value === b);
      return indexA - indexB;
    }));
  };
  const prefixCls = getPrefixCls("checkbox", customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-group`;
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$c(prefixCls, rootCls);
  const domProps = omit(restProps, ["value", "disabled"]);
  const childrenNode = options.length ? memoizedOptions.map((option) => /* @__PURE__ */ reactExports.createElement(Checkbox$1, {
    prefixCls,
    key: option.value.toString(),
    disabled: "disabled" in option ? option.disabled : restProps.disabled,
    value: option.value,
    checked: value.includes(option.value),
    onChange: option.onChange,
    className: classNames(`${groupPrefixCls}-item`, option.className),
    style: option.style,
    title: option.title,
    id: option.id,
    required: option.required
  }, option.label)) : children;
  const memoizedContext = reactExports.useMemo(() => ({
    toggleOption,
    value,
    disabled: restProps.disabled,
    name: restProps.name,
    // https://github.com/ant-design/ant-design/issues/16376
    registerValue,
    cancelValue
  }), [toggleOption, value, restProps.disabled, restProps.name, registerValue, cancelValue]);
  const classString = classNames(groupPrefixCls, {
    [`${groupPrefixCls}-rtl`]: direction === "rtl"
  }, className, rootClassName, cssVarCls, rootCls, hashId);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({
    className: classString,
    style
  }, domProps, {
    ref
  }), /* @__PURE__ */ reactExports.createElement(GroupContext.Provider, {
    value: memoizedContext
  }, childrenNode)));
});
const Checkbox = Checkbox$1;
Checkbox.Group = CheckboxGroup;
Checkbox.__ANT_CHECKBOX = true;
const RowContext = /* @__PURE__ */ reactExports.createContext({});
var __rest$w = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function parseFlex(flex) {
  if (typeof flex === "number") {
    return `${flex} ${flex} auto`;
  }
  if (/^\d+(\.\d+)?(px|em|rem|%)$/.test(flex)) {
    return `0 0 ${flex}`;
  }
  return flex;
}
const sizes = ["xs", "sm", "md", "lg", "xl", "xxl"];
const Col = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const {
    gutter,
    wrap
  } = reactExports.useContext(RowContext);
  const {
    prefixCls: customizePrefixCls,
    span,
    order,
    offset: offset2,
    push,
    pull,
    className,
    children,
    flex,
    style
  } = props, others = __rest$w(props, ["prefixCls", "span", "order", "offset", "push", "pull", "className", "children", "flex", "style"]);
  const prefixCls = getPrefixCls("col", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useColStyle(prefixCls);
  const sizeStyle = {};
  let sizeClassObj = {};
  sizes.forEach((size) => {
    let sizeProps = {};
    const propSize = props[size];
    if (typeof propSize === "number") {
      sizeProps.span = propSize;
    } else if (typeof propSize === "object") {
      sizeProps = propSize || {};
    }
    delete others[size];
    sizeClassObj = Object.assign(Object.assign({}, sizeClassObj), {
      [`${prefixCls}-${size}-${sizeProps.span}`]: sizeProps.span !== void 0,
      [`${prefixCls}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
      [`${prefixCls}-${size}-offset-${sizeProps.offset}`]: sizeProps.offset || sizeProps.offset === 0,
      [`${prefixCls}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
      [`${prefixCls}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0,
      [`${prefixCls}-rtl`]: direction === "rtl"
    });
    if (sizeProps.flex) {
      sizeClassObj[`${prefixCls}-${size}-flex`] = true;
      sizeStyle[`--${prefixCls}-${size}-flex`] = parseFlex(sizeProps.flex);
    }
  });
  const classes = classNames(prefixCls, {
    [`${prefixCls}-${span}`]: span !== void 0,
    [`${prefixCls}-order-${order}`]: order,
    [`${prefixCls}-offset-${offset2}`]: offset2,
    [`${prefixCls}-push-${push}`]: push,
    [`${prefixCls}-pull-${pull}`]: pull
  }, className, sizeClassObj, hashId, cssVarCls);
  const mergedStyle = {};
  if (gutter && gutter[0] > 0) {
    const horizontalGutter = gutter[0] / 2;
    mergedStyle.paddingLeft = horizontalGutter;
    mergedStyle.paddingRight = horizontalGutter;
  }
  if (flex) {
    mergedStyle.flex = parseFlex(flex);
    if (wrap === false && !mergedStyle.minWidth) {
      mergedStyle.minWidth = 0;
    }
  }
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({}, others, {
    style: Object.assign(Object.assign(Object.assign({}, mergedStyle), style), sizeStyle),
    className: classes,
    ref
  }), children));
});
function useGutter(gutter, screens) {
  const results = [void 0, void 0];
  const normalizedGutter = Array.isArray(gutter) ? gutter : [gutter, void 0];
  const mergedScreens = screens || {
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    xxl: true
  };
  normalizedGutter.forEach((g, index) => {
    if (typeof g === "object" && g !== null) {
      for (let i = 0; i < responsiveArray.length; i++) {
        const breakpoint = responsiveArray[i];
        if (mergedScreens[breakpoint] && g[breakpoint] !== void 0) {
          results[index] = g[breakpoint];
          break;
        }
      }
    } else {
      results[index] = g;
    }
  });
  return results;
}
var __rest$v = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function useMergedPropByScreen(oriProp, screen) {
  const [prop, setProp] = reactExports.useState(typeof oriProp === "string" ? oriProp : "");
  const calcMergedAlignOrJustify = () => {
    if (typeof oriProp === "string") {
      setProp(oriProp);
    }
    if (typeof oriProp !== "object") {
      return;
    }
    for (let i = 0; i < responsiveArray.length; i++) {
      const breakpoint = responsiveArray[i];
      if (!screen || !screen[breakpoint]) {
        continue;
      }
      const curVal = oriProp[breakpoint];
      if (curVal !== void 0) {
        setProp(curVal);
        return;
      }
    }
  };
  reactExports.useEffect(() => {
    calcMergedAlignOrJustify();
  }, [JSON.stringify(oriProp), screen]);
  return prop;
}
const Row = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    justify,
    align,
    className,
    style,
    children,
    gutter = 0,
    wrap
  } = props, others = __rest$v(props, ["prefixCls", "justify", "align", "className", "style", "children", "gutter", "wrap"]);
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const screens = useBreakpoint(true, null);
  const mergedAlign = useMergedPropByScreen(align, screens);
  const mergedJustify = useMergedPropByScreen(justify, screens);
  const prefixCls = getPrefixCls("row", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useRowStyle(prefixCls);
  const gutters = useGutter(gutter, screens);
  const classes = classNames(prefixCls, {
    [`${prefixCls}-no-wrap`]: wrap === false,
    [`${prefixCls}-${mergedJustify}`]: mergedJustify,
    [`${prefixCls}-${mergedAlign}`]: mergedAlign,
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, className, hashId, cssVarCls);
  const rowStyle = {};
  const horizontalGutter = gutters[0] != null && gutters[0] > 0 ? gutters[0] / -2 : void 0;
  if (horizontalGutter) {
    rowStyle.marginLeft = horizontalGutter;
    rowStyle.marginRight = horizontalGutter;
  }
  const [gutterH, gutterV] = gutters;
  rowStyle.rowGap = gutterV;
  const rowContext = reactExports.useMemo(() => ({
    gutter: [gutterH, gutterV],
    wrap
  }), [gutterH, gutterV, wrap]);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(RowContext.Provider, {
    value: rowContext
  }, /* @__PURE__ */ reactExports.createElement("div", Object.assign({}, others, {
    className: classes,
    style: Object.assign(Object.assign({}, rowStyle), style),
    ref
  }), children)));
});
const genSizeDividerStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [componentCls]: {
      "&-horizontal": {
        [`&${componentCls}`]: {
          "&-sm": {
            marginBlock: token.marginXS
          },
          "&-md": {
            marginBlock: token.margin
          }
        }
      }
    }
  };
};
const genSharedDividerStyle = (token) => {
  const {
    componentCls,
    sizePaddingEdgeHorizontal,
    colorSplit,
    lineWidth,
    textPaddingInline,
    orientationMargin,
    verticalMarginInline
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      borderBlockStart: `${unit(lineWidth)} solid ${colorSplit}`,
      // vertical
      "&-vertical": {
        position: "relative",
        top: "-0.06em",
        display: "inline-block",
        height: "0.9em",
        marginInline: verticalMarginInline,
        marginBlock: 0,
        verticalAlign: "middle",
        borderTop: 0,
        borderInlineStart: `${unit(lineWidth)} solid ${colorSplit}`
      },
      "&-horizontal": {
        display: "flex",
        clear: "both",
        width: "100%",
        minWidth: "100%",
        // Fix https://github.com/ant-design/ant-design/issues/10914
        margin: `${unit(token.marginLG)} 0`
      },
      [`&-horizontal${componentCls}-with-text`]: {
        display: "flex",
        alignItems: "center",
        margin: `${unit(token.dividerHorizontalWithTextGutterMargin)} 0`,
        color: token.colorTextHeading,
        fontWeight: 500,
        fontSize: token.fontSizeLG,
        whiteSpace: "nowrap",
        textAlign: "center",
        borderBlockStart: `0 ${colorSplit}`,
        "&::before, &::after": {
          position: "relative",
          width: "50%",
          borderBlockStart: `${unit(lineWidth)} solid transparent`,
          // Chrome not accept `inherit` in `border-top`
          borderBlockStartColor: "inherit",
          borderBlockEnd: 0,
          transform: "translateY(50%)",
          content: "''"
        }
      },
      [`&-horizontal${componentCls}-with-text-start`]: {
        "&::before": {
          width: `calc(${orientationMargin} * 100%)`
        },
        "&::after": {
          width: `calc(100% - ${orientationMargin} * 100%)`
        }
      },
      [`&-horizontal${componentCls}-with-text-end`]: {
        "&::before": {
          width: `calc(100% - ${orientationMargin} * 100%)`
        },
        "&::after": {
          width: `calc(${orientationMargin} * 100%)`
        }
      },
      [`${componentCls}-inner-text`]: {
        display: "inline-block",
        paddingBlock: 0,
        paddingInline: textPaddingInline
      },
      "&-dashed": {
        background: "none",
        borderColor: colorSplit,
        borderStyle: "dashed",
        borderWidth: `${unit(lineWidth)} 0 0`
      },
      [`&-horizontal${componentCls}-with-text${componentCls}-dashed`]: {
        "&::before, &::after": {
          borderStyle: "dashed none none"
        }
      },
      [`&-vertical${componentCls}-dashed`]: {
        borderInlineStartWidth: lineWidth,
        borderInlineEnd: 0,
        borderBlockStart: 0,
        borderBlockEnd: 0
      },
      "&-dotted": {
        background: "none",
        borderColor: colorSplit,
        borderStyle: "dotted",
        borderWidth: `${unit(lineWidth)} 0 0`
      },
      [`&-horizontal${componentCls}-with-text${componentCls}-dotted`]: {
        "&::before, &::after": {
          borderStyle: "dotted none none"
        }
      },
      [`&-vertical${componentCls}-dotted`]: {
        borderInlineStartWidth: lineWidth,
        borderInlineEnd: 0,
        borderBlockStart: 0,
        borderBlockEnd: 0
      },
      [`&-plain${componentCls}-with-text`]: {
        color: token.colorText,
        fontWeight: "normal",
        fontSize: token.fontSize
      },
      [`&-horizontal${componentCls}-with-text-start${componentCls}-no-default-orientation-margin-start`]: {
        "&::before": {
          width: 0
        },
        "&::after": {
          width: "100%"
        },
        [`${componentCls}-inner-text`]: {
          paddingInlineStart: sizePaddingEdgeHorizontal
        }
      },
      [`&-horizontal${componentCls}-with-text-end${componentCls}-no-default-orientation-margin-end`]: {
        "&::before": {
          width: "100%"
        },
        "&::after": {
          width: 0
        },
        [`${componentCls}-inner-text`]: {
          paddingInlineEnd: sizePaddingEdgeHorizontal
        }
      }
    })
  };
};
const prepareComponentToken$9 = (token) => ({
  textPaddingInline: "1em",
  orientationMargin: 0.05,
  verticalMarginInline: token.marginXS
});
const useStyle$b = genStyleHooks("Divider", (token) => {
  const dividerToken = merge$1(token, {
    dividerHorizontalWithTextGutterMargin: token.margin,
    sizePaddingEdgeHorizontal: 0
  });
  return [genSharedDividerStyle(dividerToken), genSizeDividerStyle(dividerToken)];
}, prepareComponentToken$9, {
  unitless: {
    orientationMargin: true
  }
});
var __rest$u = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const sizeClassNameMap = {
  small: "sm",
  middle: "md"
};
const Divider = (props) => {
  const {
    getPrefixCls,
    direction,
    className: dividerClassName,
    style: dividerStyle
  } = useComponentConfig("divider");
  const {
    prefixCls: customizePrefixCls,
    type = "horizontal",
    orientation = "center",
    orientationMargin,
    className,
    rootClassName,
    children,
    dashed,
    variant = "solid",
    plain,
    style,
    size: customSize
  } = props, restProps = __rest$u(props, ["prefixCls", "type", "orientation", "orientationMargin", "className", "rootClassName", "children", "dashed", "variant", "plain", "style", "size"]);
  const prefixCls = getPrefixCls("divider", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$b(prefixCls);
  const sizeFullName = useSize(customSize);
  const sizeCls = sizeClassNameMap[sizeFullName];
  const hasChildren = !!children;
  const mergedOrientation = reactExports.useMemo(() => {
    if (orientation === "left") {
      return direction === "rtl" ? "end" : "start";
    }
    if (orientation === "right") {
      return direction === "rtl" ? "start" : "end";
    }
    return orientation;
  }, [direction, orientation]);
  const hasMarginStart = mergedOrientation === "start" && orientationMargin != null;
  const hasMarginEnd = mergedOrientation === "end" && orientationMargin != null;
  const classString = classNames(prefixCls, dividerClassName, hashId, cssVarCls, `${prefixCls}-${type}`, {
    [`${prefixCls}-with-text`]: hasChildren,
    [`${prefixCls}-with-text-${mergedOrientation}`]: hasChildren,
    [`${prefixCls}-dashed`]: !!dashed,
    [`${prefixCls}-${variant}`]: variant !== "solid",
    [`${prefixCls}-plain`]: !!plain,
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-no-default-orientation-margin-start`]: hasMarginStart,
    [`${prefixCls}-no-default-orientation-margin-end`]: hasMarginEnd,
    [`${prefixCls}-${sizeCls}`]: !!sizeCls
  }, className, rootClassName);
  const memoizedOrientationMargin = reactExports.useMemo(() => {
    if (typeof orientationMargin === "number") {
      return orientationMargin;
    }
    if (/^\d+$/.test(orientationMargin)) {
      return Number(orientationMargin);
    }
    return orientationMargin;
  }, [orientationMargin]);
  const innerStyle = {
    marginInlineStart: hasMarginStart ? memoizedOrientationMargin : void 0,
    marginInlineEnd: hasMarginEnd ? memoizedOrientationMargin : void 0
  };
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({
    className: classString,
    style: Object.assign(Object.assign({}, dividerStyle), style)
  }, restProps, {
    role: "separator"
  }), children && type !== "vertical" && /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-inner-text`,
    style: innerStyle
  }, children)));
};
const prepareComponentToken$8 = (token) => {
  var _a;
  const handleVisible = (_a = token.handleVisible) !== null && _a !== void 0 ? _a : "auto";
  const handleWidth = token.controlHeightSM - token.lineWidth * 2;
  return Object.assign(Object.assign({}, initComponentToken$1(token)), {
    controlWidth: 90,
    handleWidth,
    handleFontSize: token.fontSize / 2,
    handleVisible,
    handleActiveBg: token.colorFillAlter,
    handleBg: token.colorBgContainer,
    filledHandleBg: new FastColor(token.colorFillSecondary).onBackground(token.colorBgContainer).toHexString(),
    handleHoverColor: token.colorPrimary,
    handleBorderColor: token.colorBorder,
    handleOpacity: handleVisible === true ? 1 : 0,
    handleVisibleWidth: handleVisible === true ? handleWidth : 0
  });
};
const genRadiusStyle$1 = ({
  componentCls,
  borderRadiusSM,
  borderRadiusLG
}, size) => {
  const borderRadius = size === "lg" ? borderRadiusLG : borderRadiusSM;
  return {
    [`&-${size}`]: {
      [`${componentCls}-handler-wrap`]: {
        borderStartEndRadius: borderRadius,
        borderEndEndRadius: borderRadius
      },
      [`${componentCls}-handler-up`]: {
        borderStartEndRadius: borderRadius
      },
      [`${componentCls}-handler-down`]: {
        borderEndEndRadius: borderRadius
      }
    }
  };
};
const genInputNumberStyles = (token) => {
  const {
    componentCls,
    lineWidth,
    lineType,
    borderRadius,
    inputFontSizeSM,
    inputFontSizeLG,
    controlHeightLG,
    controlHeightSM,
    colorError,
    paddingInlineSM,
    paddingBlockSM,
    paddingBlockLG,
    paddingInlineLG,
    colorIcon,
    motionDurationMid,
    handleHoverColor,
    handleOpacity,
    paddingInline,
    paddingBlock,
    handleBg,
    handleActiveBg,
    colorTextDisabled,
    borderRadiusSM,
    borderRadiusLG,
    controlWidth,
    handleBorderColor,
    filledHandleBg,
    lineHeightLG,
    calc
  } = token;
  return [
    {
      [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), genBasicInputStyle(token)), {
        display: "inline-block",
        width: controlWidth,
        margin: 0,
        padding: 0,
        borderRadius
      }), genOutlinedStyle(token, {
        [`${componentCls}-handler-wrap`]: {
          background: handleBg,
          [`${componentCls}-handler-down`]: {
            borderBlockStart: `${unit(lineWidth)} ${lineType} ${handleBorderColor}`
          }
        }
      })), genFilledStyle(token, {
        [`${componentCls}-handler-wrap`]: {
          background: filledHandleBg,
          [`${componentCls}-handler-down`]: {
            borderBlockStart: `${unit(lineWidth)} ${lineType} ${handleBorderColor}`
          }
        },
        "&:focus-within": {
          [`${componentCls}-handler-wrap`]: {
            background: handleBg
          }
        }
      })), genUnderlinedStyle(token, {
        [`${componentCls}-handler-wrap`]: {
          background: handleBg,
          [`${componentCls}-handler-down`]: {
            borderBlockStart: `${unit(lineWidth)} ${lineType} ${handleBorderColor}`
          }
        }
      })), genBorderlessStyle(token)), {
        "&-rtl": {
          direction: "rtl",
          [`${componentCls}-input`]: {
            direction: "rtl"
          }
        },
        "&-lg": {
          padding: 0,
          fontSize: inputFontSizeLG,
          lineHeight: lineHeightLG,
          borderRadius: borderRadiusLG,
          [`input${componentCls}-input`]: {
            height: calc(controlHeightLG).sub(calc(lineWidth).mul(2)).equal(),
            padding: `${unit(paddingBlockLG)} ${unit(paddingInlineLG)}`
          }
        },
        "&-sm": {
          padding: 0,
          fontSize: inputFontSizeSM,
          borderRadius: borderRadiusSM,
          [`input${componentCls}-input`]: {
            height: calc(controlHeightSM).sub(calc(lineWidth).mul(2)).equal(),
            padding: `${unit(paddingBlockSM)} ${unit(paddingInlineSM)}`
          }
        },
        // ===================== Out Of Range =====================
        "&-out-of-range": {
          [`${componentCls}-input-wrap`]: {
            input: {
              color: colorError
            }
          }
        },
        // Style for input-group: input with label, with button or dropdown...
        "&-group": Object.assign(Object.assign(Object.assign({}, resetComponent(token)), genInputGroupStyle(token)), {
          "&-wrapper": Object.assign(Object.assign(Object.assign({
            display: "inline-block",
            textAlign: "start",
            verticalAlign: "top",
            [`${componentCls}-affix-wrapper`]: {
              width: "100%"
            },
            // Size
            "&-lg": {
              [`${componentCls}-group-addon`]: {
                borderRadius: borderRadiusLG,
                fontSize: token.fontSizeLG
              }
            },
            "&-sm": {
              [`${componentCls}-group-addon`]: {
                borderRadius: borderRadiusSM
              }
            }
          }, genOutlinedGroupStyle(token)), genFilledGroupStyle(token)), {
            // Fix the issue of using icons in Space Compact mode
            // https://github.com/ant-design/ant-design/issues/45764
            [`&:not(${componentCls}-compact-first-item):not(${componentCls}-compact-last-item)${componentCls}-compact-item`]: {
              [`${componentCls}, ${componentCls}-group-addon`]: {
                borderRadius: 0
              }
            },
            [`&:not(${componentCls}-compact-last-item)${componentCls}-compact-first-item`]: {
              [`${componentCls}, ${componentCls}-group-addon`]: {
                borderStartEndRadius: 0,
                borderEndEndRadius: 0
              }
            },
            [`&:not(${componentCls}-compact-first-item)${componentCls}-compact-last-item`]: {
              [`${componentCls}, ${componentCls}-group-addon`]: {
                borderStartStartRadius: 0,
                borderEndStartRadius: 0
              }
            }
          })
        }),
        [`&-disabled ${componentCls}-input`]: {
          cursor: "not-allowed"
        },
        [componentCls]: {
          "&-input": Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), {
            width: "100%",
            padding: `${unit(paddingBlock)} ${unit(paddingInline)}`,
            textAlign: "start",
            backgroundColor: "transparent",
            border: 0,
            borderRadius,
            outline: 0,
            transition: `all ${motionDurationMid} linear`,
            appearance: "textfield",
            fontSize: "inherit"
          }), genPlaceholderStyle(token.colorTextPlaceholder)), {
            '&[type="number"]::-webkit-inner-spin-button, &[type="number"]::-webkit-outer-spin-button': {
              margin: 0,
              appearance: "none"
            }
          })
        },
        [`&:hover ${componentCls}-handler-wrap, &-focused ${componentCls}-handler-wrap`]: {
          width: token.handleWidth,
          opacity: 1
        }
      })
    },
    // Handler
    {
      [componentCls]: Object.assign(Object.assign(Object.assign({
        [`${componentCls}-handler-wrap`]: {
          position: "absolute",
          insetBlockStart: 0,
          insetInlineEnd: 0,
          width: token.handleVisibleWidth,
          opacity: handleOpacity,
          height: "100%",
          borderStartStartRadius: 0,
          borderStartEndRadius: borderRadius,
          borderEndEndRadius: borderRadius,
          borderEndStartRadius: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          transition: `all ${motionDurationMid}`,
          overflow: "hidden",
          // Fix input number inside Menu makes icon too large
          // We arise the selector priority by nest selector here
          // https://github.com/ant-design/ant-design/issues/14367
          [`${componentCls}-handler`]: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "auto",
            height: "40%",
            [`
              ${componentCls}-handler-up-inner,
              ${componentCls}-handler-down-inner
            `]: {
              marginInlineEnd: 0,
              fontSize: token.handleFontSize
            }
          }
        },
        [`${componentCls}-handler`]: {
          height: "50%",
          overflow: "hidden",
          color: colorIcon,
          fontWeight: "bold",
          lineHeight: 0,
          textAlign: "center",
          cursor: "pointer",
          borderInlineStart: `${unit(lineWidth)} ${lineType} ${handleBorderColor}`,
          transition: `all ${motionDurationMid} linear`,
          "&:active": {
            background: handleActiveBg
          },
          // Hover
          "&:hover": {
            height: `60%`,
            [`
              ${componentCls}-handler-up-inner,
              ${componentCls}-handler-down-inner
            `]: {
              color: handleHoverColor
            }
          },
          "&-up-inner, &-down-inner": Object.assign(Object.assign({}, resetIcon()), {
            color: colorIcon,
            transition: `all ${motionDurationMid} linear`,
            userSelect: "none"
          })
        },
        [`${componentCls}-handler-up`]: {
          borderStartEndRadius: borderRadius
        },
        [`${componentCls}-handler-down`]: {
          borderEndEndRadius: borderRadius
        }
      }, genRadiusStyle$1(token, "lg")), genRadiusStyle$1(token, "sm")), {
        // Disabled
        "&-disabled, &-readonly": {
          [`${componentCls}-handler-wrap`]: {
            display: "none"
          },
          [`${componentCls}-input`]: {
            color: "inherit"
          }
        },
        [`
          ${componentCls}-handler-up-disabled,
          ${componentCls}-handler-down-disabled
        `]: {
          cursor: "not-allowed"
        },
        [`
          ${componentCls}-handler-up-disabled:hover &-handler-up-inner,
          ${componentCls}-handler-down-disabled:hover &-handler-down-inner
        `]: {
          color: colorTextDisabled
        }
      })
    }
  ];
};
const genAffixWrapperStyles = (token) => {
  const {
    componentCls,
    paddingBlock,
    paddingInline,
    inputAffixPadding,
    controlWidth,
    borderRadiusLG,
    borderRadiusSM,
    paddingInlineLG,
    paddingInlineSM,
    paddingBlockLG,
    paddingBlockSM,
    motionDurationMid
  } = token;
  return {
    [`${componentCls}-affix-wrapper`]: Object.assign(Object.assign({
      [`input${componentCls}-input`]: {
        padding: `${unit(paddingBlock)} 0`
      }
    }, genBasicInputStyle(token)), {
      // or number handler will cover form status
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
      width: controlWidth,
      padding: 0,
      paddingInlineStart: paddingInline,
      "&-lg": {
        borderRadius: borderRadiusLG,
        paddingInlineStart: paddingInlineLG,
        [`input${componentCls}-input`]: {
          padding: `${unit(paddingBlockLG)} 0`
        }
      },
      "&-sm": {
        borderRadius: borderRadiusSM,
        paddingInlineStart: paddingInlineSM,
        [`input${componentCls}-input`]: {
          padding: `${unit(paddingBlockSM)} 0`
        }
      },
      [`&:not(${componentCls}-disabled):hover`]: {
        zIndex: 1
      },
      "&-focused, &:focus": {
        zIndex: 1
      },
      [`&-disabled > ${componentCls}-disabled`]: {
        background: "transparent"
      },
      [`> div${componentCls}`]: {
        width: "100%",
        border: "none",
        outline: "none",
        [`&${componentCls}-focused`]: {
          boxShadow: "none !important"
        }
      },
      "&::before": {
        display: "inline-block",
        width: 0,
        visibility: "hidden",
        content: '"\\a0"'
      },
      [`${componentCls}-handler-wrap`]: {
        zIndex: 2
      },
      [componentCls]: {
        position: "static",
        color: "inherit",
        "&-prefix, &-suffix": {
          display: "flex",
          flex: "none",
          alignItems: "center",
          pointerEvents: "none"
        },
        "&-prefix": {
          marginInlineEnd: inputAffixPadding
        },
        "&-suffix": {
          insetBlockStart: 0,
          insetInlineEnd: 0,
          height: "100%",
          marginInlineEnd: paddingInline,
          marginInlineStart: inputAffixPadding,
          transition: `margin ${motionDurationMid}`
        }
      },
      [`&:hover ${componentCls}-handler-wrap, &-focused ${componentCls}-handler-wrap`]: {
        width: token.handleWidth,
        opacity: 1
      },
      [`&:not(${componentCls}-affix-wrapper-without-controls):hover ${componentCls}-suffix`]: {
        marginInlineEnd: token.calc(token.handleWidth).add(paddingInline).equal()
      }
    }),
    // 覆盖 affix-wrapper borderRadius！
    [`${componentCls}-underlined`]: {
      borderRadius: 0
    }
  };
};
const useStyle$a = genStyleHooks("InputNumber", (token) => {
  const inputNumberToken = merge$1(token, initInputToken(token));
  return [
    genInputNumberStyles(inputNumberToken),
    genAffixWrapperStyles(inputNumberToken),
    // =====================================================
    // ==             Space Compact                       ==
    // =====================================================
    genCompactItemStyle(inputNumberToken)
  ];
}, prepareComponentToken$8, {
  unitless: {
    handleOpacity: true
  },
  resetFont: false
});
var __rest$t = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const InputNumber = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const inputRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => inputRef.current);
  const {
    className,
    rootClassName,
    size: customizeSize,
    disabled: customDisabled,
    prefixCls: customizePrefixCls,
    addonBefore,
    addonAfter,
    prefix,
    suffix,
    bordered,
    readOnly,
    status: customStatus,
    controls,
    variant: customVariant
  } = props, others = __rest$t(props, ["className", "rootClassName", "size", "disabled", "prefixCls", "addonBefore", "addonAfter", "prefix", "suffix", "bordered", "readOnly", "status", "controls", "variant"]);
  const prefixCls = getPrefixCls("input-number", customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$a(prefixCls, rootCls);
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  let upIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$d, {
    className: `${prefixCls}-handler-up-inner`
  });
  let downIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$9, {
    className: `${prefixCls}-handler-down-inner`
  });
  const controlsTemp = typeof controls === "boolean" ? controls : void 0;
  if (typeof controls === "object") {
    upIcon = typeof controls.upIcon === "undefined" ? upIcon : /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-handler-up-inner`
    }, controls.upIcon);
    downIcon = typeof controls.downIcon === "undefined" ? downIcon : /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-handler-down-inner`
    }, controls.downIcon);
  }
  const {
    hasFeedback,
    status: contextStatus,
    isFormItemInput,
    feedbackIcon
  } = reactExports.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  const mergedSize = useSize((ctx) => {
    var _a;
    return (_a = customizeSize !== null && customizeSize !== void 0 ? customizeSize : compactSize) !== null && _a !== void 0 ? _a : ctx;
  });
  const disabled = reactExports.useContext(DisabledContext);
  const mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
  const [variant, enableVariantCls] = useVariant("inputNumber", customVariant, bordered);
  const suffixNode = hasFeedback && /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, feedbackIcon);
  const inputNumberClass = classNames({
    [`${prefixCls}-lg`]: mergedSize === "large",
    [`${prefixCls}-sm`]: mergedSize === "small",
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-in-form-item`]: isFormItemInput
  }, hashId);
  const wrapperClassName = `${prefixCls}-group`;
  const element = /* @__PURE__ */ reactExports.createElement(InputNumber$1, Object.assign({
    ref: inputRef,
    disabled: mergedDisabled,
    className: classNames(cssVarCls, rootCls, className, rootClassName, compactItemClassnames),
    upHandler: upIcon,
    downHandler: downIcon,
    prefixCls,
    readOnly,
    controls: controlsTemp,
    prefix,
    suffix: suffixNode || suffix,
    addonBefore: addonBefore && /* @__PURE__ */ reactExports.createElement(ContextIsolator, {
      form: true,
      space: true
    }, addonBefore),
    addonAfter: addonAfter && /* @__PURE__ */ reactExports.createElement(ContextIsolator, {
      form: true,
      space: true
    }, addonAfter),
    classNames: {
      input: inputNumberClass,
      variant: classNames({
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, getStatusClassNames(prefixCls, mergedStatus, hasFeedback)),
      affixWrapper: classNames({
        [`${prefixCls}-affix-wrapper-sm`]: mergedSize === "small",
        [`${prefixCls}-affix-wrapper-lg`]: mergedSize === "large",
        [`${prefixCls}-affix-wrapper-rtl`]: direction === "rtl",
        [`${prefixCls}-affix-wrapper-without-controls`]: controls === false || mergedDisabled
      }, hashId),
      wrapper: classNames({
        [`${wrapperClassName}-rtl`]: direction === "rtl"
      }, hashId),
      groupWrapper: classNames({
        [`${prefixCls}-group-wrapper-sm`]: mergedSize === "small",
        [`${prefixCls}-group-wrapper-lg`]: mergedSize === "large",
        [`${prefixCls}-group-wrapper-rtl`]: direction === "rtl",
        [`${prefixCls}-group-wrapper-${variant}`]: enableVariantCls
      }, getStatusClassNames(`${prefixCls}-group-wrapper`, mergedStatus, hasFeedback), hashId)
    }
  }, others));
  return wrapCSSVar(element);
});
const TypedInputNumber = InputNumber;
const PureInputNumber = (props) => /* @__PURE__ */ reactExports.createElement(ConfigProvider, {
  theme: {
    components: {
      InputNumber: {
        handleVisible: true
      }
    }
  }
}, /* @__PURE__ */ reactExports.createElement(InputNumber, Object.assign({}, props)));
TypedInputNumber._InternalPanelDoNotUseOrYouWillBeFired = PureInputNumber;
const getAllowClear = (allowClear) => {
  let mergedAllowClear;
  if (typeof allowClear === "object" && (allowClear === null || allowClear === void 0 ? void 0 : allowClear.clearIcon)) {
    mergedAllowClear = allowClear;
  } else if (allowClear) {
    mergedAllowClear = {
      clearIcon: /* @__PURE__ */ React.createElement(RefIcon$2, null)
    };
  }
  return mergedAllowClear;
};
function useRemovePasswordTimeout(inputRef, triggerOnMount) {
  const removePasswordTimeoutRef = reactExports.useRef([]);
  const removePasswordTimeout = () => {
    removePasswordTimeoutRef.current.push(setTimeout(() => {
      var _a, _b, _c, _d;
      if (((_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.input) && ((_b = inputRef.current) === null || _b === void 0 ? void 0 : _b.input.getAttribute("type")) === "password" && ((_c = inputRef.current) === null || _c === void 0 ? void 0 : _c.input.hasAttribute("value"))) {
        (_d = inputRef.current) === null || _d === void 0 ? void 0 : _d.input.removeAttribute("value");
      }
    }));
  };
  reactExports.useEffect(() => {
    if (triggerOnMount) {
      removePasswordTimeout();
    }
    return () => removePasswordTimeoutRef.current.forEach((timer) => {
      if (timer) {
        clearTimeout(timer);
      }
    });
  }, []);
  return removePasswordTimeout;
}
function hasPrefixSuffix(props) {
  return !!(props.prefix || props.suffix || props.allowClear || props.showCount);
}
var __rest$s = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Input$1 = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    bordered = true,
    status: customStatus,
    size: customSize,
    disabled: customDisabled,
    onBlur,
    onFocus,
    suffix,
    allowClear,
    addonAfter,
    addonBefore,
    className,
    style,
    styles,
    rootClassName,
    onChange,
    classNames: classNames$1,
    variant: customVariant
  } = props, rest = __rest$s(props, ["prefixCls", "bordered", "status", "size", "disabled", "onBlur", "onFocus", "suffix", "allowClear", "addonAfter", "addonBefore", "className", "style", "styles", "rootClassName", "onChange", "classNames", "variant"]);
  const {
    getPrefixCls,
    direction,
    allowClear: contextAllowClear,
    autoComplete: contextAutoComplete,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig("input");
  const prefixCls = getPrefixCls("input", customizePrefixCls);
  const inputRef = reactExports.useRef(null);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapSharedCSSVar, hashId, cssVarCls] = useSharedStyle(prefixCls, rootClassName);
  const [wrapCSSVar] = useStyle$g(prefixCls, rootCls);
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const mergedSize = useSize((ctx) => {
    var _a;
    return (_a = customSize !== null && customSize !== void 0 ? customSize : compactSize) !== null && _a !== void 0 ? _a : ctx;
  });
  const disabled = React.useContext(DisabledContext);
  const mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
  const {
    status: contextStatus,
    hasFeedback,
    feedbackIcon
  } = reactExports.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  const inputHasPrefixSuffix = hasPrefixSuffix(props) || !!hasFeedback;
  reactExports.useRef(inputHasPrefixSuffix);
  const removePasswordTimeout = useRemovePasswordTimeout(inputRef, true);
  const handleBlur = (e2) => {
    removePasswordTimeout();
    onBlur === null || onBlur === void 0 ? void 0 : onBlur(e2);
  };
  const handleFocus = (e2) => {
    removePasswordTimeout();
    onFocus === null || onFocus === void 0 ? void 0 : onFocus(e2);
  };
  const handleChange = (e2) => {
    removePasswordTimeout();
    onChange === null || onChange === void 0 ? void 0 : onChange(e2);
  };
  const suffixNode = (hasFeedback || suffix) && /* @__PURE__ */ React.createElement(React.Fragment, null, suffix, hasFeedback && feedbackIcon);
  const mergedAllowClear = getAllowClear(allowClear !== null && allowClear !== void 0 ? allowClear : contextAllowClear);
  const [variant, enableVariantCls] = useVariant("input", customVariant, bordered);
  return wrapSharedCSSVar(wrapCSSVar(/* @__PURE__ */ React.createElement(Input$2, Object.assign({
    ref: composeRef(ref, inputRef),
    prefixCls,
    autoComplete: contextAutoComplete
  }, rest, {
    disabled: mergedDisabled,
    onBlur: handleBlur,
    onFocus: handleFocus,
    style: Object.assign(Object.assign({}, contextStyle), style),
    styles: Object.assign(Object.assign({}, contextStyles), styles),
    suffix: suffixNode,
    allowClear: mergedAllowClear,
    className: classNames(className, rootClassName, cssVarCls, rootCls, compactItemClassnames, contextClassName),
    onChange: handleChange,
    addonBefore: addonBefore && /* @__PURE__ */ React.createElement(ContextIsolator, {
      form: true,
      space: true
    }, addonBefore),
    addonAfter: addonAfter && /* @__PURE__ */ React.createElement(ContextIsolator, {
      form: true,
      space: true
    }, addonAfter),
    classNames: Object.assign(Object.assign(Object.assign({}, classNames$1), contextClassNames), {
      input: classNames({
        [`${prefixCls}-sm`]: mergedSize === "small",
        [`${prefixCls}-lg`]: mergedSize === "large",
        [`${prefixCls}-rtl`]: direction === "rtl"
      }, classNames$1 === null || classNames$1 === void 0 ? void 0 : classNames$1.input, contextClassNames.input, hashId),
      variant: classNames({
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, getStatusClassNames(prefixCls, mergedStatus)),
      affixWrapper: classNames({
        [`${prefixCls}-affix-wrapper-sm`]: mergedSize === "small",
        [`${prefixCls}-affix-wrapper-lg`]: mergedSize === "large",
        [`${prefixCls}-affix-wrapper-rtl`]: direction === "rtl"
      }, hashId),
      wrapper: classNames({
        [`${prefixCls}-group-rtl`]: direction === "rtl"
      }, hashId),
      groupWrapper: classNames({
        [`${prefixCls}-group-wrapper-sm`]: mergedSize === "small",
        [`${prefixCls}-group-wrapper-lg`]: mergedSize === "large",
        [`${prefixCls}-group-wrapper-rtl`]: direction === "rtl",
        [`${prefixCls}-group-wrapper-${variant}`]: enableVariantCls
      }, getStatusClassNames(`${prefixCls}-group-wrapper`, mergedStatus, hasFeedback), hashId)
    })
  }))));
});
function getPlaceholder(locale2, picker, customizePlaceholder) {
  if (customizePlaceholder !== void 0) {
    return customizePlaceholder;
  }
  if (picker === "year" && locale2.lang.yearPlaceholder) {
    return locale2.lang.yearPlaceholder;
  }
  if (picker === "quarter" && locale2.lang.quarterPlaceholder) {
    return locale2.lang.quarterPlaceholder;
  }
  if (picker === "month" && locale2.lang.monthPlaceholder) {
    return locale2.lang.monthPlaceholder;
  }
  if (picker === "week" && locale2.lang.weekPlaceholder) {
    return locale2.lang.weekPlaceholder;
  }
  if (picker === "time" && locale2.timePickerLocale.placeholder) {
    return locale2.timePickerLocale.placeholder;
  }
  return locale2.lang.placeholder;
}
function getRangePlaceholder(locale2, picker, customizePlaceholder) {
  if (customizePlaceholder !== void 0) {
    return customizePlaceholder;
  }
  if (picker === "year" && locale2.lang.yearPlaceholder) {
    return locale2.lang.rangeYearPlaceholder;
  }
  if (picker === "quarter" && locale2.lang.quarterPlaceholder) {
    return locale2.lang.rangeQuarterPlaceholder;
  }
  if (picker === "month" && locale2.lang.monthPlaceholder) {
    return locale2.lang.rangeMonthPlaceholder;
  }
  if (picker === "week" && locale2.lang.weekPlaceholder) {
    return locale2.lang.rangeWeekPlaceholder;
  }
  if (picker === "time" && locale2.timePickerLocale.placeholder) {
    return locale2.timePickerLocale.rangePlaceholder;
  }
  return locale2.lang.rangePlaceholder;
}
function useIcons(props, prefixCls) {
  const {
    allowClear = true
  } = props;
  const {
    clearIcon,
    removeIcon
  } = useIcons$1(Object.assign(Object.assign({}, props), {
    prefixCls,
    componentName: "DatePicker"
  }));
  const mergedAllowClear = reactExports.useMemo(() => {
    if (allowClear === false) {
      return false;
    }
    const allowClearConfig = allowClear === true ? {} : allowClear;
    return Object.assign({
      clearIcon
    }, allowClearConfig);
  }, [allowClear, clearIcon]);
  return [mergedAllowClear, removeIcon];
}
const [WEEK, WEEKPICKER] = ["week", "WeekPicker"];
const [MONTH, MONTHPICKER] = ["month", "MonthPicker"];
const [YEAR, YEARPICKER] = ["year", "YearPicker"];
const [QUARTER, QUARTERPICKER] = ["quarter", "QuarterPicker"];
const [TIME, TIMEPICKER] = ["time", "TimePicker"];
const PickerButton = (props) => /* @__PURE__ */ reactExports.createElement(Button$1, Object.assign({
  size: "small",
  type: "primary"
}, props));
function useComponents(components) {
  return reactExports.useMemo(() => Object.assign({
    button: PickerButton
  }, components), [components]);
}
function mergeClassNames(schema, ...classNames$1) {
  const mergedSchema = schema || {};
  return classNames$1.reduce((acc, cur) => {
    Object.keys(cur || {}).forEach((key) => {
      const keySchema = mergedSchema[key];
      const curVal = cur[key];
      if (keySchema && typeof keySchema === "object") {
        if (curVal && typeof curVal === "object") {
          acc[key] = mergeClassNames(keySchema, acc[key], curVal);
        } else {
          const {
            _default: defaultField
          } = keySchema;
          acc[key] = acc[key] || {};
          acc[key][defaultField] = classNames(acc[key][defaultField], curVal);
        }
      } else {
        acc[key] = classNames(acc[key], curVal);
      }
    });
    return acc;
  }, {});
}
function useSemanticClassNames(schema, ...classNames2) {
  return reactExports.useMemo(() => mergeClassNames.apply(void 0, [schema].concat(classNames2)), [classNames2]);
}
function useSemanticStyles(...styles) {
  return reactExports.useMemo(() => {
    return styles.reduce((acc, cur = {}) => {
      Object.keys(cur).forEach((key) => {
        acc[key] = Object.assign(Object.assign({}, acc[key]), cur[key]);
      });
      return acc;
    }, {});
  }, [styles]);
}
function fillObjectBySchema(obj, schema) {
  const newObj = Object.assign({}, obj);
  Object.keys(schema).forEach((key) => {
    if (key !== "_default") {
      const nestSchema = schema[key];
      const nextValue = newObj[key] || {};
      newObj[key] = nestSchema ? fillObjectBySchema(nextValue, nestSchema) : nextValue;
    }
  });
  return newObj;
}
function useMergeSemantic(classNamesList, stylesList, schema) {
  const mergedClassNames = useSemanticClassNames.apply(void 0, [schema].concat(_toConsumableArray(classNamesList)));
  const mergedStyles = useSemanticStyles.apply(void 0, _toConsumableArray(stylesList));
  return reactExports.useMemo(() => {
    return [fillObjectBySchema(mergedClassNames, schema), fillObjectBySchema(mergedStyles, schema)];
  }, [mergedClassNames, mergedStyles]);
}
const useMergedPickerSemantic = (pickerType, classNames$1, styles, popupClassName, popupStyle) => {
  const {
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig(pickerType);
  const [mergedClassNames, mergedStyles] = useMergeSemantic([contextClassNames, classNames$1], [contextStyles, styles], {
    popup: {
      _default: "root"
    }
  });
  return reactExports.useMemo(() => {
    var _a, _b;
    const filledClassNames = Object.assign(Object.assign({}, mergedClassNames), {
      popup: Object.assign(Object.assign({}, mergedClassNames.popup), {
        root: classNames((_a = mergedClassNames.popup) === null || _a === void 0 ? void 0 : _a.root, popupClassName)
      })
    });
    const filledStyles = Object.assign(Object.assign({}, mergedStyles), {
      popup: Object.assign(Object.assign({}, mergedStyles.popup), {
        root: Object.assign(Object.assign({}, (_b = mergedStyles.popup) === null || _b === void 0 ? void 0 : _b.root), popupStyle)
      })
    });
    return [filledClassNames, filledStyles];
  }, [mergedClassNames, mergedStyles, popupClassName, popupStyle]);
};
var __rest$r = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const generateRangePicker = (generateConfig2) => {
  const RangePicker = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
    var _a;
    const {
      prefixCls: customizePrefixCls,
      getPopupContainer: customGetPopupContainer,
      components,
      className,
      style,
      placement,
      size: customizeSize,
      disabled: customDisabled,
      bordered = true,
      placeholder,
      popupStyle,
      popupClassName,
      dropdownClassName,
      status: customStatus,
      rootClassName,
      variant: customVariant,
      picker,
      styles,
      classNames: classNames$1
    } = props, restProps = __rest$r(props, ["prefixCls", "getPopupContainer", "components", "className", "style", "placement", "size", "disabled", "bordered", "placeholder", "popupStyle", "popupClassName", "dropdownClassName", "status", "rootClassName", "variant", "picker", "styles", "classNames"]);
    const pickerType = picker === TIME ? "timePicker" : "datePicker";
    const innerRef = reactExports.useRef(null);
    const {
      getPrefixCls,
      direction,
      getPopupContainer,
      rangePicker
    } = reactExports.useContext(ConfigContext);
    const prefixCls = getPrefixCls("picker", customizePrefixCls);
    const {
      compactSize,
      compactItemClassnames
    } = useCompactItemContext(prefixCls, direction);
    const rootPrefixCls = getPrefixCls();
    const [variant, enableVariantCls] = useVariant("rangePicker", customVariant, bordered);
    const rootCls = useCSSVarCls(prefixCls);
    const [wrapCSSVar, hashId, cssVarCls] = useStyle$f(prefixCls, rootCls);
    const [mergedClassNames, mergedStyles] = useMergedPickerSemantic(pickerType, classNames$1, styles, popupClassName || dropdownClassName, popupStyle);
    const [mergedAllowClear] = useIcons(props, prefixCls);
    const mergedComponents = useComponents(components);
    const mergedSize = useSize((ctx) => {
      var _a2;
      return (_a2 = customizeSize !== null && customizeSize !== void 0 ? customizeSize : compactSize) !== null && _a2 !== void 0 ? _a2 : ctx;
    });
    const disabled = reactExports.useContext(DisabledContext);
    const mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
    const formItemContext = reactExports.useContext(FormItemInputContext);
    const {
      hasFeedback,
      status: contextStatus,
      feedbackIcon
    } = formItemContext;
    const suffixNode = /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, picker === TIME ? /* @__PURE__ */ reactExports.createElement(RefIcon$f, null) : /* @__PURE__ */ reactExports.createElement(RefIcon$g, null), hasFeedback && feedbackIcon);
    reactExports.useImperativeHandle(ref, () => innerRef.current);
    const [contextLocale] = useLocale("Calendar", locale);
    const locale$12 = Object.assign(Object.assign({}, contextLocale), props.locale);
    const [zIndex] = useZIndex("DatePicker", (_a = mergedStyles.popup.root) === null || _a === void 0 ? void 0 : _a.zIndex);
    return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(ContextIsolator, {
      space: true
    }, /* @__PURE__ */ reactExports.createElement(RefRangePicker, Object.assign({
      separator: /* @__PURE__ */ reactExports.createElement("span", {
        "aria-label": "to",
        className: `${prefixCls}-separator`
      }, /* @__PURE__ */ reactExports.createElement(RefIcon$e, null)),
      disabled: mergedDisabled,
      ref: innerRef,
      placement,
      placeholder: getRangePlaceholder(locale$12, picker, placeholder),
      suffixIcon: suffixNode,
      prevIcon: /* @__PURE__ */ reactExports.createElement("span", {
        className: `${prefixCls}-prev-icon`
      }),
      nextIcon: /* @__PURE__ */ reactExports.createElement("span", {
        className: `${prefixCls}-next-icon`
      }),
      superPrevIcon: /* @__PURE__ */ reactExports.createElement("span", {
        className: `${prefixCls}-super-prev-icon`
      }),
      superNextIcon: /* @__PURE__ */ reactExports.createElement("span", {
        className: `${prefixCls}-super-next-icon`
      }),
      transitionName: `${rootPrefixCls}-slide-up`,
      picker
    }, restProps, {
      className: classNames({
        [`${prefixCls}-${mergedSize}`]: mergedSize,
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, getStatusClassNames(prefixCls, getMergedStatus(contextStatus, customStatus), hasFeedback), hashId, compactItemClassnames, className, rangePicker === null || rangePicker === void 0 ? void 0 : rangePicker.className, cssVarCls, rootCls, rootClassName, mergedClassNames.root),
      style: Object.assign(Object.assign(Object.assign({}, rangePicker === null || rangePicker === void 0 ? void 0 : rangePicker.style), style), mergedStyles.root),
      locale: locale$12.lang,
      prefixCls,
      getPopupContainer: customGetPopupContainer || getPopupContainer,
      generateConfig: generateConfig2,
      components: mergedComponents,
      direction,
      classNames: {
        popup: classNames(hashId, cssVarCls, rootCls, rootClassName, mergedClassNames.popup.root)
      },
      styles: {
        popup: Object.assign(Object.assign({}, mergedStyles.popup.root), {
          zIndex
        })
      },
      allowClear: mergedAllowClear
    }))));
  });
  return RangePicker;
};
var __rest$q = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const generatePicker$1 = (generateConfig2) => {
  const getPicker = (picker, displayName) => {
    const consumerName = displayName === TIMEPICKER ? "timePicker" : "datePicker";
    const Picker = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
      var _a;
      const {
        prefixCls: customizePrefixCls,
        getPopupContainer: customizeGetPopupContainer,
        components,
        style,
        className,
        rootClassName,
        size: customizeSize,
        bordered,
        placement,
        placeholder,
        popupStyle,
        popupClassName,
        dropdownClassName,
        disabled: customDisabled,
        status: customStatus,
        variant: customVariant,
        onCalendarChange,
        styles,
        classNames: classNames$1
      } = props, restProps = __rest$q(props, ["prefixCls", "getPopupContainer", "components", "style", "className", "rootClassName", "size", "bordered", "placement", "placeholder", "popupStyle", "popupClassName", "dropdownClassName", "disabled", "status", "variant", "onCalendarChange", "styles", "classNames"]);
      const {
        getPrefixCls,
        direction,
        getPopupContainer,
        // Consume different styles according to different names
        [consumerName]: consumerStyle
      } = reactExports.useContext(ConfigContext);
      const prefixCls = getPrefixCls("picker", customizePrefixCls);
      const {
        compactSize,
        compactItemClassnames
      } = useCompactItemContext(prefixCls, direction);
      const innerRef = reactExports.useRef(null);
      const [variant, enableVariantCls] = useVariant("datePicker", customVariant, bordered);
      const rootCls = useCSSVarCls(prefixCls);
      const [wrapCSSVar, hashId, cssVarCls] = useStyle$f(prefixCls, rootCls);
      reactExports.useImperativeHandle(ref, () => innerRef.current);
      const additionalProps = {
        showToday: true
      };
      const mergedPicker = picker || props.picker;
      const rootPrefixCls = getPrefixCls();
      const {
        onSelect,
        multiple
      } = restProps;
      const hasLegacyOnSelect = onSelect && picker === "time" && !multiple;
      const onInternalCalendarChange = (date, dateStr, info) => {
        onCalendarChange === null || onCalendarChange === void 0 ? void 0 : onCalendarChange(date, dateStr, info);
        if (hasLegacyOnSelect) {
          onSelect(date);
        }
      };
      const [mergedClassNames, mergedStyles] = useMergedPickerSemantic(consumerName, classNames$1, styles, popupClassName || dropdownClassName, popupStyle);
      const [mergedAllowClear, removeIcon] = useIcons(props, prefixCls);
      const mergedComponents = useComponents(components);
      const mergedSize = useSize((ctx) => {
        var _a2;
        return (_a2 = customizeSize !== null && customizeSize !== void 0 ? customizeSize : compactSize) !== null && _a2 !== void 0 ? _a2 : ctx;
      });
      const disabled = reactExports.useContext(DisabledContext);
      const mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
      const formItemContext = reactExports.useContext(FormItemInputContext);
      const {
        hasFeedback,
        status: contextStatus,
        feedbackIcon
      } = formItemContext;
      const suffixNode = /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, mergedPicker === "time" ? /* @__PURE__ */ reactExports.createElement(RefIcon$f, null) : /* @__PURE__ */ reactExports.createElement(RefIcon$g, null), hasFeedback && feedbackIcon);
      const [contextLocale] = useLocale("DatePicker", locale);
      const locale$12 = Object.assign(Object.assign({}, contextLocale), props.locale);
      const [zIndex] = useZIndex("DatePicker", (_a = mergedStyles.popup.root) === null || _a === void 0 ? void 0 : _a.zIndex);
      return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(ContextIsolator, {
        space: true
      }, /* @__PURE__ */ reactExports.createElement(RefPicker, Object.assign({
        ref: innerRef,
        placeholder: getPlaceholder(locale$12, mergedPicker, placeholder),
        suffixIcon: suffixNode,
        placement,
        prevIcon: /* @__PURE__ */ reactExports.createElement("span", {
          className: `${prefixCls}-prev-icon`
        }),
        nextIcon: /* @__PURE__ */ reactExports.createElement("span", {
          className: `${prefixCls}-next-icon`
        }),
        superPrevIcon: /* @__PURE__ */ reactExports.createElement("span", {
          className: `${prefixCls}-super-prev-icon`
        }),
        superNextIcon: /* @__PURE__ */ reactExports.createElement("span", {
          className: `${prefixCls}-super-next-icon`
        }),
        transitionName: `${rootPrefixCls}-slide-up`,
        picker,
        onCalendarChange: onInternalCalendarChange
      }, additionalProps, restProps, {
        locale: locale$12.lang,
        className: classNames({
          [`${prefixCls}-${mergedSize}`]: mergedSize,
          [`${prefixCls}-${variant}`]: enableVariantCls
        }, getStatusClassNames(prefixCls, getMergedStatus(contextStatus, customStatus), hasFeedback), hashId, compactItemClassnames, consumerStyle === null || consumerStyle === void 0 ? void 0 : consumerStyle.className, className, cssVarCls, rootCls, rootClassName, mergedClassNames.root),
        style: Object.assign(Object.assign(Object.assign({}, consumerStyle === null || consumerStyle === void 0 ? void 0 : consumerStyle.style), style), mergedStyles.root),
        prefixCls,
        getPopupContainer: customizeGetPopupContainer || getPopupContainer,
        generateConfig: generateConfig2,
        components: mergedComponents,
        direction,
        disabled: mergedDisabled,
        classNames: {
          popup: classNames(hashId, cssVarCls, rootCls, rootClassName, mergedClassNames.popup.root)
        },
        styles: {
          popup: Object.assign(Object.assign({}, mergedStyles.popup.root), {
            zIndex
          })
        },
        allowClear: mergedAllowClear,
        removeIcon
      }))));
    });
    return Picker;
  };
  const DatePicker2 = getPicker();
  const WeekPicker = getPicker(WEEK, WEEKPICKER);
  const MonthPicker = getPicker(MONTH, MONTHPICKER);
  const YearPicker = getPicker(YEAR, YEARPICKER);
  const QuarterPicker = getPicker(QUARTER, QUARTERPICKER);
  const TimePicker = getPicker(TIME, TIMEPICKER);
  return {
    DatePicker: DatePicker2,
    WeekPicker,
    MonthPicker,
    YearPicker,
    TimePicker,
    QuarterPicker
  };
};
const generatePicker = (generateConfig2) => {
  const {
    DatePicker: DatePicker2,
    WeekPicker,
    MonthPicker,
    YearPicker,
    TimePicker,
    QuarterPicker
  } = generatePicker$1(generateConfig2);
  const RangePicker = generateRangePicker(generateConfig2);
  const MergedDatePicker = DatePicker2;
  MergedDatePicker.WeekPicker = WeekPicker;
  MergedDatePicker.MonthPicker = MonthPicker;
  MergedDatePicker.YearPicker = YearPicker;
  MergedDatePicker.RangePicker = RangePicker;
  MergedDatePicker.TimePicker = TimePicker;
  MergedDatePicker.QuarterPicker = QuarterPicker;
  return MergedDatePicker;
};
const DatePicker = generatePicker(generateConfig);
const PurePanel$2 = genPurePanel(DatePicker, "popupAlign", void 0, "picker");
DatePicker._InternalPanelDoNotUseOrYouWillBeFired = PurePanel$2;
const PureRangePanel = genPurePanel(DatePicker.RangePicker, "popupAlign", void 0, "picker");
DatePicker._InternalRangePanelDoNotUseOrYouWillBeFired = PureRangePanel;
DatePicker.generatePicker = generatePicker;
function isPresetSize(size) {
  return ["small", "middle", "large"].includes(size);
}
function isValidGapNumber(size) {
  if (!size) {
    return false;
  }
  return typeof size === "number" && !Number.isNaN(size);
}
const SpaceContext = /* @__PURE__ */ React.createContext({
  latestIndex: 0
});
const SpaceContextProvider = SpaceContext.Provider;
const Item = ({
  className,
  index,
  children,
  split,
  style
}) => {
  const {
    latestIndex
  } = reactExports.useContext(SpaceContext);
  if (children === null || children === void 0) {
    return null;
  }
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("div", {
    className,
    style
  }, children), index < latestIndex && split && /* @__PURE__ */ reactExports.createElement("span", {
    className: `${className}-split`
  }, split));
};
var __rest$p = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const InternalSpace = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  var _a;
  const {
    getPrefixCls,
    direction: directionConfig,
    size: contextSize,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig("space");
  const {
    size = contextSize !== null && contextSize !== void 0 ? contextSize : "small",
    align,
    className,
    rootClassName,
    children,
    direction = "horizontal",
    prefixCls: customizePrefixCls,
    split,
    style,
    wrap = false,
    classNames: customClassNames,
    styles
  } = props, otherProps = __rest$p(props, ["size", "align", "className", "rootClassName", "children", "direction", "prefixCls", "split", "style", "wrap", "classNames", "styles"]);
  const [horizontalSize, verticalSize] = Array.isArray(size) ? size : [size, size];
  const isPresetVerticalSize = isPresetSize(verticalSize);
  const isPresetHorizontalSize = isPresetSize(horizontalSize);
  const isValidVerticalSize = isValidGapNumber(verticalSize);
  const isValidHorizontalSize = isValidGapNumber(horizontalSize);
  const childNodes = toArray$1(children, {
    keepEmpty: true
  });
  const mergedAlign = align === void 0 && direction === "horizontal" ? "center" : align;
  const prefixCls = getPrefixCls("space", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$q(prefixCls);
  const cls = classNames(prefixCls, contextClassName, hashId, `${prefixCls}-${direction}`, {
    [`${prefixCls}-rtl`]: directionConfig === "rtl",
    [`${prefixCls}-align-${mergedAlign}`]: mergedAlign,
    [`${prefixCls}-gap-row-${verticalSize}`]: isPresetVerticalSize,
    [`${prefixCls}-gap-col-${horizontalSize}`]: isPresetHorizontalSize
  }, className, rootClassName, cssVarCls);
  const itemClassName = classNames(`${prefixCls}-item`, (_a = customClassNames === null || customClassNames === void 0 ? void 0 : customClassNames.item) !== null && _a !== void 0 ? _a : contextClassNames.item);
  let latestIndex = 0;
  const nodes = childNodes.map((child, i) => {
    var _a2;
    if (child !== null && child !== void 0) {
      latestIndex = i;
    }
    const key = (child === null || child === void 0 ? void 0 : child.key) || `${itemClassName}-${i}`;
    return /* @__PURE__ */ reactExports.createElement(Item, {
      className: itemClassName,
      key,
      index: i,
      split,
      style: (_a2 = styles === null || styles === void 0 ? void 0 : styles.item) !== null && _a2 !== void 0 ? _a2 : contextStyles.item
    }, child);
  });
  const spaceContext = reactExports.useMemo(() => ({
    latestIndex
  }), [latestIndex]);
  if (childNodes.length === 0) {
    return null;
  }
  const gapStyle = {};
  if (wrap) {
    gapStyle.flexWrap = "wrap";
  }
  if (!isPresetHorizontalSize && isValidHorizontalSize) {
    gapStyle.columnGap = horizontalSize;
  }
  if (!isPresetVerticalSize && isValidVerticalSize) {
    gapStyle.rowGap = verticalSize;
  }
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({
    ref,
    className: cls,
    style: Object.assign(Object.assign(Object.assign({}, gapStyle), contextStyle), style)
  }, otherProps), /* @__PURE__ */ reactExports.createElement(SpaceContextProvider, {
    value: spaceContext
  }, nodes)));
});
const Space = InternalSpace;
Space.Compact = Compact$1;
var __rest$o = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const DropdownButton = (props) => {
  const {
    getPopupContainer: getContextPopupContainer,
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    type = "default",
    danger,
    disabled,
    loading,
    onClick,
    htmlType,
    children,
    className,
    menu,
    arrow,
    autoFocus,
    overlay,
    trigger,
    align,
    open: open2,
    onOpenChange,
    placement,
    getPopupContainer,
    href,
    icon = /* @__PURE__ */ reactExports.createElement(RefIcon$a, null),
    title,
    buttonsRender = (buttons) => buttons,
    mouseEnterDelay,
    mouseLeaveDelay,
    overlayClassName,
    overlayStyle,
    destroyOnHidden,
    destroyPopupOnHide,
    dropdownRender,
    popupRender
  } = props, restProps = __rest$o(props, ["prefixCls", "type", "danger", "disabled", "loading", "onClick", "htmlType", "children", "className", "menu", "arrow", "autoFocus", "overlay", "trigger", "align", "open", "onOpenChange", "placement", "getPopupContainer", "href", "icon", "title", "buttonsRender", "mouseEnterDelay", "mouseLeaveDelay", "overlayClassName", "overlayStyle", "destroyOnHidden", "destroyPopupOnHide", "dropdownRender", "popupRender"]);
  const prefixCls = getPrefixCls("dropdown", customizePrefixCls);
  const buttonPrefixCls = `${prefixCls}-button`;
  const mergedPopupRender = popupRender || dropdownRender;
  const dropdownProps = {
    menu,
    arrow,
    autoFocus,
    align,
    disabled,
    trigger: disabled ? [] : trigger,
    onOpenChange,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    mouseEnterDelay,
    mouseLeaveDelay,
    overlayClassName,
    overlayStyle,
    destroyOnHidden,
    popupRender: mergedPopupRender
  };
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const classes = classNames(buttonPrefixCls, compactItemClassnames, className);
  if ("destroyPopupOnHide" in props) {
    dropdownProps.destroyPopupOnHide = destroyPopupOnHide;
  }
  if ("overlay" in props) {
    dropdownProps.overlay = overlay;
  }
  if ("open" in props) {
    dropdownProps.open = open2;
  }
  if ("placement" in props) {
    dropdownProps.placement = placement;
  } else {
    dropdownProps.placement = direction === "rtl" ? "bottomLeft" : "bottomRight";
  }
  const leftButton = /* @__PURE__ */ reactExports.createElement(Button$1, {
    type,
    danger,
    disabled,
    loading,
    onClick,
    htmlType,
    href,
    title
  }, children);
  const rightButton = /* @__PURE__ */ reactExports.createElement(Button$1, {
    type,
    danger,
    icon
  });
  const [leftButtonToRender, rightButtonToRender] = buttonsRender([leftButton, rightButton]);
  return /* @__PURE__ */ reactExports.createElement(Space.Compact, Object.assign({
    className: classes,
    size: compactSize,
    block: true
  }, restProps), leftButtonToRender, /* @__PURE__ */ reactExports.createElement(Dropdown$1, Object.assign({}, dropdownProps), rightButtonToRender));
};
DropdownButton.__ANT_BUTTON = true;
const Dropdown = Dropdown$1;
Dropdown.Button = DropdownButton;
function convertToTooltipProps(tooltip) {
  if (tooltip === void 0 || tooltip === null) {
    return null;
  }
  if (typeof tooltip === "object" && !/* @__PURE__ */ reactExports.isValidElement(tooltip)) {
    return tooltip;
  }
  return {
    title: tooltip
  };
}
function useDebounce(value) {
  const [cacheValue, setCacheValue] = reactExports.useState(value);
  reactExports.useEffect(() => {
    const timeout = setTimeout(() => {
      setCacheValue(value);
    }, value.length ? 0 : 10);
    return () => {
      clearTimeout(timeout);
    };
  }, [value]);
  return cacheValue;
}
const genFormValidateMotionStyle = (token) => {
  const {
    componentCls
  } = token;
  const helpCls = `${componentCls}-show-help`;
  const helpItemCls = `${componentCls}-show-help-item`;
  return {
    [helpCls]: {
      // Explain holder
      transition: `opacity ${token.motionDurationFast} ${token.motionEaseInOut}`,
      "&-appear, &-enter": {
        opacity: 0,
        "&-active": {
          opacity: 1
        }
      },
      "&-leave": {
        opacity: 1,
        "&-active": {
          opacity: 0
        }
      },
      // Explain
      [helpItemCls]: {
        overflow: "hidden",
        transition: `height ${token.motionDurationFast} ${token.motionEaseInOut},
                     opacity ${token.motionDurationFast} ${token.motionEaseInOut},
                     transform ${token.motionDurationFast} ${token.motionEaseInOut} !important`,
        [`&${helpItemCls}-appear, &${helpItemCls}-enter`]: {
          transform: `translateY(-5px)`,
          opacity: 0,
          "&-active": {
            transform: "translateY(0)",
            opacity: 1
          }
        },
        [`&${helpItemCls}-leave-active`]: {
          transform: `translateY(-5px)`
        }
      }
    }
  };
};
const resetForm = (token) => ({
  legend: {
    display: "block",
    width: "100%",
    marginBottom: token.marginLG,
    padding: 0,
    color: token.colorTextDescription,
    fontSize: token.fontSizeLG,
    lineHeight: "inherit",
    border: 0,
    borderBottom: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`
  },
  'input[type="search"]': {
    boxSizing: "border-box"
  },
  // Position radios and checkboxes better
  'input[type="radio"], input[type="checkbox"]': {
    lineHeight: "normal"
  },
  'input[type="file"]': {
    display: "block"
  },
  // Make range inputs behave like textual form controls
  'input[type="range"]': {
    display: "block",
    width: "100%"
  },
  // Make multiple select elements height not fixed
  "select[multiple], select[size]": {
    height: "auto"
  },
  // Focus for file, radio, and checkbox
  [`input[type='file']:focus,
  input[type='radio']:focus,
  input[type='checkbox']:focus`]: {
    outline: 0,
    boxShadow: `0 0 0 ${unit(token.controlOutlineWidth)} ${token.controlOutline}`
  },
  // Adjust output element
  output: {
    display: "block",
    paddingTop: 15,
    color: token.colorText,
    fontSize: token.fontSize,
    lineHeight: token.lineHeight
  }
});
const genFormSize = (token, height) => {
  const {
    formItemCls
  } = token;
  return {
    [formItemCls]: {
      [`${formItemCls}-label > label`]: {
        height
      },
      [`${formItemCls}-control-input`]: {
        minHeight: height
      }
    }
  };
};
const genFormStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [token.componentCls]: Object.assign(Object.assign(Object.assign({}, resetComponent(token)), resetForm(token)), {
      [`${componentCls}-text`]: {
        display: "inline-block",
        paddingInlineEnd: token.paddingSM
      },
      // ================================================================
      // =                             Size                             =
      // ================================================================
      "&-small": Object.assign({}, genFormSize(token, token.controlHeightSM)),
      "&-large": Object.assign({}, genFormSize(token, token.controlHeightLG))
    })
  };
};
const genFormItemStyle = (token) => {
  const {
    formItemCls,
    iconCls,
    rootPrefixCls,
    antCls,
    labelRequiredMarkColor,
    labelColor,
    labelFontSize,
    labelHeight,
    labelColonMarginInlineStart,
    labelColonMarginInlineEnd,
    itemMarginBottom
  } = token;
  return {
    [formItemCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      marginBottom: itemMarginBottom,
      verticalAlign: "top",
      "&-with-help": {
        transition: "none"
      },
      [`&-hidden,
        &-hidden${antCls}-row`]: {
        // https://github.com/ant-design/ant-design/issues/26141
        display: "none"
      },
      "&-has-warning": {
        [`${formItemCls}-split`]: {
          color: token.colorError
        }
      },
      "&-has-error": {
        [`${formItemCls}-split`]: {
          color: token.colorWarning
        }
      },
      // ==============================================================
      // =                            Label                           =
      // ==============================================================
      [`${formItemCls}-label`]: {
        flexGrow: 0,
        overflow: "hidden",
        whiteSpace: "nowrap",
        textAlign: "end",
        verticalAlign: "middle",
        "&-left": {
          textAlign: "start"
        },
        "&-wrap": {
          overflow: "unset",
          lineHeight: token.lineHeight,
          whiteSpace: "unset",
          "> label": {
            verticalAlign: "middle",
            textWrap: "balance"
          }
        },
        "> label": {
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          maxWidth: "100%",
          height: labelHeight,
          color: labelColor,
          fontSize: labelFontSize,
          [`> ${iconCls}`]: {
            fontSize: token.fontSize,
            verticalAlign: "top"
          },
          [`&${formItemCls}-required`]: {
            "&::before": {
              display: "inline-block",
              marginInlineEnd: token.marginXXS,
              color: labelRequiredMarkColor,
              fontSize: token.fontSize,
              fontFamily: "SimSun, sans-serif",
              lineHeight: 1,
              content: '"*"'
            },
            [`&${formItemCls}-required-mark-hidden, &${formItemCls}-required-mark-optional`]: {
              "&::before": {
                display: "none"
              }
            }
          },
          // Optional mark
          [`${formItemCls}-optional`]: {
            display: "inline-block",
            marginInlineStart: token.marginXXS,
            color: token.colorTextDescription,
            [`&${formItemCls}-required-mark-hidden`]: {
              display: "none"
            }
          },
          // Optional mark
          [`${formItemCls}-tooltip`]: {
            color: token.colorTextDescription,
            cursor: "help",
            writingMode: "horizontal-tb",
            marginInlineStart: token.marginXXS
          },
          "&::after": {
            content: '":"',
            position: "relative",
            marginBlock: 0,
            marginInlineStart: labelColonMarginInlineStart,
            marginInlineEnd: labelColonMarginInlineEnd
          },
          [`&${formItemCls}-no-colon::after`]: {
            content: '"\\a0"'
          }
        }
      },
      // ==============================================================
      // =                            Input                           =
      // ==============================================================
      [`${formItemCls}-control`]: {
        ["--ant-display"]: "flex",
        flexDirection: "column",
        flexGrow: 1,
        [`&:first-child:not([class^="'${rootPrefixCls}-col-'"]):not([class*="' ${rootPrefixCls}-col-'"])`]: {
          width: "100%"
        },
        "&-input": {
          position: "relative",
          display: "flex",
          alignItems: "center",
          minHeight: token.controlHeight,
          "&-content": {
            flex: "auto",
            maxWidth: "100%",
            // Fix https://github.com/ant-design/ant-design/issues/54042
            // Remove impact of whitespaces
            [`&:has(> ${antCls}-switch:only-child, > ${antCls}-rate:only-child)`]: {
              display: "flex",
              alignItems: "center"
            }
          }
        }
      },
      // ==============================================================
      // =                           Explain                          =
      // ==============================================================
      [formItemCls]: {
        "&-additional": {
          display: "flex",
          flexDirection: "column"
        },
        "&-explain, &-extra": {
          clear: "both",
          color: token.colorTextDescription,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight
        },
        "&-explain-connected": {
          width: "100%"
        },
        "&-extra": {
          minHeight: token.controlHeightSM,
          transition: `color ${token.motionDurationMid} ${token.motionEaseOut}`
          // sync input color transition
        },
        "&-explain": {
          "&-error": {
            color: token.colorError
          },
          "&-warning": {
            color: token.colorWarning
          }
        }
      },
      [`&-with-help ${formItemCls}-explain`]: {
        height: "auto",
        opacity: 1
      },
      // ==============================================================
      // =                        Feedback Icon                       =
      // ==============================================================
      [`${formItemCls}-feedback-icon`]: {
        fontSize: token.fontSize,
        textAlign: "center",
        visibility: "visible",
        animationName: zoomIn,
        animationDuration: token.motionDurationMid,
        animationTimingFunction: token.motionEaseOutBack,
        pointerEvents: "none",
        "&-success": {
          color: token.colorSuccess
        },
        "&-error": {
          color: token.colorError
        },
        "&-warning": {
          color: token.colorWarning
        },
        "&-validating": {
          color: token.colorPrimary
        }
      }
    })
  };
};
const genHorizontalStyle = (token, className) => {
  const {
    formItemCls
  } = token;
  return {
    [`${className}-horizontal`]: {
      [`${formItemCls}-label`]: {
        flexGrow: 0
      },
      [`${formItemCls}-control`]: {
        flex: "1 1 0",
        // https://github.com/ant-design/ant-design/issues/32777
        // https://github.com/ant-design/ant-design/issues/33773
        minWidth: 0
      },
      // Do not change this to `ant-col-24`! `-24` match all the responsive rules
      // https://github.com/ant-design/ant-design/issues/32980
      // https://github.com/ant-design/ant-design/issues/34903
      // https://github.com/ant-design/ant-design/issues/44538
      [`${formItemCls}-label[class$='-24'], ${formItemCls}-label[class*='-24 ']`]: {
        [`& + ${formItemCls}-control`]: {
          minWidth: "unset"
        }
      }
    }
  };
};
const genInlineStyle = (token) => {
  const {
    componentCls,
    formItemCls,
    inlineItemMarginBottom
  } = token;
  return {
    [`${componentCls}-inline`]: {
      display: "flex",
      flexWrap: "wrap",
      [formItemCls]: {
        flex: "none",
        marginInlineEnd: token.margin,
        marginBottom: inlineItemMarginBottom,
        "&-row": {
          flexWrap: "nowrap"
        },
        [`> ${formItemCls}-label,
        > ${formItemCls}-control`]: {
          display: "inline-block",
          verticalAlign: "top"
        },
        [`> ${formItemCls}-label`]: {
          flex: "none"
        },
        [`${componentCls}-text`]: {
          display: "inline-block"
        },
        [`${formItemCls}-has-feedback`]: {
          display: "inline-block"
        }
      }
    }
  };
};
const makeVerticalLayoutLabel = (token) => ({
  padding: token.verticalLabelPadding,
  margin: token.verticalLabelMargin,
  whiteSpace: "initial",
  textAlign: "start",
  "> label": {
    margin: 0,
    "&::after": {
      // https://github.com/ant-design/ant-design/issues/43538
      visibility: "hidden"
    }
  }
});
const makeVerticalLayout = (token) => {
  const {
    componentCls,
    formItemCls,
    rootPrefixCls
  } = token;
  return {
    [`${formItemCls} ${formItemCls}-label`]: makeVerticalLayoutLabel(token),
    // ref: https://github.com/ant-design/ant-design/issues/45122
    [`${componentCls}:not(${componentCls}-inline)`]: {
      [formItemCls]: {
        flexWrap: "wrap",
        [`${formItemCls}-label, ${formItemCls}-control`]: {
          // When developer pass `xs: { span }`,
          // It should follow the `xs` screen config
          // ref: https://github.com/ant-design/ant-design/issues/44386
          [`&:not([class*=" ${rootPrefixCls}-col-xs"])`]: {
            flex: "0 0 100%",
            maxWidth: "100%"
          }
        }
      }
    }
  };
};
const genVerticalStyle = (token) => {
  const {
    componentCls,
    formItemCls,
    antCls
  } = token;
  return {
    [`${componentCls}-vertical`]: {
      [`${formItemCls}:not(${formItemCls}-horizontal)`]: {
        [`${formItemCls}-row`]: {
          flexDirection: "column"
        },
        [`${formItemCls}-label > label`]: {
          height: "auto"
        },
        [`${formItemCls}-control`]: {
          width: "100%"
        },
        [`${formItemCls}-label,
        ${antCls}-col-24${formItemCls}-label,
        ${antCls}-col-xl-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
      }
    },
    [`@media (max-width: ${unit(token.screenXSMax)})`]: [makeVerticalLayout(token), {
      [componentCls]: {
        [`${formItemCls}:not(${formItemCls}-horizontal)`]: {
          [`${antCls}-col-xs-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
        }
      }
    }],
    [`@media (max-width: ${unit(token.screenSMMax)})`]: {
      [componentCls]: {
        [`${formItemCls}:not(${formItemCls}-horizontal)`]: {
          [`${antCls}-col-sm-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
        }
      }
    },
    [`@media (max-width: ${unit(token.screenMDMax)})`]: {
      [componentCls]: {
        [`${formItemCls}:not(${formItemCls}-horizontal)`]: {
          [`${antCls}-col-md-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
        }
      }
    },
    [`@media (max-width: ${unit(token.screenLGMax)})`]: {
      [componentCls]: {
        [`${formItemCls}:not(${formItemCls}-horizontal)`]: {
          [`${antCls}-col-lg-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
        }
      }
    }
  };
};
const genItemVerticalStyle = (token) => {
  const {
    formItemCls,
    antCls
  } = token;
  return {
    [`${formItemCls}-vertical`]: {
      [`${formItemCls}-row`]: {
        flexDirection: "column"
      },
      [`${formItemCls}-label > label`]: {
        height: "auto"
      },
      [`${formItemCls}-control`]: {
        width: "100%"
      }
    },
    [`${formItemCls}-vertical ${formItemCls}-label,
      ${antCls}-col-24${formItemCls}-label,
      ${antCls}-col-xl-24${formItemCls}-label`]: makeVerticalLayoutLabel(token),
    [`@media (max-width: ${unit(token.screenXSMax)})`]: [makeVerticalLayout(token), {
      [formItemCls]: {
        [`${antCls}-col-xs-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
      }
    }],
    [`@media (max-width: ${unit(token.screenSMMax)})`]: {
      [formItemCls]: {
        [`${antCls}-col-sm-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
      }
    },
    [`@media (max-width: ${unit(token.screenMDMax)})`]: {
      [formItemCls]: {
        [`${antCls}-col-md-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
      }
    },
    [`@media (max-width: ${unit(token.screenLGMax)})`]: {
      [formItemCls]: {
        [`${antCls}-col-lg-24${formItemCls}-label`]: makeVerticalLayoutLabel(token)
      }
    }
  };
};
const prepareComponentToken$7 = (token) => ({
  labelRequiredMarkColor: token.colorError,
  labelColor: token.colorTextHeading,
  labelFontSize: token.fontSize,
  labelHeight: token.controlHeight,
  labelColonMarginInlineStart: token.marginXXS / 2,
  labelColonMarginInlineEnd: token.marginXS,
  itemMarginBottom: token.marginLG,
  verticalLabelPadding: `0 0 ${token.paddingXS}px`,
  verticalLabelMargin: 0,
  inlineItemMarginBottom: 0
});
const prepareToken$2 = (token, rootPrefixCls) => {
  const formToken = merge$1(token, {
    formItemCls: `${token.componentCls}-item`,
    rootPrefixCls
  });
  return formToken;
};
const useStyle$9 = genStyleHooks("Form", (token, {
  rootPrefixCls
}) => {
  const formToken = prepareToken$2(token, rootPrefixCls);
  return [genFormStyle(formToken), genFormItemStyle(formToken), genFormValidateMotionStyle(formToken), genHorizontalStyle(formToken, formToken.componentCls), genHorizontalStyle(formToken, formToken.formItemCls), genInlineStyle(formToken), genVerticalStyle(formToken), genItemVerticalStyle(formToken), genCollapseMotion(formToken), zoomIn];
}, prepareComponentToken$7, {
  // Let From style before the Grid
  // ref https://github.com/ant-design/ant-design/issues/44386
  order: -1e3
});
const EMPTY_LIST$2 = [];
function toErrorEntity(error, prefix, errorStatus, index = 0) {
  return {
    key: typeof error === "string" ? error : `${prefix}-${index}`,
    error,
    errorStatus
  };
}
const ErrorList = ({
  help,
  helpStatus,
  errors = EMPTY_LIST$2,
  warnings = EMPTY_LIST$2,
  className: rootClassName,
  fieldId,
  onVisibleChanged
}) => {
  const {
    prefixCls
  } = reactExports.useContext(FormItemPrefixContext);
  const baseClassName = `${prefixCls}-item-explain`;
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$9(prefixCls, rootCls);
  const collapseMotion = reactExports.useMemo(() => initCollapseMotion(prefixCls), [prefixCls]);
  const debounceErrors = useDebounce(errors);
  const debounceWarnings = useDebounce(warnings);
  const fullKeyList = reactExports.useMemo(() => {
    if (help !== void 0 && help !== null) {
      return [toErrorEntity(help, "help", helpStatus)];
    }
    return [].concat(_toConsumableArray(debounceErrors.map((error, index) => toErrorEntity(error, "error", "error", index))), _toConsumableArray(debounceWarnings.map((warning, index) => toErrorEntity(warning, "warning", "warning", index))));
  }, [help, helpStatus, debounceErrors, debounceWarnings]);
  const filledKeyFullKeyList = reactExports.useMemo(() => {
    const keysCount = {};
    fullKeyList.forEach(({
      key
    }) => {
      keysCount[key] = (keysCount[key] || 0) + 1;
    });
    return fullKeyList.map((entity, index) => Object.assign(Object.assign({}, entity), {
      key: keysCount[entity.key] > 1 ? `${entity.key}-fallback-${index}` : entity.key
    }));
  }, [fullKeyList]);
  const helpProps = {};
  if (fieldId) {
    helpProps.id = `${fieldId}_help`;
  }
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(CSSMotion, {
    motionDeadline: collapseMotion.motionDeadline,
    motionName: `${prefixCls}-show-help`,
    visible: !!filledKeyFullKeyList.length,
    onVisibleChanged
  }, (holderProps) => {
    const {
      className: holderClassName,
      style: holderStyle
    } = holderProps;
    return /* @__PURE__ */ reactExports.createElement("div", Object.assign({}, helpProps, {
      className: classNames(baseClassName, holderClassName, cssVarCls, rootCls, rootClassName, hashId),
      style: holderStyle
    }), /* @__PURE__ */ reactExports.createElement(CSSMotionList, Object.assign({
      keys: filledKeyFullKeyList
    }, initCollapseMotion(prefixCls), {
      motionName: `${prefixCls}-show-help-item`,
      component: false
    }), (itemProps) => {
      const {
        key,
        error,
        errorStatus,
        className: itemClassName,
        style: itemStyle
      } = itemProps;
      return /* @__PURE__ */ reactExports.createElement("div", {
        key,
        className: classNames(itemClassName, {
          [`${baseClassName}-${errorStatus}`]: errorStatus
        }),
        style: itemStyle
      }, error);
    }));
  }));
};
var __rest$n = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const InternalForm = (props, ref) => {
  const contextDisabled = reactExports.useContext(DisabledContext);
  const {
    getPrefixCls,
    direction,
    requiredMark: contextRequiredMark,
    colon: contextColon,
    scrollToFirstError: contextScrollToFirstError,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig("form");
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    size,
    disabled = contextDisabled,
    form,
    colon,
    labelAlign,
    labelWrap,
    labelCol,
    wrapperCol,
    hideRequiredMark,
    layout = "horizontal",
    scrollToFirstError,
    requiredMark,
    onFinishFailed,
    name,
    style,
    feedbackIcons,
    variant
  } = props, restFormProps = __rest$n(props, ["prefixCls", "className", "rootClassName", "size", "disabled", "form", "colon", "labelAlign", "labelWrap", "labelCol", "wrapperCol", "hideRequiredMark", "layout", "scrollToFirstError", "requiredMark", "onFinishFailed", "name", "style", "feedbackIcons", "variant"]);
  const mergedSize = useSize(size);
  const contextValidateMessages = reactExports.useContext(ValidateMessagesContext);
  const mergedRequiredMark = reactExports.useMemo(() => {
    if (requiredMark !== void 0) {
      return requiredMark;
    }
    if (hideRequiredMark) {
      return false;
    }
    if (contextRequiredMark !== void 0) {
      return contextRequiredMark;
    }
    return true;
  }, [hideRequiredMark, requiredMark, contextRequiredMark]);
  const mergedColon = colon !== null && colon !== void 0 ? colon : contextColon;
  const prefixCls = getPrefixCls("form", customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$9(prefixCls, rootCls);
  const formClassName = classNames(prefixCls, `${prefixCls}-${layout}`, {
    [`${prefixCls}-hide-required-mark`]: mergedRequiredMark === false,
    // todo: remove in next major version
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-${mergedSize}`]: mergedSize
  }, cssVarCls, rootCls, hashId, contextClassName, className, rootClassName);
  const [wrapForm] = useForm(form);
  const {
    __INTERNAL__
  } = wrapForm;
  __INTERNAL__.name = name;
  const formContextValue = reactExports.useMemo(() => ({
    name,
    labelAlign,
    labelCol,
    labelWrap,
    wrapperCol,
    vertical: layout === "vertical",
    colon: mergedColon,
    requiredMark: mergedRequiredMark,
    itemRef: __INTERNAL__.itemRef,
    form: wrapForm,
    feedbackIcons
  }), [name, labelAlign, labelCol, wrapperCol, layout, mergedColon, mergedRequiredMark, wrapForm, feedbackIcons]);
  const nativeElementRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => {
    var _a;
    return Object.assign(Object.assign({}, wrapForm), {
      nativeElement: (_a = nativeElementRef.current) === null || _a === void 0 ? void 0 : _a.nativeElement
    });
  });
  const scrollToField = (options, fieldName) => {
    if (options) {
      let defaultScrollToFirstError = {
        block: "nearest"
      };
      if (typeof options === "object") {
        defaultScrollToFirstError = Object.assign(Object.assign({}, defaultScrollToFirstError), options);
      }
      wrapForm.scrollToField(fieldName, defaultScrollToFirstError);
    }
  };
  const onInternalFinishFailed = (errorInfo) => {
    onFinishFailed === null || onFinishFailed === void 0 ? void 0 : onFinishFailed(errorInfo);
    if (errorInfo.errorFields.length) {
      const fieldName = errorInfo.errorFields[0].name;
      if (scrollToFirstError !== void 0) {
        scrollToField(scrollToFirstError, fieldName);
        return;
      }
      if (contextScrollToFirstError !== void 0) {
        scrollToField(contextScrollToFirstError, fieldName);
      }
    }
  };
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(VariantContext.Provider, {
    value: variant
  }, /* @__PURE__ */ reactExports.createElement(DisabledContextProvider, {
    disabled
  }, /* @__PURE__ */ reactExports.createElement(SizeContext.Provider, {
    value: mergedSize
  }, /* @__PURE__ */ reactExports.createElement(FormProvider, {
    // This is not list in API, we pass with spread
    validateMessages: contextValidateMessages
  }, /* @__PURE__ */ reactExports.createElement(FormContext.Provider, {
    value: formContextValue
  }, /* @__PURE__ */ reactExports.createElement(RefForm, Object.assign({
    id: name
  }, restFormProps, {
    name,
    onFinishFailed: onInternalFinishFailed,
    form: wrapForm,
    ref: nativeElementRef,
    style: Object.assign(Object.assign({}, contextStyle), style),
    className: formClassName
  }))))))));
};
const Form$1 = /* @__PURE__ */ reactExports.forwardRef(InternalForm);
function useChildren(children) {
  if (typeof children === "function") {
    return children;
  }
  const childList = toArray$1(children);
  return childList.length <= 1 ? childList[0] : childList;
}
const useFormItemStatus = () => {
  const {
    status,
    errors = [],
    warnings = []
  } = reactExports.useContext(FormItemInputContext);
  return {
    status,
    errors,
    warnings
  };
};
useFormItemStatus.Context = FormItemInputContext;
function useFrameState(defaultValue) {
  const [value, setValue] = reactExports.useState(defaultValue);
  const frameRef = reactExports.useRef(null);
  const batchRef = reactExports.useRef([]);
  const destroyRef = reactExports.useRef(false);
  reactExports.useEffect(() => {
    destroyRef.current = false;
    return () => {
      destroyRef.current = true;
      wrapperRaf.cancel(frameRef.current);
      frameRef.current = null;
    };
  }, []);
  function setFrameValue(updater) {
    if (destroyRef.current) {
      return;
    }
    if (frameRef.current === null) {
      batchRef.current = [];
      frameRef.current = wrapperRaf(() => {
        frameRef.current = null;
        setValue((prevValue) => {
          let current = prevValue;
          batchRef.current.forEach((func) => {
            current = func(current);
          });
          return current;
        });
      });
    }
    batchRef.current.push(updater);
  }
  return [value, setFrameValue];
}
function useItemRef() {
  const {
    itemRef
  } = reactExports.useContext(FormContext);
  const cacheRef = reactExports.useRef({});
  function getRef(name, children) {
    const childrenRef = children && typeof children === "object" && getNodeRef(children);
    const nameStr = name.join("_");
    if (cacheRef.current.name !== nameStr || cacheRef.current.originRef !== childrenRef) {
      cacheRef.current.name = nameStr;
      cacheRef.current.originRef = childrenRef;
      cacheRef.current.ref = composeRef(itemRef(name), childrenRef);
    }
    return cacheRef.current.ref;
  }
  return getRef;
}
const genFallbackStyle = (token) => {
  const {
    formItemCls
  } = token;
  return {
    "@media screen and (-ms-high-contrast: active), (-ms-high-contrast: none)": {
      // Fallback for IE, safe to remove we not support it anymore
      [`${formItemCls}-control`]: {
        display: "flex"
      }
    }
  };
};
const FallbackCmp = genSubStyleComponent(["Form", "item-item"], (token, {
  rootPrefixCls
}) => {
  const formToken = prepareToken$2(token, rootPrefixCls);
  return [genFallbackStyle(formToken)];
});
var __rest$m = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const GRID_MAX = 24;
const FormItemInput = (props) => {
  const {
    prefixCls,
    status,
    labelCol,
    wrapperCol,
    children,
    errors,
    warnings,
    _internalItemRender: formItemRender,
    extra,
    help,
    fieldId,
    marginBottom,
    onErrorVisibleChanged,
    label
  } = props;
  const baseClassName = `${prefixCls}-item`;
  const formContext = reactExports.useContext(FormContext);
  const mergedWrapperCol = reactExports.useMemo(() => {
    let mergedWrapper = Object.assign({}, wrapperCol || formContext.wrapperCol || {});
    if (label === null && !labelCol && !wrapperCol && formContext.labelCol) {
      const list = [void 0, "xs", "sm", "md", "lg", "xl", "xxl"];
      list.forEach((size) => {
        const _size = size ? [size] : [];
        const formLabel = get(formContext.labelCol, _size);
        const formLabelObj = typeof formLabel === "object" ? formLabel : {};
        const wrapper = get(mergedWrapper, _size);
        const wrapperObj = typeof wrapper === "object" ? wrapper : {};
        if ("span" in formLabelObj && !("offset" in wrapperObj) && formLabelObj.span < GRID_MAX) {
          mergedWrapper = set(mergedWrapper, [].concat(_size, ["offset"]), formLabelObj.span);
        }
      });
    }
    return mergedWrapper;
  }, [wrapperCol, formContext]);
  const className = classNames(`${baseClassName}-control`, mergedWrapperCol.className);
  const subFormContext = reactExports.useMemo(() => {
    const {
      labelCol: labelCol2,
      wrapperCol: wrapperCol2
    } = formContext, rest = __rest$m(formContext, ["labelCol", "wrapperCol"]);
    return rest;
  }, [formContext]);
  const extraRef = reactExports.useRef(null);
  const [extraHeight, setExtraHeight] = reactExports.useState(0);
  useLayoutEffect(() => {
    if (extra && extraRef.current) {
      setExtraHeight(extraRef.current.clientHeight);
    } else {
      setExtraHeight(0);
    }
  }, [extra]);
  const inputDom = /* @__PURE__ */ reactExports.createElement("div", {
    className: `${baseClassName}-control-input`
  }, /* @__PURE__ */ reactExports.createElement("div", {
    className: `${baseClassName}-control-input-content`
  }, children));
  const formItemContext = reactExports.useMemo(() => ({
    prefixCls,
    status
  }), [prefixCls, status]);
  const errorListDom = marginBottom !== null || errors.length || warnings.length ? /* @__PURE__ */ reactExports.createElement(FormItemPrefixContext.Provider, {
    value: formItemContext
  }, /* @__PURE__ */ reactExports.createElement(ErrorList, {
    fieldId,
    errors,
    warnings,
    help,
    helpStatus: status,
    className: `${baseClassName}-explain-connected`,
    onVisibleChanged: onErrorVisibleChanged
  })) : null;
  const extraProps = {};
  if (fieldId) {
    extraProps.id = `${fieldId}_extra`;
  }
  const extraDom = extra ? /* @__PURE__ */ reactExports.createElement("div", Object.assign({}, extraProps, {
    className: `${baseClassName}-extra`,
    ref: extraRef
  }), extra) : null;
  const additionalDom = errorListDom || extraDom ? /* @__PURE__ */ reactExports.createElement("div", {
    className: `${baseClassName}-additional`,
    style: marginBottom ? {
      minHeight: marginBottom + extraHeight
    } : {}
  }, errorListDom, extraDom) : null;
  const dom = formItemRender && formItemRender.mark === "pro_table_render" && formItemRender.render ? formItemRender.render(props, {
    input: inputDom,
    errorList: errorListDom,
    extra: extraDom
  }) : /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, inputDom, additionalDom);
  return /* @__PURE__ */ reactExports.createElement(FormContext.Provider, {
    value: subFormContext
  }, /* @__PURE__ */ reactExports.createElement(Col, Object.assign({}, mergedWrapperCol, {
    className
  }), dom), /* @__PURE__ */ reactExports.createElement(FallbackCmp, {
    prefixCls
  }));
};
var __rest$l = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const FormItemLabel = ({
  prefixCls,
  label,
  htmlFor,
  labelCol,
  labelAlign,
  colon,
  required,
  requiredMark,
  tooltip,
  vertical
}) => {
  var _a;
  const [formLocale] = useLocale("Form");
  const {
    labelAlign: contextLabelAlign,
    labelCol: contextLabelCol,
    labelWrap,
    colon: contextColon
  } = reactExports.useContext(FormContext);
  if (!label) {
    return null;
  }
  const mergedLabelCol = labelCol || contextLabelCol || {};
  const mergedLabelAlign = labelAlign || contextLabelAlign;
  const labelClsBasic = `${prefixCls}-item-label`;
  const labelColClassName = classNames(labelClsBasic, mergedLabelAlign === "left" && `${labelClsBasic}-left`, mergedLabelCol.className, {
    [`${labelClsBasic}-wrap`]: !!labelWrap
  });
  let labelChildren = label;
  const computedColon = colon === true || contextColon !== false && colon !== false;
  const haveColon = computedColon && !vertical;
  if (haveColon && typeof label === "string" && label.trim()) {
    labelChildren = label.replace(/[:|：]\s*$/, "");
  }
  const tooltipProps = convertToTooltipProps(tooltip);
  if (tooltipProps) {
    const {
      icon = /* @__PURE__ */ reactExports.createElement(RefIcon$h, null)
    } = tooltipProps, restTooltipProps = __rest$l(tooltipProps, ["icon"]);
    const tooltipNode = /* @__PURE__ */ reactExports.createElement(Tooltip, Object.assign({}, restTooltipProps), /* @__PURE__ */ reactExports.cloneElement(icon, {
      className: `${prefixCls}-item-tooltip`,
      title: "",
      onClick: (e2) => {
        e2.preventDefault();
      },
      tabIndex: null
    }));
    labelChildren = /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, labelChildren, tooltipNode);
  }
  const isOptionalMark = requiredMark === "optional";
  const isRenderMark = typeof requiredMark === "function";
  const hideRequiredMark = requiredMark === false;
  if (isRenderMark) {
    labelChildren = requiredMark(labelChildren, {
      required: !!required
    });
  } else if (isOptionalMark && !required) {
    labelChildren = /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, labelChildren, /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-item-optional`,
      title: ""
    }, (formLocale === null || formLocale === void 0 ? void 0 : formLocale.optional) || ((_a = localeValues.Form) === null || _a === void 0 ? void 0 : _a.optional)));
  }
  let markType;
  if (hideRequiredMark) {
    markType = "hidden";
  } else if (isOptionalMark || isRenderMark) {
    markType = "optional";
  }
  const labelClassName = classNames({
    [`${prefixCls}-item-required`]: required,
    [`${prefixCls}-item-required-mark-${markType}`]: markType,
    [`${prefixCls}-item-no-colon`]: !computedColon
  });
  return /* @__PURE__ */ reactExports.createElement(Col, Object.assign({}, mergedLabelCol, {
    className: labelColClassName
  }), /* @__PURE__ */ reactExports.createElement("label", {
    htmlFor,
    className: labelClassName,
    title: typeof label === "string" ? label : ""
  }, labelChildren));
};
const iconMap = {
  success: RefIcon$3,
  warning: RefIcon$1,
  error: RefIcon$2,
  validating: RefIcon
};
function StatusProvider({
  children,
  errors,
  warnings,
  hasFeedback,
  validateStatus,
  prefixCls,
  meta,
  noStyle,
  name
}) {
  const itemPrefixCls = `${prefixCls}-item`;
  const {
    feedbackIcons
  } = reactExports.useContext(FormContext);
  const mergedValidateStatus = getStatus(errors, warnings, meta, null, !!hasFeedback, validateStatus);
  const {
    isFormItemInput: parentIsFormItemInput,
    status: parentStatus,
    hasFeedback: parentHasFeedback,
    feedbackIcon: parentFeedbackIcon,
    name: parentName
  } = reactExports.useContext(FormItemInputContext);
  const formItemStatusContext = reactExports.useMemo(() => {
    var _a;
    let feedbackIcon;
    if (hasFeedback) {
      const customIcons = hasFeedback !== true && hasFeedback.icons || feedbackIcons;
      const customIconNode = mergedValidateStatus && ((_a = customIcons === null || customIcons === void 0 ? void 0 : customIcons({
        status: mergedValidateStatus,
        errors,
        warnings
      })) === null || _a === void 0 ? void 0 : _a[mergedValidateStatus]);
      const IconNode = mergedValidateStatus && iconMap[mergedValidateStatus];
      feedbackIcon = customIconNode !== false && IconNode ? /* @__PURE__ */ reactExports.createElement("span", {
        className: classNames(`${itemPrefixCls}-feedback-icon`, `${itemPrefixCls}-feedback-icon-${mergedValidateStatus}`)
      }, customIconNode || /* @__PURE__ */ reactExports.createElement(IconNode, null)) : null;
    }
    const context = {
      status: mergedValidateStatus || "",
      errors,
      warnings,
      hasFeedback: !!hasFeedback,
      feedbackIcon,
      isFormItemInput: true,
      name
    };
    if (noStyle) {
      context.status = (mergedValidateStatus !== null && mergedValidateStatus !== void 0 ? mergedValidateStatus : parentStatus) || "";
      context.isFormItemInput = parentIsFormItemInput;
      context.hasFeedback = !!(hasFeedback !== null && hasFeedback !== void 0 ? hasFeedback : parentHasFeedback);
      context.feedbackIcon = hasFeedback !== void 0 ? context.feedbackIcon : parentFeedbackIcon;
      context.name = name !== null && name !== void 0 ? name : parentName;
    }
    return context;
  }, [mergedValidateStatus, hasFeedback, noStyle, parentIsFormItemInput, parentStatus]);
  return /* @__PURE__ */ reactExports.createElement(FormItemInputContext.Provider, {
    value: formItemStatusContext
  }, children);
}
var __rest$k = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function ItemHolder(props) {
  const {
    prefixCls,
    className,
    rootClassName,
    style,
    help,
    errors,
    warnings,
    validateStatus,
    meta,
    hasFeedback,
    hidden,
    children,
    fieldId,
    required,
    isRequired,
    onSubItemMetaChange,
    layout,
    name
  } = props, restProps = __rest$k(props, ["prefixCls", "className", "rootClassName", "style", "help", "errors", "warnings", "validateStatus", "meta", "hasFeedback", "hidden", "children", "fieldId", "required", "isRequired", "onSubItemMetaChange", "layout", "name"]);
  const itemPrefixCls = `${prefixCls}-item`;
  const {
    requiredMark,
    vertical: formVertical
  } = reactExports.useContext(FormContext);
  const vertical = formVertical || layout === "vertical";
  const itemRef = reactExports.useRef(null);
  const debounceErrors = useDebounce(errors);
  const debounceWarnings = useDebounce(warnings);
  const hasHelp = help !== void 0 && help !== null;
  const hasError = !!(hasHelp || errors.length || warnings.length);
  const isOnScreen = !!itemRef.current && isVisible(itemRef.current);
  const [marginBottom, setMarginBottom] = reactExports.useState(null);
  useLayoutEffect(() => {
    if (hasError && itemRef.current) {
      const itemStyle = getComputedStyle(itemRef.current);
      setMarginBottom(parseInt(itemStyle.marginBottom, 10));
    }
  }, [hasError, isOnScreen]);
  const onErrorVisibleChanged = (nextVisible) => {
    if (!nextVisible) {
      setMarginBottom(null);
    }
  };
  const getValidateState = (isDebounce = false) => {
    const _errors = isDebounce ? debounceErrors : meta.errors;
    const _warnings = isDebounce ? debounceWarnings : meta.warnings;
    return getStatus(_errors, _warnings, meta, "", !!hasFeedback, validateStatus);
  };
  const mergedValidateStatus = getValidateState();
  const itemClassName = classNames(itemPrefixCls, className, rootClassName, {
    [`${itemPrefixCls}-with-help`]: hasHelp || debounceErrors.length || debounceWarnings.length,
    // Status
    [`${itemPrefixCls}-has-feedback`]: mergedValidateStatus && hasFeedback,
    [`${itemPrefixCls}-has-success`]: mergedValidateStatus === "success",
    [`${itemPrefixCls}-has-warning`]: mergedValidateStatus === "warning",
    [`${itemPrefixCls}-has-error`]: mergedValidateStatus === "error",
    [`${itemPrefixCls}-is-validating`]: mergedValidateStatus === "validating",
    [`${itemPrefixCls}-hidden`]: hidden,
    // Layout
    [`${itemPrefixCls}-${layout}`]: layout
  });
  return /* @__PURE__ */ reactExports.createElement("div", {
    className: itemClassName,
    style,
    ref: itemRef
  }, /* @__PURE__ */ reactExports.createElement(Row, Object.assign({
    className: `${itemPrefixCls}-row`
  }, omit(restProps, [
    "_internalItemRender",
    "colon",
    "dependencies",
    "extra",
    "fieldKey",
    "getValueFromEvent",
    "getValueProps",
    "htmlFor",
    "id",
    // It is deprecated because `htmlFor` is its replacement.
    "initialValue",
    "isListField",
    "label",
    "labelAlign",
    "labelCol",
    "labelWrap",
    "messageVariables",
    "name",
    "normalize",
    "noStyle",
    "preserve",
    "requiredMark",
    "rules",
    "shouldUpdate",
    "trigger",
    "tooltip",
    "validateFirst",
    "validateTrigger",
    "valuePropName",
    "wrapperCol",
    "validateDebounce"
  ])), /* @__PURE__ */ reactExports.createElement(FormItemLabel, Object.assign({
    htmlFor: fieldId
  }, props, {
    requiredMark,
    required: required !== null && required !== void 0 ? required : isRequired,
    prefixCls,
    vertical
  })), /* @__PURE__ */ reactExports.createElement(FormItemInput, Object.assign({}, props, meta, {
    errors: debounceErrors,
    warnings: debounceWarnings,
    prefixCls,
    status: mergedValidateStatus,
    help,
    marginBottom,
    onErrorVisibleChanged
  }), /* @__PURE__ */ reactExports.createElement(NoStyleItemContext.Provider, {
    value: onSubItemMetaChange
  }, /* @__PURE__ */ reactExports.createElement(StatusProvider, {
    prefixCls,
    meta,
    errors: meta.errors,
    warnings: meta.warnings,
    hasFeedback,
    // Already calculated
    validateStatus: mergedValidateStatus,
    name
  }, children)))), !!marginBottom && /* @__PURE__ */ reactExports.createElement("div", {
    className: `${itemPrefixCls}-margin-offset`,
    style: {
      marginBottom: -marginBottom
    }
  }));
}
const NAME_SPLIT = "__SPLIT__";
function isSimilarControl(a, b) {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  return keysA.length === keysB.length && keysA.every((key) => {
    const propValueA = a[key];
    const propValueB = b[key];
    return propValueA === propValueB || typeof propValueA === "function" || typeof propValueB === "function";
  });
}
const MemoInput = /* @__PURE__ */ reactExports.memo(({
  children
}) => children, (prev, next) => isSimilarControl(prev.control, next.control) && prev.update === next.update && prev.childProps.length === next.childProps.length && prev.childProps.every((value, index) => value === next.childProps[index]));
function genEmptyMeta() {
  return {
    errors: [],
    warnings: [],
    touched: false,
    validating: false,
    name: [],
    validated: false
  };
}
function InternalFormItem(props) {
  const {
    name,
    noStyle,
    className,
    dependencies,
    prefixCls: customizePrefixCls,
    shouldUpdate,
    rules,
    children,
    required,
    label,
    messageVariables,
    trigger = "onChange",
    validateTrigger,
    hidden,
    help,
    layout
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const {
    name: formName
  } = reactExports.useContext(FormContext);
  const mergedChildren = useChildren(children);
  const isRenderProps = typeof mergedChildren === "function";
  const notifyParentMetaChange = reactExports.useContext(NoStyleItemContext);
  const {
    validateTrigger: contextValidateTrigger
  } = reactExports.useContext(Context);
  const mergedValidateTrigger = validateTrigger !== void 0 ? validateTrigger : contextValidateTrigger;
  const hasName = !(name === void 0 || name === null);
  const prefixCls = getPrefixCls("form", customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$9(prefixCls, rootCls);
  devUseWarning();
  const listContext = reactExports.useContext(ListContext);
  const fieldKeyPathRef = reactExports.useRef(null);
  const [subFieldErrors, setSubFieldErrors] = useFrameState({});
  const [meta, setMeta] = useSafeState(() => genEmptyMeta());
  const onMetaChange = (nextMeta) => {
    const keyInfo = listContext === null || listContext === void 0 ? void 0 : listContext.getKey(nextMeta.name);
    setMeta(nextMeta.destroy ? genEmptyMeta() : nextMeta, true);
    if (noStyle && help !== false && notifyParentMetaChange) {
      let namePath = nextMeta.name;
      if (!nextMeta.destroy) {
        if (keyInfo !== void 0) {
          const [fieldKey, restPath] = keyInfo;
          namePath = [fieldKey].concat(_toConsumableArray(restPath));
          fieldKeyPathRef.current = namePath;
        }
      } else {
        namePath = fieldKeyPathRef.current || namePath;
      }
      notifyParentMetaChange(nextMeta, namePath);
    }
  };
  const onSubItemMetaChange = (subMeta, uniqueKeys) => {
    setSubFieldErrors((prevSubFieldErrors) => {
      const clone = Object.assign({}, prevSubFieldErrors);
      const mergedNamePath = [].concat(_toConsumableArray(subMeta.name.slice(0, -1)), _toConsumableArray(uniqueKeys));
      const mergedNameKey = mergedNamePath.join(NAME_SPLIT);
      if (subMeta.destroy) {
        delete clone[mergedNameKey];
      } else {
        clone[mergedNameKey] = subMeta;
      }
      return clone;
    });
  };
  const [mergedErrors, mergedWarnings] = reactExports.useMemo(() => {
    const errorList = _toConsumableArray(meta.errors);
    const warningList = _toConsumableArray(meta.warnings);
    Object.values(subFieldErrors).forEach((subFieldError) => {
      errorList.push.apply(errorList, _toConsumableArray(subFieldError.errors || []));
      warningList.push.apply(warningList, _toConsumableArray(subFieldError.warnings || []));
    });
    return [errorList, warningList];
  }, [subFieldErrors, meta.errors, meta.warnings]);
  const getItemRef = useItemRef();
  function renderLayout(baseChildren, fieldId, isRequired) {
    if (noStyle && !hidden) {
      return /* @__PURE__ */ reactExports.createElement(StatusProvider, {
        prefixCls,
        hasFeedback: props.hasFeedback,
        validateStatus: props.validateStatus,
        meta,
        errors: mergedErrors,
        warnings: mergedWarnings,
        noStyle: true,
        name
      }, baseChildren);
    }
    return /* @__PURE__ */ reactExports.createElement(ItemHolder, Object.assign({
      key: "row"
    }, props, {
      className: classNames(className, cssVarCls, rootCls, hashId),
      prefixCls,
      fieldId,
      isRequired,
      errors: mergedErrors,
      warnings: mergedWarnings,
      meta,
      onSubItemMetaChange,
      layout,
      name
    }), baseChildren);
  }
  if (!hasName && !isRenderProps && !dependencies) {
    return wrapCSSVar(renderLayout(mergedChildren));
  }
  let variables = {};
  if (typeof label === "string") {
    variables.label = label;
  } else if (name) {
    variables.label = String(name);
  }
  if (messageVariables) {
    variables = Object.assign(Object.assign({}, variables), messageVariables);
  }
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(WrapperField, Object.assign({}, props, {
    messageVariables: variables,
    trigger,
    validateTrigger: mergedValidateTrigger,
    onMetaChange
  }), (control, renderMeta, context) => {
    const mergedName = toArray(name).length && renderMeta ? renderMeta.name : [];
    const fieldId = getFieldId(mergedName, formName);
    const isRequired = required !== void 0 ? required : !!(rules === null || rules === void 0 ? void 0 : rules.some((rule) => {
      if (rule && typeof rule === "object" && rule.required && !rule.warningOnly) {
        return true;
      }
      if (typeof rule === "function") {
        const ruleEntity = rule(context);
        return (ruleEntity === null || ruleEntity === void 0 ? void 0 : ruleEntity.required) && !(ruleEntity === null || ruleEntity === void 0 ? void 0 : ruleEntity.warningOnly);
      }
      return false;
    }));
    const mergedControl = Object.assign({}, control);
    let childNode = null;
    if (Array.isArray(mergedChildren) && hasName) {
      childNode = mergedChildren;
    } else if (isRenderProps && (!(shouldUpdate || dependencies) || hasName)) ;
    else if (dependencies && !isRenderProps && !hasName) ;
    else if (/* @__PURE__ */ reactExports.isValidElement(mergedChildren)) {
      const childProps = Object.assign(Object.assign({}, mergedChildren.props), mergedControl);
      if (!childProps.id) {
        childProps.id = fieldId;
      }
      if (help || mergedErrors.length > 0 || mergedWarnings.length > 0 || props.extra) {
        const describedbyArr = [];
        if (help || mergedErrors.length > 0) {
          describedbyArr.push(`${fieldId}_help`);
        }
        if (props.extra) {
          describedbyArr.push(`${fieldId}_extra`);
        }
        childProps["aria-describedby"] = describedbyArr.join(" ");
      }
      if (mergedErrors.length > 0) {
        childProps["aria-invalid"] = "true";
      }
      if (isRequired) {
        childProps["aria-required"] = "true";
      }
      if (supportRef(mergedChildren)) {
        childProps.ref = getItemRef(mergedName, mergedChildren);
      }
      const triggers = new Set([].concat(_toConsumableArray(toArray(trigger)), _toConsumableArray(toArray(mergedValidateTrigger))));
      triggers.forEach((eventName) => {
        childProps[eventName] = (...args) => {
          var _a2, _c2;
          var _a, _b, _c;
          (_a = mergedControl[eventName]) === null || _a === void 0 ? void 0 : (_a2 = _a).call.apply(_a2, [mergedControl].concat(args));
          (_c = (_b = mergedChildren.props)[eventName]) === null || _c === void 0 ? void 0 : (_c2 = _c).call.apply(_c2, [_b].concat(args));
        };
      });
      const watchingChildProps = [childProps["aria-required"], childProps["aria-invalid"], childProps["aria-describedby"]];
      childNode = /* @__PURE__ */ reactExports.createElement(MemoInput, {
        control: mergedControl,
        update: mergedChildren,
        childProps: watchingChildProps
      }, cloneElement(mergedChildren, childProps));
    } else if (isRenderProps && (shouldUpdate || dependencies) && !hasName) {
      childNode = mergedChildren(context);
    } else {
      childNode = mergedChildren;
    }
    return renderLayout(childNode, fieldId, isRequired);
  }));
}
const FormItem = InternalFormItem;
FormItem.useStatus = useFormItemStatus;
var __rest$j = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const FormList = (_a) => {
  var {
    prefixCls: customizePrefixCls,
    children
  } = _a, props = __rest$j(_a, ["prefixCls", "children"]);
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("form", customizePrefixCls);
  const contextValue = reactExports.useMemo(() => ({
    prefixCls,
    status: "error"
  }), [prefixCls]);
  return /* @__PURE__ */ reactExports.createElement(List, Object.assign({}, props), (fields, operation, meta) => /* @__PURE__ */ reactExports.createElement(FormItemPrefixContext.Provider, {
    value: contextValue
  }, children(fields.map((field) => Object.assign(Object.assign({}, field), {
    fieldKey: field.key
  })), operation, {
    errors: meta.errors,
    warnings: meta.warnings
  })));
};
function useFormInstance() {
  const {
    form
  } = reactExports.useContext(FormContext);
  return form;
}
const Form = Form$1;
Form.Item = FormItem;
Form.List = FormList;
Form.ErrorList = ErrorList;
Form.useForm = useForm;
Form.useFormInstance = useFormInstance;
Form.useWatch = useWatch;
Form.Provider = FormProvider;
Form.create = () => {
};
const Group = (props) => {
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className
  } = props;
  const prefixCls = getPrefixCls("input-group", customizePrefixCls);
  const inputPrefixCls = getPrefixCls("input");
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$g(inputPrefixCls);
  const cls = classNames(prefixCls, cssVarCls, {
    [`${prefixCls}-lg`]: props.size === "large",
    [`${prefixCls}-sm`]: props.size === "small",
    [`${prefixCls}-compact`]: props.compact,
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, hashId, className);
  const formItemContext = reactExports.useContext(FormItemInputContext);
  const groupFormItemContext = reactExports.useMemo(() => Object.assign(Object.assign({}, formItemContext), {
    isFormItemInput: false
  }), [formItemContext]);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("span", {
    className: cls,
    style: props.style,
    onMouseEnter: props.onMouseEnter,
    onMouseLeave: props.onMouseLeave,
    onFocus: props.onFocus,
    onBlur: props.onBlur
  }, /* @__PURE__ */ reactExports.createElement(FormItemInputContext.Provider, {
    value: groupFormItemContext
  }, props.children)));
};
const genOTPStyle = (token) => {
  const {
    componentCls,
    paddingXS
  } = token;
  return {
    [componentCls]: {
      display: "inline-flex",
      alignItems: "center",
      flexWrap: "nowrap",
      columnGap: paddingXS,
      [`${componentCls}-input-wrapper`]: {
        position: "relative",
        [`${componentCls}-mask-icon`]: {
          position: "absolute",
          zIndex: "1",
          top: "50%",
          right: "50%",
          transform: "translate(50%, -50%)",
          pointerEvents: "none"
        },
        [`${componentCls}-mask-input`]: {
          color: "transparent",
          caretColor: "var(--ant-color-text)"
        },
        [`${componentCls}-mask-input[type=number]::-webkit-inner-spin-button`]: {
          "-webkit-appearance": "none",
          margin: 0
        },
        [`${componentCls}-mask-input[type=number]`]: {
          "-moz-appearance": "textfield"
        }
      },
      "&-rtl": {
        direction: "rtl"
      },
      [`${componentCls}-input`]: {
        textAlign: "center",
        paddingInline: token.paddingXXS
      },
      // ================= Size =================
      [`&${componentCls}-sm ${componentCls}-input`]: {
        paddingInline: token.calc(token.paddingXXS).div(2).equal()
      },
      [`&${componentCls}-lg ${componentCls}-input`]: {
        paddingInline: token.paddingXS
      }
    }
  };
};
const useStyle$8 = genStyleHooks(["Input", "OTP"], (token) => {
  const inputToken = merge$1(token, initInputToken(token));
  return [genOTPStyle(inputToken)];
}, initComponentToken$1);
var __rest$i = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const OTPInput = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    className,
    value,
    onChange,
    onActiveChange,
    index,
    mask
  } = props, restProps = __rest$i(props, ["className", "value", "onChange", "onActiveChange", "index", "mask"]);
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("otp");
  const maskValue = typeof mask === "string" ? mask : value;
  const inputRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => inputRef.current);
  const onInternalChange = (e2) => {
    onChange(index, e2.target.value);
  };
  const syncSelection = () => {
    wrapperRaf(() => {
      var _a;
      const inputEle = (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.input;
      if (document.activeElement === inputEle && inputEle) {
        inputEle.select();
      }
    });
  };
  const onInternalKeyDown = (event) => {
    const {
      key,
      ctrlKey,
      metaKey
    } = event;
    if (key === "ArrowLeft") {
      onActiveChange(index - 1);
    } else if (key === "ArrowRight") {
      onActiveChange(index + 1);
    } else if (key === "z" && (ctrlKey || metaKey)) {
      event.preventDefault();
    }
    syncSelection();
  };
  const onInternalKeyUp = (e2) => {
    if (e2.key === "Backspace" && !value) {
      onActiveChange(index - 1);
    }
    syncSelection();
  };
  return /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-input-wrapper`,
    role: "presentation"
  }, mask && value !== "" && value !== void 0 && /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-mask-icon`,
    "aria-hidden": "true"
  }, maskValue), /* @__PURE__ */ reactExports.createElement(Input$1, Object.assign({
    "aria-label": `OTP Input ${index + 1}`,
    type: mask === true ? "password" : "text"
  }, restProps, {
    ref: inputRef,
    value,
    onInput: onInternalChange,
    onFocus: syncSelection,
    onKeyDown: onInternalKeyDown,
    onKeyUp: onInternalKeyUp,
    onMouseDown: syncSelection,
    onMouseUp: syncSelection,
    className: classNames(className, {
      [`${prefixCls}-mask-input`]: mask
    })
  })));
});
var __rest$h = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function strToArr(str) {
  return (str || "").split("");
}
const Separator = (props) => {
  const {
    index,
    prefixCls,
    separator
  } = props;
  const separatorNode = typeof separator === "function" ? separator(index) : separator;
  if (!separatorNode) {
    return null;
  }
  return /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-separator`
  }, separatorNode);
};
const OTP = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    length = 6,
    size: customSize,
    defaultValue,
    value,
    onChange,
    formatter,
    separator,
    variant,
    disabled,
    status: customStatus,
    autoFocus,
    mask,
    type,
    onInput,
    inputMode
  } = props, restProps = __rest$h(props, ["prefixCls", "length", "size", "defaultValue", "value", "onChange", "formatter", "separator", "variant", "disabled", "status", "autoFocus", "mask", "type", "onInput", "inputMode"]);
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const prefixCls = getPrefixCls("otp", customizePrefixCls);
  const domAttrs = pickAttrs(restProps, {
    aria: true,
    data: true,
    attr: true
  });
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$8(prefixCls);
  const mergedSize = useSize((ctx) => customSize !== null && customSize !== void 0 ? customSize : ctx);
  const formContext = reactExports.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(formContext.status, customStatus);
  const proxyFormContext = reactExports.useMemo(() => Object.assign(Object.assign({}, formContext), {
    status: mergedStatus,
    hasFeedback: false,
    feedbackIcon: null
  }), [formContext, mergedStatus]);
  const containerRef = reactExports.useRef(null);
  const refs = reactExports.useRef({});
  reactExports.useImperativeHandle(ref, () => ({
    focus: () => {
      var _a;
      (_a = refs.current[0]) === null || _a === void 0 ? void 0 : _a.focus();
    },
    blur: () => {
      var _a;
      for (let i = 0; i < length; i += 1) {
        (_a = refs.current[i]) === null || _a === void 0 ? void 0 : _a.blur();
      }
    },
    nativeElement: containerRef.current
  }));
  const internalFormatter = (txt) => formatter ? formatter(txt) : txt;
  const [valueCells, setValueCells] = reactExports.useState(() => strToArr(internalFormatter(defaultValue || "")));
  reactExports.useEffect(() => {
    if (value !== void 0) {
      setValueCells(strToArr(value));
    }
  }, [value]);
  const triggerValueCellsChange = useEvent((nextValueCells) => {
    setValueCells(nextValueCells);
    if (onInput) {
      onInput(nextValueCells);
    }
    if (onChange && nextValueCells.length === length && nextValueCells.every((c) => c) && nextValueCells.some((c, index) => valueCells[index] !== c)) {
      onChange(nextValueCells.join(""));
    }
  });
  const patchValue = useEvent((index, txt) => {
    let nextCells = _toConsumableArray(valueCells);
    for (let i = 0; i < index; i += 1) {
      if (!nextCells[i]) {
        nextCells[i] = "";
      }
    }
    if (txt.length <= 1) {
      nextCells[index] = txt;
    } else {
      nextCells = nextCells.slice(0, index).concat(strToArr(txt));
    }
    nextCells = nextCells.slice(0, length);
    for (let i = nextCells.length - 1; i >= 0; i -= 1) {
      if (nextCells[i]) {
        break;
      }
      nextCells.pop();
    }
    const formattedValue = internalFormatter(nextCells.map((c) => c || " ").join(""));
    nextCells = strToArr(formattedValue).map((c, i) => {
      if (c === " " && !nextCells[i]) {
        return nextCells[i];
      }
      return c;
    });
    return nextCells;
  });
  const onInputChange = (index, txt) => {
    var _a;
    const nextCells = patchValue(index, txt);
    const nextIndex = Math.min(index + txt.length, length - 1);
    if (nextIndex !== index && nextCells[index] !== void 0) {
      (_a = refs.current[nextIndex]) === null || _a === void 0 ? void 0 : _a.focus();
    }
    triggerValueCellsChange(nextCells);
  };
  const onInputActiveChange = (nextIndex) => {
    var _a;
    (_a = refs.current[nextIndex]) === null || _a === void 0 ? void 0 : _a.focus();
  };
  const inputSharedProps = {
    variant,
    disabled,
    status: mergedStatus,
    mask,
    type,
    inputMode
  };
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({}, domAttrs, {
    ref: containerRef,
    className: classNames(prefixCls, {
      [`${prefixCls}-sm`]: mergedSize === "small",
      [`${prefixCls}-lg`]: mergedSize === "large",
      [`${prefixCls}-rtl`]: direction === "rtl"
    }, cssVarCls, hashId),
    role: "group"
  }), /* @__PURE__ */ reactExports.createElement(FormItemInputContext.Provider, {
    value: proxyFormContext
  }, Array.from({
    length
  }).map((_, index) => {
    const key = `otp-${index}`;
    const singleValue = valueCells[index] || "";
    return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, {
      key
    }, /* @__PURE__ */ reactExports.createElement(OTPInput, Object.assign({
      ref: (inputEle) => {
        refs.current[index] = inputEle;
      },
      index,
      size: mergedSize,
      htmlSize: 1,
      className: `${prefixCls}-input`,
      onChange: onInputChange,
      value: singleValue,
      onActiveChange: onInputActiveChange,
      autoFocus: index === 0 && autoFocus
    }, inputSharedProps)), index < length - 1 && /* @__PURE__ */ reactExports.createElement(Separator, {
      separator,
      index,
      prefixCls
    }));
  }))));
});
var __rest$g = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const defaultIconRender = (visible) => visible ? /* @__PURE__ */ reactExports.createElement(RefIcon$i, null) : /* @__PURE__ */ reactExports.createElement(RefIcon$j, null);
const actionMap = {
  click: "onClick",
  hover: "onMouseOver"
};
const Password = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    disabled: customDisabled,
    action = "click",
    visibilityToggle = true,
    iconRender = defaultIconRender
  } = props;
  const disabled = reactExports.useContext(DisabledContext);
  const mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
  const visibilityControlled = typeof visibilityToggle === "object" && visibilityToggle.visible !== void 0;
  const [visible, setVisible] = reactExports.useState(() => visibilityControlled ? visibilityToggle.visible : false);
  const inputRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    if (visibilityControlled) {
      setVisible(visibilityToggle.visible);
    }
  }, [visibilityControlled, visibilityToggle]);
  const removePasswordTimeout = useRemovePasswordTimeout(inputRef);
  const onVisibleChange = () => {
    var _a;
    if (mergedDisabled) {
      return;
    }
    if (visible) {
      removePasswordTimeout();
    }
    const nextVisible = !visible;
    setVisible(nextVisible);
    if (typeof visibilityToggle === "object") {
      (_a = visibilityToggle.onVisibleChange) === null || _a === void 0 ? void 0 : _a.call(visibilityToggle, nextVisible);
    }
  };
  const getIcon2 = (prefixCls2) => {
    const iconTrigger = actionMap[action] || "";
    const icon = iconRender(visible);
    const iconProps = {
      [iconTrigger]: onVisibleChange,
      className: `${prefixCls2}-icon`,
      key: "passwordIcon",
      onMouseDown: (e2) => {
        e2.preventDefault();
      },
      onMouseUp: (e2) => {
        e2.preventDefault();
      }
    };
    return /* @__PURE__ */ reactExports.cloneElement(/* @__PURE__ */ reactExports.isValidElement(icon) ? icon : /* @__PURE__ */ reactExports.createElement("span", null, icon), iconProps);
  };
  const {
    className,
    prefixCls: customizePrefixCls,
    inputPrefixCls: customizeInputPrefixCls,
    size
  } = props, restProps = __rest$g(props, ["className", "prefixCls", "inputPrefixCls", "size"]);
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const inputPrefixCls = getPrefixCls("input", customizeInputPrefixCls);
  const prefixCls = getPrefixCls("input-password", customizePrefixCls);
  const suffixIcon = visibilityToggle && getIcon2(prefixCls);
  const inputClassName = classNames(prefixCls, className, {
    [`${prefixCls}-${size}`]: !!size
  });
  const omittedProps = Object.assign(Object.assign({}, omit(restProps, ["suffix", "iconRender", "visibilityToggle"])), {
    type: visible ? "text" : "password",
    className: inputClassName,
    prefixCls: inputPrefixCls,
    suffix: suffixIcon
  });
  if (size) {
    omittedProps.size = size;
  }
  return /* @__PURE__ */ reactExports.createElement(Input$1, Object.assign({
    ref: composeRef(ref, inputRef)
  }, omittedProps));
});
var __rest$f = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Search = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    inputPrefixCls: customizeInputPrefixCls,
    className,
    size: customizeSize,
    suffix,
    enterButton = false,
    addonAfter,
    loading,
    disabled,
    onSearch: customOnSearch,
    onChange: customOnChange,
    onCompositionStart,
    onCompositionEnd,
    variant,
    onPressEnter: customOnPressEnter
  } = props, restProps = __rest$f(props, ["prefixCls", "inputPrefixCls", "className", "size", "suffix", "enterButton", "addonAfter", "loading", "disabled", "onSearch", "onChange", "onCompositionStart", "onCompositionEnd", "variant", "onPressEnter"]);
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const composedRef = reactExports.useRef(false);
  const prefixCls = getPrefixCls("input-search", customizePrefixCls);
  const inputPrefixCls = getPrefixCls("input", customizeInputPrefixCls);
  const {
    compactSize
  } = useCompactItemContext(prefixCls, direction);
  const size = useSize((ctx) => {
    var _a;
    return (_a = customizeSize !== null && customizeSize !== void 0 ? customizeSize : compactSize) !== null && _a !== void 0 ? _a : ctx;
  });
  const inputRef = reactExports.useRef(null);
  const onChange = (e2) => {
    if ((e2 === null || e2 === void 0 ? void 0 : e2.target) && e2.type === "click" && customOnSearch) {
      customOnSearch(e2.target.value, e2, {
        source: "clear"
      });
    }
    customOnChange === null || customOnChange === void 0 ? void 0 : customOnChange(e2);
  };
  const onMouseDown = (e2) => {
    var _a;
    if (document.activeElement === ((_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.input)) {
      e2.preventDefault();
    }
  };
  const onSearch = (e2) => {
    var _a, _b;
    if (customOnSearch) {
      customOnSearch((_b = (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.input) === null || _b === void 0 ? void 0 : _b.value, e2, {
        source: "input"
      });
    }
  };
  const onPressEnter = (e2) => {
    if (composedRef.current || loading) {
      return;
    }
    customOnPressEnter === null || customOnPressEnter === void 0 ? void 0 : customOnPressEnter(e2);
    onSearch(e2);
  };
  const searchIcon = typeof enterButton === "boolean" ? /* @__PURE__ */ reactExports.createElement(RefIcon$8, null) : null;
  const btnClassName = `${prefixCls}-button`;
  let button;
  const enterButtonAsElement = enterButton || {};
  const isAntdButton = enterButtonAsElement.type && enterButtonAsElement.type.__ANT_BUTTON === true;
  if (isAntdButton || enterButtonAsElement.type === "button") {
    button = cloneElement(enterButtonAsElement, Object.assign({
      onMouseDown,
      onClick: (e2) => {
        var _a, _b;
        (_b = (_a = enterButtonAsElement === null || enterButtonAsElement === void 0 ? void 0 : enterButtonAsElement.props) === null || _a === void 0 ? void 0 : _a.onClick) === null || _b === void 0 ? void 0 : _b.call(_a, e2);
        onSearch(e2);
      },
      key: "enterButton"
    }, isAntdButton ? {
      className: btnClassName,
      size
    } : {}));
  } else {
    button = /* @__PURE__ */ reactExports.createElement(Button$1, {
      className: btnClassName,
      color: enterButton ? "primary" : "default",
      size,
      disabled,
      key: "enterButton",
      onMouseDown,
      onClick: onSearch,
      loading,
      icon: searchIcon,
      variant: variant === "borderless" || variant === "filled" || variant === "underlined" ? "text" : enterButton ? "solid" : void 0
    }, enterButton);
  }
  if (addonAfter) {
    button = [button, cloneElement(addonAfter, {
      key: "addonAfter"
    })];
  }
  const cls = classNames(prefixCls, {
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-${size}`]: !!size,
    [`${prefixCls}-with-button`]: !!enterButton
  }, className);
  const handleOnCompositionStart = (e2) => {
    composedRef.current = true;
    onCompositionStart === null || onCompositionStart === void 0 ? void 0 : onCompositionStart(e2);
  };
  const handleOnCompositionEnd = (e2) => {
    composedRef.current = false;
    onCompositionEnd === null || onCompositionEnd === void 0 ? void 0 : onCompositionEnd(e2);
  };
  const inputProps = Object.assign(Object.assign({}, restProps), {
    className: cls,
    prefixCls: inputPrefixCls,
    type: "search",
    size,
    variant,
    onPressEnter,
    onCompositionStart: handleOnCompositionStart,
    onCompositionEnd: handleOnCompositionEnd,
    addonAfter: button,
    suffix,
    onChange,
    disabled
  });
  return /* @__PURE__ */ reactExports.createElement(Input$1, Object.assign({
    ref: composeRef(inputRef, ref)
  }, inputProps));
});
const genTextAreaStyle = (token) => {
  const {
    componentCls,
    paddingLG
  } = token;
  const textareaPrefixCls = `${componentCls}-textarea`;
  return {
    // Raw Textarea
    [`textarea${componentCls}`]: {
      maxWidth: "100%",
      // prevent textarea resize from coming out of its container
      height: "auto",
      minHeight: token.controlHeight,
      lineHeight: token.lineHeight,
      verticalAlign: "bottom",
      transition: `all ${token.motionDurationSlow}`,
      resize: "vertical",
      [`&${componentCls}-mouse-active`]: {
        transition: `all ${token.motionDurationSlow}, height 0s, width 0s`
      }
    },
    // Wrapper for resize
    [`${componentCls}-textarea-affix-wrapper-resize-dirty`]: {
      width: "auto"
    },
    [textareaPrefixCls]: {
      position: "relative",
      "&-show-count": {
        [`${componentCls}-data-count`]: {
          position: "absolute",
          bottom: token.calc(token.fontSize).mul(token.lineHeight).mul(-1).equal(),
          insetInlineEnd: 0,
          color: token.colorTextDescription,
          whiteSpace: "nowrap",
          pointerEvents: "none"
        }
      },
      [`
        &-allow-clear > ${componentCls},
        &-affix-wrapper${textareaPrefixCls}-has-feedback ${componentCls}
      `]: {
        paddingInlineEnd: paddingLG
      },
      [`&-affix-wrapper${componentCls}-affix-wrapper`]: {
        padding: 0,
        [`> textarea${componentCls}`]: {
          fontSize: "inherit",
          border: "none",
          outline: "none",
          background: "transparent",
          minHeight: token.calc(token.controlHeight).sub(token.calc(token.lineWidth).mul(2)).equal(),
          "&:focus": {
            boxShadow: "none !important"
          }
        },
        [`${componentCls}-suffix`]: {
          margin: 0,
          "> *:not(:last-child)": {
            marginInline: 0
          },
          // Clear Icon
          [`${componentCls}-clear-icon`]: {
            position: "absolute",
            insetInlineEnd: token.paddingInline,
            insetBlockStart: token.paddingXS
          },
          // Feedback Icon
          [`${textareaPrefixCls}-suffix`]: {
            position: "absolute",
            top: 0,
            insetInlineEnd: token.paddingInline,
            bottom: 0,
            zIndex: 1,
            display: "inline-flex",
            alignItems: "center",
            margin: "auto",
            pointerEvents: "none"
          }
        }
      },
      [`&-affix-wrapper${componentCls}-affix-wrapper-rtl`]: {
        [`${componentCls}-suffix`]: {
          [`${componentCls}-data-count`]: {
            direction: "ltr",
            insetInlineStart: 0
          }
        }
      },
      [`&-affix-wrapper${componentCls}-affix-wrapper-sm`]: {
        [`${componentCls}-suffix`]: {
          [`${componentCls}-clear-icon`]: {
            insetInlineEnd: token.paddingInlineSM
          }
        }
      }
    }
  };
};
const useStyle$7 = genStyleHooks(["Input", "TextArea"], (token) => {
  const inputToken = merge$1(token, initInputToken(token));
  return [genTextAreaStyle(inputToken)];
}, initComponentToken$1, {
  resetFont: false
});
var __rest$e = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const TextArea = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  var _a;
  const {
    prefixCls: customizePrefixCls,
    bordered = true,
    size: customizeSize,
    disabled: customDisabled,
    status: customStatus,
    allowClear,
    classNames: classes,
    rootClassName,
    className,
    style,
    styles,
    variant: customVariant,
    showCount,
    onMouseDown,
    onResize
  } = props, rest = __rest$e(props, ["prefixCls", "bordered", "size", "disabled", "status", "allowClear", "classNames", "rootClassName", "className", "style", "styles", "variant", "showCount", "onMouseDown", "onResize"]);
  const {
    getPrefixCls,
    direction,
    allowClear: contextAllowClear,
    autoComplete: contextAutoComplete,
    className: contextClassName,
    style: contextStyle,
    classNames: contextClassNames,
    styles: contextStyles
  } = useComponentConfig("textArea");
  const disabled = reactExports.useContext(DisabledContext);
  const mergedDisabled = customDisabled !== null && customDisabled !== void 0 ? customDisabled : disabled;
  const {
    status: contextStatus,
    hasFeedback,
    feedbackIcon
  } = reactExports.useContext(FormItemInputContext);
  const mergedStatus = getMergedStatus(contextStatus, customStatus);
  const innerRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => {
    var _a2;
    return {
      resizableTextArea: (_a2 = innerRef.current) === null || _a2 === void 0 ? void 0 : _a2.resizableTextArea,
      focus: (option) => {
        var _a3, _b;
        triggerFocus((_b = (_a3 = innerRef.current) === null || _a3 === void 0 ? void 0 : _a3.resizableTextArea) === null || _b === void 0 ? void 0 : _b.textArea, option);
      },
      blur: () => {
        var _a3;
        return (_a3 = innerRef.current) === null || _a3 === void 0 ? void 0 : _a3.blur();
      }
    };
  });
  const prefixCls = getPrefixCls("input", customizePrefixCls);
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapSharedCSSVar, hashId, cssVarCls] = useSharedStyle(prefixCls, rootClassName);
  const [wrapCSSVar] = useStyle$7(prefixCls, rootCls);
  const {
    compactSize,
    compactItemClassnames
  } = useCompactItemContext(prefixCls, direction);
  const mergedSize = useSize((ctx) => {
    var _a2;
    return (_a2 = customizeSize !== null && customizeSize !== void 0 ? customizeSize : compactSize) !== null && _a2 !== void 0 ? _a2 : ctx;
  });
  const [variant, enableVariantCls] = useVariant("textArea", customVariant, bordered);
  const mergedAllowClear = getAllowClear(allowClear !== null && allowClear !== void 0 ? allowClear : contextAllowClear);
  const [isMouseDown, setIsMouseDown] = reactExports.useState(false);
  const [resizeDirty, setResizeDirty] = reactExports.useState(false);
  const onInternalMouseDown = (e2) => {
    setIsMouseDown(true);
    onMouseDown === null || onMouseDown === void 0 ? void 0 : onMouseDown(e2);
    const onMouseUp = () => {
      setIsMouseDown(false);
      document.removeEventListener("mouseup", onMouseUp);
    };
    document.addEventListener("mouseup", onMouseUp);
  };
  const onInternalResize = (size) => {
    var _a2, _b;
    onResize === null || onResize === void 0 ? void 0 : onResize(size);
    if (isMouseDown && typeof getComputedStyle === "function") {
      const ele = (_b = (_a2 = innerRef.current) === null || _a2 === void 0 ? void 0 : _a2.nativeElement) === null || _b === void 0 ? void 0 : _b.querySelector("textarea");
      if (ele && getComputedStyle(ele).resize === "both") {
        setResizeDirty(true);
      }
    }
  };
  return wrapSharedCSSVar(wrapCSSVar(/* @__PURE__ */ reactExports.createElement(TextArea$1, Object.assign({
    autoComplete: contextAutoComplete
  }, rest, {
    style: Object.assign(Object.assign({}, contextStyle), style),
    styles: Object.assign(Object.assign({}, contextStyles), styles),
    disabled: mergedDisabled,
    allowClear: mergedAllowClear,
    className: classNames(
      cssVarCls,
      rootCls,
      className,
      rootClassName,
      compactItemClassnames,
      contextClassName,
      // Only for wrapper
      resizeDirty && `${prefixCls}-textarea-affix-wrapper-resize-dirty`
    ),
    classNames: Object.assign(Object.assign(Object.assign({}, classes), contextClassNames), {
      textarea: classNames({
        [`${prefixCls}-sm`]: mergedSize === "small",
        [`${prefixCls}-lg`]: mergedSize === "large"
      }, hashId, classes === null || classes === void 0 ? void 0 : classes.textarea, contextClassNames.textarea, isMouseDown && `${prefixCls}-mouse-active`),
      variant: classNames({
        [`${prefixCls}-${variant}`]: enableVariantCls
      }, getStatusClassNames(prefixCls, mergedStatus)),
      affixWrapper: classNames(`${prefixCls}-textarea-affix-wrapper`, {
        [`${prefixCls}-affix-wrapper-rtl`]: direction === "rtl",
        [`${prefixCls}-affix-wrapper-sm`]: mergedSize === "small",
        [`${prefixCls}-affix-wrapper-lg`]: mergedSize === "large",
        [`${prefixCls}-textarea-show-count`]: showCount || ((_a = props.count) === null || _a === void 0 ? void 0 : _a.show)
      }, hashId)
    }),
    prefixCls,
    suffix: hasFeedback && /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-textarea-suffix`
    }, feedbackIcon),
    showCount,
    ref: innerRef,
    onResize: onInternalResize,
    onMouseDown: onInternalMouseDown
  }))));
});
const Input = Input$1;
Input.Group = Group;
Input.Search = Search;
Input.TextArea = TextArea;
Input.Password = Password;
Input.OTP = OTP;
const genPaginationDisabledStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-disabled`]: {
      "&, &:hover": {
        cursor: "not-allowed",
        [`${componentCls}-item-link`]: {
          color: token.colorTextDisabled,
          cursor: "not-allowed"
        }
      },
      "&:focus-visible": {
        cursor: "not-allowed",
        [`${componentCls}-item-link`]: {
          color: token.colorTextDisabled,
          cursor: "not-allowed"
        }
      }
    },
    [`&${componentCls}-disabled`]: {
      cursor: "not-allowed",
      [`${componentCls}-item`]: {
        cursor: "not-allowed",
        backgroundColor: "transparent",
        "&:hover, &:active": {
          backgroundColor: "transparent"
        },
        a: {
          color: token.colorTextDisabled,
          backgroundColor: "transparent",
          border: "none",
          cursor: "not-allowed"
        },
        "&-active": {
          borderColor: token.colorBorder,
          backgroundColor: token.itemActiveBgDisabled,
          "&:hover, &:active": {
            backgroundColor: token.itemActiveBgDisabled
          },
          a: {
            color: token.itemActiveColorDisabled
          }
        }
      },
      [`${componentCls}-item-link`]: {
        color: token.colorTextDisabled,
        cursor: "not-allowed",
        "&:hover, &:active": {
          backgroundColor: "transparent"
        },
        [`${componentCls}-simple&`]: {
          backgroundColor: "transparent",
          "&:hover, &:active": {
            backgroundColor: "transparent"
          }
        }
      },
      [`${componentCls}-simple-pager`]: {
        color: token.colorTextDisabled
      },
      [`${componentCls}-jump-prev, ${componentCls}-jump-next`]: {
        [`${componentCls}-item-link-icon`]: {
          opacity: 0
        },
        [`${componentCls}-item-ellipsis`]: {
          opacity: 1
        }
      }
    },
    [`&${componentCls}-simple`]: {
      [`${componentCls}-prev, ${componentCls}-next`]: {
        [`&${componentCls}-disabled ${componentCls}-item-link`]: {
          "&:hover, &:active": {
            backgroundColor: "transparent"
          }
        }
      }
    }
  };
};
const genPaginationMiniStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`&${componentCls}-mini ${componentCls}-total-text, &${componentCls}-mini ${componentCls}-simple-pager`]: {
      height: token.itemSizeSM,
      lineHeight: unit(token.itemSizeSM)
    },
    [`&${componentCls}-mini ${componentCls}-item`]: {
      minWidth: token.itemSizeSM,
      height: token.itemSizeSM,
      margin: 0,
      lineHeight: unit(token.calc(token.itemSizeSM).sub(2).equal())
    },
    [`&${componentCls}-mini ${componentCls}-prev, &${componentCls}-mini ${componentCls}-next`]: {
      minWidth: token.itemSizeSM,
      height: token.itemSizeSM,
      margin: 0,
      lineHeight: unit(token.itemSizeSM)
    },
    [`&${componentCls}-mini:not(${componentCls}-disabled)`]: {
      [`${componentCls}-prev, ${componentCls}-next`]: {
        [`&:hover ${componentCls}-item-link`]: {
          backgroundColor: token.colorBgTextHover
        },
        [`&:active ${componentCls}-item-link`]: {
          backgroundColor: token.colorBgTextActive
        },
        [`&${componentCls}-disabled:hover ${componentCls}-item-link`]: {
          backgroundColor: "transparent"
        }
      }
    },
    [`
    &${componentCls}-mini ${componentCls}-prev ${componentCls}-item-link,
    &${componentCls}-mini ${componentCls}-next ${componentCls}-item-link
    `]: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      "&::after": {
        height: token.itemSizeSM,
        lineHeight: unit(token.itemSizeSM)
      }
    },
    [`&${componentCls}-mini ${componentCls}-jump-prev, &${componentCls}-mini ${componentCls}-jump-next`]: {
      height: token.itemSizeSM,
      marginInlineEnd: 0,
      lineHeight: unit(token.itemSizeSM)
    },
    [`&${componentCls}-mini ${componentCls}-options`]: {
      marginInlineStart: token.paginationMiniOptionsMarginInlineStart,
      "&-size-changer": {
        top: token.miniOptionsSizeChangerTop
      },
      "&-quick-jumper": {
        height: token.itemSizeSM,
        lineHeight: unit(token.itemSizeSM),
        input: Object.assign(Object.assign({}, genInputSmallStyle(token)), {
          width: token.paginationMiniQuickJumperInputWidth,
          height: token.controlHeightSM
        })
      }
    }
  };
};
const genPaginationSimpleStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`
    &${componentCls}-simple ${componentCls}-prev,
    &${componentCls}-simple ${componentCls}-next
    `]: {
      height: token.itemSizeSM,
      lineHeight: unit(token.itemSizeSM),
      verticalAlign: "top",
      [`${componentCls}-item-link`]: {
        height: token.itemSizeSM,
        backgroundColor: "transparent",
        border: 0,
        "&:hover": {
          backgroundColor: token.colorBgTextHover
        },
        "&:active": {
          backgroundColor: token.colorBgTextActive
        },
        "&::after": {
          height: token.itemSizeSM,
          lineHeight: unit(token.itemSizeSM)
        }
      }
    },
    [`&${componentCls}-simple ${componentCls}-simple-pager`]: {
      display: "inline-block",
      height: token.itemSizeSM,
      marginInlineEnd: token.marginXS,
      input: {
        boxSizing: "border-box",
        height: "100%",
        padding: `0 ${unit(token.paginationItemPaddingInline)}`,
        textAlign: "center",
        backgroundColor: token.itemInputBg,
        border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        outline: "none",
        transition: `border-color ${token.motionDurationMid}`,
        color: "inherit",
        "&:hover": {
          borderColor: token.colorPrimary
        },
        "&:focus": {
          borderColor: token.colorPrimaryHover,
          boxShadow: `${unit(token.inputOutlineOffset)} 0 ${unit(token.controlOutlineWidth)} ${token.controlOutline}`
        },
        "&[disabled]": {
          color: token.colorTextDisabled,
          backgroundColor: token.colorBgContainerDisabled,
          borderColor: token.colorBorder,
          cursor: "not-allowed"
        }
      }
    }
  };
};
const genPaginationJumpStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-jump-prev, ${componentCls}-jump-next`]: {
      outline: 0,
      [`${componentCls}-item-container`]: {
        position: "relative",
        [`${componentCls}-item-link-icon`]: {
          color: token.colorPrimary,
          fontSize: token.fontSizeSM,
          opacity: 0,
          transition: `all ${token.motionDurationMid}`,
          "&-svg": {
            top: 0,
            insetInlineEnd: 0,
            bottom: 0,
            insetInlineStart: 0,
            margin: "auto"
          }
        },
        [`${componentCls}-item-ellipsis`]: {
          position: "absolute",
          top: 0,
          insetInlineEnd: 0,
          bottom: 0,
          insetInlineStart: 0,
          display: "block",
          margin: "auto",
          color: token.colorTextDisabled,
          letterSpacing: token.paginationEllipsisLetterSpacing,
          textAlign: "center",
          textIndent: token.paginationEllipsisTextIndent,
          opacity: 1,
          transition: `all ${token.motionDurationMid}`
        }
      },
      "&:hover": {
        [`${componentCls}-item-link-icon`]: {
          opacity: 1
        },
        [`${componentCls}-item-ellipsis`]: {
          opacity: 0
        }
      }
    },
    [`
    ${componentCls}-prev,
    ${componentCls}-jump-prev,
    ${componentCls}-jump-next
    `]: {
      marginInlineEnd: token.marginXS
    },
    [`
    ${componentCls}-prev,
    ${componentCls}-next,
    ${componentCls}-jump-prev,
    ${componentCls}-jump-next
    `]: {
      display: "inline-block",
      minWidth: token.itemSize,
      height: token.itemSize,
      color: token.colorText,
      fontFamily: token.fontFamily,
      lineHeight: unit(token.itemSize),
      textAlign: "center",
      verticalAlign: "middle",
      listStyle: "none",
      borderRadius: token.borderRadius,
      cursor: "pointer",
      transition: `all ${token.motionDurationMid}`
    },
    [`${componentCls}-prev, ${componentCls}-next`]: {
      outline: 0,
      button: {
        color: token.colorText,
        cursor: "pointer",
        userSelect: "none"
      },
      [`${componentCls}-item-link`]: {
        display: "block",
        width: "100%",
        height: "100%",
        padding: 0,
        fontSize: token.fontSizeSM,
        textAlign: "center",
        backgroundColor: "transparent",
        border: `${unit(token.lineWidth)} ${token.lineType} transparent`,
        borderRadius: token.borderRadius,
        outline: "none",
        transition: `all ${token.motionDurationMid}`
      },
      [`&:hover ${componentCls}-item-link`]: {
        backgroundColor: token.colorBgTextHover
      },
      [`&:active ${componentCls}-item-link`]: {
        backgroundColor: token.colorBgTextActive
      },
      [`&${componentCls}-disabled:hover`]: {
        [`${componentCls}-item-link`]: {
          backgroundColor: "transparent"
        }
      }
    },
    [`${componentCls}-slash`]: {
      marginInlineEnd: token.paginationSlashMarginInlineEnd,
      marginInlineStart: token.paginationSlashMarginInlineStart
    },
    [`${componentCls}-options`]: {
      display: "inline-block",
      marginInlineStart: token.margin,
      verticalAlign: "middle",
      "&-size-changer": {
        display: "inline-block",
        width: "auto"
      },
      "&-quick-jumper": {
        display: "inline-block",
        height: token.controlHeight,
        marginInlineStart: token.marginXS,
        lineHeight: unit(token.controlHeight),
        verticalAlign: "top",
        input: Object.assign(Object.assign(Object.assign({}, genBasicInputStyle(token)), genBaseOutlinedStyle(token, {
          borderColor: token.colorBorder,
          hoverBorderColor: token.colorPrimaryHover,
          activeBorderColor: token.colorPrimary,
          activeShadow: token.activeShadow
        })), {
          "&[disabled]": Object.assign({}, genDisabledStyle(token)),
          width: token.calc(token.controlHeightLG).mul(1.25).equal(),
          height: token.controlHeight,
          boxSizing: "border-box",
          margin: 0,
          marginInlineStart: token.marginXS,
          marginInlineEnd: token.marginXS
        })
      }
    }
  };
};
const genPaginationItemStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-item`]: {
      display: "inline-block",
      minWidth: token.itemSize,
      height: token.itemSize,
      marginInlineEnd: token.marginXS,
      fontFamily: token.fontFamily,
      lineHeight: unit(token.calc(token.itemSize).sub(2).equal()),
      textAlign: "center",
      verticalAlign: "middle",
      listStyle: "none",
      backgroundColor: token.itemBg,
      border: `${unit(token.lineWidth)} ${token.lineType} transparent`,
      borderRadius: token.borderRadius,
      outline: 0,
      cursor: "pointer",
      userSelect: "none",
      a: {
        display: "block",
        padding: `0 ${unit(token.paginationItemPaddingInline)}`,
        color: token.colorText,
        "&:hover": {
          textDecoration: "none"
        }
      },
      [`&:not(${componentCls}-item-active)`]: {
        "&:hover": {
          transition: `all ${token.motionDurationMid}`,
          backgroundColor: token.colorBgTextHover
        },
        "&:active": {
          backgroundColor: token.colorBgTextActive
        }
      },
      "&-active": {
        fontWeight: token.fontWeightStrong,
        backgroundColor: token.itemActiveBg,
        borderColor: token.colorPrimary,
        a: {
          color: token.colorPrimary
        },
        "&:hover": {
          borderColor: token.colorPrimaryHover
        },
        "&:hover a": {
          color: token.colorPrimaryHover
        }
      }
    }
  };
};
const genPaginationStyle$1 = (token) => {
  const {
    componentCls
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, resetComponent(token)), {
      display: "flex",
      "&-start": {
        justifyContent: "start"
      },
      "&-center": {
        justifyContent: "center"
      },
      "&-end": {
        justifyContent: "end"
      },
      "ul, ol": {
        margin: 0,
        padding: 0,
        listStyle: "none"
      },
      "&::after": {
        display: "block",
        clear: "both",
        height: 0,
        overflow: "hidden",
        visibility: "hidden",
        content: '""'
      },
      [`${componentCls}-total-text`]: {
        display: "inline-block",
        height: token.itemSize,
        marginInlineEnd: token.marginXS,
        lineHeight: unit(token.calc(token.itemSize).sub(2).equal()),
        verticalAlign: "middle"
      }
    }), genPaginationItemStyle(token)), genPaginationJumpStyle(token)), genPaginationSimpleStyle(token)), genPaginationMiniStyle(token)), genPaginationDisabledStyle(token)), {
      // media query style
      [`@media only screen and (max-width: ${token.screenLG}px)`]: {
        [`${componentCls}-item`]: {
          "&-after-jump-prev, &-before-jump-next": {
            display: "none"
          }
        }
      },
      [`@media only screen and (max-width: ${token.screenSM}px)`]: {
        [`${componentCls}-options`]: {
          display: "none"
        }
      }
    }),
    // rtl style
    [`&${token.componentCls}-rtl`]: {
      direction: "rtl"
    }
  };
};
const genPaginationFocusStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}:not(${componentCls}-disabled)`]: {
      [`${componentCls}-item`]: Object.assign({}, genFocusStyle(token)),
      [`${componentCls}-jump-prev, ${componentCls}-jump-next`]: {
        "&:focus-visible": Object.assign({
          [`${componentCls}-item-link-icon`]: {
            opacity: 1
          },
          [`${componentCls}-item-ellipsis`]: {
            opacity: 0
          }
        }, genFocusOutline(token))
      },
      [`${componentCls}-prev, ${componentCls}-next`]: {
        [`&:focus-visible ${componentCls}-item-link`]: Object.assign({}, genFocusOutline(token))
      }
    }
  };
};
const prepareComponentToken$6 = (token) => Object.assign({
  itemBg: token.colorBgContainer,
  itemSize: token.controlHeight,
  itemSizeSM: token.controlHeightSM,
  itemActiveBg: token.colorBgContainer,
  itemLinkBg: token.colorBgContainer,
  itemActiveColorDisabled: token.colorTextDisabled,
  itemActiveBgDisabled: token.controlItemBgActiveDisabled,
  itemInputBg: token.colorBgContainer,
  miniOptionsSizeChangerTop: 0
}, initComponentToken$1(token));
const prepareToken$1 = (token) => merge$1(token, {
  inputOutlineOffset: 0,
  paginationMiniOptionsMarginInlineStart: token.calc(token.marginXXS).div(2).equal(),
  paginationMiniQuickJumperInputWidth: token.calc(token.controlHeightLG).mul(1.1).equal(),
  paginationItemPaddingInline: token.calc(token.marginXXS).mul(1.5).equal(),
  paginationEllipsisLetterSpacing: token.calc(token.marginXXS).div(2).equal(),
  paginationSlashMarginInlineStart: token.marginSM,
  paginationSlashMarginInlineEnd: token.marginSM,
  paginationEllipsisTextIndent: "0.13em"
  // magic for ui experience
}, initInputToken(token));
const useStyle$6 = genStyleHooks("Pagination", (token) => {
  const paginationToken = prepareToken$1(token);
  return [genPaginationStyle$1(paginationToken), genPaginationFocusStyle(paginationToken)];
}, prepareComponentToken$6);
const genBorderedStyle$1 = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}${componentCls}-bordered${componentCls}-disabled:not(${componentCls}-mini)`]: {
      "&, &:hover": {
        [`${componentCls}-item-link`]: {
          borderColor: token.colorBorder
        }
      },
      "&:focus-visible": {
        [`${componentCls}-item-link`]: {
          borderColor: token.colorBorder
        }
      },
      [`${componentCls}-item, ${componentCls}-item-link`]: {
        backgroundColor: token.colorBgContainerDisabled,
        borderColor: token.colorBorder,
        [`&:hover:not(${componentCls}-item-active)`]: {
          backgroundColor: token.colorBgContainerDisabled,
          borderColor: token.colorBorder,
          a: {
            color: token.colorTextDisabled
          }
        },
        [`&${componentCls}-item-active`]: {
          backgroundColor: token.itemActiveBgDisabled
        }
      },
      [`${componentCls}-prev, ${componentCls}-next`]: {
        "&:hover button": {
          backgroundColor: token.colorBgContainerDisabled,
          borderColor: token.colorBorder,
          color: token.colorTextDisabled
        },
        [`${componentCls}-item-link`]: {
          backgroundColor: token.colorBgContainerDisabled,
          borderColor: token.colorBorder
        }
      }
    },
    [`${componentCls}${componentCls}-bordered:not(${componentCls}-mini)`]: {
      [`${componentCls}-prev, ${componentCls}-next`]: {
        "&:hover button": {
          borderColor: token.colorPrimaryHover,
          backgroundColor: token.itemBg
        },
        [`${componentCls}-item-link`]: {
          backgroundColor: token.itemLinkBg,
          borderColor: token.colorBorder
        },
        [`&:hover ${componentCls}-item-link`]: {
          borderColor: token.colorPrimary,
          backgroundColor: token.itemBg,
          color: token.colorPrimary
        },
        [`&${componentCls}-disabled`]: {
          [`${componentCls}-item-link`]: {
            borderColor: token.colorBorder,
            color: token.colorTextDisabled
          }
        }
      },
      [`${componentCls}-item`]: {
        backgroundColor: token.itemBg,
        border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
        [`&:hover:not(${componentCls}-item-active)`]: {
          borderColor: token.colorPrimary,
          backgroundColor: token.itemBg,
          a: {
            color: token.colorPrimary
          }
        },
        "&-active": {
          borderColor: token.colorPrimary
        }
      }
    }
  };
};
const BorderedStyle = genSubStyleComponent(["Pagination", "bordered"], (token) => {
  const paginationToken = prepareToken$1(token);
  return [genBorderedStyle$1(paginationToken)];
}, prepareComponentToken$6);
function useShowSizeChanger(showSizeChanger) {
  return reactExports.useMemo(() => {
    if (typeof showSizeChanger === "boolean") {
      return [showSizeChanger, {}];
    }
    if (showSizeChanger && typeof showSizeChanger === "object") {
      return [true, showSizeChanger];
    }
    return [void 0, void 0];
  }, [showSizeChanger]);
}
var __rest$d = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Pagination = (props) => {
  const {
    align,
    prefixCls: customizePrefixCls,
    selectPrefixCls: customizeSelectPrefixCls,
    className,
    rootClassName,
    style,
    size: customizeSize,
    locale: customLocale,
    responsive,
    showSizeChanger,
    selectComponentClass,
    pageSizeOptions
  } = props, restProps = __rest$d(props, ["align", "prefixCls", "selectPrefixCls", "className", "rootClassName", "style", "size", "locale", "responsive", "showSizeChanger", "selectComponentClass", "pageSizeOptions"]);
  const {
    xs
  } = useBreakpoint(responsive);
  const [, token] = useToken();
  const {
    getPrefixCls,
    direction,
    showSizeChanger: contextShowSizeChangerConfig,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig("pagination");
  const prefixCls = getPrefixCls("pagination", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$6(prefixCls);
  const mergedSize = useSize(customizeSize);
  const isSmall = mergedSize === "small" || !!(xs && !mergedSize && responsive);
  const [contextLocale] = useLocale("Pagination", locale$3);
  const locale2 = Object.assign(Object.assign({}, contextLocale), customLocale);
  const [propShowSizeChanger, propSizeChangerSelectProps] = useShowSizeChanger(showSizeChanger);
  const [contextShowSizeChanger, contextSizeChangerSelectProps] = useShowSizeChanger(contextShowSizeChangerConfig);
  const mergedShowSizeChanger = propShowSizeChanger !== null && propShowSizeChanger !== void 0 ? propShowSizeChanger : contextShowSizeChanger;
  const mergedShowSizeChangerSelectProps = propSizeChangerSelectProps !== null && propSizeChangerSelectProps !== void 0 ? propSizeChangerSelectProps : contextSizeChangerSelectProps;
  const SizeChanger = selectComponentClass || Select;
  const mergedPageSizeOptions = reactExports.useMemo(() => {
    return pageSizeOptions ? pageSizeOptions.map((option) => Number(option)) : void 0;
  }, [pageSizeOptions]);
  const sizeChangerRender = (info) => {
    var _a;
    const {
      disabled,
      size: pageSize,
      onSizeChange,
      "aria-label": ariaLabel,
      className: sizeChangerClassName,
      options
    } = info;
    const {
      className: propSizeChangerClassName,
      onChange: propSizeChangerOnChange
    } = mergedShowSizeChangerSelectProps || {};
    const selectedValue = (_a = options.find((option) => String(option.value) === String(pageSize))) === null || _a === void 0 ? void 0 : _a.value;
    return /* @__PURE__ */ reactExports.createElement(SizeChanger, Object.assign({
      disabled,
      showSearch: true,
      popupMatchSelectWidth: false,
      getPopupContainer: (triggerNode) => triggerNode.parentNode,
      "aria-label": ariaLabel,
      options
    }, mergedShowSizeChangerSelectProps, {
      value: selectedValue,
      onChange: (nextSize, option) => {
        onSizeChange === null || onSizeChange === void 0 ? void 0 : onSizeChange(nextSize);
        propSizeChangerOnChange === null || propSizeChangerOnChange === void 0 ? void 0 : propSizeChangerOnChange(nextSize, option);
      },
      size: isSmall ? "small" : "middle",
      className: classNames(sizeChangerClassName, propSizeChangerClassName)
    }));
  };
  const iconsProps = reactExports.useMemo(() => {
    const ellipsis = /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-item-ellipsis`
    }, "•••");
    const prevIcon = /* @__PURE__ */ reactExports.createElement("button", {
      className: `${prefixCls}-item-link`,
      type: "button",
      tabIndex: -1
    }, direction === "rtl" ? /* @__PURE__ */ reactExports.createElement(RefIcon$6, null) : /* @__PURE__ */ reactExports.createElement(RefIcon$b, null));
    const nextIcon = /* @__PURE__ */ reactExports.createElement("button", {
      className: `${prefixCls}-item-link`,
      type: "button",
      tabIndex: -1
    }, direction === "rtl" ? /* @__PURE__ */ reactExports.createElement(RefIcon$b, null) : /* @__PURE__ */ reactExports.createElement(RefIcon$6, null));
    const jumpPrevIcon = (
      // biome-ignore lint/a11y/useValidAnchor: it is hard to refactor
      /* @__PURE__ */ reactExports.createElement("a", {
        className: `${prefixCls}-item-link`
      }, /* @__PURE__ */ reactExports.createElement("div", {
        className: `${prefixCls}-item-container`
      }, direction === "rtl" ? /* @__PURE__ */ reactExports.createElement(RefIcon$l, {
        className: `${prefixCls}-item-link-icon`
      }) : /* @__PURE__ */ reactExports.createElement(RefIcon$k, {
        className: `${prefixCls}-item-link-icon`
      }), ellipsis))
    );
    const jumpNextIcon = (
      // biome-ignore lint/a11y/useValidAnchor: it is hard to refactor
      /* @__PURE__ */ reactExports.createElement("a", {
        className: `${prefixCls}-item-link`
      }, /* @__PURE__ */ reactExports.createElement("div", {
        className: `${prefixCls}-item-container`
      }, direction === "rtl" ? /* @__PURE__ */ reactExports.createElement(RefIcon$k, {
        className: `${prefixCls}-item-link-icon`
      }) : /* @__PURE__ */ reactExports.createElement(RefIcon$l, {
        className: `${prefixCls}-item-link-icon`
      }), ellipsis))
    );
    return {
      prevIcon,
      nextIcon,
      jumpPrevIcon,
      jumpNextIcon
    };
  }, [direction, prefixCls]);
  const selectPrefixCls = getPrefixCls("select", customizeSelectPrefixCls);
  const extendedClassName = classNames({
    [`${prefixCls}-${align}`]: !!align,
    [`${prefixCls}-mini`]: isSmall,
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-bordered`]: token.wireframe
  }, contextClassName, className, rootClassName, hashId, cssVarCls);
  const mergedStyle = Object.assign(Object.assign({}, contextStyle), style);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, token.wireframe && /* @__PURE__ */ reactExports.createElement(BorderedStyle, {
    prefixCls
  }), /* @__PURE__ */ reactExports.createElement(Pagination$1, Object.assign({}, iconsProps, restProps, {
    style: mergedStyle,
    prefixCls,
    selectPrefixCls,
    className: extendedClassName,
    locale: locale2,
    pageSizeOptions: mergedPageSizeOptions,
    showSizeChanger: mergedShowSizeChanger,
    sizeChangerRender
  }))));
};
const viewSize = 100;
const borderWidth = viewSize / 5;
const radius = viewSize / 2 - borderWidth / 2;
const circumference = radius * 2 * Math.PI;
const position = 50;
const CustomCircle = (props) => {
  const {
    dotClassName,
    style,
    hasCircleCls
  } = props;
  return /* @__PURE__ */ reactExports.createElement("circle", {
    className: classNames(`${dotClassName}-circle`, {
      [`${dotClassName}-circle-bg`]: hasCircleCls
    }),
    r: radius,
    cx: position,
    cy: position,
    strokeWidth: borderWidth,
    style
  });
};
const Progress = ({
  percent,
  prefixCls
}) => {
  const dotClassName = `${prefixCls}-dot`;
  const holderClassName = `${dotClassName}-holder`;
  const hideClassName = `${holderClassName}-hidden`;
  const [render2, setRender] = reactExports.useState(false);
  useLayoutEffect(() => {
    if (percent !== 0) {
      setRender(true);
    }
  }, [percent !== 0]);
  const safePtg = Math.max(Math.min(percent, 100), 0);
  if (!render2) {
    return null;
  }
  const circleStyle = {
    strokeDashoffset: `${circumference / 4}`,
    strokeDasharray: `${circumference * safePtg / 100} ${circumference * (100 - safePtg) / 100}`
  };
  return /* @__PURE__ */ reactExports.createElement("span", {
    className: classNames(holderClassName, `${dotClassName}-progress`, safePtg <= 0 && hideClassName)
  }, /* @__PURE__ */ reactExports.createElement("svg", {
    viewBox: `0 0 ${viewSize} ${viewSize}`,
    role: "progressbar",
    "aria-valuemin": 0,
    "aria-valuemax": 100,
    "aria-valuenow": safePtg
  }, /* @__PURE__ */ reactExports.createElement(CustomCircle, {
    dotClassName,
    hasCircleCls: true
  }), /* @__PURE__ */ reactExports.createElement(CustomCircle, {
    dotClassName,
    style: circleStyle
  })));
};
function Looper(props) {
  const {
    prefixCls,
    percent = 0
  } = props;
  const dotClassName = `${prefixCls}-dot`;
  const holderClassName = `${dotClassName}-holder`;
  const hideClassName = `${holderClassName}-hidden`;
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement("span", {
    className: classNames(holderClassName, percent > 0 && hideClassName)
  }, /* @__PURE__ */ reactExports.createElement("span", {
    className: classNames(dotClassName, `${prefixCls}-dot-spin`)
  }, [1, 2, 3, 4].map((i) => /* @__PURE__ */ reactExports.createElement("i", {
    className: `${prefixCls}-dot-item`,
    key: i
  })))), /* @__PURE__ */ reactExports.createElement(Progress, {
    prefixCls,
    percent
  }));
}
function Indicator(props) {
  var _a;
  const {
    prefixCls,
    indicator,
    percent
  } = props;
  const dotClassName = `${prefixCls}-dot`;
  if (indicator && /* @__PURE__ */ reactExports.isValidElement(indicator)) {
    return cloneElement(indicator, {
      className: classNames((_a = indicator.props) === null || _a === void 0 ? void 0 : _a.className, dotClassName),
      percent
    });
  }
  return /* @__PURE__ */ reactExports.createElement(Looper, {
    prefixCls,
    percent
  });
}
const antSpinMove = new Keyframe("antSpinMove", {
  to: {
    opacity: 1
  }
});
const antRotate = new Keyframe("antRotate", {
  to: {
    transform: "rotate(405deg)"
  }
});
const genSpinStyle = (token) => {
  const {
    componentCls,
    calc
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      position: "absolute",
      display: "none",
      color: token.colorPrimary,
      fontSize: 0,
      textAlign: "center",
      verticalAlign: "middle",
      opacity: 0,
      transition: `transform ${token.motionDurationSlow} ${token.motionEaseInOutCirc}`,
      "&-spinning": {
        position: "relative",
        display: "inline-block",
        opacity: 1
      },
      [`${componentCls}-text`]: {
        fontSize: token.fontSize,
        paddingTop: calc(calc(token.dotSize).sub(token.fontSize)).div(2).add(2).equal()
      },
      "&-fullscreen": {
        position: "fixed",
        width: "100vw",
        height: "100vh",
        backgroundColor: token.colorBgMask,
        zIndex: token.zIndexPopupBase,
        inset: 0,
        display: "flex",
        alignItems: "center",
        flexDirection: "column",
        justifyContent: "center",
        opacity: 0,
        visibility: "hidden",
        transition: `all ${token.motionDurationMid}`,
        "&-show": {
          opacity: 1,
          visibility: "visible"
        },
        [componentCls]: {
          [`${componentCls}-dot-holder`]: {
            color: token.colorWhite
          },
          [`${componentCls}-text`]: {
            color: token.colorTextLightSolid
          }
        }
      },
      "&-nested-loading": {
        position: "relative",
        [`> div > ${componentCls}`]: {
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          zIndex: 4,
          display: "block",
          width: "100%",
          height: "100%",
          maxHeight: token.contentHeight,
          [`${componentCls}-dot`]: {
            position: "absolute",
            top: "50%",
            insetInlineStart: "50%",
            margin: calc(token.dotSize).mul(-1).div(2).equal()
          },
          [`${componentCls}-text`]: {
            position: "absolute",
            top: "50%",
            width: "100%",
            textShadow: `0 1px 2px ${token.colorBgContainer}`
            // FIXME: shadow
          },
          [`&${componentCls}-show-text ${componentCls}-dot`]: {
            marginTop: calc(token.dotSize).div(2).mul(-1).sub(10).equal()
          },
          "&-sm": {
            [`${componentCls}-dot`]: {
              margin: calc(token.dotSizeSM).mul(-1).div(2).equal()
            },
            [`${componentCls}-text`]: {
              paddingTop: calc(calc(token.dotSizeSM).sub(token.fontSize)).div(2).add(2).equal()
            },
            [`&${componentCls}-show-text ${componentCls}-dot`]: {
              marginTop: calc(token.dotSizeSM).div(2).mul(-1).sub(10).equal()
            }
          },
          "&-lg": {
            [`${componentCls}-dot`]: {
              margin: calc(token.dotSizeLG).mul(-1).div(2).equal()
            },
            [`${componentCls}-text`]: {
              paddingTop: calc(calc(token.dotSizeLG).sub(token.fontSize)).div(2).add(2).equal()
            },
            [`&${componentCls}-show-text ${componentCls}-dot`]: {
              marginTop: calc(token.dotSizeLG).div(2).mul(-1).sub(10).equal()
            }
          }
        },
        [`${componentCls}-container`]: {
          position: "relative",
          transition: `opacity ${token.motionDurationSlow}`,
          "&::after": {
            position: "absolute",
            top: 0,
            insetInlineEnd: 0,
            bottom: 0,
            insetInlineStart: 0,
            zIndex: 10,
            width: "100%",
            height: "100%",
            background: token.colorBgContainer,
            opacity: 0,
            transition: `all ${token.motionDurationSlow}`,
            content: '""',
            pointerEvents: "none"
          }
        },
        [`${componentCls}-blur`]: {
          clear: "both",
          opacity: 0.5,
          userSelect: "none",
          pointerEvents: "none",
          "&::after": {
            opacity: 0.4,
            pointerEvents: "auto"
          }
        }
      },
      // tip
      // ------------------------------
      "&-tip": {
        color: token.spinDotDefault
      },
      // holder
      // ------------------------------
      [`${componentCls}-dot-holder`]: {
        width: "1em",
        height: "1em",
        fontSize: token.dotSize,
        display: "inline-block",
        transition: `transform ${token.motionDurationSlow} ease, opacity ${token.motionDurationSlow} ease`,
        transformOrigin: "50% 50%",
        lineHeight: 1,
        color: token.colorPrimary,
        "&-hidden": {
          transform: "scale(0.3)",
          opacity: 0
        }
      },
      // progress
      // ------------------------------
      [`${componentCls}-dot-progress`]: {
        position: "absolute",
        inset: 0
      },
      // dots
      // ------------------------------
      [`${componentCls}-dot`]: {
        position: "relative",
        display: "inline-block",
        fontSize: token.dotSize,
        width: "1em",
        height: "1em",
        "&-item": {
          position: "absolute",
          display: "block",
          width: calc(token.dotSize).sub(calc(token.marginXXS).div(2)).div(2).equal(),
          height: calc(token.dotSize).sub(calc(token.marginXXS).div(2)).div(2).equal(),
          background: "currentColor",
          borderRadius: "100%",
          transform: "scale(0.75)",
          transformOrigin: "50% 50%",
          opacity: 0.3,
          animationName: antSpinMove,
          animationDuration: "1s",
          animationIterationCount: "infinite",
          animationTimingFunction: "linear",
          animationDirection: "alternate",
          "&:nth-child(1)": {
            top: 0,
            insetInlineStart: 0,
            animationDelay: "0s"
          },
          "&:nth-child(2)": {
            top: 0,
            insetInlineEnd: 0,
            animationDelay: "0.4s"
          },
          "&:nth-child(3)": {
            insetInlineEnd: 0,
            bottom: 0,
            animationDelay: "0.8s"
          },
          "&:nth-child(4)": {
            bottom: 0,
            insetInlineStart: 0,
            animationDelay: "1.2s"
          }
        },
        "&-spin": {
          transform: "rotate(45deg)",
          animationName: antRotate,
          animationDuration: "1.2s",
          animationIterationCount: "infinite",
          animationTimingFunction: "linear"
        },
        "&-circle": {
          strokeLinecap: "round",
          transition: ["stroke-dashoffset", "stroke-dasharray", "stroke", "stroke-width", "opacity"].map((item) => `${item} ${token.motionDurationSlow} ease`).join(","),
          fillOpacity: 0,
          stroke: "currentcolor"
        },
        "&-circle-bg": {
          stroke: token.colorFillSecondary
        }
      },
      // small
      [`&-sm ${componentCls}-dot`]: {
        "&, &-holder": {
          fontSize: token.dotSizeSM
        }
      },
      [`&-sm ${componentCls}-dot-holder`]: {
        i: {
          width: calc(calc(token.dotSizeSM).sub(calc(token.marginXXS).div(2))).div(2).equal(),
          height: calc(calc(token.dotSizeSM).sub(calc(token.marginXXS).div(2))).div(2).equal()
        }
      },
      // large
      [`&-lg ${componentCls}-dot`]: {
        "&, &-holder": {
          fontSize: token.dotSizeLG
        }
      },
      [`&-lg ${componentCls}-dot-holder`]: {
        i: {
          width: calc(calc(token.dotSizeLG).sub(token.marginXXS)).div(2).equal(),
          height: calc(calc(token.dotSizeLG).sub(token.marginXXS)).div(2).equal()
        }
      },
      [`&${componentCls}-show-text ${componentCls}-text`]: {
        display: "block"
      }
    })
  };
};
const prepareComponentToken$5 = (token) => {
  const {
    controlHeightLG,
    controlHeight
  } = token;
  return {
    contentHeight: 400,
    dotSize: controlHeightLG / 2,
    dotSizeSM: controlHeightLG * 0.35,
    dotSizeLG: controlHeight
  };
};
const useStyle$5 = genStyleHooks("Spin", (token) => {
  const spinToken = merge$1(token, {
    spinDotDefault: token.colorTextDescription
  });
  return [genSpinStyle(spinToken)];
}, prepareComponentToken$5);
const AUTO_INTERVAL = 200;
const STEP_BUCKETS = [[30, 0.05], [70, 0.03], [96, 0.01]];
function usePercent(spinning, percent) {
  const [mockPercent, setMockPercent] = reactExports.useState(0);
  const mockIntervalRef = reactExports.useRef(null);
  const isAuto = percent === "auto";
  reactExports.useEffect(() => {
    if (isAuto && spinning) {
      setMockPercent(0);
      mockIntervalRef.current = setInterval(() => {
        setMockPercent((prev) => {
          const restPTG = 100 - prev;
          for (let i = 0; i < STEP_BUCKETS.length; i += 1) {
            const [limit, stepPtg] = STEP_BUCKETS[i];
            if (prev <= limit) {
              return prev + restPTG * stepPtg;
            }
          }
          return prev;
        });
      }, AUTO_INTERVAL);
    }
    return () => {
      clearInterval(mockIntervalRef.current);
    };
  }, [isAuto, spinning]);
  return isAuto ? mockPercent : percent;
}
var __rest$c = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
let defaultIndicator;
function shouldDelay(spinning, delay) {
  return !!spinning && !!delay && !Number.isNaN(Number(delay));
}
const Spin = (props) => {
  var _a;
  const {
    prefixCls: customizePrefixCls,
    spinning: customSpinning = true,
    delay = 0,
    className,
    rootClassName,
    size = "default",
    tip,
    wrapperClassName,
    style,
    children,
    fullscreen = false,
    indicator,
    percent
  } = props, restProps = __rest$c(props, ["prefixCls", "spinning", "delay", "className", "rootClassName", "size", "tip", "wrapperClassName", "style", "children", "fullscreen", "indicator", "percent"]);
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle,
    indicator: contextIndicator
  } = useComponentConfig("spin");
  const prefixCls = getPrefixCls("spin", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$5(prefixCls);
  const [spinning, setSpinning] = reactExports.useState(() => customSpinning && !shouldDelay(customSpinning, delay));
  const mergedPercent = usePercent(spinning, percent);
  reactExports.useEffect(() => {
    if (customSpinning) {
      const showSpinning = debounce(delay, () => {
        setSpinning(true);
      });
      showSpinning();
      return () => {
        var _a2;
        (_a2 = showSpinning === null || showSpinning === void 0 ? void 0 : showSpinning.cancel) === null || _a2 === void 0 ? void 0 : _a2.call(showSpinning);
      };
    }
    setSpinning(false);
  }, [delay, customSpinning]);
  const isNestedPattern = reactExports.useMemo(() => typeof children !== "undefined" && !fullscreen, [children, fullscreen]);
  const spinClassName = classNames(prefixCls, contextClassName, {
    [`${prefixCls}-sm`]: size === "small",
    [`${prefixCls}-lg`]: size === "large",
    [`${prefixCls}-spinning`]: spinning,
    [`${prefixCls}-show-text`]: !!tip,
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, className, !fullscreen && rootClassName, hashId, cssVarCls);
  const containerClassName = classNames(`${prefixCls}-container`, {
    [`${prefixCls}-blur`]: spinning
  });
  const mergedIndicator = (_a = indicator !== null && indicator !== void 0 ? indicator : contextIndicator) !== null && _a !== void 0 ? _a : defaultIndicator;
  const mergedStyle = Object.assign(Object.assign({}, contextStyle), style);
  const spinElement = /* @__PURE__ */ reactExports.createElement("div", Object.assign({}, restProps, {
    style: mergedStyle,
    className: spinClassName,
    "aria-live": "polite",
    "aria-busy": spinning
  }), /* @__PURE__ */ reactExports.createElement(Indicator, {
    prefixCls,
    indicator: mergedIndicator,
    percent: mergedPercent
  }), tip && (isNestedPattern || fullscreen) ? /* @__PURE__ */ reactExports.createElement("div", {
    className: `${prefixCls}-text`
  }, tip) : null);
  if (isNestedPattern) {
    return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({}, restProps, {
      className: classNames(`${prefixCls}-nested-loading`, wrapperClassName, hashId, cssVarCls)
    }), spinning && /* @__PURE__ */ reactExports.createElement("div", {
      key: "loading"
    }, spinElement), /* @__PURE__ */ reactExports.createElement("div", {
      className: containerClassName,
      key: "container"
    }, children)));
  }
  if (fullscreen) {
    return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
      className: classNames(`${prefixCls}-fullscreen`, {
        [`${prefixCls}-fullscreen-show`]: spinning
      }, rootClassName, hashId, cssVarCls)
    }, spinElement));
  }
  return wrapCSSVar(spinElement);
};
Spin.setDefaultIndicator = (indicator) => {
  defaultIndicator = indicator;
};
const toList$1 = (candidate, skipEmpty = false) => {
  if (skipEmpty && (candidate === void 0 || candidate === null)) {
    return [];
  }
  return Array.isArray(candidate) ? candidate : [candidate];
};
let message = null;
let act = (callback) => callback();
let taskQueue = [];
let defaultGlobalConfig = {};
function getGlobalContext() {
  const {
    getContainer,
    duration,
    rtl,
    maxCount,
    top
  } = defaultGlobalConfig;
  const mergedContainer = (getContainer === null || getContainer === void 0 ? void 0 : getContainer()) || document.body;
  return {
    getContainer: () => mergedContainer,
    duration,
    rtl,
    maxCount,
    top
  };
}
const GlobalHolder = /* @__PURE__ */ React.forwardRef((props, ref) => {
  const {
    messageConfig,
    sync
  } = props;
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const prefixCls = defaultGlobalConfig.prefixCls || getPrefixCls("message");
  const appConfig = reactExports.useContext(AppConfigContext);
  const [api, holder] = useInternalMessage(Object.assign(Object.assign(Object.assign({}, messageConfig), {
    prefixCls
  }), appConfig.message));
  React.useImperativeHandle(ref, () => {
    const instance = Object.assign({}, api);
    Object.keys(instance).forEach((method) => {
      instance[method] = (...args) => {
        sync();
        return api[method].apply(api, args);
      };
    });
    return {
      instance,
      sync
    };
  });
  return holder;
});
const GlobalHolderWrapper = /* @__PURE__ */ React.forwardRef((_, ref) => {
  const [messageConfig, setMessageConfig] = React.useState(getGlobalContext);
  const sync = () => {
    setMessageConfig(getGlobalContext);
  };
  React.useEffect(sync, []);
  const global = globalConfig();
  const rootPrefixCls = global.getRootPrefixCls();
  const rootIconPrefixCls = global.getIconPrefixCls();
  const theme = global.getTheme();
  const dom = /* @__PURE__ */ React.createElement(GlobalHolder, {
    ref,
    sync,
    messageConfig
  });
  return /* @__PURE__ */ React.createElement(ConfigProvider, {
    prefixCls: rootPrefixCls,
    iconPrefixCls: rootIconPrefixCls,
    theme
  }, global.holderRender ? global.holderRender(dom) : dom);
});
function flushNotice() {
  if (!message) {
    const holderFragment = document.createDocumentFragment();
    const newMessage = {
      fragment: holderFragment
    };
    message = newMessage;
    act(() => {
      const reactRender = unstableSetRender();
      reactRender(/* @__PURE__ */ React.createElement(GlobalHolderWrapper, {
        ref: (node) => {
          const {
            instance,
            sync
          } = node || {};
          Promise.resolve().then(() => {
            if (!newMessage.instance && instance) {
              newMessage.instance = instance;
              newMessage.sync = sync;
              flushNotice();
            }
          });
        }
      }), holderFragment);
    });
    return;
  }
  if (!message.instance) {
    return;
  }
  taskQueue.forEach((task) => {
    const {
      type,
      skipped
    } = task;
    if (!skipped) {
      switch (type) {
        case "open": {
          act(() => {
            const closeFn = message.instance.open(Object.assign(Object.assign({}, defaultGlobalConfig), task.config));
            closeFn === null || closeFn === void 0 ? void 0 : closeFn.then(task.resolve);
            task.setCloseFn(closeFn);
          });
          break;
        }
        case "destroy":
          act(() => {
            message === null || message === void 0 ? void 0 : message.instance.destroy(task.key);
          });
          break;
        default: {
          act(() => {
            var _message$instance;
            const closeFn = (_message$instance = message.instance)[type].apply(_message$instance, _toConsumableArray(task.args));
            closeFn === null || closeFn === void 0 ? void 0 : closeFn.then(task.resolve);
            task.setCloseFn(closeFn);
          });
        }
      }
    }
  });
  taskQueue = [];
}
function setMessageGlobalConfig(config) {
  defaultGlobalConfig = Object.assign(Object.assign({}, defaultGlobalConfig), config);
  act(() => {
    var _a;
    (_a = message === null || message === void 0 ? void 0 : message.sync) === null || _a === void 0 ? void 0 : _a.call(message);
  });
}
function open(config) {
  const result = wrapPromiseFn((resolve) => {
    let closeFn;
    const task = {
      type: "open",
      config,
      resolve,
      setCloseFn: (fn) => {
        closeFn = fn;
      }
    };
    taskQueue.push(task);
    return () => {
      if (closeFn) {
        act(() => {
          closeFn();
        });
      } else {
        task.skipped = true;
      }
    };
  });
  flushNotice();
  return result;
}
function typeOpen(type, args) {
  const result = wrapPromiseFn((resolve) => {
    let closeFn;
    const task = {
      type,
      args,
      resolve,
      setCloseFn: (fn) => {
        closeFn = fn;
      }
    };
    taskQueue.push(task);
    return () => {
      if (closeFn) {
        act(() => {
          closeFn();
        });
      } else {
        task.skipped = true;
      }
    };
  });
  flushNotice();
  return result;
}
const destroy = (key) => {
  taskQueue.push({
    type: "destroy",
    key
  });
  flushNotice();
};
const methods = ["success", "info", "warning", "error", "loading"];
const baseStaticMethods = {
  open,
  destroy,
  config: setMessageGlobalConfig,
  useMessage,
  _InternalPanelDoNotUseOrYouWillBeFired: PurePanel$6
};
const staticMethods = baseStaticMethods;
methods.forEach((type) => {
  staticMethods[type] = (...args) => typeOpen(type, args);
});
var __rest$b = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const PurePanel = (props) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    closeIcon,
    closable,
    type,
    title,
    children,
    footer
  } = props, restProps = __rest$b(props, ["prefixCls", "className", "closeIcon", "closable", "type", "title", "children", "footer"]);
  const {
    getPrefixCls
  } = reactExports.useContext(ConfigContext);
  const rootPrefixCls = getPrefixCls();
  const prefixCls = customizePrefixCls || getPrefixCls("modal");
  const rootCls = useCSSVarCls(rootPrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$m(prefixCls, rootCls);
  const confirmPrefixCls = `${prefixCls}-confirm`;
  let additionalProps = {};
  if (type) {
    additionalProps = {
      closable: closable !== null && closable !== void 0 ? closable : false,
      title: "",
      footer: "",
      children: /* @__PURE__ */ reactExports.createElement(ConfirmContent, Object.assign({}, props, {
        prefixCls,
        confirmPrefixCls,
        rootPrefixCls,
        content: children
      }))
    };
  } else {
    additionalProps = {
      closable: closable !== null && closable !== void 0 ? closable : true,
      title,
      footer: footer !== null && /* @__PURE__ */ reactExports.createElement(Footer, Object.assign({}, props)),
      children
    };
  }
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement(Panel, Object.assign({
    prefixCls,
    className: classNames(hashId, `${prefixCls}-pure-panel`, type && confirmPrefixCls, type && `${confirmPrefixCls}-${type}`, className, cssVarCls, rootCls)
  }, restProps, {
    closeIcon: renderCloseIcon(prefixCls, closeIcon),
    closable
  }, additionalProps)));
};
const PurePanel$1 = withPureRenderTheme(PurePanel);
function modalWarn(props) {
  return confirm(withWarn(props));
}
const Modal = Modal$1;
Modal.useModal = useModal;
Modal.info = function infoFn(props) {
  return confirm(withInfo(props));
};
Modal.success = function successFn(props) {
  return confirm(withSuccess(props));
};
Modal.error = function errorFn(props) {
  return confirm(withError(props));
};
Modal.warning = modalWarn;
Modal.warn = modalWarn;
Modal.confirm = function confirmFn(props) {
  return confirm(withConfirm(props));
};
Modal.destroyAll = function destroyAllFn() {
  while (destroyFns.length) {
    const close = destroyFns.pop();
    if (close) {
      close();
    }
  }
};
Modal.config = modalGlobalConfig;
Modal._InternalPanelDoNotUseOrYouWillBeFired = PurePanel$1;
const StatisticNumber = (props) => {
  const {
    value,
    formatter,
    precision,
    decimalSeparator,
    groupSeparator = "",
    prefixCls
  } = props;
  let valueNode;
  if (typeof formatter === "function") {
    valueNode = formatter(value);
  } else {
    const val = String(value);
    const cells = val.match(/^(-?)(\d*)(\.(\d+))?$/);
    if (!cells || val === "-") {
      valueNode = val;
    } else {
      const negative = cells[1];
      let int = cells[2] || "0";
      let decimal = cells[4] || "";
      int = int.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
      if (typeof precision === "number") {
        decimal = decimal.padEnd(precision, "0").slice(0, precision > 0 ? precision : 0);
      }
      if (decimal) {
        decimal = `${decimalSeparator}${decimal}`;
      }
      valueNode = [/* @__PURE__ */ reactExports.createElement("span", {
        key: "int",
        className: `${prefixCls}-content-value-int`
      }, negative, int), decimal && /* @__PURE__ */ reactExports.createElement("span", {
        key: "decimal",
        className: `${prefixCls}-content-value-decimal`
      }, decimal)];
    }
  }
  return /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-content-value`
  }, valueNode);
};
const genStatisticStyle = (token) => {
  const {
    componentCls,
    marginXXS,
    padding,
    colorTextDescription,
    titleFontSize,
    colorTextHeading,
    contentFontSize,
    fontFamily
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      [`${componentCls}-title`]: {
        marginBottom: marginXXS,
        color: colorTextDescription,
        fontSize: titleFontSize
      },
      [`${componentCls}-skeleton`]: {
        paddingTop: padding
      },
      [`${componentCls}-content`]: {
        color: colorTextHeading,
        fontSize: contentFontSize,
        fontFamily,
        [`${componentCls}-content-value`]: {
          display: "inline-block",
          direction: "ltr"
        },
        [`${componentCls}-content-prefix, ${componentCls}-content-suffix`]: {
          display: "inline-block"
        },
        [`${componentCls}-content-prefix`]: {
          marginInlineEnd: marginXXS
        },
        [`${componentCls}-content-suffix`]: {
          marginInlineStart: marginXXS
        }
      }
    })
  };
};
const prepareComponentToken$4 = (token) => {
  const {
    fontSizeHeading3,
    fontSize
  } = token;
  return {
    titleFontSize: fontSize,
    contentFontSize: fontSizeHeading3
  };
};
const useStyle$4 = genStyleHooks("Statistic", (token) => {
  const statisticToken = merge$1(token, {});
  return [genStatisticStyle(statisticToken)];
}, prepareComponentToken$4);
var __rest$a = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Statistic = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    valueStyle,
    value = 0,
    title,
    valueRender,
    prefix,
    suffix,
    loading = false,
    /* --- FormatConfig starts --- */
    formatter,
    precision,
    decimalSeparator = ".",
    groupSeparator = ",",
    /* --- FormatConfig starts --- */
    onMouseEnter,
    onMouseLeave
  } = props, rest = __rest$a(props, ["prefixCls", "className", "rootClassName", "style", "valueStyle", "value", "title", "valueRender", "prefix", "suffix", "loading", "formatter", "precision", "decimalSeparator", "groupSeparator", "onMouseEnter", "onMouseLeave"]);
  const {
    getPrefixCls,
    direction,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig("statistic");
  const prefixCls = getPrefixCls("statistic", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$4(prefixCls);
  const valueNode = /* @__PURE__ */ reactExports.createElement(StatisticNumber, {
    decimalSeparator,
    groupSeparator,
    prefixCls,
    formatter,
    precision,
    value
  });
  const cls = classNames(prefixCls, {
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, contextClassName, className, rootClassName, hashId, cssVarCls);
  const internalRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => ({
    nativeElement: internalRef.current
  }));
  const restProps = pickAttrs(rest, {
    aria: true,
    data: true
  });
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", Object.assign({}, restProps, {
    ref: internalRef,
    className: cls,
    style: Object.assign(Object.assign({}, contextStyle), style),
    onMouseEnter,
    onMouseLeave
  }), title && /* @__PURE__ */ reactExports.createElement("div", {
    className: `${prefixCls}-title`
  }, title), /* @__PURE__ */ reactExports.createElement(Skeleton, {
    paragraph: false,
    loading,
    className: `${prefixCls}-skeleton`
  }, /* @__PURE__ */ reactExports.createElement("div", {
    style: valueStyle,
    className: `${prefixCls}-content`
  }, prefix && /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-content-prefix`
  }, prefix), valueRender ? valueRender(valueNode) : valueNode, suffix && /* @__PURE__ */ reactExports.createElement("span", {
    className: `${prefixCls}-content-suffix`
  }, suffix)))));
});
const timeUnits = [
  ["Y", 1e3 * 60 * 60 * 24 * 365],
  // years
  ["M", 1e3 * 60 * 60 * 24 * 30],
  // months
  ["D", 1e3 * 60 * 60 * 24],
  // days
  ["H", 1e3 * 60 * 60],
  // hours
  ["m", 1e3 * 60],
  // minutes
  ["s", 1e3],
  // seconds
  ["S", 1]
  // million seconds
];
function formatTimeStr(duration, format) {
  let leftDuration = duration;
  const escapeRegex = /\[[^\]]*]/g;
  const keepList = (format.match(escapeRegex) || []).map((str) => str.slice(1, -1));
  const templateText = format.replace(escapeRegex, "[]");
  const replacedText = timeUnits.reduce((current, [name, unit2]) => {
    if (current.includes(name)) {
      const value = Math.floor(leftDuration / unit2);
      leftDuration -= value * unit2;
      return current.replace(new RegExp(`${name}+`, "g"), (match) => {
        const len = match.length;
        return value.toString().padStart(len, "0");
      });
    }
    return current;
  }, templateText);
  let index = 0;
  return replacedText.replace(escapeRegex, () => {
    const match = keepList[index];
    index += 1;
    return match;
  });
}
function formatCounter(value, config, down) {
  const {
    format = ""
  } = config;
  const target = new Date(value).getTime();
  const current = Date.now();
  const diff = down ? Math.max(target - current, 0) : Math.max(current - target, 0);
  return formatTimeStr(diff, format);
}
var __rest$9 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function getTime(value) {
  return new Date(value).getTime();
}
const StatisticTimer = (props) => {
  const {
    value,
    format = "HH:mm:ss",
    onChange,
    onFinish,
    type
  } = props, rest = __rest$9(props, ["value", "format", "onChange", "onFinish", "type"]);
  const down = type === "countdown";
  const [showTime, setShowTime] = reactExports.useState(null);
  const update = useEvent(() => {
    const now = Date.now();
    const timestamp = getTime(value);
    setShowTime({});
    const timeDiff = !down ? now - timestamp : timestamp - now;
    onChange === null || onChange === void 0 ? void 0 : onChange(timeDiff);
    if (down && timestamp < now) {
      onFinish === null || onFinish === void 0 ? void 0 : onFinish();
      return false;
    }
    return true;
  });
  reactExports.useEffect(() => {
    let rafId;
    const clear = () => wrapperRaf.cancel(rafId);
    const rafUpdate = () => {
      rafId = wrapperRaf(() => {
        if (update()) {
          rafUpdate();
        }
      });
    };
    rafUpdate();
    return clear;
  }, [value, down]);
  reactExports.useEffect(() => {
    setShowTime({});
  }, []);
  const formatter = (formatValue, config) => showTime ? formatCounter(formatValue, Object.assign(Object.assign({}, config), {
    format
  }), down) : "-";
  const valueRender = (node) => cloneElement(node, {
    title: void 0
  });
  return /* @__PURE__ */ reactExports.createElement(Statistic, Object.assign({}, rest, {
    value,
    valueRender,
    formatter
  }));
};
const Countdown = (props) => {
  return /* @__PURE__ */ reactExports.createElement(StatisticTimer, Object.assign({}, props, {
    type: "countdown"
  }));
};
const Countdown$1 = /* @__PURE__ */ reactExports.memo(Countdown);
Statistic.Timer = StatisticTimer;
Statistic.Countdown = Countdown$1;
const Column = (_) => null;
const ColumnGroup = (_) => null;
function useMultipleSelect(getKey) {
  const [prevSelectedIndex, setPrevSelectedIndex] = reactExports.useState(null);
  const multipleSelect = reactExports.useCallback((currentSelectedIndex, data, selectedKeys) => {
    const configPrevSelectedIndex = prevSelectedIndex !== null && prevSelectedIndex !== void 0 ? prevSelectedIndex : currentSelectedIndex;
    const startIndex = Math.min(configPrevSelectedIndex || 0, currentSelectedIndex);
    const endIndex = Math.max(configPrevSelectedIndex || 0, currentSelectedIndex);
    const rangeKeys = data.slice(startIndex, endIndex + 1).map((item) => getKey(item));
    const shouldSelected = rangeKeys.some((rangeKey) => !selectedKeys.has(rangeKey));
    const changedKeys = [];
    rangeKeys.forEach((item) => {
      if (shouldSelected) {
        if (!selectedKeys.has(item)) {
          changedKeys.push(item);
        }
        selectedKeys.add(item);
      } else {
        selectedKeys.delete(item);
        changedKeys.push(item);
      }
    });
    setPrevSelectedIndex(shouldSelected ? endIndex : null);
    return changedKeys;
  }, [prevSelectedIndex]);
  const updatePrevSelectedIndex = (val) => {
    setPrevSelectedIndex(val);
  };
  return [multipleSelect, updatePrevSelectedIndex];
}
const SELECTION_COLUMN = {};
const SELECTION_ALL = "SELECT_ALL";
const SELECTION_INVERT = "SELECT_INVERT";
const SELECTION_NONE = "SELECT_NONE";
const EMPTY_LIST$1 = [];
const flattenData = (childrenColumnName, data, list = []) => {
  (data || []).forEach((record) => {
    list.push(record);
    if (record && typeof record === "object" && childrenColumnName in record) {
      flattenData(childrenColumnName, record[childrenColumnName], list);
    }
  });
  return list;
};
const useSelection = (config, rowSelection) => {
  const {
    preserveSelectedRowKeys,
    selectedRowKeys,
    defaultSelectedRowKeys,
    getCheckboxProps,
    onChange: onSelectionChange,
    onSelect,
    onSelectAll,
    onSelectInvert,
    onSelectNone,
    onSelectMultiple,
    columnWidth: selectionColWidth,
    type: selectionType,
    selections,
    fixed,
    renderCell: customizeRenderCell,
    hideSelectAll,
    checkStrictly = true
  } = rowSelection || {};
  const {
    prefixCls,
    data,
    pageData,
    getRecordByKey,
    getRowKey,
    expandType,
    childrenColumnName,
    locale: tableLocale,
    getPopupContainer
  } = config;
  const warning = devUseWarning();
  const [multipleSelect, updatePrevSelectedIndex] = useMultipleSelect((item) => item);
  const [mergedSelectedKeys, setMergedSelectedKeys] = useMergedState(selectedRowKeys || defaultSelectedRowKeys || EMPTY_LIST$1, {
    value: selectedRowKeys
  });
  const preserveRecordsRef = reactExports.useRef(/* @__PURE__ */ new Map());
  const updatePreserveRecordsCache = reactExports.useCallback((keys) => {
    if (preserveSelectedRowKeys) {
      const newCache = /* @__PURE__ */ new Map();
      keys.forEach((key) => {
        let record = getRecordByKey(key);
        if (!record && preserveRecordsRef.current.has(key)) {
          record = preserveRecordsRef.current.get(key);
        }
        newCache.set(key, record);
      });
      preserveRecordsRef.current = newCache;
    }
  }, [getRecordByKey, preserveSelectedRowKeys]);
  reactExports.useEffect(() => {
    updatePreserveRecordsCache(mergedSelectedKeys);
  }, [mergedSelectedKeys]);
  const flattedData = reactExports.useMemo(() => flattenData(childrenColumnName, pageData), [childrenColumnName, pageData]);
  const {
    keyEntities
  } = reactExports.useMemo(() => {
    if (checkStrictly) {
      return {
        keyEntities: null
      };
    }
    let convertData = data;
    if (preserveSelectedRowKeys) {
      const keysSet = new Set(flattedData.map((record, index) => getRowKey(record, index)));
      const preserveRecords = Array.from(preserveRecordsRef.current).reduce((total, [key, value]) => keysSet.has(key) ? total : total.concat(value), []);
      convertData = [].concat(_toConsumableArray(convertData), _toConsumableArray(preserveRecords));
    }
    return convertDataToEntities(convertData, {
      externalGetKey: getRowKey,
      childrenPropName: childrenColumnName
    });
  }, [data, getRowKey, checkStrictly, childrenColumnName, preserveSelectedRowKeys, flattedData]);
  const checkboxPropsMap = reactExports.useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    flattedData.forEach((record, index) => {
      const key = getRowKey(record, index);
      const checkboxProps = (getCheckboxProps ? getCheckboxProps(record) : null) || {};
      map.set(key, checkboxProps);
    });
    return map;
  }, [flattedData, getRowKey, getCheckboxProps]);
  const isCheckboxDisabled = reactExports.useCallback((r) => {
    const rowKey = getRowKey(r);
    let checkboxProps;
    if (checkboxPropsMap.has(rowKey)) {
      checkboxProps = checkboxPropsMap.get(getRowKey(r));
    } else {
      checkboxProps = getCheckboxProps ? getCheckboxProps(r) : void 0;
    }
    return !!(checkboxProps === null || checkboxProps === void 0 ? void 0 : checkboxProps.disabled);
  }, [checkboxPropsMap, getRowKey]);
  const [derivedSelectedKeys, derivedHalfSelectedKeys] = reactExports.useMemo(() => {
    if (checkStrictly) {
      return [mergedSelectedKeys || [], []];
    }
    const {
      checkedKeys,
      halfCheckedKeys
    } = conductCheck(mergedSelectedKeys, true, keyEntities, isCheckboxDisabled);
    return [checkedKeys || [], halfCheckedKeys];
  }, [mergedSelectedKeys, checkStrictly, keyEntities, isCheckboxDisabled]);
  const derivedSelectedKeySet = reactExports.useMemo(() => {
    const keys = selectionType === "radio" ? derivedSelectedKeys.slice(0, 1) : derivedSelectedKeys;
    return new Set(keys);
  }, [derivedSelectedKeys, selectionType]);
  const derivedHalfSelectedKeySet = reactExports.useMemo(() => selectionType === "radio" ? /* @__PURE__ */ new Set() : new Set(derivedHalfSelectedKeys), [derivedHalfSelectedKeys, selectionType]);
  reactExports.useEffect(() => {
    if (!rowSelection) {
      setMergedSelectedKeys(EMPTY_LIST$1);
    }
  }, [!!rowSelection]);
  const setSelectedKeys = reactExports.useCallback((keys, method) => {
    let availableKeys;
    let records;
    updatePreserveRecordsCache(keys);
    if (preserveSelectedRowKeys) {
      availableKeys = keys;
      records = keys.map((key) => preserveRecordsRef.current.get(key));
    } else {
      availableKeys = [];
      records = [];
      keys.forEach((key) => {
        const record = getRecordByKey(key);
        if (record !== void 0) {
          availableKeys.push(key);
          records.push(record);
        }
      });
    }
    setMergedSelectedKeys(availableKeys);
    onSelectionChange === null || onSelectionChange === void 0 ? void 0 : onSelectionChange(availableKeys, records, {
      type: method
    });
  }, [setMergedSelectedKeys, getRecordByKey, onSelectionChange, preserveSelectedRowKeys]);
  const triggerSingleSelection = reactExports.useCallback((key, selected, keys, event) => {
    if (onSelect) {
      const rows = keys.map((k) => getRecordByKey(k));
      onSelect(getRecordByKey(key), selected, rows, event);
    }
    setSelectedKeys(keys, "single");
  }, [onSelect, getRecordByKey, setSelectedKeys]);
  const mergedSelections = reactExports.useMemo(() => {
    if (!selections || hideSelectAll) {
      return null;
    }
    const selectionList = selections === true ? [SELECTION_ALL, SELECTION_INVERT, SELECTION_NONE] : selections;
    return selectionList.map((selection) => {
      if (selection === SELECTION_ALL) {
        return {
          key: "all",
          text: tableLocale.selectionAll,
          onSelect() {
            setSelectedKeys(data.map((record, index) => getRowKey(record, index)).filter((key) => {
              const checkProps = checkboxPropsMap.get(key);
              return !(checkProps === null || checkProps === void 0 ? void 0 : checkProps.disabled) || derivedSelectedKeySet.has(key);
            }), "all");
          }
        };
      }
      if (selection === SELECTION_INVERT) {
        return {
          key: "invert",
          text: tableLocale.selectInvert,
          onSelect() {
            const keySet = new Set(derivedSelectedKeySet);
            pageData.forEach((record, index) => {
              const key = getRowKey(record, index);
              const checkProps = checkboxPropsMap.get(key);
              if (!(checkProps === null || checkProps === void 0 ? void 0 : checkProps.disabled)) {
                if (keySet.has(key)) {
                  keySet.delete(key);
                } else {
                  keySet.add(key);
                }
              }
            });
            const keys = Array.from(keySet);
            if (onSelectInvert) {
              warning.deprecated(false, "onSelectInvert", "onChange");
              onSelectInvert(keys);
            }
            setSelectedKeys(keys, "invert");
          }
        };
      }
      if (selection === SELECTION_NONE) {
        return {
          key: "none",
          text: tableLocale.selectNone,
          onSelect() {
            onSelectNone === null || onSelectNone === void 0 ? void 0 : onSelectNone();
            setSelectedKeys(Array.from(derivedSelectedKeySet).filter((key) => {
              const checkProps = checkboxPropsMap.get(key);
              return checkProps === null || checkProps === void 0 ? void 0 : checkProps.disabled;
            }), "none");
          }
        };
      }
      return selection;
    }).map((selection) => Object.assign(Object.assign({}, selection), {
      onSelect: (...rest) => {
        var _a2;
        var _a;
        (_a = selection.onSelect) === null || _a === void 0 ? void 0 : (_a2 = _a).call.apply(_a2, [selection].concat(rest));
        updatePrevSelectedIndex(null);
      }
    }));
  }, [selections, derivedSelectedKeySet, pageData, getRowKey, onSelectInvert, setSelectedKeys]);
  const transformColumns = reactExports.useCallback((columns) => {
    var _a;
    if (!rowSelection) {
      return columns.filter((col) => col !== SELECTION_COLUMN);
    }
    let cloneColumns = _toConsumableArray(columns);
    const keySet = new Set(derivedSelectedKeySet);
    const recordKeys = flattedData.map(getRowKey).filter((key) => !checkboxPropsMap.get(key).disabled);
    const checkedCurrentAll = recordKeys.every((key) => keySet.has(key));
    const checkedCurrentSome = recordKeys.some((key) => keySet.has(key));
    const onSelectAllChange = () => {
      const changeKeys = [];
      if (checkedCurrentAll) {
        recordKeys.forEach((key) => {
          keySet.delete(key);
          changeKeys.push(key);
        });
      } else {
        recordKeys.forEach((key) => {
          if (!keySet.has(key)) {
            keySet.add(key);
            changeKeys.push(key);
          }
        });
      }
      const keys = Array.from(keySet);
      onSelectAll === null || onSelectAll === void 0 ? void 0 : onSelectAll(!checkedCurrentAll, keys.map((k) => getRecordByKey(k)), changeKeys.map((k) => getRecordByKey(k)));
      setSelectedKeys(keys, "all");
      updatePrevSelectedIndex(null);
    };
    let title;
    let columnTitleCheckbox;
    if (selectionType !== "radio") {
      let customizeSelections;
      if (mergedSelections) {
        const menu = {
          getPopupContainer,
          items: mergedSelections.map((selection, index) => {
            const {
              key,
              text,
              onSelect: onSelectionClick
            } = selection;
            return {
              key: key !== null && key !== void 0 ? key : index,
              onClick: () => {
                onSelectionClick === null || onSelectionClick === void 0 ? void 0 : onSelectionClick(recordKeys);
              },
              label: text
            };
          })
        };
        customizeSelections = /* @__PURE__ */ reactExports.createElement("div", {
          className: `${prefixCls}-selection-extra`
        }, /* @__PURE__ */ reactExports.createElement(Dropdown, {
          menu,
          getPopupContainer
        }, /* @__PURE__ */ reactExports.createElement("span", null, /* @__PURE__ */ reactExports.createElement(RefIcon$9, null))));
      }
      const allDisabledData = flattedData.map((record, index) => {
        const key = getRowKey(record, index);
        const checkboxProps = checkboxPropsMap.get(key) || {};
        return Object.assign({
          checked: keySet.has(key)
        }, checkboxProps);
      }).filter(({
        disabled
      }) => disabled);
      const allDisabled = !!allDisabledData.length && allDisabledData.length === flattedData.length;
      const allDisabledAndChecked = allDisabled && allDisabledData.every(({
        checked
      }) => checked);
      const allDisabledSomeChecked = allDisabled && allDisabledData.some(({
        checked
      }) => checked);
      columnTitleCheckbox = /* @__PURE__ */ reactExports.createElement(Checkbox, {
        checked: !allDisabled ? !!flattedData.length && checkedCurrentAll : allDisabledAndChecked,
        indeterminate: !allDisabled ? !checkedCurrentAll && checkedCurrentSome : !allDisabledAndChecked && allDisabledSomeChecked,
        onChange: onSelectAllChange,
        disabled: flattedData.length === 0 || allDisabled,
        "aria-label": customizeSelections ? "Custom selection" : "Select all",
        skipGroup: true
      });
      title = !hideSelectAll && /* @__PURE__ */ reactExports.createElement("div", {
        className: `${prefixCls}-selection`
      }, columnTitleCheckbox, customizeSelections);
    }
    let renderCell;
    if (selectionType === "radio") {
      renderCell = (_, record, index) => {
        const key = getRowKey(record, index);
        const checked = keySet.has(key);
        const checkboxProps = checkboxPropsMap.get(key);
        return {
          node: /* @__PURE__ */ reactExports.createElement(Radio, Object.assign({}, checkboxProps, {
            checked,
            onClick: (e2) => {
              var _a2;
              e2.stopPropagation();
              (_a2 = checkboxProps === null || checkboxProps === void 0 ? void 0 : checkboxProps.onClick) === null || _a2 === void 0 ? void 0 : _a2.call(checkboxProps, e2);
            },
            onChange: (event) => {
              var _a2;
              if (!keySet.has(key)) {
                triggerSingleSelection(key, true, [key], event.nativeEvent);
              }
              (_a2 = checkboxProps === null || checkboxProps === void 0 ? void 0 : checkboxProps.onChange) === null || _a2 === void 0 ? void 0 : _a2.call(checkboxProps, event);
            }
          })),
          checked
        };
      };
    } else {
      renderCell = (_, record, index) => {
        var _a2;
        const key = getRowKey(record, index);
        const checked = keySet.has(key);
        const indeterminate = derivedHalfSelectedKeySet.has(key);
        const checkboxProps = checkboxPropsMap.get(key);
        let mergedIndeterminate;
        if (expandType === "nest") {
          mergedIndeterminate = indeterminate;
        } else {
          mergedIndeterminate = (_a2 = checkboxProps === null || checkboxProps === void 0 ? void 0 : checkboxProps.indeterminate) !== null && _a2 !== void 0 ? _a2 : indeterminate;
        }
        return {
          node: /* @__PURE__ */ reactExports.createElement(Checkbox, Object.assign({}, checkboxProps, {
            indeterminate: mergedIndeterminate,
            checked,
            skipGroup: true,
            onClick: (e2) => {
              var _a3;
              e2.stopPropagation();
              (_a3 = checkboxProps === null || checkboxProps === void 0 ? void 0 : checkboxProps.onClick) === null || _a3 === void 0 ? void 0 : _a3.call(checkboxProps, e2);
            },
            onChange: (event) => {
              var _a3;
              const {
                nativeEvent
              } = event;
              const {
                shiftKey
              } = nativeEvent;
              const currentSelectedIndex = recordKeys.findIndex((item) => item === key);
              const isMultiple = derivedSelectedKeys.some((item) => recordKeys.includes(item));
              if (shiftKey && checkStrictly && isMultiple) {
                const changedKeys = multipleSelect(currentSelectedIndex, recordKeys, keySet);
                const keys = Array.from(keySet);
                onSelectMultiple === null || onSelectMultiple === void 0 ? void 0 : onSelectMultiple(!checked, keys.map((recordKey) => getRecordByKey(recordKey)), changedKeys.map((recordKey) => getRecordByKey(recordKey)));
                setSelectedKeys(keys, "multiple");
              } else {
                const originCheckedKeys = derivedSelectedKeys;
                if (checkStrictly) {
                  const checkedKeys = checked ? arrDel(originCheckedKeys, key) : arrAdd(originCheckedKeys, key);
                  triggerSingleSelection(key, !checked, checkedKeys, nativeEvent);
                } else {
                  const result = conductCheck([].concat(_toConsumableArray(originCheckedKeys), [key]), true, keyEntities, isCheckboxDisabled);
                  const {
                    checkedKeys,
                    halfCheckedKeys
                  } = result;
                  let nextCheckedKeys = checkedKeys;
                  if (checked) {
                    const tempKeySet = new Set(checkedKeys);
                    tempKeySet.delete(key);
                    nextCheckedKeys = conductCheck(Array.from(tempKeySet), {
                      halfCheckedKeys
                    }, keyEntities, isCheckboxDisabled).checkedKeys;
                  }
                  triggerSingleSelection(key, !checked, nextCheckedKeys, nativeEvent);
                }
              }
              if (checked) {
                updatePrevSelectedIndex(null);
              } else {
                updatePrevSelectedIndex(currentSelectedIndex);
              }
              (_a3 = checkboxProps === null || checkboxProps === void 0 ? void 0 : checkboxProps.onChange) === null || _a3 === void 0 ? void 0 : _a3.call(checkboxProps, event);
            }
          })),
          checked
        };
      };
    }
    const renderSelectionCell = (_, record, index) => {
      const {
        node,
        checked
      } = renderCell(_, record, index);
      if (customizeRenderCell) {
        return customizeRenderCell(checked, record, index, node);
      }
      return node;
    };
    if (!cloneColumns.includes(SELECTION_COLUMN)) {
      if (cloneColumns.findIndex((col) => {
        var _a2;
        return ((_a2 = col[INTERNAL_COL_DEFINE]) === null || _a2 === void 0 ? void 0 : _a2.columnType) === "EXPAND_COLUMN";
      }) === 0) {
        const [expandColumn, ...restColumns] = cloneColumns;
        cloneColumns = [expandColumn, SELECTION_COLUMN].concat(_toConsumableArray(restColumns));
      } else {
        cloneColumns = [SELECTION_COLUMN].concat(_toConsumableArray(cloneColumns));
      }
    }
    const selectionColumnIndex = cloneColumns.indexOf(SELECTION_COLUMN);
    cloneColumns = cloneColumns.filter((column, index) => column !== SELECTION_COLUMN || index === selectionColumnIndex);
    const prevCol = cloneColumns[selectionColumnIndex - 1];
    const nextCol = cloneColumns[selectionColumnIndex + 1];
    let mergedFixed = fixed;
    if (mergedFixed === void 0) {
      if ((nextCol === null || nextCol === void 0 ? void 0 : nextCol.fixed) !== void 0) {
        mergedFixed = nextCol.fixed;
      } else if ((prevCol === null || prevCol === void 0 ? void 0 : prevCol.fixed) !== void 0) {
        mergedFixed = prevCol.fixed;
      }
    }
    if (mergedFixed && prevCol && ((_a = prevCol[INTERNAL_COL_DEFINE]) === null || _a === void 0 ? void 0 : _a.columnType) === "EXPAND_COLUMN" && prevCol.fixed === void 0) {
      prevCol.fixed = mergedFixed;
    }
    const columnCls = classNames(`${prefixCls}-selection-col`, {
      [`${prefixCls}-selection-col-with-dropdown`]: selections && selectionType === "checkbox"
    });
    const renderColumnTitle2 = () => {
      if (!(rowSelection === null || rowSelection === void 0 ? void 0 : rowSelection.columnTitle)) {
        return title;
      }
      if (typeof rowSelection.columnTitle === "function") {
        return rowSelection.columnTitle(columnTitleCheckbox);
      }
      return rowSelection.columnTitle;
    };
    const selectionColumn = {
      fixed: mergedFixed,
      width: selectionColWidth,
      className: `${prefixCls}-selection-column`,
      title: renderColumnTitle2(),
      render: renderSelectionCell,
      onCell: rowSelection.onCell,
      align: rowSelection.align,
      [INTERNAL_COL_DEFINE]: {
        className: columnCls
      }
    };
    return cloneColumns.map((col) => col === SELECTION_COLUMN ? selectionColumn : col);
  }, [getRowKey, flattedData, rowSelection, derivedSelectedKeys, derivedSelectedKeySet, derivedHalfSelectedKeySet, selectionColWidth, mergedSelections, expandType, checkboxPropsMap, onSelectMultiple, triggerSingleSelection, isCheckboxDisabled]);
  return [transformColumns, derivedSelectedKeySet];
};
function fillProxy(element, handler) {
  element._antProxy = element._antProxy || {};
  Object.keys(handler).forEach((key) => {
    if (!(key in element._antProxy)) {
      const ori = element[key];
      element._antProxy[key] = ori;
      element[key] = handler[key];
    }
  });
  return element;
}
function useProxyImperativeHandle(ref, init) {
  return reactExports.useImperativeHandle(ref, () => {
    const refObj = init();
    const {
      nativeElement
    } = refObj;
    if (typeof Proxy !== "undefined") {
      return new Proxy(nativeElement, {
        get(obj, prop) {
          if (refObj[prop]) {
            return refObj[prop];
          }
          return Reflect.get(obj, prop);
        }
      });
    }
    return fillProxy(nativeElement, refObj);
  });
}
function renderExpandIcon(locale2) {
  return (props) => {
    const {
      prefixCls,
      onExpand,
      record,
      expanded,
      expandable
    } = props;
    const iconPrefix = `${prefixCls}-row-expand-icon`;
    return /* @__PURE__ */ reactExports.createElement("button", {
      type: "button",
      onClick: (e2) => {
        onExpand(record, e2);
        e2.stopPropagation();
      },
      className: classNames(iconPrefix, {
        [`${iconPrefix}-spaced`]: !expandable,
        [`${iconPrefix}-expanded`]: expandable && expanded,
        [`${iconPrefix}-collapsed`]: expandable && !expanded
      }),
      "aria-label": expanded ? locale2.collapse : locale2.expand,
      "aria-expanded": expanded
    });
  };
}
function useContainerWidth(prefixCls) {
  const getContainerWidth = (ele, width) => {
    const container = ele.querySelector(`.${prefixCls}-container`);
    let returnWidth = width;
    if (container) {
      const style = getComputedStyle(container);
      const borderLeft = parseInt(style.borderLeftWidth, 10);
      const borderRight = parseInt(style.borderRightWidth, 10);
      returnWidth = width - borderLeft - borderRight;
    }
    return returnWidth;
  };
  return getContainerWidth;
}
const getColumnKey = (column, defaultKey) => {
  if ("key" in column && column.key !== void 0 && column.key !== null) {
    return column.key;
  }
  if (column.dataIndex) {
    return Array.isArray(column.dataIndex) ? column.dataIndex.join(".") : column.dataIndex;
  }
  return defaultKey;
};
function getColumnPos(index, pos) {
  return pos ? `${pos}-${index}` : `${index}`;
}
const renderColumnTitle = (title, props) => {
  if (typeof title === "function") {
    return title(props);
  }
  return title;
};
const safeColumnTitle = (title, props) => {
  const res = renderColumnTitle(title, props);
  if (Object.prototype.toString.call(res) === "[object Object]") {
    return "";
  }
  return res;
};
function useSyncState(initialValue) {
  const ref = reactExports.useRef(initialValue);
  const forceUpdate = useForceUpdate();
  return [() => ref.current, (newValue) => {
    ref.current = newValue;
    forceUpdate();
  }];
}
const genDirectoryStyle = ({
  treeCls,
  treeNodeCls,
  directoryNodeSelectedBg,
  directoryNodeSelectedColor,
  motionDurationMid,
  borderRadius,
  controlItemBgHover
}) => ({
  [`${treeCls}${treeCls}-directory ${treeNodeCls}`]: {
    // >>> Title
    [`${treeCls}-node-content-wrapper`]: {
      position: "static",
      [`&:has(${treeCls}-drop-indicator)`]: {
        position: "relative"
      },
      [`> *:not(${treeCls}-drop-indicator)`]: {
        position: "relative"
      },
      "&:hover": {
        background: "transparent"
      },
      // Expand interactive area to whole line
      "&:before": {
        position: "absolute",
        inset: 0,
        transition: `background-color ${motionDurationMid}`,
        content: '""',
        borderRadius
      },
      "&:hover:before": {
        background: controlItemBgHover
      }
    },
    [`${treeCls}-switcher, ${treeCls}-checkbox, ${treeCls}-draggable-icon`]: {
      zIndex: 1
    },
    // ============= Selected =============
    "&-selected": {
      background: directoryNodeSelectedBg,
      borderRadius,
      [`${treeCls}-switcher, ${treeCls}-draggable-icon`]: {
        color: directoryNodeSelectedColor
      },
      // >>> Title
      [`${treeCls}-node-content-wrapper`]: {
        color: directoryNodeSelectedColor,
        background: "transparent",
        "&:before, &:hover:before": {
          background: directoryNodeSelectedBg
        }
      }
    }
  }
});
const treeNodeFX = new Keyframe("ant-tree-node-fx-do-not-use", {
  "0%": {
    opacity: 0
  },
  "100%": {
    opacity: 1
  }
});
const getSwitchStyle = (prefixCls, token) => ({
  [`.${prefixCls}-switcher-icon`]: {
    display: "inline-block",
    fontSize: 10,
    verticalAlign: "baseline",
    svg: {
      transition: `transform ${token.motionDurationSlow}`
    }
  }
});
const getDropIndicatorStyle = (prefixCls, token) => ({
  [`.${prefixCls}-drop-indicator`]: {
    position: "absolute",
    // it should displayed over the following node
    zIndex: 1,
    height: 2,
    backgroundColor: token.colorPrimary,
    borderRadius: 1,
    pointerEvents: "none",
    "&:after": {
      position: "absolute",
      top: -3,
      insetInlineStart: -6,
      width: 8,
      height: 8,
      backgroundColor: "transparent",
      border: `${unit(token.lineWidthBold)} solid ${token.colorPrimary}`,
      borderRadius: "50%",
      content: '""'
    }
  }
});
const genBaseStyle$1 = (prefixCls, token) => {
  const {
    treeCls,
    treeNodeCls,
    treeNodePadding,
    titleHeight,
    indentSize,
    nodeSelectedBg,
    nodeHoverBg,
    colorTextQuaternary,
    controlItemBgActiveDisabled
  } = token;
  return {
    [treeCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      // fix https://github.com/ant-design/ant-design/issues/50316
      ["--rc-virtual-list-scrollbar-bg"]: token.colorSplit,
      background: token.colorBgContainer,
      borderRadius: token.borderRadius,
      transition: `background-color ${token.motionDurationSlow}`,
      "&-rtl": {
        direction: "rtl"
      },
      [`&${treeCls}-rtl ${treeCls}-switcher_close ${treeCls}-switcher-icon svg`]: {
        transform: "rotate(90deg)"
      },
      [`&-focused:not(:hover):not(${treeCls}-active-focused)`]: Object.assign({}, genFocusOutline(token)),
      // =================== Virtual List ===================
      [`${treeCls}-list-holder-inner`]: {
        alignItems: "flex-start"
      },
      [`&${treeCls}-block-node`]: {
        [`${treeCls}-list-holder-inner`]: {
          alignItems: "stretch",
          // >>> Title
          [`${treeCls}-node-content-wrapper`]: {
            flex: "auto"
          },
          // >>> Drag
          [`${treeNodeCls}.dragging:after`]: {
            position: "absolute",
            inset: 0,
            border: `1px solid ${token.colorPrimary}`,
            opacity: 0,
            animationName: treeNodeFX,
            animationDuration: token.motionDurationSlow,
            animationPlayState: "running",
            animationFillMode: "forwards",
            content: '""',
            pointerEvents: "none",
            borderRadius: token.borderRadius
          }
        }
      },
      // ===================== TreeNode =====================
      [treeNodeCls]: {
        display: "flex",
        alignItems: "flex-start",
        marginBottom: treeNodePadding,
        lineHeight: unit(titleHeight),
        position: "relative",
        // 非常重要，避免 drop-indicator 在拖拽过程中闪烁
        "&:before": {
          content: '""',
          position: "absolute",
          zIndex: 1,
          insetInlineStart: 0,
          width: "100%",
          top: "100%",
          height: treeNodePadding
        },
        // Disabled
        [`&-disabled ${treeCls}-node-content-wrapper`]: {
          color: token.colorTextDisabled,
          cursor: "not-allowed",
          "&:hover": {
            background: "transparent"
          }
        },
        [`${treeCls}-checkbox-disabled + ${treeCls}-node-selected,&${treeNodeCls}-disabled${treeNodeCls}-selected ${treeCls}-node-content-wrapper`]: {
          backgroundColor: controlItemBgActiveDisabled
        },
        // we can not set pointer-events to none for checkbox in tree
        // ref: https://github.com/ant-design/ant-design/issues/39822#issuecomment-2605234058
        [`${treeCls}-checkbox-disabled`]: {
          pointerEvents: "unset"
        },
        // not disable
        [`&:not(${treeNodeCls}-disabled)`]: {
          // >>> Title
          [`${treeCls}-node-content-wrapper`]: {
            "&:hover": {
              color: token.nodeHoverColor
            }
          }
        },
        [`&-active ${treeCls}-node-content-wrapper`]: {
          background: token.controlItemBgHover
        },
        [`&:not(${treeNodeCls}-disabled).filter-node ${treeCls}-title`]: {
          color: token.colorPrimary,
          fontWeight: token.fontWeightStrong
        },
        "&-draggable": {
          cursor: "grab",
          [`${treeCls}-draggable-icon`]: {
            // https://github.com/ant-design/ant-design/issues/41915
            flexShrink: 0,
            width: titleHeight,
            textAlign: "center",
            visibility: "visible",
            color: colorTextQuaternary
          },
          [`&${treeNodeCls}-disabled ${treeCls}-draggable-icon`]: {
            visibility: "hidden"
          }
        }
      },
      // >>> Indent
      [`${treeCls}-indent`]: {
        alignSelf: "stretch",
        whiteSpace: "nowrap",
        userSelect: "none",
        "&-unit": {
          display: "inline-block",
          width: indentSize
        }
      },
      // >>> Drag Handler
      [`${treeCls}-draggable-icon`]: {
        visibility: "hidden"
      },
      // Switcher / Checkbox
      [`${treeCls}-switcher, ${treeCls}-checkbox`]: {
        marginInlineEnd: token.calc(token.calc(titleHeight).sub(token.controlInteractiveSize)).div(2).equal()
      },
      // >>> Switcher
      [`${treeCls}-switcher`]: Object.assign(Object.assign({}, getSwitchStyle(prefixCls, token)), {
        position: "relative",
        flex: "none",
        alignSelf: "stretch",
        width: titleHeight,
        textAlign: "center",
        cursor: "pointer",
        userSelect: "none",
        transition: `all ${token.motionDurationSlow}`,
        "&-noop": {
          cursor: "unset"
        },
        "&:before": {
          pointerEvents: "none",
          content: '""',
          width: titleHeight,
          height: titleHeight,
          position: "absolute",
          left: {
            _skip_check_: true,
            value: 0
          },
          top: 0,
          borderRadius: token.borderRadius,
          transition: `all ${token.motionDurationSlow}`
        },
        [`&:not(${treeCls}-switcher-noop):hover:before`]: {
          backgroundColor: token.colorBgTextHover
        },
        [`&_close ${treeCls}-switcher-icon svg`]: {
          transform: "rotate(-90deg)"
        },
        "&-loading-icon": {
          color: token.colorPrimary
        },
        "&-leaf-line": {
          position: "relative",
          zIndex: 1,
          display: "inline-block",
          width: "100%",
          height: "100%",
          // https://github.com/ant-design/ant-design/issues/31884
          "&:before": {
            position: "absolute",
            top: 0,
            insetInlineEnd: token.calc(titleHeight).div(2).equal(),
            bottom: token.calc(treeNodePadding).mul(-1).equal(),
            marginInlineStart: -1,
            borderInlineEnd: `1px solid ${token.colorBorder}`,
            content: '""'
          },
          "&:after": {
            position: "absolute",
            width: token.calc(token.calc(titleHeight).div(2).equal()).mul(0.8).equal(),
            height: token.calc(titleHeight).div(2).equal(),
            borderBottom: `1px solid ${token.colorBorder}`,
            content: '""'
          }
        }
      }),
      // >>> Title
      // add `${treeCls}-checkbox + span` to cover checkbox `${checkboxCls} + span`
      [`${treeCls}-node-content-wrapper`]: Object.assign(Object.assign({
        position: "relative",
        minHeight: titleHeight,
        paddingBlock: 0,
        paddingInline: token.paddingXS,
        background: "transparent",
        borderRadius: token.borderRadius,
        cursor: "pointer",
        transition: `all ${token.motionDurationMid}, border 0s, line-height 0s, box-shadow 0s`
      }, getDropIndicatorStyle(prefixCls, token)), {
        "&:hover": {
          backgroundColor: nodeHoverBg
        },
        [`&${treeCls}-node-selected`]: {
          color: token.nodeSelectedColor,
          backgroundColor: nodeSelectedBg
        },
        // Icon
        [`${treeCls}-iconEle`]: {
          display: "inline-block",
          width: titleHeight,
          height: titleHeight,
          textAlign: "center",
          verticalAlign: "top",
          "&:empty": {
            display: "none"
          }
        }
      }),
      // https://github.com/ant-design/ant-design/issues/28217
      [`${treeCls}-unselectable ${treeCls}-node-content-wrapper:hover`]: {
        backgroundColor: "transparent"
      },
      [`${treeNodeCls}.drop-container > [draggable]`]: {
        boxShadow: `0 0 0 2px ${token.colorPrimary}`
      },
      // ==================== Show Line =====================
      "&-show-line": {
        // ================ Indent lines ================
        [`${treeCls}-indent-unit`]: {
          position: "relative",
          height: "100%",
          "&:before": {
            position: "absolute",
            top: 0,
            insetInlineEnd: token.calc(titleHeight).div(2).equal(),
            bottom: token.calc(treeNodePadding).mul(-1).equal(),
            borderInlineEnd: `1px solid ${token.colorBorder}`,
            content: '""'
          },
          "&-end:before": {
            display: "none"
          }
        },
        // ============== Cover Background ==============
        [`${treeCls}-switcher`]: {
          background: "transparent",
          "&-line-icon": {
            // https://github.com/ant-design/ant-design/issues/32813
            verticalAlign: "-0.15em"
          }
        }
      },
      [`${treeNodeCls}-leaf-last ${treeCls}-switcher-leaf-line:before`]: {
        top: "auto !important",
        bottom: "auto !important",
        height: `${unit(token.calc(titleHeight).div(2).equal())} !important`
      }
    })
  };
};
const genTreeStyle = (prefixCls, token, enableDirectory = true) => {
  const treeCls = `.${prefixCls}`;
  const treeNodeCls = `${treeCls}-treenode`;
  const treeNodePadding = token.calc(token.paddingXS).div(2).equal();
  const treeToken = merge$1(token, {
    treeCls,
    treeNodeCls,
    treeNodePadding
  });
  return [
    // Basic
    genBaseStyle$1(prefixCls, treeToken),
    // Directory
    enableDirectory && genDirectoryStyle(treeToken)
  ].filter(Boolean);
};
const initComponentToken = (token) => {
  const {
    controlHeightSM,
    controlItemBgHover,
    controlItemBgActive
  } = token;
  const titleHeight = controlHeightSM;
  return {
    titleHeight,
    indentSize: titleHeight,
    nodeHoverBg: controlItemBgHover,
    nodeHoverColor: token.colorText,
    nodeSelectedBg: controlItemBgActive,
    nodeSelectedColor: token.colorText
  };
};
const prepareComponentToken$3 = (token) => {
  const {
    colorTextLightSolid,
    colorPrimary
  } = token;
  return Object.assign(Object.assign({}, initComponentToken(token)), {
    directoryNodeSelectedColor: colorTextLightSolid,
    directoryNodeSelectedBg: colorPrimary
  });
};
const useStyle$3 = genStyleHooks("Tree", (token, {
  prefixCls
}) => [{
  [token.componentCls]: getStyle(`${prefixCls}-checkbox`, token)
}, genTreeStyle(prefixCls, token), genCollapseMotion(token)], prepareComponentToken$3);
const offset = 4;
function dropIndicatorRender(props) {
  const {
    dropPosition,
    dropLevelOffset,
    prefixCls,
    indent,
    direction = "ltr"
  } = props;
  const startPosition = direction === "ltr" ? "left" : "right";
  const endPosition = direction === "ltr" ? "right" : "left";
  const style = {
    [startPosition]: -dropLevelOffset * indent + offset,
    [endPosition]: 0
  };
  switch (dropPosition) {
    case -1:
      style.top = -3;
      break;
    case 1:
      style.bottom = -3;
      break;
    default:
      style.bottom = -3;
      style[startPosition] = indent + offset;
      break;
  }
  return /* @__PURE__ */ React.createElement("div", {
    style,
    className: `${prefixCls}-drop-indicator`
  });
}
const SwitcherIconCom = (props) => {
  var _a, _b;
  const {
    prefixCls,
    switcherIcon,
    treeNodeProps,
    showLine,
    switcherLoadingIcon
  } = props;
  const {
    isLeaf,
    expanded,
    loading
  } = treeNodeProps;
  if (loading) {
    if (/* @__PURE__ */ reactExports.isValidElement(switcherLoadingIcon)) {
      return switcherLoadingIcon;
    }
    return /* @__PURE__ */ reactExports.createElement(RefIcon, {
      className: `${prefixCls}-switcher-loading-icon`
    });
  }
  let showLeafIcon;
  if (showLine && typeof showLine === "object") {
    showLeafIcon = showLine.showLeafIcon;
  }
  if (isLeaf) {
    if (!showLine) {
      return null;
    }
    if (typeof showLeafIcon !== "boolean" && !!showLeafIcon) {
      const leafIcon = typeof showLeafIcon === "function" ? showLeafIcon(treeNodeProps) : showLeafIcon;
      const leafCls = `${prefixCls}-switcher-line-custom-icon`;
      if (/* @__PURE__ */ reactExports.isValidElement(leafIcon)) {
        return cloneElement(leafIcon, {
          className: classNames((_a = leafIcon.props) === null || _a === void 0 ? void 0 : _a.className, leafCls)
        });
      }
      return leafIcon;
    }
    return showLeafIcon ? /* @__PURE__ */ reactExports.createElement(RefIcon$m, {
      className: `${prefixCls}-switcher-line-icon`
    }) : /* @__PURE__ */ reactExports.createElement("span", {
      className: `${prefixCls}-switcher-leaf-line`
    });
  }
  const switcherCls = `${prefixCls}-switcher-icon`;
  const switcher = typeof switcherIcon === "function" ? switcherIcon(treeNodeProps) : switcherIcon;
  if (/* @__PURE__ */ reactExports.isValidElement(switcher)) {
    return cloneElement(switcher, {
      className: classNames((_b = switcher.props) === null || _b === void 0 ? void 0 : _b.className, switcherCls)
    });
  }
  if (switcher !== void 0) {
    return switcher;
  }
  if (showLine) {
    return expanded ? /* @__PURE__ */ reactExports.createElement(RefIcon$n, {
      className: `${prefixCls}-switcher-line-icon`
    }) : /* @__PURE__ */ reactExports.createElement(RefIcon$o, {
      className: `${prefixCls}-switcher-line-icon`
    });
  }
  return /* @__PURE__ */ reactExports.createElement(RefIcon$p, {
    className: switcherCls
  });
};
const Tree$1 = /* @__PURE__ */ React.forwardRef((props, ref) => {
  var _a;
  const {
    getPrefixCls,
    direction,
    virtual,
    tree
  } = React.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    showIcon = false,
    showLine,
    switcherIcon,
    switcherLoadingIcon,
    blockNode = false,
    children,
    checkable = false,
    selectable = true,
    draggable,
    motion: customMotion,
    style
  } = props;
  const prefixCls = getPrefixCls("tree", customizePrefixCls);
  const rootPrefixCls = getPrefixCls();
  const motion2 = customMotion !== null && customMotion !== void 0 ? customMotion : Object.assign(Object.assign({}, initCollapseMotion(rootPrefixCls)), {
    motionAppear: false
  });
  const newProps = Object.assign(Object.assign({}, props), {
    checkable,
    selectable,
    showIcon,
    motion: motion2,
    blockNode,
    showLine: Boolean(showLine),
    dropIndicatorRender
  });
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$3(prefixCls);
  const [, token] = useToken();
  const itemHeight = token.paddingXS / 2 + (((_a = token.Tree) === null || _a === void 0 ? void 0 : _a.titleHeight) || token.controlHeightSM);
  const draggableConfig = React.useMemo(() => {
    if (!draggable) {
      return false;
    }
    let mergedDraggable = {};
    switch (typeof draggable) {
      case "function":
        mergedDraggable.nodeDraggable = draggable;
        break;
      case "object":
        mergedDraggable = Object.assign({}, draggable);
        break;
    }
    if (mergedDraggable.icon !== false) {
      mergedDraggable.icon = mergedDraggable.icon || /* @__PURE__ */ React.createElement(RefIcon$q, null);
    }
    return mergedDraggable;
  }, [draggable]);
  const renderSwitcherIcon = (nodeProps) => /* @__PURE__ */ React.createElement(SwitcherIconCom, {
    prefixCls,
    switcherIcon,
    switcherLoadingIcon,
    treeNodeProps: nodeProps,
    showLine
  });
  return wrapCSSVar(
    // @ts-ignore
    /* @__PURE__ */ React.createElement(Tree$2, Object.assign({
      itemHeight,
      ref,
      virtual
    }, newProps, {
      // newProps may contain style so declare style below it
      style: Object.assign(Object.assign({}, tree === null || tree === void 0 ? void 0 : tree.style), style),
      prefixCls,
      className: classNames({
        [`${prefixCls}-icon-hide`]: !showIcon,
        [`${prefixCls}-block-node`]: blockNode,
        [`${prefixCls}-unselectable`]: !selectable,
        [`${prefixCls}-rtl`]: direction === "rtl"
      }, tree === null || tree === void 0 ? void 0 : tree.className, className, hashId, cssVarCls),
      direction,
      checkable: checkable ? /* @__PURE__ */ React.createElement("span", {
        className: `${prefixCls}-checkbox-inner`
      }) : checkable,
      selectable,
      switcherIcon: renderSwitcherIcon,
      draggable: draggableConfig
    }), children)
  );
});
const RECORD_NONE = 0;
const RECORD_START = 1;
const RECORD_END = 2;
function traverseNodesKey(treeData, callback, fieldNames) {
  const {
    key: fieldKey,
    children: fieldChildren
  } = fieldNames;
  function processNode(dataNode) {
    const key = dataNode[fieldKey];
    const children = dataNode[fieldChildren];
    if (callback(key, dataNode) !== false) {
      traverseNodesKey(children || [], callback, fieldNames);
    }
  }
  treeData.forEach(processNode);
}
function calcRangeKeys({
  treeData,
  expandedKeys,
  startKey,
  endKey,
  fieldNames
}) {
  const keys = [];
  let record = RECORD_NONE;
  if (startKey && startKey === endKey) {
    return [startKey];
  }
  if (!startKey || !endKey) {
    return [];
  }
  function matchKey(key) {
    return key === startKey || key === endKey;
  }
  traverseNodesKey(treeData, (key) => {
    if (record === RECORD_END) {
      return false;
    }
    if (matchKey(key)) {
      keys.push(key);
      if (record === RECORD_NONE) {
        record = RECORD_START;
      } else if (record === RECORD_START) {
        record = RECORD_END;
        return false;
      }
    } else if (record === RECORD_START) {
      keys.push(key);
    }
    return expandedKeys.includes(key);
  }, fillFieldNames(fieldNames));
  return keys;
}
function convertDirectoryKeysToNodes(treeData, keys, fieldNames) {
  const restKeys = _toConsumableArray(keys);
  const nodes = [];
  traverseNodesKey(treeData, (key, node) => {
    const index = restKeys.indexOf(key);
    if (index !== -1) {
      nodes.push(node);
      restKeys.splice(index, 1);
    }
    return !!restKeys.length;
  }, fillFieldNames(fieldNames));
  return nodes;
}
var __rest$8 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function getIcon(props) {
  const {
    isLeaf,
    expanded
  } = props;
  if (isLeaf) {
    return /* @__PURE__ */ reactExports.createElement(RefIcon$m, null);
  }
  return expanded ? /* @__PURE__ */ reactExports.createElement(RefIcon$r, null) : /* @__PURE__ */ reactExports.createElement(RefIcon$s, null);
}
function getTreeData({
  treeData,
  children
}) {
  return treeData || convertTreeToData(children);
}
const DirectoryTree = (_a, ref) => {
  var {
    defaultExpandAll,
    defaultExpandParent,
    defaultExpandedKeys
  } = _a, props = __rest$8(_a, ["defaultExpandAll", "defaultExpandParent", "defaultExpandedKeys"]);
  const lastSelectedKey = reactExports.useRef(null);
  const cachedSelectedKeys = reactExports.useRef(null);
  const getInitExpandedKeys = () => {
    const {
      keyEntities
    } = convertDataToEntities(getTreeData(props));
    let initExpandedKeys;
    if (defaultExpandAll) {
      initExpandedKeys = Object.keys(keyEntities);
    } else if (defaultExpandParent) {
      initExpandedKeys = conductExpandParent(props.expandedKeys || defaultExpandedKeys || [], keyEntities);
    } else {
      initExpandedKeys = props.expandedKeys || defaultExpandedKeys || [];
    }
    return initExpandedKeys;
  };
  const [selectedKeys, setSelectedKeys] = reactExports.useState(props.selectedKeys || props.defaultSelectedKeys || []);
  const [expandedKeys, setExpandedKeys] = reactExports.useState(() => getInitExpandedKeys());
  reactExports.useEffect(() => {
    if ("selectedKeys" in props) {
      setSelectedKeys(props.selectedKeys);
    }
  }, [props.selectedKeys]);
  reactExports.useEffect(() => {
    if ("expandedKeys" in props) {
      setExpandedKeys(props.expandedKeys);
    }
  }, [props.expandedKeys]);
  const onExpand = (keys, info) => {
    var _a2;
    if (!("expandedKeys" in props)) {
      setExpandedKeys(keys);
    }
    return (_a2 = props.onExpand) === null || _a2 === void 0 ? void 0 : _a2.call(props, keys, info);
  };
  const onSelect = (keys, event) => {
    var _a2;
    const {
      multiple,
      fieldNames
    } = props;
    const {
      node,
      nativeEvent
    } = event;
    const {
      key = ""
    } = node;
    const treeData = getTreeData(props);
    const newEvent = Object.assign(Object.assign({}, event), {
      selected: true
    });
    const ctrlPick = (nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.ctrlKey) || (nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.metaKey);
    const shiftPick = nativeEvent === null || nativeEvent === void 0 ? void 0 : nativeEvent.shiftKey;
    let newSelectedKeys;
    if (multiple && ctrlPick) {
      newSelectedKeys = keys;
      lastSelectedKey.current = key;
      cachedSelectedKeys.current = newSelectedKeys;
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys, fieldNames);
    } else if (multiple && shiftPick) {
      newSelectedKeys = Array.from(new Set([].concat(_toConsumableArray(cachedSelectedKeys.current || []), _toConsumableArray(calcRangeKeys({
        treeData,
        expandedKeys,
        startKey: key,
        endKey: lastSelectedKey.current,
        fieldNames
      })))));
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys, fieldNames);
    } else {
      newSelectedKeys = [key];
      lastSelectedKey.current = key;
      cachedSelectedKeys.current = newSelectedKeys;
      newEvent.selectedNodes = convertDirectoryKeysToNodes(treeData, newSelectedKeys, fieldNames);
    }
    (_a2 = props.onSelect) === null || _a2 === void 0 ? void 0 : _a2.call(props, newSelectedKeys, newEvent);
    if (!("selectedKeys" in props)) {
      setSelectedKeys(newSelectedKeys);
    }
  };
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const {
    prefixCls: customizePrefixCls,
    className,
    showIcon = true,
    expandAction = "click"
  } = props, otherProps = __rest$8(props, ["prefixCls", "className", "showIcon", "expandAction"]);
  const prefixCls = getPrefixCls("tree", customizePrefixCls);
  const connectClassName = classNames(`${prefixCls}-directory`, {
    [`${prefixCls}-directory-rtl`]: direction === "rtl"
  }, className);
  return /* @__PURE__ */ reactExports.createElement(Tree$1, Object.assign({
    icon: getIcon,
    ref,
    blockNode: true
  }, otherProps, {
    showIcon,
    expandAction,
    prefixCls,
    className: connectClassName,
    expandedKeys,
    selectedKeys,
    onSelect,
    onExpand
  }));
};
const ForwardDirectoryTree = /* @__PURE__ */ reactExports.forwardRef(DirectoryTree);
const Tree = Tree$1;
Tree.DirectoryTree = ForwardDirectoryTree;
Tree.TreeNode = TreeNode;
const FilterSearch = (props) => {
  const {
    value,
    filterSearch,
    tablePrefixCls,
    locale: locale2,
    onChange
  } = props;
  if (!filterSearch) {
    return null;
  }
  return /* @__PURE__ */ reactExports.createElement("div", {
    className: `${tablePrefixCls}-filter-dropdown-search`
  }, /* @__PURE__ */ reactExports.createElement(Input$1, {
    prefix: /* @__PURE__ */ reactExports.createElement(RefIcon$8, null),
    placeholder: locale2.filterSearchPlaceholder,
    onChange,
    value,
    // for skip min-width of input
    htmlSize: 1,
    className: `${tablePrefixCls}-filter-dropdown-search-input`
  }));
};
const onKeyDown = (event) => {
  const {
    keyCode
  } = event;
  if (keyCode === KeyCode.ENTER) {
    event.stopPropagation();
  }
};
const FilterDropdownMenuWrapper = /* @__PURE__ */ reactExports.forwardRef((props, ref) => /* @__PURE__ */ reactExports.createElement("div", {
  className: props.className,
  onClick: (e2) => e2.stopPropagation(),
  onKeyDown,
  ref
}, props.children));
function flattenKeys(filters) {
  let keys = [];
  (filters || []).forEach(({
    value,
    children
  }) => {
    keys.push(value);
    if (children) {
      keys = [].concat(_toConsumableArray(keys), _toConsumableArray(flattenKeys(children)));
    }
  });
  return keys;
}
function hasSubMenu(filters) {
  return filters.some(({
    children
  }) => children);
}
function searchValueMatched(searchValue, text) {
  if (typeof text === "string" || typeof text === "number") {
    return text === null || text === void 0 ? void 0 : text.toString().toLowerCase().includes(searchValue.trim().toLowerCase());
  }
  return false;
}
function renderFilterItems({
  filters,
  prefixCls,
  filteredKeys,
  filterMultiple,
  searchValue,
  filterSearch
}) {
  return filters.map((filter2, index) => {
    const key = String(filter2.value);
    if (filter2.children) {
      return {
        key: key || index,
        label: filter2.text,
        popupClassName: `${prefixCls}-dropdown-submenu`,
        children: renderFilterItems({
          filters: filter2.children,
          prefixCls,
          filteredKeys,
          filterMultiple,
          searchValue,
          filterSearch
        })
      };
    }
    const Component = filterMultiple ? Checkbox : Radio;
    const item = {
      key: filter2.value !== void 0 ? key : index,
      label: /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(Component, {
        checked: filteredKeys.includes(key)
      }), /* @__PURE__ */ reactExports.createElement("span", null, filter2.text))
    };
    if (searchValue.trim()) {
      if (typeof filterSearch === "function") {
        return filterSearch(searchValue, filter2) ? item : null;
      }
      return searchValueMatched(searchValue, filter2.text) ? item : null;
    }
    return item;
  });
}
function wrapStringListType(keys) {
  return keys || [];
}
const FilterDropdown = (props) => {
  var _a, _b, _c, _d;
  const {
    tablePrefixCls,
    prefixCls,
    column,
    dropdownPrefixCls,
    columnKey,
    filterOnClose,
    filterMultiple,
    filterMode = "menu",
    filterSearch = false,
    filterState,
    triggerFilter,
    locale: locale2,
    children,
    getPopupContainer,
    rootClassName
  } = props;
  const {
    filterResetToDefaultFilteredValue,
    defaultFilteredValue,
    filterDropdownProps = {},
    // Deprecated
    filterDropdownOpen,
    filterDropdownVisible,
    onFilterDropdownVisibleChange,
    onFilterDropdownOpenChange
  } = column;
  const [visible, setVisible] = reactExports.useState(false);
  const filtered = !!(filterState && (((_a = filterState.filteredKeys) === null || _a === void 0 ? void 0 : _a.length) || filterState.forceFiltered));
  const triggerVisible = (newVisible) => {
    var _a2;
    setVisible(newVisible);
    (_a2 = filterDropdownProps.onOpenChange) === null || _a2 === void 0 ? void 0 : _a2.call(filterDropdownProps, newVisible);
    onFilterDropdownOpenChange === null || onFilterDropdownOpenChange === void 0 ? void 0 : onFilterDropdownOpenChange(newVisible);
    onFilterDropdownVisibleChange === null || onFilterDropdownVisibleChange === void 0 ? void 0 : onFilterDropdownVisibleChange(newVisible);
  };
  const mergedVisible = (_d = (_c = (_b = filterDropdownProps.open) !== null && _b !== void 0 ? _b : filterDropdownOpen) !== null && _c !== void 0 ? _c : filterDropdownVisible) !== null && _d !== void 0 ? _d : visible;
  const propFilteredKeys = filterState === null || filterState === void 0 ? void 0 : filterState.filteredKeys;
  const [getFilteredKeysSync, setFilteredKeysSync] = useSyncState(wrapStringListType(propFilteredKeys));
  const onSelectKeys = ({
    selectedKeys
  }) => {
    setFilteredKeysSync(selectedKeys);
  };
  const onCheck = (keys, {
    node,
    checked
  }) => {
    if (!filterMultiple) {
      onSelectKeys({
        selectedKeys: checked && node.key ? [node.key] : []
      });
    } else {
      onSelectKeys({
        selectedKeys: keys
      });
    }
  };
  reactExports.useEffect(() => {
    if (!visible) {
      return;
    }
    onSelectKeys({
      selectedKeys: wrapStringListType(propFilteredKeys)
    });
  }, [propFilteredKeys]);
  const [openKeys, setOpenKeys] = reactExports.useState([]);
  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };
  const [searchValue, setSearchValue] = reactExports.useState("");
  const onSearch = (e2) => {
    const {
      value
    } = e2.target;
    setSearchValue(value);
  };
  reactExports.useEffect(() => {
    if (!visible) {
      setSearchValue("");
    }
  }, [visible]);
  const internalTriggerFilter = (keys) => {
    const mergedKeys = (keys === null || keys === void 0 ? void 0 : keys.length) ? keys : null;
    if (mergedKeys === null && (!filterState || !filterState.filteredKeys)) {
      return null;
    }
    if (isEqual(mergedKeys, filterState === null || filterState === void 0 ? void 0 : filterState.filteredKeys, true)) {
      return null;
    }
    triggerFilter({
      column,
      key: columnKey,
      filteredKeys: mergedKeys
    });
  };
  const onConfirm = () => {
    triggerVisible(false);
    internalTriggerFilter(getFilteredKeysSync());
  };
  const onReset = ({
    confirm: confirm2,
    closeDropdown
  } = {
    confirm: false,
    closeDropdown: false
  }) => {
    if (confirm2) {
      internalTriggerFilter([]);
    }
    if (closeDropdown) {
      triggerVisible(false);
    }
    setSearchValue("");
    if (filterResetToDefaultFilteredValue) {
      setFilteredKeysSync((defaultFilteredValue || []).map((key) => String(key)));
    } else {
      setFilteredKeysSync([]);
    }
  };
  const doFilter = ({
    closeDropdown
  } = {
    closeDropdown: true
  }) => {
    if (closeDropdown) {
      triggerVisible(false);
    }
    internalTriggerFilter(getFilteredKeysSync());
  };
  const onVisibleChange = (newVisible, info) => {
    if (info.source === "trigger") {
      if (newVisible && propFilteredKeys !== void 0) {
        setFilteredKeysSync(wrapStringListType(propFilteredKeys));
      }
      triggerVisible(newVisible);
      if (!newVisible && !column.filterDropdown && filterOnClose) {
        onConfirm();
      }
    }
  };
  const dropdownMenuClass = classNames({
    [`${dropdownPrefixCls}-menu-without-submenu`]: !hasSubMenu(column.filters || [])
  });
  const onCheckAll = (e2) => {
    if (e2.target.checked) {
      const allFilterKeys = flattenKeys(column === null || column === void 0 ? void 0 : column.filters).map((key) => String(key));
      setFilteredKeysSync(allFilterKeys);
    } else {
      setFilteredKeysSync([]);
    }
  };
  const getTreeData2 = ({
    filters
  }) => (filters || []).map((filter2, index) => {
    const key = String(filter2.value);
    const item = {
      title: filter2.text,
      key: filter2.value !== void 0 ? key : String(index)
    };
    if (filter2.children) {
      item.children = getTreeData2({
        filters: filter2.children
      });
    }
    return item;
  });
  const getFilterData2 = (node) => {
    var _a2;
    return Object.assign(Object.assign({}, node), {
      text: node.title,
      value: node.key,
      children: ((_a2 = node.children) === null || _a2 === void 0 ? void 0 : _a2.map((item) => getFilterData2(item))) || []
    });
  };
  let dropdownContent;
  const {
    direction,
    renderEmpty
  } = reactExports.useContext(ConfigContext);
  if (typeof column.filterDropdown === "function") {
    dropdownContent = column.filterDropdown({
      prefixCls: `${dropdownPrefixCls}-custom`,
      setSelectedKeys: (selectedKeys) => onSelectKeys({
        selectedKeys
      }),
      selectedKeys: getFilteredKeysSync(),
      confirm: doFilter,
      clearFilters: onReset,
      filters: column.filters,
      visible: mergedVisible,
      close: () => {
        triggerVisible(false);
      }
    });
  } else if (column.filterDropdown) {
    dropdownContent = column.filterDropdown;
  } else {
    const selectedKeys = getFilteredKeysSync() || [];
    const getFilterComponent = () => {
      var _a2, _b2;
      const empty = (_a2 = renderEmpty === null || renderEmpty === void 0 ? void 0 : renderEmpty("Table.filter")) !== null && _a2 !== void 0 ? _a2 : /* @__PURE__ */ reactExports.createElement(Empty, {
        image: Empty.PRESENTED_IMAGE_SIMPLE,
        description: locale2.filterEmptyText,
        styles: {
          image: {
            height: 24
          }
        },
        style: {
          margin: 0,
          padding: "16px 0"
        }
      });
      if ((column.filters || []).length === 0) {
        return empty;
      }
      if (filterMode === "tree") {
        return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(FilterSearch, {
          filterSearch,
          value: searchValue,
          onChange: onSearch,
          tablePrefixCls,
          locale: locale2
        }), /* @__PURE__ */ reactExports.createElement("div", {
          className: `${tablePrefixCls}-filter-dropdown-tree`
        }, filterMultiple ? /* @__PURE__ */ reactExports.createElement(Checkbox, {
          checked: selectedKeys.length === flattenKeys(column.filters).length,
          indeterminate: selectedKeys.length > 0 && selectedKeys.length < flattenKeys(column.filters).length,
          className: `${tablePrefixCls}-filter-dropdown-checkall`,
          onChange: onCheckAll
        }, (_b2 = locale2 === null || locale2 === void 0 ? void 0 : locale2.filterCheckall) !== null && _b2 !== void 0 ? _b2 : locale2 === null || locale2 === void 0 ? void 0 : locale2.filterCheckAll) : null, /* @__PURE__ */ reactExports.createElement(Tree, {
          checkable: true,
          selectable: false,
          blockNode: true,
          multiple: filterMultiple,
          checkStrictly: !filterMultiple,
          className: `${dropdownPrefixCls}-menu`,
          onCheck,
          checkedKeys: selectedKeys,
          selectedKeys,
          showIcon: false,
          treeData: getTreeData2({
            filters: column.filters
          }),
          autoExpandParent: true,
          defaultExpandAll: true,
          filterTreeNode: searchValue.trim() ? (node) => {
            if (typeof filterSearch === "function") {
              return filterSearch(searchValue, getFilterData2(node));
            }
            return searchValueMatched(searchValue, node.title);
          } : void 0
        })));
      }
      const items = renderFilterItems({
        filters: column.filters || [],
        filterSearch,
        prefixCls,
        filteredKeys: getFilteredKeysSync(),
        filterMultiple,
        searchValue
      });
      const isEmpty = items.every((item) => item === null);
      return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(FilterSearch, {
        filterSearch,
        value: searchValue,
        onChange: onSearch,
        tablePrefixCls,
        locale: locale2
      }), isEmpty ? empty : /* @__PURE__ */ reactExports.createElement(Menu, {
        selectable: true,
        multiple: filterMultiple,
        prefixCls: `${dropdownPrefixCls}-menu`,
        className: dropdownMenuClass,
        onSelect: onSelectKeys,
        onDeselect: onSelectKeys,
        selectedKeys,
        getPopupContainer,
        openKeys,
        onOpenChange,
        items
      }));
    };
    const getResetDisabled = () => {
      if (filterResetToDefaultFilteredValue) {
        return isEqual((defaultFilteredValue || []).map((key) => String(key)), selectedKeys, true);
      }
      return selectedKeys.length === 0;
    };
    dropdownContent = /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, getFilterComponent(), /* @__PURE__ */ reactExports.createElement("div", {
      className: `${prefixCls}-dropdown-btns`
    }, /* @__PURE__ */ reactExports.createElement(Button$1, {
      type: "link",
      size: "small",
      disabled: getResetDisabled(),
      onClick: () => onReset()
    }, locale2.filterReset), /* @__PURE__ */ reactExports.createElement(Button$1, {
      type: "primary",
      size: "small",
      onClick: onConfirm
    }, locale2.filterConfirm)));
  }
  if (column.filterDropdown) {
    dropdownContent = /* @__PURE__ */ reactExports.createElement(OverrideProvider, {
      selectable: void 0
    }, dropdownContent);
  }
  dropdownContent = /* @__PURE__ */ reactExports.createElement(FilterDropdownMenuWrapper, {
    className: `${prefixCls}-dropdown`
  }, dropdownContent);
  const getDropdownTrigger = () => {
    let filterIcon;
    if (typeof column.filterIcon === "function") {
      filterIcon = column.filterIcon(filtered);
    } else if (column.filterIcon) {
      filterIcon = column.filterIcon;
    } else {
      filterIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$t, null);
    }
    return /* @__PURE__ */ reactExports.createElement("span", {
      role: "button",
      tabIndex: -1,
      className: classNames(`${prefixCls}-trigger`, {
        active: filtered
      }),
      onClick: (e2) => {
        e2.stopPropagation();
      }
    }, filterIcon);
  };
  const mergedDropdownProps = mergeProps({
    trigger: ["click"],
    placement: direction === "rtl" ? "bottomLeft" : "bottomRight",
    children: getDropdownTrigger(),
    getPopupContainer
  }, Object.assign(Object.assign({}, filterDropdownProps), {
    rootClassName: classNames(rootClassName, filterDropdownProps.rootClassName),
    open: mergedVisible,
    onOpenChange: onVisibleChange,
    popupRender: () => {
      if (typeof (filterDropdownProps === null || filterDropdownProps === void 0 ? void 0 : filterDropdownProps.dropdownRender) === "function") {
        return filterDropdownProps.dropdownRender(dropdownContent);
      }
      return dropdownContent;
    }
  }));
  return /* @__PURE__ */ reactExports.createElement("div", {
    className: `${prefixCls}-column`
  }, /* @__PURE__ */ reactExports.createElement("span", {
    className: `${tablePrefixCls}-column-title`
  }, children), /* @__PURE__ */ reactExports.createElement(Dropdown, Object.assign({}, mergedDropdownProps)));
};
const collectFilterStates = (columns, init, pos) => {
  let filterStates = [];
  (columns || []).forEach((column, index) => {
    var _a;
    const columnPos = getColumnPos(index, pos);
    const filterDropdownIsDefined = column.filterDropdown !== void 0;
    if (column.filters || filterDropdownIsDefined || "onFilter" in column) {
      if ("filteredValue" in column) {
        let filteredValues = column.filteredValue;
        if (!filterDropdownIsDefined) {
          filteredValues = (_a = filteredValues === null || filteredValues === void 0 ? void 0 : filteredValues.map(String)) !== null && _a !== void 0 ? _a : filteredValues;
        }
        filterStates.push({
          column,
          key: getColumnKey(column, columnPos),
          filteredKeys: filteredValues,
          forceFiltered: column.filtered
        });
      } else {
        filterStates.push({
          column,
          key: getColumnKey(column, columnPos),
          filteredKeys: init && column.defaultFilteredValue ? column.defaultFilteredValue : void 0,
          forceFiltered: column.filtered
        });
      }
    }
    if ("children" in column) {
      filterStates = [].concat(_toConsumableArray(filterStates), _toConsumableArray(collectFilterStates(column.children, init, columnPos)));
    }
  });
  return filterStates;
};
function injectFilter(prefixCls, dropdownPrefixCls, columns, filterStates, locale2, triggerFilter, getPopupContainer, pos, rootClassName) {
  return columns.map((column, index) => {
    const columnPos = getColumnPos(index, pos);
    const {
      filterOnClose = true,
      filterMultiple = true,
      filterMode,
      filterSearch
    } = column;
    let newColumn = column;
    if (newColumn.filters || newColumn.filterDropdown) {
      const columnKey = getColumnKey(newColumn, columnPos);
      const filterState = filterStates.find(({
        key
      }) => columnKey === key);
      newColumn = Object.assign(Object.assign({}, newColumn), {
        title: (renderProps) => /* @__PURE__ */ reactExports.createElement(FilterDropdown, {
          tablePrefixCls: prefixCls,
          prefixCls: `${prefixCls}-filter`,
          dropdownPrefixCls,
          column: newColumn,
          columnKey,
          filterState,
          filterOnClose,
          filterMultiple,
          filterMode,
          filterSearch,
          triggerFilter,
          locale: locale2,
          getPopupContainer,
          rootClassName
        }, renderColumnTitle(column.title, renderProps))
      });
    }
    if ("children" in newColumn) {
      newColumn = Object.assign(Object.assign({}, newColumn), {
        children: injectFilter(prefixCls, dropdownPrefixCls, newColumn.children, filterStates, locale2, triggerFilter, getPopupContainer, columnPos, rootClassName)
      });
    }
    return newColumn;
  });
}
const generateFilterInfo = (filterStates) => {
  const currentFilters = {};
  filterStates.forEach(({
    key,
    filteredKeys,
    column
  }) => {
    const keyAsString = key;
    const {
      filters,
      filterDropdown
    } = column;
    if (filterDropdown) {
      currentFilters[keyAsString] = filteredKeys || null;
    } else if (Array.isArray(filteredKeys)) {
      const keys = flattenKeys(filters);
      currentFilters[keyAsString] = keys.filter((originKey) => filteredKeys.includes(String(originKey)));
    } else {
      currentFilters[keyAsString] = null;
    }
  });
  return currentFilters;
};
const getFilterData = (data, filterStates, childrenColumnName) => {
  const filterDatas = filterStates.reduce((currentData, filterState) => {
    const {
      column: {
        onFilter,
        filters
      },
      filteredKeys
    } = filterState;
    if (onFilter && filteredKeys && filteredKeys.length) {
      return currentData.map((record) => Object.assign({}, record)).filter((record) => filteredKeys.some((key) => {
        const keys = flattenKeys(filters);
        const keyIndex2 = keys.findIndex((k) => String(k) === String(key));
        const realKey = keyIndex2 !== -1 ? keys[keyIndex2] : key;
        if (record[childrenColumnName]) {
          record[childrenColumnName] = getFilterData(record[childrenColumnName], filterStates, childrenColumnName);
        }
        return onFilter(realKey, record);
      }));
    }
    return currentData;
  }, data);
  return filterDatas;
};
const getMergedColumns = (rawMergedColumns) => rawMergedColumns.flatMap((column) => {
  if ("children" in column) {
    return [column].concat(_toConsumableArray(getMergedColumns(column.children || [])));
  }
  return [column];
});
const useFilter = (props) => {
  const {
    prefixCls,
    dropdownPrefixCls,
    mergedColumns: rawMergedColumns,
    onFilterChange,
    getPopupContainer,
    locale: tableLocale,
    rootClassName
  } = props;
  devUseWarning();
  const mergedColumns = reactExports.useMemo(() => getMergedColumns(rawMergedColumns || []), [rawMergedColumns]);
  const [filterStates, setFilterStates] = reactExports.useState(() => collectFilterStates(mergedColumns, true));
  const mergedFilterStates = reactExports.useMemo(() => {
    const collectedStates = collectFilterStates(mergedColumns, false);
    if (collectedStates.length === 0) {
      return collectedStates;
    }
    let filteredKeysIsAllNotControlled = true;
    collectedStates.forEach(({
      filteredKeys
    }) => {
      if (filteredKeys !== void 0) {
        filteredKeysIsAllNotControlled = false;
      }
    });
    if (filteredKeysIsAllNotControlled) {
      const keyList = (mergedColumns || []).map((column, index) => getColumnKey(column, getColumnPos(index)));
      return filterStates.filter(({
        key
      }) => keyList.includes(key)).map((item) => {
        const col = mergedColumns[keyList.findIndex((key) => key === item.key)];
        return Object.assign(Object.assign({}, item), {
          column: Object.assign(Object.assign({}, item.column), col),
          forceFiltered: col.filtered
        });
      });
    }
    return collectedStates;
  }, [mergedColumns, filterStates]);
  const filters = reactExports.useMemo(() => generateFilterInfo(mergedFilterStates), [mergedFilterStates]);
  const triggerFilter = (filterState) => {
    const newFilterStates = mergedFilterStates.filter(({
      key
    }) => key !== filterState.key);
    newFilterStates.push(filterState);
    setFilterStates(newFilterStates);
    onFilterChange(generateFilterInfo(newFilterStates), newFilterStates);
  };
  const transformColumns = (innerColumns) => injectFilter(prefixCls, dropdownPrefixCls, innerColumns, mergedFilterStates, tableLocale, triggerFilter, getPopupContainer, void 0, rootClassName);
  return [transformColumns, mergedFilterStates, filters];
};
const useLazyKVMap = (data, childrenColumnName, getRowKey) => {
  const mapCacheRef = reactExports.useRef({});
  function getRecordByKey(key) {
    var _a;
    if (!mapCacheRef.current || mapCacheRef.current.data !== data || mapCacheRef.current.childrenColumnName !== childrenColumnName || mapCacheRef.current.getRowKey !== getRowKey) {
      let dig = function(records) {
        records.forEach((record, index) => {
          const rowKey = getRowKey(record, index);
          kvMap.set(rowKey, record);
          if (record && typeof record === "object" && childrenColumnName in record) {
            dig(record[childrenColumnName] || []);
          }
        });
      };
      const kvMap = /* @__PURE__ */ new Map();
      dig(data);
      mapCacheRef.current = {
        data,
        childrenColumnName,
        kvMap,
        getRowKey
      };
    }
    return (_a = mapCacheRef.current.kvMap) === null || _a === void 0 ? void 0 : _a.get(key);
  }
  return [getRecordByKey];
};
var __rest$7 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const DEFAULT_PAGE_SIZE = 10;
function getPaginationParam(mergedPagination, pagination) {
  const param = {
    current: mergedPagination.current,
    pageSize: mergedPagination.pageSize
  };
  const paginationObj = pagination && typeof pagination === "object" ? pagination : {};
  Object.keys(paginationObj).forEach((pageProp) => {
    const value = mergedPagination[pageProp];
    if (typeof value !== "function") {
      param[pageProp] = value;
    }
  });
  return param;
}
function usePagination(total, onChange, pagination) {
  const _a = pagination && typeof pagination === "object" ? pagination : {}, {
    total: paginationTotal = 0
  } = _a, paginationObj = __rest$7(_a, ["total"]);
  const [innerPagination, setInnerPagination] = reactExports.useState(() => ({
    current: "defaultCurrent" in paginationObj ? paginationObj.defaultCurrent : 1,
    pageSize: "defaultPageSize" in paginationObj ? paginationObj.defaultPageSize : DEFAULT_PAGE_SIZE
  }));
  const mergedPagination = mergeProps(innerPagination, paginationObj, {
    total: paginationTotal > 0 ? paginationTotal : total
  });
  const maxPage = Math.ceil((paginationTotal || total) / mergedPagination.pageSize);
  if (mergedPagination.current > maxPage) {
    mergedPagination.current = maxPage || 1;
  }
  const refreshPagination = (current, pageSize) => {
    setInnerPagination({
      current: current !== null && current !== void 0 ? current : 1,
      pageSize: pageSize || mergedPagination.pageSize
    });
  };
  const onInternalChange = (current, pageSize) => {
    var _a2;
    if (pagination) {
      (_a2 = pagination.onChange) === null || _a2 === void 0 ? void 0 : _a2.call(pagination, current, pageSize);
    }
    refreshPagination(current, pageSize);
    onChange(current, pageSize || (mergedPagination === null || mergedPagination === void 0 ? void 0 : mergedPagination.pageSize));
  };
  if (pagination === false) {
    return [{}, () => {
    }];
  }
  return [Object.assign(Object.assign({}, mergedPagination), {
    onChange: onInternalChange
  }), refreshPagination];
}
const ASCEND = "ascend";
const DESCEND = "descend";
const getMultiplePriority = (column) => {
  if (typeof column.sorter === "object" && typeof column.sorter.multiple === "number") {
    return column.sorter.multiple;
  }
  return false;
};
const getSortFunction = (sorter) => {
  if (typeof sorter === "function") {
    return sorter;
  }
  if (sorter && typeof sorter === "object" && sorter.compare) {
    return sorter.compare;
  }
  return false;
};
const nextSortDirection = (sortDirections, current) => {
  if (!current) {
    return sortDirections[0];
  }
  return sortDirections[sortDirections.indexOf(current) + 1];
};
const collectSortStates = (columns, init, pos) => {
  let sortStates = [];
  const pushState = (column, columnPos) => {
    sortStates.push({
      column,
      key: getColumnKey(column, columnPos),
      multiplePriority: getMultiplePriority(column),
      sortOrder: column.sortOrder
    });
  };
  (columns || []).forEach((column, index) => {
    const columnPos = getColumnPos(index, pos);
    if (column.children) {
      if ("sortOrder" in column) {
        pushState(column, columnPos);
      }
      sortStates = [].concat(_toConsumableArray(sortStates), _toConsumableArray(collectSortStates(column.children, init, columnPos)));
    } else if (column.sorter) {
      if ("sortOrder" in column) {
        pushState(column, columnPos);
      } else if (init && column.defaultSortOrder) {
        sortStates.push({
          column,
          key: getColumnKey(column, columnPos),
          multiplePriority: getMultiplePriority(column),
          sortOrder: column.defaultSortOrder
        });
      }
    }
  });
  return sortStates;
};
const injectSorter = (prefixCls, columns, sorterStates, triggerSorter, defaultSortDirections, tableLocale, tableShowSorterTooltip, pos) => {
  const finalColumns = (columns || []).map((column, index) => {
    const columnPos = getColumnPos(index, pos);
    let newColumn = column;
    if (newColumn.sorter) {
      const sortDirections = newColumn.sortDirections || defaultSortDirections;
      const showSorterTooltip = newColumn.showSorterTooltip === void 0 ? tableShowSorterTooltip : newColumn.showSorterTooltip;
      const columnKey = getColumnKey(newColumn, columnPos);
      const sorterState = sorterStates.find(({
        key
      }) => key === columnKey);
      const sortOrder = sorterState ? sorterState.sortOrder : null;
      const nextSortOrder = nextSortDirection(sortDirections, sortOrder);
      let sorter;
      if (column.sortIcon) {
        sorter = column.sortIcon({
          sortOrder
        });
      } else {
        const upNode = sortDirections.includes(ASCEND) && /* @__PURE__ */ reactExports.createElement(RefIcon$u, {
          className: classNames(`${prefixCls}-column-sorter-up`, {
            active: sortOrder === ASCEND
          })
        });
        const downNode = sortDirections.includes(DESCEND) && /* @__PURE__ */ reactExports.createElement(RefIcon$v, {
          className: classNames(`${prefixCls}-column-sorter-down`, {
            active: sortOrder === DESCEND
          })
        });
        sorter = /* @__PURE__ */ reactExports.createElement("span", {
          className: classNames(`${prefixCls}-column-sorter`, {
            [`${prefixCls}-column-sorter-full`]: !!(upNode && downNode)
          })
        }, /* @__PURE__ */ reactExports.createElement("span", {
          className: `${prefixCls}-column-sorter-inner`,
          "aria-hidden": "true"
        }, upNode, downNode));
      }
      const {
        cancelSort,
        triggerAsc,
        triggerDesc
      } = tableLocale || {};
      let sortTip = cancelSort;
      if (nextSortOrder === DESCEND) {
        sortTip = triggerDesc;
      } else if (nextSortOrder === ASCEND) {
        sortTip = triggerAsc;
      }
      const tooltipProps = typeof showSorterTooltip === "object" ? Object.assign({
        title: sortTip
      }, showSorterTooltip) : {
        title: sortTip
      };
      newColumn = Object.assign(Object.assign({}, newColumn), {
        className: classNames(newColumn.className, {
          [`${prefixCls}-column-sort`]: sortOrder
        }),
        title: (renderProps) => {
          const columnSortersClass = `${prefixCls}-column-sorters`;
          const renderColumnTitleWrapper = /* @__PURE__ */ reactExports.createElement("span", {
            className: `${prefixCls}-column-title`
          }, renderColumnTitle(column.title, renderProps));
          const renderSortTitle = /* @__PURE__ */ reactExports.createElement("div", {
            className: columnSortersClass
          }, renderColumnTitleWrapper, sorter);
          if (showSorterTooltip) {
            if (typeof showSorterTooltip !== "boolean" && (showSorterTooltip === null || showSorterTooltip === void 0 ? void 0 : showSorterTooltip.target) === "sorter-icon") {
              return /* @__PURE__ */ reactExports.createElement("div", {
                className: `${columnSortersClass} ${prefixCls}-column-sorters-tooltip-target-sorter`
              }, renderColumnTitleWrapper, /* @__PURE__ */ reactExports.createElement(Tooltip, Object.assign({}, tooltipProps), sorter));
            }
            return /* @__PURE__ */ reactExports.createElement(Tooltip, Object.assign({}, tooltipProps), renderSortTitle);
          }
          return renderSortTitle;
        },
        onHeaderCell: (col) => {
          var _a;
          const cell = ((_a = column.onHeaderCell) === null || _a === void 0 ? void 0 : _a.call(column, col)) || {};
          const originOnClick = cell.onClick;
          const originOKeyDown = cell.onKeyDown;
          cell.onClick = (event) => {
            triggerSorter({
              column,
              key: columnKey,
              sortOrder: nextSortOrder,
              multiplePriority: getMultiplePriority(column)
            });
            originOnClick === null || originOnClick === void 0 ? void 0 : originOnClick(event);
          };
          cell.onKeyDown = (event) => {
            if (event.keyCode === KeyCode.ENTER) {
              triggerSorter({
                column,
                key: columnKey,
                sortOrder: nextSortOrder,
                multiplePriority: getMultiplePriority(column)
              });
              originOKeyDown === null || originOKeyDown === void 0 ? void 0 : originOKeyDown(event);
            }
          };
          const renderTitle = safeColumnTitle(column.title, {});
          const displayTitle = renderTitle === null || renderTitle === void 0 ? void 0 : renderTitle.toString();
          if (sortOrder) {
            cell["aria-sort"] = sortOrder === "ascend" ? "ascending" : "descending";
          }
          cell["aria-label"] = displayTitle || "";
          cell.className = classNames(cell.className, `${prefixCls}-column-has-sorters`);
          cell.tabIndex = 0;
          if (column.ellipsis) {
            cell.title = (renderTitle !== null && renderTitle !== void 0 ? renderTitle : "").toString();
          }
          return cell;
        }
      });
    }
    if ("children" in newColumn) {
      newColumn = Object.assign(Object.assign({}, newColumn), {
        children: injectSorter(prefixCls, newColumn.children, sorterStates, triggerSorter, defaultSortDirections, tableLocale, tableShowSorterTooltip, columnPos)
      });
    }
    return newColumn;
  });
  return finalColumns;
};
const stateToInfo = (sorterState) => {
  const {
    column,
    sortOrder
  } = sorterState;
  return {
    column,
    order: sortOrder,
    field: column.dataIndex,
    columnKey: column.key
  };
};
const generateSorterInfo = (sorterStates) => {
  const activeSorters = sorterStates.filter(({
    sortOrder
  }) => sortOrder).map(stateToInfo);
  if (activeSorters.length === 0 && sorterStates.length) {
    const lastIndex = sorterStates.length - 1;
    return Object.assign(Object.assign({}, stateToInfo(sorterStates[lastIndex])), {
      column: void 0,
      order: void 0,
      field: void 0,
      columnKey: void 0
    });
  }
  if (activeSorters.length <= 1) {
    return activeSorters[0] || {};
  }
  return activeSorters;
};
const getSortData = (data, sortStates, childrenColumnName) => {
  const innerSorterStates = sortStates.slice().sort((a, b) => b.multiplePriority - a.multiplePriority);
  const cloneData = data.slice();
  const runningSorters = innerSorterStates.filter(({
    column: {
      sorter
    },
    sortOrder
  }) => getSortFunction(sorter) && sortOrder);
  if (!runningSorters.length) {
    return cloneData;
  }
  return cloneData.sort((record1, record2) => {
    for (let i = 0; i < runningSorters.length; i += 1) {
      const sorterState = runningSorters[i];
      const {
        column: {
          sorter
        },
        sortOrder
      } = sorterState;
      const compareFn = getSortFunction(sorter);
      if (compareFn && sortOrder) {
        const compareResult = compareFn(record1, record2, sortOrder);
        if (compareResult !== 0) {
          return sortOrder === ASCEND ? compareResult : -compareResult;
        }
      }
    }
    return 0;
  }).map((record) => {
    const subRecords = record[childrenColumnName];
    if (subRecords) {
      return Object.assign(Object.assign({}, record), {
        [childrenColumnName]: getSortData(subRecords, sortStates, childrenColumnName)
      });
    }
    return record;
  });
};
const useFilterSorter = (props) => {
  const {
    prefixCls,
    mergedColumns,
    sortDirections,
    tableLocale,
    showSorterTooltip,
    onSorterChange
  } = props;
  const [sortStates, setSortStates] = reactExports.useState(() => collectSortStates(mergedColumns, true));
  const getColumnKeys = (columns, pos) => {
    const newKeys = [];
    columns.forEach((item, index) => {
      const columnPos = getColumnPos(index, pos);
      newKeys.push(getColumnKey(item, columnPos));
      if (Array.isArray(item.children)) {
        const childKeys = getColumnKeys(item.children, columnPos);
        newKeys.push.apply(newKeys, _toConsumableArray(childKeys));
      }
    });
    return newKeys;
  };
  const mergedSorterStates = reactExports.useMemo(() => {
    let validate = true;
    const collectedStates = collectSortStates(mergedColumns, false);
    if (!collectedStates.length) {
      const mergedColumnsKeys = getColumnKeys(mergedColumns);
      return sortStates.filter(({
        key
      }) => mergedColumnsKeys.includes(key));
    }
    const validateStates = [];
    function patchStates(state) {
      if (validate) {
        validateStates.push(state);
      } else {
        validateStates.push(Object.assign(Object.assign({}, state), {
          sortOrder: null
        }));
      }
    }
    let multipleMode = null;
    collectedStates.forEach((state) => {
      if (multipleMode === null) {
        patchStates(state);
        if (state.sortOrder) {
          if (state.multiplePriority === false) {
            validate = false;
          } else {
            multipleMode = true;
          }
        }
      } else if (multipleMode && state.multiplePriority !== false) {
        patchStates(state);
      } else {
        validate = false;
        patchStates(state);
      }
    });
    return validateStates;
  }, [mergedColumns, sortStates]);
  const columnTitleSorterProps = reactExports.useMemo(() => {
    var _a, _b;
    const sortColumns = mergedSorterStates.map(({
      column,
      sortOrder
    }) => ({
      column,
      order: sortOrder
    }));
    return {
      sortColumns,
      // Legacy
      sortColumn: (_a = sortColumns[0]) === null || _a === void 0 ? void 0 : _a.column,
      sortOrder: (_b = sortColumns[0]) === null || _b === void 0 ? void 0 : _b.order
    };
  }, [mergedSorterStates]);
  const triggerSorter = (sortState) => {
    let newSorterStates;
    if (sortState.multiplePriority === false || !mergedSorterStates.length || mergedSorterStates[0].multiplePriority === false) {
      newSorterStates = [sortState];
    } else {
      newSorterStates = [].concat(_toConsumableArray(mergedSorterStates.filter(({
        key
      }) => key !== sortState.key)), [sortState]);
    }
    setSortStates(newSorterStates);
    onSorterChange(generateSorterInfo(newSorterStates), newSorterStates);
  };
  const transformColumns = (innerColumns) => injectSorter(prefixCls, innerColumns, mergedSorterStates, triggerSorter, sortDirections, tableLocale, showSorterTooltip);
  const getSorters = () => generateSorterInfo(mergedSorterStates);
  return [transformColumns, mergedSorterStates, columnTitleSorterProps, getSorters];
};
const fillTitle = (columns, columnTitleProps) => {
  const finalColumns = columns.map((column) => {
    const cloneColumn = Object.assign({}, column);
    cloneColumn.title = renderColumnTitle(column.title, columnTitleProps);
    if ("children" in cloneColumn) {
      cloneColumn.children = fillTitle(cloneColumn.children, columnTitleProps);
    }
    return cloneColumn;
  });
  return finalColumns;
};
const useTitleColumns = (columnTitleProps) => {
  const filledColumns = reactExports.useCallback((columns) => fillTitle(columns, columnTitleProps), [columnTitleProps]);
  return [filledColumns];
};
const RcTable = genTable((prev, next) => {
  const {
    _renderTimes: prevRenderTimes
  } = prev;
  const {
    _renderTimes: nextRenderTimes
  } = next;
  return prevRenderTimes !== nextRenderTimes;
});
const RcVirtualTable = genVirtualTable((prev, next) => {
  const {
    _renderTimes: prevRenderTimes
  } = prev;
  const {
    _renderTimes: nextRenderTimes
  } = next;
  return prevRenderTimes !== nextRenderTimes;
});
const genBorderedStyle = (token) => {
  const {
    componentCls,
    lineWidth,
    lineType,
    tableBorderColor,
    tableHeaderBg,
    tablePaddingVertical,
    tablePaddingHorizontal,
    calc
  } = token;
  const tableBorder = `${unit(lineWidth)} ${lineType} ${tableBorderColor}`;
  const getSizeBorderStyle = (size, paddingVertical, paddingHorizontal) => ({
    [`&${componentCls}-${size}`]: {
      [`> ${componentCls}-container`]: {
        [`> ${componentCls}-content, > ${componentCls}-body`]: {
          [`
            > table > tbody > tr > th,
            > table > tbody > tr > td
          `]: {
            [`> ${componentCls}-expanded-row-fixed`]: {
              margin: `${unit(calc(paddingVertical).mul(-1).equal())}
              ${unit(calc(calc(paddingHorizontal).add(lineWidth)).mul(-1).equal())}`
            }
          }
        }
      }
    }
  });
  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}${componentCls}-bordered`]: Object.assign(Object.assign(Object.assign({
        // ============================ Title =============================
        [`> ${componentCls}-title`]: {
          border: tableBorder,
          borderBottom: 0
        },
        // ============================ Content ============================
        [`> ${componentCls}-container`]: {
          borderInlineStart: tableBorder,
          borderTop: tableBorder,
          [`
            > ${componentCls}-content,
            > ${componentCls}-header,
            > ${componentCls}-body,
            > ${componentCls}-summary
          `]: {
            "> table": {
              // ============================= Cell =============================
              [`
                > thead > tr > th,
                > thead > tr > td,
                > tbody > tr > th,
                > tbody > tr > td,
                > tfoot > tr > th,
                > tfoot > tr > td
              `]: {
                borderInlineEnd: tableBorder
              },
              // ============================ Header ============================
              "> thead": {
                "> tr:not(:last-child) > th": {
                  borderBottom: tableBorder
                },
                "> tr > th::before": {
                  backgroundColor: "transparent !important"
                }
              },
              // Fixed right should provides additional border
              [`
                > thead > tr,
                > tbody > tr,
                > tfoot > tr
              `]: {
                [`> ${componentCls}-cell-fix-right-first::after`]: {
                  borderInlineEnd: tableBorder
                }
              },
              // ========================== Expandable ==========================
              [`
                > tbody > tr > th,
                > tbody > tr > td
              `]: {
                [`> ${componentCls}-expanded-row-fixed`]: {
                  margin: `${unit(calc(tablePaddingVertical).mul(-1).equal())} ${unit(calc(calc(tablePaddingHorizontal).add(lineWidth)).mul(-1).equal())}`,
                  "&::after": {
                    position: "absolute",
                    top: 0,
                    insetInlineEnd: lineWidth,
                    bottom: 0,
                    borderInlineEnd: tableBorder,
                    content: '""'
                  }
                }
              }
            }
          }
        },
        // ============================ Scroll ============================
        [`&${componentCls}-scroll-horizontal`]: {
          [`> ${componentCls}-container > ${componentCls}-body`]: {
            "> table > tbody": {
              [`
                > tr${componentCls}-expanded-row,
                > tr${componentCls}-placeholder
              `]: {
                "> th, > td": {
                  borderInlineEnd: 0
                }
              }
            }
          }
        }
      }, getSizeBorderStyle("middle", token.tablePaddingVerticalMiddle, token.tablePaddingHorizontalMiddle)), getSizeBorderStyle("small", token.tablePaddingVerticalSmall, token.tablePaddingHorizontalSmall)), {
        // ============================ Footer ============================
        [`> ${componentCls}-footer`]: {
          border: tableBorder,
          borderTop: 0
        }
      }),
      // ============================ Nested ============================
      [`${componentCls}-cell`]: {
        [`${componentCls}-container:first-child`]: {
          // :first-child to avoid the case when bordered and title is set
          borderTop: 0
        },
        // https://github.com/ant-design/ant-design/issues/35577
        "&-scrollbar:not([rowspan])": {
          boxShadow: `0 ${unit(lineWidth)} 0 ${unit(lineWidth)} ${tableHeaderBg}`
        }
      },
      [`${componentCls}-bordered ${componentCls}-cell-scrollbar`]: {
        borderInlineEnd: tableBorder
      }
    }
  };
};
const genEllipsisStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}-cell-ellipsis`]: Object.assign(Object.assign({}, textEllipsis), {
        wordBreak: "keep-all",
        // Fixed first or last should special process
        [`
          &${componentCls}-cell-fix-left-last,
          &${componentCls}-cell-fix-right-first
        `]: {
          overflow: "visible",
          [`${componentCls}-cell-content`]: {
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis"
          }
        },
        [`${componentCls}-column-title`]: {
          overflow: "hidden",
          textOverflow: "ellipsis",
          wordBreak: "keep-all"
        }
      })
    }
  };
};
const genEmptyStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}-tbody > tr${componentCls}-placeholder`]: {
        textAlign: "center",
        color: token.colorTextDisabled,
        [`
          &:hover > th,
          &:hover > td,
        `]: {
          background: token.colorBgContainer
        }
      }
    }
  };
};
const genExpandStyle = (token) => {
  const {
    componentCls,
    antCls,
    motionDurationSlow,
    lineWidth,
    paddingXS,
    lineType,
    tableBorderColor,
    tableExpandIconBg,
    tableExpandColumnWidth,
    borderRadius,
    tablePaddingVertical,
    tablePaddingHorizontal,
    tableExpandedRowBg,
    paddingXXS,
    expandIconMarginTop,
    expandIconSize,
    expandIconHalfInner,
    expandIconScale,
    calc
  } = token;
  const tableBorder = `${unit(lineWidth)} ${lineType} ${tableBorderColor}`;
  const expandIconLineOffset = calc(paddingXXS).sub(lineWidth).equal();
  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}-expand-icon-col`]: {
        width: tableExpandColumnWidth
      },
      [`${componentCls}-row-expand-icon-cell`]: {
        textAlign: "center",
        [`${componentCls}-row-expand-icon`]: {
          display: "inline-flex",
          float: "none",
          verticalAlign: "sub"
        }
      },
      [`${componentCls}-row-indent`]: {
        height: 1,
        float: "left"
      },
      [`${componentCls}-row-expand-icon`]: Object.assign(Object.assign({}, operationUnit(token)), {
        position: "relative",
        float: "left",
        width: expandIconSize,
        height: expandIconSize,
        color: "inherit",
        lineHeight: unit(expandIconSize),
        background: tableExpandIconBg,
        border: tableBorder,
        borderRadius,
        transform: `scale(${expandIconScale})`,
        "&:focus, &:hover, &:active": {
          borderColor: "currentcolor"
        },
        "&::before, &::after": {
          position: "absolute",
          background: "currentcolor",
          transition: `transform ${motionDurationSlow} ease-out`,
          content: '""'
        },
        "&::before": {
          top: expandIconHalfInner,
          insetInlineEnd: expandIconLineOffset,
          insetInlineStart: expandIconLineOffset,
          height: lineWidth
        },
        "&::after": {
          top: expandIconLineOffset,
          bottom: expandIconLineOffset,
          insetInlineStart: expandIconHalfInner,
          width: lineWidth,
          transform: "rotate(90deg)"
        },
        // Motion effect
        "&-collapsed::before": {
          transform: "rotate(-180deg)"
        },
        "&-collapsed::after": {
          transform: "rotate(0deg)"
        },
        "&-spaced": {
          "&::before, &::after": {
            display: "none",
            content: "none"
          },
          background: "transparent",
          border: 0,
          visibility: "hidden"
        }
      }),
      [`${componentCls}-row-indent + ${componentCls}-row-expand-icon`]: {
        marginTop: expandIconMarginTop,
        marginInlineEnd: paddingXS
      },
      [`tr${componentCls}-expanded-row`]: {
        "&, &:hover": {
          "> th, > td": {
            background: tableExpandedRowBg
          }
        },
        // https://github.com/ant-design/ant-design/issues/25573
        [`${antCls}-descriptions-view`]: {
          display: "flex",
          table: {
            flex: "auto",
            width: "100%"
          }
        }
      },
      // With fixed
      [`${componentCls}-expanded-row-fixed`]: {
        position: "relative",
        margin: `${unit(calc(tablePaddingVertical).mul(-1).equal())} ${unit(calc(tablePaddingHorizontal).mul(-1).equal())}`,
        padding: `${unit(tablePaddingVertical)} ${unit(tablePaddingHorizontal)}`
      }
    }
  };
};
const genFilterStyle = (token) => {
  const {
    componentCls,
    antCls,
    iconCls,
    tableFilterDropdownWidth,
    tableFilterDropdownSearchWidth,
    paddingXXS,
    paddingXS,
    colorText,
    lineWidth,
    lineType,
    tableBorderColor,
    headerIconColor,
    fontSizeSM,
    tablePaddingHorizontal,
    borderRadius,
    motionDurationSlow,
    colorIcon,
    colorPrimary,
    tableHeaderFilterActiveBg,
    colorTextDisabled,
    tableFilterDropdownBg,
    tableFilterDropdownHeight,
    controlItemBgHover,
    controlItemBgActive,
    boxShadowSecondary,
    filterDropdownMenuBg,
    calc
  } = token;
  const dropdownPrefixCls = `${antCls}-dropdown`;
  const tableFilterDropdownPrefixCls = `${componentCls}-filter-dropdown`;
  const treePrefixCls = `${antCls}-tree`;
  const tableBorder = `${unit(lineWidth)} ${lineType} ${tableBorderColor}`;
  return [
    {
      [`${componentCls}-wrapper`]: {
        [`${componentCls}-filter-column`]: {
          display: "flex",
          justifyContent: "space-between"
        },
        [`${componentCls}-filter-trigger`]: {
          position: "relative",
          display: "flex",
          alignItems: "center",
          marginBlock: calc(paddingXXS).mul(-1).equal(),
          marginInline: `${unit(paddingXXS)} ${unit(calc(tablePaddingHorizontal).div(2).mul(-1).equal())}`,
          padding: `0 ${unit(paddingXXS)}`,
          color: headerIconColor,
          fontSize: fontSizeSM,
          borderRadius,
          cursor: "pointer",
          transition: `all ${motionDurationSlow}`,
          "&:hover": {
            color: colorIcon,
            background: tableHeaderFilterActiveBg
          },
          "&.active": {
            color: colorPrimary
          }
        }
      }
    },
    {
      // Dropdown
      [`${antCls}-dropdown`]: {
        [tableFilterDropdownPrefixCls]: Object.assign(Object.assign({}, resetComponent(token)), {
          minWidth: tableFilterDropdownWidth,
          backgroundColor: tableFilterDropdownBg,
          borderRadius,
          boxShadow: boxShadowSecondary,
          overflow: "hidden",
          // Reset menu
          [`${dropdownPrefixCls}-menu`]: {
            // https://github.com/ant-design/ant-design/issues/4916
            // https://github.com/ant-design/ant-design/issues/19542
            maxHeight: tableFilterDropdownHeight,
            overflowX: "hidden",
            border: 0,
            boxShadow: "none",
            borderRadius: "unset",
            backgroundColor: filterDropdownMenuBg,
            "&:empty::after": {
              display: "block",
              padding: `${unit(paddingXS)} 0`,
              color: colorTextDisabled,
              fontSize: fontSizeSM,
              textAlign: "center",
              content: '"Not Found"'
            }
          },
          [`${tableFilterDropdownPrefixCls}-tree`]: {
            paddingBlock: `${unit(paddingXS)} 0`,
            paddingInline: paddingXS,
            [treePrefixCls]: {
              padding: 0
            },
            [`${treePrefixCls}-treenode ${treePrefixCls}-node-content-wrapper:hover`]: {
              backgroundColor: controlItemBgHover
            },
            [`${treePrefixCls}-treenode-checkbox-checked ${treePrefixCls}-node-content-wrapper`]: {
              "&, &:hover": {
                backgroundColor: controlItemBgActive
              }
            }
          },
          [`${tableFilterDropdownPrefixCls}-search`]: {
            padding: paddingXS,
            borderBottom: tableBorder,
            "&-input": {
              input: {
                minWidth: tableFilterDropdownSearchWidth
              },
              [iconCls]: {
                color: colorTextDisabled
              }
            }
          },
          [`${tableFilterDropdownPrefixCls}-checkall`]: {
            width: "100%",
            marginBottom: paddingXXS,
            marginInlineStart: paddingXXS
          },
          // Operation
          [`${tableFilterDropdownPrefixCls}-btns`]: {
            display: "flex",
            justifyContent: "space-between",
            padding: `${unit(calc(paddingXS).sub(lineWidth).equal())} ${unit(paddingXS)}`,
            overflow: "hidden",
            borderTop: tableBorder
          }
        })
      }
    },
    // Dropdown Menu & SubMenu
    {
      // submenu of table filter dropdown
      [`${antCls}-dropdown ${tableFilterDropdownPrefixCls}, ${tableFilterDropdownPrefixCls}-submenu`]: {
        // Checkbox
        [`${antCls}-checkbox-wrapper + span`]: {
          paddingInlineStart: paddingXS,
          color: colorText
        },
        "> ul": {
          maxHeight: "calc(100vh - 130px)",
          overflowX: "hidden",
          overflowY: "auto"
        }
      }
    }
  ];
};
const genFixedStyle = (token) => {
  const {
    componentCls,
    lineWidth,
    colorSplit,
    motionDurationSlow,
    zIndexTableFixed: zIndexTableFixed2,
    tableBg,
    zIndexTableSticky,
    calc
  } = token;
  const shadowColor = colorSplit;
  return {
    [`${componentCls}-wrapper`]: {
      [`
        ${componentCls}-cell-fix-left,
        ${componentCls}-cell-fix-right
      `]: {
        position: "sticky !important",
        zIndex: zIndexTableFixed2,
        background: tableBg
      },
      [`
        ${componentCls}-cell-fix-left-first::after,
        ${componentCls}-cell-fix-left-last::after
      `]: {
        position: "absolute",
        top: 0,
        right: {
          _skip_check_: true,
          value: 0
        },
        bottom: calc(lineWidth).mul(-1).equal(),
        width: 30,
        transform: "translateX(100%)",
        transition: `box-shadow ${motionDurationSlow}`,
        content: '""',
        pointerEvents: "none"
      },
      [`${componentCls}-cell-fix-left-all::after`]: {
        display: "none"
      },
      [`
        ${componentCls}-cell-fix-right-first::after,
        ${componentCls}-cell-fix-right-last::after
      `]: {
        position: "absolute",
        top: 0,
        bottom: calc(lineWidth).mul(-1).equal(),
        left: {
          _skip_check_: true,
          value: 0
        },
        width: 30,
        transform: "translateX(-100%)",
        transition: `box-shadow ${motionDurationSlow}`,
        content: '""',
        pointerEvents: "none"
      },
      [`${componentCls}-container`]: {
        position: "relative",
        "&::before, &::after": {
          position: "absolute",
          top: 0,
          bottom: 0,
          zIndex: calc(zIndexTableSticky).add(1).equal({
            unit: false
          }),
          width: 30,
          transition: `box-shadow ${motionDurationSlow}`,
          content: '""',
          pointerEvents: "none"
        },
        "&::before": {
          insetInlineStart: 0
        },
        "&::after": {
          insetInlineEnd: 0
        }
      },
      [`${componentCls}-ping-left`]: {
        [`&:not(${componentCls}-has-fix-left) ${componentCls}-container::before`]: {
          boxShadow: `inset 10px 0 8px -8px ${shadowColor}`
        },
        [`
          ${componentCls}-cell-fix-left-first::after,
          ${componentCls}-cell-fix-left-last::after
        `]: {
          boxShadow: `inset 10px 0 8px -8px ${shadowColor}`
        },
        [`${componentCls}-cell-fix-left-last::before`]: {
          backgroundColor: "transparent !important"
        }
      },
      [`${componentCls}-ping-right`]: {
        [`&:not(${componentCls}-has-fix-right) ${componentCls}-container::after`]: {
          boxShadow: `inset -10px 0 8px -8px ${shadowColor}`
        },
        [`
          ${componentCls}-cell-fix-right-first::after,
          ${componentCls}-cell-fix-right-last::after
        `]: {
          boxShadow: `inset -10px 0 8px -8px ${shadowColor}`
        }
      },
      // Gapped fixed Columns do not show the shadow
      [`${componentCls}-fixed-column-gapped`]: {
        [`
        ${componentCls}-cell-fix-left-first::after,
        ${componentCls}-cell-fix-left-last::after,
        ${componentCls}-cell-fix-right-first::after,
        ${componentCls}-cell-fix-right-last::after
      `]: {
          boxShadow: "none"
        }
      }
    }
  };
};
const genPaginationStyle = (token) => {
  const {
    componentCls,
    antCls,
    margin
  } = token;
  return {
    [`${componentCls}-wrapper`]: {
      // ========================== Pagination ==========================
      [`${componentCls}-pagination${antCls}-pagination`]: {
        margin: `${unit(margin)} 0`
      },
      [`${componentCls}-pagination`]: {
        display: "flex",
        flexWrap: "wrap",
        rowGap: token.paddingXS,
        "> *": {
          flex: "none"
        },
        "&-left": {
          justifyContent: "flex-start"
        },
        "&-center": {
          justifyContent: "center"
        },
        "&-right": {
          justifyContent: "flex-end"
        }
      }
    }
  };
};
const genRadiusStyle = (token) => {
  const {
    componentCls,
    tableRadius
  } = token;
  return {
    [`${componentCls}-wrapper`]: {
      [componentCls]: {
        // https://github.com/ant-design/ant-design/issues/39115#issuecomment-1362314574
        [`${componentCls}-title, ${componentCls}-header`]: {
          borderRadius: `${unit(tableRadius)} ${unit(tableRadius)} 0 0`
        },
        [`${componentCls}-title + ${componentCls}-container`]: {
          borderStartStartRadius: 0,
          borderStartEndRadius: 0,
          // https://github.com/ant-design/ant-design/issues/41975
          [`${componentCls}-header, table`]: {
            borderRadius: 0
          },
          "table > thead > tr:first-child": {
            "th:first-child, th:last-child, td:first-child, td:last-child": {
              borderRadius: 0
            }
          }
        },
        "&-container": {
          borderStartStartRadius: tableRadius,
          borderStartEndRadius: tableRadius,
          "table > thead > tr:first-child": {
            "> *:first-child": {
              borderStartStartRadius: tableRadius
            },
            "> *:last-child": {
              borderStartEndRadius: tableRadius
            }
          }
        },
        "&-footer": {
          borderRadius: `0 0 ${unit(tableRadius)} ${unit(tableRadius)}`
        }
      }
    }
  };
};
const genStyle = (token) => {
  const {
    componentCls
  } = token;
  return {
    [`${componentCls}-wrapper-rtl`]: {
      direction: "rtl",
      table: {
        direction: "rtl"
      },
      [`${componentCls}-pagination-left`]: {
        justifyContent: "flex-end"
      },
      [`${componentCls}-pagination-right`]: {
        justifyContent: "flex-start"
      },
      [`${componentCls}-row-expand-icon`]: {
        float: "right",
        "&::after": {
          transform: "rotate(-90deg)"
        },
        "&-collapsed::before": {
          transform: "rotate(180deg)"
        },
        "&-collapsed::after": {
          transform: "rotate(0deg)"
        }
      },
      [`${componentCls}-container`]: {
        "&::before": {
          insetInlineStart: "unset",
          insetInlineEnd: 0
        },
        "&::after": {
          insetInlineStart: 0,
          insetInlineEnd: "unset"
        },
        [`${componentCls}-row-indent`]: {
          float: "right"
        }
      }
    }
  };
};
const genSelectionStyle = (token) => {
  const {
    componentCls,
    antCls,
    iconCls,
    fontSizeIcon,
    padding,
    paddingXS,
    headerIconColor,
    headerIconHoverColor,
    tableSelectionColumnWidth,
    tableSelectedRowBg,
    tableSelectedRowHoverBg,
    tableRowHoverBg,
    tablePaddingHorizontal,
    calc
  } = token;
  return {
    [`${componentCls}-wrapper`]: {
      // ========================== Selections ==========================
      [`${componentCls}-selection-col`]: {
        width: tableSelectionColumnWidth,
        [`&${componentCls}-selection-col-with-dropdown`]: {
          width: calc(tableSelectionColumnWidth).add(fontSizeIcon).add(calc(padding).div(4)).equal()
        }
      },
      [`${componentCls}-bordered ${componentCls}-selection-col`]: {
        width: calc(tableSelectionColumnWidth).add(calc(paddingXS).mul(2)).equal(),
        [`&${componentCls}-selection-col-with-dropdown`]: {
          width: calc(tableSelectionColumnWidth).add(fontSizeIcon).add(calc(padding).div(4)).add(calc(paddingXS).mul(2)).equal()
        }
      },
      [`
        table tr th${componentCls}-selection-column,
        table tr td${componentCls}-selection-column,
        ${componentCls}-selection-column
      `]: {
        paddingInlineEnd: token.paddingXS,
        paddingInlineStart: token.paddingXS,
        textAlign: "center",
        [`${antCls}-radio-wrapper`]: {
          marginInlineEnd: 0
        }
      },
      [`table tr th${componentCls}-selection-column${componentCls}-cell-fix-left`]: {
        zIndex: calc(token.zIndexTableFixed).add(1).equal({
          unit: false
        })
      },
      [`table tr th${componentCls}-selection-column::after`]: {
        backgroundColor: "transparent !important"
      },
      [`${componentCls}-selection`]: {
        position: "relative",
        display: "inline-flex",
        flexDirection: "column"
      },
      [`${componentCls}-selection-extra`]: {
        position: "absolute",
        top: 0,
        zIndex: 1,
        cursor: "pointer",
        transition: `all ${token.motionDurationSlow}`,
        marginInlineStart: "100%",
        paddingInlineStart: unit(calc(tablePaddingHorizontal).div(4).equal()),
        [iconCls]: {
          color: headerIconColor,
          fontSize: fontSizeIcon,
          verticalAlign: "baseline",
          "&:hover": {
            color: headerIconHoverColor
          }
        }
      },
      // ============================= Rows =============================
      [`${componentCls}-tbody`]: {
        [`${componentCls}-row`]: {
          [`&${componentCls}-row-selected`]: {
            [`> ${componentCls}-cell`]: {
              background: tableSelectedRowBg,
              "&-row-hover": {
                background: tableSelectedRowHoverBg
              }
            }
          },
          [`> ${componentCls}-cell-row-hover`]: {
            background: tableRowHoverBg
          }
        }
      }
    }
  };
};
const genSizeStyle = (token) => {
  const {
    componentCls,
    tableExpandColumnWidth,
    calc
  } = token;
  const getSizeStyle = (size, paddingVertical, paddingHorizontal, fontSize) => ({
    [`${componentCls}${componentCls}-${size}`]: {
      fontSize,
      [`
        ${componentCls}-title,
        ${componentCls}-footer,
        ${componentCls}-cell,
        ${componentCls}-thead > tr > th,
        ${componentCls}-tbody > tr > th,
        ${componentCls}-tbody > tr > td,
        tfoot > tr > th,
        tfoot > tr > td
      `]: {
        padding: `${unit(paddingVertical)} ${unit(paddingHorizontal)}`
      },
      [`${componentCls}-filter-trigger`]: {
        marginInlineEnd: unit(calc(paddingHorizontal).div(2).mul(-1).equal())
      },
      [`${componentCls}-expanded-row-fixed`]: {
        margin: `${unit(calc(paddingVertical).mul(-1).equal())} ${unit(calc(paddingHorizontal).mul(-1).equal())}`
      },
      [`${componentCls}-tbody`]: {
        // ========================= Nest Table ===========================
        [`${componentCls}-wrapper:only-child ${componentCls}`]: {
          marginBlock: unit(calc(paddingVertical).mul(-1).equal()),
          marginInline: `${unit(calc(tableExpandColumnWidth).sub(paddingHorizontal).equal())} ${unit(calc(paddingHorizontal).mul(-1).equal())}`
        }
      },
      // https://github.com/ant-design/ant-design/issues/35167
      [`${componentCls}-selection-extra`]: {
        paddingInlineStart: unit(calc(paddingHorizontal).div(4).equal())
      }
    }
  });
  return {
    [`${componentCls}-wrapper`]: Object.assign(Object.assign({}, getSizeStyle("middle", token.tablePaddingVerticalMiddle, token.tablePaddingHorizontalMiddle, token.tableFontSizeMiddle)), getSizeStyle("small", token.tablePaddingVerticalSmall, token.tablePaddingHorizontalSmall, token.tableFontSizeSmall))
  };
};
const genSorterStyle = (token) => {
  const {
    componentCls,
    marginXXS,
    fontSizeIcon,
    headerIconColor,
    headerIconHoverColor
  } = token;
  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}-thead th${componentCls}-column-has-sorters`]: {
        outline: "none",
        cursor: "pointer",
        // why left 0s? Avoid column header move with transition when left is changed
        // https://github.com/ant-design/ant-design/issues/50588
        transition: `all ${token.motionDurationSlow}, left 0s`,
        "&:hover": {
          background: token.tableHeaderSortHoverBg,
          "&::before": {
            backgroundColor: "transparent !important"
          }
        },
        "&:focus-visible": {
          color: token.colorPrimary
        },
        // https://github.com/ant-design/ant-design/issues/30969
        [`
          &${componentCls}-cell-fix-left:hover,
          &${componentCls}-cell-fix-right:hover
        `]: {
          background: token.tableFixedHeaderSortActiveBg
        }
      },
      [`${componentCls}-thead th${componentCls}-column-sort`]: {
        background: token.tableHeaderSortBg,
        "&::before": {
          backgroundColor: "transparent !important"
        }
      },
      [`td${componentCls}-column-sort`]: {
        background: token.tableBodySortBg
      },
      [`${componentCls}-column-title`]: {
        position: "relative",
        zIndex: 1,
        flex: 1,
        minWidth: 0
      },
      [`${componentCls}-column-sorters`]: {
        display: "flex",
        flex: "auto",
        alignItems: "center",
        justifyContent: "space-between",
        "&::after": {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          content: '""'
        }
      },
      [`${componentCls}-column-sorters-tooltip-target-sorter`]: {
        "&::after": {
          content: "none"
        }
      },
      [`${componentCls}-column-sorter`]: {
        marginInlineStart: marginXXS,
        color: headerIconColor,
        fontSize: 0,
        transition: `color ${token.motionDurationSlow}`,
        "&-inner": {
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center"
        },
        "&-up, &-down": {
          fontSize: fontSizeIcon,
          "&.active": {
            color: token.colorPrimary
          }
        },
        [`${componentCls}-column-sorter-up + ${componentCls}-column-sorter-down`]: {
          marginTop: "-0.3em"
        }
      },
      [`${componentCls}-column-sorters:hover ${componentCls}-column-sorter`]: {
        color: headerIconHoverColor
      }
    }
  };
};
const genStickyStyle = (token) => {
  const {
    componentCls,
    opacityLoading,
    tableScrollThumbBg,
    tableScrollThumbBgHover,
    tableScrollThumbSize,
    tableScrollBg,
    zIndexTableSticky,
    stickyScrollBarBorderRadius,
    lineWidth,
    lineType,
    tableBorderColor
  } = token;
  const tableBorder = `${unit(lineWidth)} ${lineType} ${tableBorderColor}`;
  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}-sticky`]: {
        "&-holder": {
          position: "sticky",
          zIndex: zIndexTableSticky,
          background: token.colorBgContainer
        },
        "&-scroll": {
          position: "sticky",
          bottom: 0,
          height: `${unit(tableScrollThumbSize)} !important`,
          zIndex: zIndexTableSticky,
          display: "flex",
          alignItems: "center",
          background: tableScrollBg,
          borderTop: tableBorder,
          opacity: opacityLoading,
          "&:hover": {
            transformOrigin: "center bottom"
          },
          // fake scrollbar style of sticky
          "&-bar": {
            height: tableScrollThumbSize,
            backgroundColor: tableScrollThumbBg,
            borderRadius: stickyScrollBarBorderRadius,
            transition: `all ${token.motionDurationSlow}, transform 0s`,
            position: "absolute",
            bottom: 0,
            "&:hover, &-active": {
              backgroundColor: tableScrollThumbBgHover
            }
          }
        }
      }
    }
  };
};
const genSummaryStyle = (token) => {
  const {
    componentCls,
    lineWidth,
    tableBorderColor,
    calc
  } = token;
  const tableBorder = `${unit(lineWidth)} ${token.lineType} ${tableBorderColor}`;
  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}-summary`]: {
        position: "relative",
        zIndex: token.zIndexTableFixed,
        background: token.tableBg,
        "> tr": {
          "> th, > td": {
            borderBottom: tableBorder
          }
        }
      },
      [`div${componentCls}-summary`]: {
        boxShadow: `0 ${unit(calc(lineWidth).mul(-1).equal())} 0 ${tableBorderColor}`
      }
    }
  };
};
const genVirtualStyle = (token) => {
  const {
    componentCls,
    motionDurationMid,
    lineWidth,
    lineType,
    tableBorderColor,
    calc
  } = token;
  const tableBorder = `${unit(lineWidth)} ${lineType} ${tableBorderColor}`;
  const rowCellCls = `${componentCls}-expanded-row-cell`;
  return {
    [`${componentCls}-wrapper`]: {
      // ========================== Row ==========================
      [`${componentCls}-tbody-virtual`]: {
        [`${componentCls}-tbody-virtual-holder-inner`]: {
          [`
            & > ${componentCls}-row, 
            & > div:not(${componentCls}-row) > ${componentCls}-row
          `]: {
            display: "flex",
            boxSizing: "border-box",
            width: "100%"
          }
        },
        [`${componentCls}-cell`]: {
          borderBottom: tableBorder,
          transition: `background ${motionDurationMid}`
        },
        [`${componentCls}-expanded-row`]: {
          [`${rowCellCls}${rowCellCls}-fixed`]: {
            position: "sticky",
            insetInlineStart: 0,
            overflow: "hidden",
            width: `calc(var(--virtual-width) - ${unit(lineWidth)})`,
            borderInlineEnd: "none"
          }
        }
      },
      // ======================== Border =========================
      [`${componentCls}-bordered`]: {
        [`${componentCls}-tbody-virtual`]: {
          "&:after": {
            content: '""',
            insetInline: 0,
            bottom: 0,
            borderBottom: tableBorder,
            position: "absolute"
          },
          [`${componentCls}-cell`]: {
            borderInlineEnd: tableBorder,
            [`&${componentCls}-cell-fix-right-first:before`]: {
              content: '""',
              position: "absolute",
              insetBlock: 0,
              insetInlineStart: calc(lineWidth).mul(-1).equal(),
              borderInlineStart: tableBorder
            }
          }
        },
        // Empty placeholder
        [`&${componentCls}-virtual`]: {
          [`${componentCls}-placeholder ${componentCls}-cell`]: {
            borderInlineEnd: tableBorder,
            borderBottom: tableBorder
          }
        }
      }
    }
  };
};
const genTableStyle = (token) => {
  const {
    componentCls,
    fontWeightStrong,
    tablePaddingVertical,
    tablePaddingHorizontal,
    tableExpandColumnWidth,
    lineWidth,
    lineType,
    tableBorderColor,
    tableFontSize,
    tableBg,
    tableRadius,
    tableHeaderTextColor,
    motionDurationMid,
    tableHeaderBg,
    tableHeaderCellSplitColor,
    tableFooterTextColor,
    tableFooterBg,
    calc
  } = token;
  const tableBorder = `${unit(lineWidth)} ${lineType} ${tableBorderColor}`;
  return {
    [`${componentCls}-wrapper`]: Object.assign(Object.assign({
      clear: "both",
      maxWidth: "100%",
      // fix https://github.com/ant-design/ant-design/issues/46177
      ["--rc-virtual-list-scrollbar-bg"]: token.tableScrollBg
    }, clearFix()), {
      [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
        fontSize: tableFontSize,
        background: tableBg,
        borderRadius: `${unit(tableRadius)} ${unit(tableRadius)} 0 0`,
        // https://github.com/ant-design/ant-design/issues/47486
        scrollbarColor: `${token.tableScrollThumbBg} ${token.tableScrollBg}`
      }),
      // https://github.com/ant-design/ant-design/issues/17611
      table: {
        width: "100%",
        textAlign: "start",
        borderRadius: `${unit(tableRadius)} ${unit(tableRadius)} 0 0`,
        borderCollapse: "separate",
        borderSpacing: 0
      },
      // ============================= Cell ==============================
      [`
          ${componentCls}-cell,
          ${componentCls}-thead > tr > th,
          ${componentCls}-tbody > tr > th,
          ${componentCls}-tbody > tr > td,
          tfoot > tr > th,
          tfoot > tr > td
        `]: {
        position: "relative",
        padding: `${unit(tablePaddingVertical)} ${unit(tablePaddingHorizontal)}`,
        overflowWrap: "break-word"
      },
      // ============================ Title =============================
      [`${componentCls}-title`]: {
        padding: `${unit(tablePaddingVertical)} ${unit(tablePaddingHorizontal)}`
      },
      // ============================ Header ============================
      [`${componentCls}-thead`]: {
        [`
          > tr > th,
          > tr > td
        `]: {
          position: "relative",
          color: tableHeaderTextColor,
          fontWeight: fontWeightStrong,
          textAlign: "start",
          background: tableHeaderBg,
          borderBottom: tableBorder,
          transition: `background ${motionDurationMid} ease`,
          "&[colspan]:not([colspan='1'])": {
            textAlign: "center"
          },
          [`&:not(:last-child):not(${componentCls}-selection-column):not(${componentCls}-row-expand-icon-cell):not([colspan])::before`]: {
            position: "absolute",
            top: "50%",
            insetInlineEnd: 0,
            width: 1,
            height: "1.6em",
            backgroundColor: tableHeaderCellSplitColor,
            transform: "translateY(-50%)",
            transition: `background-color ${motionDurationMid}`,
            content: '""'
          }
        },
        "> tr:not(:last-child) > th[colspan]": {
          borderBottom: 0
        }
      },
      // ============================ Body ============================
      [`${componentCls}-tbody`]: {
        "> tr": {
          "> th, > td": {
            transition: `background ${motionDurationMid}, border-color ${motionDurationMid}`,
            borderBottom: tableBorder,
            // ========================= Nest Table ===========================
            [`
              > ${componentCls}-wrapper:only-child,
              > ${componentCls}-expanded-row-fixed > ${componentCls}-wrapper:only-child
            `]: {
              [componentCls]: {
                marginBlock: unit(calc(tablePaddingVertical).mul(-1).equal()),
                marginInline: `${unit(calc(tableExpandColumnWidth).sub(tablePaddingHorizontal).equal())}
                ${unit(calc(tablePaddingHorizontal).mul(-1).equal())}`,
                [`${componentCls}-tbody > tr:last-child > td`]: {
                  borderBottomWidth: 0,
                  "&:first-child, &:last-child": {
                    borderRadius: 0
                  }
                }
              }
            }
          },
          "> th": {
            position: "relative",
            color: tableHeaderTextColor,
            fontWeight: fontWeightStrong,
            textAlign: "start",
            background: tableHeaderBg,
            borderBottom: tableBorder,
            transition: `background ${motionDurationMid} ease`
          }
        }
      },
      // ============================ Footer ============================
      [`${componentCls}-footer`]: {
        padding: `${unit(tablePaddingVertical)} ${unit(tablePaddingHorizontal)}`,
        color: tableFooterTextColor,
        background: tableFooterBg
      }
    })
  };
};
const prepareComponentToken$2 = (token) => {
  const {
    colorFillAlter,
    colorBgContainer,
    colorTextHeading,
    colorFillSecondary,
    colorFillContent,
    controlItemBgActive,
    controlItemBgActiveHover,
    padding,
    paddingSM,
    paddingXS,
    colorBorderSecondary,
    borderRadiusLG,
    controlHeight,
    colorTextPlaceholder,
    fontSize,
    fontSizeSM,
    lineHeight,
    lineWidth,
    colorIcon,
    colorIconHover,
    opacityLoading,
    controlInteractiveSize
  } = token;
  const colorFillSecondarySolid = new FastColor(colorFillSecondary).onBackground(colorBgContainer).toHexString();
  const colorFillContentSolid = new FastColor(colorFillContent).onBackground(colorBgContainer).toHexString();
  const colorFillAlterSolid = new FastColor(colorFillAlter).onBackground(colorBgContainer).toHexString();
  const baseColorAction = new FastColor(colorIcon);
  const baseColorActionHover = new FastColor(colorIconHover);
  const expandIconHalfInner = controlInteractiveSize / 2 - lineWidth;
  const expandIconSize = expandIconHalfInner * 2 + lineWidth * 3;
  return {
    headerBg: colorFillAlterSolid,
    headerColor: colorTextHeading,
    headerSortActiveBg: colorFillSecondarySolid,
    headerSortHoverBg: colorFillContentSolid,
    bodySortBg: colorFillAlterSolid,
    rowHoverBg: colorFillAlterSolid,
    rowSelectedBg: controlItemBgActive,
    rowSelectedHoverBg: controlItemBgActiveHover,
    rowExpandedBg: colorFillAlter,
    cellPaddingBlock: padding,
    cellPaddingInline: padding,
    cellPaddingBlockMD: paddingSM,
    cellPaddingInlineMD: paddingXS,
    cellPaddingBlockSM: paddingXS,
    cellPaddingInlineSM: paddingXS,
    borderColor: colorBorderSecondary,
    headerBorderRadius: borderRadiusLG,
    footerBg: colorFillAlterSolid,
    footerColor: colorTextHeading,
    cellFontSize: fontSize,
    cellFontSizeMD: fontSize,
    cellFontSizeSM: fontSize,
    headerSplitColor: colorBorderSecondary,
    fixedHeaderSortActiveBg: colorFillSecondarySolid,
    headerFilterHoverBg: colorFillContent,
    filterDropdownMenuBg: colorBgContainer,
    filterDropdownBg: colorBgContainer,
    expandIconBg: colorBgContainer,
    selectionColumnWidth: controlHeight,
    stickyScrollBarBg: colorTextPlaceholder,
    stickyScrollBarBorderRadius: 100,
    expandIconMarginTop: (fontSize * lineHeight - lineWidth * 3) / 2 - Math.ceil((fontSizeSM * 1.4 - lineWidth * 3) / 2),
    headerIconColor: baseColorAction.clone().setA(baseColorAction.a * opacityLoading).toRgbString(),
    headerIconHoverColor: baseColorActionHover.clone().setA(baseColorActionHover.a * opacityLoading).toRgbString(),
    expandIconHalfInner,
    expandIconSize,
    expandIconScale: controlInteractiveSize / expandIconSize
  };
};
const zIndexTableFixed = 2;
const useStyle$2 = genStyleHooks("Table", (token) => {
  const {
    colorTextHeading,
    colorSplit,
    colorBgContainer,
    controlInteractiveSize: checkboxSize,
    headerBg,
    headerColor,
    headerSortActiveBg,
    headerSortHoverBg,
    bodySortBg,
    rowHoverBg,
    rowSelectedBg,
    rowSelectedHoverBg,
    rowExpandedBg,
    cellPaddingBlock,
    cellPaddingInline,
    cellPaddingBlockMD,
    cellPaddingInlineMD,
    cellPaddingBlockSM,
    cellPaddingInlineSM,
    borderColor,
    footerBg,
    footerColor,
    headerBorderRadius,
    cellFontSize,
    cellFontSizeMD,
    cellFontSizeSM,
    headerSplitColor,
    fixedHeaderSortActiveBg,
    headerFilterHoverBg,
    filterDropdownBg,
    expandIconBg,
    selectionColumnWidth,
    stickyScrollBarBg,
    calc
  } = token;
  const tableToken = merge$1(token, {
    tableFontSize: cellFontSize,
    tableBg: colorBgContainer,
    tableRadius: headerBorderRadius,
    tablePaddingVertical: cellPaddingBlock,
    tablePaddingHorizontal: cellPaddingInline,
    tablePaddingVerticalMiddle: cellPaddingBlockMD,
    tablePaddingHorizontalMiddle: cellPaddingInlineMD,
    tablePaddingVerticalSmall: cellPaddingBlockSM,
    tablePaddingHorizontalSmall: cellPaddingInlineSM,
    tableBorderColor: borderColor,
    tableHeaderTextColor: headerColor,
    tableHeaderBg: headerBg,
    tableFooterTextColor: footerColor,
    tableFooterBg: footerBg,
    tableHeaderCellSplitColor: headerSplitColor,
    tableHeaderSortBg: headerSortActiveBg,
    tableHeaderSortHoverBg: headerSortHoverBg,
    tableBodySortBg: bodySortBg,
    tableFixedHeaderSortActiveBg: fixedHeaderSortActiveBg,
    tableHeaderFilterActiveBg: headerFilterHoverBg,
    tableFilterDropdownBg: filterDropdownBg,
    tableRowHoverBg: rowHoverBg,
    tableSelectedRowBg: rowSelectedBg,
    tableSelectedRowHoverBg: rowSelectedHoverBg,
    zIndexTableFixed,
    zIndexTableSticky: calc(zIndexTableFixed).add(1).equal({
      unit: false
    }),
    tableFontSizeMiddle: cellFontSizeMD,
    tableFontSizeSmall: cellFontSizeSM,
    tableSelectionColumnWidth: selectionColumnWidth,
    tableExpandIconBg: expandIconBg,
    tableExpandColumnWidth: calc(checkboxSize).add(calc(token.padding).mul(2)).equal(),
    tableExpandedRowBg: rowExpandedBg,
    // Dropdown
    tableFilterDropdownWidth: 120,
    tableFilterDropdownHeight: 264,
    tableFilterDropdownSearchWidth: 140,
    // Virtual Scroll Bar
    tableScrollThumbSize: 8,
    // Mac scroll bar size
    tableScrollThumbBg: stickyScrollBarBg,
    tableScrollThumbBgHover: colorTextHeading,
    tableScrollBg: colorSplit
  });
  return [genTableStyle(tableToken), genPaginationStyle(tableToken), genSummaryStyle(tableToken), genSorterStyle(tableToken), genFilterStyle(tableToken), genBorderedStyle(tableToken), genRadiusStyle(tableToken), genExpandStyle(tableToken), genSummaryStyle(tableToken), genEmptyStyle(tableToken), genSelectionStyle(tableToken), genFixedStyle(tableToken), genStickyStyle(tableToken), genEllipsisStyle(tableToken), genSizeStyle(tableToken), genStyle(tableToken), genVirtualStyle(tableToken)];
}, prepareComponentToken$2, {
  unitless: {
    expandIconScale: true
  }
});
const EMPTY_LIST = [];
const InternalTable = (props, ref) => {
  var _a, _b;
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    size: customizeSize,
    bordered,
    dropdownPrefixCls: customizeDropdownPrefixCls,
    dataSource,
    pagination,
    rowSelection,
    rowKey = "key",
    rowClassName,
    columns,
    children,
    childrenColumnName: legacyChildrenColumnName,
    onChange,
    getPopupContainer,
    loading,
    expandIcon,
    expandable,
    expandedRowRender,
    expandIconColumnIndex,
    indentSize,
    scroll,
    sortDirections,
    locale: locale2,
    showSorterTooltip = {
      target: "full-header"
    },
    virtual
  } = props;
  devUseWarning();
  const baseColumns = reactExports.useMemo(() => columns || convertChildrenToColumns(children), [columns, children]);
  const needResponsive = reactExports.useMemo(() => baseColumns.some((col) => col.responsive), [baseColumns]);
  const screens = useBreakpoint(needResponsive);
  const mergedColumns = reactExports.useMemo(() => {
    const matched = new Set(Object.keys(screens).filter((m) => screens[m]));
    return baseColumns.filter((c) => !c.responsive || c.responsive.some((r) => matched.has(r)));
  }, [baseColumns, screens]);
  const tableProps = omit(props, ["className", "style", "columns"]);
  const {
    locale: contextLocale = localeValues,
    direction,
    table,
    renderEmpty,
    getPrefixCls,
    getPopupContainer: getContextPopupContainer
  } = reactExports.useContext(ConfigContext);
  const mergedSize = useSize(customizeSize);
  const tableLocale = Object.assign(Object.assign({}, contextLocale.Table), locale2);
  const rawData = dataSource || EMPTY_LIST;
  const prefixCls = getPrefixCls("table", customizePrefixCls);
  const dropdownPrefixCls = getPrefixCls("dropdown", customizeDropdownPrefixCls);
  const [, token] = useToken();
  const rootCls = useCSSVarCls(prefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$2(prefixCls, rootCls);
  const mergedExpandable = Object.assign(Object.assign({
    childrenColumnName: legacyChildrenColumnName,
    expandIconColumnIndex
  }, expandable), {
    expandIcon: (_a = expandable === null || expandable === void 0 ? void 0 : expandable.expandIcon) !== null && _a !== void 0 ? _a : (_b = table === null || table === void 0 ? void 0 : table.expandable) === null || _b === void 0 ? void 0 : _b.expandIcon
  });
  const {
    childrenColumnName = "children"
  } = mergedExpandable;
  const expandType = reactExports.useMemo(() => {
    if (rawData.some((item) => item === null || item === void 0 ? void 0 : item[childrenColumnName])) {
      return "nest";
    }
    if (expandedRowRender || (expandable === null || expandable === void 0 ? void 0 : expandable.expandedRowRender)) {
      return "row";
    }
    return null;
  }, [rawData]);
  const internalRefs = {
    body: reactExports.useRef(null)
  };
  const getContainerWidth = useContainerWidth(prefixCls);
  const rootRef = reactExports.useRef(null);
  const tblRef = reactExports.useRef(null);
  useProxyImperativeHandle(ref, () => Object.assign(Object.assign({}, tblRef.current), {
    nativeElement: rootRef.current
  }));
  const getRowKey = reactExports.useMemo(() => {
    if (typeof rowKey === "function") {
      return rowKey;
    }
    return (record) => record === null || record === void 0 ? void 0 : record[rowKey];
  }, [rowKey]);
  const [getRecordByKey] = useLazyKVMap(rawData, childrenColumnName, getRowKey);
  const changeEventInfo = {};
  const triggerOnChange = (info, action, reset = false) => {
    var _a2, _b2, _c, _d;
    const changeInfo = Object.assign(Object.assign({}, changeEventInfo), info);
    if (reset) {
      (_a2 = changeEventInfo.resetPagination) === null || _a2 === void 0 ? void 0 : _a2.call(changeEventInfo);
      if ((_b2 = changeInfo.pagination) === null || _b2 === void 0 ? void 0 : _b2.current) {
        changeInfo.pagination.current = 1;
      }
      if (pagination) {
        (_c = pagination.onChange) === null || _c === void 0 ? void 0 : _c.call(pagination, 1, (_d = changeInfo.pagination) === null || _d === void 0 ? void 0 : _d.pageSize);
      }
    }
    if (scroll && scroll.scrollToFirstRowOnChange !== false && internalRefs.body.current) {
      scrollTo(0, {
        getContainer: () => internalRefs.body.current
      });
    }
    onChange === null || onChange === void 0 ? void 0 : onChange(changeInfo.pagination, changeInfo.filters, changeInfo.sorter, {
      currentDataSource: getFilterData(getSortData(rawData, changeInfo.sorterStates, childrenColumnName), changeInfo.filterStates, childrenColumnName),
      action
    });
  };
  const onSorterChange = (sorter, sorterStates) => {
    triggerOnChange({
      sorter,
      sorterStates
    }, "sort", false);
  };
  const [transformSorterColumns, sortStates, sorterTitleProps, getSorters] = useFilterSorter({
    prefixCls,
    mergedColumns,
    onSorterChange,
    sortDirections: sortDirections || ["ascend", "descend"],
    tableLocale,
    showSorterTooltip
  });
  const sortedData = reactExports.useMemo(() => getSortData(rawData, sortStates, childrenColumnName), [rawData, sortStates]);
  changeEventInfo.sorter = getSorters();
  changeEventInfo.sorterStates = sortStates;
  const onFilterChange = (filters2, filterStates2) => {
    triggerOnChange({
      filters: filters2,
      filterStates: filterStates2
    }, "filter", true);
  };
  const [transformFilterColumns, filterStates, filters] = useFilter({
    prefixCls,
    locale: tableLocale,
    dropdownPrefixCls,
    mergedColumns,
    onFilterChange,
    getPopupContainer: getPopupContainer || getContextPopupContainer,
    rootClassName: classNames(rootClassName, rootCls)
  });
  const mergedData = getFilterData(sortedData, filterStates, childrenColumnName);
  changeEventInfo.filters = filters;
  changeEventInfo.filterStates = filterStates;
  const columnTitleProps = reactExports.useMemo(() => {
    const mergedFilters = {};
    Object.keys(filters).forEach((filterKey) => {
      if (filters[filterKey] !== null) {
        mergedFilters[filterKey] = filters[filterKey];
      }
    });
    return Object.assign(Object.assign({}, sorterTitleProps), {
      filters: mergedFilters
    });
  }, [sorterTitleProps, filters]);
  const [transformTitleColumns] = useTitleColumns(columnTitleProps);
  const onPaginationChange = (current, pageSize) => {
    triggerOnChange({
      pagination: Object.assign(Object.assign({}, changeEventInfo.pagination), {
        current,
        pageSize
      })
    }, "paginate");
  };
  const [mergedPagination, resetPagination] = usePagination(mergedData.length, onPaginationChange, pagination);
  changeEventInfo.pagination = pagination === false ? {} : getPaginationParam(mergedPagination, pagination);
  changeEventInfo.resetPagination = resetPagination;
  const pageData = reactExports.useMemo(() => {
    if (pagination === false || !mergedPagination.pageSize) {
      return mergedData;
    }
    const {
      current = 1,
      total,
      pageSize = DEFAULT_PAGE_SIZE
    } = mergedPagination;
    if (mergedData.length < total) {
      if (mergedData.length > pageSize) {
        return mergedData.slice((current - 1) * pageSize, current * pageSize);
      }
      return mergedData;
    }
    return mergedData.slice((current - 1) * pageSize, current * pageSize);
  }, [!!pagination, mergedData, mergedPagination === null || mergedPagination === void 0 ? void 0 : mergedPagination.current, mergedPagination === null || mergedPagination === void 0 ? void 0 : mergedPagination.pageSize, mergedPagination === null || mergedPagination === void 0 ? void 0 : mergedPagination.total]);
  const [transformSelectionColumns, selectedKeySet] = useSelection({
    prefixCls,
    data: mergedData,
    pageData,
    getRowKey,
    getRecordByKey,
    expandType,
    childrenColumnName,
    locale: tableLocale,
    getPopupContainer: getPopupContainer || getContextPopupContainer
  }, rowSelection);
  const internalRowClassName = (record, index, indent) => {
    let mergedRowClassName;
    if (typeof rowClassName === "function") {
      mergedRowClassName = classNames(rowClassName(record, index, indent));
    } else {
      mergedRowClassName = classNames(rowClassName);
    }
    return classNames({
      [`${prefixCls}-row-selected`]: selectedKeySet.has(getRowKey(record, index))
    }, mergedRowClassName);
  };
  mergedExpandable.__PARENT_RENDER_ICON__ = mergedExpandable.expandIcon;
  mergedExpandable.expandIcon = mergedExpandable.expandIcon || expandIcon || renderExpandIcon(tableLocale);
  if (expandType === "nest" && mergedExpandable.expandIconColumnIndex === void 0) {
    mergedExpandable.expandIconColumnIndex = rowSelection ? 1 : 0;
  } else if (mergedExpandable.expandIconColumnIndex > 0 && rowSelection) {
    mergedExpandable.expandIconColumnIndex -= 1;
  }
  if (typeof mergedExpandable.indentSize !== "number") {
    mergedExpandable.indentSize = typeof indentSize === "number" ? indentSize : 15;
  }
  const transformColumns = reactExports.useCallback((innerColumns) => transformTitleColumns(transformSelectionColumns(transformFilterColumns(transformSorterColumns(innerColumns)))), [transformSorterColumns, transformFilterColumns, transformSelectionColumns]);
  let topPaginationNode;
  let bottomPaginationNode;
  if (pagination !== false && (mergedPagination === null || mergedPagination === void 0 ? void 0 : mergedPagination.total)) {
    let paginationSize;
    if (mergedPagination.size) {
      paginationSize = mergedPagination.size;
    } else {
      paginationSize = mergedSize === "small" || mergedSize === "middle" ? "small" : void 0;
    }
    const renderPagination = (position22) => /* @__PURE__ */ reactExports.createElement(Pagination, Object.assign({}, mergedPagination, {
      className: classNames(`${prefixCls}-pagination ${prefixCls}-pagination-${position22}`, mergedPagination.className),
      size: paginationSize
    }));
    const defaultPosition = direction === "rtl" ? "left" : "right";
    const {
      position: position2
    } = mergedPagination;
    if (position2 !== null && Array.isArray(position2)) {
      const topPos = position2.find((p) => p.includes("top"));
      const bottomPos = position2.find((p) => p.includes("bottom"));
      const isDisable = position2.every((p) => `${p}` === "none");
      if (!topPos && !bottomPos && !isDisable) {
        bottomPaginationNode = renderPagination(defaultPosition);
      }
      if (topPos) {
        topPaginationNode = renderPagination(topPos.toLowerCase().replace("top", ""));
      }
      if (bottomPos) {
        bottomPaginationNode = renderPagination(bottomPos.toLowerCase().replace("bottom", ""));
      }
    } else {
      bottomPaginationNode = renderPagination(defaultPosition);
    }
  }
  let spinProps;
  if (typeof loading === "boolean") {
    spinProps = {
      spinning: loading
    };
  } else if (typeof loading === "object") {
    spinProps = Object.assign({
      spinning: true
    }, loading);
  }
  const wrapperClassNames = classNames(cssVarCls, rootCls, `${prefixCls}-wrapper`, table === null || table === void 0 ? void 0 : table.className, {
    [`${prefixCls}-wrapper-rtl`]: direction === "rtl"
  }, className, rootClassName, hashId);
  const mergedStyle = Object.assign(Object.assign({}, table === null || table === void 0 ? void 0 : table.style), style);
  const emptyText = typeof (locale2 === null || locale2 === void 0 ? void 0 : locale2.emptyText) !== "undefined" ? locale2.emptyText : (renderEmpty === null || renderEmpty === void 0 ? void 0 : renderEmpty("Table")) || /* @__PURE__ */ reactExports.createElement(DefaultRenderEmpty, {
    componentName: "Table"
  });
  const TableComponent = virtual ? RcVirtualTable : RcTable;
  const virtualProps = {};
  const listItemHeight = reactExports.useMemo(() => {
    const {
      fontSize,
      lineHeight,
      lineWidth,
      padding,
      paddingXS,
      paddingSM
    } = token;
    const fontHeight = Math.floor(fontSize * lineHeight);
    switch (mergedSize) {
      case "middle":
        return paddingSM * 2 + fontHeight + lineWidth;
      case "small":
        return paddingXS * 2 + fontHeight + lineWidth;
      default:
        return padding * 2 + fontHeight + lineWidth;
    }
  }, [token, mergedSize]);
  if (virtual) {
    virtualProps.listItemHeight = listItemHeight;
  }
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
    ref: rootRef,
    className: wrapperClassNames,
    style: mergedStyle
  }, /* @__PURE__ */ reactExports.createElement(Spin, Object.assign({
    spinning: false
  }, spinProps), topPaginationNode, /* @__PURE__ */ reactExports.createElement(TableComponent, Object.assign({}, virtualProps, tableProps, {
    ref: tblRef,
    columns: mergedColumns,
    direction,
    expandable: mergedExpandable,
    prefixCls,
    className: classNames({
      [`${prefixCls}-middle`]: mergedSize === "middle",
      [`${prefixCls}-small`]: mergedSize === "small",
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-empty`]: rawData.length === 0
    }, cssVarCls, rootCls, hashId),
    data: pageData,
    rowKey: getRowKey,
    rowClassName: internalRowClassName,
    emptyText,
    // Internal
    internalHooks: INTERNAL_HOOKS,
    internalRefs,
    transformColumns,
    getContainerWidth
  })), bottomPaginationNode)));
};
const InternalTable$1 = /* @__PURE__ */ reactExports.forwardRef(InternalTable);
const Table = (props, ref) => {
  const renderTimesRef = reactExports.useRef(0);
  renderTimesRef.current += 1;
  return /* @__PURE__ */ reactExports.createElement(InternalTable$1, Object.assign({}, props, {
    ref,
    _renderTimes: renderTimesRef.current
  }));
};
const ForwardTable = /* @__PURE__ */ reactExports.forwardRef(Table);
ForwardTable.SELECTION_COLUMN = SELECTION_COLUMN;
ForwardTable.EXPAND_COLUMN = EXPAND_COLUMN;
ForwardTable.SELECTION_ALL = SELECTION_ALL;
ForwardTable.SELECTION_INVERT = SELECTION_INVERT;
ForwardTable.SELECTION_NONE = SELECTION_NONE;
ForwardTable.Column = Column;
ForwardTable.ColumnGroup = ColumnGroup;
ForwardTable.Summary = FooterComponents;
const genBaseStyle = (token) => {
  const {
    paddingXXS,
    lineWidth,
    tagPaddingHorizontal,
    componentCls,
    calc
  } = token;
  const paddingInline = calc(tagPaddingHorizontal).sub(lineWidth).equal();
  const iconMarginInline = calc(paddingXXS).sub(lineWidth).equal();
  return {
    // Result
    [componentCls]: Object.assign(Object.assign({}, resetComponent(token)), {
      display: "inline-block",
      height: "auto",
      // https://github.com/ant-design/ant-design/pull/47504
      marginInlineEnd: token.marginXS,
      paddingInline,
      fontSize: token.tagFontSize,
      lineHeight: token.tagLineHeight,
      whiteSpace: "nowrap",
      background: token.defaultBg,
      border: `${unit(token.lineWidth)} ${token.lineType} ${token.colorBorder}`,
      borderRadius: token.borderRadiusSM,
      opacity: 1,
      transition: `all ${token.motionDurationMid}`,
      textAlign: "start",
      position: "relative",
      // RTL
      [`&${componentCls}-rtl`]: {
        direction: "rtl"
      },
      "&, a, a:hover": {
        color: token.defaultColor
      },
      [`${componentCls}-close-icon`]: {
        marginInlineStart: iconMarginInline,
        fontSize: token.tagIconSize,
        color: token.colorIcon,
        cursor: "pointer",
        transition: `all ${token.motionDurationMid}`,
        "&:hover": {
          color: token.colorTextHeading
        }
      },
      [`&${componentCls}-has-color`]: {
        borderColor: "transparent",
        [`&, a, a:hover, ${token.iconCls}-close, ${token.iconCls}-close:hover`]: {
          color: token.colorTextLightSolid
        }
      },
      "&-checkable": {
        backgroundColor: "transparent",
        borderColor: "transparent",
        cursor: "pointer",
        [`&:not(${componentCls}-checkable-checked):hover`]: {
          color: token.colorPrimary,
          backgroundColor: token.colorFillSecondary
        },
        "&:active, &-checked": {
          color: token.colorTextLightSolid
        },
        "&-checked": {
          backgroundColor: token.colorPrimary,
          "&:hover": {
            backgroundColor: token.colorPrimaryHover
          }
        },
        "&:active": {
          backgroundColor: token.colorPrimaryActive
        }
      },
      "&-hidden": {
        display: "none"
      },
      // To ensure that a space will be placed between character and `Icon`.
      [`> ${token.iconCls} + span, > span + ${token.iconCls}`]: {
        marginInlineStart: paddingInline
      }
    }),
    [`${componentCls}-borderless`]: {
      borderColor: "transparent",
      background: token.tagBorderlessBg
    }
  };
};
const prepareToken = (token) => {
  const {
    lineWidth,
    fontSizeIcon,
    calc
  } = token;
  const tagFontSize = token.fontSizeSM;
  const tagToken = merge$1(token, {
    tagFontSize,
    tagLineHeight: unit(calc(token.lineHeightSM).mul(tagFontSize).equal()),
    tagIconSize: calc(fontSizeIcon).sub(calc(lineWidth).mul(2)).equal(),
    // Tag icon is much smaller
    tagPaddingHorizontal: 8,
    // Fixed padding.
    tagBorderlessBg: token.defaultBg
  });
  return tagToken;
};
const prepareComponentToken$1 = (token) => ({
  defaultBg: new FastColor(token.colorFillQuaternary).onBackground(token.colorBgContainer).toHexString(),
  defaultColor: token.colorText
});
const useStyle$1 = genStyleHooks("Tag", (token) => {
  const tagToken = prepareToken(token);
  return genBaseStyle(tagToken);
}, prepareComponentToken$1);
var __rest$6 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const CheckableTag = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    style,
    className,
    checked,
    onChange,
    onClick
  } = props, restProps = __rest$6(props, ["prefixCls", "style", "className", "checked", "onChange", "onClick"]);
  const {
    getPrefixCls,
    tag
  } = reactExports.useContext(ConfigContext);
  const handleClick = (e2) => {
    onChange === null || onChange === void 0 ? void 0 : onChange(!checked);
    onClick === null || onClick === void 0 ? void 0 : onClick(e2);
  };
  const prefixCls = getPrefixCls("tag", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$1(prefixCls);
  const cls = classNames(prefixCls, `${prefixCls}-checkable`, {
    [`${prefixCls}-checkable-checked`]: checked
  }, tag === null || tag === void 0 ? void 0 : tag.className, className, hashId, cssVarCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("span", Object.assign({}, restProps, {
    ref,
    style: Object.assign(Object.assign({}, style), tag === null || tag === void 0 ? void 0 : tag.style),
    className: cls,
    onClick: handleClick
  })));
});
const genPresetStyle = (token) => genPresetColor(token, (colorKey, {
  textColor,
  lightBorderColor,
  lightColor,
  darkColor
}) => ({
  [`${token.componentCls}${token.componentCls}-${colorKey}`]: {
    color: textColor,
    background: lightColor,
    borderColor: lightBorderColor,
    // Inverse color
    "&-inverse": {
      color: token.colorTextLightSolid,
      background: darkColor,
      borderColor: darkColor
    },
    [`&${token.componentCls}-borderless`]: {
      borderColor: "transparent"
    }
  }
}));
const PresetCmp = genSubStyleComponent(["Tag", "preset"], (token) => {
  const tagToken = prepareToken(token);
  return genPresetStyle(tagToken);
}, prepareComponentToken$1);
function capitalize(str) {
  if (typeof str !== "string") {
    return str;
  }
  const ret = str.charAt(0).toUpperCase() + str.slice(1);
  return ret;
}
const genTagStatusStyle = (token, status, cssVariableType) => {
  const capitalizedCssVariableType = capitalize(cssVariableType);
  return {
    [`${token.componentCls}${token.componentCls}-${status}`]: {
      color: token[`color${cssVariableType}`],
      background: token[`color${capitalizedCssVariableType}Bg`],
      borderColor: token[`color${capitalizedCssVariableType}Border`],
      [`&${token.componentCls}-borderless`]: {
        borderColor: "transparent"
      }
    }
  };
};
const StatusCmp = genSubStyleComponent(["Tag", "status"], (token) => {
  const tagToken = prepareToken(token);
  return [genTagStatusStyle(tagToken, "success", "Success"), genTagStatusStyle(tagToken, "processing", "Info"), genTagStatusStyle(tagToken, "error", "Error"), genTagStatusStyle(tagToken, "warning", "Warning")];
}, prepareComponentToken$1);
var __rest$5 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const InternalTag = /* @__PURE__ */ reactExports.forwardRef((tagProps, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    children,
    icon,
    color,
    onClose,
    bordered = true,
    visible: deprecatedVisible
  } = tagProps, props = __rest$5(tagProps, ["prefixCls", "className", "rootClassName", "style", "children", "icon", "color", "onClose", "bordered", "visible"]);
  const {
    getPrefixCls,
    direction,
    tag: tagContext
  } = reactExports.useContext(ConfigContext);
  const [visible, setVisible] = reactExports.useState(true);
  const domProps = omit(props, ["closeIcon", "closable"]);
  reactExports.useEffect(() => {
    if (deprecatedVisible !== void 0) {
      setVisible(deprecatedVisible);
    }
  }, [deprecatedVisible]);
  const isPreset = isPresetColor(color);
  const isStatus = isPresetStatusColor(color);
  const isInternalColor = isPreset || isStatus;
  const tagStyle = Object.assign(Object.assign({
    backgroundColor: color && !isInternalColor ? color : void 0
  }, tagContext === null || tagContext === void 0 ? void 0 : tagContext.style), style);
  const prefixCls = getPrefixCls("tag", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle$1(prefixCls);
  const tagClassName = classNames(prefixCls, tagContext === null || tagContext === void 0 ? void 0 : tagContext.className, {
    [`${prefixCls}-${color}`]: isInternalColor,
    [`${prefixCls}-has-color`]: color && !isInternalColor,
    [`${prefixCls}-hidden`]: !visible,
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-borderless`]: !bordered
  }, className, rootClassName, hashId, cssVarCls);
  const handleCloseClick = (e2) => {
    e2.stopPropagation();
    onClose === null || onClose === void 0 ? void 0 : onClose(e2);
    if (e2.defaultPrevented) {
      return;
    }
    setVisible(false);
  };
  const [, mergedCloseIcon] = useClosable(pickClosable(tagProps), pickClosable(tagContext), {
    closable: false,
    closeIconRender: (iconNode2) => {
      const replacement = /* @__PURE__ */ reactExports.createElement("span", {
        className: `${prefixCls}-close-icon`,
        onClick: handleCloseClick
      }, iconNode2);
      return replaceElement(iconNode2, replacement, (originProps) => ({
        onClick: (e2) => {
          var _a;
          (_a = originProps === null || originProps === void 0 ? void 0 : originProps.onClick) === null || _a === void 0 ? void 0 : _a.call(originProps, e2);
          handleCloseClick(e2);
        },
        className: classNames(originProps === null || originProps === void 0 ? void 0 : originProps.className, `${prefixCls}-close-icon`)
      }));
    }
  });
  const isNeedWave = typeof props.onClick === "function" || children && children.type === "a";
  const iconNode = icon || null;
  const kids = iconNode ? /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, iconNode, children && /* @__PURE__ */ reactExports.createElement("span", null, children)) : children;
  const tagNode = /* @__PURE__ */ reactExports.createElement("span", Object.assign({}, domProps, {
    ref,
    className: tagClassName,
    style: tagStyle
  }), kids, mergedCloseIcon, isPreset && /* @__PURE__ */ reactExports.createElement(PresetCmp, {
    key: "preset",
    prefixCls
  }), isStatus && /* @__PURE__ */ reactExports.createElement(StatusCmp, {
    key: "status",
    prefixCls
  }));
  return wrapCSSVar(isNeedWave ? /* @__PURE__ */ reactExports.createElement(Wave, {
    component: "Tag"
  }, tagNode) : tagNode);
});
const Tag = InternalTag;
Tag.CheckableTag = CheckableTag;
const getTitleStyle = (fontSize, lineHeight, color, token) => {
  const {
    titleMarginBottom,
    fontWeightStrong
  } = token;
  return {
    marginBottom: titleMarginBottom,
    color,
    fontWeight: fontWeightStrong,
    fontSize,
    lineHeight
  };
};
const getTitleStyles = (token) => {
  const headings = [1, 2, 3, 4, 5];
  const styles = {};
  headings.forEach((headingLevel) => {
    styles[`
      h${headingLevel}&,
      div&-h${headingLevel},
      div&-h${headingLevel} > textarea,
      h${headingLevel}
    `] = getTitleStyle(token[`fontSizeHeading${headingLevel}`], token[`lineHeightHeading${headingLevel}`], token.colorTextHeading, token);
  });
  return styles;
};
const getLinkStyles = (token) => {
  const {
    componentCls
  } = token;
  return {
    "a&, a": Object.assign(Object.assign({}, operationUnit(token)), {
      userSelect: "text",
      [`&[disabled], &${componentCls}-disabled`]: {
        color: token.colorTextDisabled,
        cursor: "not-allowed",
        "&:active, &:hover": {
          color: token.colorTextDisabled
        },
        "&:active": {
          pointerEvents: "none"
        }
      }
    })
  };
};
const getResetStyles = (token) => ({
  code: {
    margin: "0 0.2em",
    paddingInline: "0.4em",
    paddingBlock: "0.2em 0.1em",
    fontSize: "85%",
    fontFamily: token.fontFamilyCode,
    background: "rgba(150, 150, 150, 0.1)",
    border: "1px solid rgba(100, 100, 100, 0.2)",
    borderRadius: 3
  },
  kbd: {
    margin: "0 0.2em",
    paddingInline: "0.4em",
    paddingBlock: "0.15em 0.1em",
    fontSize: "90%",
    fontFamily: token.fontFamilyCode,
    background: "rgba(150, 150, 150, 0.06)",
    border: "1px solid rgba(100, 100, 100, 0.2)",
    borderBottomWidth: 2,
    borderRadius: 3
  },
  mark: {
    padding: 0,
    // FIXME hardcode in v4
    backgroundColor: gold[2]
  },
  "u, ins": {
    textDecoration: "underline",
    textDecorationSkipInk: "auto"
  },
  "s, del": {
    textDecoration: "line-through"
  },
  strong: {
    fontWeight: token.fontWeightStrong
  },
  // list
  "ul, ol": {
    marginInline: 0,
    marginBlock: "0 1em",
    padding: 0,
    li: {
      marginInline: "20px 0",
      marginBlock: 0,
      paddingInline: "4px 0",
      paddingBlock: 0
    }
  },
  ul: {
    listStyleType: "circle",
    ul: {
      listStyleType: "disc"
    }
  },
  ol: {
    listStyleType: "decimal"
  },
  // pre & block
  "pre, blockquote": {
    margin: "1em 0"
  },
  pre: {
    padding: "0.4em 0.6em",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    background: "rgba(150, 150, 150, 0.1)",
    border: "1px solid rgba(100, 100, 100, 0.2)",
    borderRadius: 3,
    fontFamily: token.fontFamilyCode,
    // Compatible for marked
    code: {
      display: "inline",
      margin: 0,
      padding: 0,
      fontSize: "inherit",
      fontFamily: "inherit",
      background: "transparent",
      border: 0
    }
  },
  blockquote: {
    paddingInline: "0.6em 0",
    paddingBlock: 0,
    borderInlineStart: "4px solid rgba(100, 100, 100, 0.2)",
    opacity: 0.85
  }
});
const getEditableStyles = (token) => {
  const {
    componentCls,
    paddingSM
  } = token;
  const inputShift = paddingSM;
  return {
    "&-edit-content": {
      position: "relative",
      "div&": {
        insetInlineStart: token.calc(token.paddingSM).mul(-1).equal(),
        marginTop: token.calc(inputShift).mul(-1).equal(),
        marginBottom: `calc(1em - ${unit(inputShift)})`
      },
      [`${componentCls}-edit-content-confirm`]: {
        position: "absolute",
        insetInlineEnd: token.calc(token.marginXS).add(2).equal(),
        insetBlockEnd: token.marginXS,
        color: token.colorIcon,
        // default style
        fontWeight: "normal",
        fontSize: token.fontSize,
        fontStyle: "normal",
        pointerEvents: "none"
      },
      textarea: {
        margin: "0!important",
        // Fix Editable Textarea flash in Firefox
        MozTransition: "none",
        height: "1em"
      }
    }
  };
};
const getCopyableStyles = (token) => ({
  [`${token.componentCls}-copy-success`]: {
    [`
    &,
    &:hover,
    &:focus`]: {
      color: token.colorSuccess
    }
  },
  [`${token.componentCls}-copy-icon-only`]: {
    marginInlineStart: 0
  }
});
const getEllipsisStyles = () => ({
  [`
  a&-ellipsis,
  span&-ellipsis
  `]: {
    display: "inline-block",
    maxWidth: "100%"
  },
  "&-ellipsis-single-line": {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    // https://blog.csdn.net/iefreer/article/details/50421025
    "a&, span&": {
      verticalAlign: "bottom"
    },
    "> code": {
      paddingBlock: 0,
      maxWidth: "calc(100% - 1.2em)",
      display: "inline-block",
      overflow: "hidden",
      textOverflow: "ellipsis",
      verticalAlign: "bottom",
      // https://github.com/ant-design/ant-design/issues/45953
      boxSizing: "content-box"
    }
  },
  "&-ellipsis-multiple-line": {
    display: "-webkit-box",
    overflow: "hidden",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical"
  }
});
const genTypographyStyle = (token) => {
  const {
    componentCls,
    titleMarginTop
  } = token;
  return {
    [componentCls]: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({
      color: token.colorText,
      wordBreak: "break-word",
      lineHeight: token.lineHeight,
      [`&${componentCls}-secondary`]: {
        color: token.colorTextDescription
      },
      [`&${componentCls}-success`]: {
        color: token.colorSuccessText
      },
      [`&${componentCls}-warning`]: {
        color: token.colorWarningText
      },
      [`&${componentCls}-danger`]: {
        color: token.colorErrorText,
        "a&:active, a&:focus": {
          color: token.colorErrorTextActive
        },
        "a&:hover": {
          color: token.colorErrorTextHover
        }
      },
      [`&${componentCls}-disabled`]: {
        color: token.colorTextDisabled,
        cursor: "not-allowed",
        userSelect: "none"
      },
      [`
        div&,
        p
      `]: {
        marginBottom: "1em"
      }
    }, getTitleStyles(token)), {
      [`
      & + h1${componentCls},
      & + h2${componentCls},
      & + h3${componentCls},
      & + h4${componentCls},
      & + h5${componentCls}
      `]: {
        marginTop: titleMarginTop
      },
      [`
      div,
      ul,
      li,
      p,
      h1,
      h2,
      h3,
      h4,
      h5`]: {
        [`
        + h1,
        + h2,
        + h3,
        + h4,
        + h5
        `]: {
          marginTop: titleMarginTop
        }
      }
    }), getResetStyles(token)), getLinkStyles(token)), {
      // Operation
      [`
        ${componentCls}-expand,
        ${componentCls}-collapse,
        ${componentCls}-edit,
        ${componentCls}-copy
      `]: Object.assign(Object.assign({}, operationUnit(token)), {
        marginInlineStart: token.marginXXS
      })
    }), getEditableStyles(token)), getCopyableStyles(token)), getEllipsisStyles()), {
      "&-rtl": {
        direction: "rtl"
      }
    })
  };
};
const prepareComponentToken = () => ({
  titleMarginTop: "1.2em",
  titleMarginBottom: "0.5em"
});
const useStyle = genStyleHooks("Typography", (token) => [genTypographyStyle(token)], prepareComponentToken);
const Editable = (props) => {
  const {
    prefixCls,
    "aria-label": ariaLabel,
    className,
    style,
    direction,
    maxLength,
    autoSize = true,
    value,
    onSave,
    onCancel,
    onEnd,
    component,
    enterIcon = /* @__PURE__ */ reactExports.createElement(RefIcon$w, null)
  } = props;
  const ref = reactExports.useRef(null);
  const inComposition = reactExports.useRef(false);
  const lastKeyCode = reactExports.useRef(null);
  const [current, setCurrent] = reactExports.useState(value);
  reactExports.useEffect(() => {
    setCurrent(value);
  }, [value]);
  reactExports.useEffect(() => {
    var _a;
    if ((_a = ref.current) === null || _a === void 0 ? void 0 : _a.resizableTextArea) {
      const {
        textArea
      } = ref.current.resizableTextArea;
      textArea.focus();
      const {
        length
      } = textArea.value;
      textArea.setSelectionRange(length, length);
    }
  }, []);
  const onChange = ({
    target
  }) => {
    setCurrent(target.value.replace(/[\n\r]/g, ""));
  };
  const onCompositionStart = () => {
    inComposition.current = true;
  };
  const onCompositionEnd = () => {
    inComposition.current = false;
  };
  const onKeyDown2 = ({
    keyCode
  }) => {
    if (inComposition.current) return;
    lastKeyCode.current = keyCode;
  };
  const confirmChange = () => {
    onSave(current.trim());
  };
  const onKeyUp = ({
    keyCode,
    ctrlKey,
    altKey,
    metaKey,
    shiftKey
  }) => {
    if (lastKeyCode.current !== keyCode || inComposition.current || ctrlKey || altKey || metaKey || shiftKey) {
      return;
    }
    if (keyCode === KeyCode.ENTER) {
      confirmChange();
      onEnd === null || onEnd === void 0 ? void 0 : onEnd();
    } else if (keyCode === KeyCode.ESC) {
      onCancel();
    }
  };
  const onBlur = () => {
    confirmChange();
  };
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);
  const textAreaClassName = classNames(prefixCls, `${prefixCls}-edit-content`, {
    [`${prefixCls}-rtl`]: direction === "rtl",
    [`${prefixCls}-${component}`]: !!component
  }, className, hashId, cssVarCls);
  return wrapCSSVar(/* @__PURE__ */ reactExports.createElement("div", {
    className: textAreaClassName,
    style
  }, /* @__PURE__ */ reactExports.createElement(TextArea, {
    ref,
    maxLength,
    value: current,
    onChange,
    onKeyDown: onKeyDown2,
    onKeyUp,
    onCompositionStart,
    onCompositionEnd,
    onBlur,
    "aria-label": ariaLabel,
    rows: 1,
    autoSize
  }), enterIcon !== null ? cloneElement(enterIcon, {
    className: `${prefixCls}-edit-content-confirm`
  }) : null));
};
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e2) {
        reject(e2);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e2) {
        reject(e2);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
const useCopyClick = ({
  copyConfig,
  children
}) => {
  const [copied, setCopied] = reactExports.useState(false);
  const [copyLoading, setCopyLoading] = reactExports.useState(false);
  const copyIdRef = reactExports.useRef(null);
  const cleanCopyId = () => {
    if (copyIdRef.current) {
      clearTimeout(copyIdRef.current);
    }
  };
  const copyOptions = {};
  if (copyConfig.format) {
    copyOptions.format = copyConfig.format;
  }
  reactExports.useEffect(() => cleanCopyId, []);
  const onClick = useEvent((e2) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    e2 === null || e2 === void 0 ? void 0 : e2.preventDefault();
    e2 === null || e2 === void 0 ? void 0 : e2.stopPropagation();
    setCopyLoading(true);
    try {
      const text = typeof copyConfig.text === "function" ? yield copyConfig.text() : copyConfig.text;
      copy(text || toList$1(children, true).join("") || "", copyOptions);
      setCopyLoading(false);
      setCopied(true);
      cleanCopyId();
      copyIdRef.current = setTimeout(() => {
        setCopied(false);
      }, 3e3);
      (_a = copyConfig.onCopy) === null || _a === void 0 ? void 0 : _a.call(copyConfig, e2);
    } catch (error) {
      setCopyLoading(false);
      throw error;
    }
  }));
  return {
    copied,
    copyLoading,
    onClick
  };
};
function useMergedConfig(propConfig, templateConfig) {
  return reactExports.useMemo(() => {
    const support = !!propConfig;
    return [support, Object.assign(Object.assign({}, templateConfig), support && typeof propConfig === "object" ? propConfig : null)];
  }, [propConfig]);
}
const usePrevious = (value) => {
  const ref = reactExports.useRef(void 0);
  reactExports.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};
const useTooltipProps = (tooltip, editConfigText, children) => reactExports.useMemo(() => {
  if (tooltip === true) {
    return {
      title: editConfigText !== null && editConfigText !== void 0 ? editConfigText : children
    };
  }
  if (/* @__PURE__ */ reactExports.isValidElement(tooltip)) {
    return {
      title: tooltip
    };
  }
  if (typeof tooltip === "object") {
    return Object.assign({
      title: editConfigText !== null && editConfigText !== void 0 ? editConfigText : children
    }, tooltip);
  }
  return {
    title: tooltip
  };
}, [tooltip, editConfigText, children]);
var __rest$4 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Typography$1 = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    component: Component = "article",
    className,
    rootClassName,
    setContentRef,
    children,
    direction: typographyDirection,
    style
  } = props, restProps = __rest$4(props, ["prefixCls", "component", "className", "rootClassName", "setContentRef", "children", "direction", "style"]);
  const {
    getPrefixCls,
    direction: contextDirection,
    className: contextClassName,
    style: contextStyle
  } = useComponentConfig("typography");
  const direction = typographyDirection !== null && typographyDirection !== void 0 ? typographyDirection : contextDirection;
  const mergedRef = setContentRef ? composeRef(ref, setContentRef) : ref;
  const prefixCls = getPrefixCls("typography", customizePrefixCls);
  const [wrapCSSVar, hashId, cssVarCls] = useStyle(prefixCls);
  const componentClassName = classNames(prefixCls, contextClassName, {
    [`${prefixCls}-rtl`]: direction === "rtl"
  }, className, rootClassName, hashId, cssVarCls);
  const mergedStyle = Object.assign(Object.assign({}, contextStyle), style);
  return wrapCSSVar(
    // @ts-expect-error: Expression produces a union type that is too complex to represent.
    /* @__PURE__ */ reactExports.createElement(Component, Object.assign({
      className: componentClassName,
      style: mergedStyle,
      ref: mergedRef
    }, restProps), children)
  );
});
function toList(val) {
  if (val === false) {
    return [false, false];
  }
  return Array.isArray(val) ? val : [val];
}
function getNode(dom, defaultNode, needDom) {
  if (dom === true || dom === void 0) {
    return defaultNode;
  }
  return dom || needDom && defaultNode;
}
function isEleEllipsis(ele) {
  const childDiv = document.createElement("em");
  ele.appendChild(childDiv);
  const rect = ele.getBoundingClientRect();
  const childRect = childDiv.getBoundingClientRect();
  ele.removeChild(childDiv);
  return (
    // Horizontal out of range
    rect.left > childRect.left || childRect.right > rect.right || // Vertical out of range
    rect.top > childRect.top || childRect.bottom > rect.bottom
  );
}
const isValidText = (val) => ["string", "number"].includes(typeof val);
const CopyBtn = ({
  prefixCls,
  copied,
  locale: locale2,
  iconOnly,
  tooltips,
  icon,
  tabIndex,
  onCopy,
  loading: btnLoading
}) => {
  const tooltipNodes = toList(tooltips);
  const iconNodes = toList(icon);
  const {
    copied: copiedText,
    copy: copyText
  } = locale2 !== null && locale2 !== void 0 ? locale2 : {};
  const systemStr = copied ? copiedText : copyText;
  const copyTitle = getNode(tooltipNodes[copied ? 1 : 0], systemStr);
  const ariaLabel = typeof copyTitle === "string" ? copyTitle : systemStr;
  return /* @__PURE__ */ reactExports.createElement(Tooltip, {
    title: copyTitle
  }, /* @__PURE__ */ reactExports.createElement("button", {
    type: "button",
    className: classNames(`${prefixCls}-copy`, {
      [`${prefixCls}-copy-success`]: copied,
      [`${prefixCls}-copy-icon-only`]: iconOnly
    }),
    onClick: onCopy,
    "aria-label": ariaLabel,
    tabIndex
  }, copied ? getNode(iconNodes[1], /* @__PURE__ */ reactExports.createElement(RefIcon$7, null), true) : getNode(iconNodes[0], btnLoading ? /* @__PURE__ */ reactExports.createElement(RefIcon, null) : /* @__PURE__ */ reactExports.createElement(RefIcon$x, null), true)));
};
const MeasureText = /* @__PURE__ */ reactExports.forwardRef(({
  style,
  children
}, ref) => {
  const spanRef = reactExports.useRef(null);
  reactExports.useImperativeHandle(ref, () => ({
    isExceed: () => {
      const span = spanRef.current;
      return span.scrollHeight > span.clientHeight;
    },
    getHeight: () => spanRef.current.clientHeight
  }));
  return /* @__PURE__ */ reactExports.createElement("span", {
    "aria-hidden": true,
    ref: spanRef,
    style: Object.assign({
      position: "fixed",
      display: "block",
      left: 0,
      top: 0,
      pointerEvents: "none",
      backgroundColor: "rgba(255, 0, 0, 0.65)"
    }, style)
  }, children);
});
const getNodesLen = (nodeList) => nodeList.reduce((totalLen, node) => totalLen + (isValidText(node) ? String(node).length : 1), 0);
function sliceNodes(nodeList, len) {
  let currLen = 0;
  const currentNodeList = [];
  for (let i = 0; i < nodeList.length; i += 1) {
    if (currLen === len) {
      return currentNodeList;
    }
    const node = nodeList[i];
    const canCut = isValidText(node);
    const nodeLen = canCut ? String(node).length : 1;
    const nextLen = currLen + nodeLen;
    if (nextLen > len) {
      const restLen = len - currLen;
      currentNodeList.push(String(node).slice(0, restLen));
      return currentNodeList;
    }
    currentNodeList.push(node);
    currLen = nextLen;
  }
  return nodeList;
}
const STATUS_MEASURE_NONE = 0;
const STATUS_MEASURE_PREPARE = 1;
const STATUS_MEASURE_START = 2;
const STATUS_MEASURE_NEED_ELLIPSIS = 3;
const STATUS_MEASURE_NO_NEED_ELLIPSIS = 4;
const lineClipStyle = {
  display: "-webkit-box",
  overflow: "hidden",
  WebkitBoxOrient: "vertical"
};
function EllipsisMeasure(props) {
  const {
    enableMeasure,
    width,
    text,
    children,
    rows,
    expanded,
    miscDeps,
    onEllipsis
  } = props;
  const nodeList = reactExports.useMemo(() => toArray$1(text), [text]);
  const nodeLen = reactExports.useMemo(() => getNodesLen(nodeList), [text]);
  const fullContent = reactExports.useMemo(() => children(nodeList, false), [text]);
  const [ellipsisCutIndex, setEllipsisCutIndex] = reactExports.useState(null);
  const cutMidRef = reactExports.useRef(null);
  const measureWhiteSpaceRef = reactExports.useRef(null);
  const needEllipsisRef = reactExports.useRef(null);
  const descRowsEllipsisRef = reactExports.useRef(null);
  const symbolRowEllipsisRef = reactExports.useRef(null);
  const [canEllipsis, setCanEllipsis] = reactExports.useState(false);
  const [needEllipsis, setNeedEllipsis] = reactExports.useState(STATUS_MEASURE_NONE);
  const [ellipsisHeight, setEllipsisHeight] = reactExports.useState(0);
  const [parentWhiteSpace, setParentWhiteSpace] = reactExports.useState(null);
  useLayoutEffect(() => {
    if (enableMeasure && width && nodeLen) {
      setNeedEllipsis(STATUS_MEASURE_PREPARE);
    } else {
      setNeedEllipsis(STATUS_MEASURE_NONE);
    }
  }, [width, text, rows, enableMeasure, nodeList]);
  useLayoutEffect(() => {
    var _a, _b, _c, _d;
    if (needEllipsis === STATUS_MEASURE_PREPARE) {
      setNeedEllipsis(STATUS_MEASURE_START);
      const nextWhiteSpace = measureWhiteSpaceRef.current && getComputedStyle(measureWhiteSpaceRef.current).whiteSpace;
      setParentWhiteSpace(nextWhiteSpace);
    } else if (needEllipsis === STATUS_MEASURE_START) {
      const isOverflow = !!((_a = needEllipsisRef.current) === null || _a === void 0 ? void 0 : _a.isExceed());
      setNeedEllipsis(isOverflow ? STATUS_MEASURE_NEED_ELLIPSIS : STATUS_MEASURE_NO_NEED_ELLIPSIS);
      setEllipsisCutIndex(isOverflow ? [0, nodeLen] : null);
      setCanEllipsis(isOverflow);
      const baseRowsEllipsisHeight = ((_b = needEllipsisRef.current) === null || _b === void 0 ? void 0 : _b.getHeight()) || 0;
      const descRowsEllipsisHeight = rows === 1 ? 0 : ((_c = descRowsEllipsisRef.current) === null || _c === void 0 ? void 0 : _c.getHeight()) || 0;
      const symbolRowEllipsisHeight = ((_d = symbolRowEllipsisRef.current) === null || _d === void 0 ? void 0 : _d.getHeight()) || 0;
      const maxRowsHeight = Math.max(
        baseRowsEllipsisHeight,
        // height of rows with ellipsis
        descRowsEllipsisHeight + symbolRowEllipsisHeight
      );
      setEllipsisHeight(maxRowsHeight + 1);
      onEllipsis(isOverflow);
    }
  }, [needEllipsis]);
  const cutMidIndex = ellipsisCutIndex ? Math.ceil((ellipsisCutIndex[0] + ellipsisCutIndex[1]) / 2) : 0;
  useLayoutEffect(() => {
    var _a;
    const [minIndex, maxIndex] = ellipsisCutIndex || [0, 0];
    if (minIndex !== maxIndex) {
      const midHeight = ((_a = cutMidRef.current) === null || _a === void 0 ? void 0 : _a.getHeight()) || 0;
      const isOverflow = midHeight > ellipsisHeight;
      let targetMidIndex = cutMidIndex;
      if (maxIndex - minIndex === 1) {
        targetMidIndex = isOverflow ? minIndex : maxIndex;
      }
      setEllipsisCutIndex(isOverflow ? [minIndex, targetMidIndex] : [targetMidIndex, maxIndex]);
    }
  }, [ellipsisCutIndex, cutMidIndex]);
  const finalContent = reactExports.useMemo(() => {
    if (!enableMeasure) {
      return children(nodeList, false);
    }
    if (needEllipsis !== STATUS_MEASURE_NEED_ELLIPSIS || !ellipsisCutIndex || ellipsisCutIndex[0] !== ellipsisCutIndex[1]) {
      const content = children(nodeList, false);
      if ([STATUS_MEASURE_NO_NEED_ELLIPSIS, STATUS_MEASURE_NONE].includes(needEllipsis)) {
        return content;
      }
      return /* @__PURE__ */ reactExports.createElement("span", {
        style: Object.assign(Object.assign({}, lineClipStyle), {
          WebkitLineClamp: rows
        })
      }, content);
    }
    return children(expanded ? nodeList : sliceNodes(nodeList, ellipsisCutIndex[0]), canEllipsis);
  }, [expanded, needEllipsis, ellipsisCutIndex, nodeList].concat(_toConsumableArray(miscDeps)));
  const measureStyle = {
    width,
    margin: 0,
    padding: 0,
    whiteSpace: parentWhiteSpace === "nowrap" ? "normal" : "inherit"
  };
  return /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, finalContent, needEllipsis === STATUS_MEASURE_START && /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, /* @__PURE__ */ reactExports.createElement(MeasureText, {
    style: Object.assign(Object.assign(Object.assign({}, measureStyle), lineClipStyle), {
      WebkitLineClamp: rows
    }),
    ref: needEllipsisRef
  }, fullContent), /* @__PURE__ */ reactExports.createElement(MeasureText, {
    style: Object.assign(Object.assign(Object.assign({}, measureStyle), lineClipStyle), {
      WebkitLineClamp: rows - 1
    }),
    ref: descRowsEllipsisRef
  }, fullContent), /* @__PURE__ */ reactExports.createElement(MeasureText, {
    style: Object.assign(Object.assign(Object.assign({}, measureStyle), lineClipStyle), {
      WebkitLineClamp: 1
    }),
    ref: symbolRowEllipsisRef
  }, children([], true))), needEllipsis === STATUS_MEASURE_NEED_ELLIPSIS && ellipsisCutIndex && ellipsisCutIndex[0] !== ellipsisCutIndex[1] && /* @__PURE__ */ reactExports.createElement(MeasureText, {
    style: Object.assign(Object.assign({}, measureStyle), {
      top: 400
    }),
    ref: cutMidRef
  }, children(sliceNodes(nodeList, cutMidIndex), true)), needEllipsis === STATUS_MEASURE_PREPARE && /* @__PURE__ */ reactExports.createElement("span", {
    style: {
      whiteSpace: "inherit"
    },
    ref: measureWhiteSpaceRef
  }));
}
const EllipsisTooltip = ({
  enableEllipsis,
  isEllipsis,
  children,
  tooltipProps
}) => {
  if (!(tooltipProps === null || tooltipProps === void 0 ? void 0 : tooltipProps.title) || !enableEllipsis) {
    return children;
  }
  return /* @__PURE__ */ reactExports.createElement(Tooltip, Object.assign({
    open: isEllipsis ? void 0 : false
  }, tooltipProps), children);
};
var __rest$3 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
function wrapperDecorations({
  mark,
  code,
  underline,
  delete: del,
  strong,
  keyboard,
  italic
}, content) {
  let currentContent = content;
  function wrap(tag, needed) {
    if (!needed) {
      return;
    }
    currentContent = /* @__PURE__ */ reactExports.createElement(tag, {}, currentContent);
  }
  wrap("strong", strong);
  wrap("u", underline);
  wrap("del", del);
  wrap("code", code);
  wrap("mark", mark);
  wrap("kbd", keyboard);
  wrap("i", italic);
  return currentContent;
}
const ELLIPSIS_STR = "...";
const DECORATION_PROPS = ["delete", "mark", "code", "underline", "strong", "keyboard", "italic"];
const Base = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  var _a;
  const {
    prefixCls: customizePrefixCls,
    className,
    style,
    type,
    disabled,
    children,
    ellipsis,
    editable,
    copyable,
    component,
    title
  } = props, restProps = __rest$3(props, ["prefixCls", "className", "style", "type", "disabled", "children", "ellipsis", "editable", "copyable", "component", "title"]);
  const {
    getPrefixCls,
    direction
  } = reactExports.useContext(ConfigContext);
  const [textLocale] = useLocale("Text");
  const typographyRef = reactExports.useRef(null);
  const editIconRef = reactExports.useRef(null);
  const prefixCls = getPrefixCls("typography", customizePrefixCls);
  const textProps = omit(restProps, DECORATION_PROPS);
  const [enableEdit, editConfig] = useMergedConfig(editable);
  const [editing, setEditing] = useMergedState(false, {
    value: editConfig.editing
  });
  const {
    triggerType = ["icon"]
  } = editConfig;
  const triggerEdit = (edit) => {
    var _a2;
    if (edit) {
      (_a2 = editConfig.onStart) === null || _a2 === void 0 ? void 0 : _a2.call(editConfig);
    }
    setEditing(edit);
  };
  const prevEditing = usePrevious(editing);
  useLayoutEffect(() => {
    var _a2;
    if (!editing && prevEditing) {
      (_a2 = editIconRef.current) === null || _a2 === void 0 ? void 0 : _a2.focus();
    }
  }, [editing]);
  const onEditClick = (e2) => {
    e2 === null || e2 === void 0 ? void 0 : e2.preventDefault();
    triggerEdit(true);
  };
  const onEditChange = (value) => {
    var _a2;
    (_a2 = editConfig.onChange) === null || _a2 === void 0 ? void 0 : _a2.call(editConfig, value);
    triggerEdit(false);
  };
  const onEditCancel = () => {
    var _a2;
    (_a2 = editConfig.onCancel) === null || _a2 === void 0 ? void 0 : _a2.call(editConfig);
    triggerEdit(false);
  };
  const [enableCopy, copyConfig] = useMergedConfig(copyable);
  const {
    copied,
    copyLoading,
    onClick: onCopyClick
  } = useCopyClick({
    copyConfig,
    children
  });
  const [isLineClampSupport, setIsLineClampSupport] = reactExports.useState(false);
  const [isTextOverflowSupport, setIsTextOverflowSupport] = reactExports.useState(false);
  const [isJsEllipsis, setIsJsEllipsis] = reactExports.useState(false);
  const [isNativeEllipsis, setIsNativeEllipsis] = reactExports.useState(false);
  const [isNativeVisible, setIsNativeVisible] = reactExports.useState(true);
  const [enableEllipsis, ellipsisConfig] = useMergedConfig(ellipsis, {
    expandable: false,
    symbol: (isExpanded) => isExpanded ? textLocale === null || textLocale === void 0 ? void 0 : textLocale.collapse : textLocale === null || textLocale === void 0 ? void 0 : textLocale.expand
  });
  const [expanded, setExpanded] = useMergedState(ellipsisConfig.defaultExpanded || false, {
    value: ellipsisConfig.expanded
  });
  const mergedEnableEllipsis = enableEllipsis && (!expanded || ellipsisConfig.expandable === "collapsible");
  const {
    rows = 1
  } = ellipsisConfig;
  const needMeasureEllipsis = reactExports.useMemo(() => (
    // Disable ellipsis
    mergedEnableEllipsis && // Provide suffix
    (ellipsisConfig.suffix !== void 0 || ellipsisConfig.onEllipsis || // Can't use css ellipsis since we need to provide the place for button
    ellipsisConfig.expandable || enableEdit || enableCopy)
  ), [mergedEnableEllipsis, ellipsisConfig, enableEdit, enableCopy]);
  useLayoutEffect(() => {
    if (enableEllipsis && !needMeasureEllipsis) {
      setIsLineClampSupport(isStyleSupport("webkitLineClamp"));
      setIsTextOverflowSupport(isStyleSupport("textOverflow"));
    }
  }, [needMeasureEllipsis, enableEllipsis]);
  const [cssEllipsis, setCssEllipsis] = reactExports.useState(mergedEnableEllipsis);
  const canUseCssEllipsis = reactExports.useMemo(() => {
    if (needMeasureEllipsis) {
      return false;
    }
    if (rows === 1) {
      return isTextOverflowSupport;
    }
    return isLineClampSupport;
  }, [needMeasureEllipsis, isTextOverflowSupport, isLineClampSupport]);
  useLayoutEffect(() => {
    setCssEllipsis(canUseCssEllipsis && mergedEnableEllipsis);
  }, [canUseCssEllipsis, mergedEnableEllipsis]);
  const isMergedEllipsis = mergedEnableEllipsis && (cssEllipsis ? isNativeEllipsis : isJsEllipsis);
  const cssTextOverflow = mergedEnableEllipsis && rows === 1 && cssEllipsis;
  const cssLineClamp = mergedEnableEllipsis && rows > 1 && cssEllipsis;
  const onExpandClick = (e2, info) => {
    var _a2;
    setExpanded(info.expanded);
    (_a2 = ellipsisConfig.onExpand) === null || _a2 === void 0 ? void 0 : _a2.call(ellipsisConfig, e2, info);
  };
  const [ellipsisWidth, setEllipsisWidth] = reactExports.useState(0);
  const onResize = ({
    offsetWidth
  }) => {
    setEllipsisWidth(offsetWidth);
  };
  const onJsEllipsis = (jsEllipsis) => {
    var _a2;
    setIsJsEllipsis(jsEllipsis);
    if (isJsEllipsis !== jsEllipsis) {
      (_a2 = ellipsisConfig.onEllipsis) === null || _a2 === void 0 ? void 0 : _a2.call(ellipsisConfig, jsEllipsis);
    }
  };
  reactExports.useEffect(() => {
    const textEle = typographyRef.current;
    if (enableEllipsis && cssEllipsis && textEle) {
      const currentEllipsis = isEleEllipsis(textEle);
      if (isNativeEllipsis !== currentEllipsis) {
        setIsNativeEllipsis(currentEllipsis);
      }
    }
  }, [enableEllipsis, cssEllipsis, children, cssLineClamp, isNativeVisible, ellipsisWidth]);
  reactExports.useEffect(() => {
    const textEle = typographyRef.current;
    if (typeof IntersectionObserver === "undefined" || !textEle || !cssEllipsis || !mergedEnableEllipsis) {
      return;
    }
    const observer = new IntersectionObserver(() => {
      setIsNativeVisible(!!textEle.offsetParent);
    });
    observer.observe(textEle);
    return () => {
      observer.disconnect();
    };
  }, [cssEllipsis, mergedEnableEllipsis]);
  const tooltipProps = useTooltipProps(ellipsisConfig.tooltip, editConfig.text, children);
  const topAriaLabel = reactExports.useMemo(() => {
    if (!enableEllipsis || cssEllipsis) {
      return void 0;
    }
    return [editConfig.text, children, title, tooltipProps.title].find(isValidText);
  }, [enableEllipsis, cssEllipsis, title, tooltipProps.title, isMergedEllipsis]);
  if (editing) {
    return /* @__PURE__ */ reactExports.createElement(Editable, {
      value: (_a = editConfig.text) !== null && _a !== void 0 ? _a : typeof children === "string" ? children : "",
      onSave: onEditChange,
      onCancel: onEditCancel,
      onEnd: editConfig.onEnd,
      prefixCls,
      className,
      style,
      direction,
      component,
      maxLength: editConfig.maxLength,
      autoSize: editConfig.autoSize,
      enterIcon: editConfig.enterIcon
    });
  }
  const renderExpand = () => {
    const {
      expandable,
      symbol
    } = ellipsisConfig;
    return expandable ? /* @__PURE__ */ reactExports.createElement("button", {
      type: "button",
      key: "expand",
      className: `${prefixCls}-${expanded ? "collapse" : "expand"}`,
      onClick: (e2) => onExpandClick(e2, {
        expanded: !expanded
      }),
      "aria-label": expanded ? textLocale.collapse : textLocale === null || textLocale === void 0 ? void 0 : textLocale.expand
    }, typeof symbol === "function" ? symbol(expanded) : symbol) : null;
  };
  const renderEdit = () => {
    if (!enableEdit) {
      return;
    }
    const {
      icon,
      tooltip,
      tabIndex
    } = editConfig;
    const editTitle = toArray$1(tooltip)[0] || (textLocale === null || textLocale === void 0 ? void 0 : textLocale.edit);
    const ariaLabel = typeof editTitle === "string" ? editTitle : "";
    return triggerType.includes("icon") ? /* @__PURE__ */ reactExports.createElement(Tooltip, {
      key: "edit",
      title: tooltip === false ? "" : editTitle
    }, /* @__PURE__ */ reactExports.createElement("button", {
      type: "button",
      ref: editIconRef,
      className: `${prefixCls}-edit`,
      onClick: onEditClick,
      "aria-label": ariaLabel,
      tabIndex
    }, icon || /* @__PURE__ */ reactExports.createElement(RefIcon$y, {
      role: "button"
    }))) : null;
  };
  const renderCopy = () => {
    if (!enableCopy) {
      return null;
    }
    return /* @__PURE__ */ reactExports.createElement(CopyBtn, Object.assign({
      key: "copy"
    }, copyConfig, {
      prefixCls,
      copied,
      locale: textLocale,
      onCopy: onCopyClick,
      loading: copyLoading,
      iconOnly: children === null || children === void 0
    }));
  };
  const renderOperations = (canEllipsis) => [canEllipsis && renderExpand(), renderEdit(), renderCopy()];
  const renderEllipsis = (canEllipsis) => [canEllipsis && !expanded && /* @__PURE__ */ reactExports.createElement("span", {
    "aria-hidden": true,
    key: "ellipsis"
  }, ELLIPSIS_STR), ellipsisConfig.suffix, renderOperations(canEllipsis)];
  return /* @__PURE__ */ reactExports.createElement(RefResizeObserver, {
    onResize,
    disabled: !mergedEnableEllipsis
  }, (resizeRef) => /* @__PURE__ */ reactExports.createElement(EllipsisTooltip, {
    tooltipProps,
    enableEllipsis: mergedEnableEllipsis,
    isEllipsis: isMergedEllipsis
  }, /* @__PURE__ */ reactExports.createElement(Typography$1, Object.assign({
    className: classNames({
      [`${prefixCls}-${type}`]: type,
      [`${prefixCls}-disabled`]: disabled,
      [`${prefixCls}-ellipsis`]: enableEllipsis,
      [`${prefixCls}-ellipsis-single-line`]: cssTextOverflow,
      [`${prefixCls}-ellipsis-multiple-line`]: cssLineClamp
    }, className),
    prefixCls: customizePrefixCls,
    style: Object.assign(Object.assign({}, style), {
      WebkitLineClamp: cssLineClamp ? rows : void 0
    }),
    component,
    ref: composeRef(resizeRef, typographyRef, ref),
    direction,
    onClick: triggerType.includes("text") ? onEditClick : void 0,
    "aria-label": topAriaLabel === null || topAriaLabel === void 0 ? void 0 : topAriaLabel.toString(),
    title
  }, textProps), /* @__PURE__ */ reactExports.createElement(EllipsisMeasure, {
    enableMeasure: mergedEnableEllipsis && !cssEllipsis,
    text: children,
    rows,
    width: ellipsisWidth,
    onEllipsis: onJsEllipsis,
    expanded,
    miscDeps: [copied, expanded, copyLoading, enableEdit, enableCopy, textLocale].concat(_toConsumableArray(DECORATION_PROPS.map((key) => props[key])))
  }, (node, canEllipsis) => wrapperDecorations(props, /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, node.length > 0 && canEllipsis && !expanded && topAriaLabel ? /* @__PURE__ */ reactExports.createElement("span", {
    key: "show-content",
    "aria-hidden": true
  }, node) : node, renderEllipsis(canEllipsis)))))));
});
var __rest$2 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Link = /* @__PURE__ */ reactExports.forwardRef((_a, ref) => {
  var {
    ellipsis,
    rel
  } = _a, restProps = __rest$2(_a, ["ellipsis", "rel"]);
  const mergedProps = Object.assign(Object.assign({}, restProps), {
    rel: rel === void 0 && restProps.target === "_blank" ? "noopener noreferrer" : rel
  });
  delete mergedProps.navigate;
  return /* @__PURE__ */ reactExports.createElement(Base, Object.assign({}, mergedProps, {
    ref,
    ellipsis: !!ellipsis,
    component: "a"
  }));
});
const Paragraph = /* @__PURE__ */ reactExports.forwardRef((props, ref) => /* @__PURE__ */ reactExports.createElement(Base, Object.assign({
  ref
}, props, {
  component: "div"
})));
var __rest$1 = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const Text = (_a, ref) => {
  var {
    ellipsis
  } = _a, restProps = __rest$1(_a, ["ellipsis"]);
  const mergedEllipsis = reactExports.useMemo(() => {
    if (ellipsis && typeof ellipsis === "object") {
      return omit(ellipsis, ["expandable", "rows"]);
    }
    return ellipsis;
  }, [ellipsis]);
  return /* @__PURE__ */ reactExports.createElement(Base, Object.assign({
    ref
  }, restProps, {
    ellipsis: mergedEllipsis,
    component: "span"
  }));
};
const Text$1 = /* @__PURE__ */ reactExports.forwardRef(Text);
var __rest = function(s, e2) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e2.indexOf(p) < 0) t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
    if (e2.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
  }
  return t;
};
const TITLE_ELE_LIST = [1, 2, 3, 4, 5];
const Title = /* @__PURE__ */ reactExports.forwardRef((props, ref) => {
  const {
    level = 1
  } = props, restProps = __rest(props, ["level"]);
  const component = TITLE_ELE_LIST.includes(level) ? `h${level}` : `h1`;
  return /* @__PURE__ */ reactExports.createElement(Base, Object.assign({
    ref
  }, restProps, {
    component
  }));
});
const Typography = Typography$1;
Typography.Text = Text$1;
Typography.Link = Link;
Typography.Title = Title;
Typography.Paragraph = Paragraph;
export {
  Button$1 as B,
  Card as C,
  DatePicker as D,
  ForwardTable as F,
  Input as I,
  Modal as M,
  Row as R,
  Statistic as S,
  Tag as T,
  Col as a,
  Select as b,
  Space as c,
  Typography as d,
  Form as e,
  Tabs as f,
  TypedInputNumber as g,
  Checkbox as h,
  Divider as i,
  Collapse$1 as j,
  Tooltip as k,
  staticMethods as s
};
//# sourceMappingURL=antd-core-Bn6Stp_u.js.map
