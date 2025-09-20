// =============================================
// UI Component Types for GYMTOPIA 2.0
// Shared interfaces for React components
// =============================================

import { ReactNode, MouseEvent, FormEvent, ChangeEvent } from 'react';

// ========================================
// Base UI Types
// ========================================

export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface ClickableComponentProps extends BaseComponentProps {
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
}

export interface FormComponentProps extends BaseComponentProps {
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
}

export interface InputComponentProps extends BaseComponentProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: FocusEvent) => void;
  onFocus?: (event: FocusEvent) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

// ========================================
// Layout Types
// ========================================

export interface PageLayoutProps extends BaseComponentProps {
  title?: string;
  description?: string;
  showHeader?: boolean;
  showNavigation?: boolean;
  showBottomNav?: boolean;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export interface HeaderProps extends BaseComponentProps {
  title?: string;
  showBackButton?: boolean;
  showProfile?: boolean;
  showNotifications?: boolean;
  onBackClick?: () => void;
}

export interface NavigationProps extends BaseComponentProps {
  currentPath: string;
  user?: {
    id: string;
    displayName?: string;
    avatarUrl?: string;
    isAdmin?: boolean;
  };
}

export interface BottomNavigationProps extends BaseComponentProps {
  currentPath: string;
}

export interface SidebarProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

// ========================================
// Button Types
// ========================================

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'success';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ClickableComponentProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export interface IconButtonProps extends ClickableComponentProps {
  icon: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  'aria-label': string;
}

// ========================================
// Form Types
// ========================================

export interface FormFieldProps extends BaseComponentProps {
  label?: string;
  required?: boolean;
  error?: string;
  help?: string;
}

export interface TextFieldProps extends InputComponentProps, FormFieldProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  minLength?: number;
}

export interface NumberFieldProps extends FormFieldProps {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}

export interface SelectFieldProps extends FormFieldProps {
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  multiple?: boolean;
  searchable?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export interface CheckboxProps extends FormFieldProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

export interface RadioGroupProps extends FormFieldProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    disabled?: boolean;
  }>;
  disabled?: boolean;
}

// ========================================
// Modal & Dialog Types
// ========================================

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export interface DialogProps extends ModalProps {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
  };
}

export interface ConfirmDialogProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
}

// ========================================
// Loading & State Types
// ========================================

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots' | 'bars';
  text?: string;
}

export interface SkeletonProps extends BaseComponentProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: 'pulse' | 'wave' | false;
}

export interface EmptyStateProps extends BaseComponentProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ErrorStateProps extends BaseComponentProps {
  title: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

// ========================================
// Data Display Types
// ========================================

export interface CardProps extends BaseComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  header?: ReactNode;
  footer?: ReactNode;
}

export interface ListProps extends BaseComponentProps {
  items: Array<{
    id: string;
    content: ReactNode;
    secondary?: ReactNode;
    action?: ReactNode;
    onClick?: () => void;
  }>;
  dividers?: boolean;
  dense?: boolean;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: T[keyof T] | undefined, row: T) => ReactNode;
}

export interface TableProps<T = Record<string, unknown>> extends BaseComponentProps {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  rowKey?: string;
  onRowClick?: (row: T) => void;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
}

// ========================================
// Navigation & Menu Types
// ========================================

export interface TabsProps extends BaseComponentProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
    disabled?: boolean;
    badge?: string | number;
  }>;
  variant?: 'default' | 'pills' | 'underline';
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbsProps extends BaseComponentProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
}

export interface MenuProps extends BaseComponentProps {
  items: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    onClick?: () => void;
    href?: string;
    disabled?: boolean;
    divider?: boolean;
  }>;
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
}

// ========================================
// Feedback Types
// ========================================

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertProps extends BaseComponentProps {
  variant: AlertVariant;
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProps {
  id: string;
  variant: AlertVariant;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ProgressProps extends BaseComponentProps {
  value: number;
  max?: number;
  variant?: 'linear' | 'circular';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

// ========================================
// Map & Location Types
// ========================================

export interface MapProps extends BaseComponentProps {
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: string | number;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    description?: string;
    onClick?: () => void;
  }>;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

export interface LocationPickerProps extends BaseComponentProps {
  initialLatitude?: number;
  initialLongitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  zoom?: number;
  height?: string | number;
}

// ========================================
// Search & Filter Types
// ========================================

export interface SearchBarProps extends BaseComponentProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'multiselect' | 'range' | 'date' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface FilterPanelProps extends BaseComponentProps {
  filters: FilterOption[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onReset?: () => void;
  onApply?: () => void;
}

// ========================================
// File Upload Types
// ========================================

export interface FileUploadProps extends BaseComponentProps {
  onFileSelect: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  preview?: boolean;
  loading?: boolean;
  error?: string;
}

export interface ImageUploadProps extends BaseComponentProps {
  value?: string;
  onChange: (url: string | null) => void;
  aspect?: number;
  maxSize?: number;
  quality?: number;
  loading?: boolean;
  error?: string;
}

// ========================================
// Chart & Visualization Types
// ========================================

export interface ChartProps extends BaseComponentProps {
  data: any[];
  width?: number;
  height?: number;
  loading?: boolean;
  error?: string;
}

export interface LineChartProps extends ChartProps {
  xKey: string;
  yKey: string;
  color?: string;
  showGrid?: boolean;
  showTooltip?: boolean;
}

export interface BarChartProps extends ChartProps {
  xKey: string;
  yKey: string;
  color?: string;
  orientation?: 'horizontal' | 'vertical';
}

export interface PieChartProps extends ChartProps {
  labelKey: string;
  valueKey: string;
  colors?: string[];
  showLegend?: boolean;
}
