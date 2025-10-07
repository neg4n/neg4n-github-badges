import { describe, expect, it } from 'vitest'
import {
  BadgeGenerationError,
  buildGithubLicenseBadge,
  buildNpmDownloadsBadge,
  buildStaticBadge,
  buildTechStackBadge,
} from '../src/index.js'

describe('buildNpmDownloadsBadge', () => {
  it('builds a badge with default settings', () => {
    const asset = buildNpmDownloadsBadge({ packageName: 'react' })
    console.log(asset)

    expect(asset.alt).toBe('Yearly npm downloads for the react library')
    expect(asset.href).toBe('https://www.npmjs.com/package/react')
    expect(asset.srcDark).toContain('npm/dy/react')
    expect(asset.srcLight).toContain('npm/dy/react')
  })

  it('throws when npm period unsupported', () => {
    expect(() => buildNpmDownloadsBadge({ packageName: 'react', period: 'month' })).toThrow(
      BadgeGenerationError
    )
  })
})

describe('buildGithubLicenseBadge', () => {
  it('composes badge data for a repository', () => {
    const asset = buildGithubLicenseBadge({ repository: 'foo/bar' })
    console.log(asset)

    expect(asset.alt).toBe('License information for foo/bar')
    expect(asset.href).toBe('https://github.com/foo/bar/blob/HEAD/LICENSE')
    expect(new URL(asset.srcDark).pathname).toBe('/github/license/foo/bar')
  })

  it('throws for missing repository value', () => {
    expect(() => buildGithubLicenseBadge({ repository: ' ' })).toThrow(BadgeGenerationError)
  })
})

describe('buildStaticBadge', () => {
  it('builds a badge from label and message', () => {
    const asset = buildStaticBadge({ label: 'tests', message: 'passing' })
    console.log(asset)

    expect(asset.alt).toBe('tests: passing')
    expect(asset.href).toBe('#')
    expect(asset.srcDark).toContain('badge/tests')
  })

  it('throws when label missing', () => {
    expect(() => buildStaticBadge({ label: ' ' })).toThrow(BadgeGenerationError)
  })
})

describe('buildTechStackBadge', () => {
  it('defaults message to the technology name', () => {
    const asset = buildTechStackBadge({ name: 'Astro' })

    expect(asset.alt).toBe('Astro in the tech stack')
    expect(asset.href).toContain('google.com/search')
    expect(asset.srcLight).toContain('badge/stack-Astro')
  })

  it('throws for missing tech name', () => {
    expect(() => buildTechStackBadge({ name: ' ' })).toThrow(BadgeGenerationError)
  })
})
