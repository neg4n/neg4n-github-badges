import { BadgeGenerationError } from '../errors.js'
import { buildAsset } from '../helpers.js'
import type { BadgeAsset, BadgeErrorContext, BadgeStyle, ThemeKey, ThemePreset } from '../types.js'
import { applyVariantContext, buildStaticPath, buildTechHrefFallback } from '../utils.js'

export type TechStackBadgeOptions = {
  name: string
  label?: string
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

function resolveAlt(name: string, provided?: string): string {
  if (provided) {
    return provided
  }
  return `${name} in the tech stack`
}

function resolveHref(name: string, provided?: string): string {
  if (provided) {
    return provided
  }
  return buildTechHrefFallback(name)
}

export function buildTechStackBadge(options: TechStackBadgeOptions): BadgeAsset {
  const trimmedName = options.name?.trim()
  if (!trimmedName) {
    throw new BadgeGenerationError(
      'INVALID_INPUT',
      'Each tech stack badge requires a technology name.',
      applyVariantContext(options.context, 'tech-stack')
    )
  }

  const label = options.label ?? 'stack'
  const message = options.message ?? trimmedName
  const themeOverrides = options.themePresets ? { themePresets: options.themePresets } : undefined
  const path = buildStaticPath(label, message, themeOverrides)
  const alt = resolveAlt(trimmedName, options.alt)
  const href = resolveHref(trimmedName, options.href)

  return buildAsset({
    path,
    alt,
    href,
    label,
    message,
    ...(options.logo !== undefined ? { logo: options.logo } : {}),
    ...(options.style !== undefined ? { style: options.style } : {}),
    ...(options.baseTheme !== undefined ? { baseTheme: options.baseTheme } : {}),
    ...(options.extraQuery !== undefined ? { extraQuery: options.extraQuery } : {}),
    ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    ...(options.themePresets !== undefined ? { themePresets: options.themePresets } : {}),
  })
}
