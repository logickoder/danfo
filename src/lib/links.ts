// Outbound links in one place. REPO_URL and FEEDBACK_URL point at the public repo, which does
// not exist until the owner creates it; update them then if the name differs.
export const REPO_URL = 'https://github.com/logickoder/danfo'
export const FEEDBACK_URL = 'https://github.com/logickoder/danfo/issues'
export const BANKSTRACT_URL = 'https://github.com/logickoder/bankstract'
export const AUTHOR_URL = 'https://logickoder.dev'

/**
 * Where this deployment lives: canonical URLs, the sitemap, share previews. Self-hosters set it.
 * Blank counts as unset (CI often passes an empty variable); a trailing slash is dropped so paths
 * join cleanly.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://danfo.logickoder.dev').replace(/\/+$/, '')

// The commit this build came from (next.config.ts). Empty before the repo has a first commit.
export const COMMIT_SHA = process.env.COMMIT_SHA ?? ''
export const COMMIT_DIRTY = process.env.COMMIT_DIRTY === 'true'
export const COMMIT_URL = COMMIT_SHA ? `${REPO_URL}/commit/${COMMIT_SHA}` : ''
