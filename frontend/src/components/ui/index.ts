// =====================================================
// UI COMPONENTS INDEX
// =====================================================

// Standardisierungskomponenten
export {
  UI_LABELS,
  StatusChip,
  PriorityChip,
  StandardMessage,
  InfoTooltip,
  HelpButton,
  useUIStandardization
} from './UIStandardization';

// Formular-Standardisierungskomponenten
export {
  StandardTextField,
  StandardSelectField,
  StandardButton,
  FormActions,
  FormMessage,
  useFormValidation,
  FORM_LABELS
} from '../forms/FormStandardization';

// Weitere UI-Komponenten können hier hinzugefügt werden
export { DataCard } from '../DataCard';
export { StatusCard } from '../StatusCard';
export { ModuleCard } from '../ModuleCard';
export { Table } from '../Table';
export { Input } from '../Input';
export { Button } from '../Button';
export { Modal } from '../Modal';
export { ErrorBoundary } from '../ErrorBoundary';
export { default as OfflineStatusBar } from '../OfflineStatusBar';
export { NotificationDropdown } from '../NotificationDropdown';
export { TrustIndicator } from '../TrustIndicator';
export { AgentSuggestion } from '../AgentSuggestion';
export { AgentProcessingOverlay } from '../AgentProcessingOverlay';

// Layout-Komponenten
export { default as Layout } from '../Layout';
export { Navigation } from '../Navigation';
export { Sidebar } from '../Sidebar';
export { TrustAwareLayout } from '../TrustAwareLayout';

// Router-Komponenten
export { PreloadRouter } from '../PreloadRouter';
export { AppRouter } from '../Router';

// Utility-Komponenten
export { default as BundleAnalysis } from '../BundleAnalysis';
export { PreloadOptimizer } from '../PreloadOptimizer';
export { Last9Test as DataDogTest } from '../DataDogTest';
export { default as SentryErrorBoundary } from '../SentryErrorBoundary'; 