import { z } from 'zod'

import { resolveConfig } from './config.js'
import type { BadgeContextOverrides, BadgeErrorContext } from './types.js'
import { parseWithZod } from './validation.js'

const staticSegmentSchema = z.string().transform(value => value.trim())

const packageNameSchema = z
  .string()
  .trim()
  .refine(value => value.length > 0, {
    message: 'Package name cannot be empty.',
  })

const repositoryInputSchema = z
  .string()
  .trim()
  .refine(value => value.length > 0, {
    message: 'Repository reference cannot be empty.',
  })

export function formatStaticSegment(value: string): string {
  const trimmed = parseWithZod(staticSegmentSchema, value, 'INVALID_INPUT')
  return trimmed.replace(/-/g, '--').replace(/_/g, '__').replace(/\s/g, '%20')
}

function getDarkColor(overrides?: BadgeContextOverrides): string {
  const { themePresets } = resolveConfig(overrides)
  return themePresets.dark.color
}

export function buildStaticPath(
  label: string,
  message?: string,
  overrides?: BadgeContextOverrides
): string {
  const color = getDarkColor(overrides)
  const safeLabel = formatStaticSegment(label)
  const trimmedMessage = message?.trim() ?? ''
  const safeMessage = trimmedMessage ? formatStaticSegment(trimmedMessage) : '%20'
  return `badge/${safeLabel}-${safeMessage}-${color}`
}

export function buildSingleSegmentPath(text: string, overrides?: BadgeContextOverrides): string {
  const color = getDarkColor(overrides)
  const segment = formatStaticSegment(text)
  return `badge/${segment}-${color}`
}

export function normalizePackageName(packageName: string): string {
  return parseWithZod(packageNameSchema, packageName, 'INVALID_INPUT')
}

export function encodePackagePath(packageName: string, context?: BadgeErrorContext): string {
  const normalized = normalizePackageName(packageName)

  if (normalized.startsWith('@')) {
    const withoutAt = normalized.slice(1)
    const segments = withoutAt.split('/')
    const scopeValidation = z
      .string()
      .refine(() => segments.length >= 2 && segments.every(segment => segment.length > 0), {
        message: `Scoped package '${packageName}' must include both scope and name.`,
      })
    parseWithZod(scopeValidation, normalized, 'INVALID_INPUT', context)

    const [scope, ...rest] = segments as [string, ...string[]]
    const encodedScope = encodeURIComponent(scope)
    const encodedRest = rest.map(segment => encodeURIComponent(segment)).join('/')
    return `%40${encodedScope}/${encodedRest}`
  }

  return normalized
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/')
}

export type GithubRepository = {
  owner: string
  name: string
}

export function parseGithubRepository(
  input: string,
  context?: BadgeErrorContext
): GithubRepository {
  const raw = parseWithZod(repositoryInputSchema, input, 'INVALID_INPUT', context)

  let path = raw
  try {
    if (raw.includes('://')) {
      const url = new URL(raw)
      path = url.pathname
    }
  } catch {
    // ignore, treat as owner/name format
  }

  const sanitized = path.replace(/^\/+/, '').replace(/\.git$/, '')
  const [owner, name] = sanitized.split('/')

  const ownerSchema = z.string().refine(value => value.length > 0, {
    message: `Could not parse GitHub repository from '${input}'.`,
  })
  const nameSchema = ownerSchema

  const ownerValue = parseWithZod(ownerSchema, owner ?? '', 'INVALID_INPUT', context)
  const nameValue = parseWithZod(nameSchema, name ?? '', 'INVALID_INPUT', context)

  return { owner: ownerValue, name: nameValue }
}

export function buildDocsAlt(href: string): string {
  try {
    const url = new URL(href)
    if (url.hostname) {
      return `View the docs at ${url.hostname}`
    }
  } catch {
    // ignore parse failure
  }
  return 'View the documentation'
}

export function buildTechHrefFallback(name: string): string {
  const query = encodeURIComponent(`${name} docs`)
  return `https://www.google.com/search?q=${query}`
}

export function applyVariantContext(
  context: BadgeErrorContext | undefined,
  variant: string
): BadgeErrorContext | undefined {
  if (!context) {
    return { variant }
  }

  if (context.variant) {
    return context
  }

  return { ...context, variant }
}
