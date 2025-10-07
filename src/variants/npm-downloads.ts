import { BadgeGenerationError } from '../errors.js'
import { buildAsset } from '../helpers.js'
import type { BadgeAsset, BadgeErrorContext, BadgeStyle, ThemeKey, ThemePreset } from '../types.js'
import { applyVariantContext, encodePackagePath, normalizePackageName } from '../utils.js'

const DEFAULT_PERIOD_MAP = {
  year: 'npm/dy',
} as const

type DefaultPeriod = keyof typeof DEFAULT_PERIOD_MAP

export type NpmDownloadsPeriod = DefaultPeriod | (string & {})

export type NpmDownloadsBadgeOptions = {
  packageName: string
  period?: NpmDownloadsPeriod
  alt?: string
  href?: string
  label?: string
  message?: string
  logo?: string
  style?: BadgeStyle
  baseTheme?: ThemeKey
  extraQuery?: Record<string, string | undefined>
  baseUrl?: string
  themePresets?: Partial<Record<string, ThemePreset>>
  context?: BadgeErrorContext
}

function resolvePeriodPath(period: NpmDownloadsPeriod, context?: BadgeErrorContext): string {
  if (Object.hasOwn(DEFAULT_PERIOD_MAP, period as string)) {
    return DEFAULT_PERIOD_MAP[period as DefaultPeriod]
  }

  throw new BadgeGenerationError(
    'UNSUPPORTED_VARIANT',
    `Unsupported npm downloads period '${period}'.`,
    applyVariantContext(context, 'npm-downloads')
  )
}

function resolveAltText(
  packageName: string,
  period: NpmDownloadsPeriod,
  provided?: string
): string {
  if (provided) {
    return provided
  }

  const periodValue = period.toString()
  const humanPeriod =
    periodValue === 'year' ? 'Yearly' : periodValue.charAt(0).toUpperCase() + periodValue.slice(1)
  return `${humanPeriod} npm downloads for the ${normalizePackageName(packageName)} library`
}

function resolveHref(packageName: string, provided?: string): string {
  if (provided) {
    return provided
  }
  return `https://www.npmjs.com/package/${normalizePackageName(packageName)}`
}

export function buildNpmDownloadsBadge(options: NpmDownloadsBadgeOptions): BadgeAsset {
  const { packageName } = options
  const context = applyVariantContext(options.context, 'npm-downloads')
  const normalizedPackage = normalizePackageName(packageName)

  const period = options.period ?? 'year'
  const periodPath = resolvePeriodPath(period, context)
  const encodedPackagePath = encodePackagePath(normalizedPackage, context)
  const path = `${periodPath}/${encodedPackagePath}`

  const alt = resolveAltText(normalizedPackage, period, options.alt)
  const href = resolveHref(normalizedPackage, options.href)

  return buildAsset({
    path,
    alt,
    href,
    ...(options.label !== undefined ? { label: options.label } : {}),
    ...(options.message !== undefined ? { message: options.message } : {}),
    ...(options.logo !== undefined ? { logo: options.logo } : {}),
    ...(options.style !== undefined ? { style: options.style } : {}),
    ...(options.baseTheme !== undefined ? { baseTheme: options.baseTheme } : {}),
    ...(options.extraQuery !== undefined ? { extraQuery: options.extraQuery } : {}),
    ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    ...(options.themePresets !== undefined ? { themePresets: options.themePresets } : {}),
  })
}
