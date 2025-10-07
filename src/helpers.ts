import { z } from 'zod'
import { resolveBadgeStyle, resolveConfig, resolveTheme } from './config.js'
import { BadgeGenerationError } from './errors.js'
import type {
  BadgeAsset,
  BadgeContextOverrides,
  BadgeStyle,
  ThemeKey,
  ThemePresetMap,
} from './types.js'
import { parseWithZod } from './validation.js'

export type ComposeShieldsUrlOptions = BadgeContextOverrides & {
  path: string
  style?: BadgeStyle
  theme?: ThemeKey
  label?: string
  message?: string
  logo?: string
  extraQuery?: Record<string, string | undefined>
}

export type BuildShieldsUrlsOptions = BadgeContextOverrides & {
  path: string
  style?: BadgeStyle
  label?: string
  message?: string
  logo?: string
  extraQuery?: Record<string, string | undefined>
}

export type BuildAssetOptions = BuildShieldsUrlsOptions &
  Required<Pick<BadgeAsset, 'alt' | 'href'>> & {
    baseTheme?: ThemeKey
  }

type ResolvedConfig = {
  baseUrl: string
  themePresets: ThemePresetMap
}

const badgePathSchema = z
  .string()
  .trim()
  .transform(value => value.replace(/^\/+/, ''))
  .refine(value => value.length > 0, {
    message: 'Badge path cannot be empty.',
  })

function normalizePath(path: string): string {
  return parseWithZod(badgePathSchema, path, 'INVALID_INPUT')
}

function appendQueryParam(params: URLSearchParams, key: string, value: string | undefined): void {
  if (value === undefined) {
    return
  }
  params.set(key, value)
}

function extractContextOverrides(
  options: BadgeContextOverrides
): BadgeContextOverrides | undefined {
  const overrides: BadgeContextOverrides = {}

  if (options.baseUrl !== undefined) {
    overrides.baseUrl = options.baseUrl
  }

  if (options.themePresets !== undefined) {
    overrides.themePresets = options.themePresets
  }

  return Object.keys(overrides).length > 0 ? overrides : undefined
}

function composeWithResolved(options: ComposeShieldsUrlOptions, resolved: ResolvedConfig): string {
  const style = resolveBadgeStyle(options.style)
  const theme = resolveTheme(options.theme, resolved.themePresets)
  const preset = resolved.themePresets[theme]

  if (!preset) {
    throw new BadgeGenerationError(
      'CONFIGURATION_ERROR',
      `Theme '${theme}' does not have a matching preset configured.`
    )
  }

  const path = normalizePath(options.path)
  const params = new URLSearchParams()
  params.set('style', style)
  params.set('color', preset.color)
  params.set('labelColor', preset.labelColor)

  appendQueryParam(params, 'label', options.label)
  appendQueryParam(params, 'message', options.message)

  if (options.logo) {
    params.set('logo', options.logo)
    appendQueryParam(params, 'logoColor', preset.logoColor)
  }

  if (options.extraQuery) {
    for (const [key, value] of Object.entries(options.extraQuery)) {
      appendQueryParam(params, key, value)
    }
  }

  return `${resolved.baseUrl}/${path}?${params.toString()}`
}

function createComposeOptions(
  options: BuildShieldsUrlsOptions,
  style: BadgeStyle,
  theme: ThemeKey
): ComposeShieldsUrlOptions {
  const composed: ComposeShieldsUrlOptions = {
    path: options.path,
    style,
    theme,
  }

  if (options.label !== undefined) {
    composed.label = options.label
  }
  if (options.message !== undefined) {
    composed.message = options.message
  }
  if (options.logo !== undefined) {
    composed.logo = options.logo
  }
  if (options.extraQuery !== undefined) {
    composed.extraQuery = options.extraQuery
  }
  if (options.baseUrl !== undefined) {
    composed.baseUrl = options.baseUrl
  }
  if (options.themePresets !== undefined) {
    composed.themePresets = options.themePresets
  }

  return composed
}

export function composeShieldsUrl(options: ComposeShieldsUrlOptions): string {
  const resolvedConfig = resolveConfig(extractContextOverrides(options))
  return composeWithResolved(options, resolvedConfig)
}

export function buildShieldsUrls(options: BuildShieldsUrlsOptions): {
  srcDark: string
  srcLight: string
} {
  const resolvedConfig = resolveConfig(extractContextOverrides(options))
  const style = resolveBadgeStyle(options.style)

  const darkOptions = createComposeOptions(options, style, 'dark')
  const lightOptions = createComposeOptions(options, style, 'light')

  const srcDark = composeWithResolved(darkOptions, resolvedConfig)
  const srcLight = composeWithResolved(lightOptions, resolvedConfig)

  return { srcDark, srcLight }
}

export function buildAsset(options: BuildAssetOptions): BadgeAsset {
  const resolvedConfig = resolveConfig(extractContextOverrides(options))
  const style = resolveBadgeStyle(options.style)

  const srcDark = composeWithResolved(createComposeOptions(options, style, 'dark'), resolvedConfig)
  const srcLight = composeWithResolved(
    createComposeOptions(options, style, 'light'),
    resolvedConfig
  )

  const baseTheme = resolveTheme(options.baseTheme, resolvedConfig.themePresets)

  const src =
    baseTheme === 'dark'
      ? srcDark
      : baseTheme === 'light'
        ? srcLight
        : composeWithResolved(createComposeOptions(options, style, baseTheme), resolvedConfig)

  return {
    alt: options.alt,
    href: options.href,
    src,
    srcDark,
    srcLight,
  }
}
