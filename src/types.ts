export const SUPPORTED_BADGE_STYLES = [
  'flat',
  'flat-square',
  'plastic',
  'for-the-badge',
  'social',
] as const

export type BadgeStyle = (typeof SUPPORTED_BADGE_STYLES)[number]

export type ThemePreset = {
  color: string
  labelColor: string
  logoColor: string
}

export type ThemePresetMap = Record<string, ThemePreset> & {
  dark: ThemePreset
  light: ThemePreset
}

export type ThemeKey = 'dark' | 'light' | (string & {})

export type BadgeAsset = {
  alt: string
  href: string
  src: string
  srcDark: string
  srcLight: string
}

export type BadgeContextOverrides = {
  baseUrl?: string
  themePresets?: Partial<Record<string, ThemePreset>>
}

export type BadgeConfig = BadgeContextOverrides & {
  baseUrl: string
  themePresets: ThemePresetMap
  defaultStyle: BadgeStyle
  defaultTheme: ThemeKey
}

export type BadgeErrorContext = {
  rowId?: string | number
  variant?: string
  details?: Record<string, unknown>
}

export type BadgeGenerationStatus =
  | 'INVALID_INPUT'
  | 'UNSUPPORTED_VARIANT'
  | 'CONFIGURATION_ERROR'
  | (string & {})
