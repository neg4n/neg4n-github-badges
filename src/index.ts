export { BadgeGenerationError } from './errors.js'
export type { BadgeAsset } from './types.js'
export type {
  GithubLicenseBadgeOptions,
  NpmDownloadsBadgeOptions,
  NpmDownloadsPeriod,
  StaticBadgeOptions,
  TechStackBadgeOptions,
} from './variants/index.js'
export {
  buildGithubLicenseBadge,
  buildNpmDownloadsBadge,
  buildStaticBadge,
  buildTechStackBadge,
} from './variants/index.js'
