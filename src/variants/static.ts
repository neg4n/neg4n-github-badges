import { BadgeGenerationError } from '../errors.js'
import { buildAsset } from '../helpers.js'
import type { BadgeAsset, BadgeErrorContext, BadgeStyle, ThemeKey, ThemePreset } from '../types.js'
import { applyVariantContext, buildStaticPath } from '../utils.js'

export type StaticBadgeOptions = {
  label: string
  message?: string
  alt?: string
  href?: string
  logo?: string
  style?: BadgeStyle
  baseTheme?: ThemeKey
  extraQuery?: Record<string, string | undefined>
  baseUrl?: string
  themePresets?: Partial<Record<string, ThemePreset>>
  context?: BadgeErrorContext
}

function resolveAlt(label: string, message: string | undefined, provided?: string): string {
  if (provided) {
    return provided
  }

  return message ? `${label}: ${message}` : `${label} badge`
}

function resolveHref(provided?: string): string {
  const trimmed = provided?.trim()
  if (!trimmed) {
    return '#'
  }
  return trimmed
}

export function buildStaticBadge(options: StaticBadgeOptions): BadgeAsset {
  const context = applyVariantContext(options.context, 'static')
  const trimmedLabel = options.label?.trim()
  if (!trimmedLabel) {
    throw new BadgeGenerationError(
      'INVALID_INPUT',
      'A static badge requires a non-empty label.',
      context
    )
  }

  const trimmedMessage = options.message?.trim()
  const themeOverrides = options.themePresets ? { themePresets: options.themePresets } : undefined
  const path = buildStaticPath(trimmedLabel, trimmedMessage, themeOverrides)
  const alt = resolveAlt(trimmedLabel, trimmedMessage, options.alt)
  const href = resolveHref(options.href)

  return buildAsset({
    path,
    alt,
    href,
    label: trimmedLabel,
    ...(trimmedMessage ? { message: trimmedMessage } : {}),
    ...(options.logo !== undefined ? { logo: options.logo } : {}),
    ...(options.style !== undefined ? { style: options.style } : {}),
    ...(options.baseTheme !== undefined ? { baseTheme: options.baseTheme } : {}),
    ...(options.extraQuery !== undefined ? { extraQuery: options.extraQuery } : {}),
    ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    ...(options.themePresets !== undefined ? { themePresets: options.themePresets } : {}),
  })
}
