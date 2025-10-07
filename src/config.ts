import { BadgeGenerationError } from './errors.js'
import type {
  BadgeConfig,
  BadgeContextOverrides,
  BadgeStyle,
  ThemeKey,
  ThemePresetMap,
} from './types.js'
import { SUPPORTED_BADGE_STYLES } from './types.js'

export const DEFAULT_BASE_URL = 'https://img.shields.io'

export const DEFAULT_THEME_PRESETS = {
  dark: {
    color: '111111',
    labelColor: '050505',
    logoColor: 'f5f5f5',
  },
  light: {
    color: 'f5f5f5',
    labelColor: 'e5e5e5',
    logoColor: '111111',
  },
} satisfies ThemePresetMap

export const DEFAULT_BADGE_STYLE: BadgeStyle = 'flat'
export const DEFAULT_THEME: ThemeKey = 'dark'

export const DEFAULT_CONFIG: BadgeConfig = {
  baseUrl: DEFAULT_BASE_URL,
  themePresets: DEFAULT_THEME_PRESETS,
  defaultStyle: DEFAULT_BADGE_STYLE,
  defaultTheme: DEFAULT_THEME,
}

export function mergeThemePresets(
  overrides?: BadgeContextOverrides['themePresets']
): ThemePresetMap {
  if (!overrides) {
    return { ...DEFAULT_THEME_PRESETS }
  }

  const merged = { ...DEFAULT_THEME_PRESETS, ...overrides } as ThemePresetMap

  if (!merged.dark || !merged.light) {
    throw new BadgeGenerationError(
      'CONFIGURATION_ERROR',
      "Theme presets must include both 'dark' and 'light' entries."
    )
  }

  return merged
}

export function resolveBaseUrl(overridden?: string): string {
  if (!overridden) {
    return DEFAULT_BASE_URL
  }

  return overridden.replace(/\/$/, '') || DEFAULT_BASE_URL
}

export function resolveBadgeStyle(style?: BadgeStyle): BadgeStyle {
  const resolved = style ?? DEFAULT_BADGE_STYLE
  if (!SUPPORTED_BADGE_STYLES.includes(resolved)) {
    throw new BadgeGenerationError('INVALID_INPUT', `Unsupported badge style '${resolved}'.`)
  }
  return resolved
}

export function resolveTheme(theme: ThemeKey | undefined, presets: ThemePresetMap): ThemeKey {
  if (!theme) {
    return DEFAULT_THEME
  }

  if (!presets[theme]) {
    throw new BadgeGenerationError('CONFIGURATION_ERROR', `Unknown theme '${theme}' requested.`)
  }

  return theme
}

export function resolveConfig(
  overrides?: BadgeContextOverrides
): Pick<BadgeConfig, 'baseUrl' | 'themePresets'> {
  const themePresets = mergeThemePresets(overrides?.themePresets)
  const baseUrl = resolveBaseUrl(overrides?.baseUrl)

  return { baseUrl, themePresets }
}
