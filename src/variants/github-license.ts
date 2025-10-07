import { BadgeGenerationError } from '../errors.js'
import { buildAsset } from '../helpers.js'
import type { BadgeAsset, BadgeErrorContext, BadgeStyle, ThemeKey, ThemePreset } from '../types.js'
import { applyVariantContext, parseGithubRepository } from '../utils.js'

export type GithubLicenseBadgeOptions = {
  repository: string
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

function resolveAlt(repository: string, provided?: string): string {
  if (provided) {
    return provided
  }
  return `License information for ${repository}`
}

function resolveHref(owner: string, name: string, provided?: string): string {
  if (provided) {
    return provided
  }
  return `https://github.com/${owner}/${name}/blob/HEAD/LICENSE`
}

export function buildGithubLicenseBadge(options: GithubLicenseBadgeOptions): BadgeAsset {
  const { repository } = options
  const context = applyVariantContext(options.context, 'github-license')
  const trimmed = repository.trim()
  if (!trimmed) {
    throw new BadgeGenerationError(
      'INVALID_INPUT',
      'A repository identifier is required to build a GitHub license badge.',
      context
    )
  }

  const repo = parseGithubRepository(trimmed, context)

  const path = `github/license/${repo.owner}/${repo.name}`
  const alt = resolveAlt(`${repo.owner}/${repo.name}`, options.alt)
  const href = resolveHref(repo.owner, repo.name, options.href)

  return buildAsset({
    path,
    alt,
    href,
    label: options.label ?? 'license',
    logo: options.logo ?? 'github',
    ...(options.message !== undefined ? { message: options.message } : {}),
    ...(options.style !== undefined ? { style: options.style } : {}),
    ...(options.baseTheme !== undefined ? { baseTheme: options.baseTheme } : {}),
    ...(options.extraQuery !== undefined ? { extraQuery: options.extraQuery } : {}),
    ...(options.baseUrl !== undefined ? { baseUrl: options.baseUrl } : {}),
    ...(options.themePresets !== undefined ? { themePresets: options.themePresets } : {}),
  })
}
