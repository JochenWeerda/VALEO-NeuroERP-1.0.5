import React from 'react';
import { cn } from '../lib/utils';
// ✅ NEU: Import der standardisierten UI-Komponenten
import { StandardButton } from './forms/FormStandardization';
import { UI_LABELS } from './ui/UIStandardization';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'agent' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: string;
  children: React.ReactNode;
}

/**
 * ✅ REFAKTORIERT: Button-Komponente verwendet jetzt StandardButton
 * 
 * Diese Komponente wurde refaktoriert um die neue StandardButton-Komponente zu verwenden.
 * Alle Props werden an die StandardButton-Komponente weitergeleitet.
 * 
 * @deprecated Verwenden Sie direkt StandardButton aus FormStandardization
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className,
  disabled,
  ...props
}) => {
  // ✅ REFAKTORIERT: Mapping der alten Varianten zu neuen StandardButton-Varianten
  const getStandardVariant = (oldVariant: string) => {
    switch (oldVariant) {
      case 'primary': return 'contained';
      case 'secondary': return 'outlined';
      case 'success': return 'contained';
      case 'warning': return 'contained';
      case 'danger': return 'contained';
      case 'agent': return 'contained';
      case 'ai': return 'contained';
      default: return 'contained';
    }
  };

  const getStandardColor = (oldVariant: string) => {
    switch (oldVariant) {
      case 'primary': return 'primary';
      case 'secondary': return 'secondary';
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'error';
      case 'agent': return 'primary';
      case 'ai': return 'primary';
      default: return 'primary';
    }
  };

  const getStandardSize = (oldSize: string) => {
    switch (oldSize) {
      case 'sm': return 'small';
      case 'md': return 'medium';
      case 'lg': return 'large';
      default: return 'medium';
    }
  };

  return (
    <StandardButton
      variant={getStandardVariant(variant)}
      color={getStandardColor(variant)}
      size={getStandardSize(size)}
      loading={loading}
      disabled={disabled}
      onClick={props.onClick ? (event: React.MouseEvent<HTMLButtonElement>) => props.onClick?.(event) : undefined}
      type={props.type as 'submit' | 'button' | 'reset'}
    >
      {children}
    </StandardButton>
  );
}; 