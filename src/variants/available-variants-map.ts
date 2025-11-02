import { buildGithubLicenseBadge } from './github-license.js'
import { buildNpmDownloadsBadge } from './npm-downloads.js'
import { buildStaticBadge } from './static.js'
import { buildTechStackBadge } from './tech-stack.js'

export const availableVariantsMap = {
  'github-license': buildGithubLicenseBadge,
  'npm-downloads': buildNpmDownloadsBadge,
  static: buildStaticBadge,
  'tech-stack': buildTechStackBadge,
}
