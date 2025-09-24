import { useCallback } from 'react';
import { sentryUtils } from '../config/sentry';

/**
 * Hook für einfache Sentry-Nutzung in React-Komponenten
 */
export const useSentry = (_...args[]) => {
  const captureError = useCallback((error: Error, context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    level?: 'error' | 'warning' | 'info' | 'debug';
    component?: string;
  }) => {
    sentryUtils.captureError(error, {
      tags: {
        ...context?.tags,
        component: context?.component || 'unknown',
      },
      extra: context?.extra,
      level: context?.level || 'error'
    });
  }, []);

  const addBreadcrumb = useCallback((message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') => {
    sentryUtils.addBreadcrumb(message, category, level);
  }, []);

  const setUser = useCallback((user: { id?: string; email?: string; username?: string }) => {
    sentryUtils.setUser(user);
  }, []);

  const setTag = useCallback((key: string, value: string) => {
    sentryUtils.setTag(key, value);
  }, []);

  const setContext = useCallback((key: string, context: Record<string, _unknown>) => {
    sentryUtils.setContext(key, context);
  }, []);

  const startTransaction = useCallback((name: string, op: string) => {
    return sentryUtils.startTransaction(name, op);
  }, []);

  return {
    captureError,
    addBreadcrumb,
    setUser,
    setTag,
    setContext,
    startTransaction,
  };
};

export default useSentry;
