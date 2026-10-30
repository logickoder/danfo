import { execFileSync } from 'node:child_process'

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import type { NextConfig } from 'next'
import { PHASE_PRODUCTION_BUILD } from 'next/constants'

function git(...args: string[]): string {
  try {
    return execFileSync('git', args, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch {
    return ''
  }
}

// The commit this build came from, shown in the footer so anyone can match the live site to the
// public code. CI passes it in (GitHub Actions: GITHUB_SHA; Cloudflare Workers Builds:
// WORKERS_CI_COMMIT_SHA), building from a clean checkout; local builds ask git. A build with
// uncommitted changes says so: its code is not exactly what the commit holds. Production
// builds only: dev loads this file in several processes and has no live site to match.
function commitEnv(): Record<string, string> {
  const ci = process.env.GITHUB_SHA ?? process.env.WORKERS_CI_COMMIT_SHA
  if (ci) return { COMMIT_SHA: ci, COMMIT_DIRTY: '' }
  return {
    COMMIT_SHA: git('rev-parse', 'HEAD'),
    COMMIT_DIRTY: git('status', '--porcelain') === '' ? '' : 'true',
  }
}

export default function config(phase: string): NextConfig {
  return phase === PHASE_PRODUCTION_BUILD ? { env: commitEnv() } : {}
}

initOpenNextCloudflareForDev()
