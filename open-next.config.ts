import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

// Everything but /api/parse is prerendered at build and never revalidates, so the read-only
// static-assets cache serves it. Without a cache the worker would re-render those routes per
// request, and the share image would need its font files, which a worker cannot read.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
})
