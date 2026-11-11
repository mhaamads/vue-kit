// Class maps ported from portal-iq-vue (button-types.ts, text-types.ts, z-index-types.ts).

export type IconType = 'linear' | 'outline' | 'bold' | 'bulk' | 'broken' | 'two-tone'

export type ButtonSize = 'auto' | '24' | '28' | '32' | '36' | '40' | '44' | '48'
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
export type ButtonRadius = 'none' | 'full' | '4' | '8' | '12' | '16'

export const buttonSizeClasses: Record<ButtonSize, string> = {
  auto: 'h-auto',
  '24': 'h-6 text-xs',
  '28': 'h-7 text-xs',
  '32': 'h-8 text-sm',
  '36': 'h-9 text-sm',
  '40': 'h-10 text-sm',
  '44': 'h-11 text-base',
  '48': 'h-12 text-base',
}

/** Icon size per button height (portal-iq-vue). */
export const buttonIconSizes: Partial<Record<ButtonSize, number>> = {
  '24': 16,
  '28': 16,
  '32': 18,
  '36': 20,
  '48': 24,
}

export const buttonRadiusClasses: Record<ButtonRadius, string> = {
  none: 'rounded-none',
  '4': 'rounded-sm',
  '8': 'rounded-lg',
  '12': 'rounded-xl',
  '16': 'rounded-2xl',
  full: 'rounded-full',
}

const disabledClasses =
  'disabled:bg-base-neutral-100 dark:disabled:bg-base-neutral-700 disabled:from-base-neutral-100 disabled:to-base-neutral-100 disabled:border-base-neutral-100 dark:disabled:border-base-neutral-700 dark:disabled:from-base-neutral-700 dark:disabled:to-base-neutral-700 disabled:text-base-neutral-400 disabled:icon-base-neutral-400 disabled:cursor-not-allowed'

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary: `bg-linear-to-tr border border-transparent from-primary-orange-500 active:bg-clip-padding active:outline active:outline-primary-orange-500 to-primary-red-700 hover:from-primary-orange-700 hover:to-app-red-800 justify-center px-4 text-white ${disabledClasses}`,
  secondary: `border border-primary-orange-500 text-primary-orange-500 active:border-transparent active:bg-clip-padding active:outline active:outline-primary-orange-500 justify-center px-4 hover:text-white hover:bg-primary-orange-500 ${disabledClasses}`,
  outline: `border dark:text-white bg-white border-neutral-default text-base-neutral-600 hover:bg-surface-150! icon-neutral-600 dark:icon-white justify-center px-4 ${disabledClasses} active:bg-white dark:bg-base-neutral-800 active:text-primary-orange-500 active:border-primary-orange-500 active:icon-primary-orange-500`,
  ghost: 'bg-transparent justify-center',
  danger: 'bg-app-error text-white icon-white justify-center px-4',
}

export const buttonActiveClasses: Record<ButtonVariant, string> = {
  primary: 'bg-clip-padding! outline! outline-primary-orange-500!',
  secondary: 'border-transparent! bg-clip-padding! outline! outline-primary-orange-500!',
  outline:
    'bg-white dark:bg-base-neutral-800 text-primary-orange-500! border-primary-orange-500! icon-primary-orange-500!',
  ghost: '',
  danger: '',
}

export type TextSize =
  | '10'
  | '12'
  | '14'
  | '16'
  | '18'
  | '20'
  | '24'
  | '30'
  | '32'
  | '36'
  | '40'
  | '48'
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold'
export type TextColor =
  | 'white'
  | 'black'
  | 'neutral-600'
  | 'neutral-400'
  | 'primary-orange-500'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'

export const textSizeClasses: Record<TextSize, string> = {
  '10': 'text-[10px]',
  '12': 'text-xs',
  '14': 'text-sm',
  '16': 'text-base',
  '18': 'lg:text-lg text-base',
  '20': 'lg:text-xl text-lg',
  '24': 'lg:text-2xl text-xl',
  '30': 'lg:text-3xl text-2xl',
  '32': 'lg:text-3.5xl text-2xl',
  '36': 'lg:text-4xl text-3.5xl',
  '40': 'lg:text-4.5xl text-3.5xl',
  '48': 'lg:text-5xl text-4.5xl',
}

export const textWeightClasses: Record<TextWeight, string> = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

export const textColorClasses: Record<TextColor, string> = {
  white: 'text-white',
  black: 'text-base-neutral-800 dark:text-white',
  'neutral-600': 'text-base-neutral-600 dark:text-base-neutral-100',
  'neutral-400': 'text-base-neutral-400 dark:text-base-neutral-300',
  'primary-orange-500': 'text-primary-orange-500',
  error: 'text-app-error',
  success: 'text-app-success',
  warning: 'text-app-warning',
  info: 'text-app-info',
}

/** Layer classes; the `z-*` utilities are defined in theme.css. */
export const ZIndex = {
  LAYOUT_1: 'z-layout-1',
  LAYOUT_2: 'z-layout-2',
  LAYOUT_3: 'z-layout-3',
  LAYOUT_4: 'z-layout-4',
  LAYOUT_5: 'z-layout-5',
  DIALOG_1: 'z-dialog-1',
  DIALOG_2: 'z-dialog-2',
  DIALOG_3: 'z-dialog-3',
  DIALOG_4: 'z-dialog-4',
  DIALOG_5: 'z-dialog-5',
  DIALOG_6: 'z-dialog-6',
  DIALOG_7: 'z-dialog-7',
  DIALOG_8: 'z-dialog-8',
  TOASTS: 'z-toasts',
  DROPDOWN_1: 'z-dropdown-1',
  DROPDOWN_2: 'z-dropdown-2',
  DROPDOWN_3: 'z-dropdown-3',
  DROPDOWN_4: 'z-dropdown-4',
  DROPDOWN_5: 'z-dropdown-5',
  DROPDOWN_6: 'z-dropdown-6',
} as const

export type ZIndexClass = (typeof ZIndex)[keyof typeof ZIndex]
