import React, { ReactNode } from 'react';
import { Box, Alert, Button } from '@mui/material';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useAuthStore } from '../../store/authStore';

interface PermissionWrapperProps {
  children: ReactNode;
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: ReactNode;
  showError?: boolean;
}

export const PermissionWrapper: React.FC<PermissionWrapperProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  showError = true,
}) => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();

  // Kombiniere einzelne permission mit permissions Array
  const allPermissions = permission ? [permission, ...permissions] : permissions;

  // Prüfe Berechtigungen
  let hasAccess = false;
  
  if (allPermissions.length === 0) {
    // Keine spezifischen Berechtigungen erforderlich
    hasAccess = !!user;
  } else if (requireAll) {
    // Alle Berechtigungen erforderlich
    hasAccess = hasAllPermissions(allPermissions);
  } else {
    // Mindestens eine Berechtigung erforderlich
    hasAccess = hasAnyPermission(allPermissions);
  }

  // Wenn Zugriff gewährt, zeige children
  if (hasAccess) {
    return <>{children}</>;
  }

  // Wenn kein Zugriff und fallback definiert
  if (fallback) {
    return <>{fallback}</>;
  }

  // Wenn kein Zugriff und showError true
  if (showError) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert 
          severity="warning" 
          icon={<LockIcon />}
          sx={{ maxWidth: 600, mx: 'auto' }}
        >
          Sie haben keine Berechtigung für diese Funktion.
          {allPermissions.length > 0 && (
            <Box sx={{ mt: 1, fontSize: '0.875rem' }}>
              Erforderliche Berechtigung(en): {allPermissions.join(', ')}
            </Box>
          )}
        </Alert>
      </Box>
    );
  }

  // Standardmäßig nichts anzeigen
  return null;
};

// Hilfs-Komponente für bedingte Anzeige
export const Can: React.FC<{
  permission: string;
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ permission, children, fallback }) => {
  const { hasPermission } = useAuthStore();
  
  if (hasPermission(permission)) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
};

// Hilfs-Komponente für rollenbasierte Anzeige
export const RoleWrapper: React.FC<{
  roles: string[];
  children: ReactNode;
  fallback?: ReactNode;
}> = ({ roles, children, fallback }) => {
  const { user } = useAuthStore();
  
  const userRoles = user?.roles || [];
  const hasRole = roles.some(role => userRoles.includes(role));
  
  if (hasRole) {
    return <>{children}</>;
  }
  
  return <>{fallback || null}</>;
};

// Hook für Berechtigungsprüfungen
export const usePermissions = () => {
  const { user, hasPermission, hasAnyPermission, hasAllPermissions } = useAuthStore();
  
  return {
    user,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can: (permission: string) => hasPermission(permission),
    canAny: (permissions: string[]) => hasAnyPermission(permissions),
    canAll: (permissions: string[]) => hasAllPermissions(permissions),
    isAdmin: () => user?.roles?.includes('admin') || false,
    isSuperAdmin: () => user?.roles?.includes('super_admin') || false,
  };
};

// Berechtigungs-Konstanten
export const PERMISSIONS = {
  // Artikel
  ARTICLE_VIEW: 'article.view',
  ARTICLE_CREATE: 'article.create',
  ARTICLE_UPDATE: 'article.update',
  ARTICLE_DELETE: 'article.delete',
  ARTICLE_EXPORT: 'article.export',
  ARTICLE_IMPORT: 'article.import',
  
  // Kunden
  CUSTOMER_VIEW: 'customer.view',
  CUSTOMER_CREATE: 'customer.create',
  CUSTOMER_UPDATE: 'customer.update',
  CUSTOMER_DELETE: 'customer.delete',
  CUSTOMER_EXPORT: 'customer.export',
  
  // Rechnungen
  INVOICE_VIEW: 'invoice.view',
  INVOICE_CREATE: 'invoice.create',
  INVOICE_UPDATE: 'invoice.update',
  INVOICE_DELETE: 'invoice.delete',
  INVOICE_APPROVE: 'invoice.approve',
  INVOICE_CANCEL: 'invoice.cancel',
  
  // Bestellungen
  ORDER_VIEW: 'order.view',
  ORDER_CREATE: 'order.create',
  ORDER_UPDATE: 'order.update',
  ORDER_DELETE: 'order.delete',
  ORDER_APPROVE: 'order.approve',
  
  // Lager
  STOCK_VIEW: 'stock.view',
  STOCK_UPDATE: 'stock.update',
  STOCK_INVENTORY: 'stock.inventory',
  STOCK_MOVEMENT: 'stock.movement',
  
  // Berichte
  REPORT_VIEW: 'report.view',
  REPORT_EXPORT: 'report.export',
  REPORT_FINANCIAL: 'report.financial',
  
  // System
  SYSTEM_SETTINGS: 'system.settings',
  USER_MANAGE: 'user.manage',
  ROLE_MANAGE: 'role.manage',
  BACKUP_MANAGE: 'backup.manage',
  
  // Monitoring
  MONITORING_VIEW: 'monitoring.view',
  LOG_VIEW: 'log.view',
} as const;

// Rollen-Konstanten
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  WAREHOUSE: 'warehouse',
  SALES: 'sales',
  VIEWER: 'viewer',
} as const;

// Standard-Berechtigungen pro Rolle
export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS), // Alle Berechtigungen
  
  [ROLES.ADMIN]: [
    ...Object.values(PERMISSIONS).filter(p => !p.includes('system.')),
    PERMISSIONS.USER_MANAGE,
  ],
  
  [ROLES.MANAGER]: [
    PERMISSIONS.ARTICLE_VIEW,
    PERMISSIONS.ARTICLE_CREATE,
    PERMISSIONS.ARTICLE_UPDATE,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.INVOICE_APPROVE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_UPDATE,
    PERMISSIONS.ORDER_APPROVE,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
  ],
  
  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.INVOICE_UPDATE,
    PERMISSIONS.REPORT_VIEW,
    PERMISSIONS.REPORT_EXPORT,
    PERMISSIONS.REPORT_FINANCIAL,
  ],
  
  [ROLES.WAREHOUSE]: [
    PERMISSIONS.ARTICLE_VIEW,
    PERMISSIONS.ARTICLE_UPDATE,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.STOCK_UPDATE,
    PERMISSIONS.STOCK_INVENTORY,
    PERMISSIONS.STOCK_MOVEMENT,
  ],
  
  [ROLES.SALES]: [
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.CUSTOMER_CREATE,
    PERMISSIONS.CUSTOMER_UPDATE,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.INVOICE_CREATE,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.ORDER_CREATE,
  ],
  
  [ROLES.VIEWER]: [
    PERMISSIONS.ARTICLE_VIEW,
    PERMISSIONS.CUSTOMER_VIEW,
    PERMISSIONS.INVOICE_VIEW,
    PERMISSIONS.ORDER_VIEW,
    PERMISSIONS.STOCK_VIEW,
    PERMISSIONS.REPORT_VIEW,
  ],
} as const;