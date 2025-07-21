// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock für window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock für ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock für IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock für getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

// Mock für localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock für sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock für console.error um React-Warnungen zu unterdrücken
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Mock für fetch
global.fetch = jest.fn();

// Mock für URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mocked-url');

// Mock für URL.revokeObjectURL
global.URL.revokeObjectURL = jest.fn();

// Mock für window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: jest.fn(),
  writable: true,
});

// Mock für window.alert
Object.defineProperty(window, 'alert', {
  value: jest.fn(),
  writable: true,
});

// Mock für window.confirm
Object.defineProperty(window, 'confirm', {
  value: jest.fn(() => true),
  writable: true,
});

// Mock für window.prompt
Object.defineProperty(window, 'prompt', {
  value: jest.fn(),
  writable: true,
});

// Mock für window.open
Object.defineProperty(window, 'open', {
  value: jest.fn(),
  writable: true,
});

// Mock für window.print
Object.defineProperty(window, 'print', {
  value: jest.fn(),
  writable: true,
});

// Mock für window.requestAnimationFrame
Object.defineProperty(window, 'requestAnimationFrame', {
  value: jest.fn((callback) => setTimeout(callback, 0)),
  writable: true,
});

// Mock für window.cancelAnimationFrame
Object.defineProperty(window, 'cancelAnimationFrame', {
  value: jest.fn(),
  writable: true,
});

// Mock für window.getSelection
Object.defineProperty(window, 'getSelection', {
  value: jest.fn(() => ({
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
  })),
  writable: true,
});

// Mock für document.createRange
Object.defineProperty(document, 'createRange', {
  value: jest.fn(() => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    commonAncestorContainer: {
      nodeName: 'BODY',
      ownerDocument: document,
    },
  })),
  writable: true,
});

// Mock für document.execCommand
Object.defineProperty(document, 'execCommand', {
  value: jest.fn(() => true),
  writable: true,
});

// Mock für navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
  writable: true,
});

// Mock für navigator.geolocation
Object.defineProperty(navigator, 'geolocation', {
  value: {
    getCurrentPosition: jest.fn(),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  },
  writable: true,
});

// Mock für navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn(),
    enumerateDevices: jest.fn(),
  },
  writable: true,
});

// Mock für Performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
  },
  writable: true,
});

// Mock für WebSocket
const WebSocketMock = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  send: jest.fn(),
  close: jest.fn(),
  readyState: 1,
})) as any;
WebSocketMock.CONNECTING = 0;
WebSocketMock.OPEN = 1;
WebSocketMock.CLOSING = 2;
WebSocketMock.CLOSED = 3;
global.WebSocket = WebSocketMock;

// Mock für EventSource
const EventSourceMock = jest.fn().mockImplementation(() => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  close: jest.fn(),
  readyState: 1,
})) as any;
EventSourceMock.CONNECTING = 0;
EventSourceMock.OPEN = 1;
EventSourceMock.CLOSED = 2;
global.EventSource = EventSourceMock;

// Mock für AbortController
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    aborted: false,
  },
  abort: jest.fn(),
}));

// Mock für TextEncoder/TextDecoder
global.TextEncoder = jest.fn().mockImplementation(() => ({
  encode: jest.fn(() => new Uint8Array()),
}));

global.TextDecoder = jest.fn().mockImplementation(() => ({
  decode: jest.fn(() => ''),
}));

// Mock für crypto.subtle
Object.defineProperty(window, 'crypto', {
  value: {
    subtle: {
      generateKey: jest.fn(),
      encrypt: jest.fn(),
      decrypt: jest.fn(),
      sign: jest.fn(),
      verify: jest.fn(),
      digest: jest.fn(),
      importKey: jest.fn(),
      exportKey: jest.fn(),
    },
    getRandomValues: jest.fn(() => new Uint8Array(16)),
  },
  writable: true,
});

// Mock für MutationObserver
global.MutationObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  takeRecords: jest.fn(() => []),
}));

// Mock für requestIdleCallback
Object.defineProperty(window, 'requestIdleCallback', {
  value: jest.fn((callback) => setTimeout(callback, 0)),
  writable: true,
});

// Mock für cancelIdleCallback
Object.defineProperty(window, 'cancelIdleCallback', {
  value: jest.fn(),
  writable: true,
});

// Mock für queueMicrotask
Object.defineProperty(window, 'queueMicrotask', {
  value: jest.fn((callback) => Promise.resolve().then(callback)),
  writable: true,
});

// Mock für structuredClone
Object.defineProperty(window, 'structuredClone', {
  value: jest.fn((obj) => JSON.parse(JSON.stringify(obj))),
  writable: true,
});

// Mock für reportError
Object.defineProperty(window, 'reportError', {
  value: jest.fn(),
  writable: true,
});

// Mock für queueMicrotask
Object.defineProperty(global, 'queueMicrotask', {
  value: jest.fn((callback) => Promise.resolve().then(callback)),
  writable: true,
});

// Mock für setImmediate
const setImmediateMock = jest.fn((callback) => setTimeout(callback, 0)) as any;
setImmediateMock.__promisify__ = jest.fn();
global.setImmediate = setImmediateMock;

// Mock für clearImmediate
global.clearImmediate = jest.fn();

// Mock für process.nextTick
if (typeof process !== 'undefined') {
  process.nextTick = jest.fn((callback) => setTimeout(callback, 0));
}

// Mock für console methods
const originalConsole = { ...console };
beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
  console.info = jest.fn();
  console.debug = jest.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
}); 