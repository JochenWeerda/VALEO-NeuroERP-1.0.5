import { sentryUtils } from '../config/sentry';

interface ApiErrorContext {
url: string;
  method: string;
  statusCode?: number;
  responseData?: unknown;
  requestData?: unknown;
  headers?: Record<string, string>;

}

/**
 * Utility-Funktionen für API-Fehler-Tracking mit Sentry
 */
export const apiErrorTracking = {
  /**
   * Trackt einen API-Fehler mit Sentry
   */
  trackApiError: (error: Error, context: ApiErrorContext) => {
    sentryUtils.captureError(error, {
      tags: {
        component: 'api',
        method: context.method,
        statusCode: context.statusCode?.toString() || 'unknown',
        endpoint: context.url,
      },
      extra: {
        url: context.url,
        method: context.method,
        statusCode: context.statusCode,
        responseData: context.responseData,
        requestData: context.requestData,
        headers: context.headers,
      },
      level: 'error'
    });

    // Breadcrumb für API-Aufruf
    sentryUtils.addBreadcrumb(
      `API ${context.method} ${context.url} failed`,
      'http',
      'error'
    );
  },

  /**
   * Trackt einen erfolgreichen API-Aufruf als Breadcrumb
   */
  trackApiSuccess: (context: Pick<ApiErrorContext, 'url' | 'method' | 'statusCode'>) => {
    sentryUtils.addBreadcrumb(
      `API ${context.method} ${context.url} - ${context.statusCode}`,
      'http',
      'info'
    );
  },

  /**
   * Trackt API-Performance
   */
  trackApiPerformance: (url: string, method: string, duration: number) => {
    sentryUtils.addBreadcrumb(
      `API ${method} ${url} completed in ${duration}ms`,
      'http',
      duration > 5000 ? 'warning' : 'info'
    );
    
    // Performance-Messung als Breadcrumb
    if (duration > 5000) {
      sentryUtils.captureError(new Error(`Slow API request: ${method} ${url}`), {
        tags: { method, url, slowRequest: 'true' },
        extra: { duration },
        level: 'warning'
      });
    }
  },
};

/**
 * Axios Interceptor für automatisches Error-Tracking
 */
export const setupAxiosSentryInterceptor = () => {
  // Request Interceptor
  axiosInstance.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: Date.now() };
      return config;
    },
    (error) => {
      apiErrorTracking.trackApiError(error, {
        url: 'unknown',
        method: 'unknown'
      });
      return Promise.reject(error);
    }
  );

  // Response Interceptor
  axiosInstance.interceptors.response.use(
    (response) => {
      const duration = Date.now() - response.config.metadata?.startTime;
      apiErrorTracking.trackApiPerformance(
        response.config.url,
        response.config.method,
        duration
      );
      apiErrorTracking.trackApiSuccess({
        url: response.config.url,
        method: response.config.method,
        statusCode: response.status
      });
      return response;
    },
    (error) => {
      const duration = Date.now() - (error.config?.metadata?.startTime || Date.now());
      
      apiErrorTracking.trackApiError(error, {
        url: error.config?.url || 'unknown',
        method: error.config?.method || 'unknown',
        statusCode: error.response?.status,
        responseData: error.response?.data,
        requestData: error.config?.data,
        headers: error.config?.headers
      });

      apiErrorTracking.trackApiPerformance(
        error.config?.url || 'unknown',
        error.config?.method || 'unknown',
        duration
      );

      return Promise.reject(error);
    }
  );
};

export default apiErrorTracking;
